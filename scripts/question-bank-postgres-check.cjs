/** Full-schema integration: explicitly opted-in disposable local PostgreSQL only. */
const fs = require("node:fs"),
  path = require("node:path"),
  Module = require("node:module");
const ts = require("typescript"),
  assert = require("node:assert/strict");
const {
  withDisposableWalletDatabase,
} = require("./helpers/disposable-wallet-db.cjs");
withDisposableWalletDatabase(async (db) => {
  const cache = {};
  function load(file) {
    file = path.resolve(file);
    if (cache[file]) return cache[file];
    const m = new Module(file, module);
    m.paths = module.paths;
    m.require = (id) =>
      id === "server-only"
        ? {}
        : id === "@/lib/db"
          ? { db }
          : id.startsWith("@/")
            ? load(id.slice(2) + ".ts")
            : id.startsWith("./")
              ? load(path.resolve(path.dirname(file), id) + ".ts")
              : require(id);
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
    return (cache[file] = m.exports);
  }
  const bank = load("lib/admin-question-bank.ts"),
    schema = load("lib/admin-question-bank-schema.ts");
  const draft = {
    category: "Class 6",
    subject: "গণিত",
    topic: "সংখ্যা",
    type: "MCQ",
    text: "২ + ২ কত?",
    options: { A: "৪", B: "৩", C: "৫", D: "৬" },
    correct: "A",
    explanation: "২ ও ২ যোগ করলে ৪ হয়।",
    lang: "Bangla",
    difficulty: "EASY",
  };
  const duplicates = await Promise.allSettled(
    [1, 2].map(() =>
      bank.mutateBank("synthetic-admin", { operation: "create", draft }),
    ),
  );
  assert.equal(
    duplicates.filter((r) => r.status === "fulfilled").length,
    1,
    "serializable duplicate protection",
  );
  assert.equal(await db.question.count(), 1);
  let row = bank.bankRow(await db.question.findFirstOrThrow());
  const stale = row.revision;
  row = await bank.mutateBank("synthetic-admin", {
    operation: "approve",
    id: row.id,
    revision: row.revision,
  });
  assert.equal(row.approved, true);
  await assert.rejects(
    bank.mutateBank("synthetic-admin", {
      operation: "edit",
      id: row.id,
      revision: stale,
      draft,
    }),
  );
  row = await bank.mutateBank("synthetic-admin", {
    operation: "edit",
    id: row.id,
    revision: row.revision,
    draft: { ...draft, text: "সংশোধিত প্রশ্ন" },
  });
  assert.equal(row.approved, false);
  const edits = await Promise.allSettled(
    ["প্রথম সম্পাদক", "দ্বিতীয় সম্পাদক"].map((text) =>
      bank.mutateBank(text, {
        operation: "edit",
        id: row.id,
        revision: row.revision,
        draft: { ...draft, text },
      }),
    ),
  );
  assert.equal(
    edits.filter((r) => r.status === "fulfilled").length,
    1,
    "one writer per revision",
  );
  row = bank.bankRow(
    await db.question.findUniqueOrThrow({ where: { id: row.id } }),
  );
  row = await bank.mutateBank("synthetic-admin", {
    operation: "trash",
    id: row.id,
    revision: row.revision,
  });
  assert.equal(
    (await bank.loadBank(schema.bankFiltersSchema.parse({}))).total,
    0,
  );
  assert.equal(
    (await bank.loadBank(schema.bankFiltersSchema.parse({ status: "trash" })))
      .total,
    1,
  );
  assert.equal(
    await db.question.count(),
    1,
    "Trash never destroys canonical ID",
  );
  await assert.rejects(
    bank.mutateBank("synthetic-admin", {
      operation: "approve",
      id: row.id,
      revision: row.revision,
    }),
  );
  row = await bank.mutateBank("synthetic-admin", {
    operation: "restore",
    id: row.id,
    revision: row.revision,
  });
  assert.equal(row.approved, false);
  assert.equal(row.source, "ADMIN_MANUAL");
  assert.equal(
    await db.setting.count({
      where: { key: { startsWith: schema.BANK_AUDIT_PREFIX } },
    }),
    6,
  );
  assert.equal(
    await db.setting.count({
      where: { key: { startsWith: schema.BANK_TRASH_PREFIX } },
    }),
    0,
  );
  const recovery = load("lib/question-bank-recovery.ts");
  const questionCountBeforeRecovery = await db.question.count();
  const incomplete = {
    ...draft,
    text: "অসম্পূর্ণ recovery",
    options: { A: "", B: "", C: "", D: "" },
    explanation: "",
  };
  const cmd = {
    operation: "save",
    slot: "new",
    expectedRevision: null,
    baseRevision: null,
    draft: incomplete,
  };
  const recoveryWriters = await Promise.allSettled(
    [1, 2].map(() => recovery.mutateQuestionRecovery("recovery-owner", cmd)),
  );
  assert.equal(
    recoveryWriters.filter((r) => r.status === "fulfilled").length,
    1,
  );
  const recovered = await recovery.loadQuestionRecovery(
    "recovery-owner",
    "new",
  );
  assert.equal(recovered.draft.text, incomplete.text);
  assert.equal(await recovery.loadQuestionRecovery("other-owner", "new"), null);
  const updates = await Promise.allSettled(
    ["প্রথম", "দ্বিতীয়"].map((text) =>
      recovery.mutateQuestionRecovery("recovery-owner", {
        ...cmd,
        expectedRevision: recovered.revision,
        draft: { ...incomplete, text },
      }),
    ),
  );
  assert.equal(updates.filter((r) => r.status === "fulfilled").length, 1);
  await assert.rejects(
    recovery.mutateQuestionRecovery("recovery-owner", {
      operation: "discard",
      slot: "new",
      expectedRevision: recovered.revision,
    }),
  );
  const latest = await recovery.loadQuestionRecovery("recovery-owner", "new");
  await recovery.mutateQuestionRecovery("recovery-owner", {
    operation: "discard",
    slot: "new",
    expectedRevision: latest.revision,
  });
  assert.equal(
    await recovery.loadQuestionRecovery("recovery-owner", "new"),
    null,
  );
  assert.equal(await db.question.count(), questionCountBeforeRecovery);
  // Aliases affect reads/counts/export only: do not relabel saved records.
  const readTopic = "Synthetic read chapter",
    otherTopic = "Synthetic other chapter";
  const readRows = [
    ["nine", "Class 9", "English 1st Paper", readTopic, true, false],
    ["ten", "Class 10", "english for today", readTopic, false, false],
    ["ssc", "SSC", "English First Paper", otherTopic, true, false],
    ["paper2", "Class 9", "English 2nd Paper", readTopic, true, false],
    ["hsc", "Class 11-12", "English For Today", readTopic, true, false],
    ["twelve", "Class 12", "English 1st Paper", readTopic, false, false],
    ["trash", "Class 9", "English 1st Paper", readTopic, false, true],
  ];
  await db.question.createMany({
    data: readRows.map(
      ([key, category, subject, topic, approved, trashed]) => ({
        id: "synthetic-read-" + key,
        category,
        subject,
        topic,
        approved,
        source: trashed ? "ADMIN_TRASH:v1:synthetic" : "ADMIN_MANUAL",
        text: "Synthetic read filter " + key,
        options: {},
        correct: "",
        explanation: "Synthetic answer",
        difficulty: "EASY",
        lang: "English",
      }),
    ),
  });
  const filtered = await bank.loadBank(
    schema.bankFiltersSchema.parse({
      category: "SSC",
      subject: "English For Today",
      topic: readTopic,
    }),
  );
  assert.equal(filtered.total, 2);
  assert.deepEqual(filtered.counts, { approved: 1, pending: 1, trash: 1 });
  assert.equal(
    (
      await bank.loadBank(
        schema.bankFiltersSchema.parse({
          category: "Class 9",
          subject: "English For Today",
          topic: readTopic,
        }),
      )
    ).total,
    1,
  );
  assert.equal(
    (
      await bank.loadBank(
        schema.bankFiltersSchema.parse({
          category: "SSC",
          subject: "English For Today",
          topic: otherTopic,
        }),
      )
    ).total,
    1,
  );
  assert.equal(
    (
      await bank.loadBank(
        schema.bankFiltersSchema.parse({
          category: "SSC",
          subject: "English Grammar and Composition",
          topic: readTopic,
        }),
      )
    ).total,
    1,
  );
  assert.equal(
    (
      await bank.loadBank(
        schema.bankFiltersSchema.parse({
          category: "HSC",
          subject: "English For Today",
          topic: readTopic,
        }),
      )
    ).total,
    2,
  );
  assert.equal(
    (await db.question.findUnique({ where: { id: "synthetic-read-nine" } }))
      .category,
    "Class 9",
  );
  console.log(
    JSON.stringify({
      status: "PASS",
      scope: "disposable PostgreSQL; synthetic questions only",
      checks: [
        "concurrent duplicate protection",
        "optimistic edit/review",
        "concurrent editors",
        "Trash exclusion",
        "Restore Pending",
        "atomic audit snapshots",
        "private incomplete draft CAS, concurrent writers, stale delete and no Question writes",
      ],
    }),
  );
}).catch(() => {
  console.error(
    "Question bank disposable PostgreSQL regression failed; no production database is allowed.",
  );
  process.exitCode = 1;
});
