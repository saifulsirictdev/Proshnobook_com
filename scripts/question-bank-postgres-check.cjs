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
      ],
    }),
  );
}).catch(() => {
  console.error(
    "Question bank disposable PostgreSQL regression failed; no production database is allowed.",
  );
  process.exitCode = 1;
});
