#!/usr/bin/env node
// Explicit read-only inventory/readback. Never part of the normal build.
const {createHash}=require('node:crypto');
const release=require('./question-bank/release-ssc-biology.cjs');
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const ROOT=path.resolve(__dirname,'..');
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
async function guardActionCheck(db,api){
 const file=path.join(ROOT,'app/actions/auto-model.ts'),m=new Module(file,module);m.paths=module.paths;
 let writes=0,providerCalls=0;const forbidden=()=>{writes++;throw Error('Read-only guard probe refused mutation');};
 const readonly={question:{findMany:args=>db.question.findMany(args),create:forbidden},setting:{create:forbidden,deleteMany:forbidden}};
 m.require=id=>{
  if(id==='@/auth')return {auth:async()=>({user:{id:'readonly-stock-probe-not-a-login',role:'TEACHER'}})};
  if(id==='@/lib/db')return {db:readonly};
  if(id==='@/lib/auto-model-provider')return {requestAutoModelGap:async()=>{providerCalls++;throw Error('Provider forbidden in read-only probe');}};
  return require(id.startsWith('@/')?path.join(ROOT,id.slice(2))+'.ts':id);
 };
 const ts=require('typescript');m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,file);
 const topic=api.autoModelTopics('SSC','জীববিজ্ঞান')[0];
 const request={category:'SSC',subject:'জীববিজ্ঞান',variant:'CQ',topics:[topic],syllabus:{reference:'Diagnostic explicit scheme,100 offered CQ from one selected chapter, not official distribution',totalMarks:50,minutes:60,cqPartMarks:[1,2,3,4],sections:[{kind:'CQ',offered:100,answer:5,marksEach:10,topics:[topic]}]}};
 const result=await m.exports.prepareAutoModel(request),inspection=await m.exports.inspectAutoModel(request);
 if(result.ok||!result.databaseOnly||!inspection.ok||!inspection.report.databaseOnly||inspection.report.aiShortfall!==0||inspection.report.stockShortfall<=0||inspection.report.feasible||inspection.report.quotaBatchUpperBound!==0||writes||providerCalls)throw Error('Live-stock server-action AI guard failed');
 return {method:'READ_ONLY_SERVER_ACTION_HARNESS_WITH_LIVE_STOCK',syntheticTeacherIdentity:true,authenticatedBrowserFlowVerified:false,sectionTopicFilterCovered:true,databaseOnly:true,stockShortfall:inspection.report.stockShortfall,aiShortfall:0,quotaWrites:writes,providerInvocations:providerCalls,topicSubstitution:false};
}
async function check(db,mode,expectedProtected){
 const api=release.load(),plan=release.prepare(api),protectedSubjects=[];
 for(const subject of ['পদার্থবিজ্ঞান','রসায়ন']){
  const rows=await db.question.findMany({where:{category:{in:api.categoryAliases('SSC')},subject},orderBy:{id:'asc'},take:20001});
  if(rows.length>20000)throw Error('Protected stock scan bound exceeded');
  protectedSubjects.push({subject,count:rows.length,approved:rows.filter(q=>q.approved).length,digest:hash(rows.map(q=>[q.id,q.category,q.subject,q.topic,q.lang,q.text,q.options,q.correct,q.explanation,q.difficulty,q.source,q.approved]))});
 }
 const protectedDigest=hash(protectedSubjects);
 const biology=await db.question.findMany({where:{category:{in:plan.aliases},subject:'জীববিজ্ঞান'},orderBy:{id:'asc'},take:10001});
 if(biology.length>10000)throw Error('Biology scan bound exceeded');
 const common={protectedDigest,protectedSubjects,biologyRows:biology.length,biologyApproved:biology.filter(q=>q.approved).length,databaseMutation:false,providerInvoked:false,authenticatedBrowserFlowVerified:false,officialSyllabusCertification:false};
 if(mode==='inventory')return {status:'READ_ONLY_BIOLOGY_PRERELEASE_INVENTORY',...common};
 if(mode!=='verify'||protectedDigest!==expectedProtected)throw Error('Protected subject content/approval changed');
 const actual=new Map(biology.map(q=>[q.id,q]));
 if(plan.records.some(q=>!actual.get(q.id)?.approved||!release.equalRow(actual.get(q.id),q)))throw Error('Biology canonical approved readback mismatch');
 const modelChecks=[];
 // Diagnostic teacher-supplied schemes ONLY: these small cases exercise real stock
 // planning, not a claimed official Biology full-mark/time distribution.
 for(const variant of ['MCQ','CQ']){
  const scheme={totalMarks:variant==='MCQ'?25:50,minutes:60,reference:'Diagnostic explicit teacher scheme; not official Biology marks',cqPartMarks:variant==='CQ'?[1,2,3,4]:[],sections:variant==='MCQ'?[{kind:'MCQ',offered:25,answer:25,marksEach:1}]:[{kind:'CQ',offered:7,answer:4,marksEach:10},{kind:'SHORT',offered:7,answer:5,marksEach:2}]};
  const p=api.resolveSyllabusSelection({category:'SSC',subject:'জীববিজ্ঞান',variant,topics:api.autoModelTopics('SSC','জীববিজ্ঞান'),syllabus:scheme});
  const approved=biology.filter(q=>q.approved),report=api.modelReadiness(approved,p),selected=api.planSyllabusModel(approved,p,()=>.5);
  if(!report.complete||report.aiShortfall||!selected.ok||selected.missing.length)throw Error('Biology stock model check failed');
  const settings=api.autoModelSettings('SSC','জীববিজ্ঞান',variant,p.request),items=selected.ids.map(id=>{
   const q=actual.get(id);return {...q,type:api.syllabusRowKind(q,p),stimulus:q.options.stimulus,subQuestions:q.options.subQuestions,options:q.correct?q.options:undefined};
  });
  if(api.autoModelIssues(items,settings).length||api.autoModelSections(items,settings).flatMap(s=>s.questions).length!==items.length)throw Error('Biology editor/print mismatch');
  modelChecks.push({variant,offered:items.length,aiShortfall:0,schemeBasis:'DIAGNOSTIC_TEACHER_INPUT_NOT_OFFICIAL'});
 }
 const aiGuard=await guardActionCheck(db,api);
 const liveAssets=await release.verifyLiveAssets(plan);
 return {status:'READ_ONLY_BIOLOGY_PUBLICATION_READBACK_VERIFIED',...common,approvedCanonical:plan.records.length,releaseDigest:plan.digest,counts:plan.preview.counts,liveAssets,modelChecks,aiGuard,teacherCertified:false};
}
async function main(){
 if(process.env.VERCEL_ENV!=='production'||!process.env.DATABASE_URL||process.env.VERCEL_PROJECT_ID!=='prj_gJuVKTIvUtieGaJr7mitBHdC05Ze')throw Error('Explicit production context required');
 const {PrismaClient}=require('@prisma/client'),db=new PrismaClient();
 try{console.log('BIOLOGY_READ_ONLY_RECEIPT '+JSON.stringify(await check(db,process.argv[2],process.argv[3])));}finally{await db.$disconnect();}
}
module.exports={check};
if(require.main===module)main().catch(()=>{console.error('BIOLOGY_READ_ONLY_PROBE_FAILED; readback success NOT confirmed');process.exitCode=1;});
