const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const dir='content/question-bank/class-6/english-1st/';
for(let n=20;n<=33;n++)test(`Lesson ${n}: final first-pass pool source and answer integrity`,()=>{
 const id=String(n).padStart(2,'0');const p=JSON.parse(fs.readFileSync(dir+`lesson-${id}-source-draft.json`,'utf8'));
 const qs=fs.readFileSync(dir+`lesson-${id}-questions.md`,'utf8'),ans=fs.readFileSync(dir+`lesson-${id}-answers.md`,'utf8');
 assert.equal(p.source.completeLessonVisuallyRead,true);assert.deepEqual(p.source.pdfPages,p.source.printedPages.map(x=>JSON.parse(fs.readFileSync(dir+'printed-to-pdf-pages.json','utf8'))[x]));
 assert.equal(p.teacherApproved,false);assert.equal(p.fullModelTest,false);assert.ok(p.limitations.length>=3);
 const prompts=[];
 for(const a of p.activities){assert.equal(a.marks,null);assert.ok(qs.includes(a.instruction));assert.equal(p.counts[a.id],a.items?a.items.length:1);
 for(const q of a.items||[]){assert.ok(q.page);prompts.push(q.question||q.word+' '+q.request);assert.ok(qs.includes(q.question||q.word));if(q.modelAnswer){assert.ok(ans.includes(q.modelAnswer));assert.ok(!qs.split('\n').some(s=>/^\d+\. /.test(s)&&s.replace(/^\d+\. /,'')===q.modelAnswer));}else {assert.ok(q.acceptedAnswers.length);assert.ok(ans.includes(q.acceptedAnswers[0]));}}
 if(a.modelAnswer){const lines=typeof a.modelAnswer==='string'?[a.modelAnswer]:a.modelAnswer.map(x=>x.text);for(const t of lines){assert.ok(ans.includes(t));assert.ok(!qs.includes(t));}}}
 assert.equal(new Set(prompts).size,prompts.length);
});
test('All 33 lessons registered only in Draft blueprint, no website approval claims',()=>{
 const b=JSON.parse(fs.readFileSync(dir+'blueprint.json','utf8'));
 assert.equal(b.lessonCatalog.length,33);assert.equal(b.lessonQuestionPools.length,33);assert.equal(new Set(b.lessonQuestionPools.map(x=>x.lesson)).size,33);
 assert.equal(b.book.all33PrintedLessonsVisuallyRead,true);assert.equal(b.book.fullRead,false);assert.equal(b.officialDistributionVerified,false);
 for(let i=6;i<=105;i++)assert.ok(b.book.visuallyReadPdfPages.includes(i));
 for(const e of b.lessonQuestionPools){assert.equal(e.registered,false);assert.equal(e.teacherApproved,false);assert.ok(fs.existsSync(dir+e.file));}
 assert.equal(b.modelTestDrafts.length,1);assert.equal(b.modelTestDrafts[0].registered,false);
});
test('Complete Draft model reconciles 100 marks and every question shape',()=>{
 const p=JSON.parse(fs.readFileSync(dir+'model-01-draft.json','utf8'));const q=p.questions;
 assert.equal(p.fullModelTest,true);assert.equal(p.teacherApproved,false);assert.equal(p.registered,false);assert.equal(p.officialCircularVerified,false);
 assert.equal(p.totalMarks,100);assert.equal(p.durationMinutes,180);
 assert.deepEqual(q.map(x=>x.number),Array.from({length:13},(_,i)=>i+1));assert.deepEqual(q.map(x=>x.marks),[7,10,5,5,5,5,10,5,8,10,10,10,10]);
 assert.equal(q.slice(0,10).reduce((s,x)=>s+x.marks,0),70);assert.equal(q.slice(10).reduce((s,x)=>s+x.marks,0),30);
 assert.equal(q[0].items.length,7);assert.equal(q[1].items.length,5);assert.equal(Object.keys(q[2].answers).length,5);assert.equal(q[3].items.length,5);
 assert.equal(q[4].rows.length,5);assert.equal(q[5].items.length,5);assert.ok(q[6].modelAnswer);
 assert.equal(Object.keys(q[7].answers).length,5);assert.equal(new Set(Object.values(q[7].answers)).size,5);
 assert.equal(q[8].answer.length,8);assert.deepEqual(new Set(q[8].answer),new Set(Object.keys(q[8].sentences)));
 assert.equal(q[9].items.length,8);assert.equal(q[9].required,5);assert.equal(q[9].marksEach,2);
 assert.ok((q[10].modelAnswer.match(/[^.!?]+[.!?]/g)||[]).length>=10);assert.ok(q[10].modelTitle);assert.equal(q[11].modelAnswer.split(/\s+/).length,120);
 assert.equal(q[12].modelAnswer.length,10);
 assert.deepEqual(p.passages.map(s=>s.id),['S1','S2','U1']);assert.ok(p.passages[2].note.includes('previously taught'));
 for(const t of q){if(t.passageId)assert.ok(p.passages.some(s=>s.id===t.passageId));const r=p.markingRubrics[t.number];assert.ok(r);if(r.components)assert.equal(Object.values(r.components).reduce((s,v)=>s+v,0),t.marks);}
 const qs=fs.readFileSync(dir+'model-01-questions.md','utf8'),ans=fs.readFileSync(dir+'model-01-answers.md','utf8');
 for(const s of p.passages)assert.ok(qs.includes(s.text));for(const i of [6,10,11]){assert.ok(!qs.includes(q[i].modelAnswer));assert.ok(ans.includes(q[i].modelAnswer));}
 assert.ok(ans.includes('author-proposed'));assert.ok(qs.includes('any five'));
});
test('Physical scan page mapping is an explicit complete permutation, not uniform +5',()=>{
 const m=JSON.parse(fs.readFileSync(dir+'printed-to-pdf-pages.json','utf8'));
 assert.equal(Object.keys(m).length,100);assert.deepEqual(Object.values(m).sort((a,b)=>a-b),Array.from({length:100},(_,i)=>i+6));
 for(const [p,pdf] of [[14,18],[38,45],[61,67],[84,92],[88,90],[100,104]])assert.equal(m[p],pdf);
 for(let n=4;n<=33;n++){
 const p=JSON.parse(fs.readFileSync(dir+`lesson-${String(n).padStart(2,'0')}-source-draft.json`,'utf8'));
 for(const a of p.activities)for(const q of a.items||[]){if(q.page){if(q.page==='Printed 21 and 23 / PDF 26 and 28'){assert.equal(m[21],26);assert.equal(m[23],28);continue;}const match=q.page.match(/^Printed (\d+) \/ PDF (\d+)$/);assert.ok(match);assert.equal(Number(match[2]),m[match[1]]);}}
 }
});
