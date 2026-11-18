const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const dir='content/question-bank/class-6/english-1st/';
for(let n=4;n<=10;n++)test(`Lesson ${n}: evidence, keys and student/teacher separation`,()=>{
 const id=String(n).padStart(2,'0');const p=JSON.parse(fs.readFileSync(dir+`lesson-${id}-source-draft.json`,'utf8'));
 const qs=fs.readFileSync(dir+`lesson-${id}-questions.md`,'utf8');const ans=fs.readFileSync(dir+`lesson-${id}-answers.md`,'utf8');
 assert.equal(p.source.sha256,'bc5a1b181b3f60fe35594a061c875d9e5d3d3f42df16296b33b738bdb30c6e3d');
 assert.equal(p.source.completeLessonVisuallyRead,true);assert.deepEqual(p.source.pdfPages,p.source.printedPages.map(x=>JSON.parse(fs.readFileSync(dir+'printed-to-pdf-pages.json','utf8'))[x]));
 assert.equal(p.teacherApproved,false);assert.equal(p.fullModelTest,false);assert.match(p.status,/DRAFT_NOT_REGISTERED/);
 assert.equal(new Set(p.activities.map(x=>x.id)).size,p.activities.length);
 const prompts=[];
 for(const a of p.activities){assert.equal(a.marks,null);assert.ok(a.instruction);assert.equal(p.counts[a.id],a.items?a.items.length:1);
  for(const q of a.items||[]){const prompt=q.question||q.word+' '+q.request;prompts.push(prompt);assert.ok(q.page);assert.ok(qs.includes(q.question||q.word));
   if(q.options){assert.deepEqual(Object.keys(q.options),['A','B','C','D']);assert.equal(new Set(Object.values(q.options)).size,4);assert.ok(q.options[q.answer]);assert.ok(q.explanation);assert.ok(ans.includes(q.explanation));}
   else if(q.modelAnswer){assert.ok(ans.includes(q.modelAnswer));assert.ok(!qs.split('\n').some(line=>/^\d+\. /.test(line)&&line.replace(/^\d+\. /,'')===q.modelAnswer));}
   else{assert.ok(q.acceptedAnswers.length);assert.ok(ans.includes(q.acceptedAnswers[0]));}
  }
  if(a.modelAnswer){assert.ok(a.assessment.length>=3);for(const text of typeof a.modelAnswer==='string'?[a.modelAnswer]:a.modelAnswer.map(x=>x.text)){assert.ok(ans.includes(text));assert.ok(!qs.includes(text));}}
 }
 assert.equal(new Set(prompts).size,prompts.length);
});
test('Source-specific ambiguity and clinical limitations remain explicit',()=>{
 const get=n=>JSON.parse(fs.readFileSync(dir+`lesson-${n}-source-draft.json`,'utf8'));
 assert.ok(JSON.stringify(get('04')).includes('Both are guesses'));
 const p7=get('07');assert.equal(p7.activities.find(a=>a.id==='poem').items.length,8);assert.ok(!p7.activities.some(a=>a.id==='mcq'));
 const p8=get('08');const answers=p8.activities.find(x=>x.id==='quantity-reading').items;
 assert.equal(answers[0].modelAnswer,'Half a kilogram (0.5 kg).');assert.equal(answers[1].modelAnswer,'Two kilograms (2 kg).');
 assert.ok(JSON.stringify(p8).includes('Requests and offers can use some'));
 const p9=get('09');assert.ok(p9.limitations.some(s=>s.includes('Audio for Section F was not supplied')));
 const p10=get('10');assert.equal(p10.safetyReview.status,'TREATMENT_INSTRUCTIONS_QUARANTINED');assert.equal(p10.safetyReview.clinicalApproval,false);
 assert.ok(p10.limitations.some(s=>s.includes('natural substances also contain chemicals')));
 const b=JSON.parse(fs.readFileSync(dir+'blueprint.json','utf8'));assert.ok(b.lessonQuestionPools.length>=10);assert.equal(b.book.fullRead,false);
 for(const entry of b.lessonQuestionPools){assert.equal(entry.registered,false);assert.ok(fs.existsSync(dir+entry.file));}
});
