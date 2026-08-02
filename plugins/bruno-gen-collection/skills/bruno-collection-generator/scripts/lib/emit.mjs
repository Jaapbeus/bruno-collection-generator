// Turns the IR into Bruno files.
//
// Serialisation is always delegated to filestore, never templated by hand: it owns the quoting,
// escaping, block ordering and the trailing-space-after-an-empty-value behaviour. Our job is to
// build a correct BrunoItem and to be deterministic about names, order and seq.

import { filestore, ITEM_TYPE_HTTP, libraryVersions } from './deps.mjs';
import { safeSegment, uniqueSegment, collisionKey, byCodepoint } from './paths.mjs';

/** Bruno writes path parameters as `:name`, not `{name}`. */
export const toBrunoPath = (pathTemplate) =>
  String(pathTemplate).replace(/\{([^}]+)\}/g, (_, name) => `:${name}`);

/**
 * The full host-relative path: routePrefix followed by pathTemplate.
 *
 * These are separate fields on purpose. `routePrefix` is the host-level prefix the framework or
 * host adds (`/api` for Azure Functions, a global version segment for some frameworks) and
 * `pathTemplate` is the route as declared in the code or spec. Everything that needs the whole
 * path - the URL, the docs block, the endpoint key - must compose them through this one function,
 * or the prefix ends up applied twice or not at all.
 */
export const fullPath = (collection, endpoint) => {
  const prefix = collection.routePrefix ?? '';
  const path = endpoint.pathTemplate ?? '/';
  if (!prefix) return path;
  return `${prefix}${path === '/' ? '' : path}` || '/';
};

/**
 * Full request URL. Required, enabled query parameters also appear in the query string, because
 * that is what Bruno's UI shows and what a user expects to be able to send immediately. Optional
 * parameters live only in params:query, disabled.
 */
export function buildUrl(collection, endpoint) {
  const base = `{{${collection.baseUrlVar}}}`;
  const url = `${base}${toBrunoPath(fullPath(collection, endpoint))}`;

  const active = (endpoint.params ?? []).filter(
    (p) => p.in === 'query' && !p.disabled && p.required && String(p.value ?? '') !== '',
  );
  if (active.length === 0) return url;

  // A `&` in a value would start a second query parameter, and Bruno's own encodeUrl cannot undo
  // that: it splits the query on `&` before it decodes anything. So the value has to be encoded
  // here - but `{{variable}}` references must reach Bruno VERBATIM or interpolation never fires
  // (`encodeURIComponent('{{id}}')` is `%7B%7Bid%7D%7D`, which nothing matches). Encode only the
  // spans between the references.
  //
  // Nothing else is pre-encoded on purpose: encodeUrl is on for these requests and is not
  // idempotent, so a pre-encoded space would arrive as `%2520`.
  const query = active.map((p) => `${encodeQueryText(p.name)}=${encodeQueryText(p.value)}`).join('&');
  return `${url}?${query}`;
}

/** Percent-encode a query name or value, leaving `{{variable}}` references untouched. */
function encodeQueryText(text) {
  return String(text ?? '')
    .split(/(\{\{[^{}]*\}\})/)
    .map((span, i) => (i % 2 === 1 ? span : encodeURIComponent(span)))
    .join('');
}

/**
 * A display name is one line.
 *
 * `.bru` writes `meta { name: ... }`, `tags` and the collection name as single-line values, so a
 * newline - which a multi-line C# `<summary>` or a YAML block scalar arrives as - produces a file the
 * grammar rejects, and `apply` then refuses the whole run over one endpoint. The full text is already
 * in `docs`, so collapsing whitespace loses nothing, and the same model has to produce the same names
 * in both formats even though yml would round-trip the newline happily.
 */
const oneLine = (text) => String(text ?? '').replace(/\s+/g, ' ').trim();

/**
 * Bruno's own structural names, which a generated segment must not collide with.
 *
 * `collection.bru` / `opencollection.yml` IS the collection root and `folder.bru` IS a folder's own
 * file, and `requestFiles` excludes all three by name - so a request written under one of those names
 * is invisible to `doctor`, to `adopt` and to orphan detection, permanently. A FOLDER segment of
 * `environments` is worse: every request inside it lands in the environments directory, where
 * `environmentFiles` reads them as environments and `requestFiles` skips the directory entirely.
 *
 * Position- and format-aware on purpose. In yml the root is `opencollection.yml`, so a request named
 * `collection` is perfectly legal there; and environment file names are NOT filtered, because
 * `bru run --env X` resolves `environments/X` by file name - renaming one would break the flag.
 */
