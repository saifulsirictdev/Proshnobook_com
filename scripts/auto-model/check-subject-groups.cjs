// Real QbStart component in the local isolated harness. No live DB/auth/payment writes.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {build,response}=require('./server.cjs');
(async()=>{
 await build();const {chromium}=require('playwright-core');
 let executablePath=process.env.CHROMIUM_EXECUTABLE_PATH,args=['--no-sandbox'];
 if(!executablePath){const mod=require('@sparticuz/chromium'),c=mod.default||mod;executablePath=await c.executablePath();args=c.args.filter(a=>a!=='--single-process');}
 const browser=await chromium.launch({executablePath,args,headless:true});
 const dir='docs/proof/subject-groups';fs.mkdirSync(dir,{recursive:true});const results=[];
 try{for(const width of [1280,390]){
  const ctx=await browser.newContext({viewport:{width,height:1000}}),origin='https://ssc-groups.invalid',errors=[];
  await ctx.route('**/*',route=>{if(!route.request().url().startsWith(origin+'/'))return route.abort();const r=response(route.request().url());return route.fulfill({status:r.status||200,body:r.body,contentType:r.contentType})});
  const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(origin+'/question-builder');
  const subject=()=>page.getByRole('combobox',{name:'বিষয়',exact:true}),group=()=>page.getByRole('combobox',{name:'SSC বিভাগ',exact:true});
  const options=()=>subject().locator('option').evaluateAll(ns=>ns.map(n=>n.value).filter(Boolean));
  await page.getByRole('button',{name:/^SSC/}).click();assert.ok(await subject().isDisabled());assert.deepEqual(await options(),[]);
  assert.deepEqual(await group().locator('option').evaluateAll(ns=>ns.map(n=>n.textContent)),['— বিভাগ নির্বাচন করুন —','১. সাধারণ','২. বিজ্ঞান','৩. মানবিক','৪. ব্যবসা শিক্ষা']);
  for(const [id,want,not]of [['science','পদার্থবিজ্ঞান','হিসাববিজ্ঞান'],['humanities','পৌরনীতি ও নাগরিকতা','পদার্থবিজ্ঞান'],['business','হিসাববিজ্ঞান','জীববিজ্ঞান'],['general','গণিত','পদার্থবিজ্ঞান']]){await group().selectOption(id);const list=await options();assert.ok(list.includes(want));assert.ok(!list.includes(not));assert.equal(await subject().inputValue(),'');}
  await subject().selectOption('গণিত');await page.getByRole('button',{name:/Chapter অধ্যায়/}).click();await page.getByRole('combobox',{name:'প্রস্তুতির টপিক'}).selectOption({index:1});
  await page.getByRole('button',{name:/Auto Model কাঠামো/}).click();await page.getByRole('button',{name:'CQ সৃজনশীল / লিখিত',exact:true}).click();assert.match(await page.locator('fieldset').innerText(),/১৫টি সংক্ষিপ্ত/);
  await group().selectOption('science');assert.equal(await subject().inputValue(),'');assert.equal(await page.getByRole('button',{name:/Auto Model কাঠামো/}).count(),0);
  await group().selectOption('general');await subject().selectOption('English Grammar and Composition');assert.ok(await page.getByRole('combobox',{name:'English প্রশ্নপত্রের ধরন',exact:true}).isVisible());
  await group().selectOption('business');assert.equal(await page.getByRole('combobox',{name:'English প্রশ্নপত্রের ধরন',exact:true}).count(),0);
  for(const label of [/^HSC/,/^Admission$/,/^Job$/]){await page.getByRole('button',{name:label}).click();assert.equal(await group().count(),0);}
  await page.getByRole('button',{name:/^SSC/}).click();assert.equal(await group().inputValue(),'');assert.ok(await subject().isDisabled());
  await group().selectOption('general');await subject().selectOption('গণিত');await page.getByRole('button',{name:/Auto Model কাঠামো/}).click();await page.getByRole('button',{name:'CQ সৃজনশীল / লিখিত',exact:true}).click();await page.evaluate(()=>document.fonts.ready);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow');assert.deepEqual(errors,[]);
  await page.screenshot({path:path.join(dir,`starter-${width}.png`),fullPage:true});
  // HSC has its own paper-wise subject map, never SSC's subjects/blueprints.
  await page.getByRole('button',{name:/^HSC/}).click();const hscGroup=()=>page.getByRole('combobox',{name:'HSC বিভাগ',exact:true});
  assert.ok(await subject().isDisabled());assert.deepEqual(await options(),[]);
  for(const [id,want,not]of [['general','ইংরেজি ২য় পত্র','পদার্থবিজ্ঞান ১ম পত্র'],['science','উচ্চতর গণিত ২য় পত্র','হিসাববিজ্ঞান ১ম পত্র'],['humanities','সমাজবিজ্ঞান ১ম পত্র','পদার্থবিজ্ঞান ১ম পত্র'],['business','ব্যবসায় সংগঠন ও ব্যবস্থাপনা ২য় পত্র','জীববিজ্ঞান ১ম পত্র']]){await hscGroup().selectOption(id);const list=await options();assert.ok(list.includes(want));assert.ok(!list.includes(not));assert.equal(await subject().inputValue(),'');}
  await hscGroup().selectOption('general');await subject().selectOption('ইংরেজি ২য় পত্র');assert.ok(await page.getByRole('combobox',{name:'English প্রশ্নপত্রের ধরন',exact:true}).isVisible());
  await hscGroup().selectOption('science');assert.equal(await page.getByRole('combobox',{name:'English প্রশ্নপত্রের ধরন',exact:true}).count(),0);await subject().selectOption('পদার্থবিজ্ঞান ১ম পত্র');
  await page.getByRole('button',{name:/Auto Model কাঠামো/}).click();await page.getByRole('button',{name:'CQ সৃজনশীল / লিখিত',exact:true}).click();assert.equal(await page.getByRole('button',{name:/মডেল প্রস্তুত ও কাঠামো/}).isDisabled(),false);assert.match(await page.locator('fieldset').innerText(),/নির্ধারিত মানবণ্টন দিন/);assert.match(await page.locator('fieldset').innerText(),/মানবণ্টন অনুমান করা হবে না/);
  await page.getByRole('button',{name:/Chapter অধ্যায়/}).click();await page.evaluate(()=>document.fonts.ready);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);
  await page.screenshot({path:path.join(dir,`hsc-starter-${width}.png`),fullPage:true});
  results.push({width,status:'PASS',sscGroups:4,hscGroups:4,subjectFiltering:true,resetOnGroupAndClassChange:true,englishModesRetained:true,mathCqAndShortBlueprintRetained:true,hscTeacherSchemeSetupAvailable:true,hscMarksNeverInvented:true,admissionJobAndLowerClassesUnchanged:true,pageErrors:errors,horizontalOverflow:false});await ctx.close();
 }}finally{await browser.close()}
 fs.writeFileSync(path.join(dir,'browser-results.json'),JSON.stringify({scope:'Local actual QbStart UI; isolated transport, not production auth/DB/deployment',results},null,2)+'\n');console.log(JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
