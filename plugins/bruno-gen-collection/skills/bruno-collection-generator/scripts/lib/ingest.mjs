// Spec to IR.
//
// OpenAPI is read directly rather than through @usebruno/converters. Not a rejection of the
// library - it is used for Postman and WSDL below - but its output is a Bruno collection, and the
// IR needs what a Bruno collection cannot carry: which parameters are required, their enums and
// formats, and where every value came from. Reconstructing that from converted output would mean
// re-reading the spec anyway, and the converter has measured gaps the IR must not inherit
// (property `default` dropped, `format` emitted as "", one disabled parameter per enum member,
// required headers emitted empty).

import { converters } from './deps.mjs';
import { endpointKey } from './inventory.mjs';
import {
  exampleFromSchema, resolveValue, collapseDuplicateParams, isUsable,
} from './resolve-values.mjs';
import { KIND } from './spec-parse.mjs';

const METHODS = ['get', 'put', 'post', 'delete', 'patch', 'head', 'options'];

const deref = (node, root, hops = 0) => {
  let current = node;
  let n = hops;
  while (current && typeof current === 'object' && typeof current.$ref === 'string') {
    if (n++ > 10 || !current.$ref.startsWith('#/')) return null;
    current = current.$ref
      .slice(2)
      .split('/')
      .map((s) => s.replace(/~1/g, '/').replace(/~0/g, '~'))
      .reduce((acc, key) => (acc && typeof acc === 'object' ? acc[key] : undefined), root);
  }
  return current ?? null;
};

/**
 * A spec field that has to be a list, whatever the document actually holds.
 *
 * `security: {bearerAuth: []}` and `parameters: {}` are both easy to write by hand, and both threw a
 * bare TypeError out of the CLI - "sharedParams is not iterable" is not a sentence about anyone's
 * spec. A wrong shape is treated as absent: the document is untrusted data, and none of these fields
 * is worth refusing an otherwise usable spec over.
 */
const asArray = (v) => (Array.isArray(v) ? v : []);

/**
 * Why a node could not be dereferenced, or null when it is not a `$ref` at all.
 *
 * `deref` collapses "not a ref", "points outside this file" and "points nowhere" into one `null`,
 * and every caller treated that as "skip quietly" - so a multi-file spec (`$ref: './paths/x.yaml'`,
 * which is an ordinary way to write one) ingested to an empty-but-valid model and exited 0.
 */
function refProblem(node) {
  const ref = node && typeof node === 'object' ? node.$ref : undefined;
  if (typeof ref !== 'string') return null;
  if (!ref.startsWith('#/')) {
    return { external: true, why: `$ref "${ref}" points outside this file, which is not followed` };
  }
  return { external: false, why: `$ref "${ref}" does not resolve inside this file` };
}

/** One capability entry per subject, accumulating where it was seen, in spec order. */
function noteUnsupported(capability, subject, reason, where) {
  let entry = capability.find((c) => c.subject === subject);
  if (!entry) {
    entry = { subject, supported: false, reason, paths: [] };
    capability.push(entry);
  }
  if (where && !entry.paths.includes(where)) entry.paths.push(where);
}

const BUNDLE_FIRST =
  'this spec is split across files; bundle it into one document (for example `redocly bundle`) and ingest that';

/**
 * A server url with its template variables substituted.
 *
 * `servers: [{url: 'https://api.example.com/{version}', variables: {version: {default: 'v2'}}}]` is
 * an ordinary spec shape - APIM, AWS and every versioned gateway emit it. Taking `url` verbatim put
 * the braces through `new URL().pathname`, which percent-encodes them, so the route prefix became
 * `/%7Bversion%7D` and every request 404'd. The schema's own pattern accepts `%7B`, so nothing
 * downstream noticed.
 */
function serverUrl(server) {
  const vars = server?.variables ?? {};
  return String(server?.url ?? '').replace(/\{([^{}]+)\}/g, (whole, name) => {
    const declared = vars[name];
    const value = declared?.default ?? declared?.enum?.[0];
    return value === undefined ? whole : String(value);
  });
}

