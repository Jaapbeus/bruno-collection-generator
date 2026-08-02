# Pinned models

Each `*.model.json` here is what a model following the matching `reference/sources/*.md` card should
produce from the fixture of the same name.

They exist to pin the **emission** half of the Phase 4 gate: given this model, the writer must always
produce the same collection, on every platform and Node version. That is deterministic and runs on
every PR.

The **extraction** half — whether a real Claude invocation actually produces this model from that
source — cannot be asserted by a script. It needs a model, a network and money, and it is not
bit-deterministic. It lives in `plugins/bruno-gen-collection/skills/bruno-collection-generator/evals/evals.json`
and is a release gate, run by hand before a version bump.

Two things worth knowing when reading `src-dotnet-functions.model.json`:

- `routePrefix` is `/api`, read from `host.json` → `extensions.http.routePrefix`, and it does **not**
  also appear in `pathTemplate`. Composing the two is the writer's job; duplicating it there produced
  `/api/api/widgets` the first time round.
- The `[TimerTrigger]` function is in `capability[]`, never in `endpoints[]`. A timer cannot be
  expressed as a request, and emitting one would be a fabricated endpoint.

The schema is strict (`additionalProperties: false`), so these files carry no comment fields. That is
deliberate: a model that invents a field should fail loudly rather than have it silently ignored.
