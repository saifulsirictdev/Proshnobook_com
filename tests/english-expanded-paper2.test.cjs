const {test}=require('node:test'), assert=require('node:assert/strict');
require('./helpers/class8-reference.cjs');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const {preparedEnglishItems,englishItemsDigest}=require('../lib/english/prepared-items.ts');
const {englishBlueprint}=require('../lib/english/blueprints.ts');
const {assembleEnglishItems,approvedEnglishItem}=require('../lib/english/item-bank.ts');
const {validateEnglishOutput,englishGenerationPrompt}=require('../lib/english/generation.ts');
const {englishLegacyPaper}=require('../lib/english/legacy-builder.ts');
const {englishFlowBlocks}=require('../lib/english/flow-blocks.ts');
const Group=require('../components/paper-builder/english-group.tsx').default;
const grades=[6,7,11,12];
const full=grade=>assembleEnglishItems(preparedEnglishItems(grade,2).map(p=>p.draft),grade,()=>0,undefined,{},2).draft;
const plain=s=>s.replace(/<[^>]+>/g,'').replaceAll('&#x27;',"'").replaceAll('&quot;','"').replaceAll('&amp;','&');

test('Distinct grade-specific complete paper2 models are prepared, not implicitly approved',()=>{
 for(const grade of grades){
  const items=preparedEnglishItems(grade,2), b=englishBlueprint(grade,2), d=full(grade);
  assert.equal(items.length,b.items.length);assert.equal(new Set(items.map(p=>p.key)).size,b.items.length);
  assert.equal(validateEnglishOutput(d.selection,d.output).total,grade<9?50:100);
  assert.deepEqual(d.output.tasks.map(t=>t.id),b.items.map(t=>t.id));
  assert.deepEqual(b.sections.map(s=>s.marks),grade<9?[30,20]:[60,40]);
  assert.ok(items.every(p=>p.review.kind==='AUTHORED_PRACTICE' && !('status' in p)));
  for(const p of items){
   assert.equal(p.draft.selection.grade,grade);assert.equal(p.draft.selection.paper,2);
   assert.ok(p.draft.output.tasks.every(t=>!t.boardSource && !t.schoolSource));
   for(const status of ['PENDING','REJECTED'])assert.equal(approvedEnglishItem(JSON.stringify({status,draft:p.draft}),grade,2),null);
   assert.ok(approvedEnglishItem(JSON.stringify({status:'APPROVED',draft:p.draft}),grade,2));
   assert.equal(approvedEnglishItem(JSON.stringify({status:'APPROVED',draft:p.draft}),grade,1),null);
  }
  assert.equal(englishItemsDigest(grade,2),englishItemsDigest(grade,2));
  const h=Object.values(d.header.fields).filter(f=>f.enabled).map(f=>f.value).join(' ');
  assert.match(h,/Practice Model Test/);assert.doesNotMatch(h,/Gurudayal|2026|Annual|Board Examination/);
 }
});

test('Junior differences are deliberate, not a relabelled Class8 or HSC paper',()=>{
 const six=full(6),seven=full(7);
 assert.ok(six.output.tasks.some(t=>t.id==='parts-of-speech'));
 assert.ok(!six.output.tasks.some(t=>t.id==='narration'));
 assert.ok(!seven.output.tasks.some(t=>t.id==='parts-of-speech'));
 assert.equal(seven.output.tasks.find(t=>t.id==='narration').subitems.length,5);
 assert.equal(six.selection.writing.composition.words,200);assert.equal(seven.selection.writing.composition.words,250);
 const bodies=d=>new Set(d.output.tasks.map(t=>t.instruction));
 assert.ok([...bodies(six)].filter(s=>bodies(seven).has(s)).length<4);
 for(const d of [six,seven]){
  assert.equal(d.output.tasks.find(t=>t.id==='gap-clues').clues.length,10);
  assert.equal(d.output.tasks.find(t=>t.id==='substitution').table.rows.length,5);
  assert.equal(d.output.tasks.find(t=>t.id==='punctuation').subitems.length,0);
  const sample=d.output.tasks.find(t=>t.id==='composition').answer;
  assert.ok(sample.split(/\s+/).length>=d.selection.writing.composition.words);
 }
});

