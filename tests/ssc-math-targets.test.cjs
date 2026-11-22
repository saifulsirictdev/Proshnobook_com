const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),Module=require('node:module'),crypto=require('node:crypto');
const katex=require('katex');
function load(file,mocks={}){const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return m.exports;}
const json=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const base='content/question-bank/ssc/math/';
const manifest=json(base+'targets-v1-manifest.json');
const data=load('lib/nctb-data.ts'),mcq=load('lib/mcq-import.ts',{'@/lib/nctb-data':data});
const provenance=load('lib/question-provenance.ts');
const upload=load('lib/question-json-import.ts',{'./nctb-data':data,'./mcq-import':mcq,'./question-provenance':provenance});
const mocks={'./question-json-import':upload};
for(const ch of manifest.chapters){for(const f of [...ch.files,ch.validation])mocks['@/'+base+f.file]=json(base+f.file);}
for(const f of ['mcq-1','mcq-2','cq','sq','validation']){const p=base+`chapter-3/target-v1/${f}.json`;mocks['@/'+p]=json(p);}
for(const f of ['mcq','written','validation']){const p=base+`chapter-4/target-v1/${f}.json`;mocks['@/'+p]=json(p);}
for(const f of ['mcq','written','validation']){const p=base+`chapter-5/target-v1/${f}.json`;mocks['@/'+p]=json(p);}
for(const f of ['mcq','written','validation']){const p=base+`chapter-6/target-v1/${f}.json`;mocks['@/'+p]=json(p);}
for(const [ch,files] of [[7,['mcq','cq','sq','validation']],[8,['mcq-1','mcq-2','cq-1','cq-2','sq','validation']],[9,['mcq-1','mcq-2','cq','sq','validation']],[10,['mcq','cq','sq','validation']],[11,['mcq','cq','sq','validation']],[12,['mcq','cq','sq','validation']],[13,['mcq','cq','sq','validation']],[14,['mcq','cq','sq','validation']],[15,['mcq','cq','sq','validation']],[16,['mcq','cq','sq','validation']],[17,['mcq-1','mcq-2','cq-1','cq-2','sq','validation']]])for(const f of files){const p=base+`chapter-${ch}/target-v1/${f}.json`;mocks['@/'+p]=json(p);}
const lib=load('lib/ssc-math-batches.ts',mocks);
const batches=lib.sscMathBatches().filter(b=>manifest.chapters.some(c=>c.topic===b.topic));
const counts=rows=>Object.fromEntries(['MCQ','CQ','SQ'].map(k=>[k,rows.filter(q=>(q.type??q.kind)===k).length]));
function strings(v){return typeof v==='string'?[v]:v&&typeof v==='object'?Object.values(v).flatMap(strings):[];}
test('760 records meet exact chapter targets in five strict-catalog importer batches, without relaxing 200-item/750KB limits',()=>{
 assert.equal(batches.length,5);
 assert.deepEqual(counts(batches.flatMap(b=>b.records)),{MCQ:500,CQ:150,SQ:110});
 for(const chapter of manifest.chapters){
  const all=[];
  for(const entry of chapter.files){
   const raw=fs.readFileSync(base+entry.file,'utf8');assert.ok(Buffer.byteLength(raw)<750000);
   assert.equal(Buffer.byteLength(raw),entry.bytes);
   assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),entry.sha256);
   const {batch,records}=upload.parseQuestionUpload(raw,{category:chapter.category,subject:chapter.subject,group:'',topic:chapter.topic});
   assert.ok(records.length<=200);all.push(...batch.items);
  }
  assert.deepEqual(counts(all),chapter.counts);
  assert.equal(new Set(all.map(q=>mcq.normalizeStem(q.text))).size,all.length,'dedupe across chapter slices');
 }
 assert.deepEqual(manifest.chapters[0].counts,{MCQ:200,CQ:50,SQ:40});
 assert.deepEqual(manifest.chapters[1].counts,{MCQ:300,CQ:100,SQ:70});
});
test('13 original source seeds remain byte-semantically unchanged; 747 original variants never acquire board labels',()=>{
 let source=0,original=0;
 for(const chapter of manifest.chapters){
  const all=chapter.files.flatMap(f=>json(base+f.file).items);
  const seed=json(base+`chapter-${chapter.chapter}/board-seed-v1.json`).items;
  for(const item of seed){const match=all.filter(q=>q.text===item.text);assert.equal(match.length,1);assert.deepEqual(match[0],item);}
  for(const q of all){
   if(q.provenance){source++;assert.equal(provenance.questionProvenanceLabels(q).length,1);}
   else{original++;assert.match(q.page,/নিজস্ব অনুশীলনী/);assert.equal(provenance.questionProvenanceLabels(q).length,0);}
  }
 }
 assert.equal(source,13);assert.equal(original,747);
});
test('every written item has an answer; every CQ retains complete k/kh/g, 2/4/4, non-empty per-part solutions',()=>{
 for(const b of batches)for(const q of b.records){
  assert.ok(q.explanation.trim());
  if(q.kind==='CQ'){
   assert.deepEqual(Object.keys(q.options.subQuestions),['k','kh','g']);
   assert.deepEqual(q.options.marks,{k:2,kh:4,g:4});
   assert.ok(Object.values(q.options.subQuestions).every(v=>typeof v==='string'&&v.trim()));
   for(const label of ['ক)','খ)','গ)'])assert.ok(q.explanation.includes(label));
  }else if(q.kind==='MCQ'){
   assert.equal(Object.keys(q.options).filter(k=>'ABCD'.includes(k)).length,4);
   assert.ok(q.options[q.correct]);
  }else assert.equal(q.correct,'');
 }
});
test('all generated formula fragments render in KaTeX without corrupt Python escapes or unmatched dollar delimiters',()=>{
 let formulas=0;
 for(const chapter of manifest.chapters)for(const entry of chapter.files){
  const input=json(base+entry.file);
  for(const text of strings(input.items)){
   assert.doesNotMatch(text,/[\x00-\x09\x0b\x0c\x0e-\x1f]/);
   assert.equal((text.match(/\$/g)||[]).length%2,0,text);
   for(const [,math] of text.matchAll(/\$([^$]+)\$/g)){
    katex.renderToString(math,{throwOnError:true,strict:'error',trust:false});formulas++;
   }
  }
 }
 assert.ok(formulas>3000);
});
test('completion means numeric targets only, not teacher approval, exhaustive board search, textbook reading or live import',()=>{
 assert.equal(manifest.teacherApproved,false);assert.deepEqual(manifest.importedCounts,{MCQ:0,CQ:0,SQ:0});
 for(const ch of manifest.chapters){const r=json(base+ch.validation.file);
  assert.equal(r.targetMet,true);assert.equal(r.teacherApproved,false);assert.equal(r.fullChapterTextbookRead,false);assert.equal(r.boardSearchExhaustive,false);
  assert.equal(r.databaseCountVerified,false);assert.deepEqual(r.remaining,{MCQ:0,CQ:0,SQ:0});
  assert.deepEqual(r.importedCounts,{MCQ:0,CQ:0,SQ:0});assert.equal(r.itemReviews.length,Object.values(ch.counts).reduce((a,b)=>a+b,0));
  assert.equal(r.itemReviews.filter(i=>i.origin.startsWith('ORIGINAL')).length,Object.values(r.originalPracticeCounts).reduce((a,b)=>a+b,0));
 }
 for(const b of batches){assert.match(b.limitations,/Pending ADMIN/);assert.match(b.limitations,/teacher/i);assert.match(b.provenance.attributionPolicy,/NOT|never/);}
});
test('generated MCQ keys are varied and each has a symbolic audit entry',()=>{
 for(const ch of manifest.chapters){const r=json(base+ch.validation.file);
  const a=r.itemReviews.filter(i=>i.answerExpression!==undefined);
  const expected=r.originalPracticeCounts.MCQ;assert.equal(a.length,expected);
  const keys=new Set(a.map(v=>v.correct));assert.equal(keys.size,4);
  for(const q of a){assert.equal(q.choiceExpressions.length,4);assert.ok('ABCD'.includes(q.correct));}
 }
});
