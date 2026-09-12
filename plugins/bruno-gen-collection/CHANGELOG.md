# Changelog

Versioning rule: **a minor bump means the emitted output may change** (golden files moved); a patch bump
means no output change. That makes "will this dirty my collection?" answerable from the version alone.

## 2.0.0-alpha.10 — unreleased

Two independent reviews before public release, landing together: a portability and safety pass, and a
full-codebase architectural review. Roughly fifty defects, grouped below by the promise each broke.
Where both reviews touched the same module the result keeps both guarantees; the merge commit records
the reasoning file by file.

### Fixed — a credential is never written
- `auditModel` looked only at collection-level auth and JSON bodies, so a
  `grant_type=client_credentials` form body carrying a real `client_secret` — the commonest
  credential-bearing body in a real Postman export — was never checked. Form, XML, text and
  per-endpoint auth are all covered now.
- Parser and reader errors no longer quote the file back. The vendored readers write a code frame to
  stdout naming the offending line, and V8's JSON errors embed a window of the source, so
  `local.settings.json` could reach a pasteable report or a `--json` payload.
- Base64 credential detection covers unpadded values: a 40-byte Azure Functions key is 56 characters,
  which the padded-only rule never matched.
- A name-shaped match still warns and proceeds; only a shape match refuses. A finding carries
  locations, never the value.

### Fixed — the user's work is never lost
- An unparseable environment read back as an *empty* one, and the secret carve-out then "added the
  missing secret" by replacing a hand-edited file holding a real base URL and tenant with nothing but
  the secret's name. The vendored readers signal a parse failure three different ways and none is a
  plain throw; `parseStrict` turns all three into one, and an environment that cannot be parsed is now
  reported and left alone.
- Moved-request detection matched a basename *suffix*, so a hand-written `legacy-get-widgets.bru` was
  reported as the move target for a deleted `get-widgets.bru` and the endpoint silently never came
  back. Identity is confirmed by parsing, and only a same-name-elsewhere or same-directory-renamed
  candidate counts.
- The secrets carve-out tested `text.includes(name)`, so a variable called `functionKeyName` passed for
  a declaration of `functionKey` and the secret was never added.
- `plan`'s reads were unguarded: a directory sitting where a request file belongs killed `plan` *and*
  `apply` with a raw `EISDIR` stack, from a command that advertises it cannot fail.
- The run lock was keyed on the CLI `--root` rather than the resolved collection, so
  `apply --root repo` and `apply --root repo/bruno` did not exclude each other at all. It is now held
  across planning as well as the write, so a plan is never applied against a collection another run has
  since changed.
- A lockfile key claiming a path outside the collection is reported and never offered for pruning.
- **`--reset <path>` did not check for the one hash that must never be reset.** It cleared any owned
  entry's recorded hash so the next write would go through, including one whose hash was `"adopted"` —
  silently converting a hand-written file into a machine-owned one and destroying the exact marker that
  is supposed to protect it forever. `--reset` now refuses an adopted path by name, the same way
  `--prune` already did.
- A renamed request's lockfile entry stayed at its old, now-nonexistent path forever: `apply` reported
  the move but never recorded the file under its real name. It is migrated to the new path now, unless
  the entry is adopted, which is never touched.

### Fixed — re-running changes nothing
- A query value went into the URL unencoded, so an `&` in one started a second query parameter. Only
  the spans between `{{variable}}` references are encoded, because a reference must survive verbatim.
- A folder named `Environments` — an ordinary OpenAPI tag — slugged onto the `environments` directory,
  where every request inside it became invisible to `doctor`, `adopt` and orphan detection. Reserved
  names are now avoided per format and per position.
- Ordering is by code point everywhere, so a machine's locale cannot change the output.

### Fixed — the report describes what happened
- An external or dangling `$ref` dropped a whole path, parameter or request body without a word: a
  multi-file spec ingested to an empty-but-valid model and exited 0. Every drop is now named, with a
  capability entry saying to bundle the spec first.
- An operation-level parameter did not override the path-level one of the same name and location, as
  OpenAPI requires — a `required: true` override came out optional and carrying the wrong value.
- Postman and WSDL imports hard-coded an empty base URL, so an imported collection always needed the
  host typed in by hand. It is derived from the first imported request's origin.
- Cookie parameters, TRACE, `oneOf`/`anyOf` reduction, unhonourable `style`/`explode`, and body modes
  the writer cannot express are all named rather than silently dropped.
