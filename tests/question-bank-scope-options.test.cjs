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
const nctb = load("lib/nctb-data.ts"),
  prep = load("lib/exam-preparation.ts"),
  jobs = require("../lib/job-syllabuses.json"),
  options = load("lib/question-bank-scope-options.ts", {
    "./nctb-data": nctb,
    "./exam-preparation": prep,
    "./job-syllabuses.json": jobs,
  });
test("bank primary categories match public question creation; canonical Class names keep numeric aliases", () => {
  const publicCode = fs.readFileSync("components/qb-start.tsx", "utf8");
  const low = JSON.parse(publicCode.match(/const LOW = (\[[^;]+\]);/)[1]),
    chips = JSON.parse(publicCode.match(/const CHIPS = (\[[^;]+\]);/)[1]);
  assert.deepEqual(options.BANK_BUILDER_CATEGORIES, [
    ...low.map((c) => "Class " + c),
    ...chips,
  ]);
  assert.deepEqual(
    options.bankCategoryAliases("SSC"),
    options.bankCategoryAliases("Class 10"),
  );
  assert.deepEqual(
    options.bankCategoryAliases("HSC"),
    options.bankCategoryAliases("Class 11-12"),
  );
  assert.deepEqual(options.bankCategoryAliases("6"), ["6", "Class 6"]);
  for (const category of low)
    assert.deepEqual(
      options.bankScopeCatalog(category).catalog,
      nctb.NCTB_CLASSES.find((c) => c.class === `Class ${category}`),
    );
  for (const category of ["SSC", "HSC"])
    assert.ok(options.bankScopeCatalog(category).catalog);
  assert.equal(options.bankCategoryLabel("SSC"), "SSC (নবম-দশম)");
  assert.equal(options.bankCategoryLabel("HSC"), "HSC (একাদশ-দ্বাদশ)");
});
test("academic subjects/chapters and Admission outlines use exact public builder sources", () => {
  assert.deepEqual(
    options.bankScopeCatalog("Class 6").catalog,
    nctb.NCTB_CLASSES.find((c) => c.class === "Class 6"),
  );
  const all = options.bankScopeCatalog("Admission");
  assert.deepEqual(all.exams, prep.examOutlines("Admission"));
  for (const exam of prep.examOutlines("Admission")) {
    const found = options.bankScopeCatalog("Admission", exam.id);
    assert.deepEqual(
      found.catalog.subjects.map((s) => s.name),
      exam.subjects,
    );
    for (const subject of found.catalog.subjects)
      assert.deepEqual(
        subject.chapters,
        prep.PREPARATION_TOPICS[subject.name] ?? [],
      );
  }
});
test("every Job exam and NTRCA school/college branch exposes the exact user-side subject/topic lists without inventing DB categories", () => {
  assert.deepEqual(options.bankScopeCatalog("Job").exams, jobs.exams);
  assert.deepEqual(options.bankScopeCatalog("Job").catalog.subjects, []);
  for (const exam of jobs.exams) {
    for (const branch of exam.branches ?? [undefined]) {
      const found = options.bankScopeCatalog("Job", exam.id, branch?.id);
      assert.equal(found.catalog.class, "Job");
      assert.deepEqual(
        found.catalog.subjects,
        (branch ?? exam).subjects.map((s) => ({
          name: s.name,
          chapters: s.topics,
        })),
      );
    }
  }
  assert.deepEqual(
    options.bankScopeCatalog("Job", "ntrca").catalog.subjects,
    [],
  );
  assert.deepEqual(options.bankScopeCatalog("custom").catalog, undefined);
});
