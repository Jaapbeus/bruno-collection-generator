// bruno-gen.json - the user's configuration, and the only tier that can override what the
// repository itself declares.
//
// Every value here arrives from a file inside the repository under inspection, so it is untrusted
// in the same sense as the source code: a `path` may try to escape the repository, a `placeholders`
// entry may be a regex that never compiles. The distinction this module draws throughout:
//
//   problem  - the value is unusable or unsafe. Hard error, never a prompt, never a silent repair.
//   warning  - the value is ignorable. Reported, then ignored, so a newer config still runs here.
//
// An unknown key is a warning by design. A config written for a later version must not stop this
// one from working, and the alternative - failing on anything unrecognised - makes every added
// field a breaking change for everyone who upgrades the config before the plugin.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isAbsoluteAnyPlatform } from './paths.mjs';

export const CONFIG_FILE = 'bruno-gen.json';

/** Substitution markers that documentation uses in place of a value. Not credentials. */
export const DEFAULT_PLACEHOLDERS = ['^__[A-Z0-9_]+__$', '^\\{\\{.+\\}\\}$'];

const AUTH_MODES = new Set(['none', 'apikey', 'bearer', 'basic', 'oauth2', 'inherit']);
const FORMATS = new Set(['bru', 'yml']);

const TOP_LEVEL = new Set([
  '$schema',
  'name',
  'output_dir',
  'format',
  'base_path',
  'environments',
  'headers',
  'auth',
  'placeholders',
  'extras',
  'projects',
]);

const PROJECT_KEYS = new Set([
  'name',
  'path',
  'output',
  'spec',
  'format',
  'base_path',
  'environments',
  'headers',
  'auth',
  'extras',
]);

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function repetitionOperatorCount(source) {
  let count = 0;
  let inClass = false;
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (char === '\\') {
      i++; // escaped punctuation is literal
      continue;
    }
    if (char === '[') {
      inClass = true;
      continue;
    }
    if (char === ']' && inClass) {
      inClass = false;
      continue;
    }
    if (inClass) continue;
    if (char === '*' || char === '+') {
      count++;
      continue;
    }
    if (char === '?') {
      // `(?:`, `(?=`, `(?<` and lazy modifiers do not add another repetition.
      if (source[i - 1] !== '(' && !['*', '+', '?', '}'].includes(source[i - 1])) count++;
      continue;
    }
    if (char === '{') {
      const quantified = /^\{\d+(?:,\d*)?\}/.exec(source.slice(i));
      if (quantified) {
        count++;
        i += quantified[0].length - 1;
      }
    }
  }
  return count;
}

/** Compile the deliberately small, linear-time subset accepted for repository-supplied patterns. */
export function compilePlaceholderPattern(pattern) {
  const source = String(pattern);
  if (source.length > 256) throw new Error('pattern is longer than 256 characters');
  // Backreferences and quantified groups are the common catastrophic-backtracking building blocks.
  // Placeholder patterns do not need either; rejecting them is safer than executing arbitrary regex
  // programs supplied by the repository against every value the scanner sees.
  if (/\\(?:[1-9]|k<)/.test(source) || /\)(?:[*+?]|\{\d)/.test(source)) {
    throw new Error('backreferences and repeated groups are not allowed');
  }
  if (repetitionOperatorCount(source) > 1) {
    throw new Error('more than one repetition operator is not allowed');
  }
  return new RegExp(source);
}

/**
 * A repo-relative path from config. The same rule as `resolveOutputDir`, applied earlier so the
 * error names the config key rather than surfacing from deep inside the emitter.
 */
function checkRelPath(value, label, problems) {
  if (typeof value !== 'string' || value.trim() === '') {
    problems.push(`${label} must be a non-empty string`);
    return null;
  }
  const v = value.trim();
  if (isAbsoluteAnyPlatform(v)) {
    problems.push(`${label} must be repo-relative, got an absolute path: ${v}`);
    return null;
  }
  if (v.split(/[\\/]/).includes('..')) {
    problems.push(`${label} must not contain "..": ${v}`);
    return null;
  }
  return v.replace(/\\/g, '/').replace(/\/+$/, '');
}

/** Headers as either {name: value} or [{name, value}]; both normalise to the array form. */
function normaliseHeaders(raw, label, problems) {
  if (raw === undefined) return undefined;
  if (isPlainObject(raw)) {
    return Object.entries(raw).map(([name, value]) => ({ name, value: String(value), source: 'config' }));
  }
  if (Array.isArray(raw)) {
    const out = [];
    for (const [i, h] of raw.entries()) {
      if (!isPlainObject(h) || typeof h.name !== 'string') {
        problems.push(`${label}[${i}] must be an object with a "name"`);
        continue;
      }
      out.push({ name: h.name, value: String(h.value ?? ''), source: 'config' });
    }
    return out;
  }
  problems.push(`${label} must be an object of name/value pairs or an array of {name, value}`);
  return undefined;
}

