const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const Module=require('node:module');
const ts=require('typescript');
const {createHash}=require('node:crypto');
const {execFileSync}=require('node:child_process');
function load(file,mocks={}) {
 const m=new Module(file,module);m.paths=module.paths;
 m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);
 m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
 return m.exports;
}
const root='content/question-bank/ssc/biology/chapter-1/';
const read=name=>JSON.parse(fs.readFileSync(root+name+'.json','utf8'));
const catalog=load('lib/nctb-data.ts');
const mcq=load('lib/mcq-import.ts',{'@/lib/nctb-data':catalog});
const {parseQuestionUpload}=load('lib/question-json-import.ts',{'./nctb-data':catalog,'./mcq-import':mcq,'./question-provenance':load('lib/question-provenance.ts')});
const selection={category:'Class 9',subject:'জীববিজ্ঞান',topic:'১ম অধ্যায়: জীবন পাঠ',group:''};
const files=['mcq','sq','cq'];
const all=files.flatMap(name=>read(name).items);
test('45 provisional Biology questions pass the actual strict uploader and exact catalog',()=>{
 assert.equal(catalog.NCTB_CLASSES.find(c=>c.class===selection.category).subjects.find(s=>s.name===selection.subject).chapters.length,14);
 for(const [i,name] of files.entries()) {
  const raw=fs.readFileSync(root+name+'.json','utf8');
  const parsed=parseQuestionUpload(raw,selection);
  assert.equal(parsed.records.length,[30,10,5][i]);
  assert.equal(new Set(parsed.records.map(q=>q.id)).size,parsed.records.length);
  assert.match(parsed.batch.edition,/খসড়া/);
  for(const q of parsed.batch.items){assert.match(q.page,/অযাচাইকৃত/);assert.equal(q.provenance,undefined);}
 }
 assert.equal(new Set(all.map(q=>mcq.normalizeStem(q.text))).size,45);
});
test('MCQ keys and CQ part marks are valid; no unseen-figure dependency',()=>{
 const keys={A:0,B:0,C:0,D:0};
 for(const q of read('mcq').items){assert.equal(new Set(Object.values(q.options)).size,4);assert.ok(q.options[q.correct]);keys[q.correct]++;}
 assert.deepEqual(keys,{A:8,B:8,C:7,D:7});
 for(const q of read('cq').items){assert.deepEqual(q.parts.map(p=>p.label),['ক','খ','গ','ঘ']);assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);assert.ok(q.parts.every(p=>p.solution.length>20));}
 assert.ok(all.every(q=>!q.text.includes('![')&&!q.text.includes('চিত্রে প্রদর্শিত')));
});
test('actual uploader rejects altered scope, duplicate choices/stems and wrong CQ marks',()=>{
 assert.throws(()=>parseQuestionUpload(JSON.stringify(read('mcq')),{...selection,subject:'রসায়ন'}));
 assert.throws(()=>parseQuestionUpload(JSON.stringify(read('mcq')),{...selection,topic:'২য় অধ্যায়: জীবকোষ ও টিস্যু'}));
 const choices=read('mcq');choices.items[0].options.B=choices.items[0].options.A;
 assert.throws(()=>parseQuestionUpload(JSON.stringify(choices),selection));
 const duplicate=read('sq');duplicate.items.push(duplicate.items[0]);
 assert.throws(()=>parseQuestionUpload(JSON.stringify(duplicate),selection));
 const cq=read('cq');cq.items[0].parts[3].marks=3;
 assert.throws(()=>parseQuestionUpload(JSON.stringify(cq),selection));
});
test('manifest hashes, truthful status flags and offline reproduction agree',()=>{
 const v=read('validation');assert.equal(v.status,'PROVISIONAL_DRAFT_NOT_IMPORTED');
 assert.deepEqual(v.counts,{MCQ:30,SQ:10,CQ:5});
 for(const key of ['teacherCertified','textbookChapterRead','wholeBookRead','originalBoardPaperVerified','officialYearVerified','websiteImported','approved','published','biologyAutoModelPolicyConfigured','parameterizedVariants'])assert.equal(v[key],false,key);
 assert.equal(v.originalPractice,true);assert.equal(v.sourceTextOnly,true);
 for(const [name,evidence] of Object.entries(v.files)){
  const data=fs.readFileSync(root+name);assert.equal(data.length,evidence.bytes);assert.equal(createHash('sha256').update(data).digest('hex'),evidence.sha256);
 }
 execFileSync('python3',['scripts/question-bank/build-ssc-biology-ch1.py','--check']);
});
test('starter remains unregistered and builder has no publication mechanism',()=>{
 assert.doesNotMatch(fs.readFileSync('lib/prepared-question-batches.ts','utf8'),/ssc-biology|sscBiology/);
 const builder=fs.readFileSync('scripts/question-bank/build-ssc-biology-ch1.py','utf8');
 assert.doesNotMatch(builder,/import (?:requests|urllib|psycopg)|DATABASE_URL|prisma|subprocess|exec\(/);
});
