const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  Module = require("node:module"),
  ts = require("typescript");
const { renderToStaticMarkup } = require("react-dom/server");
async function render(pending) {
  const m = new Module("admin-page", module);
  m.paths = module.paths;
  const mocks = {
    "@/lib/db": { db: { packagePurchase: { count: async () => pending } } },
    "@/components/admin-ai-generator": {
      __esModule: true,
      default: () => null,
    },
    "next/link": {
      __esModule: true,
      default: ({ href, children, ...props }) =>
        require("react").createElement("a", { href, ...props }, children),
    },
  };
  m.require = (n) => (Object.hasOwn(mocks, n) ? mocks[n] : require(n));
  m._compile(
    ts.transpileModule(fs.readFileSync("app/admin/page.tsx", "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText,
    "admin-page",
  );
  return renderToStaticMarkup(await m.exports.default());
}
test("seven tools share one collapsed group while recharge and approval stay separate", async () => {
  const html = await render(0);
  assert.equal((html.match(/<details /g) || []).length, 4);
  assert.equal((html.match(/<summary /g) || []).length, 4);
  assert.ok(!/<details[^>]*\sopen[\s=>]/.test(html));
  for (const route of [
    "wallet",
    "marketplace",
    "withdrawals",
    "marketplace-revenue",
    "marketplace-disputes",
    "wallet-limits",
    "financial-report",
    "support",
    "pdf-storage",
  ])
    assert.ok(html.includes(`href="/admin/${route}"`));
  assert.equal((html.match(/খুলুন ›/g) || []).length, 4);
  assert.equal((html.match(/বন্ধ করুন ˅/g) || []).length, 4);
  assert.ok(html.includes("dark:bg-slate-900"));
  const groups = [...html.matchAll(/<details[^>]*>([\s\S]*?)<\/details>/g)].map(
    (match) => match[1],
  );
  assert.ok(groups[0].includes('href="/admin/wallet"'));
  assert.ok(groups[1].includes('href="/admin/marketplace"'));
  assert.ok(groups[2].includes('href="/admin/catalog"'));
  assert.ok(groups[3].includes("আর্থিক ব্যবস্থাপনা ও সহায়তা"));
  assert.equal((groups[3].match(/<a /g) || []).length, 7);
  assert.ok(!groups[3].includes('href="/admin/wallet"'));
  assert.ok(!groups[3].includes('href="/admin/marketplace"'));
  const routes = [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(routes.slice(0, 4), ["/admin/questions/bank", "/admin/questions/bank/import", "/admin/wallet", "/admin/marketplace"]);
  assert.ok(html.includes("রিচার্জ যাচাই ও অনুমোদন"));
  assert.ok(html.includes("শিক্ষকের প্রশ্নপত্র অনুমোদন"));
});
test("pending payment alert remains visible outside collapsed cards", async () => {
  const html = await render(3);
  assert.ok(
    html.indexOf('href="/admin/package-requests"') >
      html.lastIndexOf("</details>"),
  );
  assert.ok(html.includes("3 টি পেমেন্ট অনুরোধ"));
});
