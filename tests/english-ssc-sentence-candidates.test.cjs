const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..');
const hash=text=>createHash('sha256').update(text).digest('hex');
const load=item=>JSON.parse(fs.readFileSync(path.join(root,`docs/english/work-in-progress/ssc-paper2-${item}-candidates.json`),'utf8'));
for(const [item,count,distinct] of [['transformation',102,99],['tags',102,96]]){
 test(`${item}: raw extraction preserves source identity, original marks, hashes and all statements`,()=>{
  const data=load(item);assert.equal(data.status,'EXTRACTED_UNREVIEWED_NOT_IMPORTABLE');assert.equal(data.answerStatus,'NOT_AUTHORED');assert.equal(data.candidates.length,count);
  assert.equal(new Set(data.candidates.map(e=>e.normalizedQuestionSha256)).size,distinct);
  const ids=new Map(data.candidates.map(e=>[e.candidateId,e]));assert.equal(ids.size,count);
  assert.deepEqual(data.candidates.reduce((a,e)=>(a[e.sourceKind]++,a),{board:0,school:0}),{board:45,school:57});
  for(const e of data.candidates){
   assert.ok(data.sources.some(s=>s.fileId===e.sourceFile&&s.sha256===e.sourceSha256));assert.equal(e.answerStatus,'NOT_AUTHORED');assert.equal(e.reviewStatus,'EXTRACTED_UNREVIEWED_NOT_IMPORTABLE');
   assert.equal(e.originalSubitemCount,e.sourceSubitems.length);assert.deepEqual(e.sourceSubitems.map(s=>s.label),[...'abcdefghij'].slice(0,e.originalSubitemCount));
   assert.equal(e.rawTextSha256,hash(e.sourceRawText));assert.equal(e.sourceContentSha256,hash(JSON.stringify({instruction:e.sourceInstruction,subitems:e.sourceSubitems})));
   assert.ok(e.pdfPage>0);assert.ok(e.questionNumber>0);assert.ok(e.originalMarks>0);
   assert.equal(e.normalizedQuestionSha256,hash(e.sourceSubitems.map(s=>s.text.toLowerCase().replace(/[^a-z0-9]/g,'')).join('|')));
   assert.ok(e.sourceSubitems.every(s=>s.text.length>5&&!s.answer));
   assert.ok(!Object.hasOwn(e,'answers'));assert.doesNotMatch(e.sourceSubitems.map(s=>s.text).join(' '),/<<PAGE|SSC English Test Papers|English Second Paper : Questions|[\uE000-\uF8FF]/);
   if(e.sourceKind==='school'){assert.ok(e.school);assert.ok(['Test','Pre-Test'].includes(e.examType));assert.equal(e.board,undefined);assert.ok([2024,2025].includes(e.examYear));}
   else{assert.ok(e.board);assert.equal(e.school,undefined);assert.equal(e.examType,undefined);}
   if(e.duplicateOf){assert.ok(e.issues.includes('EXACT_REPRINT'));assert.equal(e.normalizedQuestionSha256,ids.get(e.duplicateOf).normalizedQuestionSha256);}
  }
 });
 test(`${item}: 51 provisional authoring slots span all three source PDFs without counting reprints`,()=>{
  const data=load(item),queue=data.authoringQueue;
  assert.equal(queue.status,'PROVISIONAL_NOT_CONTENT_APPROVED');assert.equal(queue.selectedCandidateIds.length,51);assert.equal(new Set(queue.selectedCandidateIds).size,51);
  const selected=queue.selectedCandidateIds.map(id=>data.candidates.find(e=>e.candidateId===id));assert.ok(selected.every(Boolean));
  assert.equal(selected.filter(e=>e.sourceKind==='board').length,30);assert.equal(selected.filter(e=>e.sourceKind==='school'&&e.examYear===2025).length,15);assert.equal(selected.filter(e=>e.sourceKind==='school'&&e.examYear===2024).length,6);
  assert.equal(new Set(selected.map(e=>e.sourceFile)).size,3);assert.equal(new Set(selected.map(e=>e.normalizedQuestionSha256)).size,51);
  for(const e of selected){assert.deepEqual(e.issues,[]);assert.equal(e.originalSubitemCount,data.currentBlueprintSubitemCount);assert.equal(e.originalMarks,data.currentBlueprintMarks);assert.equal(e.answerStatus,'NOT_AUTHORED');}
  for(const hold of queue.nearReprintHolds){assert.equal(hold.reason,'POSSIBLE_NEAR_REPRINT');assert.ok(hold.trigramJaccard>=0.4);assert.ok(data.candidates.some(e=>e.candidateId===hold.candidateId));assert.ok(queue.selectedCandidateIds.includes(hold.similarTo));assert.ok(!queue.selectedCandidateIds.includes(hold.candidateId));}
 });
}
test('Shortened source exams are preserved, not padded, truncated or relabelled as malformed',()=>{
 const transformation=load('transformation'),tags=load('tags');
 const short=transformation.candidates.filter(e=>e.sourceKind==='board'&&e.examYear===2022);
 const seven=tags.candidates.filter(e=>e.sourceKind==='board'&&e.examYear===2023);
 assert.equal(short.length,9);assert.equal(seven.length,9);
 for(const e of short){assert.equal(e.originalSubitemCount,5);assert.equal(e.originalMarks,5);assert.equal(e.questionNumber,3);assert.deepEqual(e.issues,['SOURCE_COUNT_DIFFERS_FROM_CURRENT_BLUEPRINT']);}
 for(const e of seven){assert.equal(e.originalSubitemCount,7);assert.equal(e.originalMarks,7);assert.equal(e.questionNumber,8);assert.deepEqual(e.issues,['SOURCE_COUNT_DIFFERS_FROM_CURRENT_BLUEPRINT']);}
 const rajshahi=transformation.candidates.find(e=>e.board==='Rajshahi'&&e.examYear===2023);assert.ok(rajshahi.issues.includes('TRANSFORMATION_DIRECTION_REQUIRES_MANUAL_REVIEW'));
 assert.equal(rajshahi.sourceSubitems[6].text,'By reading newspaper, we can enrich our knowledge.');
});
test('Archived raw source candidates stay outside runtime imports; authored review batches are registered separately',()=>{
 const registry=fs.readFileSync(path.join(root,'lib/english/prepared-ssc-paper2.ts'),'utf8');
 assert.ok(registry.includes('preparedSSCVerbItems'));assert.ok(registry.includes('preparedSSCSubstitutionItems'));
 assert.doesNotMatch(registry,/sentence-candidates|work-in-progress|preparedSSCTransformation|preparedSSCTags/);
 for(const dir of ['app','lib','components']){
  function visit(p){for(const e of fs.readdirSync(p,{withFileTypes:true})){const full=path.join(p,e.name);if(e.isDirectory())visit(full);else if(/\.(?:ts|tsx|json)$/.test(e.name))assert.doesNotMatch(fs.readFileSync(full,'utf8'),/ssc-paper2-(?:transformation|tags)-candidates\.json/,full);}}
  visit(path.join(root,dir));
 }
});
