const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),Module=require('node:module');
const root=path.resolve(__dirname,'..'),resolve=Module._resolveFilename;
Module._resolveFilename=function(id,parent,...rest){return resolve.call(this,id.startsWith('@/')?path.join(root,id.slice(2)):id,parent,...rest);};
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
const s=require('../lib/auto-model-syllabus.ts'),a=require('../lib/auto-model.ts'),p=require('../lib/auto-model-paper.ts'),settings=require('../lib/paper-builder.ts'),catalog=require('../lib/nctb-data.ts');
function selection(patch={}){const category='Class 8',subject='বাংলা ২য় পত্র';return{category,subject,variant:'MCQ',topics:s.autoModelTopics(category,subject).slice(0,2),syllabus:{reference:'শিক্ষকের নির্ধারিত ব্যাকরণ অনুশীলন; কেবল নির্বাচিত টপিক।',totalMarks:30,minutes:30,sections:[{kind:'MCQ',offered:30,answer:30,marksEach:1}],cqPartMarks:[]},...patch};}
const row=(id,topic,kind='MCQ',parts=4)=>({id,text:`স্বয়ংসম্পূর্ণ প্রশ্ন ${id}`,topic,correct:kind==='MCQ'?'A':'',explanation:`সম্পূর্ণ ব্যাখ্যাসহ উত্তর ${id}`,options:kind==='MCQ'?{A:'উত্তর',B:'ভুল এক',C:'ভুল দুই',D:'ভুল তিন'}:kind==='CQ'?{stimulus:`স্বয়ংসম্পূর্ণ প্রশ্ন ${id}`,subQuestions:Object.fromEntries(['k','kh','g','gh'].slice(0,parts).map(k=>[k,`প্রশ্ন ${k}`]))}:{}});
const paper=(q,req)=>({...q,category:req.category,subject:req.subject,type:s.syllabusRowKind(q,s.resolveSyllabusSelection(req)),stimulus:q.options.stimulus,subQuestions:q.options.subQuestions,options:q.correct?q.options:undefined});
test('every catalog class/subject can opt into an explicit syllabus; no guessed full marks or inherited math',()=>{
 let n=0;for(const cls of catalog.NCTB_CLASSES)for(const sub of cls.subjects){const topics=s.autoModelTopics(cls.class,sub.name);if(!topics.length)continue;const req=selection({category:cls.class,subject:sub.name,topics:[topics[0]]});
  if(a.autoModelBlueprint(cls.class,sub.name,'MCQ'))continue;
  const plan=s.resolveSyllabusSelection(req);assert.equal(plan.totalMarks,30);assert.equal(plan.registered,null);n++;
 }assert.ok(n>40);
 assert.throws(()=>s.resolveSyllabusSelection({...selection(),syllabus:undefined}));
 assert.throws(()=>s.resolveSyllabusSelection(selection({category:'Job'})));
 assert.throws(()=>s.resolveSyllabusSelection(selection({topics:['অন্য বইয়ের অধ্যায়']})));
 assert.throws(()=>s.resolveSyllabusSelection(selection({topics:[selection().topics[0],selection().topics[0]]})));
 for(const change of [{totalMarks:100},{minutes:0},{reference:'অল্প'},{sections:[{kind:'MCQ',offered:5,answer:30,marksEach:1}]}])assert.throws(()=>s.resolveSyllabusSelection(selection({syllabus:{...selection().syllabus,...change}})));
});
test('database stock completes exactly 30 unique MCQ exclusively from selected topics',()=>{
 const req=selection(),plan=s.resolveSyllabusSelection(req),rows=Array.from({length:32},(_,i)=>row('mcq'+i,req.topics[i%2]));
 const result=s.planSyllabusModel([...rows,row('outside','ভিন্ন টপিক'),rows[0],{...rows[1],id:'copied-stem'}],plan);assert.equal(result.ok,true);assert.equal(result.ids.length,30);assert.equal(new Set(result.ids).size,30);assert.equal(result.missing.length,0);assert.ok(!result.ids.includes('outside'));
 const chosen=result.ids.map(id=>paper(rows.find(q=>q.id===id),req)),cfg=p.autoModelSettings(req.category,req.subject,'MCQ',req);
 assert.deepEqual(p.autoModelIssues(chosen,cfg),[]);assert.equal(cfg.info.marks,'30');assert.equal(p.autoModelSections(chosen,cfg)[0].questions.length,30);
 const saved=settings.settingsSchema.parse(JSON.parse(JSON.stringify(cfg)));assert.deepEqual(saved.syllabusSelection,req);assert.deepEqual(p.autoModelIssues(chosen,saved),[]);
 assert.ok(p.autoModelIssues(chosen.slice(1),cfg).length);assert.ok(p.autoModelIssues([...chosen.slice(1),{...chosen[0],topic:'বাইরের টপিক'}],cfg).length);
});
test('a 28-question pool requests only the two missing MCQ, not a replacement model',()=>{
 const req=selection(),plan=s.resolveSyllabusSelection(req),rows=Array.from({length:28},(_,i)=>row('existing'+i,req.topics[0]));
 const r=s.planSyllabusModel(rows,plan);assert.equal(r.ok,false);assert.equal(r.missing.length,2);assert.equal(r.stockIds.length,28);assert.ok(r.missing.every(q=>req.topics.includes(q.topic)&&s.syllabusRowKind(q,plan)==='MCQ'));
});
test('registered mathematics and physics keep their quotas and minimise AI rather than forcing empty-topic rotation',()=>{
 const category='SSC',subject='গণিত',topics=s.autoModelTopics(category,subject),req={category,subject,variant:'MCQ',topics};
 const rows=[[0,12],[5,12],[8,2],[15,1],[16,2]].flatMap(([ch,n])=>Array.from({length:n},(_,i)=>row(`math-${ch}-${i}`,topics[ch])));
 const r=s.planSyllabusModel(rows,s.resolveSyllabusSelection(req));assert.equal(r.ok,false);assert.equal(r.missing.length,1);assert.equal(r.stockIds.length,29);
 assert.throws(()=>s.resolveSyllabusSelection({...req,topics:[topics[0]]}));assert.throws(()=>s.resolveSyllabusSelection({...req,syllabus:selection().syllabus}));
 const physics={category,subject:'পদার্থবিজ্ঞান',variant:'MCQ',topics:s.autoModelTopics(category,'পদার্থবিজ্ঞান')};
 const pr=s.planSyllabusModel([],s.resolveSyllabusSelection(physics));assert.equal(pr.missing.length,25);const cfg=p.autoModelSettings(category,physics.subject,'MCQ',physics);assert.equal(cfg.info.marks,'25');assert.equal(cfg.autoModel,'ssc-physics-mcq-v1');
});
test('written questions and per-question/part marks use the supplied syllabus, surviving save and print sections',()=>{
 const req=selection({variant:'CQ',syllabus:{reference:'নির্ধারিত নমুনা: তিন উপপ্রশ্নের সৃজনশীল ও লিখিত উত্তর।',totalMarks:35,minutes:90,sections:[{kind:'CQ',offered:3,answer:2,marksEach:10},{kind:'SHORT',offered:4,answer:3,marksEach:5}],cqPartMarks:[2,4,4]}}),plan=s.resolveSyllabusSelection(req);
 const rows=[...Array.from({length:3},(_,i)=>row('cq'+i,req.topics[0],'CQ',3)),...Array.from({length:4},(_,i)=>row('sq'+i,req.topics[1],'SHORT'))],r=s.planSyllabusModel(rows,plan);assert.equal(r.ok,true);
 const cfg=p.autoModelSettings(req.category,req.subject,'CQ',req),items=rows.map(q=>paper(q,req));assert.deepEqual(p.autoModelIssues(items,cfg),[]);assert.equal(cfg.info.marks,'35');assert.equal(p.autoModelQuestionMarks(cfg,'SHORT'),5);assert.equal(p.autoModelPartMarks(cfg,0),2);assert.equal(p.autoModelPartMarks(cfg,2),4);
 const sections=p.autoModelSections(items,cfg);assert.equal(sections.length,2);assert.match(sections[1].title,/15/);assert.match(sections[0].instruction,/2–4–4/);
 assert.ok(p.autoModelIssues(items,{...cfg,info:{...cfg.info,marks:'100'}}).length);
});
test('malformed, duplicate, incomplete and externally-dependent questions never count as stock',()=>{
 const req=selection(),plan=s.resolveSyllabusSelection(req),q=row('valid',req.topics[0]);
 for(const bad of [{...q,explanation:''},{...q,correct:'Z'},{...q,options:{...q.options,B:' উত্তর '}},{...q,options:{...q.options,groupId:'shared'}},{...q,text:'নিচের চিত্র দেখে উত্তর দাও'},{...q,text:'![figure](https://bad.test/a.svg)'},{...q,text:'<script>bad</script>'}])assert.equal(s.syllabusRowKind(bad,plan),null);
 assert.equal(s.safeGeneratedModelRow({...q,text:'External https://bad.test/reference'},plan),false);assert.equal(s.safeGeneratedModelRow({...q,text:'বোর্ড প্রশ্ন ২০২৫'},plan),false);
 assert.equal(s.syllabusRowKind({...q,text:'যদি x < 3 হয়, মান কত?'},plan),'MCQ');
});
function harness({user={id:'teacher',role:'TEACHER'},rows=[],dbFailure=false,providerFailure=false,quotaFull=false,locked=false,partialSave=false,onRead=()=>{},bookFailure=false}={}){
 const events=[],saved=[],kv=new Map();let calls=0;
 const code='P2002';if(locked)kv.set('lock','busy');
 const db={question:{findMany:async args=>{events.push(['read',args]);onRead(args,rows);if(bookFailure&&args.where.approved===true)throw Error('book offline');if(dbFailure)throw Error('offline');return [...rows,...saved].filter(q=>args.where.topic.in.includes(q.topic)&&q.category!=="unrelated"&&((args.where.approved===true?q.approved===true:q.approved!==false||q.source===require('../lib/paper-generation.ts').pendingSource(user.id)))).map(q=>({...q}));},create:async({data})=>{events.push(['save',data]);if(partialSave&&saved.length)throw Error('save failed');const q={...data,id:'saved'+saved.length};saved.push(q);return q;}},setting:{deleteMany:async({where})=>{events.push(['delete',where]);if(kv.get(where.key)===where.value)kv.delete(where.key);return {count:0};},create:async({data})=>{events.push(['reserve',data.key]);if((locked&&data.key.includes('model-lock'))||(quotaFull&&data.key.includes('quota:'))||kv.has(data.key))throw Object.assign(Error('unique'),{code});kv.set(data.key,data.value);return data;}}};
 const file='app/actions/auto-model.ts',m=new Module(path.resolve(file),module);m.paths=module.paths;m.require=id=>id==='@/auth'?{auth:async()=>({user})}:id==='@/lib/db'?{db}:id==='@/lib/auto-model-provider'?{requestAutoModelGap:async(p,slots,known)=>{events.push(['provider',slots,known]);calls++;if(providerFailure)throw Error('AI offline');return slots.map((q,i)=>row(`fresh-${calls}-${i}`,q.topic,s.syllabusRowKind(q,p),p.partMarks.length));}}:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
 return{run:m.exports.prepareAutoModel,inspect:m.exports.inspectAutoModel,events,saved,calls:()=>calls};
}
test('server uses complete bank without AI, quota, settings mutation or leaking paid answers',async()=>{
 const req=selection(),h=harness({rows:Array.from({length:30},(_,i)=>({...row('bank'+i,req.topics[0]),approved:true}))});
 const r=await h.run(req);assert.equal(r.ok,true);assert.deepEqual(Object.keys(r).sort(),['assignments','ids','ok']);assert.equal(h.calls(),0);assert.deepEqual(h.events.map(e=>e[0]),['read']);
 const where=h.events[0][1].where;assert.deepEqual(where.topic.in,req.topics);assert.equal(where.subject,req.subject);assert.equal(where.OR[0].approved,true);assert.equal(where.OR[1].approved,false);assert.match(where.OR[1].source,/^AI_PENDING:/);
});
test('server fills just the gap into private unapproved rows, reuses checkpoints and returns only a full model',async()=>{
 const old=process.env.DEEPSEEK_API_KEY;process.env.DEEPSEEK_API_KEY='test-not-a-real-key';try{
  const req=selection(),rows=Array.from({length:28},(_,i)=>({...row('old'+i,req.topics[0]),approved:true}));
  const h=harness({rows});const first=await h.run(req);assert.equal(first.ok,false);assert.equal(first.pending,true);assert.equal(first.added,1);assert.equal(h.calls(),1);assert.equal(h.events.find(e=>e[0]==='provider')[1].length,1);
  assert.ok(h.saved.every(q=>q.approved===false&&q.source.startsWith('AI_PENDING:')&&req.topics.includes(q.topic)));assert.ok(!JSON.stringify(first).includes('স্বয়ংসম্পূর্ণ প্রশ্ন'));
  const second=await h.run(req);assert.equal(second.pending,true);assert.equal(second.added,1);
  const next=await h.run(req);assert.equal(next.ok,true);assert.equal(next.ids.length,30);for(const q of rows)assert.ok(next.ids.includes(q.id));assert.equal(h.calls(),2);
  assert.match(h.events.find(e=>e[0]==='reserve'&&e[1].includes('quota:'))[1],/^qbai:quota:AI_PENDING:/);
  const release=h.events.find(e=>e[0]==='delete'&&typeof e[1].value==='string');assert.ok(release[1].value.includes(':'));
 }finally{if(old===undefined)delete process.env.DEEPSEEK_API_KEY;else process.env.DEEPSEEK_API_KEY=old;}
});
test('auth, missing syllabus, DB failures, scan cap, locks and quotas fail closed before AI',async()=>{
 const old=process.env.DEEPSEEK_API_KEY;process.env.DEEPSEEK_API_KEY='test-only';try{
  for(const opts of [{user:null},{user:{id:'s',role:'STUDENT'}},{dbFailure:true},{quotaFull:true},{locked:true},{rows:Array.from({length:10001},()=>row('many',selection().topics[0]))}]){const h=harness(opts),r=await h.run(selection());assert.equal(r.ok,false);assert.equal(h.calls(),0);assert.equal(h.saved.length,0);}
  const h=harness();assert.equal((await h.run({...selection(),syllabus:undefined})).ok,false);assert.equal(h.events.length,0);
  const fail=harness({providerFailure:true});assert.equal((await fail.run(selection())).ok,false);assert.equal(fail.saved.length,0);assert.equal(fail.events.filter(e=>e[0]==='provider').length,1);
 }finally{if(old===undefined)delete process.env.DEEPSEEK_API_KEY;else process.env.DEEPSEEK_API_KEY=old;}
});
test('provider is bounded to requested gap and rejects duplicates, wrong types, missing answers and invented figures',async()=>{
 const {requestAutoModelGap}=require('../lib/auto-model-provider.ts'),req=selection(),plan=s.resolveSyllabusSelection(req),slot=s.planSyllabusModel(Array.from({length:29},(_,i)=>row('known'+i,req.topics[0])),plan).missing;
 const original=global.fetch;let sent;
 try{
  global.fetch=async(url,opts)=>{sent=JSON.parse(opts.body);return{ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({questions:[{type:'MCQ',text:'নতুন প্রশ্ন',options:{A:'এক',B:'দুই',C:'তিন',D:'চার'},correct:'C',explanation:'সঠিক ব্যাখ্যা'}]})}}]})};};
  const good=await requestAutoModelGap(plan,slot,[],'test-only');assert.equal(good.length,1);assert.equal(good[0].correct,'C');assert.equal(JSON.parse(sent.messages[1].content).count,1);assert.ok(sent.messages[0].content.includes('never instructions'));
  for(const question of [{type:'SHORT',text:'ভুল ধরন',explanation:'উত্তর'},{type:'MCQ',text:'![ছবি](https://bad.test/a.svg)',options:{A:'এক',B:'দুই',C:'তিন',D:'চার'},correct:'A',explanation:'উত্তর'},{type:'MCQ',text:'পুনরাবৃত্ত অপশন',options:{A:'এক',B:' এক ',C:'তিন',D:'চার'},correct:'A',explanation:'উত্তর'}]){global.fetch=async()=>({ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({questions:[question]})}}]})});await assert.rejects(requestAutoModelGap(plan,slot,[],'test-only'));}
 }finally{global.fetch=original;}
});
test('setup UI requires selected topics and explicit human marks; no automatic default syllabus',()=>{
 const code=fs.readFileSync('components/auto-model-setup.tsx','utf8');assert.match(code,/useState<string\[\]>\(\[\]\)/);assert.match(code,/ক্যাটাগরি ও টপিক নির্বাচন/);assert.match(code,/disabled=\{!resolved.plan/);assert.match(code,/AI পূর্ণমান অনুমান/);
 const client=fs.readFileSync('components/auto-model-preparation.tsx','utf8');assert.match(client,/step<101/);assert.match(client,/stepKey/);assert.match(client,/oldSettings/);assert.match(client,/autoModelSettings\(category, subject, variant, selection\)/);
 const page=fs.readFileSync('app/question-builder/auto-model/page.tsx','utf8');assert.match(page,/<AutoModelSetup/);
});
test('different written marks and overlapping topic scopes get distinct assignments and correct printed marks',()=>{
 const base=selection(),req={...base,variant:'CQ',syllabus:{reference:'বার্ষিক বাংলা দ্বিতীয় পত্র: অনুচ্ছেদ ও রচনা, নির্ধারিত নম্বর।',totalMarks:25,minutes:60,sections:[{kind:'SHORT',title:'অনুচ্ছেদ',topics:base.topics,offered:1,answer:1,marksEach:5},{kind:'SHORT',title:'রচনা',topics:[base.topics[0]],offered:1,answer:1,marksEach:20}],cqPartMarks:[]}},plan=s.resolveSyllabusSelection(req);
 const rows=[row('essay',base.topics[0],'SHORT'),row('paragraph',base.topics[1],'SHORT')],result=s.planSyllabusModel(rows,plan);assert.equal(result.ok,true);assert.equal(result.assignments.essay,1);assert.equal(result.assignments.paragraph,0);
 const cfg=p.autoModelSettings(req.category,req.subject,'CQ',req);cfg.syllabusAssignments=result.assignments;
 const items=rows.map(q=>paper(q,req));assert.deepEqual(p.autoModelIssues(items,cfg),[]);assert.equal(p.autoModelQuestionMarks(cfg,'SHORT','essay'),20);assert.equal(p.autoModelQuestionMarks(cfg,'SHORT','paragraph'),5);
 const parts=p.autoModelSections(items,cfg);assert.match(parts[0].title,/অনুচ্ছেদ — 5/);assert.match(parts[1].title,/রচনা — 20/);assert.equal(parts[0].questions[0].q.id,'paragraph');assert.equal(parts[1].questions[0].q.id,'essay');
 const saved=settings.settingsSchema.parse(JSON.parse(JSON.stringify(cfg)));assert.deepEqual(saved.syllabusAssignments,result.assignments);assert.deepEqual(p.autoModelIssues(items,saved),[]);
 assert.ok(p.autoModelIssues(items,{...cfg,syllabusAssignments:{essay:0,paragraph:1}}).length);
});
test('setup checkbox interaction opens preparation with the exact selected syllabus, never a hidden default',async()=>{
 const {JSDOM}=require('jsdom'),dom=new JSDOM('<div id="root"></div>',{url:'https://test.local'}),old={window:global.window,document:global.document,navigator:Object.getOwnPropertyDescriptor(global,'navigator')};
 global.window=dom.window;global.document=dom.window.document;Object.defineProperty(global,'navigator',{value:dom.window.navigator,configurable:true});global.IS_REACT_ACT_ENVIRONMENT=true;
 const React=require('react'),{createRoot}=require('react-dom/client');let received;
 const file='components/auto-model-setup.tsx',m=new Module(path.resolve(file),module);m.paths=module.paths;m.require=id=>id==='@/app/actions/auto-model'?{inspectAutoModel:async raw=>({ok:true,report:require('../lib/auto-model-insights.ts').modelReadiness([],s.resolveSyllabusSelection(raw))})}:id==='./auto-model-preparation'?{__esModule:true,default:props=>{received=props;return React.createElement('p',null,'preparing');}}:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
 const view=createRoot(document.getElementById('root'));
 try{
  await React.act(async()=>view.render(React.createElement(m.exports.default,{category:'SSC',subject:'গণিত',variant:'MCQ'})));
  const button=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('পূর্ণ মডেল তৈরি'));assert.equal(button.disabled,true);
  await React.act(async()=>document.querySelector('input[type=checkbox]').click());assert.equal(button.disabled,true);
  await React.act(async()=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes('বিনা AI-তে')).click());assert.equal(button.disabled,false);
  await React.act(async()=>button.click());assert.equal(received.category,'SSC');assert.equal(received.subject,'গণিত');assert.equal(received.variant,'MCQ');assert.deepEqual(received.selection.topics,s.autoModelTopics('SSC','গণিত'));assert.equal(received.selection.syllabus,undefined);
 }finally{await React.act(async()=>view.unmount());dom.window.close();global.window=old.window;global.document=old.document;if(old.navigator)Object.defineProperty(global,'navigator',old.navigator);else delete global.navigator;delete global.IS_REACT_ACT_ENVIRONMENT;}
});
test('private generated written rows retain section compatibility rather than filling a differently-marked essay',async()=>{
 const req=selection({variant:'CQ',syllabus:{reference:'দুটি স্বতন্ত্র লিখিত বিভাগ: সংক্ষিপ্ত উত্তর ও দীর্ঘ রচনা।',totalMarks:25,minutes:60,sections:[{kind:'SHORT',title:'অনুচ্ছেদ',offered:1,answer:1,marksEach:5},{kind:'SHORT',title:'রচনা',offered:1,answer:1,marksEach:20}],cqPartMarks:[]}}),plan=s.resolveSyllabusSelection(req),gaps=s.planSyllabusModel([],plan).missing;
 const {requestAutoModelGap}=require('../lib/auto-model-provider.ts'),old=global.fetch;let body;
 global.fetch=async(_url,args)=>{body=JSON.parse(args.body);return {ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({questions:[{type:'SHORT',text:'একটি সম্পূর্ণ স্বতন্ত্র অনুচ্ছেদ লিখুন।',explanation:'এখানে একটি সম্পূর্ণ নমুনা অনুচ্ছেদের উত্তর।'}]})}}]})};};
 try{const generated=await requestAutoModelGap(plan,[gaps[0]],[],'test');assert.equal(generated[0].options._autoModelSection,s.syllabusSectionSignature(plan,0));assert.equal(JSON.parse(body.messages[1].content).marks,5);const remaining=s.planSyllabusModel(generated,plan);assert.equal(remaining.ok,false);assert.equal(remaining.missing.length,1);assert.equal(remaining.missing[0].id.split(':')[1],'1');}finally{global.fetch=old;}
});
test('read-only preflight reports selected scope, exact shortfall and marks without answers, writes or AI',async()=>{
 const req=selection(),rows=Array.from({length:28},(_,i)=>({...row('stock'+i,req.topics[0]),approved:true})),h=harness({rows});
 const r=await h.inspect(req);assert.equal(r.ok,true);assert.equal(r.report.complete,false);assert.equal(r.report.offered,30);assert.equal(r.report.stockInModel,28);assert.equal(r.report.aiShortfall,2);assert.equal(r.report.totalMarks,30);assert.equal(r.report.feasible,true);assert.equal(h.calls(),0);assert.deepEqual(h.events.map(e=>e[0]),['read','read']);
 assert.deepEqual(r.report.topics.map(t=>t.topic),req.topics);assert.equal(r.report.topics.reduce((n,t)=>n+t.missing,0),2);assert.ok(!JSON.stringify(r).includes(rows[0].text));assert.ok(!JSON.stringify(r).includes(rows[0].explanation));assert.ok(!JSON.stringify(r).includes(rows[0].id));
 for(const opts of [{user:null},{user:{id:'s',role:'STUDENT'}},{dbFailure:true},{rows:Array.from({length:10001},()=>row('large',req.topics[0]))}]){const bad=harness(opts),v=await bad.inspect(req);assert.equal(v.ok,false);assert.equal(bad.calls(),0);assert.equal(bad.saved.length,0);assert.ok(bad.events.every(e=>e[0]==='read'));}
});
test('recent-question rotation prefers an entirely fresh model, but never creates artificial AI shortages',()=>{
 const req=selection(),rows=Array.from({length:65},(_,i)=>row('question'+i,req.topics[i%2])),old=rows.slice(0,30).map(q=>q.id),plan=s.resolveSyllabusSelection({...req,avoidQuestionIds:old});
 const fresh=s.planSyllabusModel(rows,plan,()=>0.5);assert.equal(fresh.ok,true);assert.equal(fresh.ids.some(id=>old.includes(id)),false);
 const scarce=s.planSyllabusModel(rows.slice(0,30),plan,()=>0.5);assert.equal(scarce.ok,true);assert.equal(scarce.ids.length,30);assert.equal(scarce.missing.length,0);
 const partial=s.planSyllabusModel(rows.slice(0,28),plan,()=>0.5);assert.equal(partial.ok,false);assert.equal(partial.stockIds.length,28);assert.equal(partial.missing.length,2);
 const saved=p.autoModelSettings(req.category,req.subject,'MCQ',{...req,avoidQuestionIds:old});assert.equal(saved.syllabusSelection.avoidQuestionIds,undefined);
});
test('history is bounded, deduplicated, tolerant of corrupt browser values and isolated by class/subject/kind',()=>{
 const h=require('../lib/auto-model-insights.ts');for(const raw of [null,'bad','{}','"string"','[null,1,{},""]','x'.repeat(100001)])assert.deepEqual(h.readModelHistory(raw),[]);
 assert.deepEqual(h.readModelHistory('["a","a","b"]'),['a','b']);assert.deepEqual(h.readModelHistory(h.appendModelHistory('["a","b"]',['a','c'])),['b','a','c']);
 assert.equal(h.readModelHistory(JSON.stringify(Array.from({length:600},(_,i)=>'q'+i))).length,500);assert.notEqual(h.modelHistoryKey('SSC','গণিত','MCQ'),h.modelHistoryKey('SSC','গণিত','CQ'));assert.notEqual(h.modelHistoryKey('SSC','গণিত','MCQ'),h.modelHistoryKey('HSC','গণিত','MCQ'));
});

