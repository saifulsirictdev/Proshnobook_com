const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module'),path=require('node:path'),{createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..'),orig=Module._resolveFilename;
Module._resolveFilename=function(id,parent,...rest){return orig.call(this,id.startsWith('@/')?path.join(root,id.slice(2)):id,parent,...rest)};
require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const data=require('../lib/english/data/ssc-paper2-verbs-review.json');
const {preparedEnglishItems,englishItemsDigest}=require('../lib/english/prepared-items.ts');
const {validateEnglishOutput,validateEnglishReferenceShape}=require('../lib/english/generation.ts');
const {approvedEnglishItem,assembleEnglishItems}=require('../lib/english/item-bank.ts');
const {findEnglishBankParts}=require('../lib/english/bank.ts');
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const items=(grade=10)=>preparedEnglishItems(grade,2,'verbs');
const record=(draft,status='APPROVED')=>JSON.stringify({draft,status});
function load(file,mocks){const m=new Module(path.resolve(root,file),module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return m.exports;}
test('51 unique complete ten-gap verb exercises have exact original marks and source question numbers',()=>{
 assert.equal(data.items.length,51);assert.equal(data.item,'verbs');assert.equal(data.marks,10);assert.equal(data.reviewStatus,'PREPARED_NOT_IMPORTED');
 assert.equal(data.items.filter(e=>e.sourceKind==='board').length,30);assert.equal(data.items.filter(e=>e.sourceKind==='school').length,21);
 assert.equal(data.items.filter(e=>e.originalMarks===5).length,31);assert.equal(data.items.filter(e=>e.originalMarks===10).length,20);
 assert.equal(new Set(data.items.map(e=>e.passage.toLowerCase().replace(/[^a-z]/g,''))).size,51);
 assert.equal(new Set(data.items.map(e=>e.id)).size,51);
 for(const e of data.items){
  assert.deepEqual([...e.passage.matchAll(/\(([a-j])\) ____/g)].map(m=>m[1]),[...'abcdefghij']);
  assert.ok(e.clues.length>=8&&e.clues.length<=10);assert.equal(e.answers.length,10);assert.equal(e.answerRoots.length,10);
  assert.equal(e.originalMarks,e.examYear===2023||e.examYear===2025?10:5);
  assert.equal(e.questionNumber,e.examYear===2022?2:e.examYear===2025?3:4);
  assert.ok(data.sources.some(s=>s.fileId===e.sourceFile&&/^[a-f0-9]{64}$/.test(s.sha256)));assert.ok(e.pdfPage>0);
  assert.equal(e.contentSha256,hash({clues:e.clues,passage:e.passage}));assert.equal(e.sourceContentSha256,hash({clues:e.sourceClues,passage:e.sourcePassage}));
  assert.doesNotMatch(e.passage,/[\uE000-\uF8FF]|SSC English Test Papers|English Second Paper : Questions/);
  if(e.sourceKind==='school'){assert.ok(e.school);assert.ok(['Test','Pre-Test'].includes(e.examType));assert.equal(e.board,undefined);}else{assert.ok(e.board);assert.equal(e.school,undefined);}
 }
});
test('All 510 answer roots belong to the verb box and their lexical forms are independently reconstructible',()=>{
 const irregular={be:['am','is','are','was','were','been','being'],are:['are'],is:['is'],can:['can','cannot'],bear:['bore','born','borne'],become:['became','become'],begin:['began','begun'],breed:['bred'],bring:['brought'],build:['built'],catch:['caught'],choose:['chose','chosen'],come:['came'],do:['does','did','done'],drive:['drove','driven'],eat:['ate','eaten'],fall:['fell','fallen'],feed:['fed'],feel:['felt'],find:['found'],get:['got','gotten'],give:['gave','given'],go:['goes','went','gone'],grow:['grew','grown'],have:['has','had'],hear:['heard'],keep:['kept'],know:['knew','known'],lead:['led'],leave:['left'],live:[],lose:['lost'],make:['made'],mean:['meant'],overcome:['overcame'],pay:['paid'],read:['read'],say:['said'],see:['saw','seen'],send:['sent'],set:['set'],sit:['sat'],spend:['spent'],stand:['stood'],steal:['stole','stolen'],take:['took','taken'],teach:['taught'],tell:['told'],think:['thought'],throw:['threw','thrown'],undergo:['underwent','undergone'],understand:['understood'],write:['wrote','written']};
 const auxiliaries=new Set(['a','am','is','are','was','were','be','been','being','has','have','had','do','does','did','will','would','shall','should','can','could','cannot','may','might','must','not','to','of']);
 let count=0;
 for(const e of data.items) e.answers.forEach((answer,i)=>{
  const r=e.answerRoots[i];assert.ok(e.clues.includes(r),`${e.id} gap ${i}: root absent from box`);assert.ok(answer.trim());
  const forms=new Set([r,r+'s',r+'es',r+'d',r+'ed',r+'ing',...irregular[r]??[]]);
  if(r.endsWith('e')){forms.add(r.slice(0,-1)+'ing');}
  if(r.endsWith('y')){forms.add(r.slice(0,-1)+'ies');forms.add(r.slice(0,-1)+'ied');}
  forms.add(r+r.at(-1)+'ed');forms.add(r+r.at(-1)+'ing');
  const words=answer.toLowerCase().split(/\s+/),lexical=words.filter(w=>!auxiliaries.has(w));
  assert.ok(words.some(w=>forms.has(w)),`${e.id} ${answer} is not a form of ${r}`);
  assert.ok(lexical.every(w=>forms.has(w)),`${e.id} unexpected non-verb words: ${answer}`);
  count++;
 });
 assert.equal(count,510);
});
test('All practice changes are replayable from the preserved source transcription; no silent source rewriting',()=>{
 for(const e of data.items){
  let passage=e.sourcePassage,clues=[...e.sourceClues];
  for(const c of e.editorialChanges){
   assert.notEqual(c.before,c.after);assert.ok(e.editorialNotes.some(n=>n.includes(c.before)&&n.includes(c.after)));
   if(passage.includes(c.before))passage=passage.split(c.before).join(c.after);
   else {assert.ok(clues.includes(c.before),`${e.id} absent before fragment`);clues=clues.map(v=>v===c.before?c.after:v);}
  }
  assert.equal(passage,e.passage);assert.deepEqual(clues,e.clues);
 }
});
for(const grade of [9,10]) test(`Class ${grade}: 51 verb sets validate at ten marks; previous two batches remain intact`,()=>{
 const prepared=items(grade);assert.equal(prepared.length,51);assert.equal(new Set(prepared.map(e=>e.key)).size,51);
 assert.equal(preparedEnglishItems(grade,2).length,153);assert.equal(preparedEnglishItems(grade,2,'gap-clues').length,51);assert.equal(preparedEnglishItems(grade,2,'substitution').length,51);
 assert.equal(preparedEnglishItems(grade,2,'transformation').length,0);
 for(let i=0;i<prepared.length;i++){
  const p=prepared[i],e=data.items[i],d=p.draft,t=d.output.tasks[0],v=validateEnglishOutput(d.selection,d.output);
  assert.equal(d.selection.grade,grade);assert.equal(d.selection.paper,2);assert.equal(d.selection.includeAnswers,true);assert.deepEqual(d.selection.itemIds,['verbs']);
  validateEnglishReferenceShape(d.selection,d.output);assert.equal(v.total,10);assert.equal(v.tasks[0].number,3);assert.equal(v.tasks[0].marks,10);
  assert.equal(t.instruction,`${e.instruction}\n${e.passage}`);assert.deepEqual(t.clues,e.clues);assert.deepEqual(t.subitems.map(s=>s.answer),e.answers);assert.deepEqual(d.output.passages,[]);
  assert.equal((t.boardSource??t.schoolSource).questionNumber,e.questionNumber);assert.equal((t.boardSource??t.schoolSource).originalMarks,e.originalMarks);assert.equal((t.boardSource??t.schoolSource).pdfPage,e.pdfPage);
  assert.deepEqual(p.review.sourceClues,e.sourceClues);assert.equal(p.review.sourcePassage,e.sourcePassage);assert.deepEqual(p.review.answerRoots,e.answerRoots);assert.deepEqual(p.review.editorialChanges,e.editorialChanges);
  assert.ok(approvedEnglishItem(record(d),grade,2));assert.equal(approvedEnglishItem(record(d),grade),null);
  for(const status of ['PENDING','REJECTED'])assert.equal(approvedEnglishItem(record(d,status),grade,2),null);
 }
});
test('Three prepared items assemble to 25 marks, never silently fabricate the other nine items',()=>{
 const stock=preparedEnglishItems(10,2).map(p=>p.draft);
 const r=assembleEnglishItems(stock,10,()=>0,['gap-clues','substitution','verbs'],{},2);assert.ok(r.draft);assert.equal(validateEnglishOutput(r.draft.selection,r.draft.output).total,25);
 assert.deepEqual(assembleEnglishItems(stock,10,()=>0,undefined,{},2).missing,['transformation','tags','affixes','prepositions','connectors','punctuation','paragraph','letter-email','composition']);
 const board=assembleEnglishItems(stock,10,()=>0,['verbs'],{examYear:2022},2);assert.equal(board.draft.output.tasks[0].boardSource.examYear,2022);
 const school=data.items.find(e=>e.sourceKind==='school').school;
 assert.equal(assembleEnglishItems(stock,10,()=>0,['verbs'],{school},2).draft.output.tasks[0].schoolSource.school,school);
 assert.equal(assembleEnglishItems(stock,9,()=>0,['verbs'],{},2).draft,null);
});
test('Approved verb bank supports answer and question-only requests without paper/grade/status leaks',async()=>{
 const d=items()[0].draft;
 for(const includeAnswers of [true,false]){
  const r=await findEnglishBankParts({...d.selection,includeAnswers},async(after,prefix)=>prefix==='english-item:v1:'?[{key:'item',value:record(d)}]:[]);
  assert.deepEqual(r.missingIds,[]);assert.deepEqual(r.output.tasks[0].clues,d.output.tasks[0].clues);assert.ok(r.output.tasks[0].subitems.every(s=>Boolean(s.answer)===includeAnswers));
 }
 for(const value of [record(d,'PENDING'),record(items(9)[0].draft)])assert.deepEqual((await findEnglishBankParts(d.selection,async()=>[{key:'held',value}])).missingIds,['verbs']);
});
test('Scoped verb import requires ADMIN and exact preview digest; writes only 51 Pending records and preserves earlier decisions',async()=>{
 let calls=0;const saved=new Map(),db={setting:{createMany:async({data,skipDuplicates})=>{calls++;assert.equal(skipDuplicates,true);for(const r of data)if(!saved.has(r.key))saved.set(r.key,r.value);}}};
 const action=role=>load('app/admin/english-review/item-actions.ts',{'@/auth':{auth:async()=>({user:{id:'admin',role}})},'@/lib/db':{db},'next/cache':{revalidatePath(){}}}).importEnglishItems;
 const f=new FormData();f.set('grade','10');f.set('paper','2');f.set('item','verbs');f.set('digest',englishItemsDigest(10,2,'verbs'));
 await action('ADMIN')(f);assert.equal(calls,0);f.set('reviewed','yes');await assert.rejects(action('TEACHER')(f),/Forbidden/);
 f.set('digest',englishItemsDigest(10,2,'substitution'));await action('ADMIN')(f);assert.equal(calls,0);
 f.set('digest',englishItemsDigest(10,2,'verbs'));await action('ADMIN')(f);assert.equal(saved.size,51);
 for(const value of saved.values()){
  const r=JSON.parse(value);assert.equal(r.status,'PENDING');assert.deepEqual(r.draft.selection.itemIds,['verbs']);assert.equal(r.review.sourceContentSha256,hash({clues:r.review.sourceClues,passage:r.review.sourcePassage}));assert.equal(r.review.answerRoots.length,10);
 }
 const [key,value]=[...saved][0];saved.set(key,value.replace('PENDING','APPROVED'));await action('ADMIN')(f);assert.equal(saved.size,51);assert.equal(JSON.parse(saved.get(key)).status,'APPROVED');
 const digest=englishItemsDigest(10,2,'verbs');data.items[0].editorialNotes.push('test edit');try{assert.notEqual(digest,englishItemsDigest(10,2,'verbs'));}finally{data.items[0].editorialNotes.pop();}
 for(const g of [6,7,8,11,12])assert.deepEqual(items(g),[]);
});
test('All 51 verb exercises print prompt, verb box then passage once, with no duplicated prompts or answer leakage',()=>{
 require.extensions['.tsx']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),C=require('../components/paper-builder/english-group.tsx').default;
 const {englishFlowBlocks}=require('../lib/english/flow-blocks.ts'),{englishLegacyPaper}=require('../lib/english/legacy-builder.ts');
 for(const p of items()){
  const paper=englishLegacyPaper(p.draft),blocks=paper.items.flatMap(englishFlowBlocks);assert.equal(blocks.length,1);const q=blocks[0],t=q.englishGroup.tasks[0];
  assert.equal(t.subitems.length,10);assert.deepEqual(englishFlowBlocks(q),[q]);
  const html=renderToStaticMarkup(React.createElement(C,{q,s:paper.settings,answers:false}));
  assert.doesNotMatch(html,/Fill gap|Answer:/);assert.ok(html.indexOf('Complete the following')<html.indexOf('border p-2'));assert.equal((html.match(/\([a-j]\) ____/g)||[]).length,10);
  const key=renderToStaticMarkup(React.createElement(C,{q,s:paper.settings,answers:true,questions:false}));assert.doesNotMatch(key,/border p-2|Fill gap/);assert.equal((key.match(/<b>\([a-j]\)/g)||[]).length,10);
 }
});
test('A newline and verb box alone do not hide independent contextual subquestions',()=>{
 const {isEnglishPassageCloze}=require('../lib/english/cloze-layout.ts');
 const task={id:'verbs',number:3,marks:10,instruction:'Use the correct verb forms.\nChange the form where necessary.',clues:['go','work'],subitems:Array.from({length:10},(_,i)=>({text:`Independent context ${i+1}: He ____ to school.`,answer:'goes'}))};
 assert.equal(isEnglishPassageCloze(task),false);assert.equal(isEnglishPassageCloze({...task,instruction:task.instruction+' (a) ____ (j) ____'}),false);
 const q={id:'independent',text:task.instruction,englishGroup:{tasks:[task],passages:[]}};
 const blocks=require('../lib/english/flow-blocks.ts').englishFlowBlocks(q);assert.equal(blocks.length,10);assert.deepEqual(blocks.flatMap(b=>b.englishGroup.tasks.flatMap(t=>t.subitems)),task.subitems);
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),C=require('../components/paper-builder/english-group.tsx').default;
 const html=renderToStaticMarkup(React.createElement(C,{q,s:{attachments:{},cfg:{questionGap:0,optCols:2},show:{marks:true}},answers:false}));
 for(let i=1;i<=10;i++)assert.ok(html.includes(`Independent context ${i}:`));
});
