const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const puppeteer=require('puppeteer-core'),chromium=require('@sparticuz/chromium').default;
(async()=>{
 const browser=await puppeteer.launch({args:chromium.args,executablePath:await chromium.executablePath(),headless:true});
 try{
  const page=await browser.newPage(),results=[];
  for(const ch of [8,9,10,11,12,13,14,'combined'])for(const width of [1280,390]){
   await page.setViewport({width,height:1000,deviceScaleFactor:1});
   const requests=[];const listener=r=>{if(r.url().startsWith('http'))requests.push(r.url())};page.on('request',listener);
   const file=ch==='combined'?'chapters-8-14-review.html':`chapter-${ch}-review.html`;
   await page.goto('file://'+path.resolve('docs/question-bank/ssc-physics/'+file),{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
   await page.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));
   const metrics=await page.evaluate(()=>({articles:document.querySelectorAll('article').length,diagrams:document.querySelectorAll('svg').length,overflow:document.documentElement.scrollWidth>innerWidth,font:document.fonts.check('18px Bn'),clippedSvgLabels:[...document.querySelectorAll('svg text')].flatMap(t=>{const b=t.getBBox(),v=t.ownerSVGElement.viewBox.baseVal;return b.x<0||b.y<0||b.x+b.width>v.width||b.y+b.height>v.height?[{label:t.textContent,diagram:t.ownerSVGElement.getAttribute('aria-label'),box:{x:b.x,y:b.y,width:b.width,height:b.height},viewBox:{width:v.width,height:v.height}}]:[]})}));
   assert.equal(metrics.articles,ch==='combined'?3290:470);assert.equal(metrics.diagrams,({8:225,9:150,10:180,11:220,12:365,13:200,14:380,combined:1720})[ch]);assert.equal(metrics.overflow,false);assert.equal(metrics.font,true);assert.equal(requests.length,0);
   assert.deepEqual(metrics.clippedSvgLabels,[]);
   if(ch!=='combined'){
    const kind=({8:'concave',9:'lens-positive',10:'charges',11:'mixed',12:'transformer',13:'rectifier',14:'xray'})[ch];
    const svg=await page.$(`article[data-kind="CQ"] svg[aria-label="${kind} diagram"]`);assert.ok(svg);
    const article=await svg.evaluateHandle(n=>n.closest('article'));await article.asElement().screenshot({path:`docs/question-bank/ssc-physics/ch8-14-ch${ch}-${width}.png`});
   }
   page.off('request',listener);results.push({chapter:ch,width,...metrics,externalRequests:requests.length,answersOpened:true});console.log(ch,width,'PASS');
  }
  fs.writeFileSync('docs/question-bank/ssc-physics/ch8-14-browser-check.json',JSON.stringify({scope:'Offline HTML only; all answer details open; label clipping checks, not teacher certification or live site testing',checks:results},null,2)+'\n');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
