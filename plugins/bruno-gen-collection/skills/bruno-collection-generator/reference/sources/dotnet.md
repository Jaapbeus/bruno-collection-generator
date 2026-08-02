# Reading HTTP endpoints out of C# / .NET source

Use this when a repository has a `.csproj` but no OpenAPI, Postman or WSDL description. Your job is
to produce an `api-model.json` that satisfies `scripts/schema/api-model.schema.json`; the script does
the writing.

**Decide the style first.** Read the `.csproj` and one representative source file before assuming
anything — the four styles below look nothing like each other, and a repository can contain two of
them in separate projects.

| Marker in `.csproj` or source | Style |
|---|---|
| `Microsoft.Azure.Functions.Worker` + `[Function]` + `[HttpTrigger]` | Azure Functions, isolated worker |
| `Microsoft.NET.Sdk.Functions` + `[FunctionName]` | Azure Functions, **in-process** — recognised, not extracted |
| `FastEndpoints` package | FastEndpoints |
| `Microsoft.NET.Sdk.Web` + `[ApiController]` | ASP.NET controllers |
| `Microsoft.NET.Sdk.Web` + `app.MapGet(...)` in `Program.cs` | ASP.NET minimal API |

## The two fields people get wrong

**`routePrefix` is required and has no default.** Get it wrong and every request 404s, which is why
the plan makes it a schema requirement rather than something with a fallback.

- **Azure Functions:** the host prefix comes from `host.json` → `extensions.http.routePrefix`. When
  the key is absent the runtime default is `api`, so `routePrefix` is `/api`. When it is `""`, the
  prefix is `""`. This default belongs to Functions **only** — never carry it into another stack.
- **ASP.NET:** look for `app.UsePathBase("/x")`. Usually absent, so `""`.
- **FastEndpoints:** two separate things combine —
  `app.UseFastEndpoints(c => { c.Endpoints.RoutePrefix = "api"; c.Versioning.Prefix = "v";
  c.Versioning.PrependToRoute = true; })` plus a per-endpoint `Version(1)`. With that configuration a
  `Get("/widgets")` in an endpoint declaring `Version(1)` is served at `/api/v1/widgets`. If
  `PrependToRoute` is false the version is a header, not a path segment.

**`required` for a parameter or body property** = a non-nullable reference type, a `required` member,
`[Required]`, or a route/query parameter with no default. The schema rejects a parameter with no
explicit `required` flag, so decide deliberately rather than omitting it.

## Azure Functions, isolated worker

```csharp
[Function("GetWidget")]                                    // or [Function(nameof(GetWidget))]
public async Task<HttpResponseData> Run(
    [HttpTrigger(AuthorizationLevel.Function, "get", Route = "widgets/{id}")]
    HttpRequestData req, string id, CancellationToken ct) { ... }
```

- **Function name** may be a string literal, `nameof(Method)`, **or a constant reference** —
  `[Function(Constants.MdmFinishActivity)]`. Resolve the `const string` from wherever it is declared.
  If you cannot resolve it, report the function in `capability[]` as unnamed; never silently drop it.
- **Route** comes from `Route = "..."`. When `Route` is absent the route **is the function name**.
- **Methods**: every string after the authorization level. One `[HttpTrigger]` can declare several,
  which means one endpoint per method.
- **Auth**: `AuthorizationLevel.Anonymous` means no key; `Function` or `Admin` means a key in
  `x-functions-key`. Treat this as a *hint* only — say so in `authNotes` and let the user's answer to
  the auth question decide. The corpus contains `Anonymous` functions that are in fact bearer-gated by
  Easy Auth, so the attribute is not the truth.
  **The object shape is not obvious and getting it wrong writes an unauthenticated request:** see
  `reference/auth-recipes.md` before writing `auth`.
- **Body type**: look for `ReadFromJsonAsync<T>()`, `ReadBodyAsync<T>()`,
  `ReadBodyCorrelationAsync<T>()`, `JsonSerializer.Deserialize<T>(...)`, or — in the
  ASP.NET-integration flavour — `JsonConvert.DeserializeObject<T>(...)`. Then read `T` and build the
  body from its properties. Honour `[JsonPropertyName("x")]` **and** Newtonsoft's `[JsonProperty("x")]`;
  with neither, use the serializer's configured naming policy from `Program.cs`, defaulting to
  camelCase.
- **Non-HTTP triggers must not become requests.** `[TimerTrigger]`, `[ServiceBusTrigger]`,
  `[EventGridTrigger]`, `[BlobTrigger]`, `[QueueTrigger]`, `[ActivityTrigger]`,
  `[OrchestrationTrigger]`, `[DurableClient]` — list each in `capability[]` as
  `{subject: "timer-trigger", supported: false}` and move on. A repository whose triggers are *all*
  non-HTTP has no HTTP surface: exit 3, not 2, because a runtime webhook URL may still exist.
- **There is no build-time OpenAPI path.** Microsoft states
  `Microsoft.Extensions.ApiDescription.Server` "is not designed to work with Azure Functions,
  especially in isolated process mode"; it fails on `Functions:Worker:HostEndpoint`. Never offer a
  build command for a Functions app. Source reading is the only zero-touch route.
