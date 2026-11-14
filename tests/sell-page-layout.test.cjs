const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs");
test("sell form always precedes collapsed instructions, regardless of available sources", () => {
  const page = fs.readFileSync("app/dashboard/sell/page.tsx", "utf8");
  assert.doesNotMatch(page, /\{sources.length \?/);
  assert.ok(page.indexOf("<MarketplaceSubmission") < page.indexOf("<details"));
  assert.match(page, /id="sell-instructions"/);
  const details = page.slice(
    page.indexOf("<details"),
    page.indexOf("</details>"),
  );
  assert.doesNotMatch(
    details.slice(0, details.indexOf(">")),
    /\sopen(?:\s|=|>)/,
  );
  assert.match(details, /নির্দেশনা দেখুন/);
  assert.match(details, /readyPapers.slice/);
});
test("empty-source form stays visible but cannot be submitted and offers instruction disclosure", () => {
  const form = fs.readFileSync("components/marketplace-submission.tsx", "utf8");
  assert.match(form, /disabled=\{pending \|\| !papers.length\}/);
  assert.match(form, /এখনো বিক্রির জন্য প্রস্তুত কপি নেই/);
  assert.match(form, /href="#sell-instructions"/);
  assert.match(form, /instructions.open = true/);
  assert.match(form, /name="sourceKey" className=\{field\} required/);
});
