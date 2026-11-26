// Historical Chemistry preservation scope excludes later Class 7 BGS additions;
// current Class 7 shipping completeness is checked separately.
// Historical non-Biology registry scope; full current totals are checked in prepared-library.test.cjs.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),Module=require('node:module'),{createHash}=require('node:crypto'),{execFileSync}=require('node:child_process');
function load(file,mocks={}){const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.React}}).outputText,file);return m.exports;}
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),root='content/question-bank/ssc/chemistry/chapter-4/';
const catalog=load('lib/nctb-data.ts'),mcq=load('lib/mcq-import.ts',{'@/lib/nctb-data':catalog});
const upload=load('lib/question-json-import.ts',{'./nctb-data':catalog,'./mcq-import':mcq,'./question-provenance':load('lib/question-provenance.ts')});
const files=['mcq-1','mcq-2','mcq-3','mcq-4','mcq-5','cq','sq'],mocks={'./question-json-import':upload};
for(const file of files)mocks['@/'+root+file+'.json']=read(root+file+'.json');
const adapter=load('lib/ssc-chemistry-ch4-batches.ts',mocks),tables=load('lib/question-tables.ts', {"./ssc-biology-assets":load("lib/ssc-biology-assets.ts")}),batches=adapter.sscChemistryChapter4Batches();
const rows=files.flatMap(f=>read(root+f+'.json').items),validation=read(root+'validation.json');
test('550MCQ/150CQ/100SQ pass strict uploader; seven bounded slices and balanced keys',()=>{
 assert.deepEqual(batches.map(b=>b.records.length),[110,110,110,110,110,150,100]);assert.equal(new Set(rows.map(q=>mcq.normalizeStem(q.text))).size,800);
 assert.deepEqual(rows.reduce((n,q)=>(n[q.type]++,n),{MCQ:0,CQ:0,SQ:0}),{MCQ:550,CQ:150,SQ:100});assert.deepEqual(rows.filter(q=>q.type==='MCQ').reduce((n,q)=>(n[q.correct]++,n),{A:0,B:0,C:0,D:0}),{A:138,B:138,C:137,D:137});
 for(const b of batches){assert.equal(b.category,'Class 9');assert.equal(b.subject,'রসায়ন');assert.equal(b.topic,'৪র্থ অধ্যায়: পর্যায় সারণি');assert.equal(b.provenance.teacherCertified,false);assert.equal(b.provenance.officialYearVerified,false);assert.match(b.limitations,/ভ্যারিয়েন্ট/);}
 for(const q of rows.filter(q=>q.type==='CQ'))assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);
 for(const q of rows){assert.equal(q.provenance,undefined);assert.match(q.page,/নিজস্ব অনুশীলনী, বোর্ড প্রশ্ন নয়/);}
});
test('scope spoof, duplicate options, bad CQ marks fail closed',()=>{
 const b=read(root+'cq.json'),s={category:b.category,subject:b.subject,topic:b.topic,group:''};for(const bad of [{...s,subject:'পদার্থবিজ্ঞান'},{...s,topic:'৩য় অধ্যায়: পদার্থের গঠন'}])assert.throws(()=>upload.parseQuestionUpload(JSON.stringify(b),bad));b.items[0].parts[1].marks=4;assert.throws(()=>upload.parseQuestionUpload(JSON.stringify(b),s));
 const m=read(root+'mcq-1.json');m.items[0].options.B=m.items[0].options.A;assert.throws(()=>upload.parseQuestionUpload(JSON.stringify(m),s));
});
test('712 image records preserve all 7 source figures and 100 self-contained SVG models',()=>{
 const used=new Set();let images=0,tablesCount=0;
 for(const q of rows){const blocks=tables.questionBlocks(q.text),imgs=blocks.filter(b=>b.kind==='chemistry-image');tablesCount+=blocks.filter(b=>b.kind==='table').length;
  if(q.text.includes('![')){images++;assert.equal(imgs.length,1);assert.ok(!blocks.filter(b=>b.kind==='text').some(b=>b.text.includes('![')));assert.ok(imgs[0].src.startsWith('/question-bank/ssc-chemistry-ch4-v1/'));assert.ok(fs.existsSync('public'+imgs[0].src));used.add(path.basename(imgs[0].src));}}
 assert.equal(images,712);assert.equal(used.size,107);assert.equal([...used].filter(f=>f.endsWith('.png')).length,7);assert.equal([...used].filter(f=>f.endsWith('.svg')).length,100);assert.equal(tablesCount,180);
});
test('exact file/range/origin allowlist and SVG safety',()=>{
 for(const name of ['position-01.svg','position-30.svg','trend-30.svg','energy-20.svg','inverse-20.svg','carbonate-apparatus.png','exercise-grid.png']){
  const safe='https://proshnobook.com/question-bank/ssc-chemistry-ch4-v1/'+name;assert.equal(tables.questionBlocks(`![x](${safe})`)[0].kind,'chemistry-image');
  for(const url of [safe.replace('proshnobook.com','evil.test'),safe.replace('https:','http:'),safe+'?x=1',safe+'#x',safe.replace(name,'../'+name),safe.replace(name,'arbitrary.svg'),safe.replace(name,'position-31.svg'),safe.replace(name,'energy-21.svg'),safe.replace(name,'inverse-00.svg'),safe.replace(name,'trend-1.svg'),safe.replace(name,'ionization.svg')])assert.equal(tables.questionBlocks(`![x](${url})`)[0].kind,'text');
  assert.equal(tables.questionBlocks(`<img src="${safe}" onerror="x">`)[0].kind,'text');
 }
 for(const f of Object.keys(validation.assets).filter(f=>f.endsWith('.svg'))){const s=fs.readFileSync('public/question-bank/ssc-chemistry-ch4-v1/'+f,'utf8');assert.doesNotMatch(s,/<(?:script|foreignObject|image|iframe)|(?:href|onload|onerror)\s*=/i);assert.match(s,/viewBox="0 0 720 420"/);}
});
test('real React MathText SSR renders all image/table records without raw Markdown/new captions',()=>{
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),C=load('components/MathText.tsx',{'@/lib/question-tables':tables}).default;
 for(const q of rows.filter(q=>q.text.includes('!['))){const out=renderToStaticMarkup(React.createElement(C,{text:q.text}));assert.match(out,/<img/);assert.match(out,/src="\/question-bank\/ssc-chemistry-ch4-v1\//);assert.doesNotMatch(out,/!\[|<figcaption/);if(q.text.includes('| --- |'))assert.match(out,/<table/);}
});
function row(family,n){const m=validation.items.find(m=>m.family===family&&m.variant===n);assert.ok(m,`${family}/${n}`);return rows[m.index-1];}
function answer(family,n){const q=row(family,n);return q.options[q.correct];}
const symbols='H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn'.split(' '),groups=[1,18,1,2,13,14,15,16,17,18,1,2,13,14,15,16,17,18,1,2,3,4,5,6,7,8,9,10,11,12];
const mateGroups={Li:1,Ne:18,Na:1,Mg:2,Al:13,Si:14,P:15,S:16,Cl:17,Ar:18,K:1,Ca:2,B:13,C:14,N:15,O:16,F:17,Y:3,Zr:4,Nb:5,Mo:6,Tc:7,Ru:8,Rh:9,Pd:10,Ag:11,Cd:12};
function configuration(z){
 const orbitalOrder=[['1s',2],['2s',2],['2p',6],['3s',2],['3p',6],['4s',2],['3d',10]],sub={};let left=z;for(const [o,c] of orbitalOrder){const k=Math.min(c,left);if(k)sub[o]=k;left-=k;}if(z===24||z===29){sub['4s']--;sub['3d']++;}
 const shells={};for(const [o,k] of Object.entries(sub))shells[o[0]]=(shells[o[0]]||0)+k;return {shells,sub};
}
test('180 position MCQ keys independently compare orbital filling with explicit group lookup; written solutions/30 SVGs checked',()=>{
 for(let z=1;z<=30;z++){
  const {shells,sub}=configuration(z),p=Math.max(...Object.keys(shells).map(Number)),outer=shells[p],block=(z===2||[1,3,4,11,12,19,20].includes(z))?'s':z>20?'d':'p';
  const expected=[p,groups[z-1],outer,shells[3]||0,block];expected.forEach((a,i)=>assert.equal(answer(`position-probe-${i+1}`,z),String(a)));
  assert.equal(mateGroups[answer('position-probe-6',z)],groups[z-1]);
  assert.ok(row('position-cq',z).parts[2].solution.includes(`পর্যায় ${p}; ব্লক ${block}, গ্রুপ ${groups[z-1]}`));assert.ok(row('position-sq',z).explanation.includes(`গ্রুপ ${groups[z-1]}`));
  const s=fs.readFileSync(`public/question-bank/ssc-chemistry-ch4-v1/position-${String(z).padStart(2,'0')}.svg`,'utf8');assert.ok(s.includes(`${symbols[z-1]}    Z = ${z}`));assert.ok(s.includes(`Shell occupation: ${Object.values(shells).join(',')}`));
 }
});
// Independent representative covalent radii (pm) and Pauling EN comparisons:
// these constants validate direction only; they are not published as exam data.
const physical={Li:[128,.98],Be:[96,1.57],B:[84,2.04],C:[76,2.55],N:[71,3.04],O:[66,3.44],F:[57,3.98],Na:[166,.93],Mg:[141,1.31],Al:[121,1.61],Si:[111,1.90],P:[107,2.19],S:[105,2.58],Cl:[102,3.16],K:[203,.82],Ca:[176,1.00],Br:[120,2.96],Ga:[122,1.81],Ge:[120,2.01]};
test('all 180 selected main-group comparison keys checked against independent radius/EN values; no automatic IE/EA inference',()=>{
 for(let n=1;n<=30;n++){
  const m=validation.items.find(m=>m.family==='trend-probe-1'&&m.variant===n),{left:a,right:b,horizontal}=m.modelInputs,large=physical[a][0]>physical[b][0]?a:b,en=physical[a][1]>physical[b][1]?a:b;
  [large,en,large,en,horizontal?'না':'হ্যাঁ',horizontal?'হ্যাঁ':'না'].forEach((ans,i)=>assert.equal(answer(`trend-probe-${i+1}`,n),ans));
  assert.ok(row('trend-cq',n).parts[2].solution.includes(`আকারে ${large} বড়; Pauling তড়িৎঋণাত্মকতায় ${en} বেশি`));assert.match(row('trend-cq',n).parts[3].solution,/Mg\/Al,N\/O/);assert.ok(row('trend-sq',n).explanation.includes(`আকারে ${large} বড়`));
  const svg=fs.readFileSync(`public/question-bank/ssc-chemistry-ch4-v1/trend-${String(n).padStart(2,'0')}.svg`,'utf8');for(const symbol of [a,b]){const z=symbols.includes(symbol)?symbols.indexOf(symbol)+1:{Ga:31,Ge:32,Br:35}[symbol],period=z<=2?1:z<=10?2:z<=18?3:4,group=z<=30?groups[z-1]:{Ga:13,Ge:14,Br:17}[symbol];assert.ok(svg.includes(`${symbol} (Z=${z})`));assert.ok(svg.includes(`Period ${period}`));assert.ok(svg.includes(`Group ${group}`));}

 }
});
test('120 successive-IE keys, all20CQ/SQ and80 SVG bars independently calculated with declared model limits',()=>{
 for(let n=1;n<=20;n++){
  const v=(n-1)%3+1,b=200+7*n,ie=Array.from({length:4},(_,i)=>b*(i+1)+(i>=v?5000:0)),diff=ie.slice(1).map((x,i)=>x-ie[i]),g=[1,2,13][v-1];
  [ie[0],ie[1],Math.max(...diff),v,g,`+${v}`].forEach((a,i)=>assert.equal(answer(`energy-probe-${i+1}`,n),String(a)));
  assert.ok(row('energy-cq',n).parts[2].solution.includes(`I${v}→I${v+1}`));assert.ok(row('energy-cq',n).parts[3].solution.includes(`গ্রুপ ${g}`));assert.ok(row('energy-sq',n).explanation.includes(`গ্রুপ ${g}`));assert.match(row('energy-cq',n).text,/কাল্পনিক মান/);assert.ok(row('energy-cq',n).text.includes('| kJ/mol | '+ie.join(' | ')+' |'));
  const s=fs.readFileSync(`public/question-bank/ssc-chemistry-ch4-v1/energy-${String(n).padStart(2,'0')}.svg`,'utf8'),bars=[...s.matchAll(/<rect x="\d+" y="([\d.]+)" width="80" height="([\d.]+)"/g)];assert.equal(bars.length,4);bars.forEach((r,i)=>{assert.ok(Math.abs(+r[1]+ +r[2]-330)<.02);assert.ok(Math.abs(+r[2]-210*ie[i]/Math.max(...ie))<.01);assert.ok(s.includes(`>${ie[i]}</text>`));});
 }
});
test('20 inverse-location CQ and20 hypothetical cumulative-carbonate calculations checked independently',()=>{
 for(let n=1;n<=20;n++){
  const z=n+2,{shells}=configuration(z),p=Math.max(...Object.keys(shells).map(Number)),g=groups[z-1],c=row('inverse-cq',n);assert.ok(c.text.includes(`পর্যায় ${p}, গ্রুপ ${g}`));assert.ok(c.parts[2].solution.includes(`X=${symbols[z-1]}; Z=${z}; খোলকবিন্যাস ${Object.values(shells).join(',')}`));
  const inv=fs.readFileSync(`public/question-bank/ssc-chemistry-ch4-v1/inverse-${String(n).padStart(2,'0')}.svg`,'utf8');assert.ok(inv.includes(`Period = ${p}; Group = ${g}`));
  const data=row('carbonate-cq',n),mg=4+n,ca=5+2*n;assert.ok(data.text.includes(`| MgCO3+লঘু HCl | ${mg} | ${3*mg} |`));assert.ok(data.text.includes(`| CaCO3+লঘু HCl | ${ca} | ${2*ca} |`));assert.ok(data.parts[2].solution.includes(`=${2*mg}mL;`));assert.ok(data.parts[2].solution.includes(`=${ca}mL।`));assert.match(data.text,/কাল্পনিক সঞ্চিত আয়তন/);assert.match(data.parts[3].solution,/ঘনমাত্রা\/পৃষ্ঠতল/);
 }
});
test('standalone answer review preserves 800 articles,712 images and180 real HTML tables with valid local assets',()=>{
 const doc=fs.readFileSync('docs/question-bank/ssc-chemistry/chapter-4-review.html','utf8');assert.equal((doc.match(/<article>/g)||[]).length,800);assert.equal((doc.match(/<img /g)||[]).length,712);assert.equal((doc.match(/<table>/g)||[]).length,180);assert.doesNotMatch(doc,/\| --- \|/);
 for(const m of doc.matchAll(/<img[^>]+src="([^"]+)"/g))assert.ok(fs.existsSync(path.resolve('docs/question-bank/ssc-chemistry',m[1])));
});
test('scientific exceptions and source-attribution boundary are explicit, not invented board tags',()=>{
 const q=p=>rows.find(q=>q.text.startsWith(p)),ans=p=>{const x=q(p);return x.options[x.correct];};
 assert.equal(ans('He-এর সঠিক গ্রুপ'),'18');assert.equal(ans('Cr-এর গ্রুপ'),'গ্রুপ 6, পর্যায় 4');assert.equal(ans('Cu-এর গ্রুপ'),'11');assert.equal(ans('প্রথম আয়নীকরণ শক্তি Mg'),'কমে, সাধারণ পর্যায়-প্রবণতার ব্যতিক্রম');assert.equal(ans('নির্গত শক্তির পরিমাণ হিসেবে'),'Cl');assert.equal(ans('প্রচলিত Pauling'),'F');assert.match(q('Zn কেন').explanation,/3d10/);
 assert.equal(validation.sourceQuestionVerbatim,false);assert.equal(validation.officialYearVerified,false);assert.ok(validation.limitations.some(s=>s.includes('বোর্ড/সাল')));
});
test('canonical file/row coordinates, all hashes and four chapter generators remain reproducible',()=>{
 assert.equal(validation.items.length,800);assert.equal(validation.teacherApproved,false);assert.equal(validation.websiteImported,false);assert.equal(validation.published,false);
 for(const [i,m] of validation.items.entries()){assert.equal(m.index,i+1);assert.equal(m.kind,rows[i].type);assert.equal(read(root+m.file).items[m.itemIndex-1].text,rows[i].text);}
 for(const [f,v] of Object.entries(validation.files))assert.equal(createHash('sha256').update(fs.readFileSync(root+f)).digest('hex'),v.sha256);
 for(const [f,v] of Object.entries(validation.assets))assert.equal(createHash('sha256').update(fs.readFileSync('public/question-bank/ssc-chemistry-ch4-v1/'+f)).digest('hex'),v.sha256);
 for(let c=1;c<=4;c++)execFileSync('python',[`scripts/question-bank/build-ssc-chemistry-ch${c}.py`,'--check']);
});
test('real registry preserves20656 previous records, adds800 drafts, and Chemistry Auto Model stays blocked',()=>{
 const policy=load('lib/subject-model-policy.ts',{'./nctb-data':catalog});for(const category of ['SSC','Class 9','Class 10'])assert.equal(policy.subjectModelPolicy(category,'রসায়ন')?.id,'ssc-chemistry-owner-chapter-policy-v1');assert.doesNotMatch(fs.readFileSync('lib/ssc-chemistry-ch4-batches.ts','utf8'),/from ["'].*(?:db|guard|prisma)/);
 const resolve=Module._resolveFilename,previous=require.extensions['.ts'];try{Module._resolveFilename=function(id,parent,...rest){return resolve.call(this,id.startsWith('@/')?path.resolve(id.slice(2)):id,parent,...rest);};require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
 const all=require('../lib/prepared-question-batches.ts').preparedBatches().filter(b=>!b.id.startsWith('ssc-biology-')&&!b.id.startsWith('class7-bgs-')),own=all.filter(b=>b.id.startsWith('ssc-chemistry-ch4-'));assert.equal(all.length,274);assert.equal(own.length,7);assert.equal(own.reduce((n,b)=>n+b.records.length,0),800);assert.equal(all.filter(b=>!b.id.startsWith('ssc-chemistry-ch11-')&&!b.id.startsWith('ssc-chemistry-ch12-')&&!b.id.startsWith('ssc-chemistry-ch10-')&&!b.id.startsWith('ssc-chemistry-ch9-')&&!b.id.startsWith('ssc-chemistry-ch8-')&&!b.id.startsWith('ssc-chemistry-ch7-')&&!b.id.startsWith('ssc-chemistry-ch6-')&&!b.id.startsWith('ssc-chemistry-ch4-')&&!b.id.startsWith('ssc-chemistry-ch5-')).reduce((n,b)=>n+b.records.length,0),20656);
 }finally{Module._resolveFilename=resolve;if(previous)require.extensions['.ts']=previous;else delete require.extensions['.ts'];}
});
test('read-only preview; ADMIN consent saves only Pending with replay protection (mock DB, no real writes)',async()=>{
 const digest=b=>createHash('sha256').update(JSON.stringify(b)).digest('hex'),questions=[],settings=new Map();let role='ADMIN',calls=0;
 const registry={getPreparedBatch(id){const batch=batches.find(b=>b.id===id);if(!batch)throw Error('unknown');return {batch,digest:digest(batch)};},preparedQuestionId(b,q){return 'prepared_'+createHash('sha256').update(JSON.stringify([b.category,b.subject,b.topic,q.kind,mcq.normalizeStem(q.text)])).digest('hex');}};
 const tx={question:{findMany:async()=>questions,create:async({data})=>questions.push(data)},setting:{findUnique:async({where})=>settings.get(where.key),create:async({data})=>settings.set(data.key,data),update:async({where,data})=>settings.set(where.key,{key:where.key,...data})}};
 const actions=load('app/admin/questions/import/prepared-actions.ts',{'@prisma/client':{},'@/lib/guard':{staff:async()=>{if(role!=='ADMIN')throw Error('denied');return{id:'owner'};}},'@/lib/db':{db:{$transaction:async fn=>{calls++;return fn(tx);}}},'@/lib/mcq-import':mcq,'@/lib/prepared-question-batches':registry,'next/cache':{revalidatePath(){}}});
 for(const b of batches){const f=new FormData();f.set('id',b.id);const before=calls;assert.equal((await actions.previewPrepared({},f)).preview.length,b.records.length);assert.equal(calls,before);assert.ok((await actions.savePrepared({},f)).error);f.set('digest',digest(b));f.set('reviewed','yes');role='TEACHER';assert.ok((await actions.savePrepared({},f)).error);role='ADMIN';assert.equal((await actions.savePrepared({},f)).counts.inserted,b.records.length);assert.equal((await actions.savePrepared({},f)).counts.inserted,0);}
 assert.equal(questions.length,800);assert.ok(questions.every(q=>q.approved===false&&q.subject==='রসায়ন'&&q.topic==='৪র্থ অধ্যায়: পর্যায় সারণি'));
});
