const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),Module=require('node:module');
const {execFileSync}=require('node:child_process');
function load(file,mocks={}){const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return m.exports;}
const data=load('lib/nctb-data.ts');
const mcq=load('lib/mcq-import.ts',{'@/lib/nctb-data':data});
const provenance=load('lib/question-provenance.ts');
const upload=load('lib/question-json-import.ts',{'./nctb-data':data,'./mcq-import':mcq,'./question-provenance':provenance});
const base='content/question-bank/ssc/math/chapter-2/';
const raw=fs.readFileSync(base+'board-seed-v1.json','utf8'),batch=JSON.parse(raw);
const review=JSON.parse(fs.readFileSync(base+'validation.json','utf8'));
const selection={category:'Class 9',subject:'গণিত',group:'',topic:'২য় অধ্যায়: সেট ও ফাংশন'};
test('chapter 2 first source slice passes real strict upload catalog/schema',()=>{
 const result=upload.parseQuestionUpload(raw,selection);
 assert.equal(result.records.length,4);
 assert.ok(Buffer.byteLength(raw)<750000);
 assert.match(result.digest,/^[a-f0-9]{64}$/);
 for(const row of result.records){assert.ok(row.explanation.trim());assert.equal(row.options._provenance.length,1);}
});
test('new owner quotas are recorded, not falsely represented as stock or imported counts',()=>{
 assert.deepEqual(review.targetCounts,{MCQ:300,CQ:100,SQ:70});
 for(const kind of ['MCQ','CQ','SQ']){
  assert.equal(review.counts[kind],batch.items.filter(q=>q.type===kind).length);
  assert.equal(review.counts[kind]+review.remaining[kind],review.targetCounts[kind]);
  assert.equal(review.importedCounts[kind],0);
 }
 assert.equal(review.targetMet,false);assert.equal(review.teacherApproved,false);
 assert.equal(review.databaseCountVerified,false);assert.equal(review.chapterTextbookRead,false);
 assert.match(review.previousChapter.status,/PAUSED_INCOMPLETE/);
});
test('source traceability and non-inflated complete 2/4/4 CQ structures survive importer',()=>{
 const {records}=upload.parseQuestionUpload(raw,selection);
 assert.equal(batch.items.filter(q=>q.type==='CQ').length,2);
 for(const [i,q] of batch.items.entries()){
  assert.equal(q.provenance[0].examYear,2024);
  assert.equal(Number(q.provenance[0].printedPage),q.provenance[0].pdfPage+141);
  assert.equal(review.itemReviews[i].visualRead,true);
  assert.ok(review.itemReviews[i].adaptation.includes('সমাধান'));
  if(q.type==='CQ'){
   assert.deepEqual(q.parts.map(p=>p.marks),[2,4,4]);
   assert.deepEqual(q.parts.map(p=>p.label),['ক','খ','গ']);
   assert.ok(q.parts.every(p=>p.question.trim()&&p.solution.trim()));
   assert.deepEqual(records[i].options.marks,{k:2,kh:4,g:4});
  }else {assert.equal(q.correct,'A');assert.equal(Object.keys(q.options).length,4);}
 }
 assert.ok(review.excluded.some(q=>q.pdfPage===12));
 assert.ok(review.excluded.some(q=>q.pdfPage===78));
});
test('solutions retain excluded values after rational-function cancellation',()=>{
 const cq=batch.items.find(q=>q.type==='CQ'&&q.provenance[0].board==='dinajpur');
 const solution=cq.parts[2].solution;
 assert.ok(solution.includes('x\\ne0'));assert.ok(solution.includes('x^2\\ne3'));
 assert.ok(solution.includes('x^2\\ne1'));assert.ok(solution.includes('\\frac{2}{x^2-1}'));
 const other=batch.items.find(q=>q.type==='CQ'&&q.provenance[0].board==='cumilla');
 assert.ok(other.parts[2].solution.includes('x\\ne0'));
});
test('source seed artifacts reproduce with exact rational, set and domain calculations',()=>{
 const output=execFileSync('python3',['scripts/question-bank/build-ssc-math-ch2-board-seed.py','--check'],{encoding:'utf8'});
 assert.match(output,/PASS:/);assert.match(output,/no database writes/);
});
