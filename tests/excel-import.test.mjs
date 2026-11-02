import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';
import nextConfig from '../next.config.mjs';

const context = vm.createContext({ exports: {}, TextDecoder, FormData, setTimeout: fn => { queueMicrotask(fn); return 1; } });
vm.runInContext(ts.transpileModule(fs.readFileSync(new URL('../src/lib/excel-import.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, context);
const { getExcelImportFileError, readExcelImportResponse, importExcelFile, waitForExcelImportJob } = context.exports;
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

test('Excel validation accepts supported spreadsheets independently of browser MIME type', () => {
  for (const name of ['products.xlsx', 'products.xls', 'products.xlsm', 'products.csv', 'PRODUCTS.XLSX', 'products.xlsx ']) {
    assert.equal(getExcelImportFileError({ name, size: 1024 }), null);
  }
  assert.equal(getExcelImportFileError({ name: 'products.xlsx', size: 50 * 1024 * 1024 }), null);
});

test('format, empty file and size validation explain the actual rejection separately', () => {
  const formatError = getExcelImportFileError({ name: 'products.pdf', size: 1024 });
  assert.match(formatError, /صيغة الملف/);
  assert.doesNotMatch(formatError, /50/);
  assert.match(getExcelImportFileError({ name: 'products.xls', size: 0 }), /فارغ/);
  assert.match(getExcelImportFileError({ name: 'products.xlsx', size: 60 * 1024 * 1024 }), /60\.0.*50/);
});

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

test('accepted imports poll for progress and final results without re-uploading', async () => {
  const requests = [];
  const ids = [];
  const progress = [];
  const jobs = [
    { jobId: 'job-50', status: 'running', totalRows: 50, processedCount: 15, importedCount: 0, updatedCount: 15 },
    { jobId: 'job-50', status: 'running', totalRows: 50, processedCount: 15, importedCount: 0, updatedCount: 15 },
    { jobId: 'job-50', status: 'completed', result: { success: true, totalRows: 50, importedCount: 0, updatedCount: 50 } },
  ];
  const actual = await importExcelFile(new File(['fixture'], 'products.xls'), 'job-50', async (path, init) => {
    requests.push({ path, init });
    return new Response(JSON.stringify(init?.method === 'POST' ? { jobId: 'job-50' } : jobs.shift()), { status: init?.method === 'POST' ? 202 : 200 });
  }, event => progress.push(event.processedCount), id => ids.push(id));
  assert.equal(actual.updatedCount, 50);
  assert.equal(requests.filter(request => request.init?.method === 'POST').length, 1);
  assert.match(requests[0].path, /async=1&jobId=job-50/);
  assert.deepEqual(progress, [15]);
  assert.deepEqual(ids, ['job-50', 'job-50']);
});

test('a lost or 499 upload response recovers the accepted job instead of duplicating updates', async () => {
  for (const failure of [new TypeError('Failed to fetch'), new Response('', { status: 499 }), new Response('', { status: 202 })]) {
    let posts = 0;
    const actual = await importExcelFile(new File(['fixture'], 'products.xlsx'), 'recover', async (path, init) => {
      if (init?.method === 'POST') {
        posts++;
        if (failure instanceof Error) throw failure;
        return failure;
      }
      assert.match(path, /status\?jobId=recover/);
      return new Response(JSON.stringify({ jobId: 'recover', status: 'completed', result }));
    }, () => {}, () => {});
    assert.equal(actual.updatedCount, 1);
    assert.equal(posts, 1);
  }
});

test('status connection failures retry only GET and can resume the original job later', async () => {
  const calls = [];
  let count = 0;
  const actual = await waitForExcelImportJob('resume', async (path, init) => {
    calls.push({ path, init });
    if (++count <= 2) return new Response('', { status: 502 });
    return new Response(JSON.stringify({ jobId: 'resume', status: 'completed', result }));
  }, () => {});
  assert.equal(actual.success, true);
  assert.equal(calls.length, 3);
  assert.ok(calls.every(call => call.init.method === undefined && call.init.cache === 'no-store'));
  let failures = 0;
  await assert.rejects(waitForExcelImportJob('resume', async () => { failures++; throw new TypeError('offline'); }, () => {}), /متابعة الاستيراد/);
  assert.equal(failures, 5);
});

test('failed, missing and malformed jobs never report successful updates', async () => {
  await assert.rejects(waitForExcelImportJob('failed', async () => new Response(JSON.stringify({ jobId: 'failed', status: 'failed', error: 'فشل الحفظ؛ راجع القائمة.' })), () => {}), error => {
    assert.equal(error.isExcelImportFinished, true);
    assert.match(error.message, /فشل الحفظ/);
    return true;
  });
  await assert.rejects(waitForExcelImportJob('missing', async () => new Response('{}', { status: 404 }), () => {}), error => error.isExcelImportFinished === true);
  await assert.rejects(waitForExcelImportJob('malformed', async () => new Response(JSON.stringify({ jobId: 'malformed', status: 'completed', result: { success: true } })), () => {}), /قبل وصول النتيجة النهائية/);
});

test('a delayed durable claim retries missing status responses without losing the original job ID', async () => {
  let gets = 0;
  let posts = 0;
  const ids = [];
  const actual = await importExcelFile(new File(['fixture'], 'products.xlsx'), 'delayed', async (path, init) => {
    if (init?.method === 'POST') { posts++; return new Response('', { status: 499 }); }
    if (++gets < 3) return new Response('{}', { status: 404 });
    return new Response(JSON.stringify({ jobId: 'delayed', status: 'completed', result }));
  }, () => {}, id => ids.push(id));
  assert.equal(actual.success, true);
  assert.equal(posts, 1);
  assert.equal(gets, 3);
  assert.deepEqual(ids, ['delayed']);
  await assert.rejects(waitForExcelImportJob('unconfirmed', async () => new Response('{}', { status: 404 }), () => {}, true), error => {
    assert.notEqual(error.isExcelImportFinished, true);
    assert.match(error.message, /متابعة الاستيراد/);
    return true;
  });
});

test('a different active file produces an explicit conflict, not a false success', async () => {
  const ids = [];
  await assert.rejects(importExcelFile(new File(['fixture'], 'second.xlsx'), 'second', async (path, init) => {
    assert.equal(init.method, 'POST');
    return new Response(JSON.stringify({ error: 'لم يتم استيراد الملف الجديد.', jobId: 'first' }), { status: 409 });
  }, () => {}, id => ids.push(id)), /لم يتم استيراد الملف الجديد/);
  assert.deepEqual(ids, ['second', 'first']);
});
