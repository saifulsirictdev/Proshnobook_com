const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),Module=require('node:module'),katex=require('katex');
function load(file,mocks={}){const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return m.exports;}
const data=load('lib/nctb-data.ts'),mcq=load('lib/mcq-import.ts',{'@/lib/nctb-data':data}),p=load('lib/question-provenance.ts');
const importer=load('lib/question-json-import.ts',{'./nctb-data':data,'./mcq-import':mcq,'./question-provenance':p});
const root='content/question-bank/ssc/math/chapter-3/';
const raw=fs.readFileSync(root+'board-seed-v1.json','utf8'),input=JSON.parse(raw),review=JSON.parse(fs.readFileSync(root+'validation.json','utf8'));
const scope={category:'Class 9',subject:'গণিত',group:'',topic:'৩য় অধ্যায়: বীজগাণিতিক রাশি'};
test('chapter 3 first board slice passes unchanged strict importer and source labels',()=>{
 const {records}=importer.parseQuestionUpload(raw,scope);assert.equal(records.length,7);
 assert.ok(Buffer.byteLength(raw)<750000);assert.equal(new Set(records.map(q=>mcq.normalizeStem(q.text))).size,7);
 for(const row of records){assert.ok(row.explanation.trim());assert.equal(p.questionProvenanceLabels({options:row.options}).length,1);}
 for(const q of input.items){assert.equal(q.provenance[0].examYear,2024);assert.equal(+q.provenance[0].printedPage,q.provenance[0].pdfPage+141);}
});
test('new 300/150/100 target is recorded as 550, with honest source-only shortfall and no import/approval',()=>{
 assert.deepEqual(review.targetCounts,{MCQ:300,CQ:150,SQ:100});
 assert.equal(Object.values(review.targetCounts).reduce((a,b)=>a+b),550);
 assert.deepEqual(review.counts,{MCQ:6,CQ:1,SQ:0});
 assert.deepEqual(review.remaining,{MCQ:294,CQ:149,SQ:100});
 for(const k of ['MCQ','CQ','SQ'])assert.equal(review.counts[k]+review.remaining[k],review.targetCounts[k]);
 assert.equal(review.targetMet,false);assert.equal(review.teacherApproved,false);assert.equal(review.databaseCountVerified,false);
 assert.deepEqual(review.importedCounts,{MCQ:0,CQ:0,SQ:0});
 assert.deepEqual(review.sourcePriority,['board-paper','NCTB-textbook','other-online-source']);
 assert.ok(review.itemReviews.every(q=>q.visualRead));assert.equal(review.itemReviews.length,7);
});
test('complete source CQ preserves 2/4/4 and nonzero/positive domain requirements in solutions',()=>{
 const cq=input.items.filter(q=>q.type==='CQ');assert.equal(cq.length,1);
 assert.deepEqual(cq[0].parts.map(p=>p.label),['ক','খ','গ']);assert.deepEqual(cq[0].parts.map(p=>p.marks),[2,4,4]);
 assert.ok(cq[0].parts.every(p=>p.question.trim()&&p.solution.trim()));
 assert.ok(cq[0].parts[0].solution.includes('b\\ne0'));
 assert.ok(cq[0].parts[1].solution.includes('>0'));assert.ok(cq[0].parts[2].solution.includes('a=0'));
 assert.equal(review.excluded.length,1);
});
test('source formula transcription renders without unmatched math or corrupt string escapes',()=>{
 function visit(v){if(typeof v==='string'){
  assert.doesNotMatch(v,/[\x00-\x09\x0b\x0c\x0e-\x1f]/);
  assert.equal((v.match(/\$/g)||[]).length%2,0);
  for(const [,m] of v.matchAll(/\$([^$]+)\$/g))katex.renderToString(m,{throwOnError:true,strict:'error',trust:false});
 }else if(v&&typeof v==='object')Object.values(v).forEach(visit);}
 visit(input.items);
});
