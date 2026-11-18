const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  ts = require("typescript"),
  Module = require("node:module"),
  React = require("react"),
  { renderToStaticMarkup } = require("react-dom/server");
function load(file, mocks = {}) {
  const m = new Module(file, module);
  m.paths = module.paths;
  m.require = (n) => (Object.hasOwn(mocks, n) ? mocks[n] : require(n));
  m._compile(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText,
    file,
  );
  return m.exports;
}
const types = load("lib/question-type-options.ts");
test("starter displays shared question type options and forwards the selected type to preparation", () => {
  const Start = load("components/qb-start.tsx", {
    "next/navigation": {
      useRouter: () => ({ push() {} }),
      useSearchParams: () => new URLSearchParams(),
    },
    "@/lib/nctb-data": { NCTB_CLASSES: [] },
    "@/lib/question-type-options": types,
    '@/lib/english/topic-options': { englishLessonOptions: () => ({ topics: [], groups: [], notice: '' }), englishQuestionItemGroups: () => [] },
    "@/lib/english/builder-mode": { englishBuilderContext: () => null, englishBuilderHref: () => null },
    "@/lib/exam-preparation": load("lib/exam-preparation.ts"),
    "@/lib/job-syllabuses.json": require("../lib/job-syllabuses.json"),
  }).default;
  const html = renderToStaticMarkup(React.createElement(Start, { pairs: [] }));
  assert.match(html, /প্রশ্নের ধরন/);
  assert.match(html, /name="questionType"/);
  for (const o of types.QUESTION_TYPE_OPTIONS)
    assert.ok(html.includes(`value="${o.value}"`));
  assert.match(html, /<option value="ALL" selected="">/);
  const source = fs.readFileSync("components/qb-start.tsx", "utf8");
  assert.match(source, /p.set\("questionType", isJob \? "MCQ" : questionType\)/);
  assert.ok(
    source.indexOf('name="questionType"') <
      source.indexOf("disabled={!subject ||"),
  );
});
