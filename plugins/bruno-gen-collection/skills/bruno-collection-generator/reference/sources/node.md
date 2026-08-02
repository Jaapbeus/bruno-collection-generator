# Reading HTTP endpoints out of TypeScript / JavaScript source

Use this when a repository has a `package.json` but no OpenAPI, Postman or WSDL description. Produce
an `api-model.json`; the script does the writing.

**Check `package.json` dependencies first** — it tells you the framework in one read, and the four
below need different treatment.

| Dependency | Framework | Note |
|---|---|---|
| `express` | Express | routes may be split across `Router()` files |
| `fastify` | Fastify | a `schema` option gives you parameters and body for free |
| `@nestjs/common` | NestJS | decorators; `@nestjs/swagger` can emit a spec instead |
| `next` | Next.js | App Router `route.ts`, or legacy `pages/api` |
| `@azure/functions` | Azure Functions, Node v4 | `app.http('name', {...})` |

**Prefer a spec if the project can emit one.** NestJS with `@nestjs/swagger`, or a project using
`tsoa`, can produce an OpenAPI document that is strictly better than anything read from source. Offer
the command, explain that it runs their code, and only run it with approval. If they decline, read the
source.

> Before writing `auth` in the model, read `reference/auth-recipes.md` — the exact object shape per
> mode. A mode without its nested block writes a request with no credential at all.

## Express

```js
const router = express.Router();
router.get('/:id', async (req, res) => { const { country } = req.query; ... });
app.use('/api/widgets', router);
```

- **Follow the mount.** `app.use('/api/widgets', router)` prefixes every route in that router, and
  mounts nest. The `app.use` call is often in a different file from the routes; find it, or the paths
  will be wrong.
- Methods: `app.get/post/put/patch/delete/all`, and the same on a router.
- Path parameters are `:name`, which is already Bruno's form. Optional `:name?` still becomes a
  required Bruno path parameter — the URL needs a value either way.
- **Parameters are not declared**, so read the handler body: `req.query.x` / `req.query['x']` and
  destructuring `const { a, b } = req.query` give the query names. `req.body.x` and
  `const { a } = req.body` give body keys. `req.params.x` confirms path parameters.
- Validation middleware is the best source of truth when present: a `zod`, `joi` or
  `express-validator` schema names the fields and says which are required. Prefer it over the handler
  body.
- `router.use(authMiddleware)` or a named `requireAuth` is an auth hint for `authNotes`.

## Fastify

```js
fastify.get('/widgets/:id', {
  schema: {
    params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
    querystring: { type: 'object', properties: { country: { type: 'string', default: 'NL' } } },
  },
}, handler);
```

- **When `schema` is present, use it.** It is JSON Schema, so `required`, `type`, `format`, `default`
  and `enum` are all there — treat it exactly as you would a spec, and mark those values `declared`.
- Without a schema, fall back to reading `request.query` / `request.body` / `request.params` in the
  handler, as with Express.
- `fastify.register(routes, { prefix: '/api' })` prefixes the registered routes. Follow it.

## NestJS

```ts
@Controller('widgets')
export class WidgetsController {
  @Get(':id')
  findOne(@Param('id') id: string, @Query('country') country?: string) { ... }
}
```

- Combine `@Controller('prefix')` with the method decorator's path.
- `@Param`, `@Query`, `@Body`, `@Headers` say exactly where each argument lives — this is the most
  reliable of the JS frameworks to read.
- A `?` on the TypeScript parameter, or a `@Query()` with no argument name, means optional.
- A DTO class with `class-validator` decorators gives you the body shape and which fields are
  required. `@ApiProperty({ example: ... })` gives you real example values.
- A global prefix set by `app.setGlobalPrefix('api')` in `main.ts` is the `routePrefix`.

## Next.js App Router

```
app/api/widgets/route.ts            ->  /api/widgets
app/api/widgets/[id]/route.ts       ->  /api/widgets/{id}
app/api/widgets/[...rest]/route.ts  ->  catch-all: report, do not guess a shape
```

- **The file path is the route.** `app/api/**/route.ts`, with `[param]` becoming a path parameter and
  `(group)` folders contributing nothing to the URL.
- The **exported function names are the methods**: `export async function GET/POST/PUT/PATCH/DELETE`.
- Query parameters come from `request.nextUrl.searchParams.get('x')` or `new URL(request.url)`.
- Body keys come from `await request.json()` and any destructuring of it.
- Legacy `pages/api/**` files export a single default handler; the methods are whatever the body's
  `req.method` switch handles.
- A `[...catchAll]` segment has no fixed shape. Report it in `capability[]` rather than inventing one.

## Azure Functions, Node v4

```js
app.http('getWidget', { methods: ['GET'], route: 'widgets/{id}', authLevel: 'function', handler });
```

- Same rules as the .NET Functions card for the host prefix: `host.json` →
  `extensions.http.routePrefix`, defaulting to `/api` when absent.
- `authLevel: 'anonymous' | 'function' | 'admin'` is a hint for `authNotes`, not the truth.
- `app.timer(...)`, `app.serviceBusQueue(...)` and friends are **not** HTTP. List them in
  `capability[]` and never as endpoints.

## Values worth harvesting before you invent any

1. sibling `.http` / `.rest` files, and any `curl` examples in the README
2. tests — `supertest` calls carry real paths, query strings and bodies
3. a validation schema's `default`, `enum` and `example`
4. `@ApiProperty({ example })`, JSDoc `@example`
5. JSON code fences in committed markdown, including repo-root `*.md`

`.env`, `.env.local` and similar are **secret stores**. Their variable *names* are useful context;
their values are never read.

## Monorepos

`packages/*/package.json` or a `workspaces` field means several projects. Each API gets its own
collection root, its own `endpointKey` space and its own auth question. If the user pointed at the
repository root, say which package holds the API rather than merging them.

## Before you hand over the model

- every mount prefix and global prefix is accounted for exactly once
- `routePrefix` is set deliberately and is not repeated inside `pathTemplate`
- a parameter read only from the handler body is `source: "declared"` at best, `confidence: "medium"` —
  do not claim high confidence for something no schema declared
- non-HTTP triggers and catch-all routes are in `capability[]`, not `endpoints[]`
