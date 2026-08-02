#!/usr/bin/env node
// Structural validation of the plugin and marketplace manifests, offline.
//
// This and `claude plugin validate` catch different things, and this repository has now shipped one
// bug of each kind:
//
//   Schema-valid, resolves nowhere.  `source: "./plugins/bruno-gen-collection"` alongside
//   `metadata.pluginRoot: "./plugins"` resolves to `plugins/plugins/...`. The real validator passes
//   it, because it never resolves the path. Only the checks below catch it.
//
//   Schema-invalid.  `source: "bruno-gen-collection"` - a bare name with no `./` - resolved to a
//   real directory, so the checks below passed it, and `claude plugin install` refused with "this
//   plugin uses a source type your Claude Code version does not support". `claude plugin validate`
//   reports `plugins.0.source: Invalid input` and exits 1.
//
// So both run: the resolution rules here, plus the real validator when the binary is available. A
// string source must be an explicitly relative path, which is the form the official marketplace uses.
// An install on a clean machine is still the only complete gate.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// --root lets the checker run against a fixture, so the checks can themselves be tested.
const rootFlagIndex = process.argv.indexOf('--root');
const repoRoot =
  rootFlagIndex !== -1 && process.argv[rootFlagIndex + 1]
    ? resolve(process.argv[rootFlagIndex + 1])
    : resolve(dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];
const notes = [];
const fail = (m) => problems.push(m);

const readJson = (path, label) => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    fail(`${label}: ${err.message}`);
    return null;
  }
};

// Open-standard naming rules: lowercase letters, digits and hyphens; max 64; and the name must
// not claim to be Claude or Anthropic.
const NAME_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
const checkName = (value, label) => {
  if (!value) return fail(`${label}: name is missing`);
  if (!NAME_RE.test(value)) fail(`${label}: "${value}" must be lowercase letters, digits and hyphens (max 64)`);
  if (/claude|anthropic/i.test(value)) fail(`${label}: "${value}" must not contain "claude" or "anthropic"`);
};

const SEMVER_RE = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

// ---- marketplace ---------------------------------------------------------------------------
const marketplacePath = join(repoRoot, '.claude-plugin/marketplace.json');
if (!existsSync(marketplacePath)) fail('no .claude-plugin/marketplace.json at the repository root');

const marketplace = existsSync(marketplacePath) ? readJson(marketplacePath, 'marketplace.json') : null;

