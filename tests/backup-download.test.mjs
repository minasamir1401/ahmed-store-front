import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';

const compiled = ts.transpileModule(fs.readFileSync(new URL('../src/lib/backup-download.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const context = vm.createContext({ exports: {}, Uint8Array });
vm.runInContext(compiled, context);
const { readBackupFile } = context.exports;

test('accepts a ZIP response and keeps its download bytes', async () => {
  const bytes = new Uint8Array(30);
  bytes.set([0x50, 0x4b, 0x03, 0x04]);
  const blob = await readBackupFile(new Response(bytes, { headers: { 'content-type': 'application/zip' } }));
  assert.deepEqual(new Uint8Array(await blob.arrayBuffer()), bytes);
});

test('reports backup generation errors instead of saving a JSON error as ZIP', async () => {
  const response = new Response(JSON.stringify({ error: 'فشل في إنشاء النسخة الاحتياطية' }), {
    status: 500, headers: { 'content-type': 'application/json' },
  });
  await assert.rejects(readBackupFile(response), /فشل في إنشاء/);
});

test('rejects login HTML and invalid bytes even when the server responds with status 200', async () => {
  await assert.rejects(readBackupFile(new Response('<html>Login</html>', { headers: { 'content-type': 'text/html' } })), /ZIP/);
  await assert.rejects(readBackupFile(new Response('invalid data padded past 22 bytes', { headers: { 'content-type': 'application/zip' } })), /غير صالح/);
  await assert.rejects(readBackupFile(new Response('', { headers: { 'content-type': 'application/zip' } })), /فارغ/);
});
