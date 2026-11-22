/** Offline review-gallery browser checks, NOT a deployed editor/PDF workflow test.
 * Run after build-ssc-math-ch6-review.cjs. Dev-only playwright-core/@sparticuz/chromium.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const chapter=Number(process.argv[2]);if(![7,8,9,10,11,12,13,14,15,16].includes(chapter))throw Error('Pass a chapter from 7 through 16');const total=chapter>=11?270:({7:250,8:530,9:470,10:320})[chapter];
const manifest=JSON.parse(fs.readFileSync(`content/question-bank/ssc/math/chapter-${chapter}/targets-v1-manifest.json`,'utf8'));
const diagramTotal=Object.values(manifest.illustratedCounts).reduce((a,b)=>a+b,0);
(async()=>{
 const m=require('@sparticuz/chromium'),c=m.default||m,{chromium}=require('playwright-core');
 const browser=await chromium.launch({executablePath:await c.executablePath(),args:c.args.filter(a=>a!=='--single-process'),headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:1100}}),errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))external.push(r.url())});
  const url='file://'+path.resolve(`docs/question-bank/ssc-math-ch${chapter}-illustrated-review.html`);
  await page.goto(url);await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('article').count(),total);assert.equal(await page.locator('figure > svg').count(),diagramTotal);
  const clipped=await page.locator('figure > svg text').evaluateAll(nodes=>nodes.flatMap(t=>{const b=t.getBBox();return b.x<0||b.y<0||b.x+b.width>345||b.y+b.height>290?[t.textContent]:[]}));
  assert.deepEqual(clipped,[]);assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  fs.mkdirSync('.cache/geometry-review',{recursive:true});await page.screenshot({path:`.cache/geometry-review/ch${chapter}-desktop.png`});
  await page.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));
  for(const [name,index] of (chapter===7?[['construction',150],['bisector',10],['impossible',20]]:chapter===8?[['tangents',6],['chord',19],['proof',300]]:chapter===9?[['source',4],['ratios',250],['identity',261]]:chapter===10?[['source',5],['model',156],['stations',158],['opposite',159]]:[['source',0],['model',152],['worked',157],['short',210]])){await page.locator('article').nth(index).screenshot({path:`.cache/geometry-review/ch${chapter}-${name}.png`});}
  await page.setViewportSize({width:390,height:900});await page.goto(url);await page.evaluate(()=>document.fonts.ready);
  if(chapter>=9)await page.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  fs.writeFileSync(`docs/question-bank/ssc-math-ch${chapter}-browser-check.json`,JSON.stringify({status:'LOCAL_OFFLINE_REVIEW_GALLERY_PASS_NOT_PRODUCTION_PAPER_PROOF',questions:total,inlineSVG:diagramTotal,desktopWidth:1200,mobileWidth:390,externalRequests:0,pageErrors:0,clippedSVGText:0,productionImageAvailabilityVerified:false,notes:'Browser rendering of offline MathML/SVG review gallery only, not deployed editor/PDF workflow or independent semantic diagram/proof approval.'},null,2)+'\n');
  await page.screenshot({path:`.cache/geometry-review/ch${chapter}-mobile.png`});
  console.log(`PASS: ${total} records, ${diagramTotal} SVGs; desktop/mobile offline gallery, no external requests/page errors/clipped SVG text/mobile overflow. Not production proof.`);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
