const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module'),{execFileSync}=require('node:child_process');
function load(file,mocks={}){const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return m.exports;}
const data=load('lib/nctb-data.ts'),mcq=load('lib/mcq-import.ts',{'@/lib/nctb-data':data}),upload=load('lib/question-json-import.ts',{'./nctb-data':data,'./mcq-import':mcq});
const manifest=JSON.parse(fs.readFileSync('deliverables/class6-science-starters/manifest.json','utf8'));
for(let n=1;n<=14;n++)test(`science chapter ${n}: real uploader, incomplete status and four-part CQ`,()=>{
 const base=`content/question-bank/class-6/science/chapter-${n}`;
 const raw=fs.readFileSync(`${base}/questions.json`,'utf8'),b=JSON.parse(raw),r=JSON.parse(fs.readFileSync(`${base}/validation.json`,'utf8'));
 const parsed=upload.parseQuestionUpload(raw,{category:'Class 6',subject:'বিজ্ঞান',group:'',topic:b.topic});
 assert.equal(parsed.records.length,n<=14?160:30);assert.ok(Buffer.byteLength(raw)<750000);
 assert.equal(r.targetMet,n<=14);assert.equal(r.teacherApproved,false);assert.equal(r.fullChapterRead,n===2||n===3||n===4||n===5||n===6||n===7||n===8||n===9||n===10||n===11||n===12||n===13||n===14);assert.equal(r.status,'DRAFT_TEACHER_REVIEW_PENDING');
 assert.deepEqual(r.counts,n<=14?{MCQ:100,CQ:30,SQ:30}:{MCQ:20,CQ:4,SQ:6});
 assert.deepEqual(r.remainingMinimum,n<=14?{MCQ:0,CQ:0,SQ:0}:{MCQ:80,CQ:26,SQ:24});
 for(const q of b.items){assert.ok(q.page.includes('যাচাই বাকি'));assert.ok(q.explanation.trim());if(q.type==='CQ'){assert.deepEqual(q.parts.map(p=>p.label),['ক','খ','গ','ঘ']);assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);assert.ok(q.parts.every(p=>p.question.trim()&&p.solution.trim()));}}
 assert.ok(r.limitations.some(x=>x.includes(n<=14?'সংখ্যাগত ন্যূনতম লক্ষ্য পূর্ণ':'অসম্পূর্ণ')));
});
test('deterministic starter output and original author answer mapping (not a subject-expert review)',()=>{
 execFileSync('python3',['scripts/question-bank/build-class6-science-starters.py','--check']);
 const authored=JSON.parse(execFileSync('python3',['-c',`import runpy,json; d=runpy.run_path('scripts/question-bank/build-class6-science-starters.py'); print(json.dumps({k:[line.split('|')[1] for line in v.splitlines()] for k,v in d['FACTS'].items()},ensure_ascii=False))`],{encoding:'utf8'}));
 for(let n=1;n<=14;n++){const b=JSON.parse(fs.readFileSync(`content/question-bank/class-6/science/chapter-${n}/questions.json`,'utf8'));b.items.filter(q=>q.type==='MCQ').forEach((q,i)=>assert.equal(q.options[q.correct],authored[n][i]));}
 assert.deepEqual(manifest.totals,{MCQ:1400,CQ:420,SQ:420});assert.equal(manifest.targetMet,true);assert.equal(manifest.chapters.length,14);
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
 assert.equal(manifest.chapters.filter(c=>c.countMinimumMet).length,14);
 assert.equal(manifest.targetMet,true);
});

