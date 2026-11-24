const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=require('typescript');
const {createHash}=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {JSDOM}=require('jsdom');
function load(file,mocks={}){
 const m=new Module(path.resolve(file),module);m.paths=module.paths;
 m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);
 m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,path.resolve(file));return m.exports;
}
const catalog=load('lib/nctb-data.ts');
const mcq=load('lib/mcq-import.ts',{'@/lib/nctb-data':catalog});
const {parseQuestionUpload}=load('lib/question-json-import.ts',{'./nctb-data':catalog,'./mcq-import':mcq,'./question-provenance':load('lib/question-provenance.ts')});
const root='content/question-bank/ssc/biology',docs='docs/question-bank/ssc-biology';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const report=read(`${docs}/progress.json`),plan=read(`${docs}/batch-plan.json`);
const manifests=report.chapters.slice(0,14).map(c=>read(`${root}/chapter-${c.chapter}/draft-validation.json`));
const batches=manifests.flatMap(m=>Object.keys(m.files).map(file=>({chapter:m.chapter,topic:m.topic,file,full:`${root}/chapter-${m.chapter}/${file}`})));
const sha=b=>createHash('sha256').update(b).digest('hex');
const inputRows=name=>fs.readFileSync(`scripts/question-bank/biology/${name}`,'utf8').split('\n').filter(l=>l&&!l.startsWith('#')).map(l=>l.split('|'));

test('all 45 extant Biology batches pass actual uploader and exact catalog; no historical counts substituted',()=>{
 assert.equal(batches.length,45);let count=0;const ids=new Set();
 for(const b of batches){
  const raw=fs.readFileSync(b.full,'utf8');assert.ok(Buffer.byteLength(raw)<=750000);
  const parsed=parseQuestionUpload(raw,{category:'Class 9',subject:'জীববিজ্ঞান',group:'',topic:b.topic});
  for(const q of parsed.records){assert.ok(!ids.has(q.id),q.id);ids.add(q.id);}
  for(const q of parsed.batch.items){assert.ok(q.explanation);assert.match(q.page,/অযাচাইকৃত/);assert.equal(q.provenance,undefined);}
  count+=parsed.records.length;
 }
 assert.equal(count,4480);assert.equal(report.draftItems,count);
});

test('all MCQ choices are normalized-distinct and rebuilt keys balanced, shuffled and repeatable',()=>{
 for(const b of batches.filter(b=>b.file.endsWith('mcq.json'))){
  const items=read(b.full).items,keys={A:0,B:0,C:0,D:0};
  for(const q of items){assert.equal(new Set(Object.values(q.options).map(mcq.normalizeStem)).size,4,q.text);assert.ok(q.options[q.correct]);keys[q.correct]++;}
  assert.ok(Math.max(...Object.values(keys))-Math.min(...Object.values(keys))<=1);
  if(b.chapter!==1)assert.notEqual(items.map(q=>q.correct).join(''),'ABCD'.repeat(8).slice(0,items.length));
 }
});

test('40 authored reasoning MCQ retain their exact choices, answers and explanations',()=>{
 const rows=inputRows('rebuild-mcq.txt');assert.equal(rows.length,40);
 for(const [n,stem,answer,b,c,d,explanation] of rows){
  const matches=read(`${root}/chapter-${n}/rebuild-mcq.json`).items.filter(q=>q.text===stem);assert.equal(matches.length,1);
  const q=matches[0];assert.equal(q.options[q.correct],answer);assert.equal(q.explanation,explanation);
  assert.deepEqual(Object.values(q.options).sort(),[answer,b,c,d].sort());
 }
});

test('only surviving/recreated chapter 2–5 concept inputs are used, without duplicating chapter-1 objectives',()=>{
 const rows=[...inputRows('concepts-01-04.txt'),...inputRows('concepts-05.txt')].filter(r=>Number(r[0])>=2);
 assert.equal(rows.length,80);
 for(const [n,term,definition,role,caseText,boundary] of rows){
  const items=read(`${root}/chapter-${n}/rebuild-mcq.json`).items;
  const q=items.find(q=>q.text===`“${definition}”—বর্ণনাটি কোন ধারণা বা গঠন নির্দেশ করে?`);
  assert.ok(q);assert.equal(q.options[q.correct],term);assert.ok(q.explanation.includes(role));
  const sq=read(`${root}/chapter-${n}/rebuild-sq.json`).items.find(q=>q.text.startsWith(caseText+'।'));
  assert.ok(sq);assert.ok(sq.explanation.includes(term));assert.ok(sq.explanation.includes(boundary));
 }
 assert.equal(fs.existsSync(`${root}/chapter-1/rebuild-mcq.json`),false);
});

test('20 authored CQ have distinct self-contained stimuli, exact solutions and supplied 1/2/3/4 marks',()=>{
 const rows=inputRows('rebuild-cq.txt');assert.equal(rows.length,20);assert.equal(new Set(rows.map(r=>r[1])).size,20);
 for(const [n,stimulus,...parts] of rows){
  const q=read(`${root}/chapter-${n}/rebuild-cq.json`).items.find(q=>q.text===stimulus);assert.ok(q);
  assert.doesNotMatch(stimulus,/নিচের চিত্র|চিত্রে প্রদর্শিত|পাঠচক্রে দুটি তথ্যকার্ড|!\[/);
  assert.deepEqual(q.parts.map(p=>p.label),['ক','খ','গ','ঘ']);
  assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);
  q.parts.forEach((p,i)=>{assert.equal(p.question,parts[2*i]);assert.equal(p.solution,parts[2*i+1]);assert.ok(p.solution.length>20);});
 }
});

test('ledger origins, authoring paths, content hashes and per-file manifests reconcile',()=>{
 let total=0;const ids=new Set();
 for(const m of manifests){
  const folder=`${root}/chapter-${m.chapter}`,ledger=read(`${folder}/source-ledger.json`).entries;
  assert.equal(ledger.length,Object.values(m.counts).reduce((a,b)=>a+b,0));
  for(const e of ledger){
   const q=read(`${folder}/${e.file}`).items[e.index-1];assert.ok(q);assert.equal(e.stemSha256,sha(q.text));
   const adapted=e.origin==='web_exercise_adaptation';
   if(adapted){assert.equal(m.chapter,1);assert.ok(['SQ-2','SQ-3'].includes(e.sourceExercise));}
   else{assert.equal(e.origin,'original_practice');assert.equal(e.sourceExercise,null);}
   assert.equal(e.teacherCertified,false);assert.equal(e.independentContentReview,false);
   assert.ok(!ids.has(e.id));ids.add(e.id);
   for(const ref of e.authoringRefs)assert.ok(fs.existsSync(ref.replace(/:\d+$/,'')),ref);
   assert.ok(e.backgroundSources.every(url=>url.startsWith('https://')));
   if(e.objective.includes('OS-digestion'))assert.ok(e.backgroundSources.includes('https://openstax.org/books/biology-2e/pages/34-3-digestive-system-processes'));
  }
  for(const [file,v] of Object.entries(m.files)){const bytes=fs.readFileSync(`${folder}/${file}`);assert.equal(bytes.length,v.bytes);assert.equal(sha(bytes),v.sha256);}
  total+=ledger.length;
 }
 assert.equal(total,4480);
});

test('14-chapter targets and three batches reflect current files, with all review/release gates open',()=>{
 assert.equal(report.chapters.length,14);assert.deepEqual(report.totals,{MCQ:2800,CQ:700,SQ:980});
 assert.deepEqual(report.remaining,{MCQ:0,CQ:0,SQ:0});assert.equal(report.targetItems,4480);
 assert.deepEqual(plan.executionOrder,[1,2,3]);assert.deepEqual(plan.batches.map(b=>b.remainingTotal),[0,0,0]);
 assert.deepEqual(plan.batches.map(b=>b.status),['COUNT_TARGET_MET_REVIEW_REQUIRED','COUNT_TARGET_MET_REVIEW_REQUIRED','COUNT_TARGET_MET_REVIEW_REQUIRED']);assert.equal(plan.publicationAuthorized,false);
 for(const c of report.chapters){
  for(const kind of ['MCQ','CQ','SQ'])assert.equal(c.remaining[kind],c.targets[kind]-c.counts[kind]);
  assert.equal(c.targetMet,true);
  for(const flag of ['teacherCertified','independentContentReview','nearDuplicateReviewComplete','approved','published','websiteImported','textbookChapterRead'])assert.equal(c[flag],false,flag);
 }
 for(const b of plan.batches){assert.equal(b.complete,false);assert.equal(b.contentReviewComplete,false);assert.equal(b.countTargetMet,true);}
});

test('uploader rejects duplicate options, wrong chapter, duplicate stems and CQ mark mutation',()=>{
 const b=read(`${root}/chapter-3/rebuild-mcq.json`),sel={category:'Class 9',subject:'জীববিজ্ঞান',group:'',topic:b.topic};
 let bad=structuredClone(b);bad.items[0].options.B=bad.items[0].options.A;assert.throws(()=>parseQuestionUpload(JSON.stringify(bad),sel));
 assert.throws(()=>parseQuestionUpload(JSON.stringify(b),{...sel,topic:'১ম অধ্যায়: জীবন পাঠ'}));
 bad=structuredClone(b);bad.items.push(bad.items[0]);assert.throws(()=>parseQuestionUpload(JSON.stringify(bad),sel));
 bad=read(`${root}/chapter-3/rebuild-cq.json`);bad.items[0].parts[3].marks=3;assert.throws(()=>parseQuestionUpload(JSON.stringify(bad),sel));
});

test('both builders reproduce all bytes offline; only explicit registry registers Biology',()=>{
 execFileSync('python3',['scripts/question-bank/build-ssc-biology-ch1.py','--check']);
 execFileSync('python3',['scripts/question-bank/build-ssc-biology-drafts.py','--check']);
 assert.match(fs.readFileSync('lib/prepared-question-batches.ts','utf8'),/sscBiologyBatches/);
 assert.doesNotMatch(fs.readFileSync('scripts/question-bank/build-ssc-biology-drafts.py','utf8'),/DATABASE_URL|import (?:requests|urllib|psycopg)|subprocess|prisma/);
});

test('offline reader embeds all 4480 drafts and filters/searches/paginates/toggles without remote dependencies',()=>{
 const dom=new JSDOM(fs.readFileSync(`${docs}/questions.html`,'utf8'),{runScripts:'dangerously'}),w=dom.window,d=w.document,$=id=>d.getElementById(id);
 const bank=JSON.parse($('bank').textContent);assert.equal(bank.length,4480);assert.equal(new Set(bank.map(q=>q.id)).size,4480);
 assert.equal(d.querySelectorAll('script[src],link[href],img,iframe').length,0);assert.equal(d.querySelectorAll('article').length,20);
 function change(id,value){$(id).value=value;$(id).dispatchEvent(new w.Event(id==='search'?'input':'change',{bubbles:true}));}
 assert.equal($('prev').disabled,true);$('next').click();assert.equal($('page').textContent,'2 / 224');
 change('chapter','4');change('kind','CQ');assert.equal(d.querySelectorAll('article').length,20);assert.equal($('next').disabled,false);
 $('toggle').click();assert.ok([...d.querySelectorAll('details')].every(x=>x.open));$('toggle').click();assert.ok([...d.querySelectorAll('details')].every(x=>!x.open));
 change('search','অস্তিত্বহীন987654');assert.equal(d.querySelectorAll('article').length,0);assert.match($('questions').textContent,/পাওয়া যায়নি/);
 change('search','');assert.equal(d.querySelectorAll('article').length,20);assert.match(d.body.textContent,/সংখ্যাগত লক্ষ্য পূরণ/);
 dom.window.close();
});

test('artifact index verifies every rebuild output, authoring input and retained starter file',()=>{
 const index=read(`${docs}/artifact-index.json`);assert.equal(index.draftItems,4480);
 for(const [file,expected] of Object.entries(index.files)){
  assert.ok(fs.existsSync(file),`missing artifact: ${file}`);const bytes=fs.readFileSync(file);
  assert.equal(bytes.length,expected.bytes,file);assert.equal(sha(bytes),expected.sha256,file);
 }
 for(const file of ['scripts/question-bank/build-ssc-biology-drafts.py','scripts/question-bank/biology/rebuild-cq.txt',`${root}/chapter-1/validation.json`,`${docs}/questions.html`,`${docs}/progress.json`,`${docs}/batch-plan.json`])assert.ok(index.files[file],file);
});

test('chapter-1 work preserves 40 authored MCQ choices and avoids concept-card generation',()=>{
 const rows=inputRows('chapter-1-mcq.txt');assert.equal(rows.length,40);
 const items=read(`${root}/chapter-1/chapter-work-mcq.json`).items;
 for(const [n,stem,answer,b,c,d,explanation] of rows){
  assert.equal(n,'1');const q=items.find(q=>q.text===stem);assert.ok(q);
  assert.equal(q.options[q.correct],answer);assert.equal(q.explanation,explanation);
  assert.deepEqual(Object.values(q.options).sort(),[answer,b,c,d].sort());
 }
 const ledger=read(`${root}/chapter-1/source-ledger.json`).entries;
 assert.ok(ledger.every(e=>e.generatedFromConceptCards===false));
 assert.equal(ledger.filter(e=>e.origin==='web_exercise_adaptation').length,2);
});

test('chapter-1 20 SQ preserve sample answers and distinguish two actual web-exercise adaptations',()=>{
 const rows=inputRows('chapter-1-sq.txt');assert.equal(rows.length,20);
 const items=read(`${root}/chapter-1/chapter-work-sq.json`).items;
 const ledger=read(`${root}/chapter-1/source-ledger.json`).entries;
 for(const [n,stem,answer,section] of rows){
  assert.equal(n,'1');const index=items.findIndex(q=>q.text===stem);assert.ok(index>=0);assert.equal(items[index].explanation,answer);
  const e=ledger.find(e=>e.file==='chapter-work-sq.json'&&e.index===index+1);
  assert.equal(e.origin,section.startsWith('exercise:')?'web_exercise_adaptation':'original_practice');
  assert.equal(e.sourceExercise,section.startsWith('exercise:')?section.split(';')[0].slice(9):null);
 }
});

test('chapter-1 10 self-contained CQ preserve individually authored parts and marks',()=>{
 const rows=inputRows('chapter-1-cq.txt');assert.equal(rows.length,10);
 const items=read(`${root}/chapter-1/chapter-work-cq.json`).items;
 for(const [n,stem,...parts] of rows){
  assert.equal(n,'1');const q=items.find(q=>q.text===stem);assert.ok(q);
  assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);
  q.parts.forEach((p,i)=>{assert.equal(p.question,parts[i*2]);assert.equal(p.solution,parts[i*2+1]);});
 }
});

test('original chapter-1 figure is packaged, hashed, embedded offline and matched to its textual equivalent',()=>{
 const html=fs.readFileSync(`${docs}/chapter-1.html`,'utf8');
 const dom=new JSDOM(html,{runScripts:'dangerously'}),w=dom.window,d=w.document,$=id=>d.getElementById(id);
 const bank=JSON.parse($('bank').textContent);assert.equal(bank.length,320);assert.ok(bank.every(q=>q.chapter===1));
 const illustrated=bank.filter(q=>q.figure);assert.equal(illustrated.length,1);
 const x=illustrated[0],e=x.evidence;assert.equal(x.item.type,'CQ');assert.match(x.item.text,/লিখিত সমতুল্য/);
 const bytes=fs.readFileSync(e.figure.path);assert.equal(sha(bytes),e.figure.sha256);
 assert.equal(e.figure.origin,'original_editorial_diagram');assert.equal(e.figure.teacherCertified,false);
 assert.ok(Buffer.from(x.figure.dataUri.split(',')[1],'base64').equals(bytes));
 assert.doesNotMatch(bytes.toString(),/<script|foreignObject|href=|onload=/i);
 for(const label of ['Order O','Family F','Family J','Genus G','Genus H','Genus I','Species X','Species Y','Species Z','Species W'])assert.ok(bytes.toString().includes(label));
 $('kind').value='CQ';$('kind').dispatchEvent(new w.Event('change',{bubbles:true}));
 assert.equal(d.querySelectorAll('article').length,20);const image=d.querySelector('img');assert.ok(image);
 assert.match(image.src,/^data:image\/svg\+xml;base64,/);assert.ok(image.alt);
 assert.ok(!d.querySelector('h2').textContent.includes('!['));dom.window.close();
});

