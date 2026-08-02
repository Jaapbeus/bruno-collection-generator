# When a description already exists

If the repository has an OpenAPI, Postman or WSDL description, **do not read source code for the
endpoint set**. Run `ingest`; it is deterministic, it resolves `$ref` and `allOf`, and it produces a
schema-valid model in one step.

```
node ${CLAUDE_SKILL_DIR}/scripts/brunogen.mjs probe  --root <dir>
node ${CLAUDE_SKILL_DIR}/scripts/brunogen.mjs ingest --root <dir> --out <scratch>/api-model.json
```

`probe` prints which candidate won and why. If it chose wrongly, pass `--spec <file>` — do not
hand-build a model to work around it.

## What ingest already handles

Parameters with `example`, `examples`, `default` and `enum`; request bodies through `$ref`, `allOf`
(merged, `required` unioned) and `oneOf`/`anyOf` (first branch only; the alternatives are reported as
warnings, not written);
`readOnly` properties excluded from request bodies; recursion capped; `servers` split into a base URL
and a `routePrefix`; tags into folders; `securitySchemes` into an auth recipe with secrets declared by
name only; `DELETE` and reset-shaped paths marked destructive with generated asserts suppressed.

It also repairs four things Bruno's own converter gets wrong — a dropped body `default`, `""` for
`format`-typed strings, one disabled parameter per enum member, and an empty required header. That is
the reason ingestion reads the spec directly rather than delegating to `openApiToBruno`.

## What it deliberately refuses

| Input | Behaviour |
|---|---|
| Swagger 2.0 | rejected with a named warning; convert to OpenAPI 3.x first |
| Insomnia export | not supported yet |
| external `$ref` (another file or URL) | not resolved; the field falls back to synthesis |
| empty, malformed, or path-less spec | skipped with a named reason and both parsers' errors |

If a repository's only description is Swagger 2.0, say so plainly. Do not read the source code as a
silent workaround — the user should know their spec was unusable and why.

## Enriching a spec-derived model from the repository

A spec gives structure; the repository often has better *values*. After ingesting, it is legitimate to
improve values in the model before `apply` — never the endpoint set:

- a sibling `.http`/`.rest` file with a real query string or body
- integration tests carrying real payloads
- JSON code fences in committed markdown, including repo-root `*.md`

Change only `value`, `source` and `confidence` on existing params and bodies. Adding, removing or
renaming an endpoint means the spec was wrong, which is a conversation to have with the user rather
than a silent edit.

## Multiple specs

`probe` lists every candidate with a score and the reasons behind it. Several plausible specs is a
question for the user, not a guess: show the candidates and ask. A spec under `third-party/`,
`vendor/` or `reference/`, or one with more than 500 paths, is scored down because it is usually
somebody else's API vendored for reference.

## After ingest

Always run `plan` and show the user its output before `apply`, especially on a repository that already
has a collection. If `ingest` exited 4, some required values were unresolved: list them, and offer to
fill them in rather than shipping a request that cannot be sent.
