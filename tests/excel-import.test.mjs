import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';
import nextConfig from '../next.config.mjs';

const context = vm.createContext({ exports: {}, TextDecoder });
vm.runInContext(ts.transpileModule(fs.readFileSync(new URL('../src/lib/excel-import.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, context);
const { readExcelImportResponse } = context.exports;
const result = { type: 'result', success: true, message: 'تم الاستيراد بنجاح', totalRows: 31, importedCount: 30, updatedCount: 1 };

function stream(events) {
  const bytes = new TextEncoder().encode(events.map(event => JSON.stringify(event)).join('\n') + '\n');
  return new Response(new ReadableStream({
    start(controller) {
      // Split UTF-8 characters and JSON records across arbitrary network chunks.
      for (let i = 0; i < bytes.length; i += 3) controller.enqueue(bytes.slice(i, i + 3));
      controller.close();
    },
  }), { headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8' } });
}

test('streamed import reads fragmented Arabic results, ignores heartbeats and reports batch progress', async () => {
  const progress = [];
  const events = [
    { type: 'started' },
    { type: 'heartbeat' },
    { type: 'progress', totalRows: 31, processedCount: 15, importedCount: 14, updatedCount: 1 },
    { type: 'heartbeat' },
    { type: 'progress', totalRows: 31, processedCount: 31, importedCount: 30, updatedCount: 1 },
    result,
  ];
  const actual = await readExcelImportResponse(stream(events), event => progress.push(event.processedCount));
  assert.equal(actual.message, result.message);
  assert.equal(actual.importedCount, 30);
  assert.deepEqual(progress, [15, 31]);
});

test('JSON imports remain supported during staggered frontend and backend deployments', async () => {
  const response = new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
  assert.equal((await readExcelImportResponse(response, () => {})).updatedCount, 1);
});

test('HTML and empty 499/504 responses explain uncertain partial writes instead of an unknown error', async () => {
  for (const status of [499, 502, 504, 524]) {
    await assert.rejects(readExcelImportResponse(new Response('<html>Proxy error</html>', { status }), () => {}), error => {
      assert.match(error.message, new RegExp(`HTTP ${status}`));
      assert.match(error.message, /راجع القائمة/);
      assert.doesNotMatch(error.message, /Unexpected|<html>/);
      return true;
    });
  }
});

test('server validation and file size errors retain actionable messages', async () => {
  await assert.rejects(readExcelImportResponse(new Response(JSON.stringify({ error: 'ملف Excel فارغ.' }), { status: 400 }), () => {}), /ملف Excel فارغ/);
  await assert.rejects(readExcelImportResponse(new Response('', { status: 413 }), () => {}), /50/);
  await assert.rejects(readExcelImportResponse(new Response('Internal Server Error', { status: 500 }), () => {}), /HTTP 500/);
});

test('stream errors, malformed progress and missing final results never produce a false success', async () => {
  await assert.rejects(readExcelImportResponse(stream([{ type: 'error', error: 'فشل حفظ المنتج؛ راجع القائمة.' }]), () => {}), /فشل حفظ المنتج/);
  for (const events of [[{ type: 'heartbeat' }], [null], [{ type: 'progress', totalRows: 30, processedCount: '15' }]]) {
    await assert.rejects(readExcelImportResponse(stream(events), () => {}), /قبل وصول النتيجة النهائية/);
  }
  await assert.rejects(readExcelImportResponse(new Response('<html>Login</html>'), () => {}), /نتيجة استيراد صالحة/);
});

test('a read failure after the HTTP response starts still warns about uncertain import results', async () => {
  const body = new ReadableStream({ start(controller) { controller.error(new TypeError('terminated')); } });
  await assert.rejects(readExcelImportResponse(new Response(body, { headers: { 'Content-Type': 'application/x-ndjson' } }), () => {}), /راجع القائمة/);
});

test('Next proxy can forward the entire allowed Excel file including multipart overhead', () => {
  assert.equal(nextConfig.experimental.proxyClientMaxBodySize, '52mb');
  assert.equal(nextConfig.experimental.proxyTimeout, 120000);
});
