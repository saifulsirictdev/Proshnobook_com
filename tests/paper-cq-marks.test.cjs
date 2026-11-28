const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const ts = require("typescript");
const mod = new Module("paper-cq-marks");
mod._compile(ts.transpileModule(fs.readFileSync("lib/paper-cq-marks.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, "paper-cq-marks.js");
const { cqPartMark } = mod.exports;
const marks = (context, parts = ["k", "kh", "g"]) => parts.map((part, index) => cqPartMark({ part, index, ...context }));

test("manual math papers use 2/4/4 without an auto-model flag", () => {
  for (const subject of ["গণিত", "উচ্চতর গণিত", "সাধারণ গণিত", "Mathematics", "Math", "Higher Mathematics", " maths "])
    assert.deepEqual(marks({ subject }), [2, 4, 4]);
});
test("legacy saved papers fall back to header subject or auto-model metadata", () => {
  assert.deepEqual(marks({ paperSubject: "গণিত" }), [2, 4, 4]);
  assert.deepEqual(marks({ subject: " ", paperSubject: "গণিত" }), [2, 4, 4]);
  assert.deepEqual(marks({ autoModel: "ssc-math-written-v1" }), [2, 4, 4]);
});
test("math auto-model keeps 2/4/4 even when the editable header is not a subject", () => {
  for (const paperSubject of ["সৃজনশীল অংশ", "Test", "", "গণিত"])
    assert.deepEqual(marks({ autoModel: "ssc-math-written-v1", paperSubject }), [2, 4, 4]);
  assert.deepEqual(marks({ subject: "গণিত", autoModel: "ssc-math-written-v1" }), [2, 4, 4]);
});
test("non-math and mixed papers retain 1/2/3/4 based on each question", () => {
  for (const subject of ["পদার্থবিজ্ঞান", "রসায়ন", "বাংলা ১ম পত্র", "Mathematical Physics"])
    assert.deepEqual(marks({ subject, paperSubject: "গণিত", autoModel: "ssc-math-written-v1" }, ["k", "kh", "g", "gh"]), [1, 2, 3, 4]);
  assert.deepEqual(marks({ subject: "গণিত", paperSubject: "পদার্থবিজ্ঞান" }), [2, 4, 4]);
  assert.deepEqual(marks({}, ["k", "kh", "g", "gh"]), [1, 2, 3, 4]);
});
test("part keys preserve marks when blank parts are filtered or keys reordered", () => {
  assert.deepEqual(marks({ subject: "গণিত" }, ["kh", "g"]), [4, 4]);
  assert.deepEqual(marks({ subject: "গণিত" }, ["g", "k", "kh"]), [4, 2, 4]);
  assert.deepEqual(marks({ subject: "পদার্থবিজ্ঞান" }, ["k", "g", "gh"]), [1, 3, 4]);
});
test("shared preview/print path uses per-question marks rather than auto-model-only marks", () => {
  const preview = fs.readFileSync("components/paper-builder/preview.tsx", "utf8");
  assert.equal((preview.match(/cqPartMark\(\{ part: key, index: i, subject: q\.subject, paperSubject: s\.info\.subject, autoModel: s\.autoModel \}\)/g) || []).length, 2);
  assert.match(preview, /autoModelPartMarks\(s, i\)/);
  assert.match(preview, /partMarks\?\.\[key\] \?\?/);
});
