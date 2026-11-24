/** Real built-app workflow. Called ONLY inside withDisposableWalletDatabase.
 * Real Credentials session/server actions/DB; no provider credentials, API mocks,
 * production accounts, public writes or native-printer claims. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve('.cache/english-authenticated-flow');
const normalize=s=>s.replace(/\s+/g,' ').trim();
async function runEnglishWorkflow({db,page,context,origin,setPhase,testPassword}){
 fs.mkdirSync(out,{recursive:true});
 setPhase('english_flow_seed_disposable_stock');
 const plan=require('../english/release-junior-expansion.cjs').prepare();
 const {assembleEnglishItems,englishItemGroups}=require('../../lib/english/item-bank.ts');
 const {englishLegacyPaper}=require('../../lib/english/legacy-builder.ts');
 const {englishBlueprint}=require('../../lib/english/blueprints.ts');
 const {englishOwnerPrefix}=require('../../lib/english/draft.ts');
 const cases=[6,7,8,10,11,12].flatMap((grade,i)=>[1,2].map(paper=>({grade,paper,width:(i+paper)%2?390:1280})));
 cases.push({grade:6,paper:2,width:390},{grade:7,paper:2,width:1280});
 const fixtureStock=new Map();
 for(const {grade,paper}of cases){
  if(fixtureStock.has(`${grade}/${paper}`))continue;
  let stock=[...plan.items,...plan.readOnly].filter(p=>p.draft.selection.grade===grade&&p.draft.selection.paper===paper).map(p=>p.draft);
  if(grade===8&&paper===2)stock=stock.filter(d=>d.selection.modelStyle==='class8-reference-v1');
  const model=structuredClone(assembleEnglishItems(stock,grade,()=>0,undefined,{},paper).draft);assert.ok(model);
  // Exercise default-header metadata on explicitly non-custom synthetic copies.
  // These test-owned records never alter the prepared catalog or production stock.
  model.header.enabled=false;
  const groups=englishItemGroups(model);
  for(const group of groups)await db.setting.upsert({where:{key:group.key},create:{key:group.key,value:JSON.stringify({status:'APPROVED',draft:group.draft,group:group.group,reviewedBy:'disposable-browser-fixture-only'})},update:{}});
  fixtureStock.set(`${grade}/${paper}`,groups);
 }
 const bankBefore=await db.setting.findMany({where:{key:{startsWith:'english-item:v1:'}},orderBy:{key:'asc'}});
 const prefix=englishOwnerPrefix('teacher'),results=[];
 await page.addInitScript(()=>{window.__englishPrintCalls=0;window.print=()=>{window.__englishPrintCalls++;};});
 async function click(locator){
  await locator.scrollIntoViewIfNeeded();
  await locator.evaluate(el=>el.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'}));
  await locator.click();
 }
 const panel=()=>page.locator('aside[aria-labelledby="paper-settings-title"]');
 async function closeSettings(){if(await panel().isVisible()&&await panel().getByRole('button',{name:'সেটিংস বন্ধ করুন',exact:true}).isVisible())await click(panel().getByRole('button',{name:'সেটিংস বন্ধ করুন',exact:true}));}
 async function openSettings(){if(!(await panel().isVisible()))await click(page.getByRole('button',{name:'সেটিংস',exact:true}));}
 async function waitPaper(count){
  await page.locator('#paper .paper-sheet').first().waitFor();
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(n=>[...document.querySelectorAll('#paper .paper-sheet .english-question-heading')].filter(e=>e.textContent.trim()).length===n,count);
 }
 async function saved(key){return JSON.parse((await db.setting.findUniqueOrThrow({where:{key}})).value);}
 async function savePaper(){await click(page.getByRole('button',{name:'প্রশ্নপত্র সেভ করুন',exact:true}));await page.getByRole('status').filter({hasText:'সেভ হয়েছে।'}).first().waitFor();}
 for(const {grade,paper,width}of cases){
  const label=`english_${grade}_${paper}_${width}`;setPhase(label+'_generate');
  await page.setViewportSize({width,height:900});
  const before=await db.setting.count({where:{key:{startsWith:prefix}}});
  await page.goto(origin+`/question-builder/english?grade=${grade}&paper=${paper}&mode=full`,{waitUntil:'networkidle'});
  await page.waitForURL(url=>url.pathname==='/question-builder/build'&&url.searchParams.has('englishKey'));
  const key=new URL(page.url()).searchParams.get('englishKey');assert.ok(key.startsWith(prefix));
  const initial=await saved(key),blueprint=englishBlueprint(grade,paper,initial.selection.modelStyle),count=initial.output.tasks.length;
  assert.equal(initial.selection.grade,grade);assert.equal(initial.selection.paper,paper);assert.equal(count,blueprint.items.length);
  assert.equal(await db.setting.count({where:{key:{startsWith:prefix}}}),before+1,'Automatic entry must save exactly one owned draft');
  const originalTasks=JSON.stringify(initial.output),originalItems=englishLegacyPaper(initial).items;
  await waitPaper(count);await closeSettings();
  assert.equal(await page.locator('.ip-root').count(),0,'Install prompt must not interrupt the paper workflow');
  setPhase(label+'_default_header');
  const header=page.locator('#paper .paper-sheet .default-paper-header').first();
  await header.waitFor();assert.match(await header.innerText(),/ইংরেজি/);
  const expectedMarks=String(blueprint.total).replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[Number(d)]);
  assert.equal(normalize(await header.locator('.default-header-fullMarks').innerText()),expectedMarks);
  setPhase(label+'_edit_and_layout');
  await openSettings();await panel().getByRole('switch',{name:'এডিটিং মোড'}).check();
  await panel().getByLabel('ফন্ট সাইজ',{exact:true}).fill('12');
  await closeSettings();
  // Editing the last writing item must stay visible and survive actual DB saves.
  const last=originalItems.at(-1),marker=`Reviewed writing instruction ${grade} ${paper} ${width}`;
  const editor=page.locator('section').filter({has:page.getByRole('heading',{name:'প্রশ্ন সম্পাদনা ও সংযুক্তি',exact:true})}).last();
  await click(editor.locator('details').last().locator('summary'));
  await editor.getByRole('textbox',{name:`প্রশ্ন ${originalItems.length}`,exact:true}).fill(marker);
  await click(page.locator('summary').filter({hasText:'Page Setup ও অতিরিক্ত সেটিংস'}));
  const metadata=page.locator('details').filter({has:page.getByText('Page Setup ও অতিরিক্ত সেটিংস',{exact:true})});
  await metadata.getByRole('textbox',{name:'সময় (মিনিট বা পূর্ণ বিবরণ)',exact:true}).fill('2 hours');
  await metadata.getByRole('textbox',{name:'পূর্ণমান',exact:true}).fill(String(blueprint.total));
  await click(page.locator('summary').filter({hasText:'Page Setup ও অতিরিক্ত সেটিংস'}));
  await waitPaper(count);
  assert.ok((await page.locator('#paper .paper-sheet').allTextContents()).join(' ').includes(marker));
  await savePaper();
  let stored=await saved(key);assert.notEqual(stored.updatedAt,initial.updatedAt);assert.equal(stored.builderSettings.edits[last.id].text,marker);assert.equal(stored.builderSettings.cfg.fontSize,12);
  assert.equal(JSON.stringify(stored.output),originalTasks,'Layout edits must not mutate source tasks/keys');
  setPhase(label+'_repeat_save_header');
  const headerEditor=page.getByRole('region',{name:'ডিফল্ট হেডার সম্পাদনা',exact:true});
  await click(headerEditor.getByRole('button',{name:'প্রতিষ্ঠানের নাম সম্পাদনা করুন',exact:true}));
  const institute=`Workflow School ${grade} ${paper} ${width}`;
  await headerEditor.getByRole('textbox',{name:'প্রতিষ্ঠানের নাম',exact:true}).fill(institute);
  await click(headerEditor.getByRole('button',{name:'ডিফল্ট হেডার সেভ করুন',exact:true}));
  await headerEditor.getByText('ডিফল্ট হেডার সেভ হয়েছে।',{exact:true}).waitFor();
  const next=await saved(key);assert.notEqual(next.updatedAt,stored.updatedAt);stored=next;
  assert.equal(stored.builderSettings.defaultHeader.overrides.institute,institute);
  setPhase(label+'_saved_list_reopen');
  await click(page.getByRole('link',{name:'সংরক্ষিত প্রশ্নপত্র',exact:true}));
  setPhase(label+'_saved_list_link');
  await click(page.locator(`a[href*="${encodeURIComponent(key)}"]`));
  setPhase(label+'_reopen_pagination');
  await waitPaper(count);await closeSettings();
  setPhase(label+'_reopen_saved_values');
  const reopened=await saved(key);assert.equal(reopened.updatedAt,stored.updatedAt,'Opening a draft must not write it');
  assert.equal(await page.locator('#paper .paper-sheet .default-header-institute').first().innerText(),institute);
  assert.ok((await page.locator('#paper .paper-sheet').allTextContents()).join(' ').includes(marker));
  setPhase(label+'_reopen_viewport');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Mobile controls must not widen the viewport');
  setPhase(label+'_print_and_pdf');
  await click(page.getByRole('button',{name:'ডাউনলোড',exact:true}));
  await page.waitForFunction(()=>window.__englishPrintCalls===1);
  // Real Chromium print CSS/PDF, not a claim about a physical printer or native mobile dialog.
  const file=path.join(out,label+'.pdf');await page.pdf({path:file,format:'A4',printBackground:true,preferCSSPageSize:true});
  const bytes=fs.readFileSync(file),pdf=await require('pdf-lib').PDFDocument.load(bytes);assert.ok(pdf.getPageCount()>0);assert.ok(bytes.length>10000);
  const {pathToFileURL}=require('node:url');
  const pdfjs=await import(pathToFileURL(require.resolve('pdfjs-dist/legacy/build/pdf.mjs')).href);
  const document=await pdfjs.getDocument({data:new Uint8Array(bytes),useSystemFonts:true,disableFontFace:true,isEvalSupported:false}).promise;
  const text=[];for(let i=1;i<=document.numPages;i++)text.push((await(await document.getPage(i)).getTextContent()).items.map(v=>v.str).join(' '));
  const printed=normalize(text.join(' '));assert.ok(printed.includes(marker),'Saved question edit missing from actual PDF');assert.ok(printed.includes(institute),'Saved header missing from actual PDF');
  assert.ok(!printed.includes('প্রশ্নপত্র সেভ করুন'),'Editor controls leaked into PDF');
  // No complete suggested writing answer may appear in question-only print.
  for(const task of initial.output.tasks)if(task.answer&&normalize(task.answer).length>50)assert.ok(!printed.includes(normalize(task.answer)),'Suggested answer leaked into question paper');
  await document.destroy();
  await page.locator('#paper .paper-sheet').first().screenshot({path:path.join(out,label+'.png')});
  if(grade===6&&paper===1){
   setPhase(label+'_real_stale_tab_conflict');
   const stale=await context.newPage();
   try{
    await stale.goto(page.url(),{waitUntil:'networkidle'});
    await stale.locator('#paper .paper-sheet').first().waitFor();
    const staleClose=stale.locator('aside[aria-labelledby="paper-settings-title"]').getByRole('button',{name:'সেটিংস বন্ধ করুন',exact:true});
    if(await staleClose.isVisible())await click(staleClose);
    await savePaper();const winner=await saved(key);
    await click(stale.getByRole('button',{name:'প্রশ্নপত্র সেভ করুন',exact:true}));
    await stale.getByRole('status').filter({hasText:'অন্য tab/session থেকে draft বদলেছে'}).waitFor();
    assert.deepEqual(await saved(key),winner,'Stale tab must not overwrite newer saved work');
   }finally{await stale.close();}
   for(const mode of ['Smart','Dynamic']){
    const templatePhase=label+'_saved_'+mode.toLowerCase()+'_header';
    setPhase(templatePhase+'_tab');
    await click(page.getByRole('tab',{name:mode+' Header',exact:true}));
    const templates=page.locator('#header-template-panel');
    setPhase(templatePhase+'_create');
    await click(templates.getByRole('button',{name:new RegExp('Create')}));
    const dialog=page.getByRole('dialog',{name:mode==='Smart'?'হেডার সেটিংস':'Create Dynamic Header',exact:true});
    const templateName='Workflow '+mode+' Template';
    setPhase(templatePhase+'_name');
    await dialog.getByRole('textbox',{name:mode==='Smart'?'Your header name *':'Header Name *',exact:true}).fill(templateName);
    if(mode==='Dynamic')await click(dialog.getByRole('button',{name:'Create Header',exact:true}));
    const active=page.locator('[aria-labelledby="header-modal-title"]');
    setPhase(templatePhase+'_institute');
    await active.getByRole('textbox',{name:'Institute Name text',exact:true}).fill(templateName+' School');
    setPhase(templatePhase+'_submit');
    await click(active.getByRole('button',{name:'Save',exact:true}));
    setPhase(templatePhase+'_closed');
    await active.waitFor({state:'hidden'});
    setPhase(templatePhase+'_save_paper');
    await savePaper();
    const custom=await saved(key);assert.equal(custom.builderSettings.header.mode,mode.toLowerCase());assert.equal(custom.builderSettings.header.enabled,true);
    assert.equal(await page.locator('#paper .paper-sheet .default-paper-header').count(),0,'Custom template must replace the default header, not stack with it');
    setPhase(templatePhase+'_reload');
    await page.reload({waitUntil:'networkidle'});await waitPaper(count);await closeSettings();
    assert.equal(await page.locator('#paper .paper-sheet .default-paper-header').count(),0);
    assert.ok((await page.locator('#paper .paper-sheet').allTextContents()).join(' ').includes(templateName+' School'));
    setPhase(templatePhase+'_return_default');
    await click(page.getByRole('button',{name:'ডিফল্ট হেডারে ফিরুন',exact:true}));
    setPhase(templatePhase+'_save_default');
    await savePaper();
    setPhase(templatePhase+'_visible_default');
    await page.locator('#paper .paper-sheet .default-paper-header').first().waitFor();
   }
  }
  results.push({grade,paper,width,tasks:count,marks:blueprint.total,pdfPages:pdf.getPageCount(),repeatSave:true,reopened:true});
 }
 setPhase('english_flow_ownership_and_bank_unchanged');
 assert.deepEqual(await db.setting.findMany({where:{key:{startsWith:'english-item:v1:'}},orderBy:{key:'asc'}}),bankBefore);
 assert.equal(await db.setting.count({where:{key:{startsWith:'englishai:quota:'}}}),0);
 // A different real Credentials user cannot read the teacher's draft.
 const teacherKey=(await db.setting.findFirstOrThrow({where:{key:{startsWith:prefix}}})).key;
 const teacher=await db.user.findUniqueOrThrow({where:{id:'teacher'}});
 await db.user.create({data:{id:'english-other',role:'TEACHER',email:'english-other@example.invalid',name:'Synthetic Other Teacher',passwordHash:teacher.passwordHash}});
 const other=await context.browser().newContext();
 try{
  await other.route('**/*',route=>route.request().url().startsWith(origin+'/')?route.continue():route.abort());
  const p=await other.newPage();await p.goto(origin+'/login?next=/dashboard',{waitUntil:'networkidle'});
  await p.locator('input[name="email"]').fill('english-other@example.invalid');
  await p.locator('input[name="password"]').fill(testPassword);
  await p.locator('.qm-login-primary').click();
  await p.waitForURL(origin+'/dashboard',{waitUntil:'networkidle'});
  const otherSession=await(await other.request.get(origin+'/api/auth/session')).json();
  assert.equal(otherSession.user.id,'english-other');assert.equal(otherSession.user.role,'TEACHER');
  const response=await p.goto(origin+'/question-builder/build?englishKey='+encodeURIComponent(teacherKey),{waitUntil:'networkidle'});
  assert.equal(response.status(),404);
 }finally{await other.close();}
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({scope:'isolated-real-credentials-built-app-and-db',cases:results,productionWrites:0,providerCalls:0,nativePrinterVerified:false},null,2));
 console.log(`PASS English real saved workflow: ${results.length} desktop/mobile cases; no production writes/provider calls/native-printer claim`);
}
module.exports={runEnglishWorkflow};
