import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';

function compile(relativePath) {
  return ts.transpileModule(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
}

// Execute the real hook with a deterministic React/Next hook scheduler and public API fixtures.
function dashboard(initialSearch = '?tab=products', responses = {}, respond) {
  const slots = [];
  let cursor = 0;
  let effects = [];
  let dirty = true;
  let current;
  const location = { pathname: '/admin', search: initialSearch, href: `https://example.com/admin${initialSearch}` };
  const setUrl = url => {
    location.search = new URL(url, location.href).search;
    location.href = `https://example.com/admin${location.search}`;
    dirty = true;
  };
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], value => {
        const next = typeof value === 'function' ? value(slots[index]) : value;
        if (!Object.is(next, slots[index])) { slots[index] = next; dirty = true; }
      }];
    },
    useRef(initial) {
      const index = cursor++;
      return slots[index] ??= { current: initial };
    },
    useEffect(fn, deps) {
      const index = cursor++;
      const previous = slots[index];
      if (!previous || deps.some((value, i) => !Object.is(value, previous.deps[i]))) {
        slots[index] = { deps, cleanup: previous?.cleanup };
        effects.push(() => { slots[index].cleanup?.(); slots[index].cleanup = fn(); });
      }
    },
  };
  const modules = {};
  const requests = [];
  const alerts = [];
  const stored = new Map([['mithaly_admin_auth', 'true'], ['mithaly_admin_token', 'fixture-token']]);
  const storage = { getItem: key => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, value), removeItem: key => stored.delete(key) };
  const context = vm.createContext({
    exports: {}, URLSearchParams, Headers, FormData, TextDecoder, console, queueMicrotask, crypto,
    process: { env: {} }, sessionStorage: storage, localStorage: storage,
    window: { location, history: { pushState: (_, __, url) => setUrl(url), replaceState: (_, __, url) => setUrl(url), back() {} }, addEventListener() {}, removeEventListener() {} },
    setInterval: () => 1, clearInterval() {},
    setTimeout: fn => { queueMicrotask(fn); return 1; }, clearTimeout() {},
    fetch: async (url, init) => {
      requests.push({ url: String(url), init });
      const response = respond?.(String(url), init);
      if (response !== undefined) return await response;
      const match = String(url).match(/\/api\/products\/([^?]+)/);
      if (match) return { ok: true, json: async () => await (responses[match[1]] ?? { id: match[1], title: `Product ${match[1]}` }) };
      return { ok: true, status: 200, json: async () => [] };
    },
    require: name => {
      if (name === 'react') return react;
      if (name === 'next/navigation') return { useSearchParams: () => new URLSearchParams(location.search) };
      if (name === '@/context/ModalContext') return { useModal: () => ({ showAlert: async message => { alerts.push(message); }, showConfirm: async () => true }) };
      return modules[name];
    },
  });
  for (const [name, file] of [
    ['../admin-dashboard-utils', '../src/app/admin/admin-dashboard-utils.ts'],
    ['@/lib/product-images', '../src/lib/product-images.ts'],
    ['@/lib/backup-download', '../src/lib/backup-download.ts'],
    ['@/lib/excel-import', '../src/lib/excel-import.ts'],
  ]) {
    context.exports = {};
    vm.runInContext(compile(file), context);
    modules[name] = context.exports;
  }
  context.exports = {};
  vm.runInContext(compile('../src/app/admin/hooks/useAdminDashboard.ts'), context);
  const hook = context.exports.useAdminDashboard;
  return {
    requests, alerts, storage,
    get state() { return current; },
    navigate: setUrl,
    async settle() {
      for (let i = 0; i < 25; i++) {
        if (dirty) {
          dirty = false;
          cursor = 0;
          current = hook();
          const pending = effects;
          effects = [];
          pending.forEach(fn => fn());
        }
        await Promise.resolve();
      }
    },
  };
}

test('opens a product after client navigation without refreshing the dashboard', async () => {
  const app = dashboard();
  await app.settle();
  assert.equal(app.state.isModalOpen, false);
  app.navigate('?tab=products&edit=product-a');
  await app.settle();
  assert.equal(app.state.isModalOpen, true);
  assert.equal(app.state.editingItem.id, 'product-a');
  app.navigate('?tab=products&edit=product-b');
  await app.settle();
  assert.equal(app.state.editingItem.id, 'product-b');
  app.navigate('?tab=products');
  await app.settle();
  assert.equal(app.state.isModalOpen, false);
});