const reservedFor = (what, format) =>
  what === 'folder'
    ? new Set(['environments', 'folder'])
    : new Set(['folder', format === 'yml' ? 'opencollection' : 'collection']);

/** `environments` as a folder, or `collection` as a request: suffix it rather than write it. */
const avoidReserved = (segment, what, format) =>
  reservedFor(what, format).has(collisionKey(segment)) ? `${segment}-${what}` : segment;

/**
 * Deterministic, readable file name: method plus the path, with parameters spelled out.
 *
 *   GET /v1/widgets/{widgetId}/prices  ->  get-v1-widgets-by-widgetid-prices
 *
 * Derived from the route, never from the display name, so renaming a request in Bruno does not
 * move its file. Parameter names *are* included even though they are excluded from the endpoint
 * key, because a name is far more readable than an ordinal - and a rename cannot churn the file
 * anyway, since the name is frozen in the lockfile the first time it is written.
 */
export function deriveFileName(collection, endpoint) {
  const path = fullPath(collection, endpoint).replace(
    /\{([^}]+)\}/g,
    (_, name) => `by-${name}`,
  );
  return safeSegment(`${endpoint.method} ${path}`, { key: endpoint.endpointKey });
}

const orderedHeaders = (headers = []) =>
  [...headers].sort((a, b) => byCodepoint(a.name.toLowerCase(), b.name.toLowerCase()));

/** Params in declaration order, but disabled ones last - which is what filestore does anyway. */
const orderedParams = (params = []) => [
  ...params.filter((p) => !p.disabled),
  ...params.filter((p) => p.disabled),
];

function bodyFor(endpoint) {
  const b = endpoint.body;
  if (!b || b.kind === 'none') return { mode: 'none' };
  switch (b.kind) {
    case 'json':
      return { mode: 'json', json: typeof b.json === 'string' ? b.json : JSON.stringify(b.json, null, 2) };
    case 'text':
      return { mode: 'text', text: b.text ?? '' };
    case 'xml':
      return { mode: 'xml', xml: b.text ?? '' };
    case 'form-urlencoded':
      return {
        mode: 'formUrlEncoded',
        formUrlEncoded: (b.entries ?? []).map((e) => ({
          name: e.name,
          value: e.value,
          enabled: !e.disabled,
        })),
      };
    case 'multipart-form':
      return {
        mode: 'multipartForm',
        multipartForm: (b.entries ?? []).map((e) => ({
          type: 'text',
          name: e.name,
          value: e.value,
          enabled: !e.disabled,
        })),
      };
    default:
      return { mode: 'none' };
  }
}

/** Modes that are meaningless without their credential block. */
const AUTH_BLOCK = { apikey: 'apikey', bearer: 'bearer', basic: 'basic', oauth2: 'oauth2' };

/**
 * Refuse to write a mode with no credential behind it.
 *
 * The schema is the real gate, and this is the second one. A request carrying `auth: apikey` and no
 * `auth:apikey` block is the worst possible output: it looks authenticated, it is accepted by Bruno,
 * and every call comes back 401 with nothing in the file to explain why. Better to stop and say so.
 */
export function authFor(endpoint, { label = null } = {}) {
  const a = endpoint.auth ?? 'inherit';
  if (typeof a === 'string') return { mode: a };

  const needs = AUTH_BLOCK[a.mode];
  if (needs && !a[needs]) {
    const where = label ?? endpoint.endpointKey ?? endpoint.name ?? 'an endpoint';
    throw new Error(
      `${where}: auth mode "${a.mode}" has no "${needs}" block, so the request would be written with ` +
        `no credential and every call would 401.\n` +
        `Expected: { "mode": "${a.mode}", "${needs}": { ... } }` +
        (a.mode === 'apikey' ? '  with key, value and placement ("header" or "queryparams")' : '') +
        `\nGot: ${JSON.stringify(a)}`,
    );
  }
  return a;
}

/** Docs block: the summary, the parameter table, and any auth notes. Never a timestamp. */
function docsFor(collection, endpoint) {
  const lines = [];
  const method = endpoint.method;
  lines.push(`${method} ${fullPath(collection, endpoint)}`);

  if (endpoint.summary) lines.push('', endpoint.summary);
  if (endpoint.description && endpoint.description !== endpoint.summary) {
    lines.push('', endpoint.description);
  }

  const params = endpoint.params ?? [];
  const documented = params.filter((p) => p.description || p.enum?.length || p.repeatable);
  if (documented.length) {
    lines.push('', 'Parameters:');
    for (const p of documented) {
      const bits = [`  ${p.name} (${p.in}${p.required ? ', required' : ''})`];
      if (p.description) bits.push(`- ${p.description}`);
      if (p.enum?.length) bits.push(`[${p.enum.join(' | ')}]`);
      if (p.repeatable) bits.push('(repeatable)');
      lines.push(bits.join(' '));
    }
  }

  for (const note of endpoint.authNotes ?? []) lines.push('', note);

  if ((endpoint.flags ?? []).includes('placeholder-values')) {
    lines.push('', 'Some values below were invented; check them before sending.');
  }
  if ((endpoint.flags ?? []).includes('variant')) {
    lines.push('', 'A variant of another request on the same method and path. You own this file.');
  }

  return lines.join('\n');
}

