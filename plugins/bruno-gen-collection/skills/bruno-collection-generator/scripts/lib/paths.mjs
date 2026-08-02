// Filesystem safety. One function for folder segments and file names alike, because a folder
// name derived from an OpenAPI tag or a model's guess is exactly as untrusted as a file name.

import { createHash } from 'node:crypto';
import { realpathSync, existsSync } from 'node:fs';
import { resolve, relative, isAbsolute, sep, basename } from 'node:path';

/**
 * Order two strings by code point, never by locale.
 *
 * `String.prototype.localeCompare` sorts using the runtime's default locale, which Node takes from
 * the environment. That makes it the wrong tool for anything that decides output: the same model,
 * emitted on two machines with different locales, produces a different order - and because `seq` is
 * assigned in emission order, different `seq` numbers and therefore different bytes. The
 * "deterministic output, zero-diff rerun" property does not survive it.
 *
 * The disagreement is not theoretical: comparing 'a' with 'B' by locale gives -1, while by code point
 * 'a' sorts after 'B' (0x61 > 0x42);
 * `'Local'` vs `'local'` and `'x-api-key'` vs `'X-Api-Key'` also invert. Those are exactly the pairs
 * this codebase sorts.
 *
 * `toLowerCase()` is safe by contrast: it is locale-independent by specification. `toLocaleLowerCase`
 * is not, and is used nowhere.
 */
export const byCodepoint = (a, b) => {
  const x = String(a ?? '');
  const y = String(b ?? '');
  return x < y ? -1 : x > y ? 1 : 0;
};

export const MAX_SEGMENT = 60;
export const MAX_PATH = 200; // conservative: Windows MAX_PATH is 260 including the repo prefix

// Reserved DOS device names. Still reserved on modern Windows, with or without an extension.
const WINDOWS_RESERVED = new Set([
  'con', 'prn', 'aux', 'nul',
  ...Array.from({ length: 9 }, (_, i) => `com${i + 1}`),
  ...Array.from({ length: 9 }, (_, i) => `lpt${i + 1}`),
]);

export class PathSafetyError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PathSafetyError';
  }
}

const short = (key) => createHash('sha256').update(key, 'utf8').digest('hex').slice(0, 6);

/**
 * Absolute on ANY platform, not just this one.
 *
 * `path.isAbsolute` is platform-specific: on POSIX it returns false for `C:\Windows\system32` and
 * for `\\server\share`, because a backslash is an ordinary character there. Deciding containment
 * on the host's own rules means the same untrusted input is rejected on Windows and accepted on
 * Linux, so the check has to be explicit.
 */
export function isAbsoluteAnyPlatform(value) {
  const s = String(value ?? '');
  if (s.startsWith('/') || s.startsWith('\\')) return true; // POSIX root, or a Windows root/UNC
  if (/^[A-Za-z]:[\\/]?/.test(s)) return true; // drive-letter path, with or without a separator
  return isAbsolute(s);
}

/**
 * Turn arbitrary text into one safe path segment. Deterministic: the same input always
 * produces the same output, which is what keeps generated file names stable across runs.
 */
export function safeSegment(input, { key = null, preserveCase = false } = {}) {
  const text = String(input ?? '').normalize('NFC');

  // `preserveCase` is for names the user addresses by name - environment files above all. Folding an
  // environment called `Local` to `local.bru` renames it, and on a case-sensitive filesystem it
  // becomes a *second* file beside the user's own `Local.bru` while on Windows and macOS the two
  // collide and it silently works. Same input, different output per platform, which is exactly what
  // the determinism this tool sells rules out. Case is folded for *comparison* only - see
  // `collisionKey` - and that was always the intent.
  let slug = (preserveCase ? text : text.toLowerCase())
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!slug) slug = key ? `item-${short(key)}` : 'item';

  // A trailing dot or space is silently stripped by Windows, which would make two distinct
  // names collide on disk. Neither can survive the slug above, but assert rather than assume.
  slug = slug.replace(/[. ]+$/, '');

  // Reserved names are reserved regardless of case: `CON`, `Con` and `con` are all the device.
  if (WINDOWS_RESERVED.has(slug.toLowerCase())) slug = `${slug}-request`;

  if (slug.length > MAX_SEGMENT) {
    // Truncate, but keep determinism and avoid collisions between two long names that share
    // a prefix by appending a hash of the full value.
    slug = `${slug.slice(0, MAX_SEGMENT - 7).replace(/-$/, '')}-${short(key ?? text)}`;
  }

  return slug;
}

/**
 * Case-folded comparison key. Windows and macOS are case-insensitive, so `Widgets` and
 * `widgets` are the same file there and must be treated as a collision everywhere.
 */
export const collisionKey = (segment) => segment.normalize('NFC').toLowerCase();

