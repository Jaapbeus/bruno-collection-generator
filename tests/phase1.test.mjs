// Phase 1 tests: path safety, credential detection, endpoint identity, discovery, doctor.
// Run with: node --test tests/

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  safeSegment, safeRelPath, assertInside, assertPortableRelPath, resolveOutputDir, uniqueSegment,
  collisionKey, PathSafetyError,
} from '../plugins/bruno-gen-collection/skills/bruno-collection-generator/scripts/lib/paths.mjs';
import { classify, scanText, isPlaceholder } from '../plugins/bruno-gen-collection/skills/bruno-collection-generator/scripts/lib/secrets.mjs';
import { endpointKey, referencedVariables } from '../plugins/bruno-gen-collection/skills/bruno-collection-generator/scripts/lib/inventory.mjs';
import { findCollections, selectCollection } from '../plugins/bruno-gen-collection/skills/bruno-collection-generator/scripts/lib/format.mjs';
import { doctor, EXIT } from '../plugins/bruno-gen-collection/skills/bruno-collection-generator/scripts/lib/doctor.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fixtures = join(repoRoot, 'tests/fixtures');

describe('paths: segment safety', () => {
  test('slugifies deterministically', () => {
    assert.equal(safeSegment('List Purchase Prices'), 'list-purchase-prices');
    assert.equal(safeSegment('GET /v1/widgets'), 'get-v1-widgets');
    assert.equal(safeSegment('  spaced  out  '), 'spaced-out');
    assert.equal(safeSegment('List Purchase Prices'), safeSegment('List Purchase Prices'));
  });

  test('guards Windows reserved device names', () => {
    for (const name of ['con', 'CON', 'prn', 'aux', 'nul', 'com1', 'lpt9']) {
      const out = safeSegment(name);
      assert.ok(out.endsWith('-request'), `${name} -> ${out} should be suffixed`);
    }
  });

  test('never leaves a trailing dot or space', () => {
    for (const input of ['name.', 'name ', 'name. ', 'name...']) {
      const out = safeSegment(input);
      assert.doesNotMatch(out, /[. ]$/, `${JSON.stringify(input)} -> ${out}`);
    }
  });

  test('caps length but stays unique for long shared prefixes', () => {
    const a = safeSegment('a'.repeat(120), { key: 'A' });
    const b = safeSegment('a'.repeat(121), { key: 'B' });
    assert.ok(a.length <= 60, `length ${a.length}`);
    assert.notEqual(a, b, 'two long names sharing a prefix must not collide');
  });

  test('normalises unicode and folds case for collisions', () => {
    // NFD "é" and NFC "é" must produce the same segment.
    assert.equal(safeSegment('caf\u00e9'), safeSegment('cafe\u0301'));
    assert.equal(collisionKey('Widgets'), collisionKey('widgets'));
  });

  test('never produces an empty segment', () => {
    for (const input of ['', '---', '!!!', null, undefined]) {
      assert.ok(safeSegment(input, { key: 'k' }).length > 0, `${JSON.stringify(input)}`);
    }
  });
});

describe('paths: traversal refusal', () => {
  test('rejects parent-directory and absolute segments', () => {
    assert.throws(() => safeRelPath(['..', 'outside']), PathSafetyError);
    assert.throws(() => safeRelPath(['../../outside']), PathSafetyError);
    assert.throws(() => safeRelPath(['a/../../b']), PathSafetyError);
    assert.throws(() => safeRelPath(['/etc/passwd']), PathSafetyError);
    assert.throws(() => safeRelPath(['C:\\Windows\\system32']), PathSafetyError);
    assert.throws(() => safeRelPath(['a\0b']), PathSafetyError);
  });

  test('assertInside rejects a target outside the root', () => {
    assert.throws(() => assertInside(fixtures, join(repoRoot, 'package.json')), PathSafetyError);
    assert.throws(() => assertInside(fixtures, resolve(fixtures, '..', '..')), PathSafetyError);
  });

  test('assertInside accepts the root itself and a not-yet-created child', () => {
    assert.doesNotThrow(() => assertInside(fixtures, fixtures));
    assert.doesNotThrow(() => assertInside(fixtures, join(fixtures, 'does', 'not', 'exist.bru')));
  });

  test('resolveOutputDir refuses config that escapes the repo', () => {
    // output_dir comes from the repository under inspection, so it is untrusted input.
    assert.throws(() => resolveOutputDir(repoRoot, '../elsewhere'), PathSafetyError);
    assert.throws(() => resolveOutputDir(repoRoot, 'a/../../b'), PathSafetyError);
    assert.throws(() => resolveOutputDir(repoRoot, '/tmp/x'), PathSafetyError);
    assert.throws(() => resolveOutputDir(repoRoot, ''), PathSafetyError);
    assert.doesNotThrow(() => resolveOutputDir(repoRoot, 'bruno'));
    assert.doesNotThrow(() => resolveOutputDir(repoRoot, 'bruno/collection'));
  });

  test('uniqueSegment disambiguates without renumbering siblings', () => {
    const used = new Set();
    const first = uniqueSegment('widgets', used, 'GET /widgets');
    const second = uniqueSegment('widgets', used, 'GET /gadgets');
    assert.equal(first, 'widgets');
    assert.notEqual(second, 'widgets');
    // Stable: the same inputs always yield the same disambiguated name.
    const again = uniqueSegment('widgets', new Set(['widgets']), 'GET /gadgets');
    assert.equal(second, again);
  });

  test('existing paths must also be representable on Windows, macOS and Linux', () => {
    for (const path of ['CON.bru', 'folder/name.bru ', 'folder/a:b.bru', 'a\\b.bru', '../x.bru']) {
      assert.throws(() => assertPortableRelPath(path), PathSafetyError, path);
    }
    assert.doesNotThrow(() => assertPortableRelPath('Folder/my request.bru'));
  });
});

