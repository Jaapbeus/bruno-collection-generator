// Regressions found by a full-codebase review.
//
// Each test below is a defect that was reachable from ordinary use and that no existing test could
// see. They are grouped by the promise they broke, because that is what makes them worth keeping:
// a test named after a symptom gets deleted when the symptom moves, a test named after a promise
// does not.
//
// The four promises:
//   1. never write a credential
//   2. never lose the user's work
//   3. re-running changes nothing
//   4. what the report says is what happened

import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { chmodSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync, readdirSync, renameSync } from 'node:fs';
import { removeDir, runScopedBase, pruneStale } from './tmpdir.mjs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { hostname } from 'node:os';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CLI = join(repoRoot, 'plugins/bruno-gen-collection/skills/bruno-collection-generator/scripts/brunogen.mjs');
const tmpBase = runScopedBase(join(repoRoot, 'tests/.tmp/regressions'));

const S = 'plugins/bruno-gen-collection/skills/bruno-collection-generator/scripts/lib/';
const { classify, scanText, auditModel, isReference } = await import(`../${S}secrets.mjs`);
const { exampleFromSchema } = await import(`../${S}resolve-values.mjs`);
const { planFiles } = await import(`../${S}emit.mjs`);
const { validateModel } = await import(`../${S}model-validate.mjs`);
const { classify: classifySpec, KIND } = await import(`../${S}spec-parse.mjs`);
const { surfaceSignals } = await import(`../${S}signals.mjs`);
const { smoke, bruArgs, normaliseResults, redactText, redactUrl } = await import(`../${S}smoke.mjs`);
const { ingestViaConverter, ingestOpenApi } = await import(`../${S}ingest.mjs`);
const { probe } = await import(`../${S}probe.mjs`);
const { acquire, lockFileFor } = await import(`../${S}runlock.mjs`);
const { parseStrict } = await import(`../${S}deps.mjs`);
const { planMerge, STATUS } = await import(`../${S}plan.mjs`);
const { parseArgs } = await import(`../${S}cli-args.mjs`);
const { Report } = await import(`../${S}report.mjs`);
const { resolveBruExecutable } = await import(`../${S}bru-executable.mjs`);

// `out` is both streams, which is what most assertions here want. The two are also returned
// separately, because `--json` puts the payload on stdout and its notices on stderr - concatenating
// them and calling JSON.parse on the result fails on the notice.
const run = (args, cwd = repoRoot) => {
  const r = spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8', cwd });
  return { code: r.status, out: `${r.stdout}${r.stderr}`, stdout: r.stdout, stderr: r.stderr };
};

before(() => {
  removeDir(tmpBase);
  pruneStale(tmpBase);
});

let seq = 0;
const scratch = () => {
  const dir = join(tmpBase, `r${++seq}`);
  removeDir(dir);
  mkdirSync(dir, { recursive: true });
  return dir;
};

/** A 40-byte key, base64: 56 characters. What Azure Functions actually issues. */
const AZURE_KEY = 'AbCdEfGhIj0123456789KlMnOpQrStUvWxYz0123456789AbCdEfGh==';

const SPEC = {
  openapi: '3.0.0',
  info: { title: 'Regression API', version: '1.0.0' },
  servers: [{ url: 'https://api.example.com/v1' }],
  paths: { '/things': { get: { operationId: 'listThings', responses: { 200: { description: 'ok' } } } } },
};

/** A model whose auth declares one secret NAME, so the environment carve-out has something to add. */
const secretNameModel = () => ({
  modelVersion: 1,
  collection: {
    name: 'Secret name',
    format: 'bru',
    outputDir: 'bruno',
    routePrefix: '',
    baseUrlVar: 'baseUrl',
    headers: [],
    auth: { mode: 'apikey', source: 'asked', apikey: { key: 'x-functions-key', value: '{{functionKey}}', placement: 'header' } },
    environments: [{ name: 'dev', vars: { baseUrl: 'https://x.example.net' }, secrets: ['functionKey'] }],
  },
  folders: [],
  endpoints: [{
    endpointKey: 'GET /status',
    name: 'Status',
    method: 'GET',
    pathTemplate: '/status',
    params: [],
    body: { kind: 'none' },
    auth: { mode: 'inherit' },
    seq: 1,
  }],
  unresolved: [],
});

// =============================================================================================
describe('promise 1: a credential is never written', () => {
  test('a literal credential in bruno-gen.json is refused, not written', () => {
    const root = scratch();
    writeFileSync(join(root, 'openapi.json'), JSON.stringify(SPEC));
    writeFileSync(
      join(root, 'bruno-gen.json'),
      JSON.stringify({ environments: { dev: { vars: { baseUrl: 'https://x.example.net', functionKey: AZURE_KEY } } } }),
    );

    // Refused at ingest, so the user is told while looking at the command that read the settings.
    const ingested = run(['ingest', '--root', root, '--out', join(root, 'model.json')]);
    assert.equal(ingested.code, 1, ingested.out);
    assert.match(ingested.out, /Refusing to write/);
    assert.ok(!ingested.out.includes(AZURE_KEY), 'the value must never be echoed back');
  });

  test('and it is refused again at apply, so no path around ingest can write it', () => {
    const root = scratch();
    writeFileSync(join(root, 'openapi.json'), JSON.stringify(SPEC));
    // Build a clean model first, then add the credential to the config afterwards.
    assert.equal(run(['ingest', '--root', root, '--out', join(root, 'model.json')]).code, 0);
    writeFileSync(
      join(root, 'bruno-gen.json'),
      JSON.stringify({ headers: { Authorization: `Bearer ${AZURE_KEY}` } }),
    );

    const applied = run(['apply', '--root', root, '--model', join(root, 'model.json')]);
    assert.equal(applied.code, 1, applied.out);
    assert.equal(existsSync(join(root, 'bruno')), false, 'nothing may reach disk');
  });

  test('a value under a credential-shaped name is written, but never silently', () => {
    const root = scratch();
    writeFileSync(join(root, 'openapi.json'), JSON.stringify(SPEC));
    writeFileSync(
      join(root, 'bruno-gen.json'),
      JSON.stringify({ environments: { local: { vars: { baseUrl: 'http://127.0.0.1:9', apiKey: 'local-dev-dummy' } } } }),
    );
    assert.equal(run(['ingest', '--root', root, '--out', join(root, 'model.json')]).code, 0);
    const applied = run(['apply', '--root', root, '--model', join(root, 'model.json')]);

    // The name rule is a heuristic - `password: postgres` is legitimate - so it warns rather than
    // refusing. Refusing would make the tool unusable on ordinary local environments; silence
    // would hide the one case the rule exists for.
    assert.equal(applied.code, 0, applied.out);
    assert.match(applied.out, /credential-shaped name/);
  });

  test('the write-time gate exists at all: classify has a caller', () => {
    const model = {
      collection: { environments: [{ name: 'dev', vars: { token: AZURE_KEY }, secrets: [] }] },
      endpoints: [],
    };
    const findings = auditModel(model);
    assert.equal(findings.length, 1, JSON.stringify(findings));
    assert.equal(findings[0].matchedBy, 'shape');
    assert.ok(!JSON.stringify(findings).includes(AZURE_KEY), 'a finding never carries the value');
  });

  test('a 40-byte Azure Functions key is detected - 56 characters, not 43', () => {
    // The old rule matched exactly 43 or 86 characters, so the key this tool's primary target
    // issues was the one shape it could not see.
    assert.equal(classify('code', AZURE_KEY).secret, true);
    assert.equal(classify('code', AZURE_KEY).matchedBy, 'shape');
  });

  test('a key in a query string is detected, and a hex digest is not', () => {
    const found = scanText(`get {\n  url: {{baseUrl}}/api/run?code=${AZURE_KEY}\n}\n`);
    assert.equal(found.length, 1, JSON.stringify(found));
    assert.equal(found[0].line, 2);

    // A sha256 is a legitimate thing to find in a request body.
    const digest = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    assert.deepEqual(scanText(`body:json {\n  "sha": "${digest}"\n}\n`), []);
  });

  test('a literal under auth:apikey value: is detected, and the key: name beside it is not', () => {
    const found = scanText(`auth:apikey {\n  key: x-functions-key\n  value: ${AZURE_KEY}\n  placement: header\n}\n`);
    assert.equal(found.length, 1, JSON.stringify(found));
    assert.equal(found[0].key, 'value', 'the credential is under value:, not under key:');
  });

  test('the scanner does not cry wolf on the output it prescribes', () => {
    // Every generated collection with a bearer header used to make doctor print "Possible committed
    // credentials", which trains people to ignore the section that matters.
    const good = 'headers {\n  Authorization: Bearer {{accessToken}}\n}\n\nauth:apikey {\n  key: x-api-key\n  value: {{apiKey}}\n}\n';
    assert.deepEqual(scanText(good), []);
    assert.equal(isReference('Bearer {{accessToken}}'), true);
    assert.equal(isReference('prefix-{{apiKey}}'), true);
    assert.equal(isReference(`${AZURE_KEY}{{suffix}}`), false, 'a real key with a variable appended is still a key');
  });

  test('doctor never prints a credential, in the report or in --json, and fails when it finds one', () => {
    const root = scratch();
    mkdirSync(join(root, 'bruno'), { recursive: true });
    writeFileSync(join(root, 'bruno/bruno.json'), JSON.stringify({ version: '1', name: 'Q', type: 'collection' }));
    writeFileSync(
      join(root, 'bruno/Run.bru'),
      `meta {\n  name: Run\n  type: http\n  seq: 1\n}\n\nget {\n  url: {{baseUrl}}/api/run?code=${AZURE_KEY}\n}\n`,
    );

    const r = run(['doctor', '--root', root]);
    assert.ok(!r.out.includes(AZURE_KEY), 'doctor output is meant to be pasteable into an issue');
    assert.match(r.out, /code=…/, 'the query value is redacted, the path is kept');
    assert.equal(r.code, 1, 'a committed credential must be able to fail a pipeline');

    const j = run(['doctor', '--root', root, '--json']);
    assert.ok(!j.out.includes(AZURE_KEY), '--json carried the raw url');
  });

  test('smoke never asks a shell to interpret --var values', () => {
    const value = 'v > marker.txt & echo injected! %PATH%';
    const args = bruArgs({ env: 'local', reporterPath: 'report.json', vars: [`k=${value}`] });
    assert.ok(args.includes(`k=${value}`), 'argv preserves the value for Bruno itself');
    const source = readFileSync(resolve(repoRoot, S, 'smoke.mjs'), 'utf8');
    assert.doesNotMatch(source, /shell\s*:\s*true/, 'a shell would interpret the metacharacters');
  });

  test('an unknown --env is refused even when the collection declares no environments', () => {
    const root = scratch();
    writeFileSync(join(root, 'bruno.json'), JSON.stringify({ version: '1', name: 'S', type: 'collection' }));
    // `available.length &&` let any string through in exactly this case.
    assert.equal(smoke({ collectionRoot: root, env: 'anything at all', confirmed: true }).reason, 'unknown-env');
  });

  test('a url quoted back inside an error message is redacted too', () => {
    const text = `connect ETIMEDOUT for https://h.example.net/api/x?code=${AZURE_KEY} after 30s`;
    assert.ok(!redactText(text).includes(AZURE_KEY));
    assert.match(redactText(text), /code=…/);
    assert.equal(redactUrl('https://h/x?code=SECRET&page=1'), 'https://h/x?code=…&page=…');
    assert.equal(redactUrl(`https://u:p@h/x/${AZURE_KEY}#${AZURE_KEY}`), 'https://…@h/x/…#…');
  });

  test('credential assignments are redacted even when the value has no distinctive shape', () => {
    const text = 'failure: AccountKey=dev-only; {"clientSecret":"tiny-value"}\nAuthorization: Bearer opaque';
    const redacted = redactText(text);
    for (const value of ['dev-only', 'tiny-value', 'Bearer opaque']) assert.ok(!redacted.includes(value));
  });
});

