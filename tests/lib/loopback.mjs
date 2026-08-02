// A recording HTTP server on 127.0.0.1, owned by the test that starts it.
//
// This exists so the execution gate can assert on what *arrived*, not on what we believe we wrote.
// Every other test in this repository checks bytes on disk; only this can catch a collection that is
// perfectly well-formed and still sends the wrong thing — a header that never got attached, a path
// parameter left as `{id}`, a disabled query parameter that went anyway.
//
// Loopback only, on an ephemeral port, with no fixture and no external host. Nothing here reaches the
// network, so it is safe to run on every pull request.

import { createServer } from 'node:http';

/**
 * Start the recorder.
 *
 * Returns `{ baseUrl, requests, close, reset }`. `requests` is the live array of what has arrived, in
 * order: `{ method, path, query, headers, body }`.
 */
export async function startLoopback({ handler = null } = {}) {
  const requests = [];

  const server = createServer((req, res) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      const url = new URL(req.url, 'http://127.0.0.1');

      let body = raw;
      if (raw && /json/i.test(req.headers['content-type'] ?? '')) {
        try {
          body = JSON.parse(raw);
        } catch {
          body = raw; // keep the raw text: "it arrived but was not valid JSON" is a real finding
        }
      }

      requests.push({
        method: req.method,
        path: url.pathname,
        query: Object.fromEntries(url.searchParams.entries()),
        // Node lowercases header names, which is what makes a case-insensitive lookup unnecessary.
        headers: { ...req.headers },
        body: raw === '' ? null : body,
      });

      if (handler) {
        handler(req, res, { url, body });
        return;
      }

      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: true, path: url.pathname }));
    });
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    // Port 0 lets the OS choose, so concurrent test files never collide on a fixed port.
    server.listen(0, '127.0.0.1', resolve);
  });

  const { port } = server.address();

  return {
    port,
    baseUrl: `http://127.0.0.1:${port}`,
    requests,
    reset: () => {
      requests.length = 0;
    },
    close: () =>
      new Promise((resolve) => {
        server.closeAllConnections?.();
        server.close(resolve);
      }),
  };
}

/** The first recorded request whose path ends with `suffix`, or undefined. */
export const requestTo = (requests, suffix) => requests.find((r) => r.path.endsWith(suffix));

/** Every distinct `METHOD /path` that arrived, sorted — handy for one deepEqual on the whole run. */
export const arrived = (requests) => [...new Set(requests.map((r) => `${r.method} ${r.path}`))].sort();
