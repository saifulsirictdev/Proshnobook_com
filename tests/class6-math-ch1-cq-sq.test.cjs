const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const dir='deliverables/class6-math-ch1';
test('CQ/SQ batch has complete answers, correct mathematics marks and honest review gates',()=>{
 const b=JSON.parse(fs.readFileSync(`${dir}/cq-sq-draft.json`,'utf8'));
 assert.equal(b.CQ.length,30);assert.equal(b.SQ.length,30);
 const ids=new Set();
 for(const q of [...b.CQ,...b.SQ]){
  assert.ok(!ids.has(q.id));ids.add(q.id);
  assert.equal(q.status,'DRAFT_SUBJECT_REVIEW_PENDING');
 }
 for(const q of b.CQ){
  assert.ok(q.stimulus.trim());
  assert.deepEqual(q.parts.map(p=>p.label),['ক','খ','গ']);
  assert.deepEqual(q.parts.map(p=>p.marks),[2,4,4]);
  for(const p of q.parts){assert.ok(p.question.trim());assert.ok(p.solution.trim());assert.equal(p.suggestedRubric.length,2);}
 }
 for(const q of b.SQ){assert.ok(q.question.trim());assert.ok(q.answer.trim());}
 assert.equal(new Set(b.CQ.map(q=>q.stimulus)).size,30);
 assert.equal(new Set(b.SQ.map(q=>q.question)).size,30);
 assert.equal(new Set(b.CQ.map(q=>q.skill)).size,6);
 assert.equal(b.source.fullChapterRead,false);
 const p=JSON.parse(fs.readFileSync(`${dir}/progress.json`,'utf8'));
 assert.equal(p.productionSaved,0);assert.equal(p.teacherReviewed,false);
 assert.equal(p.MCQ_recheckedAgainstFullChapter,false);
});
test('exact arithmetic assertions pass and CQ/SQ artifacts regenerate identically in isolation',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'cq-sq-check-'));
 try {
  fs.mkdirSync(path.join(temp,dir),{recursive:true});
  const result=execFileSync('python3',[path.resolve(dir,'build-cq-sq.py')],{cwd:temp,encoding:'utf8'});
  assert.match(result,/arithmetic assertions passed/);
  for(const name of ['cq-sq-draft.json','cq-sq-review.md','progress.json']){
   assert.equal(fs.readFileSync(path.join(temp,dir,name),'utf8'),fs.readFileSync(path.join(dir,name),'utf8'),name);
  }
 } finally {fs.rmSync(temp,{recursive:true,force:true});}
});