/** The server path prefix, if every server agrees on one. */
function serverPrefix(spec, warnings = []) {
  const paths = asArray(spec.servers)
    .map(serverUrl)
    .map((u) => {
      try {
        return new URL(u).pathname;
      } catch {
        return u.startsWith('/') ? u : '';
      }
    })
    .map((p) => (p === '/' ? '' : p.replace(/\/$/, '')))
    .filter((p) => p !== '');
  if (paths.length === 0) return '';
  if (paths.every((p) => p === paths[0])) return paths[0];
  // Prod and staging on different path prefixes is ordinary. Dropping the prefix silently emitted
  // every request without it, so say which one was taken and what was discarded.
  warnings.push(
    `servers[] disagree on the path prefix (${[...new Set(paths)].join(', ')}); using "${paths[0]}". ` +
      'Set base_path in bruno-gen.json to choose a different one.',
  );
  return paths[0];
}

/** securitySchemes to an auth recipe plus the variable names it needs. */
function authFromSpec(spec) {
  const schemes = spec.components?.securitySchemes ?? {};
  const required = asArray(spec.security).flatMap((s) => Object.keys(s ?? {}));
  const chosen = required.map((n) => [n, schemes[n]]).find(([, s]) => s) ?? Object.entries(schemes)[0];
  if (!chosen) return { auth: { mode: 'none', source: 'spec' }, secrets: [], vars: [], notes: [] };

  const [name, scheme] = chosen;
  const notes = [`Spec declares security scheme "${name}" (${scheme.type}).`];

  if (scheme.type === 'http' && /^bearer$/i.test(scheme.scheme ?? '')) {
    return {
      auth: { mode: 'bearer', source: 'spec', bearer: { token: '{{accessToken}}' } },
      secrets: ['accessToken'],
      vars: [],
      notes,
    };
  }
  if (scheme.type === 'http' && /^basic$/i.test(scheme.scheme ?? '')) {
    return {
      auth: { mode: 'basic', source: 'spec', basic: { username: '{{username}}', password: '{{password}}' } },
      secrets: ['password'],
      // A username is not a credential, so it is a declared var rather than a secret - but it still
      // has to be DECLARED, or the request references a variable no environment defines and the
      // request goes out with an empty one.
      vars: ['username'],
      notes,
    };
  }
  if (scheme.type === 'apiKey') {
    return {
      auth: { mode: 'apikey', source: 'spec', apikey: { key: scheme.name ?? 'x-api-key', value: '{{apiKey}}', placement: scheme.in === 'query' ? 'queryparams' : 'header' } },
      secrets: ['apiKey'],
      vars: [],
      notes,
    };
  }
  if (scheme.type === 'oauth2') {
    const flows = scheme.flows ?? {};
    const cc = flows.clientCredentials;
    const ac = flows.authorizationCode;
    const flow = cc ?? ac;
    return {
      auth: {
        mode: 'oauth2',
        source: 'spec',
        oauth2: {
          grantType: cc ? 'client_credentials' : 'authorization_code',
          accessTokenUrl: flow?.tokenUrl ?? '{{tokenUrl}}',
          ...(ac ? { authorizationUrl: ac.authorizationUrl ?? '{{authorizeUrl}}', pkce: true } : {}),
          clientId: '{{clientId}}',
          clientSecret: '{{clientSecret}}',
          scope: Object.keys(flow?.scopes ?? {}).join(' '),
          credentialsPlacement: 'body',
          tokenPlacement: 'header',
          tokenHeaderPrefix: 'Bearer',
          autoFetchToken: true,
          autoRefreshToken: true,
        },
      },
      secrets: ['clientSecret'],
      // Same split: the client id and the endpoints are not credentials, and a variable is only
      // declared when the flow did not supply a real value for it.
      vars: [
        'clientId',
        ...(flow?.tokenUrl ? [] : ['tokenUrl']),
        ...(ac && !ac.authorizationUrl ? ['authorizeUrl'] : []),
      ],
      notes: [...notes, cc ? 'Client-credentials flow.' : 'Authorization-code flow with PKCE.'],
    };
  }
  return { auth: { mode: 'none', source: 'spec' }, secrets: [], vars: [], notes };
}

