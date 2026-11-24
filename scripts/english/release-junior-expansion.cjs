#!/usr/bin/env node
// Explicit owner-authorized latest-64 release only. Never a permanent build hook.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),{createHash}=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const ACK='APPROVE_LATEST_64_JUNIOR_GROUPS_V1';
const FROZEN='980e288a9823e3d9a8654ec516213c222c632d81ab2ef4622e50efbcc8f52753';
const AUDIT_KEY='english-junior-expansion-release:v1:'+FROZEN;
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const content=items=>items.map(p=>({key:p.key,draft:p.draft,group:p.group,...('review' in p?{review:p.review}:{})}));
function load(){
 const ts=require('typescript'),original=Module._resolveFilename;
 Module._resolveFilename=function(id,parent,...rest){return original.call(this,id.startsWith('@/')?path.join(root,id.slice(2)):id,parent,...rest);};
 require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
 return require(path.join(root,'lib/english/prepared-junior-paper2-expansion.ts'));
}
function prepare(lib=load()){
 const historical=require('./release-expanded-models.cjs'),old=historical.prepare();
 if(old.digest!==historical.FROZEN)throw Error('Historical manifest changed');
 const items=[6,7].flatMap(grade=>lib.preparedJuniorPaper2ExpansionItems(grade));
 const readOnly=[...old.items,...old.readOnly];
 if(items.length!==64||new Set(items.map(p=>p.key)).size!==64||readOnly.length!==1584||items.some(p=>
   ![6,7].includes(p.draft.selection.grade)||p.draft.selection.paper!==2||!p.draft.selection.includeAnswers||p.review.batch!=='junior-paper2-expansion-01'||readOnly.some(old=>old.key===p.key)))throw Error('Latest-64 scope mismatch');
 return {items,readOnly,digest:hash(content(items))};
}
function assertPlan(plan,digest,ack){
 if(digest!==FROZEN||ack!==ACK||plan.digest!==FROZEN||hash(content(plan.items))!==FROZEN||plan.items.length!==64||plan.readOnly.length!==1584)throw Error('Frozen manifest and explicit latest-64 approval consent required');
 // Re-derive both manifests so a caller cannot substitute other targets/read-only guards.
 const actual=prepare();if(hash(content(plan.readOnly))!==hash(content(actual.readOnly)))throw Error('Read-only scope changed');
}
function expected(record,item){return !!record&&JSON.stringify(record.draft)===JSON.stringify(item.draft)&&JSON.stringify(record.review??null)===JSON.stringify(item.review??null);}
async function inspect(tx,plan){
 const rows=await tx.setting.findMany({where:{key:{in:plan.items.map(p=>p.key)}}}),map=new Map(rows.map(r=>[r.key,r]));
 const counts={missing:0,pending:0,approved:0};
 for(const item of plan.items){
  if(!map.has(item.key)){counts.missing++;continue;}
  const record=JSON.parse(map.get(item.key).value);
  if(!expected(record,item)||!['PENDING','APPROVED'].includes(record.status)||record.previousDecision)throw Error('Latest-64 content or prior decision conflict; no overwrite');
  counts[record.status==='APPROVED'?'approved':'pending']++;
 }
 const originals=await tx.setting.findMany({where:{key:{in:plan.readOnly.map(p=>p.key)}}}),originalsMap=new Map(originals.map(r=>[r.key,JSON.parse(r.value)]));
 if(originals.length!==1584||plan.readOnly.some(p=>{const r=originalsMap.get(p.key);return r?.status!=='APPROVED'||!expected(r,p);}))throw Error('Previously approved stock changed or revoked; read-only guard stopped release');
 const receipt=await tx.setting.findUnique({where:{key:AUDIT_KEY}});
 if(receipt){const r=JSON.parse(receipt.value);if(r.status!=='JUNIOR_ENGLISH_APPROVAL_VERIFIED'||r.digest!==FROZEN||counts.approved!==64)throw Error('Previous release was changed or revoked; fresh review required');}
 const readOnlyHash=hash([...originals].sort((a,b)=>a.key.localeCompare(b.key)));
 return {map,counts,alreadyApplied:!!receipt,readOnlyHash};
}
async function preview(db,plan=prepare()){
 if(plan.digest!==FROZEN)throw Error('Frozen preview mismatch');
 return db.$transaction(async tx=>{const result=await inspect(tx,plan);return {status:'JUNIOR_ENGLISH_APPROVAL_PREVIEW',digest:FROZEN,targets:64,priorApprovedReadOnly:1584,...result.counts,alreadyApplied:result.alreadyApplied};},{isolationLevel:'Serializable',timeout:600000});
}
async function release(db,plan,digest,ack,now=new Date().toISOString()){
 assertPlan(plan,digest,ack);
 return db.$transaction(async tx=>{
  const before=await inspect(tx,plan);
  if(before.alreadyApplied)return {status:'JUNIOR_ENGLISH_APPROVAL_VERIFIED',digest:FROZEN,verified:64,inserted:0,approved:0,preserved:64,priorApprovedReadOnly:1584,alreadyApplied:true};
  const actor='owner-authorized:arena:latest-64-junior-groups';
  const authorization='USER_EXPLICIT_APPROVE_LATEST_64_JUNIOR_GROUPS';
  const missing=plan.items.filter(p=>!before.map.has(p.key)).map(p=>({key:p.key,value:JSON.stringify({status:'PENDING',draft:p.draft,group:p.group,review:p.review,importedBy:actor,importedAt:now,authorization})}));
  if(missing.length){const result=await tx.setting.createMany({data:missing});if(result.count!==missing.length)throw Error('Incomplete Pending import; rollback');}
  const pending=new Map([...before.map].filter(([,r])=>JSON.parse(r.value).status==='PENDING').map(([key,r])=>[key,r.value]));
  for(const row of missing)pending.set(row.key,row.value);
  for(const [key,value]of pending){
   const record=JSON.parse(value),result=await tx.setting.updateMany({where:{key,value},data:{value:JSON.stringify({...record,status:'APPROVED',reviewedBy:actor,reviewedAt:now,authorization,independentTeacherAttestation:false})}});
   if(result.count!==1)throw Error('Concurrent content or review decision; rollback');
  }
  const after=await inspect(tx,plan);
  if(after.counts.approved!==64||after.counts.pending||after.counts.missing||after.readOnlyHash!==before.readOnlyHash)throw Error('Approval/read-only verification failed; rollback');
  const receipt={status:'JUNIOR_ENGLISH_APPROVAL_VERIFIED',digest:FROZEN,verified:64,inserted:missing.length,approved:pending.size,preserved:before.counts.approved,priorApprovedReadOnly:1584,keysSha256:hash(plan.items.map(p=>p.key).sort()),reviewedBy:actor,reviewedAt:now,authorization,independentTeacherAttestation:false,limitations:'Owner-authorized approval of assistant-authored suggested keys; not independent teacher or official board certification. Five authored sets per junior item including baseline, not fifty.'};
  await tx.setting.create({data:{key:AUDIT_KEY,value:JSON.stringify(receipt)}});
  return {...receipt,alreadyApplied:false};
 },{isolationLevel:'Serializable',timeout:600000});
}
async function verify(db,plan=prepare()){
 const {approvedEnglishItem,assembleEnglishItems}=require(path.join(root,'lib/english/item-bank.ts')),{validateEnglishOutput}=require(path.join(root,'lib/english/generation.ts'));
 return db.$transaction(async tx=>{
  await inspect(tx,plan);
  const rows=await tx.setting.findMany({where:{key:{in:[...plan.items,...plan.readOnly.filter(p=>[6,7].includes(p.draft.selection.grade)&&p.draft.selection.paper===2)].map(p=>p.key)}}});
  const scopes=[6,7].map(grade=>{
   const stock=rows.map(row=>approvedEnglishItem(row.value,grade,2)).filter(Boolean);
   if(stock.length!==40)throw Error('Exact approved junior scope incomplete');
   const perItem=Object.fromEntries(require(path.join(root,'lib/english/blueprints.ts')).englishBlueprint(grade,2).items.map(item=>[item.id,stock.filter(d=>d.output.tasks.some(t=>t.id===item.id)).length]));
   if(Object.values(perItem).some(count=>count!==5))throw Error('Expected five approved sets per item');
   for(let i=0;i<40;i++){const model=assembleEnglishItems(stock,grade,()=>i/40,undefined,{},2).draft;if(!model||validateEnglishOutput(model.selection,model.output).total!==50)throw Error('Approved full-model assembly failed');}
   return {grade,paper:2,approvedGroups:40,newApprovedGroups:32,perItem,verifiedAssemblies:40,marks:50};
  });
  return {status:'JUNIOR_ENGLISH_AUTO_MODELS_VERIFIED',digest:FROZEN,scopes,providerCalls:0,limitations:'Assembly rotations are not distinct authored papers.'};
 },{isolationLevel:'Serializable',timeout:600000});
}
async function main(){
 const mode=process.argv[2];if(!['manifest','preview','approve','verify'].includes(mode))throw Error('Choose manifest, preview, approve or verify');
 const plan=prepare();
 if(mode==='manifest'){console.log(JSON.stringify({digest:plan.digest,targets:64,priorApprovedReadOnly:1584}));return;}
 if(plan.digest!==FROZEN)throw Error('Frozen manifest mismatch');
 if(mode==='approve')assertPlan(plan,process.env.JUNIOR_ENGLISH_DIGEST,process.env.JUNIOR_ENGLISH_ACK);
 const {PrismaClient}=require('@prisma/client'),db=new PrismaClient();
 try{
  if(mode==='verify')console.log(JSON.stringify(await verify(db,plan)));
  else{console.log(JSON.stringify(await preview(db,plan)));if(mode==='approve'){console.log(JSON.stringify(await release(db,plan,process.env.JUNIOR_ENGLISH_DIGEST,process.env.JUNIOR_ENGLISH_ACK)));console.log(JSON.stringify(await verify(db,plan)));}}
 }finally{await db.$disconnect();}
}
module.exports={ACK,FROZEN,AUDIT_KEY,prepare,preview,release,verify};
if(require.main===module)main().catch(()=>{console.error('Latest-64 junior release stopped; successful approval not confirmed. Credentials and question text are not logged.');process.exitCode=1;});
