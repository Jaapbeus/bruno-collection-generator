// Executes a merge plan, and implements `adopt`.
//
// Every write is temp-file-plus-rename and is verified by re-parsing before the rename, because
// the bru writer logs a serialisation error to the console and still returns bytes - so a
// non-empty return value is not evidence the file is valid.

import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { filestore, parseStrict } from './deps.mjs';
import {
  assertInside, assertPortableRelPath, byCodepoint, collisionKey, PathSafetyError,
} from './paths.mjs';
import {
  canonicalHash, ADOPTED, emptyLock, writeLock, lockPath,
} from './lockfile.mjs';
import { STATUS, WRITING_STATUSES } from './plan.mjs';
import { requestFiles, environmentFiles, supportFiles } from './format.mjs';
import { endpointKey } from './inventory.mjs';
import { writeFileAtomic } from './atomic-write.mjs';

/**
 * Does this content parse back?
 *
 * Separate from writing, and pure, so every file in a run can be checked BEFORE the first one is
 * written. Verifying inside the write loop meant a malformed file halfway through left the earlier
 * ones on disk with no lockfile - and the tool's own recovery advice for that state is `adopt`,
 * which freezes its own half-written output as the user's work.
 *
 * @returns {string|null} the problem, or null when the content is good
 */
function parseProblem(content, { format, kind, abs }) {
  if (kind === 'request' || kind === 'environment' || kind === 'folder' || kind === 'root') {
    try {
      // Via parseStrict: the bru readers report a syntax error by returning a rejected promise
      // rather than throwing, so the old direct calls could not see a failure at all for three of
      // the four kinds - the "verified by re-parsing" promise only ever held for requests.
      parseStrict(kind, content, { format });
    } catch (err) {
      return `refusing to write ${abs}: it does not parse back (${err.message.split('\n')[0]})`;
    }
  } else if (abs.endsWith('.json')) {
    try {
      JSON.parse(content);
    } catch (err) {
      return `refusing to write ${abs}: it is not valid JSON (${err.message.split('\n')[0]})`;
    }
  }
  return null;
}

/**
 * The content an existing environment file needs so it also declares `names` as secrets.
 * Names only, never a value. Returns null when nothing has to change.
 */
function withSecretNames(abs, format, names) {
  const store = filestore();
  const text = readFileSync(abs, 'utf8');
  // parseStrict, so an unparseable environment throws instead of reading back as an EMPTY one. It
  // read as empty before, and this function then "added the missing secrets" by writing a file that
  // contained nothing but them - destroying whatever the user had written. `plan` now refuses to
  // reach here for a file it cannot parse; this is the second lock on the same door.
  const env = parseStrict('environment', text, { format });
  const variables = [...env.variables];
  if (variables.length === 0 && text.trim() !== '') {
    throw new Error(`refusing to rewrite ${abs}: it has content but parses to no variables`);
  }
  const known = new Set(variables.map((v) => v.name));
  let added = 0;
  for (const name of names) {
    if (known.has(name)) continue;
    variables.push({ name, value: '', type: 'text', enabled: true, secret: true });
    added++;
  }
  if (!added) return null;
  return store.stringifyEnvironment({ ...env, variables }, { format });
}

/**
 * Apply a plan.
 *
 * @returns {{written: string[], skipped: string[], pruned: string[], lockStatus: string, errors: string[]}}
 */