/** Pick the best example for a media type object. */
function mediaExample(media, root) {
  if (media?.example !== undefined) return { value: media.example, source: 'observed' };
  const named = media?.examples && Object.values(media.examples)[0];
  const resolvedNamed = named ? deref(named, root) : null;
  if (resolvedNamed?.value !== undefined) return { value: resolvedNamed.value, source: 'observed' };
  if (media?.schema) {
    const built = exampleFromSchema(media.schema, { root });
    if (built !== null) return { value: built, source: 'declared' };
  }
  return null;
}

const BODY_KIND = {
  'application/json': 'json',
  'application/x-www-form-urlencoded': 'form-urlencoded',
  'multipart/form-data': 'multipart-form',
  'application/xml': 'xml',
  'text/xml': 'xml',
  'text/plain': 'text',
};

const pickMedia = (content) => {
  const keys = Object.keys(content ?? {});
  const json = keys.find((k) => /json/i.test(k));
  return json ?? keys.find((k) => BODY_KIND[k]) ?? keys[0] ?? null;
};

/**
 * OpenAPI 3.x to IR.
 *
 * @returns {{model: object, warnings: string[], unresolved: object[], capability: object[]}}
 */
export function ingestOpenApi(spec, { collectionName, format = 'yml', outputDir = 'bruno', baseUrlVar = 'baseUrl' } = {}) {
  const warnings = [];
  const unresolved = [];
  const capability = [];

  const routePrefix = serverPrefix(spec, warnings);
  const { auth, secrets, vars: authVars, notes } = authFromSpec(spec);

  const folders = new Map();
  const endpoints = [];
  const seenKeys = new Map();

  for (const [rawPath, pathItem] of Object.entries(spec.paths ?? {})) {
    const item = deref(pathItem, spec);
    if (!item) {
      const problem = refProblem(pathItem);
      warnings.push(`${rawPath}: skipped - ${problem?.why ?? 'the path item is not an object'}`);
      if (problem?.external) noteUnsupported(capability, 'external-$ref', BUNDLE_FIRST, rawPath);
      continue;
    }
    const sharedParams = asArray(item.parameters);

    // TRACE is a real operation the IR cannot carry - the endpoint method enum has no TRACE and
    // Bruno cannot send one - so it is recorded as unsupported rather than dropped. An operation
    // that disappears at exit 0 sends the user looking for a bug in their spec.
    if (item.trace) {
      noteUnsupported(
        capability,
        'http-trace',
        'Bruno cannot send a TRACE request, so these operations were not generated',
        rawPath,
      );
    }

    for (const method of METHODS) {
      const op = item[method];
      if (!op) continue;

      // Keyed by identity, because OpenAPI says an operation-level parameter REPLACES the
      // path-level one with the same name+in. Concatenating them left both in place, and
      // collapseDuplicateParams then kept the path-level entry and folded the override's value into
      // an invented enum - so a `required: true` override came out optional, disabled and wrong.
      // Map.set keeps the original insertion position, so the emitted order stays deterministic.
      const at = `${method.toUpperCase()} ${rawPath}`;
      const byIdentity = new Map();
      for (const raw of [...sharedParams, ...asArray(op.parameters)]) {
        const p = deref(raw, spec);
        if (!p) {
          const problem = refProblem(raw);
          warnings.push(`${at}: parameter dropped - ${problem?.why ?? 'it is not an object'}`);
          if (problem?.external) noteUnsupported(capability, 'external-$ref', BUNDLE_FIRST, at);
          continue;
        }
        byIdentity.set(`${p.in}:${p.name}`, p);
      }
      const allParams = [...byIdentity.values()];

      const params = [];
      for (const p of allParams) {
        if (!['query', 'path', 'header', 'cookie'].includes(p.in)) continue;
        // Bruno carries auth headers itself; a spec-declared auth header would duplicate it.
        if (p.in === 'header' && /^(authorization|cookie)$/i.test(p.name)) continue;

        const schema = deref(p.schema, spec) ?? {};
        const resolved = resolveValue({
          observed: p.example ?? (p.examples ? Object.values(p.examples)[0]?.value : undefined) ?? schema.example,
          declared: schema.default,
          schema,
          required: Boolean(p.required),
        });

        const entry = {
          in: p.in,
          name: p.name,
          type: schema.type ?? null,
          format: schema.format ?? null,
          required: Boolean(p.required) || p.in === 'path',
          repeatable: schema.type === 'array',
          enum: Array.isArray(schema.enum) ? schema.enum.map(String) : null,
          value: resolved?.value ?? '',
          // Optional parameters ship disabled so the request is runnable as-is.
          disabled: !(Boolean(p.required) || p.in === 'path'),
          description: p.description ?? schema.description ?? null,
          source: resolved?.source ?? 'synthesized',
          confidence: resolved?.confidence ?? 'low',
        };
        // style / explode are NOT applied. The writer emits every non-path parameter as one flat
        // `name=value`, so `style: deepObject` (which must serialise as `filter[colour]=x`) and
        // `spaceDelimited`/`pipeDelimited`/`explode: false` on an array go out wrong on the wire.
        // Every other loss in this file is named; this one was silent.
        const defaultStyle = p.in === 'query' || p.in === 'cookie' ? 'form' : 'simple';
        if ((p.style && p.style !== defaultStyle) || (p.explode === false && schema.type === 'array')) {
          warnings.push(
            `${at}: parameter "${p.name}" uses style "${p.style ?? defaultStyle}"` +
              `${p.explode === false ? ' with explode: false' : ''}, which is not applied; ` +
              'it is written as a single flat key',
          );
          noteUnsupported(
            capability,
            'parameter-style',
            'style/explode serialisation is not applied; such a parameter is written as one flat key and may need editing',
            at,
          );
        }

        params.push(entry);
      }

      const collapsed = collapseDuplicateParams(params);

      // Required headers with no value would be emitted enabled-and-empty by the converter.
      const headers = [];
      for (const h of collapsed.filter((p) => p.in === 'header')) {
        headers.push({
          name: h.name,
          value: h.value,
          disabled: !h.required,
          description: h.description,
          source: h.source,
        });
      }
      const nonHeaderParams = collapsed.filter((p) => p.in !== 'header' && p.in !== 'cookie');

      // A cookie parameter is deliberately NOT emitted, but it must not vanish either. The writer
      // types every non-path parameter as a query parameter, so shipping one would put a session
      // value into the URL - which is usually a credential. Name it instead.
      for (const c of collapsed.filter((p) => p.in === 'cookie')) {
        warnings.push(`${at}: cookie parameter "${c.name}" is not emitted; set it in Bruno's cookie jar`);
        noteUnsupported(
          capability,
          'cookie-parameter',
          "cookie parameters are not written: Bruno sends cookies from its own jar, and a cookie value is usually a credential",
          at,
        );
      }

      // ---- body ----
      let body = { kind: 'none' };
      let bodyLostRequired = false;
      let discriminatorValue = null;
      const requestBody = deref(op.requestBody, spec);
      if (op.requestBody && !requestBody) {
        const problem = refProblem(op.requestBody);
        warnings.push(`${at}: request body dropped - ${problem?.why ?? 'it is not an object'}`);
        if (problem?.external) noteUnsupported(capability, 'external-$ref', BUNDLE_FIRST, at);
        // Only a REQUIRED body becomes unresolved[]: that array drives exit 4, which the contract
        // defines as "unresolved required values", and an optional body lost to an external ref is
        // not one. Recorded here, pushed once the endpoint key exists.
        bodyLostRequired = Boolean(op.requestBody.required);
      }
      if (requestBody?.content) {
        const mediaType = pickMedia(requestBody.content);
        const kind = BODY_KIND[mediaType] ?? (mediaType && /json/i.test(mediaType) ? 'json' : 'text');
        const example = mediaExample(deref(requestBody.content[mediaType], spec), spec);
        // A polymorphic body is reduced to its FIRST branch. Say so: the request looks complete, and
        // a user sending the wrong one of three shapes gets a 400 with nothing to point at.
        const bodySchema = deref(deref(requestBody.content[mediaType], spec)?.schema, spec) ?? {};
        const branches = bodySchema.oneOf ?? bodySchema.anyOf;
        if (Array.isArray(branches) && branches.length > 1) {
          warnings.push(
            `${at}: the body is one of ${branches.length} alternatives; only the first was generated`,
          );
        }
        // When a discriminator names the property that selects the branch, say WHICH branch this is.
        // Without it the body is a valid shape that the server cannot dispatch, which reads as a
        // server bug rather than a generated-body limitation.
        const discriminator = bodySchema.discriminator;
        const chosenRef = Array.isArray(branches) ? branches[0]?.$ref : undefined;
        if (discriminator?.propertyName && typeof chosenRef === 'string') {
          const schemaName = chosenRef.split('/').pop();
          const mapped = Object.entries(discriminator.mapping ?? {})
            .find(([, ref]) => ref === chosenRef)?.[0];
          discriminatorValue = { name: discriminator.propertyName, value: mapped ?? schemaName };
        }

        if (kind === 'json') {
          const built = example?.value ?? {};
          if (discriminatorValue && built && typeof built === 'object' && !Array.isArray(built)) {
            built[discriminatorValue.name] = discriminatorValue.value;
          }
          body = {
            kind: 'json',
            contentType: mediaType,
            json: built,
            source: example?.source ?? 'synthesized',
            confidence: example?.source === 'observed' ? 'high' : 'medium',
          };
        } else if (kind === 'form-urlencoded' || kind === 'multipart-form') {
          const schema = deref(deref(requestBody.content[mediaType], spec)?.schema, spec) ?? {};
          body = {
            kind,
            contentType: mediaType,
            entries: Object.entries(schema.properties ?? {}).map(([name, prop]) => {
              const ps = deref(prop, spec) ?? {};
              const r = resolveValue({ observed: ps.example, declared: ps.default, schema: ps });
              return { name, value: r?.value ?? '', disabled: !(schema.required ?? []).includes(name) };
            }),
            source: 'declared',
            confidence: 'medium',
          };
        } else {
          body = {
            kind,
            contentType: mediaType,
            text: typeof example?.value === 'string' ? example.value : '',
            source: example?.source ?? 'synthesized',
            confidence: 'low',
          };
        }
        if (requestBody.required && body.kind === 'json' && Object.keys(body.json ?? {}).length === 0) {
          warnings.push(`${method.toUpperCase()} ${rawPath}: required body could not be built from the spec`);
        }
      }

      // ---- folder from the first tag ----
      const tag = (op.tags ?? [])[0] ?? null;
      let folderId = null;
      if (tag) {
        folderId = tag;
        if (!folders.has(folderId)) {
          folders.set(folderId, { id: folderId, name: tag, auth: 'inherit', seq: folders.size + 1, source: 'spec:tags' });
        }
      }

      const pathTemplate = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
      const key = endpointKey(method, `${routePrefix}${pathTemplate}`);
      // Two paths that differ only by a trailing slash - or only by what a path parameter is CALLED -
      // are one identity to endpointKey. Emitting both made ingest's own output fail validateModel
      // with advice only ingest could act on, so keep the first and say which path was dropped.
      if (seenKeys.has(key)) {
        warnings.push(
          `${at}: same endpoint identity as ${seenKeys.get(key)} (${key}); only the first is generated`,
        );
        continue;
      }
      seenKeys.set(key, at);
      if (bodyLostRequired) {
        unresolved.push({ endpointKey: key, field: 'body', reason: 'the request body could not be resolved' });
      }
      const destructive =
        method === 'delete' || /(restart|purge|reset|drop|delete|truncate)/i.test(pathTemplate);

      // Every path parameter must exist as a param entry or the URL keeps a placeholder.
      for (const name of [...pathTemplate.matchAll(/\{([^}]+)\}/g)].map((m) => m[1])) {
        if (nonHeaderParams.some((p) => p.in === 'path' && p.name === name)) continue;
        nonHeaderParams.push({
          in: 'path', name, type: 'string', format: null, required: true, repeatable: false,
          enum: null, value: 'string', disabled: false,
          description: 'not declared in the spec', source: 'synthesized', confidence: 'low',
        });
        warnings.push(`${method.toUpperCase()} ${rawPath}: path parameter "${name}" is not declared in the spec`);
      }

      const endpoint = {
        endpointKey: key,
        name: op.summary?.trim() || op.operationId || `${method.toUpperCase()} ${pathTemplate}`,
        folderId,
        method: method.toUpperCase(),
        pathTemplate,
        tags: op.tags ?? [],
        summary: op.summary ?? null,
        description: op.description ?? null,
        deprecated: Boolean(op.deprecated),
        destructive,
        params: nonHeaderParams,
        headers,
        auth: 'inherit',
        authNotes: notes,
        body,
        responses: Object.entries(op.responses ?? {})
          .map(([status, r]) => {
            const code = Number(status);
            // `default` and `2XX` are not codes and are skipped in silence, as before. A NUMERIC key
            // outside 100-599 is different: the schema requires that range, so a single `0` or `600`
            // used to fail validation for the whole model and abort ingest over a field nothing sends.
            if (!Number.isInteger(code) || code < 100 || code > 599) {
              if (Number.isFinite(code)) {
                warnings.push(`${at}: response status "${status}" is outside 100-599 and was skipped`);
              }
              return null;
            }
            const res = deref(r, spec) ?? {};
            return { status: code, contentType: Object.keys(res.content ?? {})[0] ?? null, description: res.description ?? null };
          })
          .filter(Boolean),
        // An assert is only safe where the body was not invented and the call is not destructive.
        asserts:
          body.source !== 'synthesized' && !destructive
            ? [{ expression: 'res.status', operator: 'lt', value: '400', disabled: false }]
            : [],
        settings: {},
        seq: null,
        provenance: { $skeleton: `spec:${method}:${rawPath}`, sourceRefs: [], fields: {} },
        confidence: 'high',
        flags: [
          ...(body.source === 'synthesized' && body.kind !== 'none' ? ['guessed-body'] : []),
          // Headers count too: a required header filled with a synthesised value is exactly the
          // kind of thing a user must check before sending.
          ...([...nonHeaderParams, ...headers.map((h) => ({ ...h, required: !h.disabled }))].some(
            (p) => p.source === 'synthesized' && p.required,
          )
            ? ['placeholder-values']
            : []),
        ],
      };

      // VP-1: a required, enabled input with no usable value is a named diagnostic, never a silent
      // empty string.
      for (const p of [...nonHeaderParams, ...headers.map((h) => ({ ...h, in: 'header', required: !h.disabled }))]) {
        if (p.required && !p.disabled && !isUsable(p.value)) {
          unresolved.push({
            endpointKey: key,
            field: `/params/${p.in}/${p.name}/value`,
            reason: 'required, and the spec supplied no usable example, default or enum',
            required: true,
          });
          if (!endpoint.flags.includes('unresolved')) endpoint.flags.push('unresolved');
        }
      }

      endpoints.push(endpoint);
    }
  }

  const environments = [
    {
      name: 'local',
      vars: {
        [baseUrlVar]: firstServerOrigin(spec),
        // The non-credential names the auth recipe references, declared with an empty value for the
        // user to fill in. Undeclared, `{{username}}` and `{{clientId}}` went out empty and every
        // call 401'd - which `doctor` reported as an undeclared variable, one command too late.
        ...Object.fromEntries([...new Set(authVars)].sort().map((name) => [name, ''])),
      },
      secrets: [...new Set(secrets)].sort(),
    },
  ];

  const model = {
    modelVersion: 1,
    collection: {
      name: collectionName ?? spec.info?.title ?? 'API',
      format,
      outputDir,
      routePrefix,
      baseUrlVar,
      headers: [{ name: 'Accept', value: 'application/json', source: 'declared' }],
      auth,
      environments,
      docs: [spec.info?.title, spec.info?.version ? `Version ${spec.info.version}` : null, spec.info?.description]
        .filter(Boolean)
        .join('\n\n'),
    },
    folders: [...folders.values()],
    endpoints,
    sources: [{ rule: 'spec', kind: 'openapi', path: null, role: 'skeleton', endpointCount: endpoints.length }],
    warnings,
    unresolved,
    capability,
  };

  return { model, warnings, unresolved, capability };
}

