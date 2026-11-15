const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const Module = require("node:module");
const brand = require("./helpers/brand.cjs");
function load(file, db) {
  const m = new Module(file, module);
  m.require = (id) => id === "@/lib/brand" ? brand : id === "@/lib/db" ? { db } : require(id);
  m._compile(ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, file);
  return m.exports;
}
test("sitemap and robots consistently use verified public domain even with stale deployment settings", async () => {
  const saved = process.env.SITE_URL;
  const db = {
    post: { findMany: async ({ where }) => { assert.deepEqual(where, { published: true }); return [{ id: "post-id", slug: "sample", createdAt: new Date("2026-01-01"), tags: ["বাংলা"] }]; } },
    category: { findMany: async () => [{ slug: "news" }] },
    page: { findMany: async () => [{ slug: "about", updatedAt: new Date("2026-01-01") }] },
  };
  try {
    for (const configured of [undefined, "https://question-maker-com-g6ec.vercel.app", "https://preview.example/path", "http://proshnobook.com"]) {
      if (configured === undefined) delete process.env.SITE_URL; else process.env.SITE_URL = configured;
      const urls = await load("app/sitemap.ts", db).default();
      assert.ok(urls.length > 18);
      for (const { url } of urls) assert.equal(new URL(url).origin, "https://proshnobook.com");
      for (const path of ["/blog/sample", "/category/news", "/p/about", "/tag/" + encodeURIComponent("বাংলা")]) assert.ok(urls.some((u) => u.url === "https://proshnobook.com" + path));
      assert.equal(load("app/robots.ts", db).default().sitemap, "https://proshnobook.com/sitemap.xml");
      assert.ok(!urls.some(({url}) => /\/(admin|api|dashboard|wallet)(\/|$)/.test(new URL(url).pathname)));
    }
  } finally { if (saved === undefined) delete process.env.SITE_URL; else process.env.SITE_URL = saved; }
});
test("database outages retain canonical static sitemap, and RSS/metadata share the indexing origin", async () => {
  const unavailable = { findMany: async () => { throw Error("offline"); } };
  const urls = await load("app/sitemap.ts", { post: unavailable, category: unavailable, page: unavailable }).default();
  assert.equal(urls[0].url, "https://proshnobook.com");
  const feed = await load("app/feed.xml/route.ts", { post: { findMany: async () => [] } }).GET();
  assert.match(await feed.text(), /<link>https:\/\/proshnobook.com<\/link>/);
  const layout = fs.readFileSync("app/layout.tsx", "utf8");
  assert.match(layout, /const SITE_URL = PUBLIC_SITE_ORIGIN/);
  assert.doesNotMatch(layout, /process.env.SITE_URL/);
});
