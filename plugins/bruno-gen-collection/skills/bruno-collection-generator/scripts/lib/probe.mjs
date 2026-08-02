// `probe` - deterministic, read-only reconnaissance. No model involved.
//
// It answers "what could this repository's API be described by, and which candidate should win",
// so the model does not have to guess and a steady-state run can skip reading source entirely.

import { createHash } from 'node:crypto';
import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import { join, relative, sep, basename, extname } from 'node:path';
import { walkDirs, findCollections } from './format.mjs';
import { readSpec, looksLikeSpecName, KIND, SKIP } from './spec-parse.mjs';
import { surfaceSignals, PROJECT_MARKERS } from './signals.mjs';
import { byCodepoint } from './paths.mjs';

const SPEC_EXT = new Set(['.json', '.yaml', '.yml', '.wsdl']);
const MAX_DIGEST_BYTES = 8 * 1024 * 1024;

// Built artefacts are normally excluded, but a few are byte-exact endpoint truth and worth
// reading when nothing better exists. Best-effort only: they are usually gitignored, so nothing
// may depend on them.
const BUILT_ALLOW = [/[\\/]functions\.metadata$/i, /obj[\\/].*openapi.*\.json$/i, /obj[\\/].*ApiDescription.*\.json$/i];

const rel = (root, p) => relative(root, p).split(sep).join('/');
const sha256File = (path) => {
  try {
    if (statSync(path).size > MAX_DIGEST_BYTES) return null;
    return createHash('sha256').update(readFileSync(path)).digest('hex');
  } catch {
    // Probe is a bounded snapshot of a potentially active build tree. A file disappearing between
    // discovery and hashing should make that file absent from the snapshot, not crash the command.
    return null;
  }
};

/**
 * Stacks probe can NAME but this version does not read source for.
 *
 * Without this a FastAPI or Spring repository is told it has no API at all, because CODE_EXT covers
 * only .cs/.js/.ts - so 0 files are scanned and `hasHttp` is false. A named boundary is useful; "no
 * API here" is wrong. Wording mirrors reference/sources/_unsupported.md.
 */
const UNSUPPORTED_STACKS = new Map([
  ['python', 'Python source is not read in this version; FastAPI (`app.openapi()`) or drf-spectacular can emit an OpenAPI document, which is read in one step'],
  ['go', 'Go source is not read in this version; `swag init` can emit an OpenAPI document, which is read in one step'],
  ['java', 'Java/Kotlin source is not read in this version; springdoc can emit an OpenAPI document, which is read in one step'],
]);

/** Directory names that mark a first-party source root, used for scoring. */
const FIRST_PARTY = new Set(['', 'src', 'api', 'contracts', 'openapi', 'spec', 'specs', 'docs', 'apim']);
// Matched per PATH SEGMENT, not as a substring, and `packages` is not in it. As a substring this
// docked any path merely CONTAINING one of these words, and `packages/` is the canonical npm/pnpm
// workspace directory - so a monorepo's own `packages/api/openapi.yaml` lost 40 points and the
// first-party bonus, letting a genuinely vendored spec elsewhere win.
const THIRD_PARTY_SEGMENTS = new Set(['third-party', 'third_party', 'thirdparty', 'vendor', 'external', 'node_modules']);
const looksThirdParty = (relPath) =>
  relPath.split('/').some((seg) => THIRD_PARTY_SEGMENTS.has(seg.toLowerCase()));

