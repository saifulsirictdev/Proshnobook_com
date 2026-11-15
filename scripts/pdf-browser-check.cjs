/** Optional isolated smoke check: NODE_PATH=<tools>/node_modules node scripts/pdf-browser-check.cjs
 * Tools: playwright-core and @sparticuz/chromium. No production URLs, accounts or provider writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const ts = require("typescript");
const { PDFDocument, StandardFonts } = require("pdf-lib");
require("regenerator-runtime/runtime");
(async () => {
  const { chromium } = require("playwright-core");
  const chromiumModule = process.env.CHROMIUM_EXECUTABLE_PATH
    ? undefined
    : require("@sparticuz/chromium");
  const executable = chromiumModule?.default || chromiumModule;
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(require("@pdf-lib/fontkit"));
  const bn = await pdf.embedFont(
    fs.readFileSync("public/fonts/HindSiliguri-Regular.ttf"),
  );
  const en = await pdf.embedFont(StandardFonts.Helvetica);
  for (let n = 1; n <= 2; n++) {
    const p = pdf.addPage([595.28, 841.89]);
    p.drawText(`Page ${n}: School life`, { x: 40, y: 770, size: 18, font: en });
    p.drawText("বাংলা প্রশ্নপত্র", { x: 40, y: 720, size: 22, font: bn });
  }
  const fixture = Buffer.from(await pdf.save());
  const engine = ts.transpileModule(
    fs.readFileSync("lib/pdf-engine-browser.ts", "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  const publicRoot = path.resolve("public");
  const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, "http://localhost").pathname;
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (pathname === "/") {
      res.setHeader("Content-Type", "text/html");
      return res.end(
        '<!doctype html><meta name="viewport" content="width=device-width"><style>@page{size:A4;margin:0}body{margin:0}canvas{width:100%;display:block;break-after:page}</style>',
      );
    }
    if (pathname === "/engine.mjs") {
      res.setHeader("Content-Type", "text/javascript");
      return res.end(engine);
    }
    if (pathname === "/fixture.pdf") {
      res.setHeader("Content-Type", "application/pdf");
      return res.end(fixture);
    }
    const file = path.resolve(publicRoot, "." + pathname);
    if (
      !file.startsWith(publicRoot + path.sep) ||
      !pathname.startsWith("/vendor/pdfjs/4.10.38/") ||
      !fs.existsSync(file) ||
      !fs.statSync(file).isFile()
    ) {
      res.statusCode = 404;
      return res.end();
    }
    res.setHeader(
      "Content-Type",
      file.endsWith(".mjs") ? "text/javascript" : "application/octet-stream",
    );
    res.end(fs.readFileSync(file));
  });
  let browser;
  try {
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    browser = await chromium.launch({
      executablePath:
        process.env.CHROMIUM_EXECUTABLE_PATH ||
        (await executable.executablePath()),
      args: executable ? executable.args : ["--no-sandbox"],
      headless: true,
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(30000);
    const errors = [],
      requests = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("request", (req) => requests.push(req.url()));
    await page.route("**/*", (route) =>
      route
        .request()
        .url()
        .startsWith(origin + "/")
        ? route.continue()
        : route.abort(),
    );
    for (const width of [390, 1280]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(origin);
      const result = await page.evaluate(async () => {
        const { loadBrowserPdfEngine } = await import("/engine.mjs");
        const [engine, again] = await Promise.all([
          loadBrowserPdfEngine(),
          loadBrowserPdfEngine(),
        ]);
        if (engine !== again) throw Error("loader did not reuse engine");
        const doc = await engine.getDocument({
          url: "/fixture.pdf",
          isEvalSupported: false,
        }).promise;
        const texts = [],
          ink = [];
        try {
          for (let i = 1; i <= doc.numPages; i++) {
            const p = await doc.getPage(i),
              viewport = p.getViewport({ scale: 1 });
            texts.push(
              (await p.getTextContent()).items.map((x) => x.str).join(" "),
            );
            const canvas = document.createElement("canvas");
            canvas.width = Math.ceil(viewport.width);
            canvas.height = Math.ceil(viewport.height);
            document.body.append(canvas);
            const ctx = canvas.getContext("2d");
            await p.render({ canvasContext: ctx, viewport }).promise;
            const pixels = ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height,
            ).data;
            let count = 0;
            for (let n = 0; n < pixels.length; n += 4)
              if (pixels[n] < 220 && pixels[n + 1] < 220 && pixels[n + 2] < 220)
                count++;
            ink.push(count);
          }
          return { pages: doc.numPages, texts, ink };
        } finally {
          await doc.destroy();
        }
      });
      assert.equal(result.pages, 2);
      assert.ok(
        result.texts.every(
          (text, i) =>
            text.includes(`Page ${i + 1}: School life`) &&
            text.includes("বাংলা"),
        ),
      );
      assert.ok(result.ink.every((n) => n > 1000));
      const printed = await page.pdf({
        format: "A4",
        preferCSSPageSize: true,
        printBackground: true,
      });
      assert.equal((await PDFDocument.load(printed)).getPageCount(), 2);
      console.log(
        `PASS browser ${width}px: real ESM worker, two-page Bengali/English canvas rendering and two-page A4 print`,
      );
    }
    assert.deepEqual(errors, []);
    assert.ok(requests.some((url) => url.endsWith("/pdf.worker.min.mjs")));
    assert.ok(requests.every((url) => url.startsWith(origin + "/")));
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
