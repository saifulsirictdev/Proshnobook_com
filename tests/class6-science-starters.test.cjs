const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module'),{execFileSync}=require('node:child_process');
function load(file,mocks={}){const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return m.exports;}
const data=load('lib/nctb-data.ts'),mcq=load('lib/mcq-import.ts',{'@/lib/nctb-data':data}),upload=load('lib/question-json-import.ts',{'./nctb-data':data,'./mcq-import':mcq});
const manifest=JSON.parse(fs.readFileSync('deliverables/class6-science-starters/manifest.json','utf8'));
for(let n=1;n<=14;n++)test(`science chapter ${n}: real uploader, incomplete status and four-part CQ`,()=>{
 const base=`content/question-bank/class-6/science/chapter-${n}`;
 const raw=fs.readFileSync(`${base}/questions.json`,'utf8'),b=JSON.parse(raw),r=JSON.parse(fs.readFileSync(`${base}/validation.json`,'utf8'));
 const parsed=upload.parseQuestionUpload(raw,{category:'Class 6',subject:'বিজ্ঞান',group:'',topic:b.topic});
 assert.equal(parsed.records.length,n===1?160:n<=3?16:14);assert.ok(Buffer.byteLength(raw)<750000);
 assert.equal(r.targetMet,n===1);assert.equal(r.teacherApproved,false);assert.equal(r.fullChapterRead,false);assert.equal(r.status,'DRAFT_TEACHER_REVIEW_PENDING');
 assert.deepEqual(r.counts,n===1?{MCQ:100,CQ:30,SQ:30}:{MCQ:10,CQ:n<=3?3:1,SQ:3});
 assert.deepEqual(r.remainingMinimum,n===1?{MCQ:0,CQ:0,SQ:0}:{MCQ:90,CQ:n<=3?27:29,SQ:27});
 for(const q of b.items){assert.ok(q.page.includes('যাচাই বাকি'));assert.ok(q.explanation.trim());if(q.type==='CQ'){assert.deepEqual(q.parts.map(p=>p.label),['ক','খ','গ','ঘ']);assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);assert.ok(q.parts.every(p=>p.question.trim()&&p.solution.trim()));}}
 assert.ok(r.limitations.some(x=>x.includes(n===1?'সংখ্যাগত ন্যূনতম লক্ষ্য পূর্ণ':'অসম্পূর্ণ')));
});
test('deterministic starter output and original author answer mapping (not a subject-expert review)',()=>{
 execFileSync('python3',['scripts/question-bank/build-class6-science-starters.py','--check']);
 const authored=JSON.parse(execFileSync('python3',['-c',`import runpy,json; d=runpy.run_path('scripts/question-bank/build-class6-science-starters.py'); print(json.dumps({k:[line.split('|')[1] for line in v.splitlines()] for k,v in d['FACTS'].items()},ensure_ascii=False))`],{encoding:'utf8'}));
 for(let n=1;n<=14;n++){const b=JSON.parse(fs.readFileSync(`content/question-bank/class-6/science/chapter-${n}/questions.json`,'utf8'));b.items.filter(q=>q.type==='MCQ').forEach((q,i)=>assert.equal(q.options[q.correct],authored[n][i]));}
 assert.deepEqual(manifest.totals,{MCQ:230,CQ:47,SQ:69});assert.equal(manifest.targetMet,false);assert.equal(manifest.chapters.length,14);
});

test('chapter 1: balanced answer positions, distinct questions, unchanged review gates and count-only completion',()=>{
 const b=JSON.parse(fs.readFileSync('content/question-bank/class-6/science/chapter-1/questions.json','utf8'));
 const m=b.items.filter(q=>q.type==='MCQ');
 assert.deepEqual(Object.fromEntries([..."ABCD"].map(k=>[k,m.filter(q=>q.correct===k).length])),{A:25,B:25,C:25,D:25});
 assert.equal(new Set(b.items.map(q=>mcq.normalizeStem(q.text))).size,160);
 const expected=[
  ['২.৫ মিটার ফিতা কত সেন্টিমিটার?','২৫০'],
  ['৩৫০ সেন্টিমিটারকে মিটারে প্রকাশ করলে কত হয়?','৩.৫ মিটার'],
  ['৭ মিলিমিটার কত সেন্টিমিটার?','০.৭ সেমি'],
  ['১.২ কিলোমিটার পথে কত মিটার আছে?','১২০০'],
  ['০.০৫ মিটার কত মিলিমিটার?','৫০'],
  ['দৈর্ঘ্য ২ মিটার ও প্রস্থ ৫০ সেমি হলে ক্ষেত্রফল কত?','১ বর্গমিটার'],
  ['১ বর্গমিটার সমান কত বর্গসেন্টিমিটার?','১০০০০'],
  ['ঘনকের বাহু দ্বিগুণ হলে আয়তন কত গুণ হয়?','আট গুণ'],
  ['১ ঘনমিটার সমান কত লিটার?','১০০০'],
  ['২ মিনিট ১৫ সেকেন্ডের মোট সময় কত?','১৩৫ সেকেন্ড']
 ];
 for(const [stem,a] of expected){const q=m.find(q=>q.text===stem);assert.ok(q,stem);assert.equal(q.options[q.correct],a);}
 assert.equal(manifest.chapters.filter(c=>c.countMinimumMet).length,1);
 assert.equal(manifest.targetMet,false);
});
