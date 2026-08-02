// Cross-platform behaviour: the things that differ between Windows, macOS and Linux.
//
// This file exists because of a failure that was invisible where it was written. A change passed on
// Windows and macOS and failed on ubuntu alone, because `safeSegment` folded the environment `Local`
// to `local.bru`: on a case-insensitive filesystem that IS the user's existing `Local.bru`, so it
// appeared to work, and on Linux it was a second file while the real one never got the secret name it
// needed. Developing on Windows makes that entire class structurally unobservable.
//
// So every rule below is asserted on any platform, from properties rather than from the filesystem:
//
//   case          a name the user addresses keeps its case; two paths never differ only by case
//   ordering      sorts are by code point, never by locale (which Node reads from the environment)
//   separators    emitted paths and lockfile keys are always forward-slash
//   unicode       NFC and NFD spellings of one name produce one file (macOS hands out NFD)
//   line endings  a CRLF checkout must not read as a human edit
//   reserved      Windows device names are reserved in any case
//   length        a path that would break MAX_PATH on Windows is refused everywhere
//
// Related cases live with the bug that produced them: the environment-case regression and the
// case-collision invariant are in phase5.test.mjs.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, readdirSync } from 'node:fs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const S = 'plugins/bruno-gen-collection/skills/bruno-collection-generator/scripts/lib/';

const { byCodepoint, safeSegment, collisionKey, safeRelPath, lockKey, MAX_PATH, PathSafetyError } =
  await import(`../${S}paths.mjs`);
const { planFiles } = await import(`../${S}emit.mjs`);
const { canonicalHash } = await import(`../${S}lockfile.mjs`);

const model = (over = {}) => ({
  modelVersion: 1,
  collection: {
    name: 'Portability',
    format: 'bru',
    outputDir: 'bruno',
    routePrefix: '/api',
    baseUrlVar: 'baseUrl',
    environments: [{ name: 'local', vars: { baseUrl: 'http://localhost:1' }, secrets: [] }],
    ...(over.collection ?? {}),
  },
  folders: over.folders ?? [],
  endpoints: over.endpoints ?? [],
  sources: [],
  warnings: [],
  unresolved: [],
  capability: [],
});

const endpoint = (over) => ({
  endpointKey: 'GET /api/x',
  name: 'X',
  folderId: null,
  method: 'GET',
  pathTemplate: '/x',
  tags: [],
  summary: null,
  description: null,
  deprecated: false,
  destructive: false,
  params: [],
  headers: [],
  auth: 'inherit',
  authNotes: [],
  body: { kind: 'none' },
  responses: [],
  asserts: [],
  settings: {},
  seq: null,
  provenance: { $skeleton: 'portability test', sourceRefs: [], fields: {} },
  confidence: 'high',
  flags: [],
  ...over,
});