- `capability[]` was rendered only by `probe`, so anything `ingest` declined to write was recorded in
  the model and shown to nobody.
- Taking over a stale run lock is reported in `--json`, not only in the text report.
- `probe` says when a file cap truncated the scan, so "no HTTP surface here" is never a guess.
- **A required parameter could be wrongly treated as already reported.** The check that a required,
  empty value is listed in `unresolved[]` matched a parameter's name as a *substring* of the field it
  was comparing against, so `id` was "found" inside `/params/path/widgetId/value` and a genuinely
  missing `id` entry passed validation anyway. It now requires an exact segment match.
- A discriminated body's injected `kind` value could mutate a node shared with another branch or
  endpoint in the parsed spec tree, because the example object it wrote into was not always a copy.
  It is copied before the write now.

### Fixed — portability and the command surface
- Run locks are now created exclusively, identify the actual collection rather than the caller's
  spelling of its repository, follow the volume's real case semantics, never evict a live long-running
  local process, and use an ownership token so an old process cannot remove its successor's lock.
- `smoke` no longer invokes a shell on Windows. It resolves Bruno outside the inspected repository,
  passes every variable as an argv value, and redacts both supplied and environment-held credentials
  from command, stderr, reporter URL and error output. `--yes=false` is a refusal, not consent, and
  repository-supplied collection scripts are explicitly pinned to Bruno's safe sandbox.
- `doctor` now scans and resolves variables in collection roots, folder files and `bruno.json`, not
  only request and environment files.
- Probe digests now hash source, description, manifest and bounded build-artifact content. Equal-size
  edits change the digest, and capped traversal is deterministic across NTFS, APFS and ext4.
- Case/Unicode-equivalent collection and lockfile paths are handled as one portable file. Physical
  collisions are refused, fully renamed requests are recognised by endpoint identity, and three or
  more variants cannot be assigned the same path.
- Every owned write uses an unpredictable, exclusive temporary file before rename. WSDL reads now
  have the same size limit as JSON and YAML input.
- CLI options are command-specific and reject unknown, missing, empty or duplicate values instead of
  silently accepting typos. Human reports escape terminal control characters.
- GitHub workflows use the current Node 24-based checkout and setup actions rather than deprecated
  Node 20-based action runtimes.
- The HTTP-marker comment stripper treated a literal `//` inside a string (a route like `"/a//b"`) as
  the start of a line comment, silently dropping the rest of that source line — including a marker
  after it. It now tracks string literals and never strips inside one.

### Changed
- The runtime version lives in one small module, is printed by `version`, and is checked against the
  public plugin manifest so marketplace updates and generated lockfiles cannot drift.

### Documented
- **`/plugin` is a CLI command, and the README did not say so.** Hit on a real install: in the VS Code
  extension `/plugin marketplace add` answers "isn't available in this environment", and the invocation
  attempted next then fails with `Unknown command: /bruno-gen-collection:bruno-collection-generator` —
  which reads as a broken plugin or a wrong command name when the syntax was right all along. The
  Install section now names the CLI as the place those two commands run, says the editor extensions pick
  the plugin up afterwards because it lands in `~/.claude`, and carries a Troubleshooting table mapping
  each of those two messages to its cause. The SSH-clone default moved up against the command block it
  breaks, rather than sitting below where nobody hitting it would look.
- **A secret or PII scanner will flag the lockfile, and it will be wrong.** Found on a real pipeline:
  gitleaks and a hand-rolled pattern scan both matched a Dutch mobile number *inside* a sha256 digest in
  `.bruno-gen/lock.json`. Not bad luck — a digest matches `06[-\s]?[0-9]{8}` 0.48% of the time, so a
  collection of 300 files trips it 77% of the time. `reference/security.md` explains why the finding is
  provably a false positive (the lockfile has no field that can carry a value) and `docs/ci.md` gives the
  repair: anchor the pattern, because hex letters are word characters and `\b` keeps the rule out of
  digests. No code change — the emitted hash stays hex.
