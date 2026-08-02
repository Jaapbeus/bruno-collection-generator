# Bruno file formats — verified vocabulary

Everything here was verified against `@usebruno/filestore` and `@usebruno/lang` as shipped with Bruno 4.
**Never hand-write these files.** The deterministic writer calls filestore, which is the only thing that
gets the quoting, ordering and escaping right. This document exists so you can *read* and *review* output,
not so you can produce it by hand.

## Contents

- [Two formats, one API](#two-formats-one-api)
- [The item type trap](#the-item-type-trap)
- [Request blocks (`bru`)](#request-blocks-bru)
- [Collection root](#collection-root)
- [Folders](#folders)
- [Environments](#environments)
- [Things that will break a file](#things-that-will-break-a-file)

## Two formats, one API

`@usebruno/filestore` reads and writes both, selected by `{format: 'bru' | 'yml'}`:

| Concern | function |
|---|---|
| a request | `parseRequest` / `stringifyRequest` |
| the collection root | `parseCollection` / `stringifyCollection` |
| a folder | `parseFolder` / `stringifyFolder` |
| an environment | `parseEnvironment` / `stringifyEnvironment` |

Format on disk:

| | `bru` | `yml` |
|---|---|---|
| root file | `bruno.json` + `collection.bru` | `opencollection.yml` (no `bruno.json`) |
| folder file | `folder.bru` | `folder.yml` |
| ignore list | `bruno.json` → `ignore[]` | `opencollection.yml` → `extensions.bruno.ignore[]` |

YAML is Bruno's default for newly created collections since v3.1 and carries an
`opencollection: 1.0.0` marker. `.bru` is not deprecated and both are read by the CLI.

## The item type trap

The in-memory item type must be **`http-request`**:

| in-memory `type` | `bru` | `yml` |
|---|---|---|
| `"http-request"` | works | works |
| `"http"` | *appears* to work — logs `Error stringifying item` to the console and still returns bytes | **throws** `Unsupported item type: http` |

Both writers put `type: http` *into the file*, and `parseRequest` returns `http-request`. So the on-disk
value and the in-memory value differ by design. Always construct items as `http-request`.

## Request blocks (`bru`)

Block order is the writer's business, not yours. The vocabulary:

```
meta { name, type, seq, tags: [ … ] }
get|post|put|patch|delete|head|options { url, body, auth }
params:query { key: value }        # ~key disables; @description('…') above a key documents it
params:path  { key: value }        # the URL uses :name, not {name}
headers { Key: value }
auth:none|basic|bearer|digest|ntlm|oauth2|apikey|awsv4|wsse { … }
body:json|text|xml|sparql|graphql|graphql:vars|form-urlencoded|multipart-form|file { … }
vars:pre-request { key: value }
vars:post-response { key: $res.body.field }
assert { $res.status: 200 }        # singular "assert", not "asserts"
script:pre-request { … }
script:post-response { … }
tests { function onResponse(request, response) { … } }
docs { … }
settings { encodeUrl, followRedirects, maxRedirects, timeout }
```

A `~` prefix disables an entry while keeping it visible in the UI — the right way to offer an optional
query parameter. Keys containing a space, `:`, `{`, `}` or a leading `~`/`@` must be double-quoted; the
writer handles that.

`auth:oauth2` keys (client-credentials example): `grant_type`, `access_token_url`, `refresh_token_url`,
`client_id`, `client_secret`, `scope`, `credentials_placement`, `credentials_id`, `token_source`,
`token_placement`, `token_header_prefix`, `auto_fetch_token`, `auto_refresh_token`.

## Collection root

`collection.bru` (bru mode) carries collection-wide `headers`, `auth { mode: … }` plus the matching
`auth:*` block, `vars:*`, `script:*` and `docs`. A request opts into it with `auth: inherit`.

In yml mode the same content lives in `opencollection.yml` under `info:`, `request:`, `docs:` with
`bundled:` and `extensions:` siblings.

## Folders

`folder.bru` / `folder.yml` carries only `meta { name, seq }` and usually `auth { mode: inherit }`.

## Environments

One file per environment. Variables are a list; a secret is declared by **name only**, with no value:

```
vars { baseUrl: https://localhost:7260 }
vars:secret [ clientSecret ]
```

In yml the same becomes `variables: [{name, value}, {secret: true, name}]` — note the writer **omits an
empty value entirely**.

## Things that will break a file

- **There is no comment syntax.** A `#` or `//` line makes the file unparseable. Never add a generated-by
  banner; put that in `docs`.
- **Prompt variables `{{?…}}`** cause the CLI to *silently skip* the request.
- **Trailing whitespace is meaningful.** filestore emits `key: ` with a trailing space for an empty value.
  Any editor or hook that trims trailing whitespace will alter the bytes, so `bruno/**` is exempted in
  `.editorconfig`.
- **A literal `:` before a letter in a URL** is read as a path parameter (`:8080` is safe, `:name` is a
  parameter).
