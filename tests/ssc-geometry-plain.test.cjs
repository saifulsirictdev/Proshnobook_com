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
const api=require('../lib/auto-model.ts');
const {sscGeometryPlainBatches}=require('../lib/ssc-geometry-plain-batches.ts');
const {sscMathBatches}=require('../lib/ssc-math-batches.ts');
const {normalizeStem}=require('../lib/mcq-import.ts');
const {autoModelIssues,autoModelSettings}=require('../lib/auto-model-paper.ts');
const batches=sscGeometryPlainBatches();
const rows=batches.flatMap(b=>b.records.map((q,i)=>({...q,id:b.id+'-'+i,topic:b.topic,subject:b.subject})));
const historical=sscMathBatches().flatMap(b=>b.records.map((q,i)=>({...q,id:b.id+'-'+i,topic:b.topic,subject:b.subject})));
test('50 new original diagram-free eligible geometry MCQ, ten per exact catalog chapter, no historical changes',()=>{
 assert.equal(batches.length,5);assert.equal(rows.length,50);assert.equal(historical.length,5750);
 const old=new Set(historical.map(q=>normalizeStem(q.text.replace(/!\[[^\]]*\]\([^)]*\)/g,''))));
 assert.equal(new Set(rows.map(q=>normalizeStem(q.text))).size,50);
 for(const batch of batches){assert.equal(batch.records.length,10);assert.match(batch.limitations,/DRAFT/);assert.equal(batch.provenance.teacherCertified,false);}
 for(const q of rows){assert.equal(api.mathDivision(q.topic).id,'geometry');assert.equal(api.autoModelRowKind(q),'MCQ');assert.equal(api.autoModelHasDiagram(q),false);assert.ok(!old.has(normalizeStem(q.text)));assert.equal(new Set(Object.values(q.options)).size,4);assert.ok(!q.options._provenance);assert.ok(!JSON.stringify(q).includes('!['));}
});
test('all fifty answer keys independently checked against theorem calculations and reviewed conceptual facts',()=>{
 const expected=[
  67,180*4/9,180-43-78,(180-46)/2,127-58,6,74,90/3,10,180-(90-38),
  '৪, ৭ ও ৯ সেমি',180-52-63,90/2,60/4,10/2,'বিন্দুদ্বয়ের সংযোজক রেখাংশের লম্বদ্বিখণ্ডক','সমকোণী',60,'তিনটি অন্তঃকোণ',120/2,
  2*Math.sqrt(13**2-12**2),136/2,37*2,90,180-108,11,90,14,2*Math.sqrt(13**2-5**2),3*8/4,
  18*5/2,'৯ : ১৬','৫ : ৯',15*2/3,18/2,2,3,360/4,12*7/4,75*36/25,
  32,70/2,29*2,46/2,21*7/3,'৪ : ৯',18*5/2,60*3/5,40*8/5,'৩ : ২',
 ];
 assert.equal(expected.length,50);
 rows.forEach((q,i)=>assert.equal(q.options[q.correct],String(expected[i]),`${i+1}: ${q.text}`));
});
test('local original bank plus 50 drafts is sufficient for both MCQ quotas and global five-figure cap',()=>{
 const all=[...historical,...rows];
 for(let seed=1;seed<=25;seed++){
  let n=seed;const random=()=>((n=(n*1664525+1013904223)>>>0)/4294967296);
  const r=api.assembleAutoModel(all,'MCQ',random);assert.equal(r.ok,true);
  const chosen=all.filter(q=>r.ids.includes(q.id));assert.equal(chosen.length,30);
  assert.ok(chosen.filter(api.autoModelHasDiagram).length<=5);
  assert.ok(chosen.some(q=>rows.some(x=>x.id===q.id)));
  assert.deepEqual(autoModelIssues(chosen.map(q=>({...q,type:'MCQ'})),autoModelSettings('SSC','গণিত','MCQ')),[]);
 }
 // This only proves local compatibility; production still requires Pending import/approval.
 assert.equal(api.assembleAutoModel(historical,'MCQ',()=>0.5).ok,false);
});
