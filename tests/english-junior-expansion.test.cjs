const { test } = require("node:test");
const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  Module = require("node:module"),
  ts = require("typescript"),
  { createHash } = require("node:crypto");
require("./helpers/class8-reference.cjs");
const data = require("../lib/english/data/junior-paper2-expansion-01.json");
const {
  preparedJuniorPaper2ExpansionModels: models,
  preparedJuniorPaper2ExpansionItems: extras,
} = require("../lib/english/prepared-junior-paper2-expansion.ts");
const current = require("../lib/english/prepared-import-items.ts"),
  historical = require("../lib/english/prepared-items.ts");
const { englishBlueprint } = require("../lib/english/blueprints.ts"),
  { validateEnglishOutput } = require("../lib/english/generation.ts");
const {
  approvedEnglishItem,
  assembleEnglishItems,
} = require("../lib/english/item-bank.ts");
const { findEnglishBankParts } = require("../lib/english/bank.ts");
const { englishLegacyPaper } = require("../lib/english/legacy-builder.ts"),
  { englishFlowBlocks } = require("../lib/english/flow-blocks.ts");
const React = require("react"),
  { renderToStaticMarkup } = require("react-dom/server"),
  Group = require("../components/paper-builder/english-group.tsx").default;
const hash = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
const multiset = (a) =>
  a.reduce((map, s) => {
    map[s] = (map[s] || 0) + 1;
    return map;
  }, {});
// Ignore generic exercise instructions and answers when counting grammar payloads.
function questionOnly(t) {
  return {
    id: t.id,
    body:
      t.id === "letter-email" || t.id === "composition"
        ? t.instruction
        : t.instruction.split("\n").slice(1).join("\n"),
    subitems: t.id === "substitution" ? [] : t.subitems.map((s) => s.text),
    clues: t.clues,
    table: t.table,
  };
}
const normalize = (s) =>
  s
    .replace(/<[^>]+>/g, "")
    .replaceAll("&#x27;", "'")
    .replaceAll("&quot;", '"')
    .replaceAll("&amp;", "&");

test("eight new original models add 64 groups, honestly five prepared sets per junior item, never fifty or automatic approval", () => {
  assert.equal(data.models.length, 8);
  const ids = new Set(),
    keys = new Set(),
    perItem = new Map();
  for (const grade of [6, 7]) {
    const batch = models(grade),
      items = extras(grade),
      all = current.preparedEnglishImportItems(grade, 2),
      blueprint = englishBlueprint(grade, 2);
    assert.equal(batch.length, 4);
    assert.equal(items.length, 32);
    assert.equal(all.length, 40);
    assert.deepEqual(
      batch.map((m) => m.id),
      [2, 3, 4, 5].map((n) => `class${grade}-paper2-authored-model-0${n}`),
    );
    for (const model of batch) {
      assert.ok(!ids.has(model.id));
      ids.add(model.id);
      const v = validateEnglishOutput(
        model.draft.selection,
        model.draft.output,
      );
      assert.equal(v.total, 50);
      assert.deepEqual(
        v.tasks.map((t) => t.id),
        blueprint.items.map((t) => t.id),
      );
      assert.equal(
        model.draft.selection.writing.composition.words,
        grade === 6 ? 200 : 250,
      );
      assert.equal(
        model.draft.output.tasks.some((t) => t.id === "parts-of-speech"),
        grade === 6,
      );
      assert.equal(
        model.draft.output.tasks.some((t) => t.id === "narration"),
        grade === 7,
      );
    }
    for (const item of all) {
      assert.ok(!keys.has(item.key));
      keys.add(item.key);
      assert.equal(item.draft.selection.grade, grade);
      assert.equal(item.draft.selection.paper, 2);
      assert.ok(!("status" in item));
      const t = item.draft.output.tasks[0],
        id = `${grade}/${t.id}`,
        set = perItem.get(id) || new Set();
      const q = hash(questionOnly(t));
      assert.ok(!set.has(q), id + " duplicate question payload");
      set.add(q);
      perItem.set(id, set);
      assert.ok(!t.boardSource && !t.schoolSource);
    }
    for (const item of blueprint.items)
      assert.equal(
        current.preparedEnglishImportItems(grade, 2, item.id).length,
        5,
      );
  }
  assert.equal(keys.size, 80);
  for (const set of perItem.values()) assert.equal(set.size, 5);
  for (const grade of [5, 8, 9, 10, 11, 12])
    assert.deepEqual(extras(grade), []);
});