test('direct links and returning to edit links populate the form', async () => {
  const app = dashboard('?tab=products&edit=product-a');
  await app.settle();
  assert.equal(app.state.formData.title, 'Product product-a');
  app.navigate('?tab=admin-settings');
  await app.settle();
  assert.equal(app.state.activeTab, 'admin-settings');
  assert.equal(app.state.isModalOpen, false);
  app.navigate('?tab=products&edit=product-a');
  await app.settle();
  assert.equal(app.state.editingItem.id, 'product-a');
});

test('local URL updates preserve unsaved edits and new forms use the destination tab', async () => {
  const app = dashboard();
  await app.settle();
  app.state.handleOpenModal({ id: 'product-a', title: 'Original' });
  app.state.setFormData({ id: 'product-a', title: 'Unsaved change' });
  await app.settle();
  assert.equal(app.state.formData.title, 'Unsaved change');
  app.navigate('?tab=offers&new=1');
  await app.settle();
  assert.equal(app.state.activeTab, 'offers');
  assert.equal(app.state.isModalOpen, true);
  assert.equal(app.state.formData.productId, '');
  assert.equal(app.state.formData.discount, '');
});

test('a delayed product request cannot reopen or replace the form after navigation', async () => {
  let resolveProduct;
  const pending = new Promise(resolve => { resolveProduct = resolve; });
  const app = dashboard('?tab=products&edit=slow-product', { 'slow-product': pending });
  await app.settle();
  app.navigate('?tab=products&edit=fast-product');
  await app.settle();
  assert.equal(app.state.editingItem.id, 'fast-product');
  resolveProduct({ id: 'slow-product', title: 'Stale product' });
  await app.settle();
  assert.equal(app.state.editingItem.id, 'fast-product');
  app.navigate('?tab=products');
  await app.settle();
  assert.equal(app.state.isModalOpen, false);
});

test('leaving a pending edit request clears loading and ignores its eventual response', async () => {
  let resolveProduct;
  const pending = new Promise(resolve => { resolveProduct = resolve; });
  const waiting = dashboard('?tab=products&edit=slow-product', { 'slow-product': pending });
  await waiting.settle();
  waiting.navigate('?tab=products');
  await waiting.settle();
  assert.equal(waiting.state.loading, false);
  assert.equal(waiting.state.isModalOpen, false);
  resolveProduct({ id: 'slow-product', title: 'Stale product' });
  await waiting.settle();
  assert.equal(waiting.state.isModalOpen, false);
});

test('email test sends current unsaved fields, trims the recipient and never sends masked credentials', async () => {
  const app = dashboard('?tab=whatsapp', {}, url => url.endsWith('/test-email') ? new Response('{}') : undefined);
  await app.settle();
  app.state.setResendApiKey('***1234');
  app.state.setSmtpPass('***5678');
  app.state.setSmtpHost(' smtp.example.com ');
  app.state.setSmtpPort('587');
  app.state.setSmtpUser(' sender@example.com ');
  app.state.setFromEmail('new-sender@example.com');
  app.state.setTestRecipient(' recipient@example.com ');
  await app.settle();
  await app.state.handleSendTestEmail({ preventDefault() {} });
  const payload = JSON.parse(app.requests.find(request => request.url.endsWith('/test-email')).init.body);
  assert.equal(payload.to, 'recipient@example.com');
  assert.equal(payload.settings.from_email, 'new-sender@example.com');
  assert.equal(payload.settings.smtp_host, 'smtp.example.com');
  assert.equal(payload.settings.smtp_secure, 'false');
  assert.equal('resend_api_key' in payload.settings, false);
  assert.equal('smtp_pass' in payload.settings, false);
  assert.equal(app.requests.filter(request => request.url.endsWith('/api/admin/settings') && request.init?.method === 'POST').length, 0);
});

test('repeated test-email submissions share the active request and HTML errors expose the HTTP status', async () => {
  let finish;
  const pending = new Promise(resolve => { finish = resolve; });
  const app = dashboard('?tab=whatsapp', {}, url => url.endsWith('/test-email') ? pending : undefined);
  await app.settle();
  app.state.setTestRecipient('recipient@example.com');
  await app.settle();
  const first = app.state.handleSendTestEmail({ preventDefault() {} });
  await app.state.handleSendTestEmail({ preventDefault() {} });
  finish(new Response('<html>Proxy error</html>', { status: 502 }));
  await first;
  await app.settle();
  assert.equal(app.requests.filter(request => request.url.endsWith('/test-email')).length, 1);
  assert.ok(app.alerts.some(message => message.includes('HTTP 502')));
  assert.equal(app.state.testEmailLoading, false);
});

