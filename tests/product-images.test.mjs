import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';

const context = vm.createContext({ exports: {}, URL });
vm.runInContext(ts.transpileModule(fs.readFileSync(new URL('../src/lib/product-images.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, context);
const { productDisplayImages, savedProductImagePreview, absoluteProductImageUrl } = context.exports;
const product = { id: 'product-a', image: 'http://remote.example/front.png', images: '["https://remote.example/back.avif","/uploads/جانب.jpg"]', updatedAt: '2026-10-24T00:00:00Z' };

test('saved product main and gallery images use first-party JPEG URLs, including legacy galleries', () => {
  for (const images of [product.images, JSON.parse(product.images), 'https://remote.example/back.avif,/uploads/جانب.jpg']) {
    const urls = Array.from(productDisplayImages({ ...product, images }));
    assert.deepEqual(urls.map(url => url.split('?')[0]), [
      '/api/catalog/image/product-a.jpg',
      '/api/catalog/image/product-a/gallery/0.jpg',
      '/api/catalog/image/product-a/gallery/1.jpg',
    ]);
    assert.ok(urls.every(url => new URL(url, 'https://store.example').searchParams.get('v') === String(Date.parse(product.updatedAt))));
    assert.ok(urls.every(url => new URL(url, 'https://store.example').searchParams.get('format') === 'square-v1'));
  }
});

test('editor previews saved images but preserves unsaved replacements and gallery reordering', () => {
  assert.equal(savedProductImagePreview(product, product.image), productDisplayImages(product)[0]);
  assert.equal(savedProductImagePreview(product, '/uploads/جانب.jpg'), productDisplayImages(product)[2]);
  for (const source of ['/uploads/new.jpg', 'https://other.example/replacement.png', '']) {
    assert.equal(savedProductImagePreview(product, source), source);
  }
  assert.equal(savedProductImagePreview(null, '/uploads/new.jpg'), '/uploads/new.jpg');
});

test('products without a main image retain the first gallery image and distinct product identities', () => {
  const urls = Array.from(productDisplayImages({ ...product, image: '' }));
  assert.match(urls[0], /product-a\/gallery\/0\.jpg/);
  assert.equal(savedProductImagePreview({ ...product, image: '' }, '/uploads/جانب.jpg'), urls[1]);
  assert.ok(productDisplayImages({ ...product, id: 'product-b' }).every(url => url.includes('/product-b')));
  assert.deepEqual(Array.from(productDisplayImages({ image: '/uploads/new.jpg' })), ['/uploads/new.jpg']);
});

test('SEO image URLs preserve revision queries and encoded filenames without double encoding', () => {
  const source = productDisplayImages(product)[0];
  assert.equal(absoluteProductImageUrl(source, 'https://store.example'), `https://store.example${source}`);
  assert.equal(absoluteProductImageUrl('/uploads/front%20image.jpg?v=123', 'https://store.example'), 'https://store.example/uploads/front%20image.jpg?v=123');
  assert.equal(absoluteProductImageUrl('/uploads/front image.jpg', 'https://store.example'), 'https://store.example/uploads/front%20image.jpg');
  assert.equal(absoluteProductImageUrl('javascript:alert(1)', 'https://store.example'), '');
});
