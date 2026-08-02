// plan / apply / adopt: resolving where to write, then delegating to the pure planner.

import { join, resolve, relative, sep } from 'node:path';
import { probe } from './probe.mjs';
import { readSpec, KIND, SKIP } from './spec-parse.mjs';
import { ingestOpenApi, ingestViaConverter } from './ingest.mjs';
import { loadModel, validateModel } from './model-validate.mjs';
import { planFiles } from './emit.mjs';
import { planMerge, STATUS, isNoop } from './plan.mjs';
import { applyPlan, adopt as adoptCollection } from './apply.mjs';
import { readLock, frozenFrom } from './lockfile.mjs';
import { findCollections, selectCollection } from './format.mjs';
import { resolveOutputDir, byCodepoint } from './paths.mjs';
import { libraryVersions } from './deps.mjs';
import { Report, count } from './report.mjs';
import { EXIT } from './doctor.mjs';
import { loadConfig, settingsFor, CONFIG_FILE } from './config.mjs';
import { enumerateProjects, selectProject, catalogueRows } from './projects.mjs';
import { detectLegacy, layerLegacy, applyLegacyBodies } from './migrate.mjs';
import { smoke } from './smoke.mjs';
import { readRequests } from './inventory.mjs';
import { auditModel } from './secrets.mjs';
import { acquire, lockFileFor } from './runlock.mjs';
import { writeFileAtomic } from './atomic-write.mjs';
import { PLUGIN_VERSION } from './version.mjs';

/**
 * Config, legacy sidecars and the chosen project - everything that sits between "this repository"
 * and "this model", resolved once.
 *
 * Project enumeration deliberately avoids probe unless it is actually needed. When bruno-gen.json
 * declares `projects[]`, those entries are the answer and walking the tree would only slow plan and
 * apply down; probe runs only when `--project` names something that has to be found.
 */
function loadContext(repoRoot, { requested = null, needProbe = false } = {}) {
  const config = loadConfig(repoRoot);
  if (config.problems.length) return { config, configError: true };

  const legacy = detectLegacy(repoRoot);
  const declared = Boolean(config.projects?.length);

  let projects = [];
  let selection = { project: null, rule: null };
  if (declared || requested || needProbe) {
    const probeResult = declared && !requested && !needProbe ? { candidates: [] } : probe(repoRoot);
    projects = enumerateProjects(probeResult, config);
    selection = selectProject(projects, { requested, config });
  }

  return { config, legacy, projects, selection, declared };
}

/** Report a bad bruno-gen.json the same way everywhere: named problems, then a hard stop. */
function reportConfigError(config, report) {
  report.warn(`${CONFIG_FILE} cannot be used:`);
  for (const p of config.problems) report.warn(`  ${p}`);
  report.info('Fix these and run again. Nothing was read from it, and nothing was written.');
  return { exitCode: EXIT.ERROR, report, result: { configProblems: config.problems } };
}

/**
 * A model that stopped validating once config was layered onto it. Named separately from a bad
 * model file so the user looks at the right place: the file passed --model is fine, the settings
 * applied to it are not.
 */
function reportLayeredProblems(problems, report) {
  report.warn(`The model is no longer valid once ${CONFIG_FILE} and the legacy settings are applied:`);
  for (const p of problems) report.warn(`  ${p}`);
  report.info(`Fix the offending setting in ${CONFIG_FILE}. Nothing was written.`);
  return { exitCode: EXIT.ERROR, report, result: { layeredProblems: problems } };
}

/** How to stop a flagged value from being written. Printed with both the refusal and the warning. */
function explainSecretRemedy(report) {
  report.info('Declare the name instead and leave the value out:');
  report.info('  "environments": { "dev": { "vars": {...}, "secrets": ["functionKey"] } }');
  report.info('The request then references {{functionKey}} and the value is supplied at run time');
  report.info('(`smoke --var functionKey=...`), never stored.');
  report.info(`If this is not a credential, add a pattern to "placeholders" in ${CONFIG_FILE}.`);
}

/** Values that would have been written verbatim into files destined for git. */
function reportLeaks(leaks, report) {
  report.warn(
    leaks.length === 1
      ? 'Refusing to write: 1 value is a credential.'
      : `Refusing to write: ${leaks.length} values are credentials.`,
  );
  report.info('Reported by setting only - the value is never printed, copied or logged.');
  for (const l of leaks) report.warn(`  ${l.where}  ${l.reason}`);
  report.info('');
  report.info('The collection is committed to git, so a literal credential in it is a leak.');
  explainSecretRemedy(report);
  return { exitCode: EXIT.ERROR, report, result: { leaks } };
}

/** Heuristic hits: written, but never without saying so. */
function reportSuspects(suspects, report) {
  report.warn(`${count(suspects.length, 'value')} under a credential-shaped name will be written as plain text:`);
  for (const s of suspects) report.warn(`  ${s.where}  ${s.reason}`);
  explainSecretRemedy(report);
}

function reportAmbiguous(selection, report, { command }) {
  report.warn(`${selection.reason}. Choose one with --project <name>:`);
  report.table(['score', 'project', 'path', 'describes', 'endpoints', 'why'], catalogueRows(selection.ambiguous));
  report.info('');
  report.info('Picking the highest score automatically is exactly the mistake this refuses to make:');
  report.info('a collection for the wrong service looks completely normal, so nobody notices.');
  report.info(`Or settle it once by listing projects[] in ${CONFIG_FILE}.`);
  return { exitCode: EXIT.AMBIGUOUS, report, result: { ambiguous: selection.ambiguous, command } };
}

/**
 * Layer configuration and legacy sidecars onto the model, at the config tier.
 *
 * The model arrives from ingest or from the model reading source. Both describe the API; neither
 * knows what the user has chosen to call it, which environments they use, or which headers every
 * request needs. Those are settings, and settings outrank anything derived from the repository.
 */