// =============================================================================================
describe('ordering never depends on the machine locale', () => {
  test('byCodepoint disagrees with localeCompare exactly where it should', () => {
    // If these ever agreed, the comparator would be pointless. They do not: locale collation is
    // case-insensitive-ish and code point is not.
    for (const [a, b] of [['a', 'B'], ['Local', 'local'], ['x-api-key', 'X-Api-Key'], ['_a', 'Ab']]) {
      assert.notEqual(byCodepoint(a, b), a.localeCompare(b), `${a} vs ${b} should differ`);
    }
    assert.equal(byCodepoint('a', 'a'), 0);
    assert.equal(byCodepoint(null, ''), 0, 'nullish is coerced, not thrown on');
  });

  test('no library file compares with localeCompare', () => {
    // The comparator only helps if nothing bypasses it. Asserted over the source, because a single
    // reintroduced call site is enough to make output locale-dependent again.
    const dir = resolve(repoRoot, S);
    const offenders = [];
    for (const name of readdirSync(dir)) {
      if (!name.endsWith('.mjs')) continue;
      const text = readFileSync(resolve(dir, name), 'utf8');
      for (const [i, line] of text.split('\n').entries()) {
        if (!line.includes('localeCompare')) continue;
        // The one permitted mention is the comment explaining why it is not used.
        if (/^\s*\*|^\s*\/\//.test(line)) continue;
        offenders.push(`${name}:${i + 1}`);
      }
    }
    assert.deepEqual(offenders, [], 'use byCodepoint: localeCompare sorts by the machine locale');
  });

  test('nothing uses the locale-sensitive case operations', () => {
    const dir = resolve(repoRoot, S);
    const offenders = [];
    for (const name of readdirSync(dir)) {
      if (!name.endsWith('.mjs')) continue;
      const text = readFileSync(resolve(dir, name), 'utf8');
      for (const [i, line] of text.split('\n').entries()) {
        if (!/toLocale(Lower|Upper)Case/.test(line)) continue;
        // paths.mjs documents why it is not used; a mention in a comment is not a use.
        if (/^\s*\*|^\s*\/\//.test(line)) continue;
        offenders.push(`${name}:${i + 1}`);
      }
    }
    // toLowerCase is locale-independent by specification; toLocaleLowerCase is not, and folds
    // Turkish dotted I differently, which would change file names under a tr locale.
    assert.deepEqual(offenders, []);
  });

  test('emitted header order is by code point, so mixed case cannot reorder per machine', () => {
    const m = model({
      collection: {
        headers: [
          { name: 'X-Trace', value: '1', source: 'declared' },
          { name: 'accept', value: 'application/json', source: 'declared' },
          { name: 'Content-Type', value: 'application/json', source: 'declared' },
        ],
      },
      endpoints: [endpoint({})],
    });
    const { files } = planFiles(m, {});
    const collection = files.find((f) => f.relPath.endsWith('collection.bru'));
    // Only the headers block: `meta` and `auth` have their own `name:`/`mode:` keys.
    const block = /headers\s*\{([^}]*)\}/.exec(collection.content);
    assert.ok(block, `no headers block in:\n${collection.content}`);
    const order = [...block[1].matchAll(/^\s*([A-Za-z][A-Za-z0-9-]*):/gm)].map((x) => x[1].toLowerCase());
    assert.deepEqual(order, ['accept', 'content-type', 'x-trace'], 'sanity: these are the three headers');
    const sorted = [...order].sort((a, b) => byCodepoint(a, b));
    assert.deepEqual(order, sorted, `header order must be stable: ${order.join(', ')}`);
  });

  test('planned files come back in a locale-independent order', () => {
    const m = model({
      endpoints: [
        endpoint({ endpointKey: 'GET /api/Beta', name: 'Beta', pathTemplate: '/Beta' }),
        endpoint({ endpointKey: 'GET /api/alpha', name: 'alpha', pathTemplate: '/alpha' }),
      ],
    });
    const { files } = planFiles(m, {});
    const paths = files.map((f) => f.relPath);
    const sorted = [...paths].sort((a, b) => byCodepoint(a, b));
    assert.deepEqual(paths, sorted);
  });
});

// =============================================================================================
describe('paths are always forward-slash, whatever the host', () => {
  test('every planned relPath uses forward slashes only', () => {
    const m = model({
      folders: [{ id: 'w', name: 'widgets', auth: 'inherit', seq: 1, source: 'source:namespace' }],
      endpoints: [endpoint({ folderId: 'w', endpointKey: 'GET /api/widgets', pathTemplate: '/widgets' })],
    });
    const { files } = planFiles(m, {});
    for (const f of files) {
      assert.equal(f.relPath.includes('\\'), false, `backslash in ${f.relPath}`);
      assert.equal(f.relPath.startsWith('/'), false, `must be relative: ${f.relPath}`);
    }
    assert.ok(files.some((f) => f.relPath.includes('widgets/')), 'a nested file should exist');
  });

  test('lockKey normalises the host separator away', () => {
    // On Windows `relative()` returns backslashes; a lockfile keyed that way would never match the
    // same collection on Linux, so every file would look new.
    const key = lockKey('C:/repo/x', 'C:/repo/x/bruno/widgets/get.bru');
    assert.equal(key, 'bruno/widgets/get.bru');
    assert.equal(key.includes('\\'), false);
  });

  test('safeRelPath joins with forward slashes and refuses to escape', () => {
    assert.equal(safeRelPath(['widgets', 'get widget']), 'widgets/get-widget');
    for (const bad of ['../outside', 'a/../../b', 'C:\\Windows', '/etc/passwd', '\\\\server\\share']) {
      assert.throws(() => safeRelPath([bad]), PathSafetyError, `should refuse ${bad}`);
    }
  });
});

// =============================================================================================
describe('unicode: macOS hands out NFD where Windows and Linux hand out NFC', () => {
  const nfc = 'caf\u00e9'; // café, composed
  const nfd = 'cafe\u0301'; // café, decomposed

  test('the two spellings are different strings but one file name', () => {
    assert.notEqual(nfc, nfd, 'if these were equal the test would prove nothing');
    assert.equal(safeSegment(nfc), safeSegment(nfd));
    assert.equal(collisionKey(nfc), collisionKey(nfd));
  });

  test('an environment named in either form lands on the same path', () => {
    const pathFor = (name) => {
      const { files } = planFiles(
        model({ collection: { environments: [{ name, vars: { baseUrl: 'http://x' }, secrets: [] }] } }),
        {},
      );
      return files.find((f) => f.kind === 'environment').relPath;
    };
    assert.equal(pathFor(nfc), pathFor(nfd));
  });
});

// =============================================================================================
describe('a CRLF checkout must not look like a human edit', () => {
  test('canonicalHash ignores line endings and trailing newlines', () => {
    const lf = 'meta {\n  name: X\n}\n';
    const crlf = 'meta {\r\n  name: X\r\n}\r\n';
    assert.equal(canonicalHash(lf), canonicalHash(crlf));
    assert.equal(canonicalHash(lf), canonicalHash(`${lf}\n\n`));
  });

  test('but real content differences still hash differently', () => {
    assert.notEqual(canonicalHash('meta {\n  name: X\n}\n'), canonicalHash('meta {\n  name: Y\n}\n'));
  });
});

// =============================================================================================
describe('Windows-specific filesystem rules, enforced on every platform', () => {
  test('reserved device names are escaped in any case', () => {
    for (const name of ['con', 'CON', 'Con', 'nul', 'AUX', 'com1', 'LPT9']) {
      const seg = safeSegment(name, { preserveCase: true });
      assert.match(seg, /-request$/, `${name} must not be written as a device name`);
    }
    assert.equal(safeSegment('console'), 'console', 'only the exact device names are reserved');
  });

  test('a trailing dot or space cannot survive, since Windows strips them silently', () => {
    assert.equal(/[. ]$/.test(safeSegment('widgets. ')), false);
    assert.equal(/[. ]$/.test(safeSegment('widgets. ', { preserveCase: true })), false);
  });

  test('an over-long path is refused rather than written', () => {
    const long = Array.from({ length: 12 }, (_, i) => `segment-number-${i}-with-padding`);
    assert.throws(() => safeRelPath(long), PathSafetyError);
    assert.ok(MAX_PATH < 260, 'the cap must leave room for the repository prefix');
  });

  test('a long segment is truncated deterministically, not randomly', () => {
    const name = 'a'.repeat(200);
    assert.equal(safeSegment(name, { key: 'k' }), safeSegment(name, { key: 'k' }));
    assert.ok(safeSegment(name, { key: 'k' }).length <= 60);
  });
});