test('chapter 2: 100/30/30, balanced keys and explicit source/approval distinction',()=>{
 const base='content/question-bank/class-6/science/chapter-2';
 const b=JSON.parse(fs.readFileSync(`${base}/questions.json`,'utf8')),r=JSON.parse(fs.readFileSync(`${base}/validation.json`,'utf8'));
 assert.equal(b.items.length,160);assert.equal(new Set(b.items.map(q=>mcq.normalizeStem(q.text))).size,160);
 assert.deepEqual(Object.fromEntries([..."ABCD"].map(k=>[k,b.items.filter(q=>q.type==='MCQ'&&q.correct===k).length])),{A:25,B:25,C:25,D:25});
 assert.deepEqual(r.readPrintedPages,[11,12,13,14,15,16,17,18,19,20]);assert.equal(r.fullChapterRead,true);assert.equal(r.teacherApproved,false);
 const notes=fs.readFileSync(`${base}/source-review.md`,'utf8');assert.ok(notes.includes('স্পাইরোগাইরা'));assert.ok(notes.includes('অসংগতি'));
 const expected=[['ইস্ট কোন রাজ্যের জীব?','ফানজাই'],['পূর্ণাঙ্গ পতঙ্গের কয় জোড়া পা থাকে?','তিন জোড়া'],['পূর্ণবয়স্ক ব্যাঙের শ্বাসে কোন দুটি অংশ ভূমিকা রাখে?','ফুসফুস ও আর্দ্র ত্বক'],['পাখি উড়তে না পারলেও কোন বৈশিষ্ট্য অক্ষুণ্ণ থাকে?','পালক']];
 for(const [text,answer] of expected){const q=b.items.find(q=>q.text===text);assert.ok(q);assert.equal(q.options[q.correct],answer);}
});

test('chapter 3: complete counts, full source reading and cell-boundary distinctions',()=>{
 const base='content/question-bank/class-6/science/chapter-3';
 const b=JSON.parse(fs.readFileSync(`${base}/questions.json`,'utf8')),r=JSON.parse(fs.readFileSync(`${base}/validation.json`,'utf8'));
 assert.deepEqual(r.counts,{MCQ:100,CQ:30,SQ:30});assert.equal(b.items.length,160);
 assert.equal(new Set(b.items.map(q=>mcq.normalizeStem(q.text))).size,160);
 assert.deepEqual(Object.fromEntries([..."ABCD"].map(k=>[k,b.items.filter(q=>q.type==='MCQ'&&q.correct===k).length])),{A:25,B:25,C:25,D:25});
 assert.deepEqual(r.readPrintedPages,[21,22,23,24,25,26,27]);assert.equal(r.fullChapterRead,true);assert.equal(r.teacherApproved,false);
 const expected=[['কোষের ভেতর-বাইরে পদার্থ চলাচল নিয়ন্ত্রণে কোন অংশ কাজ করে?','কোষঝিল্লি'],['কোষগহ্বরের ভেতরের তরলকে কী বলা হয়?','কোষরস'],['নিউক্লিয়াসের ভেতরের তরল অংশ কী?','নিউক্লিওপ্লাজম'],['আদিকোষী/প্রকৃতকোষী এবং দেহকোষ/জননকোষ ভাগের মধ্যে সম্পর্ক কী?','দুটি আলাদা মানদণ্ডে ভাগ']];
 for(const [text,a] of expected){const q=b.items.find(q=>q.text===text);assert.ok(q,text);assert.equal(q.options[q.correct],a);}
 const notes=fs.readFileSync(`${base}/source-review.md`,'utf8');assert.ok(notes.includes('কোষপ্রাচীর'));assert.ok(notes.includes('স্বাধীন বিষয়শিক্ষক'));
});

test('chapter 4: source-read provenance, distinct stems, balanced MCQ and pending review gates',()=>{
 const base='content/question-bank/class-6/science/chapter-4';
 const b=JSON.parse(fs.readFileSync(`${base}/questions.json`,'utf8'));
 const r=JSON.parse(fs.readFileSync(`${base}/validation.json`,'utf8'));
 assert.equal(new Set(b.items.map(q=>q.text.normalize('NFC').trim())).size,b.items.length);
 const keys={A:0,B:0,C:0,D:0};
 for(const q of b.items.filter(q=>q.type==='MCQ')){keys[q.correct]++;assert.equal(new Set(Object.values(q.options)).size,4);}
 assert.deepEqual(keys,{A:25,B:25,C:25,D:25});
 assert.deepEqual(r.readPrintedPages,Array.from({length:10},(_,i)=>28+i));
 assert.equal(r.fullChapterRead,true);assert.equal(r.teacherApproved,false);assert.equal(r.targetMet,true);
 assert.deepEqual(r.remainingMinimum,{MCQ:0,CQ:0,SQ:0});
 assert.ok(fs.readFileSync(`${base}/source-review.md`,'utf8').includes('২৮–৩৭'));
});

