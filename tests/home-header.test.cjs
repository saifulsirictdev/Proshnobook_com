const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  Module = require("node:module"),
  ts = require("typescript");
const React = require("react"),
  { renderToStaticMarkup } = require("react-dom/server");
function gate(path, showOnHome) {
  const m = new Module("gate", module);
  m.paths = module.paths;
  m.require = (n) =>
    n === "next/navigation" ? { usePathname: () => path } : require(n);
  m._compile(
    ts.transpileModule(
      fs.readFileSync("components/proshnoday/shell/path-gate.tsx", "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          jsx: ts.JsxEmit.ReactJSX,
        },
      },
    ).outputText,
    "gate",
  );
  return renderToStaticMarkup(
    React.createElement(m.exports.default, { showOnHome }, "shared-header"),
  );
}
test("header can show on homepage without enabling footer or workspace chrome", () => {
  assert.match(gate("/", true), /style="display:contents">shared-header<\/div>/);
  assert.match(gate("/", false), /hidden="" style="display:none"><\/div>/);
  for (const path of ["/login", "/wallet", "/dashboard", "/dashboard/library"])
    assert.match(gate(path, true), /hidden="" style="display:none"><\/div>/);
  assert.match(gate("/admin", false), /style="display:contents">shared-header<\/div>/);
  const layout = fs.readFileSync("app/layout.tsx", "utf8");
  assert.match(layout, /<PathGate showOnHome>\s*<SiteHeader/);
  assert.match(layout, /<PathGate>\s*<SiteFooter/);
});
test("shared brand uses larger responsive typography and bounded mobile layout", () => {
  const header = fs.readFileSync("components/site-header.tsx", "utf8");
  assert.ok(header.includes("text-[22px]"));
  assert.ok(header.includes("sm:text-2xl"));
  assert.ok(header.includes("bg-clip-text"));
  assert.ok(header.includes("min-w-0"));
  assert.ok(header.includes("truncate"));
  assert.ok(header.includes("{BRAND.nameBn}"));
  assert.ok(header.includes("<ThemeToggle />"));
});
