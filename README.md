# Bruno collection generator — a Claude Code skill

Generates a [Bruno](https://usebruno.com) API collection from your repository and keeps it in sync as
the API changes. From an OpenAPI description when you have one; from your source code when you don't.

The collection is written into your repository and committed, so it shows up in review when endpoints
change, and it never drifts silently from the code.

```
/bruno-gen-collection:bruno-collection-generator
```

---

## Status: 2.0.0-alpha.10, not released

Version 2 is a rewrite and remains a prerelease. What follows describes what the code does today,
with the tests that hold each part up.

| Command | State |
|---|---|
| `probe` | finds and scores what could describe your API. Read-only, no model involved. |
| `ingest` | OpenAPI 3.0/3.1, Postman v2.1 and WSDL → a validated intermediate model |
| `doctor` | inspects an existing collection: inventory, duplicates, undeclared variables, committed secrets |
| `adopt` | records existing files as yours, so a later `apply` cannot overwrite them |
| `plan` | shows exactly what `apply` would do, writing nothing |
| `apply` | writes the collection, merging with what you have edited |
| `smoke` | runs the collection with Bruno's CLI to prove it works. Real requests, so it needs `--yes` |

**309 tests** across nine files, on Ubuntu, macOS and Windows, on Node 20, 22 and 24.

Two things are deliberately *not* automated, and saying so is part of the design:

- **Extraction quality.** Whether a real Claude invocation reads a repository correctly cannot be
  asserted by a script. It is a manual release gate with per-stack thresholds, in
  [`evals/evals.json`](plugins/bruno-gen-collection/skills/bruno-collection-generator/evals/evals.json);
  the scoring *is* mechanical, via `evals/score.mjs`. **Two cases have been run** — C# Azure Functions
  isolated worker (11/11) and a Functions app with no HTTP surface — and the dated record with its
  conditions is in
  [`evals/RESULTS.md`](plugins/bruno-gen-collection/skills/bruno-collection-generator/evals/RESULTS.md).
  One run per case on one model is evidence, not a distribution, so the per-stack confidences below stay
  **target** rather than measured.
- **Publication safety.** `scripts/check-history.mjs` scans every blob in every branch plus every
  commit message, but a clean result is evidence, not proof. Someone still has to sign off.

---

## What it actually does

Two paths, decided by `probe`:

**You have a description.** OpenAPI, Postman or WSDL is read directly into an intermediate model, then
written as a collection.

```
probe → ingest → plan → apply
```

**You don't.** Claude reads your source code, guided by a card for your stack, and produces the same
intermediate model. The script validates it against a JSON Schema and does all the writing — no model
ever hand-writes a `.bru` file.

```
probe → (Claude reads the code) → plan → apply
```

Either way, `plan` shows you the decision before anything is written, and `apply` never touches a file
you have edited.

### Stacks it can read without a description

| | |
|---|---|
| **C#** | Azure Functions isolated worker · ASP.NET controllers · minimal API · FastEndpoints (both dialects) |
| **TypeScript / JavaScript** | Express (including mounted routers) · Fastify · NestJS · Next App Router · Functions Node v4 |

Azure Functions in-process (`[FunctionName]`) is recognised and reported, not extracted. Python, Go and
Java are detected and named, not extracted.

GraphQL, gRPC and WebSocket are detected and reported as not generated — they are not silently dropped,
and a repository that is *only* GraphQL is told so rather than told it has no API.

---

## Why this and not Bruno's own tooling

Bruno's tools are good and you should use them when they fit. Concretely:

- **You maintain an OpenAPI spec and work in the Bruno app** → use
  [OpenAPI Sync](https://docs.usebruno.com/) or `bru import openapi`. Sync preserves your scripts,
  tests, assertions and settings, and keeps your values for fields still in the spec.
- **You want a collection scaffolded from material you paste in** → Bruno ships its own agent skill.

This exists for a different case: **the repository case.** The differences, each with the test that
holds it up:

| | Why it matters | Test |
|---|---|---|
| **No description required** | For C# Azure Functions isolated worker there is no build-time OpenAPI path at all — [Microsoft's own answer](https://learn.microsoft.com/en-us/answers/questions/5497489/) is that `Microsoft.Extensions.ApiDescription.Server` is not designed for it. Reading the source is the only option. | emission from a pinned model (`tests/phase4.test.mjs`); extraction quality is a **manual** eval gate, not a test |
| **Non-interactive** | OpenAPI Sync is GUI-only; there is no `bru sync` in the 4.0.0 CLI. This runs in CI with exit codes and `--json`. | exit-code tests |
| **Unmetered** | Sync allows 5 syncs per month on the Open Source edition. | — (factual) |
| **Ownership recorded in git** | A committed lockfile decides which files are yours. Two people cloning the same repository classify every file identically, on any platform, with any line-ending setting. | CRLF-clone test |
| **Enriched from your repository** | Values come from examples, `.http` files, tests and committed markdown — not only from a schema. Every value records where it came from. | VP-1..VP-5 |
| **Deterministic** | No timestamps, no clock, no machine names. A rerun with unchanged inputs writes zero bytes, lockfile included. | zero-diff rerun and whole-tree byte snapshots (`tests/phase2.test.mjs`) |
| **Refuses to guess** | Several APIs in one repository is an exit code and a question, not a silent pick. | Phase 5 selection tests |

### What it will not do

- Overwrite a file you touched. Ownership comes from the lockfile, never from guesswork.
- Write a credential. Secrets become a variable reference and a declared name; a suspected committed
  credential is reported by `file:line` and never by value.
- Delete anything on its own. Orphans are reported; removing one takes an explicit `--prune <path>`.
- Send a request without you saying so.

---

## Requirements

**Node.js 20 or newer.** This is a real prerequisite: Claude Code ships as a native binary and does not
provide Node. The skill checks before doing anything and tells you the install command for your
platform.

Bruno itself is only needed if you want to *open* the collection — and Bruno's CLI (`@usebruno/cli`)
only if you want to run `smoke`.

Dependencies are vendored: one committed 4.9 MB bundle of Bruno's own reader/writer packages, verified
against a committed digest on every CI run.

The generator never installs anything and never loads code from the repository it is inspecting.
`probe`, `plan` and `doctor` are read-only and run without prompting; `apply` writes only inside the
collection directory. `smoke` is the deliberate exception: after an explicit `--yes`, Bruno sends the
collection's requests and may execute its scripts, forced into Bruno's `safe` sandbox.

---

## Install

`/plugin` is a **Claude Code CLI** command. The VS Code and JetBrains extensions do not have it — there
it answers `/plugin isn't available in this environment`. Open a terminal, start `claude`, then:

```
/plugin marketplace add Jaapbeus/bruno-collection-generator
/plugin install bruno-gen-collection@jaapbeus-plugins
```

The marketplace shorthand clones over SSH by default. If you have no SSH key configured, set
`CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1` or give the full URL
`https://github.com/Jaapbeus/bruno-collection-generator`.

Then `/reload-plugins` and invoke `/bruno-gen-collection:bruno-collection-generator`.

Plugins install into `~/.claude`, not into a project, so the editor extensions pick this one up once the
CLI has installed it — restart the session there and invoke it the same way.

Always invoke the namespaced form. A bare `/bruno-collection-generator` works only when no other
command claims that name, and two other published skills share it — so it is not something to rely on.

### Troubleshooting

| Symptom | What it means |
|---|---|
| `/plugin isn't available in this environment` | You are in an editor extension. Run the two install commands in the CLI; the extension picks the plugin up afterwards. |
| `Unknown command: /bruno-gen-collection:bruno-collection-generator` | The invocation is correct and the plugin is not installed yet — almost always because the install above never ran. `/reload-plugins` reports how many plugins and skills it loaded. |
| A git or authentication error on `marketplace add` | The SSH-clone default. Set `CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1` or pass the full `https://github.com/…` URL. |

---

## Configuration

Everything is optional. `bruno-gen.json` in your repository root:

```json
{
  "name": "Widget API",
  "output_dir": "bruno",
  "format": "yml",
  "environments": {
    "local": "http://localhost:7071",
    "test": "https://test.example.com"
  },
  "headers": { "x-correlation-id": "{{$guid}}" },
  "auth": { "mode": "apikey", "key": "x-functions-key", "value": "{{functionKey}}" },
  "placeholders": ["^__[A-Z0-9_]+__$"],
  "projects": [
    { "name": "orders", "path": "services/orders" }
  ]
}
```

- `projects[]` settles which API to generate when a repository holds several — otherwise you are asked
  each time.
- `placeholders[]` marks documented substitution markers such as `__APIKEY__` as values rather than
  credentials, so they are not stripped out of your requests. Patterns are capped at 256 characters;
  backreferences, repeated groups and expressions with multiple repetition operators are rejected so
  repository-supplied regex cannot stall a scan.
- `$schema` (an editor hint, otherwise ignored) and `extras` (a free-form object, per-project or
  collection-wide, passed through untouched for the model to read) are also accepted without a warning.

This file is treated as untrusted input, because it comes from the repository being inspected: a path
that escapes the repository is a hard error, and an unknown key is a warning that gets ignored, so a
config written for a newer version still runs.

---

## Output

```
<repo>/
  bruno-gen.json                    yours, optional
  bruno/
    opencollection.yml              YAML mode (the default for new collections)
    bruno.json                      .bru mode
    collection.bru
    environments/<env>.bru|.yml     created once; your values, secrets by name only
    <resource>/folder.bru|.yml
    <resource>/<request>.bru|.yml
    .bruno-gen/lock.json            committed; how ownership is decided
```

New collections default to **OpenCollection YAML**, Bruno 4's own default. Existing collections keep
whichever format they already use. `--format bru|yml` overrides.

**Known limitation:** OpenCollection YAML collections are reported to be unusable in the Bruno VS Code
extension. If you use that extension, generate `--format bru`.

### The `.bru` format — quick reference

Bruno stores collections as plain text:

| Concept | Syntax |
|---------|--------|
| HTTP block | `get { url: ... }` · `post { url: ... body: json }` |
| Headers | `headers { Content-Type: application/json }` |
| JSON body | `body:json { { "key": "value" } }` |
| Variable | `{{variableName}}` |
| Built-in | `{{$guid}}` · `{{$timestamp}}` |
| Docs | `docs { any markdown text }` |
| Tests | `tests { test("name", () => { expect(res.status).to.equal(200) }) }` |
| Environment | `vars { baseUrl: http://localhost:7071 }` |
| Comment | none — a `#` or `//` line makes the file unparseable; put notes in `docs {}` instead |

---

## Known limitations

- Swagger 2.0 is rejected with a named warning rather than converted. Convert to OpenAPI 3.x first.
- Insomnia exports are not supported yet.
- WSDL is best-effort import only; there is no source inference for SOAP.
- Field-level merge is not implemented: a file you edited is kept whole, not merged line by line.
- Body-type resolution recurses six levels deep; deeper nesting is truncated.
- One auth recipe per collection: a per-operation OpenAPI `security` override (e.g. one public
  endpoint on an otherwise authenticated API) is not read; every endpoint inherits the collection's
  single auth block.

---

## Documentation

- [Running it in CI](docs/ci.md)
- [Adding support for a stack](docs/adding-a-source-card.md)
- [What is supported, and what is reported instead](docs/capabilities.md)

---

## Find more Claude Code skills

- [ClaudSkills.com](https://claudskills.com) — community registry
- [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) — curated list
- [Skillkit.io](https://skillkit.io) — skill discovery
- [anthropics/skills](https://github.com/anthropics/skills) — official Anthropic examples

---

## Contributing

Issues and pull requests welcome. Two rules that are not negotiable:

1. **Fixtures are hand-written and synthetic.** Never sanitised from a real repository. Hosts limited
   to `example.com` and `localhost`, all-zero GUIDs, obviously fake credentials. CI fails on anything
   else, across `tests/`, `docs/`, `plugins/` and this README.
2. **No claim without a green test.** If a capability is not asserted somewhere in `tests/`, it does
   not go in the README.

```
node scripts/run-tests.mjs          # the suite
node scripts/validate-manifests.mjs # marketplace and plugin wiring
node scripts/check-vendor-hash.mjs  # the vendored bundle, offline
node scripts/check-fixture-hygiene.mjs
node scripts/check-line-endings.mjs
node scripts/check-history.mjs      # before publishing
```

Those prove the manifests resolve, not that the plugin installs: `claude plugin validate --strict`
accepts a marketplace whose plugin directory does not exist (verified on 2.1.216). A clean-machine
`/plugin marketplace add` → `/plugin install` → `/reload-plugins` → invoke stays the release gate.

Most welcome additions: a source card plus fixtures for FastAPI, Spring Boot, Laravel or Rails;
field-level merge; generating `tests {}` blocks from OpenAPI response schemas.

## Licence

MIT — see [LICENSE](LICENSE). Bruno's packages are MIT; the vendored bundle ships an SBOM and the
transitive licence notices.

<!-- Search keywords — helps people find this repo -->
<!-- bruno api collection generator azure functions csharp dotnet aspnet fastendpoints express fastify nestjs openapi swagger claude code skill plugin bru file opencollection yml generator rest api testing postman alternative -->
