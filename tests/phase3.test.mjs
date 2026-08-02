// Phase 3: spec ingestion and the value-population contract.
//
// The VP-* tests are the acceptance criteria from the plan, named so a failure says which one.

import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, cpSync } from 'node:fs';
import { removeDir, runScopedBase, pruneStale } from './tmpdir.mjs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CLI = join(repoRoot, 'plugins/bruno-gen-collection/skills/bruno-collection-generator/scripts/brunogen.mjs');
const fixtures = join(repoRoot, 'tests/fixtures');
const tmpBase = runScopedBase(join(repoRoot, 'tests/.tmp/phase3'));

const S = 'plugins/bruno-gen-collection/skills/bruno-collection-generator/scripts/lib/';
const { readSpec, classify, parseStructured, KIND, SKIP } = await import(`../${S}spec-parse.mjs`);
const { probe } = await import(`../${S}probe.mjs`);
const { isUsable, synthesize, resolveValue, exampleFromSchema, collapseDuplicateParams, CONSTANTS } =
  await import(`../${S}resolve-values.mjs`);
const { ingestOpenApi } = await import(`../${S}ingest.mjs`);
const { validateModel } = await import(`../${S}model-validate.mjs`);

const run = (args, cwd = repoRoot) => {
  const r = spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8', cwd });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
};

const spec = () =>
  readSpec(join(fixtures, 'spec-openapi/openapi.yaml'));

const ingested = () => {
  const s = spec();
  assert.ok(s.ok, 'the fixture spec must parse');
  return ingestOpenApi(s.data, { format: 'bru', outputDir: 'bruno' });
};

const endpointBy = (model, key) => model.endpoints.find((e) => e.endpointKey === key);

before(() => {
  removeDir(tmpBase);
  pruneStale(tmpBase);
});

describe('spec-parse: nothing fails silently', () => {
  test('an empty file is skipped with a named reason', () => {
    const r = readSpec(join(fixtures, 'spec-broken/empty-openapi.yaml'));
    assert.equal(r.ok, false);
    assert.equal(r.skip, SKIP.EMPTY);
  });

  test('a malformed file reports both parser errors', () => {
    const r = readSpec(join(fixtures, 'spec-broken/malformed-openapi.yaml'));
    assert.equal(r.ok, false);
    assert.equal(r.skip, SKIP.UNPARSEABLE);
    assert.match(r.detail, /yaml:|json:/);
  });

  test('a spec with no paths is skipped rather than yielding an empty collection', () => {
    const r = readSpec(join(fixtures, 'spec-broken/no-paths-openapi.json'));
    assert.equal(r.ok, false);
    assert.equal(r.skip, SKIP.NO_PATHS);
  });

  test('Swagger 2.0 is recognised and REJECTED, never silently converted', () => {
    // openApiToBruno would otherwise dispatch this to its Swagger-2 path, shipping exactly what
    // the capability matrix says is unsupported.
    const r = readSpec(join(fixtures, 'spec-broken/swagger2-api.json'));
    assert.equal(r.ok, false);
    assert.equal(r.skip, SKIP.SWAGGER2);
    assert.equal(r.kind, KIND.SWAGGER2);
  });

  test('YAML is parsed even when the file is named .json, and vice versa', () => {
    const dir = join(tmpBase, 'syntax');
    mkdirSync(dir, { recursive: true });
    const yamlInJson = join(dir, 'looks-like.json');
    writeFileSync(yamlInJson, 'openapi: 3.0.3\ninfo:\n  title: X\n  version: "1"\npaths:\n  /a:\n    get: {}\n');
    const r = readSpec(yamlInJson);
    assert.equal(r.ok, true, JSON.stringify(r));
    assert.equal(r.syntax, 'yaml');
  });

  test('classification distinguishes openapi, swagger2 and postman', () => {
    assert.equal(classify({ openapi: '3.1.0' }), KIND.OPENAPI);
    assert.equal(classify({ swagger: '2.0' }), KIND.SWAGGER2);
    assert.equal(classify({ info: { _postman_id: 'x' } }), KIND.POSTMAN);
    assert.equal(classify({ hello: 'world' }), KIND.UNKNOWN);
  });
});