function firstServerOrigin(spec) {
  const url = serverUrl(asArray(spec.servers)[0]);
  if (!url) return '';
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return '';
  }
}

/**
 * Postman and WSDL go through Bruno's own converters, then into the IR shape. Their metadata is
 * thinner than a spec's, so every value is marked observed (Postman carries real values) or
 * synthesized, and nothing claims high confidence.
 */
export async function ingestViaConverter(kind, data, { collectionName, format = 'yml', outputDir = 'bruno', baseUrlVar = 'baseUrl' } = {}) {
  const c = converters();
  // Both converters are async and resolve to {collection, issues} - not to a collection. Calling
  // them without await handed a Promise to the walker, whose `items` is undefined, so Postman and
  // WSDL ingest produced an empty-but-valid model and exited 0 on every input.
  const { collection: converted, issues } = kind === KIND.POSTMAN
    ? await c.postmanToBruno(data)
    : await c.wsdlToBruno(data);

  const endpoints = [];
  const folders = new Map();
  const warnings = [];
  const unresolved = [];
  // A Postman collection commonly writes every url as `{{baseUrl}}/path` and keeps the host in a
  // collection-level `variable` entry. Reading only the request urls therefore found no origin at
  // all for the commonest export shape - and once a missing base URL became an unresolved value,
  // that turned into a confident exit 4 saying nothing supplied one.
  const declaredVars = Array.isArray(data?.variable) ? data.variable : [];
  const fromCollectionVar = declaredVars.find(
    (v) => typeof v?.value === 'string' && /^(baseurl|base_url|host|url)$/i.test(String(v?.key ?? '')) && v.value.trim(),
  );
  let originFromImport = fromCollectionVar ? String(fromCollectionVar.value).trim().replace(/\/+$/, '') : '';

  const walk = (items, folderId) => {
    for (const it of items ?? []) {
      if (it.type === 'folder' || (!it.request && Array.isArray(it.items))) {
        const id = it.name;
        if (!folders.has(id)) {
          folders.set(id, { id, name: it.name, auth: 'inherit', seq: folders.size + 1, source: `${kind}:folder` });
        }
        walk(it.items, id);
        continue;
      }
      if (!it.request) continue;

      const url = String(it.request.url ?? '');
      const method = String(it.request.method ?? 'GET').toUpperCase();
      let pathTemplate = '/';
      try {
        const parsed = new URL(url.replace(/\{\{[^}]+\}\}/g, 'placeholder'));
        pathTemplate = parsed.pathname || '/';
        // The imported requests carry the origin; the environment was hard-coded to '' regardless,
        // so every imported collection needed the base URL typed in by hand before it could send.
        // Only a real host counts - `placeholder` is what a {{var}} was rewritten to above.
        if (!originFromImport && parsed.hostname && !url.startsWith('{{')) {
          originFromImport = `${parsed.protocol}//${parsed.host}`;
        }
      } catch {
        const m = /^(?:\{\{[^}]+\}\})?(\/[^?#]*)/.exec(url);
        pathTemplate = m ? m[1] : '/';
      }

      const params = (it.request.params ?? []).map((p) => ({
        in: p.type === 'path' ? 'path' : 'query',
        name: p.name,
        type: null,
        format: null,
        // Postman has no notion of a required parameter. Treating "enabled" as required made every
        // enabled query param with an empty value a validation failure (required + not disabled +
        // empty is exactly what the value contract forbids), so a valid collection could not ingest.
        required: p.type === 'path',
        repeatable: false,
        enum: null,
        value: String(p.value ?? ''),
        disabled: p.enabled === false,
        description: p.description ?? null,
        source: 'observed',
        confidence: 'medium',
      }));

      const src = it.request.body;
      const bodyMode = src?.mode;
      let body;
      if (!src || !bodyMode || bodyMode === 'none') {
        // A bodiless request is the ordinary case and must not be reported as a loss.
        body = { kind: 'none' };
      } else if (bodyMode === 'json') {
        body = { kind: 'json', contentType: 'application/json', json: safeJson(src.json), source: 'observed', confidence: 'medium' };
      } else if (bodyMode === 'xml') {
        body = { kind: 'xml', contentType: 'application/xml', text: String(src.xml ?? ''), source: 'observed', confidence: 'medium' };
      } else {
        // Only json and xml are written. Anything else used to flatten to `none` in silence, so an
        // imported request that POSTs nothing looked identical to one that never had a body. Naming
        // it is the fix; writing the other modes is a separate change with its own risks (a file part
        // has no representation here, and a form body routinely carries a client secret).
        body = { kind: 'none' };
        warnings.push(
          `${it.name ?? `${method} ${pathTemplate}`}: a "${bodyMode}" body cannot be written yet, ` +
            'so the request was imported without it',
        );
      }

      const key = endpointKey(method, pathTemplate);
      for (const p of params) {
        if (p.required && !p.disabled && p.value === '') {
          unresolved.push({ endpointKey: key, field: `params.${p.name}`, reason: 'the import carried no value' });
        }
      }

      endpoints.push({
        endpointKey: key,
        name: it.name ?? `${method} ${pathTemplate}`,
        folderId: folderId ?? null,
        method,
        pathTemplate,
        tags: [],
        summary: null,
        description: null,
        deprecated: false,
        destructive: method === 'DELETE',
        params,
        headers: (it.request.headers ?? []).map((h) => ({
          name: h.name, value: String(h.value ?? ''), disabled: h.enabled === false, source: 'observed',
        })),
        auth: 'inherit',
        authNotes: [],
        body,
        responses: [],
        asserts: [],
        settings: {},
        seq: null,
        provenance: { $skeleton: `${kind}:${it.name ?? ''}`, sourceRefs: [], fields: {} },
        confidence: 'medium',
        flags: [],
      });
    }
  };
  walk(converted?.items, null);

  for (const issue of issues ?? []) warnings.push(`${kind}: ${typeof issue === 'string' ? issue : JSON.stringify(issue)}`);
  if (endpoints.length === 0) warnings.push(`${kind} import produced no requests`);

  return {
    model: {
      modelVersion: 1,
      collection: {
        name: collectionName ?? converted?.name ?? 'API',
        format,
        outputDir,
        routePrefix: '',
        baseUrlVar,
        headers: [],
        auth: { mode: 'none', source: 'spec' },
        environments: [{ name: 'local', vars: { [baseUrlVar]: originFromImport }, secrets: [] }],
        docs: `Imported from ${kind}.`,
      },
      folders: [...folders.values()],
      endpoints,
      sources: [{ rule: 'R5', kind, path: null, role: 'skeleton', endpointCount: endpoints.length }],
      warnings,
      unresolved,
      capability: [],
    },
    warnings,
    unresolved,
    capability: [],
  };
}

const safeJson = (v) => {
  if (v === null || v === undefined) return {};
  if (typeof v !== 'string') return v;
  try {
    return JSON.parse(v);
  } catch {
    return {};
  }
};
