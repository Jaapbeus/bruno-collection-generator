# What is supported, and what is reported instead

"General" here means **format-general, not protocol-general**. Scope is per-endpoint: an unsupported
protocol found alongside a supported HTTP surface is skipped and named, and never fails the run.

The model-facing version of this lives in the skill's
[`reference/capabilities.md`](../plugins/bruno-gen-collection/skills/bruno-collection-generator/reference/capabilities.md).

## Protocols

| Protocol | State | Behaviour |
|---|---|---|
| HTTP / REST | supported | the full pipeline |
| SOAP over HTTP (WSDL) | import only, best-effort | converted from a WSDL file; no source inference |
| GraphQL | not generated | detected and named. A repository that is *only* GraphQL exits 3 |
| gRPC | not generated | detected and named |
| WebSocket | not generated | detected and named |

For GraphQL, writing the request by hand in Bruno's own GraphQL request type is a perfectly good
answer, and the skill will say so rather than pretend.

## Things that can describe an API

| Input | State |
|---|---|
| An existing Bruno collection (`.bru` or `opencollection.yml`) | supported — parsed for inventory, identity, format and secrets. Never treated as a candidate to choose between: it is the output target |
| OpenAPI 3.0 / 3.1, JSON or YAML, internal `$ref` | supported |
| Postman v2.1 | supported |
| WSDL | best-effort |
| **Swagger 2.0** | **rejected** with a named warning — convert to OpenAPI 3.x first |
| Insomnia export | not yet |
| A built artefact (`obj/**`, `functions.metadata`) | listed by `probe`, never chosen automatically — pass it with `--spec` to ingest it |
| A spec produced by a build command | supported, but only with per-run consent, and never for Azure Functions |

Swagger 2.0 is refused rather than converted for a specific reason: left alone, Bruno's own converter
dispatches it down a Swagger-2 path and produces output that the capability matrix says is unsupported.
A named refusal is more useful than a silent maybe.

A spec file that is empty, malformed or has no paths is skipped **with its reason named**. The
implementation this replaces returned nothing at all when its YAML parser was missing, so a repository
full of specs looked exactly like a repository with no API.

## Stacks read from source

| Stack | State | Confidence |
|---|---|---|
| C# Azure Functions, isolated worker (`[Function]` + `[HttpTrigger]`) | supported | target high |
| C# ASP.NET controllers / minimal API | supported | target medium |
| C# FastEndpoints (both dialects) | supported | target medium |
| TypeScript / JavaScript: Express, Fastify, NestJS, Next route handlers, Functions Node v4 | supported | target medium |
| C# Azure Functions **in-process** (`[FunctionName]`) | recognised, not extracted | — |
| Python, Go, Java | detected and named, not extracted | — |

"Target" means the threshold its eval case is held to. None of these publishes a *measured* number
until its eval has actually been run and produced one.

## Azure Functions: non-HTTP triggers

Timer, service bus, event grid, blob, queue and durable activity/orchestrator triggers are **named as
unsupported and never emitted**. A timer cannot be expressed as an HTTP request, and emitting one would
be a fabricated endpoint — there is a test asserting no request file is produced for it.

A Functions app whose triggers are *all* non-HTTP exits **3**, not 2. It is not an empty repository: it
has a surface, just not an HTTP one, and a runtime webhook URL may well exist. Being told "nothing
supported here, and here is what I found" sends you somewhere useful; being told "no API found" sends
you looking for a problem that is not there.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | ok |
| 1 | error |
| 2 | nothing HTTP-shaped found at all |
| 3 | a surface was found, but none of it is supported |
| 4 | required values unresolved — a **warning**; files were written and are valid |
| 5 | several APIs here and none was chosen |

Highest wins: **5 > 3 > 2 > 4**.

## Not planned for v1

- Field-level merge of a file you edited (it is kept whole and reported)
- Spec ↔ code drift reporting
- Generating client SDKs, load testing, or authoring an OpenAPI spec from scratch
