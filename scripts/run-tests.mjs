#!/usr/bin/env node
// Runs the test suite on every supported Node version.
//
// `node --test "tests/*.test.mjs"` only expands the glob on Node 22 and newer; on Node 20 the
// pattern is taken literally and the run fails with "Could not find ...\tests\*.test.mjs". And
// `node --test tests/` behaves inconsistently across platforms. So the file list is built here,
// with fs, and passed explicitly - which works identically on 20, 22 and 24.
//
//   node scripts/run-tests.mjs [--] [extra node --test flags]

import { readdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const testsDir = join(repoRoot, 'tests');

if (!existsSync(testsDir)) {
  console.error(`no tests directory at ${testsDir}`);
  process.exit(1);
}

const files = readdirSync(testsDir)
  .filter((f) => f.endsWith('.test.mjs'))
  .sort()
  .map((f) => join('tests', f));

if (files.length === 0) {
  console.error('no *.test.mjs files found in tests/');
  process.exit(1);
}

const extra = process.argv.slice(2).filter((a) => a !== '--');

// Two passes, because two of these files are not isolated from each other.
//
// `node --test` fans files out across cores. Most of the suite is happy that way, but
// execution.test.mjs and the smoke cases in phase5.test.mjs both spawn the global `bru` CLI and bind
// loopback recorders, and running them beside each other on a loaded machine produced a different
// handful of failures on each run - every one of which passed in isolation. A suite whose green
// depends on how busy the machine is cannot be cited as evidence, and this repository cites it
// constantly, so those two run on their own and serially.
const NETWORK_FILES = new Set(['tests/execution.test.mjs', 'tests/phase5.test.mjs']);
const asPosix = (f) => f.split('\\').join('/');
const network = files.filter((f) => NETWORK_FILES.has(asPosix(f)));
const rest = files.filter((f) => !NETWORK_FILES.has(asPosix(f)));

const passes = [
  ['parallel', rest, []],
  ['serial (spawns bru, binds loopback)', network, ['--test-concurrency=1']],
].filter(([, list]) => list.length > 0);

console.log(`running ${files.length} test file(s) on Node ${process.versions.node} in ${passes.length} pass(es)\n`);

let failed = 0;
for (const [label, list, flags] of passes) {
  console.log(`--- ${label}: ${list.join(', ')}`);
  const result = spawnSync(process.execPath, ['--test', ...flags, ...extra, ...list], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
  if ((result.status ?? 1) !== 0) failed = result.status ?? 1;
}

process.exit(failed);