test("every cloze has exactly ten ordered gaps, matching clue/key multiplicity and an independently stored completed passage", () => {
  for (const model of data.models) {
    const t = model.output.tasks.find((t) => t.id === "gap-clues");
    assert.deepEqual(
      [...t.instruction.matchAll(/\(([a-j])\) ___/g)].map((m) => m[1]),
      [..."abcdefghij"],
    );
    assert.equal(t.clues.length, 10);
    assert.equal(t.subitems.length, 10);
    assert.deepEqual(
      multiset(t.clues),
      multiset(t.subitems.map((s) => s.answer)),
    );
    let completed = t.instruction.split("\n").slice(1).join("\n");
    t.subitems.forEach((s, i) => {
      completed = completed.replace(
        `(${String.fromCharCode(97 + i)}) ___`,
        s.answer,
      );
    });
    assert.equal(completed, model.editorialChecks.completedCloze);
    assert.doesNotMatch(completed, /___|\([a-j]\)/);
  }
});

test("substitution keys use each fragment exactly once, not invented sentences outside the printed table", () => {
  for (const model of data.models) {
    const t = model.output.tasks.find((t) => t.id === "substitution"),
      used = [[], [], []];
    assert.equal(t.table.rows.length, 5);
    assert.equal(t.subitems.length, 5);
    for (const answer of t.subitems.map((s) => s.answer)) {
      const matches = [];
      for (const a of t.table.rows)
        for (const b of t.table.rows)
          for (const c of t.table.rows)
            if ([a[0], b[1], c[2]].join(" ") === answer)
              matches.push([a[0], b[1], c[2]]);
      assert.equal(matches.length, 1, model.id + ": key outside table");
      matches[0].forEach((s, i) => used[i].push(s));
    }
    for (let i = 0; i < 3; i++)
      assert.deepEqual(
        multiset(used[i]),
        multiset(t.table.rows.map((row) => row[i])),
      );
  }
});

test("all punctuation keys replay exactly ten disclosed edits, and new writing samples meet the requested approximate lengths", () => {
  for (const model of data.models) {
    const t = model.output.tasks.find((t) => t.id === "punctuation");
    let corrected = t.instruction.split("\n").slice(1).join("\n");
    assert.equal(model.editorialChecks.punctuationEdits.length, 10);
    for (const edit of model.editorialChecks.punctuationEdits) {
      assert.notEqual(edit.from, edit.to);
      assert.equal(
        corrected.split(edit.from).length - 1,
        1,
        model.id + " ambiguous edit",
      );
      corrected = corrected.replace(edit.from, edit.to);
    }
    assert.equal(corrected, t.answer);
    assert.equal(t.subitems.length, 0);
    const composition = model.output.tasks.find((t) => t.id === "composition"),
      words = composition.answer
        .split("\n\n")
        .slice(1)
        .join(" ")
        .trim()
        .split(/\s+/).length;
    const target = model.grade === 6 ? 200 : 250;
    assert.ok(
      words >= target && words <= target * 1.1,
      model.id + " sample length",
    );
    assert.ok(
      model.output.tasks
        .find((t) => t.id === "letter-email")
        .answer.split(/\s+/).length > 100,
    );
  }
});

test("historical frozen release and other grade/paper import catalogs/digests remain unchanged", () => {
  const release = require("../scripts/english/release-expanded-models.cjs");
  const before = release.prepare();
  assert.equal(before.digest, release.FROZEN);
  assert.equal(before.items.length, 1144);
  assert.equal(before.readOnly.length, 440);
  for (const grade of [6, 7]) {
    assert.equal(historical.preparedEnglishItems(grade, 2).length, 8);
    assert.notEqual(
      current.englishImportItemsDigest(grade, 2),
      historical.englishItemsDigest(grade, 2),
    );
  }
  for (const grade of [6, 7, 8, 9, 10, 11, 12])
    for (const paper of [1, 2])
      if (paper !== 2 || ![6, 7].includes(grade)) {
        assert.deepEqual(
          current.preparedEnglishImportItems(grade, paper),
          historical.preparedEnglishItems(grade, paper),
        );
        assert.equal(
          current.englishImportItemsDigest(grade, paper),
          historical.englishItemsDigest(grade, paper),
        );
      }
  assert.equal(release.prepare().digest, release.FROZEN);
});