test('single-chapter workflow meets exactly the chapter-1 count target without claiming review or publication',()=>{
 assert.equal(plan.activeChapter,14);assert.equal(plan.workflow,'ONE_CHAPTER_AT_A_TIME');
 const c=report.chapters[0];assert.deepEqual(c.counts,{MCQ:200,CQ:50,SQ:70});
 assert.deepEqual(c.remaining,{MCQ:0,CQ:0,SQ:0});assert.equal(c.targetMet,true);
 for(const other of report.chapters.slice(1,5))assert.deepEqual(other.counts,{MCQ:200,CQ:50,SQ:70});
 assert.equal(plan.publicationAuthorized,false);assert.equal(c.approved,false);assert.equal(c.published,false);
});

test('all 205 completion inputs retain their exact authored answers, choices, CQ parts and source paths',()=>{
 for(const [kind,expected,width] of [['MCQ',130,8],['CQ',35,11],['SQ',40,4]]){
  const input=`chapter-1-completion-${kind.toLowerCase()}.txt`,rows=inputRows(input);
  assert.equal(rows.length,expected);const items=read(`${root}/chapter-1/chapter-work-${kind.toLowerCase()}.json`).items;
  const ledger=read(`${root}/chapter-1/source-ledger.json`).entries;
  rows.forEach((row,i)=>{
   assert.equal(row.length,width);assert.equal(row[0],'1');
   const matches=items.filter(q=>q.text===row[1]);assert.equal(matches.length,1);const q=matches[0];
   const e=ledger.find(e=>e.stemSha256===sha(q.text));assert.equal(e.origin,'original_practice');
   assert.equal(e.generatedFromConceptCards,false);assert.ok(e.authoringRefs.some(r=>r===`scripts/question-bank/biology/${input}:${i+2}`));
   if(kind==='MCQ'){
    assert.equal(q.options[q.correct],row[2]);assert.equal(q.explanation,row[6]);
    assert.deepEqual(Object.values(q.options).sort(),row.slice(2,6).sort());
   }else if(kind==='SQ')assert.equal(q.explanation,row[2]);
   else{
    assert.doesNotMatch(q.text,/!\[|নিচের চিত্র|চিত্রে প্রদর্শিত/);
    assert.deepEqual(q.parts.map(p=>p.label),['ক','খ','গ','ঘ']);
    assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);
    q.parts.forEach((p,j)=>{assert.equal(p.question,row[2+2*j]);assert.equal(p.solution,row[3+2*j]);});
   }
  });
 }
});

test('completed chapter reader contains exactly 200 MCQ, 50 CQ and 70 SQ and exposes all answers offline',()=>{
 const dom=new JSDOM(fs.readFileSync(`${docs}/chapter-1.html`,'utf8'),{runScripts:'dangerously'}),w=dom.window,d=w.document,$=id=>d.getElementById(id);
 const bank=JSON.parse($('bank').textContent);
 assert.deepEqual(Object.fromEntries(['MCQ','CQ','SQ'].map(k=>[k,bank.filter(x=>x.item.type===k).length])),{MCQ:200,CQ:50,SQ:70});
 assert.equal(new Set(bank.map(x=>x.id)).size,320);
 for(const [kind,count] of [['MCQ',200],['CQ',50],['SQ',70]]){
  $('kind').value=kind;$('kind').dispatchEvent(new w.Event('change',{bubbles:true}));
  let seen=0;do{
   const articles=[...d.querySelectorAll('article')];seen+=articles.length;
   assert.ok(articles.every(a=>a.querySelector('details')?.textContent.trim().length>20));
   if($('next').disabled)break;$('next').click();
  }while(seen<=count);
  assert.equal(seen,count);
 }
 assert.equal(d.querySelectorAll('script[src],link[href],iframe').length,0);
 dom.window.close();
});

test('historical chapter-1 freeze remains valid outside now-authorized chapter-2, chapter-3, chapter-4 and chapter-5 expansions',()=>{
 const frozen=read(`${docs}/chapter-1-completion-review.json`).unchangedQuestionFiles;
 assert.equal(Object.keys(frozen).length,15);
 const applicable=Object.entries(frozen).filter(([file])=>!file.includes('/chapter-2/')&&!file.includes('/chapter-3/')&&!file.includes('/chapter-4/')&&!file.includes('/chapter-5/'));
 assert.equal(applicable.length,3);for(const [file,hash] of applicable)assert.equal(sha(fs.readFileSync(file)),hash,file);
});

test('chapter 2 has precisely 200/50/70 answered drafts with all review/release gates still false',()=>{
 const c=report.chapters[1];assert.deepEqual(c.counts,{MCQ:200,CQ:50,SQ:70});
 assert.deepEqual(c.remaining,{MCQ:0,CQ:0,SQ:0});assert.equal(c.targetMet,true);
 assert.equal(c.status,'COUNT_TARGET_MET_REVIEW_REQUIRED');
 for(const flag of ['approved','published','websiteImported','teacherCertified','independentContentReview','nearDuplicateReviewComplete','textbookChapterRead'])assert.equal(c[flag],false);
 assert.equal(plan.activeChapter,14);
 const ledger=read(`${root}/chapter-2/source-ledger.json`).entries;
 assert.equal(ledger.length,320);assert.equal(ledger.filter(e=>e.generatedFromConceptCards).length,40);
 assert.ok(ledger.every(e=>e.origin==='original_practice'&&e.sourceExercise===null));
});

test('chapter-2 authored 170 MCQ, 50 SQ and 45 CQ retain exact inputs, answers and provenance',()=>{
 for(const [kind,files,total,width] of [
  ['mcq',['chapter-2-mcq.txt','chapter-2-mcq-b.txt'],170,8],
  ['sq',['chapter-2-sq.txt'],50,4],['cq',['chapter-2-cq.txt','chapter-2-cq-b.txt'],45,11]]){
  const items=read(`${root}/chapter-2/rebuild-${kind}.json`).items;
  const ledger=read(`${root}/chapter-2/source-ledger.json`).entries;let count=0;
  for(const input of files)inputRows(input).forEach((row,i)=>{
   count++;assert.equal(row.length,width);assert.equal(row[0],'2');const q=items.find(q=>q.text===row[1]);assert.ok(q,row[1]);
   const e=ledger.find(e=>e.stemSha256===sha(q.text));assert.equal(e.generatedFromConceptCards,false);
   assert.ok(e.authoringRefs.includes(`scripts/question-bank/biology/${input}:${i+2}`));
   if(kind==='mcq'){
    assert.equal(q.options[q.correct],row[2]);assert.equal(q.explanation,row[6]);
    assert.deepEqual(Object.values(q.options).sort(),row.slice(2,6).sort());
   }else if(kind==='sq')assert.equal(q.explanation,row[2]);
   else{assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);
    q.parts.forEach((p,j)=>{assert.equal(p.question,row[2+2*j]);assert.equal(p.solution,row[3+2*j]);});}
  });assert.equal(count,total);
 }
});

test('chapter-2 reader paginates all 320 answers, strips figure markdown and embeds three original figures',()=>{
 const dom=new JSDOM(fs.readFileSync(`${docs}/chapter-2.html`,'utf8'),{runScripts:'dangerously'}),w=dom.window,d=w.document,$=id=>d.getElementById(id);
 const bank=JSON.parse($('bank').textContent);assert.equal(bank.length,320);assert.ok(bank.every(x=>x.chapter===2));
 assert.equal(bank.filter(x=>x.figure).length,3);
 for(const x of bank.filter(x=>x.figure)){
  assert.equal(x.item.type,'CQ');assert.match(x.item.text,/লিখিত সমতুল্য/);
  const bytes=fs.readFileSync(x.evidence.figure.path);assert.equal(sha(bytes),x.evidence.figure.sha256);
  assert.ok(Buffer.from(x.figure.dataUri.split(',')[1],'base64').equals(bytes));
  assert.doesNotMatch(bytes.toString(),/<script|foreignObject|href=|onload=/i);
  assert.equal(x.evidence.figure.origin,'original_editorial_diagram');
 }
 for(const [kind,count] of [['MCQ',200],['SQ',70],['CQ',50]]){
  $('kind').value=kind;$('kind').dispatchEvent(new w.Event('change',{bubbles:true}));
  let seen=0,figures=0;do{
   seen+=d.querySelectorAll('article').length;figures+=d.querySelectorAll('article img').length;
   for(const a of d.querySelectorAll('article')){assert.ok(a.querySelector('details').textContent.length>20);assert.ok(!a.querySelector('h2').textContent.includes('!['));}
   if($('next').disabled)break;$('next').click();
  }while(seen<=count);assert.equal(seen,count);assert.equal(figures,kind==='CQ'?3:0);
 }
 assert.equal(d.querySelectorAll('script[src],iframe,link[href]').length,0);dom.window.close();
});

test('chapter-2 historical preservation evidence remains valid outside subsequently authorized chapters 3–5',()=>{
 const review=read(`${docs}/chapter-2-completion-review.json`);
 assert.equal(review.baseline,'5a16ef5');assert.ok(Object.keys(review.unchangedFiles).length>=20);
 const preserved=Object.entries(review.unchangedFiles).filter(([file])=>!file.includes('/chapter-3/')&&!file.includes('/chapter-4/')&&!file.includes('/chapter-5/'));
 assert.equal(preserved.length,12);for(const [file,hash] of preserved)assert.equal(sha(fs.readFileSync(file)),hash,file);
});

test('chapter-2 complete bank has unique normalized stems, CQ marks and no missing figure dependency',()=>{
 const stems=new Set();let marks=0;
 for(const kind of ['mcq','cq','sq'])for(const q of read(`${root}/chapter-2/rebuild-${kind}.json`).items){
  const normalized=mcq.normalizeStem(q.text);assert.ok(!stems.has(normalized));stems.add(normalized);
  if(kind==='cq'){
   assert.deepEqual(q.parts.map(p=>p.label),['ক','খ','গ','ঘ']);marks+=q.parts.reduce((sum,p)=>sum+p.marks,0);
   if(q.text.includes('!['))assert.match(q.text,/লিখিত সমতুল্য/);
   else assert.doesNotMatch(q.text,/নিচের চিত্র|চিত্রে প্রদর্শিত/);
  }
 }assert.equal(stems.size,320);assert.equal(marks,500);
});

test('chapter 3 has precisely 200/50/70 answered drafts with all review/release gates still false',()=>{
 const c=report.chapters[2];assert.deepEqual(c.counts,{MCQ:200,CQ:50,SQ:70});
 assert.deepEqual(c.remaining,{MCQ:0,CQ:0,SQ:0});assert.equal(c.targetMet,true);
 assert.equal(c.status,'COUNT_TARGET_MET_REVIEW_REQUIRED');
 for(const flag of ['approved','published','websiteImported','teacherCertified','independentContentReview','nearDuplicateReviewComplete','textbookChapterRead'])assert.equal(c[flag],false);
 assert.equal(plan.activeChapter,14);
 const ledger=read(`${root}/chapter-3/source-ledger.json`).entries;
 assert.equal(ledger.length,320);assert.equal(ledger.filter(e=>e.generatedFromConceptCards).length,40);
 assert.ok(ledger.every(e=>e.origin==='original_practice'&&e.sourceExercise===null));
});

test('chapter-3 authored 170 MCQ, 50 SQ and 45 CQ retain exact inputs, answers and provenance',()=>{
 for(const [kind,files,total,width] of [
  ['mcq',['chapter-3-mcq.txt','chapter-3-mcq-b.txt'],170,8],
  ['sq',['chapter-3-sq.txt'],50,4],['cq',['chapter-3-cq.txt','chapter-3-cq-b.txt'],45,11]]){
  const items=read(`${root}/chapter-3/rebuild-${kind}.json`).items;
  const ledger=read(`${root}/chapter-3/source-ledger.json`).entries;let count=0;
  for(const input of files)inputRows(input).forEach((row,i)=>{
   count++;assert.equal(row.length,width);assert.equal(row[0],'3');const q=items.find(q=>q.text===row[1]);assert.ok(q,row[1]);
   const e=ledger.find(e=>e.stemSha256===sha(q.text));assert.equal(e.generatedFromConceptCards,false);
   assert.ok(e.authoringRefs.includes(`scripts/question-bank/biology/${input}:${i+2}`));
   if(kind==='mcq'){
    assert.equal(q.options[q.correct],row[2]);assert.equal(q.explanation,row[6]);
    assert.deepEqual(Object.values(q.options).sort(),row.slice(2,6).sort());
   }else if(kind==='sq')assert.equal(q.explanation,row[2]);
   else{assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);
    q.parts.forEach((p,j)=>{assert.equal(p.question,row[2+2*j]);assert.equal(p.solution,row[3+2*j]);});}
  });assert.equal(count,total);
 }
});

test('chapter-3 reader paginates all 320 answers, strips figure markdown and embeds three original figures',()=>{
 const dom=new JSDOM(fs.readFileSync(`${docs}/chapter-3.html`,'utf8'),{runScripts:'dangerously'}),w=dom.window,d=w.document,$=id=>d.getElementById(id);
 const bank=JSON.parse($('bank').textContent);assert.equal(bank.length,320);assert.ok(bank.every(x=>x.chapter===3));
 assert.equal(bank.filter(x=>x.figure).length,3);
 for(const x of bank.filter(x=>x.figure)){
  assert.equal(x.item.type,'CQ');assert.match(x.item.text,/লিখিত সমতুল্য/);
  const bytes=fs.readFileSync(x.evidence.figure.path);assert.equal(sha(bytes),x.evidence.figure.sha256);
  assert.ok(Buffer.from(x.figure.dataUri.split(',')[1],'base64').equals(bytes));
  assert.doesNotMatch(bytes.toString(),/<script|foreignObject|href=|onload=/i);
  assert.equal(x.evidence.figure.origin,'original_editorial_diagram');
 }
 for(const [kind,count] of [['MCQ',200],['SQ',70],['CQ',50]]){
  $('kind').value=kind;$('kind').dispatchEvent(new w.Event('change',{bubbles:true}));
  let seen=0,figures=0;do{
   seen+=d.querySelectorAll('article').length;figures+=d.querySelectorAll('article img').length;
   for(const a of d.querySelectorAll('article')){assert.ok(a.querySelector('details').textContent.length>20);assert.ok(!a.querySelector('h2').textContent.includes('!['));}
   if($('next').disabled)break;$('next').click();
  }while(seen<=count);assert.equal(seen,count);assert.equal(figures,kind==='CQ'?3:0);
 }
 assert.equal(d.querySelectorAll('script[src],iframe,link[href]').length,0);dom.window.close();
});