test('Exact-grade assembly and source-year filters do not substitute these authored models',()=>{
 for(const grade of grades){
  const other=grades.find(g=>g!==grade),stock=preparedEnglishItems(grade,2).map(p=>p.draft);
  assert.equal(assembleEnglishItems(stock,other,()=>0,undefined,{},2).draft,null);
  assert.equal(assembleEnglishItems(stock,grade,()=>0,undefined,{examYear:2026},2).draft,null);
  assert.equal(assembleEnglishItems(stock,grade,()=>0,undefined,{school:'Gurudayal Govt. College, Kishoreganj'},2).draft,null);
 }
 for(const grade of [7,8,11,12])assert.ok(preparedEnglishItems(grade,1).every(p=>p.draft.selection.grade===grade && p.draft.selection.paper===1));
 assert.notEqual(englishItemsDigest(11,2),englishItemsDigest(12,2));
});

test('HSC complete passage alternatives do not weaken other grade/paper/count checks',()=>{
 for(const grade of [11,12])for(const id of ['narration','pronouns','punctuation']){
  const d=structuredClone(preparedEnglishItems(grade,2,id)[0].draft),t=d.output.tasks[0];
  assert.equal(t.subitems.length,0);assert.ok(t.answer.split(/\s+/).length>=20);
  assert.doesNotThrow(()=>validateEnglishOutput(d.selection,d.output));
  for(const instruction of ['Rewrite this passage.','Rewrite this passage.\nInsert passage here.']){
   const bad=structuredClone(d);bad.output.tasks[0].instruction=instruction;
   assert.throws(()=>validateEnglishOutput(bad.selection,bad.output));
  }
  const missing=structuredClone(d);delete missing.output.tasks[0].answer;
  assert.throws(()=>validateEnglishOutput(missing.selection,missing.output));
  const short=structuredClone(d);short.output.tasks[0].answer='Answer here.';
  assert.throws(()=>validateEnglishOutput(short.selection,short.output));
 }
 for(const id of ['articles','verbs','modifiers']){
  const d=structuredClone(preparedEnglishItems(11,2,id)[0].draft);d.output.tasks[0].subitems.pop();
  assert.throws(()=>validateEnglishOutput(d.selection,d.output));
 }
 const junior=structuredClone(preparedEnglishItems(7,2,'narration')[0].draft);
 junior.output.tasks[0]={...full(11).output.tasks.find(t=>t.id==='narration')};
 assert.throws(()=>validateEnglishOutput(junior.selection,junior.output));
});

test('Every new exercise survives shared flow/print rendering, with no duplicate labels or question-only key leaks',()=>{
 for(const grade of grades){
  const d=full(grade),p=englishLegacyPaper(d),before=JSON.stringify(d);
  const blocks=p.items.flatMap(englishFlowBlocks);
  const render=(questions,answers)=>plain(blocks.map(q=>renderToStaticMarkup(React.createElement(Group,{q,s:{...p.settings,show:{...p.settings.show,marks:true}},questions,answers}))).join(''));
  const questions=render(true,false),answers=render(false,true);
  for(const t of d.output.tasks){
   const text=t.id==='substitution'?t.instruction:t.instruction.split('\n').slice(1).join('\n')||t.subitems[0]?.text||t.instruction;
   if(t.table)for(const cell of t.table.rows.flat())assert.ok(questions.includes(cell),`${grade}/${t.id}: table cell lost`);
   assert.ok(questions.includes(text),`${grade}/${t.id}: content lost`);
   for(const key of t.subitems.map(s=>s.answer).concat(t.answer||[]))assert.ok(answers.includes(key),`${grade}/${t.id}: key lost`);
   if(t.answer)assert.ok(!questions.includes(t.answer),`${grade}/${t.id}: whole key leaked`);
  }
  for(const id of ['gap-clues','articles','phrases','modifiers']){
   const t=d.output.tasks.find(t=>t.id===id);if(!t)continue;
   const q=p.items.find(q=>q.englishGroup.tasks.some(t=>t.id===id));
   assert.equal(englishFlowBlocks(q).length,1,`${grade}/${id}: passage split`);
   const html=plain(renderToStaticMarkup(React.createElement(Group,{q,s:p.settings,questions:true,answers:false})));
   assert.equal((html.match(/\(a\)/g)||[]).length,1,`${grade}/${id}: duplicated gap label`);
   assert.doesNotMatch(html,/Fill gap/);
  }
  assert.equal(JSON.stringify(d),before);
 }
});

test('HSC generation contract asks for actual continuous source passage and full rewritten key',()=>{
 const prompt=englishGenerationPrompt(full(11).selection);
 assert.match(prompt,/five speech units, five unclear pronoun references and ten correction positions/);
 assert.match(prompt,/NOT detached questions/);assert.match(prompt,/No invented school, board, exam year/);
 assert.doesNotMatch(englishGenerationPrompt(full(6).selection),/HSC Paper 2 format:/);
});