function layerSettings(model, settings, legacy) {
  const collection = { ...model.collection };
  const applied = [];

  if (settings.name) {
    collection.name = settings.name;
    applied.push(`name "${settings.name}"`);
  }
  if (settings.format) {
    collection.format = settings.format;
    applied.push(`format "${settings.format === 'yml' ? 'opencollection.yml' : '.bru'}"`);
  }
  if (settings.outputDir) {
    collection.outputDir = settings.outputDir;
    applied.push(`output directory "${settings.outputDir}"`);
  }
  if (settings.basePath !== undefined) {
    collection.routePrefix = settings.basePath;
    applied.push(`route prefix "${settings.basePath || '(host root)'}"`);
  }
  if (settings.environments?.length) {
    // Which environments exist, and their base URLs, is a settings question - config and the legacy
    // sidecars own that. Which secret NAMES the requests need is not: that follows from the auth
    // recipe in the model, and the two facts are orthogonal.
    //
    // Replacing the array wholesale conflated them. Legacy `envList()` always builds `secrets: []`,
    // so migrating a collection and adding its first authenticated endpoint threw away the
    // `functionKey` declaration the model had made - leaving requests referencing `{{functionKey}}`
    // with no environment declaring it. Every one of them 401s, and the only way to find out is to
    // run `doctor`. That is the same failure class as an auth mode with no credential block, one
    // layer further out.
    //
    // A secret name is declared in EVERY environment, not only the one that happened to name it: a
    // request referencing `{{functionKey}}` needs it wherever it runs, and a declared name with an
    // empty value costs nothing while a missing one costs a 401.
    const modelEnvs = model.collection.environments ?? [];
    const modelByName = new Map(modelEnvs.map((e) => [e.name.toLowerCase(), e]));
    const allModelSecrets = modelEnvs.flatMap((e) => e.secrets ?? []);

    collection.environments = settings.environments.map((env) => {
      const fromModel = modelByName.get(env.name.toLowerCase());
      const secrets = [...new Set([...(env.secrets ?? []), ...(fromModel?.secrets ?? []), ...allModelSecrets])].sort();
      // Config values win, but a var the model declared and config is silent about survives.
      const vars = { ...(fromModel?.vars ?? {}), ...(env.vars ?? {}) };
      // A name cannot be both a plain var and a declared secret - the schema rejects that, and the
      // writer would emit the name twice. The secret wins: declaring one is the user's explicit
      // statement that the value does not belong on disk. This is checked HERE rather than in ingest
      // because only the layered result knows both sides.
      const shadowed = [];
      for (const name of secrets) {
        if (Object.prototype.hasOwnProperty.call(vars, name)) {
          delete vars[name];
          shadowed.push(name);
        }
      }
      if (shadowed.length) {
        applied.push(`${shadowed.join(', ')} declared secret, so the plain value(s) were dropped`);
      }
      return {
        ...env,
        vars,
        ...(secrets.length ? { secrets } : {}),
      };
    });

    const carried = [...new Set(allModelSecrets)];
    applied.push(
      `${settings.environments.length} environment(s)` +
        (carried.length ? `, keeping ${carried.length} secret name(s) the model declared: ${carried.join(', ')}` : ''),
    );
  }
  if (settings.auth) {
    collection.auth = { ...settings.auth };
    applied.push(`auth mode "${settings.auth.mode}"`);
  }
  if (settings.headers?.length) {
    // Config headers win per name; anything the description declared and config does not mention
    // stays, so setting one header does not silently drop the rest.
    const byName = new Map((collection.headers ?? []).map((h) => [h.name.toLowerCase(), h]));
    for (const h of settings.headers) byName.set(h.name.toLowerCase(), h);
    collection.headers = [...byName.values()];
    applied.push(`${settings.headers.length} default header(s)`);
  }

  let next = { ...model, collection };
  const bodies = legacy?.bodies;
  const bodyResult = bodies?.size ? applyLegacyBodies(next, bodies) : { model: next, applied: [] };
  next = bodyResult.model;

  return { model: next, applied, bodiesApplied: bodyResult.applied };
}

/**
 * Where the collection goes.
 *
 * An existing collection's root always wins over the configured output directory. The migration
 * case proves why: a repository whose collection sits at bruno/collection/ would otherwise get a
 * second collection at bruno/, and "changes nothing" would be false.
 */
export function resolveCollectionRoot(repoRoot, model) {
  const existing = findCollections(repoRoot);
  const { collection, ambiguous } = selectCollection(existing);

  if (ambiguous) {
    return { ambiguous, root: null, reason: `${ambiguous.length} collections found` };
  }
  if (collection) {
    if (collection.format !== model.collection.format) {
      return {
        root: collection.root,
        reason: 'existing collection root',
        formatMismatch: { onDisk: collection.format, inModel: model.collection.format },
      };
    }
    return { root: collection.root, reason: 'existing collection root (wins over output_dir)' };
  }
  return {
    root: resolveOutputDir(repoRoot, model.collection.outputDir),
    reason: `output_dir "${model.collection.outputDir}"`,
  };
}

function describe(d) {
  switch (d.status) {
    case STATUS.CREATE: return 'new';
    case STATUS.UPDATED: return d.reason ?? 'changed';
    case STATUS.UNCHANGED: return 'identical';
    case STATUS.KEPT: return d.reason ?? 'you edited it';
    case STATUS.RESTORED: return 'was missing';
    case STATUS.MOVED: return `you moved it to ${d.movedTo}`;
    case STATUS.ORPHAN: return 'no longer in the model';
    // plan supplies the accurate wording where it has one - an adopted file, or one it could not
    // read - and leaves the note off for a file that genuinely was never seen. Without this the
    // distinction it took care to make never reached the user.
    case STATUS.UNMANAGED: return d.note ?? 'yours, never generated';
    case STATUS.CREATE_ONCE_EXISTS: return 'create-once, left alone';
    case STATUS.SECRETS_ADDED: return d.note ?? 'secret names added';
    default: return d.status;
  }
}

