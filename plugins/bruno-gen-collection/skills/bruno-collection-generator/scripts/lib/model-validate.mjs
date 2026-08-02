// Validates an api-model.json against the schema, then applies the rules a JSON Schema cannot
// express. Everything the model produces passes through here before a single file is written.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { endpointKey as computeKey } from './inventory.mjs';
import { fullPath } from './emit.mjs';
import { ajv2020 } from './deps.mjs';

const here = dirname(fileURLToPath(import.meta.url));

const schemaPath = join(here, '..', 'schema', 'api-model.schema.json');
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));

export class ModelError extends Error {
  constructor(message, problems) {
    super(message);
    this.name = 'ModelError';
    this.problems = problems;
  }
}

let _validate;
function compiled() {
  if (!_validate) {
    const Ajv = ajv2020();
    const ajv = new Ajv.default({ allErrors: true, strict: false, allowUnionTypes: true });
    _validate = ajv.compile(schema);
  }
  return _validate;
}

/**
 * Turn ajv's errors into something a reader can act on.
 *
 * Ajv's bare `must NOT have additional properties` does not say WHICH property, and with
 * `additionalProperties: false` on every nested auth block one wrong key produces that same
 * sentence three times. The offending name is in `params`, so use it: the model is often authored by
 * reading these messages and iterating, and an error that omits the only actionable detail turns
 * that into guesswork.
 */
function formatSchemaErrors(errors) {
  const lines = [];
  for (const e of errors) {
    const where = e.instancePath || '(root)';
    // `if` is a branch marker, not a defect, and the `then` failure it guards is reported too.
    if (e.keyword === 'if') continue;
    let line;
    if (e.keyword === 'additionalProperties') {
      line = `${where} has an unknown property "${e.params.additionalProperty}"`;
    } else if (e.keyword === 'enum') {
      line = `${where} ${e.message} (${(e.params?.allowedValues ?? []).join(', ')})`;
    } else {
      line = `${where} ${e.message}`;
    }
    if (!lines.includes(line)) lines.push(line);
  }
  return lines;
}

/**
 * @returns {{ok: boolean, problems: string[], model: object|null}}
 */
