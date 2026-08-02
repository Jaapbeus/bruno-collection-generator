// The single entry point for reading a spec or collection file off disk.
//
// It always fails loudly. The implementation this replaces returned an empty array when its YAML
// parser was unavailable, so a repository full of YAML specs silently produced nothing and the
// user was told there was no API. Every failure here is named and surfaced.

import { readFileSync, statSync } from 'node:fs';
import { basename, extname } from 'node:path';
import { yaml } from './deps.mjs';


export const KIND = {
  OPENAPI: 'openapi',
  SWAGGER2: 'swagger2',
  POSTMAN: 'postman',
  INSOMNIA: 'insomnia',
  WSDL: 'wsdl',
  UNKNOWN: 'unknown',
};

/** Why a candidate was skipped. Every one of these is reported, never swallowed. */
export const SKIP = {
  EMPTY: 'file is empty',
  TOO_LARGE: 'file is larger than 8 MB',
  UNPARSEABLE: 'not valid JSON or YAML',
  NOT_A_SPEC: 'no openapi/swagger/postman marker',
  NO_PATHS: 'spec has no paths',
  SWAGGER2: 'Swagger 2.0 is not supported yet',
  INSOMNIA: 'Insomnia export is not supported yet',
};

const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Parse a file as JSON or YAML.
 * @returns {{ok: true, data: object, syntax: 'json'|'yaml'} | {ok: false, skip: string, detail?: string}}
 */
/**
 * A parser failure described WITHOUT quoting the file.
 *
 * `probe` reads every .json and .yaml in the repository - including `local.settings.json`,
 * `appsettings.json` and `secrets.json`, which security.md calls primarily secret stores - and put
 * the parser's message straight into `detail`, which the report prints and `--json` carries. V8's
 * JSON errors embed a window of the SOURCE (`Unexpected token '@', ..."nString": @Server=tc"... is
 * not valid JSON`), so that was repository content leaving the machine in a pasteable report.
 *
 * A whitelist, not a denylist: only the position is extracted, and `err.message` is never
 * interpolated. Position alone is what a person needs to open the file and look.
 */
function safeParseDetail(syntax, err) {
  const message = String(err?.message ?? '');
  const at =
    /at position (\d+)/.exec(message)?.[0] ??
    /at line (\d+),? column (\d+)/.exec(message)?.[0] ??
    /\((\d+):(\d+)\)/.exec(message)?.[0] ??
    null;
  return `${syntax}: not valid ${syntax === 'json' ? 'JSON' : 'YAML'}${at ? ` (${at})` : ''}`;
}

/** An fs failure names the operation, never the file's contents. */
const fsDetail = (err) => `cannot read the file (${String(err?.code ?? 'unknown error')})`;

export function parseStructured(path) {
  let size;
  try {
    size = statSync(path).size;
  } catch (err) {
    return { ok: false, skip: SKIP.UNPARSEABLE, detail: fsDetail(err) };
  }
  if (size === 0) return { ok: false, skip: SKIP.EMPTY };
  if (size > MAX_BYTES) return { ok: false, skip: SKIP.TOO_LARGE };

  let text;
  try {
    text = readFileSync(path, 'utf8');
  } catch (err) {
    return { ok: false, skip: SKIP.UNPARSEABLE, detail: fsDetail(err) };
  }
  if (!text.trim()) return { ok: false, skip: SKIP.EMPTY };

  const ext = extname(path).toLowerCase();

  // Try the syntax the extension suggests first, then the other one: plenty of real specs are
  // called .json but written as YAML, and vice versa.
  const tries = ext === '.json' ? ['json', 'yaml'] : ['yaml', 'json'];
  const errors = [];
  for (const syntax of tries) {
    try {
      const data = syntax === 'json' ? JSON.parse(text) : yaml().parse(text, { maxAliasCount: 100 });
      if (data === null || typeof data !== 'object') {
        errors.push(`${syntax}: parsed to a ${data === null ? 'null' : typeof data}, not an object`);
        continue;
      }
      return { ok: true, data, syntax };
    } catch (err) {
      // A whitelist, not a denylist: redacting credential SHAPES from the parser's message still
      // passes through whatever else that line of the file said - a hostname, a table name, a
      // customer identifier. safeParseDetail extracts only the position and never interpolates the
      // message, so nothing from the file escapes whatever V8 or yaml chooses to quote.
      errors.push(safeParseDetail(syntax, err));
    }
  }
  return { ok: false, skip: SKIP.UNPARSEABLE, detail: errors.join('; ') };
}