/** Refuse an existing/lockfile path that cannot represent the same file on all supported OSes. */
export function assertPortableRelPath(value, { label = 'path' } = {}) {
  const path = String(value ?? '');
  if (!path || isAbsoluteAnyPlatform(path) || path.includes('\\')) {
    throw new PathSafetyError(`${label} is not a portable relative path: ${JSON.stringify(path)}`);
  }
  if (path.length > MAX_PATH) throw new PathSafetyError(`${label} is longer than ${MAX_PATH} characters: ${path}`);
  for (const segment of path.split('/')) {
    if (!segment || segment === '.' || segment === '..' || /[<>:"|?*\u0000-\u001f\u007f]/.test(segment)) {
      throw new PathSafetyError(`${label} contains an unsafe path segment: ${JSON.stringify(segment)}`);
    }
    if (/[. ]$/.test(segment)) {
      throw new PathSafetyError(`${label} has a trailing dot or space: ${JSON.stringify(segment)}`);
    }
    const base = segment.split('.')[0].toLowerCase();
    if (WINDOWS_RESERVED.has(base)) {
      throw new PathSafetyError(`${label} uses the reserved Windows name: ${JSON.stringify(segment)}`);
    }
  }
  return path;
}

/**
 * Build a repo-relative path from untrusted segments. Rejects anything that could escape.
 */
export function safeRelPath(segments, { key = null } = {}) {
  const list = (Array.isArray(segments) ? segments : [segments]).filter(
    (s) => s !== null && s !== undefined && String(s) !== '',
  );

  for (const raw of list) {
    const s = String(raw);
    if (isAbsoluteAnyPlatform(s)) throw new PathSafetyError(`absolute path segment rejected: ${s}`);
    if (s === '..' || s.split(/[\\/]/).includes('..')) {
      throw new PathSafetyError(`parent-directory segment rejected: ${s}`);
    }
    if (s.includes('\0')) throw new PathSafetyError('null byte in path segment');
  }

  const parts = list.map((s) => safeSegment(s, { key }));
  const joined = parts.join('/');
  if (joined.length > MAX_PATH) {
    throw new PathSafetyError(`path too long (${joined.length} > ${MAX_PATH}): ${joined}`);
  }
  return joined;
}

/**
 * Assert `target` really is inside `root`, after resolving symlinks and junctions on whatever
 * part of the path already exists. Checking the string alone is not enough: a symlinked
 * subdirectory passes a prefix test and still writes outside.
 */
export function assertInside(root, target, { label = 'path' } = {}) {
  const realRoot = existsSync(root) ? realpathSync(resolve(root)) : resolve(root);

  // Walk up to the nearest existing ancestor so a not-yet-created file can be checked too.
  //
  // The segment comes from `basename`, not from slicing at `parent.length + 1`. That slice assumed
  // the parent never ends with a separator, which is false at a filesystem root: with a parent of
  // `C:\` or `/` the `+ 1` ate the first character of the segment, and this is the one function that
  // owns containment - it produced both false rejections (naming a path the user never wrote) and,
  // worse, a check that flipped to ACCEPT.
  let probe = resolve(target);
  const tail = [];
  while (!existsSync(probe)) {
    const parent = resolve(probe, '..');
    if (parent === probe) break;
    tail.unshift(basename(probe));
    probe = parent;
  }
  const realTarget = resolve(realpathSync(probe), ...tail);

  const rel = relative(realRoot, realTarget);
  if (rel === '' || rel === '.') return realTarget;
  if (rel.startsWith('..') || isAbsolute(rel)) {
    throw new PathSafetyError(
      `${label} resolves outside the collection root:\n  root:   ${realRoot}\n  target: ${realTarget}`,
    );
  }
  return realTarget;
}

/**
 * Validate a user-configured output directory. Config comes from the repository under
 * inspection, so it is untrusted: repo-relative, no `..`, and inside the repo. A hard error,
 * never a confirmation prompt.
 */
export function resolveOutputDir(repoRoot, configured) {
  const value = String(configured ?? '').trim();
  if (!value) throw new PathSafetyError('output directory is empty');
  if (isAbsoluteAnyPlatform(value)) {
    throw new PathSafetyError(`output_dir must be repo-relative, got an absolute path: ${value}`);
  }
  if (value.split(/[\\/]/).includes('..')) {
    throw new PathSafetyError(`output_dir must not contain "..": ${value}`);
  }
  const target = resolve(repoRoot, value);
  assertInside(repoRoot, target, { label: 'output_dir' });
  return target;
}

/** POSIX-separator path relative to a root — the form used for every lockfile key. */
export const lockKey = (root, absolute) =>
  relative(resolve(root), resolve(absolute)).split(sep).join('/');

/**
 * Assign a unique segment within a set of already-used names, case-folded. Appends a stable
 * 6-hex suffix rather than an ordinal, so inserting a new sibling never renumbers the others.
 */
export function uniqueSegment(segment, used, key) {
  if (!used.has(collisionKey(segment))) {
    used.add(collisionKey(segment));
    return segment;
  }

  // More than two siblings may collapse to the same slug. The old one-shot suffix gave the second
  // one `<slug>-<hash>` and handed that exact path to the third as well whenever their stable key was
  // shared (three declared variants of one endpoint are the ordinary example). Keep probing stable
  // hashes until the comparison key is genuinely free.
  const seed = String(key ?? segment);
  for (let attempt = 0; ; attempt++) {
    const suffix = short(attempt === 0 ? seed : `${seed}:${attempt}`);
    const stem = segment.slice(0, MAX_SEGMENT - 7).replace(/-$/, '');
    const candidate = `${stem}-${suffix}`;
    if (used.has(collisionKey(candidate))) continue;
    used.add(collisionKey(candidate));
    return candidate;
  }
}