test('chapter 3 retains all 55 baseline questions including exact option order and preserves other chapter artifacts except subsequently authorized chapters 4 and 5',()=>{
 const review=read(`${docs}/chapter-3-completion-review.json`);
 assert.equal(review.baseline,'6ffa3c2');assert.ok(Object.keys(review.unchangedFiles).length>=30);
 for(const [file,hash] of Object.entries(review.unchangedFiles).filter(([file])=>!file.includes('/chapter-4/')&&!file.includes('/chapter-5/')))assert.equal(sha(fs.readFileSync(file)),hash,file);
 for(const kind of ['mcq','cq','sq']){
  const items=read(`${root}/chapter-3/rebuild-${kind}.json`).items,hashes=review.retainedBaselineItemHashes[kind];
  assert.equal(hashes.length,{mcq:30,cq:5,sq:20}[kind]);
  hashes.forEach((hash,i)=>assert.equal(sha(JSON.stringify(items[i])),hash,`${kind}:${i+1}`));
 }
});

test('chapter-3 bank maintains unique normalized stems and CQ marks with explicit figure dependencies',()=>{
 const stems=new Set();let cqMarks=0;
 for(const kind of ['mcq','cq','sq'])for(const q of read(`${root}/chapter-3/rebuild-${kind}.json`).items){
  const normalized=mcq.normalizeStem(q.text);assert.ok(!stems.has(normalized));stems.add(normalized);
  if(kind==='cq'){
   assert.deepEqual(q.parts.map(p=>p.label),['ক','খ','গ','ঘ']);cqMarks+=q.parts.reduce((s,p)=>s+p.marks,0);
   if(q.text.includes('!['))assert.match(q.text,/লিখিত সমতুল্য/);
   else assert.doesNotMatch(q.text,/নিচের চিত্র|চিত্রে প্রদর্শিত/);
  }
 }assert.equal(stems.size,320);assert.equal(cqMarks,500);
});

test('chapter-3 curated counting regressions separate chromosome, chromatid, DNA, pole and set units',()=>{
 const items=read(`${root}/chapter-3/rebuild-mcq.json`).items;
 for(const [needle,answer] of [
  ['2n=10 কোষের G1-এ','10 ও 10'],
  ['S শেষে 24 ক্রোমাটিড','12'],
  ['2n=4 কোষের অ্যানাফেজে একই অবিভক্ত কোষে','8'],
  ['অ্যানাফেজে মোট 16 অপত্য','8'],
  ['G1-এর DNA পরিমাণ 2C','2C'],
  ['G2-তে 4C DNA','2n'],
  ['2n=12 জননমাতৃকোষের প্রোফেজ-I','6'],
  ['পাঁচটি বাইভ্যালেন্ট','20'],
  ['2n=8 কোষে মিয়োসিস-I শেষে','8'],
  ['মিয়োসিস-II শেষে প্রতি নিউক্লিয়াসে 9','18'],
  ['দুটি স্বাভাবিক n=11','22'],
  ['মিয়োসিস-II-এর অ্যানাফেজে এক অবিভক্ত n=3','6']
 ]){
  const matches=items.filter(q=>q.text.includes(needle));assert.equal(matches.length,1,needle);
  const q=matches[0];assert.equal(q.options[q.correct],answer,needle);
 }
});

test('all-bank reader carries exactly forty-five embedded original diagrams with no external image dependencies',()=>{
 const dom=new JSDOM(fs.readFileSync(`${docs}/questions.html`,'utf8'),{runScripts:'dangerously'}),w=dom.window,d=w.document,$=id=>d.getElementById(id);
 const bank=JSON.parse($('bank').textContent),figures=bank.filter(q=>q.figure);
 assert.equal(figures.length,45);assert.deepEqual([1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(c=>figures.filter(q=>q.chapter===c).length),[1,3,3,3,3,3,3,3,3,5,4,4,4,3]);
 for(const x of figures){assert.match(x.figure.dataUri,/^data:image\/svg\+xml;base64,/);assert.equal(sha(fs.readFileSync(x.evidence.figure.path)),x.evidence.figure.sha256);}
 $('chapter').value='3';$('chapter').dispatchEvent(new w.Event('change',{bubbles:true}));
 $('kind').value='CQ';$('kind').dispatchEvent(new w.Event('change',{bubbles:true}));
 assert.equal(d.querySelectorAll('article').length,20);
 // Retained and individually authored CQ precede the diagram stimuli.
 $('next').click();assert.equal(d.querySelectorAll('article img').length,3);
 for(const img of d.querySelectorAll('article img')){assert.match(img.src,/^data:image\/svg\+xml;base64,/);assert.ok(img.alt.length>10);}
 $('toggle').click();assert.ok([...d.querySelectorAll('details')].every(e=>e.open));dom.window.close();
});

test('chapter 4 has precisely 200/50/70 answered drafts with all review/release gates still false',()=>{
 const c=report.chapters[3];assert.deepEqual(c.counts,{MCQ:200,CQ:50,SQ:70});
 assert.deepEqual(c.remaining,{MCQ:0,CQ:0,SQ:0});assert.equal(c.targetMet,true);
 assert.equal(c.status,'COUNT_TARGET_MET_REVIEW_REQUIRED');
 for(const flag of ['approved','published','websiteImported','teacherCertified','independentContentReview','nearDuplicateReviewComplete','textbookChapterRead'])assert.equal(c[flag],false);
 assert.equal(plan.activeChapter,14);
 const ledger=read(`${root}/chapter-4/source-ledger.json`).entries;
 assert.equal(ledger.length,320);assert.equal(ledger.filter(e=>e.generatedFromConceptCards).length,40);
 assert.ok(ledger.every(e=>e.origin==='original_practice'&&e.sourceExercise===null));
});

test('chapter-4 authored 170 MCQ, 50 SQ and 45 CQ retain exact inputs, answers and provenance',()=>{
 for(const [kind,files,total,width] of [
  ['mcq',['chapter-4-mcq.txt','chapter-4-mcq-b.txt'],170,8],
  ['sq',['chapter-4-sq.txt'],50,4],['cq',['chapter-4-cq.txt','chapter-4-cq-b.txt'],45,11]]){
  const items=read(`${root}/chapter-4/rebuild-${kind}.json`).items;
  const ledger=read(`${root}/chapter-4/source-ledger.json`).entries;let count=0;
  for(const input of files)inputRows(input).forEach((row,i)=>{
   count++;assert.equal(row.length,width);assert.equal(row[0],'4');const q=items.find(q=>q.text===row[1]);assert.ok(q,row[1]);
   const e=ledger.find(e=>e.stemSha256===sha(q.text));assert.equal(e.generatedFromConceptCards,false);
   assert.ok(e.authoringRefs.includes(`scripts/question-bank/biology/${input}:${i+2}`));
   if(kind==='mcq'){
    assert.equal(q.options[q.correct],row[2]);assert.equal(q.explanation,row[6]);
    assert.deepEqual(Object.values(q.options).sort(),row.slice(2,6).sort());
   }else if(kind==='sq')assert.equal(q.explanation,row[2]);
   else{assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);
    q.parts.forEach((p,j)=>{assert.equal(p.question,row[2+2*j]);assert.equal(p.solution,row[3+2*j]);});}
  });assert.equal(count,total);
 }
});

test('chapter-4 reader paginates all 320 answers, strips figure markdown and embeds three original figures',()=>{
 const dom=new JSDOM(fs.readFileSync(`${docs}/chapter-4.html`,'utf8'),{runScripts:'dangerously'}),w=dom.window,d=w.document,$=id=>d.getElementById(id);
 const bank=JSON.parse($('bank').textContent);assert.equal(bank.length,320);assert.ok(bank.every(x=>x.chapter===4));
 assert.equal(bank.filter(x=>x.figure).length,3);
 for(const x of bank.filter(x=>x.figure)){
  assert.equal(x.item.type,'CQ');assert.match(x.item.text,/লিখিত সমতুল্য/);
  const bytes=fs.readFileSync(x.evidence.figure.path);assert.equal(sha(bytes),x.evidence.figure.sha256);
  assert.ok(Buffer.from(x.figure.dataUri.split(',')[1],'base64').equals(bytes));
  assert.doesNotMatch(bytes.toString(),/<script|foreignObject|href=|onload=/i);
  assert.equal(x.evidence.figure.origin,'original_editorial_diagram');
 }
 for(const [kind,count] of [['MCQ',200],['SQ',70],['CQ',50]]){
  $('kind').value=kind;$('kind').dispatchEvent(new w.Event('change',{bubbles:true}));
  let seen=0,figures=0;do{
   seen+=d.querySelectorAll('article').length;figures+=d.querySelectorAll('article img').length;
   for(const a of d.querySelectorAll('article')){assert.ok(a.querySelector('details').textContent.length>20);assert.ok(!a.querySelector('h2').textContent.includes('!['));}
   if($('next').disabled)break;$('next').click();
  }while(seen<=count);assert.equal(seen,count);assert.equal(figures,kind==='CQ'?3:0);
 }
 assert.equal(d.querySelectorAll('script[src],iframe,link[href]').length,0);dom.window.close();
});



test('chapter 4 preserves all 55 baseline items, ledger entries and historical preservation outside authorized chapter 5',()=>{
 const review=read(`${docs}/chapter-4-completion-review.json`);
 assert.equal(review.baseline,'a7d8b37');assert.equal(review.baseline55LedgerEntriesRetained,true);
 assert.equal(Object.keys(review.unchangedFiles).length,38);
 for(const [file,hash] of Object.entries(review.unchangedFiles).filter(([file])=>!file.includes('/chapter-5/')))assert.equal(sha(fs.readFileSync(file)),hash,file);
 const ledger=read(`${root}/chapter-4/source-ledger.json`).entries;
 assert.equal(Object.keys(review.retainedBaselineLedgerHashes).length,55);
 for(const [id,hash] of Object.entries(review.retainedBaselineLedgerHashes))assert.equal(sha(JSON.stringify(ledger.find(e=>e.id===id))),hash);
 for(const kind of ['mcq','cq','sq']){
  const items=read(`${root}/chapter-4/rebuild-${kind}.json`).items,hashes=review.retainedBaselineItemHashes[kind];
  assert.equal(hashes.length,{mcq:30,cq:5,sq:20}[kind]);
  hashes.forEach((hash,i)=>assert.equal(sha(JSON.stringify(items[i])),hash,`${kind}:${i+1}`));
 }
});

test('chapter-4 curated regressions retain numerical units, sources and metabolic distinctions',()=>{
 const items=read(`${root}/chapter-4/rebuild-mcq.json`).items;
 for(const [needle,answer] of [
  ['ATP-তে ফসফেট','তিন'],
  ['অ্যাডেনোসিনে কোন','অ্যাডেনিন ও রাইবোজ'],
  ['ক্যালভিন চক্রের এনজাইমসমৃদ্ধ','স্ট্রোমা'],
  ['ক্লোরোফিল অণুর কেন্দ্রীয়','ম্যাগনেসিয়াম'],
  ['গ্লাইকোলাইসিসে এক গ্লুকোজ থেকে মোট','চার'],
  ['গ্লাইকোলাইসিসে দুই ATP খরচ','দুই ATP'],
  ['এক গ্লুকোজ গ্লাইকোলাইসিসে কয়টি','দুই'],
  ['প্রতি পাইরুভেটে কত CO2','এক'],
  ['অ্যাসিটাইল-CoA-র অ্যাসিটাইল অংশে','দুই'],
  ['একবার ক্রেবস চক্রে','দুই'],
  ['এক দফা ক্রেবস চক্রে NADH','তিন'],
  ['পূর্ণ গ্লুকোজ জারণে মোট CO2','ছয়'],
  ['সবাত শ্বসনে শেষ ইলেকট্রনগ্রাহক','অক্সিজেন'],
  ['2 mL থেকে 5 mL','3 mL'],
  ['মোট O2 উৎপাদ 9','6 একক ত্যাগ'],
  ['কার্বনসমতায় এক গ্লুকোজে','দুই ইথানল ও দুই CO2'],
  ['সাধারণ ল্যাকটেট গাঁজনে পাইরুভেটের','তিন কার্বন ল্যাকটেটে থাকে']
 ]){
  const matches=items.filter(q=>q.text.includes(needle));assert.equal(matches.length,1,needle);
  assert.equal(matches[0].options[matches[0].correct],answer,needle);
 }
 const cq=read(`${root}/chapter-4/rebuild-cq.json`).items;
 assert.equal(cq.reduce((sum,q)=>sum+q.parts.reduce((n,p)=>n+p.marks,0),0),500);
 assert.equal(new Set(['mcq','cq','sq'].flatMap(k=>read(`${root}/chapter-4/rebuild-${k}.json`).items.map(q=>mcq.normalizeStem(q.text)))).size,320);
});

test('chapter-4 figures reproduce exactly, hazards stay contextual and source/release limitations remain explicit',()=>{
 const review=read(`${docs}/chapter-4-completion-review.json`);
 assert.equal(review.officialTextbookFullyRead,false);assert.equal(review.teacherCertified,false);
 assert.equal(review.independentContentReview,false);assert.equal(review.nearDuplicateReviewComplete,false);
 assert.equal(review.diagrams.productionIntegration,false);
 const ledger=read(`${root}/chapter-4/source-ledger.json`).entries;
 assert.equal(ledger.filter(e=>e.figure).length,3);
 assert.ok(ledger.filter(e=>e.authoringRefs.some(r=>r.includes('chapter-4-'))).every(e=>e.backgroundSources.some(u=>u.startsWith('https://openstax.org/'))));
 const figures=Object.fromEntries(review.diagrams.files.map(f=>[f,sha(fs.readFileSync(`${root}/chapter-4/assets/${f}`))]));
 execFileSync('python3',['scripts/question-bank/biology/draw-chapter-4-figures.py']);
 for(const [f,hash] of Object.entries(figures))assert.equal(sha(fs.readFileSync(`${root}/chapter-4/assets/${f}`)),hash);
 const sq=read(`${root}/chapter-4/rebuild-sq.json`).items;
 assert.match(sq.find(q=>q.text.includes('বীজের শ্বসনে তাপ')).explanation,/বিষাক্ত মারকিউরিক ক্লোরাইড নয়/);
 assert.match(sq.find(q=>q.text.includes('বিবর্ণ করার উদ্দেশ্য')).explanation,/সরাসরি আগুনে গরম করা অনিরাপদ/);
 assert.ok(review.sourceChecks.some(s=>s.url==='https://www.biologybd.com/9t4.html'&&s.chunksRead.join(',')==='0,1,2,3'));
});

test('chapter-5 authored 170 MCQ, 50 SQ and 45 CQ retain exact inputs, answers and provenance',()=>{
 for(const [kind,files,total,width] of [
  ['mcq',['chapter-5-mcq.txt','chapter-5-mcq-b.txt'],170,8],
  ['sq',['chapter-5-sq.txt'],50,4],['cq',['chapter-5-cq.txt','chapter-5-cq-b.txt'],45,11]]){
  const items=read(`${root}/chapter-5/rebuild-${kind}.json`).items;
  const ledger=read(`${root}/chapter-5/source-ledger.json`).entries;let count=0;
  for(const input of files)inputRows(input).forEach((row,i)=>{
   count++;assert.equal(row.length,width);assert.equal(row[0],'5');const q=items.find(q=>q.text===row[1]);assert.ok(q,row[1]);
   const e=ledger.find(e=>e.stemSha256===sha(q.text));assert.equal(e.generatedFromConceptCards,false);
   assert.ok(e.authoringRefs.includes(`scripts/question-bank/biology/${input}:${i+2}`));
   if(kind==='mcq'){
    assert.equal(q.options[q.correct],row[2]);assert.equal(q.explanation,row[6]);
    assert.deepEqual(Object.values(q.options).sort(),row.slice(2,6).sort());
   }else if(kind==='sq')assert.equal(q.explanation,row[2]);
   else{assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);
    q.parts.forEach((p,j)=>{assert.equal(p.question,row[2+2*j]);assert.equal(p.solution,row[3+2*j]);});}
  });assert.equal(count,total);
 }
});

