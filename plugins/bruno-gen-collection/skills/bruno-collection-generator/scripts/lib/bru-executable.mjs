// Resolve Bruno's CLI without consulting the repository being inspected and without a shell.
//
// On Windows npm exposes a .cmd shim. Node cannot execute that shim with shell:false, while
// shell:true concatenates arguments and is deprecated for exactly that injection risk. A standard
// npm shim sits beside node_modules/@usebruno/cli, so execute its JavaScript entry point with Node
// directly. Native bru.exe installations and POSIX executables need no special handling.

import { accessSync, constants, readFileSync, realpathSync, statSync } from 'node:fs';
import { delimiter, isAbsolute, join, relative, resolve } from 'node:path';

const pathValue = () => process.env.PATH ?? process.env.Path ?? '';

const isInside = (root, target) => {
  if (!root) return false;
  const rel = relative(realpathOrResolve(root), realpathOrResolve(target));
  return rel === '' || rel === '.' || (!rel.startsWith('..') && !isAbsolute(rel));
};

const realpathOrResolve = (path) => {
  try {
    return realpathSync(path);
  } catch {
    return resolve(path);
  }
};

const isFile = (path) => {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
};

function npmShimInvocation(shim, { excludeRoot }) {
  const dir = resolve(shim, '..');
  const packageDir = join(dir, 'node_modules', '@usebruno', 'cli');
  const manifest = join(packageDir, 'package.json');
  if (!isFile(manifest)) return null;

  try {
    const pkg = JSON.parse(readFileSync(manifest, 'utf8'));
    const relativeEntry = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin?.bru;
    if (typeof relativeEntry !== 'string' || !relativeEntry) return null;
    const entry = resolve(packageDir, relativeEntry);
    if (!isInside(packageDir, entry) || !isFile(entry) || isInside(excludeRoot, entry)) return null;
    const bundledNode = join(dir, 'node.exe');
    return {
      command: isFile(bundledNode) ? bundledNode : process.execPath,
      prefixArgs: [entry],
      displayPath: realpathOrResolve(shim),
    };
  } catch {
    return null;
  }
}

/**
 * @returns {{command: string, prefixArgs: string[], displayPath: string}|null}
 */
export function resolveBruExecutable({ excludeRoot = null, searchPath = pathValue() } = {}) {
  const dirs = String(searchPath)
    .split(delimiter)
    .map((d) => d.trim().replace(/^"|"$/g, ''))
    // Empty and relative PATH entries resolve through cwd, which is the untrusted repository for
    // smoke. Ignore them instead of making repository content executable.
    .filter((d) => d && isAbsolute(d));

  for (const dir of dirs) {
    if (process.platform === 'win32') {
      for (const extension of ['.exe', '.com']) {
        const candidate = join(dir, `bru${extension}`);
        if (isFile(candidate) && !isInside(excludeRoot, candidate)) {
          return { command: realpathOrResolve(candidate), prefixArgs: [], displayPath: realpathOrResolve(candidate) };
        }
      }
      for (const extension of ['.cmd', '.bat']) {
        const candidate = join(dir, `bru${extension}`);
        if (!isFile(candidate) || isInside(excludeRoot, candidate)) continue;
        const invocation = npmShimInvocation(candidate, { excludeRoot });
        if (invocation) return invocation;
      }
      continue;
    }

    const candidate = join(dir, 'bru');
    try {
      accessSync(candidate, constants.X_OK);
      if (isFile(candidate) && !isInside(excludeRoot, candidate)) {
        return { command: realpathOrResolve(candidate), prefixArgs: [], displayPath: realpathOrResolve(candidate) };
      }
    } catch {
      // Keep looking along PATH.
    }
  }
  return null;
}

/** Append Bruno arguments to a previously resolved, shell-free invocation. */
export const bruCommand = (invocation, args) => ({
  command: invocation.command,
  args: [...invocation.prefixArgs, ...args],
});
