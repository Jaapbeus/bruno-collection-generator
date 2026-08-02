#!/usr/bin/env node
// bruno-gen-collection CLI.
//
// Exit codes are part of the contract:
//   0 ok
//   1 error
//   2 nothing HTTP-shaped found at all
//   3 surface found, none of it supported
//   4 unresolved required values (a warning: files were written and are valid)
//   5 ambiguous project selection
// Precedence when several could apply: 5 > 3 > 2 > 4.

import { assertNodeVersion, DependencyError, libraryVersions } from './lib/deps.mjs';
import { doctor, EXIT } from './lib/doctor.mjs';
import { planCommand, applyCommand, adoptCommand, probeCommand, ingestCommand, smokeCommand } from './lib/commands.mjs';
import { RunLockError } from './lib/runlock.mjs';
import { ModelError } from './lib/model-validate.mjs';
import { PathSafetyError } from './lib/paths.mjs';
import { LockfileError } from './lib/lockfile.mjs';
import { compilePlaceholderPattern, loadConfig } from './lib/config.mjs';
import { parseArgs, asList } from './lib/cli-args.mjs';
import { PLUGIN_VERSION } from './lib/version.mjs';
import { redactCredentialShapes, redactOutput } from './lib/secrets.mjs';

const COMMANDS = new Set([
  'probe', 'ingest', 'doctor', 'adopt', 'plan', 'apply', 'smoke', 'version', 'help',
]);

const writeJson = (value) => process.stdout.write(`${JSON.stringify(redactOutput(value), null, 2)}\n`);

const usage = () => `bruno-gen-collection - generate and maintain a Bruno collection

Usage:
  node brunogen.mjs <command> [options]

Commands:
  probe     find what could describe this repository's API (read-only, no model)
  ingest    turn an OpenAPI, Postman or WSDL description into an api-model.json
  doctor    inspect an existing collection: inventory, diagnostics, secret scan (read-only)
  adopt     record every existing file as yours, so a later apply cannot overwrite your work
  plan      show exactly what apply would do, writing nothing
  apply     write the collection, merging with what you have edited
  smoke     run the collection with Bruno's CLI to prove it works (real requests, needs --yes)
  version   print the CLI and vendored library versions

Options:
  --root <dir>          repository or collection directory (default: current directory)
  --project <name>      which project, when the repository holds more than one
  --model <file>        api-model.json (required by plan and apply)
  --spec <file>         API description to ingest (default: the chosen project's description)
  --out <file>          where ingest writes the model, or probe writes its JSON
  --format bru|yml      collection format for ingest (default: yml, Bruno's default)
  --collection-name <s> override the collection name ingest takes from the spec
  --output-dir <dir>    repo-relative collection directory for ingest (default: bruno)
  --json                machine-readable output instead of a report
  --prune <path>        delete one reported orphan (repeatable; only machine-owned, unmodified)
  --reset <path>        accept generated content for a file you edited (repeatable)
  --allow-unresolved    treat unresolved required values as success rather than exit 4
  --placeholder <re>    extra regex treated as a non-secret placeholder (repeatable)
  --env <name>          environment for smoke
  --yes                 confirm smoke may send real requests
  --var name=value      supply a variable for this run only, never written to disk (repeatable)
  --exclude-tags <t>    tags smoke skips (repeatable; default: destructive)
  --tags <t>            run only requests carrying this tag (repeatable)
  --bail                stop smoke at the first failure

Exit codes: 0 ok | 1 error | 2 no HTTP surface | 3 unsupported surface |
            4 unresolved required values | 5 ambiguous selection
`;

function collectPlaceholders(flags) {
  const out = [];
  for (const pattern of asList(flags.placeholder)) {
    try {
      out.push(compilePlaceholderPattern(pattern));
    } catch (err) {
      throw new Error(`--placeholder is not a safe regular expression (${err.message})`);
    }
  }
  return out;
}

