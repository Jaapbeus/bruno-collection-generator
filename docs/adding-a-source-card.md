# Adding support for a stack

Support for a framework is a **markdown card**, not a parser. A card lives in
`plugins/bruno-gen-collection/skills/bruno-collection-generator/reference/sources/` and tells Claude
what to look for; the script validates the result and does all the writing.

## Why prose instead of a regex

This is the trade honestly stated. A stale regex detector returns zero endpoints, which is loud and
obvious. A stale card produces plausible wrong output, which is quiet and worse.

The card wins anyway, because the things that actually break extraction are not tokenising problems:

- attributes in any order, split across lines, with unrelated attributes between them
- partial classes, base classes, endpoints declared through a project-specific helper
- a route built by string concatenation, or a function name held in a `const`
- a prefix that lives in a completely different file (`host.json`, a `UsePathBase` call, an `app.use`)

A regex handles none of those. Claude handles all of them, given the right things to look for. And the
model is doing the reading in either case — the only question is whether it reads with guidance.

The guard against a stale card is a test, not discipline: `check-card-fixtures` asserts that **every
stack a card claims has a fixture behind it**. Claim FastAPI in prose without adding a fixture and the
suite fails.

## What a card must contain

Look at [`dotnet.md`](../plugins/bruno-gen-collection/skills/bruno-collection-generator/reference/sources/dotnet.md)
for the pattern. Six things:

1. **How to recognise the stack** — the manifest entry, the import, the attribute. Enough to tell it
   apart from a neighbouring stack in the same repository.
2. **Where the route prefix comes from**, and its default. This is the single most common way to get a
   whole collection wrong: every request 404s and the endpoint list still looks perfect. Say where it
   lives, say what happens when the file is absent, and say that the default belongs to *that* stack
   and not to any other.
3. **How to find the method, path and parameters** — including the forms that do not look like the
   common case.
4. **How to decide `required`.** The IR schema rejects a parameter with no explicit `required`, so
   there is no way to skip this. Give the stack's actual rule: a non-nullable reference type, a
   `required` member, `[Required]`, a route token, a destructured field with no default.
5. **What is unsupported here**, named. A non-HTTP trigger, a protocol, a binding style that is
   recognised but not extracted. Being told is better than being ignored.
6. **What to ask instead of guessing.** Auth and base URL are unknowable from source and each is a
   100%-failure mode. The card should say what to prefill from and what to confirm.

## Steps

1. **Write the fixture first.** `tests/fixtures/src-<stack>/`, hand-written and synthetic: hosts limited
   to `example.com` and `localhost`, all-zero GUIDs, no real identifier anywhere.
   `check-fixture-hygiene` enforces this. Include at least one thing that is *not* the easy case — a
   mounted router, a versioned prefix, a non-HTTP entry point that must not be emitted.
2. **Write the card.** Reference the fixture. If the card mentions a stack the fixtures do not cover,
   say so explicitly as a limitation rather than implying support.
3. **Add signals if the stack needs them.** `scripts/lib/signals.mjs` answers "is there an HTTP surface
   here, and what is unsupported" deterministically. It does *not* extract endpoints. Add a marker only
   if the existing ones do not already recognise the stack.
4. **Pin a model.** `tests/models/src-<stack>.model.json` plus a test asserting the collection it
   produces. This is the emission half of the gate and it runs on every PR.
5. **Add an eval case.** `evals/evals.json`, with `mustFind`, `mustNotDo` and a threshold. This is the
   extraction half: it needs a real model and cannot run in CI, so it is a manual release gate.
6. **Update the capability matrix** in `docs/capabilities.md` and the table in `README.md` — with
   `measured: —` until an eval has actually produced numbers for that row.

## The rule about confidence

No stack may publish a measured confidence until its eval has been run and has produced a number.
"Target: medium" is honest. "Medium" with nothing behind it is not.

## Testing your card by hand

```
node plugins/bruno-gen-collection/skills/bruno-collection-generator/scripts/brunogen.mjs \
  probe --root tests/fixtures/src-<stack>
```

Then invoke the skill against a *copy* of the fixture in a fresh session, without hinting at the answer
and without pasting the card, and compare what it writes against your pinned model. If it gets
something wrong, fix the card — that is what the exercise is for.
