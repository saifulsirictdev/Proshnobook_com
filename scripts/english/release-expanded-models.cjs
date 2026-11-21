#!/usr/bin/env node
// One explicitly owner-authorized release, never installed as a build hook.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),{createHash}=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const SCOPES=[6,7,8,10,11,12].flatMap(grade=>[1,2].map(paper=>({grade,paper})));
const WRITE_SCOPES=SCOPES.filter(s=>!(s.grade===8&&s.paper===2));
const ACK='APPROVE_REVIEWED_EXPANDED_ENGLISH_MODELS_V1';
const FROZEN='51fd0af358c17e3f6a20c9e5b57ae48e5c23f483ee9ab5186dddf589b44d080d';
const AUDIT_KEY='english-expanded-model-release:v1:'+FROZEN;
const CLASS8_DIGEST='30d8da8ae12003fc189241ba961e92e8cfd050f39d10d62ad171c9b4c1ba5b8c';
const content=items=>items.map(p=>({key:p.key,draft:p.draft,...('review' in p?{review:p.review}:{})}));
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
function load(){
 const ts=require('typescript'),orig=Module._resolveFilename;
 Module._resolveFilename=function(id,parent,...rest){return orig.call(this,id.startsWith('@/')?path.join(root,id.slice(2)):id,parent,...rest)};
 require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
 return require(path.join(root,'lib/english/prepared-items.ts'));
}
function prepare(lib=load()){
 const items=WRITE_SCOPES.flatMap(s=>lib.preparedEnglishItems(s.grade,s.paper));
 const readOnly=lib.preparedEnglishItems(8,2);
 const digest=hash(items.map(p=>({key:p.key,draft:p.draft,...('review' in p?{review:p.review}:{})})));
 if(items.length!==1144||new Set(items.map(p=>p.key)).size!==1144||readOnly.length!==440||hash(content(readOnly))!==CLASS8_DIGEST||
    items.some(p=>!p.draft.selection.includeAnswers||!WRITE_SCOPES.some(s=>s.grade===p.draft.selection.grade&&s.paper===p.draft.selection.paper)))throw Error('Expanded scope mismatch');
 return {items,readOnly,digest};
}
function assertPlan(plan,digest,ack){
 if(ack!==ACK||digest!==FROZEN||plan.digest!==FROZEN||plan.readOnly.length!==440||hash(content(plan.readOnly))!==CLASS8_DIGEST||hash(plan.items.map(p=>({key:p.key,draft:p.draft,...('review' in p?{review:p.review}:{})})))!==FROZEN)throw Error('Frozen content/explicit release consent required');
}
function expected(record,p){
 return record && JSON.stringify(record.draft)===JSON.stringify(p.draft) &&
  JSON.stringify(record.review??null)===JSON.stringify('review' in p?p.review:null);
}
async function inspect(tx,plan){
 const keys=plan.items.map(p=>p.key),rows=await tx.setting.findMany({where:{key:{in:keys}}});
 const map=new Map(rows.map(r=>[r.key,r]));
 const receipt=await tx.setting.findUnique({where:{key:AUDIT_KEY}});
 const counts={missing:0,pending:0,approved:0};
 for(const p of plan.items){
  const row=map.get(p.key);if(!row){counts.missing++;continue;}
  const r=JSON.parse(row.value);
  // Existing approvals/rejections/reopened decisions are never overwritten.
  if(!expected(r,p)||!['PENDING','APPROVED'].includes(r.status)||r.previousDecision)throw Error('Existing content/decision conflicts with reviewed release; no overwrite');
  counts[r.status==='PENDING'?'pending':'approved']++;
 }
 if(receipt){const r=JSON.parse(receipt.value);if(r.status!=='EXPANDED_ENGLISH_APPROVAL_VERIFIED'||r.digest!==FROZEN||counts.approved!==1144)throw Error('Release changed or revoked; fresh review required');}
 // Previously released Class8 rows are verification-only, never write targets.
 const originals=await tx.setting.findMany({where:{key:{in:plan.readOnly.map(p=>p.key)}}});
 const originalMap=new Map(originals.map(r=>[r.key,JSON.parse(r.value)]));
 if(originals.length!==440||plan.readOnly.some(p=>{const r=originalMap.get(p.key);return r?.status!=='APPROVED'||!expected(r,p)}))throw Error('Previously released Class8 stock missing/changed/revoked');
 return {counts,map,alreadyApplied:!!receipt};
}
async function preview(db,plan=prepare()){
 if(plan.digest!==FROZEN)throw Error('Frozen preview mismatch');
 return db.$transaction(async tx=>{const s=await inspect(tx,plan);return {status:'EXPANDED_ENGLISH_APPROVAL_PREVIEW',digest:FROZEN,targets:1144,class8ReadOnly:440,...s.counts,alreadyApplied:s.alreadyApplied,scopes:WRITE_SCOPES.map(({grade,paper})=>({grade,paper,items:plan.items.filter(p=>p.draft.selection.grade===grade&&p.draft.selection.paper===paper).length}))}},{isolationLevel:'Serializable',timeout:600000});
}
async function release(db,plan,digest,ack,now=new Date().toISOString()){
 assertPlan(plan,digest,ack);
 return db.$transaction(async tx=>{
  const before=await inspect(tx,plan);
  if(before.alreadyApplied)return {status:'EXPANDED_ENGLISH_APPROVAL_VERIFIED',digest:FROZEN,verified:1144,inserted:0,approved:0,preserved:1144,alreadyApplied:true};
  const actor='owner-authorized:arena:reviewed-practice-models';
  const missing=plan.items.filter(p=>!before.map.has(p.key));
  const inserted=missing.map(p=>({key:p.key,value:JSON.stringify({status:'PENDING',draft:p.draft,group:p.group,...('review' in p?{review:p.review}:{}),importedBy:actor,importedAt:now,authorization:'OWNER_EXPLICIT_FINISH_ALL_REVIEWED_MODELS'})}));
  if(inserted.length){const r=await tx.setting.createMany({data:inserted});if(r.count!==inserted.length)throw Error('Incomplete Pending import; rollback');}
  const pending=new Map([...before.map].filter(([,r])=>JSON.parse(r.value).status==='PENDING').map(([k,r])=>[k,r.value]));
  for(const row of inserted)pending.set(row.key,row.value);
  for(const [key,value] of pending){
   const record=JSON.parse(value);
   const r=await tx.setting.updateMany({where:{key,value},data:{value:JSON.stringify({...record,status:'APPROVED',reviewedBy:actor,reviewedAt:now,authorization:'OWNER_EXPLICIT_FINISH_ALL_REVIEWED_MODELS'})}});
   if(r.count!==1)throw Error('Concurrent decision changed; rollback');
  }
  const after=await inspect(tx,plan);
  if(after.counts.approved!==1144||after.counts.pending||after.counts.missing)throw Error('Expanded approval verification failed');
  const receipt={status:'EXPANDED_ENGLISH_APPROVAL_VERIFIED',digest:FROZEN,targets:1144,verified:1144,inserted:inserted.length,approved:pending.size,preserved:before.counts.approved,class8ReadOnly:440,keysSha256:hash(plan.items.map(p=>p.key).sort()),reviewedBy:actor,reviewedAt:now,limitations:'Owner approval, not independent teacher/official certification. Distinct quantity is not inferred from aliases or rotations.'};
  await tx.setting.create({data:{key:AUDIT_KEY,value:JSON.stringify(receipt)}});
  return {...receipt,alreadyApplied:false};
 },{isolationLevel:'Serializable',timeout:600000});
}
async function verifyAutoModels(db,plan=prepare()){
 const {approvedEnglishItem,assembleEnglishItems}=require(path.join(root,'lib/english/item-bank.ts'));
 const {validateEnglishOutput}=require(path.join(root,'lib/english/generation.ts'));
 const all=[...plan.items,...plan.readOnly],rows=await db.setting.findMany({where:{key:{in:all.map(p=>p.key)}}});
 const map=new Map(rows.map(r=>[r.key,r.value])),scopes=[];
 for(const {grade,paper} of SCOPES){
  const targets=all.filter(p=>p.draft.selection.grade===grade&&p.draft.selection.paper===paper);
  const stock=targets.map(p=>approvedEnglishItem(map.get(p.key)||'',grade,paper));
  if(stock.some(d=>!d))throw Error('Missing approved exact-grade stock');
  let tasks=0,total=0;
  for(let i=0;i<40;i++){
   const r=assembleEnglishItems(stock,grade,()=>(i+0.5)/40,undefined,{},paper);
   if(!r.draft||r.missing.length)throw Error('Database model assembly failed');
   tasks=r.draft.output.tasks.length;total=validateEnglishOutput(r.draft.selection,r.draft.output).total;
   if(total!==(grade<=8&&paper===2?50:100))throw Error('Invalid model marks');
  }
  scopes.push({grade,paper,stock:stock.length,models:40,tasks,totalMarks:total,missing:0,providerCalls:0});
 }
 return {status:'EXPANDED_ENGLISH_AUTO_MODELS_VERIFIED',models:480,providerCalls:0,scopes,limitations:'Deterministic assemblies are rotations, not 480 distinct authored papers.'};
}
async function main(){
 const mode=process.argv[2];if(!['manifest','preview','approve','verify'].includes(mode))throw Error('Choose manifest, preview, approve or verify');
 const plan=prepare();
 if(mode==='manifest'){console.log(JSON.stringify({digest:plan.digest,targets:plan.items.length,class8ReadOnly:plan.readOnly.length}));return;}
 if(plan.digest!==FROZEN)throw Error('Frozen manifest mismatch');
 if(mode==='approve')assertPlan(plan,process.env.EXPANDED_ENGLISH_DIGEST,process.env.EXPANDED_ENGLISH_ACK);
 const {PrismaClient}=require('@prisma/client'),db=new PrismaClient();
 try{if(mode==='verify')console.log(JSON.stringify(await verifyAutoModels(db,plan)));else{console.log(JSON.stringify(await preview(db,plan)));if(mode==='approve'){console.log(JSON.stringify(await release(db,plan,process.env.EXPANDED_ENGLISH_DIGEST,process.env.EXPANDED_ENGLISH_ACK)));console.log(JSON.stringify(await verifyAutoModels(db,plan)));}}}finally{await db.$disconnect();}
}
module.exports={SCOPES,WRITE_SCOPES,ACK,FROZEN,AUDIT_KEY,prepare,preview,release,verifyAutoModels};
if(require.main===module)main().catch(()=>{console.error('Expanded English release stopped; no successful approval/release confirmed. Credentials and question text are not logged.');process.exitCode=1;});
