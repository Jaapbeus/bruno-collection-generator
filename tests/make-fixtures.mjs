#!/usr/bin/env node
// Generates the input fixture collections under tests/fixtures/.
//
// They are produced with filestore rather than hand-written, so they are guaranteed to be files
// Bruno itself would accept - a hand-written .bru risks testing against something invalid.
// Run once, review the diff, commit the result:
//   node tests/make-fixtures.mjs
//
// EVERY value here is synthetic: example.com hosts, all-zero GUIDs, and credential-shaped
// literals that are obviously fake. Nothing is copied from a real repository.

import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { filestore, ITEM_TYPE_HTTP } from '../plugins/bruno-gen-collection/skills/bruno-collection-generator/scripts/lib/deps.mjs';

const store = filestore();
const fixtures = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');

const write = (path, content) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
};

const req = ({ name, seq, method, url, params = [], headers = [], auth = 'inherit', body = null, docs, tags }) => ({
  name,
  type: ITEM_TYPE_HTTP,
  seq,
  ...(tags ? { tags } : {}),
  request: {
    method,
    url,
    params,
    headers,
    auth: { mode: auth },
    body: body ?? { mode: 'none' },
    ...(docs ? { docs } : {}),
  },
});

const q = (name, value, enabled = true, description = '') => ({
  name, value, type: 'query', enabled, description,
});

// ---------------------------------------------------------------------------------------
// 1. A healthy .bru collection: nothing wrong with it.
// ---------------------------------------------------------------------------------------
function healthyBru() {
  const root = join(fixtures, 'collection-bru');
  rmSync(root, { recursive: true, force: true });

  write(
    join(root, 'bruno.json'),
    `${JSON.stringify(
      { version: '1', name: 'Widget API', type: 'collection', ignore: ['node_modules', '.git', '.bruno-gen'] },
      null,
      2,
    )}\n`,
  );

  write(
    join(root, 'collection.bru'),
    store.stringifyCollection(
      {
        meta: { name: 'Widget API' },
        request: {
          headers: [{ name: 'Accept', value: 'application/json', enabled: true }],
          auth: { mode: 'bearer', bearer: { token: '{{accessToken}}' } },
        },
        docs: 'Synthetic fixture collection. Every value is fake.',
      },
      { version: '1', name: 'Widget API', type: 'collection', ignore: ['node_modules', '.git', '.bruno-gen'] },
      { format: 'bru' },
    ),
  );

  write(
    join(root, 'widgets', 'folder.bru'),
    store.stringifyFolder({ meta: { name: 'widgets', seq: 1 }, request: { auth: { mode: 'inherit' } } }, { format: 'bru' }),
  );

  write(
    join(root, 'widgets', 'list-widgets.bru'),
    store.stringifyRequest(
      req({
        name: 'List widgets',
        seq: 1,
        method: 'GET',
        url: '{{baseUrl}}/v1/widgets?country=NL',
        params: [q('country', 'NL', true, 'ISO 3166-1 alpha-2'), q('limit', '50', false, 'max 500')],
        docs: 'Lists widgets for one country.',
        tags: ['read'],
      }),
      { format: 'bru' },
    ),
  );

  write(
    join(root, 'widgets', 'get-widget.bru'),
    store.stringifyRequest(
      req({
        name: 'Get widget by id',
        seq: 2,
        method: 'GET',
        url: '{{baseUrl}}/v1/widgets/:widgetId',
        params: [{ name: 'widgetId', value: '00000000-0000-0000-0000-000000000000', type: 'path', enabled: true, description: 'widget id' }],
      }),
      { format: 'bru' },
    ),
  );

  write(
    join(root, 'widgets', 'create-widget.bru'),
    store.stringifyRequest(
      req({
        name: 'Create widget',
        seq: 3,
        method: 'POST',
        url: '{{baseUrl}}/v1/widgets',
        headers: [{ name: 'Content-Type', value: 'application/json', enabled: true }],
        body: { mode: 'json', json: JSON.stringify({ name: 'bolt', size: 42, tags: [] }, null, 2) },
      }),
      { format: 'bru' },
    ),
  );

  write(
    join(root, 'environments', 'local.bru'),
    store.stringifyEnvironment(
      {
        name: 'local',
        variables: [
          { name: 'baseUrl', value: 'http://127.0.0.1:8080', type: 'text', enabled: true, secret: false },
          { name: 'accessToken', value: '', type: 'text', enabled: true, secret: true },
        ],
      },
      { format: 'bru' },
    ),
  );

  return root;
}

