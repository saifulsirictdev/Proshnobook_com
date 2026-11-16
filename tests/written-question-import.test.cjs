const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module');
function load(file,mocks={}){const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return m.exports;}
const data=load('lib/nctb-data.ts'),mcq=load('lib/mcq-import.ts',{'@/lib/nctb-data':data}),lib=load('lib/written-question-import.ts',{'./mcq-import':mcq});
const prepared=JSON.parse(fs.readFileSync('deliverables/class6-math-ch1/cq-sq-draft.json','utf8'));
test('written format maps 30 complete CQ and 30 SQ to existing builder conventions',()=>{
 const b=lib.writtenRecords(prepared);assert.equal(b.records.length,60);
 assert.deepEqual(b.records[0].options.marks,{k:2,kh:4,g:4});
 assert.deepEqual(Object.keys(b.records[0].options.subQuestions),['k','kh','g']);
 assert.deepEqual(b.records[30].options,{});
 for(const mutate of [b=>b.CQ[0].parts[0].marks=3,b=>b.CQ[0].parts.push(b.CQ[0].parts[0]),b=>b.SQ[0].answer='',b=>b.CQ.push(b.CQ[0]),b=>b.subject='অজানা',b=>b.status='APPROVED']){const c=structuredClone(prepared);mutate(c);assert.throws(()=>lib.writtenRecords(c));}
});
function harness(role='ADMIN'){
 const questions=[],settings=new Map();let calls=0,retry=false;
 const tx={question:{findMany:async()=>questions,create:async({data})=>questions.push(data)},setting:{findUnique:async({where})=>settings.get(where.key),create:async({data})=>settings.set(data.key,data)}};
 const actions=load('app/admin/questions/import/written-actions.ts',{'@/lib/guard':{staff:async()=>{if(role!=='ADMIN')throw Error('denied');return{id:'owner'};}},'@/lib/db':{db:{$transaction:async(fn,opts)=>{calls++;assert.equal(opts.isolationLevel,'Serializable');if(retry){retry=false;throw Object.assign(Error(),{code:'P2034'});}return fn(tx);}}},'@/lib/mcq-import':mcq,'@/lib/written-question-import':lib,'@/deliverables/class6-math-ch1/cq-sq-draft.json':prepared,'@/deliverables/class6-math-ch1/chapter-alignment-review.json':JSON.parse(fs.readFileSync('deliverables/class6-math-ch1/chapter-alignment-review.json','utf8')),'next/cache':{revalidatePath:()=>{}}});
 const form=()=>{const f=new FormData();f.set('reviewed','yes');f.set('digest',lib.writtenRecords(prepared).digest);return f;};
 return{actions,questions,settings,form,calls:()=>calls,retry:()=>retry=true};
}
test('written import denies non Admin and requires unchanged preview acknowledgement',async()=>{
 for(const role of ['ANONYMOUS','TEACHER','STUDENT']){const h=harness(role);assert.ok((await h.actions.previewWritten()).error);assert.ok((await h.actions.saveWritten({},h.form())).error);assert.equal(h.calls(),0);}
 const h=harness();for(const field of ['reviewed','digest']){const f=h.form();f.delete(field);assert.ok((await h.actions.saveWritten({},f)).error);}assert.equal(h.calls(),0);
});
test('preview read only; save pending, provenance audited, repeated batch idempotent; retry conflict',async()=>{
 const h=harness();assert.equal((await h.actions.previewWritten()).preview.length,60);assert.equal(h.calls(),0);
 h.retry();assert.ok((await h.actions.saveWritten({},h.form())).message);assert.equal(h.questions.length,60);
 for(const q of h.questions){assert.equal(q.approved,false);assert.equal(q.correct,'');}
 await h.actions.saveWritten({},h.form());assert.equal(h.questions.length,60);
 const audit=JSON.parse([...h.settings.values()][0].value);assert.equal(audit.actorId,'owner');assert.equal(audit.references.length,60);
});
