const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  Module = require("node:module"),
  ts = require("typescript");
const file = "lib/question-bank-read-scope.ts",
  m = new Module(file, module);
m._compile(
  ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText,
  file,
);
const scope = m.exports;
test("combined category read filters include stored grades but explicit grades do not bleed into another grade", () => {
  assert.ok(scope.bankReadCategoryAliases("SSC").includes("Class 9"));
  assert.ok(scope.bankReadCategoryAliases("SSC").includes("Class 10"));
  assert.deepEqual(scope.bankReadCategoryAliases("Class 9"), ["Class 9", "9"]);
  assert.ok(!scope.bankReadCategoryAliases("Class 9").includes("Class 10"));
  for (const key of ["HSC", "Class 11-12"])
    for (const stored of ["Class 11", "Class 12", "Class 11-12", "11", "12"])
      assert.ok(scope.bankReadCategoryAliases(key).includes(stored));
  assert.deepEqual(scope.bankReadCategoryAliases("Class 6"), ["Class 6", "6"]);
  assert.deepEqual(scope.bankReadCategoryAliases("Job"), ["Job"]);
});
test("English catalog/DB labels map within paper only; unrelated subjects stay exact and topics are not guessed", () => {
  assert.ok(
    scope.bankReadSubjectMatches("English For Today", "English 1st Paper"),
  );
  assert.ok(
    scope.bankReadSubjectMatches("English 1st Paper", "English First Paper"),
  );
  assert.ok(
    scope.bankReadSubjectMatches(
      "English Grammar and Composition",
      "English 2nd Paper",
    ),
  );
  assert.ok(
    !scope.bankReadSubjectMatches("English For Today", "English 2nd Paper"),
  );
  assert.ok(!scope.bankReadSubjectMatches("English", "English For Today"));
  assert.deepEqual(scope.bankReadSubjectAliases("গণিত"), ["গণিত"]);
  assert.deepEqual(
    scope.bankReadScopeWhere("SSC", "English For Today", "Unit 1")[2],
    { topic: "Unit 1" },
  );
  assert.deepEqual(scope.bankReadScopeWhere("", "", ""), []);
});
