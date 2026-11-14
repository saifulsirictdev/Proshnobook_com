const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  Module = require("node:module"),
  ts = require("typescript");
const cache = {};
function load(file, mocks = {}) {
  const m = new Module(file, module);
  m.paths = module.paths;
  m.require = (n) =>
    Object.hasOwn(mocks, n)
      ? mocks[n]
      : n === "server-only"
        ? {}
        : n.startsWith("@/lib/")
          ? (cache[n] ??= load(n.replace("@/", "") + ".ts"))
          : require(n);
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
const { snapshotHash } = load("lib/marketplace.ts"),
  { purchaseKey } = load("lib/marketplace-purchase.ts"),
  { settingsSchema } = load("lib/paper-builder.ts"),
  { marketSnapshotItems } = load("lib/marketplace-preview.ts");
test("purchased editor rechecks exact buyer receipt and rejects refund, corruption, missing account and invalid IDs", async () => {
  const id = "a".repeat(64),
    snapshot = {
      settings: settingsSchema.parse({}),
      questions: [
        {
          id: "q",
          text: "Original immutable text",
          correct: "A",
          options: { A: "One", B: "Two" },
        },
      ],
    };
  const receipt = {
    version: 1,
    buyerId: "buyer",
    paperId: id,
    sellerId: "seller",
    title: "Purchased",
    institution: "School",
    snapshot,
    snapshotHash: snapshotHash(snapshot),
    amount: 500,
    sellerAmount: 300,
    platformAmount: 200,
  };
  let session = "buyer",
    exists = true,
    row = JSON.stringify(receipt),
    queries = [];
  const action = load("app/actions/purchased-paper-access.ts", {
    "@/auth": {
      auth: async () => (session ? { user: { id: session } } : null),
    },
    "@/lib/db": {
      db: {
        user: { findUnique: async () => (exists ? { id: session } : null) },
        setting: {
          findUnique: async ({ where }) => {
            queries.push(where.key);
            return row ? { value: row } : null;
          },
        },
      },
    },
  });
  assert.deepEqual(await action.checkPurchasedPaperAccess(id), { ok: true });
  assert.equal(queries[0], purchaseKey("buyer", id));
  session = "other";
  assert.equal((await action.checkPurchasedPaperAccess(id)).ok, false);
  session = "buyer";
  for (const mutation of [
    { refundedAt: new Date().toISOString() },
    { snapshotHash: "bad" },
  ]) {
    row = JSON.stringify({ ...receipt, ...mutation });
    assert.equal((await action.checkPurchasedPaperAccess(id)).ok, false);
  }
  row = JSON.stringify(receipt);
  exists = false;
  assert.equal((await action.checkPurchasedPaperAccess(id)).ok, false);
  exists = true;
  session = "";
  assert.equal((await action.checkPurchasedPaperAccess(id)).ok, false);
  assert.equal((await action.checkPurchasedPaperAccess("bad")).ok, false);
});
test("purchased snapshot conversion retains question order and edits without mutating receipt", () => {
  const snapshot = {
    settings: settingsSchema.parse({ edits: { q: { text: "Seller edit" } } }),
    questions: [
      { id: "q", text: "Original", correct: "A", options: { A: "One" } },
    ],
  };
  const before = JSON.stringify(snapshot),
    items = marketSnapshotItems(snapshot);
  assert.equal(items[0].text, "Seller edit");
  assert.equal(items[0].id, "q");
  items[0].text = "Buyer edit";
  assert.equal(JSON.stringify(snapshot), before);
});
test("purchased setup uses private receipt, skips bank checkout and does not save into sellable bank drafts", () => {
  const setup = fs.readFileSync(
      "app/dashboard/library/[id]/setup/page.tsx",
      "utf8",
    ),
    builder = fs.readFileSync("components/qb-builder.tsx", "utf8");
  assert.match(setup, /validatePurchase\(row.value, buyerId, id\)/);
  assert.match(setup, /<QbBuilder/);
  assert.doesNotMatch(setup, /PaidBuilderGate|QbSavePaper/);
  assert.match(builder, /!purchased && <WalletCheckout/);
  assert.match(builder, /checkPurchasedPaperAccess\(purchased.id\)/);
  assert.match(
    builder,
    /if \(!purchased\)\s*localStorage.setItem\("qb:settings"/,
  );
});