const MARK = {
  [STATUS.CREATE]: 'added',
  [STATUS.UPDATED]: 'updated',
  [STATUS.UNCHANGED]: 'unchanged',
  [STATUS.KEPT]: 'kept',
  [STATUS.RESTORED]: 'restored',
  [STATUS.MOVED]: 'moved',
  [STATUS.ORPHAN]: 'orphan',
  [STATUS.UNMANAGED]: 'yours',
  [STATUS.CREATE_ONCE_EXISTS]: 'exists',
  [STATUS.SECRETS_ADDED]: 'secrets',
};

/**
 * Shared front half of plan and apply.
 *
 * It takes no lock. `apply` and `adopt` acquire around it instead, and re-run it once the lock is
 * held: everything below the acquisition is a snapshot of the collection, and applying a snapshot
 * another run has since changed is how a stale plan overwrites its work and a stale lockfile forgets
 * what it created. Locking inside here could only key on a root discovered before the lock existed.
 */
function prepare({ root, modelPath, project: requested = null }) {
  const repoRoot = resolve(root);
  const ctx = loadContext(repoRoot, { requested });
  if (ctx.configError) return { configError: ctx.config, repoRoot };
  if (ctx.selection.problem) return { selectionProblem: ctx.selection, repoRoot };
  if (ctx.selection.ambiguous) return { selectionAmbiguous: ctx.selection, repoRoot };

  const settings = layerLegacy(settingsFor(ctx.config, ctx.selection.project), ctx.legacy);
  const layered = layerSettings(loadModel(modelPath), settings, ctx.legacy);
  const model = layered.model;

  // `loadModel` validated the file on disk, but config and the legacy sidecars are layered on top
  // afterwards, so until here nothing had checked the model the writer actually receives. That gap
  // is exactly what the auth schema exists to close: a config `auth` of {mode, in, name, value}
  // reached the writer as `auth { mode: apikey }` with no credential block, and every request went
  // out unauthenticated. Validating the layered model is what makes the schema binding.
  const structural = validateModel(model);
  if (!structural.ok) return { layeredProblems: structural.problems, repoRoot };

  // Nothing may be written until the values have been classified. Every one of them came from a
  // file in the repository, and the collection is destined for git.
  const audit = auditModel(model, { placeholders: ctx.config.placeholders });
  const leaks = audit.filter((f) => f.matchedBy === 'shape');
  if (leaks.length) return { leaks, repoRoot };
  const suspects = audit.filter((f) => f.matchedBy !== 'shape');

  const placement = resolveCollectionRoot(repoRoot, model);

  if (placement.ambiguous) {
    return { exitCode: EXIT.AMBIGUOUS, placement, model, repoRoot };
  }

  const collectionRoot = placement.root;

  const format = placement.formatMismatch ? placement.formatMismatch.onDisk : model.collection.format;
  const lock = readLock(collectionRoot);
  const frozen = frozenFrom(lock);
  const { files } = planFiles(
    { ...model, collection: { ...model.collection, format } },
    { frozen },
  );
  const merge = planMerge({ collectionRoot, format, planned: files, lock });

  return {
    repoRoot,
    model,
    placement,
    collectionRoot,
    format,
    lock,
    files,
    merge,
    config: ctx.config,
    legacy: ctx.legacy,
    project: ctx.selection.project,
    projectRule: ctx.selection.rule,
    layered,
    suspects,
  };
}

/** The settings and migration lines both plan and apply print, in one place. */
function reportSettings(ctx, report) {
  if (ctx.project) {
    report.heading('Project');
    report.facts([
      ['project', ctx.project.name],
      ['path', ctx.project.path],
      ['chosen because', ctx.projectRule],
    ]);
  }

  if (ctx.legacy?.present) {
    report.heading('Migrated from the PowerShell generator');
    for (const f of ctx.legacy.found) report.info(`read ${f.path}${f.files ? ` (${f.files.length} file(s))` : ''}`);
    for (const n of ctx.legacy.notes) report.info(`  ${n}`);
    for (const w of ctx.legacy.warnings) report.warn(w);
    report.info('None of these files were changed, moved or deleted.');
  }

  if (ctx.layered?.applied.length) {
    report.heading('Settings applied');
    for (const a of ctx.layered.applied) report.info(a);
  }
  if (ctx.layered?.bodiesApplied.length) {
    report.info(`${count(ctx.layered.bodiesApplied.length, 'request body')} taken from your example file(s):`);
    for (const b of ctx.layered.bodiesApplied) report.info(`  ${b.endpointKey}  <- ${b.from}`);
  }
  if (ctx.config?.warnings.length) {
    for (const w of ctx.config.warnings) report.warn(`${CONFIG_FILE}: ${w}`);
  }
  if (ctx.suspects?.length) {
    report.heading('Values under a credential-shaped name');
    reportSuspects(ctx.suspects, report);
  }
}

