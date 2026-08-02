# Extraction eval results

The record for the half of the Phase 4 gate that cannot be a CI check. Each entry says what was run,
against which build, and what was measured — not a verdict without its conditions.

Score with `evals/score.mjs`, which checks the `mustFind` / `mustNotDo` criteria from `evals.json`
mechanically. Judging "did it find the right endpoints" by eye is where a marginal result gets talked
into a pass.

---

## 2026-08-01 — build 2.0.0-alpha.7

Two cases, one run each, one model (the session default). Fresh sessions, the plugin installed from the
marketplace, no hints given and the source card never pasted in.

### `dotnet-functions-isolated` — **PASS, 11/11**

```
PASS  endpoint set exact: GET /api/widgets/{id} | POST /api/widgets
PASS  route prefix is /api, from host.json
PASS  the prefix is not repeated inside pathTemplate
PASS  no timer trigger emitted as a request
PASS  timer-trigger reported as unsupported
PASS  body uses widget_name, from [JsonPropertyName]
PASS  quantity is 12, from the property initialiser
PASS  parameter path:id found
PASS  parameter query:country found
PASS  every parameter records where its value came from
PASS  apikey auth uses the nested block the writer reads
```

Three things worth recording beyond the score:

- **The auth-recipes card works.** The generated `collection.bru` contains the full nested block
  (`key: x-functions-key`, `value: {{functionKey}}`, `placement: header`). The run a week earlier, before
  that card existed, produced `auth: apikey` and no credential at all — a collection that 401s on every
  call. This is the eval confirming a fix, not just a feature.
- **The auth question was asked the way the card teaches it**: not "AuthorizationLevel.Function, so a
  key", but whether the attribute is the real story, offering Easy Auth as the alternative. That nuance
  comes from the card; a model would not invent it.
- **Both subtle extractions landed**: `widget_name` from `[JsonPropertyName]` rather than the C# property
  name, and `quantity: 12` from the property initialiser. Those are the two cases a regex detector gets
  wrong.

### `functions-timer-only` — **PASS**

Mechanically verified: nothing written, nothing modified, nothing deleted — the fixture tree was
byte-identical to its baseline afterwards.

Reported, in its own words: probe exited 3; the repository is an Azure Functions app (`host.json`
present) that exposes no HTTP endpoints, only a timer trigger and a Service Bus trigger; neither can be
expressed as an HTTP request, so there is nothing to generate. It then offered the constructive next step
— add an HTTP manual-trigger function if one is wanted — which is a suggestion, not a fabricated
endpoint.

Against the `mustNotDo` list: it did not write a file, did not claim the repository is empty or has no
API (it said no *HTTP* endpoints, which is the distinction the whole exit-3 path exists for), and did not
invent an endpoint to have something to show.

### What this does and does not establish

It backs the README's "no description required" claim with evidence: a real invocation, reading only the
source, produced a model matching the pinned one on every asserted property.

It is **one run per case on one model**. `evals.json` calls for three runs across opus, sonnet and haiku,
so the per-stack confidence in `docs/capabilities.md` stays **target**, not measured. Two passes are
evidence; they are not a distribution.

Cases still unrun: `node-express-mounted`, `graphql-only`, `spec-wins-over-source`, `swagger-2-refused`,
`prompt-injection-resistance`, `existing-collection-adopted`.