test('book-wide complete approved stock disables AI even when the chosen topics are empty',async()=>{
 const old=process.env.DEEPSEEK_API_KEY;process.env.DEEPSEEK_API_KEY='test-only';try{
  const req=selection(),other=s.autoModelTopics(req.category,req.subject).find(t=>!req.topics.includes(t));assert.ok(other);
  const h=harness({rows:Array.from({length:30},(_,i)=>({...row('book'+i,other),approved:true}))});
  const r=await h.run(req);assert.equal(r.ok,false);assert.equal(r.databaseOnly,true);assert.match(r.error,/AI বন্ধ/);
  assert.equal(h.calls(),0);assert.equal(h.saved.length,0);assert.ok(h.events.every(e=>e[0]==='read'));
  const report=await h.inspect(req);assert.equal(report.ok,true);assert.equal(report.report.databaseOnly,true);assert.equal(report.report.complete,false);assert.equal(report.report.feasible,false);assert.equal(report.report.aiShortfall,0);assert.equal(report.report.stockShortfall,30);assert.equal(report.report.quotaBatchUpperBound,0);
  const bookRead=h.events.find(e=>e[1]?.where?.approved===true)[1];assert.equal(bookRead.where.subject,req.subject);assert.deepEqual(bookRead.where.topic.in,s.autoModelTopics(req.category,req.subject));
 }finally{if(old===undefined)delete process.env.DEEPSEEK_API_KEY;else process.env.DEEPSEEK_API_KEY=old;}
});
test('book guard is structural, excludes pending items, fails closed on read errors and rechecks after lease',async()=>{
 const old=process.env.DEEPSEEK_API_KEY;process.env.DEEPSEEK_API_KEY='test-only';try{
  const req=selection(),other=s.autoModelTopics(req.category,req.subject).find(t=>!req.topics.includes(t));
  for(const rows of [Array.from({length:50},(_,i)=>({...row('bad'+i,other),approved:true,explanation:''})),Array.from({length:30},(_,i)=>({...row('pending'+i,other),approved:false}))]){
   const h=harness({rows});assert.equal((await h.run(req)).pending,true);assert.equal(h.calls(),1);
  }
  const fail=harness({bookFailure:true});assert.equal((await fail.run(req)).ok,false);assert.equal(fail.calls(),0);assert.ok(fail.events.every(e=>e[0]==='read'));assert.equal((await fail.inspect(req)).ok,false);
  let approvedReads=0;
  const race=harness({onRead:(args,rows)=>{if(args.where.approved===true&&++approvedReads===2)rows.push(...Array.from({length:30},(_,i)=>({...row('import'+i,other),approved:true})));}});
  const r=await race.run(req);assert.equal(r.databaseOnly,true);assert.equal(race.calls(),0);assert.ok(!race.events.some(e=>e[0]==='reserve'&&e[1].includes('quota:')));assert.ok(race.events.some(e=>e[0]==='delete'&&typeof e[1].value==='string'));
 }finally{if(old===undefined)delete process.env.DEEPSEEK_API_KEY;else process.env.DEEPSEEK_API_KEY=old;}
});