- **Query parameters are rarely declared.** Look for `req.Query["name"]`,
  `req.Url.ParseQueryString()`, and any local helper such as `GetQueryValueOrDefault("name")`. The
  string literals in those calls are the parameter names. Mark them `required: false` unless the code
  throws when they are missing.

## Azure Functions, in-process

`[FunctionName("X")]` with `HttpRequest`/`IActionResult`. **Recognised but not extracted in this
version.** Report it: `{subject: "azure-functions-in-process", supported: false, reason: "..."}` and
tell the user plainly. Do not half-extract it.

## FastEndpoints

```csharp
public class GetWidgetEndpoint : Endpoint<GetWidgetRequest, WidgetResponse>
{
    public override void Configure()
    {
        Get("/widgets/{id}");            // also: Verbs(Http.GET); Routes("/widgets/{id}");
        Version(1);                      // may be Version(1, deprecateAt: 2)
        Tags("Widgets");
        Summary(s => { s.Summary = "..."; s.Description = "..."; });
        AllowAnonymous();                // absent means an authenticated token is required
    }
}
```

- The class need **not** be named `*Endpoint`, and `Configure()` may use either `Get("...")` or
  `Verbs(Http.GET)` plus `Routes("...")`. Handle both.
- `Group<SomeGroup>()` composition adds the group's route prefix — follow it to the group class.
- **Parameters come from the request DTO, not the signature.** A property whose name matches a
  `{token}` in the route is a path parameter; on a GET or DELETE the remaining properties are query
  parameters; on a POST/PUT/PATCH they are the body. `[BindFrom("other-name")]` renames the wire key,
  and `[QueryParam]` forces a property to be a query parameter.
- A `List<T>` property bound from the query is a **repeatable** parameter.
- `Summary(s => ...)` and `Description(d => ...)` are both used in the wild; read either.
- Auth is usually middleware-wide with no per-endpoint attribute, and the real permission may be
  resolved in the application layer. Put what you find in `authNotes` and let the user decide.

## ASP.NET controllers

```csharp
[ApiController]
[Route("api/[controller]")]                 // [controller] expands to the class name minus "Controller"
public class WidgetsController : ControllerBase
{
    [HttpGet("{id}")]
    public async Task<ActionResult<WidgetDto>> Get(Guid id, [FromQuery] string? country) { ... }
}
```

- Combine the class-level `[Route]` with the action-level route. Expand `[controller]` and
  `[action]`.
- `[ApiVersion("1.0")]` plus a `{version:apiVersion}` token in the route becomes a literal segment.
- `[FromQuery]`, `[FromRoute]`, `[FromBody]`, `[FromHeader]` and `[AsParameters]` say where a
  parameter lives. An undecorated simple type on a GET is a query parameter; an undecorated complex
  type on a POST is the body.
- **Two actions in different controllers can share a method and path shape.** Qualify the endpoint's
  display name with the controller so the two do not collide, and let the position-normalised
  `endpointKey` distinguish them by their literal segments.

## ASP.NET minimal API

```csharp
var widgets = app.MapGroup("/api/widgets").RequireAuthorization();
widgets.MapGet("/{id}", (Guid id, [FromQuery] string? country) => ...);
```

- Follow `MapGroup` chains: the group prefix concatenates with the per-route pattern.
- A primitive parameter with no attribute is a query parameter unless its name matches a route token.
- `RequireAuthorization()` on the group or route is an auth hint for `authNotes`.
- Unlike Functions, ASP.NET Core **can** emit a spec at build time
  (`Microsoft.Extensions.ApiDescription.Server`). If the user would rather have that, say so — but it
  boots the application entry point against a mock server, so it can need configuration, secrets or a
  database. Offer it; never run it without approval.

## Values worth harvesting before you invent any

In precedence order, and only for values — never to discover endpoints:

1. sibling `.http` / `.rest` files: real URLs, headers and bodies
2. integration tests: real request payloads
3. XML doc comments (`/// <summary>`) and FastEndpoints `Summary`/`Description` → `summary`,
   `description` and parameter descriptions
4. JSON code fences in committed markdown — `docs/**`, `openspec/**`, **and repo-root `*.md`**
5. a C# property initialiser (`public string Field { get; set; } = "id";`) is a real default
6. an `enum` type gives you the allowed values; use the first as the example

`appsettings*.json`, `local.settings.json` and `launchSettings.json` are **secret stores**, not value
sources. Read only `Host.LocalHttpPort`, `extensions.http.routePrefix`, `applicationUrl` and
`ASPNETCORE_URLS`, and only to prefill the base URL and route prefix question.

## Before you hand over the model

- every path token in `pathTemplate` has a matching `params` entry with `in: "path"`, `required: true`
- `routePrefix` is set deliberately, and is **not** in `pathTemplate` as well
- `endpointKey` is `METHOD` plus the composed path with each parameter replaced by its ordinal
- non-HTTP triggers appear in `capability[]`, never in `endpoints[]`
- anything you invented is marked `source: "synthesized"`, and a required input you could not resolve
  is listed in `unresolved[]` rather than left as an empty string
