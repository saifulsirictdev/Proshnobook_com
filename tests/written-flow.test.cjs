const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), ts = require('typescript'), Module = require('node:module');
const m = new Module('written-flow', module);
m._compile(ts.transpileModule(fs.readFileSync('lib/written-flow.ts','utf8'), {
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},
}).outputText, 'written-flow.js');
const {writtenFlowBlocks:flow} = m.exports;
const cq = {q:{id:'cq1',text:'Stimulus',stimulus:'Text\n![figure](https://example.com/figure.svg)',
 subQuestions:{k:'Part A',kh:'Part B',g:'Part C',gh:'Part D'},answers:{k:'Answer A'},source:'AI_PENDING:u',type:'CQ'}};

test('CQ follows subpart boundaries, keeps stimulus/figure with first part, and retains original data',()=>{
 const before=JSON.stringify(cq), blocks=flow([cq],'CQ',true);
 assert.equal(blocks.length,4);
 assert.deepEqual(blocks.map(v=>v.writtenFlow.partIndex),[0,1,2,3]);
 assert.deepEqual(blocks.map(v=>v.writtenFlow.questionIndex),[0,0,0,0]);
 assert.deepEqual(blocks.map(v=>v.writtenFlow.first),[true,false,false,false]);
 assert.deepEqual(blocks.map(v=>v.writtenFlow.last),[false,false,false,true]);
 assert.ok(blocks.every(v=>v.q===cq.q));
 assert.equal(JSON.stringify(cq),before);
});
test('original numbering survives fragmented and unsplit questions with section offsets',()=>{
 const blocks=flow([cq,{q:{id:'cq2',text:'No subparts'}},{...cq,q:{...cq.q,id:'cq3'}}],'CQ',true,6);
 assert.deepEqual(blocks.map(v=>v.writtenFlow.questionIndex),[6,6,6,6,7,8,8,8,8]);
 assert.equal(blocks[4].writtenFlow.partIndex,-1);
 assert.equal(blocks[4].writtenFlow.first,true);
 assert.equal(blocks[4].writtenFlow.last,true);
});
test('MCQ, SQ and answer/combined formats never fragment; English reference exercises stay intact',()=>{
 for(const type of ['MCQ','SHORT'])assert.equal(flow([cq],type,true).length,1);
 assert.equal(flow([cq],'CQ',false)[0],cq);
 const english={q:{...cq.q,englishGroup:{referenceModel:true,passages:[],tasks:[]}}};
 assert.equal(flow([english],'CQ',true).length,1);
 assert.equal(flow([english],'CQ',true)[0].q,english.q);
});
test('empty subparts do not create phantom fragments or shift label indexes',()=>{
 const q={q:{...cq.q,subQuestions:{k:'',kh:'B',g:'C',gh:' '}}};
 const blocks=flow([q],'CQ',true);
 assert.equal(blocks.length,2);
 assert.deepEqual(blocks.map(v=>v.writtenFlow.partIndex),[0,1]);
 assert.equal(q.q.subQuestions.kh,'B');
});
test('paper integration uses original questions for auxiliary answer sheets, not CQ fragments',()=>{
 const code=fs.readFileSync('components/paper-builder/preview.tsx','utf8');
 assert.match(code,/originalSections\?\.map\(\(section, index\) => \(\s*<PaperPreview/);
 assert.doesNotMatch(code,/<PaperPreview[\s\S]*?questions=\{questions\}/);
 assert.match(code,/writtenFlowBlocks/);
 assert.doesNotMatch(code,/- 11px/);
 assert.doesNotMatch(code,/paddingLeft:.*10/);
});
