# legacy-sidecars fixture

A repository as the PowerShell generator left it: an existing collection at `bruno/collection/`, plus
the three sidecar files that tool created. Entirely synthetic.

Two details are deliberate and load-bearing:

1. **`BaseUrl.json` and `bruno-generator.json` disagree.** They give different URLs for `Test`, and
   `BaseUrl.json` also declares an `Acceptance` environment the other does not. The old tool loaded
   `BaseUrl.json` second and never overwrote it, so it holds the URLs the repository was really used
   with — migration has to take it, and a test asserts the stale host never appears.

2. **The collection is at `bruno/collection/`, not `bruno/`.** The default output directory would
   create a second collection beside this one, so the existing root has to win.

`bruno/examples/createwidget.json` carries values a human clearly typed (`quantity: 250`), which must
outrank the `1` the C# property initialiser would produce.
