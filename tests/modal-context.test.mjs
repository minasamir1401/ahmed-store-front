import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

function modal() {
  let state = null;
  const react = { ...React, useState: () => [state, value => { state = value; }] };
  const context = vm.createContext({
    exports: {},
    require(name) {
      if (name === 'react') return react;
      if (name === 'lucide-react') return { AlertCircle: () => null, HelpCircle: () => null, Check: () => null, X: () => null };
      if (name === 'framer-motion') return { motion: { div: ({ children }) => React.createElement('div', null, children) }, AnimatePresence: React.Fragment };
      throw new Error(`Unexpected module: ${name}`);
    },
  });
  vm.runInContext(ts.transpileModule(fs.readFileSync(new URL('../src/context/ModalContext.tsx', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React, esModuleInterop: true },
  }).outputText, context);
  const tree = () => context.exports.ModalProvider({ children: null });
  function buttons(node) {
    if (!node || typeof node !== 'object') return [];
    const children = Array.isArray(node.props?.children) ? node.props.children : [node.props?.children];
    return [...(node.type === 'button' ? [node] : []), ...children.flatMap(buttons)];
  }
  return {
    get api() { return tree().props.value; },
    html: () => renderToStaticMarkup(tree()),
    close(value) {
      const choices = buttons(tree());
      const button = choices.length === 1 ? choices[0] : choices[value ? 1 : 0];
      button.props.onClick();
    },
  };
}

test('path-shaped alert values are converted to text instead of crashing React', async () => {
  const app = modal();
  const pending = app.api.showAlert({ path: 'products.xlsx' }, { path: 'Upload error' });
  assert.doesNotThrow(() => app.html());
  assert.match(app.html(), /products\.xlsx/);
  assert.match(app.html(), /Upload error/);
  assert.doesNotMatch(app.html(), /\[object Object\]/);
  app.close(true);
  assert.equal(await pending, true);
});

test('API and Error messages render readable text with normal HTML escaping', async () => {
  for (const message of [new Error('Database error'), { error: 'Upload failed' }, { message: '<script>unsafe</script>' }]) {
    const app = modal();
    const pending = app.api.showAlert(message);
    assert.doesNotThrow(() => app.html());
    assert.doesNotMatch(app.html(), /<script>/);
    app.close(true);
    await pending;
  }
});

test('unknown alert objects use a safe fallback and malformed confirmations cannot authorize actions', async () => {
  const app = modal();
  const alert = app.api.showAlert({ unexpected: true });
  assert.doesNotThrow(() => app.html());
  app.close(true);
  await alert;
  const confirmation = app.api.showConfirm({ path: 'invalid confirmation' });
  assert.doesNotThrow(() => app.html());
  assert.doesNotMatch(app.html(), />\s*تأكيد\s*</);
  app.close(true);
  assert.equal(await confirmation, false);
});

test('normal string alerts and confirmations preserve text and promise results', async () => {
  const app = modal();
  const pending = app.api.showConfirm('Confirm the operation', 'Confirmation');
  assert.match(app.html(), /Confirm the operation/);
  app.close(true);
  assert.equal(await pending, true);
  const cancelled = app.api.showConfirm('Cancel the operation');
  app.close(false);
  assert.equal(await cancelled, false);
});