test("import consent binds review evidence and exact scope; returned objects cannot mutate another snapshot", () => {
  const digest = current.englishImportItemsDigest(6, 2, "verbs"),
    model = data.models[0];
  model.editorialChecks.completedCloze += " changed";
  try {
    assert.notEqual(current.englishImportItemsDigest(6, 2, "verbs"), digest);
  } finally {
    model.editorialChecks.completedCloze =
      model.editorialChecks.completedCloze.slice(0, -8);
  }
  assert.equal(current.englishImportItemsDigest(6, 2, "verbs"), digest);
  assert.notEqual(digest, current.englishImportItemsDigest(7, 2, "verbs"));
  assert.notEqual(
    digest,
    current.englishImportItemsDigest(6, 2, "substitution"),
  );
  const snapshot = extras(6);
  snapshot[0].draft.output.tasks[0].subitems[0].answer = "changed";
  snapshot[0].review.editorialChecks.completedCloze = "changed";
  assert.notEqual(snapshot[1].review.editorialChecks.completedCloze, "changed");
  assert.notEqual(
    extras(6)[0].draft.output.tasks[0].subitems[0].answer,
    "changed",
  );
  assert.equal(current.englishImportItemsDigest(6, 2, "verbs"), digest);
});

function actionHarness() {
  const saved = new Map();
  let writes = 0,
    role = "ADMIN";
  const mock = {
    "@/auth": { auth: async () => ({ user: { id: "admin-test", role } }) },
    "@/lib/db": {
      db: {
        setting: {
          createMany: async ({ data, skipDuplicates }) => {
            writes++;
            assert.equal(skipDuplicates, true);
            for (const row of data)
              if (!saved.has(row.key)) saved.set(row.key, row.value);
            return { count: data.length };
          },
        },
      },
    },
    "next/cache": { revalidatePath() {} },
  };
  const file = path.resolve("app/admin/english-review/item-actions.ts"),
    m = new Module(file, module);
  m.paths = module.paths;
  m.require = (id) => mock[id] ?? require(id);
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
  return {
    saved,
    writes: () => writes,
    role: (r) => (role = r),
    run: m.exports.importEnglishItems,
  };
}
test("ADMIN import writes only consented Pending entries, preserves previous decisions, and rejects stale/scope-mismatched consent", async () => {
  const h = actionHarness(),
    f = new FormData();
  f.set("grade", "6");
  f.set("paper", "2");
  f.set("item", "verbs");
  f.set("digest", current.englishImportItemsDigest(6, 2, "verbs"));
  await h.run(f);
  assert.equal(h.writes(), 0);
  f.set("reviewed", "yes");
  h.role("TEACHER");
  await assert.rejects(h.run(f), /Forbidden/);
  assert.equal(h.writes(), 0);
  h.role("ADMIN");
  f.set("digest", historical.englishItemsDigest(6, 2, "verbs"));
  await h.run(f);
  assert.equal(h.writes(), 0);
  f.set("digest", current.englishImportItemsDigest(7, 2, "verbs"));
  await h.run(f);
  assert.equal(h.writes(), 0);
  f.set("digest", current.englishImportItemsDigest(6, 2, "verbs"));
  await h.run(f);
  assert.equal(h.saved.size, 5);
  for (const value of h.saved.values()) {
    const record = JSON.parse(value);
    assert.equal(record.status, "PENDING");
    assert.deepEqual(record.draft.selection.itemIds, ["verbs"]);
    assert.equal(record.draft.selection.grade, 6);
  }
  const [key, value] = [...h.saved][0];
  h.saved.set(key, value.replace("PENDING", "REJECTED"));
  await h.run(f);
  assert.equal(JSON.parse(h.saved.get(key)).status, "REJECTED");
  assert.equal(h.saved.size, 5);
  f.set("grade", "7");
  await h.run(f);
  assert.equal(h.saved.size, 5);
  assert.equal(h.writes(), 2);
});

