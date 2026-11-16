const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module'),{execFileSync}=require('node:child_process');
function load(file,mocks={}){const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return m.exports;}
test('Class6 chapter1 draft fits real importer but honestly remains unverified against textbook pages',()=>{
 const data=load('lib/nctb-data.ts');const lib=load('lib/mcq-import.ts',{'@/lib/nctb-data':data});
 const raw=fs.readFileSync('content/question-bank/class-6/math-ch1-draft.json','utf8');
 const b=lib.parseMCQBatch(raw);assert.equal(b.items.length,100);
 assert.equal(b.subject,'গণিত');assert.equal(b.topic,'১. স্বাভাবিক সংখ্যা ও ভগ্নাংশ');
 for(const q of b.items)assert.ok(q.page.includes('যাচাই বাকি'));
 assert.ok(b.book.includes('নিজস্ব'));assert.ok(b.edition.includes('খসড়া'));
 const results=Object.fromEntries('ABCD'.split('').map(k=>[k,b.items.filter(q=>q.correct===k).length]));
 assert.deepEqual(results,{A:25,B:25,C:25,D:25});
});
test('all 100 answers and exact rational distractors independently recalculate; artifacts are reproducible',()=>{
 const output=execFileSync('python3',['scripts/question-bank/build-class6-math-ch1.py','--check'],{encoding:'utf8'});
 const r=JSON.parse(output);assert.equal(r.total,100);assert.equal(r.skills,25);assert.equal(r.exactDuplicateStems,0);
 assert.equal(r.exactRationalChecks,'100/100 passed');assert.equal(r.productionImported,0);assert.equal(r.textbookPageVerified,false);
});
