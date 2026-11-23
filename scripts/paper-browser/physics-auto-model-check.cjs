/** Real Physics paper preview at desktop/mobile/print; local fixtures, no DB or APIs.
 * NODE_PATH=.cache/physics-model-browser/node_modules node scripts/paper-browser/physics-auto-model-check.cjs
 */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'.cache/physics-model-preview');fs.mkdirSync(out,{recursive:true});
const release=require('../question-bank/release-ssc-physics.cjs'),api=release.load();
// Frozen draft/publication fixture only, no DB or publish call.
const plan=release.prepare({...api,autoModelBlueprint:()=>null});
const fixtures={};
for(const variant of ['MCQ','CQ']){let n=17;const r=api.assembleSubjectAutoModel(plan.records,'SSC','পদার্থবিজ্ঞান',variant,()=>((n=(n*1664525+1013904223)>>>0)/4294967296));assert.equal(r.ok,true);fixtures[variant]=r.ids.map(id=>plan.records.find(q=>q.id===id));}
fs.writeFileSync(path.join(out,'fixtures.json'),JSON.stringify(fixtures));
fs.writeFileSync(path.join(out,'entry.jsx'),`
import React,{useState} from 'react';import {createRoot} from 'react-dom/client';
import Preview from '${root}/components/paper-builder/preview';
import {autoModelSettings,autoModelSections,autoModelIssues} from '${root}/lib/auto-model-paper';
import {restoreSettings} from '${root}/lib/paper-builder';
import '${root}/components/paper-builder/paper.css';import '${root}/node_modules/katex/dist/katex.min.css';import fixtures from './fixtures.json';
function App(){
 const [variant,setVariant]=useState(localStorage.getItem('variant')||'CQ'),[remove,setRemove]=useState(false);
 const fresh=autoModelSettings('SSC','পদার্থবিজ্ঞান',variant);
 const settings=restoreSettings(JSON.parse(JSON.stringify(fresh)));
 const items=fixtures[variant].map(q=>({...q,type:q.correct?'MCQ':q.options.subQuestions?'CQ':'SHORT',stimulus:q.options.stimulus,subQuestions:q.options.subQuestions,options:q.correct?q.options:undefined})).filter((q,i)=>!remove||i!==0);
 const sections=autoModelSections(items,settings),issues=autoModelIssues(items,settings);
 return <main><nav data-noprint><button id="mcq" onClick={()=>{setVariant('MCQ');setRemove(false);localStorage.setItem('variant','MCQ')}}>MCQ</button><button id="written" onClick={()=>{setVariant('CQ');setRemove(false);localStorage.setItem('variant','CQ')}}>Written</button><button id="remove" onClick={()=>setRemove(!remove)}>Remove first</button></nav><div id="readiness" data-ready="true" data-variant={variant} data-count={items.length} data-issues={issues.length}>{issues.join(' ')}</div><div id="paper" className="paper-builder-root"><Preview s={settings} questions={sections[0].questions} type={sections[0].type} sections={sections} title={sections[0].title} setName="ক" duplicate={new Set()} onImageSize={()=>{}} readOnly/></div></main>;
}createRoot(document.getElementById('root')).render(<App/>);`);
require('esbuild').buildSync({entryPoints:[path.join(out,'entry.jsx')],bundle:true,outfile:path.join(out,'app.js'),jsx:'automatic',loader:{'.woff2':'file','.woff':'file','.ttf':'file'},alias:{'@':root},nodePaths:[path.join(root,'node_modules')],external:['/fonts/*'],define:{'process.env.NODE_ENV':'"production"'}});
execFileSync(path.join(root,'node_modules/.bin/tailwindcss'),['-i',path.join(root,'app/globals.css'),'-o',path.join(out,'global.css'),'--content',path.join(root,'components/paper-builder/*.{tsx,css}'),'--minify'],{cwd:root,stdio:'pipe'});
fs.writeFileSync(path.join(out,'index.html'),'<!doctype html><html lang="bn"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/global.css"><link rel="stylesheet" href="/app.css"><style>@font-face{font-family:DocumentBangla;src:url(/fonts/HindSiliguri-Regular.ttf)}@font-face{font-family:QmPaperKalpurush;src:url(/fonts/Kalpurush.woff2)}:root{--font-en:serif;--font-bn:DocumentBangla;--qk-body:DocumentBangla}*{box-sizing:border-box}body{margin:0;background:#eef2f6;font-family:DocumentBangla}main{padding:12px;max-width:100%}#paper{overflow:auto;max-width:100%}nav{display:flex;gap:12px;margin-bottom:12px}button{padding:8px}@media print{nav,#readiness{display:none}#paper{overflow:visible}}</style><div id="root"></div><script src="/app.js"></script></html>');
(async()=>{
 const {chromium}=require('playwright-core'),pkg=require('@sparticuz/chromium'),engine=pkg.default??pkg;
 const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://localhost'),p=u.pathname;
  const file=p.startsWith('/question-bank/')?path.join(root,'public',p):p==='/fonts/AdorshoLipi.ttf'?path.join(root,'app/fonts/AdorshoLipi.ttf'):p.startsWith('/fonts/')?path.join(root,'public/fonts',path.basename(p)):path.join(out,p==='/'?'index.html':path.basename(p));
  if(!fs.existsSync(file)){res.writeHead(404);return res.end();}res.setHeader('Content-Type',file.endsWith('.svg')?'image/svg+xml':file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':file.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream');res.end(fs.readFileSync(file));
 });await new Promise(r=>server.listen(0,'0.0.0.0',r));
 let browser;try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||await engine.executablePath(),args:engine.args});const reports=[],context=await browser.newContext();
  for(const width of [1280,390]){
   const page=await context.newPage(),errors=[];await page.setViewportSize({width,height:960});page.on('pageerror',e=>errors.push(e.message));
   await page.route('https://proshnobook.com/question-bank/**',route=>route.fulfill({status:200,contentType:'image/svg+xml',body:fs.readFileSync(path.join(root,'public',new URL(route.request().url()).pathname))}));
   await page.goto(`http://127.0.0.1:${server.address().port}`);await page.locator('#readiness[data-ready="true"]').waitFor({state:"attached"});await page.evaluate(()=>document.fonts.ready);
   for(const [button,variant,count] of [['written','CQ',14],['mcq','MCQ',25]]){
    await page.click('#'+button);try{await page.locator(`#readiness[data-variant="${variant}"][data-count="${count}"][data-issues="0"]`).waitFor({state:"attached",timeout:10000});}catch(e){console.error('readiness-errors',errors,await page.locator('body').innerText());throw e;}
    await page.waitForFunction(()=>[...document.querySelectorAll('#paper img')].every(img=>img.complete&&img.naturalWidth>0));
    const text=await page.locator('#paper').innerText();assert.ok(text.includes(variant==='CQ'?'সৃজনশীল':'নৈর্ব্যক্তিক'));assert.match(text,/180|১৮০/);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2),false);
    await page.screenshot({path:path.join(out,`physics-${variant}-${width}.png`),fullPage:false});
    await page.emulateMedia({media:'print'});assert.ok(await page.locator('#paper').innerText());await page.emulateMedia({media:'screen'});
    reports.push({width,variant,count,issues:0,imagesLoaded:true,outerOverflow:false,print:true});
   }
   await page.reload();await page.locator('#readiness[data-variant="MCQ"][data-issues="0"]').waitFor({state:"attached"});await page.click('#remove');assert.ok(Number(await page.locator('#readiness').getAttribute('data-issues'))>0);assert.match(await page.locator('#paper').innerText(),/অসম্পূর্ণ/);assert.deepEqual(errors,[]);await page.close();
  }
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({status:'PASS',reports,settingsReload:true,editedQuotaWarning:true,fixture:'actual canonical stock; local assets, no DB'},null,2));console.log('PASS Physics browser preview: 4 desktop/mobile MCQ/written + print/settings reload/edited quota checks');
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
