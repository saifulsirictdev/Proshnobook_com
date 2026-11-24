const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
test("ready final preview exposes explicit account save and visible result outside hidden phone toolbar", () => {
  const source = fs.readFileSync("components/ready-papers/studio.tsx", "utf8");
  assert.match(source, /className="rp-save-confirmation"/);
  assert.match(source, /প্রশ্নপত্র সেভ করুন/);
  assert.match(source, /<p role="status">\{saveNotice\}<\/p>/);
  assert.match(source, /saveReadyPurchase\(receipt, snapshot\(\), selected\)/);
  assert.match(source, /if \(!adminPreset && !paid\)/);
  assert.match(
    source,
    /disabled=\{busy \|\| !selected.length\} onClick=\{save\}/,
  );
});
test("saved question papers includes authenticated ready receipt list and restores receipt selection via saved ID", () => {
  const source = fs.readFileSync("app/question-builder/saved/page.tsx", "utf8");
  assert.match(source, /if \(!session\?\.user\?\.id\) redirect/);
  assert.match(source, /listReadyPurchases\(\)/);
  assert.ok(source.includes("/ready-papers/${p.paperId}?saved=${p.id}"));
  assert.match(source, /ready === null/);
  assert.match(source, /রেডি প্রশ্নপত্র \/ PDF থেকে তৈরি/);
});

test("all preview entry paths require an explicit successful save of the current snapshot", () => {
  const source = fs.readFileSync("components/ready-papers/studio.tsx", "utf8");
  assert.match(source, /explicitlySaved.current === saveIdentity\(\)/);
  assert.match(
    source,
    /JSON.stringify\(\{ receipt, selected, snapshot: snapshot\(\) \}\)/,
  );
  assert.match(source, /if \(paid\) explicitlySaved.current = savingIdentity/);
  assert.match(source, /if \(r.ok\) explicitlySaved.current = savingIdentity/);
  const preview = source.slice(
    source.indexOf("async function preview()"),
    source.indexOf("async function save()"),
  );
  assert.ok(
    preview.indexOf("if (!requireSaved()) return;") <
      preview.indexOf('setStep("preview")'),
  );
  assert.equal(
    (source.match(/if \(!requireSaved\(\)\) return;/g) || []).length,
    1,
  );
  assert.match(source, /if \(!requireSaved\(\)\) return;/);
});

test("mobile save panel offers a direct save-then-preview action, reporting errors visibly", () => {
  const source = fs.readFileSync("components/ready-papers/studio.tsx", "utf8");
  assert.match(source, /onClick=\{saveAndPreview\}/);
  assert.match(source, /if \(await save\(\)\) await preview\(\);/);
  assert.match(source, /async function save\(\): Promise<boolean>/);
  const save = source.slice(
    source.indexOf("async function save()"),
    source.indexOf("async function saveAndPreview()"),
  );
  assert.match(save, /return false;/);
  assert.match(save, /return true;/);
  const preview = source.slice(
    source.indexOf("async function preview()"),
    source.indexOf("async function prepareMarketCopy()"),
  );
  assert.match(preview, /catch \(error\)/);
  assert.match(preview, /setSaveNotice\(notice\)/);
  assert.match(source, /Save &amp; Print Preview/);
  assert.doesNotMatch(source,/onClick=\{preview\}/);
});
test("save revalidation of the same receipt cannot reset edits or switch Preview back to Edit", () => {
  const source = fs.readFileSync("components/ready-papers/studio.tsx", "utf8");
  const start = source.indexOf("const p = initialPurchase;");
  const effect = source.slice(
    start,
    source.indexOf("}, [initialPurchase]);", start),
  );
  assert.match(effect, /if \(hydratedPurchase.current === p.id\) return;/);
  assert.ok(
    effect.indexOf("hydratedPurchase.current === p.id") <
      effect.indexOf("setEdits("),
  );
  assert.ok(
    effect.indexOf("hydratedPurchase.current === p.id") <
      effect.indexOf('setStep("edit")'),
  );
});