async function main(argv) {
  const args = parseArgs(argv);
  const command = args._[0];

  if (args.problems.length) {
    for (const problem of args.problems) process.stderr.write(`Invalid arguments: ${problem}\n`);
    process.stderr.write('Run `node brunogen.mjs help` for usage.\n');
    return EXIT.ERROR;
  }

  if (!command || command === 'help' || args.flags.help) {
    process.stdout.write(usage());
    return EXIT.OK;
  }

  if (!COMMANDS.has(command)) {
    process.stderr.write(`Unknown command: ${redactCredentialShapes(command)}\n\n${usage()}`);
    return EXIT.ERROR;
  }

  // Every command needs the vendored libraries, so gate the runtime before doing anything.
  assertNodeVersion();

  if (command === 'version') {
    const v = { plugin: PLUGIN_VERSION, ...libraryVersions() };
    process.stdout.write(
      args.flags.json
        ? `${JSON.stringify(v, null, 2)}\n`
        : `${Object.entries(v)
            .map(([k, val]) => `  ${k.padEnd(11)} ${val ?? '(missing)'}`)
            .join('\n')}\n`,
    );
    return EXIT.OK;
  }

  const root = typeof args.flags.root === 'string' ? args.flags.root : process.cwd();
  const project = typeof args.flags.project === 'string' ? args.flags.project : null;

  if (command === 'probe') {
    const run = probeCommand({
      root,
      project,
      json: Boolean(args.flags.json),
      out: typeof args.flags.out === 'string' ? args.flags.out : null,
    });
    if (args.flags.json) writeJson(run.result);
    else run.report.print();
    return run.exitCode;
  }

  if (command === 'ingest') {
    if (typeof args.flags.out !== 'string') {
      process.stderr.write('`ingest` needs --out <api-model.json>.\n');
      return EXIT.ERROR;
    }
    // null, not the default, when the flag is absent: `ingest` has to be able to tell "the user
    // asked for yml" from "nobody said", or an explicit flag cannot outrank bruno-gen.json - which
    // is the precedence the command documents.
    const format = typeof args.flags.format === 'string' ? args.flags.format : null;
    if (format !== null && !['bru', 'yml'].includes(format)) {
      process.stderr.write('--format must be bru or yml.\n');
      return EXIT.ERROR;
    }
    const run = await ingestCommand({
      root,
      project,
      specPath: typeof args.flags.spec === 'string' ? args.flags.spec : null,
      out: args.flags.out,
      format,
      collectionName: typeof args.flags.collectionName === 'string' ? args.flags.collectionName : null,
      outputDir: typeof args.flags.outputDir === 'string' ? args.flags.outputDir : null,
      json: Boolean(args.flags.json),
    });
    if (args.flags.json) writeJson(run.result);
    else run.report.print();
    return run.exitCode;
  }

  if (command === 'doctor') {
    // Placeholder patterns come from both places: bruno-gen.json declares the project's documented
    // markers once, --placeholder adds one for a single run.
    const config = loadConfig(root);
    if (config.problems.length) {
      process.stderr.write(`bruno-gen.json cannot be used:\n`);
      for (const p of config.problems) process.stderr.write(`  ${redactCredentialShapes(p)}\n`);
      return EXIT.ERROR;
    }
    const { exitCode, result, report } = doctor({
      root,
      placeholders: [...config.placeholders, ...collectPlaceholders(args.flags)],
      json: Boolean(args.flags.json),
    });
    if (args.flags.json) writeJson(result);
    else report.print();
    return exitCode;
  }

  if (command === 'smoke') {
    const excludeTags = asList(args.flags.excludeTags);
    const run = smokeCommand({
      root,
      env: typeof args.flags.env === 'string' ? args.flags.env : null,
      yes: Boolean(args.flags.yes),
      excludeTags: excludeTags.length ? excludeTags : null,
      tags: asList(args.flags.tags),
      bail: Boolean(args.flags.bail),
      vars: asList(args.flags.var),
      json: Boolean(args.flags.json),
    });
    if (args.flags.json) writeJson(run.result);
    else run.report.print();
    return run.exitCode;
  }

  if (command === 'plan' || command === 'apply' || command === 'adopt') {
    const modelPath = typeof args.flags.model === 'string' ? args.flags.model : null;
    if (command !== 'adopt' && !modelPath) {
      process.stderr.write(`\`${command}\` needs --model <api-model.json>.\n`);
      return EXIT.ERROR;
    }

    // The run lock is taken inside `apply` and `adopt`, not here. It is keyed on the COLLECTION root,
    // and only the command can resolve that - `--root repo` and `--root repo/bruno` name the same
    // collection, and locking the argument gave them two different locks, so they did not exclude
    // each other at all. `plan` writes nothing and needs no lock.
    const run =
      command === 'plan'
        ? planCommand({ root, modelPath, project, json: Boolean(args.flags.json) })
        : command === 'apply'
          ? applyCommand({
              root,
              modelPath,
              project,
              json: Boolean(args.flags.json),
              prune: asList(args.flags.prune),
              reset: asList(args.flags.reset),
              allowUnresolved: Boolean(args.flags.allowUnresolved),
              onLockNotice: (m) => process.stderr.write(`note: ${m}\n`),
            })
          : adoptCommand({
              root,
              json: Boolean(args.flags.json),
              onLockNotice: (m) => process.stderr.write(`note: ${m}\n`),
            });

    if (args.flags.json) writeJson(run.result);
    else run.report.print();
    return run.exitCode;
  }

  return EXIT.ERROR;
}

try {
  process.exitCode = await main(process.argv.slice(2));
} catch (err) {
  if (err instanceof ModelError) {
    process.stderr.write(`${redactCredentialShapes(err.message)}\n`);
    for (const p of err.problems ?? []) process.stderr.write(`  - ${redactCredentialShapes(p)}\n`);
  } else if (err instanceof RunLockError || err instanceof PathSafetyError || err instanceof LockfileError) {
    process.stderr.write(`${redactCredentialShapes(err.message)}\n`);
  } else if (err instanceof DependencyError) {
    process.stderr.write(`${redactCredentialShapes(err.message)}\n`);
    if (err.hint) process.stderr.write(`${redactCredentialShapes(err.hint)}\n`);
  } else {
    process.stderr.write(`${redactCredentialShapes(err?.stack ?? err)}\n`);
  }
  process.exitCode = EXIT.ERROR;
}
