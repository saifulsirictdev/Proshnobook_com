const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
function load(file, mocks = {}) {
  const m = new Module(file, module);
  m.paths = module.paths;
  m.require = (id) => (Object.hasOwn(mocks, id) ? mocks[id] : require(id));
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
const brand = require("./helpers/brand.cjs");
const seo = load("lib/seo.ts", { "@/lib/brand": brand });
async function renderLanding(id) {
  let calls = 0;
  const page = load("app/question-builder/page.tsx", {
    "@/lib/seo": seo,
    "@/auth": { auth: async () => (id ? { user: { id } } : null) },
    "@/lib/db": {
      db: {
        question: {
          groupBy: async (q) => {
            calls++;
            assert.equal(q.where.approved, true);
            return [{ category: "6", subject: "বাংলা" }];
          },
        },
      },
    },
    "@/components/qb-start": {
      default: ({ pairs }) =>
        React.createElement(
          "div",
          { "data-builder": pairs.length },
          "private-selector",
        ),
    },
    "next/link": { default: (p) => React.createElement("a", p, p.children) },
  });
  return {
    html: renderToStaticMarkup(await page.default()),
    calls,
    metadata: page.metadata,
  };
}
test("anonymous builder landing is indexable with visible content and login CTA, without querying questions", async () => {
  const { html, calls, metadata } = await renderLanding(null);
  assert.equal(calls, 0);
  assert.match(html, /অনলাইনে প্রশ্নপত্র তৈরি করুন/);
  assert.match(html, /লগইন করে প্রশ্ন তৈরি শুরু করুন/);
  assert.ok(html.includes('href="/login?next=%2Fquestion-builder"'));
  assert.doesNotMatch(html, /private-selector/);
  assert.ok(html.indexOf("লগইন করে প্রশ্ন তৈরি শুরু করুন") < html.indexOf('id="builder-steps"'));
  assert.equal(
    metadata.alternates.canonical,
    "https://proshnobook.com/question-builder",
  );
  assert.notEqual(metadata.robots?.index, false);
  const layout = fs.readFileSync("app/question-builder/layout.tsx", "utf8");
  assert.doesNotMatch(layout, /redirect\(|noindex|index: false/);
});
test("authenticated users retain the existing question selector and approved-only counts", async () => {
  const { html, calls } = await renderLanding("teacher");
  assert.equal(calls, 1);
  assert.match(html, /private-selector/);
  assert.ok(html.indexOf("private-selector") < html.indexOf('id="builder-steps"'));
  assert.doesNotMatch(html, /লগইন করে প্রশ্ন তৈরি শুরু করুন/);
});
test("all private builder subtrees retain server authentication and noindex, including nested English pages", async () => {
  const guardPath = "components/protected-question-builder.tsx";
  for (const session of [null, { user: {} }, { user: { id: "" } }]) {
    const guard = load(guardPath, {
      "@/auth": { auth: async () => session },
      "next/navigation": {
        redirect: (url) => {
          throw Error("redirect:" + url);
        },
      },
    }).default;
    await assert.rejects(
      guard({ children: "SECRET" }),
      /redirect:\/login\?next=%2Fquestion-builder/,
    );
  }
  const guard = load(guardPath, {
    "@/auth": { auth: async () => ({ user: { id: "teacher" } }) },
    "next/navigation": {
      redirect: () => {
        throw Error("unexpected redirect");
      },
    },
  }).default;
  assert.equal(
    renderToStaticMarkup(await guard({ children: "editor" })),
    "editor",
  );
  const subtrees = fs
    .readdirSync("app/question-builder", { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  assert.ok(subtrees.includes("english"));
  for (const route of subtrees) {
    const layout = load(`app/question-builder/${route}/layout.tsx`, {
      "@/components/protected-question-builder": { default: guard },
    });
    assert.equal(layout.default, guard);
    assert.equal(layout.metadata.robots.index, false);
    assert.equal(layout.metadata.robots.follow, false);
  }
});
