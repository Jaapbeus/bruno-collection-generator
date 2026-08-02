// Command-line grammar in one place. Unknown flags and missing values are errors: silently
// accepting a typo in --allow-unresolved is confusing, and treating the string in --yes=false as
// truthy would turn an explicit refusal into consent to send real requests.

const VALUE_FLAGS = new Set([
  'root', 'project', 'model', 'spec', 'out', 'format', 'collectionName', 'outputDir',
  'placeholder', 'env', 'var', 'excludeTags', 'tags', 'prune', 'reset',
]);

const BOOLEAN_FLAGS = new Set(['json', 'yes', 'bail', 'allowUnresolved', 'help']);
const REPEATABLE_FLAGS = new Set(['placeholder', 'var', 'excludeTags', 'tags', 'prune', 'reset']);

const COMMAND_FLAGS = {
  help: new Set(['help']),
  version: new Set(['json', 'help']),
  probe: new Set(['root', 'project', 'out', 'json', 'help']),
  ingest: new Set(['root', 'project', 'spec', 'out', 'format', 'collectionName', 'outputDir', 'json', 'help']),
  doctor: new Set(['root', 'placeholder', 'json', 'help']),
  adopt: new Set(['root', 'json', 'help']),
  plan: new Set(['root', 'project', 'model', 'json', 'help']),
  apply: new Set(['root', 'project', 'model', 'prune', 'reset', 'allowUnresolved', 'json', 'help']),
  smoke: new Set(['root', 'env', 'yes', 'var', 'excludeTags', 'tags', 'bail', 'json', 'help']),
};

const flagName = (raw) => raw.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

function addFlag(flags, key, value, problems) {
  if (!Object.prototype.hasOwnProperty.call(flags, key)) {
    flags[key] = value;
    return;
  }
  if (!REPEATABLE_FLAGS.has(key)) {
    problems.push(`--${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)} may be passed only once`);
    return;
  }
  flags[key] = Array.isArray(flags[key]) ? [...flags[key], value] : [flags[key], value];
}

/** Parse long options. Returns every problem so one invocation can be fixed in one pass. */
export function parseArgs(argv) {
  const result = { _: [], flags: {}, problems: [] };
  let positionalOnly = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--') {
      positionalOnly = true;
      continue;
    }
    if (positionalOnly || !arg.startsWith('--')) {
      result._.push(arg);
      continue;
    }

    const [rawKey, inlineValue] = arg.slice(2).split(/=(.*)/s);
    const key = flagName(rawKey);
    if (!VALUE_FLAGS.has(key) && !BOOLEAN_FLAGS.has(key)) {
      result.problems.push(`unknown option --${rawKey}`);
      continue;
    }

    if (BOOLEAN_FLAGS.has(key)) {
      if (inlineValue !== undefined && !['true', 'false'].includes(inlineValue.toLowerCase())) {
        result.problems.push(`--${rawKey} accepts only true or false when a value is supplied`);
        continue;
      }
      addFlag(result.flags, key, inlineValue === undefined ? true : inlineValue.toLowerCase() === 'true', result.problems);
      continue;
    }

    const next = argv[i + 1];
    if (inlineValue === undefined && (next === undefined || next.startsWith('--'))) {
      result.problems.push(`--${rawKey} needs a value`);
      continue;
    }
    const value = inlineValue === undefined ? argv[++i] : inlineValue;
    if (value === '') {
      result.problems.push(`--${rawKey} needs a non-empty value`);
      continue;
    }
    addFlag(result.flags, key, value, result.problems);
  }

  if (result._.length > 1) {
    result.problems.push(`${result._.length - 1} unexpected positional argument(s)`);
  }

  const command = result._[0];
  const allowed = COMMAND_FLAGS[command];
  if (allowed) {
    for (const key of Object.keys(result.flags)) {
      if (!allowed.has(key)) {
        result.problems.push(
          `--${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)} is not valid for ${command}`,
        );
      }
    }
  }

  return result;
}

export const asList = (value) =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];
