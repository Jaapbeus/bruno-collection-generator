// Phase 2: the merge contract. These are the tests the product exists to pass.

import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, readdirSync, renameSync, statSync } from 'node:fs';
import { removeDir, runScopedBase, pruneStale } from './tmpdir.mjs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { hostname } from 'node:os';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CLI = join(repoRoot, 'plugins/bruno-gen-collection/skills/bruno-collection-generator/scripts/brunogen.mjs');
const tmpBase = runScopedBase(join(repoRoot, 'tests/.tmp/phase2'));

const S = 'plugins/bruno-gen-collection/skills/bruno-collection-generator/scripts/lib/';
const { planFiles, buildUrl, deriveFileName, fullPath } = await import(`../${S}emit.mjs`);
const { canonicalHash, readLock } = await import(`../${S}lockfile.mjs`);
const { acquire, RunLockError, lockFileFor } = await import(`../${S}runlock.mjs`);

const run = (args, cwd) => {
  const r = spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8', cwd });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
};

/** A small but realistic model: query params, a path param, a JSON body, oauth2, a secret. */
const model = (overrides = {}) => ({
  modelVersion: 1,
  collection: {
    name: 'Widget API',
    format: 'bru',
    outputDir: 'bruno',
    routePrefix: '/v1',
    baseUrlVar: 'baseUrl',
    headers: [{ name: 'Accept', value: 'application/json' }],
    auth: { mode: 'bearer', source: 'asked', bearer: { token: '{{accessToken}}' } },
    environments: [
      { name: 'local', vars: { baseUrl: 'http://127.0.0.1:8080' }, secrets: ['accessToken'] },
    ],
    docs: 'Synthetic model for tests.',
  },
  folders: [{ id: 'widgets', name: 'widgets', seq: 1 }],
  endpoints: [
    {
      endpointKey: 'GET /v1/widgets',
      name: 'List widgets',
      method: 'GET',
      pathTemplate: '/widgets',
      folderId: 'widgets',
      summary: 'List widgets for a country.',
      params: [
        { in: 'query', name: 'country', required: true, value: 'NL', enum: ['NL', 'BE'], description: 'ISO 3166-1 alpha-2' },
        { in: 'query', name: 'limit', required: false, value: '50', disabled: true },
      ],
      auth: 'inherit',
    },
    {
      endpointKey: 'GET /v1/widgets/{1}',
      name: 'Get widget',
      method: 'GET',
      pathTemplate: '/widgets/{widgetId}',
      folderId: 'widgets',
      params: [{ in: 'path', name: 'widgetId', required: true, value: '00000000-0000-0000-0000-000000000000' }],
      auth: 'inherit',
    },
    {
      endpointKey: 'POST /v1/widgets',
      name: 'Create widget',
      method: 'POST',
      pathTemplate: '/widgets',
      folderId: 'widgets',
      headers: [{ name: 'Content-Type', value: 'application/json' }],
      body: { kind: 'json', json: { name: 'bolt', size: 42 }, source: 'observed', confidence: 'high' },
      auth: 'inherit',
    },
  ],
  ...overrides,
});

let caseId = 0;
function workspace(m = model()) {
  const dir = join(tmpBase, `case-${++caseId}`);
  removeDir(dir);
  mkdirSync(dir, { recursive: true });
  const modelPath = join(dir, 'api-model.json');
  writeFileSync(modelPath, JSON.stringify(m, null, 2));
  return { dir, modelPath };
}

const snapshot = (dir) => {
  if (!existsSync(dir)) return '';
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else out.push(`${p.slice(dir.length)}:${createHash('sha256').update(readFileSync(p)).digest('hex')}`);
    }
  };
  walk(dir);
  return out.join('\n');
};

before(() => {
  removeDir(tmpBase);
  pruneStale(tmpBase);
});

