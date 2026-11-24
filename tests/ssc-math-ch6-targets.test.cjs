const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),Module=require('node:module'),crypto=require('node:crypto'),katex=require('katex');
function load(file,mocks={}){const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return m.exports;}
const json=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const base='content/question-bank/ssc/math/chapter-6/';
const manifest=json(base+'targets-v1-manifest.json'),review=json(base+manifest.validation.file);
const data=load('lib/nctb-data.ts'),mcq=load('lib/mcq-import.ts',{'@/lib/nctb-data':data}),prov=load('lib/question-provenance.ts');
const upload=load('lib/question-json-import.ts',{'./nctb-data':data,'./mcq-import':mcq,'./question-provenance':prov});
const scope={category:'Class 9',subject:'গণিত',group:'',topic:'৬ষ্ঠ অধ্যায়: রেখা, কোণ ও ত্রিভুজ'};
const inputs=manifest.files.map(f=>json(base+f.file));
const all=inputs.flatMap(b=>b.items);
const count=kind=>all.filter(q=>q.type===kind).length;
test('chapter 6 exact 150/50/30 target = 230 in two strict importer batches; no limit relaxation',()=>{
 assert.equal(manifest.files.length,2);assert.equal(all.length,230);
 assert.deepEqual({MCQ:count('MCQ'),CQ:count('CQ'),SQ:count('SQ')},{MCQ:150,CQ:50,SQ:30});
 for(const f of manifest.files){const raw=fs.readFileSync(base+f.file,'utf8');
  assert.ok(Buffer.byteLength(raw)<750000);assert.equal(Buffer.byteLength(raw),f.bytes);
  assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),f.sha256);
  const {records}=upload.parseQuestionUpload(raw,scope);assert.ok(records.length<=200);
 }
 assert.equal(new Set(all.map(q=>mcq.normalizeStem(q.text))).size,230,'unique stems across all chapter slices');
});
test('ten source questions are preserved exactly once, while all 220 variants are explicitly original',()=>{
 const seed=json(base+'board-seed-v1.json');
 for(const q of seed.items){const matches=all.filter(row=>row.text===q.text);assert.equal(matches.length,1);assert.deepEqual(matches[0],q);}
 assert.deepEqual(review.boardCounts,{MCQ:10,CQ:0,SQ:0});
 assert.deepEqual(review.originalPracticeCounts,{MCQ:140,CQ:50,SQ:30});
 for(const q of all){if(q.provenance){assert.equal(prov.questionProvenanceLabels(q).length,1);}
  else{assert.match(q.page,/নিজস্ব অনুশীলনী/);assert.equal(prov.questionProvenanceLabels(q).length,0);}}
 assert.equal(all.filter(q=>q.provenance).length,10);
});
test('all 50 CQ have three complete 2/4/4 parts and all MCQ/SQ have answer explanations',()=>{
 for(const q of all){assert.ok(q.explanation.trim());
  if(q.type==='CQ'){
   assert.deepEqual(q.parts.map(p=>p.label),['ক','খ','গ']);assert.deepEqual(q.parts.map(p=>p.marks),[2,4,4]);
   assert.ok(q.parts.every(p=>p.question.trim()&&p.solution.trim()));
  }else if(q.type==='MCQ'){
   assert.deepEqual(Object.keys(q.options),['A','B','C','D']);assert.ok(q.options[q.correct]);
   assert.equal(new Set(Object.values(q.options).map(mcq.normalizeStem)).size,4);
  }
 }
});
test('all 230 audit entries bind actual question kind, stem, file and position; all four MCQ key letters occur',()=>{
 assert.equal(review.itemReviews.length,230);const keys=new Set();
 for(const meta of review.itemReviews){const q=json(base+meta.file).items[meta.itemInFile-1];
  assert.equal(crypto.createHash('sha256').update(q.type+'\n'+q.text).digest('hex'),meta.questionSha256);
  if(meta.choiceExpressions!==undefined){assert.equal(meta.choiceExpressions.length,4);assert.equal(meta.correct,q.correct);keys.add(meta.correct);}
  if(meta.origin.startsWith('ORIGINAL')&&q.type!=='MCQ')assert.ok(meta.exactChecks.length);
 }
 assert.equal(keys.size,4);
 assert.equal(Object.keys(review.familyCounts.MCQ).length,20);
 assert.equal(Object.keys(review.familyCounts.CQ).length,10);
 assert.equal(Object.keys(review.familyCounts.SQ).length,10);
});
test('every formula renders in KaTeX, with balanced delimiters and no Python escape corruption',()=>{
 let formulas=0;
 function visit(v){if(typeof v==='string'){
  assert.doesNotMatch(v,/[\x00-\x09\x0b\x0c\x0e-\x1f]/);assert.equal((v.match(/\$/g)||[]).length%2,0,v);
  for(const [,math] of v.matchAll(/\$([^$]+)\$/g)){katex.renderToString(math,{throwOnError:true,strict:'error',trust:false});formulas++;}
 }else if(v&&typeof v==='object')Object.values(v).forEach(visit);}
 visit(all);assert.ok(formulas>500);
});
test('numeric completion does not claim live import, teacher approval, full textbook reading or exhaustive board collection',()=>{
 assert.equal(review.targetMet,true);assert.equal(review.teacherApproved,false);assert.equal(manifest.teacherApproved,false);
 assert.equal(review.databaseCountVerified,false);assert.equal(review.boardSearchExhaustive,false);assert.equal(review.fullChapterTextbookRead,false);
 assert.deepEqual(review.remaining,{MCQ:0,CQ:0,SQ:0});assert.deepEqual(review.importedCounts,{MCQ:0,CQ:0,SQ:0});
 assert.match(review.limitations.join(' '),/not 230 distinct concepts/);
});
test('all seventeen chapters register fifty-three slices, not duplicate historical seed stock',()=>{
 const mocks={'./question-json-import':upload};
 for(const [chapter,files] of [[1,['mcq-1','written','validation']],[2,['mcq-1','mcq-2','written','validation']],[3,['mcq-1','mcq-2','cq','sq','validation']],[4,['mcq','written','validation']],[5,['mcq','written','validation']],[6,['mcq','written','validation']],[7,['mcq','cq','sq','validation']],[8,['mcq-1','mcq-2','cq-1','cq-2','sq','validation']],[9,['mcq-1','mcq-2','cq','sq','validation']],[10,['mcq','cq','sq','validation']],[11,['mcq','cq','sq','validation']],[12,['mcq','cq','sq','validation']],[13,['mcq','cq','sq','validation']],[14,['mcq','cq','sq','validation']],[15,['mcq','cq','sq','validation']],[16,['mcq','cq','sq','validation']],[17,['mcq-1','mcq-2','cq-1','cq-2','sq','validation']]])
  for(const name of files){const f=`content/question-bank/ssc/math/chapter-${chapter}/target-v1/${name}.json`;mocks['@/'+f]=json(f);}
 const lib=load('lib/ssc-math-batches.ts',mocks),allBatches=lib.sscMathBatches();
 assert.equal(allBatches.length,53);assert.equal(allBatches.reduce((s,b)=>s+b.records.length,0),5750);
 const chapter=allBatches.filter(b=>b.topic===scope.topic);assert.equal(chapter.length,2);assert.equal(chapter.reduce((s,b)=>s+b.records.length,0),230);
 assert.ok(chapter.every(b=>b.limitations.includes('Pending ADMIN')));
 assert.equal(new Set(allBatches.map(b=>b.id)).size,53);
});
test('149 MCQ / 50 CQ / 30 SQ diagrams are self-contained, versioned and backed by real safe SVG files; live URLs are NOT claimed',()=>{
 assert.deepEqual(review.illustratedCounts,{MCQ:149,CQ:50,SQ:30});
 assert.equal(review.assets.length,229);assert.equal(review.sourceNativeFigureCount,5);
 assert.equal(review.assetsDeployed,false);assert.equal(review.assetLiveAvailabilityVerified,false);assert.equal(review.diagramTeacherApproved,false);
 const urls=all.flatMap(q=>[...q.text.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map(m=>m[1]));
 assert.equal(urls.length,229);assert.equal(new Set(urls).size,229);
 for(const asset of review.assets){
  assert.ok(urls.includes(asset.url));assert.match(asset.url,/^https:\/\/proshnobook\.com\/question-bank\/ssc-math-ch6-v1\/[a-z0-9-]+\.svg$/);
  const raw=fs.readFileSync(asset.file);assert.equal(raw.length,asset.bytes);assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),asset.sha256);
  assert.doesNotMatch(raw.toString(),/<script|foreignObject|\bon\w+=|href=|src=/i);
 }
});
test('illustrated imported records remain self-contained MCQ/CQ/SQ for AutoModel; no detached or cross-row image dependency',()=>{
 const auto=load('lib/auto-model.ts',{'./nctb-data':data,'./subject-model-policy':load('lib/subject-model-policy.ts',{'./nctb-data':data}),'./question-tables':load('lib/question-tables.ts')});
 for(const input of inputs){const parsed=upload.parseQuestionUpload(JSON.stringify(input),scope);
  for(const [i,record] of parsed.records.entries())assert.equal(auto.autoModelRowKind({...record,topic:scope.topic}),input.items[i].type==='SQ'?'SHORT':input.items[i].type);
 }
});