test('chapter-5 reader paginates all 320 answers, strips figure markdown and embeds three original figures',()=>{
 const dom=new JSDOM(fs.readFileSync(`${docs}/chapter-5.html`,'utf8'),{runScripts:'dangerously'}),w=dom.window,d=w.document,$=id=>d.getElementById(id);
 const bank=JSON.parse($('bank').textContent);assert.equal(bank.length,320);assert.ok(bank.every(x=>x.chapter===5));
 assert.equal(bank.filter(x=>x.figure).length,3);
 for(const x of bank.filter(x=>x.figure)){
  assert.equal(x.item.type,'CQ');assert.match(x.item.text,/লিখিত সমতুল্য/);
  const bytes=fs.readFileSync(x.evidence.figure.path);assert.equal(sha(bytes),x.evidence.figure.sha256);
  assert.ok(Buffer.from(x.figure.dataUri.split(',')[1],'base64').equals(bytes));
  assert.doesNotMatch(bytes.toString(),/<script|foreignObject|href=|onload=/i);
  assert.equal(x.evidence.figure.origin,'original_editorial_diagram');
 }
 for(const [kind,count] of [['MCQ',200],['SQ',70],['CQ',50]]){
  $('kind').value=kind;$('kind').dispatchEvent(new w.Event('change',{bubbles:true}));
  let seen=0,figures=0;do{
   seen+=d.querySelectorAll('article').length;figures+=d.querySelectorAll('article img').length;
   for(const a of d.querySelectorAll('article')){assert.ok(a.querySelector('details').textContent.length>20);assert.ok(!a.querySelector('h2').textContent.includes('!['));}
   if($('next').disabled)break;$('next').click();
  }while(seen<=count);assert.equal(seen,count);assert.equal(figures,kind==='CQ'?3:0);
 }
 assert.equal(d.querySelectorAll('script[src],iframe,link[href]').length,0);dom.window.close();
});




test('chapter 5 meets its count target while review, import and release remain unauthorized',()=>{
 const c=report.chapters[4];assert.deepEqual(c.counts,{MCQ:200,CQ:50,SQ:70});
 assert.deepEqual(c.remaining,{MCQ:0,CQ:0,SQ:0});assert.equal(c.targetMet,true);
 assert.equal(c.status,'COUNT_TARGET_MET_REVIEW_REQUIRED');
 for(const flag of ['teacherCertified','independentContentReview','nearDuplicateReviewComplete','textbookChapterRead','websiteImported','approved','published'])assert.equal(c[flag],false);
 const ledger=read(`${root}/chapter-5/source-ledger.json`).entries;
 assert.equal(ledger.length,320);assert.equal(ledger.filter(e=>e.generatedFromConceptCards).length,40);
 assert.ok(ledger.every(e=>e.origin==='original_practice'&&e.sourceExercise===null));
 const keys={A:0,B:0,C:0,D:0};for(const q of read(`${root}/chapter-5/rebuild-mcq.json`).items)keys[q.correct]++;
 assert.deepEqual(keys,{A:50,B:50,C:50,D:50});
 assert.equal(new Set(['mcq','cq','sq'].flatMap(k=>read(`${root}/chapter-5/rebuild-${k}.json`).items.map(q=>mcq.normalizeStem(q.text)))).size,320);
});

test('chapter 5 preserves all 55 baseline items and ledger entries plus 42 completed chapter artifacts',()=>{
 const review=read(`${docs}/chapter-5-completion-review.json`);
 assert.equal(review.baseline,'ab3e9de');assert.equal(review.baseline55LedgerEntriesRetained,true);
 assert.equal(Object.keys(review.unchangedFiles).length,42);
 for(const [file,hash] of Object.entries(review.unchangedFiles))assert.equal(sha(fs.readFileSync(file)),hash,file);
 const ledger=read(`${root}/chapter-5/source-ledger.json`).entries;
 assert.equal(Object.keys(review.retainedBaselineLedgerHashes).length,55);
 for(const [id,hash] of Object.entries(review.retainedBaselineLedgerHashes))assert.equal(sha(JSON.stringify(ledger.find(e=>e.id===id))),hash);
 for(const kind of ['mcq','cq','sq']){
  const items=read(`${root}/chapter-5/rebuild-${kind}.json`).items,hashes=review.retainedBaselineItemHashes[kind];
  assert.equal(hashes.length,{mcq:30,cq:5,sq:20}[kind]);hashes.forEach((hash,i)=>assert.equal(sha(JSON.stringify(items[i])),hash));
 }
});

test('chapter-5 numerical and physiology regressions preserve units, scope and distinct digestive roles',()=>{
 const items=read(`${root}/chapter-5/rebuild-mcq.json`).items;
 for(const [needle,answer] of [
  ['আধুনিক সাধারণ শ্রেণিতে Fe','মাইক্রোনিউট্রিয়েন্ট'],['শুষ্ক জৈব ভরের কার্বন','CO2'],
  ['100 kcal প্রায়','418.4 kJ'],['10 g চর্বির','90 kcal'],['20 g শর্করা ও 5 g','100 kcal'],
  ['50 kg ও 1.60','19.5 kg/m²'],['BMR-এর প্রচলিত','Basal Metabolic Rate'],
  ['1200 ও অতিরিক্ত কাজ 500','1700 kcal'],['সুক্রেজের সাধারণ উৎপাদ','গ্লুকোজ ও ফ্রুক্টোজ'],
  ['লাইপেজে ট্রাইগ্লিসারাইডের','ফ্যাটি অ্যাসিড ও মনোগ্লিসারাইড'],['কাইলোমাইক্রন কোথায়','শোষক অন্ত্রকোষে'],
  ['পাইলোরিক','পাইলোরিক স্ফিংক্টার']
 ]){
  const q=items.find(q=>q.text.includes(needle));
  // The pyloric valve is named in the answer rather than the stem.
  if(needle==='পাইলোরিক'){const x=items.find(q=>q.text.includes('কাইম নির্গমনের'));assert.equal(x.options[x.correct],answer);}
  else{assert.ok(q,needle);assert.equal(q.options[q.correct],answer,needle);}
 }
 const cq=read(`${root}/chapter-5/rebuild-cq.json`).items;
 assert.ok(cq.find(q=>q.text.includes('30 g পরিপাচ্য')).parts[2].solution.includes('205 kcal'));
 assert.ok(cq.find(q=>q.text.includes('250 kcal লেখা')).parts[2].solution.includes('1046 kJ'));
 assert.ok(cq.find(q=>q.text.includes('ভর 60 kg')).parts[2].solution.includes('26.7 kg/m²'));
 assert.ok(cq.find(q=>q.text.includes('মাইসেল এবং')).parts[2].solution.includes('মাইসেল ছেড়ে'));
 const ledger=read(`${root}/chapter-5/source-ledger.json`).entries;
 assert.ok(ledger.filter(e=>e.objective.includes(':BMI')&&!e.generatedFromConceptCards).every(e=>e.backgroundSources.includes('https://www.cdc.gov/bmi/about/index.html')));
});

test('chapter-5 original figures reproduce exactly and safety and source limitations stay explicit',()=>{
 const review=read(`${docs}/chapter-5-completion-review.json`);
 const before=Object.fromEntries(review.diagrams.files.map(f=>[f,sha(fs.readFileSync(`${root}/chapter-5/assets/${f}`))]));
 execFileSync('python3',['scripts/question-bank/biology/draw-chapter-5-figures.py']);
 for(const [f,h] of Object.entries(before))assert.equal(sha(fs.readFileSync(`${root}/chapter-5/assets/${f}`)),h);
 const sq=read(`${root}/chapter-5/rebuild-sq.json`).items;
 assert.ok(sq.find(q=>q.text.includes('ORS সম্পর্কে')).explanation.includes('দ্রুত স্বাস্থ্যসেবা'));
 assert.equal(review.teacherCertified,false);assert.equal(review.independentContentReview,false);assert.equal(review.nearDuplicateReviewComplete,false);
 assert.equal(review.approved,false);assert.equal(review.published,false);assert.equal(review.textbookChapterRead,false);
 assert.equal(review.incrementalBackup.independentRemoteGetVerified,true);
 assert.ok(review.limitations.some(x=>x.includes('truncated')));
});

test('chapter-6 authored 200 MCQ, 70 SQ and 50 CQ retain exact inputs, answers and provenance',()=>{
 for(const [kind,files,total,width] of [
  ['mcq',['chapter-6-mcq.txt','chapter-6-mcq-b.txt'],200,8],
  ['sq',['chapter-6-sq.txt'],70,4],['cq',['chapter-6-cq.txt','chapter-6-cq-b.txt'],50,11]]){
  const items=read(`${root}/chapter-6/rebuild-${kind}.json`).items;
  const ledger=read(`${root}/chapter-6/source-ledger.json`).entries;let count=0;
  for(const input of files)inputRows(input).forEach((row,i)=>{
   count++;assert.equal(row.length,width);assert.equal(row[0],'6');const q=items.find(q=>q.text===row[1]);assert.ok(q,row[1]);
   const e=ledger.find(e=>e.stemSha256===sha(q.text));assert.equal(e.generatedFromConceptCards,false);
   assert.ok(e.authoringRefs.includes(`scripts/question-bank/biology/${input}:${i+2}`));
   if(kind==='mcq'){
    assert.equal(q.options[q.correct],row[2]);assert.equal(q.explanation,row[6]);
    assert.deepEqual(Object.values(q.options).sort(),row.slice(2,6).sort());
   }else if(kind==='sq')assert.equal(q.explanation,row[2]);
   else{assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);
    q.parts.forEach((p,j)=>{assert.equal(p.question,row[2+2*j]);assert.equal(p.solution,row[3+2*j]);});}
  });assert.equal(count,total);
 }
});

test('chapter-6 reader paginates all 320 answers, strips figure markdown and embeds three original figures',()=>{
 const dom=new JSDOM(fs.readFileSync(`${docs}/chapter-6.html`,'utf8'),{runScripts:'dangerously'}),w=dom.window,d=w.document,$=id=>d.getElementById(id);
 const bank=JSON.parse($('bank').textContent);assert.equal(bank.length,320);assert.ok(bank.every(x=>x.chapter===6));
 assert.equal(bank.filter(x=>x.figure).length,3);
 for(const x of bank.filter(x=>x.figure)){
  assert.equal(x.item.type,'CQ');assert.match(x.item.text,/লিখিত সমতুল্য/);
  const bytes=fs.readFileSync(x.evidence.figure.path);assert.equal(sha(bytes),x.evidence.figure.sha256);
  assert.ok(Buffer.from(x.figure.dataUri.split(',')[1],'base64').equals(bytes));
  assert.doesNotMatch(bytes.toString(),/<script|foreignObject|href=|onload=/i);
  assert.equal(x.evidence.figure.origin,'original_editorial_diagram');
 }
 for(const [kind,count] of [['MCQ',200],['SQ',70],['CQ',50]]){
  $('kind').value=kind;$('kind').dispatchEvent(new w.Event('change',{bubbles:true}));
  let seen=0,figures=0;do{
   seen+=d.querySelectorAll('article').length;figures+=d.querySelectorAll('article img').length;
   for(const a of d.querySelectorAll('article')){assert.ok(a.querySelector('details').textContent.length>20);assert.ok(!a.querySelector('h2').textContent.includes('!['));}
   if($('next').disabled)break;$('next').click();
  }while(seen<=count);assert.equal(seen,count);assert.equal(figures,kind==='CQ'?3:0);
 }
 assert.equal(d.querySelectorAll('script[src],iframe,link[href]').length,0);dom.window.close();
});





test('chapter 6 meets exact 200/50/70 target with balanced keys and honest release gates',()=>{
 const r=read(`${root}/chapter-6/draft-validation.json`),review=read(`${docs}/chapter-6-completion-review.json`);
 assert.deepEqual(r.counts,{MCQ:200,CQ:50,SQ:70});assert.equal(r.targetMet,true);
 assert.deepEqual(review.counts,r.counts);assert.equal(review.total,320);assert.equal(review.globalDraftItems,1920);
 const keys=read(`${root}/chapter-6/rebuild-mcq.json`).items.reduce((a,q)=>(a[q.correct]++,a),{A:0,B:0,C:0,D:0});
 assert.deepEqual(keys,{A:50,B:50,C:50,D:50});assert.deepEqual(review.optionKeyCounts,keys);
 for(const x of [r,review])for(const k of ['teacherCertified','independentContentReview','nearDuplicateReviewComplete','textbookChapterRead','websiteImported','approved','published'])assert.equal(x[k],false,k);
 assert.equal(review.lexicalScreen.exactUniqueStems,320);assert.equal(review.lexicalScreen.semanticCertification,false);
 assert.equal(review.lexicalScreen.candidatePairs,1);
 const c=review.lexicalScreen.candidates[0],qs=read(`${root}/chapter-6/rebuild-mcq.json`).items;
 assert.equal(c.firstStem,qs[c.first-1].text);assert.equal(c.secondStem,qs[c.second-1].text);assert.ok(c.authorDisposition.includes('complementary'));
});

test('chapter-6 addition preserves every chapter 1–5 bank artifact and reader byte-for-byte',()=>{
 const r=read(`${docs}/chapter-6-completion-review.json`);
 assert.equal(Object.keys(r.preservedEarlierFileHashes).length,r.preservedEarlierFileCount);assert.equal(r.preservedEarlierFileCount,52);
 for(const [file,expected] of Object.entries(r.preservedEarlierFileHashes))assert.equal(sha(fs.readFileSync(file)),expected,file);
 assert.equal(r.baseline,'d0f94e1');
});

test('chapter-6 transport calculations retain explicit dimensions and rates',()=>{
 const qs=read(`${root}/chapter-6/rebuild-mcq.json`).items;
 for(const [needle,answer] of [
  ['0.5 mm² নলে 12 mm','6 mm³'],['20 মিনিটে 0.8 g','0.04 g/min'],['120/80-এর pulse pressure','40 mmHg'],
  ['30 সেকেন্ডে 36টি','72/min'],['প্রতি বিটে 70 mL','4.9 L/min'],['500 mL নমুনার 55%','275 mL'],
  ['একই 10 মিনিটে A-র','B']
 ]){const q=qs.find(q=>q.text.includes(needle));assert.ok(q,needle);assert.equal(q.options[q.correct],answer);}
 const sq=read(`${root}/chapter-6/rebuild-sq.json`).items;
 for(const [needle,answer] of [['A=0.2 mm²','0.6 mm³/min'],['126/82','44 mmHg'],['পালস 80/min','4.8 L/min']])assert.ok(sq.find(q=>q.text.includes(needle)).explanation.includes(answer));
});

test('chapter-6 circulation and transfusion regressions preserve direction and clinical boundaries',()=>{
 const qs=read(`${root}/chapter-6/rebuild-mcq.json`).items;
 for(const [needle,answer] of [
  ['ফুসফুসীয় ধমনি কোথা','ডান নিলয়'],['ফুসফুস থেকে রক্ত কোন','বাম অলিন্দ'],['সংকোচনক্ষম প্রধান হৃদপ্রাচীর','মায়োকার্ডিয়াম'],
  ['শুধু ABO ধরে A গ্রহীতার','A বা O'],['শুধু ABO ধরে O গ্রহীতার','O RBC'],
  ['মানব অণুচক্রিকা সম্পর্কে','মেগাকারিওসাইটের কোষখণ্ড'],['CO2-এর বড় অংশ','বাইকার্বনেট আয়ন'],
  ['LDL ও HDL আসলে','লিপোপ্রোটিন পরিবাহককণা'],['হঠাৎ বুকের চাপ','দ্রুত জরুরি স্বাস্থ্যসহায়তা']
 ]){const q=qs.find(q=>q.text.includes(needle));assert.ok(q,needle);assert.equal(q.options[q.correct],answer);}
 const sq=read(`${root}/chapter-6/rebuild-sq.json`).items;
 assert.ok(sq.find(q=>q.text.includes('একই ABO/Rh')).explanation.includes('সিদ্ধান্ত নেয়'));
 assert.ok(sq.find(q=>q.text.includes('Rh− মানেই')).explanation.includes('sensitization'));
 assert.ok(sq.find(q=>q.text.includes('পটোমিটার কেন')).explanation.includes('পানি গ্রহণ'));
});

