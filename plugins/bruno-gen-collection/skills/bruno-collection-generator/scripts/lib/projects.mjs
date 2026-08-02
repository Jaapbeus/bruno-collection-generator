import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { byCodepoint } from './paths.mjs';
// Which API in this repository?
//
// One repository often holds several. A monorepo has a package per service; a .NET solution has a
// Functions app beside a worker; an API catalogue holds a dozen specs and no code at all. Picking
// the first thing found is the failure mode this module exists to prevent: it produces a collection
// for the wrong service, and the user has no way to tell, because the output looks entirely normal.
//
// So the rule is: exactly one plausible project runs unattended; several must be chosen between,
// either by the user answering, or by `projects[]` in bruno-gen.json, or not at all (exit 5).

const norm = (p) => String(p ?? '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '') || '.';
const lower = (s) => String(s ?? '').toLowerCase();

const SPEC_KINDS = new Set(['openapi', 'postman', 'wsdl', 'built-artifact']);

// A built artefact is not a description. It is a best-effort value source - usually gitignored, often
// stale - and it must never be what makes a directory look like an API.
//
// Found the hard way on a real repository: every .NET test project has a bin/**/functions.metadata,
// so counting artefacts as descriptions made `tests/Foo.Tests` a plausible second API and turned a
// perfectly unambiguous repository into exit 5.
const DESCRIPTION_KINDS = new Set(['openapi', 'postman', 'wsdl']);

export const RULE = {
  CONFIG_SINGLE: 'bruno-gen.json projects[] declares exactly one project',
  CONFIG_MATCH: '--project matched a bruno-gen.json projects[] entry',
  REQUESTED: '--project matched a project found in the repository',
  ONLY_ONE: 'exactly one project in this repository looks like an API',
};

/** Is `dir` at or inside `ancestor`? Both already normalised. */
function within(dir, ancestor) {
  if (ancestor === '.') return true;
  return dir === ancestor || dir.startsWith(`${ancestor}/`);
}

const dirOf = (filePath) => {
  const p = norm(filePath);
  return p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '.';
};

/**
 * Group what probe found into projects.
 *
 * When `bruno-gen.json` declares `projects[]`, that mapping wins outright: the declared entries are
 * the only projects, and anything else probe found is attached to whichever one contains it. That is
 * the point of declaring them - a repository whose layout confuses the heuristics should be
 * settleable once, in a committed file, rather than answered again on every run.
 */
export function enumerateProjects(probeResult, config = { projects: undefined }) {
  const found = probeResult.candidates ?? [];
  const sourceRoots = found.filter((c) => c.kind === 'source-root').map((c) => ({ ...c, path: norm(c.path) }));
  const specs = found.filter((c) => SPEC_KINDS.has(c.kind)).map((c) => ({ ...c, path: norm(c.path) }));

  const declared = config.projects;
  const projects = [];

  if (declared?.length) {
    for (const d of declared) {
      const path = norm(d.path);
      // Case-insensitively, like config's own dedupe and `--project` matching. Comparing exactly
      // meant declaring `path: "src/api"` for a root discovered as `src/Api` produced a project with
      // no stacks, no hasHttp and an empty catalogue row - on the platforms where those are one
      // directory.
      const root = sourceRoots.find((s) => s.path === path)
        ?? sourceRoots.find((s) => s.path.toLowerCase() === path.toLowerCase());
      projects.push(base({
        name: d.name,
        path,
        output: d.output,
        declared: true,
        spec: d.spec ? norm(d.spec) : undefined,
        root,
        reasons: ['declared in bruno-gen.json'],
        // The validated config entry, carried whole. Only `name`, `path` and `output` used to
        // survive this hop, so `environments`, `headers`, `auth`, `format` and `base_path` were
        // validated and then silently dropped - in a monorepo that pointed the generated collection
        // at the top-level environment's host instead of the project's own.
        settings: d,
      }));
    }
  } else {
    for (const root of sourceRoots) {
      projects.push(base({
        name: root.apiName ?? root.path,
        path: root.path,
        declared: false,
        root,
        reasons: root.reasons ?? [],
      }));
    }
  }

  // Attach each description to the project that owns it: the deepest one containing it.
  const orphanSpecs = [];
  for (const spec of specs) {
    const dir = dirOf(spec.path);
    const owners = projects
      .filter((p) => within(dir, p.path))
      .sort((a, b) => b.path.length - a.path.length);

    if (owners.length) {
      owners[0].specs.push(spec);
      continue;
    }
    // A spec outside every project. With exactly one project it plainly belongs to it; with
    // several it is genuinely unattributable and becomes a project of its own, so the ambiguity
    // is visible in the catalogue instead of being resolved by a guess.
    if (projects.length === 1) projects[0].specs.push(spec);
    else orphanSpecs.push(spec);
  }

  if (!declared?.length) {
    const byDir = new Map();
    for (const spec of orphanSpecs) {
      const dir = dirOf(spec.path);
      if (!byDir.has(dir)) byDir.set(dir, []);
      byDir.get(dir).push(spec);
    }
    for (const [dir, group] of byDir) {
      projects.push(base({
        name: group[0].apiName ?? dir,
        path: dir,
        declared: false,
        reasons: ['API description with no project of its own'],
        specs: group,
      }));
    }
  }

  for (const p of projects) finish(p, probeResult.root);

  // Highest first, then by path so the catalogue is stable run to run.
  projects.sort((a, b) => b.score - a.score || byCodepoint(a.path, b.path));
  return projects;
}

function base({ name, path, output, declared, spec, root, reasons, specs = [], settings = null }) {
  return {
    name: name || path,
    path,
    output,
    settings,
    declaredSpec: spec,
    declared: Boolean(declared),
    stacks: root?.stacks ?? [],
    frameworks: root?.frameworks ?? [],
    hasHttp: root?.hasHttp ?? null,
    specs,
    reasons: [...reasons],
    score: 0,
    best: null,
    endpointCount: null,
    apiLikely: false,
  };
}

function finish(p, repoRoot) {
  // Whether a CONFIGURED spec path actually points at a file. probe deliberately does not enumerate
  // everything (built output, anything inside an existing collection), so "probe did not list it" and
  // "it is not there" are different answers and only the second is an error.
  p.specExists = Boolean(p.declaredSpec && repoRoot && existsSync(join(repoRoot, p.declaredSpec)));
  p.specs.sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || byCodepoint(a.path, b.path));

  const descriptions = p.specs.filter((s) => DESCRIPTION_KINDS.has(s.kind));
  p.artifacts = p.specs.filter((s) => !DESCRIPTION_KINDS.has(s.kind));

  // An explicitly configured spec wins over anything scoring found it, including a higher score.
  // A declared spec that probe did not find is NOT invented as a valid OpenAPI candidate. Doing that
  // made probe report an OpenAPI description for a path that does not exist - or for a Swagger 2.0
  // file it had already rejected - and the failure only surfaced two commands later, as
  // "not valid JSON or YAML (ENOENT...)". `kind: 'declared-missing'` keeps the configured path
  // visible while letting the caller say what is actually wrong with it.
  // A declared spec probe did not enumerate is not automatically wrong: probe skips built output,
  // anything inside an existing collection, and files whose extension it does not walk. So trust the
  // configured path when the FILE EXISTS - readSpec will report the real problem if there is one -
  // and only call it missing when there is nothing there at all. Matching by exact string alone and
  // hard-failing turned several perfectly usable configurations into exit 1.
  p.best = p.declaredSpec
    ? p.specs.find((s) => s.path === p.declaredSpec)
      ?? (p.specExists
        ? { kind: 'openapi', path: p.declaredSpec, score: 100, reasons: ['configured in bruno-gen.json'] }
        : {
            kind: 'declared-missing',
            path: p.declaredSpec,
            score: 0,
            reasons: [`configured in bruno-gen.json, but there is no file at ${p.declaredSpec}`],
          })
    : descriptions[0] ?? null;

  p.endpointCount = p.best?.endpointCount ?? null;

  // A description is worth more than inferring from source, and a declared project outranks a
  // guessed one. Source with no HTTP surface scores negative so it cannot win by existing.
  p.score =
    (p.declared ? 40 : 0) +
    (p.best ? 40 : 0) +
    (p.hasHttp === true ? 25 : p.hasHttp === false ? -35 : 0) -
    p.path.split('/').length;

  if (p.best) p.reasons.push(`${p.best.kind}: ${p.best.path}`);
  if (p.hasHttp === false) p.reasons.push('no HTTP surface in the source');
  if (!p.best && p.artifacts.length) {
    p.reasons.push(`${p.artifacts.length} built artefact(s), which describe nothing on their own`);
  }

  // "Could this produce a collection at all?" - a declared project is taken at its word, because
  // the user saying so outranks our detection failing to see it. A built artefact deliberately does
  // not count: see DESCRIPTION_KINDS.
  p.apiLikely = p.declared || Boolean(p.best) || p.hasHttp === true;
}

