/** Isolated reference-layout regression. No login, production DB or provider calls.
 * NODE_PATH=<tools>/node_modules node scripts/english-browser/class8-reference-check.cjs
 * Tools: esbuild, playwright-core, @sparticuz/chromium (or CHROMIUM_EXECUTABLE_PATH).
 * Artifacts remain in .cache/class8-reference-browser/.
 */
const {fixture,root} = require('../../tests/helpers/class8-reference.cjs');
const {englishLegacyPaper} = require('../../lib/english/legacy-builder.ts');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const out=path.join(root,'.cache/class8-reference-browser');fs.mkdirSync(out,{recursive:true});
const paper=englishLegacyPaper(fixture());
const {preparedClass8Paper2Items}=require('../../lib/english/prepared-class8-paper2.ts');
const {assembleEnglishItems}=require('../../lib/english/item-bank.ts');
const stock=preparedClass8Paper2Items(8).map(p=>p.draft);
const library=Array.from({length:40},(_,i)=>englishLegacyPaper(assembleEnglishItems(stock,8,()=>(i+.5)/40,undefined,{},2).draft));
fs.writeFileSync(path.join(out,'library.json'),JSON.stringify(library));
fs.writeFileSync(path.join(out,'paper.json'),JSON.stringify(paper));
fs.writeFileSync(path.join(out,'entry.jsx'),`import React from 'react';import {createRoot} from 'react-dom/client';import Preview from '${root}/components/paper-builder/preview';import '${root}/components/paper-builder/paper.css';import original from './paper.json';import library from './library.json';
const params=new URLSearchParams(location.search);const p=params.has('model')?library[Number(params.get('model'))]:original;if(params.get('landscape')){p.settings.cfg.orientation='landscape';p.settings.cfg.booklet=true;}
if(params.get('long'))p.items[0].englishGroup.tasks[0].instruction+=' '+Array(500).fill('Extra contextual text must not be clipped or lost.').join(' ');
createRoot(document.getElementById('root')).render(<div className='paper-builder-root'><Preview s={p.settings} questions={p.items.map(q=>({q,opts:[],ci:0}))} type='SHORT' setName='A' duplicate={new Set()} onImageSize={()=>{}} title='English Question Paper'/></div>);`);
require('esbuild').buildSync({entryPoints:[path.join(out,'entry.jsx')],bundle:true,outfile:path.join(out,'app.js'),jsx:'automatic',alias:{'@':root},nodePaths:[path.join(root,'node_modules')],external:['/fonts/*'],define:{'process.env.NODE_ENV':'"production"'}});
execFileSync(path.join(root,'node_modules/.bin/tailwindcss'),['-i',path.join(root,'app/globals.css'),'-o',path.join(out,'global.css'),'--content',path.join(root,'components/paper-builder/*.{tsx,css}'),'--minify'],{cwd:root,stdio:'pipe'});
fs.writeFileSync(path.join(out,'index.html'),'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/global.css"><link rel="stylesheet" href="/app.css"><style>:root{--font-en:"Times New Roman";--font-bn:serif}body{margin:0;background:#eee}@page{size:A4;margin:0}</style><div id="root"></div><script src="/app.js"></script>');
(async()=>{
  const {chromium}=require('playwright-core'), binary=process.env.CHROMIUM_EXECUTABLE_PATH ? null : require('@sparticuz/chromium');
  const engine=binary?.default??binary;
  const server=http.createServer((req,res)=>{
    const url=new URL(req.url,'http://localhost');const file=path.join(out,url.pathname==='/'?'index.html':path.basename(url.pathname));
    if(!fs.existsSync(file)){res.writeHead(404);return res.end();}
    res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));
  });
  await new Promise(r=>server.listen(0,'0.0.0.0',r));
  let browser;
  try{
    browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH??await engine.executablePath(),args:engine?.args??[],headless:true});
    const page=await browser.newPage({viewport:{width:1100,height:1400}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
    const url=`http://127.0.0.1:${server.address().port}`;
    for(const width of [1100,390]){
      await page.setViewportSize({width,height:1400});await page.goto(url);await page.locator('.paper-sheet').first().waitFor();await page.waitForFunction(()=>document.querySelectorAll('.paper-sheet .english-reference-question').length===8);
      await page.evaluate(()=>document.fonts.ready);
      assert.equal(await page.locator('.paper-sheet').count(),1,'Reference-sized paper must fit one A4 page');
      const text=await page.locator('.paper-sheet').innerText();
      for(const s of ['Returning home, my mother','The secret of success','The old man said','250 words','30 Marks','20 Marks'])assert.ok(text.includes(s),s);
      assert.equal(await page.locator('.paper-sheet .english-mark-formula').count(),8);
      assert.equal(await page.locator('.paper-sheet th').count(),0);assert.equal(await page.locator('.paper-sheet .english-clue-box').count(),0);
      assert.doesNotMatch(text,/\(a\)\s*\(a\)|Writing task\s*\(|Topic:/);
      const overflow=await page.locator('.paper-sheet').evaluate(sheet=>{const r=sheet.getBoundingClientRect();return [...sheet.querySelectorAll('.english-reference-question')].some(q=>q.getBoundingClientRect().bottom>r.bottom-12);});assert.equal(overflow,false,'No question crosses the page bottom');
      await page.locator('.paper-sheet').screenshot({path:path.join(out,`reference-${width}.png`)});
      await page.pdf({path:path.join(out,`reference-${width}.pdf`),format:'A4',printBackground:true,preferCSSPageSize:true});
      const pdf=await require('pdf-lib').PDFDocument.load(fs.readFileSync(path.join(out,`reference-${width}.pdf`)));assert.equal(pdf.getPageCount(),1);
    }
    for(let i=0;i<40;i++){
      await page.goto(url+'/?model='+i);await page.waitForFunction(()=>document.querySelectorAll('.paper-sheet .english-reference-question').length===8);
      assert.equal(await page.locator('.paper-sheet').count(),1,'Approved-library rotation '+i+' should fit one A4 page');
      assert.equal(await page.locator('.paper-sheet .english-mark-formula').count(),8);
      const visible=await page.locator('.paper-sheet').innerText();
      for(const t of library[i].items.flatMap(q=>q.englishGroup.tasks))assert.ok(visible.includes(t.instruction.split('\n').at(-1).slice(0,25)),'Missing library content '+i+'/'+t.id);
    }
    // Deliberately oversized input must remain visible and receive an overflow warning,
    // not be silently shrunk to unreadable text or have any tail removed.
    await page.goto(url+'/?long=1');await page.waitForFunction(()=>document.querySelectorAll('.paper-sheet').length>1);
    assert.ok((await page.locator('.paper-sheet').allTextContents()).join(' ').includes('Extra contextual text must not be clipped or lost.'));
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({ok:true,desktopAndMobile:'one A4 page; eight tasks and formulas; passages present; no clipping',pdfPages:1,libraryRotations:40,oversized:'retained, multi-page fallback',artifacts:out}));
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