test('chapter-6 original figures regenerate exactly and route labels stay non-anatomical',()=>{
 const r=read(`${docs}/chapter-6-completion-review.json`),p=`${root}/chapter-6/assets/`;
 const before=Object.fromEntries(r.diagrams.files.map(f=>[f,sha(fs.readFileSync(p+f))]));
 execFileSync('python3',['scripts/question-bank/biology/draw-chapter-6-figures.py']);
 assert.equal(r.diagrams.count,3);
 for(const [f,h] of Object.entries(before))assert.equal(sha(fs.readFileSync(p+f)),h);
 const heart=fs.readFileSync(p+'double-circulation.svg','utf8');assert.match(heart,/not anatomical chamber positioning/);
 for(const label of ['Right atrium','Right ventricle','Left atrium','Left ventricle','Pulmonary artery','Pulmonary veins','Venae cavae','Aorta','Lungs'])assert.ok(heart.includes(label),label);
 assert.match(fs.readFileSync(p+'vessel-functions.svg','utf8'),/Not all veins have valves/);
});

test('chapter-6 ledger keeps conceptual-source scope and independently verified checkpoint evidence',()=>{
 const ledger=read(`${root}/chapter-6/source-ledger.json`).entries,review=read(`${docs}/chapter-6-completion-review.json`);
 assert.equal(ledger.length,320);assert.ok(ledger.every(e=>e.generatedFromConceptCards===false&&e.sourceExercise===null));
 for(const e of ledger.filter(e=>e.objective.includes(':ABO')))assert.ok(e.backgroundSources.includes('https://www.redcrossblood.org/donate-blood/blood-types.html'));
 for(const e of ledger.filter(e=>e.objective.includes(':BP'))){assert.ok(e.backgroundSources.includes('https://www.who.int/news-room/fact-sheets/detail/hypertension'));assert.ok(e.backgroundSources.includes('https://www.cdc.gov/high-blood-pressure/measure/index.html'));}
 assert.equal(review.incrementalBackup.independentRemoteGetVerified,true);assert.equal(review.incrementalBackup.bytes,194965);
 assert.ok(review.limitations.some(x=>x.includes('OCR')));assert.ok(review.limitations.some(x=>x.includes('enrichment')));
 assert.ok(review.limitations.some(x=>x.includes('Distractor plausibility')));
});

test('chapter-7 authored 200 MCQ, 70 SQ and 50 CQ retain exact inputs, answers and provenance',()=>{
 for(const [kind,files,total,width] of [
  ['mcq',['chapter-7-mcq.txt','chapter-7-mcq-b.txt'],200,8],
  ['sq',['chapter-7-sq.txt'],70,4],['cq',['chapter-7-cq.txt','chapter-7-cq-b.txt'],50,11]]){
  const items=read(`${root}/chapter-7/rebuild-${kind}.json`).items;
  const ledger=read(`${root}/chapter-7/source-ledger.json`).entries;let count=0;
  for(const input of files)inputRows(input).forEach((row,i)=>{
   count++;assert.equal(row.length,width);assert.equal(row[0],'7');const q=items.find(q=>q.text===row[1]);assert.ok(q,row[1]);
   const e=ledger.find(e=>e.stemSha256===sha(q.text));assert.equal(e.generatedFromConceptCards,false);
   assert.ok(e.authoringRefs.includes(`scripts/question-bank/biology/${input}:${i+2}`));
   if(kind==='mcq'){
    assert.equal(q.options[q.correct],row[2]);assert.equal(q.explanation,row[6]);
    assert.deepEqual(Object.values(q.options).sort(),row.slice(2,6).sort());
   }else if(kind==='sq')assert.equal(q.explanation,row[2]);
   else{assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);
    q.parts.forEach((p,j)=>{assert.equal(p.question,row[2+2*j]);assert.equal(p.solution,row[3+2*j]);});}
  });assert.equal(count,total);
 }
});

test('chapter-7 reader paginates all 320 answers, strips figure markdown and embeds three original figures',()=>{
 const dom=new JSDOM(fs.readFileSync(`${docs}/chapter-7.html`,'utf8'),{runScripts:'dangerously'}),w=dom.window,d=w.document,$=id=>d.getElementById(id);
 const bank=JSON.parse($('bank').textContent);assert.equal(bank.length,320);assert.ok(bank.every(x=>x.chapter===7));
 assert.equal(bank.filter(x=>x.figure).length,3);
 for(const x of bank.filter(x=>x.figure)){
  assert.equal(x.item.type,'CQ');assert.match(x.item.text,/লিখিত সমতুল্য/);
  const bytes=fs.readFileSync(x.evidence.figure.path);assert.equal(sha(bytes),x.evidence.figure.sha256);
  assert.ok(Buffer.from(x.figure.dataUri.split(',')[1],'base64').equals(bytes));
  assert.doesNotMatch(bytes.toString(),/<script|foreignObject|href=|onload=/i);
  assert.equal(x.evidence.figure.origin,'original_editorial_diagram');
 }
 for(const [kind,count] of [['MCQ',200],['SQ',70],['CQ',50]]){
  $('kind').value=kind;$('kind').dispatchEvent(new w.Event('change',{bubbles:true}));
  let seen=0,figures=0;do{
   seen+=d.querySelectorAll('article').length;figures+=d.querySelectorAll('article img').length;
   for(const a of d.querySelectorAll('article')){assert.ok(a.querySelector('details').textContent.length>20);assert.ok(!a.querySelector('h2').textContent.includes('!['));}
   if($('next').disabled)break;$('next').click();
  }while(seen<=count);assert.equal(seen,count);assert.equal(figures,kind==='CQ'?3:0);
 }
 assert.equal(d.querySelectorAll('script[src],iframe,link[href]').length,0);dom.window.close();
});






test('chapter 7 reaches 320 answered drafts with balanced keys and uncertified release status',()=>{
 const r=read(`${root}/chapter-7/draft-validation.json`),v=read(`${docs}/chapter-7-completion-review.json`);
 assert.deepEqual(r.counts,{MCQ:200,CQ:50,SQ:70});assert.equal(r.targetMet,true);assert.deepEqual(v.counts,r.counts);
 assert.equal(v.total,320);assert.equal(v.globalDraftItems,2240);assert.equal(v.remainingTargetItems,2240);
 const keys=read(`${root}/chapter-7/rebuild-mcq.json`).items.reduce((a,q)=>(a[q.correct]++,a),{A:0,B:0,C:0,D:0});
 assert.deepEqual(keys,{A:50,B:50,C:50,D:50});assert.deepEqual(v.optionKeyCounts,keys);
 for(const x of [r,v])for(const flag of ['teacherCertified','independentContentReview','nearDuplicateReviewComplete','textbookChapterRead','websiteImported','approved','published'])assert.equal(x[flag],false,flag);
 assert.equal(v.lexicalScreen.exactUniqueStems,320);assert.equal(v.lexicalScreen.semanticCertification,false);
 const pair=v.lexicalScreen.candidates[0],sq=read(`${root}/chapter-7/rebuild-sq.json`).items;
 assert.equal(v.lexicalScreen.candidatePairs,1);assert.equal(pair.firstStem,sq[pair.first-1].text);assert.equal(pair.secondStem,sq[pair.second-1].text);assert.ok(pair.authorDisposition.includes('different quantities'));
});

test('chapter-7 expansion preserves all 62 earlier chapter 1–6 bank artifacts and readers',()=>{
 const v=read(`${docs}/chapter-7-completion-review.json`);assert.equal(v.baseline,'800e740');
 assert.equal(v.preservedEarlierFileCount,62);assert.equal(Object.keys(v.preservedEarlierFileHashes).length,62);
 for(const [file,h] of Object.entries(v.preservedEarlierFileHashes))assert.equal(sha(fs.readFileSync(file)),h,file);
});

test('chapter-7 quantitative regressions distinguish total, alveolar, net and partial-pressure quantities',()=>{
 const qs=read(`${root}/chapter-7/rebuild-mcq.json`).items;
 for(const [needle,answer] of [
  ['একই সময়ে CO2 স্থিরীকরণ 9','6 একক'],['নিট O2 ত্যাগ 6','10 একক'],['30 সেকেন্ডে 8টি','16/min'],
  ['অ্যালভিওলার O2 চাপ 100','60 mmHg'],['মোট চাপ 700','147 mmHg'],['প্রতি শ্বাসে 0.5 L','6 L/min'],
  ['tidal 500 mL, মৃতস্থান','4.2 L/min'],['400 mL করে 15/min','3.75 L/min'],['IRV 2500','4000 mL'],
  ['vital capacity 4 L','5.2 L'],['18 চক্র ও প্রতি','7.2 L/min'],['2 L নমুনায় CO2','80 mL'],['14 থেকে 21/min','50%']
 ]){const q=qs.find(q=>q.text.includes(needle));assert.ok(q,needle);assert.equal(q.options[q.correct],answer);}
 const cq=read(`${root}/chapter-7/rebuild-cq.json`).items;
 const q=cq.find(q=>q.text.includes('মডেল A: tidal'));assert.ok(q.parts[2].solution.includes('4.2'));assert.ok(q.parts[2].solution.includes('3 L/min'));
 const sq=read(`${root}/chapter-7/rebuild-sq.json`).items;
 assert.ok(sq.find(q=>q.text.includes('চাপ 650')).explanation.includes('136.5 mmHg'));
 assert.ok(sq.find(q=>q.text.includes('tidal 450, মৃতস্থান')).explanation.includes('4.8 L/min'));
});

test('chapter-7 biology boundaries retain gas direction, airway distinctions and evidence limits',()=>{
 const qs=read(`${root}/chapter-7/rebuild-mcq.json`).items;
 for(const [needle,answer] of [
  ['ফুসফুসে O2-এর নিট','অ্যালভিওলাস থেকে রক্তে'],['টিস্যুতে CO2-এর নিট','কোষ থেকে রক্তে'],
  ['নির্গত O2-এর পরমাণু','পানি'],['ফুসফুসের লোবসংখ্যা','3 ও 2'],['CO2 রক্তে প্রধানত','বাইকার্বনেট'],
  ['গিলবার সময় শ্বাসপথ','এপিগ্লটিস'],['শ্বাসপথের সিলিয়ার সাধারণ','গলবিলের দিকে'],['সারফ্যাকট্যান্ট কী করে','পৃষ্ঠটান কমায়'],
  ['চুনের পানিতে CO2 দিলে','CaCO3 অধঃক্ষেপ'],['সাধারণ acute bronchitis-এ','অনেক ক্ষেত্রেই ভাইরাস দায়ী']
 ]){const q=qs.find(q=>q.text.includes(needle));assert.ok(q,needle);assert.equal(q.options[q.correct],answer);}
 const sq=read(`${root}/chapter-7/rebuild-sq.json`).items;
 assert.ok(sq.find(q=>q.text.includes('সব হাঁপানি রোগীর')).explanation.includes('ব্যক্তিভেদে'));
 assert.ok(sq.find(q=>q.text.includes('TB infection test')).explanation.includes('সুপ্ত সংক্রমণে'));
 assert.ok(sq.find(q=>q.text.includes('CO ও CO2-কে')).explanation.includes('আলাদা পদার্থ'));
});

test('chapter-7 diagrams regenerate exactly, use correct frontal lung orientation and separate gradients',()=>{
 const v=read(`${docs}/chapter-7-completion-review.json`),p=`${root}/chapter-7/assets/`;
 const before=Object.fromEntries(v.diagrams.files.map(f=>[f,sha(fs.readFileSync(p+f))]));
 execFileSync('python3',['scripts/question-bank/biology/draw-chapter-7-figures.py']);assert.equal(v.diagrams.count,3);
 for(const [f,h] of Object.entries(before))assert.equal(sha(fs.readFileSync(p+f)),h);
 const lungs=fs.readFileSync(p+'respiratory-route.svg','utf8');assert.match(lungs,/Patient right lung is on viewer left with three lobes/);assert.match(lungs,/patient left lung is on viewer right with two lobes/);
 const barrier=fs.readFileSync(p+'alveolar-exchange.svg','utf8');assert.match(barrier,/not represent blood flowing into an air sac/);assert.match(barrier,/Layer thickness is exaggerated/);
 assert.match(fs.readFileSync(p+'inspiration-mechanism.svg','utf8'),/forced expiration can recruit extra muscles/);
});

test('chapter-7 source ledger and safety retain remote checkpoint scope without certification inflation',()=>{
 const v=read(`${docs}/chapter-7-completion-review.json`),entries=read(`${root}/chapter-7/source-ledger.json`).entries;
 assert.equal(entries.length,320);assert.ok(entries.every(e=>e.sourceExercise===null&&!e.generatedFromConceptCards));
 for(const [tag,url] of [[':asthma','https://www.who.int/news-room/fact-sheets/detail/asthma'],[':TB','https://www.who.int/news-room/fact-sheets/detail/tuberculosis'],[':bronchitis','https://www.cdc.gov/acute-bronchitis/about/index.html']]){
  const relevant=entries.filter(e=>e.objective.includes(tag));assert.ok(relevant.length>0);assert.ok(relevant.every(e=>e.backgroundSources.includes(url)));
 }
 assert.equal(v.incrementalBackup.bytes,21020);assert.equal(v.incrementalBackup.independentRemoteGetVerified,true);assert.ok(v.incrementalBackup.scope.includes('200 MCQ'));
 assert.ok(v.limitations.some(x=>x.includes('enrichment')));assert.ok(v.limitations.some(x=>x.includes('OpenStax')));
 const sq=read(`${root}/chapter-7/rebuild-sq.json`).items;assert.ok(sq.find(q=>q.text.includes('গুরুতর শ্বাসকষ্টে')).explanation.includes('জরুরি স্বাস্থ্যসহায়তা'));
 assert.ok(sq.find(q=>q.text.includes('চুনের পানির সাধারণ')).explanation.includes('মুখে নল টানা'));
});

test('chapter-8 authored 200 MCQ, 70 SQ and 50 CQ retain exact inputs, answers and provenance',()=>{
 for(const [kind,files,total,width] of [
  ['mcq',['chapter-8-mcq.txt','chapter-8-mcq-b.txt'],200,8],
  ['sq',['chapter-8-sq.txt'],70,4],['cq',['chapter-8-cq.txt','chapter-8-cq-b.txt'],50,11]]){
  const items=read(`${root}/chapter-8/rebuild-${kind}.json`).items;
  const ledger=read(`${root}/chapter-8/source-ledger.json`).entries;let count=0;
  for(const input of files)inputRows(input).forEach((row,i)=>{
   count++;assert.equal(row.length,width);assert.equal(row[0],'8');const q=items.find(q=>q.text===row[1]);assert.ok(q,row[1]);
   const e=ledger.find(e=>e.stemSha256===sha(q.text));assert.equal(e.generatedFromConceptCards,false);
   assert.ok(e.authoringRefs.includes(`scripts/question-bank/biology/${input}:${i+2}`));
   if(kind==='mcq'){
    assert.equal(q.options[q.correct],row[2]);assert.equal(q.explanation,row[6]);
    assert.deepEqual(Object.values(q.options).sort(),row.slice(2,6).sort());
   }else if(kind==='sq')assert.equal(q.explanation,row[2]);
   else{assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);
    q.parts.forEach((p,j)=>{assert.equal(p.question,row[2+2*j]);assert.equal(p.solution,row[3+2*j]);});}
  });assert.equal(count,total);
 }
});