export function applyPlan({
  collectionRoot,
  format,
  decisions,
  planned,
  lock,
  libraries,
  generatorVersion,
  outputDir,
  prune = [],
  reset = [],
  dryRun = false,
}) {
  const written = [];
  const skipped = [];
  const pruned = [];
  const errors = [];

  const nextLock = lock
    ? structuredClone(lock)
    : emptyLock({ format, outputDir, generatorVersion, libraries });
  nextLock.generatorVersion = generatorVersion;
  nextLock.emittedWith = libraries ?? {};
  nextLock.format = format;
  nextLock.outputDir = outputDir;

  const plannedByPath = new Map(planned.map((f) => [collisionKey(f.relPath), f]));
  const bucketFor = (kind) =>
    kind === 'environment' ? 'environments' : kind === 'folder' ? 'folders' : kind === 'config' || kind === 'root' ? 'config' : 'requests';
  const entryPathFor = (bucket, relPath) =>
    Object.keys(nextLock[bucket] ?? {}).find((path) => collisionKey(path) === collisionKey(relPath)) ?? null;

  // --reset <path>: forget that a file was edited, so this run may overwrite it.
  for (const path of reset) {
    const abs = join(collectionRoot, path);
    assertInside(collectionRoot, abs, { label: '--reset path' });
    const file = plannedByPath.get(collisionKey(path));
    if (!file) {
      errors.push(`--reset ${path}: not a file this run would generate`);
      continue;
    }
    const bucket = bucketFor(file.kind);
    const ownedPath = entryPathFor(bucket, path);
    if (!ownedPath) {
      errors.push(`--reset ${path}: not owned by the lockfile`);
      continue;
    }
    // An adopted file is never overwritten, not even by an explicit --reset. Adoption exists so an
    // installed generator cannot destroy a stranger's hand-written file, and a flag meant for "accept
    // generated content over my edit" must not become a back door around that guarantee for a file
    // that was never generated in the first place.
    if (nextLock[bucket][ownedPath]?.hash === ADOPTED) {
      errors.push(`--reset ${path}: this file was adopted, not generated - it is never overwritten`);
      continue;
    }
    // Force an update by clearing the recorded hash.
    delete nextLock[bucket][ownedPath];
    const d = decisions.find((x) => collisionKey(x.relPath) === collisionKey(path));
    if (d && d.status === STATUS.KEPT) {
      d.status = STATUS.UPDATED;
      d.content = file.content;
      d.reason = 'reset by you';
    }
  }

  // --prune <path>: delete an orphan, but only a machine-owned, unmodified one.
  //
  // Validated here, deleted further down. Deleting inside this loop meant a run that went on to be
  // rejected - "0 files written, lockfile not written" - had already destroyed the earlier files in
  // the list, and left the lockfile permanently claiming them.
  const toPrune = [];
  for (const path of prune) {
    const abs = join(collectionRoot, path);
    assertInside(collectionRoot, abs, { label: '--prune path' });
    const decision = decisions.find((d) => d.relPath === path);
    if (!decision || decision.status !== STATUS.ORPHAN) {
      errors.push(`--prune ${path}: not reported as an orphan by this run`);
      continue;
    }
    const bucket = bucketFor(decision.kind);
    const ownedPath = entryPathFor(bucket, path);
    const entry = ownedPath ? nextLock[bucket]?.[ownedPath] : null;
    if (!entry) {
      errors.push(`--prune ${path}: not owned by the lockfile, so it is yours - not pruned`);
      continue;
    }
    const current = existsSync(abs) ? readFileSync(abs, 'utf8') : null;
    if (current !== null && entry.hash !== canonicalHash(current)) {
      errors.push(`--prune ${path}: you edited it since it was generated - not pruned`);
      continue;
    }
    toPrune.push({ path, abs, bucket, ownedPath });
  }

  // Render and verify EVERY file before writing any of them, so a single malformed one cannot
  // leave the collection half-generated.
  const toWrite = [];
  for (const d of decisions) {
    if (!WRITING_STATUSES.has(d.status)) {
      if (d.status !== STATUS.UNCHANGED) skipped.push(d.relPath);
      continue;
    }
    const abs = join(collectionRoot, d.relPath);
    assertInside(collectionRoot, abs, { label: `output file ${d.relPath}` });

    let content = d.content;
    if (d.status === STATUS.SECRETS_ADDED) {
      try {
        content = withSecretNames(abs, format, d.secretNames ?? []);
      } catch (err) {
        // A named refusal, not a stack: the file is the user's and staying out of it is the correct
        // outcome, so say which one and why and let the rest of the run proceed to the errors gate.
        errors.push(err.message);
        continue;
      }
      if (content === null) continue; // already declares them
    }

    const problem = parseProblem(content, { format, kind: d.kind, abs });
    if (problem) {
      errors.push(problem);
      continue;
    }
    toWrite.push({ relPath: d.relPath, abs, content });
  }

  if (errors.length) return { written, skipped, pruned, errors, lockStatus: 'not written' };

  if (dryRun) {
    return {
      written: toWrite.map((w) => w.relPath),
      skipped,
      pruned: toPrune.map((p) => p.path),
      errors,
      lockStatus: 'not written (dry run)',
    };
  }

  for (const { path, abs, bucket, ownedPath } of toPrune) {
    if (existsSync(abs)) unlinkSync(abs);
    delete nextLock[bucket][ownedPath];
    pruned.push(path);
  }

  for (const { relPath, abs, content } of toWrite) {
    writeFileAtomic(abs, content);
    written.push(relPath);
  }

  // Record ownership for everything this run wrote or already owned.
  //
  // Keyed case-insensitively: the planner rewrites a planned path to the spelling already on disk,
  // so `file.relPath` and the decision's path can differ by case and still be one file. Recording
  // the model's spelling as well would put two entries in the lockfile for it.
  const decisionFor = new Map(decisions.map((d) => [collisionKey(d.relPath), d]));
  for (const file of planned) {
    const decision = decisionFor.get(collisionKey(file.relPath));
    const relPath = decision?.relPath ?? file.relPath;
    const abs = join(collectionRoot, relPath);
    if (!existsSync(abs)) continue;
    const bucket = bucketFor(file.kind);
    nextLock[bucket] ??= {};
    const priorPath = entryPathFor(bucket, relPath);
    const priorEntry = priorPath ? nextLock[bucket][priorPath] : null;

    // The spelling on disk wins. Move an existing case/Unicode-equivalent lock entry rather than
    // recording both spellings (two keys on Linux, one physical file on Windows/macOS).
    if (priorPath && priorPath !== relPath) {
      nextLock[bucket][relPath] = priorEntry;
      delete nextLock[bucket][priorPath];
    }

    // Adding a secret NAME to a file the user owns does not transfer ownership of it. Replacing the
    // ADOPTED marker with a real hash made a hand-written environment - real hosts, real tenant -
    // look machine-generated, so a later run reported it as an orphan and offered `--prune`, which
    // passed every guard and deleted it. The one file class this tool must never lose.
    if (decision?.status === STATUS.SECRETS_ADDED && priorEntry?.hash === ADOPTED) {
      continue;
    }

    // A file the user owns keeps its recorded state; never overwrite the record with our hash.
    if (decision && [STATUS.KEPT, STATUS.UNMANAGED, STATUS.CREATE_ONCE_EXISTS].includes(decision.status)) {
      if (decision.status === STATUS.CREATE_ONCE_EXISTS && !priorEntry) {
        nextLock[bucket][relPath] = {
          kind: file.kind,
          hash: ADOPTED,
          ...(file.endpointKey ? { endpointKey: file.endpointKey } : {}),
        };
      }
      continue;
    }

    nextLock[bucket][relPath] = {
      kind: file.kind,
      hash: canonicalHash(readFileSync(abs, 'utf8')),
      ...(file.endpointKey ? { endpointKey: file.endpointKey } : {}),
      ...(Number.isFinite(file.seq) ? { seq: file.seq } : {}),
      ...(file.fileName ? { fileName: file.fileName } : {}),
    };
  }

  // A MOVED decision means the request still exists, just not where the planner's own naming
  // convention would put it. Leaving the entry at the old, now-nonexistent path meant it never
  // converged with reality - it survived as a permanent dangling record, and the file's real location
  // was never itself recorded as owned. Skip an adopted entry: adoption is never touched, moved or not.
  for (const decision of decisions) {
    if (decision.status !== STATUS.MOVED) continue;
    const bucket = bucketFor(decision.kind);
    const oldPath = entryPathFor(bucket, decision.relPath);
    const entry = oldPath ? nextLock[bucket]?.[oldPath] : null;
    if (!entry || entry.hash === ADOPTED) continue;
    const newAbs = join(collectionRoot, decision.movedTo);
    if (!existsSync(newAbs)) continue;
    delete nextLock[bucket][oldPath];
    nextLock[bucket][decision.movedTo] = { ...entry, hash: canonicalHash(readFileSync(newAbs, 'utf8')) };
  }

  const lockStatus = writeLock(collectionRoot, nextLock);
  return { written, skipped, pruned, errors, lockStatus, lock: nextLock };
}

