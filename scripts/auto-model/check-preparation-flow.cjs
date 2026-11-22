// Real starter + preparation + existing popup, isolated server-action/router transport.
// Does not bypass or test the production build route's existing checkout gate.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {build,response}=require('./server.cjs');
(async()=>{
 await build();
 const {chromium}=require('playwright-core');
 let executablePath=process.env.CHROMIUM_EXECUTABLE_PATH,args=['--no-sandbox'];
 if(!executablePath){const mod=require('@sparticuz/chromium'),c=mod.default||mod;executablePath=await c.executablePath();args=c.args.filter(a=>a!=='--single-process');}
 const browser=await chromium.launch({executablePath,args,headless:true});
 const proof=path.resolve('.cache/auto-model-flow-proof');fs.mkdirSync(proof,{recursive:true});const results=[];
 try{for(const width of [1280,390]){
  const ctx=await browser.newContext({viewport:{width,height:950}}),origin='https://flow.invalid',errors=[];
  await ctx.route('**/*',route=>{if(!route.request().url().startsWith(origin+'/'))return route.abort();const r=response(route.request().url());return route.fulfill({status:r.status||200,body:r.body,contentType:r.contentType});});
  const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
  const entry='/question-builder/auto-model?category=SSC&subject='+encodeURIComponent('গণিত')+'&variant=';
  async function starter(variant){
   await page.goto(origin+'/question-builder');
   await page.getByRole('button',{name:/^SSC/}).click();
   await page.getByRole('combobox',{name:'SSC বিভাগ',exact:true}).selectOption('general');
   await page.getByRole('combobox',{name:'বিষয়',exact:true}).selectOption('গণিত');
   await page.getByRole('button',{name:/Auto Model কাঠামো/}).click();
   await page.getByRole('button',{name:variant==='MCQ'?'MCQ নৈর্ব্যক্তিক':'CQ সৃজনশীল / লিখিত',exact:true}).click();
  }
  for(const variant of ['MCQ','CQ']){
   await starter(variant);
   await page.evaluate(()=>{sessionStorage.clear();sessionStorage.setItem('auto-test-delay','650');localStorage.setItem('qb:selected','["old"]');localStorage.setItem('qb:settings',JSON.stringify({edits:{old:{text:'old edit'}}}));});
   await page.getByRole('button',{name:/মডেল প্রস্তুত ও কাঠামো/}).click();
   const dialog=page.getByRole('dialog');await dialog.waitFor({state:'visible'});
   assert.match(await dialog.innerText(),/আপনার প্রশ্নপত্র তৈরি হচ্ছে/);
   assert.ok(!(await dialog.innerText()).includes(' AI'));
   assert.equal(await dialog.locator('progress').getAttribute('value'),null);
   await page.screenshot({path:path.join(proof,`loading-${variant}-${width}.png`),fullPage:true});
   await page.waitForURL('**/question-builder/build');
   const saved=await page.evaluate(()=>({ids:JSON.parse(localStorage.getItem('qb:selected')),settings:JSON.parse(localStorage.getItem('qb:settings')),calls:sessionStorage.getItem('auto-test-calls')}));
   assert.equal(saved.ids.length,variant==='MCQ'?30:23);assert.equal(new Set(saved.ids).size,saved.ids.length);
   assert.equal(saved.calls,'1');assert.deepEqual(saved.settings.edits,{});
   assert.equal(saved.settings.autoModel,variant==='MCQ'?'ssc-math-mcq-v1':'ssc-math-written-v1');
   assert.equal(await page.getByRole('button',{name:'মূল্য যাচাই ও সেটআপ →'}).count(),0);
   // replace prevents browser Back from preparing a second model.
   await page.goBack();await page.getByRole('combobox',{name:'বিষয়',exact:true}).waitFor();
   assert.equal(await page.evaluate(()=>sessionStorage.getItem('auto-test-calls')),'1');
  }
  for(const mode of ['shortage','network','storage']){
   await page.goto(origin+'/question-builder');
   await page.getByRole('button',{name:/^SSC/}).waitFor();
   await page.evaluate(mode=>{
    sessionStorage.clear();sessionStorage.setItem('auto-test-delay','80');
    localStorage.setItem('qb:selected','["old-draft"]');localStorage.setItem('qb:settings','{"old":"settings"}');
    if(mode==='shortage')sessionStorage.setItem('auto-test-shortage','1');
    if(mode==='network')sessionStorage.setItem('auto-test-network','1');
    if(mode==='storage'){
     const original=Storage.prototype.setItem;let failed=false;
     Storage.prototype.setItem=function(k,v){if(this===localStorage&&k==='qb:selected'&&!failed){failed=true;throw new DOMException('test only','QuotaExceededError');}return original.call(this,k,v);};
    }
    history.pushState({},'', '/question-builder/auto-model?category=SSC&subject='+encodeURIComponent('গণিত')+'&variant=MCQ');dispatchEvent(new Event('popstate'));
   },mode);
   const alert=page.getByRole('alert');await alert.waitFor({state:'visible'});
   assert.match(await alert.innerText(),mode==='shortage'?/প্রশ্নের ঘাটতি/:mode==='network'?/সংযোগে সমস্যা/:/স্টোরেজ পরীক্ষা/);
   assert.deepEqual(await page.evaluate(()=>[localStorage.getItem('qb:selected'),localStorage.getItem('qb:settings')]),['["old-draft"]','{"old":"settings"}']);
   assert.ok(page.url().includes('/auto-model?'));
   await page.evaluate(()=>{sessionStorage.setItem('auto-test-shortage','0');sessionStorage.setItem('auto-test-network','0');});
   await page.getByRole('button',{name:'আবার চেষ্টা করুন',exact:true}).click();
   await page.waitForURL('**/question-builder/build');
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('qb:selected')).length),30);
   assert.equal(await page.evaluate(()=>sessionStorage.getItem('auto-test-calls')),'2');
  }
  // Leaving mid-read must never overwrite the old draft or force late navigation.
  await page.goto(origin+'/question-builder');
  await page.getByRole('button',{name:/^SSC/}).waitFor();
  await page.evaluate(()=>{sessionStorage.clear();sessionStorage.setItem('auto-test-delay','350');localStorage.setItem('qb:selected','["keep"]');});
  await page.evaluate(url=>{history.pushState({},'',url);dispatchEvent(new Event('popstate'));},entry+'CQ');
  await page.getByRole('dialog').waitFor({state:'visible'});
  await page.evaluate(()=>{history.pushState({},'','/question-builder');dispatchEvent(new Event('popstate'));});
  await page.waitForTimeout(700);
  assert.equal(new URL(page.url()).pathname,'/question-builder');assert.equal(await page.evaluate(()=>localStorage.getItem('qb:selected')),'["keep"]');
  assert.deepEqual(errors,[]);await ctx.close();results.push({width,singleClick:true,existingProcessingPopup:true,mcq:30,written:23,noSuccessInterstitial:true,historyReplace:true,retry:true,shortageNetworkStoragePreserveDraft:true,cancelledReadNoLateNavigation:true,pageErrors:errors});
 }}finally{await browser.close();}
 fs.writeFileSync(path.join(proof,'results.json'),JSON.stringify({scope:'Isolated actual UI components, synthetic stock; not production auth/payment/DB proof',results},null,2)+'\n');console.log(JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
