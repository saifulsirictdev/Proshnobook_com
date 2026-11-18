const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const dir='content/question-bank/class-6/english-1st/';
for(let n=11;n<=19;n++)test(`Lesson ${n} initial source pool: evidence and paper separation`,()=>{
 const id=String(n).padStart(2,'0');const p=JSON.parse(fs.readFileSync(dir+`lesson-${id}-source-draft.json`,'utf8'));
 const qs=fs.readFileSync(dir+`lesson-${id}-questions.md`,'utf8'),ans=fs.readFileSync(dir+`lesson-${id}-answers.md`,'utf8');
 assert.equal(p.source.completeLessonVisuallyRead,true);assert.equal(p.teacherApproved,false);assert.equal(p.fullModelTest,false);
 assert.equal(p.source.sha256,'bc5a1b181b3f60fe35594a061c875d9e5d3d3f42df16296b33b738bdb30c6e3d');assert.deepEqual(p.source.pdfPages,p.source.printedPages.map(x=>JSON.parse(fs.readFileSync(dir+'printed-to-pdf-pages.json','utf8'))[x]));
 const prompts=[];assert.equal(new Set(p.activities.map(a=>a.id)).size,p.activities.length);
 for(const a of p.activities){assert.equal(a.marks,null);assert.ok(qs.includes(a.instruction));assert.equal(p.counts[a.id],a.items?a.items.length:1);
 for(const q of a.items||[]){prompts.push(q.question||q.word+' '+q.request);assert.ok(q.page);assert.ok(qs.includes(q.question||q.word));
 if(q.options){assert.deepEqual(Object.keys(q.options),['A','B','C','D']);assert.equal(new Set(Object.values(q.options)).size,4);assert.ok(q.options[q.answer]);assert.ok(ans.includes(q.explanation));}
 else if(q.modelAnswer){assert.ok(ans.includes(q.modelAnswer));assert.ok(!qs.split('\n').some(line=>/^\d+\. /.test(line)&&line.replace(/^\d+\. /,'')===q.modelAnswer));}
 else {assert.ok(q.acceptedAnswers.length);assert.ok(ans.includes(q.acceptedAnswers[0]));}}
 if(a.modelAnswer){assert.equal(typeof a.modelAnswer,'string');assert.ok(!qs.includes(a.modelAnswer));assert.ok(ans.includes(a.modelAnswer));assert.ok(a.assessment.length>=3);}}
 assert.equal(new Set(prompts).size,prompts.length);
});
test('Audio limitations, historical naming, conflicting source locations and metaphor are explicit',()=>{
 const get=n=>JSON.parse(fs.readFileSync(dir+`lesson-${n}-source-draft.json`,'utf8'));
 assert.ok(get('11').limitations.some(s=>s.includes('No exact listening key')));
 assert.ok(get('13').limitations.some(s=>s.includes('26 March')));
 assert.ok(get('15').limitations.some(s=>s.includes('source inconsistency')));
 for(const n of ['16','17'])assert.equal(get(n).activities.find(a=>a.id==='poem').items.length,8);
 assert.ok(get('18').limitations.some(s=>s.includes('unsupervised')));
 assert.ok(get('19').limitations.some(s=>s.includes('not reconstructed')));
 const b=JSON.parse(fs.readFileSync(dir+'blueprint.json','utf8'));assert.ok(b.lessonQuestionPools.length>=19);assert.equal(b.book.fullRead,false);
 for(const entry of b.lessonQuestionPools){assert.ok(fs.existsSync(dir+entry.file));assert.equal(entry.registered,false);}
});
