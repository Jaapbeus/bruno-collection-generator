// Phase 4: source inference.
//
// The gate has two halves and only one of them can be a script:
//
//   emission   - given a pinned model, the writer must always produce the same collection.
//                Deterministic, runs here, on every PR.
//   extraction - whether a real Claude invocation produces that model from that source.
//                Needs a model, network and money; it is the release gate in evals/evals.json.
//
// These tests are the emission half, plus the deterministic signals probe can establish on its own.

import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, rmSync, existsSync, cpSync, readdirSync } from 'node:fs';
import { removeDir, runScopedBase, pruneStale } from './tmpdir.mjs';
import { join, dirname, basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CLI = join(repoRoot, 'plugins/bruno-gen-collection/skills/bruno-collection-generator/scripts/brunogen.mjs');
const fixtures = join(repoRoot, 'tests/fixtures');
const models = join(repoRoot, 'tests/models');
const cards = join(
  repoRoot,
  'plugins/bruno-gen-collection/skills/bruno-collection-generator/reference/sources',
);
const tmpBase = runScopedBase(join(repoRoot, 'tests/.tmp/phase4'));

const S = 'plugins/bruno-gen-collection/skills/bruno-collection-generator/scripts/lib/';
const { surfaceSignals } = await import(`../${S}signals.mjs`);
const { probe } = await import(`../${S}probe.mjs`);
const { validateModel } = await import(`../${S}model-validate.mjs`);

const run = (args, cwd = repoRoot) => {
  const r = spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8', cwd });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
};

before(() => {
  removeDir(tmpBase);
  pruneStale(tmpBase);
});

describe('signals: what the script can honestly determine alone', () => {
  test('an Azure Functions app with HTTP triggers is recognised', () => {
    const s = surfaceSignals(join(fixtures, 'src-dotnet-functions'));
    assert.equal(s.functionsApp, true, 'host.json should mark it a Functions app');
    assert.ok(s.stacks.includes('azure-functions-isolated'), `stacks: ${s.stacks.join(', ')}`);
    assert.equal(s.hasHttp, true);
  });

  test('a timer trigger is reported as unsupported, never as a surface', () => {
    const s = surfaceSignals(join(fixtures, 'src-dotnet-functions'));
    const timer = s.capability.find((c) => c.subject === 'timer-trigger');
    assert.ok(timer, 'the timer trigger must be reported');
    assert.equal(timer.supported, false);
    assert.ok(timer.paths.length > 0, 'a capability entry should say where it was found');
  });

  test('a Functions app with only non-HTTP triggers has a surface, but no supported one', () => {
    const s = surfaceSignals(join(fixtures, 'src-functions-timer-only'));
    assert.equal(s.hasHttp, false);
    assert.equal(s.surfaceButUnsupported, true, 'this is exit 3 territory, not exit 2');
    const subjects = s.capability.map((c) => c.subject).sort();
    assert.deepEqual(subjects, ['service-bus-trigger', 'timer-trigger']);
  });

  test('express is recognised from source, not just from package.json', () => {
    const s = surfaceSignals(join(fixtures, 'src-node-express'));
    assert.ok(s.stacks.includes('express'), `stacks: ${s.stacks.join(', ')}`);
    assert.equal(s.hasHttp, true);
  });

  test('a GraphQL-only service is reported and is not an HTTP surface', () => {
    const s = surfaceSignals(join(fixtures, 'src-graphql-only'));
    assert.equal(s.hasHttp, false);
    assert.ok(s.capability.some((c) => c.subject === 'graphql'));
    assert.equal(s.surfaceButUnsupported, true);
  });

  test('scanning is bounded and never throws on an odd tree', () => {
    const empty = join(tmpBase, 'empty');
    mkdirSync(empty, { recursive: true });
    const s = surfaceSignals(empty);
    assert.equal(s.hasHttp, false);
    assert.equal(s.capability.length, 0);
    assert.equal(s.surfaceButUnsupported, false, 'nothing found is exit 2, not exit 3');
  });
});

describe('probe: exit codes distinguish "nothing" from "nothing supported"', () => {
  test('a Functions app with HTTP endpoints exits 0 and names the stack', () => {
    const { code, out } = run(['probe', '--root', join(fixtures, 'src-dotnet-functions')]);
    assert.equal(code, 0, out);
    assert.match(out, /azure-functions-isolated/);
    assert.match(out, /timer-trigger/);
  });

  test('a timer-only Functions app exits 3, not 2', () => {
    const { code, out } = run(['probe', '--root', join(fixtures, 'src-functions-timer-only')]);
    assert.equal(code, 3, out);
    assert.match(out, /Nothing supported here/);
  });

  test('a GraphQL-only service exits 3 and says why', () => {
    const { code, out } = run(['probe', '--root', join(fixtures, 'src-graphql-only')]);
    assert.equal(code, 3, out);
    assert.match(out, /GraphQL is not generated/);
  });

  test('a repository with no project at all exits 2', () => {
    const { code } = run(['probe', '--root', join(fixtures, 'no-collection')]);
    assert.equal(code, 2);
  });

  test('a source root with an HTTP surface outscores one without', () => {
    const withHttp = probe(join(fixtures, 'src-dotnet-functions')).candidates.find((c) => c.kind === 'source-root');
    const without = probe(join(fixtures, 'src-functions-timer-only')).candidates.find((c) => c.kind === 'source-root');
    assert.ok(withHttp.score > without.score, `${withHttp.score} should beat ${without.score}`);
  });
});

describe('emission: the pinned model produces a correct collection', () => {
  const workspace = (name) => {
    const dir = join(tmpBase, name);
    removeDir(dir);
    mkdirSync(dir, { recursive: true });
    // This fixture is a real .csproj, so an editor's C# tooling can be rebuilding it in the
    // background - regenerating bin/obj mid-copy is what made this intermittently throw on a
    // locked or half-written file. Neither belongs in the copy in any case.
    cpSync(join(fixtures, 'src-dotnet-functions'), dir, {
      recursive: true,
      filter: (src) => !['bin', 'obj'].includes(basename(src)),
    });
    return dir;
  };

  const modelPath = join(models, 'src-dotnet-functions.model.json');

  test('the pinned model satisfies the IR schema', () => {
    const model = JSON.parse(readFileSync(modelPath, 'utf8'));
    const v = validateModel(model);
    assert.equal(v.ok, true, (v.problems ?? []).join('\n'));
  });

  test('apply writes the collection and a rerun changes nothing', () => {
    const dir = workspace('emit');
    const first = run(['apply', '--root', dir, '--model', modelPath]);
    assert.equal(first.code, 0, first.out);
    const second = run(['apply', '--root', dir, '--model', modelPath]);
    assert.match(second.out, /Nothing changed on disk/, second.out);
  });

  test('the host route prefix appears exactly once', () => {
    const dir = workspace('prefix');
    run(['apply', '--root', dir, '--model', modelPath]);
    const bru = readFileSync(join(dir, 'bruno/widgets/get-api-widgets-by-id.bru'), 'utf8');
    assert.match(bru, /url: \{\{baseUrl\}\}\/api\/widgets\/:id/);
    assert.ok(!bru.includes('/api/api/'), 'the prefix was applied twice');
  });

  test('the timer trigger produces no request file', () => {
    const dir = workspace('no-timer');
    run(['apply', '--root', dir, '--model', modelPath]);
    const files = [];
    const walk = (d) => {
      for (const e of readdirSync(d, { withFileTypes: true })) {
        const p = join(d, e.name);
        if (e.isDirectory()) walk(p);
        else files.push(p);
      }
    };
    walk(join(dir, 'bruno'));
    const names = files.map((f) => f.toLowerCase()).join('\n');
    assert.ok(!names.includes('nightly'), 'a timer trigger became a request');
    assert.ok(!names.includes('sync'), 'a timer trigger became a request');
    // Exactly the two HTTP endpoints, plus root/folder/env/lock files.
    const requests = files.filter((f) => /widgets[\\/][^\\/]+\.bru$/.test(f) && !f.endsWith('folder.bru'));
    assert.equal(requests.length, 2, `expected 2 request files, got ${requests.map((f) => f.split(/[\\/]/).pop())}`);
  });

  test('the body honours [JsonPropertyName] and the property initialiser', () => {
    const dir = workspace('body');
    run(['apply', '--root', dir, '--model', modelPath]);
    const bru = readFileSync(join(dir, 'bruno/widgets/post-api-widgets.bru'), 'utf8');
    assert.match(bru, /"widget_name": "bolt"/, 'the JSON key should come from [JsonPropertyName]');
    assert.match(bru, /"quantity": 12/, 'a C# property initialiser is a real default');
  });

  test('the function key is a variable, declared secret by name only', () => {
    const dir = workspace('secret');
    run(['apply', '--root', dir, '--model', modelPath]);
    const root = readFileSync(join(dir, 'bruno/collection.bru'), 'utf8');
    assert.match(root, /\{\{functionKey\}\}/, 'the key must be a variable reference');
    const env = readFileSync(join(dir, 'bruno/environments/local.bru'), 'utf8');
    assert.match(env, /vars:secret \[\s*functionKey\s*\]/);
    assert.ok(!/functionKey:\s*\S/.test(env), 'a secret must never carry a value');
  });

  test('an optional query parameter is disabled and out of the URL', () => {
    const dir = workspace('optional');
    run(['apply', '--root', dir, '--model', modelPath]);
    const bru = readFileSync(join(dir, 'bruno/widgets/get-api-widgets-by-id.bru'), 'utf8');
    assert.match(bru, /^ {2}~country: NL$/m, 'an optional param must ship disabled');
    assert.ok(!/url:.*country=/.test(bru), 'a disabled param must not be in the URL');
  });

  test('a safe endpoint gets an assert; nothing invented does', () => {
    const dir = workspace('asserts');
    run(['apply', '--root', dir, '--model', modelPath]);
    const post = readFileSync(join(dir, 'bruno/widgets/post-api-widgets.bru'), 'utf8');
    assert.match(post, /assert \{/, 'a declared body should carry an assert');
  });
});

describe('source cards', () => {
  const expected = ['openapi.md', 'dotnet.md', 'node.md', '_unsupported.md'];

  test('every card the skill references exists', () => {
    for (const f of expected) {
      assert.ok(existsSync(join(cards, f)), `missing reference/sources/${f}`);
    }
  });

  test('every card that claims a stack has a fixture behind it', () => {
    // A card with no fixture is a promise nothing verifies. dotnet and node claim extraction, so
    // each needs a fixture; openapi delegates to ingest and _unsupported claims nothing.
    const fixtureFor = {
      'dotnet.md': ['src-dotnet-functions', 'src-functions-timer-only'],
      'node.md': ['src-node-express'],
    };
    for (const [card, dirs] of Object.entries(fixtureFor)) {
      assert.ok(existsSync(join(cards, card)), `missing card ${card}`);
      for (const d of dirs) {
        assert.ok(existsSync(join(fixtures, d)), `card ${card} claims a stack with no fixture ${d}`);
      }
    }
  });

  test('the unsupported card names what the capability reports name', () => {
    const text = readFileSync(join(cards, '_unsupported.md'), 'utf8');
    for (const subject of ['GraphQL', 'gRPC', 'WebSocket', 'in-process']) {
      assert.ok(text.includes(subject), `_unsupported.md should mention ${subject}`);
    }
  });

  test('no card tells the model to hand-write collection files', () => {
    for (const f of expected) {
      const text = readFileSync(join(cards, f), 'utf8');
      assert.ok(
        !/\bhand-write\b(?![^.]*never)/i.test(text) || /never hand-write/i.test(text),
        `${f} must not encourage hand-writing .bru files`,
      );
    }
  });
});