// =============================================================================================
describe("promise 2: the user's work is never lost", () => {
  /** An adopted collection holding one hand-written environment with real values in it. */
  const adoptedCollection = () => {
    const root = scratch();
    mkdirSync(join(root, 'bruno/environments'), { recursive: true });
    writeFileSync(join(root, 'bruno/bruno.json'), JSON.stringify({ version: '1', name: 'Adopted', type: 'collection' }));
    writeFileSync(
      join(root, 'bruno/environments/dev.bru'),
      'vars {\n  baseUrl: https://real-host.example.net\n  tenant: acme-prod-4711\n}\n',
    );
    writeFileSync(
      join(root, 'model.json'),
      JSON.stringify({
        modelVersion: 1,
        collection: {
          name: 'M',
          format: 'bru',
          outputDir: 'bruno',
          routePrefix: '',
          baseUrlVar: 'baseUrl',
          headers: [],
          auth: { mode: 'apikey', source: 'asked', apikey: { key: 'x-functions-key', value: '{{functionKey}}', placement: 'header' } },
          environments: [{ name: 'dev', vars: { baseUrl: 'https://x.example.net' }, secrets: ['functionKey'] }],
        },
        folders: [],
        endpoints: [
          {
            endpointKey: 'GET /status',
            name: 'Status',
            method: 'GET',
            pathTemplate: '/status',
            params: [],
            body: { kind: 'none' },
            auth: { mode: 'inherit' },
            seq: 1,
          },
        ],
        unresolved: [],
      }),
    );
    return root;
  };

  test('adding a secret name to an adopted environment does not take ownership of it', () => {
    const root = adoptedCollection();
    assert.equal(run(['adopt', '--root', root]).code, 0);
    assert.equal(run(['apply', '--root', root, '--model', join(root, 'model.json')]).code, 0);

    const lock = JSON.parse(readFileSync(join(root, 'bruno/.bruno-gen/lock.json'), 'utf8'));
    const entries = Object.entries(lock.environments);
    assert.equal(entries.length, 1, `one physical file, one entry: ${JSON.stringify(lock.environments)}`);
    // The whole chain: a real hash here means "machine-generated", which a later run reports as an
    // orphan, and --prune then deletes the user's hand-written environment on the tool's own advice.
    assert.equal(entries[0][1].hash, 'adopted');

    const env = readFileSync(join(root, 'bruno/environments/dev.bru'), 'utf8');
    assert.match(env, /tenant: acme-prod-4711/, 'their values survive');
    assert.match(env, /functionKey/, 'and the secret name is still declared');
  });

  test('--prune deletes nothing when the run is rejected', () => {
    const root = scratch();
    writeFileSync(join(root, 'openapi.json'), JSON.stringify(SPEC));
    assert.equal(run(['ingest', '--root', root, '--out', join(root, 'model.json')]).code, 0);
    assert.equal(run(['apply', '--root', root, '--model', join(root, 'model.json')]).code, 0);

    const before = readdirSync(join(root, 'bruno')).sort();
    // One valid-looking path plus one that this run will reject. The rejection must be total.
    const r = run([
      'apply', '--root', root, '--model', join(root, 'model.json'),
      '--prune', 'get-v1-things.yml',
      '--prune', 'opencollection.yml',
    ]);
    assert.equal(r.code, 1, r.out);
    assert.deepEqual(readdirSync(join(root, 'bruno')).sort(), before, 'a rejected run must not have deleted anything');
  });

  test('a case-different environment name does not rename the file or double the lock entry', () => {
    const root = adoptedCollection();
    // The file on disk is dev.bru; make the model ask for Dev instead.
    const model = JSON.parse(readFileSync(join(root, 'model.json'), 'utf8'));
    model.collection.environments[0].name = 'Dev';
    writeFileSync(join(root, 'model.json'), JSON.stringify(model));

    assert.equal(run(['adopt', '--root', root]).code, 0);

    const planned = run(['plan', '--root', root, '--model', join(root, 'model.json'), '--json']);
    assert.equal(planned.code, 0, planned.out);
    const environmentDecisions = JSON.parse(planned.out).decisions.filter((d) => d.kind === 'environment');
    assert.equal(environmentDecisions.length, 1, JSON.stringify(environmentDecisions));

    assert.equal(run(['apply', '--root', root, '--model', join(root, 'model.json')]).code, 0);

    assert.deepEqual(readdirSync(join(root, 'bruno/environments')), ['dev.bru'], 'their spelling stands');
    const lock = JSON.parse(readFileSync(join(root, 'bruno/.bruno-gen/lock.json'), 'utf8'));
    assert.equal(Object.keys(lock.environments).length, 1, JSON.stringify(lock.environments));
  });
});

// =============================================================================================
describe('promise 3: re-running changes nothing', () => {
  test('a frozen file name cannot be handed to a second endpoint', () => {
    // `GET /a/b` and `GET /a-b` derive the same slug. Once the first is frozen in the lockfile, the
    // second used to take the same path: one endpoint silently dropped, and the surviving file's
    // content alternating between the two on every run, for ever.
    const ep = (key, path) => ({
      endpointKey: key, name: key, method: 'GET', pathTemplate: path,
      params: [], headers: [], body: { kind: 'none' }, auth: 'inherit',
      tags: [], destructive: false, responses: [], asserts: [], settings: {}, seq: null, flags: [],
    });
    const model = {
      modelVersion: 1,
      collection: {
        name: 'X', format: 'bru', outputDir: 'bruno', routePrefix: '',
        baseUrlVar: 'baseUrl', headers: [], auth: { mode: 'none' }, environments: [],
      },
      folders: [],
      endpoints: [ep('GET /a/b', '/a/b'), ep('GET /a-b', '/a-b')],
      unresolved: [],
    };
    const { files } = planFiles(model, { frozen: { fileNames: { 'GET /a/b': 'get-a-b' }, seqs: {}, takenByDir: {} } });
    const requests = files.filter((f) => f.kind === 'request');

    assert.equal(requests.length, 2);
    assert.equal(new Set(requests.map((f) => f.relPath)).size, 2, 'two endpoints, two files');
    assert.equal(
      requests.find((f) => f.endpointKey === 'GET /a/b').relPath,
      'get-a-b.bru',
      'the frozen name still wins for the endpoint that owns it',
    );
  });

  test('environment names that slug alike get distinct files', () => {
    const model = {
      modelVersion: 1,
      collection: {
        name: 'X', format: 'bru', outputDir: 'bruno', routePrefix: '',
        baseUrlVar: 'baseUrl', headers: [], auth: { mode: 'none' },
        environments: [
          { name: 'Local 1', vars: {}, secrets: [] },
          { name: 'Local-1', vars: {}, secrets: [] },
        ],
      },
      folders: [],
      endpoints: [],
      unresolved: [],
    };
    const envs = planFiles(model, {}).files.filter((f) => f.kind === 'environment');
    assert.equal(new Set(envs.map((f) => f.relPath.toLowerCase())).size, 2, envs.map((f) => f.relPath).join(', '));
  });

  test('three variants of one endpoint receive three distinct paths', () => {
    const endpoint = (name) => ({
      endpointKey: 'GET /same', name, method: 'GET', pathTemplate: '/same', fileName: 'same',
      params: [], headers: [], body: { kind: 'none' }, auth: 'inherit', tags: [], destructive: false,
      responses: [], asserts: [], settings: {}, seq: null, flags: ['variant'],
    });
    const model = {
      modelVersion: 1,
      collection: {
        name: 'X', format: 'bru', outputDir: 'bruno', routePrefix: '',
        baseUrlVar: 'baseUrl', headers: [], auth: { mode: 'none' }, environments: [],
      },
      folders: [], endpoints: [endpoint('A'), endpoint('B'), endpoint('C')], unresolved: [],
    };
    const paths = planFiles(model, {}).files.filter((f) => f.kind === 'request').map((f) => f.relPath);
    assert.equal(paths.length, 3);
    assert.equal(new Set(paths.map((p) => p.toLowerCase())).size, 3, paths.join(', '));
  });

  test('a file name from the lockfile cannot steer the planner out of the collection', () => {
    // .bruno-gen/lock.json is committed in the repository under inspection, so it is untrusted.
    const ep = {
      endpointKey: 'GET /a', name: 'A', method: 'GET', pathTemplate: '/a',
      params: [], headers: [], body: { kind: 'none' }, auth: 'inherit',
      tags: [], destructive: false, responses: [], asserts: [], settings: {}, seq: null, flags: [],
    };
    const model = {
      modelVersion: 1,
      collection: {
        name: 'X', format: 'bru', outputDir: 'bruno', routePrefix: '',
        baseUrlVar: 'baseUrl', headers: [], auth: { mode: 'none' }, environments: [],
      },
      folders: [], endpoints: [ep], unresolved: [],
    };
    const { files } = planFiles(model, { frozen: { fileNames: { 'GET /a': '../../../../evil' }, seqs: {}, takenByDir: {} } });
    const request = files.find((f) => f.kind === 'request');
    assert.ok(!request.relPath.includes('..'), request.relPath);
  });
});

