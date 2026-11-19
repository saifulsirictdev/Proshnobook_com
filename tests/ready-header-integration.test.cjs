const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
test("Ready Papers reuses existing header manager and renderer, first selected page only", () => {
  const s = fs.readFileSync("components/ready-papers/studio.tsx", "utf8");
  assert.match(
    s,
    /import HeaderManager from "@\/components\/paper-builder\/header-manager"/,
  );
  assert.match(
    s,
    /import HeaderPreview from "@\/components\/paper-builder\/header-preview"/,
  );
  assert.match(
    s,
    /first &&\s*headerStyle === "custom" &&\s*headerSettings.header.enabled/,
  );
  assert.match(s, /<HeaderPreview header=\{currentHeader\(headerSettings\)\}/);
  assert.match(s, /<option value="none">/);
});
test("draft restores validated header settings with legacy simple fallback; shared CSS stays single source", () => {
  const s = fs.readFileSync("components/ready-papers/studio.tsx", "utf8");
  assert.match(s, /headerStyle,\s*headerSettings/);
  assert.match(s, /settingsSchema.parse\(\s*data.headerSettings/);
  assert.match(s, /includes\(data.headerStyle\)/);
  const css = fs.readFileSync("components/paper-builder/paper.css", "utf8");
  assert.match(css, /@import "\.\/header.css"/);
  assert.doesNotMatch(css, /\.custom-paper-header \{/);
  const h = fs.readFileSync("components/paper-builder/header.css", "utf8");
  assert.match(h, /\.header-code-boxes/);
  assert.match(h, /\.custom-paper-header-dynamic/);
  assert.match(h, /print-color-adjust: exact/);
});

test("ready header line and gap are local-draft persisted and bounded on restore", () => {
  const s = fs.readFileSync("components/ready-papers/studio.tsx", "utf8");
  assert.match(s, /headerLine,\s*headerGap/);
  assert.match(s, /Number.isFinite\(data.headerGap\)/);
  assert.match(s, /Math.min\(15, Math.max\(0, data.headerGap\)\)/);
  assert.match(s, /rp-header-line-off/);
  assert.match(s, /marginBottom: `\$\{headerGap\}mm`/);
});

test("setup live A4 review shares print header and current edits, cancels stale renders", () => {
  const s = fs.readFileSync("components/ready-papers/studio.tsx", "utf8");
  assert.match(s, /renderPageHeader\(active === selected\[0\]\)/);
  assert.match(s, /renderPageHeader\(i === 0\)/);
  assert.match(s, /rasterEditKey\(edit\)/);
  assert.match(s, /liveReviewPage === active/);
  assert.match(s, /clearTimeout\(timer\)/);
  assert.match(s, /rp-action-setup/);
  assert.match(s, /rp-action-print/);
});

test("printed PDF setup restores simple and Smart/Dynamic document headers despite shared header hiding", () => {
  const css = fs.readFileSync("components/ready-papers/ready.css", "utf8");
  const builder = fs.readFileSync("components/paper-builder/paper.css", "utf8");
  // Both styles use semantic headers and must override display, not only visibility.
  assert.match(builder, /header,[\s\S]*?display: none !important/);
  const rule = css.match(/#ready-print \.rp-print-header,\s*#ready-print \.rp-custom-print-header\s*\{([^}]+)\}/);
  assert.ok(rule, "scope the fix to actual Ready Paper document headers");
  assert.match(rule[1], /display: block !important/);
  assert.ok(css.lastIndexOf("@media print", rule.index) >= 0);
  assert.match(css, /#ready-print,\s*#ready-print \*\s*\{\s*visibility: visible !important/);
  assert.match(css, /\[data-noprint\],\s*\.qm-bottom-nav\s*\{\s*display: none !important/);
});