describe('emit: URL and path composition', () => {
  test('routePrefix is applied exactly once', () => {
    const m = model();
    const url = buildUrl(m.collection, m.endpoints[1]);
    assert.equal(url, '{{baseUrl}}/v1/widgets/:widgetId');
    assert.ok(!url.includes('/v1/v1'), 'prefix applied twice');
  });

  test('required query params appear in the URL, optional ones do not', () => {
    const m = model();
    const url = buildUrl(m.collection, m.endpoints[0]);
    assert.equal(url, '{{baseUrl}}/v1/widgets?country=NL');
    assert.ok(!url.includes('limit'), 'a disabled optional param must not be in the URL');
  });

  test('file names are readable and derived from the route, not the display name', () => {
    const m = model();
    assert.equal(deriveFileName(m.collection, m.endpoints[1]), 'get-v1-widgets-by-widgetid');
    const renamed = { ...m.endpoints[1], name: 'Completely Different Name' };
    assert.equal(deriveFileName(m.collection, renamed), 'get-v1-widgets-by-widgetid');
  });

  test('fullPath composes prefix and template once', () => {
    assert.equal(fullPath({ routePrefix: '/api' }, { pathTemplate: '/ping' }), '/api/ping');
    assert.equal(fullPath({ routePrefix: '' }, { pathTemplate: '/ping' }), '/ping');
    assert.equal(fullPath({ routePrefix: '/api' }, { pathTemplate: '/' }), '/api');
  });
});

describe('apply: first run', () => {
  test('writes a complete collection and a lockfile', () => {
    const { dir, modelPath } = workspace();
    const { code, out } = run(['apply', '--root', dir, '--model', modelPath], dir);
    assert.equal(code, 0, out);

    const bruno = join(dir, 'bruno');
    for (const rel of [
      'bruno.json',
      'collection.bru',
      'environments/local.bru',
      'widgets/folder.bru',
      'widgets/get-v1-widgets.bru',
      'widgets/get-v1-widgets-by-widgetid.bru',
      'widgets/post-v1-widgets.bru',
      '.bruno-gen/lock.json',
    ]) {
      assert.ok(existsSync(join(bruno, rel)), `missing ${rel}\n${out}`);
    }
    const lock = JSON.parse(readFileSync(join(bruno, '.bruno-gen/lock.json'), 'utf8'));
    assert.equal(lock.generatorVersion, '2.0.0-alpha.10');
  });

  test('generated files carry no timestamp', () => {
    const { dir, modelPath } = workspace();
    run(['apply', '--root', dir, '--model', modelPath], dir);
    const bruno = join(dir, 'bruno');
    const walk = (d, acc = []) => {
      for (const e of readdirSync(d, { withFileTypes: true })) {
        const p = join(d, e.name);
        if (e.isDirectory()) walk(p, acc);
        else acc.push(p);
      }
      return acc;
    };
    for (const f of walk(bruno)) {
      if (f.includes('.bruno-gen')) continue; // the lockfile may record versions, not times
      const text = readFileSync(f, 'utf8');
      assert.doesNotMatch(text, /\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/, `${f} contains a clock reading`);
    }
  });

  test('a secret is declared by name with no value', () => {
    const { dir, modelPath } = workspace();
    run(['apply', '--root', dir, '--model', modelPath], dir);
    const env = readFileSync(join(dir, 'bruno/environments/local.bru'), 'utf8');
    assert.match(env, /vars:secret \[\s*accessToken\s*\]/);
    assert.match(env, /baseUrl: http:\/\/127\.0\.0\.1:8080/);
  });
});

describe('apply: the zero-diff guarantee', () => {
  test('a second apply writes nothing at all, lockfile included', () => {
    const { dir, modelPath } = workspace();
    run(['apply', '--root', dir, '--model', modelPath], dir);
    const before = snapshot(join(dir, 'bruno'));

    const second = run(['apply', '--root', dir, '--model', modelPath], dir);
    assert.equal(second.code, 0, second.out);
    assert.equal(snapshot(join(dir, 'bruno')), before, 'the second apply changed bytes');
    assert.match(second.out, /Nothing changed on disk/);
  });

  test('plan on an up-to-date collection reports a no-op and writes nothing', () => {
    const { dir, modelPath } = workspace();
    run(['apply', '--root', dir, '--model', modelPath], dir);
    const before = snapshot(join(dir, 'bruno'));
    const { code, out } = run(['plan', '--root', dir, '--model', modelPath], dir);
    assert.equal(code, 0, out);
    assert.match(out, /would change nothing/);
    assert.equal(snapshot(join(dir, 'bruno')), before);
  });
});

