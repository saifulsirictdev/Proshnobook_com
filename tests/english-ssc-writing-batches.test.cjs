const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module'),path=require('node:path'),{createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..'),orig=Module._resolveFilename;
Module._resolveFilename=function(id,parent,...rest){return orig.call(this,id.startsWith('@/')?path.join(root,id.slice(2)):id,parent,...rest)};
require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const kinds=['paragraph','letter-email','composition'],batches=kinds.map(k=>require(`../lib/english/data/ssc-paper2-${k}-review.json`));
const {preparedEnglishItems,englishItemsDigest}=require('../lib/english/prepared-items.ts');
const {validateEnglishOutput,validateEnglishReferenceShape}=require('../lib/english/generation.ts');
const {validateEnglishDraft}=require('../lib/english/draft.ts');
const {approvedEnglishItem,assembleEnglishItems}=require('../lib/english/item-bank.ts');
const {findEnglishBankParts}=require('../lib/english/bank.ts');
const hash=t=>createHash('sha256').update(t).digest('hex'),sha=x=>hash(JSON.stringify(x));
const savedRecord=(draft,status='APPROVED')=>JSON.stringify({draft,status});
function mocked(file,mocks){const m=new Module(path.resolve(root,file),module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return m.exports;}
for(const b of batches){const kind=b.item,marks=kind==='composition'?20:10;
 test(`${kind}: 51 genuinely authored complete models, unique topics, target lengths and reproducible provenance hashes`,()=>{
  assert.equal(b.items.length,51);assert.equal(b.marks,marks);assert.equal(b.reviewStatus,'PREPARED_NOT_IMPORTED');assert.match(b.answerStatus,/NOT official/);
  for(const f of ['id','topic','contentSha256'])assert.equal(new Set(b.items.map(e=>e[f])).size,51);
  assert.equal(new Set(b.items.map(e=>e.answers[0].toLowerCase().replace(/[^a-z0-9]/g,''))).size,51);
  for(const e of b.items){
   assert.equal(e.answers.length,1);assert.equal(e.modelWordCount,e.answers[0].trim().split(/\s+/).length);assert.equal(e.contentSha256,sha({instruction:e.instruction,answers:e.answers}));assert.equal(e.sourceContentSha256,hash(e.sourcePrompt));
   assert.ok(b.sources.some(s=>s.fileId===e.sourceFile&&s.sha256===e.sourceSha256));
   assert.doesNotMatch(e.instruction+e.answers[0],/____|\[(?:name|address|date|insert|your)[^\]]*\]|TODO|<<PAGE|[\uE000-\uF8FF]/i);
   if(kind==='paragraph'){assert.equal(e.words,150);assert.ok(e.modelWordCount>=140&&e.modelWordCount<=170);assert.equal(e.answers[0].split('\n').length,1);}
   if(kind==='composition'){assert.equal(e.words,250);assert.ok(e.modelWordCount>=225&&e.modelWordCount<=280);assert.equal(e.answers[0].split('\n\n').length,4);}
   if(kind==='letter-email'){assert.ok(e.modelWordCount>=110&&e.modelWordCount<=190);assert.ok(['application','letter','email'].includes(e.choice));}
   assert.ok(e.editorialNotes.some(n=>n.includes('fictional')));assert.ok(e.reviewChecklist.length>=3);
  }
 });
 test(`${kind}: every adaptation replays from the intact original prompt/topic, without inventing original exam marks`,()=>{
  const audit=require(`../docs/english/work-in-progress/ssc-paper2-${kind}-candidates.json`);
  assert.equal(audit.candidates.length,{paragraph:93,'letter-email':101,composition:84}[kind]);
  assert.ok(!fs.readFileSync(path.join(root,'lib/english/prepared-ssc-writing.ts'),'utf8').includes('candidates.json'));
  for(const e of b.items){
   let prompt=e.sourcePrompt;for(const c of e.editorialChanges){assert.ok(prompt.includes(c.before));assert.ok(c.reason);prompt=prompt.replace(c.before,c.after);}assert.equal(prompt,e.instruction);
   if(e.sourceKind==='web'){
    for(const k of ['board','school','examYear','examType','pdfPage','questionNumber','originalMarks','sourceCandidateId'])assert.equal(e[k],undefined);
    assert.equal(e.sourcePromptKind,'topic-label-not-exam-question');assert.equal(e.sourcePrompt,e.sourceTopicLabel);assert.match(e.instruction,/Web-topic-backed authored practice/);assert.ok(e.sourceUrl.startsWith('https://'));assert.equal(e.retrievedAt,'2026-11-20');
   }else{
    const c=audit.candidates.find(c=>c.candidateId===e.sourceCandidateId);assert.ok(c);assert.deepEqual(c.issues,[]);
    for(const f of ['sourceFile','sourceSha256','sourceKind','board','school','examType','examYear','pdfPage','questionNumber','originalMarks','sourcePrompt','sourceRawText','rawTextSha256','sourceContentSha256'])assert.deepEqual(e[f],c[f]);
    assert.equal(e.rawTextSha256,hash(e.sourceRawText));assert.ok([10,12,15,20].includes(e.originalMarks));assert.ok(e.pdfPage>0);assert.doesNotMatch(e.sourcePrompt,/<<PAGE|[\uE000-\uF8FF]|\s\d+$/);
    if(e.sourceKind==='school'){assert.ok(e.school);assert.ok(['Test','Pre-Test'].includes(e.examType));assert.equal(e.board,undefined);assert.equal(e.examYear,e.sourceFile==='1esU8C-hZwrqxxmTgWMKCzca17W9z_2N8'?2025:2024);}else{assert.ok(e.board);assert.equal(e.school,undefined);}
   }
  }
 });
 for(const grade of [9,10])test(`${kind} Class ${grade}: 51 drafts retain exact writing request, full model and immutable review snapshot`,()=>{
  const prepared=preparedEnglishItems(grade,2,kind);assert.equal(prepared.length,51);assert.equal(new Set(prepared.map(p=>p.key)).size,51);
  for(let i=0;i<51;i++){
   const p=prepared[i],e=b.items[i],d=p.draft,t=d.output.tasks[0],v=validateEnglishOutput(d.selection,d.output);validateEnglishReferenceShape(d.selection,d.output);
   assert.equal(v.total,marks);assert.equal(v.tasks[0].number,kinds.indexOf(kind)+10);assert.equal(v.tasks[0].section,'writing');assert.equal(v.tasks[0].marks,marks);assert.equal(d.selection.grade,grade);assert.equal(d.selection.paper,2);assert.deepEqual(d.selection.itemIds,[kind]);assert.deepEqual(d.selection.sources,{});assert.deepEqual(d.output.passages,[]);assert.deepEqual(t.subitems,[]);
   assert.deepEqual(d.selection.writing,{[kind]:{topic:e.topic,...(e.words?{words:e.words}:{}),...(e.choice?{choice:e.choice}:{})}});assert.equal(t.instruction,e.instruction);assert.ok(t.instruction.includes(e.topic));assert.equal(t.answer,e.answers[0]);
   assert.equal(p.review.sourceContentSha256,e.sourceContentSha256);assert.deepEqual(p.review.answers,e.answers);assert.deepEqual(p.review.editorialChanges,e.editorialChanges);assert.equal(p.review.source.fileId,e.sourceFile);
   if(e.sourceKind==='web'){assert.equal(t.boardSource,undefined);assert.equal(t.schoolSource,undefined);assert.equal(p.review.sourceUrl,e.sourceUrl);}else{const s=t.boardSource??t.schoolSource;assert.equal(s.originalMarks,e.originalMarks);assert.equal(s.questionNumber,e.questionNumber);assert.equal(s.examYear,e.examYear);assert.equal(s.pdfPage,e.pdfPage);}
   assert.ok(approvedEnglishItem(savedRecord(d),grade,2));for(const status of ['PENDING','REJECTED'])assert.equal(approvedEnglishItem(savedRecord(d,status),grade,2),null);
   assert.equal(approvedEnglishItem(savedRecord(d),grade===9?10:9,2),null);assert.equal(approvedEnglishItem(savedRecord(d),grade,1),null);
  }
 });
 test(`${kind}: ADMIN-only digest-bound consent imports exactly 51 Pending snapshots, preserves approval and rejection`,async()=>{
  const saved=new Map();let calls=0;const db={setting:{createMany:async({data,skipDuplicates})=>{calls++;assert.equal(skipDuplicates,true);for(const r of data)if(!saved.has(r.key))saved.set(r.key,r.value);}}};
  const action=role=>mocked('app/admin/english-review/item-actions.ts',{'@/auth':{auth:async()=>({user:{id:'admin',role}})},'@/lib/db':{db},'next/cache':{revalidatePath(){}}}).importEnglishItems;
  const f=new FormData();f.set('grade','10');f.set('paper','2');f.set('item',kind);f.set('digest',englishItemsDigest(10,2,kind));await action('ADMIN')(f);assert.equal(calls,0);
  f.set('reviewed','yes');await assert.rejects(action('TEACHER')(f),/Forbidden/);assert.equal(calls,0);
  f.set('digest',englishItemsDigest(10,2,'verbs'));await action('ADMIN')(f);assert.equal(calls,0);
  f.set('digest',englishItemsDigest(10,2,kind));await action('ADMIN')(f);assert.equal(saved.size,51);
  for(const value of saved.values()){const r=JSON.parse(value);assert.equal(r.status,'PENDING');assert.deepEqual(r.draft.selection.itemIds,[kind]);assert.equal(r.review.answers[0],r.draft.output.tasks[0].answer);assert.equal(r.review.source.fileId,r.review.sourceFile);}
  const rows=[...saved];for(let i=0;i<2;i++){const [key,value]=rows[i];saved.set(key,value.replace('PENDING',i?'REJECTED':'APPROVED'));}await action('ADMIN')(f);assert.equal(saved.size,51);assert.equal(JSON.parse(saved.get(rows[0][0])).status,'APPROVED');assert.equal(JSON.parse(saved.get(rows[1][0])).status,'REJECTED');
  const digest=englishItemsDigest(10,2,kind),original=b.items[0].sourcePrompt;b.items[0].sourcePrompt+=' changed snapshot';try{assert.notEqual(digest,englishItemsDigest(10,2,kind));assert.equal(JSON.parse(saved.get(rows[0][0])).review.sourcePrompt,original);}finally{b.items[0].sourcePrompt=original;}
 });
 test(`${kind}: approved-only bank matches exact writing topic/length/genre and supports question-only mode`,async()=>{
  const d=preparedEnglishItems(10,2,kind)[0].draft,page=async(after,prefix)=>prefix==='english-item:v1:'?[{key:'first',value:savedRecord(d)}]:[];
  for(const includeAnswers of [true,false]){const r=await findEnglishBankParts({...d.selection,includeAnswers},page);assert.deepEqual(r.missingIds,[]);assert.equal(r.output.tasks[0].instruction,d.output.tasks[0].instruction);assert.deepEqual(r.output.tasks[0].subitems,[]);assert.equal(r.output.tasks[0].answer,includeAnswers?d.output.tasks[0].answer:undefined);}
  const pending=await findEnglishBankParts(d.selection,async(after,prefix)=>prefix==='english-item:v1:'?[{key:'pending',value:savedRecord(d,'PENDING')}]:[]);assert.deepEqual(pending.missingIds,[kind]);
  for(const change of [{topic:'A genuinely different requested topic'},...(kind==='letter-email'?[{choice:'email'}]:[{words:300}])]){
   const selection=structuredClone(d.selection);Object.assign(selection.writing[kind],change);const r=await findEnglishBankParts(selection,page);assert.deepEqual(r.missingIds,[kind]);
  }
 });
}
test('Web supplementation uses 68 actual topic labels, not copied published models or invented examination identities',()=>{
 const expected={paragraph:[19,11,21],'letter-email':[21,12,18],composition:[14,8,29]};
 for(const b of batches){assert.deepEqual(['board','school','web'].map(k=>b.items.filter(e=>e.sourceKind===k).length),expected[b.item]);const source=b.sources.find(s=>s.url),labels=b.items.filter(e=>e.sourceKind==='web').map(e=>e.sourceTopicLabel);assert.deepEqual(source.selectedTopicLabels,labels);assert.equal(source.sha256,sha(labels));assert.match(source.snapshotKind,/NOT a hash of the entire/);assert.match(source.snapshotKind,/no published model answers were copied/);
  const drafts=preparedEnglishItems(10,2,b.item).filter(p=>p.review.sourceKind==='web').map(p=>p.draft);for(const filter of [{examYear:2025},{school:'Babar English'}])assert.deepEqual(assembleEnglishItems(drafts,10,()=>0,[b.item],filter,2).missing,[b.item]);
 }
});
test('Correspondence models cover 19 applications, 20 letters and 12 emails with safe illustrative contact details',()=>{
 const b=batches[1];assert.deepEqual(['application','letter','email'].map(k=>b.items.filter(e=>e.choice===k).length),[19,20,12]);
 for(const e of b.items){const a=e.answers[0];assert.match(a,/(?:Dear |Sir\/Madam,)/);assert.match(a,/(?:Yours faithfully|Your friend|With love|With affection|With best wishes)/);if(e.choice==='email'){assert.match(a,/^From: [^\n]+@example\.com\nTo: [^\n]+@example\.com\nSubject:/);}else assert.match(a,/\d{1,2} (?:February|November) 2026/);if(e.choice==='application')assert.match(a,/Subject:/);}
 const bySource=id=>b.items.find(e=>e.sourceCandidateId?.endsWith(`-${id}`));assert.match(bySource('004').answers[0],/Milon[\s\S]*Pragati|Pragati[\s\S]*Milon/);assert.match(bySource('081').answers[0],/Dear April/);assert.match(bySource('081').answers[0],/Harry$/);assert.match(bySource('059').answers[0],/^10 February 2026/);assert.match(bySource('031').answers[0],/Sadik/);assert.equal(bySource('069').choice,'email');assert.match(bySource('069').answers[0],/Sir\/Madam/);
});
test('All twelve item types now support a 100-mark model for both grades; 612 distinct exercises are not double-counted across grades',()=>{
 for(const grade of [9,10]){
  const prepared=preparedEnglishItems(grade,2);assert.equal(prepared.length,612);assert.equal(new Set(prepared.map(p=>p.key)).size,612);
  const groups=new Map();for(const p of prepared){const id=p.draft.selection.itemIds[0];groups.set(id,(groups.get(id)||0)+1);}assert.equal(groups.size,12);for(const count of groups.values())assert.equal(count,51);
  for(const random of [()=>0,()=>0.5,()=>0.999]){const r=assembleEnglishItems(prepared.map(p=>p.draft),grade,random,undefined,{},2);assert.deepEqual(r.missing,[]);assert.ok(r.draft);const v=validateEnglishOutput(r.draft.selection,r.draft.output);assert.equal(v.total,100);assert.deepEqual(v.tasks.map(t=>t.number),[1,2,3,4,5,6,7,8,9,10,11,12]);assert.deepEqual(v.tasks.map(t=>t.marks),[10,5,10,10,5,5,5,5,5,10,10,20]);assert.equal(r.draft.output.tasks.length,12);assert.deepEqual(Object.keys(r.draft.selection.writing),kinds);validateEnglishReferenceShape(r.draft.selection,r.draft.output);}
  const writing=assembleEnglishItems(prepared.map(p=>p.draft),grade,()=>0,kinds,{},2);assert.equal(validateEnglishOutput(writing.draft.selection,writing.draft.output).total,40);
 }
 for(const grade of [6,7,11,12])for(const kind of kinds)assert.deepEqual(preparedEnglishItems(grade,2,kind),[]);assert.equal(preparedEnglishItems(10,1).length,365);assert.deepEqual(preparedEnglishItems(9,1),[]);
});
test('All 153 writing tasks print the full requested question once and model only when answers are requested',()=>{
 require.extensions['.tsx']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),C=require('../components/paper-builder/english-group.tsx').default;
 const {englishFlowBlocks}=require('../lib/english/flow-blocks.ts'),{englishLegacyPaper}=require('../lib/english/legacy-builder.ts');
 const plain=markup=>markup.replace(/<[^>]+>/g,'').replace(/&#x27;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
 for(const b of batches)for(let i=0;i<51;i++){
  const e=b.items[i],p=preparedEnglishItems(10,2,b.item)[i],paper=englishLegacyPaper(p.draft),blocks=paper.items.flatMap(englishFlowBlocks);assert.equal(blocks.length,1);assert.deepEqual(englishFlowBlocks(blocks[0]),[blocks[0]]);
  const render=props=>plain(renderToStaticMarkup(React.createElement(C,{q:blocks[0],s:{...paper.settings,show:{...paper.settings.show,marks:true}},...props})));
  const q=render({answers:false});assert.equal(q.split(e.instruction).length,2);assert.ok(!q.includes(e.answers[0]));assert.ok(q.includes(`[${b.marks}]`));
  const a=render({questions:false,answers:true});assert.ok(a.includes(e.answers[0]));assert.ok(!a.includes(e.instruction));assert.equal(a.split(e.answers[0]).length,2);assert.doesNotMatch(a,/Fill gap/);
 }
 const admin=fs.readFileSync(path.join(root,'app/admin/questions/english-items.tsx'),'utf8');assert.match(admin,/\["paragraph","letter-email","composition"\]\.includes\(t.id\)/);assert.match(admin,/card.record\?\.review \?\? preparedSSCWritingEntries.find/);
});
