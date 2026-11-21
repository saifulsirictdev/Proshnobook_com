/** Real Preview + locally prepared grade-specific content, no auth/DB/provider.
 * NODE_PATH=.cache/expanded/browser-tools/node_modules LD_LIBRARY_PATH=<chromium libs> node scripts/english-browser/expanded-model-check.cjs
 */
const {root}=require('../../tests/helpers/class8-reference.cjs');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const {preparedEnglishItems}=require('../../lib/english/prepared-items.ts');
const {assembleEnglishItems}=require('../../lib/english/item-bank.ts');
const {englishLegacyPaper}=require('../../lib/english/legacy-builder.ts');
const out=path.join(root,'.cache/expanded/browser');fs.mkdirSync(out,{recursive:true});
const models=[6,7,8,10,11,12].flatMap(grade=>[1,2].map(paper=>{
 const assembled=assembleEnglishItems(preparedEnglishItems(grade,paper).map(p=>p.draft),grade,()=>0,undefined,{},paper);assert.ok(assembled.draft);
 return {grade,paper,model:englishLegacyPaper(assembled.draft)};
}));
fs.writeFileSync(path.join(out,'models.json'),JSON.stringify(models));
fs.writeFileSync(path.join(out,'entry.jsx'),`import React from 'react';import {createRoot} from 'react-dom/client';import Preview from '${root}/components/paper-builder/preview';import '${root}/components/paper-builder/paper.css';import models from './models.json';
const q=new URLSearchParams(location.search),p=models[Number(q.get('model')||0)].model;
if(q.has('landscape')){p.settings.cfg.orientation='landscape';p.settings.cfg.booklet=true;}
createRoot(document.getElementById('root')).render(<div id="paper" className="paper-builder-root"><Preview s={p.settings} questions={p.items.map(q=>({q,opts:[],ci:0}))} type="SHORT" setName="A" duplicate={new Set()} onImageSize={()=>{}} title="English Question Paper"/></div>);`);
require('esbuild').buildSync({entryPoints:[path.join(out,'entry.jsx')],bundle:true,outfile:path.join(out,'app.js'),jsx:'automatic',alias:{'@':root},nodePaths:[path.join(root,'node_modules')],external:['/fonts/*'],define:{'process.env.NODE_ENV':'"production"'}});
execFileSync(path.join(root,'node_modules/.bin/tailwindcss'),['-i',path.join(root,'app/globals.css'),'-o',path.join(out,'global.css'),'--content',path.join(root,'components/paper-builder/*.{tsx,css}'),'--minify'],{cwd:root,stdio:'pipe'});
fs.writeFileSync(path.join(out,'index.html'),'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/global.css"><link rel="stylesheet" href="/app.css"><style>@font-face{font-family:DocumentEnglish;src:url(/fonts/Tinos-Regular.ttf)}@font-face{font-family:DocumentEnglish;src:url(/fonts/Tinos-Bold.ttf);font-weight:700}@font-face{font-family:DocumentBangla;src:url(/fonts/AdorshoLipi.ttf);unicode-range:U+0980-09FF,U+200C-200D}:root{--font-en:DocumentEnglish;--font-bn:DocumentBangla}body{margin:0;background:#eee}@page{size:A4;margin:0}</style><div id="root"></div><script src="/app.js"></script>');
const normalize=s=>s.replace(/\s+/g,' ').trim();
(async()=>{
 const {chromium}=require('playwright-core'),pkg=process.env.CHROMIUM_EXECUTABLE_PATH?null:require('@sparticuz/chromium'),engine=pkg?.default??pkg;
 const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://localhost'),file=u.pathname==='/fonts/AdorshoLipi.ttf'?path.join(root,'app/fonts/AdorshoLipi.ttf'):u.pathname.startsWith('/fonts/')?path.join(root,'public/fonts',path.basename(u.pathname)):path.join(out,u.pathname==='/'?'index.html':path.basename(u.pathname));if(!fs.existsSync(file)){res.writeHead(404);return res.end();}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.ttf')?'font/ttf':'text/html');res.end(fs.readFileSync(file));});
 await new Promise(r=>server.listen(0,'0.0.0.0',r));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH??await engine.executablePath(),args:engine?.args??[],headless:true});
  const page=await browser.newPage(),errors=[],results=[];page.on('pageerror',e=>errors.push(String(e)));
  const url=`http://127.0.0.1:${server.address().port}`;
  for(let index=0;index<models.length;index++)for(const width of [1100,390]){
   const {grade,paper,model}=models[index];await page.setViewportSize({width,height:1400});await page.goto(url+'/?model='+index);await page.locator('.paper-sheet').first().waitFor();await page.evaluate(()=>document.fonts.ready);
   // Wait until all selected task numbers have reached the visible sheets.
   const count=model.items.flatMap(q=>q.englishGroup.tasks).length;
   await page.waitForFunction(n=>[...document.querySelectorAll('.paper-sheet .english-question-heading')].filter(e=>e.textContent.trim()).length>=n,count);
   const text=normalize((await page.locator('.paper-sheet .paper-question').allTextContents()).join(' '));fs.writeFileSync(path.join(out,`text-${grade}-${paper}-${width}.txt`),text);
   for(const q of model.items){for(const p of q.englishGroup.passages)for(const line of p.text.split('\n').filter(l=>l.trim()))assert.ok(text.includes(normalize(line)),`${grade}/${paper}: lost passage ${p.key}: ${line}`);
    for(const t of q.englishGroup.tasks){
     assert.ok(text.includes(normalize(t.instruction.split('\n')[0].replace(/^Writing task\s*\([^)]*\)\.\s*Topic:\s*/i,''))),`${grade}/${paper}: lost instruction ${t.id}`);
     if(t.answer)assert.ok(!text.includes(normalize(t.answer)),`${grade}/${paper}: answer leak ${t.id}`);
     for(const row of t.table?.rows??[])for(const cell of row)assert.ok(text.includes(normalize(cell)),`${grade}/${paper}: lost table cell`);
    }
   }
   assert.doesNotMatch(text,/\(a\)\s*\(a\)|Fill gap \(|Match the sentence parts|Complete step/);
   const overflow=await page.locator('.paper-sheet').evaluateAll(sheets=>sheets.some(sheet=>{const r=sheet.getBoundingClientRect();return [...sheet.querySelectorAll('.paper-question')].some(q=>q.getBoundingClientRect().bottom>r.bottom+1)}));
   assert.equal(overflow,false,`${grade}/${paper}/${width}: question crosses page bottom`);
   assert.equal(await page.locator('.paper-sheet .english-mark-formula').count(),count,`${grade}/${paper}: every task needs visible marks`);
   const file=`class${grade}-paper${paper}-${width}`;
   await page.pdf({path:path.join(out,file+'.pdf'),format:'A4',printBackground:true,preferCSSPageSize:true});
   const pdf=await require('pdf-lib').PDFDocument.load(fs.readFileSync(path.join(out,file+'.pdf')));assert.ok(pdf.getPageCount()>0);assert.ok(fs.statSync(path.join(out,file+'.pdf')).size>10000,'PDF must contain actual printed content');
   if([7,8,11].includes(grade)&&paper===1&&width===1100)await page.locator('.paper-sheet').first().screenshot({path:path.join(out,file+'.png')});
   results.push({grade,paper,width,pages:pdf.getPageCount()});
  }
  for(let index=0;index<models.length;index++){
   await page.setViewportSize({width:1100,height:1400});await page.goto(url+'/?model='+index+'&landscape=1');await page.locator('.paper-sheet').first().waitFor();
   const {model,grade,paper}=models[index],count=model.items.flatMap(q=>q.englishGroup.tasks).length;
   await page.waitForFunction(n=>[...document.querySelectorAll('.paper-sheet .english-question-heading')].filter(e=>e.textContent.trim()).length>=n,count);
   const t=normalize((await page.locator('.paper-sheet .paper-question').allTextContents()).join(' '));
   for(const item of model.items)for(const task of item.englishGroup.tasks)assert.ok(t.includes(normalize(task.instruction.split('\n')[0].replace(/^Writing task\s*\([^)]*\)\.\s*Topic:\s*/i,''))),'Landscape booklet must retain every task');
   const sheets=await page.locator('.paper-sheet').count(),order=require('../../lib/paper-builder.ts').bookletOrder(sheets);
   // Same padded page ordering and half-sheet clones as qb-builder's guarded print handler.
   await page.evaluate(order=>{
    const sheets=[...document.querySelectorAll('.paper-sheet')],output=document.createElement('div');output.className='booklet-output';
    for(const side of order){const row=document.createElement('div');row.className='booklet-imposed';row.style.cssText='width:297mm;height:210mm;display:flex;overflow:hidden;';
     for(const index of side){const cell=document.createElement('div');cell.style.cssText='width:148.5mm;height:210mm;overflow:hidden;display:flex;justify-content:center;align-items:center;';
      if(index!==null){const clone=sheets[index].cloneNode(true);clone.style.flexShrink='0';clone.querySelectorAll('[data-noprint]').forEach(n=>n.remove());cell.append(clone);}row.append(cell);
     }output.append(row);
    }
    const style=document.createElement('style');style.textContent='@media print{@page{size:297mm 210mm;margin:0}#root{display:none!important}body.booklet-print .booklet-output{display:block!important}.booklet-imposed{break-after:page!important}.booklet-imposed:last-child{break-after:auto!important}.booklet-imposed .paper-sheet{break-after:auto!important;page-break-after:auto!important}}';document.body.append(output,style);document.body.classList.add('booklet-print');
   },order);
   const pdfPath=path.join(out,`class${grade}-paper${paper}-booklet.pdf`);
   await page.pdf({path:pdfPath,printBackground:true,preferCSSPageSize:true});
   const pdf=await require('pdf-lib').PDFDocument.load(fs.readFileSync(pdfPath));assert.ok(pdf.getPages().every(p=>p.getWidth()>p.getHeight()));assert.equal(pdf.getPageCount(),order.length);
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'receipt.json'),JSON.stringify({ok:true,desktopMobile:results,landscapeModels:12,providerCalls:0,limitations:'Real renderer with local prepared data; not authenticated live UI or physical printing.'},null,2));console.log(fs.readFileSync(path.join(out,'receipt.json'),'utf8'));
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