function normaliseEnvironments(raw, label, problems) {
  if (raw === undefined) return undefined;
  if (!isPlainObject(raw)) {
    problems.push(`${label} must be an object mapping an environment name to its base URL`);
    return undefined;
  }
  const out = [];
  for (const [name, value] of Object.entries(raw)) {
    if (typeof value === 'string') {
      out.push({ name, vars: { baseUrl: value }, secrets: [] });
      continue;
    }
    if (isPlainObject(value)) {
      // The long form: {vars: {...}, secrets: [...]}. Values only; a secret is a name.
      const vars = isPlainObject(value.vars) ? { ...value.vars } : {};
      if (typeof value.baseUrl === 'string') vars.baseUrl = value.baseUrl;
      const secrets = Array.isArray(value.secrets) ? value.secrets.filter((s) => typeof s === 'string') : [];
      out.push({ name, vars, secrets });
      continue;
    }
    problems.push(`${label}.${name} must be a base URL string, or an object with vars/secrets`);
  }
  return out;
}

function normaliseAuth(raw, label, problems) {
  if (raw === undefined) return undefined;
  if (typeof raw === 'string') {
    if (!AUTH_MODES.has(raw)) {
      problems.push(`${label} must be one of: ${[...AUTH_MODES].join(', ')}`);
      return undefined;
    }
    return { mode: raw, source: 'config' };
  }
  if (!isPlainObject(raw)) {
    problems.push(`${label} must be a mode string or an object with a "mode"`);
    return undefined;
  }
  if (!AUTH_MODES.has(raw.mode)) {
    problems.push(`${label}.mode must be one of: ${[...AUTH_MODES].join(', ')}`);
    return undefined;
  }
  return { ...raw, source: 'config' };
}

/**
 * Compile the placeholder allow-list once, here, so a broken pattern is a config error naming the
 * offending entry rather than an exception thrown from the secret detector at scan time.
 */
function compilePlaceholders(raw, problems, warnings) {
  const patterns = raw === undefined ? DEFAULT_PLACEHOLDERS : raw;
  if (!Array.isArray(patterns)) {
    problems.push('placeholders must be an array of regular-expression strings');
    return DEFAULT_PLACEHOLDERS.map(compilePlaceholderPattern);
  }
  const out = [];
  for (const [i, p] of patterns.entries()) {
    if (typeof p !== 'string') {
      problems.push(`placeholders[${i}] must be a string`);
      continue;
    }
    try {
      out.push(compilePlaceholderPattern(p));
    } catch (err) {
      problems.push(`placeholders[${i}] is not a valid regular expression: ${err.message}`);
    }
  }
  if (out.length === 0 && patterns.length > 0) {
    warnings.push('no usable placeholder patterns; falling back to the defaults');
    return DEFAULT_PLACEHOLDERS.map(compilePlaceholderPattern);
  }
  return out;
}

function readProjects(raw, problems, warnings) {
  if (raw === undefined) return undefined;
  if (!Array.isArray(raw)) {
    problems.push('projects must be an array');
    return undefined;
  }
  const out = [];
  const seenName = new Map();
  const seenPath = new Map();

  for (const [i, entry] of raw.entries()) {
    const label = `projects[${i}]`;
    if (!isPlainObject(entry)) {
      problems.push(`${label} must be an object`);
      continue;
    }
    for (const key of Object.keys(entry)) {
      if (!PROJECT_KEYS.has(key)) warnings.push(`${label}.${key} is not a setting this version knows; ignored`);
    }

    const path = checkRelPath(entry.path ?? '.', `${label}.path`, problems);
    if (path === null) continue;

    const name = typeof entry.name === 'string' && entry.name.trim() ? entry.name.trim() : path === '.' ? 'root' : path;
    const output = entry.output === undefined ? undefined : checkRelPath(entry.output, `${label}.output`, problems);
    const spec = entry.spec === undefined ? undefined : checkRelPath(entry.spec, `${label}.spec`, problems);

    if (entry.format !== undefined && !FORMATS.has(entry.format)) {
      problems.push(`${label}.format must be "bru" or "yml"`);
    }
    // Checked like the top-level base_path. It was not, and per-project settings now genuinely
    // reach the model, so a non-string here would land in the model as routePrefix.
    if (entry.base_path !== undefined && typeof entry.base_path !== 'string') {
      problems.push(`${label}.base_path must be a string`);
    }

    // Two entries claiming one name make `--project` ambiguous; two claiming one path make the
    // output root ambiguous. Both are the user's mistake to fix, not ours to pick a winner for.
    if (seenName.has(name.toLowerCase())) {
      problems.push(`${label}.name "${name}" is already used by projects[${seenName.get(name.toLowerCase())}]`);
    } else {
      seenName.set(name.toLowerCase(), i);
    }
    if (seenPath.has(path.toLowerCase())) {
      problems.push(`${label}.path "${path}" is already used by projects[${seenPath.get(path.toLowerCase())}]`);
    } else {
      seenPath.set(path.toLowerCase(), i);
    }

    out.push({
      name,
      // `name` doubles as the --project selector and falls back to the path, so it cannot also be
      // the collection's display name. This is the name only if the user wrote one.
      displayName: typeof entry.name === 'string' && entry.name.trim() ? entry.name.trim() : undefined,
      path,
      output,
      spec,
      format: entry.format,
      basePath: entry.base_path,
      environments: normaliseEnvironments(entry.environments, `${label}.environments`, problems),
      headers: normaliseHeaders(entry.headers, `${label}.headers`, problems),
      auth: normaliseAuth(entry.auth, `${label}.auth`, problems),
      extras: isPlainObject(entry.extras) ? entry.extras : undefined,
      declared: true,
    });
  }
  return out;
}

