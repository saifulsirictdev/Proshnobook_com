#!/usr/bin/env node
// Explicit production READ-ONLY smoke check. Does not import, approve or change stock.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const root=path.resolve(__dirname,'../..');
function load(){
 const ts=require('typescript'),resolve=Module._resolveFilename,ext=require.extensions['.ts'];
 Module._resolveFilename=function(id,parent,...rest){return resolve.call(this,id.startsWith('@/')?path.join(root,id.slice(2)):id,parent,...rest)};
 require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
 try{return {...require(path.join(root,'lib/auto-model.ts')),...require(path.join(root,'lib/subject-model-policy.ts')),...require(path.join(root,'lib/auto-model-paper.ts')),...require(path.join(root,'lib/paper-generation.ts'))};}
 finally{Module._resolveFilename=resolve;require.extensions['.ts']=ext;}
}
async function check(db){
 const api=load(),subject='পদার্থবিজ্ঞান',policy=api.subjectModelPolicy('SSC',subject);
 if(!policy)throw Error('Subject policy missing');
 const rows=await db.question.findMany({where:{category:{in:api.categoryAliases('SSC')},subject,approved:true},select:{id:true,text:true,topic:true,options:true,correct:true,explanation:true},orderBy:{id:'asc'},take:10001});
 if(rows.length>10000)throw Error('Scan bound');
 const samples=[];
 for(let seed=1;seed<=10;seed++)for(const variant of ['MCQ','CQ']){
  let n=seed;const random=()=>((n=(n*1664525+1013904223)>>>0)/4294967296);
  const result=api.assembleSubjectAutoModel(rows,'SSC',subject,variant,random);
  if(!result.ok)throw Error('Insufficient compatible approved stock');
  const map=new Map(rows.map(q=>[q.id,q]));
  const selected=result.ids.map(id=>map.get(id));
  const items=selected.map(q=>({...q,subject,category:'SSC',type:api.autoModelRowKind(q,policy),stimulus:q.options.stimulus,subQuestions:q.options.subQuestions,options:q.correct?q.options:undefined}));
  const settings=api.autoModelSettings('SSC',subject,variant);
  if(api.autoModelIssues(items,settings).length)throw Error('Editor policy mismatch');
  if(api.autoModelSections(items,settings).flatMap(s=>s.questions).length!==items.length)throw Error('Print omitted question');
  samples.push({seed,variant,count:items.length,marks:settings.info.marks,sections:policy.variants[variant].sections.map(s=>({kind:s.kind,offered:s.offered,answer:s.answer,chapters:selected.filter(q=>api.autoModelRowKind(q,policy)===s.kind).map(q=>api.subjectModelChapter(policy,q.topic))}))});
 }
 return {status:'SSC_PHYSICS_AUTO_MODEL_VERIFIED',policyId:policy.id,stockScanned:rows.length,modelsVerified:samples.length,samples,approvalMutation:false,officialYearVerified:false};
}
async function main(){
 if(process.env.VERCEL_ENV!=='production'||process.env.VERCEL_PROJECT_ID!=='prj_gJuVKTIvUtieGaJr7mitBHdC05Ze'||!process.env.DATABASE_URL)throw Error('Production context required');
 const {PrismaClient}=require('@prisma/client'),db=new PrismaClient();
 try{console.log('SSC_PHYSICS_AUTO_MODEL_RECEIPT '+JSON.stringify(await check(db)));}finally{await db.$disconnect();}
}
module.exports={check};
if(require.main===module)main().catch(()=>{console.error('SSC_PHYSICS_AUTO_MODEL_CHECK_FAILED; no approval/import performed');process.exitCode=1;});
