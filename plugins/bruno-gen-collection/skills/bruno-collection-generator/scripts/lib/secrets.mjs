// Credential detection.
//
// Two jobs: refuse to write a secret, and report one already committed. A finding NEVER carries
// the value - only where it is. That rule is what lets `doctor` run against a real repository and
// have its output pasted into a report, an issue or a chat reply.

/** Key/variable names that mean "this is a credential", matched case-insensitively. */
const SECRET_NAME = new RegExp(
  [
    'secret', 'password', 'passwd', 'pwd', 'token', 'apikey', 'api[-_]?key',
    'client[-_]?secret', 'connection[-_]?string', 'account[-_]?key', 'sas',
    'signature', 'credential', 'private[-_]?key', 'bearer', 'authorization',
    'master[-_]?key', 'functions?[-_]?key', 'subscription[-_]?key', 'access[-_]?key',
  ].join('|'),
  'i',
);

/** Value shapes that are credentials regardless of the key they sit under. */
const SECRET_SHAPE = [
  { id: 'jwt', re: /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/, label: 'JWT' },
  { id: 'azure-account-key', re: /AccountKey\s*=/i, label: 'Azure storage AccountKey' },
  { id: 'azure-sas', re: /SharedAccessSignature\s*=/i, label: 'Azure SAS' },
  { id: 'sql-password', re: /\b(password|pwd)\s*=\s*[^;\s"']{4,}/i, label: 'connection-string password' },
  { id: 'openai', re: /\bsk-[A-Za-z0-9_-]{20,}\b/, label: 'sk- API key' },
  { id: 'github', re: /\b(gh[pousr]_[A-Za-z0-9]{16,}|github_pat_[A-Za-z0-9_]{20,})\b/, label: 'GitHub token' },
  { id: 'aws', re: /\bAKIA[0-9A-Z]{16}\b/, label: 'AWS access key id' },
  { id: 'slack', re: /\bxox[abposr]-[A-Za-z0-9-]{10,}\b/, label: 'Slack token' },
  { id: 'private-key-block', re: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/, label: 'private key block' },
  // Long opaque base64, the shape of an Azure Functions key or a storage key.
  //
  // Two rules, because the old single one matched exactly 43 or 86 characters and so could not
  // match a real Azure Functions key at all: those are 40 bytes, which is 56 base64 characters.
  // The primary target of this tool was the one thing the detector could not see.
  //
  // Padded: the trailing "=" is a strong enough signal on its own. No trailing \b - "=" is not a
  // word character, so \b can never match after it. Also accepts the url-safe alphabet.
  //
  // "=" is deliberately absent from the lookbehind: `?code=<key>` in a request URL is the single
  // most likely committed Azure Functions credential, and excluding it there made that case - the
  // whole point of the rule - unmatchable.
  {
    id: 'base64-padded',
    re: /(?<![A-Za-z0-9+/_-])[A-Za-z0-9+/_-]{27,}={1,2}(?![A-Za-z0-9+/=_-])/,
    label: 'base64-encoded key',
  },
  // Unpadded needs upper, lower AND a digit inside the run, or every 64-character lowercase hex
  // digest - a legitimate thing to find in a request body - becomes a credential finding.
  {
    id: 'base64-unpadded',
    re: /(?<![A-Za-z0-9+/_-])(?=[A-Za-z0-9+/_-]*[A-Z])(?=[A-Za-z0-9+/_-]*[a-z])(?=[A-Za-z0-9+/_-]*[0-9])[A-Za-z0-9+/_-]{40,}(?![A-Za-z0-9+/=_-])/,
    label: 'base64-encoded key',
  },
];

// Diagnostics often quote a rejected line verbatim. Shape-only redaction is insufficient for a
// short value such as `AccountKey=dev-key`: the key name proves it is a credential even though the
// value has no distinctive shape. Match the whole assignment value, including JSON and headers.
const SECRET_ASSIGNMENT = new RegExp(
  String.raw`((?:^|[\s,{;&?])["']?[A-Za-z0-9_.-]*(?:${SECRET_NAME.source})[A-Za-z0-9_.-]*["']?\s*(?::|=)\s*)(?:"[^"\r\n]*"|'[^'\r\n]*'|[^,;}\]\r\n&]+)`,
  'gim',
);

/** Remove known credential shapes from arbitrary diagnostics without retaining the matched value. */
export function redactCredentialShapes(value) {
  let output = String(value ?? '').replace(SECRET_ASSIGNMENT, '$1…');
  for (const { re } of SECRET_SHAPE) {
    const flags = re.flags.includes('g') ? re.flags : `${re.flags}g`;
    output = output.replace(new RegExp(re.source, flags), '…');
  }
  return output;
}

/** Recursively prepare a plain command result for JSON output. */
export function redactOutput(value) {
  if (typeof value === 'string') return redactCredentialShapes(value);
  if (Array.isArray(value)) return value.map(redactOutput);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redactOutput(item)]));
  }
  return value;
}

