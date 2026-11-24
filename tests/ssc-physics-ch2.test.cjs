const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const Module=require('node:module');
const {createHash}=require('node:crypto');
function load(file,mocks={}){
 const m=new Module(file,module);m.paths=module.paths;
 m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);
 m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
 return m.exports;
}
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const root='content/question-bank/ssc/physics/chapter-2/';
const catalog=load('lib/nctb-data.ts');
const mcq=load('lib/mcq-import.ts',{'@/lib/nctb-data':catalog});
const uploader=load('lib/question-json-import.ts',{'./nctb-data':catalog,'./mcq-import':mcq,'./question-provenance':load('lib/question-provenance.ts')});
const mocks={'./question-json-import':uploader};
for(const f of ['mcq-1','mcq-2','cq','sq'])mocks['@/'+root+f+'.json']=read(root+f+'.json');
const physics=load('lib/ssc-physics-ch2-batches.ts',mocks);

test('all four Physics slices pass the real strict importer and canonical SSC catalog',()=>{
 const batches=physics.sscPhysicsChapter2Batches();
 assert.equal(batches.length,4);
 assert.deepEqual(batches.map(b=>b.records.length),[150,150,150,100]);
 const all=batches.flatMap(b=>b.records);
 assert.equal(all.length,550);
 assert.equal(new Set(all.map(q=>mcq.normalizeStem(q.text))).size,550);
 for(const b of batches){
  assert.equal(b.category,'Class 9');assert.equal(b.subject,'পদার্থবিজ্ঞান');
  assert.equal(b.provenance.teacherCertified,false);
  assert.equal(b.provenance.fullChapterRead,false);
  assert.equal(b.provenance.officialYearVerified,false);
  assert.match(b.limitations,/ভ্যারিয়েন্ট/);
 }
 const counts=all.reduce((n,q)=>(n[q.kind]++,n),{MCQ:0,CQ:0,SQ:0});
 assert.deepEqual(counts,{MCQ:300,CQ:150,SQ:100});
 for(const q of all.filter(q=>q.kind==='CQ')){
  assert.deepEqual(q.options.marks,{k:1,kh:2,g:3,gh:4});
  assert.deepEqual(Object.keys(q.options.subQuestions),['k','kh','g','gh']);
  assert.ok(q.explanation.includes('ঘ)'));
 }
 const keys=all.filter(q=>q.kind==='MCQ').reduce((n,q)=>(n[q.correct]++,n),{A:0,B:0,C:0,D:0});
 assert.deepEqual(keys,{A:75,B:75,C:75,D:75});
});
test('physics files preserve strict selection, option and CQ distribution rejection',()=>{
 const b=read(root+'cq.json');const s={category:b.category,subject:b.subject,topic:b.topic,group:''};
 assert.throws(()=>uploader.parseQuestionUpload(JSON.stringify(b),{...s,subject:'গণিত'}));
 b.items[0].parts[0].marks=2;
 assert.throws(()=>uploader.parseQuestionUpload(JSON.stringify(b),s));
 const m=read(root+'mcq-1.json');m.items[0].options.B=m.items[0].options.A;
 assert.throws(()=>uploader.parseQuestionUpload(JSON.stringify(m),s));
});
test('owner screenshot profile is 75 theory plus 25 practical, not an invented official year or split timing',()=>{
 const p=read('docs/question-bank/ssc-physics/mark-distribution.json');
 assert.equal(p.totalMarks,100);assert.equal(p.theoryMarks,75);assert.equal(p.practicalMarks,25);
 assert.equal(p.totalTheoryMinutes,180);assert.equal(p.officialYear,null);
 assert.equal(p.separateSectionTimingSpecified,false);
 assert.deepEqual(p.sections.map(s=>[s.kind,s.offered,s.answer,s.total]),[['MCQ',25,25,25],['CQ',7,4,40],['SQ',7,5,10]]);
 assert.equal(createHash('sha256').update(fs.readFileSync('docs/question-bank/ssc-physics/'+p.source)).digest('hex'),p.sourceSha256);
});
test('Draft validation does not claim a live import, teacher approval or full chapter reading',()=>{
 const v=read(root+'validation.json');
 for(const k of ['teacherApproved','websiteImported','published','fullChapterRead','officialYearVerified'])assert.equal(v[k],false);
 for(const [name,info] of Object.entries(v.files))assert.equal(createHash('sha256').update(fs.readFileSync(root+name)).digest('hex'),info.sha256);
 assert.equal(v.cqFamilies,30);assert.equal(v.variantsPerCQFamily,5);
 assert.match(fs.readFileSync('lib/prepared-question-batches.ts','utf8'),/\.\.\.sscPhysicsChapter2Batches\(\)/);
 const src=fs.readFileSync('lib/ssc-physics-ch2-batches.ts','utf8');
 assert.doesNotMatch(src,/from ["'].*(?:db|guard|prisma)/);
 // Separately owner-authorized subject policy now enables Physics, not other subjects.
 const {autoModelBlueprint}=load('lib/auto-model.ts',{'./nctb-data':catalog,'./subject-model-policy':load('lib/subject-model-policy.ts',{'./nctb-data':catalog}),'./question-tables':load('lib/question-tables.ts', {"./ssc-biology-assets":load("lib/ssc-biology-assets.ts")})});
 assert.equal(autoModelBlueprint('Class 9','পদার্থবিজ্ঞান','MCQ').id,'ssc-physics-mcq-v1');
});

test('Physics preview is read-only; explicit ADMIN consent saves all 550 only Pending with replay protection (mock DB)',async()=>{
 const batches=physics.sscPhysicsChapter2Batches();
 const registry={
  getPreparedBatch(id){const batch=batches.find(b=>b.id===id);if(!batch)throw Error('unknown');return{batch,digest:createHash('sha256').update(JSON.stringify(batch)).digest('hex')};},
  preparedQuestionId(b,q){return'prepared_'+createHash('sha256').update(JSON.stringify([b.category,b.subject,b.topic,q.kind,mcq.normalizeStem(q.text)])).digest('hex');}
 };
 const questions=[],settings=new Map();let role='ADMIN',calls=0;
 const tx={
  question:{findMany:async()=>questions,create:async({data})=>{questions.push(data);}},
  setting:{findUnique:async({where})=>settings.get(where.key),create:async({data})=>settings.set(data.key,data),update:async({where,data})=>settings.set(where.key,{key:where.key,...data})}
 };
 const actions=load('app/admin/questions/import/prepared-actions.ts',{
  '@prisma/client':{},'@/lib/guard':{staff:async()=>{if(role!=='ADMIN')throw Error('denied');return{id:'owner'};}},
  '@/lib/db':{db:{$transaction:async(fn,opts)=>{assert.equal(opts.isolationLevel,'Serializable');calls++;return fn(tx);}}},
  '@/lib/mcq-import':mcq,'@/lib/prepared-question-batches':registry,'next/cache':{revalidatePath(){}}
 });
 for(const b of batches){
  const f=new FormData();f.set('id',b.id);
  const preview=await actions.previewPrepared({},f);assert.equal(preview.preview.length,b.records.length);assert.equal(calls,0);
  assert.ok((await actions.savePrepared({},f)).error);
 }
 for(const b of batches){
  const f=new FormData();f.set('id',b.id);f.set('digest',registry.getPreparedBatch(b.id).digest);f.set('reviewed','yes');
  role='TEACHER';assert.ok((await actions.savePrepared({},f)).error);role='ADMIN';
  const saved=await actions.savePrepared({},f);assert.equal(saved.counts.inserted,b.records.length);
  const replay=await actions.savePrepared({},f);assert.equal(replay.counts.inserted,0);assert.equal(replay.counts.pending,b.records.length);
 }
 assert.equal(questions.length,550);assert.equal(settings.size,4);
 assert.ok(questions.every(q=>q.approved===false&&q.subject==='পদার্থবিজ্ঞান'));
});
