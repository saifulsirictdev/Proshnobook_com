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
    n === "server-only" ? {} : Object.hasOwn(mocks, n) ? mocks[n] : require(n);
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
const renderer = load("lib/marketplace-sample-image.ts");
test("public sample is a flattened PNG with Bengali text and fixed dimensions, not text/SVG layers", async () => {
  const sample = {
    version: 1,
    questionCount: 20,
    excerpts: [
      "বাংলাদেশের ঐতিহাসিক স্থাপত্য সম্পর্কে বিস্তারিত আলোচনা করো…",
      "একটি প্রশ্নের সীমিত শুরুর অংশ এখানে দেখা যাচ্ছে…",
    ],
  };
  const png = await renderer.marketSampleImage(sample),
    meta = await sharp(png).metadata();
  assert.equal(meta.format, "png");
  assert.equal(meta.width, 880);
  assert.equal(meta.height, 820);
  assert.equal(meta.hasAlpha, false);
  assert.ok(!png.includes(Buffer.from(sample.excerpts[0])));
  assert.ok(!png.includes(Buffer.from("PROSHNOBOOK.COM")));
  const raw = await sharp(png).raw().toBuffer();
  assert.ok(raw.some((n) => n < 150));
  await assert.rejects(renderer.marketSampleImage({ ...sample, excerpts: [] }));
  await assert.rejects(
    renderer.marketSampleImage({ ...sample, excerpts: ["x".repeat(162)] }),
  );
});
test("sample route validates id and status boundary, ignores query paging, rechecks revocation and fails closed", async () => {
  const id = "a".repeat(64);
  let row = { value: "approved" },
    calls = 0,
    rendered = 0,
    change = false;
  const route = load("app/api/marketplace/[id]/sample/route.ts", {
    "@/lib/db": {
      db: {
        setting: {
          findUnique: async () => {
            calls++;
            return change && calls === 2 ? { value: "revoked" } : row;
          },
        },
      },
    },
    "@/lib/marketplace": { MARKET_PREFIX: "market:submission:v1:" },
    "@/lib/marketplace-sample": {
      publicMarketSample: (raw) =>
        raw === "approved"
          ? { excerpts: ["bounded"], questionCount: 20 }
          : null,
    },
    "@/lib/marketplace-sample-image": {
      marketSampleImage: async () => {
        rendered++;
        return Buffer.from("png-bytes");
      },
    },
  });
  const get = (key) =>
    route.GET(
      new Request(
        "https://proshnobook.com/api/marketplace/" + key + "/sample?page=999",
      ),
      { params: Promise.resolve({ id: key }) },
    );
  assert.equal((await get("bad")).status, 404);
  assert.equal(calls, 0);
  let r = await get(id);
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("Content-Type"), "image/png");
  assert.match(r.headers.get("Cache-Control"), /no-store/);
  assert.equal(await r.text(), "png-bytes");
  row = { value: "pending" };
  assert.equal((await get(id)).status, 404);
  assert.equal(rendered, 1);
  row = null;
  assert.equal((await get(id)).status, 404);
  row = { value: "approved" };
  calls = 0;
  change = true;
  assert.equal((await get(id)).status, 404);
});
