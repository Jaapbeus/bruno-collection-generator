#!/usr/bin/env node
// Pre-publication scan of the entire git history.
//
// `check-fixture-hygiene` looks at the working tree. That is not enough before making a repository
// public: a credential deleted three commits ago is still in the history, still fetched by every
// clone, and still visible on GitHub's commit pages. This walks every blob in every reachable
// commit, plus every commit message, and reports what a stranger would be able to read.
//
// Reads only. It cannot rewrite history and does not try - the fix for a real finding is a decision
// (rotate the credential, rewrite the branch, or accept it), never something a check should take.
//
// One deliberate departure from the original design, which called for "a committed customer/supplier
// wordlist": committing a list of real customer and supplier names to a repository that is about to
// become public would publish exactly what the check exists to protect. The wordlist is therefore
// supplied from outside the repository - `--wordlist <path>` or BRUNOGEN_HISTORY_WORDLIST - and what
// is committed here is a fictional example of the format.
//
// Usage:
//   node scripts/check-history.mjs [--wordlist <path>] [--max-bytes 2000000] [--json]
//
// Exit codes: 0 clean · 1 findings · 2 not a git repository / cannot run git

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const has = (name) => args.includes(name);

const MAX_BYTES = Number(flag('--max-bytes', '2000000'));
const AS_JSON = has('--json');
const WORDLIST_PATH = flag('--wordlist', process.env.BRUNOGEN_HISTORY_WORDLIST);

// ---------------------------------------------------------------------------------------------
// What counts as a finding
// ---------------------------------------------------------------------------------------------

