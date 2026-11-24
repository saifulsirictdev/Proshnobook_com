const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  ts = require("typescript"),
  Module = require("node:module");
const cache = {};
function load(file, mocks = {}) {
  const m = new Module(file, module);
  m.paths = module.paths;
  m.require = (n) =>
    n === "./auto-model-syllabus-schema" ? require("./helpers/auto-model-syllabus-schema.cjs") :
    Object.hasOwn(mocks, n)
      ? mocks[n]
      : n === "server-only"
        ? {}
        : n === "@/lib/wallet"
          ? { teacherTid: () => "TID" }
          : n.startsWith("@/lib/")
            ? (cache[n] ??= load(n.replace("@/", "") + ".ts"))
            : (require("./helpers/paper-editing.cjs").dependencies[n] || require(n));
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
const market = load("lib/marketplace.ts"),
  { settingsSchema } = load("lib/paper-builder.ts"),
  { publicMarketPaper } = load("lib/marketplace-catalog.ts"),
  { saleRecord } = load("lib/marketplace-purchase.ts");
function setup() {
  const id = "a".repeat(64),
    snapshot = {
      settings: settingsSchema.parse({}),
      questions: [
        {
          id: "q",
          text: "original question text",
          correct: "A",
          options: { A: "one", B: "two" },
        },
      ],
    };
  const r = {
    version: 1,
    id,
    ownerId: "seller",
    sourceKey: "qbpaper:seller:1",
    source: "DATABASE",
    status: "APPROVED",
    revision: 1,
    metadata: {
      examType: "বার্ষিক পরীক্ষা",
      title: "Original title",
      grade: "9",
      subject: "বাংলা",
      chapters: ["গদ্য"],
      description: "Original description",
      pricePaisa: 500,
      rights: true,
    },
    snapshot,
    snapshotHash: market.snapshotHash(snapshot),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const key = market.MARKET_PREFIX + id,
    store = new Map([
      [key, JSON.stringify(r)],
      ["purchase-untouched", "immutable-receipt"],
    ]);
  let role = "ADMIN",
    session = "admin",
    fail = false;
  const tx = {
    user: { findUnique: async () => ({ role }) },
    setting: {
      findUnique: async ({ where }) =>
        store.has(where.key)
          ? { key: where.key, value: store.get(where.key) }
          : null,
      create: async ({ data }) => store.set(data.key, data.value),
      update: async ({ where, data }) => {
        if (fail) throw Error("db");
        store.set(where.key, data.value);
      },
    },
  };
  const actions = load("app/actions/admin-catalog.ts", {
    "@/auth": {
      auth: async () => (session ? { user: { id: session } } : null),
    },
    "@/lib/wallet": {
      walletTransaction: async (fn) => {
        const before = new Map(store);
        try {
          return await fn(tx);
        } catch (e) {
          store.clear();
          for (const [k, v] of before) store.set(k, v);
          throw e;
        }
      },
    },
    "next/cache": { revalidatePath() {} },
  });
  const form = (op, rev = JSON.parse(store.get(key)).revision) => {
    const f = new FormData();
    for (const [k, v] of Object.entries({
      id,
      operation: op,
      revision: String(rev),
      confirmed: "on",
    }))
      f.set(k, v);
    return f;
  };
  return {
    id,
    key,
    store,
    form,
    actions,
    role: (v) => (role = v),
    session: (v) => (session = v),
    fail: () => (fail = true),
  };
}
test("catalog hide/re-publish/delete control new sales only, retain snapshot and receipt with audit", async () => {
  const x = setup(),
    raw = x.store.get(x.key),
    hash = JSON.parse(raw).snapshotHash;
  assert.equal((await x.actions.manageCatalog({}, x.form("HIDE"))).ok, true);
  assert.equal(publicMarketPaper(x.store.get(x.key)), null);
  assert.throws(() => saleRecord(x.store.get(x.key), x.id));
  assert.equal((await x.actions.manageCatalog({}, x.form("PUBLISH"))).ok, true);
  assert.ok(publicMarketPaper(x.store.get(x.key)));
  assert.equal((await x.actions.manageCatalog({}, x.form("DELETE"))).ok, true);
  assert.equal(JSON.parse(x.store.get(x.key)).status, "DELETED");
  assert.equal(publicMarketPaper(x.store.get(x.key)), null);
  assert.equal(
    (await x.actions.manageCatalog({}, x.form("PUBLISH"))).ok,
    false,
  );
  assert.equal(JSON.parse(x.store.get(x.key)).snapshotHash, hash);
  assert.equal(x.store.get("purchase-untouched"), "immutable-receipt");
  assert.equal(
    [...x.store.keys()].filter((k) => k.startsWith("market:catalog-audit:"))
      .length,
    3,
  );
});
test("catalog metadata edit preserves snapshot, stale checkout terms change and stale admin request fails", async () => {
  const x = setup(),
    old = JSON.parse(x.store.get(x.key));
  const f = x.form("EDIT");
  for (const [k, v] of Object.entries({
    title: "New title",
    grade: "10",
    subject: "বাংলা",
    examType: "বার্ষিক পরীক্ষা",
    description: "Changed catalog description",
    chapters: "গদ্য,পদ্য",
    price: "7.50",
  }))
    f.set(k, v);
  assert.equal((await x.actions.manageCatalog({}, f)).ok, true);
  const r = JSON.parse(x.store.get(x.key));
  assert.equal(r.metadata.pricePaisa, 750);
  assert.equal(r.snapshotHash, old.snapshotHash);
  assert.deepEqual(r.snapshot, old.snapshot);
  assert.equal(r.revision, 2);
  assert.equal(
    (await x.actions.manageCatalog({}, x.form("HIDE", 1))).ok,
    false,
  );
});
test("catalog controls deny non-admin, pending teacher bypass, missing consent and roll back failed mutations", async () => {
  const x = setup();
  x.role("TEACHER");
  assert.equal((await x.actions.manageCatalog({}, x.form("DELETE"))).ok, false);
  x.role("ADMIN");
  let f = x.form("HIDE");
  f.delete("confirmed");
  assert.equal((await x.actions.manageCatalog({}, f)).ok, false);
  const original = x.store.get(x.key);
  x.store.set(
    x.key,
    JSON.stringify({ ...JSON.parse(original), status: "PENDING" }),
  );
  assert.equal(
    (await x.actions.manageCatalog({}, x.form("PUBLISH"))).ok,
    false,
  );
  x.store.set(x.key, original);
  x.fail();
  assert.equal((await x.actions.manageCatalog({}, x.form("HIDE"))).ok, false);
  assert.equal(x.store.get(x.key), original);
  assert.equal(x.store.size, 2);
});
