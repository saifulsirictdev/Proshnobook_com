const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module'),path=require('node:path'),{createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..'),orig=Module._resolveFilename;
Module._resolveFilename=function(id,parent,...rest){return orig.call(this,id.startsWith('@/')?path.join(root,id.slice(2)):id,parent,...rest)};
require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const kinds=['connectors','punctuation'];
const batches=kinds.map(k=>require(`../lib/english/data/ssc-paper2-${k}-review.json`));
const {preparedEnglishItems,englishItemsDigest}=require('../lib/english/prepared-items.ts');
const {validateEnglishOutput,validateEnglishReferenceShape}=require('../lib/english/generation.ts');
const {approvedEnglishItem,assembleEnglishItems}=require('../lib/english/item-bank.ts');
const {findEnglishBankParts}=require('../lib/english/bank.ts');
const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const savedRecord=(draft,status='APPROVED')=>JSON.stringify({draft,status});
function mocked(file,mocks){const m=new Module(path.resolve(root,file),module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return m.exports;}
for(const batch of batches){
 const kind=batch.item,count=kind==='connectors'?5:1;
 test(`${kind}: 51 complete distinct review sets with answer keys, provenance and reproducible hashes`,()=>{
  assert.equal(batch.items.length,51);assert.equal(batch.reviewStatus,'PREPARED_NOT_IMPORTED');assert.equal(batch.marks,5);assert.match(batch.answerStatus,/NOT official/);
  assert.equal(new Set(batch.items.map(e=>e.id)).size,51);assert.equal(new Set(batch.items.map(e=>e.contentSha256)).size,51);
  const questionOnly=e=>(e.passage??e.questions.join(' ')).toLowerCase().replace(/[^a-z]/g,'');
  assert.equal(new Set(batch.items.map(questionOnly)).size,51);
  for(const e of batch.items){
   assert.equal(e.answers.length,count);assert.ok(e.answers.every(a=>a.trim().length&&!a.includes('____')));assert.ok(e.editorialNotes.length);
   assert.ok(batch.sources.some(s=>s.fileId===e.sourceFile&&s.sha256===e.sourceSha256));
   if(e.sourceSubitems){assert.equal(e.sourceSubitems.length,count);assert.equal(e.sourceContentSha256,sha({instruction:e.sourceInstruction,subitems:e.sourceSubitems}));assert.equal(e.contentSha256,sha({questions:e.questions,answers:e.answers}));}
   else{assert.equal(e.sourceContentSha256,sha({instruction:e.sourceInstruction,passage:e.sourcePassage}));assert.equal(e.contentSha256,sha({passage:e.passage,...(kind==='affixes'?{roots:e.roots}:{}),answers:e.answers}));if(kind==='connectors')assert.deepEqual([...e.passage.matchAll(/\(([a-z])\) ____/g)].map(m=>m[1]),[...'abcde']);else assert.doesNotMatch(e.passage,/____/);}
   if(e.sourceKind==='web'){assert.ok(e.sourceUrl.startsWith('https://'));assert.equal(e.board,undefined);assert.equal(e.school,undefined);assert.equal(e.examYear,undefined);assert.equal(e.pdfPage,undefined);assert.equal(e.originalMarks,undefined);assert.ok(e.webExercise>0);}
   else{assert.ok(e.pdfPage>0&&e.questionNumber>0);assert.ok([5,7,10].includes(e.originalMarks));if(e.sourceKind==='school'){assert.ok(e.school);assert.ok(['Test','Pre-Test'].includes(e.examType));assert.equal(e.board,undefined);}else assert.ok(e.board);}
   assert.doesNotMatch(e.passage??e.questions.join(' '),/[\uE000-\uF8FF]|<<PAGE|SSC English Test Papers/);
  }
 });
 test(`${kind}: all editorial changes replay from source to final practice without silently changing originals`,()=>{
  for(const e of batch.items){
   let texts=e.sourceSubitems?e.sourceSubitems.map(s=>s.text):[e.sourcePassage];
   for(const c of e.editorialChanges){const i=texts.findIndex(t=>t.includes(c.before));assert.ok(i>=0,`${e.id}: missing before fragment ${c.before}`);texts[i]=texts[i].split(c.before).join(c.after);}
   assert.deepEqual(texts,e.questions??[e.passage]);
  }
 });
 for(const grade of [9,10])test(`${kind} Class ${grade}: 51 validated item groups retain exact keys and review snapshots`,()=>{
  const prepared=preparedEnglishItems(grade,2,kind);assert.equal(prepared.length,51);assert.equal(new Set(prepared.map(p=>p.key)).size,51);
  for(let i=0;i<prepared.length;i++){
   const p=prepared[i],e=batch.items[i],d=p.draft,t=d.output.tasks[0],v=validateEnglishOutput(d.selection,d.output);validateEnglishReferenceShape(d.selection,d.output);
   assert.equal(v.total,5);assert.equal(v.tasks[0].marks,5);assert.equal(v.tasks[0].number,kinds.indexOf(kind)+8);assert.equal(d.selection.grade,grade);assert.equal(d.selection.paper,2);assert.deepEqual(d.selection.itemIds,[kind]);assert.deepEqual(d.output.passages,[]);if(kind==='connectors')assert.deepEqual(t.subitems.map(s=>s.answer),e.answers);else{assert.deepEqual(t.subitems,[]);assert.equal(t.answer,e.answers[0]);}
   assert.equal(t.instruction,e.passage?`${e.instruction}\n${e.passage}`:e.instruction);
   if(e.questions)assert.deepEqual(t.subitems.map(s=>s.text),e.questions);
   assert.equal(p.review.sourceContentSha256,e.sourceContentSha256);assert.deepEqual(p.review.editorialChanges,e.editorialChanges);assert.deepEqual(p.review.answers,e.answers);assert.equal(p.review.source.fileId,e.sourceFile);
   if(e.sourceKind==='web'){assert.equal(t.boardSource,undefined);assert.equal(t.schoolSource,undefined);assert.equal(p.review.sourceUrl,e.sourceUrl);}else{const s=t.boardSource??t.schoolSource;assert.equal(s.originalMarks,e.originalMarks);assert.equal(s.questionNumber,e.questionNumber);assert.equal(s.pdfPage,e.pdfPage);if(kind==='affixes'&&e.sourceKind==='board'){assert.equal(s.originalSubitemCount,e.originalAnswerKey.length);assert.deepEqual(s.selectedParts,[...'abcde']);}}
   assert.ok(approvedEnglishItem(savedRecord(d),grade,2));for(const status of ['PENDING','REJECTED'])assert.equal(approvedEnglishItem(savedRecord(d,status),grade,2),null);
   assert.equal(approvedEnglishItem(savedRecord(d),grade===10?9:10,2),null);assert.equal(approvedEnglishItem(savedRecord(d),grade,1),null);
  }
 });
 test(`${kind}: ADMIN-only item-scoped Pending imports bind preview consent and preserve prior decisions`,async()=>{
  const saved=new Map();let calls=0;const db={setting:{createMany:async({data,skipDuplicates})=>{calls++;assert.equal(skipDuplicates,true);for(const r of data)if(!saved.has(r.key))saved.set(r.key,r.value);}}};
  const action=role=>mocked('app/admin/english-review/item-actions.ts',{'@/auth':{auth:async()=>({user:{id:'admin',role}})},'@/lib/db':{db},'next/cache':{revalidatePath(){}}}).importEnglishItems;
  const f=new FormData();f.set('grade','10');f.set('paper','2');f.set('item',kind);f.set('digest',englishItemsDigest(10,2,kind));await action('ADMIN')(f);assert.equal(calls,0);
  f.set('reviewed','yes');await assert.rejects(action('TEACHER')(f),/Forbidden/);assert.equal(calls,0);
  f.set('digest',englishItemsDigest(10,2,'verbs'));await action('ADMIN')(f);assert.equal(calls,0);
  f.set('digest',englishItemsDigest(10,2,kind));await action('ADMIN')(f);assert.equal(saved.size,51);
  for(const value of saved.values()){const record=JSON.parse(value);assert.equal(record.status,'PENDING');assert.deepEqual(record.draft.selection.itemIds,[kind]);assert.equal(record.review.answers.length,count);assert.equal(record.review.source.fileId,record.review.sourceFile);}
  const [key,value]=[...saved][0];saved.set(key,value.replace('PENDING','REJECTED'));await action('ADMIN')(f);assert.equal(saved.size,51);assert.equal(JSON.parse(saved.get(key)).status,'REJECTED');
  const digest=englishItemsDigest(10,2,kind);batch.items[0].editorialNotes.push('changed review');try{assert.notEqual(digest,englishItemsDigest(10,2,kind));}finally{batch.items[0].editorialNotes.pop();}
 });
 test(`${kind}: approved-only bank supports answer/no-answer modes without losing question content`,async()=>{
  const d=preparedEnglishItems(10,2,kind)[0].draft;
  for(const includeAnswers of [true,false]){const r=await findEnglishBankParts({...d.selection,includeAnswers},async(after,prefix)=>prefix==='english-item:v1:'?[{key:'first',value:savedRecord(d)}]:[]);assert.deepEqual(r.missingIds,[]);assert.equal(r.output.tasks[0].instruction,d.output.tasks[0].instruction);if(kind==='connectors')assert.ok(r.output.tasks[0].subitems.every(s=>Boolean(s.answer)===includeAnswers));else{assert.equal(Boolean(r.output.tasks[0].answer),includeAnswers);if(includeAnswers)assert.equal(r.output.tasks[0].answer,d.output.tasks[0].answer);}}
  const pending=await findEnglishBankParts(d.selection,async(after,prefix)=>prefix==='english-item:v1:'?[{key:'pending',value:savedRecord(d,'PENDING')}]:[]);assert.deepEqual(pending.missingIds,[kind]);
 });
}
test('Every prepared entry references an unmodified audit candidate, including raw PDF text, physical page and original examination attribution',()=>{
 for(const b of batches){
  const audit=require(`../docs/english/work-in-progress/ssc-paper2-${b.item}-candidates.json`);assert.equal(audit.status,'SOURCE_AUDIT_NOT_IMPORTABLE');assert.equal(audit.candidates.length,b.item==='connectors'?84:102);
  assert.ok(!fs.readFileSync(path.join(root,'lib/english/prepared-ssc-linking.ts'),'utf8').includes('candidates.json'));
  const sourceIds=new Set();
  for(const e of b.items){
   const c=audit.candidates.find(c=>c.candidateId===e.sourceCandidateId);assert.ok(c);assert.equal(c.duplicateOf,undefined);assert.ok(!sourceIds.has(c.candidateId));sourceIds.add(c.candidateId);
   for(const k of ['sourceFile','sourceSha256','sourceKind','examYear','school','board','examType','pdfPage','questionNumber','originalMarks','sourceInstruction','sourcePassage','sourceRawText','rawTextSha256','sourceContentSha256'])assert.deepEqual(e[k],c[k],`${e.id}/${k}`);
   assert.equal(e.rawTextSha256,createHash('sha256').update(e.sourceRawText).digest('hex'));
   assert.doesNotMatch(e.passage,/Part[–— -]*B|Writing \(40|<<PAGE|\uF0B4|SSC English Test Papers/i);
   if(e.sourceKind==='school')assert.equal(e.examYear,e.sourceFile==='1esU8C-hZwrqxxmTgWMKCzca17W9z_2N8'?2025:2024);
  }
 }
});
test('Punctuation keys change only punctuation/case/spacing, never undisclosed words or invented subquestion marking positions',()=>{
 const b=batches[1],compact=t=>t.toLowerCase().replace(/[^a-z0-9]/g,'');
 for(const e of b.items){
  const a=e.answers[0];assert.equal(compact(a),compact(e.passage),e.id);assert.equal((a.match(/“/g)||[]).length,(a.match(/”/g)||[]).length);assert.match(a,/[.!?”]$/);assert.doesNotMatch(a,/\bi\b|\b(?:dont|cant|havent|didnt)\b/);assert.match(e.editorialNotes.join(' '),/not five fabricated/);
 }
 assert.equal(b.items.filter(e=>e.sourceKind==='board').length,30);assert.equal(b.items.filter(e=>e.sourceKind==='school').length,21);
});
test('Connector keys are five filled linking expressions and selection excludes near-reprints and malformed four-gap originals',()=>{
 const b=batches[0];assert.equal(b.items.filter(e=>e.sourceKind==='board').length,22);assert.equal(b.items.filter(e=>e.sourceKind==='school').length,29);
 const selected=new Set(b.items.map(e=>e.sourceCandidateId.slice(-3)));
 for(const held of ['007','013','021','022','029','030','033','037','038','039','040','044','052','056','058','059','061','063','067','069','074','076','080','081','082'])assert.ok(!selected.has(held));
 for(const e of b.items){assert.equal(e.answers.length,5);for(const label of 'abcde')assert.equal(e.passage.split(`(${label}) ____`).length,2);}
 const audit=require('../docs/english/work-in-progress/ssc-paper2-connectors-candidates.json');assert.ok(audit.candidates.find(e=>e.candidateId.endsWith('-044')).issues.includes('NOT_FIVE_GAP_SOURCE'));
});
test('Human-reviewed corrections cover parallel verbs, causal fragments, omitted verbs, source typos and factual/generalisation repairs',()=>{
 const bySource=(batch,id)=>batches[batch].items.find(e=>e.sourceCandidateId.endsWith(`-${id}`));
 assert.match(bySource(0,'002').passage,/which \(d\) ____ creates misunderstanding \(e\) ____ destroys/);
 assert.match(bySource(0,'024').passage,/trustworthiness \(b\) ____ nobody/);
 assert.match(bySource(0,'077').passage,/unknown to me, I felt/);
 assert.match(bySource(0,'016').passage,/\(c\) ____ a person tells lies/);assert.equal(bySource(0,'016').answers[2],'When');
 assert.doesNotMatch(bySource(0,'057').passage,/small pox/);assert.match(bySource(0,'057').sourcePassage,/small pox/);
 assert.match(bySource(0,'062').passage,/fictional account/);assert.match(bySource(0,'062').sourcePassage,/political parties/);
 assert.match(bySource(1,'065').passage,/listen carefully/);assert.match(bySource(1,'065').editorialChanges[0].reason,/missing imperative/);
});
test('Nine prepared item types total 60 marks / 459 distinct sets; only the three writing items remain unavailable',()=>{
 const ids=['gap-clues','substitution','verbs','transformation','tags','affixes','prepositions',...kinds];
 for(const grade of [9,10]){
  const all=preparedEnglishItems(grade,2);assert.equal(all.length,459);assert.equal(new Set(all.map(p=>p.key)).size,459);
  const result=assembleEnglishItems(all.map(p=>p.draft),grade,()=>0,ids,{},2);assert.ok(result.draft);assert.deepEqual(result.missing,[]);assert.equal(validateEnglishOutput(result.draft.selection,result.draft.output).total,60);assert.deepEqual(validateEnglishOutput(result.draft.selection,result.draft.output).tasks.map(t=>t.number),[1,2,3,4,5,6,7,8,9]);
  assert.deepEqual(assembleEnglishItems(all.map(p=>p.draft),grade,()=>0,undefined,{},2).missing,['paragraph','letter-email','composition']);
 }
 for(const grade of [6,7,8,11,12])for(const k of kinds)assert.deepEqual(preparedEnglishItems(grade,2,k),[]);
 assert.equal(preparedEnglishItems(10,1).length,365);assert.deepEqual(preparedEnglishItems(9,1),[]);
});
test('All 102 passages print once, preserve five-gap/continuous structure and isolate question/answer-only output',()=>{
 require.extensions['.tsx']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),C=require('../components/paper-builder/english-group.tsx').default;
 const {englishFlowBlocks}=require('../lib/english/flow-blocks.ts'),{englishLegacyPaper}=require('../lib/english/legacy-builder.ts'),{isEnglishPassageCloze}=require('../lib/english/cloze-layout.ts');
 for(const b of batches)for(let i=0;i<51;i++){
  const e=b.items[i],p=preparedEnglishItems(10,2,b.item)[i],paper=englishLegacyPaper(p.draft),blocks=paper.items.flatMap(englishFlowBlocks);assert.equal(blocks.length,1);assert.deepEqual(englishFlowBlocks(blocks[0]),[blocks[0]]);
  const render=props=>renderToStaticMarkup(React.createElement(C,{q:blocks[0],s:{...paper.settings,show:{...paper.settings.show,marks:true,boardSource:true}},...props}));
  const question=render({answers:false});assert.doesNotMatch(question,/Fill gap|Answer:/);
  const key=render({questions:false,answers:true});assert.doesNotMatch(key,/____|Fill gap|Use capital|Complete the passage/);assert.match(key,/\[5\]/);
  if(b.item==='connectors'){
   assert.ok(isEnglishPassageCloze(p.draft.output.tasks[0]));assert.equal((question.match(/\([a-e]\) ____/g)||[]).length,5);assert.equal((key.match(/<b>\([a-e]\)/g)||[]).length,5);
  }else{
   assert.equal(isEnglishPassageCloze(p.draft.output.tasks[0]),false);assert.deepEqual(p.draft.output.tasks[0].subitems,[]);assert.ok(!question.includes(e.answers[0]));assert.equal((key.match(/Answer:/g)||[]).length,1);
   const plain=markup=>markup.replace(/<[^>]+>/g,'').replace(/&#x27;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');assert.ok(plain(question).includes(e.passage));assert.ok(plain(key).includes(e.answers[0]));
  }
 }
 for(const instruction of ['Directions\nIndependent questions follow.','Directions\nOnly (a) ____ and (b) ____ occur.'])assert.equal(isEnglishPassageCloze({id:'connectors',instruction}),false);
});

test('Admin exposes snapshots for both new item types; changed-word questions identify adapted practice in printable instructions',()=>{
 const admin=fs.readFileSync(path.join(root,'app/admin/questions/english-items.tsx'),'utf8');
 assert.match(admin,/\["transformation","tags","affixes","prepositions","connectors","punctuation"\]\.includes\(t.id\)/);
 assert.match(admin,/card.record\?\.review \?\? \[\.\.\.preparedSSCGrammarEntries, \.\.\.preparedSSCLinkingEntries\]/);
 for(const b of batches)for(const e of b.items){
  if(e.editorialChanges.some(c=>c.reason!=='Normalise gap spacing without changing words.'))assert.ok(e.instruction.startsWith('Source-backed adapted practice.'));
 }
});