export function probe(repoRoot, { maxDepth = 8 } = {}) {
  const candidates = [];
  const skipped = [];
  const capability = [];
  const digestParts = [];
  // Things that make an answer incomplete rather than unsupported. Kept separate from `capability`,
  // which means "found it, cannot generate it".
  const notices = [];

  // ---- existing collections: the output target, never a competing candidate ----------
  const collections = findCollections(repoRoot, { maxDepth }).map((c) => ({
    root: rel(repoRoot, c.root) || '.',
    format: c.format,
    name: c.name,
  }));

  // ---- spec and collection files ------------------------------------------------------
  for (const dir of walkDirs(repoRoot, { maxDepth })) {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    entries.sort((a, b) => byCodepoint(a.name, b.name));
    for (const e of entries) {
      if (!e.isFile()) continue;
      const ext = extname(e.name).toLowerCase();
      if (!SPEC_EXT.has(ext)) continue;

      const abs = join(dir, e.name);
      const relPath = rel(repoRoot, abs);

      // Skip files that belong to a Bruno collection: they are output, not input.
      if (collections.some((c) => c.root !== '.' && relPath.startsWith(`${c.root}/`))) continue;
      if (/(^|\/)(package|package-lock|tsconfig|bruno|opencollection|bruno-gen|SBOM)\.json$/i.test(relPath)) continue;

      const result = readSpec(abs);

      if (!result.ok) {
        // Only name a skip when the file looked like it was meant to be a spec. Otherwise every
        // .vscode/settings.json and appsettings.json produces a correct but useless warning -
        // 13 of them in one real repository.
        const named = looksLikeSpecName(abs) || result.skip === SKIP.SWAGGER2;
        skipped.push({ path: relPath, reason: result.skip, detail: result.detail ?? null, named });
        if (result.skip === SKIP.SWAGGER2) {
          capability.push({
            subject: 'swagger-2.0',
            supported: false,
            reason: 'Swagger 2.0 input is not supported yet; convert the spec to OpenAPI 3.x first',
            paths: [relPath],
          });
        }
        if (result.skip === SKIP.INSOMNIA) {
          capability.push({
            subject: 'insomnia',
            supported: false,
            reason: 'Insomnia export import is not supported yet',
            paths: [relPath],
          });
        }
        continue;
      }

      const kind =
        result.kind === KIND.OPENAPI ? 'openapi' : result.kind === KIND.POSTMAN ? 'postman' : 'wsdl';
      candidates.push({
        kind,
        path: relPath,
        apiName: result.title ?? basename(abs, ext),
        endpointCount: result.operationCount ?? result.pathCount ?? 0,
        syntax: result.syntax,
        ...score(relPath, result, repoRoot),
      });
      // The CONTENT, not the size: a field printed as a digest that does not move when the
      // description changes is worse than no field. sha256File returns null for a file that vanished
      // between the readdir and the read, which is routine under obj/ during a build.
      const digest = sha256File(abs);
      if (digest) digestParts.push(`description:${relPath}:${digest}`);
    }
  }

  // ---- built artefacts, best-effort --------------------------------------------------
  for (const dir of walkDirs(repoRoot, { maxDepth: 4 })) {
    // walkDirs skips obj/ and bin/, so reach into them explicitly for the allow-listed artefacts.
    for (const excluded of ['obj', 'bin']) {
      const candidate = join(dir, excluded);
      if (!existsSync(candidate)) continue;
      for (const found of findAllowedBuiltFiles(candidate)) {
        candidates.push({
          kind: 'built-artifact',
          path: rel(repoRoot, found),
          apiName: basename(found),
          endpointCount: 0,
          score: 10,
          reasons: ['built artefact (best-effort; usually gitignored)'],
        });
        // Built metadata is bounded in practice. Avoid reading an unexpectedly huge artefact while
        // still making ordinary changes visible in the advertised content digest.
        try {
          const size = statSync(found).size;
          const digest = size <= 8 * 1024 * 1024 ? sha256File(found) : null;
          digestParts.push(
            digest
              ? `built:${rel(repoRoot, found)}:${digest}`
              : `built-large-or-unstable:${rel(repoRoot, found)}:${size}`,
          );
        } catch {
          // Concurrently removed build output: it is simply absent from this snapshot.
        }
      }
    }
  }

  // ---- source roots ------------------------------------------------------------------
  for (const dir of walkDirs(repoRoot, { maxDepth })) {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    entries.sort((a, b) => byCodepoint(a.name, b.name));
    const stacks = new Set();
    const markerDigests = [];
    for (const e of entries) {
      if (!e.isFile()) continue;
      let marker = false;
      for (const m of PROJECT_MARKERS) {
        if (!m.file.test(e.name)) continue;
        stacks.add(m.stack);
        marker = true;
      }
      if (marker) {
        const path = join(dir, e.name);
        const digest = sha256File(path);
        if (digest) markerDigests.push(`${e.name}:${digest}`);
        else {
          try { markerDigests.push(`${e.name}:large-or-unstable:${statSync(path).size}`); } catch { /* absent */ }
        }
      }
    }
    if (stacks.size === 0) continue;

    const relDir = rel(repoRoot, dir) || '.';
    const isFunctions = existsSync(join(dir, 'host.json'));

    // Read the code far enough to say whether an HTTP surface exists and what is unsupported.
    // Endpoint extraction stays with the model; this only makes the report and the exit code honest.
    const signals = surfaceSignals(dir, { repoRoot });
    for (const c of signals.capability) {
      if (!capability.some((x) => x.subject === c.subject)) capability.push(c);
    }
    // The file cap is deterministic now, but it can still hide the one file that holds the routes -
    // and "no HTTP surface here" would then be a guess presented as a finding. Say so instead.
    // Named per source root, and only when that root has no description of its own to fall back on -
    // a member that ships an openapi.yaml is fully supported whatever it is written in.
    for (const stack of [...stacks].sort()) {
      if (!UNSUPPORTED_STACKS.has(stack) || signals.hasHttp) continue;
      // Suppressed as soon as ANY usable description exists in the repository, not just one under
      // this source root. Scoping it to the root made probe exit 3 - which SKILL.md tells the model
      // to stop on - for a repository where probe itself had already ranked a perfectly usable
      // OpenAPI document first, just because the document sat somewhere else in the tree.
      const describedAnywhere = candidates.some(
        (c) => c.kind === 'openapi' || c.kind === 'postman' || c.kind === 'wsdl',
      );
      if (describedAnywhere) continue;
      if (!capability.some((x) => x.subject === `${stack}-source`)) {
        capability.push({
          subject: `${stack}-source`,
          supported: false,
          reason: UNSUPPORTED_STACKS.get(stack),
          paths: [relDir],
        });
      } else {
        const entry = capability.find((x) => x.subject === `${stack}-source`);
        if (!entry.paths.includes(relDir)) entry.paths.push(relDir);
      }
    }

    if (signals.truncated) {
      notices.push(
        `${relDir}: only ${signals.filesScanned} of ${signals.filesFound} source files were scanned, ` +
          `so "${signals.hasHttp ? 'which stacks' : 'no HTTP surface'}" may be incomplete here`,
      );
    }

    candidates.push({
      kind: 'source-root',
      path: relDir,
      apiName: basename(dir) || basename(repoRoot),
      stacks: [...stacks].sort(),
      frameworks: signals.stacks,
      hasHttp: signals.hasHttp,
      endpointCount: null,
      score:
        40 +
        (isFunctions ? 10 : 0) +
        (signals.hasHttp ? 25 : -35) -
        relDir.split('/').length * 2,
      reasons: [
        `project markers: ${[...stacks].sort().join(', ')}`,
        ...(isFunctions ? ['host.json present (Azure Functions)'] : []),
        ...(signals.hasHttp
          ? [`HTTP surface: ${signals.stacks.join(', ')}`]
          : ['no HTTP surface found in the source']),
      ],
    });
    digestParts.push(
      `source:${relDir}:${markerDigests.sort().join(',')}:${signals.sourceDigest}`,
    );
  }

  candidates.sort((a, b) => b.score - a.score || byCodepoint(a.path, b.path));
  skipped.sort((a, b) => byCodepoint(a.path, b.path));
  capability.sort((a, b) => byCodepoint(a.subject, b.subject) || byCodepoint(a.paths?.[0], b.paths?.[0]));

  // Content-based, never mtime: git checkouts and build tools make mtimes meaningless. Three kinds of
  // part go in, and no others - a sha256 of each description's bytes, one per built artefact, and per
  // source root its marker digests plus the `sourceDigest` signals computed over the files it scanned.
  // Existing collections are deliberately absent: they are this tool's OUTPUT, so folding them in
  // would make the digest change every time it wrote something.
  //
  // `scanDigest` rather than `sourceDigest` because it is wider than the source - the descriptions are
  // in it too. Nothing decides anything on it today; the point of hashing content rather than size is
  // that a field printed as a digest should change when the thing it describes changes.
  const scanDigest = `sha256:${createHash('sha256').update(digestParts.sort().join('\n'), 'utf8').digest('hex')}`;

  // Something was found and none of it is supported: exit 3, not "nothing found" (exit 2).
  //
  // Two shapes qualify, and only the first used to. (a) source roots exist and none is HTTP-shaped.
  // (b) there are no source roots at all but something unsupported WAS named - a repository whose only
  // description is a Swagger 2.0 file is the case that matters: probe reported "no API description and
  // no recognised project found" and exited 2, which is the code SKILL.md reads as "nothing here", so
  // the one actionable fact - convert the spec - never reached the user.
  const sourceRoots = candidates.filter((c) => c.kind === 'source-root');
  const usableDescription = candidates.some(
    (c) => c.kind === 'openapi' || c.kind === 'postman' || c.kind === 'wsdl',
  );
  const surfaceButUnsupported =
    capability.length > 0 &&
    !usableDescription &&
    (sourceRoots.length > 0 ? sourceRoots.every((c) => c.hasHttp === false) : true);

  return {
    root: repoRoot,
    collections,
    candidates,
    skipped,
    capability,
    notices,
    surfaceButUnsupported,
    scanDigest,
    summary: {
      collections: collections.length,
      candidates: candidates.length,
      specs: candidates.filter((c) => c.kind === 'openapi').length,
      skipped: skipped.length,
      namedSkips: skipped.filter((s) => s.named).length,
      httpSourceRoots: sourceRoots.filter((c) => c.hasHttp).length,
      unsupportedSubjects: capability.map((c) => c.subject),
    },
  };
}

