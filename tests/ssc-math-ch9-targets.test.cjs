const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),Module=require('node:module'),crypto=require('node:crypto'),katex=require('katex');
function load(file,mocks={}){const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return m.exports;}
const json=p=>JSON.parse(fs.readFileSync(p,'utf8')),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const data=load('lib/nctb-data.ts'),mcq=load('lib/mcq-import.ts',{'@/lib/nctb-data':data}),prov=load('lib/question-provenance.ts');
const upload=load('lib/question-json-import.ts',{'./nctb-data':data,'./mcq-import':mcq,'./question-provenance':prov});
const auto=load('lib/auto-model.ts',{'./nctb-data':data,'./subject-model-policy':load('lib/subject-model-policy.ts',{'./nctb-data':data}),'./question-tables':load('lib/question-tables.ts', {"./ssc-biology-assets":load("lib/ssc-biology-assets.ts")})});
for(const [chapter,counts,seeds,families,slices,native] of [[9,{MCQ:250,CQ:150,SQ:70},10,[20,15,10],4,2]]){
 const base=`content/question-bank/ssc/math/chapter-${chapter}/`,manifest=json(base+'targets-v1-manifest.json'),review=json(base+manifest.validation.file);
 const inputs=manifest.files.map(f=>json(base+f.file)),all=inputs.flatMap(b=>b.items),size=Object.values(counts).reduce((a,b)=>a+b,0);
 const scope={category:'Class 9',subject:'গণিত',group:'',topic:manifest.topic};
 test(`chapter ${chapter}: exact targets, importer limits/catalog, hashes, dedupe ignoring image filenames`,()=>{
  assert.deepEqual(manifest.counts,counts);assert.equal(manifest.files.length,slices);assert.equal(all.length,size);
  assert.deepEqual(Object.fromEntries(['MCQ','CQ','SQ'].map(k=>[k,all.filter(q=>q.type===k).length])),counts);
  for(const f of manifest.files){const raw=fs.readFileSync(base+f.file);assert.ok(raw.length<750000);assert.equal(raw.length,f.bytes);assert.equal(hash(raw),f.sha256);assert.ok(upload.parseQuestionUpload(raw.toString(),scope).records.length<=200);}
  const stems=all.map(q=>mcq.normalizeStem(q.text.replace(/!\[[^\]]*\]\([^)]*\)/g,'')));assert.equal(new Set(stems).size,size);
 });
 test(`chapter ${chapter}: source seeds once only; original parameter variants never get board attribution`,()=>{
  const source=json(base+'board-seed-v1.json').items;assert.equal(source.length,seeds);
  for(const q of source)assert.deepEqual(all.filter(r=>r.text===q.text),[q]);
  assert.deepEqual(review.boardCounts,{MCQ:seeds,CQ:0,SQ:0});
  assert.deepEqual(review.originalPracticeCounts,{...counts,MCQ:counts.MCQ-seeds});
  for(const q of all){assert.equal(prov.questionProvenanceLabels(q).length,q.provenance?1:0);if(!q.provenance)assert.match(q.page,/নিজস্ব অনুশীলনী/);}
 });
 test(`chapter ${chapter}: complete solutions, 2/4/4 CQ parts, unique options and four answer keys`,()=>{
  const keys=new Set();for(const q of all){assert.ok(q.explanation.trim());
   if(q.type==='CQ'){assert.deepEqual(q.parts.map(p=>p.label),['ক','খ','গ']);assert.deepEqual(q.parts.map(p=>p.marks),[2,4,4]);assert.ok(q.parts.every(p=>p.question.trim()&&p.solution.trim()));}
   if(q.type==='MCQ'){assert.deepEqual(Object.keys(q.options),['A','B','C','D']);assert.ok(q.options[q.correct]);assert.equal(new Set(Object.values(q.options).map(mcq.normalizeStem)).size,4);keys.add(q.correct);}
  }assert.equal(keys.size,4);
 });
 test(`chapter ${chapter}: every audit binds actual item, file and position; family counts explicit`,()=>{
  assert.equal(review.itemReviews.length,size);
  for(const m of review.itemReviews){const q=json(base+m.file).items[m.itemInFile-1];assert.equal(hash(q.type+'\n'+q.text),m.questionSha256);assert.equal(m.hasDiagram,true);
   if(m.choiceExpressions){assert.equal(m.correct,q.correct);assert.equal(m.choiceExpressions.length,4);}
   if(m.origin.startsWith('ORIGINAL')&&q.type!=='MCQ')assert.ok(m.exactChecks.length);
  }
  assert.deepEqual(['MCQ','CQ','SQ'].map(k=>Object.keys(review.familyCounts[k]).length),families);
 });
 test(`chapter ${chapter}: strict KaTeX; balanced math delimiters; no Python escape corruption`,()=>{
  let formulas=0;function visit(v){if(typeof v==='string'){assert.doesNotMatch(v,/[\x00-\x09\x0b\x0c\x0e-\x1f]/);assert.equal((v.match(/\$/g)||[]).length%2,0,v);for(const [,math] of v.matchAll(/\$([^$]+)\$/g)){katex.renderToString(math,{throwOnError:true,strict:'error',trust:false});formulas++;}}else if(v&&typeof v==='object')Object.values(v).forEach(visit);}
  visit(all);assert.ok(formulas>200);
 });
 test(`chapter ${chapter}: all rows have safe versioned local SVGs; no live-image or approval claim`,()=>{
  assert.deepEqual(review.illustratedCounts,counts);assert.equal(review.assets.length,size);assert.equal(review.sourceNativeFigureCount,native);
  const urls=all.flatMap(q=>[...q.text.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map(m=>m[1]));assert.equal(urls.length,size);assert.equal(new Set(urls).size,size);
  for(const a of review.assets){assert.ok(urls.includes(a.url));assert.ok(a.url.startsWith(`https://proshnobook.com/question-bank/ssc-math-ch${chapter}-v1/`));const bytes=fs.readFileSync(a.file);assert.equal(bytes.length,a.bytes);assert.equal(hash(bytes),a.sha256);assert.doesNotMatch(bytes.toString(),/<script|foreignObject|\bon\w+=|href=|src=/i);}
  for(const flag of ['teacherApproved','diagramTeacherApproved','assetsDeployed','assetLiveAvailabilityVerified','databaseCountVerified','fullChapterTextbookRead','boardSearchExhaustive'])assert.equal(review[flag],false,flag);
  assert.deepEqual(review.importedCounts,{MCQ:0,CQ:0,SQ:0});assert.deepEqual(review.remaining,{MCQ:0,CQ:0,SQ:0});assert.equal(review.targetMet,true);
 });
 test(`chapter ${chapter}: illustrated imported rows stay self-contained for AutoModel`,()=>{
  for(const input of inputs){const parsed=upload.parseQuestionUpload(JSON.stringify(input),scope);for(const [i,row] of parsed.records.entries())assert.equal(auto.autoModelRowKind({...row,topic:scope.topic}),input.items[i].type==='SQ'?'SHORT':input.items[i].type);}
 });
}
test('source adaptations explicitly disclose four added acute-angle domains, not verbatim board claims',()=>{
 const v=json('content/question-bank/ssc/math/chapter-9/target-v1/validation.json');
 const domain=v.itemReviews.filter(m=>m.explicitAcuteDomainAdded);assert.equal(domain.length,4);
 for(const m of domain){assert.match(m.adaptation,/শর্তযুক্ত অভিযোজন/);const q=json('content/question-bank/ssc/math/chapter-9/'+m.file).items[m.itemInFile-1];assert.match(q.text,/সূক্ষ্মকোণ/);}
});
test('source distractors are visually transcribed, including Mymensingh 14 B=4/5 and Dinajpur 22 C=9/4',()=>{
 const q=json('content/question-bank/ssc/math/chapter-9/board-seed-v1.json').items;
 assert.equal(q.find(x=>x.provenance[0].board==='mymensingh'&&x.provenance[0].questionNumber==='14').options.B,'$\\frac45$');
 assert.equal(q.find(x=>x.provenance[0].board==='dinajpur'&&x.provenance[0].questionNumber==='22').options.C,'$\\frac94$');
});
test('offline trig gallery embeds Greek-capable KaTeX fonts and all diagram SVGs, with no remote font files',()=>{
 const raw=fs.readFileSync('docs/question-bank/ssc-math-ch9-illustrated-review.html','utf8');
 assert.match(raw,/font-family:KaTeX_Math/);assert.match(raw,/data:font\/woff2;base64,/);assert.doesNotMatch(raw,/url\(fonts\//);
 assert.equal((raw.match(/<figure><svg/g)||[]).length,470);assert.equal((raw.match(/<article data-kind=/g)||[]).length,470);
});
