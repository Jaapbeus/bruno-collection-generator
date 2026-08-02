// The real-Bruno execution gate.
//
// Everything else in this suite proves we wrote the bytes we meant to write. That is not the same as
// proving the collection *works*. A file can be valid `.bru`, byte-identical to its golden, and still
// send a request with no auth header, a literal `{id}` in the path, or a disabled query parameter that
// went anyway. None of those are visible on disk.
//
// So: generate a collection with `apply`, point it at a loopback recorder, run it with Bruno's own CLI,
// and assert on what arrived. Bruno's CLI is the only thing that can resolve a `.bru` the way Bruno
// does — asserting against our own reimplementation of its variable resolution would prove nothing.
//
// The auth case is the one that matters most. Auth wiring is a 100%-failure mode: get it wrong and
// every request fails identically, while the collection looks perfect. Nothing else in this repository
// proves an `auth: inherit` request actually leaves with the collection's credential attached.
//
// Loopback only. No external host, no identity provider, no fixture on the network.

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { removeDir, runScopedBase, pruneStale } from './tmpdir.mjs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { startLoopback, requestTo, arrived } from './lib/loopback.mjs';

const pexec = promisify(execFile);

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CLI = join(repoRoot, 'plugins/bruno-gen-collection/skills/bruno-collection-generator/scripts/brunogen.mjs');
const tmpBase = runScopedBase(join(repoRoot, 'tests/.tmp/execution'));

const S = 'plugins/bruno-gen-collection/skills/bruno-collection-generator/scripts/lib/';
const { tagsFor } = await import(`../${S}emit.mjs`);
const { bruArgs, bruVersion, normaliseResults } = await import(`../${S}smoke.mjs`);
const { bruCommand, resolveBruExecutable } = await import(`../${S}bru-executable.mjs`);

const API_KEY = 'loopback-key-not-a-secret';
const ADMIN_KEY = 'loopback-admin-key-not-a-secret';
const BRU_INVOCATION = resolveBruExecutable({ excludeRoot: repoRoot });

/**
 * Every child process here is spawned ASYNCHRONOUSLY, and that is not a style preference.
 *
 * The loopback recorder lives in this process. `spawnSync` blocks the event loop for the whole life of
 * the child, so the server cannot accept a connection while the child is running: bru dials, nothing
 * ever accepts, and it sits there until its own socket timeout. The first version of this file did
 * exactly that and every request came back ECONNREFUSED or hung for two minutes.
 *
 * An out-of-process server would also work, but then the recorder could not be asserted on directly,
 * which is the entire point of it.
 */
async function runAsync(args, cwd = repoRoot) {
  try {
    const { stdout, stderr } = await pexec(process.execPath, [CLI, ...args], {
      cwd,
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
    });
    return { status: 0, out: `${stdout}${stderr}` };
  } catch (err) {
    return { status: err.code ?? 1, out: `${err.stdout ?? ''}${err.stderr ?? ''}` };
  }
}

async function bruRunAsync(args, cwd) {
  if (!BRU_INVOCATION) return { status: 1, out: 'Bruno CLI not installed' };
  const command = bruCommand(BRU_INVOCATION, args);
  try {
    const { stdout, stderr } = await pexec(command.command, command.args, {
      cwd,
      encoding: 'utf8',
      shell: false,
      maxBuffer: 16 * 1024 * 1024,
      timeout: 120000,
    });
    return { status: 0, out: `${stdout}${stderr}` };
  } catch (err) {
    return { status: err.code ?? 1, out: `${err.stdout ?? ''}${err.stderr ?? ''}` };
  }
}

/** The gate is required in CI but must not fail a bare development machine. */
const BRU = bruVersion({ invocation: BRU_INVOCATION });
const SKIP = BRU ? false : 'Bruno CLI not installed (npm i -g @usebruno/cli@4.0.0)';

/**
 * A model exercising the things that only show up at run time: collection auth inherited by a
 * request, a path parameter, a required and an optional query parameter, a JSON body, and a
 * destructive endpoint that must not be sent.
 */
