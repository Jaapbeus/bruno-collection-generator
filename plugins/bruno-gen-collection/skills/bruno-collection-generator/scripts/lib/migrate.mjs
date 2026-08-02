// Reading what the PowerShell generator left behind.
//
// Three sidecar files, all still in use in real repositories, all read and none ever touched:
//
//   bruno-generator.json    collection_name, output_dir, environments, default_headers
//   bruno/BaseUrl.json      environment name -> base URL, created on first run, never overwritten
//   bruno/examples/*.json   one request body per function, the file content IS the body
//   bruno-examples.json     the older global form: {functionName: {body: {...}}}
//
// They enter at the config tier, below bruno-gen.json and above anything observed in the
// repository. That placement is the whole point: these files are where a human typed the values
// they actually use, so they must outrank a body synthesised from a C# class.
//
// Read-then-deprecate. Nothing here writes, renames or deletes - a user who reverts to the old tool
// must find their files exactly as they left them, and a migration that eats its own input cannot
// be run twice to check what it did.
//
// Two precedence details are inherited from the old orchestrator rather than invented:
//
//   BaseUrl.json wins over bruno-generator.json's environments, because the old tool loaded it
//   second and never overwrote it - so it holds the URLs the repository was really being used
//   with. In the migration repository the two disagree on the DEV host and list a different number
//   of environments; taking bruno-generator.json would silently change where requests go.
//
//   default_headers matters beyond the requests that already exist. Adopted requests carry their
//   headers inline, so dropping this mapping would lose nothing today and silently omit
//   x-correlation-id from every endpoint added afterwards.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { byCodepoint } from './paths.mjs';

export const LEGACY_FILES = {
  generator: 'bruno-generator.json',
  baseUrl: 'bruno/BaseUrl.json',
  examplesDir: 'bruno/examples',
  globalExamples: 'bruno-examples.json',
};

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function readJson(path) {
  try {
    return { ok: true, data: JSON.parse(readFileSync(path, 'utf8')) };
  } catch (err) {
    // Position only, never the message. V8's JSON errors embed a window of the SOURCE, and these are
    // the legacy settings files - bruno-generator.json holds default_headers, bruno/examples/*.json
    // holds request bodies - so interpolating it copied their content into the report and, once
    // legacy warnings started reaching `probe --json`, into machine-readable output too.
    const at = /at position \d+/.exec(String(err?.message ?? ''))?.[0] ?? null;
    return { ok: false, error: `not valid JSON${at ? ` (${at})` : ''}` };
  }
}

