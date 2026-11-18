const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),Module=require('node:module');
const root=path.resolve(__dirname,'..'),original=Module._resolveFilename;
Module._resolveFilename=function(id,parent,...rest){return original.call(this,id.startsWith('@/')?path.join(root,id.slice(2)):id,parent,...rest);};
require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const {englishBuilderContext:context,englishBuilderHref:href,fullModelWriting}=require('../lib/english/builder-mode.ts');
const {resolveEnglishSelection}=require('../lib/english/selection.ts');
test('English first paper for all supported classes route to full and topic-wise native English tasks',()=>{
 for(let grade=6;grade<=12;grade++)for(const paper of [1]){
  const category=`Class ${grade}`,subject=`English ${paper===1?'1st':'2nd'} Paper`,c=context(category,subject);
  assert.equal(c.grade,grade);assert.equal(c.paper,paper);
  assert.equal(new URL(href(category,subject,'full','stale-topic'),'https://proshnobook.com').searchParams.get('mode'),'full');
  for(const item of c.blueprint.items){const p=new URL(href(category,subject,'topic',item.id),'https://proshnobook.com').searchParams;assert.equal(p.get('mode'),'topic');assert.equal(p.get('item'),item.id);assert.equal(Number(p.get('paper')),paper);}
  assert.equal(href(category,subject,'topic','fake'),null);assert.equal(href(category,subject,'topic',''),null);assert.equal(href(category,subject,'',''),null);
  const sources=Object.fromEntries(c.blueprint.items.filter(i=>i.sourceGroup&&i.sourceGroup!=='unseen').map(i=>[i.sourceGroup,{text:'Teacher supplied textbook extract for validation only.',reference:'Teacher provided source reference'}]));
  const r=resolveEnglishSelection({grade,paper,mode:'full',itemIds:[],writing:fullModelWriting(grade,paper),sources,includeAnswers:false});
  assert.equal(r.items.length,c.blueprint.items.length);assert.equal(r.total,c.blueprint.total);
 }
});
test('Aliases cover SSC/HSC/Bangla English but not Job, Admission or non-English subjects',()=>{
 assert.equal(context('SSC','English 1st Paper').grade,9);assert.equal(context('HSC','English 1st Paper').grade,11);
 assert.equal(context('Class 11-12','English For Today').paper,1);assert.equal(context('Class 9-10','ইংরেজি ২য় পত্র'),null);
 for(const category of ['Job','Admission','Class 5',''])assert.equal(context(category,'English'),null);
 assert.equal(context('Class 6','গণিত'),null);
});
test('Full model defaults do not bypass mandatory exact textbook inputs',()=>{
 assert.throws(()=>resolveEnglishSelection({grade:6,paper:1,mode:'full',itemIds:[],writing:fullModelWriting(6,1),sources:{},includeAnswers:false}),/textbook/);
});
function loadComponent(mocks){const filename=path.resolve('components/qb-start.tsx'),m=new Module(filename,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,filename);return m.exports.default;}
function renderStarter(category,subject,mode,topic='',append=false,topicKind='item'){
 const React=require('react'),states=[category,'','','ALL',subject,mode,topic,topicKind,'',''];let index=0;
 const Start=loadComponent({'react':{...React,useState:()=>[states[index++],()=>{}]},'next/navigation':{useRouter:()=>({push(){}}),useSearchParams:()=>new URLSearchParams(append?'append=1':'')},'@/lib/nctb-data':require('../lib/nctb-data.ts'),'@/lib/english/builder-mode':require('../lib/english/builder-mode.ts'),'@/lib/english/topic-options':require('../lib/english/topic-options.ts'),'@/lib/question-type-options':require('../lib/question-type-options.ts'),'@/lib/exam-preparation':require('../lib/exam-preparation.ts'),'@/lib/job-syllabuses.json':require('../lib/job-syllabuses.json')});
 return require('react-dom/server').renderToStaticMarkup(React.createElement(Start,{pairs:[]}));
}
test('Subject is followed by exactly two English modes; topic list and full marks are conditional',()=>{
 const html=renderStarter('6','English 1st Paper','topic','paragraph');
 assert.ok(html.indexOf('aria-label="বিষয়"')<html.indexOf('aria-label="English প্রশ্নপত্রের ধরন"'));
 assert.match(html,/>Topic-wise<\/option>/);assert.match(html,/>Full Model Test<\/option>/);assert.match(html,/aria-label="English question item"/);assert.match(html,/Writing Paragraph/);assert.doesNotMatch(html,/name="questionType"/);
 const full=renderStarter('6','English 1st Paper','full');assert.doesNotMatch(full,/aria-label="English question item"/);assert.match(full,/100/);assert.match(full,/পূর্ণ মডেল টেস্ট তৈরি করুন/);
 const other=renderStarter('6','গণিত','');assert.match(other,/name="questionType"/);assert.doesNotMatch(other,/aria-label="English প্রশ্নপত্রের ধরন"/);
 const append=renderStarter('6','English 1st Paper','', '',true);assert.match(append,/name="questionType"/);
});
function reviewRecord(status='APPROVED',grade=6){return {value:JSON.stringify({status,draft:{version:1,name:'Approved source fixture',selection:{grade,paper:1,mode:'selected',itemIds:['mcq'],writing:{},sources:{'seen-1':{text:'Exact approved test extract.',reference:'Fixture, not textbook content'}},includeAnswers:true},output:{passages:[{key:'seen-1',text:'Exact approved test extract.'}],tasks:[{id:'mcq',instruction:'Choose the correct answer.',passageKey:'seen-1',subitems:Array.from({length:7},(_,i)=>({text:`Question ${i}`,options:['a','b','c','d'],answer:'b'}))}]},header:require('../lib/paper-header.ts').paperHeaderSchema.parse({}),fontSize:12,font:'serif',updatedAt:'2026-11-10T00:00:00.000Z'}})};}
test('Automatic sources accept only valid approved same-class/paper snapshots',()=>{
 const {approvedModelSources:read}=require('../lib/english/model-sources.ts');
 assert.deepEqual(read([reviewRecord('PENDING'),{value:'bad'},reviewRecord('APPROVED',7)],6,1),{});
 assert.equal(read([reviewRecord()],6,1)['seen-1'].text,'Exact approved test extract.');
 assert.deepEqual(read([reviewRecord()],6,2),{});
 const malformed=JSON.parse(reviewRecord().value);malformed.draft.output.tasks=[];
 assert.deepEqual(read([{value:JSON.stringify(malformed)}],6,1),{});
});
function sourceAction(user,rows,fail=false){
 let reads=0;const file='app/actions/english-model-sources.ts',m=new Module(path.resolve(file),module);m.paths=module.paths;
 m.require=id=>id==='@/auth'?{auth:async()=>({user})}:id==='@/lib/db'?{db:{setting:{findMany:async args=>{reads++;assert.equal(args.where.key.startsWith,'english-review:');assert.equal(args.take,100);if(fail)throw Error('database failed');return rows;}}}}:require(id);
 m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
 return {read:m.exports.loadEnglishModelSources,reads:()=>reads};
}
test('Source lookup is authenticated, bounded and read-only, with graceful failure',async()=>{
 for(const user of [null,{id:'student',role:'STUDENT'}]){const h=sourceAction(user,[]);assert.ok((await h.read(6,1)).error);assert.equal(h.reads(),0);}
 const h=sourceAction({id:'teacher',role:'TEACHER'},[{key:'english-review:test',...reviewRecord()}]);
 assert.ok((await h.read(6,1)).sources['seen-1']);assert.equal(h.reads(),1);
 for(const args of [[5,1],[13,1],[6,3],[NaN,1]])assert.ok((await h.read(...args)).error);
 assert.equal(h.reads(),1);
 const failed=sourceAction({id:'teacher',role:'TEACHER'},[],true);assert.deepEqual((await failed.read(6,1)).sources,{});
});
const {englishQuestionItemGroups:questionGroups,englishLessonOptions:lessonOptions}=require('../lib/english/topic-options.ts');
test('Class 6 screenshot groups retain their own labels, with complete Q1–4 and Q5–7 membership',()=>{
 const groups=questionGroups(6,1);assert.equal(groups.length,8);
 assert.deepEqual(groups[0].itemIds,['mcq','comprehension','gap','vocabulary']);assert.deepEqual(groups[1].itemIds,['information','true-false','summary']);
 assert.match(groups[0].title,/01–04: Seen/);assert.match(groups[1].title,/05–07: Unseen/);
 assert.deepEqual(groups.slice(2).map(g=>g.itemIds[0]),['matching','rearranging','poems','story','paragraph','dialogue']);
 const seen=new URL(href('6','English 1st Paper','topic','seen-comprehension','item'),'https://proshnobook.com');
 assert.equal(seen.searchParams.get('group'),'seen-comprehension');assert.equal(seen.searchParams.get('item'),null);
 const unseen=new URL(href('6','English 1st Paper','topic','unseen-comprehension','item'),'https://proshnobook.com');assert.equal(unseen.searchParams.get('group'),'unseen-comprehension');
 for(let grade=8;grade<=12;grade++){
  const b=context(`Class ${grade}`,'English 1st Paper').blueprint,g=questionGroups(grade,1);
  assert.equal(g.length,b.items.length);assert.deepEqual(g.flatMap(x=>x.itemIds),b.items.map(x=>x.id));
  g.forEach((x,i)=>{assert.ok(x.title.startsWith(`Ques. No. ${String(i+1).padStart(2,'0')}:`));assert.ok(x.title.includes(b.items[i].title));});
  assert.equal(href(`Class ${grade}`,'English 1st Paper','topic','seen-comprehension','item'),null);
 }
});
test('Lesson mode retains exact old catalog topics and routes only a selected valid lesson to the bank picker',()=>{
 const classes=require('../lib/nctb-data.ts').NCTB_CLASSES;
 for(let grade=6;grade<=12;grade++){
  const options=lessonOptions(grade,1),c=classes.find(c=>c.class===options.category),subject=c.subjects.find(s=>s.name===options.subject);
  const expected=[...new Set(subject.chapters||subject.subCategories.flatMap(g=>g.topics))];assert.deepEqual(options.topics,grade===7?expected.filter(t=>/^Unit-\d{2}:/.test(t)):expected);
  assert.deepEqual(options.groups,subject.subCategories||[]);
  assert.ok(options.topics.length>0);
  const u=new URL(href(`Class ${grade}`,'English 1st Paper','topic',options.topics[0],'lesson'),'https://proshnobook.com');
  assert.equal(u.pathname,'/question-builder/create');assert.equal(u.searchParams.get('topic'),options.topics[0]);assert.equal(u.searchParams.get('subject'),options.subject);assert.equal(u.searchParams.get('category'),options.category);
  assert.equal(u.searchParams.get('questionType'),'ALL');assert.equal(href(`Class ${grade}`,'English 1st Paper','topic','invented lesson','lesson'),null);
 }
 assert.equal(lessonOptions(6,1).topics.length,33);assert.equal(lessonOptions(7,1).notice,'');assert.equal(lessonOptions(8,1).notice,'');
 assert.equal(href('6','English 1st Paper','topic','paragraph','fake'),null);
});
test('Rendered Topic-wise has Lesson / Question item and keeps their lists separate',()=>{
 const root=renderStarter('6','English 1st Paper','topic','',false,'');
 assert.match(root,/>Lesson<\/option>/);assert.match(root,/>Question item<\/option>/);assert.doesNotMatch(root,/aria-label="English lesson"|aria-label="English question item"/);
 const lesson=renderStarter('6','English 1st Paper','topic','',false,'lesson');assert.match(lesson,/Lesson-01: Going to a new school/);assert.match(lesson,/Lesson-33: The Garden/);assert.doesNotMatch(lesson,/aria-label="English question item"/);
 const item=renderStarter('6','English 1st Paper','topic','',false,'item');assert.match(item,/01–04: Seen Comprehension/);assert.match(item,/05–07: Unseen Comprehension/);assert.doesNotMatch(item,/Lesson-01: Going to a new school/);
 const seven=renderStarter('7','English 1st Paper','topic','',false,'lesson');assert.match(seven,/Unit-09: Climate Change/);assert.doesNotMatch(seven,/সূচি নেই/);
});
test('English second paper is excluded from the new system and keeps the legacy starter selection',async()=>{
 for(let grade=6;grade<=12;grade++){
  assert.equal(context(`Class ${grade}`,'English 2nd Paper'),null);assert.equal(href(`Class ${grade}`,'English 2nd Paper','full',''),null);assert.deepEqual(questionGroups(grade,2),[]);assert.deepEqual(fullModelWriting(grade,2),{});
 }
 const html=renderStarter('6','English 2nd Paper','');assert.match(html,/name="questionType"/);assert.doesNotMatch(html,/aria-label="English প্রশ্নপত্রের ধরন"|aria-label="English topic type"/);
 const h=sourceAction({id:'teacher',role:'TEACHER'},[]);assert.ok((await h.read(6,2)).error);assert.equal(h.reads(),0);
});
function entryPage(){const file='app/question-builder/english/page.tsx',m=new Module(path.resolve(file),module);m.paths=module.paths;m.require=id=>['@/components/english-setup','@/components/english-auto-model'].includes(id)?{__esModule:true,default:()=>null}:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return m.exports.default;}
test('Grouped entry preselects every member; forged class/group and second-paper query cannot inject items',async()=>{
 const page=entryPage();
 for(const group of ['seen-comprehension','unseen-comprehension']){
  const element=await page({searchParams:Promise.resolve({grade:'6',paper:'1',mode:'topic',group})});assert.equal(element.props.initialMode,'selected');assert.deepEqual(element.props.initialItems,questionGroups(6,1).find(g=>g.id===group).itemIds);
 }
 const unknown=await page({searchParams:Promise.resolve({grade:'9',paper:'1',mode:'topic',group:'seen-comprehension'})});assert.equal(unknown.props.initialItems,undefined);
 const second=await page({searchParams:Promise.resolve({grade:'6',paper:'2',mode:'topic',group:'seen-comprehension',item:'mcq'})});assert.equal(second.props.initialMode,'full');assert.equal(second.props.initialItem,'');assert.equal(second.props.initialItems,undefined);
});
test('Class 7 supplied screenshot provides nine units and its own eight question groups',async()=>{
 const units=['Unit-01: Attention, Please','Unit-02: My Study Guide','Unit-03: What are Friends for?','Unit-04: People Who Make a Difference','Unit-05: Great Women to Remember','Unit-06: Leisure','Unit-07: Games and Sports','Unit-08: Likes and Dislikes','Unit-09: Climate Change'];
 assert.deepEqual(lessonOptions(7,1).topics,units);assert.equal(lessonOptions(7,1).notice,'');
 const groups=questionGroups(7,1);assert.equal(groups.length,8);assert.deepEqual(groups.flatMap(g=>g.itemIds),context('Class 7','English 1st Paper').blueprint.items.map(i=>i.id));
 assert.equal(groups[0].title,'Ques. No. 01–04: Seen Comprehension');assert.equal(groups[4].title,'Ques. No. 10: Question Answer from Poem');assert.equal(groups[5].title,'Ques. No. 11: Completing a Story');assert.equal(groups[7].title,'Ques. No. 13: Writing Dialogues');
 assert.ok(!groups.some(g=>/model/i.test(g.title)));
 for(const group of groups.slice(0,2)){
  const url=new URL(href('7','English 1st Paper','topic',group.id,'item'),'https://proshnobook.com');
  const page=await entryPage()({searchParams:Promise.resolve(Object.fromEntries(url.searchParams))});assert.deepEqual(page.props.initialItems,group.itemIds);
 }
 for(const unit of units){const url=new URL(href('7','English 1st Paper','topic',unit,'lesson'),'https://proshnobook.com');assert.equal(url.searchParams.get('topic'),unit);assert.equal(url.searchParams.get('category'),'Class 7');}
 const legacy=require('../lib/nctb-data.ts').NCTB_CLASSES.find(c=>c.class==='Class 7').subjects.find(s=>s.name==='English 1st Paper').chapters;
 assert.ok(legacy.includes('Ques. No.-08: Matching'));assert.ok(legacy.includes('Model Tests: English 1st Paper'));
 const html=renderStarter('7','English 1st Paper','topic','',false,'item');assert.match(html,/01–04: Seen Comprehension/);assert.match(html,/05–07: Unseen Comprehension/);
 assert.equal(questionGroups(8,1).length,13);assert.equal(context('Class 7','English 2nd Paper'),null);
});