function model(baseUrl) {
  const endpoint = (over) => ({
    folderId: null,
    tags: [],
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
    provenance: { $skeleton: 'hand-written for the execution gate', sourceRefs: [], fields: {} },
    confidence: 'high',
    flags: [],
    ...over,
  });

  return {
    modelVersion: 1,
    collection: {
      name: 'Execution gate',
      format: 'bru',
      outputDir: 'bruno',
      routePrefix: '/api',
      baseUrlVar: 'baseUrl',
      headers: [{ name: 'Accept', value: 'application/json', source: 'declared' }],
      auth: {
        mode: 'apikey',
        source: 'asked',
        apikey: { key: 'x-api-key', value: '{{apiKey}}', placement: 'header' },
      },
      environments: [{ name: 'local', vars: { baseUrl, apiKey: API_KEY, adminKey: ADMIN_KEY }, secrets: [] }],
    },
    folders: [],
    endpoints: [
      endpoint({
        endpointKey: 'GET /api/widgets',
        name: 'List widgets',
        method: 'GET',
        pathTemplate: '/widgets',
        summary: 'Inherits the collection api key.',
      }),
      endpoint({
        endpointKey: 'GET /api/widgets/{1}',
        name: 'Get widget',
        method: 'GET',
        pathTemplate: '/widgets/{id}',
        summary: 'Path parameter plus one required and one optional query parameter.',
        params: [
          {
            in: 'path', name: 'id', type: 'string', format: null, required: true, repeatable: false,
            enum: null, value: 'w-123', disabled: false, description: 'route token',
            source: 'synthesized', confidence: 'low',
          },
          {
            in: 'query', name: 'country', type: 'string', format: null, required: true, repeatable: false,
            enum: null, value: 'NL', disabled: false, description: 'required',
            source: 'declared', confidence: 'high',
          },
          {
            in: 'query', name: 'verbose', type: 'boolean', format: null, required: false, repeatable: false,
            enum: null, value: 'true', disabled: true, description: 'optional, disabled',
            source: 'declared', confidence: 'medium',
          },
        ],
      }),
      endpoint({
        endpointKey: 'POST /api/widgets',
        name: 'Create widget',
        method: 'POST',
        pathTemplate: '/widgets',
        summary: 'JSON body.',
        headers: [{ name: 'Content-Type', value: 'application/json', source: 'declared' }],
        body: {
          kind: 'json', contentType: 'application/json', typeName: 'CreateWidget',
          json: { widget_name: 'bolt', quantity: 12 }, source: 'declared', confidence: 'medium',
        },
      }),
      // Per-request auth, not inherited. This is the case a real run got wrong: the model wrote
      // {mode:'apikey', in:'header', name:'x-functions-key', value:'...'}, the schema accepted it,
      // and the file came out with `auth: apikey` and no credential block at all - so the request
      // went out unauthenticated and 401'd, with nothing in the collection explaining why.
      endpoint({
        endpointKey: 'GET /api/widgets/admin',
        name: 'Admin widget',
        method: 'GET',
        pathTemplate: '/widgets/admin',
        summary: 'Its own api key, not the collection one.',
        auth: {
          mode: 'apikey',
          source: 'asked',
          apikey: { key: 'x-admin-key', value: '{{adminKey}}', placement: 'header' },
        },
      }),
      endpoint({
        endpointKey: 'DELETE /api/widgets/{1}',
        name: 'Delete widget',
        method: 'DELETE',
        pathTemplate: '/widgets/{id}',
        summary: 'Destructive: must never be sent by a default run.',
        destructive: true,
        params: [{
          in: 'path', name: 'id', type: 'string', format: null, required: true, repeatable: false,
          enum: null, value: 'w-123', disabled: false, description: 'route token',
          source: 'synthesized', confidence: 'low',
        }],
      }),
    ],
    sources: [],
    warnings: [],
    unresolved: [],
    capability: [],
  };
}

let server;
let collectionRoot;

before(async () => {
  removeDir(tmpBase);
  pruneStale(tmpBase);
  mkdirSync(tmpBase, { recursive: true });
  server = await startLoopback();

  const repo = join(tmpBase, 'repo');
  mkdirSync(repo, { recursive: true });
  const modelPath = join(repo, 'model.json');
  writeFileSync(modelPath, `${JSON.stringify(model(server.baseUrl), null, 2)}\n`);

  const applied = await runAsync(['apply', '--root', repo, '--model', modelPath]);
  assert.equal(applied.status, 0, `apply failed:\n${applied.out}`);
  collectionRoot = join(repo, 'bruno');
});

