// Phase 5: configuration, project selection, legacy migration, and smoke.
//
// The theme running through all of it is that this phase decides things on the user's behalf, and
// every such decision is a place where the wrong answer looks exactly like the right one. A
// collection generated for the billing service when the user meant orders is not visibly broken.
// A migrated environment that quietly kept a stale hostname sends every request to the wrong host
// and still passes. So the assertions here are mostly about refusing to guess, and about which of
// two disagreeing inputs wins.
//
// `smoke` is tested up to but not including the network: the command it builds, the consent gate,
// the redaction, and the parsing of a reporter file. Whether a real API answers is not something CI
// can assert without a real API.

import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync, rmSync, existsSync, cpSync, readdirSync, statSync } from 'node:fs';
import { removeDir, runScopedBase, pruneStale } from './tmpdir.mjs';
import { join, dirname, basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CLI = join(repoRoot, 'plugins/bruno-gen-collection/skills/bruno-collection-generator/scripts/brunogen.mjs');
const fixtures = join(repoRoot, 'tests/fixtures');
const tmpBase = runScopedBase(join(repoRoot, 'tests/.tmp/phase5'));

const S = 'plugins/bruno-gen-collection/skills/bruno-collection-generator/scripts/lib/';
const { loadConfig, emptyConfig, settingsFor, DEFAULT_PLACEHOLDERS } = await import(`../${S}config.mjs`);
const { enumerateProjects, selectProject, RULE } = await import(`../${S}projects.mjs`);
const { detectLegacy, layerLegacy, legacyBodyFor, applyLegacyBodies, bodyKey } = await import(`../${S}migrate.mjs`);
const { bruArgs, redactUrl, normaliseResults, environmentsIn } = await import(`../${S}smoke.mjs`);
const { probe } = await import(`../${S}probe.mjs`);

const run = (args, cwd = repoRoot) => {
  const r = spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8', cwd });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
};

let seq = 0;
/**
 * A throwaway copy of a fixture: these tests write config into it and run apply against it.
 *
 * The copy is stripped of any `.bruno-gen/` directory, and that is not tidiness. The
 * legacy-sidecars fixture means "a collection with no lockfile", which is what makes `apply` refuse
 * until `adopt` has run - the precondition several tests here assert. Point a real session at the
 * fixture, let it run `adopt`, and it leaves a lockfile behind: untracked, so CI still passes from a
 * fresh clone, while the same tests fail on the machine where it happened. Enforcing the fixture's
 * contract at copy time makes the tests mean the same thing either way.
 */
function copy(name) {
  const dest = join(tmpBase, `${name}-${++seq}`);
  removeDir(dest);
  mkdirSync(dirname(dest), { recursive: true });
  // legacy-sidecars is also a real .csproj; see the matching comment in phase4.test.mjs.
  cpSync(join(fixtures, name), dest, {
    recursive: true,
    filter: (src) => !['bin', 'obj'].includes(basename(src)),
  });
  rmSync(join(dest, 'bruno/collection/.bruno-gen'), { recursive: true, force: true });
  rmSync(join(dest, 'bruno/.bruno-gen'), { recursive: true, force: true });
  return dest;
}

/** An empty directory, for the cases where the absence of a file is the input. */
function bare() {
  const dest = join(tmpBase, `bare-${++seq}`);
  mkdirSync(dest, { recursive: true });
  return dest;
}

const writeConfig = (root, obj) =>
  writeFileSync(join(root, 'bruno-gen.json'), typeof obj === 'string' ? obj : `${JSON.stringify(obj, null, 2)}\n`);

before(() => {
  removeDir(tmpBase);
  pruneStale(tmpBase);
});

// =============================================================================================
describe('bruno-gen.json is untrusted input', () => {
  test('no config at all is not an error', () => {
    const c = loadConfig(bare());
    assert.equal(c.present, false);
    assert.deepEqual(c.problems, []);
    assert.equal(c.placeholders.length, DEFAULT_PLACEHOLDERS.length, 'the documented markers stay allowed');
  });

  test('malformed JSON is a named problem, not an exception', () => {
    const root = bare();
    writeConfig(root, '{ "name": "half a fi');
    const c = loadConfig(root);
    assert.equal(c.problems.length, 1);
    assert.match(c.problems[0], /not valid JSON/);
  });

  test('an absolute output_dir is rejected, naming the key', () => {
    const root = bare();
    writeConfig(root, { output_dir: 'C:\\Windows\\system32' });
    const c = loadConfig(root);
    assert.ok(c.problems.some((p) => /output_dir/.test(p) && /absolute/.test(p)), c.problems.join(' | '));
  });

  test('a project path that climbs out of the repository is rejected', () => {
    const root = bare();
    writeConfig(root, { projects: [{ name: 'escape', path: '../../elsewhere' }] });
    const c = loadConfig(root);
    assert.ok(c.problems.some((p) => /projects\[0\]\.path/.test(p) && /\.\./.test(p)), c.problems.join(' | '));
  });

  test('two projects claiming one name is a problem, not a silent winner', () => {
    const root = bare();
    writeConfig(root, { projects: [{ name: 'api', path: 'a' }, { name: 'API', path: 'b' }] });
    const c = loadConfig(root);
    assert.ok(c.problems.some((p) => /already used/.test(p)), c.problems.join(' | '));
  });

  test('an unknown key is a warning, so a newer config still runs', () => {
    const root = bare();
    writeConfig(root, { name: 'Widgets', somethingFromNextYear: true });
    const c = loadConfig(root);
    assert.deepEqual(c.problems, []);
    assert.ok(c.warnings.some((w) => /somethingFromNextYear/.test(w)), c.warnings.join(' | '));
    assert.equal(c.name, 'Widgets', 'the keys it does understand still apply');
  });

  test('environments accept the short form and normalise to the IR shape', () => {
    const root = bare();
    writeConfig(root, { environments: { local: 'http://localhost:7071', test: 'https://test.example.com' } });
    const c = loadConfig(root);
    assert.equal(c.environments.length, 2);
    assert.deepEqual(c.environments[0], { name: 'local', vars: { baseUrl: 'http://localhost:7071' }, secrets: [] });
  });

  test('headers accept both an object and an array', () => {
    const a = bare();
    writeConfig(a, { headers: { Accept: 'application/json' } });
    const b = bare();
    writeConfig(b, { headers: [{ name: 'Accept', value: 'application/json' }] });
    assert.deepEqual(loadConfig(a).headers, loadConfig(b).headers);
  });

  test('a placeholder pattern that does not compile is caught here, not at scan time', () => {
    const root = bare();
    writeConfig(root, { placeholders: ['^__[A-Z]+__$', '([unclosed'] });
    const c = loadConfig(root);
    assert.ok(c.problems.some((p) => /placeholders\[1\]/.test(p)), c.problems.join(' | '));
  });

  test('a repository cannot supply a catastrophic-backtracking placeholder expression', () => {
    const root = bare();
    writeConfig(root, { placeholders: ['^(a+)+$', '^a*a*a*a*b$'] });
    const c = loadConfig(root);
    assert.ok(c.problems.some((p) => /placeholders\[0\].*repeated groups/.test(p)), c.problems.join(' | '));
    assert.ok(c.problems.some((p) => /placeholders\[1\].*repetition operator/.test(p)), c.problems.join(' | '));
  });

  test('a project setting overrides the top-level one without merging the others', () => {
    const config = { ...emptyConfig(), name: 'Repo', environments: [{ name: 'a', vars: {} }] };
    // `settingsFor` takes a catalogue project and reads its carried config entry. Passing a
    // config-shaped object directly is what hid the bug below: every per-project setting except
    // name/path/output was validated and then dropped on the way through the catalogue.
    const project = {
      name: 'orders',
      path: 'services/orders',
      settings: { displayName: 'Orders', environments: [{ name: 'b', vars: {} }] },
    };
    const s = settingsFor(config, project);
    assert.equal(s.name, 'Orders');
    assert.deepEqual(s.environments.map((e) => e.name), ['b'], 'declaring environments means those, not both sets');
  });

  test('every per-project setting survives the trip through the catalogue', () => {
    const root = bare();
    writeConfig(root, {
      environments: { toplevel: 'http://127.0.0.1:1111' },
      projects: [
        {
          path: '.',
          name: 'orders',
          format: 'bru',
          base_path: '/from-project',
          environments: { projectenv: 'http://127.0.0.1:2222' },
          headers: { 'X-From-Project': '1' },
          auth: 'bearer',
        },
      ],
    });
    const config = loadConfig(root);
    assert.deepEqual(config.problems, []);
    const s = settingsFor(config, { name: 'orders', path: '.', settings: config.projects[0] });

    assert.deepEqual(s.environments.map((e) => e.name), ['projectenv'], 'the project environment, not the repository one');
    assert.equal(s.format, 'bru');
    assert.equal(s.basePath, '/from-project');
    assert.equal(s.auth.mode, 'bearer');
    assert.deepEqual(s.headers.map((h) => h.name), ['X-From-Project']);
  });

  test('a project name the user never wrote does not become the collection name', () => {
    const config = { ...emptyConfig(), name: 'Chosen By Me' };
    // A project discovered by probe is named after its directory. That is a selector for
    // --project, never a display name, and it must not outrank the configured name or the
    // spec title.
    const discovered = { name: 'src/PaymentsApi', path: 'src/PaymentsApi' };
    assert.equal(settingsFor(config, discovered).name, 'Chosen By Me');
    assert.equal(settingsFor({ ...emptyConfig() }, discovered).name, undefined, 'nothing to apply, so the spec title stands');
  });
});

// =============================================================================================
describe('project selection refuses to guess', () => {
  const twoProjects = () => probe(join(fixtures, 'multi-project'));

  test('two comparable APIs are ambiguous, not a race the higher score wins', () => {
    const projects = enumerateProjects(twoProjects(), { projects: undefined });
    const chosen = selectProject(projects, {});
    assert.ok(chosen.ambiguous, `expected ambiguity, got ${JSON.stringify(chosen.rule ?? chosen)}`);
    assert.equal(chosen.ambiguous.length, 2);
    assert.match(chosen.reason, /look like APIs/);
  });

  test('each project is attached to its own description', () => {
    const projects = enumerateProjects(twoProjects(), { projects: undefined });
    const orders = projects.find((p) => p.path === 'services/orders');
    const billing = projects.find((p) => p.path === 'services/billing');
    assert.equal(orders.best.path, 'services/orders/openapi.json');
    assert.equal(billing.best.path, 'services/billing/openapi.json');
    assert.equal(orders.endpointCount, 3, 'orders has three operations');
    assert.equal(billing.endpointCount, 2);
  });

  test('--project resolves by name and by path to the same project', () => {
    const projects = enumerateProjects(twoProjects(), { projects: undefined });
    const byName = selectProject(projects, { requested: 'orders' });
    const byPath = selectProject(projects, { requested: 'services/orders' });
    assert.equal(byName.project.path, 'services/orders');
    assert.equal(byPath.project.path, byName.project.path);
    assert.equal(byName.rule, RULE.REQUESTED);
  });

  test('--project naming something absent lists what does exist', () => {
    const projects = enumerateProjects(twoProjects(), { projects: undefined });
    const chosen = selectProject(projects, { requested: 'shipping' });
    assert.ok(chosen.problem);
    assert.match(chosen.problem, /services\/orders/);
    assert.match(chosen.problem, /services\/billing/);
  });

  test('one declared project settles it, even with two on disk', () => {
    const config = { projects: [{ name: 'orders', path: 'services/orders' }] };
    const projects = enumerateProjects(twoProjects(), config);
    const chosen = selectProject(projects, { config });
    assert.equal(chosen.project.name, 'orders');
    assert.equal(chosen.rule, RULE.CONFIG_SINGLE);
  });

  test('two declared projects are still ambiguous - declaring both is not choosing', () => {
    const config = { projects: [{ name: 'orders', path: 'services/orders' }, { name: 'billing', path: 'services/billing' }] };
    const chosen = selectProject(enumerateProjects(twoProjects(), config), { config });
    assert.ok(chosen.ambiguous);
    assert.match(chosen.reason, /declared/);
  });

  test('a declared project is trusted even when detection finds no surface in it', () => {
    // The user saying "the API is here" outranks our failing to see it.
    const config = { projects: [{ name: 'odd', path: 'src' }] };
    const chosen = selectProject(enumerateProjects(probe(join(fixtures, 'no-collection')), config), { config });
    assert.equal(chosen.project.name, 'odd');
  });

  test('a git worktree copy is not a second project', () => {
    // Measured on a real repository: `.claude/worktrees/` held four worktrees - whole copies of the
    // repository - so its two APIs were reported as EIGHT plausible projects and probe asked "which
    // of these eight?" about a repository that has two. An unanswerable question, and the copies are
    // not projects.
    const root = join(tmpBase, `worktrees-${++seq}`);
    const makeProject = (dir) => {
      mkdirSync(join(root, dir), { recursive: true });
      writeFileSync(join(root, dir, 'App.csproj'), '<Project Sdk="Microsoft.NET.Sdk" />\n');
      writeFileSync(join(root, dir, 'host.json'), '{"version":"2.0"}\n');
      writeFileSync(
        join(root, dir, 'Fn.cs'),
        '[Function("Get")]\npublic void Get([HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequestData r) {}\n',
      );
    };
    makeProject('FunctionApp');
    makeProject('.claude/worktrees/branch-a/FunctionApp');
    makeProject('.claude/worktrees/branch-b/FunctionApp');

    const projects = enumerateProjects(probe(root), { projects: undefined });
    const paths = projects.map((p) => p.path);
    assert.equal(
      paths.some((p) => p.includes('worktrees')),
      false,
      `a worktree copy was reported as a project: ${paths.join(', ')}`,
    );
    const chosen = selectProject(projects, {});
    assert.ok(chosen.project, `one project expected, got ${JSON.stringify(chosen.reason ?? chosen)}`);
    assert.equal(chosen.project.path, 'FunctionApp');
  });

  test('a build artefact does not make a directory look like an API', () => {
    // Found on a real repository, not invented: every .NET test project carries a
    // bin/**/functions.metadata, so counting artefacts as descriptions made tests/Foo.Tests a
    // second plausible API and turned an unambiguous repository into exit 5.
    const projects = enumerateProjects(
      {
        candidates: [
          { kind: 'source-root', path: '.', apiName: 'app', stacks: ['dotnet'], hasHttp: true, reasons: [] },
          { kind: 'source-root', path: 'tests/App.Tests', apiName: 'App.Tests', stacks: ['dotnet'], hasHttp: false, reasons: [] },
          { kind: 'built-artifact', path: 'tests/App.Tests/bin/Debug/net9.0/functions.metadata', score: 10, endpointCount: 0 },
        ],
      },
      { projects: undefined },
    );
    const tests = projects.find((p) => p.path === 'tests/App.Tests');
    assert.equal(tests.best, null, 'an artefact is a value source, not a description');
    assert.equal(tests.apiLikely, false);
    assert.equal(tests.artifacts.length, 1, 'it is still recorded, just not as a description');

    const chosen = selectProject(projects, {});
    assert.ok(chosen.project, `expected one plausible project, got ${JSON.stringify(chosen.reason ?? chosen)}`);
    assert.equal(chosen.project.path, '.');
  });

  test('source with no HTTP surface and no description is not a candidate', () => {
    const projects = enumerateProjects(probe(join(fixtures, 'src-graphql-only')), { projects: undefined });
    const chosen = selectProject(projects, {});
    assert.ok(chosen.none, `expected nothing plausible, got ${JSON.stringify(chosen.project ?? chosen)}`);
  });
});

// =============================================================================================
describe('ambiguity reaches the exit code', () => {
  test('probe exits 5 and prints the catalogue', () => {
    const r = run(['probe', '--root', join(fixtures, 'multi-project')]);
    assert.equal(r.code, 5, r.out);
    assert.match(r.out, /Which project\?/);
    assert.match(r.out, /services\/orders/);
    assert.match(r.out, /services\/billing/);
    assert.match(r.out, /--project/);
  });

  test('ingest exits 5 rather than ingesting one of them', () => {
    const root = copy('multi-project');
    const out = join(root, 'model.json');
    const r = run(['ingest', '--root', root, '--out', out]);
    assert.equal(r.code, 5, r.out);
    assert.equal(existsSync(out), false, 'nothing may be written while the choice is open');
  });

  test('ingest --project picks that project, and says which rule fired', () => {
    const root = copy('multi-project');
    const out = join(root, 'model.json');
    const r = run(['ingest', '--root', root, '--out', out, '--project', 'orders']);
    assert.equal(r.code, 0, r.out);
    const model = JSON.parse(readFileSync(out, 'utf8'));
    assert.equal(model.endpoints.length, 3);
    assert.ok(model.endpoints.every((e) => /order/i.test(e.endpointKey)), model.endpoints.map((e) => e.endpointKey).join(', '));
    assert.match(r.out, /project "orders"/);
  });

  test('projects[] in bruno-gen.json turns exit 5 into exit 0', () => {
    const root = copy('multi-project');
    writeConfig(root, { projects: [{ name: 'orders', path: 'services/orders' }] });
    const r = run(['probe', '--root', root]);
    assert.equal(r.code, 0, r.out);
    assert.match(r.out, /Project: orders/);
  });

  test('a broken config stops every command with its problems named', () => {
    const root = copy('multi-project');
    writeConfig(root, '{ oops');
    for (const cmd of [['probe'], ['ingest', '--out', join(root, 'm.json')]]) {
      const r = run([...cmd, '--root', root]);
      assert.equal(r.code, 1, `${cmd[0]}: ${r.out}`);
      assert.match(r.out, /not valid JSON/);
    }
  });
});

// =============================================================================================
describe('legacy migration reads and never writes', () => {
  const legacy = () => detectLegacy(join(fixtures, 'legacy-sidecars'));

  test('all three sidecar kinds are found', () => {
    const l = legacy();
    assert.equal(l.present, true);
    const kinds = l.found.map((f) => f.kind).sort();
    assert.deepEqual(kinds, ['baseUrl', 'examples', 'generator']);
  });

  test('BaseUrl.json wins over bruno-generator.json, and the stale host disappears', () => {
    const l = legacy();
    assert.equal(l.settings.environmentsFrom, 'bruno/BaseUrl.json');
    const names = l.settings.environments.map((e) => e.name).sort();
    assert.deepEqual(names, ['Acceptance', 'Local', 'Test']);
    const test = l.settings.environments.find((e) => e.name === 'Test');
    assert.equal(test.vars.baseUrl, 'https://test.example.com');
    const serialized = JSON.stringify(l.settings);
    assert.equal(/stale-test/.test(serialized), false, 'the superseded host must not survive migration');
  });

  test('collection_name and output_dir come across', () => {
    const l = legacy();
    assert.equal(l.settings.name, 'Widget Functions (legacy)');
    assert.equal(l.settings.outputDir, 'bruno/collection');
  });

  test('default_headers come across, because they apply to future endpoints too', () => {
    const l = legacy();
    const byName = new Map(l.settings.headers.map((h) => [h.name, h.value]));
    assert.equal(byName.get('x-correlation-id'), '{{$guid}}');
    assert.ok(l.notes.some((n) => /endpoints added from now on/.test(n)), 'the report should say why this matters');
  });

  test('an example file becomes the body, at the config tier', () => {
    const l = legacy();
    const model = {
      endpoints: [
        {
          endpointKey: 'POST /api/widgets',
          name: 'CreateWidget',
          pathTemplate: '/widgets',
          body: { kind: 'json', json: { widget_name: 'bolt', quantity: 1 }, source: 'declared', confidence: 'medium' },
        },
      ],
    };
    const { model: next, applied } = applyLegacyBodies(model, l.bodies);
    assert.equal(applied.length, 1);
    assert.equal(next.endpoints[0].body.json.quantity, 250, 'the hand-typed value must beat the property initialiser');
    assert.equal(next.endpoints[0].body.source, 'config');
    assert.match(next.endpoints[0].provenance.fields['/body'], /createwidget\.json/);
  });

  test('a body example is matched by function name or by route segment', () => {
    const bodies = new Map([['createwidget', { json: { a: 1 }, from: 'x' }]]);
    assert.ok(legacyBodyFor({ name: 'Create-Widget', pathTemplate: '/unrelated' }, bodies));
    assert.ok(legacyBodyFor({ name: 'Other', pathTemplate: '/createWidget' }, bodies));
    assert.equal(legacyBodyFor({ name: 'Nope', pathTemplate: '/nope' }, bodies), null);
    assert.equal(bodyKey('Create-Widget'), 'createwidget');
  });

  test('a GET keeps no body just because an example file exists', () => {
    const bodies = new Map([['widgets', { json: { a: 1 }, from: 'x' }]]);
    const model = { endpoints: [{ endpointKey: 'GET /widgets', name: 'widgets', pathTemplate: '/widgets', body: { kind: 'none' } }] };
    const { applied } = applyLegacyBodies(model, bodies);
    assert.deepEqual(applied, []);
  });

  test('bruno-gen.json wins field by field, without discarding the rest', () => {
    const merged = layerLegacy({ name: 'From config', outputDir: undefined, headers: undefined, environments: undefined }, legacy());
    assert.equal(merged.name, 'From config');
    assert.equal(merged.outputDir, 'bruno/collection', 'the field config is silent about still migrates');
    assert.equal(merged.environments.length, 3);
  });

  test('one malformed sidecar does not stop the others', () => {
    const root = copy('legacy-sidecars');
    writeFileSync(join(root, 'bruno', 'BaseUrl.json'), '{ broken');
    const l = detectLegacy(root);
    assert.ok(l.warnings.some((w) => /BaseUrl\.json/.test(w)), l.warnings.join(' | '));
    assert.equal(l.settings.name, 'Widget Functions (legacy)', 'the readable files still migrate');
    assert.equal(l.settings.environmentsFrom, 'bruno-generator.json', 'it falls back rather than losing environments');
  });

  test('reading the sidecars changes not one byte of them', () => {
    const root = copy('legacy-sidecars');
    const files = ['bruno-generator.json', 'bruno/BaseUrl.json', 'bruno/examples/createwidget.json'];
    const before = files.map((f) => readFileSync(join(root, f)));
    run(['probe', '--root', root]);
    detectLegacy(root);
    const after = files.map((f) => readFileSync(join(root, f)));
    for (const [i, f] of files.entries()) {
      assert.deepEqual(after[i], before[i], `${f} was modified`);
    }
  });

  test('probe names the legacy files it found', () => {
    const r = run(['probe', '--root', join(fixtures, 'legacy-sidecars')]);
    assert.match(r.out, /Legacy configuration found/);
    assert.match(r.out, /bruno-generator\.json/);
    assert.match(r.out, /never modified/);
  });
});

// =============================================================================================
describe('the existing collection root still wins over a migrated output_dir', () => {
  const emptyModel = () =>
    JSON.stringify({
        modelVersion: 1,
        collection: {
          name: 'ignored, config wins',
          format: 'bru',
          outputDir: 'bruno',
          routePrefix: '/api',
          baseUrlVar: 'baseUrl',
          environments: [{ name: 'Local', vars: { baseUrl: 'http://localhost:7071' } }],
        },
        folders: [],
        endpoints: [],
        sources: [],
      warnings: [],
      unresolved: [],
      capability: [],
    });

  test('a legacy collection is refused until adopt has run', () => {
    const root = copy('legacy-sidecars');
    const modelPath = join(root, 'model.json');
    writeFileSync(modelPath, emptyModel());
    const r = run(['plan', '--root', root, '--model', modelPath]);
    assert.equal(r.code, 1, r.out);
    assert.match(r.out, /Refusing to write/);
    assert.match(r.out, /adopt/, 'the refusal has to say what to do about it');
  });

  test('after adopt, plan targets bruno/collection and applies the migrated name', () => {
    const root = copy('legacy-sidecars');
    const modelPath = join(root, 'model.json');
    writeFileSync(modelPath, emptyModel());

    const adopted = run(['adopt', '--root', root]);
    assert.equal(adopted.code, 0, adopted.out);

    const r = run(['plan', '--root', root, '--model', modelPath]);
    assert.equal(r.code, 0, r.out);
    assert.match(r.out, /bruno\/collection/);
    assert.match(r.out, /existing collection root/);
    // The model says "ignored, config wins" and outputDir "bruno". Both must lose.
    assert.match(r.out, /Widget Functions \(legacy\)/, 'the migrated collection name should be applied');
    assert.equal(/^\s*collection\s+bruno\s*$/m.test(r.out), false, 'a second collection at bruno/ would be wrong');
  });

  test('adopt then plan on a legacy repository changes nothing that exists', () => {
    const root = copy('legacy-sidecars');
    const modelPath = join(root, 'model.json');
    writeFileSync(modelPath, emptyModel());
    run(['adopt', '--root', root]);
    const r = run(['plan', '--root', root, '--model', modelPath]);
    assert.equal(/\bupdated\b/.test(r.out), false, `nothing existing may be rewritten:\n${r.out}`);
  });

  test('a legacy-migrated environment keeps the secret names the model declared', async () => {
    // Found by a real run. layerSettings replaced collection.environments wholesale whenever legacy
    // produced any, and legacy envList() always builds secrets: []. So migrating a collection and
    // adding its first authenticated endpoint discarded the functionKey declaration: every request
    // referencing {{functionKey}} had no environment declaring it, and every call 401s. Same failure
    // class as an auth mode with no credential block, one layer out.
    const root = copy('legacy-sidecars');
    const modelPath = join(root, 'model.json');
    const model = JSON.parse(emptyModel());
    model.collection.auth = {
      mode: 'apikey',
      source: 'asked',
      apikey: { key: 'x-functions-key', value: '{{functionKey}}', placement: 'header' },
    };
    model.collection.environments = [
      { name: 'Local', vars: { baseUrl: 'http://localhost:7071' }, secrets: ['functionKey'] },
    ];
    writeFileSync(modelPath, JSON.stringify(model));

    run(['adopt', '--root', root]);
    const r = run(['apply', '--root', root, '--model', modelPath]);
    assert.equal(r.code, 0, r.out);

    // Legacy BaseUrl.json declares Local, Test and Acceptance. All three must declare the secret:
    // the request needs it wherever it runs, and an empty declared name costs nothing.
    for (const env of ['Local', 'Test', 'Acceptance']) {
      const file = join(root, 'bruno/collection/environments', `${env}.bru`);
      if (!existsSync(file)) continue; // Local is create-once and adopted; the others are new
      const text = readFileSync(file, 'utf8');
      assert.match(text, /functionKey/, `${env}.bru must declare the secret name`);
    }
    assert.match(r.out, /keeping 1 secret name/, 'the report should say the declaration survived');
  });

  test('a new endpoint does not reuse an adopted sibling\'s seq', () => {
    // Also from that run: "taken" counted only endpoints in the model, so the first new endpoint in a
    // migrated collection landed on seq 1 beside the adopted get-widget.bru, also seq 1 - which
    // doctor then reports as an ambiguous sidebar order.
    const root = copy('legacy-sidecars');
    const modelPath = join(root, 'model.json');
    const model = JSON.parse(emptyModel());
    // Same directory as the adopted get-widget.bru, which is the whole point.
    model.folders = [{ id: 'widgets', name: 'widgets', auth: 'inherit', seq: 1, source: 'source:namespace' }];
    model.endpoints = [
      {
        endpointKey: 'POST /api/widgets',
        name: 'CreateWidget',
        folderId: 'widgets',
        method: 'POST',
        pathTemplate: '/widgets',
        tags: [],
        summary: 'New endpoint beside an adopted one.',
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
        provenance: { $skeleton: 'test', sourceRefs: [], fields: {} },
        confidence: 'high',
        flags: [],
      },
    ];
    writeFileSync(modelPath, JSON.stringify(model));

    run(['adopt', '--root', root]);
    const r = run(['apply', '--root', root, '--model', modelPath]);
    assert.equal(r.code, 0, r.out);

    const dir = join(root, 'bruno/collection/widgets');
    const seqs = readdirSync(dir)
      .filter((f) => f.endsWith('.bru') && f !== 'folder.bru')
      .map((f) => {
        const m = /^\s*seq:\s*(\d+)/m.exec(readFileSync(join(dir, f), 'utf8'));
        return { file: f, seq: m ? Number(m[1]) : null };
      });
    assert.ok(seqs.length >= 2, `expected the adopted file and the new one, saw ${JSON.stringify(seqs)}`);
    const numbers = seqs.map((s) => s.seq);
    assert.equal(new Set(numbers).size, numbers.length, `duplicate seq: ${JSON.stringify(seqs)}`);
  });

  test('an adopted file the model does not describe is yours, not an orphan', () => {
    // "orphan" reads as "the generator made this and it is now obsolete", and it invites --prune.
    // On the real migration repository that label landed on every request file and on the
    // environments holding the actual base URLs, none of which this tool ever wrote.
    const root = copy('legacy-sidecars');
    const modelPath = join(root, 'model.json');
    writeFileSync(modelPath, emptyModel());
    run(['adopt', '--root', root]);
    const r = run(['plan', '--root', root, '--model', modelPath]);
    assert.equal(r.code, 0, r.out);
    assert.match(r.out, /yours/);
    assert.equal(/orphan/.test(r.out), false, `an adopted file was never in a model:\n${r.out}`);
    assert.equal(/--prune/.test(r.out), false, 'nothing here should be offered up for deletion');
  });
});

// =============================================================================================
describe('a path must never depend on the filesystem being case-insensitive', () => {
  // This failed on ubuntu only, and passed on Windows and macOS, which is the worst way for it to
  // fail: `safeSegment` folded the environment `Local` to `local.bru`. On a case-insensitive
  // filesystem that IS the user's existing `Local.bru`, so it worked by accident; on Linux it is a
  // second file, and the real one never received the secret name it needed.
  //
  // Two invariants, checked here rather than trusted: an environment keeps its case, and no two
  // planned paths differ only by case - such a collection is duplicated on Linux and impossible on
  // Windows.
  const baseModel = () => ({
    modelVersion: 1,
    collection: {
      name: 'Case',
      format: 'bru',
      outputDir: 'bruno',
      routePrefix: '/api',
      baseUrlVar: 'baseUrl',
      environments: [
        { name: 'Local', vars: { baseUrl: 'http://localhost:7071' }, secrets: ['functionKey'] },
        { name: 'PDI-ACC', vars: { baseUrl: 'https://acc.example.com' }, secrets: [] },
      ],
    },
    folders: [],
    endpoints: [],
    sources: [],
    warnings: [],
    unresolved: [],
    capability: [],
  });

  test('an environment file keeps the case of its name', async () => {
    const { planFiles } = await import(`../${S}emit.mjs`);
    const { files } = planFiles(baseModel(), {});
    const envs = files.filter((f) => f.kind === 'environment').map((f) => f.relPath);
    assert.ok(envs.includes('environments/Local.bru'), `got ${envs.join(', ')}`);
    assert.ok(envs.includes('environments/PDI-ACC.bru'), `got ${envs.join(', ')}`);
  });

  test('no two planned paths differ only by case', async () => {
    const { planFiles } = await import(`../${S}emit.mjs`);
    const model = baseModel();
    // Names that fold together, which is how the class shows up in practice.
    model.collection.environments = [
      { name: 'Local', vars: { baseUrl: 'http://a.example.com' }, secrets: [] },
      { name: 'Test', vars: { baseUrl: 'http://b.example.com' }, secrets: [] },
    ];
    const { files } = planFiles(model, {});
    const folded = files.map((f) => f.relPath.toLowerCase());
    assert.equal(
      new Set(folded).size,
      folded.length,
      `two files differ only by case: ${files.map((f) => f.relPath).join(', ')}`,
    );
  });

  test('case is still folded for collision comparison, and reserved names still catch', async () => {
    const { safeSegment, collisionKey } = await import(`../${S}paths.mjs`);
    assert.equal(safeSegment('Local', { preserveCase: true }), 'Local');
    assert.equal(safeSegment('Local'), 'local', 'the default still folds - request files stay kebab-case');
    assert.equal(collisionKey('Local'), collisionKey('local'), 'comparison must ignore case');
    // A reserved device name is reserved in any case.
    assert.equal(safeSegment('CON', { preserveCase: true }), 'CON-request');
    assert.equal(safeSegment('Aux', { preserveCase: true }), 'Aux-request');
  });
});

// =============================================================================================
describe('smoke: consent, redaction and the command it builds', () => {
  test('the reporter always gets a path, and never headers or bodies', () => {
    const args = bruArgs({ env: 'local', reporterPath: '/tmp/run.json' });
    const i = args.indexOf('--reporter-json');
    assert.ok(i >= 0, 'the CLI errors without a reporter path');
    assert.equal(args[i + 1], '/tmp/run.json');
    assert.deepEqual(args.slice(args.indexOf('--sandbox'), args.indexOf('--sandbox') + 2), ['--sandbox', 'safe']);
    assert.ok(args.includes('--reporter-skip-all-headers'), 'credentials live in headers');
    assert.ok(args.includes('--reporter-skip-body'), 'a real response body is production data');
  });

  test('destructive requests are excluded unless asked for', () => {
    const args = bruArgs({ env: 'local', reporterPath: 'r.json' });
    const at = args.indexOf('--exclude-tags');
    assert.equal(args[at + 1], 'destructive');
  });

  test('query values are redacted, the path is not', () => {
    assert.equal(redactUrl('https://api.example.com/v1/widgets'), 'https://api.example.com/v1/widgets');
    const out = redactUrl('https://api.example.com/v1/widgets?code=AAAAAAAAAAAAAAAA&country=NL');
    assert.match(out, /^https:\/\/api\.example\.com\/v1\/widgets\?/);
    assert.equal(/AAAAAAAA/.test(out), false, 'a key in the query string must not be printed');
    assert.match(out, /code=…/);
    assert.match(out, /country=…/);
  });

  test('without --env it refuses and lists what the collection declares', () => {
    const r = run(['smoke', '--root', join(fixtures, 'collection-bru')]);
    assert.equal(r.code, 1, r.out);
    assert.match(r.out, /needs --env/);
    assert.ok(environmentsIn(join(fixtures, 'collection-bru')).length > 0, 'the fixture should declare one');
  });

  test('an unknown environment is named against the ones that exist', () => {
    const r = run(['smoke', '--root', join(fixtures, 'collection-bru'), '--env', 'nowhere']);
    assert.equal(r.code, 1, r.out);
    assert.match(r.out, /No environment named "nowhere"/);
  });

  test('with no collection there is nothing to run', () => {
    const r = run(['smoke', '--root', join(fixtures, 'no-collection'), '--env', 'local']);
    assert.equal(r.code, 2, r.out);
  });

  test('a transport error is not a pass; a 4xx that came back is', () => {
    const rows = normaliseResults({
      results: [
        { request: { method: 'get', url: 'https://api.example.com/a' }, response: { status: 401 }, assertionResults: [] },
        { request: { method: 'get', url: 'https://api.example.com/b' }, error: 'ECONNREFUSED', response: {} },
        {
          request: { method: 'post', url: 'https://api.example.com/c' },
          response: { status: 200 },
          assertionResults: [{ status: 'fail' }, { status: 'pass' }],
        },
      ],
    });
    assert.equal(rows.length, 3);
    assert.equal(rows[0].outcome, 'reached', 'a 401 proves the request was built, resolved and sent');
    assert.equal(rows[0].passed, true);
    assert.equal(rows[1].outcome, 'failed', 'nothing was sent');
    assert.equal(rows[2].outcome, 'failed', 'an assertion failed');
    assert.equal(rows[2].failedAssertions, 1);
  });

  test('a 5xx is a failure, a 4xx is not', () => {
    // Setting the bar at "was it sent" alone made a run where every response was a 500 report
    // "none failed", which nobody would call a working collection. A 4xx is different: it means the
    // gateway answered, and with no key supplied that is the expected result.
    const rows = normaliseResults({
      results: [
        { request: { method: 'get', url: 'https://api.example.com/a' }, response: { status: 500 } },
        { request: { method: 'get', url: 'https://api.example.com/b' }, response: { status: 503 } },
        { request: { method: 'get', url: 'https://api.example.com/c' }, response: { status: 404 } },
        { request: { method: 'get', url: 'https://api.example.com/d' }, response: { status: 204 } },
      ],
    });
    assert.deepEqual(rows.map((r) => r.outcome), ['failed', 'failed', 'reached', 'ok']);
  });

  test('an unreadable reporter shape yields no rows rather than inventing them', () => {
    assert.deepEqual(normaliseResults(null), []);
    assert.deepEqual(normaliseResults({}), []);
  });
});

// =============================================================================================
describe('check-history: the publication precondition', () => {
  test('this repository is clean, and its planted fixtures are all marked expected', () => {
    const r = spawnSync(process.execPath, [join(repoRoot, 'scripts/check-history.mjs'), '--json'], {
      encoding: 'utf8',
      cwd: repoRoot,
      maxBuffer: 64 * 1024 * 1024,
    });
    if (r.status === 2) {
      // A shallow or absent checkout is not a failure of the check.
      assert.match(`${r.stdout}${r.stderr}`, /not a git repository|cannot/i);
      return;
    }
    const parsed = JSON.parse(r.stdout);
    assert.equal(parsed.ok, true, `findings: ${JSON.stringify(parsed.findings, null, 2)}`);
    assert.equal(r.status, 0);
    // An expected finding may only ever come from a path that deliberately plants one. Kept in step
    // with PLANTED_PATHS in check-history.mjs and check-fixture-hygiene.mjs.
    for (const e of parsed.expected) {
      assert.match(
        e.where,
        /tests\/(fixtures\/planted-secrets|make-fixtures\.mjs|phase1\.test\.mjs|regressions\.test\.mjs)/,
      );
    }
  });

  test('the example wordlist ships, and the real one is ignored', () => {
    assert.ok(existsSync(join(repoRoot, 'scripts/history-wordlist.example.txt')));
    const ignore = readFileSync(join(repoRoot, '.gitignore'), 'utf8');
    assert.match(ignore, /history-wordlist\.txt/, 'a real wordlist must never be committable');
  });
});
