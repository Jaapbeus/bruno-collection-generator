// Collection discovery and format detection.
//
// A collection is identified by its root file, exactly as Bruno does it:
//   opencollection.yml  -> the OpenCollection YAML format ('yml'); there is no bruno.json
//   bruno.json          -> the .bru format ('bru'), with collection.bru alongside
// The format of an existing collection is never overridden: we match what is there.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { byCodepoint } from './paths.mjs';

export const YML_ROOT = 'opencollection.yml';
export const BRU_ROOT = 'bruno.json';

/** Directories never worth walking. */
export const SKIP_DIRS = new Set([
  'node_modules', '.git', '.svn', '.hg', 'obj', 'bin', 'dist', 'build', 'out',
  'target', 'vendor', '.vs', '.idea', '.venv', 'venv', '__pycache__', '.next',
  '.nuxt', '.angular', 'coverage', 'TestResults', '.terraform', '.bruno-gen',
  // Scratch space for this repository's own tests: walking it makes probe report dozens of
  // throwaway collections.
  '.tmp',
  // Agent and editor working directories. `.claude/worktrees/` in particular holds git worktrees -
  // whole copies of the repository - so every project inside appears again per worktree. Measured on
  // a real repository: two APIs were reported as eight plausible projects across four worktrees, and
  // "which of these eight?" is an unanswerable question about a repository that has two.
  '.claude', '.worktrees', 'worktrees', '.cursor', '.vscode-test',
]);

/** Depth-first walk that skips SKIP_DIRS. Yields absolute directory paths, root first. */
export function* walkDirs(root, { maxDepth = 8 } = {}) {
  const stack = [[root, 0]];
  while (stack.length) {
    const [dir, depth] = stack.pop();
    yield dir;
    if (depth >= maxDepth) continue;
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    // readdir order is filesystem-defined. Push in reverse code-point order because this is a LIFO
    // stack, yielding the same depth-first traversal on NTFS, APFS and ext4.
    entries.sort((a, b) => byCodepoint(a.name, b.name));
    for (const e of entries.reverse()) {
      if (!e.isDirectory()) continue;
      if (SKIP_DIRS.has(e.name)) continue;
      stack.push([join(dir, e.name), depth + 1]);
    }
  }
}

/**
 * Find every Bruno collection root under `repoRoot`.
 * @returns {Array<{root: string, format: 'bru'|'yml', rootFile: string, name: string|null}>}
 */
export function findCollections(repoRoot, { maxDepth = 8 } = {}) {
  const found = [];

  for (const dir of walkDirs(repoRoot, { maxDepth })) {
    const yml = join(dir, YML_ROOT);
    if (existsSync(yml) && statSync(yml).isFile()) {
      found.push({ root: dir, format: 'yml', rootFile: yml, name: readYmlName(yml) });
      continue; // one root file per directory wins; yml takes precedence if both exist
    }
    const bru = join(dir, BRU_ROOT);
    if (existsSync(bru) && statSync(bru).isFile()) {
      const meta = readBrunoJson(bru);
      if (meta) found.push({ root: dir, format: 'bru', rootFile: bru, name: meta.name ?? null });
    }
  }

  // Shallowest first, then alphabetical: deterministic regardless of filesystem order.
  found.sort((a, b) => {
    const da = a.root.split(sep).length;
    const db = b.root.split(sep).length;
    return da - db || byCodepoint(a.root, b.root);
  });
  return found;
}

/** `bruno.json` must declare a collection; anything else is some other tool's file. */
function readBrunoJson(path) {
  try {
    const j = JSON.parse(readFileSync(path, 'utf8'));
    if (j && (j.type === 'collection' || j.version !== undefined)) return j;
    return null;
  } catch {
    return null;
  }
}

/** Cheap name read; the YAML is parsed properly later by filestore. */
function readYmlName(path) {
  try {
    const text = readFileSync(path, 'utf8');
    const m = /^\s{2}name:\s*(.+)$/m.exec(text) ?? /^name:\s*(.+)$/m.exec(text);
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
  } catch {
    return null;
  }
}

/**
 * Choose the collection to operate on.
 *
 * An existing collection is the output target and the inventory - never a candidate competing
 * with the source code for "which project is this". Treating it as one made every already
 * generated repository ambiguous. So: if exactly one exists, it wins outright.
 */
export function selectCollection(collections, { configuredRoot = null } = {}) {
  if (configuredRoot) {
    const match = collections.find((c) => c.root === configuredRoot);
    if (match) return { collection: match, reason: 'configured output_dir' };
    return { collection: null, reason: 'configured output_dir has no collection yet' };
  }
  if (collections.length === 0) return { collection: null, reason: 'no collection found' };
  if (collections.length === 1) return { collection: collections[0], reason: 'the only collection in the repository' };
  return {
    collection: null,
    reason: `${collections.length} collections found`,
    ambiguous: collections,
  };
}

/** Request files for a format, excluding root, folder and environment files. */
export function requestFiles(collectionRoot, format) {
  const ext = format === 'yml' ? '.yml' : '.bru';
  const out = [];
  for (const dir of walkDirs(collectionRoot, { maxDepth: 12 })) {
    // environments/ holds environment files, not requests
    const rel = relative(collectionRoot, dir).split(sep).join('/');
    if (rel === 'environments' || rel.startsWith('environments/')) continue;
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      if (!e.isFile() || !e.name.endsWith(ext)) continue;
      if (e.name === YML_ROOT) continue;
      if (e.name === `folder${ext}`) continue;
      if (format === 'bru' && e.name === 'collection.bru') continue;
      out.push(join(dir, e.name));
    }
  }
  return out.sort((a, b) => byCodepoint(a, b));
}

/** Environment files for a format. */
export function environmentFiles(collectionRoot, format) {
  const dir = join(collectionRoot, 'environments');
  if (!existsSync(dir)) return [];
  const ext = format === 'yml' ? '.yml' : '.bru';
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.endsWith(ext))
      .map((e) => join(dir, e.name))
      .sort((a, b) => byCodepoint(a, b));
  } catch {
    return [];
  }
}

/** Root/config and folder files that are part of a collection but are not requests/environments. */
export function supportFiles(collectionRoot, format) {
  const ext = format === 'yml' ? '.yml' : '.bru';
  const out = [];
  const roots = format === 'yml' ? [YML_ROOT] : ['collection.bru', BRU_ROOT];
  for (const name of roots) {
    const file = join(collectionRoot, name);
    try {
      if (statSync(file).isFile()) out.push(file);
    } catch {
      // Missing or concurrently removed; the inventory reports what was stable enough to read.
    }
  }
  for (const dir of walkDirs(collectionRoot, { maxDepth: 12 })) {
    const folder = join(dir, `folder${ext}`);
    try {
      if (statSync(folder).isFile()) out.push(folder);
    } catch {
      // Same bounded best-effort rule as request/environment discovery.
    }
  }
  return out.sort((a, b) => byCodepoint(a, b));
}
