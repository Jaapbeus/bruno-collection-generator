// The lockfile: who owns which file.
//
// It is committed, and it is the only reason regeneration can be safe. Without it there is no way
// to tell "the generator wrote this and may update it" from "a human edited this, leave it alone".

import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { assertPortableRelPath, byCodepoint, collisionKey } from './paths.mjs';
import { writeFileAtomic } from './atomic-write.mjs';

export const LOCK_DIR = '.bruno-gen';
export const LOCK_FILE = 'lock.json';
export const LOCKFILE_VERSION = 1;

/** Marker recorded for files adopted from a collection this tool did not create. */
export class LockfileError extends Error {
  constructor(message) {
    super(message);
    this.name = 'LockfileError';
  }
}

export const ADOPTED = 'adopted';

/**
 * Content hash, insensitive to line endings and trailing newlines.
 *
 * Hashing raw bytes looks more rigorous and is wrong: with core.autocrlf=true a fresh Windows
 * clone materialises CRLF, every hash then mismatches, every file is classified as hand-edited,
 * and the collection silently freezes. Verified on a real repository where 8 of 19 collection
 * files were checked out with mixed endings.
 */
export const canonicalHash = (content) =>
  createHash('sha256')
    .update(String(content).replace(/\r/g, '').replace(/\n+$/, ''), 'utf8')
    .digest('hex');

export const lockPath = (collectionRoot) => join(collectionRoot, LOCK_DIR, LOCK_FILE);

const BUCKETS = ['requests', 'folders', 'environments', 'config'];
const plainObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

/** The lockfile is committed input. Reject malformed ownership metadata before it can authorise a write. */
function validateLock(lock) {
  const problems = [];
  const seen = new Map();
  for (const bucket of BUCKETS) {
    const entries = lock[bucket];
    if (!plainObject(entries)) {
      problems.push(`${bucket} must be an object`);
      continue;
    }
    for (const [path, entry] of Object.entries(entries)) {
      try {
        assertPortableRelPath(path, { label: bucket });
      } catch (err) {
        problems.push(err.message);
        continue;
      }
      const key = collisionKey(path);
      const previous = seen.get(key);
      if (previous) problems.push(`${bucket}.${path} collides with ${previous}`);
      else seen.set(key, `${bucket}.${path}`);
      if (!plainObject(entry) || typeof entry.hash !== 'string' || !entry.hash) {
        problems.push(`${bucket}.${path} must contain a non-empty hash`);
      }
    }
  }
  if (!Array.isArray(lock.adopted ?? [])) problems.push('adopted must be an array');
  if (problems.length) throw new Error(`invalid ownership metadata: ${problems.join('; ')}`);
}

export function emptyLock({ format, outputDir, generatorVersion, libraries }) {
  return {
    lockfileVersion: LOCKFILE_VERSION,
    generator: 'bruno-gen-collection',
    generatorVersion,
    format,
    outputDir,
    // Recorded so a library upgrade that reformats files can be told apart from a human edit.
    emittedWith: libraries ?? {},
    requests: {},
    folders: {},
    environments: {},
    config: {},
    adopted: [],
  };
}

export function readLock(collectionRoot) {
  const path = lockPath(collectionRoot);
  if (!existsSync(path)) return null;
  try {
    const lock = JSON.parse(readFileSync(path, 'utf8'));
    if (lock?.lockfileVersion !== LOCKFILE_VERSION) {
      throw new Error(
        `lockfile version ${lock?.lockfileVersion} is not supported (expected ${LOCKFILE_VERSION})`,
      );
    }
    validateLock(lock);
    return lock;
  } catch (err) {
    // Named, with the way out. A truncated or hand-edited lockfile - a bad merge, an interrupted
    // write - otherwise surfaced as a raw JSON stack trace, which says nothing about which file
    // caused it or what to do next.
    throw new LockfileError(
      `cannot read ${path}: ${err.message}\n` +
        'The lockfile records which files are yours. If it is damaged, delete it and run `adopt`:\n' +
        're-recording every existing file as yours overwrites nothing.',
    );
  }
}

