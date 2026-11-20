const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module'),path=require('node:path'),{createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..'),orig=Module._resolveFilename;
Module._resolveFilename=function(id,parent,...rest){return orig.call(this,id.startsWith('@/')?path.join(root,id.slice(2)):id,parent,...rest)};
require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const data=require('../lib/english/data/ssc-paper2-gap-clues-review.json');
const {preparedEnglishItems,englishItemsDigest}=require('../lib/english/prepared-items.ts');
const {approvedEnglishItem,assembleEnglishItems}=require('../lib/english/item-bank.ts');
const {validateEnglishOutput,validateEnglishReferenceShape}=require('../lib/english/generation.ts');
const {findEnglishBankParts}=require('../lib/english/bank.ts');
function record(draft,status='APPROVED'){return JSON.stringify({status,draft});}
test('51 distinct complete source-backed cloze exercises, not school reprints or grade duplicates',()=>{
 assert.equal(data.items.length,51);
 assert.equal(data.items.filter(e=>e.sourceKind==='board').length,31);
 assert.equal(data.items.filter(e=>e.sourceKind==='school').length,20);
 assert.equal(data.reviewStatus,'PREPARED_NOT_IMPORTED');
 assert.equal(new Set(data.items.map(e=>e.passage.toLowerCase().replace(/[^a-z]/g,''))).size,51);
 assert.equal(data.sources.length,3);
 for(const e of data.items){
  assert.equal(createHash('sha256').update(e.passage).digest('hex'),e.contentSha256);
  assert.ok(data.sources.some(s=>s.fileId===e.sourceFile&&/^[a-f0-9]{64}$/.test(s.sha256)));
  assert.deepEqual([...e.passage.matchAll(/\(([a-j])\) ____/g)].map(m=>m[1]),[...'abcdefghij']);
  assert.equal(e.answers.length,10);assert.ok(e.answers.every(a=>a.trim().length));
  assert.ok(e.clues.length>=8&&e.clues.length<=12);assert.ok(e.clues.every(c=>c.trim().length));
  assert.doesNotMatch(e.passage,/[\uE000-\uF8FF]/);
  assert.ok(e.pdfPage>0);assert.equal(e.originalMarks,e.examYear===2025?10:5);
  assert.equal(e.questionNumber,e.examYear===2023?2:1);
  if(e.sourceKind==='school'){assert.ok(e.school);assert.ok(['Test','Pre-Test'].includes(e.examType));assert.equal(e.board,undefined);}
 }
});
for(const grade of [9,10]) test(`SSC grade ${grade}, Paper 2: all 51 validate at ten marks and retain complete source and keys`,()=>{
 const items=preparedEnglishItems(grade,2);assert.equal(items.length,51);assert.equal(new Set(items.map(p=>p.key)).size,51);
 for(let i=0;i<items.length;i++){
  const {draft}=items[i],e=data.items[i],t=validateEnglishOutput(draft.selection,draft.output).tasks[0];
  assert.equal(draft.selection.grade,grade);assert.equal(draft.selection.paper,2);assert.equal(draft.selection.includeAnswers,true);
  assert.equal(validateEnglishOutput(draft.selection,draft.output).total,10);validateEnglishReferenceShape(draft.selection,draft.output);
  assert.equal(t.id,'gap-clues');assert.equal(t.number,1);assert.equal(t.marks,10);
  assert.equal(t.instruction,`${e.instruction}\n${e.passage}`);assert.deepEqual(t.clues,e.clues);assert.deepEqual(t.subitems.map(s=>s.answer),e.answers);
  assert.equal((t.boardSource??t.schoolSource).questionNumber,e.questionNumber);
  assert.equal((t.boardSource??t.schoolSource).pdfPage,e.pdfPage);
  assert.equal((t.boardSource??t.schoolSource).examYear,e.examYear);
  assert.ok(approvedEnglishItem(record(draft),grade,2));assert.equal(approvedEnglishItem(record(draft),grade),null);
  for(const status of ['PENDING','REJECTED']) assert.equal(approvedEnglishItem(record(draft,status),grade,2),null);
 }
 assert.equal(englishItemsDigest(grade,2),englishItemsDigest(grade,2));
});
test('First paper registries and unsupported second-paper grades remain isolated',()=>{
 assert.equal(preparedEnglishItems(10).length,365);assert.equal(preparedEnglishItems(9).length,0);
 for(const g of [6,7,8,11,12])assert.equal(preparedEnglishItems(g,2).length,0);
 assert.notEqual(englishItemsDigest(10),englishItemsDigest(10,2));assert.notEqual(englishItemsDigest(9,2),englishItemsDigest(10,2));
});
test('Paper-aware stock and selected-item assembly do not pretend the remaining eleven items are ready',async()=>{
 const draft=preparedEnglishItems(10,2)[0].draft;
 const {loadEnglishStock}=require('../lib/english/stock.ts');
 const prefixes=[];const stock=await loadEnglishStock(10,async(prefix)=>{prefixes.push(prefix);return [{key:'test',value:record(draft)}]},2);
 assert.deepEqual(prefixes,['english-item:v1:','english-review:']);
 const r=assembleEnglishItems(stock,10,()=>0,['gap-clues'],{},2);assert.ok(r.draft);assert.equal(r.missing.length,0);
 assert.deepEqual(assembleEnglishItems(stock,10,()=>0,undefined,{},2).missing,['substitution','verbs','transformation','tags','affixes','prepositions','connectors','punctuation','paragraph','letter-email','composition']);
 assert.equal(assembleEnglishItems(stock,9,()=>0,['gap-clues'],{},2).draft,null);
});
test('Bank lookup scans both namespaces, serves approved Paper 2 answers and strips them on request',async()=>{
 const draft=preparedEnglishItems(10,2)[0].draft;
 for(const includeAnswers of [true,false]){
  const prefixes=[];
  const r=await findEnglishBankParts({...draft.selection,includeAnswers},async(after,prefix)=>{prefixes.push(prefix);return prefix==='english-review:'?[{key:'legacy',value:record(draft)}]:[]});
  assert.deepEqual(prefixes,['english-item:v1:','english-review:']);assert.deepEqual(r.missingIds,[]);
  assert.equal(Boolean(r.output.tasks[0].subitems[0].answer),includeAnswers);
 }
 const r=await findEnglishBankParts(draft.selection,async()=>[{key:'pending',value:record(draft,'PENDING')}]);assert.deepEqual(r.missingIds,['gap-clues']);
});
test('Cloze layout preserves prompt, box and passage as one atomic exercise',()=>{
 const draft=preparedEnglishItems(10,2)[0].draft;
 const q={id:'cloze',text:draft.output.tasks[0].instruction,englishGroup:{tasks:draft.output.tasks,passages:[]}};
 const blocks=require('../lib/english/flow-blocks.ts').englishFlowBlocks(q);
 assert.equal(blocks.length,1);assert.deepEqual(blocks[0].englishGroup.tasks,draft.output.tasks);
});
function load(file,mocks){const m=new Module(path.resolve(root,file),module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return m.exports;}
test('Paper 2 batch import requires ADMIN, explicit consent and matching grade/paper digest; writes Pending only, idempotently',async()=>{
 const saved=new Map();let writes=0;
 const mock={'next/cache':{revalidatePath(){}},'@/lib/db':{db:{setting:{createMany:async({data,skipDuplicates})=>{writes++;assert.equal(skipDuplicates,true);for(const r of data)if(!saved.has(r.key))saved.set(r.key,r.value);}}}}};
 function action(role){return load('app/admin/english-review/item-actions.ts',{...mock,'@/auth':{auth:async()=>({user:{id:'actor',role}})}}).importEnglishItems;}
 const form=new FormData();form.set('grade','10');form.set('paper','2');form.set('digest',englishItemsDigest(10,2));
 await action('ADMIN')(form);assert.equal(writes,0);
 form.set('reviewed','yes');await assert.rejects(action('TEACHER')(form),/Forbidden/);assert.equal(writes,0);
 form.set('digest',englishItemsDigest(10));await action('ADMIN')(form);assert.equal(writes,0);
 form.set('digest',englishItemsDigest(10,2));await action('ADMIN')(form);assert.equal(saved.size,51);
 for(const r of saved.values()){const v=JSON.parse(r);assert.equal(v.status,'PENDING');assert.equal(v.draft.selection.paper,2);assert.equal(v.draft.selection.grade,10);}
 const [key,value]=[...saved][0];saved.set(key,value.replace('PENDING','APPROVED'));await action('ADMIN')(form);assert.equal(saved.size,51);assert.equal(JSON.parse(saved.get(key)).status,'APPROVED');
});
test('Question print puts clue box before the cloze passage, suppresses duplicate fill prompts, and does not leak answers',()=>{
 require.extensions['.tsx']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
 const C=require('../components/paper-builder/english-group.tsx').default;
 const draft=preparedEnglishItems(10,2)[0].draft,task=validateEnglishOutput(draft.selection,draft.output).tasks[0];
 const q={id:'cloze',text:task.instruction,englishGroup:{tasks:[task],passages:[]}};
 const s={attachments:{},cfg:{questionGap:0,optCols:2},show:{boardSource:true,marks:true}};
 const html=renderToStaticMarkup(React.createElement(C,{q,s,answers:false}));
 assert.ok(html.indexOf('Fill in the blanks')<html.indexOf('gentle · by'));
 assert.ok(html.indexOf('gentle · by')<html.indexOf('The Kaptai Lake'));
 assert.doesNotMatch(html,/Fill gap|biggest|Answer:/);
 const key=renderToStaticMarkup(React.createElement(C,{q,s,answers:true,questions:false}));assert.match(key,/biggest/);assert.doesNotMatch(key,/The Kaptai Lake|gentle · by/);
});
