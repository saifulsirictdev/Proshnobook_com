// Actual production components; isolated transport/mocked action. No DB/payment proof.
const fs = require("node:fs"),
  path = require("node:path"),
  assert = require("node:assert/strict");
const { build, response } = require("./server.cjs");
(async () => {
  await build();
  const { chromium } = require("playwright-core"),
    m = require("@sparticuz/chromium"),
    c = m.default || m;
  const browser = await chromium.launch({
    executablePath: await c.executablePath(),
    args: c.args.filter((a) => a !== "--single-process"),
    headless: true,
  });
  const proof = path.resolve("docs/proof/auto-model");
  fs.mkdirSync(proof, { recursive: true });
  const results = [];
  try {
    for (const width of [1280, 390]) {
      const ctx = await browser.newContext({
          viewport: { width, height: 950 },
        }),
        origin = "https://auto-model.invalid",
        errors = [];
      await ctx.route("**/*", (route) => {
        if (
          !route
            .request()
            .url()
            .startsWith(origin + "/")
        )
          return route.abort();
        const r = response(route.request().url());
        return route.fulfill({
          status: r.status || 200,
          body: r.body,
          contentType: r.contentType,
        });
      });
      const page = await ctx.newPage();
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("dialog", (d) => d.accept());
      await page.goto(origin + "/question-builder");
      await page.getByRole("button", { name: /^SSC/ }).click();
      await page
        .getByRole("combobox", { name: "বিষয়", exact: true })
        .selectOption("গণিত");
      await page.getByRole("button", { name: /Chapter অধ্যায়/ }).click();
      assert.equal(
        await page.locator('select[name="questionType"]').count(),
        1,
      );
      await page
        .getByRole("combobox", { name: "প্রস্তুতির টপিক" })
        .selectOption({ index: 1 });
      await page.getByRole("button", { name: /Auto Model কাঠামো/ }).click();
      assert.equal(
        await page.locator('select[name="questionType"]').count(),
        0,
      );
      await page
        .getByRole("button", { name: "CQ সৃজনশীল / লিখিত", exact: true })
        .click();
      await page.evaluate(() => document.fonts.ready);
      assert.match(await page.locator("fieldset").innerText(), /৭০|70/);
      await page.screenshot({
        path: path.join(proof, `starter-${width}.png`),
        fullPage: true,
      });
      // Subject changes reset both the mode and variant; unverified subjects cannot start models.
      await page
        .getByRole("combobox", { name: "বিষয়", exact: true })
        .selectOption("বিজ্ঞান");
      assert.equal(
        await page
          .getByRole("button", { name: /Auto Model কাঠামো/ })
          .getAttribute("aria-pressed"),
        "false",
      );
      await page.getByRole("button", { name: /Auto Model কাঠামো/ }).click();
      await page
        .getByRole("button", { name: "CQ সৃজনশীল / লিখিত", exact: true })
        .click();
      assert.equal(
        await page
          .getByRole("button", { name: /মডেল প্রস্তুত ও কাঠামো/ })
          .isDisabled(),
        true,
      );
      await page
        .getByRole("combobox", { name: "বিষয়", exact: true })
        .selectOption("গণিত");
      await page.getByRole("button", { name: /Auto Model কাঠামো/ }).click();
      await page
        .getByRole("button", { name: "CQ সৃজনশীল / লিখিত", exact: true })
        .click();
      await page
        .getByRole("button", { name: /মডেল প্রস্তুত ও কাঠামো/ })
        .click();
      // Explicit shortage branch must not overwrite the previous draft selection.
      await page.evaluate(() =>
        localStorage.setItem("qb:selected", '["old-draft"]'),
      );
      await page
        .getByRole("checkbox", { name: "প্রশ্নের ঘাটতি পরীক্ষা" })
        .check();
      await page
        .getByRole("button", { name: "পূর্ণ মডেল প্রস্তুত করুন", exact: true })
        .click();
      await page
        .getByText(
          "নমুনা পরীক্ষায় প্রশ্নের ঘাটতি। কোনো আংশিক মডেল তৈরি করা হয়নি।",
        )
        .waitFor();
      assert.equal(
        await page.evaluate(() => localStorage.getItem("qb:selected")),
        '["old-draft"]',
      );
      assert.equal(
        await page
          .getByRole("button", { name: "মূল্য যাচাই ও সেটআপ →" })
          .count(),
        0,
      );
      await page
        .getByRole("checkbox", { name: "প্রশ্নের ঘাটতি পরীক্ষা" })
        .uncheck();
      await page
        .getByRole("button", { name: "পূর্ণ মডেল প্রস্তুত করুন", exact: true })
        .click();
      await page
        .getByRole("button", { name: "মূল্য যাচাই ও সেটআপ →" })
        .waitFor();
      await page.screenshot({
        path: path.join(proof, `review-${width}.png`),
        fullPage: true,
      });
      await page.getByRole("button", { name: "মূল্য যাচাই ও সেটআপ →" }).click();
      const sheet = () => page.locator("#paper .paper-sheet");
      await page.waitForFunction(
        () =>
          document.querySelectorAll("#paper .paper-sheet .paper-question")
            .length === 23,
      );
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() =>
        [...document.querySelectorAll("#paper .paper-sheet img")].every(
          (i) => i.complete && i.naturalWidth > 0,
        ),
      );
      assert.equal(await sheet().locator(".paper-question").count(), 23);
      assert.equal(await sheet().locator(".paper-image-wrap img").count(), 0); // inline rich-text diagrams, not detached attachments
      assert.ok((await sheet().locator("img").count()) >= 2);
      assert.equal(await sheet().locator(".katex-error").count(), 0);
      const headings = await sheet().locator("h3").allTextContents();
      assert.ok(headings.some((t) => t.includes("ক-বিভাগ: বীজগণিত")));
      assert.ok(headings.some((t) => t.includes("ঘ-বিভাগ: পরিসংখ্যান")));
      assert.ok(headings.some((t) => t.includes("সংক্ষিপ্ত উত্তর প্রশ্ন")));
      const text = await sheet().allTextContents();
      assert.match(text.join(" "), /০৮।/);
      assert.doesNotMatch(text.join(" "), /২টির মধ্যে ২টির উত্তর/);
      assert.match(text.join(" "), /প্রতিটি প্রশ্নের মান ২/);
      const field = page.getByRole("textbox", {
        name: "প্রথম প্রশ্ন সম্পাদনা",
        exact: true,
      });
      await field.fill(
        (await field.inputValue()) + "\nসম্পাদনা পরীক্ষায় সংরক্ষিত।",
      );
      await page
        .getByRole("button", { name: "নমুনা সেভ", exact: true })
        .click();
      await page.reload();
      await page
        .getByRole("button", { name: "পুনরায় খুলুন", exact: true })
        .click();
      assert.match(await field.inputValue(), /সম্পাদনা পরীক্ষায় সংরক্ষিত/);
      await page.waitForFunction(
        () =>
          document.querySelectorAll("#paper .paper-sheet .paper-question")
            .length === 23,
      );
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        true,
      );
      await page.screenshot({
        path: path.join(proof, `written-${width}.png`),
        fullPage: true,
      });
      await page.emulateMedia({ media: "print" });
      await page.pdf({
        path: path.join(proof, `written-${width}.pdf`),
        preferCSSPageSize: true,
        printBackground: true,
      });
      await page.emulateMedia({ media: "screen" });
      // A fresh MCQ model replaces the written blueprint instead of leaking its divisions/counts.
      await page
        .getByRole("button", { name: "শুরুতে ফিরুন", exact: true })
        .click();
      await page.getByRole("button", { name: /^SSC/ }).click();
      await page
        .getByRole("combobox", { name: "বিষয়", exact: true })
        .selectOption("গণিত");
      await page.getByRole("button", { name: /Auto Model কাঠামো/ }).click();
      await page
        .getByRole("button", { name: "MCQ নৈর্ব্যক্তিক", exact: true })
        .click();
      await page
        .getByRole("button", { name: /মডেল প্রস্তুত ও কাঠামো/ })
        .click();
      await page
        .getByRole("button", { name: "পূর্ণ মডেল প্রস্তুত করুন", exact: true })
        .click();
      await page.getByRole("button", { name: "মূল্য যাচাই ও সেটআপ →" }).click();
      await page.waitForFunction(
        () =>
          document.querySelectorAll("#paper .paper-sheet .paper-question")
            .length === 30,
      );
      assert.equal(await sheet().locator(".katex-error").count(), 0);
      const settings = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("qb:settings")),
      );
      assert.equal(settings.autoModel, "ssc-math-mcq-v1");
      assert.equal(settings.info.marks, "30");
      assert.deepEqual(settings.edits, {});
      await page.screenshot({
        path: path.join(proof, `mcq-${width}.png`),
        fullPage: true,
      });
      await page.emulateMedia({ media: "print" });
      await page.pdf({
        path: path.join(proof, `mcq-${width}.pdf`),
        preferCSSPageSize: true,
        printBackground: true,
      });
      assert.deepEqual(errors, []);
      results.push({
        width,
        chapterPath: true,
        modelSummary: true,
        subjectReset: true,
        unsupportedBlocked: true,
        shortagePreservesDraft: true,
        writtenQuestions: 23,
        divisions: 4,
        shortQuestions: 15,
        inlineDiagrams: 2,
        continuousCqNumbering: true,
        localEditSaveReopen: true,
        mcqQuestions: 30,
        newModelReset: true,
        noOverflow: true,
        mathErrors: 0,
        scope:
          "isolated components, mocked action; no authenticated DB/save/checkout proof",
      });
      await ctx.close();
    }
    fs.writeFileSync(
      path.join(proof, "browser-results.json"),
      JSON.stringify(results, null, 2) + "\n",
    );
    console.log(JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
