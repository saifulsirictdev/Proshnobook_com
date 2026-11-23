const {test}=require('node:test');
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module');
const {createHash}=require('node:crypto');
function load(file,mocks={}){const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText,file);return m.exports;}
const json=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const catalog=load('lib/nctb-data.ts'),mcq=load('lib/mcq-import.ts',{'@/lib/nctb-data':catalog});
const upload=load('lib/question-json-import.ts',{'./nctb-data':catalog,'./mcq-import':mcq,'./question-provenance':load('lib/question-provenance.ts')});
const tables=load('lib/question-tables.ts');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const MathText=load('components/MathText.tsx',{'@/lib/question-tables':tables}).default;
for(const [ch,files,counts,expected,diagrams] of [[5,['mcq','cq','sq'],[200,80,50],{MCQ:200,CQ:80,SQ:50},195],[6,['mcq-1','mcq-2','cq','sq'],[125,125,100,70],{MCQ:250,CQ:100,SQ:70},95]]){
 const root=`content/question-bank/ssc/physics/chapter-${ch}/`,mocks={'./question-json-import':upload};
 for(const f of files)mocks['@/'+root+f+'.json']=json(root+f+'.json');
 const physics=load(`lib/ssc-physics-ch${ch}-batches.ts`,mocks),get=physics[`sscPhysicsChapter${ch}Batches`];
 test(`Physics ${ch}: real strict importer, canonical scope, counts and CQ 1/2/3/4`,()=>{
  const batches=get(),all=batches.flatMap(b=>b.records);
  assert.deepEqual(batches.map(b=>b.records.length),counts);
  assert.deepEqual(all.reduce((c,q)=>(c[q.kind]++,c),{MCQ:0,CQ:0,SQ:0}),expected);
  assert.equal(new Set(all.map(q=>mcq.normalizeStem(q.text))).size,all.length);
  for(const b of batches){assert.equal(b.category,'Class 9');assert.equal(b.subject,'পদার্থবিজ্ঞান');assert.equal(b.provenance.teacherCertified,false);assert.equal(b.provenance.assetsDeployed,false);assert.match(b.limitations,/ভ্যারিয়েন্ট/);}
  for(const q of all.filter(q=>q.kind==='CQ')){assert.deepEqual(q.options.marks,{k:1,kh:2,g:3,gh:4});assert.ok(q.explanation.includes('ঘ)'));}
  const keys=all.filter(q=>q.kind==='MCQ').reduce((c,q)=>(c[q.correct]++,c),{A:0,B:0,C:0,D:0});
  assert.deepEqual(keys,ch===5?{A:50,B:50,C:50,D:50}:{A:63,B:63,C:62,D:62});
 });
 test(`Physics ${ch}: every diagram survives JSON, adapter, MathText and offline review; local assets hashed`,()=>{
  const v=json(root+'validation.json'),byUrl=new Map(v.assets.map(a=>[a.url,a]));let seen=0;
  for(const q of get().flatMap(b=>b.records)){
   const blocks=tables.questionBlocks(q.text),image=blocks.filter(b=>b.kind==='physics-image');
   assert.equal(image.length,q.text.includes('![')?1:0);
   for(const block of image){seen++;const a=byUrl.get(block.src);assert.ok(a);assert.equal(createHash('sha256').update(fs.readFileSync(a.file)).digest('hex'),a.sha256);assert.ok(fs.readFileSync(a.file,'utf8').startsWith('<svg '));}
   if(image.length){const markup=renderToStaticMarkup(React.createElement(MathText,{text:q.text}));assert.match(markup,/<img /);assert.ok(markup.includes(image[0].src));assert.ok(!markup.includes('!['));}
  }
  assert.equal(seen,diagrams);assert.equal(v.assets.length,diagrams);
  const review=fs.readFileSync(`docs/question-bank/ssc-physics/chapter-${ch}-review.html`,'utf8');assert.equal((review.match(/<svg /g)||[]).length,diagrams);assert.ok(!review.includes('!['));
  for(const [name,info] of Object.entries(v.files))assert.equal(createHash('sha256').update(fs.readFileSync(root+name)).digest('hex'),info.sha256);
  for(const k of ['published','websiteImported','teacherApproved','sourcePageVerified','fullChapterRead','assetsDeployed'])assert.equal(v[k],false);
  for(const q of v.items.filter(q=>q.sourceHadFigure===true))assert.equal(q.hasDiagram,true);
 });
 test(`Physics ${ch}: wrong scope, duplicate options and altered CQ marks rejected`,()=>{
  const b=json(root+'cq.json'),s={category:b.category,subject:b.subject,group:'',topic:b.topic};
  assert.throws(()=>upload.parseQuestionUpload(JSON.stringify(b),{...s,topic:'৩য় অধ্যায়: বল'}));
  b.items[0].parts[0].marks=2;assert.throws(()=>upload.parseQuestionUpload(JSON.stringify(b),s));
  const m=json(root+files[0]+'.json');m.items[0].options.B=m.items[0].options.A;assert.throws(()=>upload.parseQuestionUpload(JSON.stringify(m),s));
 });
 test(`Physics ${ch}: preview read-only, explicit ADMIN saves only Pending, replay protected (mock DB)`,async()=>{
  const batches=get(),questions=[],settings=new Map();let role='ADMIN',calls=0;
  const registry={getPreparedBatch(id){const batch=batches.find(b=>b.id===id);if(!batch)throw Error('unknown');return{batch,digest:createHash('sha256').update(JSON.stringify(batch)).digest('hex')};},preparedQuestionId(b,q){return'prepared_'+createHash('sha256').update(JSON.stringify([b.category,b.subject,b.topic,q.kind,mcq.normalizeStem(q.text)])).digest('hex');}};
  const tx={question:{findMany:async()=>questions,create:async({data})=>questions.push(data)},setting:{findUnique:async({where})=>settings.get(where.key),create:async({data})=>settings.set(data.key,data),update:async({where,data})=>settings.set(where.key,{key:where.key,...data})}};
  const actions=load('app/admin/questions/import/prepared-actions.ts',{'@prisma/client':{},'@/lib/guard':{staff:async()=>{if(role!=='ADMIN')throw Error('denied');return{id:'owner'};}},'@/lib/db':{db:{$transaction:async(fn,opts)=>{assert.equal(opts.isolationLevel,'Serializable');calls++;return fn(tx);}}},'@/lib/mcq-import':mcq,'@/lib/prepared-question-batches':registry,'next/cache':{revalidatePath(){}}});
  for(const b of batches){const f=new FormData();f.set('id',b.id);assert.ok((await actions.previewPrepared({},f)).preview);assert.ok((await actions.savePrepared({},f)).error);}
  assert.equal(calls,0);
  for(const b of batches){const f=new FormData();f.set('id',b.id);f.set('digest',registry.getPreparedBatch(b.id).digest);f.set('reviewed','yes');role='TEACHER';assert.ok((await actions.savePrepared({},f)).error);role='ADMIN';const result=await actions.savePrepared({},f);assert.equal(result.counts.inserted,b.records.length);const replay=await actions.savePrepared({},f);assert.equal(replay.counts.inserted,0);assert.equal(replay.counts.pending,b.records.length);}
  assert.equal(questions.length,Object.values(expected).reduce((a,n)=>a+n,0));assert.equal(settings.size,files.length);assert.ok(questions.every(q=>q.approved===false));assert.equal(questions.filter(q=>q.text.includes('![')).length,diagrams);
 });
}
test('Physics image allowlist rejects external SVG, traversal, query, wrong origin, wrong chapter and markup injection',()=>{
 const good='https://proshnobook.com/question-bank/ssc-physics-ch5-v1/mcq-hydraulic-0.svg';
 assert.equal(tables.questionBlocks(`![চিত্র](${good})`)[0].kind,'physics-image');
 for(const url of [good.replace('https:','http:'),good.replace('proshnobook.com','evil.test'),good+'?x=1',good+'#x',good.replace('ch5','ch15'),good.replace('mcq-hydraulic-0','../x'),good.replace('.svg','.png'),good.replace('proshnobook.com','proshnobook.com.evil.test'),good.replace('mcq-hydraulic-0','x%2fy')])assert.equal(tables.questionBlocks(`![চিত্র](${url})`)[0].kind,'text');
 assert.equal(tables.questionBlocks('<svg onload="alert(1)"></svg>')[0].kind,'text');
 assert.doesNotMatch(renderToStaticMarkup(React.createElement(MathText,{text:'<svg onload="alert(1)"></svg>'})),/<svg/);
});
test('owner profile and separately enabled Physics Auto Model; source completeness not invented',()=>{
 const p=json('docs/question-bank/ssc-physics/mark-distribution.json');assert.equal(p.totalTheoryMinutes,180);assert.equal(p.practicalMarks,25);assert.equal(p.theoryMarks,75);
 const {autoModelBlueprint}=load('lib/auto-model.ts',{'./nctb-data':catalog,'./subject-model-policy':load('lib/subject-model-policy.ts',{'./nctb-data':catalog}),'./question-tables':load('lib/question-tables.ts')});assert.equal(autoModelBlueprint('Class 9','পদার্থবিজ্ঞান','MCQ').id,'ssc-physics-mcq-v1');
 const src=json('docs/question-bank/ssc-physics/source-inspection-ch5-6.json');assert.equal(src.chapters['5'].visualInspection.nativeQuestionFiguresObserved,true);assert.equal(src.chapters['6'].visualInspection.allSourceFiguresInspected,false);
 for(const f of src.chapters['5'].observedFigures)assert.equal(createHash('sha256').update(fs.readFileSync(f.file)).digest('hex'),f.sha256);
});
