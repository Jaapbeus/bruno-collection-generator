// `smoke` - does this collection actually work?
//
// Everything else in this tool is a claim about files. This is the only command that finds out
// whether the requests run, which means it is also the only one that sends real traffic to a real
// host with real credentials. Three consequences shape the whole module:
//
//   Consent is explicit. Without --yes it prints the exact command, the environment, the host it
//   would reach and the number of requests, and stops. A tool that quietly called a production API
//   because someone was exploring its commands would deserve everything that followed.
//
//   Destructive requests are excluded by default. `--exclude-tags destructive` is on unless the
//   user overrides it, because a smoke test that POSTs to a real system is not a smoke test.
//
//   Nothing that comes back is printed unredacted. The reporter runs with headers and bodies
//   skipped, and query values are redacted before anything reaches the report - a response body
//   from a real API is exactly where a token, a name or an address turns up.
//
// The execution itself is Bruno's own CLI. Reimplementing a .bru runner would mean reimplementing
// its variable resolution, auth modes, scripting and assertions, and any difference between our
// runner and Bruno's would make the result meaningless.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { tmpdir } from 'node:os';
import { bruCommand, resolveBruExecutable } from './bru-executable.mjs';
import { filestore } from './deps.mjs';
import { classify, redactCredentialShapes } from './secrets.mjs';

export const BRU_INSTALL_HINT = 'npm install -g @usebruno/cli@4.0.0';

/** Is Bruno's CLI available, and which version? */
export function bruVersion({ invocation = resolveBruExecutable() } = {}) {
  if (!invocation) return null;
  const command = bruCommand(invocation, ['--version']);
  const r = spawnSync(command.command, command.args, { encoding: 'utf8', shell: false, cwd: tmpdir() });
  if (r.error || r.status !== 0) return null;
  return String(r.stdout ?? '').trim().split('\n')[0] || 'unknown';
}

/** Environment names the collection declares, from the files rather than from a model. */
export function environmentsIn(collectionRoot) {
  const dir = join(collectionRoot, 'environments');
  if (!existsSync(dir)) return [];
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isFile() && ['.bru', '.yml', '.yaml'].includes(extname(e.name).toLowerCase()))
      .map((e) => e.name.replace(/\.(bru|ya?ml)$/i, ''))
      .sort();
  } catch {
    return [];
  }
}

/** Values explicitly marked secret in the selected environment, for output redaction only. */
function environmentSecretValues(collectionRoot, env) {
  const dir = join(collectionRoot, 'environments');
  try {
    const candidates = readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.replace(/\.(bru|ya?ml)$/i, '') === env)
      .map((e) => join(dir, e.name));
    const values = [];
    for (const file of candidates) {
      const format = extname(file).toLowerCase() === '.bru' ? 'bru' : 'yml';
      const parsed = filestore().parseEnvironment(readFileSync(file, 'utf8'), { format });
      for (const variable of parsed?.variables ?? []) {
        if (variable?.value === null || variable?.value === undefined || !String(variable.value)) continue;
        if (variable.secret || classify(variable.name, variable.value).secret) values.push(String(variable.value));
      }
    }
    return values;
  } catch {
    // Doctor reports malformed environments. Smoke still remains safe for --var values and URLs;
    // Bruno will report whether the selected file itself can be used.
    return [];
  }
}

/**
 * A URL safe to print. The path stays - it is the whole point of the report - but every query value
 * goes, because a function key, SAS token or api key in a query string is normal.
 */