if (marketplace) {
  checkName(marketplace.name, 'marketplace.json');
  if (!marketplace.owner?.name) fail('marketplace.json: owner.name is required');
  if (!Array.isArray(marketplace.plugins) || marketplace.plugins.length === 0) {
    fail('marketplace.json: plugins[] must list at least one plugin');
  }

  const pluginRoot = marketplace.metadata?.pluginRoot ?? null;
  if (pluginRoot) notes.push(`metadata.pluginRoot = ${pluginRoot} (prepended to every relative source)`);

  for (const [i, entry] of (marketplace.plugins ?? []).entries()) {
    const label = `marketplace.json plugins[${i}]`;
    checkName(entry.name, label);
    if (!entry.source) {
      fail(`${label}: source is required`);
      continue;
    }
    if (typeof entry.source !== 'string') {
      notes.push(`${label}: non-string source (git/npm object) not resolved by this check`);
      continue;
    }

    // A string source must be an explicitly relative path. A bare name is schema-invalid: it
    // resolves to a real directory, so every check below passes, and then `claude plugin install`
    // refuses with "this plugin uses a source type your Claude Code version does not support" -
    // which reads like a version problem and is not one. The official marketplace uses "./path".
    if (!/^\.\.?\//.test(entry.source)) {
      fail(
        `${label}: source "${entry.source}" must start with "./" - a bare name is not a recognised ` +
          'source type, and the install fails with a message about your Claude Code version',
      );
      continue;
    }

    // The bug this check exists for: pluginRoot is PREPENDED to a relative source, so a source
    // that already contains the plugin root resolves to <root>/<root>/<name>.
    const resolved = pluginRoot
      ? join(repoRoot, pluginRoot, entry.source)
      : join(repoRoot, entry.source);

    if (pluginRoot) {
      const normalisedRoot = pluginRoot.replace(/^\.\//, '').replace(/\/$/, '');
      const normalisedSource = entry.source.replace(/^\.\//, '');
      if (normalisedSource.startsWith(`${normalisedRoot}/`)) {
        fail(
          `${label}: source "${entry.source}" already begins with metadata.pluginRoot "${pluginRoot}", ` +
            `so it resolves to "${join(pluginRoot, entry.source).split('\\').join('/')}". ` +
            `Use "${normalisedSource.slice(normalisedRoot.length + 1)}" or drop metadata.pluginRoot.`,
        );
        continue;
      }
    }

    if (!existsSync(resolved)) {
      fail(`${label}: source resolves to a directory that does not exist: ${resolved.replace(repoRoot, '.')}`);
      continue;
    }

    const strict = entry.strict !== false;
    let pluginVersion = null;
    const pluginManifest = join(resolved, '.claude-plugin/plugin.json');
    if (strict && !existsSync(pluginManifest)) {
      fail(`${label}: strict mode requires ${pluginManifest.replace(repoRoot, '.')}`);
      continue;
    }

    if (existsSync(pluginManifest)) {
      const plugin = readJson(pluginManifest, `${label} plugin.json`);
      if (plugin) {
        checkName(plugin.name, `${label} plugin.json`);
        if (plugin.name !== entry.name) {
          fail(
            `${label}: marketplace entry name "${entry.name}" does not match plugin.json name "${plugin.name}"`,
          );
        }
        if (!plugin.version) fail(`${label} plugin.json: version is required - it is the only update signal`);
        else if (!SEMVER_RE.test(plugin.version)) fail(`${label} plugin.json: version "${plugin.version}" is not semver`);
        else pluginVersion = plugin.version;
        if (!plugin.license) fail(`${label} plugin.json: license is required for a public plugin`);
        if (!plugin.description) fail(`${label} plugin.json: description is required`);
      }
    }

    // Skills must be discoverable where Claude Code looks for them.
    const skillsDir = join(resolved, 'skills');
    if (existsSync(skillsDir)) {
      const skills = readdirSync(skillsDir, { withFileTypes: true }).filter((e) => e.isDirectory());
      if (skills.length === 0) notes.push(`${label}: skills/ exists but contains no skill directory`);
      for (const s of skills) {
        const skillFile = join(skillsDir, s.name, 'SKILL.md');
        if (!existsSync(skillFile)) {
          fail(`${label}: skills/${s.name}/ has no SKILL.md`);
          continue;
        }
        validateSkill(skillFile, `${label} skills/${s.name}`, s.name);

        // A skill that records its version in generated artefacts must use the marketplace update
        // signal verbatim. Optional for general marketplace fixtures; mandatory-by-presence so a
        // future edit cannot bump one side and forget the other.
        const runtimeVersionFile = join(skillsDir, s.name, 'scripts/lib/version.mjs');
        if (existsSync(runtimeVersionFile)) {
          const source = readFileSync(runtimeVersionFile, 'utf8');
          const runtime = /export\s+const\s+PLUGIN_VERSION\s*=\s*['"]([^'"]+)['"]/.exec(source)?.[1] ?? null;
          if (!runtime) fail(`${label} skills/${s.name}: version.mjs does not export PLUGIN_VERSION`);
          else if (pluginVersion && runtime !== pluginVersion) {
            fail(
              `${label} skills/${s.name}: runtime version "${runtime}" does not match ` +
                `plugin.json version "${pluginVersion}"`,
            );
          }
        }
      }
    } else {
      notes.push(`${label}: no skills/ directory`);
    }
  }
}

// A stray plugin manifest beside marketplace.json turns the repository root into a second plugin.
if (existsSync(join(repoRoot, '.claude-plugin/plugin.json'))) {
  fail(
    '.claude-plugin/plugin.json exists at the repository root. In a marketplace repository this ' +
      'declares the root itself as a plugin; the real manifest belongs under the plugin directory.',
  );
}

// ---- SKILL.md -----------------------------------------------------------------------------
function validateSkill(path, label, dirName) {
  const text = readFileSync(path, 'utf8');
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!fm) {
    fail(`${label}: SKILL.md has no YAML frontmatter`);
    return;
  }
  const body = fm[1];

  const scalar = (key) => {
    // Handles `key: value`, `key: >` and `key: |` block scalars.
    const re = new RegExp(`^${key}:[ \\t]*(?:([>|][-+]?)\\s*\\n([\\s\\S]*?)(?=^\\S|$)|(.*))$`, 'm');
    const m = re.exec(body);
    if (!m) return null;
    if (m[1]) {
      return m[2]
        .split(/\r?\n/)
        .map((l) => l.trim())
        .join(' ')
        .trim();
    }
    return (m[3] ?? '').trim();
  };

  const name = scalar('name');
  checkName(name, `${label} SKILL.md`);
  if (name && name !== dirName) {
    notes.push(`${label}: frontmatter name "${name}" differs from directory "${dirName}" (allowed; it wins)`);
  }

  const description = scalar('description');
  if (!description) fail(`${label}: SKILL.md description is required - it drives invocation and listings`);
  else if (description.length > 1024) fail(`${label}: description is ${description.length} chars (max 1024)`);

  const whenToUse = scalar('when_to_use') ?? '';
  const combined = (description ?? '').length + whenToUse.length;
  if (combined > 1536) {
    fail(`${label}: description + when_to_use is ${combined} chars; listings truncate at 1536`);
  }

  const allowed = scalar('allowed-tools') ?? '';
  if (allowed && /AskUserQuestion/.test(allowed) === false && /AskUserQuestion/.test(text)) {
    notes.push(`${label}: SKILL.md mentions asking the user but allowed-tools omits AskUserQuestion`);
  }
}

// ---- the authoritative validator, when it is here -----------------------------------------
//
// Opportunistic on purpose. CI runners have no `claude` binary, so this cannot be the only line of
// defence - hence the rules above. But on a developer machine it is the real schema, and it caught a
// source form that every rule above accepted. Whether it ran is printed either way, so a green
// "manifests ok" is never mistaken for "the real validator agreed".
{
  const probe = spawnSync('claude', ['--version'], { encoding: 'utf8' });
  if (probe.error || probe.status !== 0) {
    notes.push('claude binary not found; the authoritative `claude plugin validate` did not run');
  } else {
    const r = spawnSync('claude', ['plugin', 'validate', repoRoot], {
      encoding: 'utf8',
    });
    const out = `${r.stdout ?? ''}${r.stderr ?? ''}`.trim();
    if (r.status !== 0) {
      fail(`claude plugin validate rejected the manifest:\n${out.split('\n').map((l) => `      ${l}`).join('\n')}`);
    } else {
      notes.push(`claude plugin validate passed (${String(probe.stdout).trim().split('\n')[0]})`);
    }
  }
}

// ---- report -------------------------------------------------------------------------------
for (const n of notes) console.log(`note  ${n}`);
if (problems.length) {
  for (const p of problems) console.error(`FAIL  ${p}`);
  console.error(`\n${problems.length} manifest problem(s).`);
  process.exit(1);
}
console.log('manifests ok (structure, naming, source resolution, plugin/skill wiring)');
