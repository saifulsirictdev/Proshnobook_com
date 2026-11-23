const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const puppeteer=require('puppeteer-core'),chromium=require('@sparticuz/chromium').default;
(async()=>{
 const browser=await puppeteer.launch({args:chromium.args,executablePath:await chromium.executablePath(),headless:true});
 const page=await browser.newPage();const results=[];
 for(const ch of [5,6])for(const width of [1280,390]){
  await page.setViewport({width,height:1000,deviceScaleFactor:1});
  const requests=[];page.on('request',r=>{if(r.url().startsWith('http'))requests.push(r.url())});
  await page.goto('file://'+path.resolve(`docs/question-bank/ssc-physics/chapter-${ch}-review.html`),{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
  const expected=ch===5?{articles:330,diagrams:195}:{articles:420,diagrams:95};
  const metrics=await page.evaluate(()=>({articles:document.querySelectorAll('article').length,diagrams:document.querySelectorAll('svg').length,overflow:document.documentElement.scrollWidth>innerWidth,font:document.fonts.check('18px Bn')}));
  assert.equal(metrics.articles,expected.articles);assert.equal(metrics.diagrams,expected.diagrams);assert.equal(metrics.overflow,false);assert.equal(metrics.font,true);assert.equal(requests.length,0);
  const selector=ch===5?'svg[aria-label="hydraulic diagram"]':'svg[aria-label="heating diagram"]';const el=await page.$(selector);const article=await el.evaluateHandle(n=>n.closest('article'));
  await article.evaluate(n=>n.querySelector('details').open=true);
  await article.asElement().screenshot({path:`docs/question-bank/ssc-physics/chapter-${ch}-diagram-${width}.png`});
  results.push({chapter:ch,width,...metrics,externalRequests:requests.length});
 }
 await browser.close();fs.writeFileSync('docs/question-bank/ssc-physics/ch5-6-browser-check.json',JSON.stringify({scope:'Offline review HTML only; not live-site or DB verification',checks:results},null,2)+'\n');console.log(results);
})().catch(e=>{console.error(e);process.exit(1)});
