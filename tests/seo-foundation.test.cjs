const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const Module = require("node:module");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const brand = require("./helpers/brand.cjs");
function load(file, mocks = {}) {
  const m = new Module(file, module);
  m.paths = module.paths;
  m.require = (id) => mocks[id] || require(id);
  m._compile(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText,
    file,
  );
  return m.exports;
}
const seo = load("lib/seo.ts", { "@/lib/brand": brand });
test("public landing metadata uses matching canonical/share URLs and no ranking promises", () => {
  const metadata = seo.landingMetadata("প্রশ্নপত্র", "বিবরণ", "/marketplace");
  assert.equal(
    metadata.alternates.canonical,
    "https://proshnobook.com/marketplace",
  );
  assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
  assert.equal(metadata.openGraph.locale, "bn_BD");
  assert.equal(metadata.twitter.card, "summary");
  assert.equal(
    metadata.openGraph.images[0].url,
    "https://proshnobook.com/questionmaker-icon-192.png",
  );
});
test("JSON-LD serialization cannot close its script or inject HTML", () => {
  const input = { name: '</script><script>alert("x")</script>\u2028\u2029' };
  const encoded = seo.jsonLd(input);
  assert.ok(!encoded.includes("<"));
  assert.deepEqual(JSON.parse(encoded), input);
  assert.ok(!encoded.includes("\u2028"));
});
test("guide exposes readable answers, tool links and matching safe breadcrumb schema", () => {
  const guide = load("app/question-paper-guide/page.tsx", {
    "@/lib/seo": seo,
    "@/lib/brand": brand,
    "next/link": { default: (p) => React.createElement("a", p, p.children) },
  });
  const html = renderToStaticMarkup(React.createElement(guide.default));
  for (const path of [
    "/question-builder",
    "/ready-papers",
    "/marketplace",
    "/contact-us",
    "/terms",
  ])
    assert.ok(html.includes(`href="${path}"`));
  assert.match(html, /সব পেপার বা প্রশ্ন তৈরির সব সুবিধা বিনামূল্যে নয়/);
  const schema = JSON.parse(
    html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1],
  );
  assert.equal(schema["@type"], "BreadcrumbList");
  assert.equal(
    schema.itemListElement[1].item,
    guide.metadata.alternates.canonical,
  );
});
test("private account areas explicitly opt out of search indexing without changing access control", () => {
  for (const path of [
    "dashboard",
    "wallet",
    "profile",
    "my-profile",
    "login",
    "register",
  ]) {
    const layout = load(`app/${path}/layout.tsx`);
    assert.equal(layout.metadata.robots.index, false);
    assert.equal(layout.metadata.robots.follow, false);
  }
  const root = fs.readFileSync("app/layout.tsx", "utf8");
  assert.match(root, /__html: jsonLd\(/);
  assert.match(root, /jsonLd\(websiteIdentity\(\)\)/);
  const identity = load("lib/site-identity.ts", {
    "@/lib/brand": brand,
  }).websiteIdentity();
  assert.equal(identity.publisher["@type"], "Organization");
});
