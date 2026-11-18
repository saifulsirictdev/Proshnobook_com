const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const dir='content/question-bank/class-6/english-1st/';
const p=JSON.parse(fs.readFileSync(dir+'original-skills-001.json','utf8'));
test('English skills draft never claims official marks, textbook reading, or registration',()=>{
 assert.equal(p.teacherApproved,false);assert.equal(p.officialDistributionVerified,false);assert.equal(p.fullModelTest,false);assert.equal(p.totalMarks,null);
 assert.equal(p.provenance.textbookSeenPassage,false);assert.equal(p.provenance.sourcePage,null);
 assert.equal(p.activities.length,12);assert.equal(new Set(p.activities.map(a=>a.id)).size,12);
 for(const a of p.activities){assert.equal(a.marks,null);if(a.passageId)assert.ok(p.passages.some(s=>s.id===a.passageId));}
 const b=JSON.parse(fs.readFileSync(dir+'blueprint.json','utf8'));assert.equal(b.officialDistributionVerified,false);assert.equal(b.readyForModelTestAssembly,false);assert.equal(b.lessonCatalog.length,33);
});
test('reading keys complete, distinct options, gap bijection and bounded answers',()=>{
 const a=Object.fromEntries(p.activities.map(x=>[x.id,x]));
 for(const q of a['reading-mcq'].items){assert.equal(Object.keys(q.options).length,4);assert.equal(new Set(Object.values(q.options)).size,4);assert.ok(q.options[q.answer]);assert.ok(q.explanation);}
 for(const q of a['reading-answers'].items){assert.ok(q.modelAnswer);assert.ok(q.requiredIdeas.length);}
 assert.deepEqual(new Set(Object.values(a.cloze.answers)),new Set(a.cloze.wordBox));
 assert.equal(Object.keys(a['information-transfer'].answers).length,5);
 for(const q of a['true-false'].items){assert.equal(typeof q.answer,'boolean');if(!q.answer)assert.ok(q.correction);}
 for(const q of a.vocabulary.items)assert.ok(q.acceptedAnswers.length);
 assert.equal(new Set(Object.values(a.matching.answers)).size,5);for(const [k,v] of Object.entries(a.matching.answers)){assert.ok(a.matching.beginnings[k]);assert.ok(a.matching.endings[v]);}
 assert.deepEqual(new Set(a.rearranging.answer),new Set(Object.keys(a.rearranging.sentences)));
 assert.equal(a.rearranging.answer.length,8);
});
test('separate student paper, writing models and rubric guidance retained',()=>{
 for(const a of p.activities.filter(a=>['summary','story-completion','paragraph-writing','dialogue-writing'].includes(a.kind))){assert.ok(a.modelAnswer);assert.ok(a.assessment.length>=3);}
 const questions=fs.readFileSync(dir+'practice-001-questions.md','utf8'),answers=fs.readFileSync(dir+'practice-001-answers.md','utf8');
 assert.ok(!questions.includes('modelAnswer:'));assert.ok(!questions.includes('Correction:'));assert.ok(answers.includes('Teacher review pending'));
 assert.ok(answers.includes('modelAnswer:'));
});
for(const n of ['002','003'])test(`English original pack ${n}: complete keys, source limits and separate writing models`,()=>{
 const pack=JSON.parse(fs.readFileSync(dir+`original-skills-${n}.json`,'utf8'));
 assert.equal(pack.activities.length,12);assert.equal(new Set(pack.activities.map(a=>a.id)).size,12);
 assert.equal(pack.fullModelTest,false);assert.equal(pack.teacherApproved,false);assert.equal(pack.totalMarks,null);
 assert.equal(pack.provenance.textbookSeenPassage,false);assert.equal(pack.passages[0].origin,'ORIGINAL_UNSEEN');
 assert.ok(pack.passages[0].text.split(/\s+/).length>=150);
 const a=Object.fromEntries(pack.activities.map(x=>[x.id,x]));
 for(const task of pack.activities){assert.equal(task.marks,null);assert.ok(task.instruction);if(task.passageId)assert.ok(pack.passages.some(s=>s.id===task.passageId));}
 assert.equal(a['reading-mcq'].items.length,7);
 for(const q of a['reading-mcq'].items){assert.equal(new Set(Object.values(q.options)).size,4);assert.ok(q.options[q.answer]);assert.ok(q.explanation);}
 assert.equal(a['reading-answers'].items.length,5);for(const q of a['reading-answers'].items){assert.ok(q.modelAnswer);assert.ok(q.requiredIdeas.length);}
 assert.deepEqual(new Set(Object.values(a.cloze.answers)),new Set(a.cloze.wordBox));
 assert.equal(Object.keys(a['information-transfer'].answers).length,5);
 for(const q of a['true-false'].items){assert.equal(typeof q.answer,'boolean');if(!q.answer)assert.ok(q.correction);}
 for(const q of a.vocabulary.items)assert.ok(q.acceptedAnswers.length);
 assert.deepEqual(new Set(Object.keys(a.matching.answers)),new Set(Object.keys(a.matching.beginnings)));
 assert.deepEqual(new Set(Object.values(a.matching.answers)),new Set(Object.keys(a.matching.endings)));
 assert.equal(a.rearranging.answer.length,8);assert.deepEqual(new Set(a.rearranging.answer),new Set(Object.keys(a.rearranging.sentences)));
 for(const id of ['summary','story','paragraph','dialogue']){assert.ok(a[id].modelAnswer);assert.ok(a[id].assessment.length>=3);}
 assert.equal(a.dialogue.modelAnswer.length,10);
 assert.ok(fs.readFileSync(dir+`practice-${n}-questions.md`,'utf8').includes(pack.passages[0].text));
 assert.ok(!fs.readFileSync(dir+`practice-${n}-questions.md`,'utf8').includes(a.story.modelAnswer));
 assert.ok(fs.readFileSync(dir+`practice-${n}-answers.md`,'utf8').includes(a.story.modelAnswer));
});
test('NCTB textbook sample marks reconcile and source-read Lesson 1 stays separate from original unseen packs',()=>{
 const b=JSON.parse(fs.readFileSync(dir+'blueprint.json','utf8'));
 const sample=b.textbookSampleBlueprint;
 assert.equal(b.book.fullRead,false);assert.equal(b.book.editionIndependentlyVerified,true);
 assert.equal(sample.totalMarks,100);assert.equal(sample.durationMinutes,180);
 const marks=b.questionPatternCandidates.map(s=>s.textbookSampleMarks);
 assert.deepEqual(marks,[7,10,5,5,5,5,10,5,8,10,10,10,10]);
 assert.equal(marks.slice(0,10).reduce((a,v)=>a+v,0),70);assert.equal(marks.slice(10).reduce((a,v)=>a+v,0),30);
 assert.equal(sample.poemQuestionsOffered,8);assert.equal(sample.poemQuestionsRequired,5);
 assert.equal(b.officialDistributionVerified,false);assert.equal(sample.noticeApplicabilitySeparatelyConfirmed,false);
 for(const l of b.lessonCatalog){assert.equal(l.pdfPageRange[0]-l.printedPageRange[0],5);assert.equal(l.pdfPageRange[1]-l.printedPageRange[1],5);}
 const p=JSON.parse(fs.readFileSync(dir+'lesson-01-source-draft.json','utf8'));
 assert.equal(p.source.completeLessonVisuallyRead,true);assert.deepEqual(p.source.pdfPages,[6,7,8]);assert.equal(p.teacherApproved,false);assert.equal(p.fullModelTest,false);
 const a=Object.fromEntries(p.activities.map(x=>[x.id,x]));
 assert.equal(a.mcq.items.length,7);for(const q of a.mcq.items){assert.ok(q.options[q.answer]);assert.equal(new Set(Object.values(q.options)).size,4);assert.ok(q.page);}
 assert.equal(a.poem.items.length,8);assert.ok(a.poem.items.every(q=>q.modelAnswer&&q.assessmentGuide));
 assert.equal(a.paragraph.modelAnswer.split(/\s+/).length,120);assert.equal(a.paragraph.modelWordCount,120);
 assert.ok(a.paragraph.note.includes('not facts about Tarun'));
 assert.equal(p.counts.contextualGaps,Object.keys(a.gaps.answers).length);
});
test('Lesson 2 maintains dialogue evidence and both lesson papers separate solutions',()=>{
 const p=JSON.parse(fs.readFileSync(dir+'lesson-02-source-draft.json','utf8'));
 assert.deepEqual(p.source.pdfPages,[9,10,11]);assert.deepEqual(p.source.printedPages,[4,5,6]);assert.equal(p.source.completeLessonVisuallyRead,true);
 assert.equal(p.teacherApproved,false);assert.equal(p.fullModelTest,false);
 const a=Object.fromEntries(p.activities.map(x=>[x.id,x]));
 assert.equal(a.mcq.items.length,7);assert.equal(a['short-answers'].items.length,7);assert.equal(a.vocabulary.items.length,5);assert.equal(a.responses.items.length,5);assert.equal(a.dialogue.modelAnswer.length,10);
 for(const q of a.mcq.items){assert.equal(new Set(Object.values(q.options)).size,4);assert.ok(q.options[q.answer]);assert.ok(q.explanation);assert.match(q.page,/Printed [456] \/ PDF (9|10|11)/);}
 for(const q of a['short-answers'].items)assert.ok(q.modelAnswer);
 assert.ok(a.vocabulary.items.every(q=>q.acceptedAnswers.length));
 assert.equal(a.responses.items.filter(x=>x.function==='sympathy').length,2);
 assert.equal(a.poem,undefined);
 for(const n of ['01','02']){
 const pool=JSON.parse(fs.readFileSync(dir+`lesson-${n}-source-draft.json`,'utf8'));
 const qs=fs.readFileSync(dir+`lesson-${n}-questions.md`,'utf8');const ans=fs.readFileSync(dir+`lesson-${n}-answers.md`,'utf8');
 for(const task of pool.activities){assert.equal(task.marks,null);for(const q of task.items||[]){assert.ok(qs.includes(q.question||q.word));if(q.modelAnswer){assert.ok(!qs.includes(q.modelAnswer));assert.ok(ans.includes(q.modelAnswer));}}}
 }
});
test('Lesson 3 pool keeps passage, picture and original writing provenance separate',()=>{
 const p=JSON.parse(fs.readFileSync(dir+'lesson-03-source-draft.json','utf8'));
 assert.deepEqual(p.source.printedPages,[7,8]);assert.deepEqual(p.source.pdfPages,[12,13]);assert.equal(p.source.completeLessonVisuallyRead,true);assert.equal(p.teacherApproved,false);assert.equal(p.fullModelTest,false);
 const a=Object.fromEntries(p.activities.map(x=>[x.id,x]));assert.equal(a.mcq.items.length,7);assert.equal(a['short-answers'].items.length,5);assert.equal(a.vocabulary.items.length,5);assert.equal(a.poem,undefined);
 const qs=fs.readFileSync(dir+'lesson-03-questions.md','utf8'),answers=fs.readFileSync(dir+'lesson-03-answers.md','utf8');
 for(const task of p.activities){assert.equal(task.marks,null);for(const q of task.items||[]){assert.ok(qs.includes(q.question||q.word));if(q.options){assert.equal(new Set(Object.values(q.options)).size,4);assert.ok(q.options[q.answer]);assert.ok(q.explanation);}else assert.ok(q.modelAnswer||q.acceptedAnswers.length);}
 if(task.modelAnswer){assert.ok(!qs.includes(task.modelAnswer));assert.ok(answers.includes(task.modelAnswer));assert.ok(task.assessment.length>=3);}}
 assert.ok(a.summary.instruction.includes('not the unseen Q7'));assert.ok(a.picture.note.includes('must be available'));assert.ok(a.paragraph.note.includes('Original imagined'));
 assert.equal(a.vocabulary.items.find(x=>x.word==='pick up').acceptedAnswers[0],'put down');
 const b=JSON.parse(fs.readFileSync(dir+'blueprint.json','utf8'));assert.ok(b.lessonQuestionPools.some(x=>x.lesson===3&&x.file==='lesson-03-source-draft.json'));
});