- **A deep, full-codebase pass against every doc claim, not only a recent change.** Six parallel
  reviews, one per module group, each cross-checking README/CLAUDE.md/`docs/`/`reference/` against the
  code and, where feasible, against a live run. Two real code defects came out of it (above); the rest
  was documentation that had quietly drifted from what the code now does:
  - `docs/ci.md`'s credential-check example read `d.suspectedSecrets` / `s.file` / `s.rule` — fields
    that do not exist. `doctor --json` returns `secretFindings` with `.path`/`.reason`/`.key`; as
    written, the example's `?.length` was always `undefined` and the documented CI gate could never
    fire. Fixed, and the same table now says `--allow-unresolved` is `apply`-only, not a general fix
    for exit 4 — `docs/ci.md`'s own suggested `plan --json` pipeline step does not accept it.
  - `reference/security.md` — the file the model itself reads before writing a value — still described
    the pre-alpha.10 base64 shape (43–44 chars, the 32-byte case only) and was missing two name
    keywords (`subscription-key`, `access-key`) already live in `secrets.mjs`. Updated to match.
  - README's `.bru` quick-reference table listed `#` as a valid whole-line comment. Tested directly
    against the vendored parser: it throws. The row now says there is no comment syntax, matching
    `reference/bru-and-yml-format.md`.
  - README said body-type resolution "recurses three levels deep"; the code processes depths 0–5 (six
    levels) before truncating. Corrected. README's test count (300) was stale by the four tests this
    review itself added, plus one more the previous count had simply missed; both are listed at 309 now.
  - README's config field list did not mention `$schema` and `extras`, both accepted without a warning,
    and did not list the single-auth-recipe-per-collection limitation (a per-operation OpenAPI
    `security` override is not read). Both added.
  - `marketplace.json`'s `owner.url` and `plugin.json`'s `author.url` used a different letter case
    (`jaapbeus`) than the `repository`/`homepage` URLs in both files (`Jaapbeus`). Made consistent.

## 2.0.0-alpha.9 — unreleased

Found by running probe against the real corpus, read-only - the manual end-to-end pass the plan asks
for and nobody had done.

### Fixed
- **A git worktree copy was reported as a separate project.** `.claude/worktrees/` holds whole copies
  of the repository, so a repository with two APIs reported **eight** plausible projects across four
  worktrees, and probe asked which of the eight was wanted. That is an unanswerable question about a
  repository that has two, and the copies are not projects in any case. `.claude`, `.worktrees`,
  `worktrees`, `.cursor` and `.vscode-test` now join the skipped directories.

### Verified against real repositories
- `repo-bre` (FastEndpoints) — the repository where the PowerShell version found **zero** endpoints.
  Both APIs are now recognised: `src/Bre.Api` as FastEndpoints and `src/Bre.Web` as ASP.NET minimal
  API, with all fifteen non-API projects scored negative and excluded from the choice. Exit 5, because
  two APIs genuinely is a question.
- `Sportlink-wedstrijdzaken` — an OpenAPI description with 72 operations plus an Azure Functions app,
  with the timer trigger named as unsupported and the test project excluded.

## 2.0.0-alpha.8 — unreleased

Two more found by a real run against a migrated collection. Both verified in the code before being
fixed, and both now have a regression test built from the scenario that produced them.

### Fixed — cross-platform behaviour, found by CI failing on ubuntu alone
- **An environment file was written lower-cased.** `safeSegment` folded `Local` to `local.bru`. On a
  case-insensitive filesystem that *is* the user's existing `Local.bru`, so it appeared to work; on
  Linux it is a **second** file, and the real one never received the secret name it needed. Same input,
  different output per platform — which the determinism this tool sells rules out. Environment names
  keep their case now: it is how the user addresses them (`--env Local`), and case was always meant to
  be folded for *comparison* only.
- **Sorting used `localeCompare` in 19 places.** It orders by the runtime's default locale, which Node
  reads from the environment, and several of those sorts decide emitted order — and `seq` follows
  emission order. Two machines with different locales produced different bytes from one model. The
  disagreement is real, not theoretical: `'a'` vs `'B'`, `'Local'` vs `'local'` and `'x-api-key'` vs
  `'X-Api-Key'` all invert. Replaced with a code-point comparator, including in the SBOM builder, whose
  output is committed and digest-verified.
- Windows device names (`CON`, `AUX`, …) were only escaped when written in lower case.

### Added
- **`tests/portability.test.mjs`** — the whole class, asserted from properties so it holds on any
  platform: locale-independent ordering (including a source scan, so a reintroduced `localeCompare`
  fails a test), forward-slash paths and lockfile keys, NFC/NFD equivalence (macOS hands out NFD),
  CRLF-insensitive hashing, reserved names in any case, and the path-length cap.
