// The merge decision: for every planned and existing file, what happens to it.
//
// This is the whole safety story, so it is a pure function over (planned files, disk, lockfile)
// with no writes. `apply` executes the plan; `plan` prints it.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { canonicalHash, ADOPTED } from './lockfile.mjs';
import { requestFiles, environmentFiles, YML_ROOT } from './format.mjs';
import { byCodepoint, collisionKey, assertInside } from './paths.mjs';
import { readRequests } from './inventory.mjs';
import { parseStrict } from './deps.mjs';

/**
 * Read a file, or null when it cannot be read.
 *
 * `inventory` guards every read; this module did not, so a directory sitting where a planned request
 * file goes - or a file Windows has locked - killed `plan` and `apply` with a raw EISDIR/EPERM stack
 * instead of a diagnostic. `plan` in particular advertises that it writes nothing and cannot fail.
 */
function readText(abs) {
  try {
    return readFileSync(abs, 'utf8');
  } catch {
    return null;
  }
}

/**
 * Variable names an environment file already declares, or null when the file cannot be trusted.
 *
 * Parsed, never string-matched: `text.includes('apiKey')` counted `apiKeyId` - or the word in a
 * comment - as a declaration, so the secret was never added and every request referencing it sent an
 * empty value.
 *
 * Returning null for an unreadable file matters more than it looks. The bru reader reports a syntax
 * error by returning a rejected promise, so reading its result as data made an unparseable
 * environment look EMPTY - and the carve-out then "added the missing secrets" by rewriting the
 * user's file down to nothing but secret names. `parseStrict` turns that into a throw; null here
 * means leave the file alone, and say so.
 */
function declaredVariableNames(abs, format) {
  const text = readText(abs);
  if (text === null) return null;
  try {
    const env = parseStrict('environment', text, { format });
    const names = new Set(env.variables.map((v) => v?.name).filter(Boolean));

    // An environment that genuinely declares NO variables is a normal file, and the carve-out must
    // still be able to add a secret name to it. Refusing on "zero variables" alone broke that: an
    // ordinary `vars { }` or `variables: []` silently stopped getting its secrets declared.
    //
    // The one case still worth refusing is the yml reader's coercion: handed any mapping it does not
    // understand it returns a plausible EMPTY environment rather than failing, so a file with content
    // and no `variables` key at all is not an environment we can safely rewrite. bru needs no such
    // test - parseStrict throws there.
    if (names.size === 0 && format === 'yml' && text.trim() !== '' && !/^\s*variables\s*:/m.test(text)) {
      return null;
    }
    return names;
  } catch {
    return null;
  }
}

export const STATUS = {
  CREATE: 'create',
  UPDATED: 'updated',
  UNCHANGED: 'unchanged',
  KEPT: 'kept',
  RESTORED: 'restored',
  MOVED: 'moved',
  ORPHAN: 'orphan',
  UNMANAGED: 'unmanaged',
  CREATE_ONCE_EXISTS: 'exists',
  SECRETS_ADDED: 'secrets-added',
};

const rel = (root, p) => relative(root, p).split(sep).join('/');

/** Every collection file on disk, relative to the collection root. */
function existingFiles(collectionRoot, format) {
  if (!existsSync(collectionRoot)) return [];
  const out = new Set();
  for (const f of requestFiles(collectionRoot, format)) out.add(rel(collectionRoot, f));
  for (const f of environmentFiles(collectionRoot, format)) out.add(rel(collectionRoot, f));
  const ext = format === 'yml' ? 'yml' : 'bru';
  for (const candidate of [
    format === 'yml' ? YML_ROOT : 'collection.bru',
    ...(format === 'bru' ? ['bruno.json'] : []),
  ]) {
    if (existsSync(join(collectionRoot, candidate))) out.add(candidate);
  }
  // folder files
  const walkFolders = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      if (e.name === 'environments' || e.name === '.bruno-gen') continue;
      const f = join(dir, e.name, `folder.${ext}`);
      if (existsSync(f)) out.add(rel(collectionRoot, f));
      walkFolders(join(dir, e.name));
    }
  };
  if (statSync(collectionRoot).isDirectory()) walkFolders(collectionRoot);
  return [...out].sort((a, b) => byCodepoint(a, b));
}