export function planCommand({ root, modelPath, json, project = null }) {
  const ctx = prepare({ root, modelPath, project });
  const report = new Report();

  if (ctx.configError) return reportConfigError(ctx.configError, report);
  if (ctx.selectionProblem) {
    for (const line of ctx.selectionProblem.problem.split('\n')) report.warn(line);
    return { exitCode: EXIT.AMBIGUOUS, report, result: { problem: ctx.selectionProblem.problem } };
  }
  if (ctx.selectionAmbiguous) return reportAmbiguous(ctx.selectionAmbiguous, report, { command: 'plan' });
  if (ctx.layeredProblems) return reportLayeredProblems(ctx.layeredProblems, report);
  if (ctx.leaks) return reportLeaks(ctx.leaks, report);

  if (ctx.exitCode === EXIT.AMBIGUOUS) {
    report.warn(`${ctx.placement.reason}. Pass --root <collection directory> to choose one:`);
    report.table(['format', 'name', 'path'], ctx.placement.ambiguous.map((c) => [c.format, c.name ?? '-', c.root]));
    return { exitCode: EXIT.AMBIGUOUS, report, result: { ambiguous: ctx.placement.ambiguous } };
  }

  const { collectionRoot, format, merge, model, repoRoot } = ctx;

  if (merge.refusal) {
    report.warn('Refusing to write.');
    for (const line of merge.refusal.split('\n')) report.info(line);
    return { exitCode: EXIT.ERROR, report, result: { refusal: merge.refusal } };
  }

  reportSettings(ctx, report);

  report.heading('Plan');
  report.facts([
    ['collection', relative(repoRoot, collectionRoot).split(sep).join('/') || '.'],
    ['format', format === 'yml' ? 'opencollection.yml' : '.bru'],
    ['chosen because', ctx.placement.reason],
    ['endpoints', String((model.endpoints ?? []).length)],
    ['lockfile', ctx.lock ? 'present' : 'none yet'],
  ]);
  if (ctx.placement.formatMismatch) {
    report.warn(
      `the collection on disk is ${ctx.placement.formatMismatch.onDisk} but the model asks for ` +
        `${ctx.placement.formatMismatch.inModel}; matching what is on disk`,
    );
  }

  report.heading('Files');
  report.table(
    ['action', 'file', 'why'],
    merge.decisions.map((d) => [MARK[d.status] ?? d.status, d.relPath, describe(d)]),
  );

  const unresolved = model.unresolved ?? [];
  if (unresolved.length) {
    report.heading('Unresolved required values');
    for (const u of unresolved) report.warn(`${u.endpointKey}  ${u.field}  ${u.reason}`);
  }

  report.heading('Summary');
  const parts = Object.entries(merge.summary).map(([k, v]) => `${v} ${MARK[k] ?? k}`);
  report.info(parts.join(', ') || 'nothing to do');
  if (isNoop(merge.decisions)) report.ok('Applying this plan would change nothing.');
  report.info('Nothing was written; this is a plan.');

  return {
    exitCode: unresolved.length ? EXIT.UNRESOLVED : EXIT.OK,
    report,
    result: { collectionRoot, format, decisions: merge.decisions, summary: merge.summary, unresolved },
  };
}

function applyPreparationProblem(ctx, report) {
  if (ctx.configError) return reportConfigError(ctx.configError, report);
  if (ctx.selectionProblem) {
    for (const line of ctx.selectionProblem.problem.split('\n')) report.warn(line);
    return { exitCode: EXIT.AMBIGUOUS, report, result: { problem: ctx.selectionProblem.problem } };
  }
  if (ctx.selectionAmbiguous) return reportAmbiguous(ctx.selectionAmbiguous, report, { command: 'apply' });
  if (ctx.layeredProblems) return reportLayeredProblems(ctx.layeredProblems, report);
  if (ctx.leaks) return reportLeaks(ctx.leaks, report);

  if (ctx.exitCode === EXIT.AMBIGUOUS) {
    report.warn(`${ctx.placement.reason}. Pass --root <collection directory> to choose one.`);
    return { exitCode: EXIT.AMBIGUOUS, report, result: { ambiguous: ctx.placement.ambiguous } };
  }

  if (ctx.merge.refusal) {
    report.warn('Refusing to write.');
    for (const line of ctx.merge.refusal.split('\n')) report.info(line);
    return { exitCode: EXIT.ERROR, report, result: { refusal: ctx.merge.refusal } };
  }
  return null;
}

function applyPrepared(ctx, { prune, reset, allowUnresolved, held = null }, report) {
  const { collectionRoot, format, merge, files, lock, model, repoRoot } = ctx;

  // Carried into the result as well as the report: --json never prints the report, so a takeover -
  // stealing another run's lock - was completely unreported in machine-readable mode. It comes from
  // the lock the caller HOLDS, not from ctx: the lock is acquired around prepare, not inside it.
  const tookOverLock = held?.tookOver
    ? { pid: held.tookOver.pid ?? null, host: held.tookOver.host ?? null, startedAt: held.tookOver.startedAt ?? null }
    : null;

  const outcome = applyPlan({
    collectionRoot,
    format,
    decisions: merge.decisions,
    planned: files,
    lock,
    libraries: libraryVersions(),
    generatorVersion: PLUGIN_VERSION,
    outputDir: relative(repoRoot, collectionRoot).split(sep).join('/') || '.',
    prune,
    reset,
  });

  reportSettings(ctx, report);

  report.heading('Apply');
  report.facts([
    ['collection', relative(repoRoot, collectionRoot).split(sep).join('/') || '.'],
    ['format', format === 'yml' ? 'opencollection.yml' : '.bru'],
  ]);

  if (outcome.errors.length) {
    for (const e of outcome.errors) report.warn(e);
    report.info('Nothing was written.');
    return { exitCode: EXIT.ERROR, report, result: outcome };
  }

  for (const d of merge.decisions) {
    const label = MARK[d.status] ?? d.status;
    if (d.status === STATUS.CREATE || d.status === STATUS.RESTORED) report.added(`${label.padEnd(9)} ${d.relPath}`);
    else if (d.status === STATUS.UPDATED || d.status === STATUS.SECRETS_ADDED) report.added(`${label.padEnd(9)} ${d.relPath}  (${describe(d)})`);
    else if (d.status === STATUS.KEPT) report.kept(`${label.padEnd(9)} ${d.relPath}  (${describe(d)})`);
    else if (d.status === STATUS.ORPHAN) report.warn(`${label.padEnd(9)} ${d.relPath}  (${describe(d)})`);
    else if (d.status === STATUS.MOVED) report.kept(`${label.padEnd(9)} ${d.relPath}  (${describe(d)})`);
    // Files the generator has never owned are reported too. Staying silent about them would make
    // the output look like a complete picture of the collection when it is not.
    else if (d.status === STATUS.UNMANAGED) report.kept(`${label.padEnd(9)} ${d.relPath}  (${describe(d)})`);
  }
  for (const p of outcome.pruned) report.removed(`pruned    ${p}`);

  report.heading('Summary');
  report.info(`${count(outcome.written.length, 'file')} written, lockfile ${outcome.lockStatus}`);
  if (outcome.written.length === 0) report.ok('Nothing changed on disk.');

  const unresolved = model.unresolved ?? [];
  if (unresolved.length) {
    report.warn(`${count(unresolved.length, 'required value')} still unresolved; see the plan output`);
  }

  const exitCode = unresolved.length && !allowUnresolved ? EXIT.UNRESOLVED : EXIT.OK;
  return {
    exitCode,
    report,
    result: { ...outcome, summary: merge.summary, unresolved, ...(tookOverLock ? { tookOverLock } : {}) },
  };
}

