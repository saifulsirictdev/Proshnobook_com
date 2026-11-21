const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module');
const m=new Module('neutral',module);m.paths=module.paths;m._compile(ts.transpileModule(fs.readFileSync('lib/english/preparation-message.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,'neutral.js');
const {englishPreparationMessage:message}=m.exports;
test('Neutral wording retains actual failure, limits, no-save and recovery information',()=>{
 assert.match(message('Generation provider ব্যস্ত বা rate limit দিয়েছে। কিছুক্ষণ পরে চেষ্টা করুন।'),/ব্যস্ত বা rate limit/);
 assert.match(message('Provider সম্পূর্ণ paper ফেরত দেয়নি। কম অংশ নির্বাচন করে চেষ্টা করতে পারেন।'),/সম্পূর্ণ paper ফেরত দেয়নি/);
 assert.match(message('AI quota শেষ। আমার draft দেখুন।'),/দৈনিক প্রস্তুতির সীমা শেষ। আমার draft দেখুন।/);
 assert.match(message('output validation ব্যর্থ; অসম্পূর্ণ প্রশ্ন সেভ করা হয়নি।'),/যাচাই ব্যর্থ; অসম্পূর্ণ প্রশ্ন সেভ করা হয়নি/);
 assert.equal(message('Source প্রয়োজন।'), 'Source প্রয়োজন।');
});
test('Auto and setup keep neutral busy UI, errors and quota notice; editor never falsely asserts AI origin',()=>{
 for(const file of ['components/english-auto-model.tsx','components/english-setup.tsx']){
  const s=fs.readFileSync(file,'utf8');assert.match(s,/databaseOnly=\{paper === 1\} neutralBranding/);assert.match(s,/englishPreparationMessage\(.*\.error\)/);assert.doesNotMatch(s,/না-থাকলে AI|AI quota|কোনো AI request/);
 }
 assert.doesNotMatch(fs.readFileSync('components/english-editor.tsx','utf8'),/AI-generated draft/);
});
