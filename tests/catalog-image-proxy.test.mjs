import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';

const compiled = ts.transpileModule(fs.readFileSync(new URL('../src/app/api/catalog/image/[...path]/route.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

function proxy(fetch) {
  const context = vm.createContext({
    exports: {}, process: { env: { BACKEND_URL: 'https://backend.example' } },
    fetch, AbortSignal, console,
    require: () => ({ NextResponse: Response }),
  });
  vm.runInContext(compiled, context);
  return context.exports.GET;
}

test('image proxy preserves image revisions and upstream cache lifetime on gallery responses', async () => {
  const calls = [];
  const GET = proxy(async (url, options) => {
    calls.push({ url, options });
    return new Response(new Uint8Array([255, 216, 255, 217]), { headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=60' } });
  });
  const response = await GET({ nextUrl: { search: '?v=123' } }, { params: Promise.resolve({ path: ['product-a', 'gallery', '0.jpg'] }) });
  assert.equal(calls[0].url, 'https://backend.example/api/catalog/image/product-a/gallery/0.jpg?v=123');
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'image/jpeg');
  assert.equal(response.headers.get('cache-control'), 'public, max-age=60');
  assert.equal(response.headers.get('cross-origin-resource-policy'), 'cross-origin');
  assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], [255, 216, 255, 217]);
});

test('an upstream HTML error is never returned or cached as a successful product image', async () => {
  const GET = proxy(async () => new Response('<html>Error</html>', { headers: { 'Content-Type': 'text/html' } }));
  const response = await GET({ nextUrl: { search: '' } }, { params: Promise.resolve({ path: ['product-a.jpg'] }) });
  assert.equal(response.status, 404);
  assert.equal(response.headers.has('cache-control'), false);
});
