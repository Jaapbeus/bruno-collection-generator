// Deterministic surface signals for `probe`.
//
// This is NOT endpoint extraction - that is the model's job, guided by reference/sources/*.md.
// It answers a narrower question the script can answer honestly on its own: does this project have
// an HTTP surface at all, which stack is it, and what should be reported as unsupported?
//
// The distinction matters for exit codes. A Functions app whose triggers are all timers has a
// surface, just not an HTTP one, so it exits 3 ("found, none supported") rather than 2 ("nothing
// HTTP-shaped found"). Getting that wrong tells the user their repository is empty when it is not.

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, relative, sep } from 'node:path';
import { SKIP_DIRS } from './format.mjs';
import { byCodepoint, collisionKey } from './paths.mjs';

const CODE_EXT = new Set(['.cs', '.js', '.mjs', '.cjs', '.ts', '.mts', '.cts']);

/**
 * Manifest files that say "this directory is a project", with the stack they imply.
 *
 * Lives here rather than in probe because `codeFiles` needs it too: a scan must stop at a nested
 * project rather than absorbing it.
 */
export const PROJECT_MARKERS = [
  { file: /\.csproj$/i, stack: 'dotnet' },
  { file: /^package\.json$/, stack: 'node' },
  { file: /^pyproject\.toml$/, stack: 'python' },
  { file: /^requirements\.txt$/, stack: 'python' },
  { file: /^go\.mod$/, stack: 'go' },
  { file: /^pom\.xml$/, stack: 'java' },
  { file: /^build\.gradle(\.kts)?$/, stack: 'java' },
];

/** Does this directory hold a project manifest of its own? */
const hasOwnManifest = (dir) => {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .some((e) => e.isFile() && PROJECT_MARKERS.some((m) => m.file.test(e.name)));
  } catch {
    return false;
  }
};
const MAX_FILES = 400;
const MAX_BYTES = 512 * 1024;

