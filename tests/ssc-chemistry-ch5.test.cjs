// Historical non-Biology registry scope; full current totals are checked in prepared-library.test.cjs.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),Module=require('node:module'),{createHash}=require('node:crypto'),{execFileSync}=require('node:child_process');
function load(file,mocks={}){const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.React}}).outputText,file);return m.exports;}
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),root='content/question-bank/ssc/chemistry/chapter-5/';
const catalog=load('lib/nctb-data.ts'),mcq=load('lib/mcq-import.ts',{'@/lib/nctb-data':catalog});
const upload=load('lib/question-json-import.ts',{'./nctb-data':catalog,'./mcq-import':mcq,'./question-provenance':load('lib/question-provenance.ts')});
const files=['mcq-1','mcq-2','mcq-3','mcq-4','mcq-5','cq-1','cq-2','sq'],mocks={'./question-json-import':upload};
for(const file of files)mocks['@/'+root+file+'.json']=read(root+file+'.json');
const adapter=load('lib/ssc-chemistry-ch5-batches.ts',mocks),tables=load('lib/question-tables.ts', {"./ssc-biology-assets":load("lib/ssc-biology-assets.ts")}),batches=adapter.sscChemistryChapter5Batches();
const rows=files.flatMap(f=>read(root+f+'.json').items),validation=read(root+'validation.json');
test('500MCQ/200CQ/100SQ pass strict uploader; eight bounded slices and balanced keys',()=>{
 assert.deepEqual(batches.map(b=>b.records.length),[100,100,100,100,100,100,100,100]);assert.equal(new Set(rows.map(q=>mcq.normalizeStem(q.text))).size,800);
 assert.deepEqual(rows.reduce((n,q)=>(n[q.type]++,n),{MCQ:0,CQ:0,SQ:0}),{MCQ:500,CQ:200,SQ:100});assert.deepEqual(rows.filter(q=>q.type==='MCQ').reduce((n,q)=>(n[q.correct]++,n),{A:0,B:0,C:0,D:0}),{A:125,B:125,C:125,D:125});
 for(const b of batches){assert.equal(b.category,'Class 9');assert.equal(b.subject,'রসায়ন');assert.equal(b.topic,'৫ম অধ্যায়: রাসায়নিক বন্ধন');assert.equal(b.provenance.teacherCertified,false);assert.equal(b.provenance.officialYearVerified,false);assert.match(b.limitations,/ভ্যারিয়েন্ট/);}
 for(const q of rows.filter(q=>q.type==='CQ'))assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);
 for(const q of rows){assert.equal(q.provenance,undefined);assert.match(q.page,/নিজস্ব অনুশীলনী, বোর্ড প্রশ্ন নয়/);}
});
test('scope spoof, duplicate options, bad CQ marks fail closed',()=>{
 const b=read(root+'cq-1.json'),s={category:b.category,subject:b.subject,topic:b.topic,group:''};for(const bad of [{...s,subject:'পদার্থবিজ্ঞান'},{...s,topic:'৩য় অধ্যায়: পদার্থের গঠন'}])assert.throws(()=>upload.parseQuestionUpload(JSON.stringify(b),bad));b.items[0].parts[1].marks=4;assert.throws(()=>upload.parseQuestionUpload(JSON.stringify(b),s));
 const m=read(root+'mcq-1.json');m.items[0].options.B=m.items[0].options.A;assert.throws(()=>upload.parseQuestionUpload(JSON.stringify(m),s));
});
test('745 image records preserve all 17 source figures and 88 self-contained SVG models',()=>{
 const used=new Set();let images=0,tablesCount=0;
 for(const q of rows){const blocks=tables.questionBlocks(q.text),imgs=blocks.filter(b=>b.kind==='chemistry-image');tablesCount+=blocks.filter(b=>b.kind==='table').length;
  if(q.text.includes('![')){images++;assert.equal(imgs.length,1);assert.ok(!blocks.filter(b=>b.kind==='text').some(b=>b.text.includes('![')));assert.ok(imgs[0].src.startsWith('/question-bank/ssc-chemistry-ch5-v1/'));assert.ok(fs.existsSync('public'+imgs[0].src));used.add(path.basename(imgs[0].src));}}
 assert.equal(images,745);assert.equal(used.size,105);assert.equal([...used].filter(f=>f.endsWith('.png')).length,17);assert.equal([...used].filter(f=>f.endsWith('.svg')).length,88);assert.equal(tablesCount,160);
});
test('exact file/range/origin allowlist and SVG safety',()=>{
 for(const name of ['charge-01.svg','charge-40.svg','lewis-24.svg','property-24.svg','water-polarity.png','exercise-abd.png']){
  const safe='https://proshnobook.com/question-bank/ssc-chemistry-ch5-v1/'+name;assert.equal(tables.questionBlocks(`![x](${safe})`)[0].kind,'chemistry-image');
  for(const url of [safe.replace('proshnobook.com','evil.test'),safe.replace('https:','http:'),safe+'?x=1',safe+'#x',safe.replace(name,'../'+name),safe.replace(name,'arbitrary.svg'),safe.replace(name,'charge-41.svg'),safe.replace(name,'lewis-25.svg'),safe.replace(name,'property-00.svg'),safe.replace(name,'charge-1.svg'),safe.replace(name,'water-polarity.svg')])assert.equal(tables.questionBlocks(`![x](${url})`)[0].kind,'text');
  assert.equal(tables.questionBlocks(`<img src="${safe}" onerror="x">`)[0].kind,'text');
 }
 for(const f of Object.keys(validation.assets).filter(f=>f.endsWith('.svg'))){const s=fs.readFileSync('public/question-bank/ssc-chemistry-ch5-v1/'+f,'utf8');assert.doesNotMatch(s,/<(?:script|foreignObject|image|iframe)|(?:href|onload|onerror)\s*=/i);assert.match(s,/viewBox="0 0 760 460"/);}
});
test('real React MathText SSR renders all image/table records without raw Markdown/new captions',()=>{
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),C=load('components/MathText.tsx',{'@/lib/question-tables':tables}).default;
 for(const q of rows.filter(q=>q.text.includes('!['))){const out=renderToStaticMarkup(React.createElement(C,{text:q.text}));assert.match(out,/<img/);assert.match(out,/src="\/question-bank\/ssc-chemistry-ch5-v1\//);assert.doesNotMatch(out,/!\[|<figcaption/);if(q.text.includes('| --- |'))assert.match(out,/<table/);}
});
function row(family,n){const m=validation.items.find(m=>m.family===family&&m.variant===n);assert.ok(m,`${family}/${n}`);return rows[m.index-1];}
function answer(family,n){const q=row(family,n);return q.options[q.correct];}
test('standalone answer review preserves 800 articles,745 images and180 real HTML tables with valid local assets',()=>{
 const doc=fs.readFileSync('docs/question-bank/ssc-chemistry/chapter-5-review.html','utf8');assert.equal((doc.match(/<article>/g)||[]).length,800);assert.equal((doc.match(/<img /g)||[]).length,745);assert.equal((doc.match(/<table>/g)||[]).length,160);assert.doesNotMatch(doc,/\| --- \|/);
 for(const m of doc.matchAll(/<img[^>]+src="([^"]+)"/g))assert.ok(fs.existsSync(path.resolve('docs/question-bank/ssc-chemistry',m[1])));
});
test('canonical file/row coordinates, all hashes and five chapter generators remain reproducible',()=>{
 assert.equal(validation.items.length,800);assert.equal(validation.teacherApproved,false);assert.equal(validation.websiteImported,false);assert.equal(validation.published,false);
 for(const [i,m] of validation.items.entries()){assert.equal(m.index,i+1);assert.equal(m.kind,rows[i].type);assert.equal(read(root+m.file).items[m.itemIndex-1].text,rows[i].text);}
 for(const [f,v] of Object.entries(validation.files))assert.equal(createHash('sha256').update(fs.readFileSync(root+f)).digest('hex'),v.sha256);
 for(const [f,v] of Object.entries(validation.assets))assert.equal(createHash('sha256').update(fs.readFileSync('public/question-bank/ssc-chemistry-ch5-v1/'+f)).digest('hex'),v.sha256);
 for(let c=1;c<=5;c++)execFileSync('python',[`scripts/question-bank/build-ssc-chemistry-ch${c}.py`,'--check']);
});
test('real registry preserves21456 previous records, adds800 drafts, and Chemistry Auto Model stays blocked',()=>{
 const policy=load('lib/subject-model-policy.ts',{'./nctb-data':catalog});for(const category of ['SSC','Class 9','Class 10'])assert.equal(policy.subjectModelPolicy(category,'রসায়ন')?.id,'ssc-chemistry-owner-chapter-policy-v1');assert.doesNotMatch(fs.readFileSync('lib/ssc-chemistry-ch5-batches.ts','utf8'),/from ["'].*(?:db|guard|prisma)/);
 const resolve=Module._resolveFilename,previous=require.extensions['.ts'];try{Module._resolveFilename=function(id,parent,...rest){return resolve.call(this,id.startsWith('@/')?path.resolve(id.slice(2)):id,parent,...rest);};require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
 const all=require('../lib/prepared-question-batches.ts').preparedBatches().filter(b=>!b.id.startsWith('ssc-biology-')),own=all.filter(b=>b.id.startsWith('ssc-chemistry-ch5-'));assert.equal(all.length,274);assert.equal(own.length,8);assert.equal(own.reduce((n,b)=>n+b.records.length,0),800);assert.equal(all.filter(b=>!b.id.startsWith('ssc-chemistry-ch11-')&&!b.id.startsWith('ssc-chemistry-ch12-')&&!b.id.startsWith('ssc-chemistry-ch10-')&&!b.id.startsWith('ssc-chemistry-ch9-')&&!b.id.startsWith('ssc-chemistry-ch8-')&&!b.id.startsWith('ssc-chemistry-ch7-')&&!b.id.startsWith('ssc-chemistry-ch6-')&&!b.id.startsWith('ssc-chemistry-ch5-')).reduce((n,b)=>n+b.records.length,0),21456);
 }finally{Module._resolveFilename=resolve;if(previous)require.extensions['.ts']=previous;else delete require.extensions['.ts'];}
});
test('read-only preview; ADMIN consent saves only Pending with replay protection (mock DB, no real writes)',async()=>{
 const digest=b=>createHash('sha256').update(JSON.stringify(b)).digest('hex'),questions=[],settings=new Map();let role='ADMIN',calls=0;
 const registry={getPreparedBatch(id){const batch=batches.find(b=>b.id===id);if(!batch)throw Error('unknown');return {batch,digest:digest(batch)};},preparedQuestionId(b,q){return 'prepared_'+createHash('sha256').update(JSON.stringify([b.category,b.subject,b.topic,q.kind,mcq.normalizeStem(q.text)])).digest('hex');}};
 const tx={question:{findMany:async()=>questions,create:async({data})=>questions.push(data)},setting:{findUnique:async({where})=>settings.get(where.key),create:async({data})=>settings.set(data.key,data),update:async({where,data})=>settings.set(where.key,{key:where.key,...data})}};
 const actions=load('app/admin/questions/import/prepared-actions.ts',{'@prisma/client':{},'@/lib/guard':{staff:async()=>{if(role!=='ADMIN')throw Error('denied');return{id:'owner'};}},'@/lib/db':{db:{$transaction:async fn=>{calls++;return fn(tx);}}},'@/lib/mcq-import':mcq,'@/lib/prepared-question-batches':registry,'next/cache':{revalidatePath(){}}});
 for(const b of batches){const f=new FormData();f.set('id',b.id);const before=calls;assert.equal((await actions.previewPrepared({},f)).preview.length,b.records.length);assert.equal(calls,before);assert.ok((await actions.savePrepared({},f)).error);f.set('digest',digest(b));f.set('reviewed','yes');role='TEACHER';assert.ok((await actions.savePrepared({},f)).error);role='ADMIN';assert.equal((await actions.savePrepared({},f)).counts.inserted,b.records.length);assert.equal((await actions.savePrepared({},f)).counts.inserted,0);}
 assert.equal(questions.length,800);assert.ok(questions.every(q=>q.approved===false&&q.subject==='রসায়ন'&&q.topic==='৫ম অধ্যায়: রাসায়নিক বন্ধন'));
});
function parseFormula(s){let i=0;function group(){const out={};while(i<s.length&&s[i]!==')'){let part={};if(s[i]==='('){i++;part=group();assert.equal(s[i++],')');}else{const m=s.slice(i).match(/^[A-Z][a-z]?/);assert.ok(m,s.slice(i));i+=m[0].length;part[m[0]]=1;}const m=s.slice(i).match(/^\d+/),n=m?Number(m[0]):1;if(m)i+=m[0].length;for(const [a,k]of Object.entries(part))out[a]=(out[a]||0)+n*k;}return out;}const out=group();assert.equal(i,s.length);return out;}
const sum=o=>Object.values(o).reduce((a,b)=>a+b,0),valences={H:1,C:4,N:5,O:6,F:7,P:5,S:6,Cl:7,Br:7,I:7};
const charges={Li:1,Na:1,K:1,Mg:2,Ca:2,NH4:1,F:-1,Cl:-1,Br:-1,I:-1,O:-2,S:-2,OH:-1,NO3:-1,CO3:-2,SO4:-2,PO4:-3};
function gcd(a,b){while(b)[a,b]=[b,a%b];return a;}
test('all200 charge-balance MCQ keys and120CQ/40SQ checked with independent formula parser, charge map and reduced ratios',()=>{
 for(let n=1;n<=40;n++){
  const m=validation.items.find(m=>m.family==='ionic-probe-1'&&m.variant===n),{cation:cat,anion:an}=m.modelInputs,cp=charges[cat],aq=charges[an],d=gcd(cp,-aq),c=-aq/d,a=cp/d;
  const part=(s,k)=>((k>1&&sum(parseFormula(s))>1)?`(${s})`:s)+(k>1?k:''),formula=part(cat,c)+part(an,a),atoms=sum(parseFormula(formula));
  [formula,c,a,c+a,atoms].forEach((a,i)=>assert.equal(answer(`ionic-probe-${i+1}`,n),String(a)));
  assert.deepEqual(parseFormula(formula),m.modelInputs.composition);assert.deepEqual(m.modelInputs.counts,[c,a]);assert.equal(c*cp+a*aq,0);
  assert.ok(row('ionic-cq-A',n).parts[2].solution.includes(`${formula};`));assert.ok(row('ionic-cq-B',n).parts[2].solution.includes(`মোট পরমাণু ${atoms}`));assert.ok(row('ionic-sq',n).explanation.includes(`সংকেত ${formula}`));
  const scale=n+2,scaled=validation.items.find(m=>m.family==='ionic-cq-C'&&m.variant===n).modelInputs;assert.deepEqual(scaled,{scale,cations:c*scale,anions:a*scale,positiveCharge:c*scale*cp,negativeCharge:a*scale*aq,totalAtoms:scale*atoms});assert.ok(row('ionic-cq-C',n).parts[3].solution.includes(`=${scale*atoms}।`));
  const svg=fs.readFileSync(`public/question-bank/ssc-chemistry-ch5-v1/charge-${String(n).padStart(2,'0')}.svg`,'utf8');assert.ok(svg.includes(`Charge = +${cp}`));assert.ok(svg.includes(`Charge = ${aq}`));for(const name of [cat,an])assert.ok(svg.includes(`>${name}</text>`));assert.doesNotMatch(svg,/lowest.*=\s*\d/);
 }
});
test('all120 Lewis MCQ keys and24CQ/24SQ independently counted from chemical formula and bond-edge graph; all24SVG line/dot counts checked',()=>{
 for(let n=1;n<=24;n++){
  const m=validation.items.find(m=>m.family==='lewis-probe-1'&&m.variant===n),{formula,nodes,edges,lonePairsPerAtom:lone}=m.modelInputs,composition=parseFormula(formula),electrons=Object.entries(composition).reduce((t,[a,k])=>t+valences[a]*k,0),pairs=edges.reduce((s,e)=>s+e[2],0),lp=(electrons-2*pairs)/2,atoms=sum(composition);
  assert.equal(nodes.length,atoms);assert.deepEqual(nodes.reduce((o,[s])=>(o[s]=(o[s]||0)+1,o),{}),composition);
  const degree=nodes.map((_,i)=>edges.reduce((s,[a,b,k])=>s+(a===i||b===i?k:0),0));nodes.forEach(([s],i)=>{assert.equal(2*lone[i]+degree[i],valences[s]);assert.equal(2*lone[i]+2*degree[i],s==='H'?2:8);});assert.equal(sum(lone),lp);
  [electrons,pairs,lp,2*pairs,atoms].forEach((a,i)=>assert.equal(answer(`lewis-probe-${i+1}`,n),String(a)));
  assert.ok(row('lewis-cq',n).parts[2].solution.includes(`নিঃসঙ্গ জোড়া(${electrons}−2×${pairs})/2=${lp}`));assert.ok(row('lewis-sq',n).explanation.includes(`/2=${lp}`));
  const svg=fs.readFileSync(`public/question-bank/ssc-chemistry-ch5-v1/lewis-${String(n).padStart(2,'0')}.svg`,'utf8');assert.equal((svg.match(/<path /g)||[]).length,pairs);assert.equal((svg.match(/<circle /g)||[]).length,2*lp);assert.match(svg,/not a 3D model/);assert.ok(svg.includes(`${formula}: simplified Lewis connectivity`));
  for(const m of svg.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)"/g)){assert.ok(+m[1]>0&&+m[1]<760);assert.ok(+m[2]>58&&+m[2]<420);}
 }
});
test('all120 property MCQ keys and24CQ/16SQ checked against declared hypothetical four-model observations; all24SVGs retain exact table values',()=>{
 const names={ionic:'আয়নিক জালক',molecular:'আণবিক সমযোজী অ-ইলেকট্রোলাইট',metal:'ধাতব গঠন',network:'বিস্তৃত সমযোজী জালক'};
 for(let n=1;n<=24;n++){
  const m=validation.items.find(m=>m.family==='property-probe-1'&&m.variant===n),x=m.modelInputs;
  // Derive class from observations, not the stored type label or numerical MP.
  const kind=x.solid?'metal':x.molten?'ionic':x.soluble?'molecular':'network';assert.equal(kind,x.kind);
  const carrier=kind==='metal'?'ইলেকট্রন':kind==='ionic'?'গলিত অবস্থায় আয়ন':'ঘোষিত পর্যবেক্ষণে উল্লেখযোগ্য চলনশীল আধানবাহক নেই';
  [names[kind],String(x.mp),carrier,'না, নিরপেক্ষ অণুও মেশে','সব সম্ভাব্য বাস্তব পদার্থের মধ্যে একটি নির্দিষ্ট নাম নিশ্চিত'].forEach((a,i)=>assert.equal(answer(`property-probe-${i+1}`,n),a));assert.equal(x.solution,kind==='ionic');assert.ok(row('property-cq',n).parts[2].solution.includes(names[kind]));if(n<=16)assert.ok(row('property-sq',n).explanation.includes(names[kind]));
  const q=row('property-probe-1',n);assert.match(q.text,/কাল্পনিক/);assert.match(q.text,/চার সরল সম্ভাবনা/);assert.ok(q.text.includes(`| গলনাঙ্ক(°C) | ${x.mp} |`));
  const svg=fs.readFileSync(`public/question-bank/ssc-chemistry-ch5-v1/property-${String(n).padStart(2,'0')}.svg`,'utf8');assert.ok(svg.includes(`Melting point = ${x.mp} deg C (exercise value)`));assert.match(svg,/not a unique proof/);
  [x.solid,x.molten,x.soluble,x.soluble?x.solution:null].forEach((v,i)=>assert.ok(svg.includes(`y="${140+65*i}">${v===null?'not available':v?'yes':'no'}</text>`)));
 }
});
test('scientific caveats, diagram-identified sodium/magnesium, safety and honest original provenance retained',()=>{
 const ans=p=>{const q=rows.find(q=>q.text.startsWith(p));assert.ok(q,p);return q.options[q.correct];};
 for(const [q,a]of [['অষ্টক নিয়মের বক্তব্য','অনেক প্রধান-গ্রুপ পরমাণু বন্ধনে বহিঃস্তরে 8 গণনাযোগ্য ইলেকট্রন পায়'],['H2-এ প্রতিটি H','দ্বিত্ব বা duet'],['BF3-এর','6'],['বিচ্ছিন্ন গ্যাসীয় BeCl2','4'],['সব আয়নিক যৌগ','না, দ্রাব্যতা ভিন্ন ওকিছু অদ্রবণীয়/স্বল্প দ্রবণীয়'],['HCl সমযোজী','পানির সঙ্গে বিক্রিয়ায় H3O+ ও Cl− হয়'],['ধাতুর কঠিন অবস্থায়','সঞ্চরণশীল ইলেকট্রন']])assert.equal(ans(q),a);
 assert.match(rows.find(q=>q.type==='CQ'&&q.text.startsWith('চিত্রের A,B,D')).parts[2].solution,/B=Na,Z11/);assert.match(rows.find(q=>q.type==='CQ'&&q.text.startsWith('চিত্রের X,Y')).parts[2].solution,/X=O,Y=Mg/);
 assert.equal(validation.sourceQuestionVerbatim,false);assert.equal(validation.officialYearVerified,false);assert.equal(validation.inspectedPrintedPages,'82–108');assert.ok(validation.limitations.some(s=>s.includes('বোর্ড/সাল')));assert.ok(validation.limitations.some(s=>s.includes('মেইনসবিদ্যুৎ')));
 assert.equal(validation.items.filter(m=>m.family.startsWith('concept-mcq')).length,60);assert.equal(validation.items.filter(m=>m.family.startsWith('concept-cq')).length,32);assert.equal(validation.items.filter(m=>m.family.startsWith('concept-sq')).length,20);
});
