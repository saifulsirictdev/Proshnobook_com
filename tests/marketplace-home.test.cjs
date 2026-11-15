const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  ts = require("typescript"),
  Module = require("node:module");
function load(path, mocks = {}) {
  const m = new Module(path, module);
  m.paths = module.paths;
  m.require = (n) => mocks[n] || require(n);
  m._compile(
    ts.transpileModule(fs.readFileSync(path, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText,
    path,
  );
  return m.exports;
}
const curriculum = load("lib/nctb-data.ts");
const school = load("lib/marketplace-school-catalog.ts", {
  "@/lib/nctb-data": curriculum,
});
test("school catalog covers 6–12, reuses shared books and resolves subject chapters", () => {
  assert.equal(school.MARKET_GRADES.length, 7);
  assert.equal(school.marketGrade("12"), "12");
  assert.equal(school.marketGrade("bad"), "6");
  for (const g of school.MARKET_GRADES)
    assert.ok(school.marketSubjects(g).length > 0);
  assert.deepEqual(school.marketSubjects("10"), school.marketSubjects("9"));
  assert.deepEqual(school.marketSubjects("12"), school.marketSubjects("11"));
  const subject = school.marketSubjects("6")[0].name;
  assert.ok(school.marketChapters("6", subject).length > 0);
  assert.deepEqual(school.marketChapters("6", "unknown"), []);
});
test("new home renders all books, six-paper bounded queries, preserved subject links and honest empty states", async () => {
  const React = require("react"),
    { renderToStaticMarkup } = require("react-dom/server");
  let calls = [];
  const Home = load("app/page.tsx", {
    "@/lib/brand": require("./helpers/brand.cjs"),
    "@/lib/seo": load("lib/seo.ts", {
      "@/lib/brand": require("./helpers/brand.cjs"),
    }),
    "@/auth": { auth: async () => null },
    "@/lib/question-feed": {
      questionFeed: async () => ({ posts: [], next: null }),
    },
    "@/components/question-feed": { default: () => null },
    "@/components/question-feed.css": {},
    "next/link": { default: (p) => React.createElement("a", p, p.children) },
    "@/lib/marketplace-school-catalog": school,
    "@/lib/marketplace-catalog-data": {
      marketCatalogPage: async (filters, after, limit) => {
        calls.push({ filters, limit });
        return { papers: [] };
      },
    },
    "@/components/marketplace-paper-cards": { default: () => null },
    "@/components/marketplace-home.css": {},
  }).default;
  const html = renderToStaticMarkup(
    await Home({ searchParams: Promise.resolve({ grade: "12" }) }),
  );
  assert.equal(calls.length, school.marketSubjects("12").length);
  assert.ok(calls.every((c) => c.limit === 6 && c.filters.grade === "HSC"));
  assert.equal((html.match(/class="pb-subject"/g) || []).length, calls.length);
  assert.match(html, /HSC প্রশ্নপত্র/);
  assert.match(html, /আরও প্রশ্ন দেখুন/);
  const nav = html.slice(html.indexOf("<nav"), html.indexOf("</nav>"));
  assert.deepEqual(
    [...nav.matchAll(/href="\/\?grade=([^"]+)"/g)].map((m) => m[1]),
    ["HSC", "SSC", "8", "7", "6"],
  );
  for (const label of [
    "HSC / College",
    "Class 9–10 (SSC)",
    "Class 8",
    "Class 7",
    "Class 6",
  ])
    assert.ok(nav.includes(label));
  assert.equal((nav.match(/<svg/g) || []).length, 5);
  assert.ok(html.includes('href="/?grade=SSC"'));
  assert.ok(html.includes('href="/?grade=HSC"'));
  assert.ok(!html.includes('href="/?grade=9"'));
  assert.ok(!html.includes('href="/?grade=12"'));
  assert.match(html, /এখনও অনুমোদিত প্রশ্নপত্র প্রকাশিত হয়নি/);
  assert.ok(html.includes("grade=HSC&amp;subject="));
  assert.doesNotMatch(html, /PaperAnimation|HomeStarter|HomeStats/);
});
test("A4 ratio, mobile two-column cards and safe metadata-only display are explicit", () => {
  const css = fs.readFileSync("components/marketplace-home.css", "utf8");
  assert.match(css, /aspect-ratio:\s*210\s*\/\s*297/);
  assert.match(css, /repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  const card = fs.readFileSync(
    "components/marketplace-paper-cards.tsx",
    "utf8",
  );
  assert.doesNotMatch(card, /snapshot|dangerouslySetInnerHTML/);
  assert.match(card, /জলছাপসহ সম্পূর্ণ প্রশ্নপত্র দেখুন/);
  const filters = fs.readFileSync("components/marketplace-filters.tsx", "utf8");
  assert.match(filters, /setChapter\(""\)/);
  assert.match(filters, /marketChapters/);
});

test("homepage groups preserve legacy links and shared subjects", () => {
  assert.deepEqual(school.HOME_GRADES, ["HSC", "SSC", "8", "7", "6"]);
  for (const grade of ["9", "10", "SSC"])
    assert.equal(school.homeGrade(grade), "SSC");
  for (const grade of ["11", "12", "HSC"])
    assert.equal(school.homeGrade(grade), "HSC");
  assert.equal(school.homeGrade("bad"), "6");
  assert.deepEqual(school.marketSubjects("SSC"), school.marketSubjects("9"));
  assert.deepEqual(school.marketSubjects("HSC"), school.marketSubjects("11"));
});
