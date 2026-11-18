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