// ---------------------------------------------------------------------------------------
// 2. The same collection in OpenCollection YAML.
// ---------------------------------------------------------------------------------------
function healthyYml() {
  const root = join(fixtures, 'collection-yml');
  rmSync(root, { recursive: true, force: true });

  write(
    join(root, 'opencollection.yml'),
    store.stringifyCollection(
      {
        meta: { name: 'Widget API' },
        request: {
          headers: [{ name: 'Accept', value: 'application/json', enabled: true }],
          auth: { mode: 'bearer', bearer: { token: '{{accessToken}}' } },
        },
        docs: 'Synthetic fixture collection in YAML. Every value is fake.',
      },
      { version: '1', name: 'Widget API', type: 'collection', ignore: ['node_modules', '.git', '.bruno-gen'] },
      { format: 'yml' },
    ),
  );

  write(
    join(root, 'widgets', 'folder.yml'),
    store.stringifyFolder({ meta: { name: 'widgets', seq: 1 }, request: { auth: { mode: 'inherit' } } }, { format: 'yml' }),
  );

  write(
    join(root, 'widgets', 'list-widgets.yml'),
    store.stringifyRequest(
      req({
        name: 'List widgets',
        seq: 1,
        method: 'GET',
        url: '{{baseUrl}}/v1/widgets?country=NL',
        params: [q('country', 'NL', true, 'ISO 3166-1 alpha-2'), q('limit', '50', false, 'max 500')],
        docs: 'Lists widgets for one country.',
      }),
      { format: 'yml' },
    ),
  );

  write(
    join(root, 'environments', 'local.yml'),
    store.stringifyEnvironment(
      {
        name: 'local',
        variables: [
          { name: 'baseUrl', value: 'http://127.0.0.1:8080', type: 'text', enabled: true, secret: false },
          { name: 'accessToken', value: '', type: 'text', enabled: true, secret: true },
        ],
      },
      { format: 'yml' },
    ),
  );

  return root;
}

// ---------------------------------------------------------------------------------------
// 3. A collection with everything wrong that doctor must catch.
//    Credential-shaped values here are PLANTED and synthetic. This directory is exempt from
//    the fixture-hygiene check for that reason - see scripts/check-fixture-hygiene.mjs.
// ---------------------------------------------------------------------------------------
function plantedSecrets() {
  const root = join(fixtures, 'planted-secrets');
  rmSync(root, { recursive: true, force: true });

  write(
    join(root, 'bruno.json'),
    `${JSON.stringify({ version: '1', name: 'Planted', type: 'collection' }, null, 2)}\n`,
  );

  write(
    join(root, 'collection.bru'),
    store.stringifyCollection(
      {
        meta: { name: 'Planted' },
        request: {
          headers: [{
            name: 'Authorization',
            value: 'Bearer eyJhbGciOiJub25lIn0.eyJzdWIiOiJyb290LWZpeHR1cmUifQ.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            enabled: true,
          }],
          auth: { mode: 'bearer', bearer: { token: '{{rootToken}}' } },
        },
      },
      { version: '1', name: 'Planted', type: 'collection' },
      { format: 'bru' },
    ),
  );

  // A base64-shaped key pasted straight into a header value.
  write(
    join(root, 'admin-restart.bru'),
    store.stringifyRequest(
      req({
        name: 'Admin restart',
        seq: 1,
        method: 'POST',
        url: '{{baseUrl}}/admin/host/restart',
        headers: [
          { name: 'x-functions-key', value: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=', enabled: true },
        ],
        auth: 'none',
      }),
      { format: 'bru' },
    ),
  );

  // A JWT-shaped literal in a pre-request variable, plus a marker that must NOT be flagged.
  write(
    join(root, 'token-and-marker.bru'),
    `${store.stringifyRequest(
      req({
        name: 'Token and marker',
        seq: 2,
        method: 'POST',
        url: '{{baseUrl}}/v1/things',
        headers: [
          // __APIKEY__ is a documented substitution marker: a value, not a credential.
          { name: 'api-Key', value: '__APIKEY__', enabled: true },
        ],
        auth: 'none',
      }),
      { format: 'bru' },
    )}
vars:pre-request {
  refreshToken: eyJhbGciOiJub25lIn0.eyJzdWIiOiJmaXh0dXJlIn0.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
  exampleBsn: 123456782
  exampleIban: NL91ABNA0417164300
}
`,
  );

  // Two files, same METHOD + path -> duplicate endpointKey. Same seq -> duplicate seq.
  // Uses {{apiToken}}, which no environment declares -> undeclared variable.
  write(
    join(root, 'things-a.bru'),
    store.stringifyRequest(
      req({
        name: 'Things A',
        seq: 3,
        method: 'GET',
        url: '{{baseUrl}}/v1/things',
        headers: [{ name: 'Authorization', value: 'Bearer {{apiToken}}', enabled: true }],
        auth: 'none',
      }),
      { format: 'bru' },
    ),
  );
  write(
    join(root, 'things-b.bru'),
    store.stringifyRequest(
      req({ name: 'Things B', seq: 3, method: 'GET', url: '{{baseUrl}}/v1/things', auth: 'none' }),
      { format: 'bru' },
    ),
  );

  write(
    join(root, 'environments', 'local.bru'),
    store.stringifyEnvironment(
      {
        name: 'local',
        variables: [{ name: 'baseUrl', value: 'http://127.0.0.1:8080', type: 'text', enabled: true, secret: false }],
      },
      { format: 'bru' },
    ),
  );

  return root;
}

// ---------------------------------------------------------------------------------------
// 4. A repository with no collection at all.
// ---------------------------------------------------------------------------------------
function noCollection() {
  const root = join(fixtures, 'no-collection');
  rmSync(root, { recursive: true, force: true });
  write(join(root, 'README.md'), '# Not an API\n\nNothing here exposes HTTP endpoints.\n');
  write(join(root, 'src', 'math.js'), 'export const add = (a, b) => a + b;\n');
  return root;
}

const made = [healthyBru(), healthyYml(), plantedSecrets(), noCollection()];
for (const m of made) console.log(`wrote ${m.replace(process.cwd(), '.')}`);