/** Azure Functions triggers that are not HTTP. Each becomes a capability entry, never an endpoint. */
const NON_HTTP_TRIGGERS = [
  ['timer-trigger', /\[\s*TimerTrigger|app\.timer\s*\(/],
  ['service-bus-trigger', /\[\s*ServiceBus(Queue|Topic)?Trigger|app\.serviceBus(Queue|Topic)\s*\(/],
  ['event-grid-trigger', /\[\s*EventGridTrigger|app\.eventGrid\s*\(/],
  ['event-hub-trigger', /\[\s*EventHubTrigger|app\.eventHub\s*\(/],
  ['blob-trigger', /\[\s*BlobTrigger|app\.storageBlob\s*\(/],
  ['queue-trigger', /\[\s*QueueTrigger|app\.storageQueue\s*\(/],
  ['cosmos-trigger', /\[\s*CosmosDBTrigger|app\.cosmosDB\s*\(/],
  ['durable-orchestration', /\[\s*OrchestrationTrigger|\[\s*ActivityTrigger|\[\s*DurableClient/],
];

/** Protocols Bruno supports but this skill does not generate. */
const OTHER_PROTOCOLS = [
  ['graphql', /ApolloServer|@nestjs\/graphql|graphql-yoga|buildSchema\s*\(|type\s+Query\s*\{|HotChocolate|AddGraphQLServer/],
  ['grpc', /Grpc\.Core|AddGrpc\s*\(|@grpc\/grpc-js|MapGrpcService/],
  ['websocket', /new\s+WebSocketServer|socket\.io|AddSignalR|MapHub<|UseWebSockets/],
];

/**
 * Markers that a project exposes HTTP endpoints, per stack.
 *
 * These were far too narrow, and the misses were not exotic - they included the very examples the
 * reference cards use. `app.MapGroup("/api")` followed by `group.MapGet(...)`, a Fastify instance
 * held in any variable but `fastify`, `express.Router()` in a variable called anything but `router`,
 * `export const GET =`, and a `[Route]` controller with no `[ApiController]` all scored as "no HTTP
 * surface", which exits 2 and tells the user their repository has no API in it.
 *
 * The tension is HTTP *clients*: `axios.get('/x')` is indistinguishable from a route registration
 * by shape alone. So the receiver has to look like a server or router rather than being any
 * identifier at all, and the framework import counts as a marker in its own right.
 */
const HTTP_MARKERS = [
  ['azure-functions-isolated', /\[\s*HttpTrigger|app\.http\s*\(/],
  // A controller is a controller whether or not it carries [ApiController].
  ['aspnet-controllers', /\[\s*ApiController\s*\]|\[\s*Route\s*\(|:\s*Controller(Base)?\b/],
  // Any receiver: MapGroup returns a builder that is then held in a local.
  ['aspnet-minimal-api', /\b[\w.]+\.Map(Get|Post|Put|Patch|Delete|Group|Methods)\s*[(<]/],
  // The non-generic base classes have no `<`, so requiring one missed them.
  ['fastendpoints', /:\s*Endpoint(WithoutRequest|WithoutResponse)?\b|\bVerbs\s*\(\s*Http\./],
  [
    'express',
    /\b(app|router|server|api)\.(get|post|put|patch|delete|all|route)\s*\(\s*['"`]|\b\w+(Router|App|Server)\.(get|post|put|patch|delete|all|route)\s*\(\s*['"`]|require\(\s*['"]express['"]|from\s+['"]express['"]/i,
  ],
  [
    'fastify',
    /\bfastify\.(get|post|put|patch|delete|all)\s*\(|\bfastify\.route\s*\(|require\(\s*['"]fastify['"]|from\s+['"]fastify['"]/,
  ],
  // A bare @Get() on a non-controller class is not a route, so anchor on the controller or the import.
  ['nestjs', /@Controller\s*\(|from\s+['"]@nestjs\/(common|core)['"]/],
  [
    'nextjs-route-handler',
    /export\s+(async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b|export\s+const\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s*[:=]/,
  ],
];

/**
 * Strip comments before matching.
 *
 * A commented-out `// app.get("/legacy", h)` counted as a live route. `://` is left alone so a URL
 * in a string is not mistaken for the start of a comment, and a `//` inside a quoted string literal
 * (a route like `"/a//b"`) is left alone too - a plain "not preceded by `:`" regex read that as a
 * comment start and silently dropped the rest of the line, including any HTTP marker after it.
 */
function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, ' ').split('\n').map(stripLineComment).join('\n');
}

/** Remove a trailing `//` line comment from one line, but never one inside a string literal. */
function stripLineComment(line) {
  let inString = null; // the quote character we are inside, or null
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inString) {
      if (ch === '\\') { i++; continue; } // an escaped character can't close or open a string
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inString = ch; continue; }
    if (ch === '/' && line[i + 1] === '/' && line[i - 1] !== ':') return line.slice(0, i);
  }
  return line;
}

/** Azure Functions in-process: recognised, deliberately not extracted. */
const IN_PROCESS = /\[\s*FunctionName\s*\(/;

/**
 * Every candidate source file, and whether the cap hid any of them.
 *
 * Collected and sorted rather than streamed. The old generator stopped after MAX_FILES in
 * `readdirSync` order over a LIFO stack, so WHICH files were scanned depended on filesystem
 * enumeration order: a package with 450 library files in `src/zzz-lib/` and one route file in
 * `src/a-routes/` reported no HTTP surface, and merely renaming the directories changed the answer.
 * Determinism is not negotiable here, and neither is being honest that a cap was hit.
 *
 * @returns {{files: string[], total: number, truncated: boolean}}
 */
function codeFiles(root, maxDepth = 6) {
  const all = [];
  const stack = [[root, 0]];
  while (stack.length) {
    const [dir, depth] = stack.pop();
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    entries.sort((a, b) => byCodepoint(a.name, b.name));
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        // Case-folded: on Windows and macOS a `Bin/`, `Obj/` or `Node_Modules/` was walked anyway,
        // which is the very thing the `.tmp` entry in SKIP_DIRS was added to prevent.
        if (SKIP_DIRS.has(e.name) || SKIP_DIRS.has(collisionKey(e.name))) continue;
        // A nested project is scanned as ITSELF and gets its own candidate, so absorbing it here
        // made a workspace root inherit its members' HTTP surface: a root package.json with
        // `workspaces` scored highest despite holding no code, and every workspace monorepo was
        // therefore ambiguous (exit 5) between the root and the package that really has the API.
        if (hasOwnManifest(p)) continue;
        if (depth < maxDepth) stack.push([p, depth + 1]);
        continue;
      }
      if (!CODE_EXT.has(extname(e.name).toLowerCase())) continue;
      if (/\.(spec|test)\.(ts|js|mjs|cjs)$/i.test(e.name)) continue;
      all.push(p);
    }
  }
  // Sort the WHOLE set, then cap. This - not the traversal - is what makes the answer reproducible,
  // and the sort key is the FORWARD-SLASHED path relative to the scan root: sorting native absolute
  // paths ordered `\` (0x5C) against `/` (0x2F), so sibling directories fell in a different order on
  // Windows than on POSIX, and with a cap in play that means a different set of files survives and the
  // same repository answers differently per platform. Determinism has to hold across machines, not
  // just across runs on one.
  //
  // Two merged implementations each tried to guarantee the order in the walk instead - one pushing
  // directories inline, one collecting and reverse-pushing them - and the resolution kept the inline
  // push beside the other's now-empty array, so a reverse-push loop ran over nothing while its comment
  // claimed to be the reason the answer was reproducible. Do not reintroduce an ordering promise up
  // there; it would be a second, weaker copy of this one.
  const keyOf = (p) => relative(root, p).split(sep).join('/');
  all.sort((a, b) => byCodepoint(keyOf(a), keyOf(b)));
  return { files: all.slice(0, MAX_FILES), total: all.length, truncated: all.length > MAX_FILES };
}

/**
 * Scan a project root for surface signals.
 *
 * @returns {{stacks: string[], httpMarkers: object[], capability: object[], hasHttp: boolean,
 *            functionsApp: boolean, filesScanned: number}}
 */
export function surfaceSignals(projectRoot, { repoRoot = projectRoot } = {}) {
  const rel = (p) => relative(repoRoot, p).split(sep).join('/');
  const functionsApp = existsSync(join(projectRoot, 'host.json'));

  const found = new Map(); // signal id -> [paths]
  let filesScanned = 0;
  const digestParts = [];

  const scan = codeFiles(projectRoot);
  for (const file of scan.files) {
    let text;
    try {
      if (statSync(file).size > MAX_BYTES) continue;
      const raw = readFileSync(file, 'utf8');
      digestParts.push(
        `${rel(file)}:${createHash('sha256').update(raw, 'utf8').digest('hex')}`,
      );
      text = stripComments(raw);
    } catch {
      // statSync is outside the readdir that produced this path, so a file removed in between - a
      // build writing to obj/ during a scan - must not take probe down with an uncaught ENOENT.
      continue;
    }
    filesScanned++;

    const note = (id) => {
      if (!found.has(id)) found.set(id, []);
      const list = found.get(id);
      if (list.length < 5 && !list.includes(rel(file))) list.push(rel(file));
    };

    for (const [id, re] of HTTP_MARKERS) if (re.test(text)) note(id);
    for (const [id, re] of NON_HTTP_TRIGGERS) if (re.test(text)) note(id);
    for (const [id, re] of OTHER_PROTOCOLS) if (re.test(text)) note(id);
    if (IN_PROCESS.test(text)) note('azure-functions-in-process');
  }

  const httpIds = HTTP_MARKERS.map(([id]) => id);
  const stacks = httpIds.filter((id) => found.has(id));
  const hasHttp = stacks.length > 0;

  const capability = [];

  for (const [id] of NON_HTTP_TRIGGERS) {
    if (!found.has(id)) continue;
    capability.push({
      subject: id,
      supported: false,
      reason: 'not an HTTP trigger; it cannot be expressed as a request and is never emitted',
      paths: found.get(id),
    });
  }

  for (const [id] of OTHER_PROTOCOLS) {
    if (!found.has(id)) continue;
    capability.push({
      subject: id,
      supported: false,
      reason:
        id === 'graphql'
          ? 'GraphQL is not generated in this version; Bruno supports it, this skill does not build it'
          : `${id} is not generated in this version`,
      paths: found.get(id),
    });
  }

  if (found.has('azure-functions-in-process')) {
    capability.push({
      subject: 'azure-functions-in-process',
      supported: false,
      reason:
        'in-process Azure Functions ([FunctionName]) are recognised but not extracted in this version; ' +
        'the isolated worker model ([Function] + [HttpTrigger]) is supported',
      paths: found.get('azure-functions-in-process'),
    });
  }

  return {
    stacks,
    httpMarkers: stacks.map((id) => ({ stack: id, paths: found.get(id) })),
    capability,
    hasHttp,
    functionsApp,
    filesScanned,
    // Reported rather than left implicit: a cap that silently hides files turns "no HTTP surface
    // here" into a guess, and the caller has to be able to say so.
    filesFound: scan.total,
    truncated: scan.truncated,
    sourceDigest: `sha256:${createHash('sha256').update(digestParts.sort().join('\n'), 'utf8').digest('hex')}`,
    // A surface exists but none of it is supported: exit 3, not 2. A Functions app of pure timers,
    // or a GraphQL-only service, is not an empty repository.
    surfaceButUnsupported: !hasHttp && capability.length > 0,
  };
}