/** Substitution forms that stand in for a value, wherever they appear inside one. */
const REFERENCE = /\{\{[^{}]+\}\}|\$\{[^{}]+\}|__[A-Z0-9_]+__|<[^<>\s]+>/g;

/**
 * A value whose credential-bearing part is a variable reference: `Bearer {{accessToken}}`,
 * `prefix-{{apiKey}}`.
 *
 * `isPlaceholder` anchors to the whole value, so a reference with any prefix fell through to the
 * key-name rule - and `Authorization: Bearer {{accessToken}}` is exactly what this generator is
 * supposed to emit. Reporting it had two costs: `doctor` cried wolf on its own correct output, and
 * the write-time gate refused to write it at all.
 *
 * What remains after the references are removed still has to be innocuous: a real key with a
 * variable appended is not a reference.
 */
export function isReference(value) {
  const raw = String(value ?? '');
  const rest = raw.replace(REFERENCE, ' ');
  if (rest === raw) return false;
  if (SECRET_SHAPE.some(({ re }) => re.test(rest))) return false;
  return rest.replace(/[^A-Za-z0-9]/g, '').length < 8;
}

/** Default markers that look secret-ish but MUST be emitted verbatim to work. */
export const DEFAULT_PLACEHOLDERS = [
  /^__[A-Z0-9_]+__$/, // __APIKEY__ - substituted server-side at deploy time
  /^\{\{[^{}]+\}\}$/, // {{clientSecret}} - a Bruno variable reference, the desired output
  /^\$\{[^{}]+\}$/, // ${ENV_VAR}
  /^<[^<>]+>$/, // <your-key-here>
  /^(?:changeme|change-me|todo|tbd|placeholder|xxx+|\*+|redacted|secret)$/i,
];

export function isPlaceholder(value, extra = []) {
  const v = String(value ?? '').trim();
  if (!v) return true;
  if (DEFAULT_PLACEHOLDERS.some((re) => re.test(v))) return true;
  // Repository-supplied expressions are already restricted at compile time. The input cap is a
  // second bound: they are meant for short substitution markers, never megabyte-long source lines.
  return v.length <= 4096 && extra.some((re) => re.test(v));
}

/**
 * Classify one key/value pair.
 * @returns {{secret: boolean, reason: string|null, matchedBy: 'name'|'shape'|null}}
 */
export function classify(key, value, { placeholders = [] } = {}) {
  const name = String(key ?? '');
  const raw = value === null || value === undefined ? '' : String(value);

  // A documented substitution marker is a value, not a credential - even under a key called
  // `api-Key`. Strip it and the request fails for a reason the user cannot see.
  if (isPlaceholder(raw, placeholders) || isReference(raw)) {
    return { secret: false, reason: 'placeholder or variable reference', matchedBy: null };
  }

  for (const { re, label } of SECRET_SHAPE) {
    if (re.test(raw)) return { secret: true, reason: label, matchedBy: 'shape' };
  }

  if (SECRET_NAME.test(name) && raw.length >= 8) {
    return { secret: true, reason: `key name looks like a credential ("${name}")`, matchedBy: 'name' };
  }

  return { secret: false, reason: null, matchedBy: null };
}

