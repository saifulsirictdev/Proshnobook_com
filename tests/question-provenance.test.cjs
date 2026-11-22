const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'), ts=require('typescript'), Module=require('node:module');
function load(file,mocks={}){const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return m.exports;}
const p=load('lib/question-provenance.ts');
const occurrence=(patch={})=>({kind:'board',board:'dhaka',examYear:2024,sourceFile:'Verified board compilation.pdf',pdfPage:4,printedPage:'145',questionNumber:'10',...patch});
test('structured board/year label is localized, deduplicated and retains all actual occurrences',()=>{
 const provenance=[occurrence(),occurrence(),occurrence({board:'sylhet',examYear:2023,questionNumber:'7'})];
 assert.deepEqual(p.questionProvenanceLabels({provenance}),['ঢাকা বোর্ড · ২০২৪ · প্রশ্ন ১০','সিলেট বোর্ড · ২০২৩ · প্রশ্ন ৭']);
 assert.equal(p.matchesQuestionBoard({provenance},'dhaka',2024),true);
 assert.equal(p.matchesQuestionBoard({provenance},'dhaka',2023),false,'board and year must belong to SAME occurrence');
 assert.equal(p.matchesQuestionBoard({provenance},'sylhet'),true);
 assert.equal(p.matchesQuestionBoard({provenance},'rajshahi'),false);
 assert.equal(p.questionProvenance({options:{A:'answer',_provenance:provenance}}).length,3);
});
test('never infer a board or year from source text, filenames, a school city, or malformed metadata',()=>{
 for(const q of [{source:'Dhaka Board 2024'}, {options:{source:'Dhaka Board 2024'}}, {provenance:[occurrence({examYear:undefined})]}, {provenance:[occurrence({board:'Dhaka'})]}, {provenance:[occurrence({pdfPage:0})]}, {provenance:[occurrence({kind:'school',school:'School',board:'dhaka'})]}])assert.deepEqual(p.questionProvenanceLabels(q),[]);
 const school={kind:'school',school:'রাজউক উত্তরা মডেল কলেজ, ঢাকা',examType:'মডেল টেস্ট ০১',sourceFile:'Exam2026.pdf',pdfPage:1,questionNumber:'16'};
 assert.deepEqual(p.questionProvenanceLabels({provenance:[school]}),['রাজউক উত্তরা মডেল কলেজ, ঢাকা · মডেল টেস্ট ০১ · প্রশ্ন ১৬']);
 assert.equal(p.matchesQuestionBoard({provenance:[school]},'dhaka'),false);
 assert.equal(p.questionProvenanceListSchema.safeParse(Array(31).fill(occurrence())).success,false);
});
test('strict JSON upload preserves optional provenance for MCQ SQ CQ, does not change answers, and binds it to preview digest',()=>{
 const data=load('lib/nctb-data.ts'), mcq=load('lib/mcq-import.ts',{'@/lib/nctb-data':data});
 const lib=load('lib/question-json-import.ts',{'./nctb-data':data,'./mcq-import':mcq,'./question-provenance':p});
 const selection={category:'Class 6',subject:'গণিত',group:'',topic:'১. স্বাভাবিক সংখ্যা ও ভগ্নাংশ'};
 const common={explanation:'Checked solution',page:'1',difficulty:'EASY',provenance:[occurrence()]};
 const batch={category:selection.category,subject:selection.subject,topic:selection.topic,book:'Fixture only',edition:'test',sourceUrl:'https://example.invalid',lang:'Bangla',items:[{...common,type:'MCQ',text:'2+2?',options:{A:'4',B:'3',C:'5',D:'6'},correct:'A'},{...common,type:'SQ',text:'Define prime'},{...common,type:'CQ',text:'Triangle stimulus',parts:['ক','খ','গ'].map((label,i)=>({label,marks:[2,4,4][i],question:'Part '+i,solution:'Answer '+i}))}]};
 const first=lib.parseQuestionUpload(JSON.stringify(batch),selection);
 for(const row of first.records)assert.deepEqual(row.options._provenance,[occurrence()]);
 assert.equal(first.records[0].options.A,'4');assert.equal(first.records[0].correct,'A');
 assert.deepEqual(first.records[2].options.marks,{k:2,kh:4,g:4});
 batch.items[0].provenance[0].examYear=2023;
 assert.notEqual(first.digest,lib.parseQuestionUpload(JSON.stringify(batch),selection).digest);
 batch.items[0].provenance[0].board='Made up board';
 assert.throws(()=>lib.parseQuestionUpload(JSON.stringify(batch),selection));
});
test('paid builder API exposes provenance separately, never as a fifth MCQ option; auth/payment remains before DB read',async()=>{
 const calls=[];
 const api=load('app/api/qb/questions/route.ts',{
  '@/auth':{auth:async()=>({user:{id:'owner',role:'TEACHER'}})},
  '@/lib/wallet':{requirePaidQuestions:async()=>calls.push('paid')},
  '@/lib/paper-generation':{visibleQuestions:()=>({approved:true})},
  '@/lib/db':{db:{question:{findMany:async()=>{calls.push('read');return[{id:'q',text:'Question',correct:'A',options:{A:'4',B:'3',C:'5',D:'6',_provenance:[occurrence()]},source:'Manual',approved:true}];}}}},
  'next/server':{NextResponse:{json:(data)=>data}},
 });
 const result=await api.POST({json:async()=>({ids:['q']})});
 assert.deepEqual(calls,['paid','read']);assert.deepEqual(result.items[0].provenance,[occurrence()]);
 assert.deepEqual(Object.keys(result.items[0].options),['A','B','C','D']);
 assert.deepEqual(p.questionProvenanceLabels(result.items[0]),['ঢাকা বোর্ড · ২০২৪ · প্রশ্ন ১০']);
});
test('real math samples are school-attributed only with exact question locators and no guessed board/year',()=>{
 const sample=require('../samples/ssc-math/questions.json');
 for(const q of sample.questions){assert.equal(q.provenance.length,1);const r=q.provenance[0];assert.equal(r.kind,'school');assert.equal(r.board,undefined);assert.equal(r.examYear,undefined);assert.equal(r.questionNumber,String(q.sourceQuestion));assert.equal(r.pdfPage,1);assert.equal(r.printedPage,'428');}
});
test('DB exam generation ignores reserved provenance instead of discarding a valid MCQ or adding a fifth option',async()=>{
 const api=load('app/api/generate-exam/route.ts',{
  '@/auth':{auth:async()=>({user:{id:'student',role:'STUDENT'}})},
  '@/lib/db':{db:{question:{findMany:async()=>[{text:'2+2?',correct:'A',options:{A:'4',B:'3',C:'5',D:'6',_provenance:[occurrence()]},explanation:'4'}]},apiUsage:{upsert:()=>{throw Error('DB mode must not consume provider quota')}}}},
  'next/server':{NextResponse:{json:(data)=>data}},
 });
 const result=await api.POST({json:async()=>({mode:'DB',type:'MCQ',className:'Class 10',subject:'গণিত',count:1})});
 assert.equal(result.success,true);assert.equal(result.questions.length,1);
 assert.deepEqual(result.questions[0].options,['4','3','5','6']);assert.equal(result.questions[0].correctAnswer,0);
});
