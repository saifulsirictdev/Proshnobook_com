const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module'),{execFileSync}=require('node:child_process');
function load(file,mocks={}){const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return m.exports;}
const base='content/question-bank/class-6/chapter-2';
test('chapter 2 mixed JSON passes real upload schema; 100 MCQ, 30 complete CQ and 30 SQ',()=>{
 const data=load('lib/nctb-data.ts'),mcq=load('lib/mcq-import.ts',{'@/lib/nctb-data':data});const lib=load('lib/question-json-import.ts',{'./nctb-data':data,'./mcq-import':mcq,'./question-provenance':load('lib/question-provenance.ts')});
 const r=lib.parseQuestionUpload(fs.readFileSync(`${base}/questions.json`,'utf8'),{category:'Class 6',subject:'গণিত',group:'',topic:'২. অনুপাত ও শতকরা'});
 assert.equal(r.records.length,160);const qs=r.batch.items;
 for(const [type,count] of [['MCQ',100],['CQ',30],['SQ',30]])assert.equal(qs.filter(q=>q.type===type).length,count);
 assert.equal(new Set(qs.map(q=>q.text)).size,160);
 for(const q of qs.filter(q=>q.type==='CQ')){assert.deepEqual(q.parts.map(p=>p.label),['ক','খ','গ']);assert.deepEqual(q.parts.map(p=>p.marks),[2,4,4]);assert.ok(q.parts.every(p=>p.solution.trim()));}
 const counts=Object.fromEntries('ABCD'.split('').map(k=>[k,qs.filter(q=>q.type==='MCQ'&&q.correct===k).length]));assert.deepEqual(counts,{A:25,B:25,C:25,D:25});
});
test('chapter 2 exact arithmetic assertions pass and artifacts reproduce without database access',()=>{
 const result=JSON.parse(execFileSync('python3',['scripts/question-bank/build-class6-math-ch2.py','--check'],{encoding:'utf8'}));
 assert.deepEqual(result.counts,{MCQ:100,CQ:30,SQ:30});assert.equal(result.productionImported,0);
 const report=JSON.parse(fs.readFileSync(`${base}/validation.json`,'utf8'));
 assert.equal(report.independentTeacherApproved,false);assert.equal(report.fullChapterConceptReview,true);
 assert.equal(report.MCQ_skillFamilies,25);assert.equal(report.CQ_skillFamilies,10);assert.equal(report.SQ_skillFamilies,15);
 assert.deepEqual(report.printedPagesVisuallyRead,Array.from({length:21},(_,i)=>i+38));
 assert.equal(report.items.length,160);for(const r of report.items){assert.ok(r.conceptPages.every(p=>p>=38&&p<=58));}
});