// A GUID that is not all-zero. Fixtures use the zero GUID precisely so it can be excluded here,
// and a real GUID in history is usually a tenant, subscription or object id.
const GUID = /\b(?!0{8}-0{4}-0{4}-0{4}-0{12}\b)[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;

const RULES = [
  { id: 'jwt', re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}/g, why: 'JWT-shaped token' },
  { id: 'storage-key', re: /AccountKey\s*=\s*[A-Za-z0-9+/=]{20,}/g, why: 'Azure Storage account key' },
  // Requires an actual signature attached: the bare word appears in this repository's own
  // documentation and detector, where it is the name of a pattern rather than a credential.
  { id: 'sas', re: /SharedAccessSignature\s*=\s*\S{10,}|[?&]sig=[A-Za-z0-9%+/=]{20,}/g, why: 'shared access signature' },
  { id: 'openai-key', re: /\bsk-[A-Za-z0-9_-]{20,}/g, why: 'OpenAI-style secret key' },
  { id: 'github-token', re: /\bgh[pousr]_[A-Za-z0-9]{20,}/g, why: 'GitHub token' },
  { id: 'aws-key', re: /\bAKIA[0-9A-Z]{16}\b/g, why: 'AWS access key id' },
  { id: 'slack-token', re: /\bxox[abprs]-[A-Za-z0-9-]{10,}/g, why: 'Slack token' },
  { id: 'private-key', re: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/g, why: 'private key block' },
  { id: 'functions-key', re: /x-functions-key\s*[:=]\s*["']?[A-Za-z0-9_\-+/=]{30,}/gi, why: 'Azure Functions key' },
  { id: 'base64-secret', re: /(?<![A-Za-z0-9+/=])[A-Za-z0-9+/]{43}=(?![A-Za-z0-9+/=])/g, why: '32-byte base64 secret' },
  { id: 'guid', re: GUID, why: 'GUID (tenant, subscription or object id)' },
  { id: 'ean13', re: /(?<!\d)\d{13}(?!\d)/g, why: '13-digit EAN' },
  {
    id: 'internal-host',
    // Deliberately narrow: a hostname on a cloud service that is not one of the documented
    // example hosts. A bare private IP is not included - RFC1918 addresses are not secrets.
    re: /\b[a-z0-9][a-z0-9-]*\.(?:azurewebsites\.net|azure-api\.net|database\.windows\.net|blob\.core\.windows\.net|servicebus\.windows\.net|table\.core\.windows\.net|datafactory\.azure\.com|onmicrosoft\.com|sharepoint\.com)\b/gi,
    why: 'internal cloud hostname',
  },
];

// Hostnames that are allowed to appear: documentation examples only.
const HOST_ALLOW = /^(example|contoso|localhost|myapp|my-api|your-api|func-example)[.-]/i;

// Paths whose content is machine-generated and full of digests: scanning them produces nothing but
// false positives. Excluded by path, not by shape, so the exclusion is auditable.
const SKIP_PATH = [
  /(^|\/)node_modules\//,
  /(^|\/)scripts\/vendor\//,
  /(^|\/)package-lock\.json$/,
  /(^|\/)SBOM\.json$/,
  /(^|\/)BUNDLE\.sha256$/,
  /(^|\/)bruno-libs\.cjs$/,
  /(^|\/)worker-script\.js$/,
  /\.(png|jpg|jpeg|gif|ico|pdf|zip|gz|tgz|asar|dll|exe|woff2?|ttf|map)$/i,
];

// The files whose job is to describe these patterns. Their own regexes are not findings.
const SELF = /(^|\/)(check-history|check-fixture-hygiene)\.mjs$/;

// Contexts where credential-shaped literals are deliberately planted to exercise the detector.
// The same list check-fixture-hygiene uses, and for the same reason: the fixtures must look like
// credentials or they would not test anything. A finding here is expected - but only if the value is
// visibly fake, which is asserted rather than assumed. A real credential committed into one of these
// paths still fails.
// Kept in step with the same list in check-fixture-hygiene.mjs. `regressions.test.mjs` asserts that
// the write-time gate and the scanner recognise each credential shape, so it has to contain one of
// each; the synthetic-value requirement below still applies to it.
const PLANTED_PATHS = [
  'tests/fixtures/planted-secrets',
  'tests/make-fixtures.mjs',
  'tests/phase1.test.mjs',
  'tests/regressions.test.mjs',
];
const SYNTHETIC = /(.)\1{9,}|example|fixture|placeholder|000000/i;

const isPlanted = (path) => PLANTED_PATHS.some((p) => path === p || path.startsWith(`${p}/`));

function git(argv, { maxBuffer = 512 * 1024 * 1024, input } = {}) {
  // `encoding: 'buffer'` governs stdin as well as stdout, so `input` has to arrive as a Buffer.
  const r = spawnSync('git', argv, {
    encoding: 'buffer',
    maxBuffer,
    input: input === undefined ? undefined : Buffer.from(input, 'utf8'),
  });
  if (r.error || r.status !== 0) {
    const msg = r.stderr ? r.stderr.toString('utf8').trim() : r.error?.message;
    return { ok: false, error: msg || `git ${argv[0]} failed` };
  }
  return { ok: true, out: r.stdout };
}

function loadWordlist() {
  if (!WORDLIST_PATH) return { words: [], from: null };
  if (!existsSync(WORDLIST_PATH)) {
    console.error(`wordlist not found: ${WORDLIST_PATH}`);
    process.exit(2);
  }
  const words = readFileSync(WORDLIST_PATH, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
  return { words, from: WORDLIST_PATH };
}

/** Redact: enough to find it, never enough to use it. */
const redact = (s) => {
  const t = String(s).replace(/\s+/g, ' ').trim();
  if (t.length <= 12) return t;
  return `${t.slice(0, 6)}…${t.slice(-2)} (${t.length} chars)`;
};

function scanText(text, where, wordlist, findings, { isSelf = false, planted = false } = {}) {
  for (const rule of RULES) {
    if (isSelf) break; // the pattern file matches itself by construction
    rule.re.lastIndex = 0;
    const seen = new Set();
    let m;
    while ((m = rule.re.exec(text)) !== null) {
      const value = m[0];
      if (rule.id === 'internal-host' && HOST_ALLOW.test(value)) continue;
      if (seen.has(value)) continue;
      seen.add(value);

      // In a planted context the value must carry a visible fake marker. If it does, the finding is
      // expected and reported separately; if it does not, something real was committed there.
      const expected = planted && SYNTHETIC.test(lineAt(text, m.index));
      findings.push({
        where,
        rule: rule.id,
        why: planted && !expected ? `${rule.why} in a planted-secret path, but it does not look synthetic` : rule.why,
        sample: redact(value),
        line: lineOf(text, m.index),
        expected,
      });
      if (seen.size >= 3) break; // three examples per rule per blob is enough to act on
    }
  }
  for (const word of wordlist) {
    const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    const m = re.exec(text);
    if (m) {
      // Never "expected": a customer or supplier name is a leak wherever it appears, fixture or not.
      findings.push({ where, rule: 'wordlist', why: `wordlist term "${word}"`, sample: word, line: lineOf(text, m.index), expected: false });
    }
  }
}

const lineOf = (text, index) => text.slice(0, index).split('\n').length;

/** The whole line containing `index`, so a fake-value marker anywhere on it is visible. */
function lineAt(text, index) {
  const from = text.lastIndexOf('\n', index) + 1;
  const to = text.indexOf('\n', index);
  return text.slice(from, to === -1 ? text.length : to);
}

function main() {
  if (!git(['rev-parse', '--git-dir']).ok) {
    console.error('not a git repository');
    process.exit(2);
  }

  const { words, from } = loadWordlist();
  const findings = [];

  // ---- every blob ever reachable ---------------------------------------------------------
  const listed = git(['rev-list', '--objects', '--all']);
  if (!listed.ok) {
    console.error(listed.error);
    process.exit(2);
  }

  const blobs = new Map(); // sha -> path (the first path a blob was seen at)
  for (const line of listed.out.toString('utf8').split('\n')) {
    const space = line.indexOf(' ');
    if (space < 0) continue; // commits and tags have no path
    const sha = line.slice(0, space);
    const path = line.slice(space + 1);
    if (!path || path.endsWith('/')) continue;
    if (SKIP_PATH.some((re) => re.test(path))) continue;
    if (!blobs.has(sha)) blobs.set(sha, path);
  }

  // One `cat-file --batch` for everything: a process per blob would take minutes on real history.
  const shas = [...blobs.keys()];
  let scanned = 0;
  if (shas.length) {
    const batch = git(['cat-file', '--batch'], { input: `${shas.join('\n')}\n` });
    if (!batch.ok) {
      console.error(batch.error);
      process.exit(2);
    }
    const buf = batch.out;
    let at = 0;
    while (at < buf.length) {
      const nl = buf.indexOf(0x0a, at);
      if (nl < 0) break;
      const header = buf.toString('utf8', at, nl);
      const [sha, type, sizeText] = header.split(' ');
      if (type !== 'blob') {
        at = nl + 1;
        continue;
      }
      const size = Number(sizeText);
      const start = nl + 1;
      const content = buf.subarray(start, start + size);
      at = start + size + 1; // the trailing newline git adds after the object

      const path = blobs.get(sha) ?? '(unknown path)';
      if (size <= MAX_BYTES && !looksBinary(content)) {
        scanned += 1;
        scanText(content.toString('utf8'), path, words, findings, {
          isSelf: SELF.test(path),
          planted: isPlanted(path),
        });
      }
    }
  }

  // ---- every commit message --------------------------------------------------------------
  const messages = git(['log', '--all', '--format=%H%x00%B%x00']);
  if (messages.ok) {
    const parts = messages.out.toString('utf8').split('\0');
    for (let i = 0; i + 1 < parts.length; i += 2) {
      const sha = parts[i].trim();
      const body = parts[i + 1];
      if (!sha) continue;
      scanText(body, `commit ${sha.slice(0, 9)} (message)`, words, findings);
    }
  }

  // ---- report ----------------------------------------------------------------------------
  const real = findings.filter((f) => !f.expected);
  const expected = findings.filter((f) => f.expected);
  const byRule = {};
  for (const f of real) byRule[f.rule] = (byRule[f.rule] ?? 0) + 1;

  if (AS_JSON) {
    console.log(JSON.stringify(
      { ok: real.length === 0, scanned, blobs: blobs.size, findings: real, expected, byRule, wordlist: from },
      null,
      2,
    ));
    process.exit(real.length ? 1 : 0);
  }

  const group = (list) => {
    const m = new Map();
    for (const f of list) {
      if (!m.has(f.where)) m.set(f.where, []);
      m.get(f.where).push(f);
    }
    return m;
  };

  if (!real.length) {
    console.log(`history ok: ${scanned} text blob(s) across all branches, ${blobs.size} candidate(s), no findings`);
    // Printed rather than suppressed: silence here would hide a real credential appearing in a
    // fixture path later, and the count is the thing a reviewer can compare against last time.
    if (expected.length) {
      console.log(`\n${expected.length} expected finding(s) in planted-secret fixtures, each visibly synthetic:`);
      for (const [where, list] of group(expected)) {
        console.log(`  ${where}`);
        for (const f of list) console.log(`    line ${f.line}  ${f.rule}: ${f.sample}`);
      }
    }
    if (!from) console.log('\nnote: no wordlist supplied - customer and supplier names were not checked');
    console.log('\nThis check cannot prove a repository is safe to publish. Read the diff of anything it flags,');
    console.log('and sign off deliberately.');
    process.exit(0);
  }

  console.error(`history: ${real.length} finding(s) across ${scanned} blob(s) and every commit message\n`);
  for (const [where, list] of group(real)) {
    console.error(`  ${where}`);
    for (const f of list) console.error(`    line ${f.line}  ${f.rule}: ${f.sample}  (${f.why})`);
  }
  if (expected.length) console.error(`\n(${expected.length} further finding(s) in planted-secret fixtures were expected and are not counted.)`);
  console.error('\nValues are redacted. Find each one with:  git grep -n <term> $(git rev-list --all)');
  console.error('Rotate anything real before publishing. Deleting the file is not enough - history keeps it.');
  process.exit(1);
}

/** A NUL byte in the first 8 KB: git's own heuristic, and good enough here. */
function looksBinary(buf) {
  const end = Math.min(buf.length, 8192);
  for (let i = 0; i < end; i += 1) if (buf[i] === 0) return true;
  return false;
}

main();