export function applyCommand({
  root,
  modelPath,
  json,
  prune = [],
  reset = [],
  allowUnresolved = false,
  project = null,
  onLockNotice = () => {},
}) {
  // Locate the actual collection first. Locking `root` is insufficient: the same collection can be
  // reached as either `<repo>` or `<repo>/bruno`, giving two different locks for the same files.
  // Re-prepare after acquisition so discovery and writes happen against one locked snapshot.
  const preview = prepare({ root, modelPath, project });
  const previewProblem = applyPreparationProblem(preview, new Report());
  if (previewProblem) return previewProblem;

  const held = acquire(preview.collectionRoot, { onNotice: onLockNotice });
  try {
    const ctx = prepare({ root, modelPath, project });
    const report = new Report();
    const problem = applyPreparationProblem(ctx, report);
    if (problem) return problem;
    if (lockFileFor(ctx.collectionRoot) !== held.path) {
      report.warn('The collection layout changed while apply was acquiring its lock. Run apply again.');
      return { exitCode: EXIT.ERROR, report, result: { reason: 'collection changed while locking' } };
    }
    return applyPrepared(ctx, { prune, reset, allowUnresolved, held }, report);
  } finally {
    held.release();
  }
}

export function adoptCommand({ root, json, onLockNotice = () => {} }) {
  const repoRoot = resolve(root);
  const report = new Report();
  const initial = selectCollection(findCollections(repoRoot));

  if (initial.ambiguous) {
    report.warn(`${initial.ambiguous.length} collections found. Pass --root <collection directory>.`);
    report.table(['format', 'name', 'path'], initial.ambiguous.map((c) => [c.format, c.name ?? '-', c.root]));
    return { exitCode: EXIT.AMBIGUOUS, report, result: { ambiguous: initial.ambiguous } };
  }
  if (!initial.collection) {
    report.info('No collection to adopt. Nothing was written.');
    return { exitCode: EXIT.NO_SURFACE, report, result: { adopted: [] } };
  }

  // Same as apply: the lock belongs to the collection, which is only known once it is selected, and
  // the selection is redone under the lock so a layout that changed while we waited cannot be
  // adopted against the wrong root.
  const held = acquire(initial.collection.root, { onNotice: onLockNotice });
  let collection;
  let outcome;
  try {
    const current = selectCollection(findCollections(repoRoot));
    collection = current.collection;
    if (!collection || current.ambiguous || lockFileFor(collection.root) !== held.path) {
      report.warn('The collection layout changed while adopt was waiting for its lock. Run adopt again.');
      return { exitCode: EXIT.ERROR, report, result: { reason: 'collection changed while waiting' } };
    }
    outcome = adoptCollection({
      collectionRoot: collection.root,
      format: collection.format,
      generatorVersion: PLUGIN_VERSION,
      libraries: libraryVersions(),
      outputDir: relative(repoRoot, collection.root).split(sep).join('/') || '.',
    });
  } finally {
    held.release();
  }

  // Same reason as apply: --json never prints the report, so without this a takeover was invisible
  // to anything reading the result.
  const tookOverLock = held.tookOver
    ? { pid: held.tookOver.pid ?? null, host: held.tookOver.host ?? null, startedAt: held.tookOver.startedAt ?? null }
    : null;
  if (tookOverLock) outcome.tookOverLock = tookOverLock;

  report.heading('Adopt');
  report.facts([
    ['collection', relative(repoRoot, collection.root).split(sep).join('/') || '.'],
    ['format', collection.format === 'yml' ? 'opencollection.yml' : '.bru'],
  ]);

  if (outcome.alreadyAdopted) {
    report.ok('Already adopted: a lockfile is present. Nothing was written.');
    return { exitCode: EXIT.OK, report, result: outcome };
  }

  report.info(`Recorded ${count(outcome.adopted.length, 'file')} as yours.`);
  for (const p of outcome.adopted) report.kept(`yours     ${p}`);
  if (outcome.variants?.length) {
    report.heading('Variants');
    report.info('These share an endpoint with another file. The lowest seq owns the endpoint;');
    report.info('the rest are yours permanently and are never overwritten.');
    for (const v of outcome.variants) report.kept(`variant   ${v}`);
  }
  report.heading('Summary');
  report.ok('The next apply will add only what is missing and change nothing you wrote.');

  return { exitCode: EXIT.OK, report, result: outcome };
}

// ---------------------------------------------------------------------------------------------
// smoke - the only command that sends real traffic
// ---------------------------------------------------------------------------------------------