describe('apply: your edits survive', () => {
  test('an edited request is kept, not overwritten, and is reported', () => {
    const { dir, modelPath } = workspace();
    run(['apply', '--root', dir, '--model', modelPath], dir);

    const target = join(dir, 'bruno/widgets/get-v1-widgets.bru');
    const edited = readFileSync(target, 'utf8').replace('country: NL', 'country: BE');
    writeFileSync(target, edited);

    const { code, out } = run(['apply', '--root', dir, '--model', modelPath], dir);
    assert.equal(code, 0, out);
    assert.equal(readFileSync(target, 'utf8'), edited, 'your edit was overwritten');
    assert.match(out, /kept .*get-v1-widgets\.bru/);
  });

  test('a value typed into an environment is never rewritten', () => {
    const { dir, modelPath } = workspace();
    run(['apply', '--root', dir, '--model', modelPath], dir);

    const env = join(dir, 'bruno/environments/local.bru');
    const withValue = readFileSync(env, 'utf8').replace(
      'baseUrl: http://127.0.0.1:8080',
      'baseUrl: https://staging.example.com',
    );
    writeFileSync(env, withValue);

    run(['apply', '--root', dir, '--model', modelPath], dir);
    assert.match(readFileSync(env, 'utf8'), /staging\.example\.com/, 'your environment value was lost');
  });

  test('a hand-added file is left alone', () => {
    const { dir, modelPath } = workspace();
    run(['apply', '--root', dir, '--model', modelPath], dir);

    const mine = join(dir, 'bruno/widgets/my-own-request.bru');
    const content = readFileSync(join(dir, 'bruno/widgets/get-v1-widgets.bru'), 'utf8')
      .replace('name: List widgets', 'name: My own request');
    writeFileSync(mine, content);

    const { out } = run(['apply', '--root', dir, '--model', modelPath], dir);
    assert.equal(readFileSync(mine, 'utf8'), content, 'a hand-added file was modified');
    assert.match(out, /yours .*my-own-request\.bru/);
  });

  test('--reset accepts generated content for a file you edited', () => {
    const { dir, modelPath } = workspace();
    run(['apply', '--root', dir, '--model', modelPath], dir);
    const target = join(dir, 'bruno/widgets/get-v1-widgets.bru');
    const original = readFileSync(target, 'utf8');
    writeFileSync(target, original.replace('country: NL', 'country: ZZ'));

    const { code, out } = run(
      ['apply', '--root', dir, '--model', modelPath, '--reset', 'widgets/get-v1-widgets.bru'],
      dir,
    );
    assert.equal(code, 0, out);
    assert.equal(readFileSync(target, 'utf8'), original, '--reset did not restore generated content');
  });

  test('--reset accepts the on-disk spelling when only filename case differs', () => {
    const { dir, modelPath } = workspace();
    assert.equal(run(['apply', '--root', dir, '--model', modelPath], dir).code, 0);
    const lower = join(dir, 'bruno/widgets/get-v1-widgets.bru');
    const temporary = join(dir, 'bruno/widgets/case-rename.tmp');
    const upper = join(dir, 'bruno/widgets/GET-V1-WIDGETS.bru');
    renameSync(lower, temporary);
    renameSync(temporary, upper);
    writeFileSync(upper, readFileSync(upper, 'utf8').replace('country: NL', 'country: ZZ'));

    const reset = run([
      'apply', '--root', dir, '--model', modelPath, '--reset', 'widgets/GET-V1-WIDGETS.bru',
    ], dir);
    assert.equal(reset.code, 0, reset.out);
    assert.doesNotMatch(readFileSync(upper, 'utf8'), /country: ZZ/);
    const names = readdirSync(join(dir, 'bruno/widgets'));
    assert.ok(names.includes('GET-V1-WIDGETS.bru'), 'the existing case spelling must remain authoritative');
    assert.equal(names.includes('get-v1-widgets.bru'), false);
  });
});