test('chapter 5: full source-read record, count-only completion, balanced keys and experiment boundaries',()=>{
 const base='content/question-bank/class-6/science/chapter-5';
 const b=JSON.parse(fs.readFileSync(`${base}/questions.json`,'utf8'));
 const r=JSON.parse(fs.readFileSync(`${base}/validation.json`,'utf8'));
 assert.equal(b.items.length,160);assert.equal(new Set(b.items.map(q=>mcq.normalizeStem(q.text))).size,160);
 assert.deepEqual(r.counts,{MCQ:100,CQ:30,SQ:30});assert.deepEqual(r.readPrintedPages,[38,39,40,41]);
 assert.equal(r.fullChapterRead,true);assert.equal(r.teacherApproved,false);assert.equal(r.targetMet,true);
 const keys={A:0,B:0,C:0,D:0};for(const q of b.items.filter(q=>q.type==='MCQ')){keys[q.correct]++;assert.equal(new Set(Object.values(q.options)).size,4);}
 assert.deepEqual(keys,{A:25,B:25,C:25,D:25});
 for(const [text,answer] of [['সালোকসংশ্লেষণের প্রধান কোষীয় স্থান কোনটি?','ক্লোরোপ্লাস্ট'],['অক্সিজেন শনাক্তকরণে আগুনের ধাপ কে পরিচালনা করবে?','শিক্ষক বা দায়িত্বশীল প্রশিক্ষিত ব্যক্তি'],['পরীক্ষায় গ্যাসের পরিচয় ও পরিমাণ কি একই পরীক্ষা?','না, শনাক্তকরণ ও পরিমাপ আলাদা উদ্দেশ্য']]){
  const q=b.items.find(q=>q.text===text);
  assert.ok(q,text);assert.equal(q.options[q.correct],answer);
 }
 const review=fs.readFileSync(`${base}/source-review.md`,'utf8');
 for(const word of ['দহন-সহায়ক','আলোকনিরপেক্ষ','বেলজার','স্বাধীন বিষয়শিক্ষক'])assert.ok(review.includes(word));
});

test('chapter 6: source-read record, count-only completion, balanced keys and safe sensory-organ distinctions',()=>{
 const base='content/question-bank/class-6/science/chapter-6';
 const b=JSON.parse(fs.readFileSync(`${base}/questions.json`,'utf8'));
 const r=JSON.parse(fs.readFileSync(`${base}/validation.json`,'utf8'));
 assert.equal(b.items.length,160);assert.equal(new Set(b.items.map(q=>mcq.normalizeStem(q.text))).size,160);
 assert.deepEqual(r.counts,{MCQ:100,CQ:30,SQ:30});assert.deepEqual(r.readPrintedPages,[42,43,44,45,46,47,48,49]);
 assert.equal(r.fullChapterRead,true);assert.equal(r.teacherApproved,false);assert.equal(r.targetMet,true);
 const keys={A:0,B:0,C:0,D:0};for(const q of b.items.filter(q=>q.type==='MCQ')){keys[q.correct]++;assert.equal(new Set(Object.values(q.options)).size,4);}
 assert.deepEqual(keys,{A:25,B:25,C:25,D:25});
 for(const [text,answer] of [['পিউপিলকে ঘিরে থাকা রঙিন পর্দার নাম কী?','আইরিশ'],['চোখের লেন্সের সাধারণ আকৃতি কী?','দ্বি-উত্তল'],['শামুকের খোলের মতো প্যাঁচানো অন্তঃকর্ণের অংশ কী?','ককলিয়া'],['মধ্যকর্ণ ও গলবিলের মধ্যে সংযোগকারী নালি কী?','ইউস্টেশিয়ান নালি']]){
  const q=b.items.find(q=>q.text===text);assert.ok(q,text);assert.equal(q.options[q.correct],answer);
 }
 const review=fs.readFileSync(`${base}/source-review.md`,'utf8');
 for(const word of ['কঠোর স্বাদ-মানচিত্র','রাতকানা','উচ্চমাত্রার','স্বাধীন বিষয়শিক্ষক'])assert.ok(review.includes(word));
});

