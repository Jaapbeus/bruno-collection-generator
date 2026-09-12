# Running it in CI

The half of this tool that writes files needs no model, so it runs unattended. The half that reads
source code does not. That line decides what belongs in a pipeline.

## What can run in CI

| | |
|---|---|
| `probe --json` | what describes this API, and is there more than one API here |
| `ingest` | OpenAPI / Postman / WSDL → model, then `plan` and `apply` |
| `plan --json` | would anything change? |
| `apply` | write it |
| `doctor --json` | inventory, duplicates, undeclared variables, committed credentials |
| `smoke --env <name> --yes` | actually send the requests — only where that is appropriate |

## What cannot

Reading source code to build a model. That needs Claude. So a repository with **no** description can
be checked for drift in CI only if you commit the model — which is a reasonable thing to do:

```
brunogen plan --root . --model api-model.json --json
```

Exit 0 means the committed collection matches the committed model. Anything else means someone changed
one without the other.

There is deliberately **no `verify` command**. It would be permanently red the moment a human edits one
request, which is a supported and expected thing to do.

## Exit codes

| Code | Meaning | In a pipeline |
|---|---|---|
| 0 | ok | pass |
| 1 | error | fail |
| 2 | nothing HTTP-shaped found at all | usually a misconfigured path |
| 3 | a surface was found but none of it is supported | not a failure of your repository |
| 4 | required values unresolved — **files were still written and are valid** | `apply --allow-unresolved` passes; `plan`/`ingest` do not take the flag |
| 5 | several APIs here and none was chosen | pass `--project`, or add `projects[]` |

When more than one applies, the highest wins: **5 > 3 > 2 > 4**.

Exit 4 is a warning, not a failure. The collection is written and correct; some required input had no
value to put in it. Treat it as a signal to fill in `bruno-gen.json`, not as a broken build.
`--allow-unresolved` is accepted only by `apply` — the drift check below runs `plan`, which has no such
flag, so a repository with unresolved values fails that check on exit 4 until `apply` has run once with
the flag (or the values are filled in).

## A drift check

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20

- name: Bruno collection is in sync
  run: |
    node path/to/brunogen.mjs ingest --root . --out /tmp/model.json
    node path/to/brunogen.mjs plan   --root . --model /tmp/model.json --json > /tmp/plan.json
    node -e '
      const p = require("/tmp/plan.json");
      const changing = p.decisions.filter(d => ["create","updated","orphan"].includes(d.status));
      if (changing.length) {
        console.error("The collection no longer matches the spec:");
        for (const d of changing) console.error(`  ${d.status.padEnd(8)} ${d.relPath}`);
        process.exit(1);
      }
      console.log("in sync");
    '
```

`plan` writes nothing, so this is safe on any branch.

## A credential check

```yaml
- name: No credentials in the collection
  run: node path/to/brunogen.mjs doctor --root . --json > /tmp/doctor.json
- run: |
    node -e '
      const d = require("/tmp/doctor.json");
      if (d.secretFindings?.length) {
        console.error("Suspected credentials (reported by location, never by value):");
        for (const s of d.secretFindings) console.error(`  ${s.path}:${s.line}  ${s.key} (${s.reason})`);
        process.exit(1);
      }
    '
```

This step is redundant with `doctor`'s own exit code (1 whenever `secretFindings` is non-empty), and is
worth keeping anyway: it's what actually reads the field, so a future rename that quietly drifted from
`doctor.mjs`'s real JSON shape would fail loudly here instead of leaving a check that always passes.

`doctor` never prints a candidate value, so its output is safe to keep as a build artefact.

### If your own scanner flags the lockfile

It will, eventually, and it will be wrong. `.bruno-gen/lock.json` holds a path, an endpoint key, a kind,
a sidebar number and a sha256 digest per file — nothing that can carry a value. But a 64-character hex
digest is full of digit runs, so any numeric pattern without a word boundary matches one sooner or
later: a sha256 digest matches `06[-\s]?[0-9]{8}` (a Dutch mobile number) 0.48% of the time, which is a
77% chance somewhere in a collection of 300 files.

Repair the pattern rather than the path. Hex letters are word characters, so anchoring the rule keeps it
out of digests while still matching a real number:

```toml
# .gitleaks.toml — before: matches inside any sha256 digest
regex = '''06[-\s]?[0-9]{8}'''
# after
regex = '''\b06[-\s]?[0-9]{8}\b'''
```

Exempting `**/.bruno-gen/lock.json` also silences it, and leaves the rule to misfire on the next digest
or generated identifier that gets committed. If you do exempt, exempt that path only — the requests and
environments are where a real leaked credential would sit.

## `smoke` in CI

`smoke` sends real requests. That is fine against a deployed test environment and wrong against
production. It excludes requests tagged `destructive` by default; keep that.

Secrets are declared **by name with an empty value**, so a collection whose auth uses one cannot
authenticate on its own — it would send an empty key and report a tidy 401. Supply the value for the run
with `--var`, which reaches Bruno as `--env-var` and is never written to disk:

```yaml
- run: |
    node path/to/brunogen.mjs smoke --root . --env test --yes \
      --var "functionKey=$FUNCTION_KEY"
  env:
    FUNCTION_KEY: ${{ secrets.FUNCTION_KEY }}
```

It needs Bruno's CLI (`npm install -g @usebruno/cli@4.0.0`). Response headers and bodies are never
written to the reporter file, query-string values are redacted before anything is printed, and the value
half of every `--var` is redacted when the command is echoed back — a run log is not a place for a
function key.

### What counts as a failure

| Result | Meaning | Exit |
|---|---|---|
| `ok` | 2xx or 3xx | 0 |
| `reached` | the request arrived and came back **4xx** | 0, reported prominently |
| `fail` | nothing was sent, an assertion failed, or the server returned **5xx** | 1 |

A 4xx is not a failure because it proves the request was built, resolved and sent — which is what a
smoke test is for, and with no key supplied it is the expected result. A 5xx is a failure: nobody would
call a collection working because every endpoint returned 500.

Note that **`bru run` itself exits 0 even when every request fails** with a connection error, which is
why `smoke` decides from the parsed reporter rather than the process exit code.

## Line endings on Windows runners

The lockfile hash strips `\r` before hashing, so a collection cloned with `core.autocrlf=true`
classifies identically to one cloned on Linux. This is tested, not assumed: on a stock Windows clone of
a real repository, 8 of 19 collection files come back with mixed endings, and without that
normalisation every one of them would look human-edited.

If you commit goldens of your own, exempt them from `text=auto` in `.gitattributes` or byte-exact
comparison will fail on Windows only.
