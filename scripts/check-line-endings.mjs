#!/usr/bin/env node
// Byte hygiene for every file this repository authors.
//
// Three real defects this catches:
//   - a CRLF in a source file, which breaks byte-exact golden comparison on the next platform
//   - a null byte, which is invisible in an editor and silently corrupts a string literal
//   - a missing `tests/golden/** -text` rule, without which git rewrites the goldens on a
//     Windows checkout and every comparison fails for a reason nobody can see
// The vendored dependency tree is third-party and excluded.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ROOTS = ['tests', 'docs', 'plugins', 'scripts', '.github'];
const ROOT_FILES = ['README.md', 'CHANGELOG.md', 'LICENSE', 'CLAUDE.md', '.gitattributes', '.editorconfig', '.gitignore'];
const EXCLUDE_DIRS = new Set(['node_modules', '.git', '.tmp', 'output', 'vendor']);

// PowerShell files are declared CRLF in .gitattributes for the frozen implementation.
const CRLF_ALLOWED = /\.ps1$/;
const TEXT = /\.(mjs|js|json|md|yml|yaml|bru|txt|cs|ts)$/;

const problems = [];
let scanned = 0;

function* walk(start) {
  const abs = join(repoRoot, start);
  if (!existsSync(abs)) return;
  if (statSync(abs).isFile()) {
    yield abs;
    return;
  }
  const stack = [abs];
  while (stack.length) {
    const dir = stack.pop();
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) {
        if (EXCLUDE_DIRS.has(e.name)) continue;
        stack.push(join(dir, e.name));
      } else {
        yield join(dir, e.name);
      }
    }
  }
}

const targets = [...ROOTS, ...ROOT_FILES];
for (const root of targets) {
  for (const file of walk(root)) {
    const rel = relative(repoRoot, file).split(sep).join('/');
    const isDotfile = ROOT_FILES.includes(rel);
    if (!isDotfile && !TEXT.test(file) && !CRLF_ALLOWED.test(file)) continue;

    const buf = readFileSync(file);
    scanned++;

    if (buf.includes(0)) {
      const at = buf.indexOf(0);
      const line = buf.subarray(0, at).toString('utf8').split('\n').length;
      problems.push(`${rel}:${line}  contains a null byte at offset ${at}`);
    }

    if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
      problems.push(`${rel}  starts with a UTF-8 BOM`);
    }

    if (!CRLF_ALLOWED.test(file)) {
      const text = buf.toString('utf8');
      const crlf = text.indexOf('\r\n');
      if (crlf !== -1) {
        const line = text.slice(0, crlf).split('\n').length;
        problems.push(`${rel}:${line}  CRLF line ending (this repository writes LF)`);
      }
      const loneCr = /\r(?!\n)/.exec(text);
      if (loneCr) problems.push(`${rel}  contains a bare CR`);
    }
  }
}

// The .gitattributes rule the golden tests depend on.
const attrs = existsSync(join(repoRoot, '.gitattributes'))
  ? readFileSync(join(repoRoot, '.gitattributes'), 'utf8')
  : '';
if (!/^\s*tests\/golden\/\*\*\s+-text\s*$/m.test(attrs)) {
  problems.push(
    '.gitattributes must contain "tests/golden/** -text" or git will normalise the golden files ' +
      'on checkout and every byte-exact comparison fails',
  );
}
if (!/trim_trailing_whitespace\s*=\s*false/.test(
  existsSync(join(repoRoot, '.editorconfig')) ? readFileSync(join(repoRoot, '.editorconfig'), 'utf8') : '',
)) {
  problems.push(
    '.editorconfig must disable trim_trailing_whitespace for generated collections; Bruno emits a ' +
      'trailing space after a key with an empty value and trimming it changes the bytes',
  );
}

// ---- two tracked paths differing only by case ----------------------------------------------
//
// A repository containing both `environments/Local.bru` and `environments/local.bru` is duplicated on
// Linux and impossible to check out on Windows or macOS - one silently overwrites the other. It is
// also invisible to a developer working only on Windows, which is how the class got shipped: the test
// that caught it passed here and failed on ubuntu alone.
//
// Checked against git's index rather than the filesystem, because a case-insensitive filesystem
// cannot show you both names.
{
  const listed = spawnSync('git', ['ls-files', '-z'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (listed.status === 0) {
    // A Set of SPELLINGS, not a list of index entries. `git ls-files` prints an unmerged path once
    // per stage, so during a conflicted merge every conflicted file was reported as colliding with
    // itself - thirteen "problems" that named one path three times. A path never collides with its own
    // spelling; only two DIFFERENT spellings that fold together are the bug this looks for.
    const byFold = new Map();
    for (const path of String(listed.stdout).split('\0')) {
      if (!path) continue;
      const fold = path.toLowerCase();
      if (!byFold.has(fold)) byFold.set(fold, new Set());
      byFold.get(fold).add(path);
    }
    for (const [, spellings] of byFold) {
      if (spellings.size > 1) {
        problems.push(`these tracked paths differ only by case: ${[...spellings].join('  vs  ')}`);
      }
    }
  }
}

if (problems.length) {
  for (const p of problems) console.error(`FAIL  ${p}`);
  console.error(`\n${problems.length} byte-hygiene problem(s) across ${scanned} files.`);
  process.exit(1);
}
console.log(
  `byte hygiene ok (${scanned} files: LF endings, no BOM, no null bytes, no case-only path ` +
    'collisions, git attributes in place)',
);
