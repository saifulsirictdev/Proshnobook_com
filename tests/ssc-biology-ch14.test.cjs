const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const {createHash}=require('node:crypto'),{execFileSync}=require('node:child_process'),{JSDOM}=require('jsdom');
function load(file,mocks={}){const m=new Module(path.resolve(file),module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,path.resolve(file));return m.exports;}
const catalog=load('lib/nctb-data.ts'),mcq=load('lib/mcq-import.ts',{'@/lib/nctb-data':catalog});
const {parseQuestionUpload}=load('lib/question-json-import.ts',{'./nctb-data':catalog,'./mcq-import':mcq,'./question-provenance':load('lib/question-provenance.ts')});
const root='content/question-bank/ssc/biology/chapter-14',docs='docs/question-bank/ssc-biology';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),sha=b=>createHash('sha256').update(b).digest('hex');
const bank=kind=>read(`${root}/rebuild-${kind}.json`).items,evidence=()=>read(`${docs}/chapter-14-completion-review.json`);
test('chapter14 has200MCQ/50CQ/70SQ through actual uploader with exact original answers',()=>{
 const ledger=read(`${root}/source-ledger.json`).entries;
 for(const [kind,n,width,suffixes] of [['mcq',200,8,['mcq-a','mcq-b','mcq-c','mcq-d']],['cq',50,11,['cq-a','cq-b']],['sq',70,4,['sq']]]){
  const batch=read(`${root}/rebuild-${kind}.json`),qs=batch.items,parsed=parseQuestionUpload(JSON.stringify(batch),{category:'Class 9',subject:'জীববিজ্ঞান',group:'',topic:batch.topic});assert.equal(parsed.records.length,n);assert.equal(qs.length,n);let count=0;
  for(const suffix of suffixes){const name=`scripts/question-bank/biology/chapter-14-${suffix}.txt`;fs.readFileSync(name,'utf8').split('\n').forEach((line,i)=>{
   if(!line||line.startsWith('#'))return;count++;const r=line.split('|');assert.equal(r.length,width);assert.equal(r[0],'14');const q=qs.find(q=>q.text===r[1]);assert.ok(q,r[1]);
   if(kind==='mcq'){assert.equal(q.options[q.correct],r[2]);assert.equal(q.explanation,r[6]);assert.deepEqual(Object.values(q.options).sort(),r.slice(2,6).sort());}
   else if(kind==='sq')assert.equal(q.explanation,r[2]);
   else{assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);assert.deepEqual(q.parts.map(p=>p.label),['ক','খ','গ','ঘ']);q.parts.forEach((p,j)=>{assert.equal(p.question,r[2+2*j]);assert.equal(p.solution,r[3+2*j]);});}
   const e=ledger.find(e=>e.authoringRefs.includes(`${name}:${i+1}`));assert.ok(e);assert.equal(e.generatedFromConceptCards,false);assert.equal(e.origin,'original_practice');
  });}assert.equal(count,n);
 }
});
test('chapter14 reader paginates320 unique records and embeds three safe relevant diagrams',()=>{
 const dom=new JSDOM(fs.readFileSync(`${docs}/chapter-14.html`,'utf8'),{runScripts:'dangerously'}),w=dom.window,d=w.document,$=id=>d.getElementById(id),records=JSON.parse($('bank').textContent),seen=new Set();
 assert.equal(records.length,320);assert.ok(records.every(r=>r.chapter===14));assert.equal(records.filter(r=>r.figure).length,3);
 while(true){for(const e of d.querySelectorAll('article .meta'))if(e.textContent.startsWith('bio-'))seen.add(e.textContent.split(' · ')[0]);if($('next').disabled)break;$('next').click();}
 assert.equal(seen.size,320);assert.equal($('page').textContent,'16 / 16');$('kind').value='CQ';$('kind').dispatchEvent(new w.Event('change'));assert.ok(d.querySelector('img'));$('toggle').click();assert.ok([...d.querySelectorAll('details')].every(e=>e.open));
 for(const r of records.filter(r=>r.figure)){const b=fs.readFileSync(r.evidence.figure.path);assert.equal(sha(b),r.evidence.figure.sha256);assert.ok(Buffer.from(r.figure.dataUri.split(',')[1],'base64').equals(b));assert.match(r.item.text,/লিখিত সমতুল্য/);assert.doesNotMatch(b.toString(),/<script|foreignObject|href=|onload=/i);}
 assert.equal(d.querySelectorAll('script[src],iframe,link[href]').length,0);dom.window.close();
});
test('chapter14 preserves137 earlier artifacts and honest author-only review gates',()=>{
 const v=evidence();assert.equal(v.preservedEarlierFileCount,137);
 for(const [name,hash] of Object.entries(v.preservedEarlierFileHashes)){assert.equal(sha(fs.readFileSync(name)),hash);assert.ok(execFileSync('git',['show',`${v.baseline}:${name}`]).equals(fs.readFileSync(name)));}
 assert.equal(v.total,320);assert.equal(v.globalDraftItems,4480);assert.equal(v.remainingTargetItems,0);assert.deepEqual(v.mcqKeys,{A:50,B:50,C:50,D:50});assert.equal(v.lexicalScreen.candidatePairs,3);assert.equal(v.lexicalScreen.exactUniqueStems,320);
 for(const c of v.lexicalScreen.candidates)assert.match(c.authorDisposition,/Not independent/);
 for(const f of ['teacherCertified','independentContentReview','nearDuplicateReviewComplete','textbookChapterRead','websiteImported','approved','published'])assert.equal(v[f],false);
 assert.equal(v.incrementalBackup.bytes,52150);assert.equal(v.incrementalBackup.independentRemoteGetVerified,true);
});
test('chapter14 arithmetic uses correct denominators and qualified product/safety evidence',()=>{
 const sq=bank('sq'),solution=needle=>{const q=sq.find(q=>q.text.includes(needle));assert.ok(q,needle);return q.explanation;};
 assert.match(solution('120 এক্সপ্লান্টে96'),/80%.*75%.*60%/);assert.match(solution('200 কালচারের30'),/15%.*170/);assert.match(solution('ফলন20 থেকে25'),/25%/);
 assert.match(solution('ভারী ধাতু'),/মৌল বিলুপ্ত হয় না/);assert.match(solution('পানযোগ্য'),/স্বাদ নিয়ে নিরাপত্তা পরীক্ষা নয়/);assert.match(solution('নাম মুছলেই'),/পুনঃসনাক্তকরণ/);
 const cq=bank('cq'),q=cq.find(q=>q.text.includes('মোট প্রোটিন যথাক্রমে12'));assert.match(q.parts[2].solution,/25%/);assert.match(q.parts[3].solution,/অযাচাইকৃত/);
 assert.match(cq.find(q=>q.text.includes('মানব ইনসুলিন')).parts[3].solution,/চিকিৎসকের/);
});
test('chapter14 static diagrams and builder reproduce exact canonical bytes',()=>{
 execFileSync('python3',['scripts/question-bank/biology/draw-chapter-14-figures.py']);execFileSync('python3',['scripts/question-bank/build-ssc-biology-drafts.py','--check']);
 for(const name of ['tissue-culture-route','recombinant-dna-route','evidence-stages'])assert.match(fs.readFileSync(`${root}/assets/${name}.svg`,'utf8'),/conceptual|Conceptual|evidence/i);
});