after(async () => {
  await server?.close();
});

// =============================================================================================
describe('the destructive tag reaches the file', () => {
  test('a destructive endpoint is tagged, not merely flagged', () => {
    // --exclude-tags matches a tag. The IR carries a boolean, and for a while nothing bridged the
    // two, so `smoke` promised to skip destructive requests and sent them anyway.
    assert.deepEqual(tagsFor({ destructive: true, tags: [] }), ['destructive']);
    assert.deepEqual(tagsFor({ destructive: true, tags: ['destructive'] }), ['destructive'], 'no duplicate');
    assert.deepEqual(tagsFor({ destructive: false, tags: ['read'] }), ['read']);
    assert.deepEqual(tagsFor({}), []);
  });

  test('and it is written into the .bru', () => {
    const file = join(collectionRoot, 'delete-api-widgets-by-id.bru');
    assert.ok(existsSync(file), `expected the destructive request file; got:\n${file}`);
    assert.match(readFileSync(file, 'utf8'), /destructive/, 'the tag has to be in the file for bru to see it');
  });
});

// =============================================================================================
describe('an auth mode without its credential block is refused', () => {
  // The shape a real run produced, verbatim. It validated, and produced `auth: apikey` with no
  // credential block: accepted by Bruno, 401 on every call, nothing in the file to explain it.
  const WRONG = { mode: 'apikey', source: 'asked', in: 'header', name: 'x-functions-key', value: '{{functionKey}}' };

  test('the IR schema rejects it, naming the offending keys', async () => {
    const { validateModel } = await import(`../${S}model-validate.mjs`);
    const m = JSON.parse(JSON.stringify(model('http://127.0.0.1:1')));
    m.endpoints[0].auth = WRONG;
    const check = validateModel(m);
    assert.equal(check.ok, false, 'a mode with no credential block must not validate');
    assert.match(check.problems.join(' | '), /auth/i);
  });

  test('a correct apikey object still validates', async () => {
    const { validateModel } = await import(`../${S}model-validate.mjs`);
    const m = JSON.parse(JSON.stringify(model('http://127.0.0.1:1')));
    const check = validateModel(m);
    assert.equal(check.ok, true, check.problems?.join(' | '));
  });

  test('placement must be Bruno\'s own word, not "query"', async () => {
    const { validateModel } = await import(`../${S}model-validate.mjs`);
    const m = JSON.parse(JSON.stringify(model('http://127.0.0.1:1')));
    m.collection.auth.apikey.placement = 'query';
    assert.equal(validateModel(m).ok, false, '"query" is not a placement Bruno understands');
  });

  test('the writer refuses too, so no bypass can emit an unauthenticated request', async () => {
    const { authFor } = await import(`../${S}emit.mjs`);
    assert.throws(
      () => authFor({ endpointKey: 'GET /x', auth: WRONG }),
      /has no "apikey" block|would 401/,
    );
    // The forms that are fine.
    assert.deepEqual(authFor({ auth: 'inherit' }), { mode: 'inherit' });
    assert.equal(authFor({ auth: { mode: 'apikey', apikey: { key: 'k', value: 'v', placement: 'header' } } }).mode, 'apikey');
  });
});

