const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  ts = require("typescript"),
  Module = require("node:module");
const root = path.resolve(__dirname, ".."),
  resolve = Module._resolveFilename;
Module._resolveFilename = function (id, parent, ...rest) {
  return resolve.call(
    this,
    id.startsWith("@/") ? path.join(root, id.slice(2)) : id,
    parent,
    ...rest,
  );
};
require.extensions[".ts"] = (m, file) =>
  m._compile(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText,
    file,
  );
const a=require('../lib/auto-model.ts'),p=require('../lib/auto-model-paper.ts'),b=require('../lib/paper-builder.ts');
const policies=require('../lib/subject-model-policy.ts'),policy=policies.subjectModelPolicy('SSC','পদার্থবিজ্ঞান');
const release=require('../scripts/question-bank/release-ssc-physics.cjs');
// Historical publication fixture only, never execute publish or change production.
const plan=release.prepare({...release.load(),autoModelBlueprint:()=>null}),stock=plan.records;
const assemble=(rows=stock,variant='CQ',random=()=>0.5)=>a.assembleSubjectAutoModel(rows,'SSC',policy.subject,variant,random);
const kind=q=>a.autoModelRowKind(q,policy),chapter=q=>policies.subjectModelChapter(policy,q.topic);
const paper=q=>({...q,type:kind(q),stimulus:q.options.stimulus,subQuestions:q.options.subQuestions,options:q.correct?q.options:undefined});
function seeded(seed){let n=seed;return()=>((n=(n*1664525+1013904223)>>>0)/4294967296)}
function selected(result,rows=stock){assert.equal(result.ok,true,JSON.stringify(result));return result.ids.map(id=>rows.find(q=>q.id===id));}
test('explicit full-catalog owner policy and saved IDs; other subjects/categories do not inherit Physics',()=>{
 assert.equal(policy.chapters.length,14);assert.equal(policy.officialYear,null);assert.deepEqual(policy.cqPartMarks,[1,2,3,4]);assert.equal(policy.theoryMarks,75);assert.equal(policy.practicalMarks,25);assert.equal(policy.totalTheoryMinutes,180);
 for(const category of ['SSC','Class 9','Class 10','9','10','Class 9-10']) assert.equal(policies.subjectModelPolicy(category,policy.subject).id,policy.id);
 for(const [category,subject] of [['HSC',policy.subject],['Class 8',policy.subject],['SSC','রসায়ন'],['SSC','জীববিজ্ঞান'],['SSC','English 1st Paper']]){
  assert.equal(policies.subjectModelPolicy(category,subject),null);assert.equal(a.assembleSubjectAutoModel(stock,category,subject,'CQ').ok,false);
 }
 assert.equal(policies.subjectModelChapter(policy,'chapter 2'),null);
 for(const variant of ['MCQ','CQ'])assert.equal(b.settingsSchema.parse(p.autoModelSettings('SSC',policy.subject,variant)).autoModel,policy.variants[variant].id);
 assert.equal(b.settingsSchema.parse({autoModel:'ssc-unknown-written-v1'}).autoModel,undefined);
});
test('all 6400 published canonical questions classify with preserved figures and answers',()=>{
 assert.deepEqual(stock.reduce((n,q)=>(n[kind(q)]++,n),{MCQ:0,CQ:0,SHORT:0}),{MCQ:3500,CQ:1640,SHORT:1260});
 assert.equal(stock.filter(a.autoModelHasDiagram).length,2205);
});
test('actual stock repeatedly satisfies exact CQ and SQ fixed six plus one OTHER; same extra chapter allowed, not forced',()=>{
 const extras=new Set(),models=new Set();let overlap=false,different=false;
 for(let seed=1;seed<=35;seed++){
  const result=assemble(stock,'CQ',seeded(seed)),qs=selected(result);assert.equal(qs.length,14);assert.equal(new Set(result.ids).size,14);models.add(result.ids.join(','));
  const extra=[];
  for(const type of ['CQ','SHORT']){
   const rows=qs.filter(q=>kind(q)===type),chs=rows.map(chapter);assert.equal(rows.length,7);assert.equal(new Set(chs).size,7);
   for(const ch of [2,4,6,7,8,11])assert.equal(chs.filter(n=>n===ch).length,1);
   const other=chs.filter(n=>![2,4,6,7,8,11].includes(n));assert.equal(other.length,1);extra.push(other[0]);extras.add(other[0]);
  }
  overlap ||= extra[0]===extra[1];different ||= extra[0]!==extra[1];
  const settings=p.autoModelSettings('SSC',policy.subject,'CQ'),items=qs.map(paper);assert.deepEqual(p.autoModelIssues(items,settings),[]);
 }
 assert.ok(models.size>1);assert.ok(extras.size>1);assert.equal(overlap,true);assert.equal(different,true);
});
test('MCQ full-book practice offers 25, covers all 14 chapters, max 2 per chapter',()=>{
 for(let seed=1;seed<=12;seed++){
  const qs=selected(assemble(stock,'MCQ',seeded(seed)));assert.equal(qs.length,25);assert.ok(qs.every(q=>kind(q)==='MCQ'));
  for(let ch=1;ch<=14;ch++)assert.ok([1,2].includes(qs.filter(q=>chapter(q)===ch).length));
  assert.deepEqual(p.autoModelIssues(qs.map(paper),p.autoModelSettings('SSC',policy.subject,'MCQ')),[]);
 }
});
test('missing a mandatory CQ or SQ chapter blocks complete model, no substitution/no partial IDs',()=>{
 for(const type of ['CQ','SHORT'])for(const ch of [2,4,6,7,8,11]){
  const result=assemble(stock.filter(q=>!(kind(q)===type&&chapter(q)===ch)));assert.equal(result.ok,false);assert.equal(result.ids,undefined);assert.ok(result.gaps.some(g=>g.section.includes(policy.chapters[ch-1])));
 }
 const onlySix=stock.filter(q=>[2,4,6,7,8,11].includes(chapter(q)));assert.equal(assemble(onlySix).ok,false);
 assert.equal(assemble(stock.filter(q=>!(kind(q)==='MCQ'&&chapter(q)===14)),'MCQ').ok,false);
});
test('deduplicates normalized stems/IDs, rejects unknown chapters, incomplete answers/CQ and unsafe diagrams',()=>{
 const cq=stock.find(q=>kind(q)==='CQ'),mcq=stock.find(q=>kind(q)==='MCQ'),sq=stock.find(q=>kind(q)==='SHORT');
 for(const changed of [{...cq,topic:'unknown'},{...cq,explanation:''},{...cq,options:{...cq.options,subQuestions:{...cq.options.subQuestions,gh:''}}},{...cq,options:{...cq.options,marks:{k:2,kh:4,g:4}}},{...cq,options:{...cq.options,stimulus:''}},{...mcq,correct:''}])assert.equal(kind(changed),null);
 for(const text of ['![bad](https://evil.invalid/a.svg)','![bad](https://proshnobook.com/question-bank/ssc-physics-ch8-v1/x.svg?x=1)','![bad'] )assert.equal(kind({...sq,text:sq.text+'\n'+text}),null);
 const duplicated=Array.from({length:40},(_,i)=>({...mcq,id:'dup'+i,topic:policy.chapters[i%14],text:i%2?'same ১':'same 1'}));assert.equal(assemble(duplicated,'MCQ').ok,false);
});
test('paper settings/sections preserve correct marks, four-part CQ, shared theory time and no practical paper',()=>{
 const settings=p.autoModelSettings('SSC',policy.subject,'CQ');assert.equal(settings.info.marks,'50');assert.match(settings.info.minutes,/180/);assert.match(settings.info.instr,/75/);assert.match(settings.info.instr,/25/);
 assert.equal(settings.cfg.expectedCQ,7);assert.equal(settings.cfg.expectedSHORT,7);assert.equal(settings.cfg.cqAnswer,4);assert.equal(settings.cfg.shortAnswer,5);assert.equal(settings.cfg.expectedMCQ,0);
 assert.equal(settings.show.chapter,false);assert.equal(settings.show.boardSource,false);assert.equal(settings.defaultHeader.enabled,true);
 const items=selected(assemble()).map(paper),sections=p.autoModelSections(items,settings);assert.equal(sections.length,2);assert.deepEqual(sections.map(s=>s.questions.length),[7,7]);assert.match(sections[0].instruction,/4টি/);assert.match(sections[0].instruction,/1–2–3–4/);assert.match(sections[1].instruction,/5টি/);assert.deepEqual(sections.map(s=>s.startNumber),[0,0]);
});
test('editor detects quota changes, duplicates, bad kinds, missing parts, setup changes; retains extras visibly',()=>{
 const settings=p.autoModelSettings('SSC',policy.subject,'CQ'),items=selected(assemble()).map(paper);
 const variants=[items.slice(1),[...items,items[0]],items.map((q,i)=>i===0?{...q,subject:'গণিত'}:q),items.map((q,i)=>i===0?{...q,topic:policy.chapters[0]}:q),items.map((q,i)=>i===0?{...q,type:'SHORT'}:q),items.map((q,i)=>i===0?{...q,subQuestions:{...q.subQuestions,gh:''}}:q)];
 for(const variant of variants)assert.ok(p.autoModelIssues(variant,settings).length);
 assert.ok(p.autoModelIssues(items,{...settings,cfg:{...settings.cfg,cqAnswer:5}}).length);
 const extra=paper(stock.find(q=>kind(q)==='MCQ')),sections=p.autoModelSections([...items,extra],settings);assert.equal(sections.flatMap(s=>s.questions).length,15);assert.match(sections.at(-1).title,/বাইরে/);assert.match(sections[0].instruction,/অসম্পূর্ণ/);
 const reset=require('../lib/paper-sections.ts').freshPaperSettings(settings);assert.equal(reset.autoModel,undefined);assert.equal(reset.cfg.expectedCQ,0);
});
function action(user,rows,fail=false){let query;const file=path.resolve('app/actions/auto-model.ts'),m=new Module(file,module);m.paths=module.paths;m.require=id=>id==='@/auth'?{auth:async()=>({user})}:id==='@/lib/db'?{db:{question:{findMany:async args=>{query=args;if(fail)throw Error('offline');return rows;}}}}:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return{run:m.exports.prepareAutoModel,query:()=>query};}
test('real server action queries approved scoped stock only, returns IDs, keeps auth/scan/error gates',async()=>{
 const input={category:'SSC',subject:policy.subject,variant:'CQ'};
 const api=action({id:'t',role:'TEACHER'},stock),result=await api.run(input);assert.equal(result.ok,true);assert.equal(result.ids.length,14);assert.equal(result.rows,undefined);assert.equal(result.questions,undefined);
 const query=api.query();assert.equal(query.where.subject,policy.subject);assert.equal(query.where.approved,true);assert.ok(query.where.category.in.includes('Class 9'));assert.equal(query.take,10001);
 for(const user of [null,{id:'s',role:'STUDENT'}]){const api=action(user,stock);assert.equal((await api.run(input)).ok,false);assert.equal(api.query(),undefined);}
 for(const patch of [{subject:'রসায়ন'},{category:'HSC'},{variant:'SHORT'}]){const api=action({id:'t',role:'TEACHER'},stock);assert.equal((await api.run({...input,...patch})).ok,false);assert.equal(api.query(),undefined);}
 assert.equal((await action({id:'t'},Array(10001).fill(stock[0])).run(input)).ok,false);assert.equal((await action({id:'t'},[],true).run(input)).ok,false);
});
test('model creation never imports/approves/generates and preparation still goes directly to Setup',()=>{
 const server=fs.readFileSync('app/actions/auto-model.ts','utf8');assert.doesNotMatch(server,/question\.(?:create|update)|release-ssc|fetch\(/);
 const client=fs.readFileSync('components/auto-model-preparation.tsx','utf8');assert.match(client,/router.replace\("\/question-builder\/build"\)/);assert.match(client,/PreparationPopup/);assert.match(client,/oldSettings/);
 assert.equal(policies.subjectModelById('unknown'),null);assert.equal(a.autoModelBlueprint('SSC',policy.subject,'ALL'),null);
});
test('deployment smoke check is read-only and verifies actual subject quotas and editor/print compatibility',async()=>{
 const smoke=require('../scripts/question-bank/check-ssc-physics-auto-model.cjs');let query;
 const receipt=await smoke.check({question:{findMany:async args=>{query=args;return stock;}}});
 assert.equal(query.where.approved,true);assert.equal(query.where.subject,policy.subject);assert.equal(receipt.modelsVerified,20);assert.equal(receipt.approvalMutation,false);assert.equal(receipt.officialYearVerified,false);
 for(const sample of receipt.samples)assert.equal(sample.count,sample.variant==='MCQ'?25:14);
 await assert.rejects(smoke.check({question:{findMany:async()=>[]}}),/Insufficient/);
 assert.doesNotMatch(fs.readFileSync('scripts/question-bank/check-ssc-physics-auto-model.cjs','utf8'),/question\.(?:create|update|delete)|setting\.(?:create|update|upsert)|\.publish\(/);
});
