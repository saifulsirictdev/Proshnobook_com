const { test } = require("node:test");
const assert = require("node:assert/strict");
require("./helpers/class8-reference.cjs");
const { defaults, restoreSettings } = require("../lib/paper-builder.ts");
const { applyHeader, paperHeaderSchema } = require("../lib/paper-header.ts");
const {
  automaticDefaultHeader,
  resolveDefaultHeader,
  usesDefaultHeader,
  withDefaultHeader,
} = require("../lib/default-paper-header.ts");
const React = require("react"),
  { renderToStaticMarkup } = require("react-dom/server");
const Preview =
  require("../components/paper-builder/default-header-preview.tsx").default;
const items = [
  {
    id: "one",
    text: "A",
    type: "MCQ",
    category: "Class 8",
    subject: "English 2nd Paper",
  },
  {
    id: "two",
    text: "B",
    type: "CQ",
    category: "Class 8",
    subject: "English 2nd Paper",
  },
];
test("default is UI opt-in: legacy saved papers and frozen English stock serialize unchanged", () => {
  const s = defaults();
  assert.equal(Object.hasOwn(s, "defaultHeader"), false);
  const restored = restoreSettings(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(restored, s);
  assert.equal(usesDefaultHeader(restored), false);
});
test("new default has requested institute/exam and automatic metadata/marks from whole paper", () => {
  const s = withDefaultHeader(defaults());
  const h = resolveDefaultHeader(s, items);
  assert.equal(usesDefaultHeader(s), true);
  assert.equal(h.institute, "প্রশ্নবুক.কম উচ্চ বিদ্যালয় ও কলেজ");
  assert.equal(h.exam, "অর্ধ বার্ষিক/বার্ষিক পরীক্ষা -২০২৭");
  assert.equal(h.className, "অষ্টম শ্রেণি");
  assert.equal(h.subject, "ইংরেজি দ্বিতীয় পত্র");
  assert.equal(h.fullMarks, "১১");
  assert.equal(h.time, "নির্ধারিত নয়");
  s.info.minutes = "২ ঘণ্টা 30 মিনিট";
  s.info.marks = "100";
  assert.equal(resolveDefaultHeader(s, items).time, "২ ঘণ্টা ৩০ মিনিট");
  assert.equal(resolveDefaultHeader(s, items).fullMarks, "১০০");
});
test("autos track changed selections while explicit/empty edits persist and can reset independently", () => {
  const s = withDefaultHeader(defaults());
  s.defaultHeader.overrides = {
    exam: "Test",
    institute: "",
    subject: "Custom",
  };
  const changed = [{ ...items[0], category: "Class 7", subject: "বাংলা" }];
  let h = resolveDefaultHeader(s, changed);
  assert.equal(h.exam, "Test");
  assert.equal(h.institute, "");
  assert.equal(h.className, "সপ্তম শ্রেণি");
  assert.equal(h.subject, "Custom");
  delete s.defaultHeader.overrides.subject;
  h = resolveDefaultHeader(s, changed);
  assert.equal(h.subject, "বাংলা");
  assert.deepEqual(restoreSettings(JSON.parse(JSON.stringify(s))), s);
});
test("Smart/Dynamic header applies exclusively, preserves defaults for explicit return, and does not mutate inputs", () => {
  const s = withDefaultHeader(defaults());
  s.defaultHeader.overrides = { institute: "My school" };
  const before = JSON.stringify(s),
    header = paperHeaderSchema.parse({ enabled: true });
  header.fields.institute.value = "Smart school";
  const applied = applyHeader(s, header);
  assert.equal(usesDefaultHeader(applied), false);
  assert.equal(applied.defaultHeader.enabled, false);
  assert.equal(JSON.stringify(s), before);
  assert.equal(withDefaultHeader(applied), applied);
  const returned = withDefaultHeader(applied, true);
  assert.equal(returned.header.enabled, false);
  assert.equal(usesDefaultHeader(returned), true);
  assert.equal(resolveDefaultHeader(returned, items).institute, "My school");
  const old = applyHeader(defaults(), header);
  assert.equal(Object.hasOwn(old, "defaultHeader"), false);
  assert.equal(withDefaultHeader(old), old);
});
test("mixed classes/subjects stay explicit; invalid default data cannot corrupt settings", () => {
  const s = withDefaultHeader(defaults());
  const h = resolveDefaultHeader(s, [
    ...items,
    { ...items[0], category: "Class 6", subject: "বাংলা" },
  ]);
  assert.equal(h.className, "অষ্টম শ্রেণি / ষষ্ঠ শ্রেণি");
  assert.equal(h.subject, "ইংরেজি দ্বিতীয় পত্র / বাংলা");
  assert.equal(
    restoreSettings({
      ...s,
      defaultHeader: {
        enabled: true,
        overrides: { institute: "x".repeat(2001) },
      },
    }).defaultHeader,
    undefined,
  );
});
test("marks reflect answer quotas, active CQ divisions, or English task marks without double counting", () => {
  const s = withDefaultHeader(defaults());
  s.cfg.mcqAnswer = 1;
  s.cfg.cqAnswer = 1;
  assert.equal(
    automaticDefaultHeader(s, [
      ...items,
      { ...items[0], id: "three" },
      { ...items[1], id: "four" },
    ]).fullMarks,
    "১১",
  );
  s.show.divisions = true;
  s.cfg.divisionFilter = "X";
  s.attachments.two = { division: "X", image: "", important: false };
  assert.equal(
    automaticDefaultHeader(s, [items[1], { ...items[1], id: "four" }])
      .fullMarks,
    "১০",
  );
  const en = {
    ...items[0],
    englishGroup: { tasks: [{ marks: 5 }, { marks: 10 }] },
  };
  assert.equal(automaticDefaultHeader(s, [en]).fullMarks, "১৫");
});
test("shared view has six ordered rows/fields, safe plain text and same editing geometry", () => {
  const s = withDefaultHeader(defaults());
  s.defaultHeader.overrides.institute = "<script>alert(1)</script>\nSchool";
  const values = resolveDefaultHeader(s, items);
  const html = renderToStaticMarkup(React.createElement(Preview, { values }));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(!html.includes("<script>"));
  assert.ok(
    html.indexOf("default-header-institute-row") <
      html.indexOf("default-header-exam-row"),
  );
  assert.ok(
    html.indexOf("default-header-class-row") <
      html.indexOf("default-header-subject-row"),
  );
  assert.ok(html.indexOf("সময়:") < html.indexOf("পূর্ণমান:"));
  const edited = renderToStaticMarkup(
    React.createElement(Preview, {
      values,
      renderField: (key, value) =>
        React.createElement("textarea", {
          "aria-label": key,
          defaultValue: value,
        }),
    }),
  );
  assert.equal((edited.match(/<textarea/g) || []).length, 6);
});