describe('secrets: classification', () => {
  test('flags credential-shaped values', () => {
    const cases = [
      ['x', 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJhIn0.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
      ['conn', 'AccountKey=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='],
      ['k', 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='],
      ['k', 'sk-AAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
      ['k', 'ghp_AAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
      ['k', 'AKIAAAAAAAAAAAAAAAAA'],
    ];
    for (const [key, value] of cases) {
      assert.equal(classify(key, value).secret, true, `${value.slice(0, 12)}... should be secret`);
    }
  });

  test('flags credential-shaped key names, including x-functions-key', () => {
    for (const key of ['clientSecret', 'password', 'x-functions-key', 'masterKey', 'Authorization', 'api_key']) {
      assert.equal(classify(key, 'some-long-enough-value').secret, true, key);
    }
  });

  test('does NOT flag documented substitution markers or variable references', () => {
    // Stripping these breaks the request for a reason the user cannot see.
    for (const value of ['__APIKEY__', '{{clientSecret}}', '${API_KEY}', '<your-key>', 'changeme', '']) {
      assert.equal(classify('api-Key', value).secret, false, value);
      assert.equal(isPlaceholder(value), true, value);
    }
  });

  test('does not flag ordinary short values under an innocent key', () => {
    assert.equal(classify('country', 'NL').secret, false);
    assert.equal(classify('limit', '50').secret, false);
  });
});

describe('secrets: scanning never leaks the value', () => {
  const planted = join(fixtures, 'planted-secrets');

  test('finds every planted credential in the fixture', () => {
    const hits = [];
    for (const file of readdirSync(planted)) {
      if (!file.endsWith('.bru')) continue;
      const text = readFileSync(join(planted, file), 'utf8');
      for (const f of scanText(text)) hits.push({ file, ...f });
    }
    const reasons = hits.map((h) => h.reason).join('|');
    assert.match(reasons, /JWT/, 'JWT not detected');
    assert.match(reasons, /base64/, 'base64 key not detected');
    assert.ok(hits.length >= 2, `expected at least 2 findings, got ${hits.length}`);
  });

  test('a finding never contains the secret value', () => {
    const text = readFileSync(join(planted, 'admin-restart.bru'), 'utf8');
    const secret = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';
    assert.ok(text.includes(secret), 'fixture should contain the planted value');
    for (const f of scanText(text)) {
      const serialised = JSON.stringify(f);
      assert.ok(!serialised.includes(secret), `finding leaked the value: ${serialised}`);
    }
  });

  test('the marker fixture yields no finding for __APIKEY__', () => {
    const text = readFileSync(join(planted, 'token-and-marker.bru'), 'utf8');
    const findings = scanText(text);
    assert.ok(!findings.some((f) => f.key === 'api-Key'), 'api-Key: __APIKEY__ must not be flagged');
  });
});

describe('endpoint identity', () => {
  test('is stable when a path parameter is renamed', () => {
    // The whole point: renaming {id} to {widgetId} is the same endpoint, not a delete plus add.
    const a = endpointKey('GET', '{{baseUrl}}/v1/widgets/:id/prices');
    const b = endpointKey('GET', '{{baseUrl}}/v1/widgets/:widgetId/prices');
    const c = endpointKey('GET', '{{baseUrl}}/v1/widgets/{widgetId}/prices');
    assert.equal(a, b);
    assert.equal(b, c);
    assert.equal(a, 'GET /v1/widgets/{1}/prices');
  });

  test('changes when a literal segment changes', () => {
    assert.notEqual(
      endpointKey('GET', '{{baseUrl}}/v1/widgets'),
      endpointKey('GET', '{{baseUrl}}/v1/gadgets'),
    );
  });

  test('ignores the query string and the base URL variable', () => {
    assert.equal(
      endpointKey('GET', '{{baseUrl}}/v1/widgets?country=NL&limit=5'),
      endpointKey('GET', '{{host}}/v1/widgets'),
    );
  });

  test('ignores an absolute host and normalises the method', () => {
    assert.equal(
      endpointKey('get', 'https://api.example.com/v1/widgets'),
      endpointKey('GET', '{{baseUrl}}/v1/widgets'),
    );
  });

  test('numbers multiple parameters by order', () => {
    assert.equal(
      endpointKey('GET', '{{baseUrl}}/a/:one/b/:two'),
      'GET /a/{1}/b/{2}',
    );
  });

  test('collects referenced variables', () => {
    const item = { request: { url: '{{baseUrl}}/x', headers: [{ name: 'A', value: 'Bearer {{tok}}' }] } };
    assert.deepEqual([...referencedVariables(item)].sort(), ['baseUrl', 'tok']);
  });
});

describe('collection discovery', () => {
  test('detects the bru format from bruno.json', () => {
    const found = findCollections(join(fixtures, 'collection-bru'));
    assert.equal(found.length, 1);
    assert.equal(found[0].format, 'bru');
    assert.equal(found[0].name, 'Widget API');
  });

  test('detects the yml format from opencollection.yml', () => {
    const found = findCollections(join(fixtures, 'collection-yml'));
    assert.equal(found.length, 1);
    assert.equal(found[0].format, 'yml');
  });

  test('finds nothing where there is no collection', () => {
    assert.equal(findCollections(join(fixtures, 'no-collection')).length, 0);
  });

  test('a single collection wins outright, never prompting', () => {
    const found = findCollections(join(fixtures, 'collection-bru'));
    const { collection, ambiguous } = selectCollection(found);
    assert.ok(collection, 'one collection must be selected without asking');
    assert.equal(ambiguous, undefined);
  });
});

describe('doctor', () => {
  /** Hash every file in a tree so we can prove nothing was touched. */
  const snapshot = (dir) => {
    const out = [];
    const walk = (d) => {
      for (const e of readdirSync(d, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
        const p = join(d, e.name);
        if (e.isDirectory()) walk(p);
        else out.push(`${p}:${statSync(p).size}:${createHash('sha256').update(readFileSync(p)).digest('hex')}`);
      }
    };
    walk(dir);
    return out.join('\n');
  };

  test('is read-only: not one byte changes', () => {
    for (const name of ['collection-bru', 'collection-yml', 'planted-secrets']) {
      const dir = join(fixtures, name);
      const before = snapshot(dir);
      doctor({ root: dir });
      assert.equal(snapshot(dir), before, `${name} was modified by doctor`);
    }
  });

  test('exits 0 on a healthy collection and reports no problems', () => {
    const { exitCode, result } = doctor({ root: join(fixtures, 'collection-bru') });
    assert.equal(exitCode, EXIT.OK);
    assert.equal(result.counts.parsed, 3);
    assert.equal(result.secretFindings.length, 0);
    assert.equal(result.duplicateKeys.length, 0);
    assert.equal(result.undeclaredVariables.length, 0);
  });

  test('exits 2 when there is no collection at all', () => {
    const { exitCode } = doctor({ root: join(fixtures, 'no-collection') });
    assert.equal(exitCode, EXIT.NO_SURFACE);
  });

  test('reports every diagnostic class on the planted fixture', () => {
    const { result } = doctor({ root: join(fixtures, 'planted-secrets') });
    assert.ok(result.secretFindings.length >= 2, 'credentials');
    assert.ok(result.secretFindings.some((f) => f.path === 'collection.bru'), 'collection-level credential');
    assert.ok(result.duplicateKeys.length >= 1, 'duplicate endpointKey');
    assert.ok(result.duplicateSeq.length >= 1, 'duplicate seq');
    assert.ok(result.undeclaredVariables.some((v) => v.name === 'apiToken'), 'undeclared variable');
    assert.ok(
      result.undeclaredVariables.some((v) => v.name === 'rootToken' && v.paths.includes('collection.bru')),
      'inherited collection auth variable',
    );
  });

  test('json output carries locations but never a value', () => {
    const { result } = doctor({ root: join(fixtures, 'planted-secrets') });
    const serialised = JSON.stringify(result);
    assert.ok(!serialised.includes('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='), 'leaked base64 key');
    assert.ok(!serialised.includes('eyJhbGciOiJub25lIn0'), 'leaked JWT');
    for (const f of result.secretFindings) {
      assert.ok(typeof f.line === 'number' && f.line > 0, 'finding must carry a line number');
      assert.ok(!('value' in f), 'finding must not have a value field');
    }
  });

  test('parses both formats through filestore, reporting the same shape', () => {
    const bru = doctor({ root: join(fixtures, 'collection-bru') }).result;
    const yml = doctor({ root: join(fixtures, 'collection-yml') }).result;
    assert.equal(bru.collection.format, 'bru');
    assert.equal(yml.collection.format, 'yml');
    const pick = (r) => r.requests.find((x) => x.endpointKey === 'GET /v1/widgets');
    assert.ok(pick(bru), 'bru list request');
    assert.ok(pick(yml), 'yml list request');
    assert.equal(pick(bru).endpointKey, pick(yml).endpointKey);
  });
});
