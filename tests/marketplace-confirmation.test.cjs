const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  Module = require("node:module"),
  ts = require("typescript"),
  React = require("react"),
  { renderToStaticMarkup } = require("react-dom/server");
function render(chargedNow) {
  const m = new Module("success", module);
  m.paths = module.paths;
  m.require = (n) =>
    n === "next/link"
      ? {
          __esModule: true,
          default: ({ href, children, ...props }) =>
            React.createElement("a", { href, ...props }, children),
        }
      : require(n);
  m._compile(
    ts.transpileModule(
      fs.readFileSync("components/marketplace-purchase-success.tsx", "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          jsx: ts.JsxEmit.ReactJSX,
          esModuleInterop: true,
        },
      },
    ).outputText,
    "success",
  );
  return renderToStaticMarkup(
    React.createElement(m.exports.default, {
      id: "a".repeat(64),
      amount: 1001,
      chargedNow,
      balanceBefore: 2000,
      balanceAfter: 999,
    }),
  );
}
test("purchase confirmation shows exact debit and direct Setup link", () => {
  const html = render(true);
  assert.match(html, /ওয়ালেট থেকে কাটা হয়েছে/);
  assert.match(html, /৳10.01/);
  assert.match(html, /কেনার আগে মূল ব্যালেন্স/);
  assert.match(html, /৳20.00/);
  assert.match(html, /কেনার পর অবশিষ্ট ব্যালেন্স/);
  assert.match(html, /৳9.99/);
  assert.match(html, /প্রশ্ন সেটআপ করুন/);
  assert.ok(html.includes(`/dashboard/library/${"a".repeat(64)}/setup`));
});
test("already-owned confirmation never claims a new debit", () => {
  const html = render(false);
  assert.match(html, /এইবার নতুন চার্জ/);
  assert.match(html, /৳0.00/);
  assert.match(html, /মূল ক্রয়মূল্য ৳10.01/);
  assert.doesNotMatch(html, /ওয়ালেট থেকে কাটা হয়েছে/);
});
test("native success dialog opens only on server-confirmed successful receipt, once for a new debit, never for already-owned reopening", () => {
  const file = fs.readFileSync("components/marketplace-purchase.tsx", "utf8");
  assert.match(file, /state.chargedNow === true/);
  assert.match(file, /!shown.current/);
  assert.match(file, /state.ok && state.chargedNow !== true/);
  assert.match(file, /typeof ownedAmount === "number" && !state.ok/);
  assert.match(file, /<dialog/);
  assert.match(file, /showModal\(\)/);
  assert.match(file, /method="dialog"/);
  assert.match(file, /পরে সেটআপ করব/);
});
