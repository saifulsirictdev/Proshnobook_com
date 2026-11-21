const {test}=require('node:test'),assert=require('node:assert/strict');
require('./helpers/class8-reference.cjs');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const {preparedEnglishItems,englishItemsDigest}=require('../lib/english/prepared-items.ts');
const {assembleEnglishItems,englishItemGroups,approvedEnglishItem}=require('../lib/english/item-bank.ts');
const {validateEnglishDraft}=require('../lib/english/draft.ts');
const {validateEnglishOutput}=require('../lib/english/generation.ts');
const {englishLegacyPaper}=require('../lib/english/legacy-builder.ts');
const {englishFlowBlocks}=require('../lib/english/flow-blocks.ts');
const Group=require('../components/paper-builder/english-group.tsx').default;
const full=g=>assembleEnglishItems(preparedEnglishItems(g,1).map(p=>p.draft),g,()=>0).draft;
const plain=s=>s.replace(/<[^>]+>/g,' ').replaceAll('&#x27;',"'").replaceAll('&quot;','"').replaceAll('&amp;','&').replace(/\s+/g,' ').trim();

test('All requested visible categories assemble both papers from their own local prepared stock',()=>{
 for(const grade of [6,7,8,10,11,12])for(const paper of [1,2]){
  const stock=preparedEnglishItems(grade,paper);assert.ok(stock.length);
  for(const random of [()=>0,()=>0.5,()=>0.999]){
   const r=assembleEnglishItems(stock.map(p=>p.draft),grade,random,undefined,{},paper);
   assert.deepEqual(r.missing,[]);assert.ok(r.draft);
   assert.equal(validateEnglishOutput(r.draft.selection,r.draft.output).total,grade<=8&&paper===2?50:100);
   assert.equal(r.draft.selection.grade,grade);assert.equal(r.draft.selection.paper,paper);
  }
 }
});

test('New junior first papers contain image-checked exact-grade prose/poems, complete keys and no false provenance',()=>{
 for(const grade of [7,8]){
  const groups=preparedEnglishItems(grade,1);assert.equal(groups.length,9);
  const d=full(grade);assert.equal(d.output.tasks.length,13);
  assert.deepEqual(d.output.tasks.map(t=>t.subitems.length),[7,5,5,5,5,5,0,5,8,8,0,0,0]);
  assert.equal(new Set(d.output.passages.map(p=>p.key)).size,4);
  assert.equal(d.output.tasks.find(t=>t.id==='poems').subitems.length,8);
  const mcq=d.output.tasks[0].subitems;assert.equal(new Set(mcq.map(s=>s.options.indexOf(s.answer))).size,4);
  assert.equal(validateEnglishOutput(d.selection,d.output).tasks.find(t=>t.id==='poems').answerCount,5);
  for(const p of groups){
   assert.equal(p.review.kind,'TEXTBOOK_SOURCE_ADAPTED_PRACTICE');assert.match(p.review.verification,/compared with rendered source pages/);
   assert.match(p.review.sourceSha256,/^[a-f0-9]{64}$/);
   assert.notEqual(p.review.sourceFileId,'1CnWGL8_8bWQQJ0XQIVXkXckV8uT8AkC-');
   assert.equal(approvedEnglishItem(JSON.stringify({status:'PENDING',draft:p.draft}),grade,1),null);
   assert.ok(p.draft.output.tasks.every(t=>!t.boardSource && !t.schoolSource));
  }
  assert.match(d.output.passages.find(p=>p.key==='unseen').text,/fictional/);
  assert.ok(d.output.tasks.find(t=>t.id==='story').answer.split(/[.!?]\s+/).length>=11);
 }
 assert.match(full(7).selection.sources['seen-1'].text,/Begum Rokeya/);
 assert.match(full(8).selection.sources['seen-1'].text,/rural Bangladesh/);
 assert.match(full(7).selection.sources['textbook-poems'].text,/Whose Child is This/);
 assert.match(full(8).selection.sources['textbook-poems'].text,/Hason Raja/);
});

