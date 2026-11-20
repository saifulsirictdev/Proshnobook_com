const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module'),path=require('node:path'),{createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..'),orig=Module._resolveFilename;
Module._resolveFilename=function(id,parent,...rest){return orig.call(this,id.startsWith('@/')?path.join(root,id.slice(2)):id,parent,...rest)};
require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const data=require('../lib/english/data/ssc-paper2-substitution-review.json');
const prepared=require('../lib/english/prepared-items.ts');
const {validateEnglishOutput,validateEnglishReferenceShape}=require('../lib/english/generation.ts');
const {assembleEnglishItems,approvedEnglishItem}=require('../lib/english/item-bank.ts');
const {findEnglishBankParts}=require('../lib/english/bank.ts');
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const stock=(grade=10)=>prepared.preparedEnglishItems(grade,2,'substitution');
const record=(draft,status='APPROVED')=>JSON.stringify({draft,status});
function load(file,mocks){const m=new Module(path.resolve(root,file),module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return m.exports;}
const normalize=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
test('51 genuinely distinct source tables, five complete keys each, source and content hashes, no extra syllabus item',()=>{
 assert.equal(data.items.length,51);assert.equal(data.marks,5);assert.equal(data.item,'substitution');assert.equal(data.reviewStatus,'PREPARED_NOT_IMPORTED');
 assert.equal(data.items.filter(e=>e.sourceKind==='board').length,20);assert.equal(data.items.filter(e=>e.sourceKind==='school').length,31);
 assert.equal(data.items.filter(e=>e.examYear===2025).length,21);
 assert.equal(new Set(data.items.map(e=>e.id)).size,51);
 // Ignore row order and punctuation so mere permutations/typography cannot inflate the count.
 assert.equal(new Set(data.items.map(e=>JSON.stringify([0,1,2].map(k=>e.table.rows.map(r=>normalize(r[k])).filter(Boolean).sort())))).size,51);
 assert.equal(new Set(data.items.map(e=>e.answers.map(normalize).sort().join('|'))).size,51);
 for(const e of data.items){
  assert.equal(e.contentSha256,hash(e.table));assert.equal(e.sourceRowsSha256,hash(e.sourceRows));
  assert.ok(data.sources.some(s=>s.fileId===e.sourceFile&&/^[a-f0-9]{64}$/.test(s.sha256)));
  assert.equal(e.answers.length,5);assert.equal(new Set(e.answers).size,5);assert.equal(e.solutions.length,5);
  assert.equal(e.originalMarks,5);assert.equal(e.questionNumber,e.examYear===2025?2:3);assert.ok(e.pdfPage>0);
  assert.deepEqual(e.table.headers,['A','B','C']);assert.ok(e.table.rows.every(r=>r.length===3&&r.some(Boolean)));
  assert.doesNotMatch(JSON.stringify(e),/[\uE000-\uF8FF]/);
  if(e.sourceKind==='school'){assert.ok(e.school);assert.ok(['Test','Pre-Test'].includes(e.examType));assert.equal(e.board,undefined);}
  else {assert.ok(e.board);assert.equal(e.school,undefined);}
 }
});
test('Every one of the 255 answer sentences is traceable to A/B/C source-adapted fragments and disclosed verb forms',()=>{
 for(const e of data.items){
  const columns=[0,1,2].map(k=>e.table.rows.map(r=>r[k]).filter(Boolean));
  e.solutions.forEach((s,i)=>{
   const originalVerb=columns[1][s.b-1];assert.ok(originalVerb);assert.ok(columns[0][s.a-1]);assert.ok(columns[2][s.c-1]);
   if(s.verb!==originalVerb){
    assert.ok(e.editorialNotes.some(n=>n.includes(`'${originalVerb}' → '${s.verb}'`)),`${e.id} undisclosed verb form`);
    // No arbitrary rewritten predicates masquerading as a verb inflection.
    assert.ok(({be:['is','are','was'],is:['are'],gives:['give'],has:['have'],need:['needs'],represent:['represents'],'is related':['are related'],plays:['play'],try:['are trying'],discuss:['is discussing'],'was/were':['was'],'have/has heard':['have heard']})[originalVerb]?.includes(s.verb),`${e.id}: ${originalVerb} -> ${s.verb}`);
   }
   const sentence=[columns[0][s.a-1],s.verb,columns[2][s.c-1]].join(' ');
   const expected=sentence[0].toUpperCase()+sentence.slice(1).replace(/[.?! ]+$/,'')+(/^(May I|Why) /.test(sentence)?'?':'.');
   assert.equal(e.answers[i],expected,`${e.id} answer ${i+1}`);
   assert.doesNotMatch(e.answers[i],/\?\.|is built one of|Teachers are trying hard to teach his/);
  });
 }
});
for(const grade of [9,10]) test(`Class ${grade} registers 51 substitution sets at five marks without relabelling Paper 1 or Item 1`,()=>{
 const items=stock(grade);assert.equal(items.length,51);assert.equal(new Set(items.map(e=>e.key)).size,51);
 assert.equal(prepared.preparedEnglishItems(grade,2).length,612);assert.equal(prepared.preparedEnglishItems(grade,2,'gap-clues').length,51);
 assert.equal(prepared.preparedEnglishItems(grade,2,'verbs').length,51);assert.equal(prepared.preparedEnglishItems(grade,2,'not-a-real-item').length,0);
 for(let i=0;i<items.length;i++){
  const p=items[i],e=data.items[i],d=p.draft,t=d.output.tasks[0],v=validateEnglishOutput(d.selection,d.output);
  assert.equal(d.selection.grade,grade);assert.equal(d.selection.paper,2);assert.deepEqual(d.selection.itemIds,['substitution']);assert.equal(d.selection.includeAnswers,true);
  validateEnglishReferenceShape(d.selection,d.output);assert.equal(v.total,5);assert.equal(v.tasks[0].number,2);assert.equal(v.tasks[0].marks,5);
  assert.deepEqual(t.table,e.table);assert.deepEqual(t.subitems.map(s=>s.answer),e.answers);assert.equal(t.subitems.length,5);assert.deepEqual(d.output.passages,[]);
  assert.match(t.instruction,/Entries may be reused; change the verb form/);
  assert.equal((t.boardSource??t.schoolSource).pdfPage,e.pdfPage);assert.equal((t.boardSource??t.schoolSource).questionNumber,e.questionNumber);
  assert.deepEqual(p.review.sourceRows,e.sourceRows);assert.deepEqual(p.review.solutions,e.solutions);assert.deepEqual(p.review.editorialNotes,e.editorialNotes);
  assert.ok(approvedEnglishItem(record(d),grade,2));assert.equal(approvedEnglishItem(record(d),grade),null);
  for(const status of ['PENDING','REJECTED'])assert.equal(approvedEnglishItem(record(d,status),grade,2),null);
 }
});
test('Item digest is grade/paper/item scoped and binds editorial notes as well as question keys',()=>{
 const digest=prepared.englishItemsDigest(10,2,'substitution');
 assert.equal(digest,prepared.englishItemsDigest(10,2,'substitution'));
 assert.notEqual(digest,prepared.englishItemsDigest(9,2,'substitution'));
 assert.notEqual(digest,prepared.englishItemsDigest(10,2,'gap-clues'));
 assert.notEqual(digest,prepared.englishItemsDigest(10,2));
 data.items[0].editorialNotes.push('Test-only review metadata edit');
 try {assert.notEqual(digest,prepared.englishItemsDigest(10,2,'substitution'));}finally{data.items[0].editorialNotes.pop();}
 assert.equal(digest,prepared.englishItemsDigest(10,2,'substitution'));
 assert.equal(prepared.preparedEnglishItems(10).length,365);assert.equal(prepared.preparedEnglishItems(9).length,0);
 for(const g of [6,7,8,11,12])assert.deepEqual(stock(g),[]);
});
test('Two completed items assemble as 15 marks, but remaining ten items are still missing; source filters remain exact',()=>{
 const drafts=prepared.preparedEnglishItems(10,2).filter(p=>['gap-clues','substitution'].includes(p.group)).map(p=>p.draft);
 const combined=assembleEnglishItems(drafts,10,()=>0,['gap-clues','substitution'],{},2);
 assert.ok(combined.draft);assert.equal(validateEnglishOutput(combined.draft.selection,combined.draft.output).total,15);
 assert.deepEqual(assembleEnglishItems(drafts,10,()=>0,undefined,{},2).missing,['verbs','transformation','tags','affixes','prepositions','connectors','punctuation','paragraph','letter-email','composition']);
 const school=data.items.find(e=>e.sourceKind==='school').school;
 const chosen=assembleEnglishItems(drafts,10,()=>0,['substitution'],{school},2);assert.equal(chosen.draft.output.tasks[0].schoolSource.school,school);
 const board=assembleEnglishItems(drafts,10,()=>0,['substitution'],{examYear:2024},2);assert.equal(board.draft.output.tasks[0].boardSource.examYear,2024);
 assert.equal(assembleEnglishItems(drafts,10,()=>0,['substitution'],{school:'not-a-school'},2).draft,null);
});
test('Bank lookup reuses only approved paper/grade-matched substitution tables, with answers stripped when not requested',async()=>{
 const d=stock()[0].draft;
 for(const includeAnswers of [true,false]){
  const r=await findEnglishBankParts({...d.selection,includeAnswers},async(after,prefix)=>prefix==='english-item:v1:'?[{key:'item',value:record(d)}]:[]);
  assert.deepEqual(r.missingIds,[]);assert.deepEqual(r.output.tasks[0].table,d.output.tasks[0].table);
  assert.ok(r.output.tasks[0].subitems.every(s=>Boolean(s.answer)===includeAnswers));
 }
 for(const value of [record(d,'PENDING'),record(stock(9)[0].draft)]){
  const r=await findEnglishBankParts(d.selection,async()=>[{key:'held',value}]);assert.deepEqual(r.missingIds,['substitution']);
 }
});
test('Scoped bulk import requires ADMIN, explicit consent and correct item digest; stores only 51 Pending substitution snapshots, idempotently',async()=>{
 let calls=0;const saved=new Map();
 const db={setting:{createMany:async({data,skipDuplicates})=>{calls++;assert.equal(skipDuplicates,true);for(const r of data)if(!saved.has(r.key))saved.set(r.key,r.value);}}};
 const action=role=>load('app/admin/english-review/item-actions.ts',{'@/auth':{auth:async()=>({user:{id:'admin',role}})},'@/lib/db':{db},'next/cache':{revalidatePath(){}}}).importEnglishItems;
 const f=new FormData();f.set('grade','10');f.set('paper','2');f.set('item','substitution');f.set('digest',prepared.englishItemsDigest(10,2,'substitution'));
 await action('ADMIN')(f);assert.equal(calls,0);f.set('reviewed','yes');await assert.rejects(action('TEACHER')(f),/Forbidden/);
 f.set('digest',prepared.englishItemsDigest(10,2,'gap-clues'));await action('ADMIN')(f);assert.equal(calls,0);
 f.set('digest',prepared.englishItemsDigest(10,2,'substitution'));await action('ADMIN')(f);assert.equal(saved.size,51);
 for(const row of saved.values()){
  const r=JSON.parse(row);assert.equal(r.status,'PENDING');assert.deepEqual(r.draft.selection.itemIds,['substitution']);assert.equal(r.importedBy,'admin');assert.equal(r.review.sourceRows.length,5);assert.equal(r.review.solutions.length,5);assert.equal(r.review.sourceRowsSha256,hash(r.review.sourceRows));
 }
 const [key,value]=[...saved][0];saved.set(key,value.replace('PENDING','REJECTED'));await action('ADMIN')(f);assert.equal(saved.size,51);assert.equal(JSON.parse(saved.get(key)).status,'REJECTED');
 for(const item of ['','not-a-real-item']){f.set('item',item);await action('ADMIN')(f);assert.equal(saved.size,51);}
});
test('Substitution choice banks stay atomic in pagination and print without answer leakage or fragment loss',()=>{
 require.extensions['.tsx']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),C=require('../components/paper-builder/english-group.tsx').default;
 const {englishFlowBlocks}=require('../lib/english/flow-blocks.ts'),{englishLegacyPaper}=require('../lib/english/legacy-builder.ts');
 for(const p of stock()){
  const paper=englishLegacyPaper(p.draft),blocks=paper.items.flatMap(englishFlowBlocks);assert.equal(blocks.length,1);
  const q=blocks[0];assert.equal(q.englishGroup.tasks.length,1);assert.deepEqual(q.englishGroup.tasks[0].table,p.draft.output.tasks[0].table);assert.equal(q.englishGroup.tasks[0].subitems.length,5);
  assert.deepEqual(englishFlowBlocks(q),[q]);
  const html=renderToStaticMarkup(React.createElement(C,{q,s:paper.settings,answers:false}));assert.equal((html.match(/<table/g)||[]).length,1);assert.doesNotMatch(html,/Answer:/);
  const plain=html.replace(/<[^>]+>/g,'').replaceAll('&#x27;',"'").replaceAll('&quot;','"').replaceAll('&amp;','&');
  for(const answer of p.draft.output.tasks[0].subitems.map(s=>s.answer))assert.ok(!plain.includes(answer),`Answer leaked in ${p.draft.name}`);
  const key=renderToStaticMarkup(React.createElement(C,{q,s:paper.settings,answers:true,questions:false}));assert.doesNotMatch(key,/<table/);assert.equal((key.match(/Answer:/g)||[]).length,5);
 }
});
