// The value-population contract.
//
// A collection full of "" and 0 is a collection nobody runs, so every emitted value goes through
// this. Two things make it more than a type-to-default table:
//
//   1. Documentation is full of values that are non-empty and useless - "https://...",
//      "<object_name>", a literal "" copied from a README. They must not satisfy "has a value".
//   2. Synthesis must be a fixed constant, never a clock reading, or every run produces a diff.

/** Every synthesised value is a constant. `new Date()` here would break the zero-diff guarantee. */
export const CONSTANTS = Object.freeze({
  'date-time': '1970-01-01T00:00:00Z',
  date: '1970-01-01',
  time: '00:00:00',
  duration: 'PT1H',
  uuid: '00000000-0000-0000-0000-000000000000',
  email: 'user@example.com',
  hostname: 'example.com',
  uri: 'https://example.com',
  'uri-reference': '/example',
  url: 'https://example.com',
  ipv4: '127.0.0.1',
  ipv6: '::1',
  byte: 'ZXhhbXBsZQ==',
  binary: '@file(example.bin)',
  password: '{{password}}',
});

/**
 * Values that are present but unusable. Documentation ellipses are the common case and the one
 * that silently passes a naive "is it non-empty" test.
 */
const JUNK = [
  /^\s*$/,
  /^\s*<[^<>]*>\s*$/, // <object_name>
  /\.\.\.|…/, // "https://..." or "https://.../data/{id}"
  /^\s*(todo|tbd|fixme|changeme|change-me|xxx+|n\/a|none|null|undefined)\s*$/i,
  /^\s*(your|my)[-_ ]/i, // your-api-key
  /^\s*\{\{\s*\}\}\s*$/,
];

/** Is an observed value fit to emit? */
export function isUsable(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'boolean' || typeof value === 'number') return true;
  const s = String(value);
  return !JUNK.some((re) => re.test(s));
}

/** Format-aware synthesis. Returns a string, always the same one for the same input. */
export function synthesize({ type, format, enumValues, minimum, minLength, pattern } = {}) {
  if (Array.isArray(enumValues) && enumValues.length) return String(enumValues[0]);
  if (format && CONSTANTS[format] !== undefined) return CONSTANTS[format];

  switch (type) {
    case 'integer': {
      const base = Number.isFinite(minimum) ? Math.max(1, minimum) : 1;
      return String(base);
    }
    case 'number': {
      const base = Number.isFinite(minimum) ? Math.max(1, minimum) : 1;
      return String(base % 1 === 0 ? `${base}.0` : base);
    }
    case 'boolean':
      return 'false';
    case 'array':
      return '';
    case 'object':
      return '';
    default: {
      if (pattern) {
        // A pattern we cannot satisfy is better left to the user than faked into something that
        // looks right and is not.
        return 'string';
      }
      const min = Number.isFinite(minLength) ? minLength : 0;
      return min > 6 ? 'string'.padEnd(min, 'x') : 'string';
    }
  }
}

/**
 * Resolve one value against the precedence ladder.
 *
 * @param {object} sources - {config, observed, declared} - any may be undefined
 * @returns {{value: string, source: string, confidence: string}|null} null means unresolved
 */
export function resolveValue({ config, observed, declared, schema = {}, required = false } = {}) {
  if (config !== undefined && isUsable(config)) {
    return { value: String(config), source: 'config', confidence: 'high' };
  }
  if (observed !== undefined && isUsable(observed)) {
    return { value: String(observed), source: 'observed', confidence: 'high' };
  }
  if (declared !== undefined && isUsable(declared)) {
    return { value: String(declared), source: 'declared', confidence: 'medium' };
  }
  if (Array.isArray(schema.enum) && schema.enum.length) {
    return { value: String(schema.enum[0]), source: 'declared', confidence: 'medium' };
  }

  const synthesised = synthesize({
    type: schema.type,
    format: schema.format,
    enumValues: schema.enum,
    minimum: schema.minimum,
    minLength: schema.minLength,
    pattern: schema.pattern,
  });

  if (synthesised === '' && required) return null; // an object/array we cannot usefully invent
  return { value: synthesised, source: 'synthesized', confidence: 'low' };
}

/**
 * Build an example body from a JSON Schema, resolving $ref, allOf, oneOf/anyOf and cycles.
 *
 * The measured gaps in Bruno's own converter are all handled here: a property `default` is
 * honoured (the converter drops it), `format` produces a real value rather than "", and an
 * enum yields its first member.
 */
