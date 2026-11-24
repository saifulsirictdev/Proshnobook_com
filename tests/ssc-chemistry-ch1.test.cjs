// Historical non-Biology registry scope; full current totals are checked in prepared-library.test.cjs.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),Module=require('node:module'),{createHash}=require('node:crypto'),{execFileSync}=require('node:child_process');
function load(file,mocks={}){const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.React}}).outputText,file);return m.exports;}
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),root='content/question-bank/ssc/chemistry/chapter-1/';
const catalog=load('lib/nctb-data.ts'),mcq=load('lib/mcq-import.ts',{'@/lib/nctb-data':catalog});
const upload=load('lib/question-json-import.ts',{'./nctb-data':catalog,'./mcq-import':mcq,'./question-provenance':load('lib/question-provenance.ts')});
const files=['mcq-1','mcq-2','mcq-3','cq','sq'],mocks={'./question-json-import':upload};
for(const file of files)mocks['@/'+root+file+'.json']=read(root+file+'.json');
const chemistry=load('lib/ssc-chemistry-batches.ts',mocks),tables=load('lib/question-tables.ts', {"./ssc-biology-assets":load("lib/ssc-biology-assets.ts")});
const batches=chemistry.sscChemistryBatches(),rows=files.flatMap(f=>read(root+f+'.json').items),validation=read(root+'validation.json');
test('470 owner-requested Chemistry drafts pass strict uploader, canonical chapter scope and unique normalized stems',()=>{
 assert.deepEqual(batches.map(b=>b.records.length),[120,120,110,50,70]);
 assert.deepEqual(rows.reduce((n,q)=>(n[q.type]++,n),{MCQ:0,CQ:0,SQ:0}),{MCQ:350,CQ:50,SQ:70});
 assert.equal(new Set(rows.map(q=>mcq.normalizeStem(q.text))).size,470);
 for(const b of batches){assert.equal(b.category,'Class 9');assert.equal(b.subject,'রসায়ন');assert.equal(b.topic,'১ম অধ্যায়: রসায়নের ধারণা');assert.equal(b.provenance.teacherCertified,false);assert.equal(b.provenance.officialYearVerified,false);assert.match(b.limitations,/ভ্যারিয়েন্ট/);}
 assert.deepEqual(rows.filter(q=>q.type==='MCQ').reduce((n,q)=>(n[q.correct]++,n),{A:0,B:0,C:0,D:0}),{A:88,B:88,C:87,D:87});
 for(const q of rows.filter(q=>q.type==='CQ')){assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);assert.ok(q.parts.every(p=>p.question&&p.solution));}
});
test('reject wrong subject/chapter, duplicate options and altered CQ marks',()=>{
 const b=read(root+'cq.json'),s={category:b.category,subject:b.subject,topic:b.topic,group:''};
 assert.throws(()=>upload.parseQuestionUpload(JSON.stringify(b),{...s,subject:'পদার্থবিজ্ঞান'}));
 b.items[0].parts[0].marks=2;assert.throws(()=>upload.parseQuestionUpload(JSON.stringify(b),s));
 const m=read(root+'mcq-1.json');m.items[0].options.B=m.items[0].options.A;assert.throws(()=>upload.parseQuestionUpload(JSON.stringify(m),s));
});
test('all source-preserving diagrams parse as trusted Chemistry blocks; hypothetical data tables remain tables',()=>{
 let illustrated=0,tabulated=0;const used=new Set();
 for(const q of rows){const blocks=tables.questionBlocks(q.text);if(q.text.includes('![')){illustrated++;assert.equal(blocks.filter(b=>b.kind==='chemistry-image').length,1);assert.ok(!blocks.filter(b=>b.kind==='text').some(b=>b.text.includes('![')));const img=blocks.find(b=>b.kind==='chemistry-image');assert.ok(img.src.startsWith('/question-bank/ssc-chemistry-ch1-v1/'));const file=new URL(img.src,'https://proshnobook.com').pathname;assert.ok(fs.existsSync('public'+file));used.add(path.basename(file));assert.equal(img.alt.includes('দাহ্য'),false);}
 if(q.text.includes('|---|')){tabulated++;const table=blocks.find(b=>b.kind==='table');assert.equal(table.rows.length,4);assert.equal(table.headers.length,2);}}
 assert.equal(illustrated,171);assert.equal(tabulated,168);assert.equal(used.size,11);
});
test('image allowlist fails closed for arbitrary hosts, paths, extensions, queries, SVG and attributes',()=>{
 const safe='https://proshnobook.com/question-bank/ssc-chemistry-ch1-v1/flammable.png';
 for(const url of [safe.replace('proshnobook.com','evil.test'),safe.replace('https:','http:'),safe+'?x=1',safe+'#x',safe.replace('.png','.svg'),safe.replace('flammable','unknown'),safe.replace('ch1-v1','ch2-v1'),safe.replace('flammable','../flammable'),safe.replace('proshnobook.com','proshnobook.com.evil.test')])assert.deepEqual(tables.questionBlocks(`![x](${url})`),[{kind:'text',text:`![x](${url})`}]);
 assert.equal(tables.questionBlocks(`![x](${safe})`)[0].kind,'chemistry-image');
 assert.equal(tables.questionBlocks(`<img src="${safe}" onerror="alert(1)">`)[0].kind,'text');
});
test('MathText real React SSR renders diagrams and tables without revealing alt-text answers or adding captions',()=>{
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
 const Component=load('components/MathText.tsx',{'@/lib/question-tables':tables}).default;
 for(const q of rows.filter(q=>q.text.includes('![')||q.text.includes('|---|'))){const out=renderToStaticMarkup(React.createElement(Component,{text:q.text}));assert.doesNotMatch(out,/!\[/);if(q.text.includes('![')){assert.match(out,/<img/);assert.doesNotMatch(out,/<figcaption/);assert.match(out,/max-height:300px/);}else assert.match(out,/<table/);}
});
test('source coverage, variant families, manifest hashes and draft-only status are explicit and reproducible',()=>{
 for(const key of ['teacherApproved','websiteImported','published','officialYearVerified','wholeBookRead'])assert.equal(validation[key],false);
 assert.equal(validation.textbookChapterVisuallyInspected,true);assert.equal(validation.status,'DRAFT_NOT_IMPORTED');
 assert.equal(validation.researchDatasetVariants,14);assert.equal(validation.safetyContextVariants,14);
 for(const [file,data] of Object.entries(validation.files))assert.equal(createHash('sha256').update(fs.readFileSync(root+file)).digest('hex'),data.sha256);
 for(const [file,data] of Object.entries(validation.assets))assert.equal(createHash('sha256').update(fs.readFileSync('public/question-bank/ssc-chemistry-ch1-v1/'+file)).digest('hex'),data.sha256);
 execFileSync('python',['scripts/question-bank/build-ssc-chemistry-ch1.py','--check']);
 assert.doesNotMatch(fs.readFileSync('scripts/question-bank/build-ssc-chemistry-ch1.py','utf8'),/import (?:requests|urllib|psycopg)/);
});
test('all fourteen research data variants compute total mass and signed temperature changes independently',()=>{
 const questions=rows.filter(q=>q.type==='CQ'&&q.text.startsWith('কাল্পনিক গবেষণা'));
 assert.equal(questions.length,14);
 for(const q of questions){const t=tables.questionBlocks(q.text).find(b=>b.kind==='table').rows.map(r=>r.map(Number));assert.equal(t[0][0],0);const step=t[1][0];assert.equal(t[3][0],3*step);const diff=t[3][1]-t[0][1];assert.ok(diff<0);assert.ok(q.parts[2].solution.includes(`= ${t[3][0]} g`));assert.ok(q.parts[2].solution.includes(`= −${Math.abs(diff)}°C`));assert.match(q.parts[3].solution,/স্বাধীন পুনরাবৃত্ত পরীক্ষা নয়/);}
});
test('Chemistry has a separate owner-defined model policy and adapter cannot mutate/approve a database',()=>{
 const policies=load('lib/subject-model-policy.ts',{'./nctb-data':catalog});
 assert.equal(policies.subjectModelPolicy('SSC','রসায়ন')?.id,'ssc-chemistry-owner-chapter-policy-v1');
 assert.equal(policies.subjectModelPolicy('Class 9','রসায়ন')?.id,'ssc-chemistry-owner-chapter-policy-v1');
 const src=fs.readFileSync('lib/ssc-chemistry-batches.ts','utf8');assert.doesNotMatch(src,/from ["'].*(?:db|guard|prisma)/);
 assert.match(fs.readFileSync('lib/prepared-question-batches.ts','utf8'),/\.\.\.sscChemistryBatches\(\)/);
});
test('real registry preserves chapter-1 drafts and the existing 19016 non-Chemistry records',()=>{
 const resolve=Module._resolveFilename,previous=require.extensions['.ts'];
 try{
  Module._resolveFilename=function(id,parent,...rest){return resolve.call(this,id.startsWith('@/')?path.resolve(id.slice(2)):id,parent,...rest);};
  require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
  const all=require('../lib/prepared-question-batches.ts').preparedBatches().filter(b=>!b.id.startsWith('ssc-biology-')),chem=all.filter(b=>b.id.startsWith('ssc-chemistry-ch1-'));
  assert.equal(all.length,274);assert.equal(chem.length,5);assert.equal(chem.reduce((n,b)=>n+b.records.length,0),470);
  assert.equal(all.filter(b=>!b.id.startsWith('ssc-chemistry-')).reduce((n,b)=>n+b.records.length,0),19016);
 }finally{Module._resolveFilename=resolve;if(previous)require.extensions['.ts']=previous;else delete require.extensions['.ts'];}
});
test('preview stays read-only; explicit ADMIN consent only saves Pending and replay does not duplicate (mock DB)',async()=>{
 const digest=b=>createHash('sha256').update(JSON.stringify(b)).digest('hex');
 const registry={getPreparedBatch(id){const batch=batches.find(b=>b.id===id);if(!batch)throw Error('unknown');return {batch,digest:digest(batch)};},preparedQuestionId(b,q){return'prepared_'+createHash('sha256').update(JSON.stringify([b.category,b.subject,b.topic,q.kind,mcq.normalizeStem(q.text)])).digest('hex');}};
 const questions=[],settings=new Map();let role='ADMIN',calls=0;
 const tx={question:{findMany:async()=>questions,create:async({data})=>questions.push(data)},setting:{findUnique:async({where})=>settings.get(where.key),create:async({data})=>settings.set(data.key,data),update:async({where,data})=>settings.set(where.key,{key:where.key,...data})}};
 const actions=load('app/admin/questions/import/prepared-actions.ts',{'@prisma/client':{},'@/lib/guard':{staff:async()=>{if(role!=='ADMIN')throw Error('denied');return{id:'owner'};}},'@/lib/db':{db:{$transaction:async fn=>{calls++;return fn(tx);}}},'@/lib/mcq-import':mcq,'@/lib/prepared-question-batches':registry,'next/cache':{revalidatePath(){}}});
 for(const b of batches){const f=new FormData();f.set('id',b.id);const before=calls;assert.equal((await actions.previewPrepared({},f)).preview.length,b.records.length);assert.equal(calls,before);assert.ok((await actions.savePrepared({},f)).error);f.set('digest',digest(b));f.set('reviewed','yes');role='TEACHER';assert.ok((await actions.savePrepared({},f)).error);role='ADMIN';assert.equal((await actions.savePrepared({},f)).counts.inserted,b.records.length);assert.equal((await actions.savePrepared({},f)).counts.inserted,0);}
 assert.equal(questions.length,470);assert.ok(questions.every(q=>q.approved===false&&q.subject==='রসায়ন'));
});