function findAllowedBuiltFiles(dir, depth = 0, out = []) {
  if (depth > 4) return out;
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  entries.sort((a, b) => byCodepoint(a.name, b.name));
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) findAllowedBuiltFiles(p, depth + 1, out);
    else if (BUILT_ALLOW.some((re) => re.test(p))) out.push(p);
  }
  return out;
}

/** Ordered, bounded scoring: no unbounded per-server bonus that can outrun a vendor penalty. */
function score(relPath, result, repoRoot) {
  const reasons = [];
  let s = 50;

  const dir = relPath.includes('/') ? relPath.slice(0, relPath.lastIndexOf('/')) : '';
  const topDir = dir.split('/')[0] ?? '';

  if (looksThirdParty(relPath)) {
    s -= 40;
    reasons.push('path looks third-party');
  } else if (FIRST_PARTY.has(topDir)) {
    s += 20;
    reasons.push(`first-party location (${topDir || 'repository root'})`);
  }

  const repoName = basename(repoRoot).toLowerCase().replace(/[^a-z0-9]/g, '');
  const title = String(result.title ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (title && repoName && (title.includes(repoName) || repoName.includes(title))) {
    s += 15;
    reasons.push('spec title matches the repository name');
  }

  if ((result.pathCount ?? 0) > 500) {
    s -= 25;
    reasons.push(`very large spec (${result.pathCount} paths) - probably a vendor API`);
  }

  if (result.kind === KIND.OPENAPI) {
    s += 10;
    reasons.push('OpenAPI 3.x');
  }

  return { score: s, reasons };
}