- `check-line-endings` now fails on two tracked paths that differ only by case — checked against git's
  index, because a case-insensitive filesystem cannot show you both names. That makes the class visible
  on Windows, where it was previously impossible to observe.

### Fixed
- **Legacy migration discarded declared secret names.** `layerSettings` replaced
  `collection.environments` wholesale whenever config or the legacy sidecars produced any, and legacy
  `envList()` always builds `secrets: []`. So migrating a collection and adding its first
  authenticated endpoint threw away the `functionKey` declaration the model had made: every request
  referencing `{{functionKey}}` had no environment declaring it, and every call 401s. `doctor` reports
  the symptom, but only if someone runs it — the same failure class as an auth mode with no credential
  block, one layer further out.

  Which environments exist and what their base URLs are is a **settings** question. Which secret names
  the requests need is **not** — that follows from the auth recipe in the model, and the two facts are
  orthogonal. Secret names are now unioned in, and into *every* environment rather than only the one
  that named it: a request needs its key wherever it runs, and a declared name with an empty value
  costs nothing while a missing one costs a 401.
- **A new endpoint could take a seq an adopted sibling already had.** "Taken" was computed only over
  endpoints in the current model, so on a migrated collection the first new request landed on `seq: 1`
  beside an existing `seq: 1` — which `doctor` then reported as an ambiguous sidebar order. Slightly
  broader than reported: `frozen.seqs` is keyed by `endpointKey`, so even a lockfile entry for an
  adopted file could not answer "which numbers are taken in this directory". `frozenFrom` now also
  returns `takenByDir`.
- **`endpoints[].seq` was dead input.** The schema advertises it as settable and the writer never read
  it. Precedence is now: what is already on disk (frozen), then what the model asked for, then the next
  free number in that directory.

## 2.0.0-alpha.7 — unreleased

Everything here was found by installing the plugin and running it once, for real, against a fixture.

