/** Real client components with local PDF/payment fixtures. No production writes, OCR/provider calls or debits.
 * NODE_PATH=.cache/postmerge-browser-tools/node_modules node scripts/paper-browser/word-workspace-check.cjs
 */
const fs = require("node:fs"),
  path = require("node:path"),
  http = require("node:http"),
  assert = require("node:assert/strict");
const root = path.resolve(__dirname, "../.."),
  out = path.join(root, ".cache/word-workspace-browser");
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(
  path.join(out, "entry.jsx"),
  `
import React from 'react';import{createRoot}from'react-dom/client';
import Studio from '${root}/components/ready-papers/studio';import Builder from '${root}/components/qb-builder';
import {readySnapshotSchema}from '${root}/lib/ready-commerce';import{settingsSchema}from '${root}/lib/paper-builder';
import '${root}/components/ready-papers/studio-responsive.css';
const canvas=document.createElement('canvas');canvas.width=800;canvas.height=1000;const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,800,1000);ctx.fillStyle='black';ctx.font='22px serif';ctx.fillText('1. Original scanned question',50,100);window.paperImage=canvas.toDataURL();
window.events=[];window.failSave=false;window.saveDelay=250;
if(new URLSearchParams(location.search).has('fresh')){localStorage.removeItem('ready-saved');history.replaceState({},'','/');}
const snapshot=readySnapshotSchema.parse({edits:{},headerStyle:'simple',headerSettings:settingsSchema.parse({}),headerLine:true,headerGap:2,header:{school:'Test School',exam:'Test Exam',subject:'Math',time:'',marks:''}});
const purchase={id:'receipt',selected:[1],paperId:'paper',snapshot:localStorage.getItem('ready-saved')?readySnapshotSchema.parse(JSON.parse(localStorage.getItem('ready-saved'))):snapshot};
window.fixtures=[{id:'q1',text:'Original database question?',type:'MCQ',correct:'a',options:{a:'One',b:'Two'},category:'SSC',subject:'Math',topic:'Numbers'}];
window.fixtures.push({...window.fixtures[0],id:'other',text:'Unaffected question?'});localStorage.setItem('qb:selected','["q1","other"]');
window.fetch=async(url,init)=>{if(url==='/api/qb/questions')return Response.json({items:window.fixtures});if(url==='/api/qb/replacement')return Response.json({alternatives:[{id:'q2',label:'Related alternative',subject:'Math',topic:'Numbers',type:'MCQ',locked:false,item:{...window.fixtures[0],id:'q2',text:'Choose this related question?'}},{id:'q3',label:'Locked alternative',subject:'Math',topic:'Numbers',type:'MCQ',locked:true}]});throw Error('Unexpected network: '+url);};
createRoot(document.getElementById('root')).render(location.pathname==='/qb'?<Builder/>:<Studio paper={{id:'paper',title:'Local ready paper',grade:'SSC',subject:'Math',url:'https://local.public.blob.vercel-storage.com/test.pdf',presets:{}}} userId="teacher" initialPurchase={purchase}/>);
`,
);
const mockActions = `export async function saveReadyPurchase(receipt,snapshot,selected){window.events.push({kind:'save-start',snapshot,selected});await new Promise(r=>setTimeout(r,window.saveDelay));if(window.failSave){window.events.push({kind:'save-fail'});return {ok:false,error:'Test save failed'};}window.saved=structuredClone(snapshot);localStorage.setItem('ready-saved',JSON.stringify(snapshot));window.events.push({kind:'save-ok'});return {ok:true};}
export async function getReadyPurchase(){return null;}export async function quoteReadyPaper(){return {ok:false};}export async function checkoutReadyPaper(){return {ok:false};}
export async function listPaperHeaders(){return [];}export async function savePaperHeader(){return {ok:true};}
export async function beginReadyMarketExport(){throw Error('Not part of this test');}export async function uploadReadyMarketPage(){throw Error('Not part of this test');}
export async function updateReadyPaper(){return {ok:true};}export async function loadEnglishPaper(){return null;}
export async function checkPurchasedPaperAccess(){return {ok:true};}export async function checkQuestionAccess(){return {ok:true};}
export async function quoteQuestions(){return {ok:true,total:0,balance:2000,counts:{MCQ:1,SHORT:0,CQ:0},admin:false,canAfford:true};}export async function purchaseQuestions(){return {ok:true};}`;
(async () => {
  await require("esbuild").build({
    entryPoints: [path.join(out, "entry.jsx")],
    bundle: true,
    outfile: path.join(out, "app.js"),
    jsx: "automatic",
    loader: { ".woff2": "dataurl", ".woff": "dataurl", ".ttf": "dataurl" },
    alias: { "@": root },
    nodePaths: [path.join(root, "node_modules")],
    external: ["/fonts/*"],
    define: { "process.env.NODE_ENV": '"production"' },
    plugins: [
      {
        name: "local-fixtures",
        setup(b) {
          b.onResolve({ filter: /^@\/app\/actions\// }, (a) => ({
            path: a.path,
            namespace: "actions",
          }));
          b.onLoad({ filter: /.*/, namespace: "actions" }, () => ({
            contents: mockActions,
          }));
          b.onResolve({ filter: /^next\/link$/ }, (a) => ({
            path: a.path,
            namespace: "link",
          }));
          b.onLoad({ filter: /.*/, namespace: "link" }, () => ({
            contents:
              'import React from "react";export default function Link({href,children,...props}){return <a href={href} {...props}>{children}</a>}',
            loader: "jsx",
            resolveDir: root,
          }));
          b.onResolve({ filter: /^@\/lib\/ready-paper-browser$/ }, () => ({
            path: "ready-browser",
            namespace: "fixture",
          }));
          b.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({
            contents: `export {renderEdited,suggestMargins} from '${root}/lib/ready-paper-browser';export async function loadPdfImages(){return [window.paperImage,window.paperImage];}export async function saveLocal(){}export async function loadLocal(){return null;}`,
            resolveDir: root,
          }));
        },
      },
    ],
  });
  require("node:child_process").execFileSync(
    path.join(root, "node_modules/.bin/tailwindcss"),
    [
      "-i",
      path.join(root, "app/globals.css"),
      "-o",
      path.join(out, "global.css"),
      "--content",
      path.join(root, "components/**/*.{tsx,css}"),
      "--minify",
    ],
    { stdio: "pipe" },
  );
  fs.writeFileSync(
    path.join(out, "index.html"),
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/global.css"><link rel="stylesheet" href="/app.css"><style>:root{--font-en:serif;--font-bn:serif;--qk-body:serif;--qk-head:serif}body{margin:0;background:#f1f5f9}@page{size:A4;margin:0}</style><div id="root"></div><script src="/app.js"></script>',
  );
  const server = http.createServer((req, res) => {
    const u = new URL(req.url, "http://local");
    const file = u.pathname.startsWith("/vendor/ocr/")
      ? path.join(root, "public/vendor/ocr", path.basename(u.pathname))
      : u.pathname.startsWith("/fonts/")
        ? path.join(root, "public/fonts", path.basename(u.pathname))
        : path.join(
            out,
            ["/", "/qb"].includes(u.pathname)
              ? "index.html"
              : path.basename(u.pathname),
          );
    if (!fs.existsSync(file)) {
      res.writeHead(404);
      return res.end();
    }
    res.setHeader(
      "Content-Type",
      file.endsWith(".js")
        ? "text/javascript"
        : file.endsWith(".css")
          ? "text/css"
          : file.endsWith(".woff2")
            ? "font/woff2"
            : "text/html",
    );
    res.end(fs.readFileSync(file));
  });
  await new Promise((r) => server.listen(0, "0.0.0.0", r));
  const base = "http://127.0.0.1:" + server.address().port;
  const { chromium } = require("playwright-core"),
    pkg = process.env.CHROMIUM_EXECUTABLE_PATH
      ? null
      : require("@sparticuz/chromium"),
    engine = pkg?.default ?? pkg;
  let browser;
  const results = [];
  try {
    browser = await chromium.launch({
      headless: true,
      executablePath:
        process.env.CHROMIUM_EXECUTABLE_PATH || (await engine.executablePath()),
      args: engine?.args || ["--no-sandbox"],
    });
    for (const width of [1280, 390]) {
      const context = await browser.newContext({
          viewport: { width, height: 900 },
        }),
        page = await context.newPage(),
        errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(base + "/?fresh=1");
      await page
        .locator(".rp-stage-edit .rp-print-sheet")
        .waitFor()
        .catch(async (e) => {
          console.error({
            errors,
            body: await page.locator("body").innerText(),
          });
          throw e;
        });
      await page.locator(".rp-question-raster").waitFor();
      assert.equal(
        await page.locator(".rp-answer-tools,.rp-phone-answer").count(),
        0,
      );
      if (width < 640)
        await page
          .getByRole("button", { name: "Header ও Edit controls", exact: true })
          .click();
      const font = page.getByLabel("প্রশ্ন ও হেডারের ফন্ট", { exact: true });
      await font.selectOption("serif");
      const margin = page.getByLabel("পেজ মার্জিন", { exact: true });
      const normal = await page
        .locator(".rp-print-sheet")
        .evaluate((e) => ({
          width: e.offsetWidth,
          padding: getComputedStyle(e).paddingLeft,
        }));
      await margin.selectOption("narrow");
      const narrow = await page
        .locator(".rp-print-sheet")
        .evaluate((e) => ({
          width: e.offsetWidth,
          padding: getComputedStyle(e).paddingLeft,
        }));
      assert.equal(normal.width, narrow.width);
      assert.ok(parseFloat(narrow.padding) < parseFloat(normal.padding));
      await font.selectOption("kalpurush");
      await page
        .getByRole("button", { name: "প্রশ্নের লেখা Edit", exact: true })
        .click();
      if (width < 640)
        await page
          .getByRole("button", { name: "প্রিভিউতে ফিরুন ↓", exact: true })
          .click();
      const raster = page.locator(".rp-raster-tools");
      await raster.waitFor();
      await raster.scrollIntoViewIfNeeded();
      const box = await raster.boundingBox();
      await page.mouse.move(
        box.x + box.width * 0.02,
        box.y + box.height * 0.04,
      );
      await page.mouse.down();
      await page.mouse.move(
        box.x + box.width * 0.85,
        box.y + box.height * 0.25,
        { steps: 8 },
      );
      await page.mouse.up();
      const text = page.getByLabel("নতুন বা বদলানো প্রশ্নের লেখা", {
        exact: true,
      });
      if (width === 1280 && process.env.WORD_WORKSPACE_OCR === "1") {
        await page
          .getByRole("button", {
            name: "এই অংশের লেখা পড়ুন (OCR)",
            exact: true,
          })
          .click();
        await page
          .getByText(/OCR পড়া হয়েছে/)
          .first()
          .waitFor({ timeout: 120000 });
        assert.match(await text.inputValue(), /Original/i);
        results.push({ localRegionOCR: true });
      }
      await text.fill("Edited scan text");
      assert.equal(
        await page
          .getByRole("toolbar", { name: "লেখার Home ফরম্যাটিং" })
          .count(),
        0,
      );
      await page
        .getByRole("toolbar", { name: "লেখার Home ফরম্যাটিং" })
        .waitFor();
      await page.getByRole("button", { name: "bold", exact: true }).click();
      await page
        .getByRole("button", {
          name: "যাচাই করে লেখা প্রয়োগ করুন",
          exact: true,
        })
        .click();
      await page.locator(".rp-question-raster").waitFor();
      if (width < 640)
        await page
          .getByRole("button", { name: "প্রিভিউতে ফিরুন ↓", exact: true })
          .click();
      const preview = page.locator(".rp-canvas-panel .rp-action-print");
      await page.evaluate(() => {
        window.failSave = true;
        window.saveDelay = 350;
      });
      await preview.click();
      await page
        .getByText("Test save failed", { exact: true })
        .first()
        .waitFor();
      assert.equal(await page.locator("#ready-print").count(), 0);
      assert.equal(await text.inputValue(), "Edited scan text");
      await page.evaluate(() => {
        window.failSave = false;
        window.saveDelay = 600;
        window.events = [];
      });
      await preview.click();
      assert.equal(await page.locator("#ready-print").count(), 0);
      await page.locator("#ready-print .rp-print-sheet").waitFor();
      assert.ok(
        await page.evaluate(() =>
          window.events.some((e) => e.kind === "save-ok"),
        ),
      );
      assert.equal(
        await page.evaluate(() => window.saved.headerSettings.cfg.marginLeft),
        24,
      );
      assert.equal(
        await page.evaluate(() => window.saved.edits[1].texts[0].text),
        "Edited scan text",
      );
      assert.equal(
        await page.evaluate(() => window.saved.edits[1].texts[0].style.bold),
        true,
      );
      const screenFont = await page
        .locator("#ready-print .rp-print-header")
        .evaluate((e) => getComputedStyle(e).fontFamily);
      assert.match(screenFont, /QmPaperKalpurush/);
      await page.emulateMedia({ media: "print" });
      const printFont = await page
        .locator("#ready-print .rp-print-header")
        .evaluate((e) => getComputedStyle(e).fontFamily);
      assert.equal(screenFont, printFont);
      await page.pdf({
        path: path.join(out, `ready-${width}.pdf`),
        preferCSSPageSize: true,
      });
      await page.emulateMedia({ media: "screen" });
      if (width === 1280) {
        await page
          .getByRole("button", { name: "Edit-এ ফিরুন", exact: true })
          .first()
          .click();
        await preview.click();
        await page
          .getByLabel("প্রতিষ্ঠানের নাম", { exact: true })
          .fill("Changed while saving");
        await page
          .getByText(/প্রস্তুতির সময় সম্পাদনা বদলেছে/)
          .first()
          .waitFor();
        assert.equal(await page.locator("#ready-print").count(), 0);
        assert.equal(
          await page
            .getByLabel("প্রতিষ্ঠানের নাম", { exact: true })
            .inputValue(),
          "Changed while saving",
        );
        await preview.click();
        await page.locator("#ready-print .rp-print-sheet").waitFor();
        results.push({ concurrentEditBlocksStalePreview: true });
      }
      await page.reload();
      await page.locator(".rp-stage-edit .rp-question-raster").waitFor();
      assert.equal(
        await page.getByLabel("পেজ মার্জিন", { exact: true }).inputValue(),
        "narrow",
      );
      assert.ok(
        (await page.locator("summary").allTextContents()).includes(
          "যোগ করা লেখা Edit করুন",
        ),
      );
      assert.deepEqual(errors, []);
      results.push({
        width,
        saveFailurePreservesEdits: true,
        saveBeforePreview: true,
        marginPaperSizeUnchanged: true,
        regionReplacementSaved: true,
        headerFontScreenPrint: screenFont,
      });
    }
    const page = await browser.newPage({
      viewport: { width: 1280, height: 900 },
    });
    await page.goto(base + "/qb");
    await page
      .getByText("Original database question?", { exact: true })
      .last()
      .waitFor();
    await page.getByRole("switch", { name: /এডিটিং মোড/ }).check();
    await page
      .getByRole("button", { name: "Exchange", exact: true })
      .first()
      .click();
    await page
      .getByRole("region", { name: "সম্পর্কিত বিকল্প প্রশ্ন" })
      .waitFor();
    assert.ok(
      (await page
        .getByText("Original database question?", { exact: true })
        .count()) > 0,
    );
    assert.deepEqual(
      await page.evaluate(() =>
        JSON.parse(localStorage.getItem("qb:selected")),
      ),
      ["q1", "other"],
    );
    await page
      .getByRole("button", { name: "এই প্রশ্নটি নিন", exact: true })
      .click();
    assert.deepEqual(
      await page.evaluate(() =>
        JSON.parse(localStorage.getItem("qb:selected")),
      ),
      ["q2", "other"],
    );
    assert.ok(
      (await page.getByText("Unaffected question?", { exact: true }).count()) >
        0,
    );
    await page
      .locator("summary")
      .filter({ hasText: "Choose this related question?" })
      .click();
    const field = page.getByLabel("প্রশ্ন 1", { exact: true });
    await field.fill("Select format text");
    await field.selectText();
    await page
      .getByRole("toolbar", { name: "প্রশ্ন 1 ফরম্যাটিং", exact: true })
      .waitFor();
    await page
      .getByLabel("প্রশ্ন 1: Font size", { exact: true })
      .selectOption("18");
    await page.getByLabel("প্রশ্ন 1: b", { exact: true }).click();
    assert.match(await field.inputValue(), /\[size=18\]/);
    assert.match(await field.inputValue(), /\[b\]/);
    const rendered = page
      .locator(".paper-question strong")
      .filter({ hasText: "Select format text" });
    await rendered.last().waitFor();
    assert.equal(
      await rendered
        .last()
        .evaluate((e) => getComputedStyle(e.parentElement).fontSize),
      "18px",
    );
    await page.emulateMedia({ media: "print" });
    assert.equal(
      await page
        .getByRole("toolbar", { name: "প্রশ্ন 1 ফরম্যাটিং", exact: true })
        .isVisible(),
      false,
    );
    await page.emulateMedia({ media: "screen" });
    results.push({
      qbLoaded: true,
      exchangeRequiresUserChoice: true,
      onlyChosenQuestionChanges: true,
      richSelectionFontAndBold: true,
      toolbarNeverPrints: true,
    });
    fs.writeFileSync(
      path.join(out, "result.json"),
      JSON.stringify({ results }, null, 2),
    );
    console.log(JSON.stringify({ ok: true, results }, null, 2));
  } finally {
    await browser?.close();
    await new Promise((r) => server.close(r));
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
