# multi-project fixture

Two independent APIs in one repository, each with its own package manifest and its own OpenAPI
description. Entirely synthetic.

The point of this fixture is that **neither one is the obvious answer**. Both are first-party, both
sit at the same depth, both have a description of similar size. Any rule that picks a winner here is
picking arbitrarily, so `probe` must exit 5 and ask rather than choose.

Used for:

- ambiguous selection: `probe`, `ingest`, `plan` and `apply` all exit 5 with a catalogue
- `--project orders` and `--project services/orders` both resolving to the same project
- `bruno-gen.json` `projects[]` settling it permanently — the test writes that file into a copy
  rather than committing it, so the ambiguous case and the configured case share one fixture
