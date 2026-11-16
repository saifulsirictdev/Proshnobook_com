const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
test('action links have scoped touch-friendly and keyboard-visible styling', () => {
  const css = fs.readFileSync('app/globals.css', 'utf8');
  assert.match(css, /a\.qm-action-link\s*\{[^}]*min-height: 44px/s);
  assert.match(css, /a\.qm-action-link:focus-visible/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  for (const file of ['app/page.tsx','app/support/page.tsx','components/wallet-checkout.tsx','app/dashboard/page.tsx']) {
    assert.ok(fs.readFileSync(file, 'utf8').includes('qm-action-link'), file);
  }
  assert.match(css, /\.post-html a\s*\{[^}]*text-decoration: underline/s);
});