/** The shape returned when there is no config at all: defaults, and nothing to report. */
export function emptyConfig() {
  return {
    present: false,
    path: null,
    name: undefined,
    outputDir: undefined,
    format: undefined,
    basePath: undefined,
    environments: undefined,
    headers: undefined,
    auth: undefined,
    extras: undefined,
    projects: undefined,
    placeholders: DEFAULT_PLACEHOLDERS.map(compilePlaceholderPattern),
    problems: [],
    warnings: [],
  };
}

/**
 * Read `bruno-gen.json` from the repository root.
 *
 * Never throws for bad content: `problems` is returned for the caller to report and exit on, so a
 * malformed config produces a readable list of what is wrong rather than a stack trace.
 */
export function loadConfig(repoRoot) {
  const path = join(repoRoot, CONFIG_FILE);
  if (!existsSync(path)) return emptyConfig();

  let raw;
  try {
    raw = JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    return { ...emptyConfig(), present: true, path, problems: [`${CONFIG_FILE} is not valid JSON: ${err.message}`] };
  }
  if (!isPlainObject(raw)) {
    return { ...emptyConfig(), present: true, path, problems: [`${CONFIG_FILE} must contain a JSON object`] };
  }

  const problems = [];
  const warnings = [];

  for (const key of Object.keys(raw)) {
    if (!TOP_LEVEL.has(key)) warnings.push(`${key} is not a setting this version knows; ignored`);
  }

  if (raw.name !== undefined && typeof raw.name !== 'string') problems.push('name must be a string');
  if (raw.format !== undefined && !FORMATS.has(raw.format)) problems.push('format must be "bru" or "yml"');
  if (raw.base_path !== undefined && typeof raw.base_path !== 'string') problems.push('base_path must be a string');

  const outputDir = raw.output_dir === undefined ? undefined : checkRelPath(raw.output_dir, 'output_dir', problems);

  return {
    present: true,
    path,
    name: typeof raw.name === 'string' ? raw.name : undefined,
    outputDir,
    format: FORMATS.has(raw.format) ? raw.format : undefined,
    basePath: typeof raw.base_path === 'string' ? raw.base_path : undefined,
    environments: normaliseEnvironments(raw.environments, 'environments', problems),
    headers: normaliseHeaders(raw.headers, 'headers', problems),
    auth: normaliseAuth(raw.auth, 'auth', problems),
    extras: isPlainObject(raw.extras) ? raw.extras : undefined,
    projects: readProjects(raw.projects, problems, warnings),
    placeholders: compilePlaceholders(raw.placeholders, problems, warnings),
    problems,
    warnings,
  };
}

/**
 * Config settings for one project: the project entry's own values over the top-level ones.
 *
 * Deliberately not a deep merge. `environments` and `headers` are whole declarations - a project
 * that names its own environments means those, not those plus the repository's - and silently
 * unioning them would make it impossible to narrow a shared default.
 */
export function settingsFor(config, project = null) {
  // The project's own CONFIG entry, not the project object the catalogue builds. Reading the
  // catalogue object meant two different bugs at once: the per-project settings were not there to
  // read, and its `name` - which for an undiscovered project is just the directory basename -
  // silently became the collection name, outranking both the spec title and a `name` the user had
  // written at the top level of bruno-gen.json.
  const p = project?.settings ?? {};
  return {
    // Only a name the user actually wrote, never one derived from a path.
    name: p.displayName ?? config.name,
    outputDir: p.output ?? config.outputDir,
    format: p.format ?? config.format,
    basePath: p.basePath ?? config.basePath,
    environments: p.environments ?? config.environments,
    headers: p.headers ?? config.headers,
    auth: p.auth ?? config.auth,
    extras: p.extras ?? config.extras,
    spec: p.spec,
  };
}