test('chapter 7: full visual source reading, balanced keys, material exceptions and experiment safety',()=>{
 const base='content/question-bank/class-6/science/chapter-7';
 const b=JSON.parse(fs.readFileSync(`${base}/questions.json`,'utf8')),r=JSON.parse(fs.readFileSync(`${base}/validation.json`,'utf8'));
 assert.equal(b.items.length,160);assert.equal(new Set(b.items.map(q=>mcq.normalizeStem(q.text))).size,160);
 assert.deepEqual(r.counts,{MCQ:100,CQ:30,SQ:30});assert.deepEqual(r.readPrintedPages,Array.from({length:10},(_,i)=>50+i));
 assert.equal(r.fullChapterRead,true);assert.equal(r.teacherApproved,false);assert.equal(r.targetMet,true);
 const keys={A:0,B:0,C:0,D:0};for(const q of b.items.filter(q=>q.type==='MCQ')){keys[q.correct]++;assert.equal(new Set(Object.values(q.options)).size,4);}
 assert.deepEqual(keys,{A:25,B:25,C:25,D:25});
 for(const [text,a] of [['গ্রাফাইটের মতো অধাতু বিদ্যুৎ চালাতে পারা কী বোঝায়?','অধাতুর সাধারণ বর্ণনায় ব্যতিক্রম আছে'],['বইয়ের পরীক্ষায় মোমের জন্য প্রায় ৫৭°C পাওয়া মানে কী?','ওই নমুনার আনুমানিক পর্যবেক্ষণ'],['ইথানল গরম করার নিরাপদ শ্রেণিকক্ষ পদ্ধতি কোনটি?','শিক্ষকের তত্ত্বাবধানে শিখা থেকে দূরে নিয়ন্ত্রিত জলবাথ']]){
  const q=b.items.find(q=>q.text===text);assert.ok(q,text);assert.equal(q.options[q.correct],a);
 }
 const review=fs.readFileSync(`${base}/source-review.md`,'utf8');
 for(const s of ['৫০–৫৯','গলন-পরিসর','গ্রাফাইট','শর্ট সার্কিট','স্বাধীন বিষয়শিক্ষক'])assert.ok(review.includes(s));
});

test('chapter 8: full source read, balanced keys, solubility calculations and separation limits',()=>{
 const base='content/question-bank/class-6/science/chapter-8';
 const b=JSON.parse(fs.readFileSync(`${base}/questions.json`,'utf8')),r=JSON.parse(fs.readFileSync(`${base}/validation.json`,'utf8'));
 assert.equal(b.items.length,160);assert.equal(new Set(b.items.map(q=>mcq.normalizeStem(q.text))).size,160);
 assert.deepEqual(r.counts,{MCQ:100,CQ:30,SQ:30});assert.deepEqual(r.readPrintedPages,Array.from({length:13},(_,i)=>60+i));
 assert.equal(r.fullChapterRead,true);assert.equal(r.teacherApproved,false);assert.equal(r.targetMet,true);
 const keys={A:0,B:0,C:0,D:0};for(const q of b.items.filter(q=>q.type==='MCQ')){keys[q.correct]++;assert.equal(new Set(Object.values(q.options)).size,4);}
 assert.deepEqual(keys,{A:25,B:25,C:25,D:25});
 for(const [text,a] of [['নির্দিষ্ট তাপে সোডিয়াম কার্বনেটের দ্রবণীয়তা ২১.৬ হলে ২০০ গ্রাম পানিতে কত গ্রাম লাগবে?','৪৩.২ গ্রাম'],['২৫°C-তে উল্লিখিত দ্রবণীয়তা ৩৬ হলে ১০০ গ্রাম পানির সম্পৃক্ত লবণদ্রবণের ভর কত?','১৩৬ গ্রাম'],['দুধে চর্বির সূক্ষ্ম অংশ কোন পর্যায়?','বিক্ষিপ্ত দশা']]){
 const q=b.items.find(q=>q.text===text);assert.ok(q,text);assert.equal(q.options[q.correct],a);
 }
 const notes=fs.readFileSync(`${base}/source-review.md`,'utf8');for(const s of ['৬০–৭২','১০০ গ্রাম দ্রাবক','উদ্বায়ী দূষক','সাসপেনশনও অসমসত্ত্ব','স্বাধীন বিষয়শিক্ষক'])assert.ok(notes.includes(s));
});

