# Vendored dependencies

The skill's runtime dependencies ship as one committed CJS bundle, `bruno-libs.cjs`, plus the
lazily-loaded `workers/worker-script.js` beside it. `node_modules` is **never committed**.

## Why vendored at all

1. **The skill must never load code from the repository it is inspecting.** Repository content is
   untrusted input; resolving `node_modules` from the target repo would execute code chosen by
   whoever wrote that repo.
2. **The packages are not resolvable any other way.** Bruno's libraries ship only inside the global
   `@usebruno/cli`'s own nested `node_modules`, where `require.resolve('@usebruno/filestore')` fails
   from any normal working directory, and npm may hoist that private layout at any time. A user who
   installed the CLI with pnpm, npx or not at all has nothing to resolve.
3. **No install step, no network.** The skill runs offline on first contact.

## Why a bundle and not a committed tree

The first attempt committed the whole `node_modules`, and it failed for two reasons found only in CI:

- **Windows could not check the repository out.** The deepest committed path was **187 characters**
  (`.../vendor/node_modules/@usebruno/filestore/src/formats/bru/tests/fixtures/request-parse-and-redact-body-data/output.bru`).
  With a workspace prefix that exceeds Windows' 260-character `MAX_PATH`, so `git checkout` failed
  with `Filename too long` — for CI *and* for anyone cloning the repository.
- **The committed tree was incomplete.** A `node_modules/` gitignore rule matches at every depth, so
  a single negation re-included only the top-level directory. Nested copies such as
  `make-dir/node_modules/semver` stayed excluded, leaving the tree one package short of its own
  lockfile.

The bundle is **4.93 MB** against 37 MB for the tree, and the longest committed path is now 102
characters. CI asserts both: no tracked `node_modules`, and no committed path over 150 characters.

**CJS, not ESM**, deliberately: `@usebruno/filestore` locates its worker script with
`join(__dirname, './workers/worker-script.js')`, and `__dirname` does not exist in an ESM bundle.
That reference is evaluated lazily inside `enqueueTask`, and this skill only calls the synchronous
functions — but the worker is bundled beside `bruno-libs.cjs` anyway, so a future call resolves
rather than crashing confusingly.

## What is pinned, and why these versions

| Package | Version | Why |
|---|---|---|
| `@usebruno/filestore` | 0.10.0 | The version **Bruno 4.0.0 itself bundles**. The app has to open what we write, so we match it rather than the CLI. |
| `@usebruno/lang` | 0.37.0 | Pinned transitively by filestore 0.10.0. |
| `@usebruno/converters` | 0.21.0 | The app's version. |
| `@usebruno/schema` | 0.27.0 | Pinned transitively by converters 0.21.0. |
| `ajv` | 8.20.0 | Validates the IR. Note the default export understands draft-07 only; the schema is 2020-12, so the bundle exposes `ajv/dist/2020.js`. |
| `yaml` | 2.9.0 | Reads YAML specs. Never optional: the implementation this replaces silently produced nothing when its YAML parser was missing. |

`@usebruno/common` is deliberately **absent** — it is a dependency of `filestore@0.11.0`, not
`0.10.0`. The Bruno CLI 4.0.0 ships a newer set (`filestore@0.11.0`, `lang@0.38.0`,
`converters@0.22.0`, `schema@0.28.0`); the test matrix parses generated output with both, so a skew
between app and CLI is caught rather than assumed away.

## Versions are exact, never ranges

All four `@usebruno` packages are `0.x` on a lockstep monthly minor cadence, and under semver a `0.x`
minor may break. They are also undocumented monorepo internals: no `repository`, `homepage` or `bugs`
field on npm, no CHANGELOG, and `filestore`'s own README currently claims YAML is "not yet
implemented" while its `DEFAULT_COLLECTION_FORMAT` is `'yml'`. There is no release note to read
before upgrading, so a floating range would be a silent-corruption risk rather than a convenience.
`check-vendor-hash.mjs` rejects any range.

## Rebuilding (maintainer step, needs the network)

```bash
node scripts/build-vendor-bundle.mjs
```

It installs the pinned dependencies into a gitignored `node_modules`, bundles with a pinned esbuild,
then regenerates `VERSIONS.json`, `BUNDLE.sha256`, `SBOM.json` and `LICENSES.md`. Commit those plus
`bruno-libs.cjs` and `workers/worker-script.js`.

To change a version, edit `package.json`, run the build, and commit the result. Expect golden files
to move — that is a **minor** version bump of the plugin by the changelog rule.

## Verification

`node scripts/check-vendor-hash.mjs` runs offline and without `node_modules`, which is the point: CI
must be able to check the artefact it actually ships. It verifies the bundle's sha256 against
`BUNDLE.sha256`, that every direct dependency is an exact version, that `VERSIONS.json` agrees with
those pins and with the transitive set Bruno 4.0.0 bundles, that the lockfile is version 3 or newer,
that the SBOM describes this bundle, and that no bundled package is unlicensed.

Current bundle: **125 packages**, all with a declared licence (MIT 106, ISC 9, plus BSD-2-Clause,
BSD-3-Clause, Apache-2.0, 0BSD, BlueOak-1.0.0, Python-2.0 and CC-BY-4.0). See `LICENSES.md`.