describe('apply: removals are reported, never silent', () => {
  test('an endpoint dropped from the model becomes an orphan and stays on disk', () => {
    const { dir, modelPath } = workspace();
    run(['apply', '--root', dir, '--model', modelPath], dir);

    const reduced = model();
    reduced.endpoints = reduced.endpoints.filter((e) => e.endpointKey !== 'POST /v1/widgets');
    writeFileSync(modelPath, JSON.stringify(reduced, null, 2));

    const { code, out } = run(['apply', '--root', dir, '--model', modelPath], dir);
    assert.equal(code, 0, out);
    assert.ok(existsSync(join(dir, 'bruno/widgets/post-v1-widgets.bru')), 'an orphan was deleted');
    assert.match(out, /orphan .*post-v1-widgets\.bru/);
  });

  test('--prune removes only a machine-owned, unmodified orphan', () => {
    const { dir, modelPath } = workspace();
    run(['apply', '--root', dir, '--model', modelPath], dir);
    const reduced = model();
    reduced.endpoints = reduced.endpoints.filter((e) => e.endpointKey !== 'POST /v1/widgets');
    writeFileSync(modelPath, JSON.stringify(reduced, null, 2));

    const orphan = 'widgets/post-v1-widgets.bru';
    const { code, out } = run(['apply', '--root', dir, '--model', modelPath, '--prune', orphan], dir);
    assert.equal(code, 0, out);
    assert.ok(!existsSync(join(dir, 'bruno', orphan)), '--prune did not remove the orphan');
  });

  test('--prune refuses a file you edited', () => {
    const { dir, modelPath } = workspace();
    run(['apply', '--root', dir, '--model', modelPath], dir);
    const orphanPath = join(dir, 'bruno/widgets/post-v1-widgets.bru');
    // A substantive edit. Appending a newline would NOT count: the canonical hash deliberately
    // ignores trailing newlines and CR, so that a Windows checkout does not look hand-edited.
    writeFileSync(orphanPath, readFileSync(orphanPath, 'utf8').replace('"size": 42', '"size": 99'));

    const reduced = model();
    reduced.endpoints = reduced.endpoints.filter((e) => e.endpointKey !== 'POST /v1/widgets');
    writeFileSync(modelPath, JSON.stringify(reduced, null, 2));

    const { code, out } = run(
      ['apply', '--root', dir, '--model', modelPath, '--prune', 'widgets/post-v1-widgets.bru'],
      dir,
    );
    assert.equal(code, 1, out);
    assert.match(out, /you edited it/);
    assert.ok(existsSync(orphanPath), 'an edited orphan was deleted');
  });
});

describe('adopt', () => {
  test('refuses to write beside an unowned collection until adopted', () => {
    const { dir, modelPath } = workspace();
    // A collection with no lockfile, as if produced by another tool.
    run(['apply', '--root', dir, '--model', modelPath], dir);
    rmSync(join(dir, 'bruno/.bruno-gen'), { recursive: true, force: true });

    const { code, out } = run(['apply', '--root', dir, '--model', modelPath], dir);
    assert.equal(code, 1, out);
    assert.match(out, /Refusing to write/);
    assert.match(out, /adopt/);
  });

  test('adopt then apply changes nothing but adds what is missing', () => {
    const { dir, modelPath } = workspace();
    run(['apply', '--root', dir, '--model', modelPath], dir);
    rmSync(join(dir, 'bruno/.bruno-gen'), { recursive: true, force: true });

    const adopted = run(['adopt', '--root', dir], dir);
    assert.equal(adopted.code, 0, adopted.out);
    const adoptedLock = readLock(join(dir, 'bruno'));
    assert.equal(adoptedLock.folders['widgets/folder.bru']?.hash, 'adopted');

    const before = snapshot(join(dir, 'bruno'));
    const applied = run(['apply', '--root', dir, '--model', modelPath], dir);
    assert.equal(applied.code, 0, applied.out);

    // Every pre-existing file must be untouched; only the lockfile may appear.
    const after = snapshot(join(dir, 'bruno'));
    const changed = after
      .split('\n')
      .filter((line) => !before.split('\n').includes(line))
      .filter((line) => !line.includes('.bruno-gen'));
    assert.deepEqual(changed, [], `adopt+apply modified files:\n${changed.join('\n')}`);
  });

  test('adopt marks a duplicate endpoint as a variant', () => {
    const { dir, modelPath } = workspace();
    run(['apply', '--root', dir, '--model', modelPath], dir);
    // A second file for the same endpoint, as a user would create for a variant call.
    const src = join(dir, 'bruno/widgets/get-v1-widgets.bru');
    writeFileSync(
      join(dir, 'bruno/widgets/get-v1-widgets-dryrun.bru'),
      readFileSync(src, 'utf8').replace('name: List widgets', 'name: List widgets (dry run)'),
    );
    rmSync(join(dir, 'bruno/.bruno-gen'), { recursive: true, force: true });

    const { code, out } = run(['adopt', '--root', dir], dir);
    assert.equal(code, 0, out);
    assert.match(out, /variant/);
    const lock = readLock(join(dir, 'bruno'));
    const variants = Object.values(lock.requests).filter((r) => r.variant);
    assert.equal(variants.length, 1, 'exactly one of the two files should be the variant');
  });

  test('adopt refuses names that collapse to one path on another supported OS', (t) => {
    const { dir, modelPath } = workspace();
    assert.equal(run(['apply', '--root', dir, '--model', modelPath], dir).code, 0);
    const folder = join(dir, 'bruno/widgets');
    const source = readFileSync(join(folder, 'get-v1-widgets.bru'), 'utf8');
    writeFileSync(join(folder, 'CaseVariant.bru'), source);
    writeFileSync(join(folder, 'casevariant.bru'), source);
    const spellings = readdirSync(folder).filter((name) => name.toLowerCase() === 'casevariant.bru');
    if (spellings.length < 2) {
      t.skip('the test volume is case-insensitive');
      return;
    }
    rmSync(join(dir, 'bruno/.bruno-gen'), { recursive: true, force: true });

    const result = run(['adopt', '--root', dir], dir);
    assert.equal(result.code, 1, result.out);
    assert.match(result.out, /collide on Windows or default macOS filesystems/);
    assert.equal(existsSync(join(dir, 'bruno/.bruno-gen/lock.json')), false);
  });

  test('a request renamed to a completely different basename is recognised and not duplicated', () => {
    const { dir, modelPath } = workspace();
    assert.equal(run(['apply', '--root', dir, '--model', modelPath], dir).code, 0);
    const original = join(dir, 'bruno/widgets/get-v1-widgets.bru');
    const renamed = join(dir, 'bruno/widgets/my-hand-tuned-list.bru');
    renameSync(original, renamed);

    const planned = run(['plan', '--root', dir, '--model', modelPath, '--json'], dir);
    assert.equal(planned.code, 0, planned.out);
    const result = JSON.parse(planned.out);
    const moved = result.decisions.filter((d) => d.status === 'moved');
    assert.deepEqual(moved.map((d) => d.movedTo), ['widgets/my-hand-tuned-list.bru']);
    assert.equal(
      result.decisions.some((d) => d.status === 'unmanaged' && d.relPath === 'widgets/my-hand-tuned-list.bru'),
      false,
      'one physical rename must not be reported twice',
    );

    const applied = run(['apply', '--root', dir, '--model', modelPath], dir);
    assert.equal(applied.code, 0, applied.out);
    assert.equal(existsSync(original), false, 'the generator must not restore a renamed request');
    assert.equal(existsSync(renamed), true, 'the user\'s renamed request must survive');
  });
});

