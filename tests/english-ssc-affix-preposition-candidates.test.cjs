const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..');
const load=item=>JSON.parse(fs.readFileSync(path.join(root,`docs/english/work-in-progress/ssc-paper2-${item}-candidates.json`),'utf8'));
const sha=s=>createHash('sha256').update(s).digest('hex');
for(const [item,total,distinct] of [['affixes',102,99],['prepositions',60,57]]){
 test(`${item}: preserve original passages, skill, source metadata, physical pages and independently verifiable hashes`,()=>{
  const data=load(item);assert.equal(data.status,'EXTRACTED_UNREVIEWED_NOT_IMPORTABLE');assert.equal(data.answerStatus,'NOT_AUTHORED');assert.equal(data.currentBlueprintGapCount,5);assert.equal(data.currentBlueprintMarks,5);
  assert.equal(data.candidates.length,total);assert.equal(new Set(data.candidates.map(e=>e.normalizedQuestionSha256)).size,distinct);
  assert.equal(data.paperCoverage.length,102);assert.equal(data.paperCoverage.filter(e=>e.sourceKind==='board').length,45);
  assert.equal(new Set(data.candidates.map(e=>e.candidateId)).size,total);
  const ids=new Map(data.candidates.map(e=>[e.candidateId,e]));
  for(const e of data.candidates){
   assert.ok(data.sources.some(s=>s.fileId===e.sourceFile&&s.sha256===e.sourceSha256));
   assert.equal(e.answerStatus,'NOT_AUTHORED');assert.equal(e.reviewStatus,'EXTRACTED_UNREVIEWED_NOT_IMPORTABLE');assert.ok(!('answers'in e));
   assert.equal(sha(e.sourceRawText),e.rawTextSha256);assert.equal(sha(JSON.stringify({instruction:e.sourceInstruction,passage:e.sourcePassage})),e.sourceContentSha256);
   assert.equal(sha(e.sourcePassage.toLowerCase().replace(/[^a-z0-9]/g,'')),e.normalizedQuestionSha256);assert.ok(e.sourcePassage.length>80);
   assert.deepEqual([...e.sourcePassage.matchAll(/\(([a-z])\)/g)].map(m=>m[1]),e.gapLabels);assert.equal(e.gapLabels.length,e.originalGapCount);
   assert.ok(e.pdfPage>0&&e.questionNumber>0);assert.ok([5,7].includes(e.originalMarks));assert.ok([5,10,14].includes(e.declaredGapCount));
   assert.doesNotMatch(e.sourcePassage,/<<PAGE|SSC English Test Papers|English Second Paper : Questions|[\uE000-\uF8FF]/);
   if(e.sourceKind==='board'){assert.ok(e.board);assert.equal(e.school,undefined);assert.equal(e.examType,undefined);}else{assert.ok(e.school);assert.ok(['Test','Pre-Test'].includes(e.examType));assert.equal(e.board,undefined);assert.ok([2024,2025].includes(e.examYear));}
   if(e.duplicateOf){assert.equal(e.normalizedQuestionSha256,ids.get(e.duplicateOf).normalizedQuestionSha256);assert.ok(e.issues.includes('EXACT_REPRINT'));}
   if(e.declaredGapCount!==e.originalGapCount)assert.ok(e.issues.includes('PRINTED_COUNT_DIFFERS_FROM_LABEL_COUNT'));
  }
 });
 test(`${item}: provisional 51-slot authoring queue discloses 15 adaptations rather than claiming 51 format-ready sets`,()=>{
  const data=load(item),q=data.authoringQueue,ids=new Map(data.candidates.map(e=>[e.candidateId,e]));
  assert.equal(q.status,'PROVISIONAL_NOT_CONTENT_APPROVED');assert.equal(q.selectedCandidateIds.length,51);assert.equal(new Set(q.selectedCandidateIds).size,51);
  assert.equal(q.sourceFormatMatchCandidateIds.length,36);assert.equal(q.adaptationRequiredCandidateIds.length,15);assert.equal(q.additionalSourceFormatMatchSlotsNeeded,15);assert.equal(q.unfilledTargetSlots,0);
  assert.deepEqual(new Set(q.selectedCandidateIds),new Set([...q.sourceFormatMatchCandidateIds,...q.adaptationRequiredCandidateIds]));
  const selected=q.selectedCandidateIds.map(id=>ids.get(id));assert.ok(selected.every(Boolean));assert.equal(new Set(selected.map(e=>e.normalizedQuestionSha256)).size,51);
  for(const id of q.sourceFormatMatchCandidateIds){const e=ids.get(id);assert.equal(e.sourceKind,'school');assert.equal(e.examYear,2025);assert.equal(e.originalGapCount,5);assert.equal(e.originalMarks,5);assert.deepEqual(e.issues,[]);}
  for(const id of q.adaptationRequiredCandidateIds){const e=ids.get(id);assert.ok(e.issues.includes('SOURCE_COUNT_DIFFERS_FROM_CURRENT_BLUEPRINT'));assert.ok([10,14].includes(e.originalGapCount));assert.equal(e.sourceKind,'board');assert.ok(!e.duplicateOf);if(item==='prepositions')assert.equal(e.sourceSkill,'mixed-prepositions-articles');}
  for(const h of q.holds){assert.ok(ids.has(h.candidateId));assert.ok(!q.selectedCandidateIds.includes(h.candidateId));if(h.similarTo){assert.ok(ids.has(h.similarTo));assert.ok(h.trigramJaccard>=0.4);}}
 });
}
test('Affix fourteen-gap/seven-mark 2023 originals remain intact, including (k)–(n) and the year 1971 inside a passage',()=>{
 const data=load('affixes');const originals=data.candidates.filter(e=>e.sourceKind==='board'&&e.examYear===2023);assert.equal(originals.length,9);
 for(const e of originals){assert.equal(e.originalGapCount,14);assert.equal(e.declaredGapCount,14);assert.equal(e.originalMarks,7);assert.deepEqual(e.gapLabels,[...'abcdefghijklmn']);assert.ok(e.issues.includes('SOURCE_COUNT_DIFFERS_FROM_CURRENT_BLUEPRINT'));assert.equal(e.questionNumber,7);}
 const mymensingh=originals.find(e=>e.board==='Mymensingh');assert.ok(mymensingh.sourcePassage.includes('1971.'));assert.ok(mymensingh.sourcePassage.includes('(n)'));
 assert.equal(data.candidates.filter(e=>e.sourceKind==='school'&&e.examYear===2024).length,16);
});
test('Mixed preposition/article originals are never misclassified as standalone five-gap preposition sets',()=>{
 const data=load('prepositions');const mixed=data.candidates.filter(e=>e.sourceSkill==='mixed-prepositions-articles');assert.equal(mixed.length,19);
 assert.equal(mixed.filter(e=>e.sourceKind==='board').length,18);assert.equal(mixed.filter(e=>e.sourceKind==='school').length,1);
 for(const e of mixed){assert.equal(e.originalGapCount,10);assert.equal(e.originalMarks,5);assert.ok(e.issues.includes('MIXED_PREPOSITIONS_AND_ARTICLES_NOT_STANDALONE'));assert.match(e.sourceInstruction,/articles?/i);assert.equal(e.questionNumber,1);}
 assert.equal(data.candidates.filter(e=>e.sourceSkill==='prepositions').length,41);
 for(const e of data.candidates.filter(e=>e.sourceSkill==='prepositions')){assert.equal(e.sourceKind,'school');assert.equal(e.examYear,2025);assert.equal(e.questionNumber,7);}
 const absent=data.paperCoverage.filter(e=>!e.foundSkills.includes('prepositions'));assert.equal(absent.length,42);
 assert.ok(absent.every(e=>e.examYear!==2022&&e.examYear!==2023));
});
test('Missing labels and conflicting declared/observed counts are held, not silently invented or cropped',()=>{
 const data=load('affixes'),q=data.authoringQueue;
 for(const id of ['052','065','082']){
  const e=data.candidates.find(e=>e.candidateId.endsWith('-'+id));assert.ok(e.issues.includes('PRINTED_COUNT_DIFFERS_FROM_LABEL_COUNT'));assert.ok(!q.selectedCandidateIds.includes(e.candidateId));assert.ok(q.holds.some(h=>h.candidateId===e.candidateId));
 }
 const unlabelled=data.candidates.find(e=>e.candidateId.endsWith('-052'));assert.equal(unlabelled.declaredGapCount,5);assert.equal(unlabelled.originalGapCount,0);assert.match(unlabelled.sourcePassage,/responsible/);
 const missing=data.candidates.find(e=>e.candidateId.endsWith('-065'));assert.deepEqual(missing.gapLabels,['a','b','c','e']);
 const mismatch=data.candidates.find(e=>e.candidateId.endsWith('-082'));assert.equal(mismatch.declaredGapCount,5);assert.equal(mismatch.originalGapCount,10);
});
test('New source queues cannot be imported by runtime code; prior prepared items stay registered unchanged',()=>{
 const registry=fs.readFileSync(path.join(root,'lib/english/prepared-ssc-paper2.ts'),'utf8');assert.match(registry,/preparedSSCVerbItems/);assert.match(registry,/preparedSSCSubstitutionItems/);assert.doesNotMatch(registry,/work-in-progress|preparedSSCAffix|preparedSSCPreposition/);
 function visit(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,e.name);if(e.isDirectory())visit(full);else if(/\.(?:ts|tsx|json)$/.test(e.name))assert.doesNotMatch(fs.readFileSync(full,'utf8'),/ssc-paper2-(?:affixes|prepositions)-candidates\.json/,full);}}
 for(const dir of ['app','lib','components'])visit(path.join(root,dir));
});