test('chapter-8 reader paginates all 320 answers, strips figure markdown and embeds three original figures',()=>{
 const dom=new JSDOM(fs.readFileSync(`${docs}/chapter-8.html`,'utf8'),{runScripts:'dangerously'}),w=dom.window,d=w.document,$=id=>d.getElementById(id);
 const bank=JSON.parse($('bank').textContent);assert.equal(bank.length,320);assert.ok(bank.every(x=>x.chapter===8));
 assert.equal(bank.filter(x=>x.figure).length,3);
 for(const x of bank.filter(x=>x.figure)){
  assert.equal(x.item.type,'CQ');assert.match(x.item.text,/লিখিত সমতুল্য/);
  const bytes=fs.readFileSync(x.evidence.figure.path);assert.equal(sha(bytes),x.evidence.figure.sha256);
  assert.ok(Buffer.from(x.figure.dataUri.split(',')[1],'base64').equals(bytes));
  assert.doesNotMatch(bytes.toString(),/<script|foreignObject|href=|onload=/i);
  assert.equal(x.evidence.figure.origin,'original_editorial_diagram');
 }
 for(const [kind,count] of [['MCQ',200],['SQ',70],['CQ',50]]){
  $('kind').value=kind;$('kind').dispatchEvent(new w.Event('change',{bubbles:true}));
  let seen=0,figures=0;do{
   seen+=d.querySelectorAll('article').length;figures+=d.querySelectorAll('article img').length;
   for(const a of d.querySelectorAll('article')){assert.ok(a.querySelector('details').textContent.length>20);assert.ok(!a.querySelector('h2').textContent.includes('!['));}
   if($('next').disabled)break;$('next').click();
  }while(seen<=count);assert.equal(seen,count);assert.equal(figures,kind==='CQ'?3:0);
 }
 assert.equal(d.querySelectorAll('script[src],iframe,link[href]').length,0);dom.window.close();
});







test('chapter 8 meets exactly 200/50/70 with balanced keys, unique stems and honest gates',()=>{
 const r=read(`${root}/chapter-8/draft-validation.json`),v=read(`${docs}/chapter-8-completion-review.json`);
 assert.deepEqual(r.counts,{MCQ:200,CQ:50,SQ:70});assert.equal(r.targetMet,true);assert.deepEqual(v.counts,r.counts);
 assert.equal(v.total,320);assert.equal(v.globalDraftItems,2560);assert.equal(v.remainingTargetItems,1920);
 const keys=read(`${root}/chapter-8/rebuild-mcq.json`).items.reduce((a,q)=>(a[q.correct]++,a),{A:0,B:0,C:0,D:0});
 assert.deepEqual(keys,{A:50,B:50,C:50,D:50});assert.deepEqual(v.optionKeyCounts,keys);
 for(const x of [r,v])for(const flag of ['teacherCertified','independentContentReview','nearDuplicateReviewComplete','textbookChapterRead','websiteImported','approved','published'])assert.equal(x[flag],false,flag);
 assert.equal(v.lexicalScreen.exactUniqueStems,320);assert.equal(v.lexicalScreen.semanticCertification,false);
 const c=v.lexicalScreen.candidates[0],qs=read(`${root}/chapter-8/rebuild-mcq.json`).items;
 assert.equal(v.lexicalScreen.candidatePairs,1);assert.equal(c.firstStem,qs[c.first-1].text);assert.equal(c.secondStem,qs[c.second-1].text);
 assert.ok(c.authorDisposition.includes('different molecules'));
});

test('chapter-8 expansion preserves all 72 earlier chapter 1–7 bank artifacts and readers',()=>{
 const v=read(`${docs}/chapter-8-completion-review.json`);assert.equal(v.baseline,'5b697bc');assert.equal(v.preservedEarlierFileCount,72);
 assert.equal(Object.keys(v.preservedEarlierFileHashes).length,72);
 for(const [p,h] of Object.entries(v.preservedEarlierFileHashes))assert.equal(sha(fs.readFileSync(p)),h,p);
});

test('chapter-8 numerical regressions retain mass balance, recovery, rate and concentration units',()=>{
 const qs=read(`${root}/chapter-8/rebuild-mcq.json`).items;
 for(const [needle,answer] of [
  ['100 একক ছাঁকা','35 একক'],['180 L পরিস্রুত থেকে 1.8','99%'],['24 ঘণ্টায় 1440','1 mL/min'],
  ['20 g/L ইউরিয়াযুক্ত','30 g'],['0.8 L থেকে 1.2','50%'],['A-র 10 g/L','দুজনের 20 g']
 ]){const q=qs.find(q=>q.text.includes(needle));assert.ok(q,needle);assert.equal(q.options[q.correct],answer);}
 const sq=read(`${root}/chapter-8/rebuild-sq.json`).items;
 assert.ok(sq.find(q=>q.text.includes('ছাঁকা 120')).explanation.includes('38 mg/min'));
 assert.ok(sq.find(q=>q.text.includes('180 L পরিস্রুত ও 1.5')).explanation.includes('178.5 L/দিন'));
 const cq=read(`${root}/chapter-8/rebuild-cq.json`).items;
 assert.ok(cq.find(q=>q.text.includes('ছাঁকা হার 80')).parts[2].solution.includes('42 mg/min'));
 assert.ok(cq.find(q=>q.text.includes('15 g/L এবং')).parts[2].solution.includes('30 g/দিন'));
});

test('chapter-8 physiological boundaries retain organ, fluid and transport directions',()=>{
 const qs=read(`${root}/chapter-8/rebuild-mcq.json`).items;
 for(const [needle,answer] of [
  ['ইউরিয়া প্রধানত কোথায়','যকৃতে'],['ADH প্রধানত কোথায়','হাইপোথ্যালামাসে'],['ADH কোন স্থান থেকে','পশ্চাৎ পিটুইটারি'],
  ['প্রাথমিক পরিস্রুতে কোনটি','পানি ও গ্লুকোজ'],['পুনঃশোষণের নিট দিক','নালিকার তরল থেকে রক্তের দিকে'],
  ['নালিকাক্ষরণের সাধারণ দিক','রক্ত/টিস্যুতরল থেকে নালিকার ভেতরে'],['পুনঃশোষিত পানি প্রধানত','অভিস্রবণ'],
  ['বৃক্ক থেকে মূত্রাশয়ে মূত্র','ইউরেটার'],['মূত্রাশয় থেকে বাইরের','ইউরেথ্রা']
 ]){const q=qs.find(q=>q.text.includes(needle));assert.ok(q,needle);assert.equal(q.options[q.correct],answer);}
 const sq=read(`${root}/chapter-8/rebuild-sq.json`).items;
 assert.ok(sq.find(q=>q.text.includes('প্যাপিলা থেকে মূত্রাশয়')).explanation.includes('ক্ষুদ্র ক্যালিক্স'));
 assert.ok(sq.find(q=>q.text.includes('ক্রিয়েটিনিন ও eGFR')).explanation.includes('অনুমান'));
});

test('chapter-8 original diagrams regenerate exactly and distinguish drainage and blood/dialysate paths',()=>{
 const r=read(`${docs}/chapter-8-completion-review.json`),p=`${root}/chapter-8/assets/`;
 const before=Object.fromEntries(r.diagrams.files.map(f=>[f,sha(fs.readFileSync(p+f))]));
 execFileSync('python3',['scripts/question-bank/biology/draw-chapter-8-figures.py']);assert.equal(r.diagrams.count,3);assert.equal(r.diagrams.productionIntegration,false);
 for(const [f,h] of Object.entries(before))assert.equal(sha(fs.readFileSync(p+f)),h);
 assert.match(fs.readFileSync(p+'kidney-section.svg','utf8'),/via branching minor and major calyces/);
 assert.match(fs.readFileSync(p+'nephron-pathways.svg','utf8'),/not whole blood/);
 const d=fs.readFileSync(p+'dialyzer-exchange.svg','utf8');assert.match(d,/not an access or assembly diagram/);assert.match(d,/Controlled excess water removal uses pressure/);
});

test('chapter-8 sources, safety and verified 198-row checkpoint retain explicit scope limits',()=>{
 const r=read(`${docs}/chapter-8-completion-review.json`),es=read(`${root}/chapter-8/source-ledger.json`).entries;
 assert.equal(es.length,320);assert.ok(es.every(e=>e.sourceExercise===null&&!e.generatedFromConceptCards));
 for(const [tag,url] of [
  ['8.3','https://openstax.org/books/biology-2e/pages/41-5-hormonal-control-of-osmoregulatory-functions'],
  ['8.5','https://www.niddk.nih.gov/health-information/kidney-disease/kidney-failure/hemodialysis'],
  ['8.6','https://www.niddk.nih.gov/health-information/kidney-disease/kidney-failure/kidney-transplant']
 ]){const relevant=es.filter(e=>e.objective.startsWith(tag));assert.ok(relevant.length);assert.ok(relevant.every(e=>e.backgroundSources.includes(url)));}
 assert.equal(r.incrementalBackup.bytes,19898);assert.equal(r.incrementalBackup.independentRemoteGetVerified,true);assert.ok(r.incrementalBackup.scope.includes('198 MCQ'));
 assert.ok(r.limitations.some(x=>x.includes('enrichment')));assert.ok(r.limitations.some(x=>x.includes('OpenStax')));
 const sq=read(`${root}/chapter-8/rebuild-sq.json`).items;
 assert.ok(sq.find(q=>q.text.includes('ব্রেন ডেথ বলে')).explanation.includes('অচেতনতা মানেই মৃত্যু নয়'));
 assert.ok(sq.find(q=>q.text.includes('সব মানুষের পানি')).explanation.includes('তরলসীমা'));
 assert.ok(sq.find(q=>q.text.includes('সফল প্রতিস্থাপনের')).explanation.includes('নিজে বন্ধ নয়'));
});

test('chapter-9 authored 200 MCQ, 70 SQ and 50 CQ retain exact inputs, answers and provenance',()=>{
 for(const [kind,files,total,width] of [
  ['mcq',['chapter-9-mcq.txt','chapter-9-mcq-b.txt'],200,8],
  ['sq',['chapter-9-sq.txt'],70,4],['cq',['chapter-9-cq.txt','chapter-9-cq-b.txt'],50,11]]){
  const items=read(`${root}/chapter-9/rebuild-${kind}.json`).items;
  const ledger=read(`${root}/chapter-9/source-ledger.json`).entries;let count=0;
  for(const input of files)inputRows(input).forEach((row,i)=>{
   count++;assert.equal(row.length,width);assert.equal(row[0],'9');const q=items.find(q=>q.text===row[1]);assert.ok(q,row[1]);
   const e=ledger.find(e=>e.stemSha256===sha(q.text));assert.equal(e.generatedFromConceptCards,false);
   assert.ok(e.authoringRefs.includes(`scripts/question-bank/biology/${input}:${i+2}`));
   if(kind==='mcq'){
    assert.equal(q.options[q.correct],row[2]);assert.equal(q.explanation,row[6]);
    assert.deepEqual(Object.values(q.options).sort(),row.slice(2,6).sort());
   }else if(kind==='sq')assert.equal(q.explanation,row[2]);
   else{assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);
    q.parts.forEach((p,j)=>{assert.equal(p.question,row[2+2*j]);assert.equal(p.solution,row[3+2*j]);});}
  });assert.equal(count,total);
 }
});

test('chapter-9 reader paginates all 320 answers, strips figure markdown and embeds three original figures',()=>{
 const dom=new JSDOM(fs.readFileSync(`${docs}/chapter-9.html`,'utf8'),{runScripts:'dangerously'}),w=dom.window,d=w.document,$=id=>d.getElementById(id);
 const bank=JSON.parse($('bank').textContent);assert.equal(bank.length,320);assert.ok(bank.every(x=>x.chapter===9));
 assert.equal(bank.filter(x=>x.figure).length,3);
 for(const x of bank.filter(x=>x.figure)){
  assert.equal(x.item.type,'CQ');assert.match(x.item.text,/লিখিত সমতুল্য/);
  const bytes=fs.readFileSync(x.evidence.figure.path);assert.equal(sha(bytes),x.evidence.figure.sha256);
  assert.ok(Buffer.from(x.figure.dataUri.split(',')[1],'base64').equals(bytes));
  assert.doesNotMatch(bytes.toString(),/<script|foreignObject|href=|onload=/i);
  assert.equal(x.evidence.figure.origin,'original_editorial_diagram');
 }
 for(const [kind,count] of [['MCQ',200],['SQ',70],['CQ',50]]){
  $('kind').value=kind;$('kind').dispatchEvent(new w.Event('change',{bubbles:true}));
  let seen=0,figures=0;do{
   seen+=d.querySelectorAll('article').length;figures+=d.querySelectorAll('article img').length;
   for(const a of d.querySelectorAll('article')){assert.ok(a.querySelector('details').textContent.length>20);assert.ok(!a.querySelector('h2').textContent.includes('!['));}
   if($('next').disabled)break;$('next').click();
  }while(seen<=count);assert.equal(seen,count);assert.equal(figures,kind==='CQ'?3:0);
 }
 assert.equal(d.querySelectorAll('script[src],iframe,link[href]').length,0);dom.window.close();
});








test('chapter 9 reaches exact 200/50/70 with balanced keys and no certification inflation',()=>{
 const r=read(`${root}/chapter-9/draft-validation.json`),v=read(`${docs}/chapter-9-completion-review.json`);
 assert.deepEqual(r.counts,{MCQ:200,CQ:50,SQ:70});assert.equal(r.targetMet,true);assert.deepEqual(v.counts,r.counts);
 assert.equal(v.total,320);assert.equal(v.globalDraftItems,2880);assert.equal(v.remainingTargetItems,1600);
 const keys=read(`${root}/chapter-9/rebuild-mcq.json`).items.reduce((a,q)=>(a[q.correct]++,a),{A:0,B:0,C:0,D:0});assert.deepEqual(keys,{A:50,B:50,C:50,D:50});assert.deepEqual(v.optionKeyCounts,keys);
 for(const x of [r,v])for(const flag of ['teacherCertified','independentContentReview','nearDuplicateReviewComplete','textbookChapterRead','websiteImported','approved','published'])assert.equal(x[flag],false,flag);
 assert.equal(v.lexicalScreen.exactUniqueStems,320);assert.equal(v.lexicalScreen.semanticCertification,false);assert.equal(v.lexicalScreen.candidatePairs,4);
 const qs=read(`${root}/chapter-9/rebuild-mcq.json`).items;
 for(const c of v.lexicalScreen.candidates){assert.equal(c.type,'MCQ');assert.equal(c.firstStem,qs[c.first-1].text);assert.equal(c.secondStem,qs[c.second-1].text);assert.ok(c.authorDisposition.includes('independent'));}
});

test('chapter-9 addition preserves all 82 earlier chapter 1–8 artifacts and readers byte-for-byte',()=>{
 const r=read(`${docs}/chapter-9-completion-review.json`);assert.equal(r.baseline,'df5acc2');assert.equal(r.preservedEarlierFileCount,82);assert.equal(Object.keys(r.preservedEarlierFileHashes).length,82);
 for(const [p,h] of Object.entries(r.preservedEarlierFileHashes))assert.equal(sha(fs.readFileSync(p)),h,p);
});