/**
 * Choose one project, or report that it cannot be chosen without an answer.
 *
 * Returns exactly one of:
 *   {project, rule}           - go ahead
 *   {ambiguous: [...], ...}   - the caller asks the user, or exits 5 when it cannot
 *   {none: true}              - nothing here looks like an API
 *   {problem}                 - `--project` named something that does not exist
 */
export function selectProject(projects, { requested = null, config = {} } = {}) {
  if (requested) {
    const want = lower(requested);
    const wantPath = norm(requested).toLowerCase();
    const hit =
      projects.find((p) => lower(p.name) === want) ??
      projects.find((p) => p.path.toLowerCase() === wantPath);
    if (!hit) {
      return {
        problem:
          `No project matches --project "${requested}". Known projects:\n` +
          projects.map((p) => `  ${p.name}  (${p.path})`).join('\n'),
        catalogue: projects,
      };
    }
    return { project: hit, rule: hit.declared ? RULE.CONFIG_MATCH : RULE.REQUESTED };
  }

  // A single declared project is unambiguous even if the repository holds other code: declaring
  // one is how the user says "this is the API here".
  const declared = projects.filter((p) => p.declared);
  if (declared.length === 1) return { project: declared[0], rule: RULE.CONFIG_SINGLE };
  if (declared.length > 1) return { ambiguous: declared, reason: `${declared.length} projects declared in bruno-gen.json` };

  const plausible = projects.filter((p) => p.apiLikely);
  if (plausible.length === 1) return { project: plausible[0], rule: RULE.ONLY_ONE };
  if (plausible.length === 0) return { none: true, catalogue: projects };
  return { ambiguous: plausible, reason: `${plausible.length} projects in this repository look like APIs` };
}

/** Rows for the catalogue table, in the order the report prints them. */
export function catalogueRows(projects) {
  return projects.map((p) => [
    String(p.score),
    p.name,
    p.path,
    p.best ? p.best.kind : p.hasHttp === true ? (p.frameworks?.join(', ') || 'source') : p.artifacts?.length ? 'artefact only' : '-',
    p.endpointCount === null || p.endpointCount === undefined ? '-' : String(p.endpointCount),
    p.reasons.join('; '),
  ]);
}
