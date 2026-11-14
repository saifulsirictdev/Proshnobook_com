const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
test("wallet balance sources use separate responsive cards with exact source amounts", () => {
  const source = fs.readFileSync("app/wallet/page.tsx", "utf8");
  for (const name of ["bonus", "recharge", "earnings", "received"])
    assert.ok(source.includes(`amount: w.funds.${name}`));
  assert.match(source, /grid-cols-2 gap-3 sm:grid-cols-4/);
  assert.match(source, /formatMoney\(amount\)/);
});
test("inline Send Money starts collapsed and reuses recipient verification and confirmation flow", () => {
  const source = fs.readFileSync("app/wallet/page.tsx", "utf8");
  const start = source.indexOf('<summary className="flex min-h-12');
  assert.ok(start > 0);
  const open = source.lastIndexOf("<details", start);
  const tag = source.slice(open, source.indexOf(">", open) + 1);
  assert.doesNotMatch(tag, /\sopen(?:[\s=>])/);
  assert.match(source, /<WalletTransfer maximum=\{limits!\.transferDaily\}/);
  assert.match(source, /readWalletLimits\(db\)/);
  const transfer = fs.readFileSync("components/wallet-transfer.tsx", "utf8");
  assert.match(transfer, /name="tid"/);
  assert.match(transfer, /name="amount"/);
  assert.match(transfer, /prepareWalletTransfer/);
  assert.match(transfer, /confirmWalletTransfer/);
});
