const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module'),{execFileSync}=require('node:child_process');
function load(file,mocks={}){const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return m.exports;}
const data=load('lib/nctb-data.ts'),mcq=load('lib/mcq-import.ts',{'@/lib/nctb-data':data});const lib=load('lib/question-json-import.ts',{'./nctb-data':data,'./mcq-import':mcq,'./question-provenance':load('lib/question-provenance.ts')});
function rational(s){s=String(s).replace(/[০-৯]/g,c=>'০১২৩৪৫৬৭৮৯'.indexOf(c));const [a,b='1']=s.split('/');return[BigInt(a),BigInt(b)];}
function equal(a,b){return a[0]*b[1]===b[0]*a[1];}
for(let ch=3;ch<=8;ch++)test(`chapter ${ch}: 100 MCQ/30 CQ/30 SQ pass real uploader, exact answer choices and honest review gates`,()=>{
 const base=`content/question-bank/class-6/chapter-${ch}`;const raw=fs.readFileSync(`${base}/questions.json`,'utf8'),report=JSON.parse(fs.readFileSync(`${base}/validation.json`,'utf8'));const b=JSON.parse(raw);
 const r=lib.parseQuestionUpload(raw,{category:'Class 6',subject:'গণিত',topic:b.topic,group:''});assert.equal(r.records.length,160);
 assert.deepEqual(report.counts,{MCQ:100,CQ:30,SQ:30});assert.equal(report.productionImported,0);assert.equal(report.independentTeacherApproved,false);assert.equal(report.fullChapterRead,ch===7);
 assert.equal(new Set(b.items.map(q=>q.text)).size,160);assert.equal(report.problemFamilies,10);
 assert.deepEqual(Object.fromEntries('ABCD'.split('').map(k=>[k,b.items.filter(q=>q.type==='MCQ'&&q.correct===k).length])),{A:25,B:25,C:25,D:25});
 for(let i=0;i<100;i++){
  const q=b.items[i],expected=rational(report.items[i].expected),choices=Object.values(q.options).map(rational);
  assert.equal(choices.filter(v=>equal(v,expected)).length,1);assert.ok(equal(rational(q.options[q.correct]),expected));
  assert.equal(new Set(Object.values(q.options)).size,4);
 }
 for(const q of b.items.filter(q=>q.type==='CQ')){assert.deepEqual(q.parts.map(p=>p.label),['ক','খ','গ']);assert.deepEqual(q.parts.map(p=>p.marks),[2,4,4]);assert.ok(q.parts.every(p=>p.solution.trim()));}
 assert.ok(Buffer.byteLength(raw)<750000);
});
test('all six chapters regenerate deterministically and scene calculation invariants pass',()=>{
 const r=JSON.parse(execFileSync('python3',['scripts/question-bank/build-class6-math-remaining.py','--check'],{encoding:'utf8'}));assert.equal(r.length,6);assert.equal(r.reduce((s,c)=>s+c.counts.MCQ+c.counts.CQ+c.counts.SQ,0),960);
});