describe('safety', () => {
  test('every written request parses back through filestore', () => {
    const { dir, modelPath } = workspace();
    run(['apply', '--root', dir, '--model', modelPath], dir);
    // apply verifies each file by re-parsing before rename; doctor proves it independently.
    const { code, out } = run(['doctor', '--root', join(dir, 'bruno')], dir);
    assert.equal(code, 0, out);
    assert.doesNotMatch(out, /unparseable/);
  });

  test('an invalid model is rejected with specific problems and writes nothing', () => {
    const bad = model();
    bad.endpoints[0].endpointKey = 'GET /wrong';
    const { dir, modelPath } = workspace(bad);
    const { code, out } = run(['apply', '--root', dir, '--model', modelPath], dir);
    assert.equal(code, 1, out);
    assert.match(out, /failed validation/);
    assert.ok(!existsSync(join(dir, 'bruno')), 'files were written despite an invalid model');
  });

  test('unsafe or colliding ownership metadata is rejected before it can authorise a write', () => {
    const { dir, modelPath } = workspace();
    assert.equal(run(['apply', '--root', dir, '--model', modelPath], dir).code, 0);
    const path = join(dir, 'bruno/.bruno-gen/lock.json');
    const lock = JSON.parse(readFileSync(path, 'utf8'));
    lock.requests['../outside.bru'] = { kind: 'request', hash: 'adopted' };
    writeFileSync(path, JSON.stringify(lock));

    const attempted = run(['apply', '--root', dir, '--model', modelPath], dir);
    assert.equal(attempted.code, 1, attempted.out);
    assert.match(attempted.out, /invalid ownership metadata.*unsafe path/);
    assert.equal(existsSync(join(dir, 'outside.bru')), false);
  });

  test('a second concurrent run is refused', () => {
    const { dir } = workspace();
    mkdirSync(join(dir, 'bruno'), { recursive: true });
    const held = acquire(join(dir, 'bruno'));
    try {
      assert.throws(() => acquire(join(dir, 'bruno')), RunLockError);
    } finally {
      held.release();
    }
    assert.ok(!existsSync(lockFileFor(join(dir, 'bruno'))), 'the lock was not released');
  });

  test('the CLI locks the actual collection, not merely the repository spelling', () => {
    const { dir, modelPath } = workspace();
    const held = acquire(join(dir, 'bruno'));
    try {
      const blocked = run(['apply', '--root', dir, '--model', modelPath], dir);
      assert.equal(blocked.code, 1, blocked.out);
      assert.match(blocked.out, /Another run holds the lock/);
    } finally {
      held.release();
    }
  });

  test('a live owner is never evicted only because the run is older than fifteen minutes', () => {
    const { dir } = workspace();
    const collection = join(dir, 'bruno');
    mkdirSync(collection, { recursive: true });
    const path = lockFileFor(collection);
    writeFileSync(path, JSON.stringify({
      pid: process.pid,
      host: hostname(),
      startedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      token: 'still-running',
    }));
    try {
      assert.throws(() => acquire(collection), RunLockError);
    } finally {
      rmSync(path, { force: true });
    }
  });

  test('release cannot delete a successor lock with the same pid', () => {
    const { dir } = workspace();
    const collection = join(dir, 'bruno');
    mkdirSync(collection, { recursive: true });
    const held = acquire(collection);
    writeFileSync(held.path, JSON.stringify({
      pid: process.pid,
      host: hostname(),
      startedAt: new Date().toISOString(),
      token: 'successor',
    }));
    held.release();
    try {
      assert.ok(existsSync(held.path), 'release removed a lock it no longer owned');
    } finally {
      rmSync(held.path, { force: true });
    }
  });

  test('lock identity follows the case semantics of the collection volume', () => {
    const { dir } = workspace();
    mkdirSync(join(dir, 'CaseProbe'));
    const caseInsensitive = existsSync(join(dir, 'caseprobe'));
    const upper = lockFileFor(join(dir, 'BRUNO'));
    const lower = lockFileFor(join(dir, 'bruno'));
    if (caseInsensitive) assert.equal(upper, lower);
    else assert.notEqual(upper, lower);
  });

  test('a stale lock is taken over with a notice', () => {
    const { dir } = workspace();
    mkdirSync(join(dir, 'bruno'), { recursive: true });
    const path = lockFileFor(join(dir, 'bruno'));
    writeFileSync(
      path,
      JSON.stringify({ pid: 999999, host: 'somewhere-else', startedAt: new Date(Date.now() - 3600_000).toISOString() }),
    );
    const notices = [];
    const held = acquire(join(dir, 'bruno'), { onNotice: (m) => notices.push(m) });
    try {
      assert.match(notices.join(' '), /stale run lock/);
    } finally {
      held.release();
    }
  });

  test('the canonical hash ignores line endings and trailing newlines', () => {
    // Without this, a Windows clone with core.autocrlf=true classifies every file as edited.
    assert.equal(canonicalHash('a: 1\nb: 2\n'), canonicalHash('a: 1\r\nb: 2\r\n'));
    assert.equal(canonicalHash('a: 1'), canonicalHash('a: 1\n\n'));
    assert.notEqual(canonicalHash('a: 1'), canonicalHash('a: 2'));
  });
});

