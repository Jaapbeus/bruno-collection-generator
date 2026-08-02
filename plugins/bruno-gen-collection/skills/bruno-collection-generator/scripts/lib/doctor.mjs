// `doctor` - read-only inspection of whatever collection already exists.
//
// Writes nothing and makes no network request. This is the first thing to run against an
// unfamiliar repository, and the only Phase 1 command that does real work.

import { existsSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { findCollections, selectCollection } from './format.mjs';
import { buildInventory } from './inventory.mjs';
import { libraryVersions } from './deps.mjs';
import { Report, count } from './report.mjs';
import { formatFinding, redactCredentialShapes, redactOutput } from './secrets.mjs';
import { redactUrl } from './smoke.mjs';
import { byCodepoint } from './paths.mjs';

export const EXIT = {
  OK: 0,
  ERROR: 1,
  NO_SURFACE: 2,
  UNSUPPORTED: 3,
  UNRESOLVED: 4,
  AMBIGUOUS: 5,
};

/**
 * @returns {{exitCode: number, result: object, report: Report}}
 */
export function doctor({ root, placeholders = [], json = false } = {}) {
  const repoRoot = resolve(root ?? process.cwd());
  const report = new Report();

  if (!existsSync(repoRoot)) {
    report.warn(`No such directory: ${repoRoot}`);
    return { exitCode: EXIT.ERROR, result: { error: 'no such directory', root: repoRoot }, report };
  }

  const collections = findCollections(repoRoot);
  const selection = selectCollection(collections);

  if (collections.length === 0) {
    report.heading('doctor');
    report.facts([['repository', repoRoot]]);
    report.info('No Bruno collection found.');
    report.info('Looked for opencollection.yml (YAML format) and bruno.json (.bru format),');
    report.info('skipping node_modules, .git, obj, bin, dist, target and vendor directories.');
    return {
      exitCode: EXIT.NO_SURFACE,
      result: { root: repoRoot, collections: [], reason: 'no collection found' },
      report,
    };
  }

  if (!selection.collection) {
    report.heading('doctor');
    report.warn(`${selection.reason}. Choose one with --root <collection directory>:`);
    report.table(
      ['format', 'name', 'path'],
      collections.map((c) => [c.format, c.name ?? '-', c.root.replace(repoRoot, '.')]),
    );
    return {
      exitCode: EXIT.AMBIGUOUS,
      result: { root: repoRoot, collections, reason: selection.reason },
      report,
    };
  }

  const collection = selection.collection;
  const inv = buildInventory(collection, { placeholders });

  // ---- report -------------------------------------------------------------------------
  report.heading('Collection');
  report.facts([
    // Forward-slash, like plan and apply print it. This printed the host separator (`.runo`), so
    // the same collection was named two different ways by two commands.
    ['path', collection.root.replace(repoRoot, '.').split(sep).join('/')],
    ['format', collection.format === 'yml' ? 'opencollection.yml (YAML)' : 'bruno.json + .bru'],
    ['name', inv.name ?? '(none declared)'],
    ['selected because', selection.reason],
    ['requests', `${inv.counts.parsed} parsed${inv.counts.unparseable ? `, ${inv.counts.unparseable} unparseable` : ''}`],
    ['environments', String(inv.counts.environments)],
  ]);

  const parsed = inv.requests.filter((r) => r.ok);
  if (parsed.length) {
    report.heading('Requests');
    report.table(
      ['seq', 'method', 'url', 'auth', 'body', 'file'],
      parsed
        .slice()
        .sort((a, b) => (a.seq ?? 1e9) - (b.seq ?? 1e9) || byCodepoint(a.path, b.path))
        .map((r) => [r.seq ?? '-', r.method, redactUrl(r.url), r.authMode ?? '-', r.bodyMode ?? 'none', r.path]),
    );
  }

  for (const bad of inv.requests.filter((r) => !r.ok)) {
    report.warn(`${bad.path}: ${bad.error}`);
  }

  if (inv.environments.length) {
    report.heading('Environments');
    report.table(
      ['name', 'variables', 'secrets declared', 'file'],
      inv.environments.map((e) =>
        e.ok
          ? [e.name, e.plain.join(', ') || '-', e.secrets.join(', ') || '(none)', e.path]
          : [e.path, `PARSE ERROR: ${e.error}`, '', e.path],
      ),
    );
  }

  // ---- diagnostics --------------------------------------------------------------------
  const diagnostics = [];

  if (inv.secretFindings.length) {
    report.heading('Possible committed credentials');
    report.info('Reported by location only - the value is never printed, copied or logged.');
    for (const f of inv.secretFindings) {
      report.warn(formatFinding(f.path, f));
    }
    diagnostics.push(`${count(inv.secretFindings.length, 'possible credential')} committed`);
  }

  if (inv.undeclaredVariables.length) {
    report.heading('Variables used but not declared in any environment');
    report.info('A request referencing an undeclared variable sends an empty value, which is the');
    report.info('usual reason someone pastes a literal key into a request file instead.');
    for (const v of inv.undeclaredVariables) {
      report.warn(`{{${v.name}}}  used by ${v.paths.join(', ')}`);
    }
    diagnostics.push(`${count(inv.undeclaredVariables.length, 'undeclared variable')}`);
  }

  if (inv.duplicateKeys.length) {
    report.heading('Duplicate endpoint identity');
    report.info('More than one file describes the same METHOD + path. That is legitimate (a');
    report.info('dry-run variant, say), but only one file can own the endpoint on regeneration.');
    for (const d of inv.duplicateKeys) {
      report.warn(`${d.endpointKey}  ->  ${d.paths.join(', ')}`);
    }
    diagnostics.push(`${count(inv.duplicateKeys.length, 'duplicate endpoint')}`);
  }

  if (inv.duplicateSeq.length) {
    report.heading('Duplicate seq');
    report.info('Ordering in the Bruno sidebar is ambiguous where two siblings share a seq.');
    for (const d of inv.duplicateSeq) {
      report.warn(`${d.dir}  seq ${d.seq}  ->  ${d.paths.join(', ')}`);
    }
    diagnostics.push(`${count(inv.duplicateSeq.length, 'duplicate seq')}`);
  }

  report.heading('Summary');
  if (diagnostics.length === 0) {
    report.ok('No problems found. Nothing was written.');
  } else {
    for (const d of diagnostics) report.warn(d);
    report.info('Nothing was written; doctor is read-only.');
  }

  return {
    // A committed credential makes doctor fail. Returning OK regardless meant `brunogen doctor`
    // could never gate a pipeline on the one thing it exists to find.
    exitCode: inv.secretFindings.length ? EXIT.ERROR : EXIT.OK,
    result: redactOutput({
      root: repoRoot,
      collection: { root: collection.root, format: collection.format, name: inv.name },
      counts: inv.counts,
      requests: parsed.map((r) => ({
        path: r.path,
        name: r.name,
        seq: r.seq,
        method: r.method,
        // Redacted like every other URL this tool prints. doctor's whole output is designed to be
        // pasted into an issue or a chat reply, and `?code=<key>` in a request URL is the single
        // most likely committed credential - so printing it verbatim leaked exactly what the
        // secret scan three lines below refuses to print.
        url: redactUrl(r.url),
        endpointKey: redactUrl(r.endpointKey),
        authMode: r.authMode,
        bodyMode: r.bodyMode,
        variables: r.variables,
      })),
      unparseable: inv.requests.filter((r) => !r.ok).map((r) => ({
        path: r.path,
        error: redactCredentialShapes(r.error),
      })),
      environments: inv.environments.map((e) => ({
        path: e.path,
        name: e.name,
        ok: e.ok,
        plain: e.plain ?? [],
        secrets: e.secrets ?? [],
      })),
      duplicateKeys: inv.duplicateKeys.map((d) => ({ ...d, endpointKey: redactUrl(d.endpointKey) })),
      duplicateSeq: inv.duplicateSeq,
      undeclaredVariables: inv.undeclaredVariables,
      // Locations only. Deliberately no value, no excerpt, no hash.
      secretFindings: inv.secretFindings.map((f) => ({
        path: f.path,
        line: f.line,
        key: f.key,
        reason: f.reason,
        matchedBy: f.matchedBy,
      })),
      libraries: libraryVersions(),
    }),
    report,
  };
}
