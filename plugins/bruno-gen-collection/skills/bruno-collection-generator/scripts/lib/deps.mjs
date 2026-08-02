// The only place Bruno's libraries are loaded.
//
// They come from one committed bundle, `../vendor/bruno-libs.cjs`. Not the target repository's
// node_modules (that would execute code from the repository under inspection), and not a global
// `@usebruno/cli` install (its copies live in a private nested layout that npm may hoist, and
// `require.resolve('@usebruno/filestore')` fails from any normal working directory).
//
// A bundle rather than a committed node_modules tree because the tree's deepest path was 187
// characters: with a workspace prefix that exceeds Windows' 260-character MAX_PATH, so
// `git checkout` failed outright on Windows, for CI and for anyone cloning the repository. The
// bundle is CJS, because filestore locates its worker script with __dirname, which an ESM bundle
// does not have.

import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const vendorDir = join(here, '..', 'vendor');
const bundlePath = join(vendorDir, 'bruno-libs.cjs');
const versionsPath = join(vendorDir, 'VERSIONS.json');
const require = createRequire(import.meta.url);

export const MIN_NODE_MAJOR = 20;

export class DependencyError extends Error {
  constructor(message, { hint } = {}) {
    super(message);
    this.name = 'DependencyError';
    this.hint = hint;
  }
}

/** Node version gate. Returns the detected major so callers can report it. */
export function assertNodeVersion() {
  const major = Number(process.versions.node.split('.')[0]);
  if (!Number.isFinite(major) || major < MIN_NODE_MAJOR) {
    throw new DependencyError(
      `Node ${MIN_NODE_MAJOR} or newer is required; this is Node ${process.versions.node}.`,
      {
        hint:
          'Install Node 20+: `winget install OpenJS.NodeJS` (Windows), `brew install node` (macOS), ' +
          'or your distribution package. Nothing was written.',
      },
    );
  }
  return major;
}

let _bundle;
function bundle() {
  if (_bundle) return _bundle;
  if (!existsSync(bundlePath)) {
    throw new DependencyError('The vendored library bundle is missing.', {
      hint:
        `Expected ${bundlePath}\n` +
        'It is committed, so this usually means an incomplete checkout. A maintainer can rebuild it:\n' +
        '  node scripts/build-vendor-bundle.mjs',
    });
  }
  try {
    _bundle = require(bundlePath);
  } catch (err) {
    // Every way `require` can fail on a 4.9 MB committed file - truncated, corrupted, a partial
    // checkout, an LFS pointer left unresolved - arrives here as a raw SyntaxError, which bypassed
    // the DependencyError branch in the CLI entirely. So the carefully written "incomplete checkout,
    // a maintainer can rebuild it" hint was unreachable and the user got a stack trace.
    //
    // Deliberately NOT verified against BUNDLE.sha256 at runtime: that file sits in the same
    // directory as the bundle, so anyone able to change one can change the other. It detects
    // corruption, which this already reports, and not tampering, which it cannot. CI is where the
    // digest means something, because there the tree comes from git.
    throw new DependencyError('The vendored library bundle could not be loaded.', {
      hint:
        `Tried ${bundlePath}\n` +
        `The file is present but unusable (${err.message.split('\n')[0]}).\n` +
        'It is committed, so this usually means a corrupted or incomplete checkout. A maintainer can rebuild it:\n' +
        '  node scripts/build-vendor-bundle.mjs',
    });
  }
  return _bundle;
}

/**
 * Bruno's canonical reader/writer for both formats.
 * parseRequest/stringifyRequest, parseCollection/stringifyCollection,
 * parseFolder/stringifyFolder, parseEnvironment/stringifyEnvironment, parseDotEnv.
 */
export const filestore = () => bundle().filestore;

/** Import-only converters: postmanToBruno, wsdlToBruno, openApiToBruno, brunoToOpenCollection. */
export const converters = () => bundle().converters;

/** The low-level .bru grammar. Used only by syntax-level tests. */
export const lang = () => bundle().lang;

/** JSON Schema 2020-12 validator. Ajv's default export understands draft-07 only. */
export const ajv2020 = () => bundle().Ajv2020;

