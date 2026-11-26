// Historical Chemistry preservation scope excludes later Class 7 BGS additions;
// current Class 7 shipping completeness is checked separately.
// Historical non-Biology registry scope; full current totals are checked in prepared-library.test.cjs.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),Module=require('node:module'),{createHash}=require('node:crypto'),{execFileSync}=require('node:child_process');
function load(file,mocks={}){const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.React}}).outputText,file);return m.exports;}
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),root='content/question-bank/ssc/chemistry/chapter-6/';
const names=['mcq-1','mcq-2','mcq-3','mcq-4','mcq-5','cq-1','cq-2','sq'];
const rows=names.flatMap(f=>read(root+f+'.json').items),v=read(root+'validation.json');
const catalog=load('lib/nctb-data.ts'),mcq=load('lib/mcq-import.ts',{'@/lib/nctb-data':catalog}),upload=load('lib/question-json-import.ts',{'./nctb-data':catalog,'./mcq-import':mcq,'./question-provenance':load('lib/question-provenance.ts')});
const mocks={'./question-json-import':upload};for(const f of [...names,'validation'])mocks['@/'+root+f+'.json']=read(root+f+'.json');
const batches=load('lib/ssc-chemistry-ch6-batches.ts',mocks).sscChemistryChapter6Batches();
const almost=(a,b,tol=0.00011)=>assert.ok(Math.abs(Number(a)-Number(b))<=tol,`${a} != ${b}`);
const AW={H:1,C:12,N:14,O:16,Na:23,Mg:24,Al:27,P:31,S:32,Cl:35.5,K:39,Ca:40,Fe:56,Cu:63.5,Zn:65};
// Independently implemented formula parser (not imported from generator).
function atoms(formula){const stack=[{}],tokens=formula.match(/[A-Z][a-z]?|\d+|[()]/g);for(let i=0;i<tokens.length;i++){let t=tokens[i];if(t==='('){stack.push({});continue;}let obj=t===')'?stack.pop():{[t]:1};let n=1;if(/^\d+$/.test(tokens[i+1]||''))n=Number(tokens[++i]);for(const [el,a]of Object.entries(obj))stack.at(-1)[el]=(stack.at(-1)[el]||0)+a*n;}return stack[0];}
function mass(f){return Object.entries(atoms(f)).reduce((s,[e,n])=>s+AW[e]*n,0);}
function tally(origin){const c={MCQ:0,CQ:0,SQ:0};for(const m of v.items.filter(m=>m.origin===origin))c[m.kind]++;return c;}
test('800 unique scoped questions pass unchanged strict uploader as eight bounded batches',()=>{
 assert.deepEqual(batches.map(b=>b.records.length),Array(8).fill(100));assert.equal(new Set(rows.map(q=>mcq.normalizeStem(q.text))).size,800);
 assert.deepEqual(rows.reduce((n,q)=>(n[q.type]++,n),{MCQ:0,CQ:0,SQ:0}),{MCQ:500,CQ:200,SQ:100});
 for(const b of batches){assert.equal(b.topic,'৬ষ্ঠ অধ্যায়: মোলের ধারণা ও রাসায়নিক গণনা');assert.equal(b.provenance.mixedOrigin,true);assert.equal(b.provenance.teacherCertified,false);assert.equal(b.provenance.fullChapterRead,false);assert.match(b.limitations,/ভ্যারিয়েন্ট/);for(const q of b.records){assert.ok(q.options._authoring);assert.equal(q.options._authoring.answerOrigin,'ASSISTANT_AUTHORED_SOLUTION_NOT_SOURCE_ANSWER');}}
 for(const n of names)assert.ok(fs.statSync(root+n+'.json').size<750000);
 for(const q of rows.filter(q=>q.type==='CQ'))assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);
});
test('exact source/authored split; zero invented board/year attributions; no unverified candidate padding',()=>{
 assert.deepEqual(tally('TEXTBOOK_VERBATIM'),{MCQ:6,CQ:2,SQ:3});assert.deepEqual(tally('WEB_VERBATIM'),{MCQ:8,CQ:1,SQ:6});assert.deepEqual(tally('AUTHORED_BOARD_STYLE'),{MCQ:486,CQ:197,SQ:91});
 assert.equal(v.sourceQuestionCount,26);assert.equal(v.authoredQuestionCount,774);assert.equal(v.boardCandidatesStillUnverified,49);assert.equal(v.webResearchExhaustive,false);
 for(const m of v.items){assert.equal(m.board,null);assert.equal(m.examYear,null);assert.equal(m.teacherApproved,false);const q=read(root+m.file).items[m.itemIndex-1];assert.notEqual(q,undefined);assert.equal(q.type,m.kind);assert.equal(q.provenance,undefined);if(m.origin==='AUTHORED_BOARD_STYLE')assert.match(q.page,/নিজস্ব/);}
});
test('limited internet excerpts checked; exact question/choices retained and article solutions NOT copied',()=>{
 const intake=read('content/question-bank/ssc/chemistry/chapter-6-web-intake.json');assert.equal(intake.items.length,15);
 for(const key of Object.keys(intake.sources)){const texts=intake.items.filter(q=>q.source===key).flatMap(q=>[q.text,...(q.options||[]),...(q.parts||[])]).join(' ');assert.ok(texts.split(/\s+/).length<=200);}
 for(const m of v.items.filter(m=>m.origin==='WEB_VERBATIM')){const q=read(root+m.file).items[m.itemIndex-1],src=intake.items.find(x=>x.source===m.webSourceKey&&x.number===m.sourceQuestionNumber);assert.equal(q.text,src.text);if(src.type==='MCQ'){assert.deepEqual(Object.values(q.options),src.options);assert.equal(q.correct,src.sourceCorrect);}if(src.parts)assert.deepEqual(q.parts.map(p=>p.question),src.parts);}
 const c=v.items.find(m=>m.family==='web-cq');assert.match(read(root+c.file).items[c.itemIndex-1].parts[3].solution,/12.5g/);
});
test('textbook wording, shared stimuli, original figure and notes survive combined collection; historical intake is unchanged',()=>{
 const source=read('content/question-bank/ssc/chemistry/chapter-6-source-v1/questions.json');assert.equal(source.ownQuestionsCreated,0);assert.equal(source.status,'PARTIAL_VERIFIED_COLLECTION_NOT_IMPORTABLE');
 for(const m of v.items.filter(m=>m.origin==='TEXTBOOK_VERBATIM')){const s=source.items.find(x=>x.id===m.sourceRecordId),q=read(root+m.file).items[m.itemIndex-1];assert.ok(q.text.includes(s.text));if(s.options)assert.deepEqual(Object.values(q.options),Object.values(s.options));if(s.parts)assert.deepEqual(q.parts.map(p=>p.question),s.parts.map(p=>p.question));if(s.stimulusImages)for(const img of s.stimulusImages)assert.ok(q.text.includes(img));}
 assert.equal(rows.filter(q=>q.type==='MCQ'&&q.text.includes('textbook-shared-3-4')).length,2);
 assert.match(rows.find(q=>q.type==='CQ').parts[2].question,/দ্রবদ্বয়কে/);
});
test('independent arithmetic checks all 456 authored numerical MCQs',()=>{
 let count=0;
 for(const m of v.items.filter(m=>m.kind==='MCQ'&&m.inputs)){
  const i=m.inputs,q=rows[m.index-1];let expected;
  switch(m.family){
   case'mass-to-mole':expected=Number(i.massG)/mass(i.formula);break;
   case'solution-mcq':expected=i.target==='mass'?Number(i.molarity)*Number(i.volumeL)*mass(i.formula):Number(i.massG)/mass(i.formula)/Number(i.volumeL);break;
   case'formula-mass':expected=mass(i.formula);break;
   case'formula-atoms':expected=Object.values(atoms(i.formula)).reduce((a,b)=>a+b,0);break;
   case'formula-percent':expected=AW[i.element]*atoms(i.formula)[i.element]/mass(i.formula)*100;break;
   case'reaction-mass':{
    const coefficients=[[2,2],[1,2],[2,2],[1,1],[1,2],[2,2],[1,1],[1,1],[2,2],[1,1]][i.reaction];expected=Number(i.reactantMoles)*coefficients[1]/coefficients[0]*mass(i.product);break;}
   case'gas-volume':expected=Number(i.massG)/mass(i.formula)*22.4;break;
   case'limiting-mcq':expected=Math.min(...Object.keys(i.reactants).map(f=>Number(i.moles[f])/i.reactants[f]))*i.products[i.product]*mass(i.product);break;
   case'purity-yield-mcq':expected=Number(i.sampleG)*Number(i.purity)/mass(i.reactant)*i.productCoefficient/i.reactantCoefficient*mass(i.product)*Number(i.yieldFraction);break;
   case'dilution-mcq':expected=Number(i.initialM)*Number(i.initialVolumeL)/Number(i.finalVolumeL);break;
   default:assert.fail(m.family);
  }
  almost(q.options[q.correct],expected);almost(i.expected,expected);assert.equal(new Set(Object.values(q.options)).size,4);assert.equal(Object.values(q.options).filter(s=>Math.abs(Number(s)-expected)<0.000011).length,1);count++;
 }
 assert.equal(count,456);
});
test('all 197 authored CQs independently checked: molarity, limiting, empirical formula, neutralization and purity/yield',()=>{
 const gcd=(a,b)=>b?gcd(b,a%b):a;let count=0;
 for(const m of v.items.filter(m=>m.kind==='CQ'&&m.inputs)){
  const i=m.inputs;
  if(m.family==='solution-cq'){almost(i.initialM,Number(i.massG)/mass(i.formula)/Number(i.volumeL));almost(i.finalM,Number(i.massG)/mass(i.formula)/Number(i.finalVolumeL));}
  else if(m.family==='neutralization-cq'){const a=Number(i.acidM)*Number(i.acidVolumeL),b=Number(i.baseM)*Number(i.baseVolumeL);almost(i.saltMassG,Math.min(a,b)*58.5);almost(i.excessMolarity,Math.abs(a-b)/(Number(i.acidVolumeL)+Number(i.baseVolumeL)));assert.equal(i.nature,a>b?'অম্লীয়':b>a?'ক্ষারীয়':'নিরপেক্ষ');}
  else if(m.family==='limiting-cq'){const amounts=Object.keys(i.reactants).map(f=>[f,Number(i.moles[f])/i.reactants[f]]).sort((a,b)=>a[1]-b[1]);assert.equal(i.limitingSpecies,amounts[0][0]);const extent=amounts[0][1];almost(i.productMassG,extent*i.products[i.product]*mass(i.product));almost(i.excessMassG,(Number(i.moles[i.excessSpecies])-extent*i.reactants[i.excessSpecies])*mass(i.excessSpecies));}
  else if(m.family==='empirical-cq'){assert.deepEqual(i.composition,atoms(i.formula));assert.equal(i.multiplier,Object.values(i.composition).reduce(gcd));almost(i.sampleMassG,Number(i.sampleMoles)*mass(i.formula));assert.deepEqual(atoms(i.empiricalFormula),Object.fromEntries(Object.entries(atoms(i.formula)).map(([e,n])=>[e,n/i.multiplier])));}
  else if(m.family==='purity-yield-cq'){const theory=Number(i.sampleG)*Number(i.purity)/mass(i.reactant)*i.productCoefficient/i.reactantCoefficient*mass(i.product);almost(i.theoryG,theory);almost(i.actualG,theory*Number(i.yieldFraction));almost(i.lossG,theory*(1-Number(i.yieldFraction)));}
  else assert.fail(m.family);count++;
 }
 assert.equal(count,197);
});
test('source key calculations, reaction mass balance, SI and STP assumptions have explicit scientific caveats',()=>{
 assert.equal(mass('Ca3(PO4)2'),310);assert.equal(mass('Al(NO3)3'),213);
 assert.match(rows.find(q=>q.type==='MCQ'&&q.text.startsWith('10g CaCO')).explanation,/সংকেত একক/);
 assert.match(v.limitations.join(' '),/0°C,1atm/);assert.match(v.limitations.join(' '),/6.02/);
 const equationRows=v.items.filter(m=>m.inputs?.reactants&&m.inputs?.products);
 for(const m of equationRows){const i=m.inputs;const side=d=>Object.entries(d).reduce((sum,[f,c])=>{for(const [e,n] of Object.entries(atoms(f)))sum[e]=(sum[e]||0)+n*c;return sum;},{});assert.deepEqual(side(i.reactants),side(i.products));}
});
test('43 image-bearing questions render through exact allowlist without captions or raw Markdown',()=>{
 const tables=load('lib/question-tables.ts', {"./ssc-biology-assets":load("lib/ssc-biology-assets.ts")}),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),C=load('components/MathText.tsx',{'@/lib/question-tables':tables}).default;
 let count=0;for(const q of rows.filter(q=>q.text.includes('!['))){const img=tables.questionBlocks(q.text).filter(b=>b.kind==='chemistry-image');assert.equal(img.length,1);assert.ok(fs.existsSync('public'+img[0].src));const out=renderToStaticMarkup(React.createElement(C,{text:q.text}));assert.match(out,/<img/);assert.doesNotMatch(out,/!\[|<figcaption/);count++;}assert.equal(count,43);
 for(const name of ['neutral-01.svg','neutral-40.svg']){
  const url='https://proshnobook.com/question-bank/ssc-chemistry-ch6-v1/'+name;
  assert.equal(tables.questionBlocks(`![x](${url})`)[0].kind,'chemistry-image');
  for(const bad of [url+'?x=1',url+'#x',url.replace('https:','http:'),url.replace('proshnobook.com','evil.test'),url.replace(name,'neutral-41.svg'),url.replace(name,'neutral-00.svg'),url.replace(name,'../'+name)])assert.equal(tables.questionBlocks(`![x](${bad})`)[0].kind,'text');
 }
 for(const name of Object.keys(v.assets)){const s=fs.readFileSync('public/question-bank/ssc-chemistry-ch6-v1/'+name,'utf8');assert.doesNotMatch(s,/<(?:script|foreignObject|image|iframe)|(?:href|onload|onerror)\s*=/i);}
});
test('all file hashes match, review contains800articles/43images, build and original source intake reproducible',()=>{
 for(const [f,r] of Object.entries(v.files))assert.equal(createHash('sha256').update(fs.readFileSync(root+f)).digest('hex'),r.sha256);
 for(const [f,r] of Object.entries(v.assets))assert.equal(createHash('sha256').update(fs.readFileSync('public/question-bank/ssc-chemistry-ch6-v1/'+f)).digest('hex'),r.sha256);
 const doc=fs.readFileSync('docs/question-bank/ssc-chemistry/chapter-6-review.html','utf8');assert.equal((doc.match(/<article>/g)||[]).length,800);assert.equal((doc.match(/<img /g)||[]).length,43);
 for(const m of doc.matchAll(/src="([^"]+)"/g))assert.ok(fs.existsSync(path.resolve('docs/question-bank/ssc-chemistry',m[1])));
 execFileSync('python',['scripts/question-bank/build-ssc-chemistry-ch6.py','--check']);execFileSync('python',['scripts/question-bank/collect-ssc-chemistry-ch6-source.py','--check']);
});
test('strict scope and malformed options/marks remain rejected; adapter has no DB side effects',()=>{
 const b=read(root+'mcq-1.json'),s={category:b.category,subject:b.subject,topic:b.topic,group:''};assert.throws(()=>upload.parseQuestionUpload(JSON.stringify(b),{...s,subject:'পদার্থবিজ্ঞান'}));b.items[0].options.B=b.items[0].options.A;assert.throws(()=>upload.parseQuestionUpload(JSON.stringify(b),s));const c=read(root+'cq-1.json');c.items[0].parts[0].marks=4;assert.throws(()=>upload.parseQuestionUpload(JSON.stringify(c),s));assert.doesNotMatch(fs.readFileSync('lib/ssc-chemistry-ch6-batches.ts','utf8'),/from ["'].*(?:db|guard|prisma)/);
 assert.equal(v.websiteImported,false);assert.equal(v.published,false);assert.equal(v.teacherApproved,false);
});
test('public origin metadata cannot disclose answer keys or computed audit answers',()=>{
 for(const b of batches)for(const q of b.records){assert.deepEqual(Object.keys(q.options._authoring).sort(),['answerOrigin','family','origin','reference','sourceQuestionVerbatim']);assert.equal(q.options._authoring.inputs,undefined);assert.equal(q.options._authoring.sourceCorrect,undefined);assert.equal(q.options._authoring.expected,undefined);}
});
test('real registry adds only800 chapter6 records, preserves22256 earlier records and Chemistry Auto Model remains blocked',()=>{
 const resolve=Module._resolveFilename,previous=require.extensions['.ts'];try{
  Module._resolveFilename=function(id,parent,...rest){return resolve.call(this,id.startsWith('@/')?path.resolve(id.slice(2)):id,parent,...rest);};
  require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
  const all=require('../lib/prepared-question-batches.ts').preparedBatches().filter(b=>!b.id.startsWith('ssc-biology-')&&!b.id.startsWith('class7-bgs-')),own=all.filter(b=>b.id.startsWith('ssc-chemistry-ch6-'));assert.equal(all.length,274);assert.equal(own.length,8);assert.equal(own.reduce((n,b)=>n+b.records.length,0),800);assert.equal(all.filter(b=>!b.id.startsWith('ssc-chemistry-ch11-')&&!b.id.startsWith('ssc-chemistry-ch12-')&&!b.id.startsWith('ssc-chemistry-ch10-')&&!b.id.startsWith('ssc-chemistry-ch9-')&&!b.id.startsWith('ssc-chemistry-ch8-')&&!b.id.startsWith('ssc-chemistry-ch7-')&&!b.id.startsWith('ssc-chemistry-ch6-')).reduce((n,b)=>n+b.records.length,0),22256);
 }finally{Module._resolveFilename=resolve;if(previous)require.extensions['.ts']=previous;else delete require.extensions['.ts'];}
 const policy=load('lib/subject-model-policy.ts',{'./nctb-data':catalog});for(const category of ['SSC','Class 9','Class 10'])assert.equal(policy.subjectModelPolicy(category,'রসায়ন')?.id,'ssc-chemistry-owner-chapter-policy-v1');
});
test('new draft preview is read-only, save needs explicit ADMIN consent and only inserts Pending (mockDB)',async()=>{
 const digest=b=>createHash('sha256').update(JSON.stringify(b)).digest('hex'),questions=[],settings=new Map();let role='ADMIN',calls=0;
 const registry={getPreparedBatch(id){const batch=batches.find(b=>b.id===id);if(!batch)throw Error('unknown');return{batch,digest:digest(batch)};},preparedQuestionId(b,q){return'prepared_'+createHash('sha256').update(JSON.stringify([b.category,b.subject,b.topic,q.kind,mcq.normalizeStem(q.text)])).digest('hex');}};
 const tx={question:{findMany:async()=>questions,create:async({data})=>questions.push(data)},setting:{findUnique:async({where})=>settings.get(where.key),create:async({data})=>settings.set(data.key,data),update:async({where,data})=>settings.set(where.key,{key:where.key,...data})}};
 const actions=load('app/admin/questions/import/prepared-actions.ts',{'@prisma/client':{},'@/lib/guard':{staff:async()=>{if(role!=='ADMIN')throw Error('denied');return{id:'owner'};}},'@/lib/db':{db:{$transaction:async fn=>{calls++;return fn(tx);}}},'@/lib/mcq-import':mcq,'@/lib/prepared-question-batches':registry,'next/cache':{revalidatePath(){}}});
 for(const b of batches){const f=new FormData();f.set('id',b.id);const before=calls;assert.equal((await actions.previewPrepared({},f)).preview.length,100);assert.equal(calls,before);assert.ok((await actions.savePrepared({},f)).error);f.set('digest',digest(b));f.set('reviewed','yes');role='TEACHER';assert.ok((await actions.savePrepared({},f)).error);role='ADMIN';assert.equal((await actions.savePrepared({},f)).counts.inserted,100);assert.equal((await actions.savePrepared({},f)).counts.inserted,0);}
 assert.equal(questions.length,800);assert.ok(questions.every(q=>q.approved===false&&q.options._authoring));assert.equal(settings.size,8);
});
