#!/usr/bin/env node
// Explicit owner-authorized release task. NEVER called from a normal app build,
// request, importer or module initialization. No credentials are read into output.
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module');
const {createHash} = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const ACK = 'PUBLISH_50_PLAIN_GEOMETRY_OWNER_APPROVED_NOT_TEACHER_CERTIFIED';
function load() {
  const ts = require('typescript'), resolve = Module._resolveFilename, extension = require.extensions['.ts'];
  Module._resolveFilename = function(id, parent, ...rest) { return resolve.call(this, id.startsWith('@/') ? path.join(root, id.slice(2)) : id, parent, ...rest); };
  require.extensions['.ts'] = (m, file) => m._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText, file);
  try {
    return {...require(path.join(root,'lib/ssc-geometry-plain-batches.ts')), ...require(path.join(root,'lib/mcq-import.ts')), ...require(path.join(root,'lib/auto-model.ts')), ...require(path.join(root,'lib/paper-generation.ts')), ...require(path.join(root,'lib/question-tables.ts'))};
  } finally { Module._resolveFilename = resolve; require.extensions['.ts'] = extension; }
}
const fields = ['id','category','subject','topic','lang','text','options','correct','explanation','difficulty'];
const canonical = q => Object.fromEntries(fields.map(k=>[k,q[k]]));
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  return value && typeof value==='object' ? Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])) : value;
}
const equalRow = (a,b) => hash(stable(canonical(a))) === hash(stable(canonical(b)));
function prepare(api = load()) {
  const batches = api.sscGeometryPlainBatches();
  const chapters = [6, 7, 8, 14, 15];
  if (batches.length !== 5) throw Error('Exactly five pinned supplement batches required');
  const seen = new Set();
  const scopes = batches.map((b, i) => {
    if (b.id !== `ssc-math-geometry-plain-ch${chapters[i]}-v1` || b.category !== 'Class 9' || b.subject !== 'গণিত' || b.records.length !== 10) throw Error('Invalid supplement scope');
    const digest = hash(b);
    const records = b.records.map(q => {
      const key = JSON.stringify([b.category,b.subject,b.topic,q.kind,api.normalizeStem(q.text)]);
      const stem = api.normalizeStem(q.text);
      const row = {id:'prepared_'+hash(JSON.parse(key)),category:b.category,subject:b.subject,topic:b.topic,lang:b.lang,text:q.text,options:q.options,correct:q.correct,explanation:q.explanation,difficulty:q.difficulty,source:`PREPARED_DRAFT:${digest}`};
      if (q.kind !== 'MCQ' || api.autoModelRowKind(row) !== 'MCQ' || api.mathDivision(b.topic)?.id !== 'geometry' || api.autoModelHasDiagram(row) || JSON.stringify(q).includes('![') || seen.has(stem)) throw Error('Invalid or duplicate plain geometry MCQ');
      seen.add(stem); return row;
    });
    return {batch:b,digest,records};
  });
  const records=scopes.flatMap(s=>s.records);
  if(records.length!==50)throw Error('Exactly fifty questions required');
  function verifySupplement(rows) {
    if(rows.length!==50||rows.some(q=>api.autoModelRowKind(q)!=='MCQ'||api.autoModelHasDiagram(q)||api.mathDivision(q.topic)?.id!=='geometry'))throw Error('Incomplete plain geometry approval scope');
    return {plainGeometryMCQ:50};
  }
  function modelCheck(rows) {
    const runs=[];
    for(let seed=1;seed<=5;seed++){
      let n=seed;const random=()=>((n=(n*1664525+1013904223)>>>0)/4294967296);
      const result=api.assembleAutoModel(rows,'MCQ',random);
      if(!result.ok||result.ids.length!==30)throw Error('Approved application stock cannot assemble MCQ');
      const selected=rows.filter(q=>result.ids.includes(q.id));
      const counts=api.MATH_DIVISIONS.map(d=>selected.filter(q=>api.mathDivision(q.topic)?.id===d.id).length);
      const diagrams=selected.filter(api.autoModelHasDiagram).length;
      if(counts[0]<12||counts[0]>15||counts[1]<10||counts[1]>13||counts[2]+counts[3]!==5||diagrams>5)throw Error('MCQ policy mismatch');
      runs.push({mcq:30,algebra:counts[0],geometry:counts[1],combined:counts[2]+counts[3],diagramQuestions:diagrams});
    }
    const written=api.assembleAutoModel(rows,'CQ',()=>0.5);
    if(!written.ok||written.ids.length!==23)throw Error('Written model regression');
    return {runs,writtenItems:23};
  }
  const preview={count:50,scopes:scopes.map(s=>({id:s.batch.id,digest:s.digest,topic:s.batch.topic,count:10})),approvalBasis:'OWNER_EXPLICIT_APPROVAL_REQUEST; NOT_INDEPENDENT_TEACHER_CERTIFICATION'};
  return {scopes,records,preview,digest:hash(preview),normalizeStem:api.normalizeStem,aliases:api.categoryAliases('Class 9'),verifySupplement,modelCheck};
}
async function retry(db, work) {
  for(let i=0;i<3;i++) try{return await db.$transaction(work,{isolationLevel:'Serializable',timeout:120000});}catch(e){if(i===2||!['P2034','P2002'].includes(e.code))throw e;}
}
async function publish(db, plan, digest, actor, acknowledgement) {
  if(digest!==plan.digest||!/^[a-f0-9]{64}$/.test(digest||'')||acknowledgement!==ACK||!/^vercel-owner-release:[a-f0-9]{40}$/.test(actor||'')) throw Error('Explicit pinned owner release required');
  const prefix=`ssc-geometry-plain-release:v1:${digest}`, now=new Date().toISOString();
  // Phase 1: idempotent Pending import using the canonical prepared IDs/receipts.
  // Alias duplicates and mismatched legacy records are NEVER overwritten/approved.
  const imported=await retry(db,async tx=>{
    const existing=await tx.question.findMany({where:{category:{in:plan.aliases},subject:'গণিত',topic:{in:plan.scopes.map(s=>s.batch.topic)}}});
    const byId=new Map(existing.map(q=>[q.id,q])), stems=new Map();
    for(const q of existing){const key=q.topic+'\n'+plan.normalizeStem(q.text);stems.set(key,[...(stems.get(key)||[]),q]);}
    const pending=[],targetIds=[],conflicts=[];
    for(const s of plan.scopes){
      const ids=[],skipped=[];
      for(const row of s.records){
        const old=byId.get(row.id),key=row.topic+'\n'+plan.normalizeStem(row.text);
        if(old){if(!equalRow(old,row)||old.source!==row.source) throw Error('Canonical record changed; manual review required');targetIds.push(row.id);ids.push(row.id);continue;}
        if(stems.has(key)){skipped.push(row.id);conflicts.push(row.id);continue;}
        pending.push({...row,approved:false});targetIds.push(row.id);ids.push(row.id);stems.set(key,[row]);
      }
      const key=`preparedimport:v1:${s.digest}`;
      const current=await tx.setting.findUnique({where:{key}});
      const value={actorId:actor,createdAt:now,batchId:s.batch.id,category:s.batch.category,subject:s.batch.subject,topic:s.batch.topic,provenance:s.batch.provenance,limitations:s.batch.limitations,ids,skipped:skipped.length,releaseDigest:digest,authorization:'OWNER_EXPLICIT_PENDING_IMPORT'};
      // Existing audit history is immutable, even if records need reconciliation.
      if(!current)await tx.setting.create({data:{key,value:JSON.stringify(value)}});
    }
    for(let i=0;i<pending.length;i+=200)await tx.question.createMany({data:pending.slice(i,i+200)});
    if(targetIds.length+conflicts.length!==plan.records.length)throw Error('Import accounting failed');
    const result={actor,createdAt:now,digest,inserted:pending.length,canonicalIds:targetIds,conflictingSkippedIds:conflicts};
    await tx.setting.upsert({where:{key:prefix+':import'},create:{key:prefix+':import',value:JSON.stringify(result)},update:{value:JSON.stringify(result)}});
    return result;
  });
  // Phase 2: exact-content recheck, then approve ONLY this release's canonical IDs.
  // If this phase fails the imported rows stay Pending, never partly approved.
  const published=await retry(db,async tx=>{
    const before=await tx.question.findMany({where:{id:{in:imported.canonicalIds}}});
    const expected=new Map(plan.records.map(q=>[q.id,q]));
    if(before.length!==imported.canonicalIds.length||before.some(q=>!equalRow(q,expected.get(q.id))||q.source!==expected.get(q.id).source))throw Error('Approval snapshot changed');
    const models=plan.verifySupplement(before);
    const previouslyApproved=before.filter(q=>q.approved).length;
    const changed=await tx.question.updateMany({where:{id:{in:imported.canonicalIds},approved:false},data:{approved:true}});
    const after=await tx.question.findMany({where:{id:{in:imported.canonicalIds}}});
    if(after.length!==before.length||after.some(q=>!q.approved||!equalRow(q,expected.get(q.id))))throw Error('Approval verification failed');
    // Mirror the application's bounded approved-stock query, not just our imported pool.
    const appStock=await tx.question.findMany({where:{category:{in:plan.aliases},subject:'গণিত',approved:true},orderBy:{id:'asc'},take:10001});
    if(appStock.length>10000)throw Error('Application Auto Model scan bound exceeded');
    const appModels=plan.modelCheck(appStock);
    const result={status:'OWNER_APPROVED_PUBLICATION_VERIFIED',digest,actor,createdAt:now,insertedPending:imported.inserted,newlyApproved:changed.count,previouslyApproved,approvedCanonical:after.length,conflictingSkipped:imported.conflictingSkippedIds.length,autoModel:models,applicationApprovedStock:appStock.length,applicationAutoModel:appModels,approvalBasis:plan.preview.approvalBasis,teacherCertified:false};
    const key=prefix+':approval';
    // A separate immutable event records each successful reconciliation/release.
    await tx.setting.create({data:{key:key+':'+createHash('sha256').update(actor+now).digest('hex'),value:JSON.stringify({...result,approvedIds:imported.canonicalIds,newlyApprovedIds:before.filter(q=>!q.approved).map(q=>q.id),previouslyApprovedIds:before.filter(q=>q.approved).map(q=>q.id)})}});
    return result;
  });
  return published;
}
async function main(){
  const mode=process.argv[2];if(!['preview','publish'].includes(mode))throw Error('Choose preview or publish');
  const plan=prepare();
  if(mode==='preview'){console.log(JSON.stringify({digest:plan.digest,...plan.preview},null,2));return;}
  if(process.env.VERCEL_ENV!=='production'||!process.env.DATABASE_URL)throw Error('Production execution context required');
  const digest=process.argv[3],acknowledgement=process.argv[4],actor=`vercel-owner-release:${process.env.VERCEL_GIT_COMMIT_SHA||''}`;
  const {PrismaClient}=require('@prisma/client'),db=new PrismaClient();
  try{console.log('SSC_GEOMETRY_PLAIN_RELEASE_RECEIPT '+JSON.stringify(await publish(db,plan,digest,actor,acknowledgement)));}finally{await db.$disconnect();}
}
module.exports={prepare,publish,equalRow,ACK,load};
if(require.main===module)main().catch(e=>{console.error('SSC_GEOMETRY_PLAIN_RELEASE_STOPPED; no successful publication confirmed; code='+(e.code||'VALIDATION_OR_CONTEXT_FAILURE'));process.exitCode=1;});
