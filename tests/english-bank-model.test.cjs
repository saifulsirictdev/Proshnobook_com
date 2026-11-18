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
 const h=harness([{key:prepared.key,value:record()}]);const r=await h.run(6);assert.equal(r.ok,true);assert.match(r.key,/^englishpaper:teacher:/);assert.equal(h.writes.length,1);assert.equal(h.writes[0].key,r.key);const draft=JSON.parse(h.writes[0].value);assert.deepEqual(draft.output,prepared.draft.output);assert.notEqual(draft,prepared.draft);
});
test('Every supported grade reports missing full stock instead of generating; unauthorized calls read nothing',async()=>{
 for(let grade=6;grade<=12;grade++){const h=harness([{key:prepared.key,value:record('PENDING')}]);const r=await h.run(grade);assert.equal(r.ok,false);assert.match(r.error,/AI চালানো হয়নি/);assert.equal(h.writes.length,0);}
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
