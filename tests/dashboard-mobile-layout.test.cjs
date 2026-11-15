const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
test("mobile compact dashboard preserves two-column tools without scaling the page", () => {
  const page = fs.readFileSync("app/dashboard/page.tsx", "utf8");
  const css = fs.readFileSync("components/teacher-workspace.css", "utf8").split("/* Compact Dashboard only:")[1];
  assert.match(page, /className="tw-main tw-dashboard"/);
  assert.match(css, /@media \(max-width: 760px\)/);
  for (const selector of ["tw-creation-options", "tw-cards", "tw-market-actions"]) assert.ok(css.includes(`.tw-dashboard .${selector}`));
  assert.match(css, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /min-height: 44px/);
  assert.match(css, /@media \(max-width: 359px\)/);
  assert.doesNotMatch(css, /zoom:|scale\(|overflow:\s*hidden|height:\s*100vh/);
});
