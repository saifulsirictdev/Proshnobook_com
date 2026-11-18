const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module'),path=require('node:path');
function load(file,mocks={}){const m=new Module(path.resolve(file),module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);return m.exports;}
const blueprint=load('lib/english/blueprints.ts');
const selection=load('lib/english/selection.ts',{'./blueprints':blueprint});
const builder=load('lib/english/builder-mode.ts',{'./blueprints':blueprint,'./selection':selection,'./topic-options':{}});
function harness(user={id:'teacher',role:'TEACHER'},sources={}){let reads=0,requests=[];
 const actions=load('app/actions/english-auto-model.ts',{'@/lib/english/bundled-model-sources':{bundledEnglishModelSources:()=>({})},'@/auth':{auth:async()=>({user})},'@/lib/english/blueprints':blueprint,'@/lib/english/builder-mode':builder,'./english-model-sources':{loadEnglishModelSources:async()=>{reads++;return{sources,error:''};}},'./english-paper':{generateEnglishPaper:async raw=>{requests.push(raw);const r=selection.resolveEnglishSelection(raw);assert.equal(r.total,blueprint.englishBlueprint(raw.grade,raw.paper).total);return{ok:true,key:'owned-draft-key'};}}});
 return{prepare:actions.prepareEnglishFullModel,requests,reads:()=>reads};
}
test('Auto-model rejects unsupported/forged inputs and unauthorised users before source/AI lookup',async()=>{
 for(const user of [null,{id:'student',role:'STUDENT'}]){const h=harness(user);assert.equal((await h.prepare({grade:6})).ok,false);assert.equal(h.reads(),0);assert.equal(h.requests.length,0);}
 const h=harness();for(const raw of [{grade:5},{grade:13},{grade:6,paper:3},{grade:6,marks:1000},{grade:6,sources:{fake:{text:'Invented',reference:'Fake'}}}])assert.equal((await h.prepare(raw)).ok,false);
 assert.equal(h.requests.length,0);assert.equal(h.reads(),0);
});
test('Missing exact textbook sources stop before spending generation quota, without inventing seen text',async()=>{
 const h=harness(),r=await h.prepare({grade:6});assert.equal(r.ok,false);assert.deepEqual(r.missing,['seen-1','seen-2','textbook-poems']);assert.equal(h.requests.length,0);
});
test('All supported first papers auto-select full blueprint and writing then invoke existing bank-first/AI-fallback action',async()=>{
 for(let grade=6;grade<=12;grade++){
 const sources=Object.fromEntries(blueprint.englishBlueprint(grade,1).items.filter(i=>i.sourceGroup&&i.sourceGroup!=='unseen').map(i=>[i.sourceGroup,{text:'Approved exact fixture text, not actual textbook content.',reference:'Test fixture'}]));
 const h=harness(undefined,sources);assert.equal((await h.prepare({grade})).ok,true);assert.equal(h.requests.length,1);
 const r=h.requests[0];assert.equal(r.paper,1);assert.equal(r.mode,'full');assert.deepEqual(r.itemIds,[]);assert.equal(r.includeAnswers,true);assert.deepEqual(r.sources,sources);assert.deepEqual(r.writing,builder.fullModelWriting(grade,1));
 }
});
test('Supplying only missing extracts resumes automatic complete-paper generation',async()=>{
 const h=harness(undefined,{'seen-1':{text:'Approved fixture.',reference:'Unit 1'}});
 const supplied={'seen-2':{text:'Teacher fixture.',reference:'Unit 2'},'textbook-poems':{text:'Teacher poem fixture.',reference:'Poems'}};
 assert.equal((await h.prepare({grade:6,sources:supplied})).ok,true);assert.equal(h.requests[0].sources['seen-2'].text,'Teacher fixture.');
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
 const ui=fs.readFileSync('components/english-auto-model.tsx','utf8');assert.ok(ui.includes('prepareEnglishFullModel({ grade, paper })'));assert.ok(ui.includes('prepareEnglishFullModel({ grade, paper, sources })'));
});
test('Bundled Class 6 sources cover all required groups without a source form, never leak to other grades/papers',async()=>{
 const data=require('../lib/english/data/class6-model-sources.json');
 const bundle=load('lib/english/bundled-model-sources.ts',{'./data/class6-model-sources.json':data});
 const bundled=bundle.bundledEnglishModelSources(6,1);
 assert.equal(data.status,'BUNDLED_PRIVATE_PRACTICE_SOURCE_NOT_BANK_APPROVAL');
 assert.deepEqual(Object.keys(bundled),['seen-1','seen-2','textbook-poems']);
 assert.match(bundled['seen-1'].text,/Bulbul collects rubbish/);assert.match(bundled['textbook-poems'].text,/Boats sail on the rivers/);
 for(let grade=7;grade<=12;grade++)assert.deepEqual(bundle.bundledEnglishModelSources(grade,1),{});
 assert.deepEqual(bundle.bundledEnglishModelSources(6,2),{});
 bundled['seen-1'].text='mutated';assert.notEqual(bundle.bundledEnglishModelSources(6,1)['seen-1'].text,'mutated');
 let request;
 const actions=load('app/actions/english-auto-model.ts',{'@/auth':{auth:async()=>({user:{id:'teacher',role:'TEACHER'}})},'@/lib/english/blueprints':blueprint,'@/lib/english/builder-mode':builder,'@/lib/english/bundled-model-sources':bundle,'./english-model-sources':{loadEnglishModelSources:async()=>({sources:{'seen-1':{text:'Approved replacement',reference:'Approved unit'}}})},'./english-paper':{generateEnglishPaper:async raw=>{request=raw;return{ok:true,key:'private-draft'};}}});
 assert.equal((await actions.prepareEnglishFullModel({grade:6,paper:1})).ok,true);
 assert.equal(request.sources['seen-1'].text,'Approved replacement');
 assert.match(request.sources['seen-2'].text,/Health is Wealth/);
 const r=selection.resolveEnglishSelection(request);assert.equal(r.total,100);assert.equal(r.items.length,13);
 assert.equal((await actions.prepareEnglishFullModel({grade:6,sources:{'seen-1':{text:'Teacher replacement',reference:'Teacher unit'}}})).ok,true);
 assert.equal(request.sources['seen-1'].text,'Teacher replacement');
 assert.equal((await actions.prepareEnglishFullModel({grade:7})).ok,false);
});
