# Auth: the exact shape to write

Read this before putting `auth` in an `api-model.json`. Getting the shape wrong is not a small error:
a mode with no credential block is written as `auth: apikey` with nothing behind it, Bruno accepts the
file, and **every request comes back 401** with nothing in the collection to explain why.

This page exists because that happened. A real run produced:

```json
{ "mode": "apikey", "source": "asked", "in": "header", "name": "x-functions-key", "value": "{{functionKey}}" }
```

Entirely reasonable-looking, and entirely wrong: `in`, `name` and a top-level `value` are not the
fields the writer reads. The schema now rejects it by name, so `plan` will tell you — but knowing the
shape up front is faster than iterating against a validation error.

## The rule

`auth` is either the string `"inherit"` / `"none"`, **or** an object with `mode` plus **the nested
block named after that mode**. No other keys are allowed.

## Every mode

**No auth on this request:**

```json
"auth": "none"
```

**Take the collection's auth** — the normal case for most requests:

```json
"auth": "inherit"
```

**API key** — Azure Functions keys, gateway keys, anything sent as a header or query parameter:

```json
"auth": {
  "mode": "apikey",
  "source": "asked",
  "apikey": {
    "key": "x-functions-key",
    "value": "{{functionKey}}",
    "placement": "header"
  }
}
```

- `key` is the header or query-parameter name.
- `value` is **always a variable reference**, never a literal credential.
- `placement` is `"header"` or **`"queryparams"`** — Bruno's own word. `"query"` is rejected.

**Bearer token:**

```json
"auth": {
  "mode": "bearer",
  "source": "asked",
  "bearer": { "token": "{{accessToken}}" }
}
```

**Basic:**

```json
"auth": {
  "mode": "basic",
  "source": "asked",
  "basic": { "username": "{{username}}", "password": "{{password}}" }
}
```

**OAuth2** — the object is required; its contents vary by grant, so it is not constrained further:

```json
"auth": {
  "mode": "oauth2",
  "source": "spec",
  "oauth2": {
    "grantType": "client_credentials",
    "accessTokenUrl": "https://login.example.com/oauth2/token",
    "clientId": "{{clientId}}",
    "clientSecret": "{{clientSecret}}",
    "scope": "api://widgets/.default"
  }
}
```

## Where to put it

Prefer **collection level** with `"auth": "inherit"` on each request. One place to fix, one variable to
fill in, and it matches how a real collection is maintained by hand.

Put auth on an individual request only when that request genuinely differs — an admin endpoint needing
a master key where everything else uses a function key, or one anonymous health check in an otherwise
authenticated API.

## The variable, and never the value

Whatever the mode, the credential is a `{{variable}}`. Declare the name in each environment's
`secrets` array and leave the value empty:

```json
"environments": [
  { "name": "local", "vars": { "baseUrl": "http://localhost:7071" }, "secrets": ["functionKey"] }
]
```

The user fills it in, in Bruno or with `smoke --var functionKey=…`. A literal credential must never
reach a file this tool writes.

## Two things worth saying to the user

**Ask, do not infer.** Auth is unknowable from source and is a 100%-failure mode: get it wrong and
every request fails identically while the collection looks perfect. `AuthorizationLevel.Anonymous` is a
hint, not the truth — the corpus contains Anonymous functions gated by Easy Auth.

**Record why.** Put what the code suggested into `authNotes`, so the next person can see the attribute
said one thing and the answer was another.
