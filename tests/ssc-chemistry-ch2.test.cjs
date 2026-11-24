const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),Module=require('node:module'),{createHash}=require('node:crypto'),{execFileSync}=require('node:child_process');
function load(file,mocks={}){const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.React}}).outputText,file);return m.exports;}
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),root='content/question-bank/ssc/chemistry/chapter-2/';
const catalog=load('lib/nctb-data.ts'),mcq=load('lib/mcq-import.ts',{'@/lib/nctb-data':catalog});
const upload=load('lib/question-json-import.ts',{'./nctb-data':catalog,'./mcq-import':mcq,'./question-provenance':load('lib/question-provenance.ts')});
const files=['mcq-1','mcq-2','mcq-3','cq','sq'],mocks={'./question-json-import':upload};
for(const file of files)mocks['@/'+root+file+'.json']=read(root+file+'.json');
const adapter=load('lib/ssc-chemistry-ch2-batches.ts',mocks),tables=load('lib/question-tables.ts'),batches=adapter.sscChemistryChapter2Batches();
const rows=files.flatMap(f=>read(root+f+'.json').items),validation=read(root+'validation.json');
test('chapter 2 exactly 350/50/70 owner drafts pass the real strict importer with no normalized duplicates',()=>{
 assert.deepEqual(batches.map(b=>b.records.length),[120,120,110,50,70]);assert.equal(new Set(rows.map(q=>mcq.normalizeStem(q.text))).size,470);
 assert.deepEqual(rows.reduce((n,q)=>(n[q.type]++,n),{MCQ:0,CQ:0,SQ:0}),{MCQ:350,CQ:50,SQ:70});
 assert.deepEqual(rows.filter(q=>q.type==='MCQ').reduce((n,q)=>(n[q.correct]++,n),{A:0,B:0,C:0,D:0}),{A:88,B:88,C:87,D:87});
 for(const b of batches){assert.equal(b.category,'Class 9');assert.equal(b.subject,'রসায়ন');assert.equal(b.topic,'২য় অধ্যায়: পদার্থের অবস্থা');assert.equal(b.provenance.teacherCertified,false);assert.equal(b.provenance.officialYearVerified,false);assert.match(b.limitations,/ভ্যারিয়েন্ট/);}
 for(const q of rows.filter(q=>q.type==='CQ'))assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);
});
test('wrong chapter/subject, duplicate choices and noncanonical CQ marks fail closed',()=>{
 const b=read(root+'cq.json'),s={category:b.category,subject:b.subject,topic:b.topic,group:''};
 for(const bad of [{...s,subject:'পদার্থবিজ্ঞান'},{...s,topic:'১ম অধ্যায়: রসায়নের ধারণা'}])assert.throws(()=>upload.parseQuestionUpload(JSON.stringify(b),bad));
 b.items[0].parts[1].marks=4;assert.throws(()=>upload.parseQuestionUpload(JSON.stringify(b),s));
 const m=read(root+'mcq-1.json');m.items[0].options.B=m.items[0].options.A;assert.throws(()=>upload.parseQuestionUpload(JSON.stringify(m),s));
});
test('358 image-bearing records preserve every required asset: 14 native crops and 28 original SVG models',()=>{
 const used=new Set();let count=0;
 for(const q of rows){const blocks=tables.questionBlocks(q.text),images=blocks.filter(b=>b.kind==='chemistry-image');if(q.text.includes('![')){count++;assert.equal(images.length,1);assert.ok(!blocks.filter(b=>b.kind==='text').some(b=>b.text.includes('![')));const img=images[0];assert.ok(img.src.startsWith('/question-bank/ssc-chemistry-ch2-v1/'));assert.ok(fs.existsSync('public'+img.src));used.add(path.basename(img.src));}}
 assert.equal(count,358);assert.equal(used.size,42);assert.equal([...used].filter(f=>f.endsWith('.png')).length,14);assert.equal([...used].filter(f=>f.endsWith('.svg')).length,28);
});
test('chapter-2 allowlist rejects unknown files, model numbers, origins, HTML, extension swaps and traversal',()=>{
 const safe='https://proshnobook.com/question-bank/ssc-chemistry-ch2-v1/heating-01.svg';
 for(const url of [safe.replace('proshnobook.com','evil.test'),safe.replace('https:','http:'),safe+'?x=1',safe+'#x',safe.replace('heating-01','heating-00'),safe.replace('heating-01','heating-15'),safe.replace('heating-01','heating-1'),safe.replace('heating-01','../heating-01'),safe.replace('.svg','.png'),safe.replace('ch2-v1','ch3-v1'),safe.replace('heating-01','arbitrary')])assert.equal(tables.questionBlocks(`![x](${url})`)[0].kind,'text');
 assert.equal(tables.questionBlocks(`![x](${safe})`)[0].kind,'chemistry-image');assert.equal(tables.questionBlocks(`<img src="${safe}" onerror="x">`)[0].kind,'text');
 for(const [file,data] of Object.entries(validation.assets).filter(([f])=>f.endsWith('.svg'))){const s=fs.readFileSync('public/question-bank/ssc-chemistry-ch2-v1/'+file,'utf8');assert.doesNotMatch(s,/<(?:script|foreignObject|image|iframe)|(?:href|onload|onerror)\s*=/i);assert.match(s,/viewBox="0 0 720 400"/);}
});
test('real React MathText SSR emits local images without Markdown artifacts or extra captions',()=>{
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');const C=load('components/MathText.tsx',{'@/lib/question-tables':tables}).default;
 for(const q of rows.filter(q=>q.text.includes('!['))){const out=renderToStaticMarkup(React.createElement(C,{text:q.text}));assert.match(out,/<img/);assert.match(out,/src="\/question-bank\/ssc-chemistry-ch2-v1\//);assert.doesNotMatch(out,/!\[|<figcaption/);}
});
test('all fourteen graph coordinate models independently match plateau values, phase intervals and correct answers',()=>{
 for(let n=1;n<=14;n++){
  const mp=10+5*n,bp=110+5*n,a=2+n%3,b=a+2+n%4,c=b+3+n%3,d=c+4+n%4;
  const meta=validation.items.filter(r=>r.kind==='MCQ'&&r.variant===n&&r.family.startsWith('heating-probe'));
  assert.equal(meta.length,10);
  const expected=[`${mp}°C`,`${bp}°C`,`${a} min`,`${b-a} min`,`${c-b} min`,`${d-c} min`,'কঠিন ও তরল','তরল ও গ্যাস',`${bp-mp}°C`];
  meta.slice(0,9).forEach((m,i)=>{const q=rows[m.index-1];assert.equal(q.options[q.correct],expected[i]);});
  const s=fs.readFileSync(`public/question-bank/ssc-chemistry-ch2-v1/heating-${String(n).padStart(2,'0')}.svg`,'utf8');
  const points=s.match(/<polyline points="([^"]+)"/)[1].split(' ').map(p=>p.split(',').map(Number));
  assert.equal(points.length,6);assert.equal(points[1][1],points[2][1]);assert.equal(points[3][1],points[4][1]);assert.ok(points[1][1]>points[3][1]);for(let i=1;i<points.length;i++)assert.ok(points[i][0]>points[i-1][0]);assert.match(s,/T \(°C\)/);assert.match(s,/Time \(min\)/);
 }
});
function fraction(a,b){function gcd(a,b){return b?gcd(b,a%b):a;}const d=gcd(a,b);return b/d===1?String(a/d):`${a/d}/${b/d}`;}
test('all fourteen diffusion distance/time models independently recalculate and explicitly limit their approximation',()=>{
 for(let n=1;n<=14;n++){
  const u=12+n,L=2*u,R=3*u,t=u+5,meta=validation.items.filter(r=>r.kind==='MCQ'&&r.variant===n&&r.family.startsWith('diffusion-probe'));
  const expected=[`${L} cm`,`${R} cm`,`${L+R} cm`,`${fraction(L,t)} cm/s`,`${fraction(R,t)} cm/s`,'A বা HCl','3:2','NH4Cl','NH3'];
  meta.slice(0,9).forEach((m,i)=>{const q=rows[m.index-1];assert.equal(q.options[q.correct],expected[i]);assert.match(q.text,/আনুমানিক তথ্য/);});
  const cqMeta=validation.items.find(r=>r.kind==='CQ'&&r.variant===n&&r.family==='diffusion-cq'),q=rows[cqMeta.index-1];assert.match(q.parts[3].solution,/3:2 নিখুঁত গ্রাহাম-অনুপাত নয়/);assert.match(q.parts[3].solution,/অণুর তাৎক্ষণিক বেগ নয়/);
 }
});
test('source caveats, scientific exceptions, draft scope, every file hash and both chapter generators are reproducible',()=>{
 for(const key of ['teacherApproved','websiteImported','published','officialYearVerified','wholeBookRead'])assert.equal(validation[key],false);
 assert.equal(validation.status,'DRAFT_NOT_IMPORTED');assert.equal(validation.inspectedPrintedPages,'17–34');assert.equal(validation.inspectedPDFPages,'22–39');assert.equal(validation.heatingVariants,14);assert.equal(validation.diffusionVariants,14);
 for(const meta of validation.items){const q=read(root+meta.file).items[meta.itemIndex-1];assert.equal(q.type,meta.kind);assert.equal(q.text,rows[meta.index-1].text);}
 for(const [f,data] of Object.entries(validation.files))assert.equal(createHash('sha256').update(fs.readFileSync(root+f)).digest('hex'),data.sha256);
 for(const [f,data] of Object.entries(validation.assets))assert.equal(createHash('sha256').update(fs.readFileSync('public/question-bank/ssc-chemistry-ch2-v1/'+f)).digest('hex'),data.sha256);
 assert.match(rows.find(q=>q.text.startsWith('আয়োডিন সম্পর্কে')).explanation,/114°C/);
 assert.match(rows.find(q=>q.text.startsWith('NH4Cl গরম')).explanation,/বিচ্ছেদ/);
 execFileSync('python',['scripts/question-bank/build-ssc-chemistry-ch1.py','--check']);execFileSync('python',['scripts/question-bank/build-ssc-chemistry-ch2.py','--check']);
});
test('Chemistry model remains blocked and adapter has no database or approval authority',()=>{
 const p=load('lib/subject-model-policy.ts',{'./nctb-data':catalog});for(const category of ['SSC','Class 9','Class 10'])assert.equal(p.subjectModelPolicy(category,'রসায়ন')?.id,'ssc-chemistry-owner-chapter-policy-v1');
 assert.doesNotMatch(fs.readFileSync('lib/ssc-chemistry-ch2-batches.ts','utf8'),/from ["'].*(?:db|guard|prisma)/);assert.match(fs.readFileSync('lib/prepared-question-batches.ts','utf8'),/\.\.\.sscChemistryChapter2Batches\(\)/);
});
test('real registry keeps all previous 19486 records and adds only 470 chapter-2 drafts in five bounded batches',()=>{
 const resolve=Module._resolveFilename,prev=require.extensions['.ts'];try{
  Module._resolveFilename=function(id,parent,...rest){return resolve.call(this,id.startsWith('@/')?path.resolve(id.slice(2)):id,parent,...rest);};require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
  const all=require('../lib/prepared-question-batches.ts').preparedBatches(),ch2=all.filter(b=>b.id.startsWith('ssc-chemistry-ch2-'));
  assert.equal(all.length,274);assert.equal(ch2.length,5);assert.equal(ch2.reduce((n,b)=>n+b.records.length,0),470);assert.equal(all.filter(b=>!b.id.startsWith('ssc-chemistry-ch11-')&&!b.id.startsWith('ssc-chemistry-ch12-')&&!b.id.startsWith('ssc-chemistry-ch10-')&&!b.id.startsWith('ssc-chemistry-ch9-')&&!b.id.startsWith('ssc-chemistry-ch8-')&&!b.id.startsWith('ssc-chemistry-ch7-')&&!b.id.startsWith('ssc-chemistry-ch6-')&&!b.id.startsWith('ssc-chemistry-ch2-')&&!b.id.startsWith('ssc-chemistry-ch3-')&&!b.id.startsWith('ssc-chemistry-ch4-')&&!b.id.startsWith('ssc-chemistry-ch5-')).reduce((n,b)=>n+b.records.length,0),19486);
 }finally{Module._resolveFilename=resolve;if(prev)require.extensions['.ts']=prev;else delete require.extensions['.ts'];}
});
test('read-only preview; ADMIN consent saves only Pending with replay protection (mock DB, no real writes)',async()=>{
 const digest=b=>createHash('sha256').update(JSON.stringify(b)).digest('hex'),questions=[],settings=new Map();let role='ADMIN',calls=0;
 const registry={getPreparedBatch(id){const batch=batches.find(b=>b.id===id);if(!batch)throw Error('unknown');return {batch,digest:digest(batch)};},preparedQuestionId(b,q){return 'prepared_'+createHash('sha256').update(JSON.stringify([b.category,b.subject,b.topic,q.kind,mcq.normalizeStem(q.text)])).digest('hex');}};
 const tx={question:{findMany:async()=>questions,create:async({data})=>questions.push(data)},setting:{findUnique:async({where})=>settings.get(where.key),create:async({data})=>settings.set(data.key,data),update:async({where,data})=>settings.set(where.key,{key:where.key,...data})}};
 const actions=load('app/admin/questions/import/prepared-actions.ts',{'@prisma/client':{},'@/lib/guard':{staff:async()=>{if(role!=='ADMIN')throw Error('denied');return{id:'owner'};}},'@/lib/db':{db:{$transaction:async fn=>{calls++;return fn(tx);}}},'@/lib/mcq-import':mcq,'@/lib/prepared-question-batches':registry,'next/cache':{revalidatePath(){}}});
 for(const b of batches){const f=new FormData();f.set('id',b.id);const before=calls;assert.equal((await actions.previewPrepared({},f)).preview.length,b.records.length);assert.equal(calls,before);assert.ok((await actions.savePrepared({},f)).error);f.set('digest',digest(b));f.set('reviewed','yes');role='TEACHER';assert.ok((await actions.savePrepared({},f)).error);role='ADMIN';assert.equal((await actions.savePrepared({},f)).counts.inserted,b.records.length);assert.equal((await actions.savePrepared({},f)).counts.inserted,0);}
 assert.equal(questions.length,470);assert.ok(questions.every(q=>q.approved===false&&q.subject==='রসায়ন'&&q.topic==='২য় অধ্যায়: পদার্থের অবস্থা'));
});