export function validateModel(model) {
  const validate = compiled();
  const problems = [];

  if (!validate(model)) {
    for (const line of formatSchemaErrors(validate.errors ?? [])) problems.push(line);
    return { ok: false, problems, model: null };
  }

  // ---- rules the schema cannot express -----------------------------------------------

  const keys = new Map();
  for (const [i, ep] of (model.endpoints ?? []).entries()) {
    const at = `endpoints[${i}] (${ep.endpointKey})`;

    // The endpointKey must actually be derivable from the method and the COMPOSED path
    // (routePrefix + pathTemplate) - the same thing `doctor` computes from a real request URL, so
    // that adopting an existing collection matches. A key that disagrees would silently split or
    // merge identities.
    const expected = computeKey(ep.method, fullPath(model.collection, ep));
    if (ep.endpointKey !== expected) {
      problems.push(`${at}: endpointKey does not match method + pathTemplate; expected "${expected}"`);
    }

    // Duplicates are legal (a variant), but they must be declared as such so the writer knows
    // which file owns the endpoint.
    const seen = keys.get(ep.endpointKey) ?? [];
    if (seen.length > 0 && !(ep.flags ?? []).includes('variant')) {
      problems.push(
        `${at}: duplicate endpointKey shared with ${seen.join(', ')}; every duplicate after the first must carry the "variant" flag`,
      );
    }
    seen.push(at);
    keys.set(ep.endpointKey, seen);

    // Every path parameter in the template needs a matching param entry, or the URL will
    // contain a placeholder Bruno cannot fill.
    const templateParams = [...String(ep.pathTemplate).matchAll(/\{([^}]+)\}|:([A-Za-z_][A-Za-z0-9_]*)/g)].map(
      (m) => m[1] ?? m[2],
    );
    const declaredPath = new Set((ep.params ?? []).filter((p) => p.in === 'path').map((p) => p.name));
    for (const name of templateParams) {
      if (!declaredPath.has(name)) {
        problems.push(`${at}: path parameter "${name}" appears in pathTemplate but has no params entry`);
      }
    }
    for (const p of (ep.params ?? []).filter((x) => x.in === 'path')) {
      if (!templateParams.includes(p.name)) {
        problems.push(`${at}: path parameter "${p.name}" is declared but does not appear in pathTemplate`);
      }
      if (p.disabled) problems.push(`${at}: path parameter "${p.name}" cannot be disabled`);
      if (!p.required) problems.push(`${at}: path parameter "${p.name}" must be required`);
    }

    // A required, enabled parameter with an empty value is exactly what the value contract
    // forbids: it must instead be reported as unresolved.
    for (const p of ep.params ?? []) {
      if (p.required && !p.disabled && String(p.value ?? '') === '') {
        const listed = (model.unresolved ?? []).some(
          (u) => u.endpointKey === ep.endpointKey && u.field.includes(p.name),
        );
        if (!listed) {
          problems.push(
            `${at}: required ${p.in} parameter "${p.name}" is empty and not listed in unresolved[]`,
          );
        }
      }
    }

    // A body must match its kind.
    if (ep.body) {
      const { kind, json, text } = ep.body;
      if (kind === 'json' && (json === undefined || json === null)) {
        problems.push(`${at}: body.kind is "json" but body.json is missing`);
      }
      // A json body given as a STRING is passed through verbatim and nothing downstream re-reads it:
      // `.bru` treats `body:json` as opaque, so apply's "it parses back" check passes on `{not json`
      // and the file lands with a payload no server will accept. A `{{variable}}` reference stands in
      // for a value, so neutralise those first - `1` is valid JSON inside quotes and out.
      if (kind === 'json' && typeof json === 'string') {
        try {
          JSON.parse(json.replace(/\{\{[^{}]*\}\}/g, '1'));
        } catch (err) {
          // Position only. V8's JSON errors embed a window of the source, which for a short body is
          // the whole body - so interpolating the message would copy request content into the report
          // and into --json, the same leak spec-parse just stopped doing.
          const at2 = /at position \d+/.exec(String(err?.message ?? ''))?.[0] ?? null;
          problems.push(`${at}: body.json is a string but not valid JSON${at2 ? ` (${at2})` : ''}`);
        }
      }
      if (kind === 'none' && (json !== undefined && json !== null)) {
        problems.push(`${at}: body.kind is "none" but a json payload is present`);
      }
      if (['text', 'xml'].includes(kind) && (text === undefined || text === null)) {
        problems.push(`${at}: body.kind is "${kind}" but body.text is missing`);
      }
    }

    // Folder references must resolve.
    if (ep.folderId) {
      const known = (model.folders ?? []).some((f) => f.id === ep.folderId);
      if (!known) problems.push(`${at}: folderId "${ep.folderId}" has no matching folders[] entry`);
    }
  }

  // Folder ids must be unique.
  const folderIds = new Set();
  for (const [i, f] of (model.folders ?? []).entries()) {
    if (folderIds.has(f.id)) problems.push(`folders[${i}]: duplicate id "${f.id}"`);
    folderIds.add(f.id);
  }

  // An environment must not carry a value for a name it also declares secret.
  for (const [i, env] of (model.collection.environments ?? []).entries()) {
    for (const name of env.secrets ?? []) {
      if (env.vars && Object.prototype.hasOwnProperty.call(env.vars, name)) {
        problems.push(
          `collection.environments[${i}] ("${env.name}"): "${name}" is declared secret and also has a value; secrets carry names only`,
        );
      }
    }
  }

  // routePrefix is required by the schema; assert the shape the emitter relies on.
  const prefix = model.collection.routePrefix;
  if (prefix !== '' && !prefix.startsWith('/')) {
    problems.push(`collection.routePrefix must be "" or start with "/", got "${prefix}"`);
  }
  if (prefix.endsWith('/') && prefix !== '/') {
    problems.push(`collection.routePrefix must not end with "/", got "${prefix}"`);
  }

  return { ok: problems.length === 0, problems, model: problems.length === 0 ? model : null };
}

/** Load and validate, throwing a ModelError with every problem listed. */
export function loadModel(path) {
  let raw;
  try {
    raw = readFileSync(path, 'utf8');
  } catch (err) {
    throw new ModelError(`cannot read model at ${path}: ${err.message}`, []);
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new ModelError(`model at ${path} is not valid JSON: ${err.message}`, []);
  }
  const { ok, problems, model } = validateModel(parsed);
  if (!ok) {
    throw new ModelError(`api-model.json failed validation (${problems.length} problem(s))`, problems);
  }
  return model;
}