export function smokeCommand({ root, env = null, yes = false, excludeTags = null, tags = [], bail = false, vars = [], json }) {
  const repoRoot = resolve(root);
  const report = new Report();
  const { collection, ambiguous } = selectCollection(findCollections(repoRoot));

  if (ambiguous) {
    report.warn(`${ambiguous.length} collections found. Pass --root <collection directory>.`);
    report.table(['format', 'name', 'path'], ambiguous.map((c) => [c.format, c.name ?? '-', c.root]));
    return { exitCode: EXIT.AMBIGUOUS, report, result: { ambiguous } };
  }
  if (!collection) {
    report.warn('No collection here to run. Generate one first with plan and apply.');
    return { exitCode: EXIT.NO_SURFACE, report, result: {} };
  }

  const requestCount = readRequests(collection.root, collection.format).length;

  const outcome = smoke({
    collectionRoot: collection.root,
    env,
    confirmed: yes,
    excludeTags: excludeTags ?? ['destructive'],
    tags,
    bail,
    vars,
    requestCount,
  });

  report.heading('Smoke');
  report.facts([
    ['collection', relative(repoRoot, collection.root).split(sep).join('/') || '.'],
    ['format', collection.format === 'yml' ? 'opencollection.yml' : '.bru'],
    ['requests', requestCount === null ? 'unknown' : String(requestCount)],
  ]);

  switch (outcome.reason) {
    case 'no-env':
      report.warn('`smoke` needs --env <name>: a request without a base URL has nowhere to go.');
      if (outcome.available.length) report.info(`Environments in this collection: ${outcome.available.join(', ')}`);
      return { exitCode: EXIT.ERROR, report, result: outcome };

    case 'unknown-env':
      report.warn(`No environment named "${outcome.env}" in this collection.`);
      report.info(`Available: ${outcome.available.join(', ')}`);
      return { exitCode: EXIT.ERROR, report, result: outcome };

    case 'bad-var':
      report.warn('--var must be name=value; the supplied value is not repeated here.');
      report.info('Nothing was sent.');
      return { exitCode: EXIT.ERROR, report, result: outcome };

    case 'bad-tag':
      report.warn('--tags/--exclude-tags must be letters, digits, dot, dash or underscore.');
      return { exitCode: EXIT.ERROR, report, result: outcome };

    case 'no-cli':
      report.warn('Bruno\'s CLI is not on PATH, and it is what runs the collection.');
      report.info(`Install it with:  ${outcome.hint}`);
      report.info('Nothing was sent.');
      return { exitCode: EXIT.ERROR, report, result: outcome };

    case 'needs-consent':
      report.heading('This would send real requests');
      report.facts([
        ['environment', outcome.env],
        ['bruno CLI', outcome.version],
        ['requests', requestCount === null ? 'unknown' : String(requestCount)],
        ['working directory', outcome.cwd],
      ]);
      report.info(outcome.command);
      report.info('');
      report.info('Requests tagged destructive are excluded. Response headers and bodies are never');
      report.info('written to the report. Collection scripts run only in Bruno\'s safe sandbox.');
      report.info('Re-run with --yes to go ahead.');
      report.warn('Nothing was sent.');
      return { exitCode: EXIT.ERROR, report, result: outcome };

    default:
      break;
  }

  report.facts([['environment', outcome.env], ['bruno CLI', outcome.version]]);
  report.heading('Requests');
  if (outcome.results.length) {
    report.table(
      ['result', 'method', 'status', 'request', 'note'],
      outcome.results.map((r) => [
        r.outcome === 'ok' ? 'ok' : r.outcome === 'reached' ? 'reached' : 'fail',
        r.method ?? '-',
        r.status === null ? '-' : String(r.status),
        r.url,
        r.error ??
          (r.failedAssertions
            ? `${r.failedAssertions}/${r.assertions} assertion(s) failed`
            : r.outcome === 'reached'
              ? 'sent and answered, but with a client error'
              : ''),
      ]),
    );
  } else {
    report.warn('No request results came back.');
    if (outcome.reporterMissing) report.info('The reporter file was not written, so the run did not get that far.');
    if (outcome.parseError) report.info(`The reporter file could not be parsed: ${outcome.parseError}`);
    if (outcome.spawnError) report.warn(`Bruno's CLI could not be run: ${outcome.spawnError}`);
    if (outcome.stderr) for (const line of outcome.stderr.split('\n')) report.info(line);
  }

  report.heading('Summary');
  if (outcome.timedOut) report.warn('The run hit the five-minute limit and was stopped.');
  if (outcome.ok) {
    report.ok(`${count(outcome.attempted, 'request')} attempted, none failed.`);
    if (outcome.reached) {
      report.warn(
        `${outcome.reached} of them came back 4xx: the request reached the server and was rejected. ` +
          'That still proves the request was built, resolved and sent - usually it means no key was supplied.',
      );
    }
  } else {
    report.warn(`${outcome.failed} of ${outcome.attempted} request(s) failed.`);
    report.info('A failure is: nothing sent, an assertion failed, or the server returned 5xx.');
  }

  return { exitCode: outcome.ok ? EXIT.OK : EXIT.ERROR, report, result: outcome };
}

// ---------------------------------------------------------------------------------------------
// probe and ingest (Phase 3)
// ---------------------------------------------------------------------------------------------

