const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  Module = require("node:module"),
  ts = require("typescript"),
  sharp = require("sharp");
function load(file, mocks = {}) {
  const m = new Module(file, module);
  m.paths = module.paths;
  m.require = (n) =>
    mocks[n] ||
    (n.startsWith("@/lib/")
      ? load(n.replace("@/", "") + ".ts")
      : n.startsWith("./")
        ? load(
            require("node:path").join(require("node:path").dirname(file), n) +
              ".ts",
          )
        : require(n));
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
const raster = load("lib/marketplace-raster.ts");
function setup() {
  let session = "u",
    queue = Promise.resolve(),
    puts = [];
  const store = new Map();
  const id = "a".repeat(64);
  const receipt = {
    id,
    ownerId: "u",
    title: "My PDF",
    selected: [1],
    snapshot: {
      edits: {},
      header: { school: "", exam: "", subject: "", time: "", marks: "" },
      headerStyle: "none",
      headerSettings: {},
      headerLine: false,
      headerGap: 2,
    },
  };
  store.set(`readyowned:v1:u:${id}`, JSON.stringify(receipt));
  const tx = {
    setting: {
      findUnique: async ({ where }) =>
        store.has(where.key)
          ? { key: where.key, value: store.get(where.key) }
          : null,
      upsert: async ({ where, create, update }) =>
        store.set(
          where.key,
          store.has(where.key) ? update.value : create.value,
        ),
      update: async ({ where, data }) => {
        if (!store.has(where.key)) throw Error();
        store.set(where.key, data.value);
      },
    },
    user: {
      findUnique: async ({ where }) =>
        ["u", "v"].includes(where.id) ? { id: where.id } : null,
    },
  };
  const actions = load("app/actions/marketplace-ready.ts", {
    "@/auth": {
      auth: async () => (session ? { user: { id: session } } : null),
    },
    "@/lib/db": { db: tx },
    "next/cache": { revalidatePath() {} },
    "@/lib/wallet": {
      walletTransaction: (fn) => {
        const run = queue.then(() => fn(tx));
        queue = run.catch(() => {});
        return run;
      },
    },
    "@vercel/blob": {
      put: async (path, bytes, options) => {
        puts.push({ path, bytes, options });
        return { url: `https://test.public.blob.vercel-storage.com/${path}` };
      },
    },
  });
  return {
    actions,
    store,
    id,
    puts,
    setSession: (v) => (session = v),
    receipt,
  };
}
async function pageForm(x, batch, bytes) {
  const f = new FormData();
  f.set("receiptId", x.id);
  f.set("hash", batch.hash);
  f.set("batchId", batch.batchId);
  f.set("index", "0");
  f.set("page", new Blob([bytes], { type: "image/png" }), "p.png");
  return f;
}
test("raster allowlist rejects PDF, arbitrary hosts, credentials, query strings and invalid shapes", () => {
  const url = `https://test.public.blob.vercel-storage.com/market-ready/${"a".repeat(64)}.png`;
  assert.ok(
    raster.marketRasterSchema.safeParse({ kind: "READY_RASTER", pages: [url] })
      .success,
  );
  for (const pages of [
    [],
    Array(11).fill(url),
    ["https://evil.example/test.png"],
    [url + "?x=1"],
    [url.replace(".png", ".pdf")],
  ])
    assert.equal(
      raster.marketRasterSchema.safeParse({ kind: "READY_RASTER", pages })
        .success,
      false,
    );
  assert.throws(() =>
    raster.rasterSnapshot({ raster: { kind: "READY_RASTER", pages: [] } }),
  );
  assert.equal(raster.rasterSnapshot({ questions: [] }), null);
});
test("owner exports normalized PNG only, bounded slots cannot be replayed, no original PDF in draft", async () => {
  const x = setup(),
    batch = await x.actions.beginReadyMarketExport(x.id);
  assert.equal(batch.ok, true);
  const bytes = await sharp({
    create: { width: 600, height: 850, channels: 3, background: "white" },
  })
    .png()
    .toBuffer();
  const f = await pageForm(x, batch, bytes);
  assert.equal((await x.actions.uploadReadyMarketPage(f)).ok, true);
  assert.equal((await x.actions.uploadReadyMarketPage(f)).ok, false);
  assert.equal(x.puts.length, 1);
  const meta = await sharp(x.puts[0].bytes).metadata();
  assert.equal(meta.format, "png");
  assert.equal(meta.exif, undefined);
  const d = JSON.parse(x.store.get(`marketready:v1:u:${x.id}`));
  assert.ok(
    raster.marketRasterSchema.safeParse({
      kind: "READY_RASTER",
      pages: [d.pages[0]],
    }).success,
  );
  assert.equal("snapshot" in d, false);
  assert.equal("sourceUrl" in d, false);
});
test("foreign owners, invalid bytes, changed snapshots and superseded batches fail before blob write", async () => {
  const bytes = await sharp({
    create: { width: 600, height: 850, channels: 3, background: "white" },
  })
    .png()
    .toBuffer();
  const x = setup();
  x.setSession("v");
  assert.equal((await x.actions.beginReadyMarketExport(x.id)).ok, false);
  x.setSession(null);
  assert.equal((await x.actions.beginReadyMarketExport(x.id)).ok, false);
  x.setSession("u");
  const first = await x.actions.beginReadyMarketExport(x.id),
    second = await x.actions.beginReadyMarketExport(x.id);
  assert.notEqual(first.batchId, second.batchId);
  assert.equal(
    (await x.actions.uploadReadyMarketPage(await pageForm(x, first, bytes))).ok,
    false,
  );
  assert.equal(
    (
      await x.actions.uploadReadyMarketPage(
        await pageForm(x, second, Buffer.from("%PDF-not-image")),
      )
    ).ok,
    false,
  );
  x.receipt.snapshot.header.school = "Changed";
  x.store.set(`readyowned:v1:u:${x.id}`, JSON.stringify(x.receipt));
  assert.equal(
    (await x.actions.uploadReadyMarketPage(await pageForm(x, second, bytes)))
      .ok,
    false,
  );
  assert.equal(x.puts.length, 0);
});
test("daily owner export limit caps storage reservations", async () => {
  const x = setup();
  for (let i = 0; i < 20; i++)
    assert.equal((await x.actions.beginReadyMarketExport(x.id)).ok, true);
  assert.equal((await x.actions.beginReadyMarketExport(x.id)).ok, false);
});

test("ready export UI captures only final question sheets and omits edit handles; buyers never receive a source PDF", () => {
  const studio = fs.readFileSync("components/ready-papers/studio.tsx", "utf8");
  assert.match(studio, /#ready-print \.rp-print-sheet/);
  assert.match(studio, /printKind !== "questions"/);
  assert.match(studio, /hasAttribute\("data-noprint"\)/);
  assert.match(studio, /form.set\("batchId", batch.batchId\)/);
  const page = fs.readFileSync("app/marketplace/[id]/page.tsx", "utf8");
  assert.match(
    page,
    /<MarketplaceRasterPreview raster=\{readyRaster\} branded/,
  );
  const setup = fs.readFileSync(
    "app/dashboard/library/[id]/setup/page.tsx",
    "utf8",
  );
  assert.match(setup, /validatePurchase\(row.value, buyerId, id\)/);
  assert.match(setup, /purchaseId=\{id\}/);
  const view = fs.readFileSync(
    "components/marketplace-raster-preview.tsx",
    "utf8",
  );
  assert.match(view, /checkPurchasedPaperAccess\(purchaseId\)/);
  assert.match(view, /প্রশ্নবুক\.কম/);
  assert.doesNotMatch(view, /sourceUrl|\.pdf\?/);
});
