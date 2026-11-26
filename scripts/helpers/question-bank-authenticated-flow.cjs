const { chooseBankScopeField } = require("./question-bank-scope-select.cjs");
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
    setPhase("bank_recovery_incomplete_autosave_no_live_write");
    const questionCountBeforeRecovery = await db.question.count();
    await editor
      .getByLabel("প্রশ্ন", { exact: true })
      .fill(marker + " recoverable draft");
    await editor
      .getByRole("region", { name: "খসড়া সুরক্ষা" })
      .getByRole("status")
      .filter({ hasText: "Recovery server-এ সেভ হয়েছে" })
      .waitFor();
    assert.equal(await db.question.count(), questionCountBeforeRecovery);
    assert.equal(
      await db.setting.count({
        where: { key: { startsWith: "question-bank-recovery:v1:" } },
      }),
      1,
    );
    setPhase("bank_recovery_reload_explicit_restore");
    await page.reload({ waitUntil: "networkidle" });
    await page
      .getByRole("button", { name: "নতুন প্রশ্ন লিখুন", exact: true })
      .click();
    const recovery = editor.getByRole("region", { name: "খসড়া সুরক্ষা" });
    await recovery.getByText("Recovery পাওয়া গেছে", { exact: false }).waitFor();
    assert.equal(
      await editor.getByLabel("প্রশ্ন", { exact: true }).inputValue(),
      "",
    );
    await recovery
      .locator("summary")
      .filter({ hasText: "Server recovery" })
      .click();
    await recovery
      .getByRole("button", {
        name: "Server recovery Editor-এ বসান",
        exact: true,
      })
      .click();
    assert.equal(
      await editor.getByLabel("প্রশ্ন", { exact: true }).inputValue(),
      marker + " recoverable draft",
    );
    assert.equal(await db.question.count(), questionCountBeforeRecovery);
    await editor
      .getByRole("region", { name: "প্রশ্নের quality checklist" })
      .getByText("সংশোধন দরকার", { exact: true })
      .first()
      .waitFor();
    setPhase("bank_manual_editor_real_session");
    await chooseBankScopeField(editor, "শ্রেণি / ক্যাটাগরি", "Class 6");
    await chooseBankScopeField(editor, "বিষয়", "গণিত");
    await chooseBankScopeField(
      editor,
      "অধ্যায় / টপিক",
      "Synthetic workspace chapter",
    );
    await editor.getByLabel("প্রশ্ন", { exact: true }).fill(marker);
    for (const [k, value] of Object.entries({ A: "4", B: "3", C: "5", D: "6" }))
      await editor.getByLabel("অপশন " + k, { exact: true }).fill(value);
    await editor
      .getByLabel("উত্তর / সমাধান ও ব্যাখ্যা", { exact: true })
      .fill("Synthetic original solution");
    setPhase("bank_unicode_preview_apply_undo");
    const tools = editor.locator("details").filter({
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
    setPhase("bank_image_alt_field");
    await editor
      .getByLabel("ছবির বর্ণনা", { exact: true })
      .fill("Synthetic raster fixture");
    const sharp = require("sharp"),
      png = await sharp({
        create: { width: 30, height: 20, channels: 3, background: "#2563eb" },
      })
        .png()
        .toBuffer();
    setPhase("bank_image_file_input");
    const uploadResponse = page.waitForResponse(
      (response) =>
        response.url() === origin + "/api/admin/question-bank/image" &&
        response.request().method() === "POST",
    );
    await editor.getByLabel("ছবি আপলোড করুন", { exact: true }).setInputFiles({
      name: "synthetic.png",
      mimeType: "image/png",
      buffer: png,
    });
    const uploadStatus = (await uploadResponse).status();
    if (uploadStatus !== 200)
      console.error(
        `::error::Synthetic bank raster upload HTTP ${uploadStatus}`,
      );
    assert.equal(uploadStatus, 200);
    setPhase("bank_image_insert_button");
    await editor
      .getByRole("button", { name: "নির্বাচিত স্থানে ছবি বসান", exact: true })
      .click();
    setPhase("bank_image_preview_decode");
    const image = editor
      .getByRole("complementary")
      .getByRole("img", { name: "Synthetic raster fixture" });
    await image.waitFor();
    await image.evaluate((img) => img.decode());
    assert.ok(
      await image.evaluate((img) => img.complete && img.naturalWidth > 0),
    );
    for (const width of [390, 1280]) {
      setPhase(`bank_editor_responsive_${width}`);
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
    setPhase("bank_editor_review_and_save");
    await editor
      .getByRole("checkbox", { name: /প্রিভিউ ও শ্রেণিবিন্যাস দেখেছি/ })
      .check();
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
    assert.equal(
      await db.setting.count({
        where: { key: { startsWith: "question-bank-recovery:v1:" } },
      }),
      0,
      "saved editor recovery was cleared",
    );
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
    await editor
      .getByRole("checkbox", { name: /প্রিভিউ ও শ্রেণিবিন্যাস দেখেছি/ })
      .check();
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
    setPhase("bank_txt_read_before_scope_and_native_dropdowns");
    assert.equal(
      await page
        .getByLabel("শ্রেণি / ক্যাটাগরি", { exact: true })
        .evaluate((el) => el.tagName),
      "SELECT",
    );
    assert.equal(
      await page
        .getByLabel("Word / JSON / TXT ফাইল", { exact: true })
        .getAttribute("accept"),
      null,
      "default picker must allow JSON/TXT on Android",
    );
    await page
      .getByLabel("Word / JSON / TXT ফাইল", { exact: true })
      .setInputFiles({
        name: "before-scope.txt",
        mimeType: "text/plain",
        buffer: Buffer.from(
          "[SQ]\nQuestion: Synthetic text read before classification\nExplanation: Synthetic solution",
        ),
      });
    await page
      .getByRole("status", { name: "নির্বাচিত ফাইলের অবস্থা" })
      .filter({ hasText: "ফাইল পড়া হয়েছে" })
      .waitFor();
    assert.match(
      await page
        .getByLabel("প্রশ্নব্যাচের টেক্সট", { exact: true })
        .inputValue(),
      /Synthetic text read before classification/,
    );
    await chooseBankScopeField(page, "শ্রেণি / ক্যাটাগরি", "Class 6");
    await chooseBankScopeField(page, "বিষয়", "গণিত");
    await chooseBankScopeField(page, "অধ্যায় / টপিক", "Synthetic Word chapter");
    const upload = () =>
      page.getByLabel("Word / JSON / TXT ফাইল", { exact: true }).setInputFiles({
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
    setPhase("bank_large_docx_over_old_limit_browser_worker");
    const JSZip = require("jszip"),
      largeZip = await JSZip.loadAsync(buffer);
    const paragraphs = [];
    for (let i = 0; i < 600; i++) {
      for (const line of [
        `[SQ]`,
        `Question: Synthetic large page ${i + 1} ` + "ব".repeat(3000),
        `Explanation: Synthetic solution`,
        `---`,
      ])
        paragraphs.push(
          `<w:p><w:r><w:t xml:space="preserve">${line}</w:t></w:r></w:p>`,
        );
    }
    largeZip.file(
      "word/document.xml",
      '<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
        paragraphs.join("") +
        "</w:body></w:document>",
    );
    const largeBytes = await largeZip.generateAsync({
      type: "nodebuffer",
      compression: "STORE",
    });
    assert.ok(largeBytes.length > 4_000_000);
    const beforeLarge = await db.question.count();
    await page
      .getByLabel("Word / JSON / TXT ফাইল", { exact: true })
      .setInputFiles({
        name: "synthetic-600-pages.docx",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        buffer: largeBytes,
      });
    await page
      .getByRole("heading", {
        name: "৩. সংশোধন ও নির্বাচন · 600টি প্রশ্ন",
        exact: true,
      })
      .waitFor({ timeout: 90000 });
    assert.equal(
      await page.getByLabel(/নং প্রশ্নের টেক্সট$/).count(),
      20,
      "only a page of editors is mounted",
    );
    await page
      .getByRole("button", { name: "পরের পৃষ্ঠা", exact: true })
      .click();
    assert.match(
      await page
        .getByLabel("21 নং প্রশ্নের টেক্সট", { exact: true })
        .inputValue(),
      /Synthetic large page 21/,
    );
    assert.equal(
      await db.question.count(),
      beforeLarge,
      "large extraction does not publish/write questions",
    );
    await page.setViewportSize({ width: 390, height: 900 });
    const mobileOverflow = await page.evaluate(() => ({
      width: innerWidth,
      scroll: document.documentElement.scrollWidth,
      offenders: [...document.querySelectorAll("main *")]
        .filter((el) => el.getBoundingClientRect().right > innerWidth + 2)
        .slice(0, 8)
        .map((el) => ({
          tag: el.tagName,
          className: String(el.className).slice(0, 140),
          width: Math.round(el.getBoundingClientRect().width),
        })),
    }));
    if (mobileOverflow.scroll > mobileOverflow.width + 2)
      console.error(
        "::error::Synthetic import mobile layout dimensions " +
          JSON.stringify(mobileOverflow),
      );
    assert.ok(mobileOverflow.scroll <= mobileOverflow.width + 2);
    await page.screenshot({
      path: out + "/large-file-mobile.png",
      fullPage: true,
    });
    setPhase("bank_json_105_questions_two_bounded_requests");
    await chooseBankScopeField(page, "অধ্যায় / টপিক", "Synthetic chunked JSON");
    const jsonItems = Array.from({ length: 105 }, (_, i) => ({
      type: "SQ",
      text: `Synthetic chunked JSON question ${i + 1}`,
      explanation: "Synthetic solution",
      options: {},
      correct: "",
      lang: "Bangla",
      difficulty: "EASY",
      approved: true,
    }));
    await page
      .getByLabel("Word / JSON / TXT ফাইল", { exact: true })
      .setInputFiles({
        name: "synthetic.json",
        mimeType: "application/octet-stream",
        buffer: Buffer.from(JSON.stringify({ items: jsonItems })),
      });
    await page
      .getByRole("heading", {
        name: "৩. সংশোধন ও নির্বাচন · 105টি প্রশ্ন",
        exact: true,
      })
      .waitFor();
    const requestSizes = [];
    const observe = (request) => {
      if (
        request.url() === origin + "/api/admin/question-bank/import" &&
        request.method() === "POST"
      ) {
        try {
          const body = request.postDataJSON();
          if (body.items)
            requestSizes.push({
              action: body.action,
              count: body.items.length,
              bytes: Buffer.byteLength(request.postData()),
            });
        } catch {}
      }
    };
    page.on("request", observe);
    try {
      await page
        .getByRole("button", {
          name: "105টি নির্বাচিত প্রশ্ন যাচাই করুন",
          exact: true,
        })
        .click();
      await page
        .getByRole("status")
        .filter({
          hasText: "105টি নির্বাচিত প্রশ্ন একাধিক ছোট request-এ যাচাই হয়েছে",
        })
        .waitFor({ timeout: 120000 });
      await page
        .getByRole("checkbox", { name: /প্রিভিউ, উৎসের অধিকার/ })
        .check();
      await page
        .getByRole("button", {
          name: "নির্বাচিত প্রশ্ন Pending হিসেবে সেভ করুন",
          exact: true,
        })
        .click();
      await page
        .getByRole("status")
        .filter({ hasText: "105টি নতুন Pending" })
        .waitFor({ timeout: 120000 });
      assert.deepEqual(
        requestSizes.filter((x) => x.action === "check").map((x) => x.count),
        [100, 5],
      );
      assert.deepEqual(
        requestSizes.filter((x) => x.action === "save").map((x) => x.count),
        [100, 5],
      );
      assert.ok(requestSizes.every((x) => x.bytes < 801024));
    } finally {
      page.off("request", observe);
    }
    const savedChunk = await db.question.findMany({
      where: { topic: "Synthetic chunked JSON" },
    });
    assert.equal(savedChunk.length, 105);
    assert.ok(savedChunk.every((row) => !row.approved));

    console.log(
      "PASS isolated question-bank: actual Credentials UI, Unicode preview/Undo, real raster, Pending/review/edit, Trash/Restore, history rollback, Word extraction/repeat, JSON/CSV export; no external correction calls",
    );
  } catch (error) {
    // Emit only allowlisted diagnostic fields, never raw browser/server/DB errors.
    const location = /question-bank-authenticated-flow\.cjs:(\d+):(\d+)/.exec(
      error.stack ?? "",
    );
    const kind = ["AssertionError", "TimeoutError"].includes(error.name)
      ? error.name
      : "Error";
    const reasons = [
      ...new Set(
        (error.message ?? "").match(
          /intercepts pointer events|strict mode violation|not visible|not stable|not enabled|outside of the viewport/g,
        ) ?? [],
      ),
    ].join(",");
    console.error(
      `::error::Synthetic bank workflow ${kind} at helper line ${location?.[1] ?? "unknown"}; ${reasons || "no allowlisted browser detail"}`,
    );
    await page
      .screenshot({ path: out + "/failure.png", fullPage: true })
      .catch(() => {});
    throw error;
  } finally {
    page.off("dialog", dialogs);
  }
}
module.exports = { runQuestionBankWorkflow };
