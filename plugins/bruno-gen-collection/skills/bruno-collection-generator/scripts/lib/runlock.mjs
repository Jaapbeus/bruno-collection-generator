// Exclusive run lock, so two concurrent runs cannot interleave writes into one collection.
//
// It lives in the OS temp directory, never inside the user's repository: a lock file under
// bruno/ would show up in git status, get committed, and confuse the merge logic it exists to
// protect.

import { createHash, randomUUID } from 'node:crypto';
import { existsSync, lstatSync, readFileSync, readdirSync, writeFileSync, rmSync, mkdirSync, realpathSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { tmpdir, hostname } from 'node:os';

export const STALE_AFTER_MS = 15 * 60 * 1000;

const lockDir = () => {
  const dir = join(tmpdir(), 'bruno-gen-collection');
  mkdirSync(dir, { recursive: true });
  return dir;
};

const swappedCase = (name) => name.replace(/[A-Za-z]/, (c) => c === c.toLowerCase() ? c.toUpperCase() : c.toLowerCase());

/** Does the volume containing an existing path fold case? macOS can be configured either way. */
function caseInsensitiveVolume(existingPath) {
  let current = realpathSync(existingPath);
  for (;;) {
    try {
      for (const entry of readdirSync(current, { withFileTypes: true })) {
        const swapped = swappedCase(entry.name);
        if (swapped === entry.name) continue;
        try {
          const original = lstatSync(join(current, entry.name));
          const alternate = lstatSync(join(current, swapped));
          return original.dev === alternate.dev && original.ino === alternate.ino;
        } catch {
          return false;
        }
      }
    } catch {
      // Try a readable ancestor. Normal project paths have an entry to test well before the root.
    }
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return process.platform === 'win32';
}

/** Resolve symlinks in the existing prefix while retaining a not-yet-created collection tail. */
function collectionIdentity(collectionRoot) {
  let existing = resolve(collectionRoot);
  const tail = [];
  while (!existsSync(existing)) {
    const parent = dirname(existing);
    if (parent === existing) break;
    tail.unshift(basename(existing));
    existing = parent;
  }
  const identity = resolve(realpathSync(existing), ...tail);
  return caseInsensitiveVolume(existing) ? identity.toLowerCase() : identity;
}

/** One lock per collection root, keyed by its physical path and the volume's case semantics. */
export function lockFileFor(collectionRoot) {
  const identity = collectionIdentity(collectionRoot);
  const key = createHash('sha256').update(identity, 'utf8').digest('hex').slice(0, 16);
  return join(lockDir(), `${key}.lock.json`);
}

const alive = (pid) => {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    // EPERM means the process exists but belongs to another user.
    return err?.code === 'EPERM';
  }
};

export class RunLockError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RunLockError';
  }
}

/**
 * Acquire the lock. Creation uses `wx`, so two processes that start together cannot both pass an
 * exists-then-write race. A live local owner is never evicted merely for running longer than the
 * stale threshold; a large collection or slow filesystem can legitimately take that long.
 *
 * @returns {{release: () => void, tookOver: object|null, path: string}}
 */
export function acquire(collectionRoot, { now = Date.now(), onNotice = () => {} } = {}) {
  const path = lockFileFor(collectionRoot);
  const record = {
    pid: process.pid,
    host: hostname(),
    startedAt: new Date(now).toISOString(),
    token: randomUUID(),
  };
  let tookOver = null;

  // At most a few contenders can change the path underneath us. Each retry either creates the file
  // exclusively, observes a live owner, or removes the exact stale bytes it inspected.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      writeFileSync(path, `${JSON.stringify(record, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
      break;
    } catch (err) {
      if (err?.code !== 'EEXIST') throw err;

      let raw = null;
      let held = null;
      try {
        raw = readFileSync(path, 'utf8');
        held = JSON.parse(raw);
      } catch (readError) {
        // ENOENT means another contender already removed the old lock. Other read failures do not
        // prove the file is stale, so never delete a path whose bytes we could not inspect.
        if (readError?.code === 'ENOENT') continue;
        if (raw === null) {
          throw new RunLockError(`The run lock exists but cannot be read safely: ${path}`);
        }
        held = null;
      }

      const parsedStartedAt = held?.startedAt ? Date.parse(held.startedAt) : NaN;
      const age = Number.isFinite(parsedStartedAt) ? now - parsedStartedAt : Infinity;
      const sameHost = held?.host === record.host;
      const ownerAlive = sameHost && alive(held?.pid);
      // A valid live local owner wins regardless of age. A lock from another host can only be a
      // leftover in this machine's temp directory (for example after a hostname change), so give it
      // the full stale interval before takeover.
      const stale = !held || (sameHost ? !ownerAlive : !Number.isFinite(age) || age > STALE_AFTER_MS);

      if (!stale) {
        throw new RunLockError(
          `Another run holds the lock for this collection (pid ${held.pid} on ${held.host}, started ${held.startedAt}).\n` +
            `Wait for it to finish, or remove ${path} if you are sure it is dead.`,
        );
      }

      // Do not unlink a lock that changed after we inspected it. This is best-effort compare/delete;
      // exclusive creation on the next iteration is still the final arbiter.
      try {
        if (raw !== null && readFileSync(path, 'utf8') !== raw) continue;
        rmSync(path, { force: true });
      } catch (removeError) {
        if (removeError?.code === 'ENOENT') continue;
        throw removeError;
      }

      tookOver = held;
      onNotice(
        `taking over a stale run lock (pid ${held?.pid ?? '?'} on ${held?.host ?? '?'}` +
          `${Number.isFinite(age) ? `, ${Math.round(age / 1000)}s old` : ''})`,
      );

      if (attempt === 4) {
        throw new RunLockError(`Could not acquire the run lock after repeated contention: ${path}`);
      }
    }
  }

  // If every iteration continued after contention without either acquiring or throwing, make the
  // outcome explicit rather than returning a lock object for a file we do not own.
  let owns = false;
  try {
    const current = JSON.parse(readFileSync(path, 'utf8'));
    owns = current.token === record.token;
  } catch {
    owns = false;
  }
  if (!owns) throw new RunLockError(`Could not acquire the run lock after repeated contention: ${path}`);

  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    detach();
    try {
      // Only remove our own lock, in case it was taken over while we ran.
      if (existsSync(path)) {
        const current = JSON.parse(readFileSync(path, 'utf8'));
        if (current.token === record.token) rmSync(path, { force: true });
      }
    } catch {
      // An unreadable or replaced lock is not demonstrably ours. Leave it for stale takeover rather
      // than deleting another process's lock.
    }
  };

  // Belt and braces: the caller's finally block, a process-exit hook, and the signals a terminal or
  // CI sends.
  //
  // The exit hook alone is not enough on POSIX, where a signalled process never emits 'exit'. What
  // this does NOT fix is worth stating: on Windows an externally terminated process runs no handler
  // at all (measured), so there the lock is retired by the ownership checks above instead - the
  // owner's pid is gone, so the next run takes it over immediately with a notice rather than waiting
  // out STALE_AFTER_MS.
  const onSignal = (sig) => {
    release();
    // Re-raise, so the exit status still reflects the signal rather than a clean exit.
    process.kill(process.pid, sig);
  };
  const SIGNALS = ['SIGINT', 'SIGTERM', 'SIGHUP'];
  function detach() {
    process.removeListener('exit', release);
    for (const sig of SIGNALS) process.removeListener(sig, onSignal);
  }
  process.once('exit', release);
  for (const sig of SIGNALS) process.once(sig, onSignal);

  return { release, tookOver, path };
}
