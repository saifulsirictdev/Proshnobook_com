const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module'),path=require('node:path');
const root=path.resolve(__dirname,'..'),orig=Module._resolveFilename;Module._resolveFilename=function(id,parent,...rest){return orig.call(this,id.startsWith('@/')?path.join(root,id.slice(2)):id,parent,...rest)};
require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
function load(file,mocks){const m=new Module(path.resolve(file),module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return m.exports;}
const prepared=require('../lib/english/prepared-complete-model.ts').preparedCompleteEnglishModel(),bank=require('../lib/english/complete-model-bank.ts');
function record(status='APPROVED',draft=prepared.draft){return JSON.stringify({status,draft});}
test('Prepared complete model validates 100 marks, thirteen tasks, linked seen/unseen groups and answer keys',()=>{
 const d=prepared.draft;assert.equal(d.output.tasks.length,13);assert.equal(d.selection.includeAnswers,true);
 const {validateEnglishOutput,validateEnglishReferenceShape}=require('../lib/english/generation.ts');assert.equal(validateEnglishOutput(d.selection,d.output).total,100);validateEnglishReferenceShape(d.selection,d.output);
 const tasks=Object.fromEntries(d.output.tasks.map(t=>[t.id,t]));assert.equal(tasks.mcq.subitems.length,7);assert.equal(tasks.comprehension.subitems.length,5);assert.equal(tasks.mcq.passageKey,tasks.comprehension.passageKey);assert.equal(tasks.information.passageKey,tasks['true-false'].passageKey);assert.equal(tasks.summary.passageKey,'unseen');
 for(const t of d.output.tasks)assert.ok(t.answer||t.subitems.every(s=>s.answer));
 assert.match(prepared.key,/^english-review:[a-f0-9-]{36}$/);
});
test('Only complete approved same-grade full models with answers are reusable',()=>{
 assert.ok(bank.approvedCompleteEnglishModel(record(),6,1));
 for(const s of ['PENDING','REJECTED','DRAFT'])assert.equal(bank.approvedCompleteEnglishModel(record(s),6,1),null);
 assert.equal(bank.approvedCompleteEnglishModel(record(),7,1),null);assert.equal(bank.approvedCompleteEnglishModel(record(),6,2),null);
 const missing=structuredClone(prepared.draft);missing.output.tasks.pop();assert.equal(bank.approvedCompleteEnglishModel(record('APPROVED',missing),6,1),null);
 const wrong=structuredClone(prepared.draft);wrong.output.tasks[1].passageKey='unseen';assert.equal(bank.approvedCompleteEnglishModel(record('APPROVED',wrong),6,1),null);
 const noKey=structuredClone(prepared.draft);delete noKey.output.tasks[0].subitems[0].answer;assert.equal(bank.approvedCompleteEnglishModel(record('APPROVED',noKey),6,1),null);
});
function harness(rows=[],user={id:'teacher',role:'TEACHER'}){let reads=0,writes=[];const a=load('app/actions/english-bank-model.ts',{'@/auth':{auth:async()=>({user})},'@/lib/db':{db:{setting:{findMany:async()=>{reads++;return rows;},create:async({data})=>{writes.push(data);}}}}});return{run:a.prepareEnglishBankModel,reads:()=>reads,writes};}
test('Bank-only preparation saves an owned private review draft without provider or quota writes',async()=>{
 const h=harness([{key:prepared.key,value:record()}]);const r=await h.run(6);assert.equal(r.ok,true);assert.match(r.key,/^englishpaper:teacher:/);assert.equal(h.writes.length,1);assert.equal(h.writes[0].key,r.key);const draft=JSON.parse(h.writes[0].value);assert.deepEqual(draft.output.tasks,prepared.draft.output.tasks);assert.deepEqual(new Set(draft.output.passages.map(p=>p.key)),new Set(prepared.draft.output.passages.map(p=>p.key)));assert.notEqual(draft,prepared.draft);
});
test('Every supported grade reports missing full stock instead of generating; unauthorized calls read nothing',async()=>{
 for(let grade=6;grade<=12;grade++){const h=harness([{key:prepared.key,value:record('PENDING')}]);const r=await h.run(grade);assert.equal(r.ok,false);assert.match(r.error,/প্রশ্নভান্ডারে/);assert.equal(h.writes.length,0);}
 for(const user of [null,{id:'s',role:'STUDENT'}]){const h=harness([],user);assert.equal((await h.run(6)).ok,false);assert.equal(h.reads(),0);}
 const h=harness();assert.equal((await h.run(5)).ok,false);assert.equal(h.reads(),0);
});
test('Full model import is ADMIN-only, Pending-only and preserves existing records on retry',async()=>{
 let saved=new Map(),calls=0;
 function action(user){return load('app/admin/english-review/complete-model-actions.ts',{'@/auth':{auth:async()=>({user})},'next/cache':{revalidatePath(){}},'@/lib/db':{db:{setting:{createMany:async({data,skipDuplicates})=>{calls++;assert.equal(skipDuplicates,true);let count=0;for(const r of data)if(!saved.has(r.key)){saved.set(r.key,r.value);count++;}return{count};}}}}}).importCompleteEnglishModel;}
 const fd=new FormData();fd.set('digest',prepared.digest);fd.set('reviewed','yes');assert.ok((await action({id:'t',role:'TEACHER'})({},fd)).error);assert.equal(calls,0);
 const save=action({id:'a',role:'ADMIN'});assert.ok((await save({},new FormData())).error);assert.equal(calls,0);assert.ok((await save({},fd)).message);const r=JSON.parse(saved.get(prepared.key));assert.equal(r.status,'PENDING');assert.equal(r.provenance.teacherApproved,false);assert.deepEqual(r.draft,prepared.draft);
 const approved=record();saved.set(prepared.key,approved);await save({},fd);assert.equal(saved.size,1);assert.equal(saved.get(prepared.key),approved);
});
test('Complete library covers all thirty exact extracts with keys, three unseen groups and all six poems',()=>{
 const lib=require('../lib/english/prepared-complete-model.ts'),models=lib.preparedCompleteEnglishModels(),pool=require('../lib/english/data/class6-seen-pool.json');
 assert.equal(models.length,31);assert.equal(models[0].digest,prepared.digest);assert.equal(new Set(models.map(m=>m.key)).size,31);
 assert.equal(new Set(models.slice(1).map(m=>m.provenance.seen2Id)).size,30);
 assert.equal(new Set(models.slice(1).map(m=>m.provenance.unseenFile)).size,3);
 const poemLessons=new Set(),newPrompts=new Set();
 for(const m of models.slice(1)){
  const p=pool.seen.find(p=>p.id===m.provenance.seen2Id),d=m.draft;
  assert.equal(d.selection.sources['seen-2'].text,p.text);assert.equal(d.selection.sources['seen-2'].reference,p.reference);
  assert.notEqual(d.selection.sources['seen-1'].text,d.selection.sources['seen-2'].text);
  assert.equal(d.output.tasks.length,13);assert.equal(d.output.tasks[0].subitems.length,7);assert.equal(d.output.tasks[1].subitems.length,5);
  for(const id of ['gap','vocabulary']){const t=d.output.tasks.find(t=>t.id===id);assert.equal(t.passageKey,'seen-2');assert.equal(t.subitems.length,5);for(const s of t.subitems){assert.ok(s.answer);newPrompts.add(`${p.id}:${id}:${s.text}`);}}
  for(const lesson of m.provenance.poemLessons)poemLessons.add(lesson);
  assert.equal(d.output.tasks[9].subitems.length,8);
  assert.ok(bank.approvedCompleteEnglishModel(record('APPROVED',d),6,1));assert.equal(bank.approvedCompleteEnglishModel(record('PENDING',d),6,1),null);
 }
 assert.equal(newPrompts.size,300);assert.equal(poemLessons.size,6);
 assert.equal(lib.completeEnglishLibraryDigest(),lib.completeEnglishLibraryDigest());
});
test('Batch import checks manifest, writes 31 Pending snapshots atomically and preserves decisions on retry',async()=>{
 const lib=require('../lib/english/prepared-complete-model.ts');let saved=new Map(),calls=0;
 const action=load('app/admin/english-review/complete-model-actions.ts',{'@/auth':{auth:async()=>({user:{id:'admin',role:'ADMIN'}})},'next/cache':{revalidatePath(){}},'@/lib/db':{db:{setting:{createMany:async({data,skipDuplicates})=>{calls++;assert.equal(data.length,31);assert.equal(skipDuplicates,true);let count=0;for(const row of data)if(!saved.has(row.key)){saved.set(row.key,row.value);count++;}return{count};}}}}}).importCompleteEnglishModel;
 const fd=new FormData();fd.set('scope','library');fd.set('reviewed','yes');fd.set('digest',prepared.digest);
 assert.ok((await action({},fd)).error);assert.equal(calls,0);
 fd.set('digest',lib.completeEnglishLibraryDigest());assert.match((await action({},fd)).message,/31টি/);assert.equal(saved.size,31);
 for(const value of saved.values()){const r=JSON.parse(value);assert.equal(r.status,'PENDING');assert.equal(r.provenance.teacherApproved,false);assert.equal(r.draft.selection.includeAnswers,true);}
 const first=lib.preparedCompleteEnglishModels()[1],rejected=record('REJECTED',first.draft);saved.set(first.key,rejected);assert.match((await action({},fd)).message,/0টি/);assert.equal(saved.size,31);assert.equal(saved.get(first.key),rejected);
 fd.set('scope','forged');assert.ok((await action({},fd)).error);assert.equal(calls,2);
});
test('Independent Question Item stock assembles in syllabus order without a complete snapshot',()=>{
 const items=require('../lib/english/item-bank.ts');
 const models=require('../lib/english/prepared-complete-model.ts').preparedCompleteEnglishModels();
 const groups=models.flatMap(m=>items.englishItemGroups(m.draft));
 const distinct=[...new Map(groups.map(g=>[g.key,g])).values()];
 assert.ok(distinct.length>40);
 const stock=distinct.map(g=>items.approvedEnglishItem(JSON.stringify({status:'APPROVED',draft:g.draft}),6));
 assert.ok(stock.every(Boolean));assert.ok(stock.every(d=>d.selection.mode==='selected'));
 for(const random of [()=>0,()=>0.5,()=>0.99]){
  const {draft,missing}=items.assembleEnglishItems(stock,6,random);assert.deepEqual(missing,[]);assert.ok(draft);
  assert.deepEqual(draft.output.tasks.map(t=>t.id),prepared.draft.output.tasks.map(t=>t.id));
  assert.notEqual(draft.selection.sources['seen-1'].text,draft.selection.sources['seen-2'].text);
  const unseen=draft.output.passages.find(p=>p.key==='unseen');assert.ok(unseen);
  for(const id of ['information','true-false','summary'])assert.equal(draft.output.tasks.find(t=>t.id===id).passageKey,'unseen');
  assert.ok(distinct.some(g=>g.group==='unseen'&&g.draft.output.passages[0].text===unseen.text&&JSON.stringify(g.draft.output.tasks)===JSON.stringify(draft.output.tasks.filter(t=>t.passageKey==='unseen'))));
 }
 const incomplete=stock.filter(d=>!d.output.tasks.some(t=>t.id==='gap'));assert.ok(items.assembleEnglishItems(incomplete,6).missing.includes('gap'));
 for(const status of ['PENDING','REJECTED'])assert.equal(items.approvedEnglishItem(JSON.stringify({status,draft:distinct[0].draft}),6),null);
 assert.equal(items.approvedEnglishItem(JSON.stringify({status:'APPROVED',draft:distinct[0].draft}),7),null);
});
test('Question Item import is ADMIN-only, digest-bound, Pending-only, deduplicated and retry-safe',async()=>{
 const library=require('../lib/english/prepared-complete-model.ts');const saved=new Map();let writes=0;
 function action(role){return load('app/admin/english-review/item-actions.ts',{'@/auth':{auth:async()=>({user:{id:'a',role}})},'next/cache':{revalidatePath(){}},'@/lib/db':{db:{setting:{createMany:async({data,skipDuplicates})=>{writes++;assert.equal(skipDuplicates,true);for(const row of data)if(!saved.has(row.key))saved.set(row.key,row.value);}}}}}).importEnglishItems;}
 const fd=new FormData();fd.set('digest',library.completeEnglishLibraryDigest());fd.set('reviewed','yes');
 await assert.rejects(()=>action('TEACHER')(fd));assert.equal(writes,0);
 await action('ADMIN')(new FormData());assert.equal(writes,0);
 await action('ADMIN')(fd);assert.ok(saved.size>40);const count=saved.size;
 for(const value of saved.values()){const r=JSON.parse(value);assert.equal(r.status,'PENDING');assert.equal(r.draft.selection.mode,'selected');}
 const key=[...saved.keys()][0];saved.set(key,'preserved decision');await action('ADMIN')(fd);assert.equal(saved.size,count);assert.equal(saved.get(key),'preserved decision');
});
test('The same item stock serves seen-only, unseen-only and individual tasks without requiring other stock',async()=>{
 const items=require('../lib/english/item-bank.ts');const stock=items.englishItemGroups(prepared.draft).map(p=>p.draft);
 for(const ids of [['mcq'],['mcq','comprehension','gap','vocabulary'],['information','true-false','summary'],['paragraph']]){
  const available=stock.filter(d=>d.output.tasks.some(t=>ids.includes(t.id)));
  const {draft,missing}=items.assembleEnglishItems(available,6,()=>0,ids);
  assert.deepEqual(missing,[]);assert.equal(draft.selection.mode,'selected');assert.deepEqual(draft.output.tasks.map(t=>t.id),ids);assert.deepEqual(draft.selection.itemIds,ids);
  const needed=new Set(draft.output.tasks.map(t=>t.passageKey).filter(Boolean));assert.deepEqual(new Set(draft.output.passages.map(p=>p.key)),needed);
  const {validateEnglishOutput}=require('../lib/english/generation.ts');const result=validateEnglishOutput(draft.selection,draft.output);assert.ok(result.total<100);
 }
 for(const ids of [[],['bad'],['mcq','mcq']])assert.throws(()=>items.assembleEnglishItems(stock,6,()=>0,ids));
 const rows=items.englishItemGroups(prepared.draft).filter(p=>p.group==='unseen').map(p=>({key:p.key,value:record('APPROVED',p.draft)}));
 const h=harness(rows);assert.equal((await h.run(6,['summary'])).ok,true);assert.deepEqual(JSON.parse(h.writes[0].value).output.tasks.map(t=>t.id),['summary']);
 const full=harness(rows);assert.equal((await full.run(6)).ok,false);assert.equal(full.writes.length,0);
});
test('ADMIN may explicitly reopen an existing decision for reapproval without deleting content or losing old status',async()=>{
 const value=record();let current=value,writes=0;
 function action(role){return load('app/admin/english-review/actions.ts',{'@/auth':{auth:async()=>({user:{id:'owner',role}})},'next/cache':{revalidatePath(){}},'@/lib/db':{db:{setting:{findUnique:async()=>({key:prepared.key,value:current}),updateMany:async({where,data})=>{assert.equal(where.value,current);current=data.value;writes++;}}}}}).reopenEnglishReview;}
 const form=new FormData();form.set('key',prepared.key);form.set('confirmed','yes');await assert.rejects(()=>action('TEACHER')(form));assert.equal(writes,0);
 await action('ADMIN')(new FormData());assert.equal(writes,0);await action('ADMIN')(form);
 const reopened=JSON.parse(current);assert.equal(reopened.status,'PENDING');assert.equal(reopened.previousDecision.status,'APPROVED');assert.equal(reopened.reopenedBy,'owner');assert.deepEqual(reopened.draft,prepared.draft);await action('ADMIN')(form);assert.equal(writes,1);
});
test('Bank selection looks ahead so a random Seen-1 choice does not hide a valid distinct Seen-2',()=>{
 const items=require('../lib/english/item-bank.ts');const groups=items.englishItemGroups(prepared.draft);
 const seen1=groups.find(g=>g.group==='seen-1').draft,seen2=groups.find(g=>g.group==='seen-2').draft;
 const conflict=structuredClone(seen1);conflict.selection.sources['seen-1']={...seen2.selection.sources['seen-2']};conflict.output.passages[0].text=seen2.selection.sources['seen-2'].text;
 const result=items.assembleEnglishItems([conflict,seen1,seen2],6,()=>0,['mcq','comprehension','gap','vocabulary']);assert.ok(result.draft);assert.deepEqual(result.missing,[]);assert.notEqual(result.draft.selection.sources['seen-1'].text,result.draft.selection.sources['seen-2'].text);
});
test('Common import saves exactly the server-prepared item Pending, never resets Approved and denies forged keys',async()=>{
 const items=require('../lib/english/item-bank.ts'),key=items.englishItemGroups(prepared.draft)[0].key;const saved=new Map();let calls=0;
 function action(role){return load('app/admin/questions/import/english-items-actions.ts',{'@/lib/guard':{staff:async()=>{if(role!=='ADMIN')throw Error('Forbidden');return{id:'a'};}},'next/cache':{revalidatePath(){}},'@/lib/db':{db:{setting:{createMany:async({data,skipDuplicates})=>{calls++;assert.equal(skipDuplicates,true);for(const r of data)if(!saved.has(r.key))saved.set(r.key,r.value);}}}}}).saveEnglishQuestionItem;}
 const fd=new FormData();fd.set('key',key);fd.set('reviewed','yes');await assert.rejects(()=>action('TEACHER')(fd));assert.equal(calls,0);await action('ADMIN')(new FormData());assert.equal(calls,0);
 const forged=new FormData();forged.set('reviewed','yes');forged.set('key','forged');await action('ADMIN')(forged);assert.equal(calls,0);
 await action('ADMIN')(fd);assert.equal(saved.size,1);const entry=JSON.parse(saved.get(key));assert.equal(entry.status,'PENDING');assert.ok(entry.draft.output.passages.length);entry.status='APPROVED';saved.set(key,JSON.stringify(entry));await action('ADMIN')(fd);assert.equal(JSON.parse(saved.get(key)).status,'APPROVED');
});
test('Common ADMIN readiness and user preparation use the same validated stock, not status-only receipts',async()=>{
 const {loadEnglishStock}=require('../lib/english/stock.ts');const items=require('../lib/english/item-bank.ts');
 const groups=items.englishItemGroups(prepared.draft);const rows=groups.map(p=>({key:p.key,value:record('APPROVED',p.draft)}));
 rows.push({key:'bad',value:JSON.stringify({status:'APPROVED',draft:{}})});
 const stock=await loadEnglishStock(6,async prefix=>prefix==='english-item:v1:'?rows:[]);assert.equal(stock.length,groups.length);assert.ok(items.assembleEnglishItems(stock,6).draft);
 const partial=await loadEnglishStock(6,async prefix=>prefix==='english-item:v1:'?rows.filter(r=>!JSON.parse(r.value).draft?.output?.tasks?.some(t=>t.id==='summary')):[]);assert.equal(items.assembleEnglishItems(partial,6).draft,null);
});
test('Bulk approval is confirmed ADMIN-only, snapshot-bound, scope checked and preserves concurrent decisions',async()=>{
 const crypto=require('node:crypto'),items=require('../lib/english/item-bank.ts');const groups=items.englishItemGroups(prepared.draft);let writes=0;const saved=new Map();
 for(const [i,g] of groups.entries())saved.set(g.key,record(i===0?'APPROVED':'PENDING',g.draft));
 const entries=[...saved].map(([key,value])=>({key,digest:crypto.createHash('sha256').update(value).digest('hex')}));
 const changed=groups[1].key;saved.set(changed,record('REJECTED',groups[1].draft));
 const invalid=groups[2].key;saved.set(invalid,JSON.stringify({status:'PENDING',draft:{}}));entries[2].digest=crypto.createHash('sha256').update(saved.get(invalid)).digest('hex');
 function action(role){return load('app/admin/english-review/actions.ts',{'@/auth':{auth:async()=>({user:{id:'owner',role}})},'next/cache':{revalidatePath(){}},'@/lib/db':{db:{setting:{findUnique:async({where})=>saved.has(where.key)?{key:where.key,value:saved.get(where.key)}:null,updateMany:async({where,data})=>{writes++;if(saved.get(where.key)!==where.value)return{count:0};saved.set(where.key,data.value);return{count:1};}}}}}).approveEnglishPendingBatch;}
 const form=new FormData();form.set('reviewed','yes');form.set('entries',JSON.stringify(entries));
 assert.ok((await action('TEACHER')({},form)).error);assert.equal(writes,0);assert.ok((await action('ADMIN')({},new FormData())).error);
 const result=await action('ADMIN')({},form);assert.match(result.message,new RegExp(`অনুমোদিত: ${groups.length-3}টি`));assert.match(result.message,/গঠন বা scope যাচাই হয়নি: 1টি/);assert.equal(JSON.parse(saved.get(changed)).status,'REJECTED');assert.equal(JSON.parse(saved.get(invalid)).status,'PENDING');assert.equal(JSON.parse(saved.get(groups[3].key)).reviewedBy,'owner');
 const count=writes;await action('ADMIN')({},form);assert.equal(writes,count);
 const forged=new FormData();forged.set('reviewed','yes');forged.set('entries',JSON.stringify([entries[0],entries[0]]));assert.ok((await action('ADMIN')({},forged)).error);
});
test('Grade scope preserves shared catalogs but separates exact grades and never relabels Class 6 stock',()=>{
 const scope=require('../lib/english/admin-scope.ts'),registry=require('../lib/english/prepared-items.ts');
 assert.deepEqual(scope.englishCategoryGrades('Class 9'),[9,10]);assert.deepEqual(scope.englishCategoryGrades('Class 11-12'),[11,12]);assert.deepEqual(scope.englishCategoryGrades('Class 7'),[7]);
 for(const grade of scope.englishFirstGrades){assert.equal(scope.englishAdminGrade(String(grade)),grade);assert.ok(scope.englishAdminHref(grade).includes(`grade=${grade}`));if(grade!==6 && grade!==10)assert.deepEqual(registry.preparedEnglishItems(grade),[]);}
 for(const raw of [5,13,'bad',''])assert.equal(scope.englishAdminGrade(raw),null);
 assert.ok(registry.preparedEnglishItems(6).length>40);assert.notEqual(registry.englishItemsDigest(7),registry.englishItemsDigest(8));
});
test('Bulk approval cannot approve another grade under the selected grade scope',async()=>{
 const crypto=require('node:crypto');let writes=0;const pending=record('PENDING');
 const action=load('app/admin/english-review/actions.ts',{'@/auth':{auth:async()=>({user:{id:'a',role:'ADMIN'}})},'next/cache':{revalidatePath(){}},'@/lib/db':{db:{setting:{findUnique:async()=>({value:pending}),updateMany:async()=>{writes++;return{count:1};}}}}}).approveEnglishPendingBatch;
 const form=new FormData();form.set('grade','7');form.set('reviewed','yes');form.set('entries',JSON.stringify([{key:prepared.key,digest:crypto.createHash('sha256').update(pending).digest('hex')}]));const result=await action({},form);assert.equal(writes,0);assert.match(result.message,/গঠন বা scope যাচাই হয়নি: 1টি/);
});
test('Original builder adapter preserves linked English passages, structured tables, keys, numbering and saved setup',()=>{
 const {englishLegacyPaper}=require('../lib/english/legacy-builder.ts');const {validateEnglishDraft}=require('../lib/english/draft.ts');
 const paper=englishLegacyPaper(prepared.draft);assert.ok(paper.items.length);const tasks=paper.items.flatMap(i=>i.englishGroup.tasks);
 assert.deepEqual(tasks.map(t=>t.id),prepared.draft.output.tasks.map(t=>t.id));assert.equal(tasks.reduce((n,t)=>n+t.marks,0),100);
 for(const t of prepared.draft.output.tasks){const converted=tasks.find(c=>c.id===t.id);assert.deepEqual(converted.table,t.table);assert.deepEqual(converted.subitems,t.subitems);assert.equal(converted.answer,t.answer);}
 for(const p of prepared.draft.output.passages)assert.ok(paper.items.some(i=>i.englishGroup.passages.some(x=>x.key===p.key&&x.text===p.text)));
 const settings=structuredClone(paper.settings);settings.cfg.orientation='landscape';settings.cfg.cols=3;settings.cfg.bold=true;settings.excludedIds=[paper.items[0].id];
 const draft=validateEnglishDraft({...prepared.draft,builderSettings:settings});const restored=englishLegacyPaper(draft);assert.equal(restored.settings.cfg.orientation,'landscape');assert.equal(restored.settings.cfg.cols,3);assert.equal(restored.settings.cfg.bold,true);assert.deepEqual(restored.settings.excludedIds,settings.excludedIds);
});
test('English build route uses the original builder, isolates general storage and retains owned draft checks',()=>{
 const page=fs.readFileSync('app/question-builder/build/page.tsx','utf8');assert.match(page,/<EnglishLegacyBuilder/);assert.doesNotMatch(page,/<EnglishEditor/);
 const wrapper=fs.readFileSync('components/english-legacy-builder.tsx','utf8');assert.match(wrapper,/<QbBuilder english=/);assert.match(wrapper,/saveEnglishPaper\(draftKey/);
 const builder=fs.readFileSync('components/qb-builder.tsx','utf8');assert.match(builder,/if \(!ready \|\| purchased \|\| english\) return/);assert.match(builder,/loadEnglishPaper\(english.key\)/);assert.match(builder,/!purchased && !english && <WalletCheckout/);
});
test('Legacy English adaptation stays server-side so node crypto cannot enter the browser bundle',()=>{
 const client=fs.readFileSync('components/english-legacy-builder.tsx','utf8');assert.match(client,/import type \{ englishLegacyPaper \}/);assert.doesNotMatch(client,/englishLegacyPaper\(initial\)/);
 const server=fs.readFileSync('app/question-builder/build/page.tsx','utf8');assert.match(server,/paper=\{englishLegacyPaper\(draft\)\}/);
 assert.ok(fs.readFileSync('components/paper-builder/preview.tsx','utf8').startsWith('"use client";'));
});
test('English pagination splits presentation blocks without losing passages, table rows, options, numbering or answers',()=>{
 const {englishLegacyPaper}=require('../lib/english/legacy-builder.ts'),{englishFlowBlocks}=require('../lib/english/flow-blocks.ts');
 const paper=englishLegacyPaper(prepared.draft);const original=JSON.stringify(paper.items);
 for(const item of paper.items){
  const blocks=englishFlowBlocks(item);assert.ok(blocks.length>=1);assert.equal(new Set(blocks.map(b=>b.id)).size,blocks.length);
  for(const p of item.englishGroup.passages)assert.equal(blocks.flatMap(b=>b.englishGroup.passages).filter(x=>x.key===p.key).map(x=>x.text).join(''),p.text);
  for(const task of item.englishGroup.tasks){
   const fragments=blocks.flatMap(b=>b.englishGroup.tasks).filter(t=>t.id===task.id);assert.ok(fragments.length);
   assert.deepEqual(fragments.flatMap(t=>t.subitems),task.subitems);assert.deepEqual(fragments.flatMap(t=>t.table?.rows??[]),task.table?.rows??[]);
   assert.equal(fragments.filter(t=>t.answer).length,task.answer?1:0);assert.ok(fragments.every(t=>t.number===task.number&&t.marks===task.marks));
   const headings=blocks.filter(b=>!b.englishGroup.continued&&b.englishGroup.tasks.some(t=>t.id===task.id));assert.equal(headings.length,1);
  }
  for(const b of blocks)assert.deepEqual(englishFlowBlocks(b),[b]);
 }
 assert.equal(JSON.stringify(paper.items),original);
 const {restoreSettings}=require('../lib/paper-builder.ts');const old=restoreSettings({});assert.equal(old.cfg.lineHeight,1.45);const tight=restoreSettings({cfg:{lineHeight:1.05,questionGap:0}});assert.equal(tight.cfg.lineHeight,1.05);assert.equal(tight.cfg.questionGap,0);
 const bad=restoreSettings({cfg:{lineHeight:0.2}});assert.equal(bad.cfg.lineHeight,1.45);
});
test('SSC prepared Seen candidate is grade-specific, keyed, answer-complete and retains original board provenance',()=>{
 const registry=require('../lib/english/prepared-items.ts'),items=registry.preparedEnglishItems(10),{validateEnglishReferenceShape}=require('../lib/english/generation.ts');
 assert.equal(items.length,7);const d=items[0].draft;assert.equal(d.selection.grade,10);assert.deepEqual(d.selection.itemIds,['mcq','comprehension']);validateEnglishReferenceShape(d.selection,d.output);
 assert.equal(d.output.tasks[0].subitems.length,7);assert.equal(d.output.tasks[1].subitems.length,5);
 assert.ok(d.output.tasks.every(t=>t.boardSource.examYear===2024&&t.boardSource.board==='Dhaka'));assert.match(d.selection.sources["seen-1"].reference,/review/);
 assert.equal(registry.englishItemsDigest(10),registry.englishItemsDigest(10));assert.equal(registry.preparedEnglishItems(9).length,0);
});
test('Board year filters reject unknown or mixed years without fallback and preserve source through assembly and pagination',()=>{
 const {preparedEnglishItems}=require('../lib/english/prepared-items.ts'),{assembleEnglishItems}=require('../lib/english/item-bank.ts');
 const d=preparedEnglishItems(10)[0].draft,ids=['mcq','comprehension'];
 const selected=assembleEnglishItems([d],10,()=>0,ids,{examYear:2024});assert.ok(selected.draft);assert.equal(selected.draft.output.tasks[0].boardSource.examYear,2024);
 for(const year of [2023,2025])assert.equal(assembleEnglishItems([d],10,()=>0,ids,{examYear:year}).draft,null);
 const unknown=structuredClone(d);unknown.output.tasks.forEach(t=>delete t.boardSource);
 assert.equal(assembleEnglishItems([unknown],10,()=>0,ids,{examYear:2024}).draft,null);
 assert.ok(assembleEnglishItems([unknown],10,()=>0,ids).draft);
 const mixed=structuredClone(d);mixed.output.tasks[1].boardSource.examYear=2023;
 assert.equal(assembleEnglishItems([mixed],10,()=>0,ids,{examYear:2024}).draft,null);
 const {englishLegacyPaper}=require('../lib/english/legacy-builder.ts'),{englishFlowBlocks}=require('../lib/english/flow-blocks.ts');
 const tasks=englishLegacyPaper(selected.draft).items.flatMap(englishFlowBlocks).flatMap(i=>i.englishGroup.tasks);assert.ok(tasks.length>2);assert.ok(tasks.every(t=>t.boardSource.examYear===2024));
 for(const filter of [{examYear:'2024'},{examYear:2024.5},{examYear:1800},{examYear:2024,extra:true}])assert.throws(()=>assembleEnglishItems([d],10,()=>0,ids,filter));
});
test('Board filter is validated before reads and empty filtered stock never writes a draft',async()=>{
 for(const [grade,filter] of [[10,{examYear:'2024'}],[10,{examYear:1800}],[6,{examYear:2024}]]){const h=harness();assert.equal((await h.run(grade,undefined,filter)).ok,false);assert.equal(h.reads(),0);assert.equal(h.writes.length,0);}
 const d=require('../lib/english/prepared-items.ts').preparedEnglishItems(10)[0].draft;
 const h=harness([{key:'english-item:v1:test',value:record('APPROVED',d)}]);
 const r=await h.run(10,['mcq','comprehension'],{examYear:2023});assert.equal(r.ok,false);assert.match(r.error,/2023/);assert.equal(h.writes.length,0);
 const ok=await h.run(10,['mcq','comprehension'],{examYear:2024});assert.equal(ok.ok,true);assert.equal(h.writes.length,1);
});
test('Old drafts still validate, while malformed board provenance is rejected',()=>{
 const {validateEnglishDraft}=require('../lib/english/draft.ts');assert.ok(validateEnglishDraft(prepared.draft));
 const d=require('../lib/english/prepared-items.ts').preparedEnglishItems(10)[0].draft;
 for(const patch of [{examYear:2024.5},{board:'School model'},{pdfPage:0},{sourceFile:''},{questionNumber:0}]){const invalid=structuredClone(d);Object.assign(invalid.output.tasks[0].boardSource,patch);assert.throws(()=>validateEnglishDraft(invalid));}
});
test('SSC batch covers nine existing items in seven groups and honestly reports missing poem/story comprehension',()=>{
 const registry=require('../lib/english/prepared-items.ts'),bank=require('../lib/english/item-bank.ts'),generation=require('../lib/english/generation.ts');
 const items=registry.preparedEnglishItems(10),stock=items.map(i=>i.draft);
 assert.deepEqual(new Set(items.map(i=>i.group)),new Set(['seen-1','seen-2','unseen','matching','rearranging','story','dialogue']));
 for(const d of stock){generation.validateEnglishReferenceShape(d.selection,d.output);assert.match(d.name,/teacher review/);assert.ok(d.output.tasks.every(t=>t.boardSource.sourceFile&&t.boardSource.pdfPage>0));}
 const full=bank.assembleEnglishItems(stock,10,()=>0,undefined,{examYear:2024});assert.equal(full.draft,null);assert.deepEqual(full.missing,['poems','stories']);
 const ids=require('../lib/english/blueprints.ts').englishBlueprint(10,1).items.filter(i=>!['poems','stories'].includes(i.id)).map(i=>i.id);
 const selected=bank.assembleEnglishItems(stock,10,()=>0,ids,{examYear:2024}).draft;assert.ok(selected);assert.equal(selected.output.tasks.length,9);
 // A composite can contain different years: selecting one atomic group must not reject unrelated years.
 const composite=structuredClone(selected);composite.output.tasks.find(t=>t.id==='gap').boardSource.examYear=2023;
 assert.ok(bank.assembleEnglishItems([composite],10,()=>0,['mcq','comprehension'],{examYear:2024}).draft);
 assert.equal(bank.assembleEnglishItems([composite],10,()=>0,['gap'],{examYear:2024}).draft,null);
 assert.ok(bank.assembleEnglishItems([composite],10,()=>0,['gap'],{examYear:2023}).draft);
});
test('SSC year/source and historical-mark differences render once per question across print fragments',()=>{
 const old=require.extensions['.tsx'];require.extensions['.tsx']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
 try{
  const React=require('react'),render=require('react-dom/server').renderToStaticMarkup,Group=require('../components/paper-builder/english-group.tsx').default;
  const d=require('../lib/english/prepared-items.ts').preparedEnglishItems(10).find(i=>i.group==='story').draft;
  const p=require('../lib/english/legacy-builder.ts').englishLegacyPaper(d),fragments=p.items.flatMap(require('../lib/english/flow-blocks.ts').englishFlowBlocks);
  const renderFragments=()=>fragments.map(q=>render(React.createElement(Group,{q,answers:true,s:p.settings}))).join('');
  assert.equal(p.settings.show.boardSource,false);assert.doesNotMatch(renderFragments(),/Dhaka Board 2024|Q9|মূল প্রশ্নে/);
  p.settings.show.boardSource=true;
  const {restoreSettings}=require('../lib/paper-builder.ts');assert.equal(restoreSettings(JSON.parse(JSON.stringify(p.settings))).show.boardSource,true);assert.equal(restoreSettings({show:{marks:true}}).show.boardSource,false);
  p.settings.show.marks=true;
  const html=fragments.map(q=>render(React.createElement(Group,{q,answers:true,s:p.settings}))).join('');assert.equal((html.match(/Dhaka Board 2024/g)||[]).length,1);assert.match(html,/Q9/);assert.match(html,/মূল প্রশ্নে 10 নম্বর; practice-এ 15/);
  p.settings.show.marks=false;const hidden=fragments.map(q=>render(React.createElement(Group,{q,answers:true,s:p.settings}))).join('');assert.doesNotMatch(hidden,/মূল প্রশ্নে/);assert.match(hidden,/Dhaka Board 2024/);
  p.settings.show.boardSource=false;assert.doesNotMatch(renderFragments(),/Dhaka Board 2024|Q9|মূল প্রশ্নে/);
  assert.ok(require('../lib/english/item-bank.ts').assembleEnglishItems([d],10,()=>0,['story'],{examYear:2024}).draft);
  const Year=require('../components/english-board-year.tsx').default;const control=render(React.createElement(Year,{value:'2024',onChange(){}}));assert.match(control,/value="2024"/);assert.match(control,/type="number"/);
 }finally{if(old)require.extensions['.tsx']=old;else delete require.extensions['.tsx'];}
});
test('SSC registry imports only through explicit ADMIN consent and always creates Pending records',async()=>{
 const registry=require('../lib/english/prepared-items.ts');let writes=[];
 const mocks={'@/auth':{auth:async()=>({user:{id:'admin',role:'ADMIN'}})},'next/cache':{revalidatePath(){}},'@/lib/db':{db:{setting:{createMany:async arg=>{writes.push(arg);return {count:arg.data.length};}}}}};
 const action=load('app/admin/english-review/item-actions.ts',mocks).importEnglishItems;
 const fd=new FormData();fd.set('grade','10');fd.set('digest',registry.englishItemsDigest(10));await action(fd);assert.equal(writes.length,0);
 fd.set('reviewed','yes');await action(fd);assert.equal(writes.length,1);assert.equal(writes[0].skipDuplicates,true);assert.equal(writes[0].data.length,7);
 for(const row of writes[0].data){const r=JSON.parse(row.value);assert.equal(r.status,'PENDING');assert.equal(r.draft.selection.grade,10);assert.ok(r.draft.output.tasks.every(t=>t.boardSource.examYear===2024));}
});
