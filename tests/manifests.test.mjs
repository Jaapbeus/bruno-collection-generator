// Proves the manifest checker catches the failures it exists for.
//
// The original bug shipped on main and `claude plugin validate --strict` passed it, so the
// checker's value is entirely in these negative cases.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const checker = join(repoRoot, 'scripts/validate-manifests.mjs');
const tmpBase = join(repoRoot, 'tests/.tmp/manifests');

const run = (root) => {
  const r = spawnSync(process.execPath, [checker, '--root', root], { encoding: 'utf8' });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
};

/** Build a minimal marketplace repo on disk. */
function scaffold(name, { marketplace, pluginDir = 'plugins/demo-plugin', pluginJson, skill = true }) {
  const root = join(tmpBase, name);
  rmSync(root, { recursive: true, force: true });
  mkdirSync(join(root, '.claude-plugin'), { recursive: true });
  writeFileSync(join(root, '.claude-plugin/marketplace.json'), JSON.stringify(marketplace, null, 2));

  if (pluginJson !== null) {
    mkdirSync(join(root, pluginDir, '.claude-plugin'), { recursive: true });
    writeFileSync(
      join(root, pluginDir, '.claude-plugin/plugin.json'),
      JSON.stringify(
        pluginJson ?? {
          name: 'demo-plugin',
          version: '1.0.0',
          description: 'A demo plugin.',
          license: 'MIT',
        },
        null,
        2,
      ),
    );
  }

  if (skill) {
    const skillDir = join(root, pluginDir, 'skills/demo-skill');
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(
      join(skillDir, 'SKILL.md'),
      '---\nname: demo-skill\ndescription: Does a demo thing when the user asks for a demo.\n---\n\n# Demo\n',
    );
  }
  return root;
}

const baseMarketplace = (overrides = {}) => ({
  name: 'demo-marketplace',
  owner: { name: 'Demo Owner' },
  plugins: [{ name: 'demo-plugin', source: './plugins/demo-plugin' }],
  ...overrides,
});

describe('validate-manifests', () => {
  test('accepts a correct marketplace', () => {
    const root = scaffold('good', { marketplace: baseMarketplace() });
    const { code, out } = run(root);
    assert.equal(code, 0, out);
  });

  test('accepts pluginRoot with an explicitly relative source', () => {
    const root = scaffold('good-pluginroot', {
      marketplace: baseMarketplace({
        metadata: { pluginRoot: './plugins' },
        plugins: [{ name: 'demo-plugin', source: './demo-plugin' }],
      }),
    });
    const { code, out } = run(root);
    assert.equal(code, 0, out);
  });

  test('REJECTS a bare source name, which is not a recognised source type', () => {
    // This test used to assert the opposite, and that belief is what shipped: `source:
    // "bruno-gen-collection"` resolved to a real directory, so every resolution rule passed it, and
    // then `claude plugin install` refused with "this plugin uses a source type your Claude Code
    // version does not support" - a message that sends you looking for a version problem instead.
    const root = scaffold('bare-source', {
      marketplace: baseMarketplace({
        metadata: { pluginRoot: './plugins' },
        plugins: [{ name: 'demo-plugin', source: 'demo-plugin' }],
      }),
    });
    const { code, out } = run(root);
    assert.equal(code, 1, out);
    assert.match(out, /must start with "\.\/"/);
  });

  test('REJECTS pluginRoot combined with a source that repeats it', () => {
    // This is the exact shape that shipped: pluginRoot "./plugins" plus source
    // "./plugins/x" resolves to plugins/plugins/x. Schema validation passes it.
    const root = scaffold('double-prefix', {
      marketplace: baseMarketplace({
        metadata: { pluginRoot: './plugins' },
        plugins: [{ name: 'demo-plugin', source: './plugins/demo-plugin' }],
      }),
    });
    const { code, out } = run(root);
    assert.equal(code, 1, out);
    assert.match(out, /already begins with metadata\.pluginRoot/);
    assert.match(out, /plugins\/plugins\/demo-plugin/);
  });

  test('REJECTS a source directory that does not exist', () => {
    const root = scaffold('missing-source', {
      marketplace: baseMarketplace({
        plugins: [{ name: 'demo-plugin', source: './plugins/not-here' }],
      }),
    });
    const { code, out } = run(root);
    assert.equal(code, 1, out);
    assert.match(out, /does not exist/);
  });

  test('REJECTS a stray plugin manifest at the repository root', () => {
    const root = scaffold('stray-root-manifest', { marketplace: baseMarketplace() });
    writeFileSync(
      join(root, '.claude-plugin/plugin.json'),
      JSON.stringify({ name: 'demo-plugin', version: '1.0.0' }, null, 2),
    );
    const { code, out } = run(root);
    assert.equal(code, 1, out);
    assert.match(out, /declares the root itself as a plugin/);
  });

  test('REJECTS a name/plugin.json mismatch', () => {
    const root = scaffold('name-mismatch', {
      marketplace: baseMarketplace(),
      pluginJson: { name: 'something-else', version: '1.0.0', description: 'x', license: 'MIT' },
    });
    const { code, out } = run(root);
    assert.equal(code, 1, out);
    assert.match(out, /does not match plugin\.json name/);
  });

  test('REJECTS a missing version, since it is the only update signal', () => {
    const root = scaffold('no-version', {
      marketplace: baseMarketplace(),
      pluginJson: { name: 'demo-plugin', description: 'x', license: 'MIT' },
    });
    const { code, out } = run(root);
    assert.equal(code, 1, out);
    assert.match(out, /version is required/);
  });

  test('REJECTS a runtime version that differs from the plugin update signal', () => {
    const root = scaffold('runtime-version-mismatch', { marketplace: baseMarketplace() });
    const lib = join(root, 'plugins/demo-plugin/skills/demo-skill/scripts/lib');
    mkdirSync(lib, { recursive: true });
    writeFileSync(join(lib, 'version.mjs'), "export const PLUGIN_VERSION = '2.0.0';\n");
    const { code, out } = run(root);
    assert.equal(code, 1, out);
    assert.match(out, /runtime version "2\.0\.0" does not match plugin\.json version "1\.0\.0"/);
  });

  test('REJECTS a name containing "claude"', () => {
    const root = scaffold('bad-name', {
      marketplace: baseMarketplace({
        plugins: [{ name: 'claude-demo', source: './plugins/demo-plugin' }],
      }),
    });
    const { code, out } = run(root);
    assert.equal(code, 1, out);
    assert.match(out, /must not contain "claude"/);
  });

  test('REJECTS a skill directory with no SKILL.md', () => {
    const root = scaffold('no-skill-md', { marketplace: baseMarketplace(), skill: false });
    mkdirSync(join(root, 'plugins/demo-plugin/skills/empty-skill'), { recursive: true });
    const { code, out } = run(root);
    assert.equal(code, 1, out);
    assert.match(out, /has no SKILL\.md/);
  });

  test('REJECTS an over-long description', () => {
    const root = scaffold('long-description', { marketplace: baseMarketplace(), skill: false });
    const skillDir = join(root, 'plugins/demo-plugin/skills/demo-skill');
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(
      join(skillDir, 'SKILL.md'),
      `---\nname: demo-skill\ndescription: ${'x'.repeat(1100)}\n---\n\n# Demo\n`,
    );
    const { code, out } = run(root);
    assert.equal(code, 1, out);
    assert.match(out, /max 1024/);
  });

  test('validates this repository', () => {
    const { code, out } = run(repoRoot);
    assert.equal(code, 0, out);
  });
});
