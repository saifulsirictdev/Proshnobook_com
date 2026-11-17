const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module');
function load(file,mocks={}){const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return m.exports;}
const json=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const data=load('lib/nctb-data.ts'),mcq=load('lib/mcq-import.ts',{'@/lib/nctb-data':data}),written=load('lib/written-question-import.ts',{'./mcq-import':mcq});
const upload=load('lib/question-json-import.ts',{'./nctb-data':data,'./mcq-import':mcq});
const remainingMocks={'./question-json-import':upload};
for(let n=3;n<=8;n++){for(const file of ['questions','validation'])remainingMocks[`@/content/question-bank/class-6/chapter-${n}/${file}.json`]=json(`content/question-bank/class-6/chapter-${n}/${file}.json`);}
const remaining=load('lib/class6-remaining-batches.ts',remainingMocks);
const scienceMocks={'./question-json-import':upload};
for(let n=1;n<=14;n++)for(const file of ['questions','validation'])scienceMocks[`@/content/question-bank/class-6/science/chapter-${n}/${file}.json`]=json(`content/question-bank/class-6/science/chapter-${n}/${file}.json`);
const science=load('lib/class6-science-batches.ts',scienceMocks);
const lib=load('lib/prepared-question-batches.ts',{'./class6-science-batches':science,'./class6-remaining-batches':remaining,'./question-json-import':upload,'@/content/question-bank/class-6/chapter-2/questions.json':json('content/question-bank/class-6/chapter-2/questions.json'),'@/content/question-bank/class-6/chapter-2/validation.json':json('content/question-bank/class-6/chapter-2/validation.json'),'./nctb-data':data,'./mcq-import':mcq,'./written-question-import':written,'@/content/question-bank/class-6/math-ch1-draft.json':json('content/question-bank/class-6/math-ch1-draft.json'),'@/deliverables/class6-math-ch1/cq-sq-draft.json':json('deliverables/class6-math-ch1/cq-sq-draft.json'),'@/deliverables/class6-math-ch1/chapter-alignment-review.json':json('deliverables/class6-math-ch1/chapter-alignment-review.json')});
test('catalog reuses all existing classes and batch summaries do not expose answers',()=>{
 assert.deepEqual(lib.importCatalog.map(c=>c.category),data.NCTB_CLASSES.map(c=>c.class));
 const summaries=lib.preparedSummaries();assert.equal(summaries.length,23);
 assert.deepEqual(summaries[0].counts,{MCQ:100,CQ:0,SQ:0});assert.deepEqual(summaries[1].counts,{MCQ:0,CQ:30,SQ:30});
 assert.equal(summaries[0].records,undefined);assert.throws(()=>lib.getPreparedBatch('unregistered'));
 for(const s of summaries){const {batch,digest}=lib.getPreparedBatch(s.id);assert.equal(digest.length,64);assert.equal(new Set(batch.records.map(q=>lib.preparedQuestionId(batch,q))).size,batch.records.length);}
});
function harness(role='ADMIN'){
 const questions=[],settings=new Map();let calls=0,fail=false;
 const tx={question:{findMany:async()=>questions,create:async({data})=>questions.push(data)},setting:{findUnique:async({where})=>settings.get(where.key),create:async({data})=>settings.set(data.key,data)}};
 const actions=load('app/admin/questions/import/prepared-actions.ts',{'@prisma/client':{},'@/lib/guard':{staff:async()=>{if(role!=='ADMIN')throw Error('denied');return{id:'owner'};}},'@/lib/db':{db:{$transaction:async(fn,opts)=>{calls++;assert.equal(opts.isolationLevel,'Serializable');if(fail){fail=false;throw Object.assign(Error(),{code:'P2034'});}return fn(tx);}}},'@/lib/mcq-import':mcq,'@/lib/prepared-question-batches':lib,'next/cache':{revalidatePath:()=>{}}});
 const form=(id=lib.preparedSummaries()[0].id)=>{const f=new FormData();f.set('id',id);f.set('digest',lib.getPreparedBatch(id).digest);f.set('reviewed','yes');return f;};
 return{actions,questions,settings,form,calls:()=>calls,retry:()=>fail=true};
}
test('selection is not authority; unknown batches, missing acknowledgement and non Admin are denied',async()=>{
 for(const role of ['ANONYMOUS','STUDENT','TEACHER']){const h=harness(role);assert.ok((await h.actions.previewPrepared({},h.form())).error);assert.ok((await h.actions.savePrepared({},h.form())).error);assert.equal(h.calls(),0);}
 const h=harness();for(const field of ['id','digest','reviewed']){const f=h.form();f.delete(field);assert.ok((await h.actions.savePrepared({},f)).error);}assert.equal(h.calls(),0);
});
test('preview read-only, both batch types save Pending, retry/dedup/audit maintained',async()=>{
 const h=harness();assert.equal((await h.actions.previewPrepared({},h.form())).preview.length,100);assert.equal(h.calls(),0);
 h.retry();for(const b of lib.preparedSummaries()){const f=h.form(b.id);f.set('category','INJECTED');assert.ok((await h.actions.savePrepared({},f)).message);await h.actions.savePrepared({},f);}
 assert.equal(h.questions.length,1626);assert.equal(h.settings.size,23);
 for(const q of h.questions){assert.equal(q.category,'Class 6');assert.equal(q.approved,false);}
 const audit=JSON.parse([...h.settings.values()][0].value);assert.equal(audit.actorId,'owner');assert.ok(audit.provenance);assert.equal(audit.inserted,100);
 const legacy=harness();legacy.questions.push({text:lib.getPreparedBatch(lib.preparedSummaries()[0].id).batch.records[0].text});await legacy.actions.savePrepared({},legacy.form());assert.equal(legacy.questions.length,100);
});
const selection=load('lib/prepared-batch-selection.ts');
test('Class 6 science selection shows all 14 chapters and chapter narrowing preserves totals',()=>{
 const batches=lib.preparedSummaries();
 const all=selection.selectPreparedBatches(batches,{category:'Class 6',subject:'বিজ্ঞান',topic:''});
 assert.equal(all.length,14);
 assert.deepEqual(all.reduce((n,b)=>({MCQ:n.MCQ+b.counts.MCQ,CQ:n.CQ+b.counts.CQ,SQ:n.SQ+b.counts.SQ}),{MCQ:0,CQ:0,SQ:0}),{MCQ:230,CQ:47,SQ:69});
 assert.ok(all.every(b=>b.subject==='বিজ্ঞান'));
 assert.equal(selection.selectPreparedBatches(batches,{category:'Class 6',subject:'বিজ্ঞান',topic:all[0].topic}).length,1);
 assert.equal(selection.selectPreparedBatches(batches,{category:'Class 7',subject:'বিজ্ঞান',topic:''}).length,0);
 assert.equal(selection.selectPreparedBatches(batches,{category:'Class 6',subject:'',topic:''}).length,0);
 const href=selection.pendingReviewHref('Class 6','বিজ্ঞান');const url=new URL(href,'https://proshnobook.com');
 assert.equal(url.pathname,'/admin/questions');assert.equal(url.searchParams.get('category'),'Class 6');assert.equal(url.searchParams.get('subject'),'বিজ্ঞান');assert.equal(url.searchParams.get('status'),'pending');
});
test('science preview is read-only and Admin saves only Pending for separate approval',async()=>{
 const h=harness();const batches=selection.selectPreparedBatches(lib.preparedSummaries(),{category:'Class 6',subject:'বিজ্ঞান',topic:''});
 const preview=await h.actions.previewPrepared({},h.form(batches[0].id));assert.equal(preview.preview.length,160);assert.equal(h.calls(),0);
 for(const b of batches)assert.ok((await h.actions.savePrepared({},h.form(b.id))).message);
 assert.equal(h.questions.length,346);assert.equal(h.settings.size,14);
 assert.ok(h.questions.every(q=>q.approved===false&&q.category==='Class 6'&&q.subject==='বিজ্ঞান'));
});
