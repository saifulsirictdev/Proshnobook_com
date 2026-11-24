#!/usr/bin/env node
// Owner-authorized, pinned 6400-question release. Never imported by the app/build.
// Production execution is an explicit one-off command, not a persistent build hook.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),{createHash}=require('node:crypto');
const ROOT=path.resolve(__dirname,'../..');
const ACK='PUBLISH_6400_PHYSICS_OWNER_APPROVED_NOT_TEACHER_CERTIFIED';
const COUNTS=[[250,100,100],[300,150,100],[200,120,70],[350,150,100],[200,80,50],[250,100,70],[200,100,70],...Array.from({length:7},()=>[250,120,100])];
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
  for(let ch=1;ch<=14;ch++){const mod=require(path.join(ROOT,`lib/ssc-physics${ch===1?'':`-ch${ch}`}-batches.ts`));batches.push(...mod[ch===1?'sscPhysicsBatches':`sscPhysicsChapter${ch}Batches`]());}
  return {batches,...require(path.join(ROOT,'lib/paper-generation.ts')),...require(path.join(ROOT,'lib/mcq-import.ts')),...require(path.join(ROOT,'lib/question-tables.ts')),...require(path.join(ROOT,'lib/auto-model.ts'))};
 }finally{Module._resolveFilename=resolve;require.extensions['.ts']=ext;}
}
function prepare(api=load()){
 if(api.batches.length!==53||api.autoModelBlueprint('Class 9','পদার্থবিজ্ঞান','MCQ')!==null)throw Error('Pinned Physics scope or blocked blueprint changed');
 const ids=new Set(),stems=new Set(),chapters={};
 const scopes=api.batches.map(b=>{
  const match=b.id.match(/^ssc-physics-ch([1-9]|1[0-4])-(mcq(?:-[12])?|cq|sq)-v1$/);if(!match||b.category!=='Class 9'||b.subject!=='পদার্থবিজ্ঞান'||b.records.length>200)throw Error('Unexpected batch');
  const ch=Number(match[1]);chapters[ch]??={topic:b.topic,MCQ:0,CQ:0,SQ:0};if(chapters[ch].topic!==b.topic)throw Error('Mixed chapter topic');
  const digest=hash(JSON.stringify(b));
  const records=b.records.map(q=>{
   if(!['MCQ','CQ','SQ'].includes(q.kind))throw Error('Unsupported kind');chapters[ch][q.kind]++;
   const identity=[b.category,b.subject,b.topic,q.kind,api.normalizeStem(q.text)],id='prepared_'+hash(JSON.stringify(identity)),stem=b.topic+'\n'+api.normalizeStem(q.text);
   if(ids.has(id)||stems.has(stem))throw Error('Duplicate Physics question');ids.add(id);stems.add(stem);
   return {id,category:b.category,subject:b.subject,topic:b.topic,lang:b.lang,text:q.text,options:q.options,correct:q.correct,explanation:q.explanation,difficulty:q.difficulty,source:`PREPARED_DRAFT:${digest}`};
  });return {batch:b,digest,records};
 });
 for(let ch=1;ch<=14;ch++){const c=chapters[ch];if(!c||['MCQ','CQ','SQ'].some((k,i)=>c[k]!==COUNTS[ch-1][i]))throw Error('Chapter quota mismatch');}
 const records=scopes.flatMap(s=>s.records),assets=new Map();
 for(let ch=5;ch<=14;ch++){
  const v=JSON.parse(fs.readFileSync(path.join(ROOT,`content/question-bank/ssc/physics/chapter-${ch}/validation.json`),'utf8'));
  for(const a of v.assets){
   const url=new URL(a.url),file=path.join(ROOT,a.file);
   if(url.origin!=='https://proshnobook.com'||url.pathname!==`/question-bank/ssc-physics-ch${ch}-v1/${path.basename(file)}`||url.search||url.hash||path.dirname(file)!==path.join(ROOT,`public/question-bank/ssc-physics-ch${ch}-v1`))throw Error('Invalid asset path');
   const bytes=fs.readFileSync(file);if(createHash('sha256').update(bytes).digest('hex')!==a.sha256||!bytes.toString().startsWith('<svg '))throw Error('Asset changed');
   assets.set(a.url,{url:a.url,sha256:a.sha256});
  }
 }
 const used=new Set();let illustrated=0;
 for(const row of records){const raw=[...row.text.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)],images=api.questionBlocks(row.text).filter(b=>b.kind==='physics-image');if(raw.length!==images.length||images.length>1)throw Error('Unrenderable figure');
  if(images.length)illustrated++;for(const image of images){if(!assets.has(image.src))throw Error('Missing manifest asset');used.add(image.src);}
 }
 if(records.length!==6400||assets.size!==2205||used.size!==assets.size||illustrated!==2205)throw Error('Pinned total or figure count mismatch');
 const preview={count:6400,counts:{MCQ:3500,CQ:1640,SQ:1260},chapters,illustrated,assets:[...assets.values()].sort((a,b)=>a.url.localeCompare(b.url)),scopes:scopes.map(s=>({id:s.batch.id,digest:s.digest,count:s.records.length})),approvalBasis:'OWNER_EXPLICIT_APPROVE_AND_DEPLOY; NOT_INDEPENDENT_TEACHER_CERTIFICATION',numericVariants:true,fullTextbookAndSyllabusAlignment:false,physicsAutoModelEnabled:false};
 return {scopes,records,preview,digest:hash(JSON.stringify(preview)),aliases:api.categoryAliases('Class 9'),normalizeStem:api.normalizeStem};
}
async function verifyLiveAssets(plan,fetcher=fetch){
 const list=plan.preview.assets;let index=0,verified=0;
 await Promise.all(Array.from({length:12},async()=>{while(index<list.length){const a=list[index++];let ok=false;
  for(let attempt=0;attempt<2;attempt++)try{
   const res=await fetcher(a.url,{redirect:'error',signal:AbortSignal.timeout(20000)});
   if(!res.ok||!res.headers.get('content-type')?.includes('image/svg+xml'))throw Error('Missing live SVG');
   if(createHash('sha256').update(Buffer.from(await res.arrayBuffer())).digest('hex')!==a.sha256)throw Error('Wrong live SVG');ok=true;break;
  }catch(e){if(attempt===1)throw Error('Live asset verification failed');}
  if(ok)verified++;
 }}));
 if(verified!==2205)throw Error('Incomplete live assets');
 return {verified,assetsDigest:hash(JSON.stringify(list)),origin:'https://proshnobook.com',method:'HTTP_GET_CONTENT_TYPE_AND_SHA256'};
}
async function retry(db,work){for(let n=0;n<3;n++)try{return await db.$transaction(work,{isolationLevel:'Serializable',timeout:120000,maxWait:20000})}catch(e){if(n===2||!['P2034','P2002'].includes(e.code))throw e;}}
async function publish(db,plan,digest,actor,ack,evidence){
 if(digest!==plan.digest||!/^[a-f0-9]{64}$/.test(digest||'')||!/^vercel-owner-release:[a-f0-9]{40}$/.test(actor||'')||ack!==ACK||evidence?.verified!==2205||evidence.assetsDigest!==hash(JSON.stringify(plan.preview.assets))||evidence.origin!=='https://proshnobook.com')throw Error('Explicit pinned authorization and live assets required');
 const now=new Date().toISOString(),prefix=`ssc-physics-release:v1:${digest}`;
 const expected=new Map(plan.records.map(q=>[q.id,q])),targetIds=[...expected.keys()];
 // Stage 1: pending import only. Fail closed on alias/legacy duplicates, do not overwrite.
 const imported=await retry(db,async tx=>{
  const existing=await tx.question.findMany({where:{category:{in:plan.aliases},subject:'পদার্থবিজ্ঞান',topic:{in:Object.values(plan.preview.chapters).map(c=>c.topic)}}});
  const byId=new Map(existing.map(q=>[q.id,q])),byStem=new Map();for(const q of existing){const key=q.topic+'\n'+plan.normalizeStem(q.text);byStem.set(key,[...(byStem.get(key)||[]),q]);}
  const pending=[];
  for(const row of plan.records){const old=byId.get(row.id),matches=byStem.get(row.topic+'\n'+plan.normalizeStem(row.text))||[];
   if(matches.some(q=>q.id!==row.id))throw Error('Legacy/alias duplicate; manual review required');
   if(old){if(!equalRow(old,row))throw Error('Canonical content or provenance changed');}else pending.push({...row,approved:false});
  }
  for(let i=0;i<pending.length;i+=200)await tx.question.createMany({data:pending.slice(i,i+200)});
  for(const s of plan.scopes){const key=`preparedimport:v1:${s.digest}`;if(!await tx.setting.findUnique({where:{key}}))await tx.setting.create({data:{key,value:JSON.stringify({actorId:actor,createdAt:now,batchId:s.batch.id,category:s.batch.category,subject:s.batch.subject,topic:s.batch.topic,provenance:s.batch.provenance,limitations:s.batch.limitations,ids:s.records.map(q=>q.id),skipped:0,releaseDigest:digest,authorization:'OWNER_EXPLICIT_PENDING_IMPORT'})}});}
  await tx.setting.create({data:{key:prefix+':import:'+hash(actor+now),value:JSON.stringify({actor,createdAt:now,digest,inserted:pending.length,canonicalCount:6400,ids:targetIds})}});
  return {inserted:pending.length};
 });
 // Stage 2: all 6400 approvals in one serializable transaction, exact snapshots.
 // No default-app route/build or broad subject-wide approval is installed.
 return retry(db,async tx=>{
  const scoped=await tx.question.findMany({where:{category:{in:plan.aliases},subject:'পদার্থবিজ্ঞান',topic:{in:Object.values(plan.preview.chapters).map(c=>c.topic)}}});
  const pinnedStems=new Set(plan.records.map(q=>q.topic+'\n'+plan.normalizeStem(q.text)));
  if(scoped.some(q=>!expected.has(q.id)&&pinnedStems.has(q.topic+'\n'+plan.normalizeStem(q.text))))throw Error('Concurrent alias duplicate; manual review required');
  const before=await tx.question.findMany({where:{id:{in:targetIds}}});
  if(before.length!==6400||before.some(q=>!equalRow(q,expected.get(q.id))))throw Error('Approval snapshot changed');
  const previous=before.filter(q=>q.approved).length;
  const changed=await tx.question.updateMany({where:{id:{in:targetIds},category:'Class 9',subject:'পদার্থবিজ্ঞান',approved:false},data:{approved:true}});
  const after=await tx.question.findMany({where:{id:{in:targetIds}}});
  if(after.length!==6400||after.some(q=>!q.approved||!equalRow(q,expected.get(q.id)))||changed.count+previous!==6400)throw Error('Incomplete approval');
  const result={status:'OWNER_APPROVED_PUBLICATION_VERIFIED',digest,actor,createdAt:now,insertedPending:imported.inserted,newlyApproved:changed.count,previouslyApproved:previous,approvedCanonical:6400,counts:plan.preview.counts,chapters:plan.preview.chapters,illustrated:2205,liveAssets:evidence,approvalBasis:plan.preview.approvalBasis,teacherCertified:false,fullTextbookAndSyllabusAlignment:false,numericVariants:true,physicsAutoModelEnabled:false};
  await tx.setting.create({data:{key:prefix+':approval:'+hash(actor+now),value:JSON.stringify({...result,approvedIds:targetIds,newlyApprovedIds:before.filter(q=>!q.approved).map(q=>q.id)})}});
  return result;
 });
}
async function main(){
 const mode=process.argv[2];if(!['preview','publish'].includes(mode))throw Error('Choose explicit mode');const plan=prepare();
 if(mode==='preview'){console.log(JSON.stringify({digest:plan.digest,...plan.preview},null,2));return;}
 if(process.env.VERCEL_ENV!=='production'||!process.env.DATABASE_URL||process.env.VERCEL_PROJECT_ID!=='prj_gJuVKTIvUtieGaJr7mitBHdC05Ze')throw Error('Authorized production project required');
 if(process.argv[3]!==plan.digest||process.argv[4]!==ACK)throw Error('Pinned command required');
 const evidence=await verifyLiveAssets(plan);console.log('SSC_PHYSICS_LIVE_ASSETS_VERIFIED '+JSON.stringify(evidence));
 const {PrismaClient}=require('@prisma/client'),db=new PrismaClient();
 try{console.log('SSC_PHYSICS_RELEASE_RECEIPT '+JSON.stringify(await publish(db,plan,process.argv[3],`vercel-owner-release:${process.env.VERCEL_GIT_COMMIT_SHA||''}`,process.argv[4],evidence)));}finally{await db.$disconnect();}
}
module.exports={prepare,publish,verifyLiveAssets,equalRow,ACK,load};
if(require.main===module)main().catch(e=>{console.error('SSC_PHYSICS_RELEASE_STOPPED; successful approval NOT confirmed; code='+(e.code||'VALIDATION_OR_CONTEXT_FAILURE'));process.exitCode=1;});
