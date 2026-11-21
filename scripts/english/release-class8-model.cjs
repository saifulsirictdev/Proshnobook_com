#!/usr/bin/env node
// Explicit owner-authorized structured-model release only. Never a normal build hook.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),{createHash}=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const DIGEST='30d8da8ae12003fc189241ba961e92e8cfd050f39d10d62ad171c9b4c1ba5b8c';
const ACK='APPROVE_C8_MODEL_440';
const AUDIT_KEY=`english-class8-reference-release:v1:${DIGEST}`;
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
function load(){
  const ts=require('typescript'),original=Module._resolveFilename;
  Module._resolveFilename=function(id,parent,...rest){return original.call(this,id.startsWith('@/')?path.join(root,id.slice(2)):id,parent,...rest);};
  require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
  return require(path.join(root,'lib/english/prepared-class8-paper2.ts'));
}
function prepare(lib=load()){
  const items=lib.preparedClass8Paper2Items(8),digest=lib.class8StructuredDigest();
  if(digest!==DIGEST || hash(items.map(p=>({key:p.key,draft:p.draft,review:p.review})))!==DIGEST || items.length!==440 || new Set(items.map(p=>p.key)).size!==440 || new Set(items.map(p=>p.review.originalQuestionId)).size!==440 || items.some(p=>p.draft.selection.grade!==8 || p.draft.selection.paper!==2 || p.draft.selection.modelStyle!=='class8-reference-v1'))throw Error('Frozen structured scope mismatch');
  const original=require('./approve-class8-english2.cjs').targets();
  if(original.ids.some(id=>!items.some(p=>p.review.originalQuestionId===id)))throw Error('Original question identity mismatch');
  return {items,digest,originalRows:original.rows};
}
async function snapshot(tx,plan){
  const originals=await tx.question.findMany({where:{id:{in:plan.originalRows.map(r=>r.id)}}});
  const byId=new Map(originals.map(r=>[r.id,r]));
  if(originals.length!==440 || plan.originalRows.some(r=>!byId.get(r.id)?.approved || Object.entries(r).some(([k,v])=>JSON.stringify(byId.get(r.id)[k])!==JSON.stringify(v))))throw Error('Original approved SQ records changed or revoked; fresh review required');
  const rows=await tx.setting.findMany({where:{key:{in:plan.items.map(p=>p.key)}}});
  const audit=await tx.setting.findUnique({where:{key:AUDIT_KEY}});
  if(!audit && rows.length)throw Error('A structured target already has a decision; never overwrite it');
  if(audit){
    const a=JSON.parse(audit.value);
    if(a.status!=='CLASS8_STRUCTURED_APPROVAL_VERIFIED' || a.digest!==DIGEST || a.verified!==440)throw Error('Invalid structured release receipt');
    const map=new Map(rows.map(r=>[r.key,r.value]));
    if(rows.length!==440 || plan.items.some(p=>{
      const r=JSON.parse(map.get(p.key)||'null');return !r || r.status!=='APPROVED' || JSON.stringify(r.draft)!==JSON.stringify(p.draft) || JSON.stringify(r.review)!==JSON.stringify(p.review);
    }))throw Error('Structured decision/content changed since release; no automatic revival');
  }
  return {alreadyApplied:Boolean(audit),existing:rows.length};
}
async function preview(db,plan=prepare()){
  return db.$transaction(async tx=>({status:'CLASS8_STRUCTURED_APPROVAL_PREVIEW',digest:DIGEST,targets:440,originalsVerified:440,...await snapshot(tx,plan)}),{isolationLevel:'Serializable',timeout:120000});
}
async function release(db,plan,digest,ack,now=new Date().toISOString()){
  if(ack!==ACK || digest!==DIGEST || plan.digest!==DIGEST || hash(plan.originalRows)!=='ac91f248e33d506827a017778a87c35bf1685a56ea84e51351df74e1f50bb44a' || hash(plan.items.map(p=>({key:p.key,draft:p.draft,review:p.review})))!==DIGEST)throw Error('Explicit reviewed model-release consent/digest required');
  return db.$transaction(async tx=>{
    const before=await snapshot(tx,plan);
    if(before.alreadyApplied)return {status:'CLASS8_STRUCTURED_APPROVAL_VERIFIED',digest:DIGEST,inserted:0,approved:0,verified:440,alreadyApplied:true};
    for(const p of plan.items){
      const record={status:'PENDING',draft:p.draft,review:p.review,actor:'owner:arena:model-format-then-approve',authorization:'OWNER_EXPLICIT_CREATE_MODEL_FORMAT_THEN_APPROVE',createdAt:now};
      const pending=JSON.stringify(record);
      await tx.setting.create({data:{key:p.key,value:pending}});
      const result=await tx.setting.updateMany({where:{key:p.key,value:pending},data:{value:JSON.stringify({...record,status:'APPROVED',approvedAt:now})}});
      if(result.count!==1)throw Error('Concurrent structured decision changed; rollback required');
    }
    const rows=await tx.setting.findMany({where:{key:{in:plan.items.map(p=>p.key)}}});
    const map=new Map(rows.map(r=>[r.key,JSON.parse(r.value)]));
    if(rows.length!==440 || plan.items.some(p=>{const r=map.get(p.key);return r?.status!=='APPROVED' || JSON.stringify(r.draft)!==JSON.stringify(p.draft) || JSON.stringify(r.review)!==JSON.stringify(p.review);}))throw Error('Structured release verification failed');
    // Ensure source records were not affected. All existing target decisions are create-only.
    await snapshot(tx,{...plan,items:[]});
    const receipt={status:'CLASS8_STRUCTURED_APPROVAL_VERIFIED',digest:DIGEST,inserted:440,approved:440,verified:440,originalsVerified:440,actor:'owner:arena:model-format-then-approve',authorization:'OWNER_EXPLICIT_CREATE_MODEL_FORMAT_THEN_APPROVE',approvedAt:now,keysSha256:hash(plan.items.map(p=>p.key).sort()),limitations:'Owner approval, not independent teacher/official certification. Original SQ rows and historical receipts are unchanged.'};
    await tx.setting.create({data:{key:AUDIT_KEY,value:JSON.stringify(receipt)}});
    return {...receipt,alreadyApplied:false};
  },{isolationLevel:'Serializable',timeout:120000});
}
async function verifyAutoModels(db,plan=prepare()){
  const {approvedEnglishItem,assembleEnglishItems}=require(path.join(root,'lib/english/item-bank.ts'));
  const rows=await db.setting.findMany({where:{key:{in:plan.items.map(p=>p.key)}}});
  const stock=rows.map(r=>approvedEnglishItem(r.value,8,2));
  if(stock.length!==440 || stock.some(d=>!d))throw Error('Structured stock missing or invalid');
  for(let i=0;i<40;i++){
    const r=assembleEnglishItems(stock,8,()=>(i+0.5)/40,undefined,{},2);
    if(!r.draft || r.missing.length || r.draft.output.tasks.length!==8 || r.draft.selection.modelStyle!=='class8-reference-v1')throw Error('Database automatic model assembly failed');
  }
  return {status:'CLASS8_AUTO_MODEL_VERIFIED',models:40,tasksPerModel:8,totalMarks:50,missing:0,providerCalls:0};
}
async function main(){
  const mode=process.argv[2];if(!['preview','approve'].includes(mode))throw Error('Choose preview or approve');
  if(mode==='approve'&&(process.env.C8_MODEL_ACK!==ACK || process.env.C8_MODEL_DIGEST!==DIGEST))throw Error('Missing explicit structured-release consent');
  const plan=prepare();const {PrismaClient}=require('@prisma/client'),db=new PrismaClient();
  try{console.log(JSON.stringify(await preview(db,plan)));if(mode==='approve'){console.log(JSON.stringify(await release(db,plan,process.env.C8_MODEL_DIGEST,process.env.C8_MODEL_ACK)));console.log(JSON.stringify(await verifyAutoModels(db,plan)));}}finally{await db.$disconnect();}
}
module.exports={DIGEST,ACK,AUDIT_KEY,prepare,preview,release,verifyAutoModels};
if(require.main===module)main().catch(()=>{console.error('Class 8 structured release stopped. No successful release confirmed; no credentials logged.');process.exitCode=1;});
