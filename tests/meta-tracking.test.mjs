import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { test } from 'node:test';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const trackingSource = fs.readFileSync(path.join(root, 'src/lib/tracking.ts'), 'utf8');
const compiled = ts.transpileModule(trackingSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
}).outputText;

function createBrowser() {
  const calls = [];
  const requests = [];
  const timeouts = [];
  const intervals = new Map();
  const storage = { getItem: () => null };
  const context = vm.createContext({
    exports: {},
    process: { env: {} },
    console,
    URLSearchParams,
    window: { location: { href: 'https://example.com/product/a', search: '' } },
    document: { cookie: '' },
    localStorage: storage,
    sessionStorage: storage,
    fetch: async (url, options) => { requests.push(JSON.parse(options.body)); },
    setInterval: (fn) => { const id = Symbol(); intervals.set(id, fn); return id; },
    clearInterval: (id) => intervals.delete(id),
    setTimeout: (fn) => { timeouts.push(fn); },
  });
  vm.runInContext(compiled, context);
  return {
    context, calls, requests, timeouts, intervals,
    tracking: context.exports,
    ready() { context.window.fbq = (...args) => calls.push(args); },
  };
}

const products = [
  { id: 'catalog-product-A', title: 'Product A', price: 125, quantity: 2 },
  { id: 'catalog-product-B', title: 'Product B', price: 75, quantity: 3 },
];

test('each product uses its own catalog ID for viewing, cart and wishlist', () => {
  const browser = createBrowser();
  browser.ready();
  for (const product of products) {
    for (const method of ['trackViewContent', 'trackAddToCart', 'trackAddToWishlist']) {
      browser.tracking[method](product);
      const [, name, payload, options] = browser.calls.at(-1);
      assert.deepEqual(Array.from(payload.content_ids), [product.id]);
      assert.equal(payload.contents[0].id, product.id);
      assert.equal(payload.content_type, 'product');
      assert.equal(payload.currency, 'EGP');
      assert.equal(payload.contents[0].item_price, product.price);
      const quantity = name === 'AddToCart' ? product.quantity : 1;
      assert.equal(payload.contents[0].quantity, quantity);
      assert.equal(payload.value, product.price * quantity);
      assert.equal(browser.requests.at(-1).eventId, options.eventID);
    }
  }
});

test('checkout and purchase include all product IDs and saved order values', () => {
  const browser = createBrowser();
  browser.ready();
  browser.tracking.trackInitiateCheckout(products, 475);
  assert.deepEqual(Array.from(browser.calls.at(-1)[2].content_ids), products.map(p => p.id));

  // Prices/quantities differ from the cart, as after server validation.
  const savedOrder = {
    id: 'order-db-id', orderNumber: 'ORD-SAVED', total: 415, shippingFee: 15,
    items: products.map(p => ({ productId: p.id, title: p.title, price: 100, quantity: 2 })),
  };
  browser.tracking.trackPurchase(savedOrder);
  const [, name, payload, options] = browser.calls.at(-1);
  assert.equal(name, 'Purchase');
  assert.deepEqual(Array.from(payload.content_ids), products.map(p => p.id));
  assert.equal(payload.value, 415);
  assert.equal(payload.num_items, 4);
  for (const item of payload.contents) {
    assert.equal(item.item_price, 100);
    assert.equal(item.quantity, 2);
  }
  assert.equal(options.eventID, 'ORD-SAVED');
  assert.equal(browser.requests.at(-1).eventId, 'ORD-SAVED');
});

test('pending events recover in order after polling expired', () => {
  const browser = createBrowser();
  browser.tracking.safeFbq('track', 'ViewContent', { content_ids: [products[0].id] }, { eventID: 'view-1' });
  browser.timeouts.forEach(fn => fn());
  assert.equal(browser.intervals.size, 0);
  browser.ready();
  browser.tracking.safeFbq('track', 'AddToCart', { content_ids: [products[0].id] }, { eventID: 'cart-1' });
  assert.deepEqual(browser.calls.map(c => c[1]), ['ViewContent', 'AddToCart']);
  assert.equal(browser.calls[0][3].eventID, 'view-1');
  assert.equal(browser.context.window._fbqQueue.length, 0);
});

test('base script recovers pending events even without another user action', () => {
  const browser = createBrowser();
  browser.tracking.safeFbq('track', 'ViewContent', { content_ids: [products[1].id] }, { eventID: 'late-view' });
  browser.timeouts.forEach(fn => fn());
  const layout = fs.readFileSync(path.join(root, 'src/app/layout.tsx'), 'utf8');
  const script = layout.match(/__html: `(!function\(f,b,e,v,n,t,s\)[\s\S]*?)`,/)[1];
  const firstScript = { parentNode: { insertBefore() {} } };
  browser.context.document.createElement = () => ({});
  browser.context.document.getElementsByTagName = () => [firstScript];
  // The test sandbox has separate globals; mirror the browser's window.fbq binding.
  vm.runInContext(script.replace("fbq('init'", "var fbq = window.fbq; fbq('init'"), browser.context);
  const queue = browser.context.window.fbq.queue;
  assert.deepEqual(Array.from(queue, args => args[1]), ['${fbPixelId}', 'ViewContent', 'PageView']);
  assert.equal(queue[1][3].eventID, 'late-view');
  assert.equal(browser.context.window._fbqQueue.length, 0);
});

test('CSP permits Meta event transport with the existing restricted allowlist', async () => {
  const { default: config } = await import(pathToFileURL(path.join(root, 'next.config.mjs')).href);
  const headers = await config.headers();
  const csp = headers.find(h => h.source === '/(.*)').headers.find(h => h.key === 'Content-Security-Policy').value;
  const connect = csp.split('; ').find(s => s.startsWith('connect-src ')).split(' ');
  assert.ok(connect.includes('https://www.facebook.com'));
  assert.ok(connect.includes('https://connect.facebook.net'));
  assert.ok(!connect.includes('*'));
});