export function probeCommand({ root, json, out = null, project: requested = null }) {
  const repoRoot = resolve(root);
  const report = new Report();

  const config = loadConfig(repoRoot);
  if (config.problems.length) return reportConfigError(config, report);

  const result = probe(repoRoot);
  const legacy = detectLegacy(repoRoot);
  const projects = enumerateProjects(result, config);
  const selection = selectProject(projects, { requested, config });
  result.projects = projects;
  result.selected = selection.project ? { name: selection.project.name, path: selection.project.path, rule: selection.rule } : null;
  // warnings included: a dropped legacy environment is reported in the text output, and --json is
  // meant to carry the same facts rather than a quieter subset of them.
  result.legacy = { present: legacy.present, found: legacy.found, notes: legacy.notes, warnings: legacy.warnings };

  report.heading('Probe');
  report.facts([
    ['repository', repoRoot],
    ['collections', String(result.summary.collections)],
    ['candidates', String(result.summary.candidates)],
    ['projects', String(projects.length)],
    ['scan digest', result.scanDigest.slice(0, 23)],
  ]);

  if (config.present) {
    report.info(`${CONFIG_FILE} was read.`);
    for (const w of config.warnings) report.warn(`${CONFIG_FILE}: ${w}`);
  }

  if (result.collections.length) {
    report.heading('Existing collection');
    report.table(['format', 'name', 'path'], result.collections.map((c) => [c.format, c.name ?? '-', c.root]));
    report.info('This is the output target and the inventory, never a candidate to choose between.');
  }

  if (result.candidates.length) {
    report.heading('Candidates');
    report.table(
      ['score', 'kind', 'endpoints', 'path', 'why'],
      result.candidates.map((c) => [
        c.score, c.kind, c.endpointCount ?? '-', c.path, (c.reasons ?? []).join('; '),
      ]),
    );
  } else if (result.capability.length) {
    // Something WAS found, it just cannot be used - a Swagger 2.0 spec, an Insomnia export. Saying
    // "nothing found" here and then listing it under "Not supported" two sections later contradicted
    // itself, and buried the one actionable fact.
    report.warn('Nothing usable found. What was found is listed under "Not supported" below.');
  } else {
    report.warn('No API description and no recognised project found.');
  }

  const named = result.skipped.filter((s) => s.named);
  if (named.length) {
    report.heading('Skipped');
    for (const s of named) report.warn(`${s.path}  ${s.reason}${s.detail ? ` (${s.detail})` : ''}`);
  }
  const quiet = result.skipped.length - named.length;
  if (quiet > 0) report.info(`${quiet} other file(s) were not API descriptions and were skipped quietly.`);

  if (projects.length > 1 || selection.ambiguous) {
    report.heading('Projects');
    report.table(['score', 'project', 'path', 'describes', 'endpoints', 'why'], catalogueRows(projects));
  }
  if (selection.project) {
    report.ok(`Project: ${selection.project.name} (${selection.project.path}) - ${selection.rule}`);
  }

  if (legacy.present) {
    report.heading('Legacy configuration found');
    for (const f of legacy.found) report.info(`${f.path}${f.files ? ` (${f.files.length} file(s))` : ''}`);
    // No path to docs/: that directory is not part of the installed plugin, so naming it sent the
    // user looking for a file that does not exist on their machine.
    report.info('These are read as settings and never modified. Run `adopt` before the first `apply`.');
  }

  if (result.notices?.length) {
    report.heading('Incomplete');
    for (const n of result.notices) report.warn(n);
  }

  if (result.capability.length) {
    report.heading('Not supported');
    for (const c of result.capability) report.warn(`${c.subject}: ${c.reason}`);
  }

  if (out) {
    const target = resolve(out);
    writeFileAtomic(target, `${JSON.stringify(result, null, 2)}\n`);
    report.heading('Written');
    report.ok(target);
  }

  // Exit 3 rather than 2 when a surface exists but none of it is supported - a Functions app of
  // pure timers, or a GraphQL-only service, is not an empty repository, and telling the user it is
  // would send them looking for a problem that is not there.
  const nothingAtAll = result.candidates.length === 0 && result.collections.length === 0;

  // 5 outranks 3 and 2: "which of these?" has to be settled before "is any of it supported?" can
  // even be answered, and answering it needs the user.
  const exitCode = selection.ambiguous
    ? EXIT.AMBIGUOUS
    : result.surfaceButUnsupported
      ? EXIT.UNSUPPORTED
      : nothingAtAll
        ? EXIT.NO_SURFACE
        : EXIT.OK;

  if (selection.ambiguous) {
    report.heading('Which project?');
    report.info(`${selection.reason}, so this cannot continue unattended.`);
    report.info('Ask which one is wanted, then pass --project <name> to ingest, plan and apply.');
    report.info(`To settle it permanently, list projects[] in ${CONFIG_FILE}.`);
    result.ambiguous = selection.ambiguous.map((p) => ({ name: p.name, path: p.path, score: p.score }));
  } else if (result.surfaceButUnsupported) {
    report.heading('Nothing supported here');
    report.info('A project was found, but no HTTP surface this skill can generate from.');
    report.info('Everything it did find is listed under "Not supported" above.');
  }

  return { exitCode, report, result };
}

