const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),ts=require('typescript'),Module=require('node:module'),original=Module._resolveFilename;
Module._resolveFilename=function(id,parent,...rest){return original.call(this,id.startsWith('@/')?path.join(root,id.slice(2)):id,parent,...rest);};
require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const lib=require('../lib/prepared-question-batches.ts'),{english1Batches}=require('../lib/class6-english1-batches.ts');
const batches=english1Batches();
test('33 English batches validate against existing catalog and server registry',()=>{
 assert.equal(batches.length,33);assert.equal(lib.preparedSummaries().length,96);
 let mcq=0,sq=0;
 for(const b of batches){assert.equal(b.category,'Class 6');assert.equal(b.subject,'English 1st Paper');assert.equal(b.lang,'English');assert.equal(b.provenance.teacherApproved,false);
 const {batch,digest}=lib.getPreparedBatch(b.id);assert.equal(batch.topic,b.topic);assert.match(digest,/^[a-f0-9]{64}$/);
 assert.ok(b.records.length>0);assert.ok(b.records.length<=200);assert.ok(b.limitations.includes('ADMIN'));
 for(const q of b.records){assert.ok(q.text.includes(b.topic));assert.ok(q.explanation.trim());assert.ok(q.text.includes('textbook/audio not included'));assert.notEqual(q.kind,'CQ');assert.ok(Object.keys(q.options).every(k=>'ABCD'.includes(k)));if(q.kind==='MCQ'){mcq++;assert.ok(q.options[q.correct]);}else {sq++;assert.equal(q.correct,'');assert.deepEqual(q.options,{});}}
 }
 assert.equal(mcq,96);assert.equal(sq,404);
});
test('English conversion retains all source activities, answers and source limitations',()=>{
 for(let n=1;n<=33;n++){
 const p=JSON.parse(fs.readFileSync(`content/question-bank/class-6/english-1st/lesson-${String(n).padStart(2,'0')}-source-draft.json`,'utf8'));
 const b=batches[n-1];assert.equal(b.records.length,p.activities.reduce((s,a)=>s+(a.items?a.items.length:1),0));
 const all=b.records.map(q=>q.explanation).join('\n');
 for(const a of p.activities){for(const q of a.items||[]){if(q.modelAnswer)assert.ok(all.includes(q.modelAnswer));if(q.acceptedAnswers)for(const v of q.acceptedAnswers)assert.ok(all.includes(v));}
 if(typeof a.modelAnswer==='string')assert.ok(all.includes(a.modelAnswer));}
 for(const note of p.limitations)assert.ok(b.limitations.includes(note));
 assert.equal(b.provenance.source.sha256,p.source.sha256);
 }
 const manifest=require('../content/question-bank/class-6/english-1st/import/manifest.json');assert.equal(manifest.websiteImported,false);assert.equal(manifest.teacherApproved,false);assert.ok(manifest.limitations.some(x=>x.includes('Full model')));
});
