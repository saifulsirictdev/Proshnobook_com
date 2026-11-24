const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module'),crypto=require('node:crypto'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),katex=require('katex');
function load(file,mocks={}){const m=new Module(file);m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);return m.exports;}
const json=p=>JSON.parse(fs.readFileSync(p,'utf8')),hash=b=>crypto.createHash('sha256').update(b).digest('hex'),base='content/question-bank/ssc/math/chapter-17/';
const tables=load('lib/question-tables.ts', {"./ssc-biology-assets":load("lib/ssc-biology-assets.ts")}),MathText=load('components/MathText.tsx',{'@/lib/question-tables':tables}).default,answers=load('lib/paper-answers.ts');
const data=load('lib/nctb-data.ts'),mcq=load('lib/mcq-import.ts',{'@/lib/nctb-data':data}),prov=load('lib/question-provenance.ts'),upload=load('lib/question-json-import.ts',{'./nctb-data':data,'./mcq-import':mcq,'./question-provenance':prov});
const m=json(base+'targets-v1-manifest.json'),v=json(base+m.validation.file),inputs=m.files.map(f=>json(base+f.file)),all=inputs.flatMap(x=>x.items),scope={category:'Class 9',subject:'গণিত',group:'',topic:m.topic};
test('statistics exact 300/200/100 quota, five importer-compatible catalog slices and distinct stems',()=>{
 assert.deepEqual(m.counts,{MCQ:300,CQ:200,SQ:100});assert.equal(m.files.length,5);assert.equal(all.length,600);
 for(const f of m.files){const raw=fs.readFileSync(base+f.file);assert.ok(raw.length<750000);assert.equal(raw.length,f.bytes);assert.equal(hash(raw),f.sha256);const p=upload.parseQuestionUpload(raw.toString(),scope);assert.ok(p.records.length<=200);}
 const stems=all.map(q=>mcq.normalizeStem(q.text));assert.equal(new Set(stems).size,600);
});
test('board adaptations and screenshot references are explicitly different; no unverified 2025 badges',()=>{
 assert.deepEqual(v.boardCounts,{MCQ:4,CQ:0,SQ:0});assert.deepEqual(v.userReferenceCounts,{MCQ:0,CQ:3,SQ:0});assert.deepEqual(v.originalPracticeCounts,{MCQ:296,CQ:197,SQ:100});
 assert.equal(all.filter(q=>q.provenance).length,4);const cq=all.filter(q=>q.type==='CQ');assert.ok(cq.slice(0,3).every(q=>q.page.startsWith('ব্যবহারকারীর')&&!q.provenance));
 for(const q of all)assert.equal(prov.questionProvenanceLabels(q).length,q.provenance?1:0);
 assert.deepEqual(['MCQ','CQ','SQ'].map(k=>Object.keys(v.familyCounts[k]).length),[20,20,10]);
});
test('complete answers, correct CQ marks and four distinct options with varied keys',()=>{
 const keys=new Set();for(const q of all){assert.ok(q.explanation.trim());if(q.type==='CQ'){assert.deepEqual(q.parts.map(p=>p.label),['ক','খ','গ']);assert.deepEqual(q.parts.map(p=>p.marks),[2,4,4]);assert.ok(q.parts.every(p=>p.question&&p.solution));}if(q.options){assert.equal(new Set(Object.values(q.options)).size,4);assert.ok(q.options[q.correct]);keys.add(q.correct);}}
 assert.equal(keys.size,4);
});
test('every question audit binds item and response model; raw data tables agree with frequency model',()=>{
 assert.equal(v.itemReviews.length,600);
 for(const a of v.itemReviews){const q=json(base+a.file).items[a.itemInFile-1];assert.equal(hash(q.type+'\n'+q.text),a.questionSha256);if(a.family==='board-seed')continue;assert.equal(a.responseExpressions.length,3);
  const blocks=tables.questionBlocks(q.text),grid=blocks.find(b=>b.kind==='table');
  if(a.model.grouped&&grid&&a.family!=='cumulative-median'){
   const row=grid.rows[0];if(row[0]==='গণসংখ্যা f')for(let i=0;i<a.model.grouped.f.length;i++)assert.ok(row[i+1]==='x'||Number(row[i+1])===a.model.grouped.f[i]);
  }
 }
});
test('all stored tables are rectangular, use real HTML cell borders and semantic row/column headings',()=>{
 let count=0;for(const q of all){const text=[q.text,q.explanation,...(q.parts||[]).map(p=>p.solution)].join('\n');const blocks=tables.questionBlocks(text);for(const b of blocks)if(b.kind==='table'){count++;assert.ok(b.rows.every(r=>r.length===b.headers.length));}
  if(q.text.includes('| ---')){const html=renderToStaticMarkup(React.createElement(MathText,{text:q.text}));assert.match(html,/<table /);assert.match(html,/scope="col"/);assert.match(html,/scope="row"/);assert.match(html,/border:1px solid currentColor/);assert.doesNotMatch(html,/\| ---/);}
 }assert.ok(count>600);
});
test('bounded parser never executes HTML, arbitrary image URLs or malformed table candidates',()=>{
 for(const text of ['<script>alert(1)</script>','![x](javascript:alert(1))','![x](https://evil.invalid/a.svg)','| a | b |\n| --- | --- |\n| missing |','| a | b |\n| --- | --- |\n| 1 | 2 | 3 |'])assert.ok(tables.questionBlocks(text).every(b=>b.kind==='text'));
 const evil='| a | b |\n| --- | --- |\n| <img src=x onerror=alert(1)> | 2 |';const html=renderToStaticMarkup(React.createElement(MathText,{text:evil}));assert.match(html,/&lt;img/);assert.doesNotMatch(html,/<img/);
 const tall='| a | b |\n| --- | --- |\n'+Array(81).fill('| 1 | 2 |').join('\n');assert.ok(tables.questionBlocks(tall).every(b=>b.kind==='text'));
});
test('answer line/equality formatting preserves tables and renderer recognizes only exact versioned statistics graph URLs',()=>{
 const text='মোট N=50\n\n| মান | f |\n| --- | --- |\n| 1 | 2 |\n\nগড়=1';assert.deepEqual(answers.answerLines(text),[text]);assert.equal(answers.equalitySteps(text),null);
 const url='https://proshnobook.com/question-bank/ssc-math-ch17-v1/user-1-polygon.svg';assert.equal(tables.questionBlocks(`![লেখচিত্র](${url})`)[0].kind,'statistics-image');assert.match(renderToStaticMarkup(React.createElement(MathText,{text:`![লেখচিত্র](${url})`})),/<img /);
 assert.ok(tables.questionBlocks(`![x](${url}?onerror=bad)`).every(b=>b.kind==='text'));
});
test('all graph assets are answer-linked, safe, hashed; no approval/deployment claims',()=>{
 const allText=all.map(q=>JSON.stringify(q)).join('\n');assert.equal(v.assets.length,83);assert.equal(v.answerGraphCount,83);
 for(const a of v.assets){assert.ok(allText.includes(a.url));const raw=fs.readFileSync(a.file);assert.equal(hash(raw),a.sha256);assert.equal(raw.length,a.bytes);assert.doesNotMatch(raw.toString(),/<script|foreignObject|href=|\bon\w+=/i);}
 for(const flag of ['teacherApproved','assetsDeployed','assetLiveAvailabilityVerified','fullChapterTextbookRead','databaseCountVerified'])assert.equal(v[flag],false);
});
test('strict KaTeX and balanced delimiters throughout all 600 records',()=>{
 function visit(x){if(typeof x==='string'){assert.equal((x.match(/\$/g)||[]).length%2,0);assert.doesNotMatch(x,/[\x00-\x09\x0b\x0c\x0e-\x1f]/);for(const [,f]of x.matchAll(/\$([^$]+)\$/g))katex.renderToString(f,{throwOnError:true,strict:'error',trust:false});}else if(x&&typeof x==='object')Object.values(x).forEach(visit);}visit(all);
});