describe('probe', () => {
  test('finds the spec and scores it, reporting why', () => {
    const p = probe(join(fixtures, 'spec-openapi'));
    const best = p.candidates.find((c) => c.kind === 'openapi');
    assert.ok(best, 'the spec should be a candidate');
    assert.equal(best.endpointCount, 5);
    assert.ok(best.reasons.length > 0, 'a candidate must explain its score');
  });

  test('reports Swagger 2.0 as an unsupported capability, not as a candidate', () => {
    const p = probe(join(fixtures, 'spec-broken'));
    assert.equal(p.candidates.filter((c) => c.kind === 'openapi').length, 0);
    assert.ok(p.capability.some((c) => c.subject === 'swagger-2.0' && c.supported === false));
  });

  test('keeps quiet about files that were never meant to be specs', () => {
    const dir = join(tmpBase, 'noise');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'appsettings.json'), '{"Logging":{"LogLevel":{"Default":"Information"}}}');
    writeFileSync(join(dir, 'tsconfig.json'), '{"compilerOptions":{}}');
    const p = probe(dir);
    assert.equal(p.skipped.filter((s) => s.named).length, 0, 'ordinary config must not be named');
  });

  test('an existing collection is the output target, never a candidate', () => {
    const p = probe(join(fixtures, 'collection-bru'));
    assert.equal(p.collections.length, 1);
    assert.equal(p.candidates.filter((c) => c.kind === 'openapi' || c.kind === 'postman').length, 0);
  });

  test('the scan digest is content-based and stable across runs', () => {
    const a = probe(join(fixtures, 'spec-openapi')).scanDigest;
    const b = probe(join(fixtures, 'spec-openapi')).scanDigest;
    assert.equal(a, b);
    assert.match(a, /^sha256:[0-9a-f]{64}$/);
  });

  test('the scan digest changes for a same-size source edit', () => {
    const dir = join(tmpBase, 'same-size-digest');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'package.json'), '{"name":"digest-fixture"}\n');
    const source = join(dir, 'app.js');
    writeFileSync(source, 'app.get("/a", handler);\n');
    const before = probe(dir).scanDigest;
    writeFileSync(source, 'app.get("/b", handler);\n');
    const after = probe(dir).scanDigest;
    assert.notEqual(after, before, 'equal byte length must not mean equal content identity');
  });
});

describe('value resolution', () => {
  test('documentation junk is not a usable value', () => {
    for (const junk of ['', '   ', '<object_name>', 'https://...', 'https://.../data/{id}', 'TODO', 'changeme', 'your-api-key']) {
      assert.equal(isUsable(junk), false, JSON.stringify(junk));
    }
    for (const good of ['NL', '50', 'bolt', 'https://api.example.com', 0, false]) {
      assert.equal(isUsable(good), true, JSON.stringify(good));
    }
  });

  test('synthesis never reads the clock', () => {
    assert.equal(synthesize({ type: 'string', format: 'date-time' }), CONSTANTS['date-time']);
    assert.equal(synthesize({ type: 'string', format: 'date' }), '1970-01-01');
    const thisYear = String(new Date().getFullYear());
    assert.ok(!CONSTANTS['date-time'].includes(thisYear), 'a constant must not contain the current year');
  });

  test('precedence runs config over observed over declared over synthesized', () => {
    const schema = { type: 'string' };
    assert.equal(resolveValue({ config: 'c', observed: 'o', declared: 'd', schema }).source, 'config');
    assert.equal(resolveValue({ observed: 'o', declared: 'd', schema }).source, 'observed');
    assert.equal(resolveValue({ declared: 'd', schema }).source, 'declared');
    assert.equal(resolveValue({ schema }).source, 'synthesized');
  });

  test('an observed value that is junk falls through instead of winning', () => {
    // A README containing `"post_url": ""` must not beat the synthesiser that would have worked.
    const r = resolveValue({ observed: '', declared: 'https://api.example.com', schema: { type: 'string' } });
    assert.equal(r.source, 'declared');
    assert.equal(r.value, 'https://api.example.com');
  });

  test('an optional enum collapses to one entry, keeping the alternatives', () => {
    const collapsed = collapseDuplicateParams([
      { in: 'query', name: 'mode', value: 'fast', enum: ['fast'] },
      { in: 'query', name: 'mode', value: 'slow', enum: ['slow'] },
    ]);
    assert.equal(collapsed.length, 1, 'duplicate query keys must be collapsed');
    assert.deepEqual(collapsed[0].enum.sort(), ['fast', 'slow']);
  });

  test('a schema example beats a generated one, and readOnly is excluded', () => {
    const built = exampleFromSchema(
      {
        type: 'object',
        properties: {
          a: { type: 'string', example: 'given' },
          b: { type: 'integer', default: 7 },
          c: { type: 'string', readOnly: true },
        },
      },
      { root: {} },
    );
    assert.equal(built.a, 'given');
    assert.equal(built.b, 7);
    assert.ok(!('c' in built), 'readOnly must not appear in a request body');
  });

  test('a recursive schema terminates', () => {
    const root = { components: { schemas: { Node: { type: 'object', properties: { child: { $ref: '#/components/schemas/Node' } } } } } };
    const built = exampleFromSchema({ $ref: '#/components/schemas/Node' }, { root });
    assert.ok(built !== undefined, 'recursion must not throw or hang');
  });
});

