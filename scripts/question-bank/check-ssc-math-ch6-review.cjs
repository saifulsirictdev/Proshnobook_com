/** Offline review-gallery browser checks, NOT a deployed editor/PDF workflow test.
 * Run after build-ssc-math-ch6-review.cjs. Dev-only playwright-core/@sparticuz/chromium.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const m=require('@sparticuz/chromium'),c=m.default||m,{chromium}=require('playwright-core');
 const browser=await chromium.launch({executablePath:await c.executablePath(),args:c.args.filter(a=>a!=='--single-process'),headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:1100}}),errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))external.push(r.url())});
  const url='file://'+path.resolve('docs/question-bank/ssc-math-ch6-illustrated-review.html');
  await page.goto(url);await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('article').count(),230);assert.equal(await page.locator('svg').count(),229);
  const clipped=await page.locator('svg text').evaluateAll(nodes=>nodes.flatMap(t=>{const b=t.getBBox();return b.x<0||b.y<0||b.x+b.width>345||b.y+b.height>290?[t.textContent]:[]}));
  assert.deepEqual(clipped,[]);assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  await page.setViewportSize({width:390,height:900});await page.goto(url);await page.evaluate(()=>document.fonts.ready);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  fs.writeFileSync('docs/question-bank/ssc-math-ch6-browser-check.json',JSON.stringify({status:'LOCAL_OFFLINE_REVIEW_GALLERY_PASS_NOT_PRODUCTION_PAPER_PROOF',questions:230,inlineSVG:229,desktopWidth:1200,mobileWidth:390,externalRequests:0,pageErrors:0,clippedSVGText:0,productionImageAvailabilityVerified:false,notes:'Browser rendering of offline MathML/SVG review gallery only, not deployed editor/PDF workflow or independent semantic diagram/proof approval.'},null,2)+'\n');
  console.log('PASS: 230 records, 229 SVGs; desktop/mobile offline gallery, no external requests/page errors/clipped SVG text/mobile overflow. Not production proof.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