/**
 * Tags for one endpoint, with `destructive` guaranteed present when the endpoint says it is.
 *
 * The IR carries `destructive` as a boolean, and the only thing that ever consumed it was the
 * decision not to attach an assert. But the way anything *outside* this tool avoids a destructive
 * request is `bru run --exclude-tags destructive` - a tag, not a field. Emitting the boolean without
 * the tag meant `smoke` promised to skip destructive requests and then sent them, which is a promise
 * worth keeping rather than a wording to soften.
 *
 * Deduplicated, because a model may reasonably set both.
 */
export function tagsFor(endpoint) {
  // One line each: `tags` is a single-line list in the bru grammar too.
  const tags = [...(endpoint.tags ?? [])].map(oneLine).filter(Boolean);
  if (endpoint.destructive === true && !tags.includes('destructive')) tags.push('destructive');
  return tags;
}

/** Build the filestore item for one endpoint. */
export function toBrunoItem(collection, endpoint, seq) {
  const item = {
    // Must be 'http-request': the yml writer throws on 'http', and the bru writer logs an error
    // and silently continues. Both writers put `type: http` into the file themselves.
    type: ITEM_TYPE_HTTP,
    name: oneLine(endpoint.name),
    seq,
    ...(tagsFor(endpoint).length ? { tags: tagsFor(endpoint) } : {}),
    request: {
      method: endpoint.method,
      url: buildUrl(collection, endpoint),
      params: orderedParams(endpoint.params).map((p) => ({
        name: p.name,
        value: String(p.value ?? ''),
        type: p.in === 'path' ? 'path' : 'query',
        enabled: !p.disabled,
        ...(p.description ? { description: p.description } : {}),
      })),
      headers: orderedHeaders(endpoint.headers).map((h) => ({
        name: h.name,
        value: String(h.value ?? ''),
        enabled: !h.disabled,
        ...(h.description ? { description: h.description } : {}),
      })),
      auth: authFor(endpoint),
      body: bodyFor(endpoint),
    },
  };

  const docs = docsFor(collection, endpoint);
  if (docs) item.request.docs = docs;

  const asserts = (endpoint.asserts ?? []).filter((a) => !a.disabled);
  if (asserts.length) {
    item.request.assertions = asserts.map((a) => ({
      name: a.expression,
      value: a.operator ? `${a.operator} ${a.value}` : a.value,
      enabled: true,
    }));
  }

  if (endpoint.settings && Object.keys(endpoint.settings).length) {
    item.settings = { ...endpoint.settings };
  }

  return item;
}

/**
 * Plan every file the collection consists of, as {relPath, content} pairs.
 *
 * Pure: it reads nothing from disk and writes nothing. `frozen` supplies file names and seq
 * values already recorded in the lockfile, so neither churns when the model changes.
 */
