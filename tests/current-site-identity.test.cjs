const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const Module = require("node:module");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const brand = require("./helpers/brand.cjs");
function load(file) {
  const m = new Module(file, module);
  m.paths = module.paths;
  m.require = (id) =>
    id === "@/lib/brand"
      ? brand
      : id === "next/link"
        ? { default: (p) => React.createElement("a", p, p.children) }
        : id.startsWith("@/")
          ? load(
              id.replace("@/", "") +
                (id.startsWith("@/components") ? ".tsx" : ".ts"),
            )
          : require(id);
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
test("current identity describes exam-paper service with stable IDs, not an inherited Q&A organization", () => {
  const { websiteIdentity, aboutIdentity } = load("lib/site-identity.ts");
  const website = websiteIdentity(),
    about = aboutIdentity();
  assert.equal(website.url, "https://proshnobook.com");
  assert.equal(website.name, brand.BRAND.nameBn);
  assert.equal(website.description, brand.BRAND.description);
  assert.equal(website.publisher["@id"], about.mainEntity["@id"]);
  assert.equal(website["@id"], about.isPartOf["@id"]);
  assert.match(website.publisher.disambiguatingDescription, /ফোরাম নয়/);
  assert.match(website.description, /ফ্রি বা পেইড/);
  for (const key of [
    "foundingDate",
    "founder",
    "sameAs",
    "aggregateRating",
    "review",
  ])
    assert.equal(website.publisher[key], undefined);
});
test("About page visibly matches identity schema and current supported publication flows", () => {
  const page = load("app/about-us/page.tsx");
  const html = renderToStaticMarkup(React.createElement(page.default));
  assert.match(html, /সাধারণ প্রশ্ন জিজ্ঞাসা ও উত্তর দেওয়ার/);
  assert.match(html, /ফোরাম নয়/);
  assert.match(html, /ফ্রি বা পেইড/);
  assert.doesNotMatch(html, /পূর্ণ সুবিধা এখনও বাকি|নমুনা সীমিত/);
  for (const path of [
    "/question-builder",
    "/ready-papers",
    "/marketplace",
    "/contact-us",
  ])
    assert.ok(html.includes(`href="${path}"`));
  const schema = JSON.parse(
    html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1],
  );
  assert.equal(schema["@type"], "AboutPage");
  assert.equal(schema.url, page.metadata.alternates.canonical);
  assert.equal(schema.description, brand.BRAND.description);
  assert.equal(page.metadata.openGraph.url, schema.url);
});