// =============================================================================================
describe('promise 4: what is generated matches what the description says', () => {
  test('--yes=false is refusal, not truthy consent', () => {
    const parsed = parseArgs(['smoke', '--root', '.', '--env', 'local', '--yes=false']);
    assert.deepEqual(parsed.problems, []);
    assert.equal(parsed.flags.yes, false);
  });

  test('unknown options and missing values fail instead of silently changing meaning', () => {
    assert.match(parseArgs(['apply', '--modle', 'x']).problems.join(' '), /unknown option --modle/);
    assert.match(parseArgs(['apply', '--model']).problems.join(' '), /--model needs a value/);
    assert.match(parseArgs(['probe', '--yes']).problems.join(' '), /--yes is not valid for probe/);
    assert.match(parseArgs(['apply', '--model=']).problems.join(' '), /needs a non-empty value/);
  });

  test('human reports render terminal control characters visibly', () => {
    const report = new Report().warn('bad\u001b[2Jname\nnext');
    assert.equal(report.toString().includes('\u001b'), false, 'raw escape must not reach the terminal');
    assert.match(report.toString(), /\\u001b\[2Jname\\nnext/);
  });

  test('known runtime secrets are removed from reporter errors and URLs', () => {
    const secret = 'runtime-secret-value';
    const rows = normaliseResults({ results: [{
      request: { method: 'GET', url: `https://api.example.com/${secret}?code=${secret}` },
      response: { status: 500 },
      error: `server rejected ${secret}`,
    }] }, { values: [secret] });
    assert.equal(JSON.stringify(rows).includes(secret), false);
  });

  test('a bru executable inside the inspected repository is never selected', () => {
    const root = scratch();
    const planted = join(root, process.platform === 'win32' ? 'bru.exe' : 'bru');
    writeFileSync(planted, 'not a real Bruno CLI');
    if (process.platform !== 'win32') chmodSync(planted, 0o755);
    const resolved = resolveBruExecutable({ excludeRoot: root, searchPath: root });
    assert.equal(resolved, null);
  });

  test('sibling properties sharing one $ref are both expanded', () => {
    // A $ref-valued property is the most ordinary shape in OpenAPI. Cycle detection was global
    // rather than per-path, so the first came out {} and every later one came out "string" - the
    // wrong JSON type, in most generated request bodies.
    const root = {
      components: {
        schemas: { Address: { type: 'object', properties: { street: { type: 'string' }, zip: { type: 'string' } } } },
      },
    };
    const built = exampleFromSchema(
      {
        type: 'object',
        properties: {
          billing: { $ref: '#/components/schemas/Address' },
          shipping: { $ref: '#/components/schemas/Address' },
        },
      },
      { root },
    );
    assert.deepEqual(built, {
      billing: { street: 'string', zip: 'string' },
      shipping: { street: 'string', zip: 'string' },
    });
  });

  test('a genuinely self-referential $ref still terminates', () => {
    const root = {
      components: {
        schemas: {
          Node: { type: 'object', properties: { name: { type: 'string' }, child: { $ref: '#/components/schemas/Node' } } },
        },
      },
    };
    const built = exampleFromSchema({ $ref: '#/components/schemas/Node' }, { root });
    assert.equal(built.name, 'string');
    assert.ok(built.child !== undefined);
  });

  test('a Postman collection ingests its requests rather than none of them', async () => {
    // Both converters are async and resolve to {collection, issues}. Called without await, the
    // walker got a Promise, found no items, and produced an empty-but-VALID model that exited 0.
    const pm = {
      info: { name: 'Widgets', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
      item: [
        {
          name: 'Widgets',
          item: [
            {
              name: 'List widgets',
              request: {
                method: 'GET',
                url: { raw: 'https://api.example.com/v1/widgets', host: ['api', 'example', 'com'], path: ['v1', 'widgets'] },
              },
            },
          ],
        },
      ],
    };
    const { model } = await ingestViaConverter(KIND.POSTMAN, pm, { format: 'bru', outputDir: 'bruno' });
    assert.equal(model.endpoints.length, 1, JSON.stringify(model.warnings));
    assert.equal(model.endpoints[0].endpointKey, 'GET /v1/widgets');
    assert.equal(model.collection.name, 'Widgets');
    assert.equal(validateModel(model).ok, true, JSON.stringify(validateModel(model).problems));
  });

  test('an unquoted YAML version is still a version', () => {
    // `openapi: 3.0` in YAML is the number 3, so a typeof check for a string discarded a usable
    // spec - and let an unquoted `swagger: 2.0` past the guard that exists to reject it.
    assert.equal(classifySpec({ openapi: 3.0, paths: {} }), KIND.OPENAPI);
    assert.equal(classifySpec({ openapi: '3.0.1', paths: {} }), KIND.OPENAPI);
    assert.equal(classifySpec({ swagger: 2.0, paths: {} }), KIND.SWAGGER2);
    assert.equal(classifySpec({ swagger: '2.0', paths: {} }), KIND.SWAGGER2);
  });

  test('a templated server url is substituted, not percent-encoded', () => {
    const root = scratch();
    writeFileSync(
      join(root, 'openapi.json'),
      JSON.stringify({
        ...SPEC,
        servers: [
          {
            url: 'https://{region}.api.example.com/{version}',
            variables: { region: { default: 'we' }, version: { default: 'v2' } },
          },
        ],
      }),
    );
    assert.equal(run(['ingest', '--root', root, '--out', join(root, 'model.json')]).code, 0);
    const model = JSON.parse(readFileSync(join(root, 'model.json'), 'utf8'));
    assert.equal(model.collection.routePrefix, '/v2');
    assert.equal(model.collection.environments[0].vars.baseUrl, 'https://we.api.example.com');
  });

  test('servers that disagree on a prefix say so instead of dropping it', () => {
    const root = scratch();
    writeFileSync(
      join(root, 'openapi.json'),
      JSON.stringify({
        ...SPEC,
        servers: [{ url: 'https://prod.example.com/v1' }, { url: 'https://staging.example.com/v2' }],
      }),
    );
    const r = run(['ingest', '--root', root, '--out', join(root, 'model.json')]);
    assert.equal(r.code, 0, r.out);
    assert.match(r.out, /servers\[\] disagree on the path prefix/);
    assert.equal(JSON.parse(readFileSync(join(root, 'model.json'), 'utf8')).collection.routePrefix, '/v1');
  });

  test('config layered onto a valid model is validated too', () => {
    const root = scratch();
    writeFileSync(join(root, 'openapi.json'), JSON.stringify(SPEC));
    assert.equal(run(['ingest', '--root', root, '--out', join(root, 'model.json')]).code, 0);
    // The exact shape the auth schema exists to reject: a mode with no credential block. It used to
    // reach the writer, which emitted `auth { mode: apikey }` and nothing else, so every request
    // went out unauthenticated and came back 401 with no diagnostic anywhere.
    writeFileSync(
      join(root, 'bruno-gen.json'),
      JSON.stringify({ auth: { mode: 'apikey', in: 'header', name: 'x-functions-key', value: 'literal' } }),
    );
    const r = run(['plan', '--root', root, '--model', join(root, 'model.json')]);
    assert.equal(r.code, 1, r.out);
    assert.match(r.out, /no longer valid once bruno-gen\.json/);
  });

  test('a schema error names the property it is about', () => {
    const problems = validateModel({
      modelVersion: 1,
      collection: {
        name: 'X', format: 'bru', outputDir: 'bruno', routePrefix: '', baseUrlVar: 'baseUrl',
        headers: [],
        auth: { mode: 'apikey', source: 'asked', apikey: { in: 'header', name: 'k', valueVar: 'v' } },
        environments: [{ name: 'dev', vars: {}, secrets: [] }],
      },
      folders: [], endpoints: [], unresolved: [],
    }).problems;

    // "must NOT have additional properties" three times, naming none of them, is the least useful
    // thing this could say - and the model is authored by iterating against these messages.
    assert.ok(problems.some((p) => p.includes('"in"')), problems.join(' | '));
    assert.ok(problems.some((p) => p.includes('"valueVar"')), problems.join(' | '));
    assert.equal(new Set(problems).size, problems.length, 'no duplicated lines');
  });

  test('an explicit flag outranks bruno-gen.json, and the report agrees with the model', () => {
    const root = scratch();
    writeFileSync(join(root, 'openapi.json'), JSON.stringify(SPEC));
    writeFileSync(join(root, 'bruno-gen.json'), JSON.stringify({ format: 'bru' }));

    const flagged = run(['ingest', '--root', root, '--out', join(root, 'flag.json'), '--format', 'yml']);
    assert.equal(flagged.code, 0, flagged.out);
    assert.equal(JSON.parse(readFileSync(join(root, 'flag.json'), 'utf8')).collection.format, 'yml');
    assert.match(flagged.out, /format\s+opencollection\.yml/, 'the report must not print one thing and record another');

    // Absent the flag, config still wins over the spec.
    assert.equal(run(['ingest', '--root', root, '--out', join(root, 'cfg.json')]).code, 0);
    assert.equal(JSON.parse(readFileSync(join(root, 'cfg.json'), 'utf8')).collection.format, 'bru');
  });

  test('the route styles the reference cards document are recognised', () => {
    const cases = {
      'mapgroup.cs': 'var g = app.MapGroup("/api/widgets"); g.MapGet("/{id}", h);',
      'fastify.ts': 'import Fastify from "fastify"; const server = Fastify(); server.get("/widgets", h);',
      'router.js': 'const widgetsRouter = express.Router(); widgetsRouter.get("/:id", h);',
      'next.ts': 'export const GET = async (req) => new Response("ok");',
      'fastep.cs': 'public class Ping : EndpointWithoutRequest { public override void Configure() { Get("/ping"); } }',
      'route.cs': '[Route("api/[controller]")] public class WidgetsController : ControllerBase { }',
    };
    for (const [name, src] of Object.entries(cases)) {
      const dir = scratch();
      writeFileSync(join(dir, name), src);
      assert.equal(surfaceSignals(dir).hasHttp, true, `${name} should be an HTTP surface`);
    }
  });

  test('a commented-out route and an HTTP client call are not routes', () => {
    for (const [name, src] of Object.entries({
      'commented.js': '// app.get("/legacy", h) // removed',
      'client.js': 'import axios from "axios"; axios.get("/not-a-route");',
      'bare.ts': 'class Thing { @Get() find() {} }',
    })) {
      const dir = scratch();
      writeFileSync(join(dir, name), src);
      assert.equal(surfaceSignals(dir).hasHttp, false, `${name} should not count as an HTTP surface`);
    }
  });
});

// =============================================================================================
// A second review pass over the backlog, same grouping.
describe('the vendored readers do not fail the way calling code assumed', () => {
  test('every failure mode becomes a throw', () => {
    // Measured against the pinned bundle: parseRequest throws but FIRST writes a code frame to
    // stdout quoting the file; the bru environment/folder/collection readers return a REJECTED
    // PROMISE; the yml ones return a plausible empty object and never signal at all. Each of those
    // was a defect somewhere else - a corrupted --json payload, or an unparseable file read as empty.
    assert.throws(() => parseStrict('request', '{"not":"bru"}', { format: 'bru' }));
    assert.throws(() => parseStrict('environment', 'not an env {{{', { format: 'bru' }));
    assert.throws(() => parseStrict('request', 'garbage: [', { format: 'yml' }));

    const env = parseStrict('environment', 'vars {\n  baseUrl: x\n}\n', { format: 'bru' });
    assert.deepEqual(env.variables.map((v) => v.name), ['baseUrl']);
    assert.ok(parseStrict('request', 'meta {\n  name: A\n  type: http\n  seq: 1\n}\n\nget {\n  url: x\n}\n', { format: 'bru' }).request);
  });

  test('a parse failure is silent on stdout, so --json stays machine-readable', () => {
    const root = scratch();
    mkdirSync(join(root, 'bruno'), { recursive: true });
    writeFileSync(join(root, 'bruno/bruno.json'), JSON.stringify({ version: '1', name: 'J', type: 'collection' }));
    // A hand-written request with a syntax error, holding a line the report must never quote back.
    writeFileSync(join(root, 'bruno/broken.bru'), 'meta {\n  name: Broken\n  looks-secret: hunter2\n{{{\n');

    const r = spawnSync(process.execPath, [CLI, 'doctor', '--root', root, '--json'], { encoding: 'utf8', cwd: repoRoot });
    assert.doesNotThrow(() => JSON.parse(r.stdout), `stdout was not one JSON document:\n${r.stdout.slice(0, 300)}`);
    assert.ok(!r.stdout.includes('hunter2'), 'the parser must not echo file content into stdout');
  });
});

// =============================================================================================
describe('promise 2, second pass: the collection files are the user\'s', () => {
  test('an environment that does not parse is never rewritten to add a secret name', () => {
    const root = scratch();
    mkdirSync(join(root, 'bruno/environments'), { recursive: true });
    writeFileSync(join(root, 'bruno/bruno.json'), JSON.stringify({ version: '1', name: 'DL', type: 'collection' }));
    // Hand-edited into a syntax error, but still holding the values that matter.
    const broken = 'vars {\n  baseUrl: https://real-host.example.net\n  tenant: acme-prod-4711\n  broken {{{\n';
    writeFileSync(join(root, 'bruno/environments/dev.bru'), broken);
    writeFileSync(join(root, 'model.json'), JSON.stringify(secretNameModel()));

    assert.equal(run(['adopt', '--root', root]).code, 0);
    run(['apply', '--root', root, '--model', join(root, 'model.json')]);

    // The bru reader signals a syntax error by returning a rejected promise, so reading its result as
    // data made this file look EMPTY - and the carve-out then "added the missing secret" by writing a
    // file that contained nothing but it.
    assert.equal(readFileSync(join(root, 'bruno/environments/dev.bru'), 'utf8'), broken);
  });

  test('a plain variable whose name merely contains a secret name does not mask it', () => {
    const root = scratch();
    const collection = join(root, 'bruno');
    mkdirSync(join(collection, 'environments'), { recursive: true });
    writeFileSync(join(collection, 'bruno.json'), JSON.stringify({ version: '1', name: 'M', type: 'collection' }));
    writeFileSync(join(collection, 'environments/dev.bru'),
      'vars {\n  baseUrl: https://x.example.net\n  functionKeyName: not-the-secret\n}\n');

    const d = planMerge({
      collectionRoot: collection,
      format: 'bru',
      planned: [{
        relPath: 'environments/dev.bru', kind: 'environment', createOnce: true,
        secretNames: ['functionKey'], content: 'vars {\n  baseUrl: x\n}\n',
      }],
      lock: { requests: {}, environments: {}, folders: {}, config: {} },
    }).decisions.find((x) => x.relPath === 'environments/dev.bru');

    assert.equal(d.status, STATUS.SECRETS_ADDED, 'functionKeyName is not a declaration of functionKey');
    assert.deepEqual(d.secretNames, ['functionKey']);
  });

  test('a deleted endpoint is restored, not declared "moved" to an unrelated file', () => {
    const root = scratch();
    const collection = join(root, 'bruno');
    mkdirSync(collection, { recursive: true });
    writeFileSync(join(collection, 'bruno.json'), JSON.stringify({ version: '1', name: 'M', type: 'collection' }));
    // The user happens to keep a file whose name ENDS WITH the planned one.
    writeFileSync(join(collection, 'legacy-get-widgets.bru'),
      'meta {\n  name: Legacy\n  type: http\n  seq: 9\n}\n\nget {\n  url: {{baseUrl}}/something-else\n}\n');

    const planned = [{
      relPath: 'get-widgets.bru', kind: 'request', endpointKey: 'GET /widgets', seq: 1, fileName: 'get-widgets',
      content: 'meta {\n  name: Widgets\n  type: http\n  seq: 1\n}\n\nget {\n  url: {{baseUrl}}/widgets\n}\n',
    }];
    const lock = {
      requests: { 'get-widgets.bru': { kind: 'request', hash: 'stale', endpointKey: 'GET /widgets', seq: 1 } },
      environments: {}, folders: {}, config: {},
    };

    const d = planMerge({ collectionRoot: collection, format: 'bru', planned, lock }).decisions
      .find((x) => x.relPath === 'get-widgets.bru');
    assert.equal(d.status, STATUS.RESTORED, 'a suffix match is not a move; the endpoint has to come back');

    // A genuine rename IS recognised, by re-reading the candidate rather than trusting its name.
    writeFileSync(join(collection, 'renamed-by-hand.bru'),
      'meta {\n  name: Widgets\n  type: http\n  seq: 1\n}\n\nget {\n  url: {{baseUrl}}/widgets\n}\n');
    const d2 = planMerge({ collectionRoot: collection, format: 'bru', planned, lock }).decisions
      .find((x) => x.relPath === 'get-widgets.bru');
    assert.equal(d2.status, STATUS.MOVED);
    assert.equal(d2.movedTo, 'renamed-by-hand.bru');
  });

  test('a move keeps the name, a rename keeps the directory, and a copy elsewhere is neither', () => {
    // Two reviews reconciled this block, and between them it managed to be both too loose and too
    // tight. Too loose: any unmanaged file holding the same endpoint counted, so a copy the user kept
    // in scratch/ was reported as the move target for a request they had simply deleted - never
    // restored, and the report claimed a move that had not happened. Too tight: requiring the same
    // directory AND the same basename inside the not-exists branch describes the file that is missing,
    // so move detection was disabled rather than tightened. Both shapes, and only both, count now.
    const REQUEST = 'meta {\n  name: Widgets\n  type: http\n  seq: 1\n}\n\nget {\n  url: {{baseUrl}}/widgets\n}\n';
    const planned = [{
      relPath: 'widgets/get-widgets.bru', kind: 'request', endpointKey: 'GET /widgets', seq: 1,
      fileName: 'get-widgets', content: REQUEST,
    }];
    const lock = {
      requests: { 'widgets/get-widgets.bru': { kind: 'request', hash: 'stale', endpointKey: 'GET /widgets', seq: 1 } },
      environments: {}, folders: {}, config: {},
    };

    const decide = (elsewhere) => {
      const collection = join(scratch(), 'bruno');
      mkdirSync(join(collection, 'widgets'), { recursive: true });
      mkdirSync(join(collection, elsewhere.slice(0, elsewhere.lastIndexOf('/'))), { recursive: true });
      writeFileSync(join(collection, 'bruno.json'), JSON.stringify({ version: '1', name: 'M', type: 'collection' }));
      writeFileSync(join(collection, elsewhere), REQUEST);
      return planMerge({ collectionRoot: collection, format: 'bru', planned, lock }).decisions
        .find((x) => x.relPath === 'widgets/get-widgets.bru');
    };

    const moved = decide('archive/get-widgets.bru');
    assert.equal(moved.status, STATUS.MOVED, 'same name in another directory is a move');
    assert.equal(moved.movedTo, 'archive/get-widgets.bru');

    const renamed = decide('widgets/widgets-list.bru');
    assert.equal(renamed.status, STATUS.MOVED, 'another name in the same directory is a rename');
    assert.equal(renamed.movedTo, 'widgets/widgets-list.bru');

    const copied = decide('scratch/try-it.bru');
    assert.equal(copied.status, STATUS.RESTORED, 'another name AND another directory is a copy, not a rename');
    assert.equal(copied.movedTo, undefined);
  });

  test('plan does not die on a directory sitting where a request file belongs', () => {
    const root = scratch();
    const collection = join(root, 'bruno');
    mkdirSync(join(collection, 'get-blocked.bru'), { recursive: true });
    writeFileSync(join(collection, 'bruno.json'), JSON.stringify({ version: '1', name: 'B', type: 'collection' }));
    const planned = [{ relPath: 'get-blocked.bru', kind: 'request', endpointKey: 'GET /b', seq: 1, fileName: 'get-blocked', content: 'x' }];
    const lock = {
      requests: { 'get-blocked.bru': { kind: 'request', hash: 'x', endpointKey: 'GET /b' } },
      environments: {}, folders: {}, config: {},
    };
    let d;
    assert.doesNotThrow(() => {
      d = planMerge({ collectionRoot: collection, format: 'bru', planned, lock }).decisions
        .find((x) => x.relPath === 'get-blocked.bru');
    }, 'a raw EISDIR stack is not a diagnostic');
    assert.equal(d.status, STATUS.UNMANAGED);
  });
});

// =============================================================================================
describe('the run lock actually excludes a second run', () => {
  test('the create is exclusive, and a dead owner is taken over and reported', () => {
    const target = join(scratch(), 'bruno');
    rmSync(lockFileFor(target), { force: true });

    const held = acquire(target, {});
    // `existsSync` then `writeFileSync` was a check-then-write race; `wx` makes the create atomic.
    assert.throws(() => acquire(target, {}), /Another run holds the lock/);
    held.release();

    // A lock whose owner is gone is taken over at once - it does not wait out STALE_AFTER_MS - and
    // the takeover is never silent.
    writeFileSync(lockFileFor(target),
      JSON.stringify({ pid: 999999, host: hostname(), startedAt: new Date().toISOString() }));
    let notice = null;
    const took = acquire(target, { onNotice: (m) => { notice = m; } });
    assert.match(notice ?? '', /stale run lock/);
    assert.equal(took.tookOver?.pid, 999999, 'tookOver was hard-coded null, so no report could mention it');
    took.release();
  });

  test('release leaves behind a lock it cannot prove is its own', () => {
    const target = join(scratch(), 'bruno');
    const path = lockFileFor(target);
    rmSync(path, { force: true });

    const mine = acquire(target, {});
    // A competitor mid-write: the record is not valid JSON yet. The old catch deleted it anyway -
    // precisely the lock that competitor was in the middle of taking.
    writeFileSync(path, 'half-written by another run');
    mine.release();
    assert.equal(existsSync(path), true, 'release must not delete a record it cannot parse');
    rmSync(path, { force: true });
  });

  test('a takeover reaches the --json result, not only the text report', () => {
    // `--json` never prints the report, so a run that stole another run's lock was invisible to
    // anything reading the result. Reconciling two locking implementations put this at risk a second
    // time: the field was read off `ctx`, and after the restructure the lock is held by the CALLER of
    // prepare, so `ctx.runLock` was undefined and the field silently disappeared.
    const root = scratch();
    writeFileSync(join(root, 'model.json'), JSON.stringify(secretNameModel()));
    const collection = join(root, 'bruno');

    // A first apply, so there is a collection and a lockfile to apply against.
    assert.equal(run(['apply', '--root', root, '--model', join(root, 'model.json')]).code, 0);

    writeFileSync(lockFileFor(collection),
      JSON.stringify({ pid: 999999, host: hostname(), startedAt: new Date(0).toISOString(), token: 'stale' }));
    const second = run(['apply', '--root', root, '--model', join(root, 'model.json'), '--json']);
    assert.equal(second.code, 0);
    assert.match(second.stderr, /taking over a stale run lock/, 'the human still gets the notice');

    // stdout is the payload and nothing else: a note mixed into it would make the output unparseable
    // for the caller that asked for --json in the first place.
    const payload = JSON.parse(second.stdout);
    assert.equal(payload.tookOverLock?.pid, 999999);
    assert.ok('host' in (payload.tookOverLock ?? {}), 'the host has to be carried, whatever it says');
    assert.ok('startedAt' in (payload.tookOverLock ?? {}));

    // Deliberately NOT `assert.equal(host, hostname())`. Every --json payload goes through
    // `redactOutput`, and a GitHub macOS runner is called something like
    // `sjc22-bt149-<uuid>-<mac>.local` - forty-odd characters of mixed case and digits, which is
    // exactly the unpadded-base64 credential shape. The redactor cannot know it is a hostname, so it
    // replaces it, and the first version of this assertion passed on Windows and failed on macOS
    // alone. A machine's own name must not decide whether a test passes; the wire being connected is
    // what this test is for. Do not loosen the redactor to make a hostname survive.
  });

  test('both --root spellings of one collection contend for the same lock', () => {
    const root = scratch();
    // The lock is keyed on the resolved COLLECTION root, so addressing the repository or the
    // collection directly must reach the same lock file. Keyed on the CLI argument, they did not.
    assert.equal(lockFileFor(join(root, 'bruno')), lockFileFor(join(root, 'bruno')));
    assert.notEqual(lockFileFor(root), lockFileFor(join(root, 'bruno')));
  });
});

// =============================================================================================
describe('ingest names what it cannot carry', () => {
  const spec = (over) => ({
    openapi: '3.0.0',
    info: { title: 'T', version: '1' },
    servers: [{ url: 'https://api.example.com' }],
    paths: {},
    ...over,
  });

  test('an external $ref is warned about and reported as a capability, not silently dropped', () => {
    const r = ingestOpenApi(spec({
      paths: {
        '/a': { $ref: 'common.yaml#/paths/~1a' },
        '/b': { get: { operationId: 'b', responses: { 200: { description: 'ok' } } } },
      },
    }));
    assert.deepEqual(r.model.endpoints.map((e) => e.endpointKey), ['GET /b']);
    assert.match(r.warnings.join('\n'), /\/a: skipped .* points outside this file/);
    assert.ok(r.capability.some((c) => c.subject === 'external-$ref'), 'a multi-file spec must say so');
  });

  test('only a REQUIRED body lost to a $ref becomes an unresolved value', () => {
    // unresolved[] drives exit 4, which the contract defines as unresolved REQUIRED values.
    for (const required of [true, false]) {
      const r = ingestOpenApi(spec({
        paths: { '/c': { post: { operationId: 'c', requestBody: { $ref: 'common.yaml#/x', required }, responses: { 201: { description: 'ok' } } } } },
      }));
      assert.equal(r.unresolved.length, required ? 1 : 0, `required=${required}`);
      assert.ok(r.warnings.length > 0, 'either way it is warned about');
    }
  });

  test('an operation-level parameter replaces the path-level one, as OpenAPI requires', () => {
    const r = ingestOpenApi(spec({
      paths: {
        '/d': {
          parameters: [{ name: 'limit', in: 'query', required: false, schema: { type: 'integer', default: 10 } }],
          get: {
            operationId: 'd',
            parameters: [{ name: 'limit', in: 'query', required: true, schema: { type: 'integer', default: 99 } }],
            responses: { 200: { description: 'ok' } },
          },
        },
      },
    }));
    const limit = r.model.endpoints[0].params.find((p) => p.name === 'limit');
    // It used to keep the path-level entry and fold the override into an invented enum, so the
    // required parameter came out optional, disabled and carrying the wrong value.
    assert.equal(limit.required, true);
    assert.equal(limit.disabled, false);
    assert.equal(limit.value, '99');
    assert.equal(limit.enum, null);
  });

  test('an out-of-range response status is skipped, not fatal to the whole model', () => {
    const r = ingestOpenApi(spec({
      paths: { '/f': { get: { operationId: 'f', responses: { 0: { description: 'x' }, 600: { description: 'x' }, default: { description: 'd' }, 200: { description: 'ok' } } } } },
    }));
    assert.deepEqual(r.model.endpoints[0].responses.map((x) => x.status), [200]);
    assert.equal(validateModel(r.model).ok, true, 'one odd status used to invalidate everything');
    assert.equal(r.warnings.filter((w) => /outside 100-599/.test(w)).length, 2, 'default stays silent');
  });

  test('two paths with one endpoint identity keep the first and name the other', () => {
    const r = ingestOpenApi(spec({
      paths: {
        '/widgets': { get: { operationId: 'a', responses: { 200: { description: 'ok' } } } },
        '/widgets/': { get: { operationId: 'b', responses: { 200: { description: 'ok' } } } },
      },
    }));
    assert.equal(r.model.endpoints.length, 1);
    // It used to emit both without the variant flag, so ingest's own output failed validateModel.
    assert.equal(validateModel(r.model).ok, true);
    assert.match(r.warnings.join('\n'), /same endpoint identity/);
  });

  test('a malformed spec shape is a diagnosis, not a TypeError out of the CLI', () => {
    // "sharedParams is not iterable" is not a sentence about anyone's spec.
    assert.doesNotThrow(() => ingestOpenApi(spec({
      security: { bearerAuth: [] },
      paths: { '/g': { parameters: {}, get: { operationId: 'g', parameters: {}, responses: { 200: { description: 'ok' } } } } },
    })));
  });

  test('an auth recipe declares the non-credential variables it references', () => {
    const r = ingestOpenApi(spec({
      components: { securitySchemes: { basicAuth: { type: 'http', scheme: 'basic' } } },
      security: [{ basicAuth: [] }],
      paths: { '/h': { get: { operationId: 'h', responses: { 200: { description: 'ok' } } } } },
    }));
    const env = r.model.collection.environments[0];
    // {{username}} was referenced by the auth block and declared nowhere, so it went out empty and
    // every call 401'd - which doctor then reported, one command too late.
    assert.ok(Object.keys(env.vars).includes('username'), JSON.stringify(env.vars));
    assert.deepEqual(env.secrets, ['password'], 'a username is not a credential');
  });

  test('a Postman import derives its base URL from the requests it imported', async () => {
    const pm = {
      info: { name: 'B', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
      item: [{
        name: 'A',
        request: { method: 'GET', url: { raw: 'https://api.example.com/v1/a', host: ['api', 'example', 'com'], path: ['v1', 'a'] } },
      }],
    };
    const { model } = await ingestViaConverter(KIND.POSTMAN, pm, { format: 'bru', outputDir: 'bruno' });
    // It was hard-coded to '', so every imported collection needed the host typed in by hand.
    assert.equal(model.collection.environments[0].vars.baseUrl, 'https://api.example.com');
  });

  test('a body mode that cannot be written is named; a bodiless request is not', async () => {
    const pm = {
      info: { name: 'B', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
      item: [
        { name: 'Plain', request: { method: 'GET', url: { raw: 'https://api.example.com/a', host: ['api', 'example', 'com'], path: ['a'] } } },
        {
          name: 'Token',
          request: {
            method: 'POST',
            url: { raw: 'https://api.example.com/token', host: ['api', 'example', 'com'], path: ['token'] },
            body: { mode: 'urlencoded', urlencoded: [{ key: 'grant_type', value: 'client_credentials' }] },
          },
        },
      ],
    };
    const { warnings } = await ingestViaConverter(KIND.POSTMAN, pm, { format: 'bru', outputDir: 'bruno' });
    assert.equal(warnings.filter((w) => /cannot be written/.test(w)).length, 1, 'exactly the form body');
    assert.ok(!warnings.some((w) => /Plain/.test(w)), 'a GET with no body is not a loss');
  });
});

// =============================================================================================
describe('promise 1, second pass: every value that reaches disk is audited', () => {
  test('a form body, an xml body and per-endpoint auth are all checked', () => {
    const KEY = 'AbCdEfGhIj0123456789KlMnOpQrStUvWxYz0123456789AbCdEfGh==';
    // Visibly synthetic: a long run of one character, which the fixture-hygiene check requires of any
    // credential-shaped literal in the repository.
    const JWT = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    const findings = auditModel({
      collection: {},
      endpoints: [
        { endpointKey: 'POST /token', body: { kind: 'form-urlencoded', entries: [{ name: 'client_secret', value: KEY }] } },
        { endpointKey: 'POST /xml', body: { kind: 'xml', text: `<t>${JWT}</t>` } },
        { endpointKey: 'GET /ep', auth: { mode: 'apikey', apikey: { key: 'x-key', value: KEY } } },
      ],
    });
    // Only collection-level auth and json bodies were audited, so the commonest credential-bearing
    // body in a real Postman export went straight to disk unchecked.
    assert.equal(findings.length, 3, JSON.stringify(findings));
    assert.ok(findings.every((f) => f.matchedBy === 'shape'));
    assert.ok(!JSON.stringify(findings).includes(KEY), 'a finding never carries the value');
  });

  test('userinfo and a fragment are redacted, not just the query string', () => {
    // No `?`, so this took the early return and doctor printed the credential in full.
    assert.equal(redactUrl('https://admin:s3cr3t@host.example.net/widgets'), 'https://…@host.example.net/widgets');
    assert.equal(redactUrl('https://h/cb#code=TOKEN'), 'https://h/cb#…');
  });
});

// =============================================================================================
describe('promise 3, second pass: one answer per repository', () => {
  test('the source scan is deterministic and admits when the cap hid files', () => {
    const dir = scratch();
    mkdirSync(join(dir, 'src/a-lib'), { recursive: true });
    mkdirSync(join(dir, 'src/zzz-routes'), { recursive: true });
    writeFileSync(join(dir, 'package.json'), '{"name":"x"}');
    for (let i = 0; i < 450; i++) {
      writeFileSync(join(dir, 'src/a-lib', `f${String(i).padStart(4, '0')}.js`), 'export const x = 1;\n');
    }
    writeFileSync(join(dir, 'src/zzz-routes/routes.js'), 'const app = require("express")(); app.get("/w", h);\n');

    const a = surfaceSignals(dir);
    const b = surfaceSignals(dir);
    // Determinism first: the old walk stopped in readdirSync order, so the answer depended on
    // filesystem enumeration order.
    assert.deepEqual(a.stacks, b.stacks);
    assert.equal(a.filesScanned, b.filesScanned);
    // Honesty second: the cap can still hide the file that holds the routes, and a partial scan must
    // not be presented as a finding.
    assert.equal(a.truncated, true);
    assert.ok(a.filesFound > a.filesScanned);
  });

  test('a workspace root does not inherit the HTTP surface of its members', () => {
    const dir = scratch();
    mkdirSync(join(dir, 'packages/api/src'), { recursive: true });
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'mono', workspaces: ['packages/*'] }));
    writeFileSync(join(dir, 'packages/api/package.json'), '{"name":"@mono/api"}');
    writeFileSync(join(dir, 'packages/api/src/routes.js'), 'const app = require("express")(); app.get("/w", h);\n');

    // The root holds no code of its own, so absorbing the member made it score highest and every
    // workspace monorepo ambiguous between the two.
    assert.equal(surfaceSignals(dir).hasHttp, false, 'the root has no surface of its own');
    assert.equal(surfaceSignals(join(dir, 'packages/api')).hasHttp, true);
  });

  test('a spec under packages/ is not docked as third-party', () => {
    const dir = scratch();
    mkdirSync(join(dir, 'packages/api'), { recursive: true });
    writeFileSync(join(dir, 'packages/api/openapi.yaml'),
      'openapi: 3.0.0\ninfo:\n  title: Mono\n  version: "1"\npaths:\n  /a:\n    get:\n      responses:\n        "200":\n          description: ok\n');
    const c = probe(dir).candidates.find((x) => x.kind === 'openapi');
    assert.ok(!c.reasons.some((r) => /third-party/.test(r)), c.reasons.join('; '));
  });

  test('build directories are skipped whatever their case', () => {
    const dir = scratch();
    mkdirSync(join(dir, 'Obj'), { recursive: true });
    writeFileSync(join(dir, 'package.json'), '{"name":"y"}');
    writeFileSync(join(dir, 'Obj/generated.js'), 'const app = require("express")(); app.get("/nope", h);\n');
    assert.equal(surfaceSignals(dir).hasHttp, false, 'build output is not the project');
  });
});

// =============================================================================================
describe('promise 4, second pass: the report does not quote the repository back', () => {
  test('a parser error names the position, never the file content', () => {
    const dir = scratch();
    writeFileSync(join(dir, 'package.json'), '{"name":"x"}');
    // A settings file that is a secret store, which probe reads because it reads every .json.
    writeFileSync(join(dir, 'api-spec.json'),
      '{ "Values": { "Storage": @Server=tcp:real.example.net;Password=Sup3rS3cret!; } }');

    const r = spawnSync(process.execPath, [CLI, 'probe', '--root', dir, '--json'], { encoding: 'utf8', cwd: repoRoot });
    assert.ok(!r.stdout.includes('Sup3rS3cret'), 'V8 JSON errors embed a window of the source');
    assert.ok(!r.stdout.includes('real.example.net'));
    assert.match(r.stdout, /not valid JSON/);
  });

  test('a configured spec that is not there is reported against the setting', () => {
    const dir = scratch();
    writeFileSync(join(dir, 'package.json'), '{"name":"x"}');
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src/routes.js'), 'const app = require("express")(); app.get("/a", h);\n');
    writeFileSync(join(dir, 'bruno-gen.json'), JSON.stringify({ projects: [{ path: '.', name: 'api', spec: 'docs/nope.json' }] }));

    const r = run(['ingest', '--root', dir, '--out', join(dir, 'm.json')]);
    // It used to be invented as a valid OpenAPI candidate at score 100, so the failure surfaced two
    // commands later as an ENOENT about JSON parsing.
    assert.equal(r.code, 1, r.out);
    assert.match(r.out, /points at "docs\/nope\.json"/);
  });

  test('adopt records folder files, so they are protected like everything else', () => {
    const root = scratch();
    const collection = join(root, 'bruno');
    mkdirSync(join(collection, 'widgets'), { recursive: true });
    writeFileSync(join(collection, 'bruno.json'), JSON.stringify({ version: '1', name: 'F', type: 'collection' }));
    writeFileSync(join(collection, 'widgets/folder.bru'), 'meta {\n  name: widgets\n  seq: 1\n}\n');
    writeFileSync(join(collection, 'widgets/get-w.bru'), 'meta {\n  name: Get\n  type: http\n  seq: 1\n}\n\nget {\n  url: {{baseUrl}}/w\n}\n');

    assert.equal(run(['adopt', '--root', root]).code, 0);
    const lock = JSON.parse(readFileSync(join(collection, '.bruno-gen/lock.json'), 'utf8'));
    // Folders were never recorded, so they stayed UNMANAGED for ever and were reported as
    // "yours, never generated" on every run even though adopt had just seen them.
    assert.equal(lock.folders['widgets/folder.bru']?.hash, 'adopted', JSON.stringify(lock.folders));
  });
});

// =============================================================================================
// Regressions the fixes above introduced, found by attacking the change set rather than trusting it.
// Every one of these was green in the suite and still wrong.
describe('the fixes did not break what they were protecting', () => {
  const bareModel = () => ({
    modelVersion: 1,
    collection: {
      name: 'X', format: 'bru', outputDir: 'bruno', routePrefix: '',
      baseUrlVar: 'baseUrl', headers: [], auth: { mode: 'none', source: 'spec' },
      environments: [{ name: 'local', vars: { baseUrl: 'https://x.example.net' }, secrets: [] }],
    },
    folders: [],
    endpoints: [{
      endpointKey: 'GET /a', name: 'A', method: 'GET', pathTemplate: '/a', params: [], headers: [],
      body: { kind: 'none' }, auth: { mode: 'inherit' }, tags: [], destructive: false,
      responses: [], asserts: [], settings: {}, seq: 1, flags: [],
    }],
    unresolved: [],
  });

  test('a reserved file name in the LOCKFILE cannot brick the collection', () => {
    // avoidReserved guarded the model-supplied name but not the frozen one, so a lockfile carrying
    // `fileName: "collection"` made the new duplicate-path assertion fire on every plan AND apply,
    // with no CLI route out of it - worse than the silent overwrite it replaced.
    for (const frozenName of ['collection', 'Collection', 'folder']) {
      assert.doesNotThrow(() => {
        planFiles(bareModel(), { frozen: { fileNames: { 'GET /a': frozenName }, seqs: {}, takenByDir: {} } });
      }, `frozen fileName ${frozenName}`);
    }
  });

  test('an environment that declares no variables still gets its secret names', () => {
    // "parsed to zero variables" was treated as "not a file we understand", so an ordinary empty
    // environment silently stopped having its secrets declared - and nothing reported it.
    for (const [fmt, body] of [['bru', 'vars {\n}\n'], ['yml', 'name: local\nvariables: []\n']]) {
      const dir = scratch();
      mkdirSync(join(dir, 'environments'), { recursive: true });
      writeFileSync(
        join(dir, fmt === 'yml' ? 'opencollection.yml' : 'bruno.json'),
        fmt === 'yml' ? 'opencollection: 1.0.0\ninfo:\n  name: X\n' : '{"version":"1","name":"X","type":"collection"}',
      );
      writeFileSync(join(dir, `environments/local.${fmt}`), body);
      const d = planMerge({
        collectionRoot: dir,
        format: fmt,
        planned: [{ relPath: `environments/local.${fmt}`, kind: 'environment', createOnce: true, secretNames: ['apiKey'], content: body }],
        lock: { requests: {}, environments: {}, folders: {}, config: {} },
      }).decisions.find((x) => x.relPath === `environments/local.${fmt}`);
      assert.equal(d.status, STATUS.SECRETS_ADDED, `${fmt}: ${d.status}`);
    }
  });

  test('an unmanaged copy elsewhere does not stop a deleted endpoint being restored', () => {
    const dir = scratch();
    mkdirSync(join(dir, 'scratch'), { recursive: true });
    writeFileSync(join(dir, 'bruno.json'), '{"version":"1","name":"M","type":"collection"}');
    const content = 'meta {\n  name: W\n  type: http\n  seq: 1\n}\n\nget {\n  url: {{baseUrl}}/widgets\n}\n';
    // A copy the user keeps for scratch work, holding the same endpoint.
    writeFileSync(join(dir, 'scratch/try-it.bru'), content);
    const planned = [{ relPath: 'get-widgets.bru', kind: 'request', endpointKey: 'GET /widgets', seq: 1, fileName: 'get-widgets', content }];
    const lock = {
      requests: { 'get-widgets.bru': { kind: 'request', hash: 'stale', endpointKey: 'GET /widgets', seq: 1 } },
      environments: {}, folders: {}, config: {},
    };

    // Matching the identity ANYWHERE made this "you moved it to scratch/try-it.bru" - untrue - and
    // the endpoint was never restored. A rename keeps the file in its directory; a copy does not.
    const d = planMerge({ collectionRoot: dir, format: 'bru', planned, lock }).decisions
      .find((x) => x.relPath === 'get-widgets.bru');
    assert.equal(d.status, STATUS.RESTORED);

    writeFileSync(join(dir, 'renamed.bru'), content);
    const d2 = planMerge({ collectionRoot: dir, format: 'bru', planned, lock }).decisions
      .find((x) => x.relPath === 'get-widgets.bru');
    assert.equal(d2.status, STATUS.MOVED, 'a same-directory rename is still recognised');
    assert.equal(d2.movedTo, 'renamed.bru');
  });

  test('an unsupported-stack root does not make a repository with a usable spec exit 3', () => {
    const dir = scratch();
    mkdirSync(join(dir, 'backend'), { recursive: true });
    mkdirSync(join(dir, 'docs'), { recursive: true });
    writeFileSync(join(dir, 'backend/pyproject.toml'), '[project]\nname = "x"\n');
    writeFileSync(join(dir, 'backend/main.py'), 'app = 1\n');
    writeFileSync(join(dir, 'docs/openapi.json'), JSON.stringify(SPEC));
    // Exit 3 is what SKILL.md tells the model to stop on, so claiming it for a repository whose spec
    // probe itself ranked first would abandon a perfectly supported job.
    assert.equal(probe(dir).surfaceButUnsupported, false);
  });

  test('a declared spec that exists is used even when probe did not enumerate it', () => {
    const dir = scratch();
    mkdirSync(join(dir, 'dist'), { recursive: true });
    writeFileSync(join(dir, 'package.json'), '{"name":"x"}');
    // probe skips built output, so "probe did not list it" and "it is not there" are different
    // answers - and only the second is an error.
    writeFileSync(join(dir, 'dist/generated-openapi.json'), JSON.stringify(SPEC));
    writeFileSync(join(dir, 'bruno-gen.json'), JSON.stringify({ projects: [{ path: '.', name: 'api', spec: 'dist/generated-openapi.json' }] }));
    assert.equal(run(['ingest', '--root', dir, '--out', join(dir, 'm.json')]).code, 0);
  });

  test('a Postman collection variable supplies the host for the {{baseUrl}} idiom', async () => {
    const pm = {
      info: { name: 'P', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
      variable: [{ key: 'baseUrl', value: 'https://api.example.com' }],
      item: [{ name: 'A', request: { method: 'GET', url: { raw: '{{baseUrl}}/things', host: ['{{baseUrl}}'], path: ['things'] } } }],
    };
    // Reading only the request urls found no origin for the commonest export shape, and the new
    // base-URL contract then turned that into a confident exit 4.
    const { model } = await ingestViaConverter(KIND.POSTMAN, pm, { format: 'bru', outputDir: 'bruno' });
    assert.equal(model.collection.environments[0].vars.baseUrl, 'https://api.example.com');
  });

  test('a rejected string body names the position, never the body', () => {
    const m = bareModel();
    m.endpoints[0].body = { kind: 'json', json: '{"tok":"hunter2-do-not-print"', source: 'human', confidence: 'high' };
    const problems = validateModel(m).problems.filter((p) => /body\.json/.test(p));
    assert.equal(problems.length, 1);
    // The same leak spec-parse had just been fixed for: V8 embeds a window of the source.
    assert.ok(!problems[0].includes('hunter2'), problems[0]);
  });

  test('userinfo is redacted at the last @, and without a scheme', () => {
    // `[^/@]+@` bound to the FIRST '@', so a password containing one had its tail printed.
    assert.equal(redactUrl('https://admin:p@ssw0rd@host.example.net/x'), 'https://…@host.example.net/x');
    assert.equal(redactUrl('//admin:pw@host.example.net/x'), '//…@host.example.net/x');
  });
});

// =============================================================================================
// From an external review of an early plan, re-checked against the shipped code. Most of that review
// was already satisfied; these are the parts that genuinely were not.
describe('the external review: what was actually still open', () => {
  test('adopt --json is one JSON document and never quotes the file', () => {
    const root = scratch();
    mkdirSync(join(root, 'bruno'), { recursive: true });
    writeFileSync(join(root, 'bruno/bruno.json'), '{"version":"1","name":"A","type":"collection"}');
    // adopt was the last call site using the raw reader, which writes a code frame to STDOUT.
    writeFileSync(join(root, 'bruno/broken.bru'), 'meta {\n  name: Broken\n  looks-secret: hunter2\n{{{\n');

    const r = spawnSync(process.execPath, [CLI, 'adopt', '--root', root, '--json'], { encoding: 'utf8', cwd: repoRoot });
    assert.doesNotThrow(() => JSON.parse(r.stdout), `stdout was not one JSON document:\n${r.stdout.slice(0, 300)}`);
    assert.ok(!r.stdout.includes('hunter2'), 'the parser must not echo file content into stdout');
  });

  test('a repository whose only description is Swagger 2.0 exits 3, not 2', () => {
    const dir = scratch();
    writeFileSync(join(dir, 'swagger.json'), JSON.stringify({
      swagger: '2.0', info: { title: 'Old', version: '1' },
      paths: { '/a': { get: { responses: { 200: { description: 'ok' } } } } },
    }));
    // Exit 2 means "nothing here", which sent the user looking for a missing API instead of reading
    // the one actionable line: convert the spec.
    const r = run(['probe', '--root', dir]);
    assert.equal(r.code, 3, r.out);
    assert.match(r.out, /Swagger 2\.0/);
    assert.doesNotMatch(r.out, /No API description and no recognised project found/);

    // ...and a genuinely empty repository still exits 2.
    const empty = scratch();
    writeFileSync(join(empty, 'README.md'), '# nothing\n');
    assert.equal(run(['probe', '--root', empty]).code, 2);
  });

  test('the scan digest changes when a description changes at the same length', () => {
    const dir = scratch();
    const spec = (title) => JSON.stringify({
      openapi: '3.0.0', info: { title, version: '1' }, servers: [{ url: 'https://api.example.com' }],
      paths: { '/a': { get: { operationId: 'a', responses: { 200: { description: 'ok' } } } } },
    });
    // It hashed file SIZES, so two specs differing only by a same-length rename hashed identically -
    // a field printed as a digest that does not move when its subject does.
    writeFileSync(join(dir, 'openapi.json'), spec('AAA'));
    const before = probe(dir).scanDigest;
    writeFileSync(join(dir, 'openapi.json'), spec('BBB'));
    assert.notEqual(probe(dir).scanDigest, before);
  });

  test('a parameter whose style cannot be honoured is named, and a plain one is not', () => {
    const r = ingestOpenApi({
      openapi: '3.0.0', info: { title: 'T', version: '1' }, servers: [{ url: 'https://api.example.com' }],
      paths: {
        '/search': {
          get: {
            operationId: 's',
            parameters: [
              { name: 'filter', in: 'query', style: 'deepObject', explode: true, schema: { type: 'object' } },
              { name: 'plain', in: 'query', schema: { type: 'string' } },
            ],
            responses: { 200: { description: 'ok' } },
          },
        },
      },
    });
    // The writer emits one flat name=value, so deepObject goes out wrong on the wire. Every other
    // loss in ingest was named; this one was silent.
    assert.match(r.warnings.join('\n'), /"filter" uses style "deepObject"/);
    assert.ok(r.capability.some((c) => c.subject === 'parameter-style'));
    assert.ok(!r.warnings.some((w) => /"plain"/.test(w)), 'an ordinary parameter says nothing');
  });

  test('a discriminated body says which branch it is', () => {
    const r = ingestOpenApi({
      openapi: '3.0.0', info: { title: 'T', version: '1' }, servers: [{ url: 'https://api.example.com' }],
      components: {
        schemas: {
          Cat: { type: 'object', properties: { kind: { type: 'string' }, meow: { type: 'string' } } },
          Dog: { type: 'object', properties: { kind: { type: 'string' }, woof: { type: 'string' } } },
          Pet: {
            oneOf: [{ $ref: '#/components/schemas/Cat' }, { $ref: '#/components/schemas/Dog' }],
            discriminator: { propertyName: 'kind', mapping: { cat: '#/components/schemas/Cat', dog: '#/components/schemas/Dog' } },
          },
        },
      },
      paths: {
        '/pets': {
          post: {
            operationId: 'create',
            requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Pet' } } } },
            responses: { 201: { description: 'ok' } },
          },
        },
      },
    });
    // Without the discriminator the body is a valid shape the server cannot dispatch, which reads as
    // a server bug rather than a limit of the generated body.
    assert.equal(r.model.endpoints[0].body.json.kind, 'cat');
  });

  test('a lockfile key that escapes the collection is never offered for pruning', () => {
    const dir = scratch();
    const collection = join(dir, 'bruno');
    mkdirSync(join(collection, '.bruno-gen'), { recursive: true });
    writeFileSync(join(collection, 'bruno.json'), '{"version":"1","name":"E","type":"collection"}');
    // A committed lockfile is untrusted input. apply's assertInside would refuse the delete, but a
    // report that OFFERS --prune on an outside path is already wrong.
    const d = planMerge({
      collectionRoot: collection,
      format: 'bru',
      planned: [],
      lock: {
        requests: { '../../../../etc/hosts': { kind: 'request', hash: 'x', endpointKey: 'GET /x' } },
        environments: {}, folders: {}, config: {},
      },
    }).decisions.find((x) => x.relPath === '../../../../etc/hosts');
    assert.equal(d.status, STATUS.UNMANAGED);
    assert.match(d.note, /outside the collection/);
  });

  test('a damaged lockfile is a named diagnosis with a way out, not a stack trace', () => {
    const root = scratch();
    writeFileSync(join(root, 'openapi.json'), JSON.stringify(SPEC));
    assert.equal(run(['ingest', '--root', root, '--out', join(root, 'm.json')]).code, 0);
    assert.equal(run(['apply', '--root', root, '--model', join(root, 'm.json')]).code, 0);
    writeFileSync(join(root, 'bruno/.bruno-gen/lock.json'), '{"lockfileVersion":1,"requests":{');

    const r = run(['plan', '--root', root, '--model', join(root, 'm.json')]);
    assert.equal(r.code, 1, r.out);
    assert.match(r.out, /cannot read/);
    assert.match(r.out, /adopt/, 'the diagnosis has to say what to do about it');
    assert.doesNotMatch(r.out, /\n\s+at /, 'a stack trace is not a diagnosis');
  });
});

// =============================================================================================
// A deep, full-codebase review against every doc claim, not just a recent change.
describe('the deep review: what was actually still open', () => {
  test('--reset refuses to touch a file recorded as adopted', () => {
    const root = scratch();
    writeFileSync(join(root, 'openapi.json'), JSON.stringify(SPEC));
    const modelPath = join(root, 'model.json');
    assert.equal(run(['ingest', '--root', root, '--out', modelPath]).code, 0);
    assert.equal(run(['apply', '--root', root, '--model', modelPath]).code, 0);

    const target = join(root, 'bruno/get-v1-things.yml');
    const handWritten = readFileSync(target, 'utf8').replace('listThings', 'MyOwnRequest');
    writeFileSync(target, handWritten);

    // Mark it adopted, as `adopt` would for a file this tool did not generate.
    const lockFile = join(root, 'bruno/.bruno-gen/lock.json');
    const lock = JSON.parse(readFileSync(lockFile, 'utf8'));
    lock.requests['get-v1-things.yml'].hash = 'adopted';
    writeFileSync(lockFile, JSON.stringify(lock));

    // --reset exists to accept generated content over a plain edit. Without a check, it accepted
    // generated content over an ADOPTED file too - the one class of file this tool promises never to
    // overwrite - silently converting a hand-written file into a machine-owned one.
    const r = run(['apply', '--root', root, '--model', modelPath, '--reset', 'get-v1-things.yml']);
    assert.notEqual(r.code, 0, r.out);
    assert.match(r.out, /adopted/);
    assert.equal(readFileSync(target, 'utf8'), handWritten, '--reset overwrote an adopted file');
    const after = JSON.parse(readFileSync(lockFile, 'utf8'));
    assert.equal(after.requests['get-v1-things.yml'].hash, 'adopted', '--reset stripped the adopted marker');
  });

  test('a renamed request migrates its lockfile entry to the new path', () => {
    const root = scratch();
    writeFileSync(join(root, 'openapi.json'), JSON.stringify(SPEC));
    const modelPath = join(root, 'model.json');
    assert.equal(run(['ingest', '--root', root, '--out', modelPath]).code, 0);
    assert.equal(run(['apply', '--root', root, '--model', modelPath]).code, 0);

    renameSync(join(root, 'bruno/get-v1-things.yml'), join(root, 'bruno/renamed-by-hand.yml'));

    // Applying again reports the rename and changes nothing on disk - but the lockfile used to keep
    // a permanent, dangling entry under the old name and never recorded the file under its real one.
    const r = run(['apply', '--root', root, '--model', modelPath]);
    assert.equal(r.code, 0, r.out);
    assert.match(r.out, /moved/);

    const lock = JSON.parse(readFileSync(join(root, 'bruno/.bruno-gen/lock.json'), 'utf8'));
    assert.ok(lock.requests['renamed-by-hand.yml'], 'the new name must be recorded as owned');
    assert.equal(lock.requests['renamed-by-hand.yml'].endpointKey, 'GET /v1/things');
    assert.equal(lock.requests['get-v1-things.yml'], undefined, 'the old, now-nonexistent path must not linger');
  });

  test('a required path parameter is not "already reported" just because its name is a substring of another', () => {
    const model = {
      modelVersion: 1,
      collection: {
        name: 'X', format: 'bru', outputDir: 'bruno', routePrefix: '', baseUrlVar: 'baseUrl',
        environments: [{ name: 'dev', vars: {}, secrets: [] }],
      },
      folders: [],
      endpoints: [{
        endpointKey: 'GET /widgets/{1}/reviews/{2}',
        name: 'Get review',
        method: 'GET',
        pathTemplate: '/widgets/{widgetId}/reviews/{id}',
        params: [
          { in: 'path', name: 'widgetId', required: true, value: '', disabled: false },
          { in: 'path', name: 'id', required: true, value: '', disabled: false },
        ],
      }],
      // Only the longer name is listed. A plain `field.includes(p.name)` treated "id" as already
      // reported too, because "widgetId" contains "id" as a substring.
      unresolved: [
        { endpointKey: 'GET /widgets/{1}/reviews/{2}', field: '/params/path/widgetId/value', reason: 'no usable value' },
      ],
    };
    const check = validateModel(model);
    assert.equal(check.ok, false, 'dropping "id" from unresolved[] must still be caught');
    assert.ok(
      check.problems.some((p) => /"id"/.test(p) && /not listed in unresolved/.test(p)),
      check.problems.join(' | '),
    );
  });

  test('a literal "//" inside a route string is not mistaken for the start of a comment', () => {
    const dir = scratch();
    // The "//" inside the string sits BEFORE the HTTP marker on the same line. A comment stripper
    // that does not track string literals reads it as a line comment and drops everything after it -
    // including the marker that would otherwise make this an HTTP surface.
    writeFileSync(join(dir, 'app.js'), 'const legacyPath = "/a//b"; router.get("/widgets", h);');
    assert.equal(surfaceSignals(dir).hasHttp, true, 'a "//" inside a string must not hide a marker after it');
  });
});
