const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module');
function load(file,mocks={}){const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return m.exports;}
const data=load('lib/nctb-data.ts'),lib=load('lib/mcq-import.ts',{'@/lib/nctb-data':data});
const sample=()=>({...lib.class6Topics.find(t=>t.subject==='গণিত'),book:'Synthetic test book',edition:'test only',sourceUrl:'https://example.invalid/book',lang:'Bangla',items:[{text:'Synthetic 2 + 2?',options:{A:'4',B:'3',C:'5',D:'6'},correct:'A',explanation:'Synthetic arithmetic fixture, not source verified',page:'1',difficulty:'EASY'}]});
test('MCQ import enforces scope, strict fields, size, distinct choices and no duplicate stems',()=>{
 const b=sample();assert.equal(lib.parseMCQBatch(JSON.stringify(b)).items.length,1);
 for(const mutate of [b=>b.subject='Wrong',b=>b.items[0].correct='E',b=>b.items[0].options.B='4',b=>b.items.push({...b.items[0]}),b=>b.items[0].page='',b=>b.approved=true,b=>b.sourceUrl='javascript:alert(1)',b=>b.items[0].explanation='',b=>b.items=Array(101).fill(b.items[0])]){const b=sample();mutate(b);assert.throws(()=>lib.parseMCQBatch(JSON.stringify(b)));}
 assert.throws(()=>lib.parseMCQBatch('x'.repeat(750001)));
 assert.equal(lib.draftId('s','t',' A  B '),lib.draftId('s','t','a b'));
});
function harness(role='ADMIN'){
 const questions=[],settings=new Map();let txCalls=0,fail=false;
 const tx={question:{findMany:async()=>questions,create:async({data})=>{questions.push(data);return data;}},setting:{findUnique:async({where})=>settings.get(where.key),create:async({data})=>settings.set(data.key,data)}};
 const actions=load('app/admin/questions/import/actions.ts',{'@/lib/guard':{staff:async()=>{if(role!=='ADMIN')throw Error('denied');return {id:'owner'};}},'@/lib/db':{db:{$transaction:async(fn,opts)=>{txCalls++;assert.equal(opts.isolationLevel,'Serializable');if(fail){fail=false;throw Object.assign(Error(),{code:'P2034'});}return fn(tx);}}},'@/lib/mcq-import':lib,'next/cache':{revalidatePath:()=>{}}});
 const form=()=>{const f=new FormData();f.set('batch',JSON.stringify(sample()));f.set('reviewed','yes');f.set('digest',lib.batchDigest(lib.parseMCQBatch(JSON.stringify(sample()))));return f;};
 return {actions,questions,settings,form,calls:()=>txCalls,retry:()=>fail=true};
}
test('anonymous Teacher and Student cannot preview or mutate MCQ batches',async()=>{
 for(const role of ['ANONYMOUS','TEACHER','STUDENT']){const h=harness(role);assert.ok((await h.actions.inspectBatch({},h.form())).error);assert.ok((await h.actions.saveBatch({},h.form())).error);assert.equal(h.calls(),0);}
});
test('import preview is read-only, commit is pending-only, repeat is idempotent and audit retains provenance',async()=>{
 const h=harness();const p=await h.actions.inspectBatch({},h.form());assert.equal(p.preview[0].options.A,'4');assert.equal(h.calls(),0);
 assert.ok((await h.actions.saveBatch({},h.form())).message);assert.equal(h.questions.length,1);assert.equal(h.questions[0].approved,false);assert.equal(h.questions[0].category,'Class 6');
 assert.ok((await h.actions.saveBatch({},h.form())).message);assert.equal(h.questions.length,1);
 const audit=JSON.parse([...h.settings.values()][0].value);assert.equal(audit.actorId,'owner');assert.equal(audit.references[0].page,'1');assert.equal(audit.ids[0],h.questions[0].id);
});
test('review and unchanged preview required; legacy duplicate skipped; serializable conflict retried',async()=>{
 const h=harness();const f=h.form();f.delete('reviewed');assert.ok((await h.actions.saveBatch({},f)).error);assert.equal(h.calls(),0);
 const changed=h.form();changed.set('digest','bad');assert.ok((await h.actions.saveBatch({},changed)).error);assert.equal(h.calls(),0);
 h.questions.push({text:'Synthetic 2 + 2?'});h.retry();assert.ok((await h.actions.saveBatch({},h.form())).message);assert.equal(h.calls(),2);assert.equal(h.questions.length,1);
});
