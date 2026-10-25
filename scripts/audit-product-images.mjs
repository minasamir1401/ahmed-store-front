import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';
import ts from 'typescript';
import vm from 'node:vm';

// Read-only audit: decode every response, flag blank images and browser CORP blocks.
const args = process.argv.slice(2);
const option = (name, fallback) => args.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3) || fallback;
const base = option('base', 'https://the-vitahub.com').replace(/\/$/, '');
const mode = option('mode', 'catalog');
const reportPath = option('report', 'image-audit.json');
const requireSquare = args.includes('--require-square');
const results = [];
const read = async url => {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response;
};
const products = await (await read(`${base}/api/products`)).json();
const jobs = new Map();
const add = (url, kind, productId) => {
  const absolute = new URL(url, base).href;
  if (!jobs.has(absolute)) jobs.set(absolute, { url: absolute, kind, productIds: [] });
  jobs.get(absolute).productIds.push(productId);
};
if (mode === 'catalog') {
  const xml = await (await read(`${base}/facebook-feed.xml`)).text();
  for (const item of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const id = item[1].match(/<g:id>(.*?)<\/g:id>/)?.[1];
    for (const link of item[1].matchAll(/<g:(image_link|additional_image_link)>(.*?)<\/g:\1>/g)) {
      add(link[2].replaceAll('&amp;', '&'), link[1], id);
    }
  }
} else if (mode === 'display') {
  // Execute the actual shared helper used by the product page and editor.
  const source = await fs.readFile(new URL('../src/lib/product-images.ts', import.meta.url), 'utf8');
  const context = vm.createContext({ exports: {}, URL });
  vm.runInContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
  for (const product of products) {
    for (const url of context.exports.productDisplayImages(product)) add(url, 'display', product.id);
  }
} else {
  for (const product of products) {
    let gallery = [];
    try { gallery = JSON.parse(product.images || '[]'); } catch { gallery = (product.images || '').split(',').filter(Boolean); }
    for (const source of [product.image, ...gallery].filter(Boolean)) {
      if (mode === 'admin') {
        add(/^https?:\/\//i.test(source) ? `${base}/_next/image?url=${encodeURIComponent(source)}&w=828&q=75` : source, 'admin', product.id);
      } else {
        const image = source.replace(/^http:\/\//i, 'https://');
        add(image, 'original', product.id);
        const version = Date.parse(product.updatedAt);
        if (Number.isFinite(version)) add(`${image}${image.includes('?') ? '&' : '?'}v=${version}`, 'versioned', product.id);
      }
    }
  }
}
const queue = [...jobs.values()];
console.log(JSON.stringify({ mode, products: products.length, images: queue.length }));
let next = 0;
async function worker() {
  while (next < queue.length) {
    const job = queue[next++];
    let result;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(job.url, {
          headers: { 'User-Agent': mode === 'catalog' ? 'facebookexternalhit/1.1' : 'Mozilla/5.0', 'Referer': `${base}/` },
          signal: AbortSignal.timeout(20000),
        });
        const buffer = Buffer.from(await response.arrayBuffer());
        result = { ...job, status: response.status, type: response.headers.get('content-type'), corp: response.headers.get('cross-origin-resource-policy'), bytes: buffer.length };
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const image = sharp(buffer);
        const metadata = await image.metadata();
        const stats = await image.stats();
        Object.assign(result, { format: metadata.format, width: metadata.width, height: metadata.height, hash: crypto.createHash('sha256').update(buffer).digest('hex') });
        if (stats.channels.every(c => c.stdev < 0.5)) throw new Error('Blank image');
        if (requireSquare && (metadata.format !== 'jpeg' || metadata.width !== 1024 || metadata.height !== 1024 || metadata.space !== 'srgb')) throw new Error('Expected a 1024x1024 sRGB JPEG');
        if (mode === 'sources' && new URL(job.url).origin !== base && ['same-origin', 'same-site'].includes(result.corp)) throw new Error(`Browser blocked by CORP: ${result.corp}`);
        result.ok = true;
        break;
      } catch (error) {
        result = { ...job, ...result, ok: false, error: error.message };
        if (result.status && result.status < 500) break;
      }
    }
    results.push(result);
    if (results.length % 50 === 0) console.log(`Checked ${results.length}/${queue.length}; failed ${results.filter(r => !r.ok).length}`);
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
const summary = { date: new Date().toISOString(), base, mode, products: products.length, checked: results.length, passed: results.filter(r => r.ok).length, failed: results.filter(r => !r.ok).length, uniqueImageHashes: new Set(results.filter(r => r.hash).map(r => r.hash)).size };
await fs.writeFile(reportPath, JSON.stringify({ summary, results }, null, 2));
console.log(JSON.stringify(summary, null, 2));
console.log('Failures:', JSON.stringify(results.filter(r => !r.ok).map(({ url, status, error }) => ({ url, status, error })).slice(0, 15), null, 2));
process.exitCode = summary.failed ? 1 : 0;