test('Excel handler requests background updates, prevents overlapping uploads and recovers a 499 response', async () => {
  let finish;
  const pending = new Promise(resolve => { finish = resolve; });
  const result = { success: true, totalRows: 50, importedCount: 0, updatedCount: 50, message: 'تم تحديث 50 منتج.' };
  const app = dashboard('?tab=products', {}, url => {
    if (url.includes('/import-excel?')) return pending;
    if (url.includes('/import-excel/status?')) return new Response(JSON.stringify({ jobId: new URL(url, 'https://example.test').searchParams.get('jobId'), status: 'completed', result }));
  });
  await app.settle();
  const event = { target: { files: [new File(['fixture'], 'products.xlsx')], value: 'products.xlsx' } };
  const first = app.state.handleExcelImport(event);
  await app.state.handleExcelImport(event);
  finish(new Response('', { status: 499 }));
  await first;
  await app.settle();
  const requests = app.requests.filter(request => request.url.includes('/import-excel?'));
  assert.equal(requests.length, 1);
  assert.equal(requests[0].init.headers.get('Accept'), 'application/x-ndjson');
  assert.equal(requests[0].init.headers.has('Content-Type'), false);
  assert.match(requests[0].url, /async=1&jobId=/);
  assert.ok(app.alerts.some(message => message.includes('50')));
  assert.equal(app.storage.getItem('mithaly_excel_import_job'), null);
  assert.equal(app.state.excelImporting, false);
});

test('invalid Excel names and sizes are rejected before sending any import request', async () => {
  const app = dashboard();
  await app.settle();
  for (const file of [{ name: 'products.xl', size: 10 }, { name: 'products.xlsx', size: 200 * 1024 * 1024 + 1 }]) {
    await app.state.handleExcelImport({ target: { files: [file], value: file.name } });
  }
  assert.equal(app.requests.some(request => request.url.includes('/import-excel?')), false);
  assert.equal(app.alerts.filter(message => message.includes('صيغة الملف')).length, 1);
  assert.equal(app.alerts.filter(message => message.includes('200')).length, 1);
});

test('Excel handler uploads legacy Excel and CSV files rather than rejecting them as oversized XLSX', async () => {
  const result = { success: true, totalRows: 50, importedCount: 0, updatedCount: 50 };
  const app = dashboard('?tab=products', {}, url => url.includes('/import-excel?') ? new Response(JSON.stringify(result)) : undefined);
  await app.settle();
  for (const name of ['products.xls', 'products.xlsm', 'products.csv']) {
    await app.state.handleExcelImport({ target: { files: [new File(['fixture'], name)], value: name } });
  }
  assert.equal(app.requests.filter(request => request.url.includes('/import-excel?')).length, 3);
  assert.equal(app.alerts.some(message => message.includes('صيغة الملف')), false);
});

test('a pending Excel job survives page reload and resumes with status requests only', async () => {
  const result = { success: true, totalRows: 50, importedCount: 0, updatedCount: 50 };
  const app = dashboard('?tab=products', {}, url => url.includes('/import-excel/status?') ? new Response(JSON.stringify({ jobId: 'pending-job', status: 'completed', result })) : undefined);
  app.storage.setItem('mithaly_excel_import_job', 'pending-job');
  await app.settle();
  assert.equal(app.state.excelImportJobId, 'pending-job');
  await app.state.handleExcelImport();
  await app.settle();
  assert.equal(app.requests.some(request => request.url.includes('/import-excel?')), false);
  assert.equal(app.storage.getItem('mithaly_excel_import_job'), null);
  assert.equal(app.state.excelImportJobId, null);
});

test('unconfirmed import IDs remain resumable until the admin explicitly dismisses tracking', async () => {
  const app = dashboard('?tab=products', {}, url => {
    if (url.includes('/import-excel?')) return new Response('', { status: 499 });
    if (url.includes('/import-excel/status?')) return new Response('{}', { status: 404 });
  });
  await app.settle();
  await app.state.handleExcelImport({ target: { files: [new File(['fixture'], 'products.xlsx')], value: 'products.xlsx' } });
  await app.settle();
  assert.ok(app.storage.getItem('mithaly_excel_import_job'));
  assert.ok(app.state.excelImportJobId);
  await app.state.handleClearExcelImport();
  await app.settle();
  assert.equal(app.storage.getItem('mithaly_excel_import_job'), null);
  assert.equal(app.state.excelImportJobId, null);
  assert.equal(app.requests.filter(request => request.url.includes('/import-excel?')).length, 1);
});