### Fixed
- **An auth mode with no credential block produced an unauthenticated request.** A real run wrote
  `{"mode":"apikey","in":"header","name":"x-functions-key","value":"{{functionKey}}"}` — a perfectly
  reasonable-looking shape, and not the one the writer reads. `$defs/auth` required only `mode` and
  allowed anything else, so it validated; the file came out with `auth: apikey` and **no credential at
  all**. Bruno accepts that, and every call 401s with nothing in the collection to explain why — which
  is precisely the 100%-failure mode the design calls out.

  `$defs/auth` now requires the nested block named after the mode (`apikey`/`bearer`/`basic`/`oauth2`),
  constrains `apikey` to `key` + `value` + `placement` (`header` or `queryparams` — Bruno's own word),
  and sets `additionalProperties: false` so `in`/`name` are rejected by name. The writer refuses too,
  rather than silently emitting a request that cannot authenticate.
- **A stray generator artefact in a fixture silently changed what the tests meant.** Running the skill
  against `tests/fixtures/legacy-sidecars` makes `adopt` write a `.bruno-gen/lock.json` into it. The
  file is untracked, so CI kept passing from a fresh clone while the same tests failed on the machine
  where it happened. The test harness now strips `.bruno-gen` from every fixture copy, and
  `check-fixture-hygiene` fails on one it finds — the fixture means "a collection with no lockfile", and
  that is the precondition several tests assert.

### Added
- **`reference/auth-recipes.md`** — the exact object per mode, with the wrong shape shown as the
  counter-example. The card said *when* to use an api key and never *what to write*, which is the gap
  the model fell into. `SKILL.md` and both source cards now point at it before `auth` is written.
- Execution-gate coverage for **per-request** auth: an endpoint with its own api key, asserted at the
  loopback to arrive with its own header and *not* to inherit the collection's. The gate previously only
  covered `auth: inherit`, which is why this got through.
- Schema and writer tests using the failing shape verbatim.

## 2.0.0-alpha.6 — unreleased

The real-Bruno execution gate. Everything up to here proved we wrote the bytes we meant to write; this
is the first thing that proves a generated collection actually **runs**.

### Added
- **`tests/execution.test.mjs` + `tests/lib/loopback.mjs`** — `apply` a collection, point it at a
  recording HTTP server on `127.0.0.1`, run it with Bruno's own CLI, and assert on what arrived: the
  route prefix appearing exactly once, a path parameter substituted rather than sent as `{id}`, a
  required query parameter present and a `~`-disabled one absent, the JSON body intact, and — the case
  this exists for — **an `auth: inherit` request arriving with the collection's credential attached**.
  Auth wiring is a 100%-failure mode: get it wrong and every request fails identically while the
  collection looks perfect. Nothing previously proved it worked.
- **`smoke --var name=value`** — supplies a variable for one run, passed to Bruno as `--env-var`.
  Necessary, not convenient: secrets are declared by name with an **empty value**, so a collection whose
  auth uses one could not authenticate at all. The value is never written to disk, and the value half is
  redacted when the command is echoed back for approval.
- CI: a required `execution` job pinning `@usebruno/cli@4.0.0`, which also asserts the gate did not skip
  itself — the test file skips when the CLI is absent, so a green tick would otherwise be compatible
  with the gate never having run. Plus `bruno-latest.yml`, a weekly non-blocking run against
  `@usebruno/cli@latest` that opens one issue per failing version.

### Fixed
- **`destructive` never reached the file.** The IR carried it as a boolean and the only thing that
  consumed it was the decision not to attach an assert — but the way anything outside this tool avoids a
  destructive request is `--exclude-tags destructive`, a **tag**. So `smoke` promised to skip destructive
  requests and would have sent them. `destructive: true` now always emits the tag.
- **A wall of 500s reported "none failed".** Setting the bar at "was the request sent" was right for a
  4xx and wrong for a 5xx. There are three outcomes now: `ok` (2xx/3xx), `reached` (4xx — built,
  resolved, sent and rejected, which is the normal result with no key supplied) and `fail` (nothing sent,
  a failed assertion, or 5xx). Only `fail` exits non-zero, and `reached` is called out rather than folded
  into success.
- `docs/ci.md` claimed Bruno reads secrets from the process environment. It does not; the example now
  uses `--var`.

### Notes
- Measured while building this: **`bru run` exits 0 even when every request fails** with
  `ECONNREFUSED`. That is why `smoke` decides pass/fail from the parsed reporter rather than the child's
  exit status, and why the gate asserts on the reporter rather than on `status === 0`.
- The gate spawns every child process **asynchronously**. The recorder runs in the test process, and
  `spawnSync` blocks the event loop for the child's whole life — so the server cannot accept the
  connection, and bru sits there until its own socket timeout. The first version of the test did exactly
  that and hung for two minutes per case.

## 2.0.0-alpha.5 — unreleased

Configuration, multi-project selection, legacy migration and `smoke`. Every command is now
implemented.

### Added
- **`bruno-gen.json`** — name, output directory, format, base path, environments, headers, auth,
  placeholder allow-list, and `projects[]`. Treated as untrusted input throughout, because it arrives
  from the repository being inspected: a path that escapes the repository is a hard error, a bad regex
  is caught at load time rather than thrown from the secret scanner, and an unknown key is a
  **warning** so a config written for a later version still runs here.
- **Project selection.** A repository holding several APIs exits **5** with a scored catalogue and a
  question, from `probe`, `ingest`, `plan` and `apply` alike. `--project <name|path>` answers it for one
  run; `projects[]` settles it permanently. Never first-file-wins — a collection generated for the
  wrong service looks completely normal, which is exactly why nobody notices.
- **Legacy migration**, read-then-deprecate. `bruno-generator.json`, `bruno/BaseUrl.json`,
  `bruno/examples/*.json` and `bruno-examples.json` are read as settings and **never modified, moved or
  deleted** — reverting to the old skill finds every file as it was. They enter at the config tier, so a
  body you typed by hand outranks one synthesised from a C# class.
- **`smoke`** — runs the collection with Bruno's own CLI. Without `--yes` it prints the command, the
  environment and the request count and sends nothing. Requests tagged `destructive` are excluded, the
  reporter runs with headers and bodies skipped, and query values are redacted before anything is
  printed.
- **`scripts/check-history.mjs`** — the publication precondition: every blob in every branch plus every
  commit message, scanned for credentials, non-zero GUIDs, EANs and internal cloud hostnames. Values are
  redacted in the output. Findings inside the planted-secret fixtures are printed but not counted, and
  only when they carry a visible fake marker — a real credential committed there still fails.
- `docs/` — CI, adding a source card, and the capability matrix. README rewritten for v2, with every
  differentiator tied to the test that holds it up.

### Fixed
- **A build artefact could make a directory look like an API.** Every .NET test project carries a
  `bin/**/functions.metadata`, so `tests/Foo.Tests` counted as a second plausible project and turned a
  perfectly unambiguous repository into exit 5. An artefact is a best-effort *value* source — usually
  gitignored, often stale — and never a description. Found by running the gate on a real repository,
  which the synthetic fixtures had not covered.
- **An adopted file the model does not describe was reported as an `orphan`.** That reads as "the
  generator wrote this and it is now obsolete", and it offers `--prune`. On the migration repository the
  label landed on every request file and on all five environments holding the real base URLs, none of
  which this tool ever wrote. They are reported as `yours` now, with no deletion offered.

### Notes
- The customer/supplier wordlist for `check-history` is an **input**, not a committed file
  (`--wordlist <path>` or `BRUNOGEN_HISTORY_WORDLIST`). Committing real customer names to a repository
  about to become public would publish exactly what the check exists to protect; what ships is a
  fictional example of the format, and `.gitignore` excludes the real one.
- Migration gate, run on a copy of a real Azure Functions repository: `adopt` then `apply` wrote **one**
  file — the genuinely new endpoint — and left all 18 pre-existing files byte-identical. A second
  `apply` wrote nothing at all, lockfile included.
- `doctor` on that same repository independently found the committed master key, and that `{{masterKey}}`
  is declared in no environment — which is the reason a literal key gets pasted into a request file in
  the first place.

## 2.0.0-alpha.4 — unreleased

Source inference. A repository with no API description can now become a collection, with the model
reading the code and the script still doing all the writing.

### Added
- **Source cards** — `reference/sources/{openapi,dotnet,node,_unsupported}.md`. These are the
  substance of this release: what to look for per stack, which two fields people get wrong
  (`routePrefix` and `required`), and what to say instead of guessing. The .NET card covers Azure
  Functions isolated worker, in-process (recognised, not extracted), FastEndpoints in both its
  dialects, ASP.NET controllers and minimal API; the Node card covers Express with mounted routers,
  Fastify with and without a schema, NestJS, Next App Router and Functions Node v4.
- **Deterministic surface signals** (`signals.mjs`). Not endpoint extraction — that stays with the
  model — but enough to answer honestly whether an HTTP surface exists, which stack it is, and what
  should be reported as unsupported.
- **`probe` now distinguishes "nothing" from "nothing supported".** A Functions app whose triggers are
  all timers, or a GraphQL-only service, exits **3** with each unsupported subject named. Exit 2 is
  reserved for a repository where nothing was found at all. Telling someone their repository is empty
  when it has a surface just not an HTTP one sends them looking for a problem that is not there.
- Fixtures for each card, all synthetic: Functions with HTTP plus a timer trigger, Functions with no
  HTTP surface, Express with a mounted router, a GraphQL-only service, and a prompt-injection fixture
  whose comments demand extra headers, an exfiltration request and a write outside the collection.
- A pinned `api-model.json` for the Functions fixture, pinning the **emission** half of the gate.
- `evals/evals.json` — the **extraction** half: eight cases with per-stack thresholds, plus
  description-tuning cases in both directions. It needs a model, a network and money and is not
  bit-deterministic, so it is a documented manual release gate rather than a CI check.

### Notes
- The Phase 4 gate is deliberately split. Emission is asserted on every PR: given the pinned model,
  the writer must always produce the same collection. Extraction cannot be asserted by a script, and
  pretending otherwise would have meant a green check that proves nothing.
- Non-HTTP triggers never reach `endpoints[]`. A timer cannot be expressed as a request, and emitting
  one would be a fabricated endpoint — the tests assert no request file is produced for it.
- The IR schema stays strict: a `_comment` field added to the pinned model was correctly rejected by
  `additionalProperties: false`, so the explanation moved to `tests/models/README.md` instead of the
  schema being loosened.

## 2.0.0-alpha.3 — unreleased

### Fixed — CI was red from the first commit, and both causes were the committed dependency tree

- **The repository could not be checked out on Windows.** The deepest committed path was 187
  characters; with a workspace prefix that exceeds Windows `MAX_PATH`, so `git checkout` failed with
  `Filename too long` — in CI and for anyone cloning the repository.
- **The committed tree was incomplete.** A `node_modules/` gitignore rule matches at every depth, so a
  single negation re-included only the top-level directory. Nested copies such as
  `make-dir/node_modules/semver` stayed excluded, leaving the tree one package short of its own
  lockfile — which the vendor check correctly failed on Linux and macOS.

Dependencies now ship as one committed CJS bundle (`bruno-libs.cjs`, 4.93 MB against 37 MB for the
tree) with the worker script beside it. `node_modules` is never committed. The longest committed path
is 102 characters, and CI asserts both invariants: nothing under `node_modules/` is tracked, and no
committed path exceeds 150 characters.

CJS rather than ESM deliberately: filestore locates its worker with `join(__dirname, ...)`, and
`__dirname` does not exist in an ESM bundle — the objection that ruled bundling out earlier applied to
the ESM build only. That reference is lazy, and only the synchronous functions are ever called, but the
worker ships beside the bundle so a future call resolves rather than crashing confusingly.

`scripts/check-vendor-hash.mjs` now works offline and without `node_modules`, verifying the bundle's
sha256 against a committed digest, the exact-version pins, the recorded versions against the set Bruno
4.0.0 bundles, the lockfile, and the SBOM. `gen-vendor-sbom.mjs` is gone: `build-vendor-bundle.mjs`
produces the SBOM and licence notices as part of the build.

## 2.0.0-alpha.2 — unreleased

Spec ingestion and the value-population contract. A repository with an OpenAPI description now goes to a
runnable collection in two commands.

### Added
- `probe` — read-only, model-free reconnaissance. Enumerates and scores what could describe the API,
  explains every score, and stays quiet about files that were never meant to be specs. An existing
  collection is reported as the output target, never as a candidate to choose between.
- `ingest` — OpenAPI 3.x, Postman v2.1 and WSDL to a schema-validated `api-model.json`. Derives the
  route prefix from `servers`, folders from tags, and the auth recipe from `securitySchemes`, declaring
  secrets by name only.
- A value-population contract with measurable criteria (VP-1..VP-5): precedence
  config > observed > declared > synthesized, a sanitiser that rejects documentation junk, and synthesis
  from fixed constants so a rerun never produces a diff.

### Fixed — the four gaps measured in Bruno's own converter
`openApiToBruno` drops a body property's `default` (emitting `0`), emits `""` for `format`-typed strings,
turns one optional enum parameter into several duplicate disabled parameters, and emits a required header
enabled and empty. Ingestion handles all four, and each has a named test.

### Notes
- OpenAPI is read directly rather than through `@usebruno/converters`. The converter returns a Bruno
  collection, and the IR needs what a collection cannot carry — which parameters are required, their
  enums and formats, and where each value came from. Postman and WSDL still go through the converters.
- **Swagger 2.0 is rejected** at probe time with a named warning. Left alone, `openApiToBruno` would
  dispatch it to a Swagger-2 path and ship what the capability matrix says is unsupported.
- A spec file that is empty, malformed, or has no paths is skipped with a named reason. The
  implementation this replaces returned nothing when its YAML parser was missing, so a repository full
  of YAML specs silently looked like it had no API.
- `yaml` joins `ajv` as a declared exact dependency rather than an implicit transitive one.

## 2.0.0-alpha.1 — unreleased

First slice of the rewrite. Not installable as a release; the `2.0.0` line replaces the PowerShell
implementation, which stays frozen at `plugins/generate-bruno/` until it is removed.

### Added
- `doctor` — read-only inspection of an existing collection: format detection, request inventory,
  duplicate `endpointKey`/`seq` diagnostics, environment variable audit, undeclared-variable detection,
  and a committed-credential scan that reports by `file:line` and never by value.
- The emitter, the committed lockfile, and `plan`/`apply`/`adopt` — the merge contract: a rerun writes
  zero bytes, an edited file is kept and reported, an orphan is never deleted silently, and `apply`
  refuses to write beside a collection it does not own.
- A pinned, vendored dependency tree so the skill never loads code from the repository under inspection
  and never needs a network install.

### Fixed
- The marketplace entry pointed at a directory that does not exist, and combined `metadata.pluginRoot`
  with a path that already included it — so the plugin could not resolve or install. Schema validation
  passes such a manifest, which is why an install test is the gate.
- A second, stray plugin manifest at the repository root declared three directories that were never
  created.
