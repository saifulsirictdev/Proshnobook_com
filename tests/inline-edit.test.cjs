const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path");
const { load, dependencies } = require("./helpers/paper-editing.cjs");
const english = dependencies["@/lib/english/editable-text"],
  model = load("lib/paper-builder.ts", {
    "@/lib/paper-header": load("lib/paper-header.ts"),
    "@/lib/paper-math": require("./helpers/paper-math.cjs"),
    "./auto-model-syllabus-schema": require("./helpers/auto-model-syllabus-schema.cjs"),
  }),
  flow = load("lib/english/flow-blocks.ts", {
    "./reference-model": load("lib/english/reference-model.ts"),
    "./cloze-layout": load("lib/english/cloze-layout.ts"),
    "./shared-table": load("lib/english/shared-table.ts"),
  });

const group = {
  passages: [{ key: "unseen-1", text: "Passage body" }],
  tasks: [
    {
      id: "gap-clues",
      instruction: "Read and complete",
      clues: ["alpha", "beta"],
      table: {
        headers: ["H1", "H2"],
        rows: [
          ["1", "2"],
          ["3", "4"],
        ],
      },
      subitems: [{ text: "(a) First", options: ["yes", "no"] }],
    },
  ],
};

test("inline English paths resolve against the original full group", () => {
  assert.deepEqual(english.resolveEnglishField(group, "passage:unseen-1"), {
    key: "p.0",
    value: "Passage body",
  });
  assert.deepEqual(
    english.resolveEnglishField(group, "task:gap-clues:instruction"),
    { key: "t.0.instruction", value: "Read and complete" },
  );
  assert.deepEqual(
    english.resolveEnglishField(group, "task:gap-clues:clue:1"),
    {
      key: "t.0.clue.1",
      value: "beta",
    },
  );
  assert.deepEqual(
    english.resolveEnglishField(group, "task:gap-clues:head:0"),
    {
      key: "t.0.head.0",
      value: "H1",
    },
  );
  assert.deepEqual(
    english.resolveEnglishField(group, "task:gap-clues:cell:1:0"),
    { key: "t.0.cell.1.0", value: "3" },
  );
  assert.deepEqual(english.resolveEnglishField(group, "task:gap-clues:sub:0"), {
    key: "t.0.sub.0",
    value: "(a) First",
  });
  assert.deepEqual(
    english.resolveEnglishField(group, "task:gap-clues:option:0:1"),
    { key: "t.0.option.0.1", value: "no" },
  );
  assert.equal(
    english.resolveEnglishField(group, "task:missing:instruction"),
    null,
  );
  assert.equal(english.resolveEnglishField(group, "nonsense"), null);
  assert.equal(english.resolveEnglishField(group, "passage:gone"), null);
});

test("split table fragments keep their original first-row offset", () => {
  const rows = Array.from({ length: 8 }, (_, r) => [`r${r}c0`, `r${r}c1`]);
  const q = {
    id: "ex-1",
    text: "t",
    englishGroup: {
      passages: [],
      tasks: [
        {
          id: "tabley",
          instruction: "Fill the table",
          clues: [],
          subitems: [],
          table: { headers: ["H1", "H2"], rows },
        },
      ],
    },
  };
  const blocks = flow.englishFlowBlocks(q);
  assert.equal(blocks.length, 2);
  assert.equal(blocks[0].englishGroup.tableOffset, 0);
  assert.equal(blocks[1].englishGroup.tableOffset, 4);
  assert.equal(blocks[1].id, "ex-1:flow:1");
  assert.deepEqual(
    english.resolveEnglishField(blocks[1].englishGroup, "task:tabley:cell:5:1"),
    { key: "t.0.cell.5.1", value: "r5c1" },
  );
});

test("edits schema accepts inline question/part mark overrides only", () => {
  const parsed = model.settingsSchema.parse({
    version: 2,
    items: [],
    output: { type: "MCQ", parts: [], count: 35 },
    edits: { q1: { marks: 8 }, q2: { partMarks: { k: 5 } }, q3: { marks: 0 } },
  });
  assert.equal(parsed.edits.q1.marks, 8);
  assert.equal(parsed.edits.q2.partMarks.k, 5);
  assert.equal(parsed.edits.q3.marks, undefined);
});

test("question-builder drops the edit panel for sheet click-to-edit", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "components", "qb-builder.tsx"),
    "utf8",
  );
  assert.doesNotMatch(source, /প্রশ্ন সম্পাদনা ও সংযুক্তি/);
  assert.match(source, /inlineEdit=\{inline\}/);
  assert.doesNotMatch(source, /import RichTextField/);
  const preview = fs.readFileSync(
    path.join(__dirname, "..", "components", "paper-builder", "preview.tsx"),
    "utf8",
  );
  assert.match(preview, /InlineText/);
  assert.match(preview, /inlineEdit\?: InlineEditApi/);
});
