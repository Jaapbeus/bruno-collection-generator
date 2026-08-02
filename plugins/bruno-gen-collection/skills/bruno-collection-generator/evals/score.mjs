#!/usr/bin/env node
// Score an extraction-eval case.
//
// Only the invocation needs a human in a fresh session; the scoring does not, and should not. Judging
// "did it find the right endpoints" by reading two JSON files side by side is exactly where a marginal
// result gets talked into a pass, which would make the whole gate decorative.
//
// Usage, from the repository root:
//
//   node evals/score.mjs prep <scratch-dir>
//       Copy the two fixtures somewhere disposable and record a baseline of every file, so "wrote
//       nothing" can be asserted afterwards rather than assumed.
//
//   node evals/score.mjs dotnet-functions-isolated <api-model.json>
//       Score the model a session produced against tests/models/src-dotnet-functions.model.json.
//
//   node evals/score.mjs functions-timer-only <scratch-dir>
//       Assert the fixture copy is untouched. The qualitative half is a checklist to read.
//
// Exit 0 when everything asserted here passes, 1 otherwise. Record the outcome in RESULTS.md with the
// build it ran against - a score without its conditions is not evidence.

import { cpSync, rmSync, mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

// evals/ -> bruno-collection-generator -> skills -> bruno-gen-collection -> plugins -> repo root
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const FIXTURES = {
  'dotnet-functions-isolated': 'tests/fixtures/src-dotnet-functions',
  'functions-timer-only': 'tests/fixtures/src-functions-timer-only',
};
const BASELINE = 'eval-baseline.json';

let failures = 0;
const ok = (m) => console.log(`  PASS  ${m}`);
const bad = (m) => {
  console.log(`  FAIL  ${m}`);
  failures += 1;
};
const note = (m) => console.log(`  NOTE  ${m}`);

/** Hash every file under `root`, keyed by forward-slash relative path. */
function snapshot(root, out = {}, dir = root) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) snapshot(root, out, p);
    else out[relative(root, p).split('\\').join('/')] = createHash('sha256').update(readFileSync(p)).digest('hex').slice(0, 16);
  }
  return out;
}

const [command, arg] = process.argv.slice(2);

if (command === 'prep') {
  if (!arg) {
    console.error('give a scratch directory to copy the fixtures into');
    process.exit(2);
  }
  const scratch = resolve(arg);
  const baseline = {};
  for (const [id, src] of Object.entries(FIXTURES)) {
    const dest = join(scratch, id);
    rmSync(dest, { recursive: true, force: true });
    mkdirSync(dest, { recursive: true });
    cpSync(join(repoRoot, src), dest, { recursive: true });
    // A fixture must start in the state its case assumes: no collection, no lockfile.
    rmSync(join(dest, 'bruno'), { recursive: true, force: true });
    baseline[id] = snapshot(dest);
    console.log(`${id}\n  ${dest}`);
  }
  writeFileSync(join(scratch, BASELINE), `${JSON.stringify(baseline, null, 2)}\n`);
  console.log(`\nBaseline recorded. Point a fresh session at one of those paths, then score it.`);
  process.exit(0);
}