describe('yml format', () => {
  test('produces opencollection.yml and no bruno.json', () => {
    const m = model();
    m.collection.format = 'yml';
    const { dir, modelPath } = workspace(m);
    const { code, out } = run(['apply', '--root', dir, '--model', modelPath], dir);
    assert.equal(code, 0, out);
    assert.ok(existsSync(join(dir, 'bruno/opencollection.yml')), 'no opencollection.yml');
    assert.ok(!existsSync(join(dir, 'bruno/bruno.json')), 'bruno.json must not exist in yml mode');
    assert.ok(existsSync(join(dir, 'bruno/widgets/get-v1-widgets.yml')));
  });

  test('the ignore list lands in extensions.bruno.ignore', () => {
    const m = model();
    m.collection.format = 'yml';
    const { dir, modelPath } = workspace(m);
    run(['apply', '--root', dir, '--model', modelPath], dir);
    const root = readFileSync(join(dir, 'bruno/opencollection.yml'), 'utf8');
    assert.match(root, /extensions:/);
    assert.match(root, /bruno:/);
    assert.match(root, /\.bruno-gen/);
  });

  test('yml is also zero-diff on a second apply', () => {
    const m = model();
    m.collection.format = 'yml';
    const { dir, modelPath } = workspace(m);
    run(['apply', '--root', dir, '--model', modelPath], dir);
    const before = snapshot(join(dir, 'bruno'));
    run(['apply', '--root', dir, '--model', modelPath], dir);
    assert.equal(snapshot(join(dir, 'bruno')), before);
  });
});