/** What kind of document is this? Classification only, no validation. */
export function classify(data, path = '') {
  if (!data || typeof data !== 'object') return KIND.UNKNOWN;

  // Compared as a string, not required to BE one. In YAML `openapi: 3.0` is unquoted and therefore
  // the number 3, so `typeof === 'string'` was false and a perfectly usable 3.x spec was discarded
  // as "no openapi marker" - the tool then fell back to reading source, or reported no API at all.
  // The same miss let an unquoted `swagger: 2.0` slip past the rejection below, which is the one
  // thing that check exists to prevent.
  if (data.openapi !== undefined && /^3(\.|$)/.test(String(data.openapi))) return KIND.OPENAPI;
  // Swagger 2.0 must be recognised explicitly so it can be REJECTED. openApiToBruno would
  // otherwise dispatch it to its Swagger-2 path, shipping the very thing the capability matrix
  // says is unsupported.
  if (data.swagger !== undefined && /^2(\.|$)/.test(String(data.swagger))) return KIND.SWAGGER2;
  if (data.info?._postman_id || /schema\.getpostman\.com/.test(String(data.info?.schema ?? ''))) {
    return KIND.POSTMAN;
  }
  if (data._type === 'export' && String(data.__export_source ?? '').includes('insomnia')) {
    return KIND.INSOMNIA;
  }
  if (/\.wsdl$/i.test(path)) return KIND.WSDL;
  return KIND.UNKNOWN;
}

/**
 * Read and classify one candidate file.
 *
 * @returns {{ok: true, kind: string, data: object, syntax: string, title: string|null, pathCount: number}
 *          |{ok: false, skip: string, detail?: string, kind?: string}}
 */
export function readSpec(path) {
  if (/\.wsdl$/i.test(path)) {
    // WSDL is XML; the converter takes the raw text. Size-checked like every other input: this
    // branch read the file with no guard at all, so the 8 MB limit that protects the rest of the
    // pipeline did not apply to it.
    let text;
    try {
      const size = statSync(path).size;
      if (size === 0) return { ok: false, skip: SKIP.EMPTY };
      if (size > MAX_BYTES) return { ok: false, skip: SKIP.TOO_LARGE };
      text = readFileSync(path, 'utf8');
    } catch (err) {
      return { ok: false, skip: SKIP.UNPARSEABLE, detail: fsDetail(err) };
    }
    if (!text.trim()) return { ok: false, skip: SKIP.EMPTY };
    return { ok: true, kind: KIND.WSDL, data: text, syntax: 'xml', title: basename(path), pathCount: 0 };
  }

  const parsed = parseStructured(path);
  if (!parsed.ok) return parsed;

  const kind = classify(parsed.data, path);

  if (kind === KIND.SWAGGER2) return { ok: false, skip: SKIP.SWAGGER2, kind };
  if (kind === KIND.INSOMNIA) return { ok: false, skip: SKIP.INSOMNIA, kind };
  if (kind === KIND.UNKNOWN) return { ok: false, skip: SKIP.NOT_A_SPEC, kind };

  if (kind === KIND.OPENAPI) {
    const paths = parsed.data.paths ?? {};
    const pathCount = Object.keys(paths).length;
    if (pathCount === 0) return { ok: false, skip: SKIP.NO_PATHS, kind };
    return {
      ok: true,
      kind,
      data: parsed.data,
      syntax: parsed.syntax,
      title: parsed.data.info?.title ?? null,
      pathCount,
      operationCount: Object.values(paths).reduce(
        (n, item) =>
          n +
          Object.keys(item ?? {}).filter((k) =>
            ['get', 'put', 'post', 'delete', 'patch', 'head', 'options'].includes(k.toLowerCase()),
          ).length,
        0,
      ),
    };
  }

  // Postman
  const itemCount = Array.isArray(parsed.data.item) ? parsed.data.item.length : 0;
  return {
    ok: true,
    kind,
    data: parsed.data,
    syntax: parsed.syntax,
    title: parsed.data.info?.name ?? null,
    pathCount: itemCount,
    operationCount: itemCount,
  };
}

/** Does this filename look like it is meant to be a spec? Used to keep warnings quiet. */
export const looksLikeSpecName = (path) =>
  /(openapi|swagger|api[-_.]?spec|postman|collection|\.wsdl$)/i.test(basename(path));