/**
 * Decide what happens to every file.
 *
 * @returns {{decisions: object[], summary: object, refusal: string|null}}
 */
export function planMerge({ collectionRoot, format, planned, lock, secretsCarveOut = true }) {
  const decisions = [];
  const onDisk = new Set(existingFiles(collectionRoot, format));
  const lockRequests = lock?.requests ?? {};
  const lockEnvs = lock?.environments ?? {};
  const lockFolders = lock?.folders ?? {};
  const lockConfig = lock?.config ?? {};
  const lockAll = { ...lockRequests, ...lockEnvs, ...lockFolders, ...lockConfig };

  // Refuse to write beside a collection this tool has never seen. Without a lockfile there is no
  // way to know which files are safe to touch, and guessing is how the previous implementation
  // destroyed people's work.
  if (!lock && onDisk.size > 0) {
    return {
      decisions: [],
      summary: {},
      refusal:
        `A collection already exists at ${collectionRoot} but there is no ${'.bruno-gen/lock.json'}.\n` +
        `Run \`adopt\` first: it records every existing file as yours, so the next run adds only what is\n` +
        `missing and changes nothing you wrote.`,
    };
  }

  const plannedByCollision = new Map();
  for (const file of planned) {
    const key = collisionKey(file.relPath);
    const previous = plannedByCollision.get(key);
    if (previous) {
      return {
        decisions: [],
        summary: {},
        refusal:
          `The model produces two paths that are one file on Windows/macOS:\n` +
          `  ${previous.relPath}\n  ${file.relPath}\n` +
          'Give the endpoints, folders or environments distinct names. Nothing was written.',
      };
    }
    plannedByCollision.set(key, file);
  }

  // Index existing request files by endpointKey so a file a human renamed can be recognised
  // rather than duplicated.
  const diskByEndpointKey = new Map();
  for (const request of readRequests(collectionRoot, format).filter((r) => r.ok)) {
    if (!diskByEndpointKey.has(request.endpointKey)) diskByEndpointKey.set(request.endpointKey, []);
    diskByEndpointKey.get(request.endpointKey).push(request.path);
  }

  // Where the model's spelling of a name and the spelling on disk differ only by case or unicode
  // form, they are ONE file on Windows and macOS. Planning under the model's spelling and writing
  // there renames the user's file (`Dev.bru` became `dev.bru`) and leaves the lockfile with a stale
  // entry under the old name that every later run reports as "yours, never generated". Act on the
  // spelling that is on disk.
  const indexSpelling = (paths, label) => {
    const index = new Map();
    for (const path of paths) {
      const key = collisionKey(path);
      const previous = index.get(key);
      if (previous && previous !== path) {
        return {
          refusal:
            `The ${label} contains two paths that are one file on Windows/macOS:\n` +
            `  ${previous}\n  ${path}\n` +
            'Rename one before running apply. Nothing was written.',
        };
      }
      index.set(key, path);
    }
    return { index };
  };

  const diskIndex = indexSpelling(onDisk, 'collection');
  if (diskIndex.refusal) return { decisions: [], summary: {}, refusal: diskIndex.refusal };
  const lockIndex = indexSpelling(Object.keys(lockAll), 'lockfile');
  if (lockIndex.refusal) return { decisions: [], summary: {}, refusal: lockIndex.refusal };
  const diskSpelling = diskIndex.index;
  const lockSpelling = lockIndex.index;

  for (const file of planned) {
    const { content, kind, createOnce } = file;
    const key = collisionKey(file.relPath);
    const relPath = diskSpelling.get(key) ?? lockSpelling.get(key) ?? file.relPath;
    const abs = join(collectionRoot, relPath);
    const lockedRelPath = lockSpelling.get(key);
    const lockEntry = lockedRelPath ? lockAll[lockedRelPath] : undefined;
    const exists = existsSync(abs);

    // create-once files (bruno.json, environments) are never rewritten: their values are the
    // user's. The one carve-out is appending missing secret NAMES.
    if (createOnce) {
      if (!exists) {
        decisions.push({ relPath, status: STATUS.CREATE, content, kind });
        continue;
      }
      if (kind === 'environment' && secretsCarveOut && file.secretNames?.length) {
        // Compare against the PARSED variable names, which is what `apply` already does when it
        // writes them. A raw `current.includes(name)` treated `apiKey` as already declared because
        // the file happened to contain `apiKeyId` - or the word `masterKey` in a comment - so the
        // secret was never added and every request referencing it sent an empty value.
        const declared = declaredVariableNames(abs, format);
        if (declared === null) {
          // Unreadable, or not a shape we understand: never rewrite it on a guess. Reported rather
          // than skipped silently, or the run claims the environment was left alone as normal when
          // in fact its secret names are still missing.
          decisions.push({
            relPath,
            status: STATUS.KEPT,
            kind,
            reason: 'environment does not parse; run doctor before adding secret names',
          });
          continue;
        }
        const missing = file.secretNames.filter((name) => !declared.has(name));
        if (missing.length) {
          decisions.push({
            relPath,
            status: STATUS.SECRETS_ADDED,
            kind,
            secretNames: missing,
            note: `declare ${missing.join(', ')} as secret (name only, no value)`,
          });
          continue;
        }
      }
      decisions.push({ relPath, status: STATUS.CREATE_ONCE_EXISTS, kind });
      continue;
    }

    if (!exists) {
      // A file the lockfile knows but that is gone: either the user deleted it, or the user
      // renamed it. Look for the same endpoint under another unmanaged name before restoring,
      // or the rename becomes a duplicate.
      if (lockEntry && file.endpointKey) {
        // Every candidate is identity-confirmed: `diskByEndpointKey` is built by PARSING the request
        // files, so a coincidental name can never stand in for the endpoint. What still has to be
        // decided is whether the candidate is this file somewhere else.
        //
        // Two shapes count, and nothing else does. A file keeps its name and changes directory: a
        // move. A file keeps its directory and changes name: a rename. Accepting any unmanaged file
        // that merely holds the same endpoint meant an unmanaged COPY the user kept elsewhere -
        // `scratch/try-it.bru` - was reported as the move target for a request they had simply
        // deleted, so it was never restored and the report said "you moved it to" about a file they
        // had not moved.
        const dirOf = (p) => (p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '');
        const baseOf = (p) => p.slice(p.lastIndexOf('/') + 1);
        const candidates = (diskByEndpointKey.get(file.endpointKey) ?? []).filter(
          (p) => !lockSpelling.has(collisionKey(p)) && !plannedByCollision.has(collisionKey(p)),
        );
        const moved =
          candidates.find((p) => baseOf(p) === baseOf(relPath)) ??
          candidates.find((p) => dirOf(p) === dirOf(relPath));
        if (moved) {
          decisions.push({ relPath, status: STATUS.MOVED, movedTo: moved, kind });
          continue;
        }
        decisions.push({ relPath, status: STATUS.RESTORED, content, kind });
        continue;
      }
      decisions.push({ relPath, status: STATUS.CREATE, content, kind });
      continue;
    }

    // The file exists. Whose is it?
    const current = readText(abs);
    if (current === null) {
      // Something is there but cannot be read - a directory in its place, or a file held open. It
      // is not ours to overwrite on a guess, so treat it as the user's and say so.
      // `note`, not `reason`: that is the field describe() surfaces for UNMANAGED, so this is what
      // makes the sentence reach the user instead of the generic "yours, never generated".
      decisions.push({ relPath, status: STATUS.UNMANAGED, kind, note: 'yours; this run could not read it' });
      continue;
    }
    const currentHash = canonicalHash(current);

    if (!lockEntry) {
      // Present on disk, unknown to the lockfile: hand-authored. Never touched, but still parsed
      // for inventory and secrets elsewhere.
      decisions.push({ relPath, status: STATUS.UNMANAGED, kind });
      continue;
    }

    if (lockEntry.hash === ADOPTED || lockEntry.hash !== currentHash) {
      decisions.push({
        relPath,
        status: STATUS.KEPT,
        kind,
        reason: lockEntry.hash === ADOPTED ? 'adopted as yours' : 'you edited it',
      });
      continue;
    }

    if (canonicalHash(content) === currentHash) {
      decisions.push({ relPath, status: STATUS.UNCHANGED, kind });
      continue;
    }

    decisions.push({ relPath, status: STATUS.UPDATED, content, kind, previousHash: lockEntry.hash });
  }

  // Anything the lockfile owns that the model no longer produces.
  for (const [path, entry] of Object.entries(lockAll)) {
    if (plannedByCollision.has(collisionKey(path))) continue;

    // A lockfile KEY is untrusted: `.bruno-gen/lock.json` is committed in the repository under
    // inspection. A key of `../../../../etc/hosts` would otherwise be reported as a prunable orphan,
    // which is an invitation to run `--prune` on it. apply's own assertInside would refuse the
    // delete, but a report that offers the action is already wrong.
    let inside = true;
    try {
      assertInside(collectionRoot, join(collectionRoot, path), { label: 'lockfile key' });
    } catch {
      inside = false;
    }
    if (!inside) {
      decisions.push({
        relPath: path,
        status: STATUS.UNMANAGED,
        kind: entry?.kind ?? 'request',
        note: 'the lockfile claims a path outside the collection; ignored, and never pruned',
      });
      continue;
    }

    if (!existsSync(join(collectionRoot, path))) continue;

    // An adopted file was never in a model, so it cannot have fallen out of one. Calling it an
    // orphan reads as "the generator made this and it is now obsolete" and invites a --prune of
    // something the user wrote - on the migration repository that was every request file and every
    // environment holding real base URLs. It is theirs; say so.
    if (entry?.hash === ADOPTED) {
      decisions.push({
        relPath: path,
        status: STATUS.UNMANAGED,
        kind: entry?.kind ?? 'request',
        note: 'yours, adopted; the model does not describe it',
      });
      continue;
    }

    decisions.push({
      relPath: path,
      status: STATUS.ORPHAN,
      kind: entry?.kind ?? 'request',
      note: 'no longer in the model; not deleted. Remove it with --prune <path>.',
    });
  }

  // Unmanaged files that were never planned: report them so the inventory is honest.
  for (const path of onDisk) {
    if (plannedByCollision.has(collisionKey(path)) || lockSpelling.has(collisionKey(path))) continue;
    if (path.startsWith(`${'.bruno-gen'}/`)) continue;
    if (decisions.some((d) => d.relPath === path || d.movedTo === path)) continue;
    decisions.push({ relPath: path, status: STATUS.UNMANAGED, kind: 'request' });
  }

  decisions.sort((a, b) => byCodepoint(a.relPath, b.relPath));

  const summary = {};
  for (const d of decisions) summary[d.status] = (summary[d.status] ?? 0) + 1;

  return { decisions, summary, refusal: null };
}

/** True when applying this plan would change nothing on disk. */
export const isNoop = (decisions) =>
  decisions.every((d) =>
    [STATUS.UNCHANGED, STATUS.KEPT, STATUS.UNMANAGED, STATUS.ORPHAN, STATUS.CREATE_ONCE_EXISTS, STATUS.MOVED].includes(
      d.status,
    ),
  );

/** The statuses that actually write bytes. */
export const WRITING_STATUSES = new Set([
  STATUS.CREATE,
  STATUS.UPDATED,
  STATUS.RESTORED,
  STATUS.SECRETS_ADDED,
]);
