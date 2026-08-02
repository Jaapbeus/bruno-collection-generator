#!/usr/bin/env node
// No real hosts, keys or personal data anywhere in this repository.
//
// This repository is published publicly and is developed against private corporate codebases, so
// the risk is not hypothetical: a fixture sanitised from a real file keeps the real hostname.
// Fixtures must be written from scratch with fictional values.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Scanned areas. The vendored tree is third-party and excluded wholesale: its lockfile carries
// funding URLs for a hundred packages, none of which are ours to police.
const ROOTS = ['tests', 'docs', 'plugins', 'scripts', 'README.md', 'CHANGELOG.md'];
const EXCLUDE_DIRS = new Set(['node_modules', '.git', '.tmp', 'output', 'vendor']);

// Contexts where credential-shaped literals are deliberately planted to exercise the detector.
// The check still runs here, but only to assert the values are obviously synthetic.
const PLANTED_PATHS = [
  'tests/fixtures/planted-secrets',
  'tests/make-fixtures.mjs',
  'tests/phase1.test.mjs',
  // Asserts that the write-time gate and the scanner catch each credential shape, so it has to
  // contain one of each. Still checked - the values must look obviously synthetic.
  'tests/regressions.test.mjs',
];
const isPlantedContext = (rel) => PLANTED_PATHS.some((p) => rel === p || rel.startsWith(`${p}/`));

const TEXT = /\.(mjs|js|json|md|yml|yaml|bru|ps1|txt|cs|ts|editorconfig|gitattributes|gitignore)$/;

const HOST_ALLOW = [
  /^example\.(com|org|net)$/,
  /^.*\.example\.(com|org|net)$/,
  /^localhost$/,
  /^127\.0\.0\.1$/,
  /^0\.0\.0\.0$/,
  /^usebruno\.com$/,
  /^docs\.usebruno\.com$/,
  /^blog\.usebruno\.com$/,
  /^github\.com$/,
  /^raw\.githubusercontent\.com$/,
  /^json\.schemastore\.org$/,
  /^json-schema\.org$/,
  // The Postman collection-schema identifier. `spec-parse` classifies on this exact string, so a
  // Postman test fixture cannot avoid carrying it.
  /^schema\.getpostman\.com$/,
  /^schema\.opencollection\.com$/,
  /^spec\.opencollection\.com$/,
  /^www\.opencollection\.com$/,
  /^opencollection\.com$/,
  /^code\.claude\.com$/,
  /^docs\.claude\.com$/,
  /^learn\.microsoft\.com$/,
  /^login\.microsoftonline\.com$/,
  /^nodejs\.org$/,
  /^npmjs\.com$/,
  /^www\.npmjs\.com$/,
  /^registry\.npmjs\.org$/,
  /^opensource\.org$/,
  /^agentskills\.io$/,
  /^skills\.sh$/,
  /^www\.skills\.sh$/,
  /^eliteai\.tools$/,
  /^skillkit\.io$/,
  /^terminalskills\.io$/,
  /^lobehub\.com$/,
  /^www\.skillsdirectory\.com$/,
  /^mcpmarket\.com$/,
  /^api\.textlocal\.in$/, // appears in an upstream Bruno doc example we quote
  // Public skill/plugin directories and marketplaces linked from the README.
  // Third-party public sites, not corporate hosts - which is what this check is for.
  /^skills\.rest$/,
  /^claudskills\.com$/,
  /^marketplace\.visualstudio\.com$/,
];

const SECRET_PATTERNS = [
  { id: 'azure-account-key', re: /AccountKey\s*=\s*[A-Za-z0-9+/=]{10,}/ },
  { id: 'azure-sas', re: /SharedAccessSignature\s*=\s*\S{10,}/ },
  { id: 'jwt', re: /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/ },
  { id: 'openai', re: /\bsk-[A-Za-z0-9_-]{20,}/ },
  { id: 'github-token', re: /\b(gh[pousr]_[A-Za-z0-9]{16,}|github_pat_[A-Za-z0-9_]{20,})/ },
  { id: 'aws-key-id', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { id: 'base64-key', re: /(?<![A-Za-z0-9+/])[A-Za-z0-9+/]{43}=(?![A-Za-z0-9+/=])/ },
  { id: 'private-key', re: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/ },
];

// A planted value must be visibly fake: a long run of one character, or "example"/"fixture".
const SYNTHETIC = /(.)\1{9,}|example|fixture|placeholder|000000/i;

// 13-digit EANs and corporate identifiers must never appear.
const EAN = /(?<!\d)\d{13}(?!\d)/;

// Dutch BSN (citizen service number, GDPR/AVG special-category identifier). Checked with the
// "elfproef" so an incidental 9-digit run (a hash fragment, a version stamp) doesn't false-positive -
// only a value that is actually shaped like a real BSN gets flagged.
const BSN = /(?<!\d)\d{9}(?!\d)/g;
function isValidBsn(raw) {
  if (raw === '000000000') return false;
  const d = raw.split('').map(Number);
  let sum = 0;
  for (let i = 0; i < 8; i++) sum += d[i] * (9 - i);
  sum -= d[8];
  return sum !== 0 && sum % 11 === 0;
}

// IBAN, any country. Checked with the mod-97 rule for the same reason as the BSN check above.
const IBAN = /\b[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b/g;
function isValidIban(raw) {
  const rearranged = raw.slice(4) + raw.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (c) => (c.charCodeAt(0) - 55).toString());
  let remainder = 0;
  for (let i = 0; i < numeric.length; i += 7) {
    remainder = Number(`${remainder}${numeric.slice(i, i + 7)}`) % 97;
  }
  return remainder === 1;
}

// Email addresses. Placeholder domains (example.com and friends, already trusted for hosts above)
// and GitHub's own noreply addresses are the only ones a legitimate doc/fixture should ever contain.
const EMAIL = /[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;
const EMAIL_HOST_ALLOW = [...HOST_ALLOW, /^([a-z0-9-]+\.)?users\.noreply\.github\.com$/];

const problems = [];
let scanned = 0;

function* files(start) {
  const abs = join(repoRoot, start);
  if (!existsSync(abs)) return;
  if (statSync(abs).isFile()) {
    yield abs;
    return;
  }
  const stack = [abs];
  while (stack.length) {
    const dir = stack.pop();
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) {
        if (EXCLUDE_DIRS.has(e.name)) continue;
        stack.push(join(dir, e.name));
      } else if (TEXT.test(e.name)) {
        yield join(dir, e.name);
      }
    }
  }
}