test('HSC reference grouping isolates comprehension, education flow chart and poem summary; legacy drafts remain compatible',()=>{
 for(const grade of [11,12]){
  const d=full(grade);assert.equal(d.selection.modelStyle,'hsc-first-reference-v1');
  assert.equal(englishItemGroups(d).length,11);
  assert.deepEqual(d.output.tasks.slice(0,4).map(t=>t.passageKey),['seen-1','seen-1','seen-2','summary-text']);
  const groups=preparedEnglishItems(grade,1),info=groups.find(p=>p.group==='seen-2').draft;
  assert.deepEqual(info.selection.itemIds,['information']);assert.deepEqual(Object.keys(info.selection.sources),['seen-2']);
  assert.match(info.selection.sources['seen-2'].text,/Education gives us knowledge/);
  assert.match(groups.find(p=>p.group==='summary-text').draft.selection.sources['summary-text'].text,/Hold fast to dreams/);
  assert.equal(d.output.tasks[0].subitems.length,5);
  assert.equal(d.output.tasks.find(t=>t.id==='graph').table.rows.reduce((s,r)=>s+Number(r[1]),0),100);
  const summary=structuredClone(d);summary.output.tasks[3].passageKey='seen-1';assert.throws(()=>validateEnglishDraft(summary));
  const shortened=structuredClone(d);shortened.output.tasks[0].subitems.pop();assert.throws(()=>validateEnglishDraft(shortened));
  const legacy=structuredClone(d);delete legacy.selection.modelStyle;
  const shared=legacy.selection.sources['seen-1'];legacy.selection.sources={'seen-1':shared};
  legacy.output.passages=[{key:'seen-1',text:shared.text}];
  legacy.output.tasks.slice(0,4).forEach(t=>t.passageKey='seen-1');
  assert.doesNotThrow(()=>validateEnglishDraft(legacy));
  assert.equal(englishItemGroups(legacy).filter(p=>p.group==='seen-1')[0].draft.output.tasks.length,4);
  assert.equal(assembleEnglishItems([...groups.map(p=>p.draft),legacy],grade,()=>0.999).draft.selection.modelStyle,'hsc-first-reference-v1');
 }
 const wrong=structuredClone(full(11));wrong.selection.grade=8;assert.throws(()=>validateEnglishDraft(wrong));
});

test('New first-paper subsets retain only exact atomic source groups and source filters never admit authored practice',()=>{
 for(const grade of [7,8,11,12]){
  const stock=preparedEnglishItems(grade,1).map(p=>p.draft);
  for(const id of ['mcq','information','summary','paragraph']){
   const r=assembleEnglishItems(stock,grade,()=>0,[id],{},1);assert.deepEqual(r.missing,[]);assert.deepEqual(r.draft.output.tasks.map(t=>t.id),[id]);
   const key=r.draft.output.tasks[0].passageKey;
   assert.deepEqual(r.draft.output.passages.map(p=>p.key),key?[key]:[]);
   assert.deepEqual(Object.keys(r.draft.selection.sources),key && key!=='unseen'?[key]:[]);
  }
  const filtered=assembleEnglishItems(stock,grade,()=>0,undefined,{school:'Not an authenticated source'},1);assert.equal(filtered.draft,null);assert.ok(filtered.missing.length);
 }
});

test('New English papers show marks by default without overriding saved display settings',()=>{
 for(const grade of [6,7,8,10,11,12]){
  const d=full(grade),paper=englishLegacyPaper(d);assert.equal(paper.settings.show.marks,true);
  d.builderSettings=structuredClone(paper.settings);d.builderSettings.show.marks=false;
  assert.equal(englishLegacyPaper(d).settings.show.marks,false);
 }
});

test('New first-paper consent digests also bind source-review metadata without changing Class8 second-paper frozen digest',()=>{
 const data=require('../lib/english/data/class7-first-reference-model.json');
 const digest=englishItemsDigest(7,1);data.provenance.normalizations.push('test-only metadata change');
 try{assert.notEqual(englishItemsDigest(7,1),digest);}finally{data.provenance.normalizations.pop();}
 assert.equal(require('../lib/english/prepared-class8-paper2.ts').class8StructuredDigest(),'30d8da8ae12003fc189241ba961e92e8cfd050f39d10d62ad171c9b4c1ba5b8c');
});

test('All new first-paper content and keys survive shared print flow; cloze and table prompts are not duplicated',()=>{
 for(const grade of [7,8,11,12]){
  const d=full(grade),p=englishLegacyPaper(d),before=JSON.stringify(d),blocks=p.items.flatMap(englishFlowBlocks);
  const html=(questions,answers)=>blocks.map(q=>renderToStaticMarkup(React.createElement(Group,{q,s:p.settings,questions,answers}))).join('');
  const questions=plain(html(true,false)),answers=plain(html(false,true));
  for(const passage of d.output.passages)assert.ok(questions.includes(plain(passage.text)),`${grade}/${passage.key}: missing source text`);
  for(const t of d.output.tasks){
   for(const row of t.table?.rows??[])for(const cell of row)assert.ok(questions.includes(plain(cell)));
   for(const a of t.subitems.map(s=>s.answer).concat(t.answer||[]))assert.ok(answers.includes(plain(a)),`${grade}/${t.id}: key missing`);
   if(t.answer)assert.ok(!questions.includes(plain(t.answer)),`${grade}/${t.id}: whole key leaked`);
  }
  for(const q of p.items.filter(q=>q.englishGroup.tasks.some(t=>['gap','cloze-clues','cloze-no-clues','information','matching'].includes(t.id)))){
   const relevant=englishFlowBlocks(q).filter(b=>b.englishGroup.tasks.length);
   for(const b of relevant){const t=b.englishGroup.tasks[0];if(t.id==='vocabulary')continue;
    const text=plain(renderToStaticMarkup(React.createElement(Group,{q:b,s:p.settings,questions:true,answers:false})));
    assert.doesNotMatch(text,/Fill gap|Complete step|Match the sentence parts/);
   }
  }
  assert.equal(JSON.stringify(d),before);
 }
});