export async function ingestCommand({ root, specPath, out, format = null, collectionName = null, outputDir = null, json, project: requested = null }) {
  const repoRoot = resolve(root);
  const report = new Report();

  const config = loadConfig(repoRoot);
  if (config.problems.length) return reportConfigError(config, report);
  const legacy = detectLegacy(repoRoot);

  // Choose the spec: the one given, or the one belonging to the chosen project. Never simply the
  // highest-scoring file in the repository - in a catalogue of a dozen specs that picks one at
  // random from the user's point of view, and the output gives no hint which.
  let chosen = specPath ? resolve(specPath) : null;
  let via = 'the --spec you gave';
  let selected = null;

  if (!chosen) {
    const p = probe(repoRoot);
    const projects = enumerateProjects(p, config);
    const selection = selectProject(projects, { requested, config });

    if (selection.problem) {
      for (const line of selection.problem.split('\n')) report.warn(line);
      return { exitCode: EXIT.AMBIGUOUS, report, result: { problem: selection.problem } };
    }
    if (selection.ambiguous) return reportAmbiguous(selection, report, { command: 'ingest' });

    selected = selection.project;
    const best = selected?.best;
    // `declared-missing` means bruno-gen.json names a spec that probe could not use. Say that, rather
    // than the generic "nothing found" - the user configured a path and deserves to hear about it.
    if (best?.kind === 'declared-missing') {
      report.warn(`${CONFIG_FILE} points at "${best.path}", but no usable API description is there.`);
      report.info('Check the path, or that the file is OpenAPI 3.x rather than Swagger 2.0.');
      report.info('Run `probe` to see what was looked for, or pass --spec <file>.');
      return { exitCode: EXIT.ERROR, report, result: { declaredSpecMissing: best.path } };
    }
    if (!best || best.kind === 'built-artifact') {
      report.warn('No OpenAPI, Postman or WSDL description found to ingest.');
      if (selected?.hasHttp) {
        report.info(`${selected.name} has an HTTP surface in its source, so read the code instead:`);
        report.info('build the api-model.json yourself using the card for the stack, then plan and apply.');
      }
      report.info('Run `probe` to see what was looked for, or pass --spec <file>.');
      return { exitCode: EXIT.NO_SURFACE, report, result: { probe: p, project: selected?.name ?? null } };
    }
    chosen = join(repoRoot, best.path);
    via = `project "${selected.name}" (${selection.rule}); ${best.kind} scoring ${best.score}`;
  }

  const spec = readSpec(chosen);
  if (!spec.ok) {
    report.warn(`Cannot use ${chosen}: ${spec.skip}${spec.detail ? ` (${spec.detail})` : ''}`);
    const code = spec.skip === SKIP.SWAGGER2 || spec.skip === SKIP.INSOMNIA ? EXIT.UNSUPPORTED : EXIT.ERROR;
    return { exitCode: code, report, result: { skip: spec.skip, detail: spec.detail ?? null } };
  }

  // Bruno's own defaults, used only when neither a flag nor the config says otherwise.
  const effectiveFormat = format ?? 'yml';
  const opts = { collectionName, format: effectiveFormat, outputDir: outputDir ?? 'bruno' };
  const ingested =
    spec.kind === KIND.OPENAPI
      ? ingestOpenApi(spec.data, opts)
      : await ingestViaConverter(spec.kind, spec.data, opts);
  const { warnings, unresolved } = ingested;

  // Config and the legacy sidecars over what the spec says, but never over an explicit flag: the
  // command line is the most deliberate statement of intent available.
  //
  // Enforced for all three flags now. `--format` and `--output-dir` used to lose to bruno-gen.json
  // because they defaulted before they got here, so "the user typed it" and "nobody said" looked
  // identical - and the report then printed the flag while the model recorded the config value.
  const settings = layerLegacy(settingsFor(config, selected), legacy);
  if (collectionName) settings.name = undefined;
  if (format) settings.format = undefined;
  if (outputDir) settings.outputDir = undefined;
  const layered = layerSettings(ingested.model, settings, legacy);
  const model = layered.model;

  // The base URL is the one value without which nothing is sendable, and it was the one value the
  // contract did not cover: a spec with no servers[] produced baseUrl '' and still exited 0, so
  // every emitted request was `{{baseUrl}}/...` against nothing. Reported per environment, after
  // config has had its say - config supplying the host is the normal fix.
  // The reason has to match what actually happened. A relative or scheme-less `servers[]` entry
  // (`- url: /api/v3`, which public Petstore ships) yields a route prefix but no origin, so saying
  // "the description declared no server" was untrue in exactly the case a user would be checking.
  const declaredServer = spec.kind === KIND.OPENAPI && Array.isArray(spec.data?.servers) && spec.data.servers.length > 0;
  for (const env of model.collection.environments ?? []) {
    if (!String(env.vars?.[model.collection.baseUrlVar] ?? '').trim()) {
      unresolved.push({
        endpointKey: `environment:${env.name}`,
        field: model.collection.baseUrlVar,
        reason: declaredServer
          ? 'no base URL: the declared server has no host (a relative url), so the origin must be supplied'
          : 'no base URL: the description declared no server, and nothing supplied one',
      });
    }
  }

  const check = validateModel(model);
  if (!check.ok) {
    report.warn('The model built from this spec does not satisfy the IR schema:');
    for (const p of check.problems) report.warn(`  ${p}`);
    return { exitCode: EXIT.ERROR, report, result: { problems: check.problems } };
  }

  // Caught here as well as in `prepare`, so a credential in the settings is named while the user is
  // still looking at the command that read them, not two commands later.
  const audit = auditModel(model, { placeholders: config.placeholders });
  const leaks = audit.filter((f) => f.matchedBy === 'shape');
  if (leaks.length) return reportLeaks(leaks, report);
  const suspects = audit.filter((f) => f.matchedBy !== 'shape');

  reportSettings({ project: selected, projectRule: via, legacy, layered, config, suspects }, report);

  report.heading('Ingest');
  report.facts([
    ['spec', chosen],
    ['kind', spec.kind],
    ['chosen via', via],
    ['collection', model.collection.name],
    // From the model, not from the flag. Printing the flag while the model recorded something else
    // made the report actively misleading about what plan and apply would go on to write.
    ['format', model.collection.format === 'yml' ? 'opencollection.yml' : '.bru'],
    ['route prefix', model.collection.routePrefix || '(host root)'],
    ['endpoints', String(model.endpoints.length)],
    ['folders', String(model.folders.length)],
    ['auth', model.collection.auth?.mode ?? 'none'],
  ]);

  // VP-3: every value carries a provenance, and the report counts them.
  const bySource = {};
  for (const ep of model.endpoints) {
    for (const p of ep.params ?? []) bySource[p.source ?? 'unknown'] = (bySource[p.source ?? 'unknown'] ?? 0) + 1;
    if (ep.body?.kind !== 'none') bySource[`body:${ep.body.source}`] = (bySource[`body:${ep.body.source}`] ?? 0) + 1;
  }
  report.heading('Where the values came from');
  report.facts(Object.entries(bySource).sort(([a], [b]) => byCodepoint(a, b)).map(([k, v]) => [k, String(v)]));

  if (unresolved.length) {
    report.heading('Unresolved required values');
    report.info('Required inputs the spec did not supply. Fill them in, or apply and edit after.');
    for (const u of unresolved) report.warn(`${u.endpointKey}  ${u.field}`);
  }
  if (warnings.length) {
    report.heading('Warnings');
    for (const w of warnings) report.warn(w);
  }

  // Capability entries were rendered only by `probe`, so anything ingest declined to write - an
  // external $ref, a cookie parameter - was recorded in the model and never shown to anyone.
  if (ingested.capability?.length) {
    report.heading('Not supported');
    for (const c of ingested.capability) {
      report.warn(`${c.subject}: ${c.reason}`);
      if (c.paths?.length) report.info(`  ${c.paths.join(', ')}`);
    }
  }

  const target = resolve(out);
  writeFileAtomic(target, `${JSON.stringify(model, null, 2)}\n`);
  report.heading('Written');
  report.ok(`${target}  (pass it to \`plan --model\`)`);

  return {
    exitCode: unresolved.length ? EXIT.UNRESOLVED : EXIT.OK,
    report,
    result: { modelPath: target, endpoints: model.endpoints.length, unresolved, warnings, valueSources: bySource },
  };
}