test('chapter-9 numerical regressions retain torque, perpendicular arm, angle and percentage bases',()=>{
 const qs=read(`${root}/chapter-9/rebuild-mcq.json`).items;
 for(const [needle,answer] of [
  ['20 N বলের লম্ব','6 N m'],['50 N ভার 0.2','250 N'],['140° থেকে 80°','60° ফ্লেক্সন'],['30 cm পেশি','20%'],['পাঁজর সাধারণত কয়','12']
 ]){const q=qs.find(q=>q.text.includes(needle));assert.ok(q,needle);assert.equal(q.options[q.correct],answer);}
 const sq=read(`${root}/chapter-9/rebuild-sq.json`).items;
 assert.ok(sq.find(q=>q.text.includes('40 N ভারের')).explanation.includes('200 N'));
 assert.ok(sq.find(q=>q.text.includes('4 N m টর্কের')).explanation.includes('100 N'));
 const cq=read(`${root}/chapter-9/rebuild-cq.json`).items;
 assert.ok(cq.find(q=>q.text.includes('A পর্যায়ে কনুই')).parts[2].solution.includes('মোট পথ 100°'));
 assert.ok(cq.find(q=>q.text.includes('একই একক-সময়ে')).parts[2].solution.includes('−3'));
});

test('chapter-9 physiology boundaries retain bone cells, connective tissues and contraction mechanism',()=>{
 const qs=read(`${root}/chapter-9/rebuild-mcq.json`).items;
 for(const [needle,answer] of [
  ['নতুন অস্থিমাতৃকা গঠনে','অস্টিওব্লাস্ট'],['অস্থিমাতৃকা ভাঙা','অস্টিওক্লাস্ট'],
  ['লিগামেন্ট সাধারণত কী','অস্থির সঙ্গে অস্থি'],['টেনডনের প্রধান সংযোগ','পেশির সঙ্গে অস্থি'],
  ['সরু মায়োফিলামেন্টের','অ্যাক্টিন'],['মোটা মায়োফিলামেন্টের','মায়োসিন'],['Ca2+ কোন নিয়ন্ত্রক','ট্রোপোনিন'],
  ['A-band-এর দৈর্ঘ্য','প্রায় অপরিবর্তিত থাকে'],['সন্নিহিত কশেরুকাদেহের','ঈষৎ সচল'],
  ['মানুষের চুল-নখকে','এগুলো কেরাটিনযুক্ত ত্বকীয় অঙ্গজ অংশ']
 ]){const q=qs.find(q=>q.text.includes(needle));assert.ok(q,needle);assert.equal(q.options[q.correct],answer);}
 const sq=read(`${root}/chapter-9/rebuild-sq.json`).items;
 assert.ok(sq.find(q=>q.text.includes('সব তরুণাস্থিতে perichondrium')).explanation.includes('ব্যতিক্রম'));
 assert.ok(sq.find(q=>q.text.includes('টান তৈরি মানেই')).explanation.includes('লম্বাও হতে পারে'));
 assert.ok(sq.find(q=>q.text.includes('Haversian canal ও')).explanation.includes('পুরো রক্তকোষবাহী'));
});

test('chapter-9 three original figures regenerate and label simplifications and functional roles',()=>{
 const r=read(`${docs}/chapter-9-completion-review.json`),p=`${root}/chapter-9/assets/`;
 const before=Object.fromEntries(r.diagrams.files.map(f=>[f,sha(fs.readFileSync(p+f))]));
 execFileSync('python3',['scripts/question-bank/biology/draw-chapter-9-figures.py']);assert.equal(r.diagrams.count,3);assert.equal(r.diagrams.productionIntegration,false);
 for(const [f,h] of Object.entries(before))assert.equal(sha(fs.readFileSync(p+f)),h);
 assert.match(fs.readFileSync(p+'skeleton-regions.svg','utf8'),/not a full bone-count/);
 assert.match(fs.readFileSync(p+'synovial-joint.svg','utf8'),/complementary lubrication and stability/);
 const e=fs.readFileSync(p+'elbow-antagonists.svg','utf8');assert.match(e,/Muscles pull, not actively push bones/);assert.match(e,/co-contraction/);
});

test('chapter-9 source and clinical safety evidence retains checkpoint and unapproved scope',()=>{
 const r=read(`${docs}/chapter-9-completion-review.json`),es=read(`${root}/chapter-9/source-ledger.json`).entries;
 assert.equal(es.length,320);assert.ok(es.every(e=>e.sourceExercise===null&&!e.generatedFromConceptCards));
 for(const [tag,url] of [
  [':OP','https://www.niams.nih.gov/health-topics/osteoporosis/diagnosis-treatment-and-steps-to-take'],
  [':RA','https://www.niams.nih.gov/health-topics/rheumatoid-arthritis'],
  [':OA','https://www.niams.nih.gov/health-topics/osteoarthritis'],
  [':injury','https://www.niams.nih.gov/health-topics/sports-injuries']
 ]){const relevant=es.filter(e=>e.objective.includes(tag));assert.ok(relevant.length);assert.ok(relevant.every(e=>e.backgroundSources.includes(url)));}
 assert.equal(r.incrementalBackup.bytes,20602);assert.equal(r.incrementalBackup.md5,'9b81f7289b1b69e83b868e796b839354');assert.equal(r.incrementalBackup.independentRemoteGetVerified,true);
 assert.ok(r.incrementalBackup.scope.includes('200 MCQ'));assert.ok(r.limitations.some(x=>x.includes('Enrichment')));
 const sq=read(`${root}/chapter-9/rebuild-sq.json`).items;
 assert.ok(sq.find(q=>q.text.includes('জ্বরসহ হঠাৎ গরম')).explanation.includes('দেরি করা অনুচিত'));
 assert.ok(sq.find(q=>q.text.includes('সন্দেহজনক ভাঙন')).explanation.includes('অপ্রশিক্ষিত'));
 assert.ok(sq.find(q=>q.text.includes('RA-তে ব্যথা কমা')).explanation.includes('নিজে ওষুধ'));
});

test('chapter-10 authored 200 MCQ, 70 SQ and 50 CQ retain exact inputs, answers and provenance',()=>{
 for(const [kind,files,total,width] of [
  ['mcq',['chapter-10-mcq.txt','chapter-10-mcq-b.txt'],200,8],
  ['sq',['chapter-10-sq.txt'],70,4],['cq',['chapter-10-cq.txt','chapter-10-cq-b.txt'],50,11]]){
  const items=read(`${root}/chapter-10/rebuild-${kind}.json`).items;
  const ledger=read(`${root}/chapter-10/source-ledger.json`).entries;let count=0;
  for(const input of files)inputRows(input).forEach((row,i)=>{
   count++;assert.equal(row.length,width);assert.equal(row[0],'10');const q=items.find(q=>q.text===row[1]);assert.ok(q,row[1]);
   const e=ledger.find(e=>e.stemSha256===sha(q.text));assert.equal(e.generatedFromConceptCards,false);
   assert.ok(e.authoringRefs.includes(`scripts/question-bank/biology/${input}:${i+2}`));
   if(kind==='mcq'){
    assert.equal(q.options[q.correct],row[2]);assert.equal(q.explanation,row[6]);
    assert.deepEqual(Object.values(q.options).sort(),row.slice(2,6).sort());
   }else if(kind==='sq')assert.equal(q.explanation,row[2]);
   else{assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);
    q.parts.forEach((p,j)=>{assert.equal(p.question,row[2+2*j]);assert.equal(p.solution,row[3+2*j]);});}
  });assert.equal(count,total);
 }
});

test('chapter-10 reader paginates all 320 answers, strips figure markdown and embeds five original figures',()=>{
 const dom=new JSDOM(fs.readFileSync(`${docs}/chapter-10.html`,'utf8'),{runScripts:'dangerously'}),w=dom.window,d=w.document,$=id=>d.getElementById(id);
 const bank=JSON.parse($('bank').textContent);assert.equal(bank.length,320);assert.ok(bank.every(x=>x.chapter===10));
 assert.equal(bank.filter(x=>x.figure).length,5);
 for(const x of bank.filter(x=>x.figure)){
  assert.equal(x.item.type,'CQ');assert.match(x.item.text,/লিখিত সমতুল্য/);
  const bytes=fs.readFileSync(x.evidence.figure.path);assert.equal(sha(bytes),x.evidence.figure.sha256);
  assert.ok(Buffer.from(x.figure.dataUri.split(',')[1],'base64').equals(bytes));
  assert.doesNotMatch(bytes.toString(),/<script|foreignObject|href=|onload=/i);
  assert.equal(x.evidence.figure.origin,'original_editorial_diagram');
 }
 for(const [kind,count] of [['MCQ',200],['SQ',70],['CQ',50]]){
  $('kind').value=kind;$('kind').dispatchEvent(new w.Event('change',{bubbles:true}));
  let seen=0,figures=0;do{
   seen+=d.querySelectorAll('article').length;figures+=d.querySelectorAll('article img').length;
   for(const a of d.querySelectorAll('article')){assert.ok(a.querySelector('details').textContent.length>20);assert.ok(!a.querySelector('h2').textContent.includes('!['));}
   if($('next').disabled)break;$('next').click();
  }while(seen<=count);assert.equal(seen,count);assert.equal(figures,kind==='CQ'?5:0);
 }
 assert.equal(d.querySelectorAll('script[src],iframe,link[href]').length,0);dom.window.close();
});









test('chapter 10 exact count, balanced keys, lexical evidence and count-complete batch 2 retain review gates',()=>{
 const r=read(`${root}/chapter-10/draft-validation.json`),v=read(`${docs}/chapter-10-completion-review.json`);
 assert.deepEqual(r.counts,{MCQ:200,CQ:50,SQ:70});assert.equal(r.targetMet,true);assert.deepEqual(v.counts,r.counts);
 assert.equal(v.total,320);assert.equal(v.globalDraftItems,3200);assert.equal(v.remainingTargetItems,1280);
 const qs=read(`${root}/chapter-10/rebuild-mcq.json`).items;
 const keys=qs.reduce((a,q)=>(a[q.correct]++,a),{A:0,B:0,C:0,D:0});assert.deepEqual(keys,{A:50,B:50,C:50,D:50});assert.deepEqual(v.optionKeyCounts,keys);
 for(const x of [r,v])for(const flag of ['teacherCertified','independentContentReview','nearDuplicateReviewComplete','textbookChapterRead','websiteImported','approved','published'])assert.equal(x[flag],false,flag);
 assert.equal(v.lexicalScreen.exactUniqueStems,320);assert.equal(v.lexicalScreen.semanticCertification,false);assert.equal(v.lexicalScreen.candidatePairs,1);
 const c=v.lexicalScreen.candidates[0];assert.equal(c.type,'MCQ');assert.equal(c.firstStem,qs[c.first-1].text);assert.equal(c.secondStem,qs[c.second-1].text);assert.equal(c.jaccard,0.4);assert.ok(c.authorDisposition.includes('Not independent'));
 assert.equal(plan.batches[1].countTargetMet,true);assert.equal(plan.batches[1].remainingTotal,0);assert.equal(plan.batches[1].complete,false);assert.equal(plan.batches[1].contentReviewComplete,false);
});

test('chapter-10 addition preserves all 92 earlier chapter 1–9 artifacts/readers against ab75bb1',()=>{
 const r=read(`${docs}/chapter-10-completion-review.json`);assert.equal(r.baseline,'ab75bb1');assert.equal(r.preservedEarlierFileCount,92);assert.equal(Object.keys(r.preservedEarlierFileHashes).length,92);
 for(const [p,h] of Object.entries(r.preservedEarlierFileHashes))assert.equal(sha(fs.readFileSync(p)),h,p);
});

test('chapter-10 plant distinctions retain target organ, direction, dormancy and day-neutral limits',()=>{
 const qs=read(`${root}/chapter-10/rebuild-mcq.json`).items;
 for(const [needle,answer] of [
  ['IAA কোন','অক্সিন'],['সাইটোকাইনিনের নামের','কোষ বিভাজনে সহায়তা'],['বায়বীয় অবস্থায়','ইথিলিন'],
  ['স্বল্পদিবসী','প্রজাতিনির্দিষ্ট দীর্ঘ অবিচ্ছিন্ন রাত'],['দিবসনিরপেক্ষ','বৃদ্ধিতে আলোর কোনো প্রয়োজন নেই'],
  ['বীজে ABA ও জিবেরেলিন','সুপ্ততা বজায় রাখা বনাম অঙ্কুরোদ্গমে সহায়তা'],['একই বেশি অক্সিনে মূল','অঙ্গের সংবেদনশীলতা ভিন্ন']
 ]){const q=qs.find(q=>q.text.includes(needle));assert.ok(q,needle);assert.equal(q.options[q.correct],answer);}
 const sq=read(`${root}/chapter-10/rebuild-sq.json`).items;
 assert.ok(sq.find(q=>q.text.includes('স্ট্যাটোলিথের ভূমিকা')).explanation.includes('signaling'));
 for(const fragment of ['নিষেক ছাড়াই','নিষেকের পরে'])assert.ok(sq.find(q=>q.text.includes('পার্থেনোকার্পি মানে')).explanation.includes(fragment));
 assert.ok(sq.find(q=>q.text.includes('লতা পেঁচানো')).explanation.includes('টারগরবদল'));
});

test('chapter-10 neuro-endocrine boundaries and numerical units stay correct',()=>{
 const qs=read(`${root}/chapter-10/rebuild-mcq.json`).items;
 for(const [needle,answer] of [
  ['প্রস্তুত ডেটায় 1.2','0.02 s'],['একই 1 m পথে','A-এর সময় B-এর দ্বিগুণ'],['20টির 15টি','50 শতাংশ-বিন্দু'],
  ['সংবেদী নিউরনের','গ্রাহক থেকে CNS'],['আজ্ঞাবাহী নিউরন','CNS থেকে কার্যকরী অঙ্গ'],['সাধারণ spinal nerve','সংবেদী ও motor তন্তু উভয় আছে'],
  ['পিউপিল বা','আইরিসের মধ্যের ছিদ্র'],['TSH-এর প্রধান','থাইরয়েড'],['ADH ও অক্সিটোসিন','hypothalamus-এ তৈরি, posterior pituitary থেকে মুক্তি']
 ]){const q=qs.find(q=>q.text.includes(needle));assert.ok(q,needle);assert.equal(q.options[q.correct],answer);}
 const sq=read(`${root}/chapter-10/rebuild-sq.json`).items;
 for(const [needle,fragment] of [['1.5 m','20 ms'],['12 জোড়া cranial','86টি'],['0.6 m পথে','60 m/s']])assert.ok(sq.find(q=>q.text.includes(needle)).explanation.includes(fragment));
 const cq=read(`${root}/chapter-10/rebuild-cq.json`).items;
 assert.ok(cq.find(q=>q.text.includes('sensory পথ 0.8')).parts[2].solution.includes('30 ms'));
 assert.ok(cq.find(q=>q.text.includes('আগে glucose 5')).parts[2].solution.includes('হ্রাস 2 mmol/L'));
});