test("unapproved new stock stays unavailable; explicit approval supports exact-grade full/selected assembly and answer stripping", async () => {
  for (const grade of [6, 7]) {
    const items = extras(grade),
      stock = items.map((p) => p.draft);
    for (const item of items)
      for (const status of ["PENDING", "REJECTED"])
        assert.equal(
          approvedEnglishItem(
            JSON.stringify({ status, draft: item.draft }),
            grade,
            2,
          ),
          null,
        );
    for (const random of [() => 0, () => 0.49, () => 0.99]) {
      const result = assembleEnglishItems(
        stock,
        grade,
        random,
        undefined,
        {},
        2,
      );
      assert.ok(result.draft);
      assert.equal(
        validateEnglishOutput(result.draft.selection, result.draft.output)
          .total,
        50,
      );
    }
    assert.equal(
      assembleEnglishItems(
        stock,
        grade === 6 ? 7 : 6,
        () => 0,
        undefined,
        {},
        2,
      ).draft,
      null,
    );
    assert.equal(
      assembleEnglishItems(
        stock,
        grade,
        () => 0,
        undefined,
        { examYear: 2026 },
        2,
      ).draft,
      null,
    );
    const draft = items.find((p) => p.group === "verbs").draft;
    for (const includeAnswers of [true, false]) {
      const result = await findEnglishBankParts(
        { ...draft.selection, includeAnswers },
        async (after, prefix) =>
          prefix === "english-item:v1:"
            ? [
                {
                  key: items[0].key,
                  value: JSON.stringify({ status: "APPROVED", draft }),
                },
              ]
            : [],
      );
      assert.deepEqual(result.missingIds, []);
      assert.ok(
        result.output.tasks[0].subitems.every(
          (s) => Boolean(s.answer) === includeAnswers,
        ),
      );
    }
  }
});

test("all new prompts, tables and suggested keys survive original flow/print views without whole-answer leaks", () => {
  for (const grade of [6, 7])
    for (const model of models(grade)) {
      const p = englishLegacyPaper(model.draft),
        blocks = p.items.flatMap(englishFlowBlocks),
        before = JSON.stringify(model);
      const render = (questions, answers) =>
        normalize(
          blocks
            .map((q) =>
              renderToStaticMarkup(
                React.createElement(Group, {
                  q,
                  s: p.settings,
                  questions,
                  answers,
                }),
              ),
            )
            .join(""),
        );
      const questions = render(true, false),
        answers = render(false, true);
      for (const t of model.draft.output.tasks) {
        if (t.table)
          for (const cell of t.table.rows.flat())
            assert.ok(questions.includes(cell), model.id + " lost cell");
        for (const key of t.subitems
          .map((s) => s.answer)
          .concat(t.answer || []))
          assert.ok(answers.includes(key), model.id + " lost key");
        if (t.answer)
          assert.ok(!questions.includes(t.answer), model.id + " leaked key");
        if (t.instruction.includes("\n"))
          assert.ok(
            questions.includes(t.instruction.split("\n").slice(1).join("\n")),
            model.id + " lost passage",
          );
      }
      assert.doesNotMatch(questions, /Fill gap \([a-j]\)/);
      assert.equal(JSON.stringify(model), before);
    }
});

test("all junior/SSC/HSC paper-two admin catalog subjects and review links actually reach the correct item workflow", () => {
  const scope = require("../lib/english/admin-scope.ts");
  for (const subject of [
    "English 2nd Paper",
    "English Grammar and Composition",
  ])
    assert.equal(scope.englishAdminPaperForSubject(subject), 2);
  for (const subject of [
    "English 1st Paper",
    "English 1st Paper (English For Today)",
    "English For Today",
  ])
    assert.equal(scope.englishAdminPaperForSubject(subject), 1);
  for (const subject of ["বাংলা", "Physics", "English Literature", ""])
    assert.equal(scope.englishAdminPaperForSubject(subject), null);
  for (const grade of [6, 7, 8, 9, 10, 11, 12]) {
    const link = new URL(
      scope.englishAdminHref(grade, true, 2),
      "https://example.com",
    );
    assert.equal(
      scope.englishAdminPaperForSubject(link.searchParams.get("subject")),
      2,
    );
    assert.ok(
      scope
        .englishCategoryGrades(link.searchParams.get("category"))
        .includes(grade),
    );
    assert.equal(link.searchParams.get("grade"), String(grade));
    if (grade <= 8)
      assert.equal(link.searchParams.get("subject"), "English 2nd Paper");
  }
  const page = fs.readFileSync("app/admin/questions/import/page.tsx", "utf8"),
    picker = fs.readFileSync(
      "app/admin/questions/import/prepared-library.tsx",
      "utf8",
    ),
    review = fs.readFileSync("app/admin/questions/page.tsx", "utf8");
  assert.match(page, /englishFirstGrades\.map\(grade=>\[.*?paper=\{2\}/);
  assert.match(picker, /englishAdminPaperForSubject\(subject\)/);
  assert.match(
    review,
    /englishAdminPaperForSubject\(subject\) === 2 && englishCategoryGrades\(category\)/,
  );
  assert.doesNotMatch(picker, /grades.some\(g=>g===9\|\|g===10\)/);
});
