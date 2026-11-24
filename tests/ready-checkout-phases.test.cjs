const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

// Execute the component's actual pay handler with controlled async dependencies.
function harness({ preflight, checkout, onPaid, quoteRefresh, confirmed = null } = {}) {
  const source = fs.readFileSync('components/ready-papers/checkout.tsx', 'utf8');
  const start = source.indexOf('  async function pay() {');
  const end = source.indexOf('\n  return (', start);
  assert.ok(start >= 0 && end > start);
  const handler = ts.transpileModule(source.slice(start, end), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const state = { error: '', busy: false, receipt: confirmed, calls: [] };
  const busyRef = { current: false };
  const make = new Function('beforePurchase', 'checkoutReadyPaper', 'onPaid', 'quoteReadyPaper', 'busyRef', 'setBusy', 'setError', 'setConfirmedReceipt', 'setQuote', 'quote', 'paperId', 'sourceUrl', 'selected', 'snapshot', 'confirmedReceipt', `${handler}\nreturn pay;`);
  const pay = make(
    preflight || (async () => { state.calls.push('preflight'); }),
    checkout || (async () => { state.calls.push('checkout'); return { ok: true, receiptId: 'receipt' }; }),
    onPaid || (async () => { state.calls.push('open'); }),
    quoteRefresh || (async () => ({ ok: false })), busyRef,
    v => { state.busy = v; }, v => { state.error = v; },
    v => { state.receipt = v; }, () => {}, { total: 0, packageUnits: 0 },
    'paper', 'url', [1], {}, confirmed,
  );
  return { pay, state, busyRef };
}

test('preflight failure never starts checkout', async () => {
  const h = harness({ preflight: async () => { throw Error('PDF failed'); } });
  await h.pay();
  assert.match(h.state.error, /checkout শুরু হয়নি/);
  assert.deepEqual(h.state.calls, []);
  assert.equal(h.busyRef.current, false);
});
test('transport failure is reported as uncertain, not a failed preflight', async () => {
  const h = harness({ checkout: async () => { throw Error('network'); } });
  await h.pay();
  assert.match(h.state.error, /নিশ্চিত করা যায়নি/);
  assert.equal(h.state.receipt, null);
});
test('confirmed checkout with open failure stores receipt and tells user how to recover', async () => {
  const h = harness({ onPaid: async () => { throw Error('network'); } });
  await h.pay();
  assert.equal(h.state.receipt, 'receipt');
  assert.match(h.state.error, /Checkout নিশ্চিত হয়েছে/);
});
test('retry of confirmed receipt does not preflight or checkout again', async () => {
  const h = harness({ confirmed: 'receipt' });
  await h.pay();
  assert.deepEqual(h.state.calls, ['open']);
});
test('requote failure does not hide the actual checkout error', async () => {
  const h = harness({ checkout: async () => ({ok: false, error: 'মূল্য বদলেছে'}), quoteRefresh: async () => { throw Error('network'); } });
  await h.pay();
  assert.equal(h.state.error, 'মূল্য বদলেছে');
});
test('simultaneous clicks cannot start duplicate requests', async () => {
  let resolve;
  const pending = new Promise(r => { resolve = r; });
  const h = harness({ preflight: async () => { h.state.calls.push('preflight'); await pending; } });
  const first = h.pay();
  await h.pay();
  resolve();
  await first;
  assert.deepEqual(h.state.calls, ['preflight', 'checkout', 'open']);
});