/**
 * Scan raw file text for committed credentials.
 *
 * Line-oriented so every finding has a line number. Handles `key: value` (bru), `key = value`,
 * `"key": "value"` (json) and bare high-entropy literals.
 *
 * @returns {Array<{line: number, key: string|null, reason: string, matchedBy: string}>}
 *          Findings never include the value.
 */
export function scanText(text, { placeholders = [] } = {}) {
  const findings = [];
  const lines = String(text ?? '').split(/\r?\n/);
  let block = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Enough block context to know when a generically-named key IS the credential. Inside
    // `auth:apikey { ... }` the literal sits under `value:`, and "value" can never go in
    // SECRET_NAME - every param has one. Without this, the single most likely place for a pasted
    // key was the one place the scanner did not look.
    const opens = /^\s*([\w:]+)\s*[{[]\s*$/.exec(line);
    if (opens) {
      block = opens[1];
      continue;
    }
    if (/^\s*[}\]]\s*$/.test(line)) {
      block = null;
      continue;
    }
    const inAuthBlock = Boolean(block?.startsWith('auth'));

    // Shape match anywhere on the line: catches a bare literal with no key at all.
    let shapeHit = null;
    for (const { re, label } of SECRET_SHAPE) {
      if (re.test(line)) {
        shapeHit = label;
        break;
      }
    }

    const kv =
      /^\s*"?([\w.\-\[\]]+)"?\s*[:=]\s*"?([^"',]*)"?\s*,?\s*$/.exec(line) ??
      /^\s*~?"?([\w.\-\[\]]+)"?\s*:\s*(.*)$/.exec(line);
    const key = kv ? kv[1] : null;
    const value = kv ? kv[2] : line;

    if (isPlaceholder(value, placeholders) || isReference(value)) continue;

    if (shapeHit) {
      findings.push({ line: i + 1, key, reason: shapeHit, matchedBy: 'shape' });
      continue;
    }
    // `value` means nothing on its own, but inside an auth block it IS the credential. `key` is
    // excluded: in `auth:apikey` that holds the header NAME, so treating it as one cries wolf on
    // every correctly generated collection.
    const named = key && (SECRET_NAME.test(key) || (inAuthBlock && /^(value|token|password)$/i.test(key)));
    if (named && String(value).trim().length >= 8) {
      findings.push({
        line: i + 1,
        key,
        reason: `key name looks like a credential ("${key}")`,
        matchedBy: 'name',
      });
    }
  }

  return findings;
}

/** Human-readable finding line. Never contains the value. */
export const formatFinding = (relPath, f) =>
  `${relPath}:${f.line}  ${f.reason}${f.key && !f.reason.includes(f.key) ? ` [key: ${f.key}]` : ''}`;

/**
 * The other half of this module's job: refuse to WRITE a secret.
 *
 * `scanText` reports a credential already committed, which is one file too late. Every value below
 * arrives from a file inside the repository - `bruno-gen.json`, a legacy `bruno-generator.json`, a
 * `bruno/examples/*.json` body - and a base URL and a live function key are indistinguishable until
 * something classifies them. Nothing did, so `apply` wrote them into files destined for git.
 *
 * Locations are config-shaped paths rather than file:line: the value has no line number yet, and
 * naming the setting is what tells the user which key to change. A finding never carries the value.
 *
 * `matchedBy` carries the confidence, and the caller acts on it. A shape match (a JWT, an AWS key,
 * a padded base64 blob) is a credential whatever it is called, so it is a refusal. A name match is
 * a heuristic - `password: postgres` for a local database, or a dummy value under a key called
 * `apiKey`, are both legitimate - so it is a loud warning instead. Hard-refusing the heuristic
 * would make the tool unusable on ordinary local environments; staying silent about it would hide
 * the one case the name rule exists to catch. This is the same problem/warning split
 * `bruno-gen.json` validation already draws.
 *
 * @returns {Array<{where: string, key: string, reason: string, matchedBy: 'name'|'shape'}>}
 */
