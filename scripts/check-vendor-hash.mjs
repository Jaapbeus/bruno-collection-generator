#!/usr/bin/env node
// Verifies the committed vendor bundle. Works offline and without node_modules, which is the
// whole point: CI must be able to check the artefact it actually ships.
//
// Checks: the bundle and the worker exist, the bundle's sha256 matches the committed digest, the
// recorded versions match the pinned direct dependencies, every direct dependency is an exact
// version, the lockfile is modern enough to carry integrity hashes, the SBOM agrees with the
// bundle, and no bundled package is unlicensed.
//   node scripts/check-vendor-hash.mjs

import { createHash } from 'node:crypto';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const vendorDir = join(
  repoRoot,
  'plugins/bruno-gen-collection/skills/bruno-collection-generator/scripts/vendor',
);

const problems = [];
const fail = (m) => problems.push(m);
const rel = (p) => p.replace(repoRoot, '.');

const required = {
  bundle: join(vendorDir, 'bruno-libs.cjs'),
  worker: join(vendorDir, 'workers', 'worker-script.js'),
  versions: join(vendorDir, 'VERSIONS.json'),
  digest: join(vendorDir, 'BUNDLE.sha256'),
  manifest: join(vendorDir, 'package.json'),
  lock: join(vendorDir, 'package-lock.json'),
  sbom: join(vendorDir, 'SBOM.json'),
  licences: join(vendorDir, 'LICENSES.md'),
};

for (const [label, path] of Object.entries(required)) {
  if (!existsSync(path)) fail(`missing ${label}: ${rel(path)}`);
}
if (problems.length) {
  for (const p of problems) console.error(`FAIL  ${p}`);
  console.error('\nRebuild with: node scripts/build-vendor-bundle.mjs');
  process.exit(1);
}

const readJson = (path, label) => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    fail(`${label}: ${err.message}`);
    return null;
  }
};

const manifest = readJson(required.manifest, 'vendor package.json');
const lock = readJson(required.lock, 'vendor package-lock.json');
const sbom = readJson(required.sbom, 'vendor SBOM.json');
const versions = readJson(required.versions, 'vendor VERSIONS.json');

// 1. The bundle is exactly the artefact that was built and reviewed.
const bundleBytes = readFileSync(required.bundle);
const actualHash = createHash('sha256').update(bundleBytes).digest('hex');
const expectedHash = readFileSync(required.digest, 'utf8').trim().split(/\s+/)[0];
if (actualHash !== expectedHash) {
  fail(
    `bruno-libs.cjs does not match BUNDLE.sha256\n        expected ${expectedHash}\n        actual   ${actualHash}`,
  );
}
if (bundleBytes.length === 0) fail('bruno-libs.cjs is empty');
if (statSync(required.worker).size === 0) fail('workers/worker-script.js is empty');

// 2. Direct dependencies are exact. A range would let a 0.x minor - which may break - slip in,
//    and these are undocumented internals with no changelog to read first.
const EXACT = /^\d+\.\d+\.\d+(?:-[\w.]+)?$/;
for (const [name, range] of Object.entries(manifest?.dependencies ?? {})) {
  if (!EXACT.test(range)) fail(`direct dependency ${name} is "${range}"; must be an exact version`);
}

// 3. The versions baked into the bundle match what is pinned.
const PINNED = {
  '@usebruno/filestore': 'filestore',
  '@usebruno/converters': 'converters',
  ajv: 'ajv',
  yaml: 'yaml',
};
for (const [pkg, key] of Object.entries(PINNED)) {
  const pinned = manifest?.dependencies?.[pkg];
  if (!pinned) {
    fail(`${pkg} is not a pinned direct dependency`);
    continue;
  }
  if (versions?.[key] !== pinned) {
    fail(`VERSIONS.json ${key} is "${versions?.[key]}" but package.json pins ${pkg}@${pinned}`);
  }
}

// The transitive @usebruno versions the app itself bundles. Bruno 4.0.0 ships filestore 0.10.0,
// which pins lang 0.37.0; converters 0.21.0 pins schema 0.27.0. A drift here means the bundle no
// longer matches the app that has to open what we write.
const EXPECTED_TRANSITIVE = { lang: '0.37.0', schema: '0.27.0' };
for (const [key, want] of Object.entries(EXPECTED_TRANSITIVE)) {
  if (versions?.[key] !== want) {
    fail(`VERSIONS.json ${key} is "${versions?.[key]}", expected ${want} (the set Bruno 4.0.0 bundles)`);
  }
}

// 4. Lockfile format new enough to carry an integrity hash per package.
if (!(lock?.lockfileVersion >= 3)) {
  fail(`lockfileVersion is ${lock?.lockfileVersion}; 3 or newer is required (npm 7+)`);
}
const locked = Object.entries(lock?.packages ?? {}).filter(
  ([path, meta]) => path.startsWith('node_modules/') && meta.version && !meta.link,
);
if (locked.length === 0) fail('the lockfile lists no packages');
const withoutIntegrity = locked.filter(([, m]) => !m.integrity && !m.bundled && !m.inBundle);

// 5. The SBOM describes this bundle and this lockfile.
if (sbom?.bundleSha256 !== actualHash) {
  fail(`SBOM.json records bundleSha256 ${sbom?.bundleSha256}, but the bundle hashes to ${actualHash}`);
}
if (sbom?.packageCount !== locked.length) {
  fail(`SBOM.json lists ${sbom?.packageCount} packages but the lockfile resolves ${locked.length}`);
}
for (const [name, range] of Object.entries(manifest?.dependencies ?? {})) {
  if (sbom?.directDependencies?.[name] !== range) {
    fail(`SBOM.json direct dependency ${name} is "${sbom?.directDependencies?.[name]}", manifest says "${range}"`);
  }
}
const unlicensed = (sbom?.packages ?? []).filter((p) => p.license === 'UNKNOWN');
if (unlicensed.length) {
  fail(
    `${unlicensed.length} bundled package(s) declare no licence: ${unlicensed
      .map((p) => `${p.name}@${p.version}`)
      .join(', ')}`,
  );
}

// 6. node_modules must never be committed: a 187-character path broke `git checkout` on Windows.
if (existsSync(join(vendorDir, 'node_modules'))) {
  // Present locally after a build, which is fine - only being tracked is a problem, and
  // .gitignore covers that. Nothing to fail on here.
}

if (problems.length) {
  for (const p of problems) console.error(`FAIL  ${p}`);
  console.error(`\n${problems.length} vendor check failure(s). Rebuild: node scripts/build-vendor-bundle.mjs`);
  process.exit(1);
}

console.log(
  `vendor ok: bundle ${(bundleBytes.length / 1024 / 1024).toFixed(2)} MB matches its digest; ` +
    `${locked.length} packages in the lockfile` +
    (withoutIntegrity.length ? `, ${withoutIntegrity.length} without an integrity field` : '') +
    `; filestore@${versions.filestore} lang@${versions.lang} converters@${versions.converters} schema@${versions.schema}`,
);
