const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const {createHash}=require('node:crypto'),{execFileSync}=require('node:child_process'),{JSDOM}=require('jsdom');
function load(file,mocks={}){const m=new Module(path.resolve(file),module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,path.resolve(file));return m.exports;}
const catalog=load('lib/nctb-data.ts'),mcq=load('lib/mcq-import.ts',{'@/lib/nctb-data':catalog});
const {parseQuestionUpload}=load('lib/question-json-import.ts',{'./nctb-data':catalog,'./mcq-import':mcq,'./question-provenance':load('lib/question-provenance.ts')});
const root='content/question-bank/ssc/biology/chapter-13',docs='docs/question-bank/ssc-biology';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),sha=b=>createHash('sha256').update(b).digest('hex');
const bank=kind=>read(`${root}/rebuild-${kind}.json`).items,evidence=()=>read(`${docs}/chapter-13-completion-review.json`);
test('chapter13 has200MCQ/50CQ/70SQ through actual uploader with exact original answers',()=>{
 const ledger=read(`${root}/source-ledger.json`).entries;
 for(const [kind,n,width,suffixes] of [['mcq',200,8,['mcq-a','mcq-b','mcq-c','mcq-d']],['cq',50,11,['cq-a','cq-b']],['sq',70,4,['sq']]]){
  const batch=read(`${root}/rebuild-${kind}.json`),qs=batch.items,parsed=parseQuestionUpload(JSON.stringify(batch),{category:'Class 9',subject:'জীববিজ্ঞান',group:'',topic:batch.topic});assert.equal(parsed.records.length,n);assert.equal(qs.length,n);let count=0;
  for(const suffix of suffixes){const name=`scripts/question-bank/biology/chapter-13-${suffix}.txt`;fs.readFileSync(name,'utf8').split('\n').forEach((line,i)=>{
   if(!line||line.startsWith('#'))return;count++;const r=line.split('|');assert.equal(r.length,width);assert.equal(r[0],'13');const q=qs.find(q=>q.text===r[1]);assert.ok(q,r[1]);
   if(kind==='mcq'){assert.equal(q.options[q.correct],r[2]);assert.equal(q.explanation,r[6]);assert.deepEqual(Object.values(q.options).sort(),r.slice(2,6).sort());}
   else if(kind==='sq')assert.equal(q.explanation,r[2]);
   else{assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);assert.deepEqual(q.parts.map(p=>p.label),['ক','খ','গ','ঘ']);q.parts.forEach((p,j)=>{assert.equal(p.question,r[2+2*j]);assert.equal(p.solution,r[3+2*j]);});}
   const e=ledger.find(e=>e.authoringRefs.includes(`${name}:${i+1}`));assert.ok(e);assert.equal(e.generatedFromConceptCards,false);assert.equal(e.origin,'original_practice');
  });}assert.equal(count,n);
 }
});
test('chapter13 reader paginates320 unique records and embeds four safe relevant diagrams',()=>{
 const dom=new JSDOM(fs.readFileSync(`${docs}/chapter-13.html`,'utf8'),{runScripts:'dangerously'}),w=dom.window,d=w.document,$=id=>d.getElementById(id),records=JSON.parse($('bank').textContent),seen=new Set();
 assert.equal(records.length,320);assert.ok(records.every(r=>r.chapter===13));assert.equal(records.filter(r=>r.figure).length,4);
 while(true){for(const e of d.querySelectorAll('article .meta'))if(e.textContent.startsWith('bio-'))seen.add(e.textContent.split(' · ')[0]);if($('next').disabled)break;$('next').click();}
 assert.equal(seen.size,320);assert.equal($('page').textContent,'16 / 16');$('kind').value='CQ';$('kind').dispatchEvent(new w.Event('change'));assert.ok(d.querySelector('img'));$('toggle').click();assert.ok([...d.querySelectorAll('details')].every(e=>e.open));
 for(const r of records.filter(r=>r.figure)){const b=fs.readFileSync(r.evidence.figure.path);assert.equal(sha(b),r.evidence.figure.sha256);assert.ok(Buffer.from(r.figure.dataUri.split(',')[1],'base64').equals(b));assert.match(r.item.text,/লিখিত সমতুল্য/);assert.doesNotMatch(b.toString(),/<script|foreignObject|href=|onload=/i);}
 assert.equal(d.querySelectorAll('script[src],iframe,link[href]').length,0);dom.window.close();
});
test('chapter13 leaves all126 prior chapter artifacts and individual readers byte-identical',()=>{
 const v=evidence();assert.equal(v.preservedEarlierFileCount,126);assert.equal(v.baseline,'531e80909624e599a9bb9edf2ca212920790857c');
 for(const [name,hash] of Object.entries(v.preservedEarlierFileHashes)){const b=fs.readFileSync(name);assert.equal(sha(b),hash,name);assert.ok(execFileSync('git',['show',`${v.baseline}:${name}`]).equals(b),name);}
});
test('chapter13 energy arithmetic and nutrient distinctions remain qualified',()=>{
 const qs=bank('mcq'),answer=s=>{const q=qs.find(q=>q.text.includes(s));assert.ok(q,s);return q.options[q.correct];};
 for(const [s,a] of [['উৎপাদকে 10000','1000 kJ'],['ঘাসে 20000','200 kJ'],['শৈবালে 50000','50 kJ'],['প্রাথমিক খাদকে 800','8000 kJ'],['1000 kJ থেকে','15%']])assert.equal(answer(s),a);
 const sq=bank('sq'),solution=s=>{const q=sq.find(q=>q.text.includes(s));assert.ok(q,s);return q.explanation;};
 assert.match(solution('40000'),/400 kJ/);assert.match(solution('30 kJ'),/30000 kJ/);assert.match(solution('2500'),/12%/);
 assert.match(solution('10% নিয়ম'),/আনুমানিক/);assert.match(solution('একই অর্থে চক্রায়িত'),/তাপে/);assert.match(solution('N2-সমৃদ্ধ'),/সরাসরি/);
 assert.match(solution('কেঁচো ও বিয়োজক'),/ডেট্রিটিভোর/);assert.match(solution('পুষ্টিস্তরে রাখা'),/নির্ভর/);
});
test('chapter13 conservation and fieldwork do not promise certainty or authorize unsafe experiments',()=>{
 const text=JSON.stringify(bank('sq'));
 for(const phrase of ['জৈব সঞ্চয়ন','জৈব বিবর্ধন','অ-ক্ষতিকর','স্বাদ নিয়ে পরীক্ষা নয়','স্থানীয় বৈজ্ঞানিক বিধি','জিনগত','সমতুল্য'])assert.ok(text.includes(phrase),phrase);
 const cq=bank('cq'),q=cq.find(q=>q.text.includes('0.02'));assert.ok(q);assert.match(q.parts[2].solution,/500 গুণ/);assert.match(q.parts[3].solution,/সব রাসায়নিক/);
 const direct=cq.find(q=>q.text.includes('দূষক বাড়ছে'));assert.match(direct.parts[3].solution,/অনিরাপদ ও অনৈতিক/);
 const source=fs.readFileSync(`${root}/assets/nitrogen-pathways.svg`,'utf8');assert.match(source,/not direct/);assert.match(fs.readFileSync(`${root}/assets/energy-pyramid.svg`,'utf8'),/not a universal/);
});
test('chapter13 review remains author evidence and retains honest release gates',()=>{
 const v=evidence(),c=read(`${root}/draft-validation.json`),p=read(`${docs}/progress.json`);
 assert.equal(p.draftItems,4480);assert.equal(v.total,320);assert.equal(v.remainingTargetItems,320);assert.deepEqual(v.mcqKeys,{A:50,B:50,C:50,D:50});assert.equal(v.lexicalScreen.candidatePairs,0);assert.equal(v.lexicalScreen.exactUniqueStems,320);assert.equal(v.lexicalScreen.semanticCertification,false);
 for(const flag of ['teacherCertified','independentContentReview','nearDuplicateReviewComplete','textbookChapterRead','websiteImported','approved','published']){assert.equal(v[flag],false);assert.equal(c[flag],false);}
 assert.equal(v.diagrams.count,4);assert.equal(v.diagrams.productionIntegration,false);assert.equal(v.incrementalBackup.independentRemoteGetVerified,true);assert.equal(v.incrementalBackup.bytes,55040);assert.equal(v.technicalValidation.fullAppBuildClaimed,false);
});
test('chapter13 builder and drawings are deterministic without touching earlier chapters',()=>{
 execFileSync('python3',['scripts/question-bank/biology/draw-chapter-13-figures.py']);execFileSync('python3',['scripts/question-bank/build-ssc-biology-drafts.py','--check']);
});