describe('ingest: the gaps measured in Bruno\u0027s own converter', () => {
  test('a body property default is honoured (the converter drops it)', () => {
    const { model } = ingested();
    const post = endpointBy(model, 'POST /v1/widgets');
    assert.equal(post.body.json.quantity, 12, 'default: 12 must survive; the converter emits 0');
    assert.equal(post.body.json.dimensions.widthMm, 40, 'a nested default must survive too');
  });

  test('format-typed strings get real values (the converter emits "")', () => {
    const { model } = ingested();
    const post = endpointBy(model, 'POST /v1/widgets');
    assert.equal(post.body.json.releasedOn, '1970-01-01');
    assert.equal(post.body.json.reference, '00000000-0000-0000-0000-000000000000');
  });

  test('an optional enum parameter becomes ONE disabled param, not several', () => {
    const { model } = ingested();
    const list = endpointBy(model, 'GET /v1/widgets');
    const grades = list.params.filter((p) => p.name === 'grade');
    assert.equal(grades.length, 1, 'the converter emits one disabled param per enum member');
    assert.equal(grades[0].disabled, true);
    assert.deepEqual(grades[0].enum, ['a', 'b', 'c']);
  });

  test('a required header gets a value rather than being enabled and empty', () => {
    const { model } = ingested();
    const list = endpointBy(model, 'GET /v1/widgets');
    const tenant = list.headers.find((h) => h.name === 'X-Tenant');
    assert.ok(tenant, 'the required header must be present');
    assert.equal(tenant.disabled, false);
    assert.notEqual(tenant.value, '', 'the converter emits this enabled and empty');
  });
});

describe('ingest: structure', () => {
  test('the server path becomes routePrefix and the origin becomes baseUrl', () => {
    const { model } = ingested();
    assert.equal(model.collection.routePrefix, '/v1');
    assert.equal(model.collection.environments[0].vars.baseUrl, 'https://api.example.com');
    // The prefix must not also appear in the template, or it would be applied twice.
    assert.equal(endpointBy(model, 'GET /v1/widgets').pathTemplate, '/widgets');
  });

  test('oauth2 client-credentials is derived from securitySchemes, secret by name only', () => {
    const { model } = ingested();
    assert.equal(model.collection.auth.mode, 'oauth2');
    assert.equal(model.collection.auth.oauth2.grantType, 'client_credentials');
    assert.match(model.collection.auth.oauth2.accessTokenUrl, /login\.example\.com/);
    assert.deepEqual(model.collection.environments[0].secrets, ['clientSecret']);
    assert.ok(!JSON.stringify(model.collection.environments[0].vars).includes('clientSecret'));
  });

  test('tags become folders and every endpoint lands in one', () => {
    const { model } = ingested();
    assert.deepEqual(model.folders.map((f) => f.id).sort(), ['Admin', 'Widgets']);
    for (const e of model.endpoints) assert.ok(e.folderId, `${e.endpointKey} has no folder`);
  });

  test('destructive endpoints are marked and get no generated assert', () => {
    const { model } = ingested();
    for (const key of ['DELETE /v1/widgets/{1}', 'POST /v1/admin/reset']) {
      const e = endpointBy(model, key);
      assert.equal(e.destructive, true, `${key} should be destructive`);
      assert.equal(e.asserts.length, 0, `${key} must not carry a generated assert`);
    }
    // A safe call with a non-invented body does get one.
    assert.equal(endpointBy(model, 'GET /v1/widgets').asserts.length, 1);
  });

  test('the model it produces satisfies the IR schema', () => {
    const { model } = ingested();
    const v = validateModel(model);
    assert.equal(v.ok, true, (v.problems ?? []).join('\n'));
  });
});