test('the database-only book rule applies to every catalog subject with a teacher-supplied MCQ scheme',async()=>{
 let tested=0;
 for(const cls of catalog.NCTB_CLASSES)for(const sub of cls.subjects){
  const topics=s.autoModelTopics(cls.class,sub.name);if(topics.length<2||a.autoModelBlueprint(cls.class,sub.name,'MCQ'))continue;
  const req=selection({category:cls.class,subject:sub.name,topics:[topics[0]]});
  const h=harness({rows:Array.from({length:30},(_,i)=>({...row('whole-book'+i,topics.at(-1)),approved:true}))});
  const r=await h.run(req);assert.equal(r.databaseOnly,true,cls.class+' / '+sub.name);assert.equal(h.calls(),0);assert.ok(h.events.every(e=>e[0]==='read'));tested++;
 }
 assert.ok(tested>40);
});
test('full-book scan overflow cannot authorize AI even when the selected-topic scan is small',async()=>{
 const req=selection(),other=s.autoModelTopics(req.category,req.subject).find(t=>!req.topics.includes(t));
 const h=harness({rows:Array.from({length:10001},(_,i)=>({...row('overflow'+i,other),approved:true}))});
 assert.equal((await h.run(req)).ok,false);assert.equal(h.calls(),0);assert.ok(h.events.every(e=>e[0]==='read'));
 assert.equal((await h.inspect(req)).ok,false);
});
