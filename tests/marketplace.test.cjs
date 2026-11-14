const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const Module = require("node:module");
function load(path, mocks = {}) {
  const m = new Module(path, module);
  m.paths = module.paths;
  m.require = (name) =>
    mocks[name] ||
    (name === "@/lib/marketplace-raster"
      ? load("lib/marketplace-raster.ts")
      : require(name));
  m._compile(
    ts.transpileModule(fs.readFileSync(path, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    path,
  );
  return m.exports;
}
const examTypes = load("lib/marketplace-exam-types.ts");
const lib = load("lib/marketplace.ts", {
  "@/lib/marketplace-exam-types": examTypes,
});
const header = load("lib/paper-header.ts");
const builder = load("lib/paper-builder.ts", {
  "@/lib/paper-header": header,
  "@/lib/paper-math": require("./helpers/paper-math.cjs"),
});
const preview = load("lib/marketplace-preview.ts", {
  "@/lib/paper-builder": builder,
  "@/lib/paper-sections": load("lib/paper-sections.ts"),
});
const meta = {
  examType: "বার্ষিক পরীক্ষা",
  title: "বাংলা পরীক্ষা",
  grade: "9",
  subject: "বাংলা",
  chapters: ["গদ্য"],
  description: "নবম শ্রেণির মূল্যায়ন প্রশ্নপত্র",
  pricePaisa: 1999,
  rights: true,
};
test("market metadata restricts grade, price, chapters and rights", () => {
  assert.ok(lib.marketMetadataSchema.safeParse(meta).success);
  for (const patch of [
    { grade: "13" },
    { pricePaisa: 0 },
    { pricePaisa: 100.5 },
    { pricePaisa: 5000001 },
    { rights: false },
    { chapters: [] },
    { title: "" },
  ])
    assert.equal(
      lib.marketMetadataSchema.safeParse({ ...meta, ...patch }).success,
      false,
    );
  assert.equal(lib.marketPricePaisa("19.99"), 1999);
  assert.ok(Number.isNaN(lib.marketPricePaisa("1e3")));
});
test("only owner-prefixed database saves can be submitted, not purchased or uploaded papers", () => {
  const row = JSON.stringify({ ownerId: "u", ids: ["q", "q"], settings: {} });
  assert.deepEqual(lib.databasePaperOwner(row, "qbpaper:u:a", "u").ids, ["q"]);
  for (const key of ["qbpaper:v:a", "readyowned:v1:u:a", "market:purchase:u:a"])
    assert.throws(() => lib.databasePaperOwner(row, key, "u"));
  assert.throws(() =>
    lib.databasePaperOwner(
      JSON.stringify({ ownerId: "v", ids: ["q"] }),
      "qbpaper:u:a",
      "u",
    ),
  );
});
test("snapshot checksum and revision reject tampering and stale/repeated review", () => {
  const snapshot = { settings: {}, questions: [{ id: "q", text: "প্রশ্ন" }] };
  const r = {
    version: 1,
    status: "PENDING",
    revision: 1,
    snapshot,
    snapshotHash: lib.snapshotHash(snapshot),
  };
  lib.assertReviewable(r, 1);
  assert.throws(() => lib.assertReviewable(r, 2));
  assert.throws(() => lib.assertReviewable({ ...r, status: "APPROVED" }, 1));
  assert.throws(() =>
    lib.assertReviewable({ ...r, snapshot: { ...snapshot, questions: [] } }, 1),
  );
  assert.equal(
    lib.marketSubmissionId("u", "a"),
    lib.marketSubmissionId("u", "a"),
  );
  assert.notEqual(
    lib.marketSubmissionId("u", "a"),
    lib.marketSubmissionId("v", "a"),
  );
});
function setup() {
  const store = new Map([
    [
      "qbpaper:u:a",
      JSON.stringify({
        ownerId: "u",
        ids: ["q"],
        settings: { info: { inst: "স্কুল" } },
      }),
    ],
  ]);
  let session = "u",
    paid = true;
  const users = {
    u: { id: "u", role: "TEACHER" },
    a: { id: "a", role: "ADMIN" },
    v: { id: "v", role: "TEACHER" },
  };
  const tx = {
    user: { findUnique: async ({ where }) => users[where.id] },
    setting: {
      findUnique: async ({ where }) =>
        store.has(where.key)
          ? { key: where.key, value: store.get(where.key) }
          : null,
      create: async ({ data }) => {
        if (store.has(data.key)) throw Error("duplicate");
        store.set(data.key, data.value);
      },
      update: async ({ where, data }) => {
        store.set(where.key, data.value);
      },
    },
    question: {
      findMany: async () => [
        { id: "q", text: "original", options: {}, correct: "A" },
      ],
    },
  };
  let transactionHook = () => {};
  let queue = Promise.resolve();
  const actions = load("app/actions/marketplace.ts", {
    "@/auth": { auth: async () => (session ? { user: users[session] } : null) },
    "@/lib/db": { db: tx },
    "@/lib/marketplace": lib,
    "@/lib/marketplace-preview": preview,
    "@/lib/paper-builder": builder,
    "@/lib/paper-generation": { visibleQuestions: () => ({}) },
    "next/cache": { revalidatePath() {} },
    "@/lib/wallet": {
      requirePaidQuestions: async () => {
        if (!paid) throw Error("unpaid");
      },
      walletTransaction: (fn) => {
        const run = queue.then(async () => {
          transactionHook();
          const before = new Map(store);
          try {
            return await fn(tx);
          } catch (e) {
            store.clear();
            for (const [k, v] of before) store.set(k, v);
            throw e;
          }
        });
        queue = run.catch(() => {});
        return run;
      },
    },
  });
  const form = () => {
    const f = new FormData();
    for (const [k, v] of Object.entries({
      sourceKey: "qbpaper:u:a",
      examType: meta.examType,
      title: meta.title,
      grade: "9",
      subject: meta.subject,
      chapters: "গদ্য",
      description: meta.description,
      price: "19.99",
      rights: "on",
    }))
      f.set(k, v);
    return f;
  };
  return {
    actions,
    store,
    form,
    session: (v) => (session = v),
    paid: (v) => (paid = v),
    role: (id, role) => {
      users[id].role = role;
    },
    beforeTransaction: (hook) => {
      transactionHook = hook;
    },
  };
}
test("submission snapshots server questions, blocks duplicate, isolates from original changes", async () => {
  const x = setup();
  const outcomes = await Promise.all([
    x.actions.submitMarketPaper({}, x.form()),
    x.actions.submitMarketPaper({}, x.form()),
  ]);
  assert.equal(outcomes.filter((r) => r.ok).length, 1);
  const key = lib.MARKET_PREFIX + lib.marketSubmissionId("u", "qbpaper:u:a");
  const r = JSON.parse(x.store.get(key));
  assert.equal(r.snapshot.questions[0].text, "original");
  assert.equal(r.metadata.pricePaisa, 1999);
  x.store.set("qbpaper:u:a", "changed");
  assert.equal(
    JSON.parse(x.store.get(key)).snapshot.questions[0].text,
    "original",
  );
});
test("unauthenticated, foreign and unpaid submissions fail without snapshot", async () => {
  for (const mode of ["loggedout", "foreign", "unpaid"]) {
    const x = setup();
    if (mode === "loggedout") x.session(null);
    if (mode === "foreign") x.session("v");
    if (mode === "unpaid") x.paid(false);
    assert.equal((await x.actions.submitMarketPaper({}, x.form())).ok, false);
    assert.equal(
      [...x.store.keys()].filter((k) => k.startsWith(lib.MARKET_PREFIX)).length,
      0,
    );
  }
});
test("fresh admin moderation requires reviewed flag and current revision; changes allow resubmission", async () => {
  const x = setup();
  await x.actions.submitMarketPaper({}, x.form());
  const id = lib.marketSubmissionId("u", "qbpaper:u:a");
  const f = new FormData();
  for (const [k, v] of Object.entries({
    id,
    revision: "1",
    decision: "CHANGES",
    note: "সংশোধন প্রয়োজন",
    reviewed: "on",
  }))
    f.set(k, v);
  assert.equal((await x.actions.reviewMarketPaper({}, f)).ok, false);
  x.session("a");
  f.delete("reviewed");
  assert.equal((await x.actions.reviewMarketPaper({}, f)).ok, false);
  f.set("reviewed", "on");
  assert.equal((await x.actions.reviewMarketPaper({}, f)).ok, true);
  assert.equal((await x.actions.reviewMarketPaper({}, f)).ok, false);
  x.session("u");
  assert.equal((await x.actions.submitMarketPaper({}, x.form())).ok, true);
  const r = JSON.parse(x.store.get(lib.MARKET_PREFIX + id));
  assert.equal(r.revision, 2);
  assert.equal(r.status, "PENDING");
});
test("approved application cannot be silently replaced and no money is moved", async () => {
  const x = setup();
  await x.actions.submitMarketPaper({}, x.form());
  x.session("a");
  const id = lib.marketSubmissionId("u", "qbpaper:u:a");
  const f = new FormData();
  for (const [k, v] of Object.entries({
    id,
    revision: "1",
    decision: "APPROVED",
    note: "",
    reviewed: "on",
  }))
    f.set(k, v);
  assert.equal((await x.actions.reviewMarketPaper({}, f)).ok, true);
  x.session("u");
  assert.equal((await x.actions.submitMarketPaper({}, x.form())).ok, false);
  assert.equal(
    JSON.parse(x.store.get(lib.MARKET_PREFIX + id)).status,
    "APPROVED",
  );
  assert.equal(
    [...x.store.keys()].filter((k) => k.startsWith("wallet:")).length,
    0,
  );
});

test("four shared exam types are required for new submissions, legacy labels remain honest", async () => {
  assert.deepEqual(examTypes.MARKET_EXAM_TYPES, [
    "অর্ধ বার্ষিক পরীক্ষা",
    "বার্ষিক পরীক্ষা",
    "নির্বাচনী পরীক্ষা",
    "অধ্যায় ভিত্তিক পরীক্ষা",
  ]);
  for (const examType of examTypes.MARKET_EXAM_TYPES) {
    assert.ok(
      lib.marketMetadataSchema.safeParse({ ...meta, examType }).success,
    );
    assert.equal(examTypes.marketExamLabel(examType), examType);
  }
  for (const examType of [undefined, "", "Other"])
    assert.equal(
      lib.marketMetadataSchema.safeParse({ ...meta, examType }).success,
      false,
    );
  assert.equal(
    examTypes.marketExamLabel(undefined),
    "পরীক্ষার ধরন উল্লেখ করা হয়নি",
  );
  const x = setup();
  const f = x.form();
  f.delete("examType");
  assert.equal((await x.actions.submitMarketPaper({}, f)).ok, false);
  f.set("examType", "নির্বাচনী পরীক্ষা");
  assert.equal((await x.actions.submitMarketPaper({}, f)).ok, true);
  const record = JSON.parse(
    x.store.get(lib.MARKET_PREFIX + lib.marketSubmissionId("u", "qbpaper:u:a")),
  );
  assert.equal(record.metadata.examType, "নির্বাচনী পরীক্ষা");
  for (const path of [
    "app/dashboard/sell/page.tsx",
    "app/admin/marketplace/page.tsx",
  ])
    assert.match(
      fs.readFileSync(path, "utf8"),
      /marketExamLabel\(r.metadata.examType\)/,
    );
});

test("admin cannot approve an empty visible paper but can request corrections", async () => {
  const x = setup();
  await x.actions.submitMarketPaper({}, x.form());
  const id = lib.marketSubmissionId("u", "qbpaper:u:a"),
    key = lib.MARKET_PREFIX + id;
  const r = JSON.parse(x.store.get(key));
  r.snapshot.settings.excludedIds = ["q"];
  r.snapshotHash = lib.snapshotHash(r.snapshot);
  x.store.set(key, JSON.stringify(r));
  x.session("a");
  const f = new FormData();
  for (const [k, v] of Object.entries({
    id,
    revision: "1",
    decision: "APPROVED",
    note: "",
    reviewed: "on",
  }))
    f.set(k, v);
  assert.equal((await x.actions.reviewMarketPaper({}, f)).ok, false);
  f.set("decision", "CHANGES");
  f.set("note", "সব প্রশ্ন বাদ গেছে; সংশোধন করুন");
  assert.equal((await x.actions.reviewMarketPaper({}, f)).ok, true);
});

test("ADMIN submission publishes immediately with server validation and an audit; teacher remains pending", async () => {
  for (const role of ["ADMIN", "TEACHER", "STUDENT"]) {
    const x = setup();
    x.role("u", role);
    const result = await x.actions.submitMarketPaper({}, x.form());
    assert.equal(result.ok, true);
    const id = lib.marketSubmissionId("u", "qbpaper:u:a");
    const r = JSON.parse(x.store.get(lib.MARKET_PREFIX + id));
    assert.equal(r.status, role === "ADMIN" ? "APPROVED" : "PENDING");
    if (role === "ADMIN") {
      assert.equal(r.review.reviewerId, "u");
      assert.match(r.review.note, /সরাসরি প্রকাশ/);
    } else assert.equal(r.review, undefined);
    assert.equal((await x.actions.submitMarketPaper({}, x.form())).ok, false);
    assert.equal(
      [...x.store.keys()].filter((k) => k.startsWith("wallet:")).length,
      0,
    );
  }
});
test("role removed before transaction cannot auto-publish", async () => {
  const x = setup();
  x.role("u", "ADMIN");
  x.beforeTransaction(() => x.role("u", "TEACHER"));
  assert.equal((await x.actions.submitMarketPaper({}, x.form())).ok, true);
  const id = lib.marketSubmissionId("u", "qbpaper:u:a");
  assert.equal(
    JSON.parse(x.store.get(lib.MARKET_PREFIX + id)).status,
    "PENDING",
  );
});
test("ADMIN can publish an existing own pending paper but teacher cannot self-approve", async () => {
  const x = setup();
  await x.actions.submitMarketPaper({}, x.form());
  const id = lib.marketSubmissionId("u", "qbpaper:u:a");
  const f = new FormData();
  for (const [k, v] of Object.entries({
    id,
    revision: "1",
    decision: "APPROVED",
    reviewed: "on",
  }))
    f.set(k, v);
  assert.equal((await x.actions.reviewMarketPaper({}, f)).ok, false);
  x.role("u", "ADMIN");
  assert.equal((await x.actions.reviewMarketPaper({}, f)).ok, true);
  const r = JSON.parse(x.store.get(lib.MARKET_PREFIX + id));
  assert.equal(r.status, "APPROVED");
  assert.match(r.review.note, /সরাসরি প্রকাশ/);
  assert.equal((await x.actions.reviewMarketPaper({}, f)).ok, false);
});
test("ADMIN auto-publish rejects an unrenderable snapshot", async () => {
  const x = setup();
  x.role("u", "ADMIN");
  x.store.set(
    "qbpaper:u:a",
    JSON.stringify({
      ownerId: "u",
      ids: ["q"],
      settings: { excludedIds: ["q"] },
    }),
  );
  assert.equal((await x.actions.submitMarketPaper({}, x.form())).ok, false);
  assert.equal(
    [...x.store.keys()].filter((k) => k.startsWith(lib.MARKET_PREFIX)).length,
    0,
  );
});

const rasterUrl = `https://test.public.blob.vercel-storage.com/market-ready/${"a".repeat(64)}.png`;
function readyDraft(x, owner = "u", count = 1) {
  const receiptId = "b".repeat(64),
    key = `marketready:v1:${owner}:${receiptId}`;
  x.store.set(
    key,
    JSON.stringify({
      ownerId: owner,
      receiptId,
      count,
      title: "PDF paper",
      pages: { 0: rasterUrl },
    }),
  );
  x.store.set(
    `readyowned:v1:${owner}:${receiptId}`,
    JSON.stringify({ ownerId: owner, id: receiptId }),
  );
  const f = x.form();
  f.set("sourceKey", key);
  return { key, f };
}
test("both uploaded PDF and Ready Library exports use owner draft snapshots, teacher review and unchanged rights gate", async () => {
  const x = setup();
  const { f, key } = readyDraft(x);
  const result = await x.actions.submitMarketPaper({}, f);
  assert.equal(result.ok, true, result.message);
  const id = lib.marketSubmissionId("u", key),
    record = JSON.parse(x.store.get(lib.MARKET_PREFIX + id));
  assert.equal(record.source, "READY_PDF");
  assert.equal(record.status, "PENDING");
  assert.deepEqual(record.snapshot.raster, {
    kind: "READY_RASTER",
    pages: [rasterUrl],
  });
  assert.equal(record.snapshot.questions.length, 0);
  x.store.delete(key);
  assert.equal(record.snapshot.raster.pages[0], rasterUrl);
  const y = setup();
  const draft = readyDraft(y);
  draft.f.delete("rights");
  assert.equal((await y.actions.submitMarketPaper({}, draft.f)).ok, false);
});
test("PDF submission rejects foreign, incomplete and non-application assets", async () => {
  for (const bad of ["foreign", "incomplete", "url", "receipt"]) {
    const x = setup();
    const { key, f } = readyDraft(
      x,
      bad === "foreign" ? "v" : "u",
      bad === "incomplete" ? 2 : 1,
    );
    if (bad === "url") {
      const d = JSON.parse(x.store.get(key));
      d.pages[0] = "https://evil.example/source.pdf";
      x.store.set(key, JSON.stringify(d));
    }
    if (bad === "receipt") x.store.delete(`readyowned:v1:u:${"b".repeat(64)}`);
    assert.equal((await x.actions.submitMarketPaper({}, f)).ok, false, bad);
  }
});
test("ADMIN ready export publishes directly and cannot replace an approved snapshot", async () => {
  const x = setup();
  x.role("u", "ADMIN");
  const { f, key } = readyDraft(x);
  assert.equal((await x.actions.submitMarketPaper({}, f)).ok, true);
  const id = lib.marketSubmissionId("u", key),
    old = x.store.get(lib.MARKET_PREFIX + id);
  assert.equal(JSON.parse(old).status, "APPROVED");
  assert.equal((await x.actions.submitMarketPaper({}, f)).ok, false);
  assert.equal(x.store.get(lib.MARKET_PREFIX + id), old);
});