/** YAML parser, for reading specs. */
export const yaml = () => bundle().YAML;

let _versions;
let _versionsProblem = null;
/** Versions baked in at build time - the bundle has no package.json files to read. */
export function libraryVersions() {
  if (!_versions) {
    try {
      const v = JSON.parse(readFileSync(versionsPath, 'utf8'));
      _versions = {
        filestore: v.filestore ?? null,
        lang: v.lang ?? null,
        converters: v.converters ?? null,
        schema: v.schema ?? null,
        ajv: v.ajv ?? null,
        yaml: v.yaml ?? null,
      };
    } catch (err) {
      // All-null either way, because a version is genuinely unknown - but the reason is recorded, so
      // `version` can distinguish a file that is absent from one that is corrupt. Reporting
      // "(missing)" for both sent a maintainer looking for a file that was sitting right there.
      _versions = { filestore: null, lang: null, converters: null, schema: null, ajv: null, yaml: null };
      _versionsProblem = existsSync(versionsPath)
        ? `${basename(versionsPath)} is present but unreadable: ${err.message.split('\n')[0]}`
        : `${basename(versionsPath)} is missing`;
    }
  }
  return { ..._versions, node: process.versions.node, ...(_versionsProblem ? { problem: _versionsProblem } : {}) };
}

/**
 * Parse a collection file, failing loudly - and quietly.
 *
 * The vendored readers signal failure in three different ways, none of them a plain throw, all
 * measured against the pinned bundle:
 *
 *   parseRequest (both formats)          throws - but FIRST writes a code frame to STDOUT,
 *                                        quoting the offending line of the file
 *   parse{Environment,Folder,Collection} return a REJECTED PROMISE, so a caller that treats the
 *     in bru                             result as data sees `undefined` fields, not an error
 *   the same three in yml                return a plausible EMPTY object and never signal at all
 *
 * Every one of those becomes a defect somewhere else. The stdout frame corrupts `--json` output and
 * copies repository content into a report that is meant to be pasteable. A promise or an empty
 * object read as data makes an unparseable file look like an EMPTY file - which is how the secret
 * carve-out came to rewrite a user's environment down to nothing but secret names.
 *
 * So: silence the library's own logging, turn every failure mode into a throw, and reject a result
 * that is not the shape the caller asked for.
 */
const PARSERS = {
  request: ['parseRequest', (v) => v && typeof v === 'object' && (v.request || v.meta)],
  environment: ['parseEnvironment', (v) => v && typeof v === 'object' && Array.isArray(v.variables)],
  folder: ['parseFolder', (v) => v && typeof v === 'object'],
  root: ['parseCollection', (v) => v && typeof v === 'object'],
};

export function parseStrict(kind, text, { format }) {
  const entry = PARSERS[kind];
  if (!entry) throw new Error(`parseStrict: no reader for kind "${kind}"`);
  const [method, looksRight] = entry;

  // The library logs with console.*, so swapping those is enough; verified against the bundle.
  const real = { log: console.log, error: console.error, warn: console.warn, info: console.info, debug: console.debug };
  const quiet = () => {};
  let result;
  try {
    Object.assign(console, { log: quiet, error: quiet, warn: quiet, info: quiet, debug: quiet });
    result = filestore()[method](text, { format });
  } finally {
    Object.assign(console, real);
  }

  if (result && typeof result.then === 'function') {
    // A rejected promise is how bru reports a syntax error. Consume it so it cannot surface later as
    // an unhandled rejection, and report it as the failure it is.
    result.catch(() => {});
    throw new Error(`${format} ${kind} did not parse`);
  }
  if (!looksRight(result)) throw new Error(`${format} ${kind} did not parse into a ${kind}`);
  return result;
}

/**
 * The in-memory item type Bruno's writers accept. `'http'` throws in the yml writer and merely
 * logs an error in the bru writer, so it must never appear in the IR. Both writers put
 * `type: http` into the file themselves.
 */
export const ITEM_TYPE_HTTP = 'http-request';

/** Collection formats filestore understands. */
export const FORMATS = Object.freeze(['bru', 'yml']);