export function auditModel(model, { placeholders = [] } = {}) {
  const findings = [];
  const check = (where, key, value) => {
    if (value === undefined || value === null) return;
    const verdict = classify(key, value, { placeholders });
    if (verdict.secret) findings.push({ where, key, reason: verdict.reason, matchedBy: verdict.matchedBy });
  };

  const collection = model.collection ?? {};

  for (const h of collection.headers ?? []) check('default header', h.name, h.value);

  for (const env of collection.environments ?? []) {
    // Every var is checked, including one whose name also appears in `secrets`: the writer emits
    // `vars` verbatim and `secrets` name-only, so a name in both produces two entries and the
    // one carrying the value still lands on disk.
    for (const [name, value] of Object.entries(env.vars ?? {})) {
      check(`environment "${env.name}" variable`, name, value);
    }
  }

  // The credential-bearing field of each auth mode. The schema calls apikey.value "a variable
  // reference, never a literal credential" - this is what makes that description true.
  const auditAuth = (where, auth) => {
    if (!auth) return;
    if (auth.apikey) check(`${where} apikey`, auth.apikey.key ?? 'value', auth.apikey.value);
    if (auth.bearer) check(`${where} bearer`, 'token', auth.bearer.token);
    if (auth.basic) check(`${where} basic`, 'password', auth.basic.password);
    for (const [k, v] of Object.entries(auth.oauth2 ?? {})) {
      if (typeof v === 'string') check(`${where} oauth2`, k, v);
    }
  };
  auditAuth('auth', collection.auth);

  for (const ep of model.endpoints ?? []) {
    const at = ep.endpointKey ?? ep.name ?? 'endpoint';
    for (const h of ep.headers ?? []) check(`${at} header`, h.name, h.value);
    for (const p of ep.params ?? []) check(`${at} ${p.type ?? 'param'}`, p.name, p.value);
    // Per-endpoint auth, which the schema and the writer both accept. Only the collection-level
    // block was audited, so a model carrying `endpoints[].auth.apikey.value = "<literal>"` was
    // written with no check at all.
    if (ep.auth && typeof ep.auth === 'object') auditAuth(`${at} auth`, ep.auth);
    auditBody(ep.body, at, check);
  }

  return findings;
}

/**
 * Every body shape that can carry a value, not only json.
 *
 * A form-urlencoded token request - `grant_type=client_credentials&client_secret=...` - is the
 * commonest credential-bearing body in a real export, and it lives in `entries[]`. `text` and `xml`
 * are unkeyed, so only the shape rules can speak for them, which is all a blob can carry anyway.
 */
function auditBody(body, at, check) {
  if (!body) return;
  if (body.kind === 'json') walkJson(body.json, `${at} body`, check);
  for (const e of body.entries ?? []) check(`${at} body`, e?.name, e?.value);
  for (const field of ['text', 'xml']) {
    if (typeof body[field] === 'string') check(`${at} body`, field, body[field]);
  }
}

/** Body values are nested, and a credential is as leakable at depth 3 as at depth 0. */
function walkJson(node, where, check, depth = 0) {
  if (depth > 6 || node === null || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const item of node) walkJson(item, where, check, depth + 1);
    return;
  }
  for (const [key, value] of Object.entries(node)) {
    if (value !== null && typeof value === 'object') walkJson(value, where, check, depth + 1);
    else check(where, key, value);
  }
}