// A generator artefact left inside a fixture.
//
// Running the skill against a fixture for real - which is a reasonable thing to do - makes `adopt`
// write `.bruno-gen/lock.json` into it. The file is untracked, so CI keeps passing from a fresh
// clone while the tests fail on the machine where it happened, which is the most confusing direction
// for a failure to point. The legacy-sidecars fixture specifically means "a collection with no
// lockfile"; a lockfile silently changes what several tests assert.
for (const dir of ['tests/fixtures']) {
  const stack = [join(repoRoot, dir)];
  while (stack.length) {
    const current = stack.pop();
    let entries;
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const full = join(current, e.name);
      if (e.name === '.bruno-gen') {
        problems.push(
          `${relative(repoRoot, full).split(sep).join('/')}  generator artefact inside a fixture; ` +
            'delete it (a fixture must stay in the state its tests assume)',
        );
        continue;
      }
      stack.push(full);
    }
  }
}

for (const root of ROOTS) {
  for (const file of files(root)) {
    const rel = relative(repoRoot, file).split(sep).join('/');
    const planted = isPlantedContext(rel);
    let text;
    try {
      text = readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    scanned++;
    const lines = text.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const at = `${rel}:${i + 1}`;

      // Hostnames outside the allow-list. A "host" made only of dots or dashes is not a host:
      // `https://...` is the documentation ellipsis the value sanitiser exists to reject, and it
      // appears in that sanitiser's own source and tests.
      for (const m of line.matchAll(/https?:\/\/([A-Za-z0-9._-]+)/g)) {
        const host = m[1].toLowerCase();
        if (!/[a-z0-9]/.test(host)) continue;
        if (!host.includes('.') && host !== 'localhost') continue; // a bare word is not a domain
        if (!HOST_ALLOW.some((re) => re.test(host))) {
          problems.push(`${at}  non-allow-listed host "${host}"`);
        }
      }

      // Credential shapes.
      for (const { id, re } of SECRET_PATTERNS) {
        if (!re.test(line)) continue;
        if (planted) {
          if (!SYNTHETIC.test(line)) {
            problems.push(`${at}  planted ${id} does not look synthetic (needs a repeated-character run or "example"/"fixture")`);
          }
        } else {
          problems.push(`${at}  ${id} shape outside the planted-secrets fixture`);
        }
      }

      // EAN-shaped digit runs, BSNs, IBANs and email addresses. Allow them in this checker's own
      // source, which is where their patterns and worked examples live.
      const isSelf = rel.endsWith('scripts/check-fixture-hygiene.mjs');
      if (!isSelf && EAN.test(line)) {
        problems.push(`${at}  13-digit identifier (EAN shape)`);
      }

      if (!isSelf) {
        for (const m of line.matchAll(BSN)) {
          if (!isValidBsn(m[0])) continue;
          if (planted) {
            if (!SYNTHETIC.test(line)) {
              problems.push(`${at}  planted bsn does not look synthetic (needs "example"/"fixture" nearby)`);
            }
          } else {
            problems.push(`${at}  BSN-shaped, checksum-valid 9-digit number (GDPR/AVG special-category data)`);
          }
        }

        for (const m of line.matchAll(IBAN)) {
          if (!isValidIban(m[0])) continue;
          if (planted) {
            if (!SYNTHETIC.test(line)) {
              problems.push(`${at}  planted iban does not look synthetic (needs "example"/"fixture" nearby)`);
            }
          } else {
            problems.push(`${at}  IBAN-shaped, checksum-valid value`);
          }
        }

        for (const m of line.matchAll(EMAIL)) {
          const host = m[1].toLowerCase();
          if (EMAIL_HOST_ALLOW.some((re) => re.test(host))) continue;
          problems.push(`${at}  email address on a non-allow-listed domain "${host}"`);
        }
      }
    }
  }
}

if (problems.length) {
  for (const p of problems) console.error(`FAIL  ${p}`);
  console.error(`\n${problems.length} hygiene problem(s) across ${scanned} files.`);
  process.exit(1);
}
console.log(`fixture hygiene ok (${scanned} files scanned, no real hosts, keys, BSNs, IBANs or emails)`);
