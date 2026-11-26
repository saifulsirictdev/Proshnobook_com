// Historical Chemistry preservation scope excludes later Class 7 BGS additions;
// current Class 7 shipping completeness is checked separately.
// Historical non-Biology registry scope; full current totals are checked in prepared-library.test.cjs.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),Module=require('node:module'),{createHash}=require('node:crypto'),{execFileSync}=require('node:child_process');
function load(file,mocks={}){const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.React}}).outputText,file);return m.exports;}
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),root='content/question-bank/ssc/chemistry/chapter-3/';
const catalog=load('lib/nctb-data.ts'),mcq=load('lib/mcq-import.ts',{'@/lib/nctb-data':catalog});
const upload=load('lib/question-json-import.ts',{'./nctb-data':catalog,'./mcq-import':mcq,'./question-provenance':load('lib/question-provenance.ts')});
const files=['mcq-1','mcq-2','mcq-3','mcq-4','cq','sq'],mocks={'./question-json-import':upload};
for(const file of files)mocks['@/'+root+file+'.json']=read(root+file+'.json');
const adapter=load('lib/ssc-chemistry-ch3-batches.ts',mocks),tables=load('lib/question-tables.ts', {"./ssc-biology-assets":load("lib/ssc-biology-assets.ts")}),batches=adapter.sscChemistryChapter3Batches();
const rows=files.flatMap(f=>read(root+f+'.json').items),validation=read(root+'validation.json');
test('exactly 500/100/100 owner drafts pass strict uploader; unique normalized stems and balanced keys',()=>{
 assert.deepEqual(batches.map(b=>b.records.length),[125,125,125,125,100,100]);assert.equal(new Set(rows.map(q=>mcq.normalizeStem(q.text))).size,700);
 assert.deepEqual(rows.reduce((n,q)=>(n[q.type]++,n),{MCQ:0,CQ:0,SQ:0}),{MCQ:500,CQ:100,SQ:100});
 assert.deepEqual(rows.filter(q=>q.type==='MCQ').reduce((n,q)=>(n[q.correct]++,n),{A:0,B:0,C:0,D:0}),{A:125,B:125,C:125,D:125});
 for(const b of batches){assert.equal(b.category,'Class 9');assert.equal(b.subject,'রসায়ন');assert.equal(b.topic,'৩য় অধ্যায়: পদার্থের গঠন');assert.equal(b.provenance.teacherCertified,false);assert.equal(b.provenance.officialYearVerified,false);assert.match(b.limitations,/ভ্যারিয়েন্ট/);}
 for(const q of rows.filter(q=>q.type==='CQ')){assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);assert.ok(q.parts.every(p=>p.solution.length>(p.marks===1?0:15)));}
});
test('wrong subject/chapter, duplicate choices and noncanonical CQ marks are rejected',()=>{
 const b=read(root+'cq.json'),s={category:b.category,subject:b.subject,topic:b.topic,group:''};
 for(const bad of [{...s,subject:'পদার্থবিজ্ঞান'},{...s,topic:'২য় অধ্যায়: পদার্থের অবস্থা'}])assert.throws(()=>upload.parseQuestionUpload(JSON.stringify(b),bad));
 b.items[0].parts[1].marks=4;assert.throws(()=>upload.parseQuestionUpload(JSON.stringify(b),s));
 const m=read(root+'mcq-1.json');m.items[0].options.B=m.items[0].options.A;assert.throws(()=>upload.parseQuestionUpload(JSON.stringify(m),s));
});
test('all illustrated records retain local diagrams; exactly 7 native PNGs and 50 original SVGs',()=>{
 const used=new Set();let illustrated=0;
 for(const q of rows){const blocks=tables.questionBlocks(q.text),images=blocks.filter(b=>b.kind==='chemistry-image');if(q.text.includes('![')){illustrated++;assert.equal(images.length,1);assert.ok(!blocks.filter(b=>b.kind==='text').some(b=>b.text.includes('![')));const img=images[0];assert.ok(img.src.startsWith('/question-bank/ssc-chemistry-ch3-v1/'));assert.ok(fs.existsSync('public'+img.src));used.add(path.basename(img.src));}}
 assert.equal(illustrated,imagesExpected());assert.equal(used.size,57);assert.equal([...used].filter(s=>s.endsWith('.png')).length,7);assert.equal([...used].filter(s=>s.endsWith('.svg')).length,50);
 function imagesExpected(){return 12+2*7+30*7+20*7+20*7;}
});
test('exact allowlist rejects origins, extensions, invalid indices, traversal, HTML, queries and fragments',()=>{
 for(const name of ['nuclide-01.svg','nuclide-30.svg','isotope-01.svg','isotope-20.svg','rutherford.png']){
  const safe='https://proshnobook.com/question-bank/ssc-chemistry-ch3-v1/'+name;assert.equal(tables.questionBlocks(`![x](${safe})`)[0].kind,'chemistry-image');
  for(const url of [safe.replace('proshnobook.com','evil.test'),safe.replace('https:','http:'),safe+'?x=1',safe+'#x',safe.replace(name,'../'+name),safe.replace(name,'arbitrary.svg'),safe.replace(name,'nuclide-31.svg'),safe.replace(name,'isotope-21.svg'),safe.replace(name,'nuclide-00.svg'),safe.replace(name,'isotope-1.svg'),safe.replace(name,'rutherford.svg')])assert.equal(tables.questionBlocks(`![x](${url})`)[0].kind,'text');
  assert.equal(tables.questionBlocks(`<img src="${safe}" onerror="x">`)[0].kind,'text');
 }
 for(const [f,v] of Object.entries(validation.assets).filter(([f])=>f.endsWith('.svg'))){const s=fs.readFileSync('public/question-bank/ssc-chemistry-ch3-v1/'+f,'utf8');assert.doesNotMatch(s,/<(?:script|foreignObject|image|iframe)|(?:href|onload|onerror)\s*=/i);assert.match(s,/viewBox="0 0 720 400"/);}
});
test('real MathText React SSR emits local images without raw Markdown or new captions',()=>{
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),C=load('components/MathText.tsx',{'@/lib/question-tables':tables}).default;
 for(const q of rows.filter(q=>q.text.includes('!['))){const out=renderToStaticMarkup(React.createElement(C,{text:q.text}));assert.match(out,/<img/);assert.match(out,/src="\/question-bank\/ssc-chemistry-ch3-v1\//);assert.doesNotMatch(out,/!\[|<figcaption/);}
});
function row(family,n){const m=validation.items.find(m=>m.family===family&&m.variant===n);assert.ok(m,`${family}/${n}`);return rows[m.index-1];}
function answer(family,n){const q=row(family,n);return q.options[q.correct];}
function frac(n,d=1){let a=Math.abs(n),b=d;while(b){[a,b]=[b,a%b];}return d/a===1?String(n/a):`${n/a}/${d/a}`;}
test('all 150 nuclide keys independently recompute p,n,e,A,p+n+e; every CQ/SQ checked',()=>{
 const masses=[1,4,7,9,11,12,14,16,19,20,23,24,27,28,31,32,35,40,39,40,45,48,51,52,55,56,59,58,63,64];
 for(let z=1;z<=30;z++){
  const a=masses[z-1],charge=[0,1,-1][(z-1)%3],e=z-charge,expected=[z,a-z,e,a,a+e];
  expected.forEach((ans,i)=>assert.equal(answer(`nuclide-probe-${i+1}`,z),String(ans)));
  const c=row('nuclide-cq',z);assert.ok(c.parts[2].solution.includes(`p=${z};n=${a}−${z}=${a-z};e=${z}−`));assert.ok(c.parts[2].solution.endsWith(`=${e}।`));assert.match(c.parts[3].solution,/আইসোটোপ/);assert.ok(row('nuclide-sq',z).explanation.endsWith(`=${e}।`));
  const svg=fs.readFileSync(`public/question-bank/ssc-chemistry-ch3-v1/nuclide-${String(z).padStart(2,'0')}.svg`,'utf8');assert.ok(svg.includes(`A = ${a}`));assert.ok(svg.includes(`Z = ${z}`));assert.ok(svg.includes(`= ${['0','+1','−1'][[0,1,-1].indexOf(charge)]}</text>`));
 }
});
test('all 100 hypothetical isotope keys plus 20 inverse CQ/SQ means independently calculated',()=>{
 for(let n=1;n<=20;n++){
  const low=20+2*n,high=low+2,p=10+4*n,z=10+n,mean=frac(low*p+high*(100-p),100),expected=[mean,String(low-z),String(high-z),String(p*100),`${low}f+${high}(1−f)=${mean}`];
  expected.forEach((ans,i)=>assert.equal(answer(`isotope-probe-${i+1}`,n),ans));
  const c=row('isotope-cq',n);assert.ok(c.parts[2].solution.includes(`Ar=${mean};`));assert.ok(c.parts[3].solution.includes(`=${p}/100;`));assert.ok(row('isotope-sq',n).explanation.includes(`=${mean};`));
  assert.match(c.parts[3].solution,/তৃতীয় আইসোটোপ/);if(p===50)assert.match(c.parts[1].solution,/সরল গড় ও ভারযুক্ত গড় মেলে/);else assert.match(c.parts[1].solution,/অসমান/);
  const s=fs.readFileSync(`public/question-bank/ssc-chemistry-ch3-v1/isotope-${String(n).padStart(2,'0')}.svg`,'utf8'),rects=[...s.matchAll(/<rect x="(?:180|430)" y="(\d+)" width="120" height="(\d+)"/g)];
  assert.equal(rects.length,2);assert.equal(+rects[0][2],p*2);assert.equal(+rects[1][2],(100-p)*2);rects.forEach(r=>assert.equal(+r[1]+ +r[2],305));assert.match(s,/Hypothetical/);
 }
});
test('all 100 H–Ca configuration keys recalculated with independent orbital energy ordering, plus CQ/SQ',()=>{
 // Independent sequential filling, not the Python shell shortcut.
 const order=[{n:1,c:2},{n:2,c:2},{n:2,c:6},{n:3,c:2},{n:3,c:6},{n:4,c:2}];
 for(let z=1;z<=20;z++){
  let remaining=z;const shells=[];for(const o of order){const fill=Math.min(remaining,o.c);if(fill){shells[o.n-1]=(shells[o.n-1]||0)+fill;remaining-=fill;}}
  assert.equal(remaining,0);const outer=shells.at(-1),expected=[shells.join(','),String(outer),String(shells.length),String(2*shells.length**2),String(z*2)];expected.forEach((a,i)=>assert.equal(answer(`configuration-probe-${i+1}`,z),a));
  assert.ok(row('configuration-cq',z).parts[2].solution.includes(`বিন্যাস ${shells.join(',')};`));assert.ok(row('configuration-sq',z).explanation.includes(`বিন্যাস ${shells.join(',')};`));
 }
});
function composition(formula){
 const tokens=formula.match(/[A-Z][a-z]?|\d+|[()]/g),stack=[{}];
 for(let i=0;i<tokens.length;i++){
  const t=tokens[i];if(t==='('){stack.push({});continue;}
  if(t===')'){const group=stack.pop(),mult=/^\d+$/.test(tokens[i+1])?Number(tokens[++i]):1;for(const [k,v] of Object.entries(group))stack.at(-1)[k]=(stack.at(-1)[k]||0)+v*mult;continue;}
  const mult=/^\d+$/.test(tokens[i+1])?Number(tokens[++i]):1;stack.at(-1)[t]=(stack.at(-1)[t]||0)+mult;
 }assert.equal(stack.length,1);return stack[0];
}
test('100 formula keys recalculated with independent parentheses parser and fixed masses; 10CQ/10SQ checked',()=>{
 const formulas=['H2O','CO2','NH3','H2SO4','HNO3','CH4','C2H6','C2H5OH','C6H12O6','NaCl','Na2CO3','CaCO3','Ca(OH)2','Al2(SO4)3','MgCl2','K2SO4','Fe2O3','CuSO4','O2','N2'],ar={H:1,C:12,N:14,O:16,Na:23,Mg:24,Al:27,S:32,Cl:35.5,K:39,Ca:40,Fe:56,Cu:64};
 formulas.forEach((f,index)=>{const n=index+1,c=composition(f),keys=Object.keys(c),last=keys.at(-1),mass=keys.reduce((s,k)=>s+c[k]*ar[k],0),expected=[frac(mass*2,2),String(Object.values(c).reduce((a,b)=>a+b)),String(keys.length),String(c[last]),frac(c[last]*ar[last]*2,2)];
  expected.forEach((a,i)=>assert.equal(answer(`formula-probe-${i+1}`,n),a));
  if(n<=10){assert.ok(row('formula-cq',n).parts[2].solution.includes(`=${expected[0]}।`));assert.ok(row('formula-sq',n).explanation.includes(`=${expected[0]};`));}
 });
});
test('canonical validation coordinates, file/asset hashes, truthful provenance and reproducible generation',()=>{
 assert.equal(validation.items.length,700);assert.equal(validation.teacherApproved,false);assert.equal(validation.websiteImported,false);assert.equal(validation.published,false);
 for(const [i,m] of validation.items.entries()){assert.equal(m.index,i+1);assert.equal(m.kind,rows[i].type);assert.equal(read(root+m.file).items[m.itemIndex-1].text,rows[i].text);}
 for(const [f,v] of Object.entries(validation.files))assert.equal(createHash('sha256').update(fs.readFileSync(root+f)).digest('hex'),v.sha256);
 for(const [f,v] of Object.entries(validation.assets))assert.equal(createHash('sha256').update(fs.readFileSync('public/question-bank/ssc-chemistry-ch3-v1/'+f)).digest('hex'),v.sha256);
 for(const chapter of [1,2,3])execFileSync('python',[`scripts/question-bank/build-ssc-chemistry-ch${chapter}.py`,'--check']);
 const corrections=[['Z=9 হলে','ফ্লোরিন'],['চিকিৎসায় প্রায় ছয়','Tc-99m'],['Cr-এর মৌলিক','3d5 4s1'],['Cu-এর মৌলিক','3d10 4s1']];
 for(const [prefix,a] of corrections){const q=rows.find(q=>q.text.startsWith(prefix));assert.equal(q.options[q.correct],a);}
 assert.match(rows.find(q=>q.text.startsWith('ইলেকট্রনের ভর সম্পর্কে')).explanation,/শূন্য লেখা আনুমানিকতা/);
 assert.match(rows.find(q=>q.text.startsWith('আধুনিক অরবিটাল')).explanation,/সমার্থক নয়/);
});
test('real registry preserves 19956 prior records; adds only 700 read-only drafts; Chemistry Auto Model blocked',()=>{
 const policy=load('lib/subject-model-policy.ts',{'./nctb-data':catalog});for(const category of ['SSC','Class 9','Class 10'])assert.equal(policy.subjectModelPolicy(category,'রসায়ন')?.id,'ssc-chemistry-owner-chapter-policy-v1');
 assert.doesNotMatch(fs.readFileSync('lib/ssc-chemistry-ch3-batches.ts','utf8'),/from ["'].*(?:db|guard|prisma)/);
 const resolve=Module._resolveFilename,previous=require.extensions['.ts'];try{
  Module._resolveFilename=function(id,parent,...rest){return resolve.call(this,id.startsWith('@/')?path.resolve(id.slice(2)):id,parent,...rest);};require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
  const all=require('../lib/prepared-question-batches.ts').preparedBatches().filter(b=>!b.id.startsWith('ssc-biology-')&&!b.id.startsWith('class7-bgs-')),ch3=all.filter(b=>b.id.startsWith('ssc-chemistry-ch3-'));
  assert.equal(all.length,274);assert.equal(ch3.length,6);assert.equal(ch3.reduce((n,b)=>n+b.records.length,0),700);assert.equal(all.filter(b=>!b.id.startsWith('ssc-chemistry-ch11-')&&!b.id.startsWith('ssc-chemistry-ch12-')&&!b.id.startsWith('ssc-chemistry-ch10-')&&!b.id.startsWith('ssc-chemistry-ch9-')&&!b.id.startsWith('ssc-chemistry-ch8-')&&!b.id.startsWith('ssc-chemistry-ch7-')&&!b.id.startsWith('ssc-chemistry-ch6-')&&!b.id.startsWith('ssc-chemistry-ch3-')&&!b.id.startsWith('ssc-chemistry-ch4-')&&!b.id.startsWith('ssc-chemistry-ch5-')).reduce((n,b)=>n+b.records.length,0),19956);
 }finally{Module._resolveFilename=resolve;if(previous)require.extensions['.ts']=previous;else delete require.extensions['.ts'];}
});
test('read-only preview; ADMIN consent saves only Pending with replay protection (mock DB, no real writes)',async()=>{
 const digest=b=>createHash('sha256').update(JSON.stringify(b)).digest('hex'),questions=[],settings=new Map();let role='ADMIN',calls=0;
 const registry={getPreparedBatch(id){const batch=batches.find(b=>b.id===id);if(!batch)throw Error('unknown');return {batch,digest:digest(batch)};},preparedQuestionId(b,q){return 'prepared_'+createHash('sha256').update(JSON.stringify([b.category,b.subject,b.topic,q.kind,mcq.normalizeStem(q.text)])).digest('hex');}};
 const tx={question:{findMany:async()=>questions,create:async({data})=>questions.push(data)},setting:{findUnique:async({where})=>settings.get(where.key),create:async({data})=>settings.set(data.key,data),update:async({where,data})=>settings.set(where.key,{key:where.key,...data})}};
 const actions=load('app/admin/questions/import/prepared-actions.ts',{'@prisma/client':{},'@/lib/guard':{staff:async()=>{if(role!=='ADMIN')throw Error('denied');return{id:'owner'};}},'@/lib/db':{db:{$transaction:async fn=>{calls++;return fn(tx);}}},'@/lib/mcq-import':mcq,'@/lib/prepared-question-batches':registry,'next/cache':{revalidatePath(){}}});
 for(const b of batches){const f=new FormData();f.set('id',b.id);const before=calls;assert.equal((await actions.previewPrepared({},f)).preview.length,b.records.length);assert.equal(calls,before);assert.ok((await actions.savePrepared({},f)).error);f.set('digest',digest(b));f.set('reviewed','yes');role='TEACHER';assert.ok((await actions.savePrepared({},f)).error);role='ADMIN';assert.equal((await actions.savePrepared({},f)).counts.inserted,b.records.length);assert.equal((await actions.savePrepared({},f)).counts.inserted,0);}
 assert.equal(questions.length,700);assert.ok(questions.every(q=>q.approved===false&&q.subject==='রসায়ন'&&q.topic==='৩য় অধ্যায়: পদার্থের গঠন'));
});