export function planFiles(model, { frozen = { fileNames: {}, seqs: {}, takenByDir: {} } } = {}) {
  const store = filestore();
  const { collection } = model;
  const format = collection.format;
  const ext = format === 'yml' ? 'yml' : 'bru';
  const files = [];

  // ---- folders ------------------------------------------------------------------------
  const folderById = new Map((model.folders ?? []).map((f) => [f.id, f]));
  const folderSegments = new Map();
  const usedFolderSegments = new Set();
  const foldersSorted = [...(model.folders ?? [])].sort((a, b) => byCodepoint(a.id, b.id));
  for (const folder of foldersSorted) {
    const seg = uniqueSegment(
      avoidReserved(safeSegment(folder.name, { key: folder.id }), 'folder', format),
      usedFolderSegments,
      folder.id,
    );
    folderSegments.set(folder.id, seg);
  }

  // ---- endpoints ----------------------------------------------------------------------
  // Stable order: folder, then endpointKey. seq is assigned per directory, frozen values first.
  const endpoints = [...(model.endpoints ?? [])].sort(
    (a, b) =>
      byCodepoint(String(a.folderId ?? ''), String(b.folderId ?? '')) ||
      byCodepoint(a.endpointKey, b.endpointKey),
  );

  const usedNamesPerDir = new Map();
  const nextSeqPerDir = new Map();
  const placements = [];

  const dirOf = (endpoint) => (endpoint.folderId ? folderSegments.get(endpoint.folderId) ?? '' : '');

  // Frozen names are claimed FIRST, in their own pass.
  //
  // Using a frozen name verbatim skipped `uniqueSegment` entirely, so a new endpoint whose derived
  // slug happened to equal an existing frozen name took the same path: two planned files with one
  // relPath, one endpoint silently dropped, and the surviving file's content alternating between
  // the two on every run - permanently breaking the zero-diff-rerun guarantee. (`GET /a/b` and
  // `GET /a-b` both slug to `get-a-b`.)
  //
  // They also go through `safeSegment` now. `.bruno-gen/lock.json` is committed in the repository
  // under inspection, so a `fileName` of `../../../../evil` is untrusted input; `assertInside`
  // caught the write, but only after the planner had already read that path. Case is preserved so
  // that adopting `Download.bru` does not rename it to `download.bru` on the next apply.
  const frozenSegment = new Map();
  for (const endpoint of endpoints) {
    const raw = frozen.fileNames?.[endpoint.endpointKey];
    if (!raw) continue;
    const dir = dirOf(endpoint);
    const used = usedNamesPerDir.get(dir) ?? new Set();
    // Through avoidReserved as well. Guarding only the model-supplied name left the frozen branch
    // able to plan `collection.bru` or `opencollection.yml`, which the duplicate-path assertion below
    // then rejects - so a lockfile carrying a reserved fileName made plan AND apply fail with "this
    // is a bug in the emitter" and no way out of it. A frozen `folder` was worse: no collision, so
    // the request was written to a path `requestFiles` filters out and became invisible for ever.
    const seg = uniqueSegment(
      avoidReserved(safeSegment(raw, { key: endpoint.endpointKey, preserveCase: true }), 'request', format),
      used,
      endpoint.endpointKey,
    );
    used.add(collisionKey(seg));
    usedNamesPerDir.set(dir, used);
    frozenSegment.set(endpoint.endpointKey, seg);
  }

  for (const endpoint of endpoints) {
    const dir = dirOf(endpoint);
    const used = usedNamesPerDir.get(dir) ?? new Set();

    // A file name recorded in the lockfile wins, so renaming a request or a path parameter
    // never moves the file.
    const segment =
      frozenSegment.get(endpoint.endpointKey) ??
      uniqueSegment(
        avoidReserved(
          safeSegment(endpoint.fileName ?? deriveFileName(collection, endpoint), { key: endpoint.endpointKey }),
          'request',
          format,
        ),
        used,
        endpoint.endpointKey,
      );
    used.add(collisionKey(segment));
    usedNamesPerDir.set(dir, used);

    // seq precedence: what is already on disk, then what the model asked for, then the next free
    // number in that directory.
    //
    // Two things were wrong here. `endpoint.seq` was never read at all, so a field the schema
    // advertises as settable was dead input. And "taken" counted only endpoints in *this model*,
    // ignoring adopted siblings - which are real files, usually absent from the model, and already
    // holding a number. On a migrated collection the first new endpoint therefore landed on `seq: 1`
    // next to an existing `seq: 1`, and `doctor` reported the ambiguous ordering afterwards.
    const frozenSeq = frozen.seqs?.[endpoint.endpointKey];
    let seq = frozenSeq;
    if (!Number.isFinite(seq)) {
      const taken = new Set([
        ...placements.filter((p) => p.dir === dir).map((p) => p.seq),
        ...(frozen.takenByDir?.[dir] ?? []),
      ]);
      const asked = endpoint.seq;
      if (Number.isFinite(asked) && !taken.has(asked)) {
        seq = asked;
      } else {
        let next = nextSeqPerDir.get(dir) ?? 1;
        while (taken.has(next)) next++;
        seq = next;
        nextSeqPerDir.set(dir, next + 1);
      }
    }

    placements.push({ endpoint, dir, segment, seq });
  }

  for (const { endpoint, dir, segment, seq } of placements) {
    const item = toBrunoItem(collection, endpoint, seq);
    const relPath = dir ? `${dir}/${segment}.${ext}` : `${segment}.${ext}`;
    files.push({
      relPath,
      content: store.stringifyRequest(item, { format }),
      kind: 'request',
      endpointKey: endpoint.endpointKey,
      seq,
      fileName: segment,
    });
  }

  // Folder files come after, so their seq can reflect declaration order.
  for (const [i, folder] of foldersSorted.entries()) {
    const seg = folderSegments.get(folder.id);
    files.push({
      relPath: `${seg}/folder.${ext}`,
      content: store.stringifyFolder(
        {
          meta: { name: oneLine(folder.name), seq: folder.seq ?? i + 1 },
          request: { auth: { mode: folder.auth ?? 'inherit' } },
        },
        { format },
      ),
      kind: 'folder',
    });
  }

  // ---- collection root ----------------------------------------------------------------
  const brunoConfig = {
    version: '1',
    name: collection.name,
    type: 'collection',
    ignore: ['node_modules', '.git', '.bruno-gen'],
  };
  const rootObject = {
    meta: { name: oneLine(collection.name) },
    request: {
      headers: orderedHeaders(collection.headers).map((h) => ({
        name: h.name,
        value: String(h.value ?? ''),
        enabled: !h.disabled,
      })),
      auth: collection.auth ?? { mode: 'none' },
    },
    ...(collection.docs ? { docs: collection.docs } : {}),
  };

  if (format === 'yml') {
    files.push({
      relPath: 'opencollection.yml',
      content: store.stringifyCollection(rootObject, brunoConfig, { format }),
      kind: 'root',
    });
  } else {
    files.push({
      relPath: 'collection.bru',
      content: store.stringifyCollection(rootObject, brunoConfig, { format }),
      kind: 'root',
    });
    // filestore has no bruno.json writer; it is plain JSON we own, created once.
    files.push({
      relPath: 'bruno.json',
      content: `${JSON.stringify(brunoConfig, null, 2)}\n`,
      kind: 'config',
      createOnce: true,
    });
  }

  // ---- environments -------------------------------------------------------------------
  // Environment names had no collision guard at all, unlike folders and requests. Nothing requires
  // them to be unique, so `Local 1` and `Local-1` both slugged to `environments/Local-1` - two
  // planned files with one relPath on every platform, the second write silently winning - and
  // `Local`/`local` diverged: one file on Windows, two on Linux, from the same repository.
  const usedEnvSegments = new Set();
  for (const env of collection.environments ?? []) {
    const vars = Object.entries(env.vars ?? {}).sort(([a], [b]) => {
      if (a === collection.baseUrlVar) return -1;
      if (b === collection.baseUrlVar) return 1;
      return byCodepoint(a, b);
    });
    const variables = [
      ...vars.map(([name, value]) => ({ name, value: String(value ?? ''), type: 'text', enabled: true, secret: false })),
      // Secrets are names only. Never a value, in any format.
      ...[...(env.secrets ?? [])].sort().map((name) => ({ name, value: '', type: 'text', enabled: true, secret: true })),
    ];
    // Case preserved: the environment name is how the user addresses it (`--env Local`), and
    // folding it to `local.bru` both renames it and, on a case-sensitive filesystem, creates a
    // second file beside an existing `Local.bru` instead of recognising it.
    const envSegment = uniqueSegment(
      safeSegment(env.name, { key: env.name, preserveCase: true }),
      usedEnvSegments,
      env.name,
    );
    usedEnvSegments.add(collisionKey(envSegment));

    files.push({
      relPath: `environments/${envSegment}.${ext}`,
      content: store.stringifyEnvironment({ name: env.name, variables }, { format }),
      kind: 'environment',
      createOnce: true,
      secretNames: [...(env.secrets ?? [])].sort(),
    });
  }

  // Two planned files claiming one path would mean one silently overwriting the other, and the
  // lockfile then recording an endpoint against content that is not its own. Nothing should be able
  // to reach here - collision resolution runs for folders, requests and environments alike - so this
  // is an assertion, not a repair. Case-folded, because Windows and macOS would collapse them.
  const claimed = new Map();
  for (const f of files) {
    const key = collisionKey(f.relPath);
    if (claimed.has(key)) {
      throw new Error(
        `two planned files claim ${f.relPath} (${claimed.get(key)} and ${f.endpointKey ?? f.kind}). ` +
          'This is a bug in the emitter, not something the model can fix.',
      );
    }
    claimed.set(key, f.endpointKey ?? f.kind);
  }

  // Deterministic order regardless of how the model was assembled.
  files.sort((a, b) => byCodepoint(a.relPath, b.relPath));

  // Exactly one trailing newline on every file. `collection.bru` was the only one emitted without
  // any, so git rendered "\ No newline at end of file" on it for ever and an editor configured to
  // add one on save produced a diff that was not an edit. `canonicalHash` already ignores trailing
  // newlines, so normalising here changes no ownership decision.
  for (const file of files) {
    file.content = `${String(file.content).replace(/\n+$/, '')}\n`;
  }

  return { files, libraries: libraryVersions() };
}
