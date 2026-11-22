/** Offline component browser proof; no auth/server-action/DB claims. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {build,response}=require('./server.cjs');
(async()=>{
  await build();
  const {chromium}=require('playwright-core');
  const m=require('@sparticuz/chromium'), c=m.default||m;
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||await c.executablePath(),args:c.args.filter(a=>a!=='--single-process'),headless:true});
  const proof=path.resolve('samples/ssc-math/proof');fs.mkdirSync(proof,{recursive:true});
  const results=[];
  try {
    for(const width of [1280,390]){
      const context=await browser.newContext({viewport:{width,height:900}});
      // Reserved synthetic HTTPS origin satisfies the real production image URL safety policy.
      // Only transport is intercepted; all JS, schema, fields and renderer run unmodified.
      const origin='https://math-sample.invalid';const errors=[];const external=[];
      await context.route('**/*',route=>{
        const u=route.request().url();if(!u.startsWith(origin+'/')){external.push(u);return route.abort();}
        const r=response(u);return route.fulfill({status:r.status||200,body:r.body,contentType:r.contentType});
      });
      const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
      await page.goto(origin);await page.evaluate(()=>document.fonts.ready);
      const sheet=()=>page.locator('#paper .paper-sheet');
      await page.waitForFunction(()=>document.querySelectorAll('#paper .paper-sheet .paper-image-wrap img').length===3);
      await page.waitForFunction(()=>[...document.querySelectorAll('#paper .paper-sheet img')].every(i=>i.complete&&i.naturalWidth>0));
      assert.equal(await sheet().locator('.paper-question').count(),3);
      assert.equal(await sheet().locator('.katex-error').count(),0);
      const sourceToggle=page.getByRole('switch',{name:'প্রশ্নের পাশে বোর্ড/স্কুলের নাম, সাল ও মূল প্রশ্ন নম্বর দেখান',exact:true});
      assert.equal(await sheet().locator('.paper-provenance').count(),0,'hidden by default');
      await sourceToggle.check();
      assert.equal(await sheet().locator('.paper-provenance').count(),3);
      for(const label of await sheet().locator('.paper-provenance').allTextContents()){
        assert.match(label,/রাজউক উত্তরা মডেল কলেজ/);assert.doesNotMatch(label,/বোর্ড|২০২৪|২০২৬/);
      }
      await sourceToggle.uncheck();assert.equal(await sheet().locator('.paper-provenance').count(),0);
      await sourceToggle.check();
      const field=page.getByRole('textbox',{name:'প্রশ্নের লেখা',exact:true});
      const edited=(await field.inputValue())+'\nসঠিক উত্তর নির্বাচন করো।';await field.fill(edited);
      await page.waitForFunction(()=>document.querySelector('#paper .paper-sheet')?.textContent.includes('সঠিক উত্তর নির্বাচন করো।'));
      const images=sheet().locator('.paper-image-wrap');
      const size=await images.first().locator('img').evaluate(i=>i.getBoundingClientRect().width);
      await images.first().getByRole('button',{name:'+',exact:true}).click();
      await page.getByRole('button',{name:'নমুনা সেভ',exact:true}).click();
      await page.reload();await page.getByRole('button',{name:'পুনরায় খুলুন',exact:true}).click();
      assert.equal(await field.inputValue(),edited);
      assert.equal(await sourceToggle.isChecked(),true,'display toggle survives saved settings restore');
      assert.equal(await sheet().locator('.paper-provenance').count(),3);
      await page.waitForFunction(()=>[...document.querySelectorAll('#paper .paper-sheet img')].every(i=>i.complete&&i.naturalWidth>0));
      assert.equal(await sheet().locator('.paper-question').count(),3);
      assert.equal(await images.first().locator('img').evaluate(i=>Math.round(i.getBoundingClientRect().width)),Math.round(size*1.1));
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'no horizontal page overflow');
      // Review panel/solutions are excluded; the opted-in per-question source remains.
      await page.screenshot({path:path.join(proof,`editor-${width}.png`),fullPage:true});
      await page.emulateMedia({media:'print'});
      assert.equal(await page.locator('.sample-tools').isVisible(),false);
      await page.pdf({path:path.join(proof,width===1280?'sample.pdf':'sample-mobile.pdf'),preferCSSPageSize:true,printBackground:true});
      await page.emulateMedia({media:'screen'});await sourceToggle.uncheck();
      assert.equal(await sheet().locator('.paper-provenance').count(),0);
      await page.emulateMedia({media:'print'});
      await page.pdf({path:path.join(proof,width===1280?'sample-without-source.pdf':'sample-mobile-without-source.pdf'),preferCSSPageSize:true,printBackground:true});
      assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
      results.push({width,questions:3,loadedDiagrams:3,textEdit:true,imageResize:true,localSaveReloadReopen:true,sourceToggleOnOff:true,sourceToggleRestored:true,sourceLabels:3,noInventedBoardOrYear:true,mathErrors:0,pageOverflow:false,pdfWithAndWithoutSources:true});
      await context.close();
    }
    fs.writeFileSync(path.join(proof,'browser-results.json'),JSON.stringify({scope:'Unmodified production PaperPreview/RichTextField/settings schema in isolated offline harness. Browser localStorage only, NOT authenticated app/database-save proof.',results},null,2)+'\n');
    console.log(JSON.stringify(results,null,2));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
