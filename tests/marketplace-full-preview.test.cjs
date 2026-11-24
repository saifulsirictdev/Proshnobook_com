const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  Module = require("node:module"),
  ts = require("typescript");
const cache = {};
function load(file) {
  if (cache[file]) return cache[file];
  const m = new Module(file, module);
  m.paths = module.paths;
  m.require = (n) =>
    n === "./auto-model-syllabus-schema" ? require("./helpers/auto-model-syllabus-schema.cjs") :
    n === "server-only"
      ? {}
      : n === "@/lib/wallet"
        ? { teacherTid: () => "TID" }
        : n.startsWith("@/lib/")
          ? load(n.replace("@/", "") + ".ts")
          : require(n);
  m._compile(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    file,
  );
  return (cache[file] = m.exports);
}
const { publicFullPreview } = load("lib/marketplace-full-preview.ts"),
  { marketPreviewModel } = load("lib/marketplace-preview.ts"),
  { snapshotHash } = load("lib/marketplace.ts"),
  { settingsSchema } = load("lib/paper-builder.ts");
function fixture() {
  const snapshot = {
    settings: settingsSchema.parse({
      info: { inst: "Original school", exam: "বার্ষিক পরীক্ষা" },
      show: { answerSheet: true },
      cfg: { ansKey: true },
      edits: {
        q0: {
          text: "Full seller-edited question with all its words",
          explanation: "SECRET_SOLUTION",
        },
      },
      excludedIds: ["hidden"],
    }),
    questions: [
      ...Array.from({ length: 25 }, (_, i) => ({
        id: "q" + i,
        text:
          "Complete untruncated question " +
          i +
          " with full text and punctuation.",
        correct: "B",
        explanation: "SECRET_EXPLANATION",
        options: {
          A: "First choice",
          B: "Second choice",
          C: "Third choice",
          D: "Fourth choice",
        },
      })),
      {
        id: "hidden",
        text: "HIDDEN_QUESTION",
        correct: "A",
        options: { A: "hidden" },
      },
    ],
  };
  return {
    version: 1,
    id: "a".repeat(64),
    ownerId: "PRIVATE_OWNER",
    sourceKey: "PRIVATE_SOURCE",
    status: "APPROVED",
    revision: 1,
    metadata: {
      examType: "বার্ষিক পরীক্ষা",
      title: "Test paper",
      grade: "9",
      subject: "বাংলা",
      chapters: ["গদ্য"],
      description: "Full preview paper",
      pricePaisa: 500,
      rights: true,
    },
    snapshot,
    snapshotHash: snapshotHash(snapshot),
    updatedAt: new Date().toISOString(),
  };
}
test("all visible questions and options use original model layout, with only brand watermark and no solution data", () => {
  const r = fixture(),
    before = JSON.stringify(r),
    preview = publicFullPreview(before, r.id),
    original = marketPreviewModel(r.snapshot);
  assert.ok(preview);
  assert.equal(preview.sections.flatMap((s) => s.questions).length, 25);
  assert.deepEqual(
    preview.sections.flatMap((s) => s.questions.map((q) => q.opts)),
    original.sections.flatMap((s) => s.questions.map((q) => q.opts)),
  );
  assert.deepEqual(
    preview.sections.flatMap((s) => s.questions.map(({ q }) => q.text)),
    original.sections.flatMap((s) => s.questions.map(({ q }) => q.text)),
  );
  assert.equal(preview.settings.info.inst, "Original school");
  assert.equal(preview.settings.cfg.marginTop, original.settings.cfg.marginTop);
  assert.equal(preview.settings.show.watermark, true);
  assert.equal(preview.settings.info.watermark, "প্রশ্নবুক.কম");
  assert.equal(preview.settings.cfg.ansKey, false);
  assert.equal(preview.settings.show.answerSheet, false);
  assert.doesNotMatch(
    JSON.stringify(preview),
    /SECRET_|PRIVATE_|HIDDEN_QUESTION/,
  );
  assert.ok(
    preview.sections.every((s) =>
      s.questions.every((q) => q.ci === -1 && q.q.correct === ""),
    ),
  );
  assert.equal(JSON.stringify(r), before);
  assert.equal(r.snapshot.settings.show.answerSheet, true);
});
test("full preview rejects hidden, deleted, pending, wrong-identity and tampered submissions", () => {
  for (const status of ["PENDING", "UNPUBLISHED", "DELETED", "REJECTED"]) {
    const r = fixture();
    r.status = status;
    assert.equal(publicFullPreview(JSON.stringify(r), r.id), null);
  }
  const r = fixture();
  assert.equal(publicFullPreview(JSON.stringify(r), "b".repeat(64)), null);
  r.snapshot.questions[0].text = "tampered";
  assert.equal(publicFullPreview(JSON.stringify(r), r.id), null);
});
test("public full preview replaces limited sample, uses shared renderer and bakes brand pixels; private buyer renderer is unchanged", () => {
  const page = fs.readFileSync("app/marketplace/[id]/page.tsx", "utf8"),
    component = fs.readFileSync(
      "components/marketplace-full-preview.tsx",
      "utf8",
    );
  assert.match(page, /<MarketplaceFullPreview model=\{publicFullPreview/);
  assert.doesNotMatch(page, /<MarketplaceSample/);
  assert.match(component, /<PaperPreview/);
  assert.match(component, /toPng\(sheet/);
  assert.match(component, /ctx.fillText\("প্রশ্নবুক.কম"/);
  assert.doesNotMatch(component, /PROSHNOBOOK.COM|NOT FOR SALE/);
  assert.doesNotMatch(
    fs.readFileSync("app/dashboard/library/[id]/setup/page.tsx", "utf8"),
    /MarketplaceFullPreview|publicFullPreview/,
  );
});
