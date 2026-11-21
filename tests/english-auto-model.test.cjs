const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module'),path=require('node:path');
function load(file,mocks={}){const m=new Module(path.resolve(file),module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);return m.exports;}
const blueprint=load('lib/english/blueprints.ts');
const selection=load('lib/english/selection.ts',{'./blueprints':blueprint});
const builder=load('lib/english/builder-mode.ts',{'./blueprints':blueprint,'./selection':selection,'./topic-options':{}});
function harness(user={id:'teacher',role:'TEACHER'},sources={},bankResult={ok:false,reason:'MISSING_APPROVED_ITEMS',error:'No approved model'}){let reads=0,requests=[],bank=[],bankCalls=[];
 const actions=load('app/actions/english-auto-model.ts',{'@/auth':{auth:async()=>({user})},'./english-bank-model':{prepareEnglishBankModel:async (...args)=>{bank.push(args[0]);bankCalls.push(args);return bankResult;}},'@/lib/english/bundled-model-sources':{bundledEnglishModelSources:()=>({})},'@/lib/english/blueprints':blueprint,'@/lib/english/builder-mode':builder,'./english-model-sources':{loadEnglishModelSources:async()=>{reads++;return{sources,error:''};}},'./english-paper':{generateEnglishPaper:async raw=>{requests.push(raw);selection.resolveEnglishSelection(raw);return{ok:true,key:'owned-draft-key'};}}});
 return{prepare:actions.prepareEnglishFullModel,requests,bank,bankCalls,reads:()=>reads};
}
test('First paper auto models delegate only to approved database full models across all grades',async()=>{
 for(let grade=6;grade<=12;grade++){const h=harness();const r=await h.prepare({grade,paper:1});assert.equal(r.ok,false);assert.deepEqual(h.bank,[grade]);assert.equal(h.reads(),0);assert.equal(h.requests.length,0);}
});
test('First paper rejects unauthorised and invalid inputs without bank/provider lookup',async()=>{
 for(const user of [null,{id:'student',role:'STUDENT'}]){const h=harness(user);assert.equal((await h.prepare({grade:6})).ok,false);assert.equal(h.bank.length,0);assert.equal(h.requests.length,0);}
 for(const raw of [{grade:5},{grade:13},{grade:6,paper:3},{grade:6,marks:1000}]){const h=harness();assert.equal((await h.prepare(raw)).ok,false);assert.equal(h.bank.length,0);}
});
test('Full entry mounts auto preparation instead of task configuration, with review before layout',async()=>{
 const Auto=()=>null,Setup=()=>null;
 const page=load('app/question-builder/english/page.tsx',{'@/lib/english/topic-options':{englishQuestionItemGroups:()=>[]},'@/components/english-auto-model':{__esModule:true,default:Auto},'@/components/english-setup':{__esModule:true,default:Setup}}).default;
 assert.equal((await page({searchParams:Promise.resolve({grade:'7',paper:'1',mode:'full'})})).type,Auto);
 assert.equal((await page({searchParams:Promise.resolve({grade:'7',paper:'2',mode:'full'})})).type,Auto);
 assert.equal((await page({searchParams:Promise.resolve({grade:'7',paper:'1',mode:'topic'})})).type,Setup);
 const ui=fs.readFileSync('components/english-auto-model.tsx','utf8');assert.ok(ui.includes('&stage=review'));assert.ok(ui.includes('request.current ??='));assert.ok(!ui.includes('EnglishSetup'));
 const editor=fs.readFileSync('components/english-editor.tsx','utf8');assert.ok(editor.includes('if (await save()) { setReviewing(false); setSettingsOpen(true); }'));assert.ok(editor.includes('{!reviewing && <PaperSettingsPanel'));assert.ok(editor.includes('প্রশ্ন বদলান / সম্পাদনা করুন'));assert.ok(editor.includes('return !changed;'));
});
test('Second-paper auto models select grade-specific grammar/writing, require no seen extract and retain review routing',async()=>{
 for(let grade=6;grade<=12;grade++){
  const h=harness();assert.equal((await h.prepare({grade,paper:2})).ok,true);assert.equal(h.reads(),0);assert.equal(h.requests.length,1);
  const request=h.requests[0],r=selection.resolveEnglishSelection(request),bp=blueprint.englishBlueprint(grade,2);
  assert.equal(request.paper,2);assert.equal(request.mode,'full');assert.deepEqual(request.sources,{});assert.deepEqual(r.items,bp.items);assert.deepEqual(request.writing,builder.fullModelWriting(grade,2));assert.equal(r.total,grade<=8?50:100);
  assert.ok(r.items.some(i=>i.section==='grammar'));assert.ok(r.items.some(i=>i.section==='writing'));assert.equal(r.items.some(i=>i.section==='reading'),false);
  assert.equal(r.items.some(i=>i.id==='narration'),[7,8,11,12].includes(grade));
 }
 const h=harness();assert.equal((await h.prepare({grade:6,paper:2,sources:{'seen-1':{text:'Not allowed',reference:'Not needed'}}})).ok,false);assert.equal(h.reads(),0);assert.equal(h.requests.length,0);
 const Auto=()=>null;
 const page=load('app/question-builder/english/page.tsx',{'@/lib/english/topic-options':{englishQuestionItemGroups:()=>[{id:'verbs',itemIds:['verbs']}]},'@/components/english-auto-model':{__esModule:true,default:Auto},'@/components/english-setup':{__esModule:true,default:()=>null}}).default;
 const auto=await page({searchParams:Promise.resolve({grade:'8',paper:'2',mode:'full'})});assert.equal(auto.type,Auto);assert.equal(auto.props.paper,2);assert.equal(auto.props.grade,8);assert.equal(auto.key,'8-2');
 const item=await page({searchParams:Promise.resolve({grade:'8',paper:'2',mode:'topic',item:'verbs'})});assert.equal(item.props.initialMode,'selected');assert.equal(item.props.initialItem,'verbs');assert.equal(item.props.initialPaper,2);
 const ui=fs.readFileSync('components/english-auto-model.tsx','utf8');assert.ok(ui.includes('prepareEnglishBankModel(grade,'));assert.ok(ui.includes('prepareEnglishFullModel({ grade, paper, sources })'));
});
test('Thirty distinct textbook units and six poems rotate without duplicate passages or foreign-grade fallback',()=>{
 const data=require('../lib/english/data/class6-seen-pool.json'),crypto=require('node:crypto');
 const bundle=load('lib/english/bundled-model-sources.ts',{'./data/class6-seen-pool.json':data});
 assert.equal(data.seen.length,30);assert.equal(data.poems.length,6);
 assert.equal(data.sourceSha256,'bc5a1b181b3f60fe35594a061c875d9e5d3d3f42df16296b33b738bdb30c6e3d');
 assert.equal(new Set(data.seen.map(p=>p.id)).size,30);assert.equal(new Set(data.seen.map(p=>p.text)).size,30);
 for(const p of data.seen){assert.equal(p.textSha256,crypto.createHash('sha256').update(p.text).digest('hex'));assert.ok(p.wordCount>=55);assert.equal(p.wordCount,p.text.split(/\s+/).length);assert.ok(p.reference.includes('PDF'));assert.ok(p.pdfPages.length>0);assert.ok(p.printedPages.length>0);}
 const firsts=new Set(),seconds=new Set(),poemSets=new Set();
 for(let seed=1;seed<=500;seed++){
  let state=seed;const random=()=>{state=(state*1664525+1013904223)>>>0;return state/4294967296;}; for(let warm=0;warm<10;warm++)random();
  const sources=bundle.bundledEnglishModelSources(6,1,random),a=data.seen.find(p=>p.text===sources['seen-1'].text),b=data.seen.find(p=>p.text===sources['seen-2'].text);
  assert.ok(a.eligibleGroups.includes('seen-1'));assert.ok(a.wordCount>=100);assert.notEqual(a.id,b.id);assert.notEqual(a.lesson,b.lesson);
  firsts.add(a.id);seconds.add(b.id);poemSets.add(sources['textbook-poems'].text);
  assert.equal(sources['textbook-poems'].text.split('\n\n---\n\n').length,3);assert.ok(sources['textbook-poems'].reference.length<=500);
  const r=selection.resolveEnglishSelection({grade:6,paper:1,mode:'full',itemIds:[],sources,writing:builder.fullModelWriting(6,1),includeAnswers:true});assert.equal(r.total,100);
 }
 assert.ok(firsts.size>15);assert.equal(seconds.size,30);assert.ok(poemSets.size>10);
});
test('First-paper Question Item routes use the same bank preparation with the chosen ids',async()=>{
 const Auto=()=>null;
 const page=load('app/question-builder/english/page.tsx',{'@/lib/english/topic-options':{englishQuestionItemGroups:()=>[{id:'seen',itemIds:['mcq','comprehension']},{id:'unseen',itemIds:['summary']}]},'@/components/english-auto-model':{__esModule:true,default:Auto},'@/components/english-setup':{__esModule:true,default:()=>null}}).default;
 for(const [query,expected] of [[{group:'seen'},['mcq','comprehension']],[{item:'summary'},['summary']]]){
  const result=await page({searchParams:Promise.resolve({grade:'6',paper:'1',mode:'topic',...query})});assert.equal(result.type,Auto);assert.deepEqual(result.props.itemIds,expected);
 }
 const ui=fs.readFileSync('components/english-auto-model.tsx','utf8');assert.match(ui,/<PreparationPopup/);assert.match(ui,/databaseOnly=\{paper === 1\}/);assert.match(ui,/paper === 2 \? "&stage=review" : "&stage=setup"/);
});
test('Second-paper auto models use the approved bank with its own writing topics before any AI/default-topic lookup',async()=>{
 for(const grade of [9,10]){
  const h=harness({id:'teacher',role:'TEACHER'},{},{ok:true,key:'approved-bank-owned-draft'});
  assert.deepEqual(await h.prepare({grade,paper:2}),{ok:true,key:'approved-bank-owned-draft'});
  assert.deepEqual(h.bankCalls,[[grade,undefined,{},2]]);assert.equal(h.requests.length,0);assert.equal(h.reads(),0);
 }
});
test('Second paper does not spend AI quota on a database/save failure or unclassified failure',async()=>{
 for(const bankResult of [{ok:false,reason:'DATABASE_FAILURE',error:'DB unavailable'},{ok:false,error:'Session or unknown failure'}]){
  const h=harness({id:'teacher',role:'TEACHER'},{},bankResult);
  assert.deepEqual(await h.prepare({grade:9,paper:2}),bankResult);assert.equal(h.requests.length,0);
 }
});
test('Second-paper AI fallback requires an explicit approved-stock shortfall and retains the selected grade',async()=>{
 const h=harness();assert.equal((await h.prepare({grade:9,paper:2})).ok,true);
 assert.deepEqual(h.bankCalls,[[9,undefined,{},2]]);assert.equal(h.requests.length,1);assert.equal(h.requests[0].grade,9);assert.equal(h.requests[0].paper,2);
});
