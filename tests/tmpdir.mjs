// Test workspace directories, on a filesystem someone else is also looking at.
//
// Several fixtures are real `.csproj` projects, which is the point of them. The consequence is that
// an editor with C# tooling open on this repository notices every copy of one - including the copies
// the tests make under `tests/.tmp/` - and starts loading it, holding a handle on the directory. A
// later run then cannot delete that directory and fails with EPERM. `rmSync`'s `maxRetries` does not
// help: the handle belongs to a live process, not to a scan that finishes in a moment.
//
// So do not reuse a path at all. Each process gets its own workspace root, which means no test ever
// has to remove a directory another process might be holding, and cleanup of previous runs is
// best-effort rather than a precondition. CI is unaffected either way - it has no editor attached -
// but this repository treats Windows as the platform that finds the real problems, and a suite that
// fails one run in three on the maintainer's own machine is a real problem.

import { rmSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';

/**
 * Remove a path if it can be removed. Never throws: a leftover directory from an earlier run is
 * untracked scratch space, so failing to delete it is not a reason to fail a test.
 */
export function removeDir(path) {
  try {
    rmSync(path, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  } catch {
    // Held by another process. The caller works in a per-process directory, so this cannot
    // collide with what it is about to write.
  }
}

/**
 * A workspace root unique to this process, under `base`.
 *
 * `node --test` runs each test file in its own process, so this also keeps concurrent files apart.
 */
export const runScopedBase = (base) => `${base}-${process.pid}`;

/**
 * Best-effort sweep of workspace roots left by earlier runs.
 *
 * A per-process directory means nothing overwrites anything, but it would also leak one directory
 * per run. This clears the ones it can and ignores the ones something still holds - so the next run
 * collects them instead.
 */
export function pruneStale(base) {
  const parent = dirname(base);
  const prefix = `${basename(base).replace(/-\d+$/, '')}-`;
  let entries;
  try {
    entries = readdirSync(parent, { withFileTypes: true });
  } catch {
    return; // tests/.tmp does not exist yet
  }
  for (const e of entries) {
    if (e.isDirectory() && e.name.startsWith(prefix) && join(parent, e.name) !== base) {
      removeDir(join(parent, e.name));
    }
  }
}
