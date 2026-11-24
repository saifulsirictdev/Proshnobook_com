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
 for(const grade of scope.englishFirstGrades){assert.equal(scope.englishAdminGrade(String(grade)),grade);assert.ok(scope.englishAdminHref(grade).includes(`grade=${grade}`));if(grade===9)assert.deepEqual(registry.preparedEnglishItems(grade),[]);else assert.ok(registry.preparedEnglishItems(grade).every(p=>p.draft.selection.grade===grade));}
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
 const wrapper=fs.readFileSync('components/english-legacy-builder.tsx','utf8');assert.match(wrapper,/<QbBuilder\s+english=/);assert.match(wrapper,/saveEnglishPaper\(\s*draftKey/);
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
 assert.equal(items.length,365);const d=items[0].draft;assert.equal(d.selection.grade,10);assert.deepEqual(d.selection.itemIds,['mcq','comprehension']);validateEnglishReferenceShape(d.selection,d.output);
 assert.equal(d.output.tasks[0].subitems.length,7);assert.equal(d.output.tasks[1].subitems.length,5);
 assert.ok(d.output.tasks.every(t=>t.boardSource.examYear===2024&&t.boardSource?.board==='Dhaka'));assert.match(d.selection.sources["seen-1"].reference,/review/);
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
test('SSC registry covers nine existing item types and honestly reports missing poem/story comprehension',()=>{
 const registry=require('../lib/english/prepared-items.ts'),bank=require('../lib/english/item-bank.ts'),generation=require('../lib/english/generation.ts');
 const items=registry.preparedEnglishItems(10).filter(i=>!['textbook-poems','textbook-stories'].includes(i.group)),stock=items.map(i=>i.draft);
 assert.deepEqual(new Set(items.map(i=>i.group)),new Set(['seen-1','seen-2','unseen','matching','rearranging','story','dialogue']));
 for(const d of stock){generation.validateEnglishReferenceShape(d.selection,d.output);assert.match(d.name,/teacher review/);assert.ok(d.output.tasks.every(t=>{const src=t.boardSource??t.schoolSource;return src ? src.sourceFile&&src.pdfPage>0 : ((d.name.startsWith("SSC authored writing")||d.name.startsWith("SSC authored matching")||d.name.startsWith("SSC authored Unseen")||d.name.startsWith("SSC authored rearranging")) ? /^Authored (?:fictional )?practice/.test(t.instruction) : /(?:Textbook-based authored practice|Supplied-passage-based AUTHORED practice|Authored SAME-TEXT practice)/.test(d.selection.sources["seen-1"].reference));}));}
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
  const d=require('../lib/english/prepared-items.ts').preparedEnglishItems(10).find(i=>i.group==='story'&&i.draft.output.tasks[0].boardSource?.board==='Dhaka'&&i.draft.output.tasks[0].boardSource.examYear===2024).draft;
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
 fd.set('reviewed','yes');await action(fd);assert.equal(writes.length,1);assert.equal(writes[0].skipDuplicates,true);assert.equal(writes[0].data.length,365);
 for(const row of writes[0].data){const r=JSON.parse(row.value);assert.equal(r.status,'PENDING');assert.equal(r.draft.selection.grade,10);assert.ok(r.draft.output.tasks.every(t=>!t.boardSource || [2018,2019,2020,2022,2023,2024].includes(t.boardSource.examYear)));}
});
test('Rajshahi batch preserves distinct passages and keeps ambiguous MCQs out of import registry',()=>{
 const items=require('../lib/english/prepared-items.ts').preparedEnglishItems(10);
 const raj=items.filter(i=>i.draft.output.tasks.some(t=>t.boardSource?.board==='Rajshahi'&&t.boardSource.examYear===2024&&[3,4].includes(t.boardSource.pdfPage)&&!['story','dialogue'].includes(t.id)));
 assert.equal(raj.length,3);assert.deepEqual(raj.flatMap(i=>i.draft.output.tasks.map(t=>t.id)),['comprehension','gap','rearranging']);
 for(const i of raj){assert.equal(i.draft.selection.grade,10);assert.ok(i.draft.output.tasks.every(t=>t.boardSource.examYear===2024&&[3,4].includes(t.boardSource.pdfPage)));assert.ok(i.draft.output.tasks.every(t=>t.subitems.every(s=>s.answer)));}
 const texts=items.flatMap(i=>i.draft.output.passages.filter(p=>p.key.startsWith('seen-')).map(p=>p.text));assert.equal(texts.length-new Set(texts).size,26); // Same school text has separate comprehension/gap roles, not another distinct Seen text; greenhouse full pair also shares its excerpt with a partial role.
 const comp=raj[0].draft.output.tasks[0];assert.match(comp.subitems[3].answer,/does not describe a method/);
 const raw=require('../lib/english/data/ssc-rajshahi-2024-items.json');assert.ok(raw.items.some(i=>i.group==='rearranging'));assert.ok(raj.some(i=>i.group==='rearranging'));assert.match(raw.notes.join(' '),/MCQ held/);
});
test('Expanded SSC batch reports real per-item counts, complete Seen pairs and unique passage coverage',()=>{
 const items=require('../lib/english/prepared-items.ts').preparedEnglishItems(10),counts={};let answers=0;
 for(const item of items)for(const task of item.draft.output.tasks){counts[task.id]=(counts[task.id]||0)+1;answers+=task.subitems.length||1;assert.ok(task.boardSource ? task.boardSource.pdfPage>=1 : task.schoolSource ? task.schoolSource.pdfPage>=1 : ["poems","stories"].includes(task.id)||item.draft.name.startsWith("SSC authored"));}
 assert.equal(items.length,365);assert.equal(answers,2268);
 assert.deepEqual(counts,{mcq:50,comprehension:57,information:50,summary:50,gap:10,rearranging:40,matching:48,poems:40,stories:40,story:40,dialogue:40});
 assert.equal(items.filter(i=>i.draft.output.tasks.some(t=>t.id==='mcq')&&i.draft.output.tasks.some(t=>t.id==='comprehension')).length,50);
 const seen=items.flatMap(i=>i.draft.output.passages.filter(p=>p.key.startsWith('seen-')).map(p=>p.text));assert.equal(seen.length,67);assert.equal(new Set(seen).size,41);
 const unseen=items.flatMap(i=>i.draft.output.passages.filter(p=>p.key==='unseen'));assert.equal(unseen.length,50);assert.equal(new Set(unseen.map(p=>p.text)).size,50);
});
test('Source information tables retain empty cells without inventing extra blanks; wholly empty rows still fail',()=>{
 const {validateEnglishDraft}=require('../lib/english/draft.ts'),{preparedEnglishItems}=require('../lib/english/prepared-items.ts');
 const d=preparedEnglishItems(10).find(i=>i.group==='unseen'&&i.draft.output.tasks[0].boardSource.board==='Jashore').draft;
 assert.ok(d.output.tasks[0].table.rows.some(r=>r.includes('')));assert.ok(validateEnglishDraft(d));
 const bad=structuredClone(d);bad.output.tasks[0].table.rows[0]=Array(5).fill('');assert.throws(()=>validateEnglishDraft(bad));
});
test('School literature uses exact source questions, no fabricated passage or board year; full assembly remains approval-gated',()=>{
 const {preparedEnglishItems}=require('../lib/english/prepared-items.ts'),{assembleEnglishItems,approvedEnglishItem}=require('../lib/english/item-bank.ts'),{validateEnglishDraft}=require('../lib/english/draft.ts');
 const groups=preparedEnglishItems(10),lit=groups.filter(i=>['textbook-poems','textbook-stories'].includes(i.group)&&!i.draft.name.startsWith('SSC authored'));assert.equal(lit.length,2);
 for(const item of lit){const d=item.draft,t=d.output.tasks[0],src=d.selection.sources[item.group];assert.equal(src.kind,'question-bank');assert.equal(src.text,t.subitems.map(s=>s.text).join('\n'));assert.equal(d.output.passages.length,0);assert.equal(t.subitems.length,8);assert.equal(t.boardSource,undefined);assert.match(src.reference,/Not board questions/);assert.equal(approvedEnglishItem(record('PENDING',d),10),null);
  const changed=structuredClone(d);changed.output.tasks[0].subitems[0].text+=' changed';assert.throws(()=>validateEnglishDraft(changed));
  const fake=structuredClone(d);fake.output.tasks[0].passageKey=item.group;fake.output.passages=[{key:item.group,text:'Invented poem extract'}];assert.throws(()=>validateEnglishDraft(fake));
 }
 const approved=groups.map(i=>approvedEnglishItem(record('APPROVED',i.draft),10));assert.ok(approved.every(Boolean));
 const full=assembleEnglishItems(approved,10,()=>0);assert.ok(full.draft);assert.equal(full.draft.output.tasks.length,11);assert.equal(require('../lib/english/generation.ts').validateEnglishOutput(full.draft.selection,full.draft.output).total,100);assert.deepEqual(full.missing,[]);
 const yearly=assembleEnglishItems(approved,10,()=>0,undefined,{examYear:2024});assert.equal(yearly.draft,null);assert.deepEqual(yearly.missing,['poems','stories']);
 const poemOnly=assembleEnglishItems(approved,10,()=>0,['poems']).draft;assert.ok(poemOnly);assert.equal(poemOnly.output.passages.length,0);
 const raw=structuredClone(lit[0].draft);raw.selection.grade=6;assert.throws(()=>validateEnglishDraft(raw));
 const seen=structuredClone(groups[0].draft);seen.selection.sources['seen-1'].kind='question-bank';assert.throws(()=>validateEnglishDraft(seen));
});
test('New 2024 batch expands distinct Seen/Unseen stock while keeping conflicting source exercises out',()=>{
 const items=require('../lib/english/prepared-items.ts').preparedEnglishItems(10),data=require('../lib/english/data/ssc-board-2024-batch3.json');
 const from=(board,group)=>items.filter(i=>i.group===group&&i.draft.output.tasks[0].boardSource?.board===board&&i.draft.output.tasks[0].boardSource?.examYear===2024);
 for(const board of ['Barishal','Dinajpur']){const group=from(board,'seen-1');assert.equal(group.length,1);assert.deepEqual(group[0].draft.output.tasks.map(t=>t.id),['mcq','comprehension']);assert.equal(group[0].draft.output.tasks[0].subitems.length,7);}
 const ch=from('Chattogram','seen-1');assert.equal(ch.length,1);assert.deepEqual(ch[0].draft.output.tasks.map(t=>t.id),['comprehension']);assert.match(ch[0].draft.output.tasks[0].subitems[3].answer,/does not establish/);
 assert.equal(from('Chattogram','unseen').length,1);assert.equal(from('Dinajpur','unseen').length,0);assert.equal(from('Barishal','unseen').length,0);assert.equal(from('Barishal','matching').length,0);
 assert.equal(from('Sylhet','seen-1').length,0);assert.equal(from('Dinajpur','seen-2').length,0);
 assert.match(data.notes.join(' '),/1977/);assert.match(data.notes.join(' '),/1641/);
 const d=from('Dinajpur','seen-1')[0].draft;assert.match(d.output.tasks[1].subitems[3].answer,/Model response/);
 for(const entry of data.items)for(const task of entry.tasks){assert.ok(task.pdfPage>=9&&task.pdfPage<=18);if(task.id==='rearranging')assert.deepEqual(task.subitems.map(s=>Number(s.answer)).sort(),[1,2,3,4,5,6,7,8]);}
});
test('2023 subsets preserve exact original questions, part mapping and historical marks without changing old drafts',()=>{
 const data=require('../lib/english/data/ssc-board-2023-review.json'),{preparedEnglishItems}=require('../lib/english/prepared-items.ts'),{assembleEnglishItems}=require('../lib/english/item-bank.ts'),{validateEnglishDraft}=require('../lib/english/draft.ts');
 const stock=preparedEnglishItems(10).map(i=>i.draft),year=stock.filter(d=>d.output.tasks[0].boardSource?.examYear===2023);assert.equal(year.length,24);
 for(const entry of data.items)for(const task of entry.tasks){
  if(task.selectedParts){assert.equal(task.sourceQuestions.length,task.originalSubitemCount);assert.equal(task.selectedParts.length,task.subitems.length);
   for(let i=0;i<task.subitems.length;i++){const source=task.sourceQuestions[task.selectedParts[i].charCodeAt(0)-97];assert.equal(task.subitems[i].text,source.text);if(source.options)assert.deepEqual(task.subitems[i].options,source.options);}
  }
 }
 const chosen=assembleEnglishItems(stock,10,()=>0,['mcq','comprehension'],{examYear:2023}).draft;assert.ok(chosen);assert.ok(chosen.output.tasks.every(t=>t.boardSource.examYear===2023));
 assert.equal(chosen.output.tasks[0].subitems.length,7);assert.equal(chosen.output.tasks[0].boardSource.originalSubitemCount,10);assert.equal(chosen.output.tasks[1].boardSource.originalSubitemCount,6);
 for(const patch of [{selectedParts:['a','a']},{selectedParts:['z']},{originalSubitemCount:1},{selectedParts:undefined}]){const bad=structuredClone(chosen);Object.assign(bad.output.tasks[0].boardSource,patch);assert.throws(()=>validateEnglishDraft(bad));}
 const missing=assembleEnglishItems(stock,10,()=>0,undefined,{examYear:2023});assert.equal(missing.draft,null);assert.deepEqual(missing.missing,['rearranging','poems','stories']);
 const label=require('../lib/english/board-source.ts').englishBoardLabel(chosen.output.tasks[0].boardSource);assert.match(label,/2023/);assert.match(label,/নির্বাচিত অংশ/);
});

test('2023 creative continuations meet the ten-new-sentence prompt and do not duplicate source prompts',()=>{
 const data=require('../lib/english/data/ssc-board-2023-review.json');
 const stories=data.items.filter(i=>i.group==='story');assert.equal(stories.length,5);
 for(const entry of stories){const t=entry.tasks[0],lines=t.answer.split('\n');assert.equal(lines.length,3);assert.equal(lines[1],t.instruction.split('\n')[1]);assert.equal(lines[2].split(/(?<=[.!?])\s+/).length,10);assert.equal(t.sourceMarks,12);}
 const unique=data.items.map(i=>(i.passage||'')+'\n'+i.tasks.map(t=>t.instruction).join('\n'));assert.equal(new Set(unique).size,unique.length);
});
test('2020 source-image batch retains linked Unseen tables, original blanks and independent year filtering',()=>{
 const {preparedEnglishItems}=require('../lib/english/prepared-items.ts'),{assembleEnglishItems}=require('../lib/english/item-bank.ts');
 const drafts=preparedEnglishItems(10).map(i=>i.draft),batch=drafts.filter(d=>d.output.tasks[0].boardSource?.examYear===2020);assert.equal(batch.length,17);
 const unseen=batch.filter(d=>d.output.passages.some(p=>p.key==='unseen'));assert.equal(unseen.length,4);
 for(const d of unseen){const [info,summary]=d.output.tasks;assert.equal(info.id,'information');assert.equal(summary.id,'summary');assert.equal(info.passageKey,summary.passageKey);assert.equal(info.subitems.length,5);assert.equal(info.table.headers.length,info.table.rows[0].length);
  const printable=info.instruction+'\n'+info.table.rows.flat().join('\n');for(const sub of info.subitems)assert.equal(printable.split(sub.text+' ——').length-1,1);
  assert.ok(summary.answer.length>150);assert.ok(info.table.rows.some(r=>r.includes('')));
 }
 const volta=unseen.find(d=>d.output.tasks[0].boardSource.board==='Jashore');assert.match(volta.output.tasks[0].instruction,/\(i\) —— years/);assert.equal(volta.output.tasks[0].subitems[0].answer,'eight');
 const arm=unseen.find(d=>d.output.tasks[0].boardSource?.board==='Dhaka');assert.match(arm.output.passages[0].text,/Armstrong first stepped/);assert.match(arm.output.passages[0].text,/August 25, 2012/);assert.doesNotMatch(arm.output.passages[0].text,/^76 /);
 for(const d of batch)for(const t of d.output.tasks){assert.equal(t.boardSource.examYear,2020);if(t.id==='rearranging'){assert.deepEqual(t.subitems.map(s=>Number(s.answer)).sort((a,b)=>a-b),[1,2,3,4,5,6,7,8]);}}
 const selected=assembleEnglishItems(drafts,10,()=>0,['information','summary','matching','rearranging'],{examYear:2020});assert.ok(selected.draft);assert.ok(selected.draft.output.tasks.every(t=>t.boardSource.examYear===2020));
 assert.equal(assembleEnglishItems(drafts,10,()=>0,undefined,{examYear:2020}).draft,null);
 const data=require('../lib/english/data/ssc-board-2020-review.json');assert.match(data.notes.join(' '),/Held Cumilla Lincoln/);assert.ok(!batch.some(d=>d.output.tasks[0].id==='information'&&['Sylhet','Dinajpur','Mymensingh','Cumilla','Rajshahi'].includes(d.output.tasks[0].boardSource.board)));
});
test('2019 drafts preserve header blanks and isolate source year without inflating repeated biographies',()=>{
 const {preparedEnglishItems}=require('../lib/english/prepared-items.ts'),{assembleEnglishItems}=require('../lib/english/item-bank.ts');
 const drafts=preparedEnglishItems(10).map(i=>i.draft),batch=drafts.filter(d=>d.output.tasks[0].boardSource?.examYear===2019);assert.equal(batch.length,14);
 const unseen=batch.filter(d=>d.output.tasks[0].id==='information');assert.equal(unseen.length,2);
 for(const d of unseen){const t=d.output.tasks[0];assert.equal(d.output.tasks[1].passageKey,t.passageKey);assert.match(t.instruction,/\(i\) ——/);const printable=t.instruction+'\n'+t.table.rows.flat().join('\n');for(const s of t.subitems)assert.equal(printable.split(s.text+' ——').length-1,1);}
 const shah=unseen.find(d=>d.output.tasks[0].boardSource.board==='Jashore');assert.match(shah.output.passages[0].text,/obtained his B.A. degree six years later/);assert.match(shah.output.passages[0].text,/13 July 1969/);
 const saarc=unseen.find(d=>d.output.tasks[0].boardSource.board==='Sylhet');assert.equal(saarc.output.tasks[0].subitems[0].answer,'1985');
 const selected=assembleEnglishItems(drafts,10,()=>0,['information','summary','matching'],{examYear:2019});assert.ok(selected.draft);assert.ok(selected.draft.output.tasks.every(t=>t.boardSource.examYear===2019));
 assert.equal(assembleEnglishItems(drafts,10,()=>0,['mcq'],{examYear:2019}).draft,null);
 assert.match(require('../lib/english/data/ssc-board-2019-review.json').notes.join(' '),/Repeat Babbage/);
});
test('New creative prompts retain original beginnings and exactly ten new sentences without repeated board themes',()=>{
 const data=require('../lib/english/data/ssc-board-creative-review.json'),{preparedSSCCreativeItems}=require('../lib/english/prepared-ssc-creative.ts');
 assert.equal(data.items.length,28);assert.equal(preparedSSCCreativeItems().length,28);const topics=new Set();
 for(const entry of data.items){assert.ok(!topics.has(entry.topic));topics.add(entry.topic);const t=entry.tasks[0];assert.equal(t.sourceMarks,entry.examYear===2022?5:entry.examYear===2023?12:10);assert.equal(t.sourceQuestion,entry.group==='story'?(entry.examYear===2023?8:9):(entry.examYear===2022?9:entry.examYear===2023?10:12));
  if(entry.group==='story'){const [title,beginning,continuation,...extra]=t.answer.split('\n');assert.ok(title);assert.deepEqual(extra,[]);assert.ok(t.instruction.endsWith(beginning));assert.ok(beginning.startsWith(entry.topic));assert.equal(continuation.split(/(?<=[.!?])\s+/).length,10);}
  else assert.ok(t.answer.split('\n').length>=10);
 }
 assert.match(data.notes.join(' '),/not asserted canonical/);
});
test('New exercise keys are exact source-column combinations and rearranging positions form the stated order',()=>{
 const data=require('../lib/english/data/ssc-board-exercises-review.json'),{preparedSSCExerciseItems}=require('../lib/english/prepared-ssc-exercises.ts');assert.equal(data.items.length,11);assert.equal(preparedSSCExerciseItems().length,11);
 for(const entry of data.items){const t=entry.tasks[0];
  if(t.id==='matching'){assert.equal(entry.answerPairs.length,5);assert.equal(new Set(entry.answerPairs.map(p=>p[0])).size,5);assert.equal(new Set(entry.answerPairs.map(p=>p[1])).size,5);
   for(let i=0;i<5;i++){const [b,c]=entry.answerPairs[i],strip=s=>s.replace(/^(?:\([a-e]\)|[ivx]+\.)\s*/, '');assert.equal(t.subitems[i].answer,[strip(t.table.rows[i][0]),strip(t.table.rows[b][1]),strip(t.table.rows[c][2])].join(' '));}
  }
  if(t.id==='rearranging'){const order=t.answer.split(' → ');assert.equal(new Set(order).size,8);for(let i=0;i<8;i++)assert.equal(t.subitems[i].answer,String(order.indexOf(String.fromCharCode(97+i))+1));}
 }
 const seen=data.items.filter(e=>e.group==='seen-1');assert.equal(seen.length,3);assert.equal(seen.filter(e=>e.tasks.some(t=>t.id==='mcq')).length,1);
 const mainul=seen.find(e=>e.examYear===2018);assert.equal(mainul.board,'Combined');assert.equal(mainul.tasks[0].subitems[1].answer,'lives');assert.ok(seen.filter(e=>e.examYear!==2018).every(e=>e.tasks.every(t=>t.id!=='mcq')));
});
test('School Unseen provenance stays separate from board years and survives assembly without automatic approval',()=>{
 const {preparedSSCSchoolItems}=require('../lib/english/prepared-ssc-school.ts'),{assembleEnglishItems}=require('../lib/english/item-bank.ts'),{validateEnglishDraft}=require('../lib/english/draft.ts');const items=preparedSSCSchoolItems();assert.equal(items.length,4);
 for(const item of items){const d=item.draft;assert.deepEqual(d.selection.itemIds,['information','summary']);assert.equal(d.output.tasks[0].subitems.length,5);assert.ok(d.output.tasks.every(t=>t.schoolSource&&!t.boardSource));const info=d.output.tasks[0];for(const sub of info.subitems)assert.equal(info.table.rows.flat().join('\n').split(sub.text+' ').length-1,1);
  assert.equal(assembleEnglishItems([d],10,()=>0,['information','summary'],{examYear:2024}).draft,null);assert.equal(assembleEnglishItems([d],10,()=>0,['information','summary'],{examYear:2025}).draft,null);assert.equal(assembleEnglishItems([d],10,()=>0,['information','summary'],{examYear:2026}).draft,null);
  const assembled=assembleEnglishItems([d],10,()=>0,['information','summary']).draft;assert.ok(assembled);assert.deepEqual(assembled.output.tasks[0].schoolSource,info.schoolSource);
  const bad=structuredClone(d);bad.output.tasks[0].boardSource={board:'Dhaka',examYear:2024,sourceFile:'fake',pdfPage:1,questionNumber:4};assert.throws(()=>validateEnglishDraft(bad),/both school and board/);
 }
 assert.equal(items[0].draft.output.tasks[0].schoolSource.examYear,2025);assert.equal(items[1].draft.output.tasks[0].schoolSource.examYear,2024);assert.equal(items[1].draft.output.tasks[1].schoolSource.pdfPage,78);
 const {englishSchoolSourceSchema}=require('../lib/english/board-source.ts');assert.equal(englishSchoolSourceSchema.safeParse({...items[0].draft.output.tasks[0].schoolSource,pdfPage:0}).success,false);
});
test('School source labels follow the same default-hidden and opt-in print-fragment presentation',()=>{
 const old=require.extensions['.tsx'];require.extensions['.tsx']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
 try{const React=require('react'),render=require('react-dom/server').renderToStaticMarkup,Group=require('../components/paper-builder/english-group.tsx').default;
  const d=require('../lib/english/prepared-ssc-school.ts').preparedSSCSchoolItems()[1].draft,p=require('../lib/english/legacy-builder.ts').englishLegacyPaper(d),fragments=p.items.flatMap(require('../lib/english/flow-blocks.ts').englishFlowBlocks),html=()=>fragments.map(q=>render(React.createElement(Group,{q,answers:true,s:p.settings}))).join('');
  assert.equal(p.settings.show.boardSource,false);assert.doesNotMatch(html(),/Akij Collegiate|School, not board/);p.settings.show.boardSource=true;assert.equal((html().match(/Akij Collegiate School/g)||[]).length,2);assert.match(html(),/Test 2024/);assert.match(html(),/School, not board/);assert.doesNotMatch(html(),/Board 2024|2026/);p.settings.show.boardSource=false;assert.doesNotMatch(html(),/Akij Collegiate/);
 }finally{if(old)require.extensions['.tsx']=old;else delete require.extensions['.tsx'];}
});

test('Expanded school exercise registry preserves exact matching keys, permutations and preceding-paper headers',()=>{
 const data=require('../lib/english/data/ssc-school-exercises-review.json'),{preparedSSCSchoolExerciseItems}=require('../lib/english/prepared-ssc-school-exercises.ts');
 const items=preparedSSCSchoolExerciseItems();assert.equal(items.length,38);assert.equal(data.items.length,38);
 for(const entry of data.items){
  const t=entry.tasks[0];assert.ok(entry.headerPage<=t.pdfPage);assert.equal(entry.examYear,entry.school==='Akij Collegiate School, Jashore'?2024:2025);assert.ok(['Test','Annual'].includes(entry.examType));
  if(t.id==='rearranging'){
   assert.equal(t.sourceMarks,8);assert.equal(t.sourceQuestion,7);assert.equal(t.subitems.length,8);assert.equal(new Set(entry.order).size,8);assert.equal(t.answer,entry.order.split('').join(' → '));
   for(let i=0;i<8;i++)assert.equal(t.subitems[i].answer,String(entry.order.indexOf(String.fromCharCode(97+i))+1));
  }
  if(t.id==='matching'){
   assert.equal(t.sourceMarks,5);assert.equal(t.sourceQuestion,6);assert.equal(t.subitems.length,5);
   assert.equal(new Set(entry.answerPairs.map(p=>p[0])).size,5);assert.equal(new Set(entry.answerPairs.map(p=>p[1])).size,5);
   const strip=s=>s.replace(/^(?:\([a-e]\)|[ivx]+\.)\s*/, '');
   for(let i=0;i<5;i++){const [b,c]=entry.answerPairs[i];assert.equal(t.subitems[i].answer,[strip(t.table.rows[i][0]),strip(t.table.rows[b][1]),strip(t.table.rows[c][2])].join(' '));}
  }
 }
 const page38=data.items.filter(e=>e.tasks[0].pdfPage===38);assert.equal(page38.length,3);assert.ok(page38.every(e=>e.school==='Unique Progressive School, Mymensingh'&&e.headerPage===36));
 const stress=data.items.find(e=>e.group==='dialogue'&&e.tasks[0].pdfPage===59);assert.equal(stress.tasks[0].sourceQuestion,10);assert.equal(stress.school,'Naogaon Krishnadhan Govt. High School, Naogaon');
 for(const item of items){assert.ok(item.draft.output.tasks.every(t=>t.schoolSource&&!t.boardSource));const assemble=require('../lib/english/item-bank.ts').assembleEnglishItems;assert.equal(assemble([item.draft],10,()=>0,item.draft.selection.itemIds,{examYear:2025}).draft,null);const combined=assemble([item.draft],10,()=>0,item.draft.selection.itemIds).draft;assert.ok(combined);assert.deepEqual(combined.output.tasks[0].schoolSource,item.draft.output.tasks[0].schoolSource);if(['story','dialogue'].includes(item.group))assert.deepEqual(combined.selection.writing[item.group],item.draft.selection.writing[item.group]);}
});

test('Expanded school writing retains original openings, ten new continuation sentences and safe illustrative keys',()=>{
 const data=require('../lib/english/data/ssc-school-exercises-review.json');const stories=data.items.filter(e=>e.group==='story'),dialogues=data.items.filter(e=>e.group==='dialogue');assert.equal(stories.length,10);assert.equal(dialogues.length,10);
 for(const entry of [...stories,...dialogues]){const t=entry.tasks[0];assert.equal(t.sourceMarks,15);assert.ok(t.instruction.toLowerCase().includes(entry.topic.toLowerCase()));
  if(entry.group==='story'){const [title,beginning,continuation,...extra]=t.answer.split('\n');assert.ok(title);assert.deepEqual(extra,[]);assert.ok(t.instruction.endsWith(beginning));assert.ok(beginning.startsWith(entry.topic));assert.equal(continuation.split(/(?<=[.!?])\s+/).length,10);}
  else {assert.equal(t.answer.split('\n').length,12);assert.ok(t.answer.split('\n').every(line=>/^[^:]+: .+/.test(line)));}
 }
 assert.match(stories.find(e=>e.tasks[0].pdfPage===19).tasks[0].answer,/not be treated as real advice/);
 const topics=[...stories,...dialogues].map(e=>e.topic);assert.equal(new Set(topics).size,20);
});

test('School reading roles disclose held MCQs and do not inflate complete pairs or distinct text counts',()=>{
 const data=require('../lib/english/data/ssc-school-reading-review.json'),{preparedSSCSchoolReadingItems}=require('../lib/english/prepared-ssc-school-reading.ts');const items=preparedSSCSchoolReadingItems();assert.equal(items.length,4);
 assert.deepEqual(items.flatMap(i=>i.draft.output.tasks.map(t=>t.id)),['comprehension','comprehension','comprehension','gap']);
 assert.equal(new Set(items.flatMap(i=>i.draft.output.passages.map(p=>p.text))).size,3);assert.match(data.notes.join(' '),/all MCQ sets are held/);
 for(const item of items){const d=item.draft;assert.equal(d.output.passages.length,1);assert.equal(d.output.tasks[0].subitems.length,5);assert.ok(d.output.tasks[0].schoolSource&&!d.output.tasks[0].boardSource);assert.equal(d.selection.sources[item.group].text,d.output.passages[0].text);assert.match(d.selection.sources[item.group].reference,/not a complete Seen pair/);}
 assert.match(data.items[1].tasks[0].subitems[2].answer,/does not explain/);assert.match(data.items[2].tasks[0].subitems[3].answer,/does not prove/);
});

test('Washington school Unseen preserves cross-page source, original five table blanks and 70–90 word summary',()=>{
 const entry=require('../lib/english/data/ssc-school-unseen-review.json').items.at(-1),items=require('../lib/english/prepared-ssc-school.ts').preparedSSCSchoolItems(),d=items.at(-1).draft;assert.equal(entry.school,'Lions School and College, Saidpur, Nilphamari');assert.equal(entry.headerPage,59);assert.match(entry.passage,/1732/);assert.match(entry.passage,/December 1799/);
 const [info,summary]=d.output.tasks;assert.equal(info.schoolSource.pdfPage,61);assert.equal(info.table.rows.length,4);assert.equal(info.subitems[0].answer,'inherited a substantial estate');assert.equal(info.subitems[4].answer,'June 1775');const words=summary.answer.split(/\s+/).length;assert.ok(words>=70&&words<=90);
});


test('Textbook authored practice is distinct, answer-complete, traceable and never board-year stock',()=>{
 const {preparedSSCTextbookLiteratureItems}=require('../lib/english/prepared-ssc-textbook-literature.ts');
 const {preparedSSCTextbookSeenItems}=require('../lib/english/prepared-ssc-textbook-seen.ts');
 const {assembleEnglishItems,approvedEnglishItem}=require('../lib/english/item-bank.ts');
 const lit=preparedSSCTextbookLiteratureItems(),seen=preparedSSCTextbookSeenItems();assert.equal(lit.length,14);assert.equal(seen.length,8);
 const all=[...lit,...seen];assert.equal(new Set(all.map(i=>i.key)).size,22);
 assert.equal(all.reduce((n,i)=>n+i.draft.output.tasks.reduce((m,t)=>m+t.subitems.length,0),0),208);
 for(const item of all){const d=item.draft,src=d.selection.sources[item.group];assert.match(src.reference,/Textbook-based authored practice/);assert.match(src.reference,/SHA256/);assert.match(src.reference,/teacher review/i);assert.ok(d.output.tasks.every(t=>!t.boardSource&&!t.schoolSource&&t.subitems.every(s=>s.answer)));
  assert.equal(approvedEnglishItem(record('PENDING',d),10),null);
  assert.equal(assembleEnglishItems([d],10,()=>0,d.selection.itemIds,{examYear:2024}).draft,null);
  const out=assembleEnglishItems([d],10,()=>0,d.selection.itemIds).draft;assert.ok(out);assert.equal(out.selection.sources[item.group].reference,src.reference);
 }
 for(const item of seen){const d=item.draft;assert.deepEqual(d.output.tasks.map(t=>t.id),['mcq','comprehension']);assert.deepEqual(d.output.tasks.map(t=>t.subitems.length),[7,5]);assert.ok(d.output.tasks.every(t=>t.passageKey==='seen-1'));assert.equal(d.selection.sources['seen-1'].text,d.output.passages[0].text);
  for(const sub of d.output.tasks[0].subitems){assert.equal(sub.options.length,4);assert.equal(new Set(sub.options).size,4);assert.equal(sub.options.filter(o=>o===sub.answer).length,1);}
 }
 for(const file of ['literature','seen']){const raw=require('../lib/english/data/ssc-textbook-'+file+'-review.json');assert.equal(raw.status,'DRAFT_TEACHER_REVIEW_REQUIRED');assert.match(raw.sourceSha256,/^[a-f0-9]{64}$/);for(const e of raw.items){assert.equal(e.questionOrigin,'assistant-authored-practice');assert.deepEqual(e.printedPages,e.pdfPages.map(p=>p-5));}}
});


test('Additional image-checked school exercises have exact matching mappings, complete narrative orders and no board-year eligibility',()=>{
 const raw=require('../lib/english/data/ssc-school-additional-review.json');
 const {preparedSSCSchoolAdditionalItems}=require('../lib/english/prepared-ssc-school-additional.ts');
 const {assembleEnglishItems,approvedEnglishItem}=require('../lib/english/item-bank.ts');
 const items=preparedSSCSchoolAdditionalItems();assert.equal(items.length,7);assert.equal(new Set(items.map(i=>i.key)).size,7);
 assert.equal(items.reduce((n,i)=>n+i.draft.output.tasks[0].subitems.length,0),44);
 assert.equal(raw.sourceSha256,'b0603b5eb98f2f6d25b991257da8975bbfcf9550508505d26d8548ec98b4cd91');
 const strip=s=>s.replace(/^\([a-e]\)\s*|^[ivx]+\.\s*/,'');
 for(let j=0;j<items.length;j++){const item=items[j],d=item.draft,t=d.output.tasks[0],e=raw.items[j];assert.equal(d.selection.grade,10);assert.equal(t.schoolSource.examYear,2025);assert.equal(t.schoolSource.pdfPage,e.tasks[0].pdfPage);assert.equal(t.schoolSource.school,e.school);assert.ok(e.headerPage<t.schoolSource.pdfPage);assert.equal(t.boardSource,undefined);assert.equal(approvedEnglishItem(record('PENDING',d),10),null);
  assert.equal(assembleEnglishItems([d],10,()=>0,d.selection.itemIds,{examYear:2025}).draft,null);
  const combined=assembleEnglishItems([d],10,()=>0,d.selection.itemIds).draft;assert.ok(combined);assert.deepEqual(combined.output.tasks[0].schoolSource,t.schoolSource);
  if(t.id==='matching'){assert.equal(t.subitems.length,5);assert.equal(t.schoolSource.originalMarks,5);for(const col of [0,1])assert.deepEqual(e.answerPairs.map(p=>p[col]).sort(),[0,1,2,3,4]);for(let i=0;i<5;i++){const [b,c]=e.answerPairs[i];assert.equal(t.subitems[i].answer,[strip(t.table.rows[i][0]),strip(t.table.rows[b][1]),strip(t.table.rows[c][2])].join(' '));}}
  else {assert.equal(t.subitems.length,8);assert.equal(t.schoolSource.originalMarks,8);assert.equal(new Set(e.order).size,8);assert.deepEqual(t.subitems.map(s=>Number(s.answer)).sort(),[1,2,3,4,5,6,7,8]);assert.equal(t.subitems.map((s,i)=>({pos:Number(s.answer),letter:String.fromCharCode(97+i)})).sort((a,b)=>a.pos-b.pos).map(x=>x.letter).join(''),e.order);}
 }
 assert.deepEqual(raw.items.filter(e=>e.group==='rearranging').map(e=>e.order),['cafhdbge','hgacdfbe','fcdbhage']);
 assert.match(raw.notes.join(' '),/illness-for-years blank does not specify an endpoint/);assert.match(raw.notes.join(' '),/none guarantee immunity/);
 const cyber=items.find(i=>i.group==='matching'&&i.draft.output.tasks[0].schoolSource.pdfPage===75).draft.output.tasks[0];assert.match(cyber.subitems[4].answer,/prevent exposure to phishing/);
 const stock=require('../lib/english/prepared-items.ts').preparedEnglishItems(10);assert.equal(new Set(stock.map(i=>i.key)).size,stock.length);
});

test('New reading pairs distinguish authored practice from intact school questions and stay review-gated',()=>{
 const {preparedSSCAuthoredReadingItems}=require('../lib/english/prepared-ssc-authored-reading.ts');
 const {preparedSSCSchoolSeenPairItems}=require('../lib/english/prepared-ssc-school-seen-pairs.ts');
 const {assembleEnglishItems,approvedEnglishItem}=require('../lib/english/item-bank.ts');
 const authored=preparedSSCAuthoredReadingItems(),school=preparedSSCSchoolSeenPairItems();
 assert.equal(authored.length,9);assert.equal(school.length,1);
 const raw=require('../lib/english/data/ssc-authored-reading-review.json');
 assert.equal(raw.status,'DRAFT_TEACHER_REVIEW_REQUIRED');assert.match(raw.notes.join(' '),/NOT the original school questions/);
 for(const [j,item] of [...authored,...school].entries()){
  const d=item.draft;assert.deepEqual(d.output.tasks.map(t=>t.id),['mcq','comprehension']);assert.deepEqual(d.output.tasks.map(t=>t.subitems.length),[7,5]);
  assert.equal(d.output.passages.length,1);assert.equal(d.output.passages[0].text,d.selection.sources['seen-1'].text);
  assert.equal(approvedEnglishItem(record('PENDING',d),10),null);assert.equal(assembleEnglishItems([d],10,()=>0,d.selection.itemIds,{examYear:2025}).draft,null);
  const merged=assembleEnglishItems([d],10,()=>0,d.selection.itemIds).draft;assert.ok(merged);assert.equal(merged.selection.sources['seen-1'].reference,d.selection.sources['seen-1'].reference);
  for(const sub of d.output.tasks[0].subitems){assert.equal(sub.options.length,4);assert.equal(new Set(sub.options).size,4);assert.equal(sub.options.filter(o=>o===sub.answer).length,1);}
  assert.ok(d.output.tasks.every(t=>!t.boardSource&&t.subitems.every(s=>s.answer)));
  if(j<9){assert.ok(d.output.tasks.every(t=>!t.schoolSource));assert.match(d.selection.sources['seen-1'].reference,/AUTHORED practice/);const e=raw.items[j];assert.equal(e.questionOrigin,'assistant-authored-practice');assert.ok(e.excerptLocator&&e.limitations);}
  else for(const t of d.output.tasks){assert.equal(t.schoolSource.school,'Habiganj Government High School, Habiganj');assert.equal(t.schoolSource.pdfPage,112);assert.equal(t.schoolSource.examYear,2025);assert.equal(t.schoolSource.originalMarks,t.id==='mcq'?7:10);}
 }
 assert.ok(!raw.items.find(e=>e.topic.startsWith('Zahir')).passage.includes('30 December'));
 assert.ok(!raw.items.find(e=>e.topic.startsWith('Meherjan')).passage.includes('100,000'));
 assert.equal(new Set([...authored,...school].map(i=>i.key)).size,10);
});

test('Intact historic board tables preserve every fragment/blank, original counts and review gating',()=>{
 const raw=require('../lib/english/data/ssc-board-intact-tables-review.json');
 const items=require('../lib/english/prepared-ssc-intact-tables.ts').preparedSSCIntactTableItems();
 const {assembleEnglishItems,approvedEnglishItem}=require('../lib/english/item-bank.ts');
 const {validateEnglishDraft}=require('../lib/english/draft.ts');
 const {englishBoardLabel}=require('../lib/english/board-source.ts');
 assert.equal(items.length,11);assert.equal(new Set(items.map(i=>i.key)).size,11);
 assert.equal(items.reduce((n,i)=>n+i.draft.output.tasks.reduce((m,t)=>m+(t.subitems.length||1),0),0),60);
 assert.equal(raw.sourceSha256,'768d1d0b6f3c67ffe57187e64908a68f82f6a2553847642f840ea9f492946874');
 const strip=s=>s.replace(/^\([a-g]\)\s*|^[ivx]+\.\s*/,'');
 for(let j=0;j<items.length;j++){
  const item=items[j],d=item.draft,t=d.output.tasks[0],e=raw.items[j],src=t.boardSource;
  assert.equal(src.board,e.board);assert.equal(src.examYear,e.examYear);assert.equal(src.pdfPage,e.tasks[0].pdfPage);assert.equal(t.schoolSource,undefined);
  assert.equal(approvedEnglishItem(record('PENDING',d),10),null);
  assert.equal(assembleEnglishItems([d],10,()=>0,d.selection.itemIds,{examYear:2024}).draft,null);
  const combined=assembleEnglishItems([d],10,()=>0,d.selection.itemIds,{examYear:e.examYear}).draft;assert.ok(combined);assert.deepEqual(combined.output.tasks[0],t);
  assert.ok(validateEnglishDraft(combined));
  if(t.id==='matching'){
   const n=t.subitems.length;assert.ok([4,5,7].includes(n));assert.equal(t.table.rows.length,n);assert.equal(src.originalMarks,n);
   for(const col of [0,1])assert.deepEqual(e.answerPairs.map(p=>p[col]).sort(),Array.from({length:n},(_,i)=>i));
   for(let k=0;k<n;k++){const [b,c]=e.answerPairs[k];assert.equal(t.subitems[k].answer,[strip(t.table.rows[k][0]),strip(t.table.rows[b][1]),strip(t.table.rows[c][2])].join(' '));}
  }else{
   assert.equal(t.subitems.length,6);assert.equal(d.output.tasks[1].id,'summary');assert.equal(t.passageKey,'unseen');assert.equal(d.output.tasks[1].passageKey,'unseen');
   for(const sub of t.subitems)assert.equal(t.table.rows.flat().join('\n').split(sub.text+' ——').length-1,1);
   assert.ok(d.output.tasks[1].answer.split(/\s+/).length>=70);assert.ok(d.output.tasks[1].answer.split(/\s+/).length<=90);
  }
  if(src.originalSubitemCount){assert.equal(src.originalSubitemCount,t.subitems.length);assert.deepEqual(src.selectedParts,Array.from({length:t.subitems.length},(_,i)=>String.fromCharCode(97+i)));assert.match(englishBoardLabel(src),/অক্ষুণ্ণ/);assert.doesNotMatch(englishBoardLabel(src),/নির্বাচিত অংশ/);assert.match(t.instruction,/Practice note:/);assert.match(t.instruction,/5 marks in total/);}
 }
 const stock=require('../lib/english/prepared-items.ts').preparedEnglishItems(10);assert.equal(new Set(stock.map(i=>i.key)).size,stock.length);
 const unseen=items.filter(i=>i.group==='unseen');assert.equal(unseen.length,2);assert.match(unseen[0].draft.output.tasks[1].answer,/posthumous/);
 assert.match(raw.notes.join(' '),/Deduplicated 2023 Shahidullah/);
});

test('Historical count compatibility is narrow and cannot silently truncate standard or original exercises',()=>{
 const {validateEnglishDraft}=require('../lib/english/draft.ts');
 const items=require('../lib/english/prepared-ssc-intact-tables.ts').preparedSSCIntactTableItems();
 for(const item of items.filter(i=>i.draft.output.tasks[0].boardSource.originalSubitemCount)){
  const original=item.draft;
  for(const mutate of [
   d=>{delete d.output.tasks[0].boardSource;},
   d=>{d.output.tasks[0].boardSource.examYear=2024;},
   d=>{d.output.tasks[0].boardSource.questionNumber=1;},
   d=>{d.output.tasks[0].boardSource.originalMarks=99;},
   d=>{delete d.output.tasks[0].boardSource.selectedParts;},
   d=>{d.output.tasks[0].subitems.pop();},
   d=>{d.output.tasks[0].boardSource.selectedParts.reverse();},
  ]){const bad=structuredClone(original);mutate(bad);assert.throws(()=>validateEnglishDraft(bad));}
  const bad=structuredClone(original);if(bad.output.tasks[0].id==='matching')bad.output.tasks[0].table.rows.pop();else bad.output.tasks[0].table.rows=bad.output.tasks[0].table.rows.map(r=>r.map(c=>c.replace('(vi)','(vii)')));assert.throws(()=>validateEnglishDraft(bad));
 }
});

test('Historical table counts survive print fragmentation with practice marks and visible adaptation notes',()=>{
 const old=require.extensions['.tsx'];require.extensions['.tsx']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
 try{
  const React=require('react'),render=require('react-dom/server').renderToStaticMarkup,Group=require('../components/paper-builder/english-group.tsx').default;
  const items=require('../lib/english/prepared-ssc-intact-tables.ts').preparedSSCIntactTableItems();
  for(const item of items){
   const p=require('../lib/english/legacy-builder.ts').englishLegacyPaper(item.draft),fragments=p.items.flatMap(require('../lib/english/flow-blocks.ts').englishFlowBlocks);
   const tasks=fragments.flatMap(q=>q.englishGroup.tasks);
   assert.equal(tasks.reduce((n,t)=>n+t.subitems.length,0),item.draft.output.tasks.reduce((n,t)=>n+t.subitems.length,0));
   assert.equal(p.settings.show.boardSource,false);
   const html=fragments.map(q=>render(React.createElement(Group,{q,answers:true,s:p.settings}))).join('');
   assert.doesNotMatch(html,/Board 202[023]/);
   const t=item.draft.output.tasks[0];if(t.boardSource.originalSubitemCount){assert.equal((html.match(/Practice note:/g)||[]).length,1);assert.match(html,/5 marks in total/);}
   if(t.id==='information')for(const sub of t.subitems)assert.ok(tasks.some(t=>t.subitems.some(s=>s.answer===sub.answer)));
   p.settings.show.boardSource=true;p.settings.show.marks=true;
   const provenance=fragments.map(q=>render(React.createElement(Group,{q,answers:true,s:p.settings}))).join('');
   if(t.boardSource.originalSubitemCount){assert.match(provenance,/অক্ষুণ্ণ/);assert.match(provenance,new RegExp(`মূল প্রশ্নে ${t.boardSource.originalMarks} নম্বর; practice-এ 5`));}
  }
 }finally{if(old)require.extensions['.tsx']=old;else delete require.extensions['.tsx'];}
});

test('Authored writing closes practice-only minima with seven ten-sentence stories and fifteen twelve-turn dialogues',()=>{
 const raw=require('../lib/english/data/ssc-authored-writing-review.json');
 const items=require('../lib/english/prepared-ssc-authored-writing.ts').preparedSSCAuthoredWritingItems();
 const {assembleEnglishItems,approvedEnglishItem}=require('../lib/english/item-bank.ts');
 assert.equal(raw.status,'DRAFT_TEACHER_REVIEW_REQUIRED');assert.equal(raw.sourceKind,'original-authored-writing-practice');
 assert.equal(raw.sourceFile,undefined);assert.equal(raw.sourceSha256,undefined);
 assert.equal(items.length,22);assert.equal(items.filter(i=>i.group==='story').length,7);assert.equal(items.filter(i=>i.group==='dialogue').length,15);
 for(let j=0;j<items.length;j++){
  const e=raw.items[j],i=items[j],d=i.draft,t=d.output.tasks[0];assert.equal(e.questionOrigin,'assistant-authored-practice');assert.ok(e.learningFocus);
  assert.ok(d.name.startsWith('SSC authored writing'));assert.equal(d.output.passages.length,0);assert.deepEqual(d.selection.sources,{});assert.deepEqual(d.selection.itemIds,[e.group]);
  assert.equal(t.boardSource,undefined);assert.equal(t.schoolSource,undefined);assert.equal(t.passageKey,undefined);assert.equal(t.subitems.length,0);assert.match(t.instruction,/Authored practice — not a board or school examination question/);assert.ok(t.instruction.includes(e.topic));
  assert.equal(approvedEnglishItem(record('PENDING',d),10),null);
  for(const examYear of [2019,2020,2022,2023,2024,2025])assert.equal(assembleEnglishItems([d],10,()=>0,[e.group],{examYear}).draft,null);
  const assembled=assembleEnglishItems([d],10,()=>0,[e.group]).draft;assert.ok(assembled);assert.deepEqual(assembled.output.tasks,[t]);
  if(e.group==='story'){
   const lines=t.answer.split('\n');assert.equal(lines.length,3);assert.equal(lines[1],e.beginning);assert.ok(t.instruction.endsWith(e.beginning));assert.equal(e.continuationSentences.length,10);assert.equal(lines[2],e.continuationSentences.join(' '));assert.equal(lines[2].split(/(?<=[.!?])\s+/).length,10);assert.ok(e.continuationSentences.every(s=>/[.!?]$/.test(s)));
  }else{
   const lines=t.answer.split('\n');assert.equal(lines.length,12);const names=lines.map(l=>l.split(':')[0]);assert.equal(new Set(names).size,2);
   for(let k=0;k<12;k++){assert.equal(names[k],names[k%2]);assert.ok(t.instruction.includes(names[k]));assert.ok(lines[k].split(':').slice(1).join(':').trim().length>15);}
  }
 }
 const stock=require('../lib/english/prepared-items.ts').preparedEnglishItems(10);
 assert.equal(stock.filter(i=>i.group==='story').length,40);assert.equal(stock.filter(i=>i.group==='dialogue').length,40);
 for(const group of ['story','dialogue']){const prompts=stock.filter(i=>i.group===group).map(i=>i.draft.output.tasks[0].instruction.replace(/\s+/g,' ').trim());assert.equal(new Set(prompts).size,40);}
});

test('Authored matching has sixteen standard five-part permutations, exact keys and no false exam provenance',()=>{
 const raw=require('../lib/english/data/ssc-authored-matching-review.json');
 const items=require('../lib/english/prepared-ssc-authored-matching.ts').preparedSSCAuthoredMatchingItems();
 const {assembleEnglishItems,approvedEnglishItem}=require('../lib/english/item-bank.ts');
 assert.equal(raw.status,'DRAFT_TEACHER_REVIEW_REQUIRED');assert.equal(raw.sourceKind,'original-authored-matching-practice');assert.equal(raw.sourceFile,undefined);assert.equal(raw.sourceSha256,undefined);
 assert.equal(items.length,16);assert.equal(new Set(raw.items.map(e=>e.topic)).size,16);
 const strip=s=>s.replace(/^\([a-e]\)\s*|^[ivx]+\.\s*/,'');
 for(let j=0;j<items.length;j++){
  const e=raw.items[j],d=items[j].draft,t=d.output.tasks[0];assert.equal(e.questionOrigin,'assistant-authored-practice');assert.equal(t.id,'matching');assert.equal(t.subitems.length,5);assert.equal(t.table.rows.length,5);assert.equal(t.table.headers.length,3);
  assert.equal(t.boardSource,undefined);assert.equal(t.schoolSource,undefined);assert.equal(d.output.passages.length,0);assert.deepEqual(d.selection.sources,{});assert.deepEqual(d.selection.writing,{});assert.match(t.instruction,/Authored practice — not a board or school examination question/);
  for(const col of [0,1])assert.deepEqual(e.answerPairs.map(p=>p[col]).sort(),[0,1,2,3,4]);
  for(const col of [0,1,2])assert.equal(new Set(t.table.rows.map(r=>strip(r[col]))).size,5);
  for(let k=0;k<5;k++){const [b,c]=e.answerPairs[k];assert.equal(t.subitems[k].answer,[strip(t.table.rows[k][0]),strip(t.table.rows[b][1]),strip(t.table.rows[c][2])].join(' '));}
  assert.equal(approvedEnglishItem(record('PENDING',d),10),null);assert.equal(assembleEnglishItems([d],10,()=>0,['matching'],{examYear:2024}).draft,null);assert.deepEqual(assembleEnglishItems([d],10,()=>0,['matching']).draft.output.tasks,[t]);
 }
 const stock=require('../lib/english/prepared-items.ts').preparedEnglishItems(10),matching=stock.filter(i=>i.group==='matching');
 assert.equal(matching.length,48);assert.equal(matching.filter(i=>i.draft.output.tasks[0].subitems.length===5).length,40);
 assert.equal(new Set(stock.map(i=>i.key)).size,stock.length);
});

test('Authored practice labels, prompts and answers survive assembly and print with provenance hidden',()=>{
 const old=require.extensions['.tsx'];require.extensions['.tsx']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
 try{
  const React=require('react'),render=require('react-dom/server').renderToStaticMarkup,Group=require('../components/paper-builder/english-group.tsx').default;
  const {assembleEnglishItems}=require('../lib/english/item-bank.ts');
  const writing=require('../lib/english/prepared-ssc-authored-writing.ts').preparedSSCAuthoredWritingItems(),matching=require('../lib/english/prepared-ssc-authored-matching.ts').preparedSSCAuthoredMatchingItems();
  const combined=assembleEnglishItems([...writing,...matching].map(i=>i.draft),10,()=>0,['matching','story','dialogue']).draft;
  assert.ok(combined);assert.deepEqual(combined.output.tasks.map(t=>t.id),['matching','story','dialogue']);assert.ok(combined.output.tasks.every(t=>!t.boardSource&&!t.schoolSource));
  for(const d of [combined,...writing.map(i=>i.draft),...matching.map(i=>i.draft)]){
   const p=require('../lib/english/legacy-builder.ts').englishLegacyPaper(d),fragments=p.items.flatMap(require('../lib/english/flow-blocks.ts').englishFlowBlocks);
   assert.equal(p.settings.show.boardSource,false);
   const html=fragments.map(q=>render(React.createElement(Group,{q,answers:true,s:p.settings}))).join('');
   assert.equal((html.match(/Authored practice — not a board or school examination question/g)||[]).length,d.output.tasks.length);assert.doesNotMatch(html,/Board 202[02345]|মূল প্রশ্নে/);
   const actual=fragments.flatMap(q=>q.englishGroup.tasks);assert.equal(actual.reduce((n,t)=>n+t.subitems.length,0),d.output.tasks.reduce((n,t)=>n+t.subitems.length,0));
  }
 }finally{if(old)require.extensions['.tsx']=old;else delete require.extensions['.tsx'];}
});

test('Thirty-five authored Unseen pairs reach fifty without false exam provenance or invented answer details',()=>{
 const raw=require('../lib/english/data/ssc-authored-unseen-review.json'),items=require('../lib/english/prepared-ssc-authored-unseen.ts').preparedSSCAuthoredUnseenItems();
 const {assembleEnglishItems,approvedEnglishItem}=require('../lib/english/item-bank.ts');
 assert.equal(raw.status,'DRAFT_TEACHER_REVIEW_REQUIRED');assert.equal(raw.sourceFile,undefined);assert.equal(raw.sourceSha256,undefined);assert.equal(items.length,35);assert.equal(new Set(raw.items.map(e=>e.topic)).size,35);
 assert.equal(items.reduce((n,i)=>n+i.draft.output.tasks.reduce((m,t)=>m+(t.subitems.length||1),0),0),210);
 for(let j=0;j<items.length;j++){
  const e=raw.items[j],d=items[j].draft,[info,summary]=d.output.tasks;
  assert.equal(e.questionOrigin,'assistant-authored-practice');assert.equal(e.fictional,true);assert.ok(d.name.startsWith('SSC authored Unseen'));
  assert.equal(d.output.passages.length,1);assert.equal(d.output.passages[0].text,e.passage);assert.match(e.passage,/^Authored fictional practice — not a board or school examination passage/);
  assert.deepEqual(d.output.tasks.map(t=>t.id),['information','summary']);assert.ok(d.output.tasks.every(t=>t.passageKey==='unseen'&&!t.boardSource&&!t.schoolSource&&/^Authored practice/.test(t.instruction)));
  assert.equal(info.subitems.length,5);assert.equal(info.table.rows.length,5);assert.equal(new Set(info.table.rows.map(r=>r[0])).size,5);
  for(const sub of info.subitems){assert.equal(info.table.rows.flat().join('\n').split(sub.text+' ——').length-1,1);assert.ok(e.passage.toLowerCase().includes(sub.answer.toLowerCase()));}
  assert.ok(summary.answer.split(/\s+/).length>=70);assert.ok(summary.answer.split(/\s+/).length<=90);
  assert.equal(approvedEnglishItem(record('PENDING',d),10),null);
  for(const filter of [{examYear:2024},{school:'Invented School'}])assert.equal(assembleEnglishItems([d],10,()=>0,['information','summary'],filter).draft,null);
  const combined=assembleEnglishItems([d],10,()=>0,['information','summary']).draft;assert.ok(combined);assert.deepEqual(combined.output,d.output);
 }
 const stock=require('../lib/english/prepared-items.ts').preparedEnglishItems(10),unseen=stock.filter(i=>i.group==='unseen');assert.equal(unseen.length,50);assert.equal(new Set(unseen.map(i=>i.draft.output.passages[0].text)).size,50);
});

test('Ten authored rearranging groups preserve all eight sentences and complete the forty-group practice minimum',()=>{
 const raw=require('../lib/english/data/ssc-authored-rearranging-review.json'),items=require('../lib/english/prepared-ssc-authored-rearranging.ts').preparedSSCAuthoredRearrangingItems();
 const {assembleEnglishItems,approvedEnglishItem}=require('../lib/english/item-bank.ts');assert.equal(items.length,10);assert.equal(raw.sourceFile,undefined);assert.equal(raw.sourceSha256,undefined);
 for(let j=0;j<10;j++){
  const e=raw.items[j],d=items[j].draft,t=d.output.tasks[0];assert.equal(e.questionOrigin,'assistant-authored-practice');assert.equal(e.fictional,true);assert.equal(e.coherentNarrative.length,8);assert.equal(t.subitems.length,8);assert.match(t.instruction,/Authored fictional practice/);assert.equal(t.boardSource,undefined);assert.equal(t.schoolSource,undefined);assert.equal(d.output.passages.length,0);
  assert.deepEqual(t.subitems.map(s=>Number(s.answer)).sort(),[1,2,3,4,5,6,7,8]);assert.deepEqual([...e.order].sort(),[...'abcdefgh']);
  assert.deepEqual([...t.subitems].sort((a,b)=>Number(a.answer)-Number(b.answer)).map(s=>s.text),e.coherentNarrative);
  assert.equal(t.subitems.map((s,k)=>({rank:Number(s.answer),label:String.fromCharCode(97+k)})).sort((a,b)=>a.rank-b.rank).map(s=>s.label).join(''),e.order);assert.equal(t.answer,e.order.split('').join(' → '));
  assert.equal(approvedEnglishItem(record('PENDING',d),10),null);for(const filter of [{examYear:2024},{school:'Invented School'}])assert.equal(assembleEnglishItems([d],10,()=>0,['rearranging'],filter).draft,null);
  assert.deepEqual(assembleEnglishItems([d],10,()=>0,['rearranging']).draft.output,d.output);
 }
 const stock=require('../lib/english/prepared-items.ts').preparedEnglishItems(10);assert.equal(stock.filter(i=>i.group==='rearranging').length,40);assert.equal(new Set(stock.map(i=>i.key)).size,stock.length);
});

test('School-name selection isolates complete atomic groups, preserves true headers and never falls back',async()=>{
 const {assembleEnglishItems}=require('../lib/english/item-bank.ts'),{englishBoardFilterSchema}=require('../lib/english/board-source.ts');
 const stock=require('../lib/english/prepared-items.ts').preparedEnglishItems(10).map(i=>i.draft);
 const school=stock.find(d=>d.output.tasks[0].schoolSource&&d.output.tasks[0].id==='matching').output.tasks[0].schoolSource.school;
 const selected=assembleEnglishItems(stock,10,()=>0,['matching'],{school}).draft;assert.ok(selected);assert.ok(selected.output.tasks.every(t=>t.schoolSource.school===school&&!t.boardSource));
 assert.equal(assembleEnglishItems(stock,10,()=>0,['matching'],{school:'No such approved school'}).draft,null);
 assert.equal(assembleEnglishItems(stock,10,()=>0,undefined,{school}).draft,null);
 for(const filter of [{school:''},{school:'   '},{school:42},{school:'x'.repeat(201)},{school,examYear:2025},{school,extra:true}])assert.equal(englishBoardFilterSchema.safeParse(filter).success,false);
 const seen=require('../lib/english/prepared-ssc-school-seen-pairs.ts').preparedSSCSchoolSeenPairItems()[0].draft;
 const mixed=structuredClone(seen);mixed.output.tasks[1].schoolSource.school='Another school';
 assert.equal(assembleEnglishItems([mixed],10,()=>0,['mcq','comprehension'],{school:seen.output.tasks[0].schoolSource.school}).draft,null);
 for(const filter of [{school:''},{school:12},{school,examYear:2025}]){const h=harness();assert.equal((await h.run(10,['matching'],filter)).ok,false);assert.equal(h.reads(),0);assert.equal(h.writes.length,0);}
 const invalidGrade=harness();assert.equal((await invalidGrade.run(6,['matching'],{school})).ok,false);assert.equal(invalidGrade.reads(),0);
 const approved=harness([{key:'english-item:v1:school',value:record('APPROVED',selected)}]);assert.equal((await approved.run(10,['matching'],{school})).ok,true);assert.equal(approved.writes.length,1);assert.equal(JSON.parse(approved.writes[0].value).output.tasks[0].schoolSource.school,school);
 const pending=harness([{key:'english-item:v1:pending',value:record('PENDING',selected)}]);const noStock=await pending.run(10,['matching'],{school});assert.equal(noStock.ok,false);assert.ok(noStock.error.includes(school));assert.equal(pending.writes.length,0);
});

test('School dropdown options come only from approved grade-matched homogeneous reusable groups',async()=>{
 const school=require('../lib/english/prepared-ssc-school-seen-pairs.ts').preparedSSCSchoolSeenPairItems()[0].draft;
 const mixed=structuredClone(school);mixed.output.tasks[1].schoolSource.school='Mixed school';
 const board=require('../lib/english/prepared-items.ts').preparedEnglishItems(10)[0].draft;
 const authored=require('../lib/english/prepared-ssc-authored-unseen.ts').preparedSSCAuthoredUnseenItems()[0].draft;
 function options(user,rows){let reads=0;const action=load('app/actions/english-bank-model.ts',{'@/auth':{auth:async()=>({user})},'@/lib/db':{db:{setting:{findMany:async()=>{reads++;return rows;},create:async()=>{throw Error('options must never write');}}}}});return {list:action.listEnglishBankSchools,reads:()=>reads};}
 for(const user of [null,{id:'s',role:'STUDENT'}]){const h=options(user,[]);assert.deepEqual((await h.list(10)).schools,[]);assert.equal(h.reads(),0);}
 const invalid=options({id:'t',role:'TEACHER'},[]);assert.deepEqual((await invalid.list(6)).schools,[]);assert.equal(invalid.reads(),0);
 const only=options({id:'t',role:'TEACHER'},[{key:'a',value:record('PENDING',school)},{key:'b',value:record('APPROVED',board)},{key:'c',value:record('APPROVED',authored)},{key:'d',value:record('APPROVED',mixed)}]);assert.deepEqual((await only.list(10)).schools,[]);
 const yes=options({id:'t',role:'TEACHER'},[{key:'s',value:record('APPROVED',school)},{key:'dup',value:record('APPROVED',school)}]);assert.deepEqual(await yes.list(10),{schools:[school.output.tasks[0].schoolSource.school],error:''});assert.deepEqual((await yes.list(9)).schools,[]);
});

test('Source-filter UI hides year search, retries failures and ignores stale school requests',async()=>{
 const React=require('react');const BoardYear=()=>null;const pending=[];let state=[],cursor=0,effectDeps,cleanup;
 const hooks={useState(initial){const index=cursor++;if(!(index in state))state[index]=initial;return[state[index],value=>{state[index]=typeof value==='function'?value(state[index]):value;}];},useEffect(fn,deps){if(!effectDeps||deps.some((d,i)=>d!==effectDeps[i])){cleanup?.();effectDeps=deps;cleanup=fn();}}};
 const m=new Module(path.resolve('components/english-source-filter.tsx'),module);m.paths=module.paths;m.require=id=>id==='react'?hooks:id==='./english-board-year'?{__esModule:true,default:BoardYear}:id==='@/app/actions/english-bank-model'?{listEnglishBankSchools:grade=>new Promise((resolve,reject)=>pending.push({grade,resolve,reject}))}:require(id);
 m._compile(ts.transpileModule(fs.readFileSync('components/english-source-filter.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,'components/english-source-filter.tsx');
 const Filter=m.exports.default,changes=[];let props={grade:10,school:'',onSchoolChange:v=>changes.push(['school',v])};
 const render=()=>{cursor=0;return Filter(props);};
 function find(node,predicate){if(!React.isValidElement(node))return null;if(predicate(node))return node;for(const child of React.Children.toArray(node.props.children)){const got=find(child,predicate);if(got)return got;}return null;}
 let tree=render();assert.equal(pending[0].grade,10);assert.equal(find(tree,n=>n.type==='select').props.disabled,true);
 assert.equal(find(tree,n=>n.type===BoardYear),null);
 const select=find(tree,n=>n.type==='select');select.props.onChange({target:{value:'School A'}});assert.deepEqual(changes.splice(0),[['school','School A']]);
 // A stale grade10 response must not replace the current grade9 list.
 props={...props,grade:9};tree=render();assert.equal(pending[1].grade,9);pending[0].resolve({schools:['Wrong grade'],error:''});pending[1].resolve({schools:['Current school'],error:''});await new Promise(resolve=>setImmediate(resolve));tree=render();
 const html=require('react-dom/server').renderToStaticMarkup(tree);assert.match(html,/Current school/);assert.doesNotMatch(html,/Wrong grade/);assert.equal(find(tree,n=>n.type==='select').props.disabled,false);
 // A rejected refresh exposes an error and a retry rather than fabricated options.
 props={...props,grade:10};tree=render();pending[2].reject(Error('network'));await new Promise(resolve=>setImmediate(resolve));tree=render();assert.ok(find(tree,n=>n.props.role==='alert'));const retry=find(tree,n=>n.type==='button');assert.equal(retry.props.type,'button');retry.props.onClick();tree=render();assert.equal(pending.length,4);pending[3].resolve({schools:[],error:''});await new Promise(resolve=>setImmediate(resolve));tree=render();assert.ok(find(tree,n=>n.props.role==='status'));assert.equal(find(tree,n=>n.props.role==='alert'),null);
 for(const file of ['components/english-auto-model.tsx','components/english-setup.tsx']){const text=fs.readFileSync(file,'utf8');assert.doesNotMatch(text,/EnglishSourceFilter|examYear|setExamYear|onYearChange/);}
 cleanup?.();
});

test('New fictional reading and narrative practice keep disclosure, all answers and source-free status through print flow',()=>{
 const old=require.extensions['.tsx'];require.extensions['.tsx']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
 try{
  const React=require('react'),render=require('react-dom/server').renderToStaticMarkup,Group=require('../components/paper-builder/english-group.tsx').default;
  const items=[...require('../lib/english/prepared-ssc-authored-unseen.ts').preparedSSCAuthoredUnseenItems(),...require('../lib/english/prepared-ssc-authored-rearranging.ts').preparedSSCAuthoredRearrangingItems()];
  for(const item of items){
   const p=require('../lib/english/legacy-builder.ts').englishLegacyPaper(item.draft),fragments=p.items.flatMap(require('../lib/english/flow-blocks.ts').englishFlowBlocks);
   assert.equal(p.settings.show.boardSource,false);const html=fragments.map(q=>render(React.createElement(Group,{q,answers:true,s:p.settings}))).join('');
   assert.match(html,/Authored (?:fictional )?practice/);assert.doesNotMatch(html,/Board 202[02345]|মূল প্রশ্নে/);
   const tasks=fragments.flatMap(q=>q.englishGroup.tasks);assert.equal(tasks.reduce((n,t)=>n+t.subitems.length,0),item.draft.output.tasks.reduce((n,t)=>n+t.subitems.length,0));assert.ok(tasks.every(t=>!t.boardSource&&!t.schoolSource));
  }
 }finally{if(old)require.extensions['.tsx']=old;else delete require.extensions['.tsx'];}
});

test('User-approved same-text variants retain eight source excerpts and disclose authored scope',()=>{
 const batch=require('../lib/english/data/ssc-seen-variants-review.json');
 const base=require('../lib/english/data/ssc-textbook-seen-review.json');
 assert.equal(batch.items.length,24);assert.equal(new Set(batch.items.map(x=>x.passage)).size,8);
 for(const entry of batch.items){
  const source=base.items.find(x=>x.passage===entry.passage);assert.ok(source);
  assert.deepEqual(entry.pdfPages,source.pdfPages);assert.deepEqual(entry.printedPages,source.printedPages);
  assert.equal(entry.tasks[0].subitems.length,7);assert.equal(entry.tasks[1].subitems.length,5);
  for(const q of entry.tasks[0].subitems){assert.equal(new Set(q.options).size,4);assert.ok(q.options.includes(q.answer));}
 }
 const items=require('../lib/english/prepared-ssc-seen-variants.ts').preparedSSCSeenVariantItems();
 assert.equal(items.length,24);
 for(const item of items){assert.match(item.draft.selection.sources['seen-1'].reference,/SAME-TEXT.*NOT a new reading/);}
});
test('Literary variants explicitly retain four new and four reused foundations, not new works',()=>{
 const batch=require('../lib/english/data/ssc-literature-variants-review.json');
 const base=require('../lib/english/data/ssc-textbook-literature-review.json');
 assert.equal(batch.items.length,64);assert.equal(batch.items.filter(x=>x.id==='poems').length,32);
 let newlyWorded=0,reused=0;
 for(const entry of batch.items){
  const source=base.items.find(x=>x.work===entry.work);assert.ok(source);
  assert.deepEqual(entry.pdfPages,source.pdfPages);assert.equal(entry.questions.length,8);
  assert.equal(entry.newQuestions.length,4);assert.equal(entry.newQuestionCount,4);assert.equal(entry.reusedFoundationCount,4);
  for(const i of entry.reusedFoundationIndices)assert.ok(entry.questions.some(q=>q.text===source.questions[i].text&&q.answer===source.questions[i].answer));
  newlyWorded+=entry.newQuestionCount;reused+=entry.reusedFoundationCount;
 }
 assert.equal(newlyWorded,256);assert.equal(reused,256);
 const items=require('../lib/english/prepared-ssc-literature-variants.ts').preparedSSCLiteratureVariantItems();
 for(const item of items)assert.match(item.draft.output.tasks[0].instruction,/four new questions and four reused foundation questions; not a new work/);
});
test('SSC auto second paper assembles a full 100-mark owned model from approved stock with non-default writing topics, without AI',async()=>{
 const {preparedEnglishItems}=require('../lib/english/prepared-items.ts');
 for(const grade of [9,10]){
  const rows=preparedEnglishItems(grade,2).map(p=>({key:p.key,value:JSON.stringify({status:'APPROVED',draft:p.draft,review:p.review})})).sort((a,b)=>a.key.localeCompare(b.key));
  const saves=[];let providerCalls=0;
  const auth={auth:async()=>({user:{id:'teacher-auto',role:'TEACHER'}})};
  const bankAction=load('app/actions/english-bank-model.ts',{'@/auth':auth,'@/lib/db':{db:{setting:{
   findMany:async({where})=>rows.filter(r=>r.key.startsWith(where.key.startsWith)&&(!where.key.gt||r.key>where.key.gt)).slice(0,100),
   create:async({data})=>{saves.push(data);},
  }}}});
  const auto=load('app/actions/english-auto-model.ts',{'@/auth':auth,'./english-bank-model':bankAction,'./english-model-sources':{loadEnglishModelSources:async()=>{throw Error('No source lookup needed');}},'./english-paper':{generateEnglishPaper:async()=>{providerCalls++;throw Error('Must not invoke AI');}}});
  const result=await auto.prepareEnglishFullModel({grade,paper:2});assert.equal(result.ok,true);assert.equal(providerCalls,0);assert.equal(saves.length,1);assert.match(result.key,/^englishpaper:teacher-auto:/);
  const draft=JSON.parse(saves[0].value),validated=require('../lib/english/generation.ts').validateEnglishOutput(draft.selection,draft.output);
  assert.equal(validated.total,100);assert.equal(validated.tasks.length,12);assert.equal(draft.selection.grade,grade);assert.equal(draft.selection.paper,2);
  for(const task of draft.output.tasks.filter(t=>['paragraph','letter-email','composition'].includes(t.id)))assert.ok(task.instruction.includes(draft.selection.writing[task.id].topic));
  assert.deepEqual(validated.tasks.map(t=>t.marks),[10,5,10,10,5,5,5,5,5,10,10,20]);
 }
});
test('SSC admin category is SSC for both grades and old Class 9/10 URLs remain compatible without changing bank records',()=>{
 const scope=require('../lib/english/admin-scope.ts');
 for(const alias of ['SSC','Class 9','Class 10','Class 9-10','9','10','9-10']){assert.equal(scope.englishCategoryLabel(alias),'SSC');assert.deepEqual(scope.englishCategoryGrades(alias),[9,10]);}
 for(const grade of [9,10]){const u=new URL(scope.englishAdminHref(grade,false,2),'https://example.invalid');assert.equal(u.searchParams.get('category'),'SSC');assert.equal(u.searchParams.get('grade'),String(grade));assert.equal(u.searchParams.get('status'),'pending');}
 const page=fs.readFileSync('app/admin/questions/page.tsx','utf8');assert.match(page,/englishCategoryLabel\(typeof params.category/);assert.match(page,/category === "SSC"/);
 const library=fs.readFileSync('app/admin/questions/import/prepared-library.tsx','utf8');assert.match(library,/englishCategoryLabel\(initialCategory/);assert.match(library,/value=\{c.category\}>\{englishCategoryLabel\(c.category\)\}/);
});
test('incomplete auto model carries source/writing signatures so the gap engine requests only absent stock',async()=>{
 const items=require('../lib/english/item-bank.ts'),{fullModelWriting}=require('../lib/english/builder-mode.ts'),{findEnglishBankParts}=require('../lib/english/bank.ts');
 const groups=items.englishItemGroups(prepared.draft),omit=groups.find(g=>!Object.keys(g.draft.selection.sources).length&&Object.keys(g.draft.selection.writing).length);assert.ok(omit);
 const stock=groups.filter(g=>g!==omit),assembly=items.assembleEnglishItems(stock.map(g=>g.draft),6,()=>0);assert.equal(assembly.draft,null);assert.ok(assembly.reuse);assert.deepEqual(assembly.missing,omit.draft.selection.itemIds);
 const request={grade:6,paper:1,mode:'full',itemIds:[],sources:assembly.reuse.sources,writing:{...fullModelWriting(6,1),...assembly.reuse.writing},includeAnswers:true};
 const parts=await findEnglishBankParts(request,async(_after,prefix)=>prefix==='english-item:v1:'?stock.map(g=>({key:g.key,value:record('APPROVED',g.draft)})):[]);
 assert.deepEqual(parts.missingIds,assembly.missing);assert.equal(parts.output.tasks.length,prepared.draft.output.tasks.length-assembly.missing.length);assert.deepEqual(new Set(parts.output.tasks.map(t=>t.id)),new Set(stock.flatMap(g=>g.draft.output.tasks.map(t=>t.id))));
});
