const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module'),path=require('node:path'),{createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..'),orig=Module._resolveFilename;
Module._resolveFilename=function(id,parent,...rest){return orig.call(this,id.startsWith('@/')?path.join(root,id.slice(2)):id,parent,...rest)};
require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const kinds=['transformation','tags','affixes','prepositions'];
const batches=kinds.map(k=>require(`../lib/english/data/ssc-paper2-${k}-review.json`));
const {preparedEnglishItems,englishItemsDigest}=require('../lib/english/prepared-items.ts');
const {validateEnglishOutput,validateEnglishReferenceShape}=require('../lib/english/generation.ts');
const {approvedEnglishItem,assembleEnglishItems}=require('../lib/english/item-bank.ts');
const {findEnglishBankParts}=require('../lib/english/bank.ts');
const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const savedRecord=(draft,status='APPROVED')=>JSON.stringify({draft,status});
function mocked(file,mocks){const m=new Module(path.resolve(root,file),module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return m.exports;}
for(const batch of batches){
 const kind=batch.item,count=kind==='transformation'?10:5;
 test(`${kind}: 51 complete distinct review sets with answer keys, provenance and reproducible hashes`,()=>{
  assert.equal(batch.items.length,51);assert.equal(batch.reviewStatus,'PREPARED_NOT_IMPORTED');assert.equal(batch.marks,count);assert.match(batch.answerStatus,/NOT official/);
  assert.equal(new Set(batch.items.map(e=>e.id)).size,51);assert.equal(new Set(batch.items.map(e=>e.contentSha256)).size,51);
  const questionOnly=e=>(e.passage??e.questions.join(' ')).toLowerCase().replace(/[^a-z]/g,'');
  assert.equal(new Set(batch.items.map(questionOnly)).size,51);
  for(const e of batch.items){
   assert.equal(e.answers.length,count);assert.ok(e.answers.every(a=>a.trim().length&&!a.includes('____')));assert.ok(e.editorialNotes.length);
   assert.ok(batch.sources.some(s=>s.fileId===e.sourceFile&&s.sha256===e.sourceSha256));
   if(e.sourceSubitems){assert.equal(e.sourceSubitems.length,count);assert.equal(e.sourceContentSha256,sha({instruction:e.sourceInstruction,subitems:e.sourceSubitems}));assert.equal(e.contentSha256,sha({questions:e.questions,answers:e.answers}));}
   else{assert.equal(e.sourceContentSha256,sha({instruction:e.sourceInstruction,passage:e.sourcePassage}));assert.equal(e.contentSha256,sha({passage:e.passage,...(kind==='affixes'?{roots:e.roots}:{}),answers:e.answers}));assert.deepEqual([...e.passage.matchAll(/\(([a-z])\) ____/g)].map(m=>m[1]),[...'abcde']);}
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
   assert.equal(v.total,count);assert.equal(v.tasks[0].marks,count);assert.equal(v.tasks[0].number,kinds.indexOf(kind)+4);assert.equal(d.selection.grade,grade);assert.equal(d.selection.paper,2);assert.deepEqual(d.selection.itemIds,[kind]);assert.deepEqual(d.output.passages,[]);assert.deepEqual(t.subitems.map(s=>s.answer),e.answers);
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
  for(const includeAnswers of [true,false]){const r=await findEnglishBankParts({...d.selection,includeAnswers},async(after,prefix)=>prefix==='english-item:v1:'?[{key:'first',value:savedRecord(d)}]:[]);assert.deepEqual(r.missingIds,[]);assert.equal(r.output.tasks[0].instruction,d.output.tasks[0].instruction);assert.ok(r.output.tasks[0].subitems.every(s=>Boolean(s.answer)===includeAnswers));}
  const pending=await findEnglishBankParts(d.selection,async(after,prefix)=>prefix==='english-item:v1:'?[{key:'pending',value:savedRecord(d,'PENDING')}]:[]);assert.deepEqual(pending.missingIds,[kind]);
 });
}
test('Affix ten/fourteen-gap originals adapt once to five gaps with all remaining words, root maps and original keys disclosed',()=>{
 const batch=batches.find(b=>b.item==='affixes');let adapted=0;
 for(const e of batch.items){
  assert.equal(e.roots.length,5);assert.equal(e.originalToPracticeMap.length,5);
  assert.deepEqual(e.originalToPracticeMap.map(m=>m.originalLabel),[...'abcde']);assert.deepEqual(e.originalToPracticeMap.map(m=>m.practiceLabel),[...'abcde']);assert.deepEqual(e.originalToPracticeMap.map(m=>m.root),e.roots);
  assert.equal(e.originalAnswerKey.length,[...e.sourcePassage.matchAll(/\(([a-z])\)/g)].length);assert.deepEqual(e.answers,e.originalAnswerKey.slice(0,5));
  if(e.originalAnswerKey.length>5){adapted++;assert.ok(e.editorialChanges.some(c=>c.after===e.passage));assert.doesNotMatch(e.passage,/\([f-n]\)/);}
  for(let i=0;i<5;i++)assert.ok(e.passage.includes(`(${String.fromCharCode(97+i)}) ____ (${e.roots[i]})`));
 }
 assert.equal(adapted,21);
 // Unsupported mobile-radiation claims and repeated leisure/happiness/Facebook reprints were excluded.
 assert.ok(!batch.items.some(e=>e.sourcePassage.includes('brain tumours')));
});
test('Internet supplementation: 22 distinct web exercises retain actual URL/exercise/snapshot, never fabricated school or board metadata',()=>{
 const batch=batches.find(b=>b.item==='prepositions'),web=batch.items.filter(e=>e.sourceKind==='web');assert.equal(web.length,22);assert.equal(batch.items.filter(e=>e.sourceKind==='school').length,29);assert.equal(batch.items.filter(e=>e.sourceKind==='board').length,0);
 const source=batch.sources.find(s=>s.url);assert.equal(source.url,'https://skylarkeducation.com/preposition-exercise-for-ssc/');assert.equal(source.retrievedAt,'2026-11-20');assert.match(source.snapshotKind,/not a hash of the entire/);
 assert.equal(source.sha256,sha(web.map(e=>({exercise:e.webExercise,text:e.sourcePassage}))));assert.equal(new Set(web.map(e=>e.webExercise)).size,22);
 assert.ok(!batch.items.some(e=>e.sourceInstruction.includes('articles')));
 const webDrafts=preparedEnglishItems(10,2,'prepositions').filter(p=>p.review.sourceKind==='web').map(p=>p.draft);
 for(const filter of [{examYear:2025},{school:'Skylark Education'}])assert.deepEqual(assembleEnglishItems(webDrafts,10,()=>0,['prepositions'],filter,2).missing,['prepositions']);
});
test('Original seven-item selection remains 50 marks; complete registry has 612 unique sets and no item stays missing',()=>{
 for(const grade of [9,10]){
  const all=preparedEnglishItems(grade,2);assert.equal(all.length,612);const ids=['gap-clues','substitution','verbs',...kinds];
  const partial=assembleEnglishItems(all.map(p=>p.draft),grade,()=>0,ids,{},2);assert.ok(partial.draft);assert.equal(validateEnglishOutput(partial.draft.selection,partial.draft.output).total,50);
  assert.deepEqual(assembleEnglishItems(all.map(p=>p.draft),grade,()=>0,undefined,{},2).missing,[]);
 }
 for(const grade of [6,7,8,11,12])for(const kind of kinds)assert.deepEqual(preparedEnglishItems(grade,2,kind),[]);
});
test('Every complete affix/preposition passage prints once as an atomic exercise; independent tag/transformation questions remain visible',()=>{
 require.extensions['.tsx']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),C=require('../components/paper-builder/english-group.tsx').default;
 const {englishFlowBlocks}=require('../lib/english/flow-blocks.ts'),{englishLegacyPaper}=require('../lib/english/legacy-builder.ts');
 const {isEnglishPassageCloze}=require('../lib/english/cloze-layout.ts');
 for(const kind of kinds){for(const p of preparedEnglishItems(10,2,kind)){
  const paper=englishLegacyPaper(p.draft),blocks=paper.items.flatMap(englishFlowBlocks);assert.equal(blocks.length,['affixes','prepositions'].includes(kind)?1:kind==='tags'?5:10);
  const rendered=blocks.map(q=>renderToStaticMarkup(React.createElement(C,{q,s:paper.settings,answers:false}))).join('');assert.doesNotMatch(rendered,/Fill gap|Answer:/);
  if(['affixes','prepositions'].includes(kind)){
   assert.ok(isEnglishPassageCloze(p.draft.output.tasks[0]));assert.equal((rendered.match(/\([a-e]\) ____/g)||[]).length,5);assert.deepEqual(englishFlowBlocks(blocks[0]),[blocks[0]]);
   const key=renderToStaticMarkup(React.createElement(C,{q:blocks[0],s:paper.settings,questions:false,answers:true}));assert.doesNotMatch(key,/____|Fill gap/);assert.equal((key.match(/<b>\([a-e]\)/g)||[]).length,5);
  }else{assert.ok(!isEnglishPassageCloze(p.draft.output.tasks[0]));assert.equal(blocks.flatMap(q=>q.englishGroup.tasks.flatMap(t=>t.subitems)).length,kind==='tags'?5:10);}
 }}
 for(const id of ['affixes','prepositions'])assert.equal(isEnglishPassageCloze({id,instruction:'Directions\nIndependent questions follow.'}),false);
});
