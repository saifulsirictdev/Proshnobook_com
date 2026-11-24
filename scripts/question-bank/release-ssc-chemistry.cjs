#!/usr/bin/env node
// Explicit owner-authorized one-off release. NEVER imported by app/build hooks.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),{createHash}=require('node:crypto');
const ROOT=path.resolve(__dirname,'../..'),ACK='PUBLISH_8110_CHEMISTRY_OWNER_APPROVED_NOT_TEACHER_CERTIFIED';
const COUNTS=[[350,50,70],[350,50,70],[500,100,100],[550,150,100],[500,200,100],[500,200,100],[500,150,100],[200,100,70],[300,100,80],[700,200,100],[700,200,100],[350,50,70]];
const hash=x=>createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex');
function stable(x){return Array.isArray(x)?x.map(stable):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;}
const fields=['id','category','subject','topic','lang','text','options','correct','explanation','difficulty','source'];
const equalRow=(a,b)=>!!a&&!!b&&hash(stable(Object.fromEntries(fields.map(k=>[k,a[k]]))))===hash(stable(Object.fromEntries(fields.map(k=>[k,b[k]]))));
function load(){
 const ts=require('typescript'),resolve=Module._resolveFilename,ext=require.extensions['.ts'];
 Module._resolveFilename=function(id,parent,...rest){return resolve.call(this,id.startsWith('@/')?path.join(ROOT,id.slice(2)):id,parent,...rest)};
 require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
 try{
  const batches=[];
  for(let ch=1;ch<=12;ch++){const mod=require(path.join(ROOT,`lib/ssc-chemistry${ch===1?'':`-ch${ch}`}-batches.ts`));batches.push(...mod[ch===1?'sscChemistryBatches':`sscChemistryChapter${ch}Batches`]());}
  return {batches,...require(path.join(ROOT,'lib/paper-generation.ts')),...require(path.join(ROOT,'lib/mcq-import.ts')),...require(path.join(ROOT,'lib/question-tables.ts')),...require(path.join(ROOT,'lib/auto-model.ts')),...require(path.join(ROOT,'lib/subject-model-policy.ts')),...require(path.join(ROOT,'lib/auto-model-paper.ts'))};
 }finally{Module._resolveFilename=resolve;require.extensions['.ts']=ext;}
}
function prepare(api=load()){
 const policy=api.subjectModelPolicy('SSC','রসায়ন');
 if(api.batches.length!==82||policy?.id!=='ssc-chemistry-owner-chapter-policy-v1')throw Error('Pinned Chemistry scope or policy changed');
 const ids=new Set(),stems=new Set(),chapters={};
 const scopes=api.batches.map(b=>{
  const match=b.id.match(/^ssc-chemistry-ch([1-9]|1[0-2])-(mcq(?:-[1-7])?|cq(?:-[12])?|sq(?:-1)?)-v1$/);if(!match||b.category!=='Class 9'||b.subject!==policy.subject||b.records.length>200||api.subjectModelChapter(policy,b.topic)!==Number(match[1]))throw Error('Unexpected batch');
  const ch=Number(match[1]);chapters[ch]??={topic:b.topic,MCQ:0,CQ:0,SQ:0};if(chapters[ch].topic!==b.topic)throw Error('Mixed chapter topic');const digest=hash(JSON.stringify(b));
  const records=b.records.map(q=>{
   if(!['MCQ','CQ','SQ'].includes(q.kind))throw Error('Unsupported kind');chapters[ch][q.kind]++;
   const identity=[b.category,b.subject,b.topic,q.kind,api.normalizeStem(q.text)],id='prepared_'+hash(JSON.stringify(identity)),stem=b.topic+'\n'+api.normalizeStem(q.text);
   if(ids.has(id)||stems.has(stem))throw Error('Duplicate Chemistry question');ids.add(id);stems.add(stem);
   return {id,category:b.category,subject:b.subject,topic:b.topic,lang:b.lang,text:q.text,options:q.options,correct:q.correct,explanation:q.explanation,difficulty:q.difficulty,source:`PREPARED_DRAFT:${digest}`};
  });return {batch:b,digest,records};
 });
 for(let ch=1;ch<=12;ch++){const c=chapters[ch];if(!c||['MCQ','CQ','SQ'].some((k,i)=>c[k]!==COUNTS[ch-1][i]))throw Error('Chapter quota mismatch');}
 const records=scopes.flatMap(s=>s.records),assets=new Map();let illustrated=0;
 for(const row of records){
  let has=false;
  for(const text of new Set([row.text,row.options.stimulus||'',row.explanation])){
   const raw=[...text.matchAll(/!\[[^\]\n]*\]\(([^)]+)\)/g)],images=api.questionBlocks(text).filter(b=>b.kind==='chemistry-image');if(raw.length!==images.length)throw Error('Unrenderable figure');
   for(const image of images){has=true;const url=new URL(image.src,'https://proshnobook.com');if(url.origin!=='https://proshnobook.com'||!/^\/question-bank\/ssc-chemistry-ch(?:[1-9]|1[0-2])-(?:source-)?v1\/[a-z0-9-]+\.(?:png|svg)$/.test(url.pathname)||url.search||url.hash)throw Error('Invalid asset path');const bytes=fs.readFileSync(path.join(ROOT,'public',url.pathname));assets.set(url.href,{url:url.href,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,mime:url.pathname.endsWith('.png')?'image/png':'image/svg+xml'});}
  }if(has)illustrated++;
 }
 if(records.length!==8110||assets.size<300)throw Error('Pinned total or asset scope mismatch');
 const preview={count:8110,counts:{MCQ:5500,CQ:1550,SQ:1060},chapters,illustrated,assets:[...assets.values()].sort((a,b)=>a.url.localeCompare(b.url)),scopes:scopes.map(s=>({id:s.batch.id,digest:s.digest,count:s.records.length})),approvalBasis:'OWNER_EXPLICIT_IMPORT_APPROVE_DEPLOY; NOT_INDEPENDENT_TEACHER_CERTIFICATION',teacherCertified:false,officialYearVerified:false,taskVariants:true,chemistryAutoModelPolicy:policy.id};
 return {scopes,records,preview,digest:hash(JSON.stringify(preview)),aliases:api.categoryAliases('Class 9'),normalizeStem:api.normalizeStem};
}
async function verifyLiveAssets(plan,fetcher=fetch){
 const list=plan.preview.assets;let index=0,verified=0;
 await Promise.all(Array.from({length:10},async()=>{while(index<list.length){const a=list[index++];
  for(let attempt=0;attempt<2;attempt++)try{const res=await fetcher(a.url,{redirect:'error',signal:AbortSignal.timeout(20000)});if(!res.ok||!res.headers.get('content-type')?.includes(a.mime)||createHash('sha256').update(Buffer.from(await res.arrayBuffer())).digest('hex')!==a.sha256)throw Error('Wrong/missing live asset');verified++;break;}catch(e){if(attempt===1)throw Error('Live asset verification failed');}
 }}));
 if(verified!==list.length)throw Error('Incomplete live assets');return {verified,assetsDigest:hash(JSON.stringify(list)),origin:'https://proshnobook.com',method:'HTTP_GET_CONTENT_TYPE_AND_SHA256'};
}
async function retry(db,work){for(let n=0;n<3;n++)try{return await db.$transaction(work,{isolationLevel:'Serializable',timeout:120000,maxWait:20000})}catch(e){if(n===2||!['P2034','P2002'].includes(e.code))throw e;}}
async function publish(db,plan,digest,actor,ack,evidence){
 if(digest!==plan.digest||!/^[a-f0-9]{64}$/.test(digest||'')||!/^vercel-owner-release:[a-f0-9]{40}$/.test(actor||'')||ack!==ACK||evidence?.verified!==plan.preview.assets.length||evidence.assetsDigest!==hash(JSON.stringify(plan.preview.assets))||evidence.origin!=='https://proshnobook.com')throw Error('Explicit pinned authorization and live assets required');
 const now=new Date().toISOString(),prefix=`ssc-chemistry-release:v1:${digest}`,expected=new Map(plan.records.map(q=>[q.id,q])),targetIds=[...expected.keys()],scope={category:{in:plan.aliases},subject:'রসায়ন',topic:{in:Object.values(plan.preview.chapters).map(c=>c.topic)}};
 const imported=await retry(db,async tx=>{
  const existing=await tx.question.findMany({where:scope});const byId=new Map(existing.map(q=>[q.id,q])),byStem=new Map();for(const q of existing){const key=q.topic+'\n'+plan.normalizeStem(q.text);byStem.set(key,[...(byStem.get(key)||[]),q]);}
  const pending=[];
  for(const row of plan.records){const old=byId.get(row.id),matches=byStem.get(row.topic+'\n'+plan.normalizeStem(row.text))||[];if(matches.some(q=>q.id!==row.id))throw Error('Legacy/alias duplicate; manual review required');if(old){if(!equalRow(old,row))throw Error('Canonical content or provenance changed');}else pending.push({...row,approved:false});}
  for(let i=0;i<pending.length;i+=100)await tx.question.createMany({data:pending.slice(i,i+100)});
  for(const s of plan.scopes){const key=`preparedimport:v1:${s.digest}`;if(!await tx.setting.findUnique({where:{key}}))await tx.setting.create({data:{key,value:JSON.stringify({actorId:actor,createdAt:now,batchId:s.batch.id,category:s.batch.category,subject:s.batch.subject,topic:s.batch.topic,provenance:s.batch.provenance,limitations:s.batch.limitations,ids:s.records.map(q=>q.id),skipped:0,releaseDigest:digest,authorization:'OWNER_EXPLICIT_PENDING_IMPORT'})}});}
  await tx.setting.create({data:{key:prefix+':import:'+hash(actor+now),value:JSON.stringify({actor,createdAt:now,digest,inserted:pending.length,canonicalCount:8110,ids:targetIds})}});return {inserted:pending.length};
 });
 return retry(db,async tx=>{
  const scoped=await tx.question.findMany({where:scope}),pinnedStems=new Set(plan.records.map(q=>q.topic+'\n'+plan.normalizeStem(q.text)));
  if(scoped.some(q=>!expected.has(q.id)&&pinnedStems.has(q.topic+'\n'+plan.normalizeStem(q.text))))throw Error('Concurrent alias duplicate');
  const before=await tx.question.findMany({where:{id:{in:targetIds}}});if(before.length!==8110||before.some(q=>!equalRow(q,expected.get(q.id))))throw Error('Approval snapshot changed');
  const previous=before.filter(q=>q.approved).length,changed=await tx.question.updateMany({where:{id:{in:targetIds},category:'Class 9',subject:'রসায়ন',approved:false},data:{approved:true}}),after=await tx.question.findMany({where:{id:{in:targetIds}}});
  if(after.length!==8110||after.some(q=>!q.approved||!equalRow(q,expected.get(q.id)))||changed.count+previous!==8110)throw Error('Incomplete approval');
  const result={status:'OWNER_APPROVED_CHEMISTRY_VERIFIED',digest,actor,createdAt:now,insertedPending:imported.inserted,newlyApproved:changed.count,previouslyApproved:previous,approvedCanonical:8110,counts:plan.preview.counts,chapters:plan.preview.chapters,illustrated:plan.preview.illustrated,liveAssets:evidence,approvalBasis:plan.preview.approvalBasis,teacherCertified:false,officialYearVerified:false,taskVariants:true};
  await tx.setting.create({data:{key:prefix+':approval:'+hash(actor+now),value:JSON.stringify({...result,approvedIds:targetIds,newlyApprovedIds:before.filter(q=>!q.approved).map(q=>q.id)})}});return result;
 });
}
async function checkModels(db,api=load()){
 const subject='রসায়ন',policy=api.subjectModelPolicy('SSC',subject),rows=await db.question.findMany({where:{category:{in:api.categoryAliases('SSC')},subject,approved:true},select:{id:true,text:true,topic:true,options:true,correct:true,explanation:true},orderBy:{id:'asc'},take:10001});if(rows.length>10000)throw Error('Scan bound');
 const map=new Map(rows.map(q=>[q.id,q])),samples=[];
 for(let seed=1;seed<=10;seed++)for(const variant of ['MCQ','CQ']){let n=seed;const result=api.assembleSubjectAutoModel(rows,'SSC',subject,variant,()=>((n=(n*1664525+1013904223)>>>0)/4294967296));if(!result.ok)throw Error('Insufficient approved compatible stock');const selected=result.ids.map(id=>map.get(id)),items=selected.map(q=>({...q,subject,category:'SSC',type:api.autoModelRowKind(q,policy),stimulus:q.options.stimulus,subQuestions:q.options.subQuestions,options:q.correct?q.options:undefined})),settings=api.autoModelSettings('SSC',subject,variant);if(api.autoModelIssues(items,settings).length||api.autoModelSections(items,settings).flatMap(s=>s.questions).length!==items.length)throw Error('Model editor/print mismatch');samples.push({seed,variant,count:items.length,sections:policy.variants[variant].sections.map(s=>({kind:s.kind,chapters:selected.filter(q=>api.autoModelRowKind(q,policy)===s.kind).map(q=>api.subjectModelChapter(policy,q.topic))}))});}
 return {stockScanned:rows.length,modelsVerified:samples.length,samples,policyId:policy.id};
}
async function main(){
 const mode=process.argv[2];if(!['preview','publish','check'].includes(mode))throw Error('Choose explicit mode');const plan=prepare();if(mode==='preview'){console.log(JSON.stringify({digest:plan.digest,...plan.preview},null,2));return;}
 if(process.env.VERCEL_ENV!=='production'||!process.env.DATABASE_URL||process.env.VERCEL_PROJECT_ID!=='prj_gJuVKTIvUtieGaJr7mitBHdC05Ze')throw Error('Authorized production project required');
 const {PrismaClient}=require('@prisma/client'),db=new PrismaClient();try{
  if(mode==='publish'){if(process.argv[3]!==plan.digest||process.argv[4]!==ACK)throw Error('Pinned command required');const evidence=await verifyLiveAssets(plan);console.log('SSC_CHEMISTRY_LIVE_ASSETS '+JSON.stringify(evidence));console.log('SSC_CHEMISTRY_RELEASE_RECEIPT '+JSON.stringify(await publish(db,plan,process.argv[3],`vercel-owner-release:${process.env.VERCEL_GIT_COMMIT_SHA||''}`,process.argv[4],evidence)));}
  console.log('SSC_CHEMISTRY_MODEL_RECEIPT '+JSON.stringify(await checkModels(db)));
 }finally{await db.$disconnect();}
}
module.exports={load,prepare,publish,verifyLiveAssets,checkModels,equalRow,ACK};
if(require.main===module)main().catch(e=>{console.error('SSC_CHEMISTRY_RELEASE_STOPPED; inspect stage receipts; code='+(e.code||'VALIDATION_OR_CONTEXT_FAILURE'));process.exitCode=1;});