// =============================================================================================
describe('bru run against a loopback recorder', { skip: SKIP }, () => {
  let reporter;

  before(async () => {
    server.reset();
    reporter = join(tmpBase, 'run.json');
    const r = await bruRunAsync(bruArgs({ env: 'local', reporterPath: reporter }), collectionRoot);
    if (server.requests.length === 0) {
      assert.fail(`nothing reached the recorder. bru said:\n${r.out}`);
    }
  });

  test('the reporter file is written where we asked', () => {
    assert.ok(existsSync(reporter), 'the CLI requires a path for --reporter-json; assert it honours it');
    const parsed = JSON.parse(readFileSync(reporter, 'utf8'));
    assert.ok(parsed, 'the reporter file must be parseable JSON');
  });

  test('every non-destructive request was attempted, and the destructive one was not', () => {
    assert.deepEqual(arrived(server.requests), [
      'GET /api/widgets',
      'GET /api/widgets/admin',
      'GET /api/widgets/w-123',
      'POST /api/widgets',
    ]);
    assert.equal(
      server.requests.some((r) => r.method === 'DELETE'),
      false,
      'a default run must never send a destructive request',
    );
  });

  test('the reporter records a 200 for every request', () => {
    // Asserted on the reporter, not on bru's exit status: measured here, `bru run` exits 0 even when
    // every single request fails with ECONNREFUSED. That is why `smoke` decides pass/fail by parsing
    // the reporter rather than trusting the process exit code.
    const rows = normaliseResults(JSON.parse(readFileSync(reporter, 'utf8')));
    assert.equal(rows.length, 4, `expected four results, got ${rows.length}`);
    for (const row of rows) {
      assert.equal(row.status, 200, `${row.method} ${row.url} came back ${row.status}`);
      assert.equal(row.passed, true);
    }
  });

  // ---- the case that matters most -----------------------------------------------------------
  test('an auth: inherit request arrives with the collection credential attached', () => {
    const listed = requestTo(server.requests, '/api/widgets');
    assert.ok(listed, 'the list request should have arrived');
    assert.equal(
      listed.headers['x-api-key'],
      API_KEY,
      `auth: inherit did not resolve. Headers seen: ${Object.keys(listed.headers).join(', ')}`,
    );
  });

  test('a per-request api key arrives, and does not fall back to the collection one', () => {
    const admin = requestTo(server.requests, '/api/widgets/admin');
    assert.ok(admin, 'the admin request should have arrived');
    assert.equal(
      admin.headers['x-admin-key'],
      ADMIN_KEY,
      `per-request apikey did not resolve. Headers seen: ${Object.keys(admin.headers).join(', ')}`,
    );
    assert.equal('x-api-key' in admin.headers, false, 'it declares its own auth, so it must not inherit');
  });

  test('collection-level headers arrive too', () => {
    const listed = requestTo(server.requests, '/api/widgets');
    assert.match(listed.headers.accept ?? '', /application\/json/);
  });

  test('the route prefix appears exactly once in the path that arrives', () => {
    for (const r of server.requests) {
      assert.equal(r.path.startsWith('/api/'), true, `missing prefix: ${r.path}`);
      assert.equal(r.path.indexOf('/api/'), r.path.lastIndexOf('/api/'), `doubled prefix: ${r.path}`);
    }
  });

  test('a path parameter is substituted, not sent literally', () => {
    const byId = server.requests.find((r) => r.path.includes('w-123'));
    assert.ok(byId, `no request carried the path value. Paths: ${server.requests.map((r) => r.path).join(', ')}`);
    assert.equal(/\{id\}/.test(byId.path), false, 'a literal {id} means the value never resolved');
  });

  test('a required query parameter is sent; a disabled optional one is not', () => {
    const byId = server.requests.find((r) => r.path.includes('w-123'));
    assert.equal(byId.query.country, 'NL');
    assert.equal('verbose' in byId.query, false, 'a ~-disabled parameter must stay out of the request');
  });

  test('the JSON body arrives as written', () => {
    const created = server.requests.find((r) => r.method === 'POST');
    assert.ok(created, 'the POST should have arrived');
    assert.deepEqual(created.body, { widget_name: 'bolt', quantity: 12 });
    assert.match(created.headers['content-type'] ?? '', /application\/json/);
  });
});