test('chapter 9: complete source read, reflection geometry, balanced keys and source caveats',()=>{
 const base='content/question-bank/class-6/science/chapter-9';
 const b=JSON.parse(fs.readFileSync(`${base}/questions.json`,'utf8')),r=JSON.parse(fs.readFileSync(`${base}/validation.json`,'utf8'));
 assert.equal(b.items.length,160);assert.equal(new Set(b.items.map(q=>mcq.normalizeStem(q.text))).size,160);
 assert.deepEqual(r.counts,{MCQ:100,CQ:30,SQ:30});assert.deepEqual(r.readPrintedPages,Array.from({length:9},(_,i)=>73+i));
 assert.equal(r.fullChapterRead,true);assert.equal(r.teacherApproved,false);assert.equal(r.targetMet,true);
 const keys={A:0,B:0,C:0,D:0};for(const q of b.items.filter(q=>q.type==='MCQ')){keys[q.correct]++;assert.equal(new Set(Object.values(q.options)).size,4);}
 assert.deepEqual(keys,{A:25,B:25,C:25,D:25});
 for(const [text,a] of [['পৃষ্ঠের সঙ্গে আপতিত রশ্মি ৪০° করলে প্রতিফলন কোণ কত?','৫০°'],['স্থির দর্পণের দিকে বস্তু ৫ সেমি এগোলে বস্তু–প্রতিবিম্ব ব্যবধান কত কমে?','১০ সেমি'],['দুটি সমান্তরাল সমতল দর্পণের সাধারণ পেরিস্কোপে প্রতিটি দর্পণ নলের অক্ষের সঙ্গে প্রায় কত কোণে থাকে?','৪৫°']]){
 const q=b.items.find(q=>q.text===text);assert.ok(q,text);assert.equal(q.options[q.correct],a);
 }
 const notes=fs.readFileSync(`${base}/source-review.md`,'utf8');for(const s of ['৭৩–৮১','সব আলোর উৎস সূর্য','স্থানীয় নিয়ম','পার্শ্ব পরিবর্তন','স্বাধীন বিষয়শিক্ষক'])assert.ok(notes.includes(s));
});

test('chapter 10: full source reading, balanced keys, motion arithmetic and average/sign caveats',()=>{
 const base='content/question-bank/class-6/science/chapter-10';
 const b=JSON.parse(fs.readFileSync(`${base}/questions.json`,'utf8')),r=JSON.parse(fs.readFileSync(`${base}/validation.json`,'utf8'));
 assert.equal(b.items.length,160);assert.equal(new Set(b.items.map(q=>mcq.normalizeStem(q.text))).size,160);
 assert.deepEqual(r.counts,{MCQ:100,CQ:30,SQ:30});assert.deepEqual(r.readPrintedPages,Array.from({length:11},(_,i)=>82+i));
 assert.equal(r.fullChapterRead,true);assert.equal(r.teacherApproved,false);assert.equal(r.targetMet,true);
 const keys={A:0,B:0,C:0,D:0};for(const q of b.items.filter(q=>q.type==='MCQ')){keys[q.correct]++;assert.equal(new Set(Object.values(q.options)).size,4);}
 assert.deepEqual(keys,{A:25,B:25,C:25,D:25});
 for(const [text,a] of [['৩৬ কিলোমিটার/ঘণ্টা সমান কত মিটার/সেকেন্ড?','১০'],['গাড়ি একই দিকে চলতে চলতে ২০ থেকে ৮ মিটার/সেকেন্ডে ৪ সেকেন্ডে নামলে সামনের দিক ধনাত্মক ধরে গড় ত্বরণ কত?','−৩ মিটার/সেকেন্ড²'],['৬০ মিটার ১০ সেকেন্ডে যাওয়ার পর ১০ সেকেন্ড থামলে পুরো ২০ সেকেন্ডের গড় দ্রুতি কত?','৩ মিটার/সেকেন্ড']]){
 const q=b.items.find(q=>q.text===text);assert.ok(q,text);assert.equal(q.options[q.correct],a);
 }
 const notes=fs.readFileSync(`${base}/source-review.md`,'utf8');for(const s of ['৮২–৯২','ঋণাত্মক ত্বরণ সবসময় মন্দন নয়','বাস্তব বাউন্স','গড় বনাম তাৎক্ষণিক','স্বাধীন বিষয়শিক্ষক'])assert.ok(notes.includes(s));
});