describe('acceptance criteria', () => {
  test('VP-1: no required input is silently empty', () => {
    const { model, unresolved } = ingested();
    for (const e of model.endpoints) {
      const inputs = [
        ...(e.params ?? []).map((p) => ({ ...p, where: p.in })),
        ...(e.headers ?? []).map((h) => ({ ...h, where: 'header', required: !h.disabled })),
      ];
      for (const p of inputs) {
        if (!p.required || p.disabled) continue;
        const listed = unresolved.some((u) => u.endpointKey === e.endpointKey && u.field.includes(p.name));
        assert.ok(
          isUsable(p.value) || listed,
          `${e.endpointKey} ${p.where} "${p.name}" is required, empty and not reported unresolved`,
        );
      }
    }
  });

  test('VP-2: no duplicate query key for a single-valued parameter', () => {
    const { model } = ingested();
    for (const e of model.endpoints) {
      const names = (e.params ?? []).filter((p) => p.in === 'query').map((p) => p.name);
      assert.equal(new Set(names).size, names.length, `${e.endpointKey} has duplicate query keys`);
    }
  });

  test('VP-3: every value carries a source and a confidence', () => {
    const { model } = ingested();
    for (const e of model.endpoints) {
      for (const p of e.params ?? []) {
        assert.ok(p.source, `${e.endpointKey} param ${p.name} has no source`);
        assert.ok(p.confidence, `${e.endpointKey} param ${p.name} has no confidence`);
      }
      if (e.body?.kind !== 'none') assert.ok(e.body.source, `${e.endpointKey} body has no source`);
    }
  });

  test('VP-4: no credential-shaped value is written; secrets are names only', () => {
    const { model } = ingested();
    const serialised = JSON.stringify(model);
    for (const shape of [/eyJ[A-Za-z0-9_-]{8,}\./, /AccountKey\s*=/, /\bsk-[A-Za-z0-9]{20,}/, /\bAKIA[0-9A-Z]{16}\b/]) {
      assert.doesNotMatch(serialised, shape, 'a credential shape reached the model');
    }
    for (const env of model.collection.environments) {
      for (const name of env.secrets ?? []) {
        assert.ok(!(name in (env.vars ?? {})), `${name} is declared secret and also has a value`);
      }
    }
  });

  test('VP-5: ingesting the same spec twice produces an identical model', () => {
    const a = JSON.stringify(ingested().model);
    const b = JSON.stringify(ingested().model);
    assert.equal(a, b, 'ingestion is not deterministic');
  });
});

describe('end to end: spec to a runnable collection', () => {
  const workspace = (name) => {
    const dir = join(tmpBase, name);
    removeDir(dir);
    mkdirSync(dir, { recursive: true });
    cpSync(join(fixtures, 'spec-openapi/openapi.yaml'), join(dir, 'openapi.yaml'));
    return dir;
  };

  test('ingest then apply produces a collection, and a rerun changes nothing', () => {
    const dir = workspace('e2e-bru');
    const model = join(dir, 'model.json');

    const ing = run(['ingest', '--root', dir, '--out', model, '--format', 'bru']);
    assert.equal(ing.code, 0, ing.out);

    const first = run(['apply', '--root', dir, '--model', model]);
    assert.equal(first.code, 0, first.out);
    assert.ok(existsSync(join(dir, 'bruno/widgets/get-v1-widgets.bru')), first.out);

    const second = run(['apply', '--root', dir, '--model', model]);
    assert.equal(second.code, 0, second.out);
    assert.match(second.out, /Nothing changed on disk/);
  });

  test('the generated request is runnable: prefix once, required in the URL, optional disabled', () => {
    const dir = workspace('e2e-shape');
    const model = join(dir, 'model.json');
    run(['ingest', '--root', dir, '--out', model, '--format', 'bru']);
    run(['apply', '--root', dir, '--model', model]);

    const bru = readFileSync(join(dir, 'bruno/widgets/get-v1-widgets.bru'), 'utf8');
    assert.match(bru, /url: \{\{baseUrl\}\}\/v1\/widgets\?country=NL/);
    assert.ok(!bru.includes('/v1/v1/'), 'the route prefix was applied twice');
    assert.match(bru, /^ {2}country: NL$/m, 'a required param must be enabled');
    assert.match(bru, /^ {2}~grade: a$/m, 'an optional param must be disabled');
    assert.match(bru, /auth: inherit/);
  });

  test('yml mode produces opencollection.yml and stays zero-diff', () => {
    const dir = workspace('e2e-yml');
    const model = join(dir, 'model.json');
    run(['ingest', '--root', dir, '--out', model, '--format', 'yml']);
    const first = run(['apply', '--root', dir, '--model', model]);
    assert.equal(first.code, 0, first.out);
    assert.ok(existsSync(join(dir, 'bruno/opencollection.yml')));
    assert.ok(!existsSync(join(dir, 'bruno/bruno.json')));
    const second = run(['apply', '--root', dir, '--model', model]);
    assert.match(second.out, /Nothing changed on disk/);
  });

  test('a Swagger 2.0 spec exits 3 and writes nothing', () => {
    const dir = join(tmpBase, 'e2e-swagger2');
    removeDir(dir);
    mkdirSync(dir, { recursive: true });
    cpSync(join(fixtures, 'spec-broken/swagger2-api.json'), join(dir, 'swagger2-api.json'));
    const { code, out } = run(['ingest', '--root', dir, '--out', join(dir, 'model.json'), '--spec', join(dir, 'swagger2-api.json')]);
    assert.equal(code, 3, out);
    assert.ok(!existsSync(join(dir, 'model.json')), 'no model should be written');
  });

  test('a repository with nothing to describe exits 2', () => {
    const { code } = run(['probe', '--root', join(fixtures, 'no-collection')]);
    assert.equal(code, 2);
  });
});
