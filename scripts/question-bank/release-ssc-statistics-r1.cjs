#!/usr/bin/env node
// Explicit operator task ONLY. Never imported by the app, normal build or Parse.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),{createHash}=require('node:crypto');
const ROOT=path.resolve(__dirname,'../..'),BASE='content/question-bank/ssc/math/chapter-17/',FULL=BASE+'restart-r1/full600/';
const ACK='APPROVE_ONLY_REVISED_600_SSC_STATISTICS_R1_WITH_BACKUP';
const SUBJECT='গণিত',TOPIC='১৭শ অধ্যায়: পরিসংখ্যান';
const bytesHash=b=>createHash('sha256').update(b).digest('hex');
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'&&!(v instanceof Date)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const hash=v=>bytesHash(JSON.stringify(stable(v)));
const fields=['id','category','subject','topic','lang','text','options','correct','explanation','difficulty','source'];
const canonical=q=>Object.fromEntries(fields.map(k=>[k,q[k]]));
const equal=(a,b)=>!!a&&!!b&&hash(canonical(a))===hash(canonical(b));
const ordered=rows=>rows.map(q=>JSON.parse(JSON.stringify(q))).sort((a,b)=>a.id.localeCompare(b.id));
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
function load(){
 const ts=require('typescript'),resolve=Module._resolveFilename,extension=require.extensions['.ts'];
 Module._resolveFilename=function(id,parent,...rest){return resolve.call(this,id.startsWith('@/')?path.join(ROOT,id.slice(2)):id,parent,...rest)};
 require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
 try{return {...require(path.join(ROOT,'lib/question-json-import.ts')),...require(path.join(ROOT,'lib/mcq-import.ts')),...require(path.join(ROOT,'lib/paper-generation.ts')),...require(path.join(ROOT,'lib/ssc-math-batches.ts')),...require(path.join(ROOT,'lib/question-tables.ts'))};}
 finally{Module._resolveFilename=resolve;require.extensions['.ts']=extension;}
}
function prepare(api=load()){
 const m=read(FULL+'manifest.json'),backup=read(FULL+'backup-receipt.json');
 if(!backup.driveVerified||!backup.independentDriveMetadataRead||backup.sha256!=='e88c9c401a24d6dd8d1b620fbd8866867f0a51198d8021658c5ef5858d6c2f30'||backup.drive.fileId!=='1mCfhZSp2t-pNbJXksIEcUw_hl9zZQ166')throw Error('Verified full600 content backup required');
 const selection={category:'Class 9',subject:SUBJECT,group:'',topic:TOPIC},slices=[],records=[],old=new Map(),seen=new Set();
 for(const f of m.files){
  if(!new RegExp('^'+FULL+'(?:mcq-[12]|cq-[12]|sq)\\.json$').test(f.file))throw Error('Non-statistics payload');
  const raw=fs.readFileSync(path.join(ROOT,f.file));if(bytesHash(raw)!==f.sha256)throw Error('Pinned payload changed');
  const p=api.parseQuestionUpload(raw.toString(),selection);if(p.records.length!==f.count)throw Error('Slice count mismatch');
  slices.push({file:f.file,digest:p.digest,count:f.count});
  for(const q of p.records){const stem=api.normalizeStem(q.text);if(seen.has(stem))throw Error('Duplicate release stem');seen.add(stem);records.push({...q,category:'Class 9',subject:SUBJECT,topic:TOPIC,lang:'Bangla',source:`JSON_UPLOAD_DRAFT:${p.digest}`});}
 }
 if(records.length!==600||slices.length!==5||JSON.stringify(m.reconstructed)!==JSON.stringify({MCQ:300,CQ:200,SQ:100}))throw Error('Exact 600 scope required');
 for(const name of ['mcq-1','mcq-2','cq-1','cq-2','sq']){
  const p=api.parseQuestionUpload(fs.readFileSync(path.join(ROOT,BASE+'target-v1/'+name+'.json'),'utf8'),selection);
  for(const q of p.records)old.set(q.id,{...q,category:'Class 9',subject:SUBJECT,topic:TOPIC,lang:'Bangla',source:`JSON_UPLOAD_DRAFT:${p.digest}`});
 }
 // Exact old prepared IDs/source digests, not a subject-wide update or stem guess.
 for(const b of api.sscMathBatches().filter(b=>b.topic===TOPIC)){
  const digest=bytesHash(JSON.stringify(b));
  for(const q of b.records){const id='prepared_'+bytesHash(JSON.stringify([b.category,b.subject,b.topic,q.kind,api.normalizeStem(q.text)]));old.set(id,{id,category:b.category,subject:b.subject,topic:b.topic,lang:b.lang,text:q.text,options:q.options,correct:q.correct,explanation:q.explanation,difficulty:q.difficulty,source:`PREPARED_DRAFT:${digest}`});}
 }
 const assets=m.graphs.map(g=>{
  if(!/^public\/question-bank\/ssc-math-ch17-v1\/r1-cq-\d{3}-(polygon|less|more|histogram)\.svg$/.test(g.file))throw Error('Unexpected asset');
  const raw=fs.readFileSync(path.join(ROOT,g.file));if(bytesHash(raw)!==g.sha256||/<script|foreignObject|href=|\bon\w+=/i.test(raw))throw Error('Unsafe/changed SVG');
  const url='https://proshnobook.com/'+g.file.slice(7);if(!api.questionBlocks(`![graph](${url})`).some(b=>b.kind==='statistics-image'))throw Error('Renderer missing');
  return {url,sha256:g.sha256};
 });
 if(assets.length!==57)throw Error('Expected 57 graphs');
 const preview={scope:selection,counts:m.reconstructed,slices,assets,contentBackup:backup.drive.fileId,contentArchiveSha256:backup.sha256,teacherCertified:false};
 const digest=hash(preview),ids=records.map(q=>q.id),aliases=api.categoryAliases('Class 9');
 const where={OR:[{category:{in:aliases},subject:SUBJECT,topic:TOPIC},{id:{in:[...new Set([...ids,...old.keys()])]}}]};
 return {records,old,ids,aliases,where,preview,digest,normalizeStem:api.normalizeStem,prefix:`ssc-statistics-r1:${digest}`};
}
function authorize(plan,digest,actor,ack){if(digest!==plan.digest||ack!==ACK||!/^vercel-owner-release:[a-f0-9]{40}$/.test(actor))throw Error('Explicit pinned chapter17 authorization required');}
async function retry(db,fn){for(let i=0;i<3;i++)try{return await db.$transaction(fn,{isolationLevel:'Serializable',timeout:120000});}catch(e){if(i===2||!['P2034','P2002'].includes(e.code))throw e;}}
async function snapshot(db,plan,digest,actor,ack){
 authorize(plan,digest,actor,ack);
 return retry(db,async tx=>{
  const rows=ordered(await tx.question.findMany({where:plan.where}));
  const contentHash=hash(rows),key=plan.prefix+':before',previous=await tx.setting.findUnique({where:{key}});
  if(previous){const value=JSON.parse(previous.value);if(value.rowsHash!==hash(value.rows))throw Error('Stored backup corrupt');return {status:'EXISTING_IMMUTABLE_DB_SNAPSHOT',key,rows:value.rows.length,rowsHash:value.rowsHash,approved:value.rows.filter(q=>q.approved).length};}
  const value={actor,digest,createdAt:new Date().toISOString(),rowsHash:contentHash,rows,contentBackup:plan.preview.contentBackup,restore:'Restore only listed Question IDs and their full fields; remove only release-owned new IDs with matching content. Never replay a subject-wide delete.'};
  await tx.setting.create({data:{key,value:JSON.stringify(value)}});
  const saved=JSON.parse((await tx.setting.findUnique({where:{key}})).value);
  if(hash(saved.rows)!==contentHash)throw Error('Snapshot readback failed');
  return {status:'IMMUTABLE_DB_SNAPSHOT_READBACK_VERIFIED',key,rows:rows.length,rowsHash:contentHash,approved:rows.filter(q=>q.approved).length};
 });
}
async function verifyAssets(plan,fetcher=fetch){
 const results=[];let next=0;
 async function worker(){while(next<plan.preview.assets.length){const a=plan.preview.assets[next++],r=await fetcher(a.url,{redirect:'error',signal:AbortSignal.timeout(20000),headers:{'cache-control':'no-cache'}});if(!r.ok||!r.headers.get('content-type')?.includes('image/svg+xml')||bytesHash(Buffer.from(await r.arrayBuffer()))!==a.sha256)throw Error('Live asset status/type/hash mismatch');results.push(a.url);}}
 await Promise.all(Array.from({length:4},worker));if(results.length!==57)throw Error('Incomplete asset check');return {origin:'https://proshnobook.com',verified:57,sha256Matched:true,checkedAt:new Date().toISOString()};
}
function classify(plan,rows){
 const expected=new Map(plan.records.map(q=>[q.id,q])),legacy=[],custom=[];
 const stems=new Map();for(const q of rows){const key=plan.normalizeStem(q.text);stems.set(key,[...(stems.get(key)||[]),q]);}
 for(const row of rows){
  if(row.category!=='Class 9'||row.subject!==SUBJECT||row.topic!==TOPIC){if(expected.has(row.id)||plan.old.has(row.id))throw Error('Canonical ID moved or alias scope; manual reconciliation required');}
  if(expected.has(row.id)){if(!equal(row,expected.get(row.id)))throw Error('Canonical revised content changed');}
  else if(plan.old.has(row.id)){if(!equal(row,plan.old.get(row.id)))throw Error('Legacy content changed; protected');legacy.push(row);}
  else custom.push(row);
 }
 for(const q of plan.records)if((stems.get(plan.normalizeStem(q.text))||[]).some(r=>r.id!==q.id))throw Error('Alias/custom stem conflict; no overwrite');
 return {expected,legacy,custom};
}
async function verifyDb(db,plan){
 const rows=await db.question.findMany({where:plan.where}),{expected,legacy,custom}=classify(plan,rows),actual=rows.filter(q=>expected.has(q.id));
 if(actual.length!==600||actual.some(q=>!q.approved||!equal(q,expected.get(q.id)))||legacy.some(q=>q.approved))throw Error('Independent DB verification failed');
 return {approvedCanonical:600,counts:plan.preview.counts,legacyApproved:0,preservedCustom:custom.length,preservedCustomApproved:custom.filter(q=>q.approved).length,rowsHash:hash(ordered(actual))};
}
async function publish(db,plan,digest,actor,ack,assetChecker=verifyAssets){
 authorize(plan,digest,actor,ack);const assetProof=await assetChecker(plan);
 if(assetProof.verified!==57||assetProof.sha256Matched!==true||assetProof.origin!=='https://proshnobook.com')throw Error('Live image proof required');
 const beforeKey=plan.prefix+':before';
 const imported=await retry(db,async tx=>{
  const receipt=await tx.setting.findUnique({where:{key:beforeKey}});if(!receipt)throw Error('Pre-import DB snapshot required');const snap=JSON.parse(receipt.value);
  if(snap.digest!==digest||hash(snap.rows)!==snap.rowsHash)throw Error('Invalid pre-import snapshot');
  const rows=await tx.question.findMany({where:plan.where});classify(plan,rows);
  const prior=await tx.setting.findUnique({where:{key:plan.prefix+':pending'}});
  if(!prior&&hash(ordered(rows))!==snap.rowsHash)throw Error('DB changed since snapshot; stop rather than overwrite');
  // A new verified immutable checkpoint before every Pending reconciliation.
  const checkKey=plan.prefix+':pending-before:'+hash(ordered(rows));if(!await tx.setting.findUnique({where:{key:checkKey}}))await tx.setting.create({data:{key:checkKey,value:JSON.stringify({rows:ordered(rows),rowsHash:hash(ordered(rows)),actor})}});
  const have=new Set(rows.map(q=>q.id)),pending=plan.records.filter(q=>!have.has(q.id));
  for(let i=0;i<pending.length;i+=100)await tx.question.createMany({data:pending.slice(i,i+100).map(q=>({...q,approved:false}))});
  const value=JSON.stringify({actor,digest,inserted:pending.length,ids:plan.ids,backup:beforeKey});
  if(!prior)await tx.setting.create({data:{key:plan.prefix+':pending',value}});
  return {inserted:pending.length};
 });
 const approved=await retry(db,async tx=>{
  const rows=await tx.question.findMany({where:plan.where}),{expected,legacy,custom}=classify(plan,rows),actual=rows.filter(q=>expected.has(q.id));
  if(actual.length!==600)throw Error('Incomplete Pending stage');
  const backupRows=ordered(rows),key=plan.prefix+':approval-before:'+hash(backupRows);
  if(!await tx.setting.findUnique({where:{key}}))await tx.setting.create({data:{key,value:JSON.stringify({actor,rows:backupRows,rowsHash:hash(backupRows)})}});
  const saved=JSON.parse((await tx.setting.findUnique({where:{key}})).value);if(hash(saved.rows)!==hash(backupRows))throw Error('Approval snapshot readback failed');
  const changed=await tx.question.updateMany({where:{id:{in:plan.ids},approved:false},data:{approved:true}});
  const retired=await tx.question.updateMany({where:{id:{in:legacy.map(q=>q.id)},approved:true},data:{approved:false}});
  const after=await tx.question.findMany({where:plan.where}),byId=new Map(after.map(q=>[q.id,q]));
  if(actual.some(q=>!byId.get(q.id)?.approved||!equal(q,byId.get(q.id)))||legacy.some(q=>byId.get(q.id)?.approved)||custom.some(q=>hash(q)!==hash(byId.get(q.id))))throw Error('Scoped approval verification failed');
  const result={status:'OWNER_APPROVED_REVISED_600',digest,actor,createdAt:new Date().toISOString(),insertedPending:imported.inserted,newlyApproved:changed.count,retiredLegacyApproved:retired.count,approvedCanonical:600,counts:plan.preview.counts,preservedCustom:custom.length,dbBackupKey:beforeKey,approvalBackupKey:key,liveAssets:assetProof,teacherCertified:false};
  await tx.setting.create({data:{key:plan.prefix+':approval:'+hash(result),value:JSON.stringify(result)}});return result;
 });
 const readback=await verifyDb(db,plan);return {...approved,independentDbReadback:readback};
}
async function main(){
 const [mode,digest,ack]=process.argv.slice(2),plan=prepare();
 if(mode==='preview'){console.log(JSON.stringify({digest:plan.digest,...plan.preview},null,2));return;}
 if(!['snapshot','publish','verify'].includes(mode)||process.env.VERCEL_ENV!=='production'||!process.env.DATABASE_URL)throw Error('Explicit production task required');
 const actor='vercel-owner-release:'+process.env.VERCEL_GIT_COMMIT_SHA;authorize(plan,digest,actor,ack);
 const {PrismaClient}=require('@prisma/client'),db=new PrismaClient();
 try{let result;if(mode==='snapshot')result=await snapshot(db,plan,digest,actor,ack);else if(mode==='publish')result=await publish(db,plan,digest,actor,ack);else result={status:'INDEPENDENT_LIVE_VERIFICATION',...await verifyDb(db,plan),liveAssets:await verifyAssets(plan)};console.log('SSC_STATISTICS_R1_RECEIPT '+JSON.stringify(result));}finally{await db.$disconnect();}
}
module.exports={prepare,snapshot,publish,verifyDb,verifyAssets,ACK,hash,equal,ordered};
if(require.main===module)main().catch(e=>{console.error('SSC_STATISTICS_R1_STOPPED '+(e.code||'VALIDATION')+' '+String(e.message).replace(/postgres(?:ql)?:\/\/\S+/g,'[redacted]'));process.exitCode=1;});
