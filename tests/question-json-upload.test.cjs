const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module');
function load(file,mocks={}){const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return m.exports;}
const data=load('lib/nctb-data.ts'),mcq=load('lib/mcq-import.ts',{'@/lib/nctb-data':data}),lib=load('lib/question-json-import.ts',{'./nctb-data':data,'./mcq-import':mcq,'./question-provenance':load('lib/question-provenance.ts')});
const scope={category:'Class 6',subject:'গণিত',group:'',topic:'১. স্বাভাবিক সংখ্যা ও ভগ্নাংশ'};
const sample=()=>({category:scope.category,subject:scope.subject,topic:scope.topic,book:'Test book',edition:'test',sourceUrl:'https://example.invalid/book',lang:'Bangla',items:[{type:'MCQ',text:'2+2?',options:{A:'4',B:'3',C:'5',D:'6'},correct:'A',explanation:'2+2=4',page:'1',difficulty:'EASY'},{type:'SQ',text:'Define prime',explanation:'Two positive factors',page:'1',difficulty:'EASY'},{type:'CQ',text:'A stimulus',explanation:'Solution overview',page:'1',difficulty:'MEDIUM',parts:['ক','খ','গ'].map((label,i)=>({label,question:'Part '+i,solution:'Answer '+i,marks:[2,4,4][i]}))}]});
test('strict mixed JSON preserves builder shape and validates selected catalog hierarchy',()=>{
 const r=lib.parseQuestionUpload(JSON.stringify(sample()),scope);assert.equal(r.records.length,3);assert.equal(r.records[2].correct,'');assert.deepEqual(r.records[2].options.marks,{k:2,kh:4,g:4});
 for(const mutate of [b=>b.category='Class 7',b=>b.approved=true,b=>b.items[0].options.B='4',b=>b.items[0].correct='Z',b=>b.items.push(b.items[0]),b=>b.items[2].parts[0].marks=1,b=>b.items[1].explanation='',b=>b.sourceUrl='http://example.com',b=>b.items=Array(201).fill(b.items[0])]){const b=sample();mutate(b);assert.throws(()=>lib.parseQuestionUpload(JSON.stringify(b),scope));}
 assert.throws(()=>lib.parseQuestionUpload('x'.repeat(750001),scope));
 assert.throws(()=>lib.parseQuestionUpload(JSON.stringify(sample()),{...scope,group:'wrong'}));
 for(const c of data.NCTB_CLASSES){for(const s of c.subjects){const g=s.subCategories?.[0];const topic=g?.topics[0]??s.chapters?.[0];if(!topic)continue;const b=sample();b.category=c.class;b.subject=s.name;b.topic=topic;b.items=b.items.slice(0,2);assert.equal(lib.parseQuestionUpload(JSON.stringify(b),{category:c.class,subject:s.name,group:g?.category??'',topic}).records.length,2);}}
});
function harness(role='ADMIN'){
 const rows=[],settings=new Map();let calls=0,fail=false;
 const tx={question:{findMany:async()=>rows,create:async({data})=>rows.push(data)},setting:{findUnique:async({where})=>settings.get(where.key),create:async({data})=>settings.set(data.key,data)}};
 const actions=load('app/admin/questions/import/upload-actions.ts',{'@prisma/client':{},'@/lib/guard':{staff:async()=>{if(role!=='ADMIN')throw Error('denied');return{id:'owner'};}},'@/lib/db':{db:{$transaction:async(fn,opts)=>{calls++;assert.equal(opts.isolationLevel,'Serializable');if(fail){fail=false;throw Object.assign(Error(),{code:'P2034'});}return fn(tx);}}},'@/lib/question-json-import':lib,'@/lib/mcq-import':mcq,'next/cache':{revalidatePath:()=>{}}});
 const form=()=>{const f=new FormData();for(const [k,v] of Object.entries(scope))f.set(k,v);const raw=JSON.stringify(sample());f.set('raw',raw);f.set('digest',lib.parseQuestionUpload(raw,scope).digest);f.set('reviewed','yes');return f;};
 return{actions,rows,settings,form,calls:()=>calls,retry:()=>fail=true};
}
test('ADMIN only; selected scope and file edits invalidate preview; explicit consent required',async()=>{
 for(const role of ['ANONYMOUS','TEACHER','STUDENT']){const h=harness(role);assert.ok((await h.actions.previewUpload({},h.form())).error);assert.ok((await h.actions.saveUpload({},h.form())).error);assert.equal(h.calls(),0);}
 const h=harness();for(const field of ['digest','reviewed','topic']){const f=h.form();f.delete(field);assert.ok((await h.actions.saveUpload({},f)).error);}
 const f=h.form();const b=sample();b.items[0].explanation='Changed';f.set('raw',JSON.stringify(b));assert.ok((await h.actions.saveUpload({},f)).error);assert.equal(h.calls(),0);
});
test('read-only preview, Pending-only save, conflict retry, legacy dedup, idempotent audited receipt',async()=>{
 const h=harness();assert.equal((await h.actions.previewUpload({},h.form())).preview.length,3);assert.equal(h.calls(),0);h.retry();assert.ok((await h.actions.saveUpload({},h.form())).message);assert.equal(h.rows.length,3);
 for(const q of h.rows)assert.equal(q.approved,false);
 await h.actions.saveUpload({},h.form());assert.equal(h.rows.length,3);
 const audit=JSON.parse([...h.settings.values()][0].value);assert.equal(audit.actorId,'owner');assert.equal(audit.references.length,3);assert.deepEqual(audit.selection,scope);
 const old=harness();old.rows.push({text:' 2+2? '});await old.actions.saveUpload({},old.form());assert.equal(old.rows.length,3);
});
