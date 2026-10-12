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
function dashboard(initialSearch = '?tab=products', responses = {}) {
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
  const storage = { getItem: key => ({ mithaly_admin_auth: 'true', mithaly_admin_token: 'fixture-token' })[key] ?? null, setItem() {}, removeItem() {} };
  const context = vm.createContext({
    exports: {}, URLSearchParams, Headers, console, queueMicrotask,
    process: { env: {} }, sessionStorage: storage, localStorage: storage,
    window: { location, history: { pushState: (_, __, url) => setUrl(url), replaceState: (_, __, url) => setUrl(url), back() {} }, addEventListener() {}, removeEventListener() {} },
    setInterval: () => 1, clearInterval() {},
    fetch: async url => {
      const match = String(url).match(/\/api\/products\/([^?]+)/);
      if (match) return { ok: true, json: async () => await (responses[match[1]] ?? { id: match[1], title: `Product ${match[1]}` }) };
      return { ok: true, status: 200, json: async () => [] };
    },
    require: name => {
      if (name === 'react') return react;
      if (name === 'next/navigation') return { useSearchParams: () => new URLSearchParams(location.search) };
      if (name === '@/context/ModalContext') return { useModal: () => ({ showAlert: async () => {}, showConfirm: async () => true }) };
      return modules[name];
    },
  });
  for (const [name, file] of [
    ['../admin-dashboard-utils', '../src/app/admin/admin-dashboard-utils.ts'],
    ['@/lib/product-images', '../src/lib/product-images.ts'],
    ['@/lib/backup-download', '../src/lib/backup-download.ts'],
  ]) {
    context.exports = {};
    vm.runInContext(compile(file), context);
    modules[name] = context.exports;
  }
  context.exports = {};
  vm.runInContext(compile('../src/app/admin/hooks/useAdminDashboard.ts'), context);
  const hook = context.exports.useAdminDashboard;
  return {
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