/**
 * `adopt` - take ownership of a collection this tool did not create.
 *
 * Records every existing file as the user's, so the first run afterwards changes nothing except
 * adding endpoints that are genuinely missing. This is what makes it safe to point at a
 * stranger's repository.
 */
export function adopt({ collectionRoot, format, generatorVersion, libraries, outputDir }) {
  if (existsSync(lockPath(collectionRoot))) {
    return { alreadyAdopted: true, adopted: [], lockStatus: 'unchanged' };
  }

  const lock = emptyLock({ format, outputDir, generatorVersion, libraries });
  const adopted = [];
  const adoptedSpelling = new Map();
  const ext = format === 'yml' ? 'yml' : 'bru';

  const record = (bucket, relPath, extra = {}) => {
    assertPortableRelPath(relPath, { label: 'adopted collection path' });
    const key = collisionKey(relPath);
    const previous = adoptedSpelling.get(key);
    if (previous && previous !== relPath) {
      throw new PathSafetyError(
        `cannot adopt paths that collide on Windows or default macOS filesystems: ${previous} and ${relPath}`,
      );
    }
    adoptedSpelling.set(key, relPath);
    lock[bucket][relPath] = { hash: ADOPTED, ...extra };
    lock.adopted.push(relPath);
    adopted.push(relPath);
  };

  for (const abs of requestFiles(collectionRoot, format)) {
    const relPath = abs.slice(collectionRoot.length + 1).split('\\').join('/');
    let key = null;
    let seq = null;
    try {
      // parseStrict, like every other reader in the codebase. This was the one call site still using
      // the raw reader, and filestore writes a code frame to STDOUT before it throws - so a single
      // malformed .bru made `adopt --json` unparseable and copied the offending line of the user's
      // file into output meant to be pasteable.
      const parsed = parseStrict('request', readFileSync(abs, 'utf8'), { format });
      key = endpointKey(parsed?.request?.method ?? 'GET', parsed?.request?.url ?? '');
      seq = Number.isFinite(Number(parsed?.seq)) ? Number(parsed.seq) : null;
    } catch {
      // Unparseable files are still adopted: they are the user's, and doctor reports them.
    }
    record('requests', relPath, {
      kind: 'request',
      ...(key ? { endpointKey: key } : {}),
      ...(seq !== null ? { seq } : {}),
      fileName: relPath.split('/').pop().replace(new RegExp(`\\.${ext}$`), ''),
    });
  }

  for (const abs of environmentFiles(collectionRoot, format)) {
    record('environments', abs.slice(collectionRoot.length + 1).split('\\').join('/'), {
      kind: 'environment',
    });
  }

  for (const abs of supportFiles(collectionRoot, format)) {
    const relPath = abs.slice(collectionRoot.length + 1).split('\\').join('/');
    const isFolder = /(^|\/)folder\.(bru|yml)$/.test(relPath);
    record(isFolder ? 'folders' : 'config', relPath, {
      kind: isFolder ? 'folder' : relPath.endsWith('.json') ? 'config' : 'root',
    });
  }

  // Variants: where two adopted files share one endpointKey, the lowest seq owns the endpoint and
  // the rest are marked variants so they are never overwritten and never steal the name or seq.
  const byKey = new Map();
  for (const [path, entry] of Object.entries(lock.requests)) {
    if (!entry.endpointKey) continue;
    if (!byKey.has(entry.endpointKey)) byKey.set(entry.endpointKey, []);
    byKey.get(entry.endpointKey).push(path);
  }
  const variants = [];
  for (const [, paths] of byKey) {
    if (paths.length < 2) continue;
    const ordered = [...paths].sort((a, b) => {
      const sa = lock.requests[a].seq ?? Number.MAX_SAFE_INTEGER;
      const sb = lock.requests[b].seq ?? Number.MAX_SAFE_INTEGER;
      return sa - sb || byCodepoint(a, b);
    });
    for (const path of ordered.slice(1)) {
      lock.requests[path].variant = true;
      variants.push(path);
    }
  }

  const lockStatus = writeLock(collectionRoot, lock);
  return { alreadyAdopted: false, adopted, variants, lockStatus, lock };
}
