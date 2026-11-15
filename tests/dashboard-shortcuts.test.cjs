const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  Module = require("node:module"),
  ts = require("typescript"),
  React = require("react"),
  { renderToStaticMarkup } = require("react-dom/server");
async function render(role) {
  const m = new Module("dashboard", module);
  m.paths = module.paths;
  const mocks = {
    "@/components/social-profile-controls": { PublicPhotoEditor: () => null },
    "@/components/question-feed.css": {},
    "@/auth": { auth: async () => ({ user: { id: "u" } }) },
    "@/lib/db": {
      db: {
        user: {
          findUnique: async () => ({
            id: "u",
            role,
            name: "Teacher",
            email: "test@example.com",
          }),
        },
        teacherProfile: { findUnique: async () => null },
      },
    },
    "@/lib/wallet": { formatMoney: () => "৳২০", teacherTid: () => "TID-test" },
    "@/lib/workspace-summary": {
      workspaceSummary: async () => ({
        wallet: { admin: role === "ADMIN", balance: 2000 },
        saved: 0,
        english: 0,
        purchased: 0,
        packagePurchase: null,
      }),
    },
    "@/components/teacher-onboarding": {
      __esModule: true,
      default: () => null,
    },
    "@/components/teacher-workspace": {
      __esModule: true,
      default: ({ children }) => React.createElement("div", null, children),
      WorkspaceCards: () => null,
    },
    "next/link": {
      __esModule: true,
      default: ({ href, children, ...props }) =>
        React.createElement("a", { href, ...props }, children),
    },
    "next/navigation": {
      redirect: () => {
        throw Error("redirect");
      },
    },
  };
  m.require = (n) => (Object.hasOwn(mocks, n) ? mocks[n] : require(n));
  m._compile(
    ts.transpileModule(fs.readFileSync("app/dashboard/page.tsx", "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText,
    "dashboard",
  );
  return renderToStaticMarkup(
    await m.exports.default({ searchParams: Promise.resolve({}) }),
  );
}
test("package button targets ready purchases and withdrawal follows it, without detached ready banner", async () => {
  const html = await render("TEACHER");
  assert.match(
    html,
    /href="\/ready-papers\/saved"[^>]*>[\s\S]*?প্যাকেজ দেখুন<\/a>/,
  );
  assert.equal((html.match(/href="\/ready-papers\/saved"/g) || []).length, 1);
  assert.ok(
    html.indexOf('href="/wallet/withdraw"') >
      html.indexOf('href="/ready-papers/saved"'),
  );
  assert.ok(html.includes("উইথড্র"));
  assert.match(html, /class="tw-creation-options"/);
  assert.ok(html.includes('href="/question-builder"'));
  assert.ok(html.includes('href="/ready-papers"'));
});
test("marketplace shortcuts keep admin-only review and public catalog/library destinations", async () => {
  for (const role of ["ADMIN", "TEACHER", "STUDENT"]) {
    const html = await render(role);
    assert.equal(html.includes('href="/admin/marketplace"'), role === "ADMIN");
    assert.ok(html.includes('href="/marketplace" class="tw-market-button'));
    assert.ok(
      html.includes('href="/dashboard/library" class="tw-market-button'),
    );
    assert.equal(html.includes('href="/wallet/send"'), role !== "ADMIN");
  }
});
