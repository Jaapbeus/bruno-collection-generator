// Crash-safe file replacement for every runtime artefact the generator owns.
//
// The temporary file is unpredictable and created exclusively. A predictable
// `<target>.tmp-<pid>` can be planted as a symlink inside an untrusted repository; opening it with
// the default `w` flag follows that link and writes outside the collection before the final rename.

import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

/** Replace `target` with `content`, without ever opening an existing temporary path. */
export function writeFileAtomic(target, content, { encoding = 'utf8' } = {}) {
  mkdirSync(dirname(target), { recursive: true });
  const tmp = `${target}.tmp-${process.pid}-${randomUUID()}`;
  try {
    writeFileSync(tmp, content, { encoding, flag: 'wx' });
    renameSync(tmp, target);
  } finally {
    if (existsSync(tmp)) rmSync(tmp, { force: true });
  }
}