export function redactUrl(url) {
  // Userinfo, at the LAST '@' of the authority and with the scheme optional. Their `[^/@\s]+@` bound
  // to the FIRST '@', so a password containing one - the usual reason a URL is written this way - had
  // its tail printed; requiring `://` let a scheme-relative `//admin:pw@host/x` through untouched.
  let text = String(url ?? '');
  {
    const schemeEnd = text.match(/^([a-z][a-z0-9+.-]*:)?\/\//i)?.[0]?.length ?? 0;
    const slash = text.indexOf('/', schemeEnd);
    const at = text.lastIndexOf('@', slash === -1 ? text.length : slash);
    if (at > schemeEnd) text = `${text.slice(0, schemeEnd)}…@${text.slice(at + 1)}`;
  }

  const fragmentAt = text.indexOf('#');
  const withoutFragment = fragmentAt < 0 ? text : text.slice(0, fragmentAt);
  const q = withoutFragment.indexOf('?');
  const rawPath = q < 0 ? withoutFragment : withoutFragment.slice(0, q);
  // A credential can sit in a PATH segment too, not only the query - so each segment is classified.
  const path = rawPath
    .split('/')
    .map((segment) => {
      let decoded = segment;
      try { decoded = decodeURIComponent(segment); } catch { /* retain undecodable input */ }
      return classify('', decoded).secret ? '…' : segment;
    })
    .join('/');
  if (q < 0) return fragmentAt < 0 ? path : `${path}#…`;
  const query = withoutFragment.slice(q + 1);
  const keys = query
    .split('&')
    .map((pair) => pair.split('=')[0])
    .filter(Boolean);
  const redactedKeys = keys.map((key) => classify('', key).secret ? '…' : key);
  return `${path}?${redactedKeys.map((k) => `${k}=…`).join('&')}${fragmentAt < 0 ? '' : '#…'}`;
}

/**
 * Free text that may quote a URL back at us - an error message, a line of stderr.
 *
 * `redactUrl` only helps when the whole string IS a url. Bruno's errors embed the request url in a
 * sentence, and that url carries the query string, so printing the message verbatim leaked the
 * credential that `redactUrl` exists to hide two fields away.
 */
export function redactText(text, { values = [] } = {}) {
  let redacted = redactCredentialShapes(text)
    .replace(/([?&][A-Za-z0-9_.\-[\]%]+)=[^&\s"'<>]+/g, '$1=…')
    .replace(/(--env-var(?:=|\s+)[A-Za-z_][A-Za-z0-9_]*=)[^\s"']+/g, '$1…');
  for (const value of values.map(String).filter(Boolean).sort((a, b) => b.length - a.length)) {
    if (value) redacted = redacted.split(value).join('…');
  }
  return redacted;
}

/**
 * Build the argument list. Kept separate from running it so a test can assert the command without
 * a network, which is the only part of this that CI can honestly check.
 */
export function bruArgs({ env, reporterPath, excludeTags = ['destructive'], tags = [], bail = false, vars = [] }) {
  // Pin the restricted sandbox explicitly. Depending on Bruno's current default would let an
  // upstream default change grant repository-supplied request scripts developer-mode privileges.
  const args = ['run', '-r', '--env', env, '--sandbox', 'safe'];
  // Secrets are declared by name with an empty value, so without this a collection whose auth uses a
  // declared secret cannot authenticate at all - it would send an empty key and report a tidy 401.
  // `--env-var` supplies the value for the run only: nothing is written to the environment file, and
  // nothing lands in the repository.
  for (const v of vars) args.push('--env-var', v);
  // --reporter-json requires a path; without one the CLI errors rather than writing to stdout.
  args.push('--reporter-json', reporterPath);
  // Headers and bodies never reach the report file. Credentials live in headers, and a response
  // body from a real system is production data that has no business in a temporary file.
  args.push('--reporter-skip-all-headers', '--reporter-skip-body');
  for (const t of excludeTags) args.push('--exclude-tags', t);
  for (const t of tags) args.push('--tags', t);
  if (bail) args.push('--bail');
  return args;
}

/**
 * Run the collection.
 *
 * `confirmed` is the consent gate: false means describe and stop. Returns a plain object; the
 * caller does the reporting, so this stays testable.
 */
export function smoke({
  collectionRoot,
  env,
  confirmed = false,
  excludeTags = ['destructive'],
  tags = [],
  bail = false,
  vars = [],
  requestCount = null,
}) {
  const normalisedVars = vars.map(String);
  for (const v of normalisedVars) {
    // Never return the raw argument on failure: a user who forgot `name=` may have pasted the
    // credential itself, and an error message is still a leak.
    if (!/^[A-Za-z_][A-Za-z0-9_]*=/.test(v) || v.includes('\0')) {
      return { ok: false, reason: 'bad-var' };
    }
  }
  for (const t of [...tags, ...excludeTags]) {
    if (!/^[A-Za-z0-9._-]+$/.test(String(t))) return { ok: false, reason: 'bad-tag' };
  }
  const available = environmentsIn(collectionRoot);
  if (!env) {
    return { ok: false, reason: 'no-env', available };
  }
  // Unconditional: `available.length &&` let any string through for a collection with no
  // environments directory, which is precisely the case where nothing had been validated.
  if (!available.includes(env)) {
    return { ok: false, reason: 'unknown-env', env, available };
  }

  const sensitiveValues = [
    ...normalisedVars.map((v) => v.slice(v.indexOf('=') + 1)),
    ...environmentSecretValues(collectionRoot, env),
  ].filter(Boolean);

  const invocation = resolveBruExecutable({ excludeRoot: collectionRoot });
  const version = bruVersion({ invocation });
  if (!invocation || !version) return { ok: false, reason: 'no-cli', hint: BRU_INSTALL_HINT };

  // The reporter file goes to a temporary directory, never into the repository: it is a run
  // artefact, and writing it beside the collection would put response data under version control.
  const reportDir = mkdtempSync(join(tmpdir(), 'brunogen-smoke-'));
  const reporterPath = join(reportDir, 'run.json');
  const args = bruArgs({ env, reporterPath, excludeTags, tags, bail, vars: normalisedVars });

  if (!confirmed) {
    rmSync(reportDir, { recursive: true, force: true });
    return {
      ok: false,
      reason: 'needs-consent',
      env,
      version,
      requestCount,
      // The value half of every --env-var is redacted: this string is printed for the user to
      // approve, and a function key pasted into a terminal transcript is still a leaked key.
      command: `bru ${args.map((a, i) => (args[i - 1] === '--env-var' ? `${a.split('=')[0]}=…` : a)).join(' ')}`,
      cwd: collectionRoot,
    };
  }

  const command = bruCommand(invocation, args);
  const run = spawnSync(command.command, command.args, {
    cwd: collectionRoot,
    encoding: 'utf8',
    shell: false,
    timeout: 5 * 60 * 1000,
    // Without a cap the default 1 MB silently kills the child mid-run on a large collection, and
    // the only symptom is "no request results came back".
    maxBuffer: 32 * 1024 * 1024,
  });

  let report = null;
  let parseError = null;
  try {
    if (existsSync(reporterPath)) report = JSON.parse(readFileSync(reporterPath, 'utf8'));
  } catch (err) {
    parseError = redactText(err.message, { values: sensitiveValues });
  }

  let results;
  try {
    results = normaliseResults(report, { values: sensitiveValues });
  } finally {
    // In a finally: the reporter directory holds response data, so leaking it on any throw between
    // the run and here would leave that data in the temp directory indefinitely. It was removed on
    // the happy path only.
    rmSync(reportDir, { recursive: true, force: true });
  }

  const attempted = results.length;
  const failed = results.filter((r) => r.outcome === 'failed');
  const reached = results.filter((r) => r.outcome === 'reached');

  return {
    ok: attempted > 0 && failed.length === 0,
    reason: attempted === 0 ? 'nothing-ran' : failed.length ? 'failures' : null,
    reached: reached.length,
    env,
    version,
    exitStatus: run.status,
    timedOut: Boolean(run.error && run.error.code === 'ETIMEDOUT'),
    // Every other spawn failure used to be discarded, so ENOBUFS or EACCES looked like a run that
    // simply returned nothing.
    spawnError: run.error && run.error.code !== 'ETIMEDOUT'
      ? redactText(`${run.error.code}: ${run.error.message}`, { values: sensitiveValues })
      : null,
    stderr: redactText((run.stderr ?? '').trim().split('\n').slice(0, 8).join('\n'), {
      values: sensitiveValues,
    }),
    reporterMissing: report === null,
    parseError,
    attempted,
    failed: failed.length,
    results,
  };
}

/**
 * Flatten Bruno's reporter JSON into one row per request.
 *
 * The shape has changed across CLI versions, so read defensively: an array of runs each with
 * `results[]`, or a single object. A row we cannot read is reported as unreadable rather than
 * silently dropped, because a dropped row looks like a request that was never in the collection.
 */
export function normaliseResults(report, { values = [] } = {}) {
  if (!report) return [];
  const runs = Array.isArray(report) ? report : [report];
  const rows = [];

  for (const run of runs) {
    const direct = Array.isArray(run?.results) ? run.results : null;
    const iterations = Array.isArray(run?.iterationResults) ? run.iterationResults : [];
    const items = direct ?? iterations.flatMap((iteration) =>
      Array.isArray(iteration?.results) ? iteration.results : []);
    for (const item of items) {
      const req = item?.request ?? {};
      const res = item?.response ?? {};
      const assertions = [
        ...(Array.isArray(item?.assertionResults) ? item.assertionResults : []),
        ...(Array.isArray(item?.testResults) ? item.testResults : []),
      ];
      const failedAssertions = assertions.filter((a) => a?.status === 'fail' || a?.status === 'failed');
      const status = res.status ?? res.statusCode ?? null;
      const error = item?.error ?? res.error ?? null;

      // Three outcomes, not two. "Was it sent?" is the interesting question for a smoke test, but
      // answering only that made a run where every response was a 500 report "none failed", which is
      // not something anyone would call a working collection.
      //
      //   failed   nothing was sent, an assertion failed, or the server itself errored (5xx)
      //   reached  it arrived and came back 4xx - the request was built, resolved and sent, which is
      //            exactly what a smoke test is for. A 401 with no key supplied is the normal case.
      //   ok       2xx or 3xx
      let outcome;
      if (error || status === null || failedAssertions.length > 0) outcome = 'failed';
      else if (status >= 500) outcome = 'failed';
      else if (status >= 400) outcome = 'reached';
      else outcome = 'ok';

      rows.push({
        // The raw url was the fallback here while the `url` field below is carefully redacted, so
        // the same credential leaked through the neighbouring field.
        name: redactText(item?.test?.filename ?? item?.suitename ?? redactUrl(req.url) ?? '(unnamed)', { values }),
        method: (req.method ?? '').toUpperCase() || null,
        url: redactText(redactUrl(req.url), { values }),
        status,
        outcome,
        passed: outcome !== 'failed',
        error: error ? redactText(String(error), { values }).slice(0, 200) : null,
        assertions: assertions.length,
        failedAssertions: failedAssertions.length,
      });
    }
  }
  return rows;
}
