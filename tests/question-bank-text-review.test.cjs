const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  Module = require("node:module"),
  ts = require("typescript");
function load(file, mocks = {}) {
  const m = new Module(file, module);
  m.paths = module.paths;
  m.require = (id) => (Object.hasOwn(mocks, id) ? mocks[id] : require(id));
  m._compile(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText,
    file,
  );
  return m.exports;
}
const images = load("lib/question-bank-images.ts"),
  schema = load("lib/admin-question-bank-schema.ts", {
    "./question-bank-images": images,
  }),
  review = load("lib/question-bank-text-review.ts", {
    "./admin-question-bank-schema": schema,
  });
const scope = { category: "SSC", subject: "গণিত", topic: "Board Question" };
const cq =
  "[CQ]\nQuestion Number: ১\nSection: ক-বিভাগ: বীজগণিত\nStimulus: মূল সূত্র এখানে\nk: প্রথম অংশ (Marks: ২)\nkh: দ্বিতীয় অংশ (Marks: ৪)\ng: তৃতীয় অংশ (Marks: ৪)\nExplanation: উত্তর নেই\nDifficulty: MEDIUM\nLanguage: Bangla";
const mcq =
  "[MCQ]\nQuestion: প্রশ্ন এখানে\nA: এক\nB: দুই\nC: তিন\nD: চার\nAnswer: উত্তর নেই\nExplanation: উত্তর নেই\nDifficulty: MEDIUM\nLanguage: Bangla";
test("board headers, question numbers, sections and Bengali marks survive as unverified claims, not question text", () => {
  const result = review.parseBankTextForReview(
    "===\nBOARD: ঢাকা বোর্ড-২০২৪\n===\n" +
      cq +
      "\n---\n" +
      mcq +
      "\n---\nBOARD: সিলেট বোর্ড-২০২৩\n" +
      cq,
    scope,
  );
  assert.equal(result.items.length, 3);
  assert.deepEqual(result.items[0].options.marks, { k: 2, kh: 4, g: 4 });
  assert.equal(result.items[0].options.subQuestions.k, "প্রথম অংশ");
  assert.equal(result.items[0].options.importReference.questionNumber, "১");
  assert.equal(
    result.items[1].options.importReference.boardLabel,
    "ঢাকা বোর্ড-২০২৪",
  );
  assert.equal(
    result.items[2].options.importReference.boardLabel,
    "সিলেট বোর্ড-২০২৩",
  );
  assert.equal(
    result.items[0].options.importReference.independentlyVerified,
    false,
  );
  assert.equal(result.items[1].correct, "");
  assert.equal(result.items[0].explanation, "");
  assert.ok(result.reviews.every((r) => r.requiresSourceReview));
  assert.match(result.reviews[0].rawBlock, /Question Number/);
  assert.ok(!result.items[0].text.includes("BOARD"));
});
test("missing answers/options and incorrect marks remain staged but fail save validation; no fabricated answer", () => {
  const parsed = review.parseBankTextForReview(
      mcq.replace("A: এক", "A: "),
      scope,
    ),
    draft = parsed.items[0];
  assert.equal(draft.correct, "");
  assert.equal(schema.bankDraftSchema.safeParse(draft).success, false);
  assert.ok(review.bankStagingIssues(draft, parsed.reviews[0], true).length);
  const wrong = review.parseBankTextForReview(
    cq.replace("Marks: ২", "Marks: ৯"),
    scope,
  );
  assert.equal(wrong.items[0].options.marks.k, 9);
  assert.equal(schema.bankDraftSchema.safeParse(wrong.items[0]).success, false);
  const complete = {
    ...draft,
    correct: "B",
    explanation: "মূলের সঙ্গে যাচাই করা সমাধান",
    options: { A: "এক", B: "দুই", C: "তিন", D: "চার" },
  };
  assert.ok(
    review.bankStagingIssues(complete, parsed.reviews[0], false).length,
  );
  assert.deepEqual(
    review.bankStagingIssues(complete, parsed.reviews[0], true),
    [],
  );
});
test("complete canonical templates stay ready; unknown and duplicate lines require raw-source review", () => {
  const canonical = "[SQ]\nQuestion: পূর্ণ প্রশ্ন\nExplanation: পূর্ণ সমাধান";
  const ok = review.parseBankTextForReview(canonical, scope);
  assert.equal(ok.reviews[0].requiresSourceReview, false);
  assert.deepEqual(review.bankStagingIssues(ok.items[0], ok.reviews[0]), []);
  const duplicate = review.parseBankTextForReview(
    cq.replace("kh:", "k: ভিন্ন অতিরিক্ত অংশ\nkh:"),
    scope,
  );
  assert.match(duplicate.reviews[0].notes.join(" "), /একাধিকবার/);
  assert.equal(duplicate.items[0].options.subQuestions.k, "প্রথম অংশ");
  assert.match(duplicate.reviews[0].rawBlock, /ভিন্ন অতিরিক্ত/);
  assert.throws(() =>
    review.parseBankTextForReview("not a question template", scope),
  );
  assert.throws(() => review.parseBankTextForReview(canonical, scope, 0));
  assert.throws(() => review.parseBankTextForReview(canonical, scope, 100, 1));
});
test("1462 synthetic mixed questions stage without silently skipping invalid MCQs, all remain blocked before corrections", () => {
  const text =
    "BOARD: উৎসের দাবি\n" +
    [...Array(378).fill(cq), ...Array(1084).fill(mcq)].join("\n---\n");
  const result = review.parseBankTextForReview(text, scope);
  assert.equal(result.items.length, 1462);
  assert.equal(result.items.filter((q) => q.type === "CQ").length, 378);
  assert.equal(
    result.items.filter((q) => q.type === "MCQ" && !q.correct).length,
    1084,
  );
  assert.equal(
    result.items.filter(
      (q, i) => !review.bankStagingIssues(q, result.reviews[i]).length,
    ).length,
    0,
  );
});
