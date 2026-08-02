// Reads an existing collection: what requests it holds, what variables it needs, what it declares.
//
// This is the foundation for adoption, duplicate detection and the secret scan. Parsing is done by
// filestore, never by hand, so the inventory sees exactly what Bruno sees.

import { readFileSync } from 'node:fs';
import { basename, relative, sep } from 'node:path';
import { parseStrict } from './deps.mjs';
import { requestFiles, environmentFiles, supportFiles, YML_ROOT } from './format.mjs';
import { scanText } from './secrets.mjs';
import { byCodepoint } from './paths.mjs';

const rel = (root, p) => relative(root, p).split(sep).join('/');

/**
 * Canonical endpoint identity: METHOD + path with parameters replaced by their ordinal.
 *
 *   GET /v1/widgets/:id/prices        -> GET /v1/widgets/{1}/prices
 *   GET /v1/widgets/{widgetId}/prices -> GET /v1/widgets/{1}/prices
 *
 * Parameter *names* are deliberately excluded: renaming `{id}` to `{widgetId}` is the same
 * endpoint, and including the name would make a rename look like a delete plus an add.
 */
export function endpointKey(method, url) {
  const raw = String(url ?? '');
  // Drop scheme/host/variable prefix and the query string.
  let path = raw
    .replace(/^\s*\{\{[^}]+\}\}/, '')
    .replace(/^[a-z][a-z0-9+.-]*:\/\/[^/]*/i, '')
    .split(/[?#]/)[0];

  if (!path.startsWith('/')) path = `/${path}`;

  let n = 0;
  const normalised = path
    .split('/')
    .map((seg) => {
      if (!seg) return seg;
      const isParam =
        seg.startsWith(':') || (seg.startsWith('{') && seg.endsWith('}')) || /^\{\{.+\}\}$/.test(seg);
      return isParam ? `{${++n}}` : seg;
    })
    .join('/');

  const path2 = normalised.length > 1 ? normalised.replace(/\/+$/, '') : normalised;
  return `${String(method ?? 'GET').toUpperCase()} ${path2}`;
}

/** Every `{{variable}}` referenced anywhere in a parsed request. */
export function referencedVariables(item) {
  const found = new Set();
  const visit = (v) => {
    if (v === null || v === undefined) return;
    if (typeof v === 'string') {
      for (const m of v.matchAll(/\{\{\s*([^{}\s]+)\s*\}\}/g)) found.add(m[1]);
      return;
    }
    if (Array.isArray(v)) {
      v.forEach(visit);
      return;
    }
    if (typeof v === 'object') Object.values(v).forEach(visit);
  };
  visit(item?.request ?? item);
  return found;
}

/** Parse every request file in a collection. Unparseable files are recorded, never thrown. */
export function readRequests(collectionRoot, format) {
  const items = [];

  for (const file of requestFiles(collectionRoot, format)) {
    const relPath = rel(collectionRoot, file);
    let text;
    try {
      text = readFileSync(file, 'utf8');
    } catch (err) {
      items.push({ path: relPath, ok: false, error: `unreadable: ${err.message}` });
      continue;
    }

    let parsed;
    try {
      // parseStrict, so the reader's own code frame - which it writes to STDOUT, quoting the
      // offending line of the file - cannot land in the middle of `doctor --json`.
      parsed = parseStrict('request', text, { format });
    } catch (err) {
      items.push({ path: relPath, ok: false, error: `unparseable: ${err.message.split('\n')[0]}`, text });
      continue;
    }

    const req = parsed?.request ?? {};
    const method = String(req.method ?? 'GET').toUpperCase();
    const url = req.url ?? '';

    items.push({
      path: relPath,
      ok: true,
      name: parsed?.name ?? null,
      type: parsed?.type ?? null,
      seq: Number.isFinite(Number(parsed?.seq)) ? Number(parsed.seq) : null,
      tags: parsed?.tags ?? [],
      method,
      url,
      endpointKey: endpointKey(method, url),
      authMode: req.auth?.mode ?? null,
      bodyMode: req.body?.mode ?? null,
      paramCount: Array.isArray(req.params) ? req.params.length : 0,
      variables: [...referencedVariables(parsed)].sort(),
      text,
      parsed,
    });
  }

  return items;
}

/** Parse every environment file, separating declared secret names from plain values. */
export function readEnvironments(collectionRoot, format) {
  const envs = [];

  for (const file of environmentFiles(collectionRoot, format)) {
    const relPath = rel(collectionRoot, file);
    let text;
    try {
      text = readFileSync(file, 'utf8');
    } catch (err) {
      envs.push({ path: relPath, ok: false, error: `unreadable: ${err.message}` });
      continue;
    }
    try {
      const parsed = parseStrict('environment', text, { format });
      const variables = parsed.variables;
      envs.push({
        path: relPath,
        ok: true,
        name: parsed?.name ?? relPath.replace(/^environments\//, '').replace(/\.(bru|yml)$/, ''),
        plain: variables.filter((v) => !v.secret).map((v) => v.name).sort(),
        secrets: variables.filter((v) => v.secret).map((v) => v.name).sort(),
        declared: variables.map((v) => v.name).sort(),
        text,
      });
    } catch (err) {
      envs.push({ path: relPath, ok: false, error: `unparseable: ${err.message.split('\n')[0]}`, text });
    }
  }

  return envs;
}

/** Collection root/config and folder files, parsed far enough to find inherited variables. */
function readSupportFiles(collectionRoot, format) {
  const items = [];
  for (const file of supportFiles(collectionRoot, format)) {
    const path = rel(collectionRoot, file);
    let text;
    try {
      text = readFileSync(file, 'utf8');
    } catch (err) {
      items.push({ path, ok: false, error: `unreadable: ${err.message}` });
      continue;
    }
    try {
      const name = basename(file);
      // Through parseStrict, like every other reader here. The bru collection/folder readers report a
      // syntax error by returning a rejected PROMISE rather than throwing, and the yml ones return a
      // plausible empty object - so a direct call could not see a failure at all, and would record an
      // unparseable support file as a successfully parsed empty one.
      const parsed = name === 'bruno.json'
        ? JSON.parse(text)
        : name === YML_ROOT || name === 'collection.bru'
          ? parseStrict('root', text, { format })
          : parseStrict('folder', text, { format });
      items.push({ path, ok: true, parsed, text });
    } catch (err) {
      items.push({ path, ok: false, error: `unparseable: ${err.message.split('\n')[0]}`, text });
    }
  }
  return items;
}

/**
 * Full inventory plus the diagnostics that matter before anything is written.
 */
export function buildInventory(collection, { placeholders = [] } = {}) {
  const { root, format } = collection;
  const requests = readRequests(root, format);
  const environments = readEnvironments(root, format);
  const support = readSupportFiles(root, format);

  const parsed = requests.filter((r) => r.ok);

  // Duplicate endpoint identity: legitimate (a dry-run variant of the same call), but it must be
  // surfaced, because it means one endpointKey has more than one file claiming it.
  const byKey = new Map();
  for (const r of parsed) {
    if (!byKey.has(r.endpointKey)) byKey.set(r.endpointKey, []);
    byKey.get(r.endpointKey).push(r.path);
  }
  const duplicateKeys = [...byKey.entries()]
    .filter(([, paths]) => paths.length > 1)
    .map(([key, paths]) => ({ endpointKey: key, paths }));

  // Duplicate seq within a directory makes ordering ambiguous in the Bruno sidebar.
  const seqByDir = new Map();
  for (const r of parsed) {
    if (r.seq === null) continue;
    const dir = r.path.includes('/') ? r.path.slice(0, r.path.lastIndexOf('/')) : '';
    const map = seqByDir.get(dir) ?? new Map();
    if (!map.has(r.seq)) map.set(r.seq, []);
    map.get(r.seq).push(r.path);
    seqByDir.set(dir, map);
  }
  const duplicateSeq = [];
  for (const [dir, map] of seqByDir) {
    for (const [seq, paths] of map) {
      if (paths.length > 1) duplicateSeq.push({ dir: dir || '.', seq, paths });
    }
  }

  // Variables a request needs but no environment declares. This is the gap that makes people
  // paste a literal key into a request file.
  const declared = new Set(environments.filter((e) => e.ok).flatMap((e) => e.declared));
  const referenced = new Map();
  const recordReference = (name, path) => {
    if (!referenced.has(name)) referenced.set(name, []);
    const paths = referenced.get(name);
    if (!paths.includes(path)) paths.push(path);
  };
  for (const r of parsed) {
    for (const v of r.variables) recordReference(v, r.path);
  }
  // A collection-level auth token or folder-level credential is inherited by requests even though
  // it never appears in a request file. Ignoring support files made doctor call such a collection
  // healthy while Bruno resolved the credential to an empty value.
  for (const item of support.filter((f) => f.ok)) {
    for (const v of referencedVariables(item.parsed)) recordReference(v, item.path);
  }
  const undeclared = [...referenced.entries()]
    .filter(([name]) => !declared.has(name))
    .filter(([name]) => !name.startsWith('$')) // {{$guid}} and friends are Bruno built-ins
    .map(([name, paths]) => ({ name, paths }))
    .sort((a, b) => byCodepoint(a.name, b.name));

  // Secret scan over every file the collection owns, including the root and environments.
  const secretFindings = [];
  for (const f of [...requests, ...environments, ...support]) {
    if (!f.text) continue;
    for (const finding of scanText(f.text, { placeholders })) {
      secretFindings.push({ path: f.path, ...finding });
    }
  }

  return {
    root,
    format,
    name: collection.name ?? null,
    requests,
    environments,
    counts: {
      requests: requests.length,
      parsed: parsed.length,
      unparseable: requests.length - parsed.length,
      environments: environments.length,
    },
    duplicateKeys,
    duplicateSeq,
    undeclaredVariables: undeclared,
    secretFindings,
  };
}
