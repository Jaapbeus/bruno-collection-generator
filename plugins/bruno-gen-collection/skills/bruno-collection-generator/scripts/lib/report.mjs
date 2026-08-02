// Human-readable output.
//
// ASCII only. Box-drawing characters and check marks mojibake on a legacy Windows code page,
// which is exactly where this runs most often.

import { redactCredentialShapes } from './secrets.mjs';

const MARK = {
  ok: '  ok ',
  add: '  +  ',
  keep: '  ~  ',
  del: '  -  ',
  warn: '  !  ',
  info: '     ',
};

/** Repository/config text is untrusted; render control characters visibly, never execute them. */
export const terminalText = (value) => redactCredentialShapes(value).replace(
  /[\u0000-\u001f\u007f-\u009f]/g,
  (character) => {
    if (character === '\n') return '\\n';
    if (character === '\r') return '\\r';
    if (character === '\t') return '\\t';
    return `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`;
  },
);

export class Report {
  constructor({ quiet = false } = {}) {
    this.lines = [];
    this.quiet = quiet;
  }

  raw(text = '') {
    this.lines.push(terminalText(text));
    return this;
  }

  heading(text) {
    text = terminalText(text);
    if (this.lines.length) this.lines.push('');
    this.lines.push(text);
    this.lines.push('-'.repeat(Math.min(text.length, 72)));
    return this;
  }

  item(kind, text) {
    this.lines.push(`${MARK[kind] ?? MARK.info}${terminalText(text)}`);
    return this;
  }

  ok(text) { return this.item('ok', text); }
  added(text) { return this.item('add', text); }
  kept(text) { return this.item('keep', text); }
  removed(text) { return this.item('del', text); }
  warn(text) { return this.item('warn', text); }
  info(text) { return this.item('info', text); }

  /** Simple aligned key/value block. */
  facts(pairs) {
    const safe = pairs.map(([k, v]) => [terminalText(k), terminalText(v)]);
    const width = Math.max(0, ...safe.map(([k]) => k.length));
    for (const [k, v] of safe) {
      this.lines.push(`  ${k.padEnd(width)}  ${v}`);
    }
    return this;
  }

  /** Plain aligned table; no borders, so nothing to mojibake. */
  table(headers, rows) {
    if (rows.length === 0) return this;
    const all = [headers, ...rows].map((r) => r.map((c) => terminalText(c)));
    const widths = headers.map((_, i) => Math.max(...all.map((r) => (r[i] ?? '').length)));
    const line = (cells) => `  ${cells.map((c, i) => (c ?? '').padEnd(widths[i])).join('  ')}`.trimEnd();
    this.lines.push(line(all[0]));
    this.lines.push(`  ${widths.map((w) => '-'.repeat(w)).join('  ')}`);
    for (const r of all.slice(1)) this.lines.push(line(r));
    return this;
  }

  toString() {
    return this.lines.join('\n');
  }

  print(stream = process.stdout) {
    if (!this.quiet) stream.write(`${this.toString()}\n`);
  }
}

/** Pluralise without a dependency. */
export const count = (n, singular, plural = `${singular}s`) =>
  `${n} ${n === 1 ? singular : plural}`;
