const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),Module=require('node:module');
function load(file,mocks){const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);return m.exports;}
const options=load('lib/question-type-options.ts',{});
for(const kind of ['MCQ_SHORT','MCQ_SHORT_CQ','ALL','MCQ'])test(`picker pages every requested kind: ${kind}`,async()=>{
 const requests=[];const sizes={MCQ:100,SHORT:80,CQ:140};
 const page=load('app/question-builder/create/page.tsx',{
  '@/lib/question-types':{questionTypeWhere:type=>({kind:type})},
  '@/lib/question-type-options':options,'@/auth':{auth:async()=>({user:{id:'owner'}})},
  '@/lib/paper-generation':{visibleQuestions:id=>({visibility:id})},
  '@/components/chapter-selector':()=>null,'@/components/chapter-selector.css':{},
  '@/lib/chapter-filter':{normalizeTopics:t=>t?[t]:[],appendFilterParams:()=>{}},
  'next/link':()=>null,'@/components/qb-picker':()=>null,
  '@/lib/chemistry-text-clean':require('../lib/chemistry-text-clean'),
  '@/lib/db':{db:{question:{count:async({where})=>sizes[where.AND[1].kind],findMany:async args=>{
   if(args.distinct)return [];
   requests.push(args);const type=args.where.AND[1].kind;
   return [{id:type,text:type,options:type==='CQ'?{stimulus:'test'}:{},correct:type==='MCQ'?'A':'',explanation:'test',category:'Class 6',subject:'বিজ্ঞান',topic:'topic',source:'test'}];
  }}}}
 });
 await page.default({searchParams:Promise.resolve({category:'Class 6',subject:'বিজ্ঞান',topic:'topic',questionType:kind,page:'3',q:'search'})});
 assert.deepEqual(requests.map(r=>r.where.AND[1].kind),options.selectedQuestionTypes(kind));
 for(const r of requests){const scope=r.where.AND[0];assert.equal(scope.visibility,'owner');assert.equal(scope.subject,'বিজ্ঞান');assert.deepEqual(scope.topic,{in:['topic']});assert.equal(scope.text.contains,'search');assert.equal(r.take,50);assert.equal(r.skip,r.where.AND[1].kind==='CQ'?100:50);assert.deepEqual(r.orderBy,[{createdAt:'desc'},{id:'desc'}]);}
});
