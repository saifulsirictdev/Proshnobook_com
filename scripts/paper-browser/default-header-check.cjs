/** Isolated real-component browser checks; no DB, user data, or network APIs.
 * Install esbuild, playwright-core, @sparticuz/chromium in an ignored tools dir.
 * NODE_PATH=.cache/header-tools/node_modules node scripts/paper-browser/default-header-check.cjs
 */
const fs = require("node:fs"),
  path = require("node:path"),
  http = require("node:http"),
  assert = require("node:assert/strict"),
  { execFileSync } = require("node:child_process");
const root = path.resolve(__dirname, "../.."),
  out = path.join(root, ".cache/default-header-browser");
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(
  path.join(out, "entry.jsx"),
  `
import React,{useState} from 'react';import {createRoot} from 'react-dom/client';
import Editor from '${root}/components/paper-builder/default-header-editor';
import Preview from '${root}/components/paper-builder/preview';
import {defaults,restoreSettings} from '${root}/lib/paper-builder';
import {withDefaultHeader,resolveDefaultHeader} from '${root}/lib/default-paper-header';
import {applyHeader,paperHeaderSchema} from '${root}/lib/paper-header';
import '${root}/components/paper-builder/paper.css';
function App(){
 const [s,setS]=useState(()=>withDefaultHeader(restoreSettings(JSON.parse(localStorage.getItem('settings')||'{}'))));
 const [grade,setGrade]=useState(8),[fail,setFail]=useState(false),[request,setRequest]=useState(0);
 const items=[{id:'q1',text:'Choose the correct answer.',type:'MCQ',category:'Class '+grade,subject:grade===8?'English 2nd Paper':'বাংলা',options:{a:'A',b:'B',c:'C',d:'D'},correct:'a'}];
 const update=next=>{setS(next);localStorage.setItem('settings',JSON.stringify(next));};
 return <main><div data-noprint><button id="selection" onClick={()=>setGrade(7)}>Change selection</button><button id="metadata" onClick={()=>update({...s,info:{...s.info,minutes:'2 ঘণ্টা',marks:'50'}})}>Set metadata</button><button id="custom" onClick={()=>{const h=paperHeaderSchema.parse({enabled:true});h.fields.institute.value='CUSTOM SMART SCHOOL';update(applyHeader(s,h));}}>Apply Smart</button><button id="failure" onClick={()=>setFail(!fail)}>Toggle failure</button><button id="toolbar-edit" onClick={()=>setRequest(v=>v+1)}>Toolbar edit</button><Editor settings={s} items={items} editRequest={request} update={update} onSave={async next=>{if(fail)return {ok:false,error:'Test save failed'};update(next);return {ok:true};}}/></div>
 <div id="paper" className="paper-builder-root"><Preview s={s} defaultHeaderValues={resolveDefaultHeader(s,items)} questions={items.map(q=>({q,opts:Object.entries(q.options),ci:0}))} type="MCQ" setName="ক" duplicate={new Set()} onImageSize={()=>{}} title="MCQ"/></div></main>;
}createRoot(document.getElementById('root')).render(<App/>);`,
);
require("esbuild").buildSync({
  entryPoints: [path.join(out, "entry.jsx")],
  bundle: true,
  outfile: path.join(out, "app.js"),
  jsx: "automatic",
  alias: { "@": root },
  nodePaths: [path.join(root, "node_modules")],
  external: ["/fonts/*"],
  define: { "process.env.NODE_ENV": '"production"' },
});
execFileSync(
  path.join(root, "node_modules/.bin/tailwindcss"),
  [
    "-i",
    path.join(root, "app/globals.css"),
    "-o",
    path.join(out, "global.css"),
    "--content",
    path.join(root, "components/paper-builder/*.{tsx,css}"),
    "--minify",
  ],
  { cwd: root, stdio: "pipe" },
);
fs.writeFileSync(
  path.join(out, "index.html"),
  '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/global.css"><link rel="stylesheet" href="/app.css"><style>@font-face{font-family:DocumentEnglish;src:url(/fonts/Tinos-Regular.ttf)}@font-face{font-family:DocumentEnglish;src:url(/fonts/Tinos-Bold.ttf);font-weight:700}@font-face{font-family:DocumentBangla;src:url(/fonts/HindSiliguri-Regular.ttf)}@font-face{font-family:DocumentBangla;src:url(/fonts/HindSiliguri-SemiBold.ttf);font-weight:700}:root{--font-en:DocumentEnglish;--font-bn:DocumentBangla;--qk-body:DocumentBangla}body{margin:0;background:#f1f5f9;font-family:DocumentBangla,serif}main{padding:12px}#paper{overflow:auto}@page{size:A4;margin:0}</style><div id="root"></div><script src="/app.js"></script>',
);
(async () => {
  const { chromium } = require("playwright-core"),
    pkg = process.env.CHROMIUM_EXECUTABLE_PATH
      ? null
      : require("@sparticuz/chromium"),
    engine = pkg?.default ?? pkg;
  const server = http.createServer((req, res) => {
    const u = new URL(req.url, "http://localhost"),
      file =
        u.pathname === "/fonts/AdorshoLipi.ttf"
          ? path.join(root, "app/fonts/AdorshoLipi.ttf")
          : u.pathname.startsWith("/fonts/")
            ? path.join(root, "public/fonts", path.basename(u.pathname))
            : path.join(
                out,
                u.pathname === "/" ? "index.html" : path.basename(u.pathname),
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
          : file.endsWith(".ttf")
            ? "font/ttf"
            : "text/html",
    );
    res.end(fs.readFileSync(file));
  });
  await new Promise((r) => server.listen(0, "0.0.0.0", r));
  let browser;
  try {
    browser = await chromium.launch({
      executablePath:
        process.env.CHROMIUM_EXECUTABLE_PATH ?? (await engine.executablePath()),
      args: engine?.args ?? [],
      headless: true,
    });
    const page = await browser.newPage(),
      errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    const url = "http://127.0.0.1:" + server.address().port;
    for (const width of [1100, 390]) {
      await page.setViewportSize({ width, height: 1200 });
      await page.goto(url);
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      await page.locator(".paper-sheet").first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      const editor = page.getByRole("region", {
          name: "ডিফল্ট হেডার সম্পাদনা",
        }),
        paper = page.locator(".paper-sheet").first();
      assert.ok(
        (await paper.textContent()).includes(
          "প্রশ্নবুক.কম উচ্চ বিদ্যালয় ও কলেজ",
        ),
      );
      await page
        .getByRole("button", {
          name: "পরীক্ষার নাম সম্পাদনা করুন",
          exact: true,
        })
        .click();
      assert.equal(
        await page
          .getByLabel("পরীক্ষার নাম", { exact: true })
          .evaluate((e) => e === document.activeElement),
        true,
      );
      await page
        .getByLabel("পরীক্ষার নাম", { exact: true })
        .fill("টেস্ট পরীক্ষা ২০২৭");
      await page.getByRole("button", { name: "বাতিল", exact: true }).click();
      assert.ok(!(await paper.textContent()).includes("টেস্ট পরীক্ষা ২০২৭"));
      await page.locator("#toolbar-edit").click();
      assert.equal(
        await page
          .getByLabel("প্রতিষ্ঠানের নাম", { exact: true })
          .evaluate((e) => e === document.activeElement),
        true,
      );
      await page
        .getByLabel("প্রতিষ্ঠানের নাম", { exact: true })
        .fill("পরীক্ষামূলক উচ্চ বিদ্যালয় ও কলেজ");
      await page
        .getByLabel("পরীক্ষার নাম", { exact: true })
        .fill("টেস্ট পরীক্ষা ২০২৭");
      await page
        .getByRole("button", { name: "ডিফল্ট হেডার সেভ করুন", exact: true })
        .click();
      assert.ok((await paper.textContent()).includes("টেস্ট পরীক্ষা ২০২৭"));
      await page.reload();
      await page.locator(".paper-sheet").first().waitFor();
      assert.ok((await paper.textContent()).includes("টেস্ট পরীক্ষা ২০২৭"));
      await page.locator("#selection").click();
      assert.ok((await editor.textContent()).includes("সপ্তম শ্রেণি"));
      assert.ok((await paper.textContent()).includes("বাংলা"));
      await page.locator("#metadata").click();
      assert.ok((await paper.textContent()).includes("২ ঘণ্টা"));
      assert.ok((await paper.textContent()).includes("৫০"));
      await page
        .getByRole("button", { name: "হেডার এডিট করুন", exact: true })
        .click();
      await page.getByLabel("শ্রেণি", { exact: true }).fill("বিশেষ শ্রেণি");
      await page
        .getByRole("button", { name: "ডিফল্ট হেডার সেভ করুন", exact: true })
        .click();
      assert.ok((await paper.textContent()).includes("বিশেষ শ্রেণি"));
      await page
        .getByRole("button", { name: "হেডার এডিট করুন", exact: true })
        .click();
      await page
        .getByRole("button", { name: "শ্রেণি: অটোতে ফিরুন", exact: true })
        .click();
      await page
        .getByRole("button", { name: "ডিফল্ট হেডার সেভ করুন", exact: true })
        .click();
      assert.ok((await paper.textContent()).includes("সপ্তম শ্রেণি"));
      await page.locator("#failure").click();
      await page
        .getByRole("button", { name: "হেডার এডিট করুন", exact: true })
        .click();
      await page.getByLabel("পরীক্ষার নাম", { exact: true }).fill("UNSAVED");
      await page
        .getByRole("button", { name: "ডিফল্ট হেডার সেভ করুন", exact: true })
        .click();
      assert.ok((await editor.textContent()).includes("Test save failed"));
      assert.ok(!(await paper.textContent()).includes("UNSAVED"));
      await page.getByLabel("পরীক্ষার নাম", { exact: true }).press("Escape");
      await page.locator("#failure").click();
      const overflow = await editor.evaluate(
        (el) => el.scrollWidth > el.clientWidth + 1,
      );
      assert.equal(overflow, false, "editor horizontal overflow at " + width);
      await editor.screenshot({
        path: path.join(out, "editor-" + width + ".png"),
      });
      await page.pdf({
        path: path.join(out, "paper-" + width + ".pdf"),
        printBackground: true,
      });
      await page.emulateMedia({ media: "print" });
      assert.equal(await editor.isVisible(), false);
      await page.emulateMedia({ media: "screen" });
      await page.locator("#custom").click();
      assert.equal(
        await page.locator(".paper-sheet .default-paper-header").count(),
        0,
      );
      assert.ok((await paper.textContent()).includes("CUSTOM SMART SCHOOL"));
      await page
        .getByRole("button", { name: "ডিফল্ট হেডারে ফিরুন", exact: true })
        .click();
      assert.ok(
        (await paper.textContent()).includes(
          "পরীক্ষামূলক উচ্চ বিদ্যালয় ও কলেজ",
        ),
      );
      assert.ok(!(await paper.textContent()).includes("CUSTOM SMART SCHOOL"));
    }
    assert.deepEqual(errors, []);
    console.log(
      "PASS: desktop/mobile edit/cancel/save/reload, auto/override/reset, failure, Smart precedence, print; artifacts: " +
        out,
    );
  } finally {
    await browser?.close();
    await new Promise((r) => server.close(r));
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