test('chapter 11: full source reading, lever and machine arithmetic, model and safety limits',()=>{
 const base='content/question-bank/class-6/science/chapter-11';
 const b=JSON.parse(fs.readFileSync(`${base}/questions.json`,'utf8')),r=JSON.parse(fs.readFileSync(`${base}/validation.json`,'utf8'));
 assert.equal(b.items.length,160);assert.equal(new Set(b.items.map(q=>mcq.normalizeStem(q.text))).size,160);
 assert.deepEqual(r.counts,{MCQ:100,CQ:30,SQ:30});assert.deepEqual(r.readPrintedPages,Array.from({length:10},(_,i)=>93+i));
 assert.equal(r.fullChapterRead,true);assert.equal(r.teacherApproved,false);assert.equal(r.targetMet,true);
 const keys={A:0,B:0,C:0,D:0};for(const q of b.items.filter(q=>q.type==='MCQ')){keys[q.correct]++;assert.equal(new Set(Object.values(q.options)).size,4);}
 assert.deepEqual(keys,{A:25,B:25,C:25,D:25});
 for(const [text,a] of [['৮০ নিউটন ভার তুলতে ২০ নিউটন বল লাগলে যান্ত্রিক সুবিধা কত?','৪'],['আদর্শ লিভারে বলবাহু ৫০ সেমি ও ভারবাহু ১০ সেমি হলে সুবিধা কত?','৫'],['আদর্শ ঢালের দৈর্ঘ্য ৪ মিটার ও উচ্চতা ১ মিটার; ২০০ নিউটন ভারে ঢাল বরাবর বল কত?','৫০ নিউটন'],['আদর্শ একক স্থির কপিকলে ভার ৩০ নিউটন হলে ধীরে তুলতে বল কত?','৩০ নিউটন']]){
 const q=b.items.find(q=>q.text===text);assert.ok(q,text);assert.equal(q.options[q.correct],a);
 }
 const notes=fs.readFileSync(`${base}/source-review.md`,'utf8');for(const s of ['৯৩–১০২','সব যন্ত্র বল বাড়ায় না','শক্তি সৃষ্টি নয়','ক্রিয়ারেখার লম্ব দূরত্ব','মানবদেহ','জ্যাকের নিচে শরীর নয়'])assert.ok(notes.includes(s));
});

test('chapter 12: complete source read, balanced keys, scale and geological model limits',()=>{
 const base='content/question-bank/class-6/science/chapter-12';
 const b=JSON.parse(fs.readFileSync(`${base}/questions.json`,'utf8')),r=JSON.parse(fs.readFileSync(`${base}/validation.json`,'utf8'));
 assert.equal(b.items.length,160);assert.equal(new Set(b.items.map(q=>mcq.normalizeStem(q.text))).size,160);
 assert.deepEqual(r.counts,{MCQ:100,CQ:30,SQ:30});assert.deepEqual(r.readPrintedPages,Array.from({length:10},(_,i)=>103+i));
 assert.equal(r.fullChapterRead,true);assert.equal(r.teacherApproved,false);assert.equal(r.targetMet,true);
 const keys={A:0,B:0,C:0,D:0};for(const q of b.items.filter(q=>q.type==='MCQ')){keys[q.correct]++;assert.equal(new Set(Object.values(q.options)).size,4);}
 assert.deepEqual(keys,{A:25,B:25,C:25,D:25});
 for(const [text,a] of [['পৃথিবীর বয়স আনুমানিক ৪.৫ বিলিয়ন বছর বলতে কত কোটি বছর বোঝায়?','৪৫০ কোটি'],['বঙ্গোপসাগর কোন মহাসাগরের অংশ?','ভারত মহাসাগর'],['বহিঃকেন্দ্র ও অন্তঃকেন্দ্রের অবস্থার উপযুক্ত তুলনা কোনটি?','বহিঃকেন্দ্র তরল, অন্তঃকেন্দ্র কঠিন'],['চুনাপাথরের প্রধান উপাদান কোনটি?','ক্যালসিয়াম কার্বনেট']]){
 const q=b.items.find(q=>q.text===text);assert.ok(q,text);assert.equal(q.options[q.correct],a);
 }
 const notes=fs.readFileSync(`${base}/source-review.md`,'utf8');for(const s of ['১০৩–১১২','গুরুমণ্ডল সম্পূর্ণ তরল নয়','ভূত্বক ≠ সম্পূর্ণ শিলামণ্ডল','সব মাটিতে একই চার অভিন্ন স্তর নয়','সব জীবাশ্ম জ্বালানি পোঁতা গাছ নয়','অক্সিজেনের অনুপাত','মহাবিস্ফোরণ সাধারণ বোমা নয়'])assert.ok(notes.includes(s));
});

