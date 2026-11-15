const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const ts = require("typescript");
const { PDFDocument, StandardFonts } = require("pdf-lib");
require("regenerator-runtime/runtime");
const fontkit = require("@pdf-lib/fontkit");
const base = "public/vendor/pdfjs/4.10.38";

test("versioned browser engine/worker/CMaps match the installed patched engine, with no legacy/CDN loaders", () => {
  for (const name of ["pdf.min.mjs", "pdf.worker.min.mjs"]) {
    assert.deepEqual(
      fs.readFileSync(`${base}/${name}`),
      fs.readFileSync(`node_modules/pdfjs-dist/build/${name}`),
    );
  }
  for (const name of fs.readdirSync("node_modules/pdfjs-dist/cmaps")) {
    assert.deepEqual(
      fs.readFileSync(`${base}/cmaps/${name}`),
      fs.readFileSync(`node_modules/pdfjs-dist/cmaps/${name}`),
    );
  }
  const lock = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));
  assert.equal(lock.packages["node_modules/pdfjs-dist"].version, "4.10.38");
  for (const name of ["canvas", "@mapbox/node-pre-gyp", "tar", "pdf-parse"])
    assert.equal(lock.packages[`node_modules/${name}`], undefined);
  const loader = fs.readFileSync("lib/pdf-engine-browser.ts", "utf8");
  assert.match(loader, /webpackIgnore: true/);
  assert.match(loader, /engine = undefined/);
  for (const file of [
    "components/qb-extract.tsx",
    "lib/pdf-mcq/browser-extract.ts",
    "lib/ready-paper-browser.ts",
  ]) {
    const source = fs.readFileSync(file, "utf8");
    assert.ok(source.includes("loadBrowserPdfEngine"));
    assert.doesNotMatch(
      source,
      /cdnjs|cdn\.jsdelivr|window.*pdfjsLib|pdf\.min\.js/,
    );
  }
  assert.ok(!fs.existsSync("public/vendor/pdfjs/pdf.min.js"));
  assert.ok(!fs.existsSync("public/vendor/pdfjs/pdf.worker.min.js"));
});

test("actual server extractor keeps mixed A4 page geometry, English columns and embedded Bengali text", async () => {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const english = await pdf.embedFont(StandardFonts.Helvetica);
  const bengali = await pdf.embedFont(
    fs.readFileSync("public/fonts/HindSiliguri-Regular.ttf"),
  );
  for (let n = 1; n <= 2; n++) {
    const page = pdf.addPage([595.28, 841.89]);
    page.drawText(`Question ${n}: School life`, {
      x: 40,
      y: 760,
      size: 14,
      font: english,
    });
    page.drawText("Left column", { x: 40, y: 700, size: 12, font: english });
    page.drawText("Right column", { x: 320, y: 700, size: 12, font: english });
    page.drawText("বাংলা", { x: 40, y: 650, size: 18, font: bengali });
  }
  const bytes = await pdf.save();
  fs.mkdirSync(".cache", { recursive: true });
  const dir = fs.mkdtempSync(path.resolve(".cache/pdf-migration-"));
  const file = path.join(dir, "extract.mjs");
  try {
    fs.writeFileSync(
      file,
      ts.transpileModule(fs.readFileSync("lib/pdf-mcq/extract.ts", "utf8"), {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
        },
      }).outputText,
    );
    const { extractPages, extractPdfText } = await import(
      pathToFileURL(file).href
    );
    const pages = await extractPages(
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    );
    assert.equal(pages.length, 2);
    for (const [i, page] of pages.entries()) {
      assert.equal(page.pageNumber, i + 1);
      assert.ok(Math.abs(page.width - 595.28) < 0.1);
      assert.ok(Math.abs(page.height - 841.89) < 0.1);
      const text = page.items.map((x) => x.str).join(" ");
      assert.ok(text.includes(`Question ${i + 1}: School life`));
      assert.ok(text.includes("বাংলা"));
      assert.ok(
        page.items.find((x) => x.str === "Right column").x >
          page.items.find((x) => x.str === "Left column").x,
      );
      assert.ok(
        page.items.every(
          (x) => Number.isFinite(x.x) && Number.isFinite(x.y) && x.width >= 0,
        ),
      );
    }
    await assert.rejects(
      extractPages(new TextEncoder().encode("not a PDF").buffer),
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("PDF route authenticates before work, bounds inputs and hides parser errors", async () => {
  const Module = require("node:module");
  let authenticated = false,
    extracts = 0,
    parses = 0,
    fail = false;
  const m = new Module("pdf-route", module);
  m.require = (id) =>
    ({
      "@/auth": {
        auth: async () => (authenticated ? { user: { id: "teacher" } } : null),
      },
      "@/lib/pdf-mcq/extract": {
        extractPdfText: async () => {
          extracts++;
          if (fail) throw Error("secret connection string");
          return "valid extracted PDF text";
        },
      },
      "@/lib/question-parser": {
        parseBanglaQuestions: () => {
          parses++;
          return { mcqs: [], shortQuestions: [], cqs: [] };
        },
      },
    })[id] || require(id);
  m._compile(
    ts.transpileModule(
      fs.readFileSync("app/api/qb/extract-pdf/route.ts", "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
        },
      },
    ).outputText,
    "pdf-route.js",
  );
  const post = m.exports.POST;
  assert.equal(
    (
      await post({
        formData: () => {
          throw Error("unauthorized body read");
        },
      })
    ).status,
    401,
  );
  authenticated = true;
  async function send(file, text) {
    const fd = new FormData();
    if (file) fd.set("file", file);
    if (text) fd.set("text", text);
    return post(
      new Request("https://example.invalid/api/qb/extract-pdf", {
        method: "POST",
        body: fd,
      }),
    );
  }
  assert.equal((await send(null, "x".repeat(200001))).status, 400);
  assert.equal((await send(new File(["invalid"], "bad.pdf"))).status, 400);
  assert.equal(
    (await send(new File([new Uint8Array(10000001)], "large.pdf"))).status,
    400,
  );
  assert.equal(extracts, 0);
  assert.equal((await send(null, "direct question text")).status, 200);
  assert.equal(parses, 1);
  assert.equal(
    (await send(new File(["%PDF-fixture"], "test.pdf"))).status,
    200,
  );
  assert.equal(extracts, 1);
  fail = true;
  const result = await send(new File(["%PDF-fixture"], "test.pdf"));
  assert.equal(result.status, 400);
  assert.ok(!(await result.text()).includes("secret connection"));
  assert.equal(parses, 2);
});
