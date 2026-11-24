const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const puppeteer=require('puppeteer-core'),chromium=require('@sparticuz/chromium').default;
(async()=>{
 const browser=await puppeteer.launch({args:chromium.args,executablePath:await chromium.executablePath(),headless:true});
 try{
  const page=await browser.newPage(),results=[];
  for(const width of [1280,390]){
   await page.setViewport({width,height:1000,deviceScaleFactor:1});
   const requests=[];const listener=r=>{if(r.url().startsWith('http'))requests.push(r.url())};page.on('request',listener);
   await page.goto('file://'+path.resolve('docs/question-bank/ssc-physics/chapter-7-review.html'),{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
   await page.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));
   const metrics=await page.evaluate(()=>({articles:document.querySelectorAll('article').length,diagrams:document.querySelectorAll('svg').length,overflow:document.documentElement.scrollWidth>innerWidth,font:document.fonts.check('18px Bn'),clippedSvgLabels:[...document.querySelectorAll('svg text')].flatMap(t=>{const b=t.getBBox(),v=t.ownerSVGElement.viewBox.baseVal;return b.x<0||b.y<0||b.x+b.width>v.width||b.y+b.height>v.height?[{label:t.textContent,diagram:t.ownerSVGElement.getAttribute('aria-label'),box:{x:b.x,y:b.y,width:b.width,height:b.height},viewBox:{width:v.width,height:v.height}}]:[]})}));
   assert.equal(metrics.articles,370);assert.equal(metrics.diagrams,195);assert.equal(metrics.overflow,false);assert.equal(metrics.font,true);assert.equal(requests.length,0);
   assert.deepEqual(metrics.clippedSvgLabels,[]);
   for(const [kind,family] of [['longitudinal','wave-speed'],['space-wave','graph-wavelength'],['time-wave','graph-period'],['amplitude','graph-amplitude'],['well','well'],['echo-toward','moving-toward'],['echo-away','moving-away'],['two-paths','two-paths']]){
    const svg=await page.$(`article[data-kind="CQ"] svg[aria-label="${kind} diagram"]`);assert.ok(svg);
    const article=await svg.evaluateHandle(n=>n.closest('article'));
    await article.asElement().screenshot({path:`docs/question-bank/ssc-physics/ch7-${family}-${width}.png`});
   }
   page.off('request',listener);results.push({chapter:7,width,...metrics,externalRequests:requests.length,answersOpened:true});
  }
  fs.writeFileSync('docs/question-bank/ssc-physics/ch7-browser-check.json',JSON.stringify({scope:'Offline review HTML only; checks all labels for viewBox clipping, not teacher certification or live deployment',checks:results},null,2)+'\n');console.log(results);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