for(const [n,start,end,terms,answers] of [
 [13,113,123,['আয়োডিন পরীক্ষা সব শর্করার নয়','ক্যালরি বনাম কিলোক্যালরি','আয়োডিনের জন্য বেশি লবণ নয়','আঁশ সম্পূর্ণ অপরিবর্তিত'],[['১ কিলোক্যালরি সমান কত ক্যালরি?','১০০০'],['চর্বিতে দ্রবণীয় ভিটামিনের দল কোনটি?','A, D, E, K'],['আয়োডিনে রং না বদলালেই সব শর্করা অনুপস্থিত বলা যায় না কেন?','পরীক্ষাটি প্রধানত শ্বেতসারের, সব শর্করার নয়']]],
 [14,124,132,['উদ্ভিদও শ্বসন করে','ভারসাম্য গতিশীল','রোপণ ≠ প্রতিষ্ঠিত আবাস','উপাদান পুনঃচক্রিত হয়'],[['প্রায় ৬৬ মিলিয়ন বছর আগে মানে কত লক্ষ বছর?','৬৬০ লক্ষ'],['চারার ২০টির মধ্যে ১৫টি বাঁচলে কতটি বাঁচেনি?','৫টি'],['উদ্ভিদের শ্বসন সম্পর্কে সঠিক বক্তব্য কোনটি?','উদ্ভিদও শ্বসনে অক্সিজেন ব্যবহার করে']]]
])test(`chapter ${n}: full source read, balanced keys, safety and source caveats`,()=>{
 const base=`content/question-bank/class-6/science/chapter-${n}`;
 const b=JSON.parse(fs.readFileSync(`${base}/questions.json`,'utf8')),r=JSON.parse(fs.readFileSync(`${base}/validation.json`,'utf8'));
 assert.equal(b.items.length,160);assert.equal(new Set(b.items.map(q=>mcq.normalizeStem(q.text))).size,160);
 assert.deepEqual(r.readPrintedPages,Array.from({length:end-start+1},(_,i)=>start+i));assert.equal(r.teacherApproved,false);assert.equal(r.fullChapterRead,true);
 assert.deepEqual(Object.fromEntries([..."ABCD"].map(k=>[k,b.items.filter(q=>q.type==='MCQ'&&q.correct===k).length])),{A:25,B:25,C:25,D:25});
 for(const q of b.items.filter(q=>q.type==='MCQ'))assert.equal(new Set(Object.values(q.options)).size,4);
 for(const [text,a] of answers){const q=b.items.find(q=>q.text===text);assert.ok(q,text);assert.equal(q.options[q.correct],a);}
 const notes=fs.readFileSync(`${base}/source-review.md`,'utf8');for(const s of terms)assert.ok(notes.includes(s),s);
});
test('whole science counts complete but approval, chapter 1 full-read and coverage remain separate',()=>{
 assert.equal(manifest.status,'COUNT_COMPLETE_DRAFT_TEACHER_REVIEW_PENDING');assert.equal(manifest.teacherApproved,false);
 assert.deepEqual(manifest.totals,{MCQ:1400,CQ:420,SQ:420});assert.equal(manifest.targetMet,true);
 assert.equal(JSON.parse(fs.readFileSync('content/question-bank/class-6/science/chapter-1/validation.json','utf8')).fullChapterRead,false);
 for(let n=1;n<=14;n++){const r=JSON.parse(fs.readFileSync(`content/question-bank/class-6/science/chapter-${n}/validation.json`,'utf8'));assert.equal(r.teacherApproved,false);assert.deepEqual(r.remainingMinimum,{MCQ:0,CQ:0,SQ:0});}
});