/**
 * Serialise deterministically: sorted keys throughout, so the lockfile never churns just because
 * an object was built in a different order.
 */
export function serialiseLock(lock) {
  const sortObject = (o) =>
    Object.fromEntries(
      Object.entries(o ?? {})
        .sort(([a], [b]) => byCodepoint(a, b))
        .map(([k, v]) => [k, v && typeof v === 'object' && !Array.isArray(v) ? sortObject(v) : v]),
    );
  const ordered = {
    lockfileVersion: lock.lockfileVersion,
    generator: lock.generator,
    generatorVersion: lock.generatorVersion,
    format: lock.format,
    outputDir: lock.outputDir,
    emittedWith: sortObject(lock.emittedWith),
    config: sortObject(lock.config),
    folders: sortObject(lock.folders),
    requests: sortObject(lock.requests),
    environments: sortObject(lock.environments),
    adopted: [...(lock.adopted ?? [])].sort(),
  };
  return `${JSON.stringify(ordered, null, 2)}\n`;
}

/**
 * Write the lockfile only if its content changed.
 *
 * "Rerunning writes zero files" and "the lockfile is written last, every time" cannot both be
 * true; the check-then-skip resolves it in favour of the zero-diff guarantee.
 *
 * @returns {'written'|'unchanged'}
 */
export function writeLock(collectionRoot, lock) {
  const path = lockPath(collectionRoot);
  const content = serialiseLock(lock);
  if (existsSync(path) && readFileSync(path, 'utf8') === content) return 'unchanged';
  // Temp file plus rename, so a crash cannot leave a half-written lockfile claiming files it
  // never wrote. The shared helper also refuses a pre-planted temporary symlink.
  writeFileAtomic(path, content);
  return 'written';
}

/**
 * Frozen file names and seq values for the emitter.
 *
 * `seqs` is keyed by endpointKey, which answers "what number does this endpoint already have". It
 * cannot answer "which numbers are already taken in this directory", and that is a different
 * question: an adopted sibling is a real file with a real seq and is usually *not* in the model, so
 * a new endpoint numbered from the model alone lands straight on top of it. On a migrated collection
 * that produces two files with `seq: 1`, which `doctor` then reports as an ambiguous sidebar order.
 *
 * `takenByDir` therefore records every seq known per directory, including entries the model will
 * never mention - variants included, since they occupy a slot in the sidebar like anything else.
 */
export function frozenFrom(lock) {
  const fileNames = {};
  const seqs = {};
  const takenByDir = {};

  for (const [relPath, entry] of Object.entries(lock?.requests ?? {})) {
    if (!entry?.endpointKey) continue;

    if (Number.isFinite(entry.seq)) {
      const slash = relPath.lastIndexOf('/');
      const dir = slash === -1 ? '' : relPath.slice(0, slash);
      (takenByDir[dir] ??= []).push(entry.seq);
    }

    // The first entry for a key wins: a variant never steals the owner's name or seq.
    if (entry.variant) continue;
    if (entry.fileName && fileNames[entry.endpointKey] === undefined) {
      fileNames[entry.endpointKey] = entry.fileName;
    }
    if (Number.isFinite(entry.seq) && seqs[entry.endpointKey] === undefined) {
      seqs[entry.endpointKey] = entry.seq;
    }
  }
  return { fileNames, seqs, takenByDir };
}

// `synthesizedFrom` used to live here, promising that a rerun replays previously synthesized values
// instead of reinventing them. It read `entry.synthesized`, which `apply` never writes - it records a
// fresh entry with only kind/hash/endpointKey/seq/fileName - so it always returned `{}` and had no
// callers. Removed rather than left in place: a documented promise the code does not keep is worse
// than no promise, and it is harmless today only because synthesis is constant. If a non-constant
// synthesized value is ever introduced, the replay has to be built for real, and `apply` has to
// write the field.
