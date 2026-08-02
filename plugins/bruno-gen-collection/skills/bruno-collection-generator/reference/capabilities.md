# Capabilities — what is supported, and what is reported instead

"General" here means **format-general, not protocol-general**. Guaranteed behaviour needs a supported
artifact; reading source code is best-effort and bounded by this document. Never imply coverage beyond it.

## Protocols

Scope is **per endpoint**. An unsupported protocol found alongside a supported HTTP surface is skipped and
listed, and does not fail the run.

| Protocol | Supported | Behaviour |
|---|---|---|
| HTTP / REST | yes | full pipeline |
| SOAP over HTTP (WSDL) | import only | converted best-effort; no source inference |
| GraphQL | no | listed as `skipped(protocol)` |
| gRPC | no | listed as `skipped(protocol)` |
| WebSocket | no | listed as `skipped(protocol)` |

A repository whose *only* surface is unsupported exits **3**. A repository with no HTTP-shaped surface at
all exits **2**, printing the full list of what was probed.

## Source artifacts

| Artifact | Supported |
|---|---|
| existing Bruno collection (`bru` or `yml`) | yes — parsed for inventory, identity, format and secrets |
| OpenAPI 3.0 / 3.1, JSON or YAML, internal `$ref` | yes — becomes the skeleton |
| Postman v2.1 | yes |
| WSDL | best-effort |
| Swagger 2.0 | **no** — rejected at probe time with a named warning |
| Insomnia | no |
| a built artifact under `obj/**` (`functions.metadata`, `*openapi*.json`) | listed by `probe`; never chosen automatically — pass it with `--spec` to ingest it |
| a spec produced by a build command | yes, only with explicit per-run approval |

## Source inference by stack

Never publish a confidence value that has not been measured.

| Stack | Supported | Target |
|---|---|---|
| C# Azure Functions isolated worker (`[Function]` + `[HttpTrigger]`) | yes | high |
| C# ASP.NET controllers / minimal API | yes | medium |
| C# FastEndpoints | yes | medium |
| TypeScript Express / Fastify / NestJS / Next route handlers | yes | medium |
| C# Azure Functions **in-process** (`[FunctionName]`) | recognised, not extracted | reported with a note |
| Python, Go, Java | probed and named only | not extracted |
| anything else | no | the capability report lists what was probed |

## Azure Functions specifics

- Non-HTTP triggers — timer, service bus, event grid, blob, queue, durable activity/orchestrator — are
  listed `skipped(trigger)` and never emitted as requests.
- A function name given as a constant (`[Function(Constants.Something)]`) must be resolved from the
  `const string` field, or reported as unnamed. Never silently dropped.
- The host route prefix comes from `host.json` → `extensions.http.routePrefix`. Its default is `api`, but
  that default belongs to Functions only and must never leak into another stack.
- **There is no build-time OpenAPI path.** Microsoft states `Microsoft.Extensions.ApiDescription.Server`
  "is not designed to work with Azure Functions, especially in isolated process mode"; it fails on
  `Functions:Worker:HostEndpoint`. The supported alternative needs a running host plus per-endpoint
  attributes. So source extraction is the only zero-touch route, and a build command is never offered.
- The runtime admin endpoints (`/admin/functions/{name}`, `/admin/host/status`, `/admin/host/restart`) are
  an **opt-in extra**, configured with concrete function names:
  `"extras": {"azure-functions-admin": {"functions": ["MyTimerFunction"]}}`. Never inferred as endpoints.

## Never claimed

Rails, Laravel, CMS platforms, WCF/ASMX, and any framework whose routes are configured at runtime rather
than declared in source. Say so plainly rather than guessing.