export function exampleFromSchema(schema, { root, depth = 0, seen = new Set() } = {}) {
  if (!schema || typeof schema !== 'object' || depth > 5) return null;

  // `seen` is the chain of refs on the path from the root down to HERE - not every ref the
  // traversal has ever touched. One shared set conflated "this ref encloses itself" with "a sibling
  // already used this ref", and both halves of that were wrong:
  //
  //   {billing: $ref Address, shipping: $ref Address}  ->  {"billing": {}, "shipping": "string"}
  //
  // `billing` came out empty because the readOnly pre-check below consumed the ref before the
  // recursive call could expand it, and `shipping` came out as the wrong JSON type because by then
  // the ref was permanently marked. A $ref-valued property is the most ordinary shape in OpenAPI,
  // so most generated request bodies were losing their nested content.
  const path = new Set(seen);
  const resolved = deref(schema, root, path);
  if (!resolved) return null;

  if (resolved.example !== undefined) return resolved.example;
  if (resolved.default !== undefined) return resolved.default;
  if (Array.isArray(resolved.enum) && resolved.enum.length) return resolved.enum[0];

  const merged = mergeAllOf(resolved, root, new Set(path));
  const branch = merged.oneOf?.[0] ?? merged.anyOf?.[0];
  if (branch) return exampleFromSchema(branch, { root, depth: depth + 1, seen: path });

  const type = merged.type ?? (merged.properties ? 'object' : undefined);

  if (type === 'object' || merged.properties || merged.additionalProperties) {
    const out = {};
    for (const [name, prop] of Object.entries(merged.properties ?? {})) {
      // A throwaway copy: inspecting the property here must not consume the ref that the recursive
      // call is about to follow.
      const p = deref(prop, root, new Set(path)) ?? {};
      // readOnly properties are server-generated and do not belong in a request body.
      if (p.readOnly) continue;
      const value = exampleFromSchema(prop, { root, depth: depth + 1, seen: path });
      out[name] = value === null ? coerce(p) : value;
    }
    if (merged.additionalProperties && typeof merged.additionalProperties === 'object') {
      out.key = exampleFromSchema(merged.additionalProperties, { root, depth: depth + 1, seen: path }) ?? 'string';
    }
    return out;
  }

  if (type === 'array') {
    const item = exampleFromSchema(merged.items, { root, depth: depth + 1, seen: path });
    return [item === null ? coerce(deref(merged.items, root, new Set(path)) ?? {}) : item];
  }

  return coerce(merged);
}

/** A single typed placeholder for a leaf schema. */
function coerce(schema) {
  const s = synthesize({
    type: schema.type,
    format: schema.format,
    enumValues: schema.enum,
    minimum: schema.minimum,
    minLength: schema.minLength,
    pattern: schema.pattern,
  });
  if (schema.type === 'integer') return Number(s);
  if (schema.type === 'number') return Number(s);
  if (schema.type === 'boolean') return false;
  if (schema.type === 'array') return [];
  if (schema.type === 'object') return {};
  return s;
}

/** Resolve an internal $ref, guarding against cycles. */
function deref(schema, root, seen) {
  let current = schema;
  let hops = 0;
  while (current && typeof current === 'object' && typeof current.$ref === 'string') {
    if (hops++ > 10) return null;
    const ref = current.$ref;
    if (!ref.startsWith('#/')) return null; // external refs are out of scope
    if (seen.has(ref)) return null; // cycle
    seen.add(ref);
    current = ref
      .slice(2)
      .split('/')
      .map((s) => s.replace(/~1/g, '/').replace(/~0/g, '~'))
      .reduce((acc, key) => (acc && typeof acc === 'object' ? acc[key] : undefined), root);
  }
  return current ?? null;
}

/** Merge allOf branches: properties combine, required unions. */
function mergeAllOf(schema, root, seen) {
  if (!Array.isArray(schema.allOf)) return schema;
  const out = { ...schema, properties: { ...(schema.properties ?? {}) }, required: [...(schema.required ?? [])] };
  for (const branch of schema.allOf) {
    const b = mergeAllOf(deref(branch, root, seen) ?? {}, root, seen);
    Object.assign(out.properties, b.properties ?? {});
    out.required.push(...(b.required ?? []));
    if (!out.type && b.type) out.type = b.type;
  }
  delete out.allOf;
  out.required = [...new Set(out.required)];
  return out;
}

/**
 * Collapse an optional enum parameter into ONE disabled entry.
 *
 * Bruno's converter emits one disabled parameter per enum member, so `?mode=fast` and
 * `?mode=slow` both appear and a user who enables both sends a duplicate key. Measured against
 * openApiToBruno on an OpenAPI 3.0.3 spec.
 */
export function collapseDuplicateParams(params) {
  const seen = new Map();
  const out = [];
  for (const p of params) {
    const key = `${p.in}:${p.name}`;
    if (!seen.has(key)) {
      // A shallow copy, so this never writes to the caller's objects. Assigning to `first.enum`
      // in place made the function unsafe to call twice on the same array, and mutating input a
      // caller still holds is the kind of surprise that shows up three modules away.
      const copy = { ...p, ...(p.enum ? { enum: [...p.enum] } : {}) };
      seen.set(key, copy);
      out.push(copy);
      continue;
    }
    const first = seen.get(key);
    // Keep the first, and record the alternatives so the docs block can mention them.
    //
    // `filter(Boolean)` dropped FALSY members: `enum: [false, true]` collapsed to `[true]` and
    // `[0, 1]` to `[1]`, so the docs table advertised half the allowed values. Only absent values
    // are uninteresting, and `false` and `0` are values.
    const merged = [...(first.enum ?? []), ...(p.enum ?? []), p.value].filter(
      (v) => v !== undefined && v !== null && v !== '',
    );
    first.enum = [...new Set(merged)];
  }
  return out;
}
