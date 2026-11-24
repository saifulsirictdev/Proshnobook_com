const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),Module=require('node:module');
const root=path.resolve(__dirname,'..'),resolve=Module._resolveFilename;
Module._resolveFilename=function(id,parent,...rest){return resolve.call(this,id.startsWith('@/')?path.join(root,id.slice(2)):id,parent,...rest);};
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const a=require('../lib/auto-model.ts'),p=require('../lib/auto-model-paper.ts'),b=require('../lib/paper-builder.ts'),pol=require('../lib/subject-model-policy.ts'),policy=pol.subjectModelPolicy('SSC','রসায়ন'),tables=require('../lib/question-tables.ts');
// Read-only local fixtures, NOT imported/approved production rows. Preserve the
// adapter's actual options including _authoring and source stimuli/figures.
const batches=[];
for(let ch=1;ch<=12;ch++){const mod=require(`../lib/ssc-chemistry-${ch===1?'batches':`ch${ch}-batches`}.ts`);batches.push(...mod[ch===1?'sscChemistryBatches':`sscChemistryChapter${ch}Batches`]());}
const stock=batches.flatMap(batch=>batch.records.map((q,i)=>({...q,id:`fixture:${batch.id}:${i}`,topic:batch.topic,subject:batch.subject,category:batch.category}))),kind=q=>a.autoModelRowKind(q,policy),chapter=q=>pol.subjectModelChapter(policy,q.topic),required=[3,4,5,6,7,11],other=[1,2,8,9,10,12];
function seeded(seed){let n=seed;return()=>((n=(n*1664525+1013904223)>>>0)/4294967296);}
const assemble=(rows=stock,variant='CQ',seed=1)=>a.assembleSubjectAutoModel(rows,'SSC',policy.subject,variant,seeded(seed));
function selected(r,rows=stock){assert.equal(r.ok,true,JSON.stringify(r));const index=new Map(rows.map(q=>[q.id,q]));return r.ids.map(id=>index.get(id));}
const paper=q=>({...q,type:kind(q),stimulus:q.options.stimulus,subQuestions:q.options.subQuestions,options:q.correct?q.options:undefined});
test('Chemistry explicit owner practice policy: canonical12chapters, separate stable IDs, preserved marks and no official-year claim',()=>{
 assert.equal(policy.id,'ssc-chemistry-owner-chapter-policy-v1');assert.equal(policy.chapters.length,12);assert.deepEqual(pol.CHEMISTRY_REQUIRED_CHAPTERS,required);assert.equal(policy.officialYear,null);assert.equal(policy.theoryMarks,75);assert.equal(policy.practicalMarks,25);assert.equal(policy.totalTheoryMinutes,180);assert.deepEqual(policy.cqPartMarks,[1,2,3,4]);assert.ok(fs.existsSync(policy.evidence));
 for(const category of ['SSC','Class 9','Class 10','9','10','Class 9-10'])assert.equal(pol.subjectModelPolicy(category,policy.subject).id,policy.id);
 for(const category of ['Class 8','HSC','Class 11-12'])assert.equal(pol.subjectModelPolicy(category,policy.subject),null);
 assert.equal(pol.subjectModelPolicy('SSC','জীববিজ্ঞান'),null);assert.equal(pol.subjectModelChapter(policy,'chapter3'),null);
 assert.deepEqual(pol.PHYSICS_REQUIRED_CHAPTERS,[2,4,6,7,8,11]);assert.notEqual(policy.id,pol.subjectModelPolicy('SSC','পদার্থবিজ্ঞান').id);
 for(const variant of ['MCQ','CQ']){const s=p.autoModelSettings('SSC',policy.subject,variant);assert.equal(b.settingsSchema.parse(JSON.parse(JSON.stringify(s))).autoModel,policy.variants[variant].id);assert.equal(pol.subjectModelById(s.autoModel).policy.id,policy.id);}
 assert.equal(b.settingsSchema.parse({autoModel:'ssc-chemistry-written-v999'}).autoModel,undefined);
});
test('all8110actual canonical local draft fixtures retain authoring metadata; compatible stock exists per chapter/type',()=>{
 assert.equal(stock.length,8110);assert.deepEqual(stock.reduce((c,q)=>(c[q.kind]++,c),{MCQ:0,CQ:0,SQ:0}),{MCQ:5500,CQ:1550,SQ:1060});
 for(let ch=1;ch<=12;ch++)for(const type of ['MCQ','CQ','SHORT'])assert.ok(stock.filter(q=>chapter(q)===ch&&kind(q)===type).length>=3,`${ch}/${type}`);
 const authored=stock.filter(q=>q.options._authoring);assert.ok(authored.some(q=>q.kind==='MCQ'));assert.ok(authored.some(q=>q.kind==='SQ'));for(const type of ['MCQ','SHORT'])assert.ok(authored.some(q=>kind(q)===type));
});
test('40seed written models: each CQ/SQ has exact fixedsix plus oneother, independent seventh chapters and unique IDs',()=>{
 const extras=new Set();let same=false,diff=false;
 for(let seed=1;seed<=40;seed++){
  const result=assemble(stock,'CQ',seed),qs=selected(result);assert.equal(qs.length,14);assert.equal(new Set(result.ids).size,14);const pair=[];
  for(const type of ['CQ','SHORT']){const chs=qs.filter(q=>kind(q)===type).map(chapter);assert.equal(chs.length,7);assert.equal(new Set(chs).size,7);for(const ch of required)assert.equal(chs.filter(x=>x===ch).length,1);const extra=chs.filter(ch=>!required.includes(ch));assert.equal(extra.length,1);assert.ok(other.includes(extra[0]));pair.push(extra[0]);extras.add(extra[0]);}
  same ||= pair[0]===pair[1];diff ||= pair[0]!==pair[1];const settings=p.autoModelSettings('SSC',policy.subject,'CQ');assert.deepEqual(p.autoModelIssues(qs.map(paper),settings),[]);
 }
 assert.ok(extras.size>1);assert.equal(same,true);assert.equal(diff,true);
});
test('25MCQ balanced fullbook rotation: all12chapters, max3, existing two perchapter stock yields one third when sufficient',()=>{
 for(let seed=1;seed<=15;seed++){const qs=selected(assemble(stock,'MCQ',seed));assert.equal(qs.length,25);assert.ok(qs.every(q=>kind(q)==='MCQ'));const counts=policy.chapters.map((_,i)=>qs.filter(q=>chapter(q)===i+1).length);assert.equal(counts.reduce((a,n)=>a+n,0),25);assert.equal(counts.filter(n=>n===3).length,1);assert.equal(counts.filter(n=>n===2).length,11);assert.deepEqual(p.autoModelIssues(qs.map(paper),p.autoModelSettings('SSC',policy.subject,'MCQ')),[]);}
});
test('missing mandatoryCQ/SQ, nootherchapter and insufficientMCQ all fail closed without partial IDs',()=>{
 for(const type of ['CQ','SHORT'])for(const ch of required){const result=assemble(stock.filter(q=>!(kind(q)===type&&chapter(q)===ch)));assert.equal(result.ok,false);assert.equal(result.ids,undefined);assert.ok(result.gaps.some(g=>g.section.includes(policy.chapters[ch-1])));}
 assert.equal(assemble(stock.filter(q=>required.includes(chapter(q)))).ok,false);
 assert.equal(assemble(stock.filter(q=>!(kind(q)==='MCQ'&&chapter(q)===12)),'MCQ').ok,false);
 const two=stock.filter(q=>kind(q)==='MCQ').filter((q,i,rows)=>rows.slice(0,i).filter(x=>chapter(x)===chapter(q)).length<2);assert.equal(assemble(two,'MCQ').ok,false);
});
test('real native chemistryPNG and generatedSVG render and classify; wrongsubject, tampered URLs, malformed records rejected',()=>{
 const base=stock.find(q=>kind(q)==='SHORT'),urls=['ssc-chemistry-ch11-source-v1/tb-starch-stimulus.png','ssc-chemistry-ch3-v1/nuclide-01.svg'];
 for(const asset of urls){const url='https://proshnobook.com/question-bank/'+asset;assert.ok(fs.existsSync('public/question-bank/'+asset));assert.match(tables.questionBlocks(`![x](${url})`)[0].src,/^\/question-bank\//);const q={...base,text:base.text+`\n![x](${url})`};assert.equal(kind(q),'SHORT');assert.equal(a.autoModelRowKind(q,pol.subjectModelPolicy('SSC','পদার্থবিজ্ঞান')),null);for(const bad of [url+'?x=1',url+'#x',url.replace('proshnobook.com','evil.test'),url.replace('https:','http:'),url.replace('/question-bank/','/question-bank/../')])assert.equal(kind({...base,text:base.text+`\n![x](${bad})`}),null);}
 const authored=stock.find(q=>q.kind==='MCQ'&&q.options._authoring&&kind(q)==='MCQ');assert.equal(kind({...authored,options:{...authored.options,unexpected:'fifth option'}}),null);assert.equal(kind({...base,options:{...base.options,imageUrl:'x'}}),null);assert.equal(kind({...base,options:{unexpected:'x'}}),null);
 const cq=stock.find(q=>kind(q)==='CQ');assert.equal(kind({...cq,options:{...cq.options,subQuestions:{...cq.options.subQuestions,gh:''}}}),null);assert.equal(kind({...base,explanation:''}),null);
});
test('paper/editor/print retain marks, instructions, fourparts, edits and extras visibly; settings roundtrip',()=>{
 const s=p.autoModelSettings('SSC',policy.subject,'CQ'),qs=selected(assemble()).map(paper);assert.equal(s.info.marks,'50');assert.equal(s.cfg.expectedCQ,7);assert.equal(s.cfg.expectedSHORT,7);assert.equal(s.cfg.cqAnswer,4);assert.equal(s.cfg.shortAnswer,5);assert.match(s.info.minutes,/180/);assert.match(s.info.instr,/75/);assert.match(s.info.instr,/25/);assert.equal(s.show.chapter,false);
 const sections=p.autoModelSections(qs,s);assert.deepEqual(sections.map(s=>s.questions.length),[7,7]);assert.match(sections[0].instruction,/4টি/);assert.match(sections[0].instruction,/1–2–3–4/);assert.match(sections[1].instruction,/5টি/);
 for(const edit of [qs.slice(1),[...qs,qs[0]],qs.map((q,i)=>i===0?{...q,subject:'পদার্থবিজ্ঞান'}:q),qs.map((q,i)=>i===0?{...q,topic:policy.chapters[0]}:q)])assert.ok(p.autoModelIssues(edit,s).length);
 assert.ok(p.autoModelIssues(qs,{...s,cfg:{...s.cfg,cqAnswer:5}}).length);
 const extra=paper(stock.find(q=>kind(q)==='MCQ')),printed=p.autoModelSections([...qs,extra],s);assert.equal(printed.flatMap(s=>s.questions).length,15);assert.match(printed.at(-1).title,/বাইরে/);assert.match(printed[0].instruction,/অসম্পূর্ণ/);
});
function action(user,rows){let query;const file=path.join(root,'app/actions/auto-model.ts'),m=new Module(file,module);m.paths=module.paths;m.require=id=>id==='@/auth'?{auth:async()=>({user})}:id==='@/lib/db'?{db:{question:{findMany:async args=>{query=args;return rows;}}}}:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return{run:m.exports.prepareAutoModel,query:()=>query};}
test('real actionqueries approvedChemistryonly; empty production-compatible stock blocks, no autoimport/approval or accessbypass',async()=>{
 const input={category:'SSC',subject:policy.subject,variant:'CQ'},api=action({id:'teacher',role:'TEACHER'},stock),result=await api.run(input);assert.equal(result.ok,true);assert.equal(result.ids.length,14);assert.equal(result.rows,undefined);assert.equal(api.query().where.approved,true);assert.equal(api.query().where.subject,policy.subject);assert.ok(api.query().where.category.in.includes('Class 9'));assert.equal(api.query().take,10001);
 const empty=await action({id:'teacher',role:'TEACHER'},[]).run(input);assert.equal(empty.ok,false);assert.equal(empty.ids,undefined);assert.ok(empty.gaps.length);
 for(const user of [null,{id:'student',role:'STUDENT'}]){const api=action(user,stock);assert.equal((await api.run(input)).ok,false);assert.equal(api.query(),undefined);}
 for(const patch of [{category:'HSC'},{subject:'জীববিজ্ঞান'},{variant:'SHORT'}]){const api=action({id:'teacher',role:'TEACHER'},stock);assert.equal((await api.run({...input,...patch})).ok,false);assert.equal(api.query(),undefined);}
 assert.equal((await action({id:'t'},Array(10001).fill(stock[0])).run(input)).ok,false);
 assert.doesNotMatch(fs.readFileSync('app/actions/auto-model.ts','utf8').split('async function prepareRegisteredBank')[1],/question\.(?:create|update|delete)|requestAutoModelGap|release-ssc|fetch\(/);
});