test('chapter-10 clinical safety, conceptual source routes and verified partial-checkpoint scope stay explicit',()=>{
 const r=read(`${docs}/chapter-10-completion-review.json`),es=read(`${root}/chapter-10/source-ledger.json`).entries;
 assert.equal(es.length,320);assert.ok(es.every(e=>e.sourceExercise===null&&!e.generatedFromConceptCards));
 for(const [tag,url] of [
  [':thyroid','https://www.niddk.nih.gov/health-information/endocrine-diseases/hypothyroidism'],
  [':diabetes','https://www.niddk.nih.gov/health-information/diabetes/overview/what-is-diabetes'],
  [':stroke','https://www.cdc.gov/stroke/signs-symptoms/index.html'],
  [':seizure','https://www.cdc.gov/epilepsy/first-aid-for-seizures/index.html'],
  [':Parkinson','https://www.nia.nih.gov/health/parkinsons-disease/parkinsons-disease-causes-symptoms-and-treatments']
 ]){const relevant=es.filter(e=>e.objective.includes(tag));assert.ok(relevant.length);assert.ok(relevant.every(e=>e.backgroundSources.includes(url)));}
 assert.ok(es.filter(e=>e.objective==='10.7').every(e=>e.backgroundSources.includes('https://www.cdc.gov/tobacco/about/how-to-quit.html')));
 assert.equal(r.incrementalBackup.bytes,23807);assert.equal(r.incrementalBackup.md5,'2c2277c25d3ec67a35e118a7dd850995');assert.equal(r.incrementalBackup.independentRemoteGetVerified,true);assert.ok(r.incrementalBackup.scope.includes('200 MCQ'));
 const sq=read(`${root}/chapter-10/rebuild-sq.json`).items;
 for(const [needle,fragment] of [['অচেতন diabetic','শ্বাসনালিতে'],['খিঁচুনিতে নিরাপদ','মুখে বস্তু'],['Stroke-সদৃশ লক্ষণ','জরুরি মূল্যায়ন'],['কাঁপুনি একাই','একাধিক']]){
  const q=sq.find(q=>q.text.includes(needle));assert.ok(q,needle);
  if(needle==='কাঁপুনি একাই')assert.ok(q.explanation.includes('অন্যান্য'));else assert.ok(q.explanation.includes(fragment));
 }
 assert.ok(r.limitations.some(s=>s.includes('Enrichment')));assert.ok(r.limitations.some(s=>s.includes('NINDS')));
});

test('chapter-10 five relevant original figures regenerate and neuron-CQ labels match D node / E terminals',()=>{
 const r=read(`${docs}/chapter-10-completion-review.json`),p=`${root}/chapter-10/assets/`;
 const before=Object.fromEntries(r.diagrams.files.map(f=>[f,sha(fs.readFileSync(p+f))]));
 execFileSync('python3',['scripts/question-bank/biology/draw-chapter-10-figures.py']);assert.equal(r.diagrams.count,5);assert.equal(r.diagrams.productionIntegration,false);
 for(const [f,h] of Object.entries(before))assert.equal(sha(fs.readFileSync(p+f)),h);
 const n=fs.readFileSync(p+'neuron-signaling.svg','utf8');assert.match(n,/D  Node of Ranvier/);assert.match(n,/E  Terminals/);
 const cq=read(`${root}/chapter-10/rebuild-cq.json`).items,q=cq.find(q=>q.text.includes('এক neuron রেখাচিত্রে'));
 assert.ok(q.text.includes('D হলো gap, E হলো terminal'));assert.equal(q.parts[0].question,'D-এর নাম কী?');assert.ok(q.parts[0].solution.includes('র্যানভিয়ারের পর্ব'));assert.ok(q.parts[2].solution.includes('E terminal'));
 assert.match(fs.readFileSync(p+'withdrawal-reflex.svg','utf8'),/not a spinal-cord anatomical cross-section/);
 assert.match(fs.readFileSync(p+'thyroid-feedback.svg','utf8'),/not from the target-tissue effect/);
 assert.match(fs.readFileSync(p+'shoot-phototropism.svg','utf8'),/shaded right-hand side/);
});

test('chapter-11 authored 200 MCQ, 70 SQ and 50 CQ retain exact inputs, answers and provenance',()=>{
 for(const [kind,files,total,width] of [
  ['mcq',['chapter-11-mcq.txt','chapter-11-mcq-b.txt'],200,8],
  ['sq',['chapter-11-sq.txt'],70,4],['cq',['chapter-11-cq.txt','chapter-11-cq-b.txt'],50,11]]){
  const items=read(`${root}/chapter-11/rebuild-${kind}.json`).items;
  const ledger=read(`${root}/chapter-11/source-ledger.json`).entries;let count=0;
  for(const input of files)inputRows(input).forEach((row,i)=>{
   count++;assert.equal(row.length,width);assert.equal(row[0],'11');const q=items.find(q=>q.text===row[1]);assert.ok(q,row[1]);
   const e=ledger.find(e=>e.stemSha256===sha(q.text));assert.equal(e.generatedFromConceptCards,false);
   assert.ok(e.authoringRefs.includes(`scripts/question-bank/biology/${input}:${i+2}`));
   if(kind==='mcq'){
    assert.equal(q.options[q.correct],row[2]);assert.equal(q.explanation,row[6]);
    assert.deepEqual(Object.values(q.options).sort(),row.slice(2,6).sort());
   }else if(kind==='sq')assert.equal(q.explanation,row[2]);
   else{assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);
    q.parts.forEach((p,j)=>{assert.equal(p.question,row[2+2*j]);assert.equal(p.solution,row[3+2*j]);});}
  });assert.equal(count,total);
 }
});

test('chapter-11 reader paginates all 320 answers, strips figure markdown and embeds four original figures',()=>{
 const dom=new JSDOM(fs.readFileSync(`${docs}/chapter-11.html`,'utf8'),{runScripts:'dangerously'}),w=dom.window,d=w.document,$=id=>d.getElementById(id);
 const bank=JSON.parse($('bank').textContent);assert.equal(bank.length,320);assert.ok(bank.every(x=>x.chapter===11));
 assert.equal(bank.filter(x=>x.figure).length,4);
 for(const x of bank.filter(x=>x.figure)){
  assert.equal(x.item.type,'CQ');assert.match(x.item.text,/লিখিত সমতুল্য/);
  const bytes=fs.readFileSync(x.evidence.figure.path);assert.equal(sha(bytes),x.evidence.figure.sha256);
  assert.ok(Buffer.from(x.figure.dataUri.split(',')[1],'base64').equals(bytes));
  assert.doesNotMatch(bytes.toString(),/<script|foreignObject|href=|onload=/i);
  assert.equal(x.evidence.figure.origin,'original_editorial_diagram');
 }
 for(const [kind,count] of [['MCQ',200],['SQ',70],['CQ',50]]){
  $('kind').value=kind;$('kind').dispatchEvent(new w.Event('change',{bubbles:true}));
  let seen=0,figures=0;do{
   seen+=d.querySelectorAll('article').length;figures+=d.querySelectorAll('article img').length;
   for(const a of d.querySelectorAll('article')){assert.ok(a.querySelector('details').textContent.length>20);assert.ok(!a.querySelector('h2').textContent.includes('!['));}
   if($('next').disabled)break;$('next').click();
  }while(seen<=count);assert.equal(seen,count);assert.equal(figures,kind==='CQ'?4:0);
 }
 assert.equal(d.querySelectorAll('script[src],iframe,link[href]').length,0);dom.window.close();
});










test('chapter 11 exact counts, balanced keys and limited lexical screen never close release gates',()=>{
 const v=read(`${docs}/chapter-11-completion-review.json`),r=read(`${root}/chapter-11/draft-validation.json`);
 assert.deepEqual(r.counts,{MCQ:200,CQ:50,SQ:70});assert.equal(v.total,320);assert.equal(v.globalDraftItems,3520);assert.equal(v.remainingTargetItems,960);
 assert.deepEqual(v.mcqKeys,{A:50,B:50,C:50,D:50});assert.equal(v.lexicalScreen.exactUniqueStems,320);assert.equal(v.lexicalScreen.candidatePairs,2);assert.equal(v.lexicalScreen.semanticCertification,false);
 for(const c of v.lexicalScreen.candidates)assert.match(c.authorDisposition,/Not independent/);
 for(const flag of ['teacherCertified','independentContentReview','nearDuplicateReviewComplete','approved','published','websiteImported','textbookChapterRead']){assert.equal(v[flag],false);assert.equal(r[flag],false);}
 assert.deepEqual(plan.batches.map(b=>b.remainingTotal),[0,0,0]);assert.equal(plan.activeChapter,14);
});

test('chapter 11 preserves every earlier chapter 1–10 bank artifact and reader against 5a84276',()=>{
 const v=read(`${docs}/chapter-11-completion-review.json`);assert.equal(v.baseline,'5a84276');assert.equal(v.preservedEarlierFileCount,104);
 for(const [file,hash] of Object.entries(v.preservedEarlierFileHashes)){assert.equal(sha(fs.readFileSync(file)),hash);assert.equal(sha(require('./helpers/biology-historical-bytes.cjs')(v.baseline,file)),hash);}
});

test('chapter 11 plant terminology, gametophyte and fruit-source distinctions remain qualified',()=>{
 const qs=read(`${root}/chapter-11/rebuild-mcq.json`).items,ans=s=>{const q=qs.find(q=>q.text.includes(s));assert.ok(q,s);return q.options[q.correct];};
 assert.equal(ans('গর্ভপত্রের তিনটি'),'গর্ভমুণ্ড, গর্ভদণ্ড, গর্ভাশয়');
 assert.equal(ans('প্রাথমিক সস্য নিউক্লিয়াসের'),'3n');assert.equal(ans('সাধারণ পরিণত ভ্রূণথলির'),'সাত কোষে আট নিউক্লিয়াস');
 assert.equal(ans('এক ফুলের বহু মুক্ত'),'গুচ্ছ ফল');assert.equal(ans('পুরো পুষ্পমঞ্জরির'),'যৌগিক ফল');assert.equal(ans('একই গাছের দুই ফুলের'),'স্ব-পরাগায়ন');
 const sq=read(`${root}/chapter-11/rebuild-sq.json`).items,sol=s=>{const q=sq.find(q=>q.text.includes(s));assert.ok(q,s);return q.explanation;};
 assert.match(sol('পুষ্পাক্ষকে আলাদা স্তবক'),/চারটি floral whorl/);assert.match(sol('পার্থেনোকার্পি ও পার্থেনোজেনেসিস'),/অনিষিক্ত ডিম্বাণু/);assert.match(sol('ডিম্বক, আবরণ'),/মাতৃ উদ্ভিদজাত/);
});

test('chapter 11 numerical examples preserve chromosome sets, denominators and gestation clocks',()=>{
 const sq=read(`${root}/chapter-11/rebuild-sq.json`).items,cq=read(`${root}/chapter-11/rebuild-cq.json`).items;
 for(const [s,a] of [['2n=24','36'],['12টি পরাগ মাতৃকোষ','96'],['15টি ডিম্বকের','30']]){const q=sq.find(q=>q.text.includes(s));assert.ok(q,s);assert.ok(q.explanation.includes(a));}
 for(const [s,a] of [['পরাগ মাতৃকোষ 2n=16','160টি'],['উদ্ভিদ X-এ 2n=18','27'],['1000টি ডিমের','25%'],['দুটি হাসপাতালে','14 দিন'],['সমবয়সী গাছের 20টি','50 শতাংশ-বিন্দু'],['পরীক্ষিত সচেতনতা জরিপে','150%']]){const q=cq.find(q=>q.text.includes(s));assert.ok(q,s);assert.ok(q.parts[2].solution.includes(a),s);}
});

test('chapter 11 human reproduction keeps anatomy, hormonal roles and safe timing boundaries',()=>{
 const qs=read(`${root}/chapter-11/rebuild-mcq.json`).items,ans=s=>{const q=qs.find(q=>q.text.includes(s));assert.ok(q,s);return q.options[q.correct];};
 assert.equal(ans('মানুষে নিষেক সাধারণত'),'ডিম্বনালি');assert.equal(ans('স্বাভাবিক ভ্রূণ সংস্থাপনের'),'জরায়ুর এন্ডোমেট্রিয়াম');assert.equal(ans('FSH ও LH প্রধানত'),'অগ্র পিটুইটারি');assert.equal(ans('প্রোল্যাকটিনের পরিচিত'),'দুধ উৎপাদন উদ্দীপনা');
 assert.match(ans('প্রথম মাসিকের পর থেকেই'),/গর্ভধারণ সম্ভব/);assert.match(ans('সন্তান জন্মের পর মাসিক'),/ডিম্বস্ফোটন হতে পারে/);
 const sq=read(`${root}/chapter-11/rebuild-sq.json`).items,sol=s=>sq.find(q=>q.text.includes(s)).explanation;
 assert.match(sol('দুধ উৎপাদন ও দুধ নির্গমনের'),/প্রোল্যাকটিন/);assert.match(sol('দুধ উৎপাদন ও দুধ নির্গমনের'),/হাইপোথ্যালামাসে তৈরি/);
 assert.match(sol('নাড়ি মাতৃ-ভ্রূণ'),/পৃথক থাকে/);assert.match(sol('নিজের ইচ্ছায় ওষুধ'),/নিজে বন্ধ করাও ক্ষতিকর/);assert.match(sol('বয়ঃসন্ধিকালের পরিবর্তনে'),/গোপনীয়/);
});

test('chapter 11 HIV evidence routes retain effective treatment, window-period limits and no stigma',()=>{
 const es=read(`${root}/chapter-11/source-ledger.json`).entries,v=read(`${docs}/chapter-11-completion-review.json`);
 assert.ok(es.filter(e=>e.objective.startsWith('11.4')).length>30);
 for(const e of es.filter(e=>e.objective.startsWith('11.4')))assert.ok(e.backgroundSources.includes('https://www.who.int/news-room/fact-sheets/detail/hiv-aids'));
 const sq=read(`${root}/chapter-11/rebuild-sq.json`).items,sol=s=>sq.find(q=>q.text.includes(s)).explanation;
 assert.match(sol('ART নিয়ন্ত্রণ'),/সব ভাইরাস নির্মূল করে না/);assert.match(sol('U=U বার্তা'),/যৌনসঙ্গীর/);assert.match(sol('U=U বার্তা'),/সুচ ভাগ/);
 assert.match(sol('Window period ব্যাখ্যা'),/পরীক্ষা-ধরন/);assert.match(sol('সহপাঠীকে আলাদা'),/ছড়ায় না/);
 assert.equal(v.incrementalBackup.bytes,19283);assert.equal(v.incrementalBackup.md5,'c148618ded37cca58ae5b02be7ff2079');assert.equal(v.incrementalBackup.independentRemoteGetVerified,true);assert.match(v.incrementalBackup.scope,/200 MCQ/);
});

test('chapter 11 four relevant diagrams regenerate exactly, labels align and no scripts are embedded',()=>{
 const v=read(`${docs}/chapter-11-completion-review.json`),base=`${root}/chapter-11/assets/`;
 assert.equal(v.diagrams.count,4);assert.equal(v.diagrams.actualCqAttachments,4);assert.equal(v.diagrams.productionIntegration,false);
 execFileSync('python3',['scripts/question-bank/biology/draw-chapter-11-figures.py']);
 for(const [f,h] of Object.entries(v.diagrams.hashes)){const b=fs.readFileSync(f);assert.equal(sha(b),h);assert.doesNotMatch(b.toString(),/<script|foreignObject|href=|onload=/i);}
 for(const [f,labels] of [['flower-section.svg',['A  Stigma','B  Anther','C  Ovary','D  Ovule']],['embryo-sac.svg',['A  Egg cell','B  Two synergids','C  Two polar nuclei','D  Three antipodal cells']],['placental-exchange.svg',['Maternal blood','Fetal blood','blood does not normally mix directly']],['human-development-route.svg',['Oviduct','Uterine lining','implantation']]]){
  const s=fs.readFileSync(base+f,'utf8');for(const l of labels)assert.ok(s.includes(l),l);
 }
 const cq=read(`${root}/chapter-11/rebuild-cq.json`).items;
 assert.match(cq.find(q=>q.text.includes('সাত-কোষী মডেল')).parts[0].solution,/ডিম্বাণু/);
 assert.match(cq.find(q=>q.text.includes('পাশে পুংদণ্ডের')).parts[0].solution,/পরাগধানী/);
});