/** Normalise a function/endpoint name to the key the legacy files use: lowercase, alphanumeric. */
export const bodyKey = (name) => String(name ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Read every legacy sidecar present. Never throws: a malformed file becomes a named warning, so one
 * bad sidecar cannot stop the migration of the others.
 */
export function detectLegacy(repoRoot) {
  const found = [];
  const warnings = [];
  const notes = [];

  let name;
  let outputDir;
  let headers;
  let environments;
  let baseUrlEnvironments;
  const bodies = new Map();

  // ---- bruno-generator.json ---------------------------------------------------------------
  const genPath = join(repoRoot, LEGACY_FILES.generator);
  if (existsSync(genPath)) {
    const r = readJson(genPath);
    if (!r.ok) {
      warnings.push(`${LEGACY_FILES.generator} is not valid JSON and was ignored: ${r.error}`);
    } else if (!isPlainObject(r.data)) {
      warnings.push(`${LEGACY_FILES.generator} does not contain an object and was ignored`);
    } else {
      found.push({ kind: 'generator', path: LEGACY_FILES.generator });
      const g = r.data;
      if (typeof g.collection_name === 'string' && g.collection_name.trim()) {
        name = g.collection_name.trim();
        notes.push(`collection name "${name}" from ${LEGACY_FILES.generator}`);
      }
      if (typeof g.output_dir === 'string' && g.output_dir.trim()) {
        outputDir = g.output_dir.trim().replace(/\\/g, '/').replace(/\/+$/, '');
        notes.push(`output directory "${outputDir}" from ${LEGACY_FILES.generator}`);
      }
      if (isPlainObject(g.environments)) {
        environments = envList(g.environments, LEGACY_FILES.generator, warnings);
        notes.push(`${environments.length} environment(s) from ${LEGACY_FILES.generator}`);
      }
      if (isPlainObject(g.default_headers)) {
        headers = Object.entries(g.default_headers).map(([hn, hv]) => ({
          name: hn,
          value: String(hv),
          source: 'config',
        }));
        notes.push(
          `${headers.length} default header(s) from ${LEGACY_FILES.generator}; these apply to ` +
            'endpoints added from now on, not only the ones already in the collection',
        );
      }
    }
  }

  // ---- bruno/BaseUrl.json -----------------------------------------------------------------
  const basePath = join(repoRoot, LEGACY_FILES.baseUrl);
  if (existsSync(basePath)) {
    const r = readJson(basePath);
    if (!r.ok) {
      warnings.push(`${LEGACY_FILES.baseUrl} is not valid JSON and was ignored: ${r.error}`);
    } else if (!isPlainObject(r.data)) {
      warnings.push(`${LEGACY_FILES.baseUrl} does not contain an object and was ignored`);
    } else {
      found.push({ kind: 'baseUrl', path: LEGACY_FILES.baseUrl });
      const fromBaseUrl = envList(r.data, LEGACY_FILES.baseUrl, warnings);
      // An EMPTY list does not win. `??` treated one as a decision, so a `{}` or all-nested
      // BaseUrl.json discarded every environment bruno-generator.json declared - leaving the
      // migrated collection with none at all, every {{baseUrl}} undeclared, and a note claiming
      // BaseUrl.json had won when nothing from it did.
      if (fromBaseUrl.length) {
        baseUrlEnvironments = fromBaseUrl;
        notes.push(
          `${fromBaseUrl.length} environment(s) from ${LEGACY_FILES.baseUrl}; this file wins ` +
            `over ${LEGACY_FILES.generator} because the old tool loaded it second and never overwrote it`,
        );
      } else {
        notes.push(
          `${LEGACY_FILES.baseUrl} declared no usable environment, so ${LEGACY_FILES.generator} still supplies them`,
        );
      }
    }
  }

  // ---- bruno/examples/*.json --------------------------------------------------------------
  const exDir = join(repoRoot, LEGACY_FILES.examplesDir);
  if (existsSync(exDir)) {
    let entries = [];
    try {
      entries = readdirSync(exDir, { withFileTypes: true });
    } catch {
      entries = [];
    }
    entries.sort((a, b) => byCodepoint(a.name, b.name));
    const perFile = [];
    for (const e of entries) {
      if (!e.isFile() || extname(e.name).toLowerCase() !== '.json') continue;
      const r = readJson(join(exDir, e.name));
      if (!r.ok) {
        warnings.push(`${LEGACY_FILES.examplesDir}/${e.name} is not valid JSON and was ignored: ${r.error}`);
        continue;
      }
      // The file content is the body itself - no wrapper object.
      bodies.set(bodyKey(basename(e.name, '.json')), { json: r.data, from: `${LEGACY_FILES.examplesDir}/${e.name}` });
      perFile.push(e.name);
    }
    if (perFile.length) {
      found.push({ kind: 'examples', path: LEGACY_FILES.examplesDir, files: perFile });
      notes.push(`${perFile.length} request body example(s) from ${LEGACY_FILES.examplesDir}/`);
    }
  }

  // ---- bruno-examples.json (the older global form) ----------------------------------------
  const globalPath = join(repoRoot, LEGACY_FILES.globalExamples);
  if (existsSync(globalPath)) {
    const r = readJson(globalPath);
    if (!r.ok) {
      warnings.push(`${LEGACY_FILES.globalExamples} is not valid JSON and was ignored: ${r.error}`);
    } else if (!isPlainObject(r.data)) {
      warnings.push(`${LEGACY_FILES.globalExamples} does not contain an object and was ignored`);
    } else {
      found.push({ kind: 'globalExamples', path: LEGACY_FILES.globalExamples });
      let added = 0;
      for (const [fn, entry] of Object.entries(r.data)) {
        const key = bodyKey(fn);
        // Per-endpoint files win: they are the form the old tool told users to prefer.
        if (bodies.has(key)) continue;
        const json = isPlainObject(entry) && 'body' in entry ? entry.body : entry;
        if (json === undefined) continue;
        bodies.set(key, { json, from: `${LEGACY_FILES.globalExamples}#${fn}` });
        added += 1;
      }
      if (added) notes.push(`${added} request body example(s) from ${LEGACY_FILES.globalExamples}`);
    }
  }

  return {
    present: found.length > 0,
    found,
    warnings,
    notes,
    // The config-tier view, ready to layer beneath bruno-gen.json.
    settings: {
      name,
      outputDir,
      headers,
      environments: baseUrlEnvironments ?? environments,
      environmentsFrom: baseUrlEnvironments ? LEGACY_FILES.baseUrl : environments ? LEGACY_FILES.generator : null,
    },
    bodies,
  };
}

/**
 * `{"DEV": "https://host"}` to environments, naming whatever it had to drop.
 *
 * Filtering in silence was the problem: an entry the old tool never wrote - a nested
 * `{"DEV": {"baseUrl": "..."}}`, say - vanished, and a dropped environment is a request pointed at
 * nothing. Order follows the file.
 */
function envList(obj, from, warnings = []) {
  const envs = [];
  const dropped = [];
  for (const [name, url] of Object.entries(obj)) {
    if (typeof url === 'string') envs.push({ name, vars: { baseUrl: url }, secrets: [] });
    else dropped.push(name);
  }
  if (dropped.length) {
    warnings.push(
      `${from}: ${dropped.length} environment(s) do not map to a base URL string and were ignored ` +
        `(${dropped.join(', ')}); the old tool wrote "NAME": "https://host"`,
    );
  }
  return envs;
}

/**
 * bruno-gen.json over the legacy sidecars, field by field.
 *
 * Field-level rather than whole-object, because migration is gradual: someone adds bruno-gen.json to
 * set an auth mode and would otherwise lose the four environments their BaseUrl.json still holds.
 */
export function layerLegacy(config, legacy) {
  const l = legacy.settings;
  return {
    ...config,
    name: config.name ?? l.name,
    outputDir: config.outputDir ?? l.outputDir,
    headers: config.headers ?? l.headers,
    environments: config.environments ?? l.environments,
  };
}

/**
 * The legacy body for one endpoint, if any.
 *
 * The old tool keyed bodies by lowercase function name, which no longer exists as a field, so match
 * on every name the endpoint plausibly went by: its display name, the last literal path segment,
 * and the body type name. All are normalised through `bodyKey`, so `Get-Widget`, `getwidget` and
 * `GetWidget` are one key.
 */
export function legacyBodyFor(endpoint, bodies) {
  if (!bodies?.size) return null;
  const segments = String(endpoint.pathTemplate ?? '')
    .split('/')
    .filter((s) => s && !s.startsWith('{'));

  // Deliberately NOT every path segment. `bruno/examples/widgets.json` would then also match
  // `/widgets/{id}/orders` - and a body matched that loosely is written as source 'config',
  // confidence 'high', outranking the body actually derived from the request type. These three keys
  // are the ones the docstring above promises, and now the only ones.
  const keys = [
    bodyKey(endpoint.name),
    bodyKey(segments[segments.length - 1]),
    bodyKey(endpoint.body?.typeName),
  ].filter(Boolean);

  for (const key of keys) {
    const hit = bodies.get(key);
    if (hit) return hit;
  }
  return null;
}

/**
 * Put legacy bodies into a model, at the config tier.
 *
 * Only a body the model did not get from a human-maintained source is replaced: `source: 'config'`
 * or `'human'` already outranks this. Endpoints with no body are left alone - a legacy example for a
 * GET is a leftover, not an instruction to start sending a body.
 */
export function applyLegacyBodies(model, bodies) {
  const applied = [];
  const endpoints = (model.endpoints ?? []).map((ep) => {
    if (!ep.body || ep.body.kind === 'none') return ep;
    if (ep.body.source === 'config' || ep.body.source === 'human') return ep;

    const hit = legacyBodyFor(ep, bodies);
    if (!hit) return ep;

    applied.push({ endpointKey: ep.endpointKey, from: hit.from });
    return {
      ...ep,
      body: { ...ep.body, json: hit.json, source: 'config', confidence: 'high' },
      provenance: {
        ...(ep.provenance ?? {}),
        fields: { ...(ep.provenance?.fields ?? {}), '/body': `config:${hit.from}` },
      },
    };
  });

  return { model: { ...model, endpoints }, applied };
}