if (command === 'dotnet-functions-isolated') {
  if (!arg || !existsSync(arg)) {
    console.error('give the api-model.json the session wrote');
    process.exit(2);
  }
  const p = JSON.parse(readFileSync(arg, 'utf8'));
  const pinned = JSON.parse(readFileSync(join(repoRoot, 'tests/models/src-dotnet-functions.model.json'), 'utf8'));
  console.log(`CASE  ${command}  (target: high)\n`);

  // Sets, not values: example values are free to differ, an endpoint set is not.
  const compose = (m) => (e) => `${m.collection.routePrefix ?? ''}${e.pathTemplate ?? ''}`;
  const key = (m) => (e) => `${e.method} ${compose(m)(e)}`;
  const got = new Set((p.endpoints ?? []).map(key(p)));
  const want = new Set((pinned.endpoints ?? []).map(key(pinned)));
  const missing = [...want].filter((x) => !got.has(x));
  const extra = [...got].filter((x) => !want.has(x));
  if (!missing.length && !extra.length) ok(`endpoint set exact: ${[...got].join(' | ')}`);
  else {
    if (missing.length) bad(`missing: ${missing.join(' | ')}`);
    if (extra.length) bad(`should not be there: ${extra.join(' | ')}`);
  }

  // pathExactness is pass/fail: a prefix that is wrong 404s every request.
  if (p.collection?.routePrefix === '/api') ok('route prefix is /api, from host.json');
  else bad(`route prefix is ${JSON.stringify(p.collection?.routePrefix)}, expected "/api"`);
  if ((p.endpoints ?? []).every((e) => !/^\/api\b/.test(e.pathTemplate ?? ''))) {
    ok('the prefix is not repeated inside pathTemplate');
  } else bad('a pathTemplate repeats /api, so the URL would be /api/api/...');

  // A non-HTTP trigger in endpoints[] is an automatic failure.
  const emittedTriggers = (p.endpoints ?? []).filter((e) => /nightly|timer|servicebus/i.test(e.name ?? ''));
  if (!emittedTriggers.length) ok('no non-HTTP trigger emitted as a request');
  else bad(`a non-HTTP trigger was emitted: ${emittedTriggers.map((e) => e.name).join(', ')}`);
  if ((p.capability ?? []).some((c) => /timer/i.test(c.subject ?? '') && c.supported === false)) {
    ok('timer-trigger reported as unsupported');
  } else bad('timer-trigger not reported in capability[]');

  const post = (p.endpoints ?? []).find((e) => e.method === 'POST');
  const bodyKeys = Object.keys(post?.body?.json ?? {});
  if (bodyKeys.includes('widget_name')) ok('body uses widget_name, from [JsonPropertyName]');
  else bad(`body keys are ${JSON.stringify(bodyKeys)}; expected widget_name`);
  if (post?.body?.json?.quantity === 12) ok('quantity is 12, from the property initialiser');
  else bad(`quantity is ${JSON.stringify(post?.body?.json?.quantity)}, expected 12`);

  const params = (p.endpoints ?? []).flatMap((e) => (e.params ?? []).map((x) => `${x.in}:${x.name}`));
  for (const need of ['path:id', 'query:country']) {
    if (params.includes(need)) ok(`parameter ${need} found`);
    else bad(`parameter ${need} missing (found ${JSON.stringify(params)})`);
  }

  const unsourced = (p.endpoints ?? []).flatMap((e) => e.params ?? []).filter((x) => !x.source);
  if (!unsourced.length) ok('every parameter records where its value came from');
  else bad(`${unsourced.length} parameter(s) have no source`);

  const auth = p.collection?.auth ?? (p.endpoints ?? []).find((e) => typeof e.auth === 'object')?.auth;
  if (!auth || auth.mode === 'none' || auth.mode === 'inherit') {
    note('no api-key auth in the model; correct only if the user answered "none"');
  } else if (auth.mode === 'apikey' && auth.apikey?.key && auth.apikey?.placement) {
    ok('apikey auth uses the nested block the writer reads');
  } else bad(`auth mode ${auth.mode} without its credential block: ${JSON.stringify(auth)}`);
}

if (command === 'functions-timer-only') {
  const scratch = resolve(arg ?? '.');
  const dir = join(scratch, command);
  const baselinePath = join(scratch, BASELINE);
  if (!existsSync(baselinePath)) {
    console.error(`no ${BASELINE} in ${scratch}; run \`prep\` first`);
    process.exit(2);
  }
  console.log(`CASE  ${command}  (target: high)\n`);
  const base = JSON.parse(readFileSync(baselinePath, 'utf8'))[command];
  const now = snapshot(dir);
  const added = Object.keys(now).filter((k) => !(k in base));
  const modified = Object.keys(now).filter((k) => k in base && now[k] !== base[k]);
  const removed = Object.keys(base).filter((k) => !(k in now));
  if (!added.length) ok('nothing was written');
  else bad(`files created: ${added.join(', ')}`);
  if (!modified.length) ok('nothing was modified');
  else bad(`files modified: ${modified.join(', ')}`);
  if (!removed.length) ok('nothing was deleted');
  else bad(`files deleted: ${removed.join(', ')}`);

  console.log('\nRead what the session said, and judge these by hand:');
  console.log('  - a project was found, but nothing HTTP-shaped');
  console.log('  - the timer AND the service-bus trigger are named as unsupported');
  console.log('  - it did NOT say the repository is empty or has no API');
  console.log('  - it did NOT invent an endpoint to have something to show');
}

if (!['prep', ...Object.keys(FIXTURES)].includes(command)) {
  console.log('usage: node evals/score.mjs prep <scratch> | <case-id> <arg>');
  console.log(`cases: ${Object.keys(FIXTURES).join(', ')}`);
  process.exit(2);
}

console.log(`\n${failures === 0 ? 'PASS' : `FAIL: ${failures} problem(s)`}`);
process.exit(failures ? 1 : 0);
