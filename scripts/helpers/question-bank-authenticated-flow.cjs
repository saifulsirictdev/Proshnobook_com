/** Actual built app + Credentials session + disposable DB. No API/provider mocks. */
const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path");
async function runQuestionBankWorkflow({
  page,
  db,
  context,
  origin,
  setPhase,
}) {
  const out = path.resolve(".cache/question-bank-authenticated-flow");
  fs.mkdirSync(out, { recursive: true });
  const dialogs = (dialog) => dialog.accept();
  page.on("dialog", dialogs);
  const marker = "Synthetic isolated admin workspace question";
  try {
    setPhase("bank_manual_editor_real_session");
    await page.goto(
      origin + "/admin/questions/bank?q=" + encodeURIComponent(marker),
      { waitUntil: "networkidle" },
    );
    await page
      .getByRole("heading", { name: "প্রশ্নব্যাংক স্টুডিও", exact: true })
      .waitFor();
    await page
      .getByRole("button", { name: "নতুন প্রশ্ন লিখুন", exact: true })
      .click();
    const editor = page.getByRole("region", { name: "প্রশ্ন Editor" });
    await editor
      .getByLabel("শ্রেণি / ক্যাটাগরি", { exact: true })
      .fill("Class 6");
    await editor.getByLabel("বিষয়", { exact: true }).fill("গণিত");
    await editor
      .getByLabel("অধ্যায় / টপিক", { exact: true })
      .fill("Synthetic workspace chapter");
    await editor.getByLabel("প্রশ্ন", { exact: true }).fill(marker);
    for (const [k, value] of Object.entries({ A: "4", B: "3", C: "5", D: "6" }))
      await editor.getByLabel("অপশন " + k, { exact: true }).fill(value);
    await editor
      .getByLabel("উত্তর / সমাধান ও ব্যাখ্যা", { exact: true })
      .fill("Synthetic original solution");
    setPhase("bank_unicode_preview_apply_undo");
    const tools = editor
      .locator("details")
      .filter({
        has: page.locator("summary", { hasText: "Unicode conversion" }),
      });
    await tools.locator("summary").click();
    await tools
      .getByRole("button", { name: "Editor থেকে টেক্সট নিন", exact: true })
      .click();
    await tools
      .getByLabel("মূল / legacy টেক্সট", { exact: true })
      .fill("Avgvi †mvbvi evsjv $x=2$ 123");
    await tools
      .getByRole("button", { name: "Bijoy → Unicode প্রিভিউ", exact: true })
      .click();
    assert.match(
      await tools.getByLabel("প্রস্তাবিত টেক্সট", { exact: true }).inputValue(),
      /আমার সোনার বাংলা/,
    );
    assert.equal(
      await editor.getByLabel("প্রশ্ন", { exact: true }).inputValue(),
      marker,
    );
    await tools
      .getByRole("button", {
        name: "পার্থক্য দেখেছি · Editor-এ বসান",
        exact: true,
      })
      .click();
    assert.match(
      await editor.getByLabel("প্রশ্ন", { exact: true }).inputValue(),
      /আমার সোনার বাংলা \$x=2\$ 123/,
    );
    await tools
      .getByRole("button", { name: "শেষ Apply Undo করুন", exact: true })
      .click();
    assert.equal(
      await editor.getByLabel("প্রশ্ন", { exact: true }).inputValue(),
      marker,
    );
    await tools.locator("summary").click();
    setPhase("bank_real_image_upload_preview");
    await editor
      .getByLabel("ছবির বর্ণনা", { exact: true })
      .fill("Synthetic raster fixture");
    const sharp = require("sharp"),
      png = await sharp({
        create: { width: 30, height: 20, channels: 3, background: "#2563eb" },
      })
        .png()
        .toBuffer();
    await editor
      .getByLabel("ছবি আপলোড করুন", { exact: true })
      .setInputFiles({
        name: "synthetic.png",
        mimeType: "image/png",
        buffer: png,
      });
    await editor
      .getByRole("button", { name: "নির্বাচিত স্থানে ছবি বসান", exact: true })
      .click();
    const image = editor
      .getByRole("complementary")
      .getByRole("img", { name: "Synthetic raster fixture" });
    await image.waitFor();
    await image.evaluate((img) => img.decode());
    assert.ok(
      await image.evaluate((img) => img.complete && img.naturalWidth > 0),
    );
    for (const width of [390, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 2,
        ),
      );
      await page.screenshot({
        path: out + `/editor-${width}.png`,
        fullPage: true,
      });
    }
    await editor.getByRole("checkbox").check();
    await editor
      .getByRole("button", { name: "Pending হিসেবে সেভ করুন", exact: true })
      .click();
    await page
      .getByRole("status")
      .filter({ hasText: "প্রশ্ন Pending হিসেবে সেভ হয়েছে" })
      .waitFor();
    let q = await db.question.findFirstOrThrow({
      where: { text: { startsWith: marker } },
    });
    assert.equal(q.approved, false);
    assert.equal(q.source, "ADMIN_MANUAL");
    assert.match(q.text, /\/api\/question-bank\/images\//);
    setPhase("bank_review_approve_edit_pending");
    await page
      .getByRole("article")
      .getByRole("button", { name: "প্রিভিউ", exact: true })
      .click();
    await page
      .getByRole("button", { name: "যাচাই করেছি · অনুমোদন দিন", exact: true })
      .click();
    await page
      .getByRole("status")
      .filter({ hasText: "অনুমোদন হয়েছে" })
      .waitFor();
    assert.equal(
      (await db.question.findUniqueOrThrow({ where: { id: q.id } })).approved,
      true,
    );
    await page
      .getByRole("article")
      .getByRole("button", { name: "সম্পাদনা", exact: true })
      .click();
    await editor
      .getByLabel("উত্তর / সমাধান ও ব্যাখ্যা", { exact: true })
      .fill("Synthetic revised solution");
    await editor.getByRole("checkbox").check();
    await editor
      .getByRole("button", { name: "Pending হিসেবে সেভ করুন", exact: true })
      .click();
    await page
      .getByRole("status")
      .filter({ hasText: "প্রশ্ন Pending হিসেবে সেভ হয়েছে" })
      .waitFor();
    assert.equal(
      (await db.question.findUniqueOrThrow({ where: { id: q.id } })).approved,
      false,
    );
    setPhase("bank_trash_restore_real_db");
    await page.getByRole("article").getByRole("checkbox").check();
    await page.getByRole("button", { name: "Trash", exact: true }).click();
    await page.getByRole("status").filter({ hasText: "Trash হয়েছে" }).waitFor();
    q = await db.question.findUniqueOrThrow({ where: { id: q.id } });
    assert.match(q.source, /ADMIN_TRASH:/);
    assert.equal(q.approved, false);
    await page
      .getByRole("button")
      .filter({ hasText: "Trash-এ সংরক্ষিত" })
      .click();
    await page.getByRole("article").getByRole("checkbox").check();
    await page.getByRole("button", { name: "Restore", exact: true }).click();
    await page
      .getByRole("status")
      .filter({ hasText: "Restore হয়েছে" })
      .waitFor();
    q = await db.question.findUniqueOrThrow({ where: { id: q.id } });
    assert.equal(q.source, "ADMIN_MANUAL");
    assert.equal(q.approved, false);
    setPhase("bank_history_rollback_real_db");
    await page.goto(
      origin + "/admin/questions/bank?q=" + encodeURIComponent(marker),
      { waitUntil: "networkidle" },
    );
    await page
      .getByRole("article")
      .getByRole("button", { name: "ইতিহাস", exact: true })
      .click();
    const edit = page
      .locator('section[aria-label="নির্বাচিত প্রশ্নের প্রিভিউ"] details')
      .filter({ has: page.locator("summary", { hasText: /^edit/ }) });
    await edit.locator("summary").click();
    await edit
      .getByRole("button", {
        name: "আগের content Pending হিসেবে ফেরান",
        exact: true,
      })
      .click();
    await page
      .getByRole("status")
      .filter({ hasText: "সংস্করণের content Pending হিসেবে ফিরেছে" })
      .waitFor();
    q = await db.question.findUniqueOrThrow({ where: { id: q.id } });
    assert.equal(q.explanation, "Synthetic original solution");
    assert.equal(q.approved, false);
    const impact = await context.request.get(
      origin + "/api/admin/question-bank/impact?id=" + encodeURIComponent(q.id),
    );
    assert.equal(impact.status(), 200);
    assert.equal(typeof (await impact.json()).practiceTests, "number");
    setPhase("bank_word_template_real_upload_review_import");
    const template = await context.request.get(
      origin + "/api/admin/question-bank/template?format=docx&math=1",
    );
    assert.equal(template.status(), 200);
    const buffer = await template.body();
    await page.goto(origin + "/admin/questions/bank/import", {
      waitUntil: "networkidle",
    });
    await page
      .getByLabel("শ্রেণি / ক্যাটাগরি", { exact: true })
      .fill("Class 6");
    await page.getByLabel("বিষয়", { exact: true }).fill("গণিত");
    await page
      .getByLabel("অধ্যায় / টপিক", { exact: true })
      .fill("Synthetic Word chapter");
    const upload = () =>
      page
        .getByLabel("Word বা JSON ফাইল", { exact: true })
        .setInputFiles({
          name: "synthetic-template.docx",
          mimeType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          buffer,
        });
    await upload();
    await page
      .getByRole("heading", {
        name: "৩. সংশোধন ও নির্বাচন · 3টি প্রশ্ন",
        exact: true,
      })
      .waitFor();
    await page
      .getByRole("button", {
        name: "3টি নির্বাচিত প্রশ্ন যাচাই করুন",
        exact: true,
      })
      .click();
    await page
      .getByRole("status")
      .filter({ hasText: "DB প্রশ্নের সঙ্গে duplicate পরীক্ষা হয়েছে" })
      .waitFor();
    await page.getByRole("checkbox", { name: /প্রিভিউ, উৎসের অধিকার/ }).check();
    await page
      .getByRole("button", {
        name: "নির্বাচিত প্রশ্ন Pending হিসেবে সেভ করুন",
        exact: true,
      })
      .click();
    await page
      .getByRole("status")
      .filter({ hasText: "3টি নতুন Pending" })
      .waitFor();
    const imported = await db.question.findMany({
      where: { topic: "Synthetic Word chapter" },
    });
    assert.equal(imported.length, 3);
    assert.ok(
      imported.every(
        (row) =>
          row.approved === false && row.source.startsWith("ADMIN_UPLOAD:"),
      ),
    );
    setPhase("bank_word_repeat_protected_identity");
    await upload();
    await page
      .getByRole("button", {
        name: "3টি নির্বাচিত প্রশ্ন যাচাই করুন",
        exact: true,
      })
      .click();
    await page
      .getByRole("status")
      .filter({ hasText: "DB প্রশ্নের সঙ্গে duplicate পরীক্ষা হয়েছে" })
      .waitFor();
    await page.getByRole("checkbox", { name: /প্রিভিউ, উৎসের অধিকার/ }).check();
    await page
      .getByRole("button", {
        name: "নির্বাচিত প্রশ্ন Pending হিসেবে সেভ করুন",
        exact: true,
      })
      .click();
    await page
      .getByRole("status")
      .filter({ hasText: "0টি নতুন Pending; 3টি" })
      .waitFor();
    assert.equal(
      await db.question.count({ where: { topic: "Synthetic Word chapter" } }),
      3,
    );
    setPhase("bank_json_csv_export_real_db");
    const exported = await context.request.get(
      origin +
        "/api/admin/question-bank/export?topic=" +
        encodeURIComponent("Synthetic Word chapter") +
        "&format=json",
    );
    assert.equal(exported.status(), 200);
    assert.equal((await exported.json()).items.length, 3);
    const csv = await context.request.get(
      origin +
        "/api/admin/question-bank/export?topic=" +
        encodeURIComponent("Synthetic Word chapter") +
        "&format=csv",
    );
    assert.equal(csv.status(), 200);
    assert.match(await csv.text(), /"ID","Category"/);
    await page.screenshot({
      path: out + "/word-import-pending.png",
      fullPage: true,
    });
    console.log(
      "PASS isolated question-bank: actual Credentials UI, Unicode preview/Undo, real raster, Pending/review/edit, Trash/Restore, history rollback, Word extraction/repeat, JSON/CSV export; no external correction calls",
    );
  } finally {
    page.off("dialog", dialogs);
  }
}
module.exports = { runQuestionBankWorkflow };