// =============================================================================================
describe('smoke drives the same run', { skip: SKIP }, () => {
  test('--yes runs it, and reports every request as attempted', async () => {
    server.reset();
    const r = await runAsync(['smoke', '--root', dirname(collectionRoot), '--env', 'local', '--yes']);
    assert.equal(r.status, 0, r.out);
    assert.equal(server.requests.length, 4, `expected four requests, saw ${server.requests.length}\n${r.out}`);
    assert.match(r.out, /4 requests attempted, none failed/);
  });

  test('without --yes nothing is sent at all', async () => {
    server.reset();
    const r = await runAsync(['smoke', '--root', dirname(collectionRoot), '--env', 'local']);
    assert.equal(r.status, 1);
    assert.match(r.out, /Nothing was sent/);
    assert.equal(server.requests.length, 0, 'the consent gate must be a real gate, not a warning');
  });

  test('--yes=false is also a refusal and sends nothing', async () => {
    server.reset();
    const r = await runAsync(['smoke', '--root', dirname(collectionRoot), '--env', 'local', '--yes=false']);
    assert.equal(r.status, 1);
    assert.match(r.out, /Nothing was sent/);
    assert.equal(server.requests.length, 0);
  });

  test('--var supplies a value at run time and is redacted when echoed back', async () => {
    server.reset();
    const r = await runAsync([
      'smoke', '--root', dirname(collectionRoot), '--env', 'local',
      '--var', 'apiKey=supplied-at-run-time',
    ]);
    // No --yes, so this is the consent path: the command is shown and nothing is sent.
    assert.match(r.out, /--env-var apiKey=…/, 'the value must never be printed back');
    assert.equal(/supplied-at-run-time/.test(r.out), false, 'a supplied secret must not reach the terminal');
    assert.equal(server.requests.length, 0);
  });

  test('--var reaches the request when the run goes ahead', async () => {
    server.reset();
    const r = await runAsync([
      'smoke', '--root', dirname(collectionRoot), '--env', 'local', '--yes',
      '--var', 'apiKey=supplied-at-run-time',
    ]);
    assert.equal(r.status, 0, r.out);
    const listed = requestTo(server.requests, '/api/widgets');
    assert.equal(
      listed.headers['x-api-key'],
      'supplied-at-run-time',
      'a value supplied with --var must override the environment file, which is the whole point: ' +
        'secrets are declared by name with no value',
    );
  });

  test('--var is passed as an argv value, including characters shells interpret', async () => {
    server.reset();
    const supplied = 'loopback-!%&()^"-value';
    const r = await runAsync([
      'smoke', '--root', dirname(collectionRoot), '--env', 'local', '--yes',
      '--var', `apiKey=${supplied}`,
    ]);
    assert.equal(r.status, 0, r.out);
    const listed = requestTo(server.requests, '/api/widgets');
    assert.equal(listed.headers['x-api-key'], supplied);
    assert.equal(r.out.includes(supplied), false, 'the value must not be echoed even on success');
  });

  test('--var without an = is refused before anything runs', async () => {
    server.reset();
    const pasted = 'pasted-credential-without-a-name';
    const r = await runAsync(['smoke', '--root', dirname(collectionRoot), '--env', 'local', '--yes', '--var', pasted]);
    assert.equal(r.status, 1);
    assert.match(r.out, /--var must be name=value/);
    assert.equal(r.out.includes(pasted), false, 'an invalid argument can still be a pasted credential');
    assert.equal(server.requests.length, 0);
  });
});

// =============================================================================================
describe('a failing endpoint is reported as a failure', { skip: SKIP }, () => {
  test('a 500 from the server does not pass as ok', async () => {
    const failing = await startLoopback({
      handler: (req, res) => {
        res.writeHead(500, { 'content-type': 'application/json' });
        res.end('{"error":"nope"}');
      },
    });
    try {
      const repo = join(tmpBase, 'failing');
      mkdirSync(repo, { recursive: true });
      const modelPath = join(repo, 'model.json');
      writeFileSync(modelPath, `${JSON.stringify(model(failing.baseUrl), null, 2)}\n`);
      const applied = await runAsync(['apply', '--root', repo, '--model', modelPath]);
      assert.equal(applied.status, 0, applied.out);

      const r = await runAsync(['smoke', '--root', repo, '--env', 'local', '--yes']);
      // The requests were still built and sent; what failed is the assert on the status code.
      assert.ok(failing.requests.length >= 3, `expected the requests to be sent, saw ${failing.requests.length}`);
      assert.equal(r.status, 1, `a run where every response is a 500 must not report success:\n${r.out}`);
      assert.match(r.out, /failed/);
    } finally {
      await failing.close();
    }
  });
});
