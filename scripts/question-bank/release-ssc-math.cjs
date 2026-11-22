#!/usr/bin/env node
// Explicit owner-authorized release task. NEVER called from a normal app build,
// request, importer or module initialization. No credentials are read into output.
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module');
const {createHash} = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const ACK = 'PUBLISH_5750_SSC_MATH_OWNER_APPROVED_NOT_TEACHER_CERTIFIED';
function load() {
  const ts = require('typescript'), resolve = Module._resolveFilename, extension = require.extensions['.ts'];
  Module._resolveFilename = function(id, parent, ...rest) { return resolve.call(this, id.startsWith('@/') ? path.join(root, id.slice(2)) : id, parent, ...rest); };
  require.extensions['.ts'] = (m, file) => m._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText, file);
  try {
    return {...require(path.join(root,'lib/ssc-math-batches.ts')), ...require(path.join(root,'lib/mcq-import.ts')), ...require(path.join(root,'lib/auto-model.ts')), ...require(path.join(root,'lib/paper-generation.ts')), ...require(path.join(root,'lib/question-tables.ts'))};
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
  const expected = [[200,50,40],[300,100,70],[300,150,100],[150,50,70],[100,20,30],[150,50,30],[150,70,30],[300,200,30],[250,150,70],[150,120,50],...[11,12,13,14,15,16].map(()=>[150,50,70]),[300,200,100]];
  const batches=api.sscMathBatches(), seen=new Set(), chapters=new Map(), assets=new Map();
  if(batches.length!==53) throw Error('Unexpected slice count');
  const scopes=batches.map(b=>{
    if(b.category!=='Class 9'||b.subject!=='গণিত'||!/^ssc-math-ch\d+-.+-target-v1$/.test(b.id)||b.records.length>200||!b.records.length) throw Error('Invalid math scope');
    const ch=Number(b.id.match(/-ch(\d+)-/)[1]); if(ch<1||ch>17||!api.mathDivision(b.topic)) throw Error('Invalid chapter');
    const digest=hash(b), counts=chapters.get(ch)||{MCQ:0,CQ:0,SQ:0};
    const records=b.records.map(q=>{
      const key=JSON.stringify([b.category,b.subject,b.topic,q.kind,api.normalizeStem(q.text)]);
      const stem=JSON.stringify([b.topic,api.normalizeStem(q.text)]);
      if(seen.has(stem)) throw Error('Duplicate chapter stem'); seen.add(stem); counts[q.kind]++;
      for(const [,url] of JSON.stringify(q).matchAll(/!\[[^\]]*\]\((https:[^)]+)\)/g)) {
        if(!/^https:\/\/proshnobook\.com\/question-bank\/ssc-math-ch(?:[6-9]|1[0-7])-v1\/[a-z0-9-]+\.svg$/.test(url)) throw Error('Unreviewed image');
        const asset=path.join(root,'public',new URL(url).pathname), bytes=fs.readFileSync(asset);
        if(/<script|foreignObject|href=|\bon\w+=/i.test(bytes.toString())) throw Error('Unsafe SVG');
        assets.set(url,{url,sha256:createHash('sha256').update(bytes).digest('hex')});
        // Every image must also be understood by the real shared text renderer.
        if(!api.questionBlocks(`![figure](${url})`).some(b=>b.kind.endsWith('-image'))) throw Error('Image renderer missing');
      }
      return {id:'prepared_'+createHash('sha256').update(key).digest('hex'),category:b.category,subject:b.subject,topic:b.topic,lang:b.lang,text:q.text,options:q.options,correct:q.correct,explanation:q.explanation,difficulty:q.difficulty,source:`PREPARED_DRAFT:${digest}`};
    });
    chapters.set(ch,counts);
    return {batch:b,digest,records};
  });
  for(let ch=1;ch<=17;ch++) {
    const n=chapters.get(ch); if(!n||['MCQ','CQ','SQ'].some((k,i)=>n[k]!==expected[ch-1][i])) throw Error('Chapter quota changed');
  }
  const records=scopes.flatMap(s=>s.records);
  if(records.length!==5750) throw Error('Unexpected release size');
  function modelCheck(rows) {
    const written=api.assembleAutoModel(rows,'CQ',()=>0.5),mcq=api.assembleAutoModel(rows,'MCQ',()=>0.5);
    if(!written.ok||written.ids.length!==23||!mcq.ok||mcq.ids.length!==30) throw Error('Insufficient compatible Auto Model stock');
    const selected=rows.filter(q=>written.ids.includes(q.id));
    const divisions=Object.fromEntries(api.MATH_DIVISIONS.map(d=>[d.id,selected.filter(q=>api.autoModelRowKind(q)==='CQ'&&api.mathDivision(q.topic)?.id===d.id).length]));
    const short=selected.filter(q=>api.autoModelRowKind(q)==='SHORT').length;
    if(short!==15||Object.values(divisions).some(n=>n!==2)) throw Error('Incorrect written blueprint');
    return {mcq:30,writtenCQ:8,short,divisions};
  }
  const preview={scopes:scopes.map(s=>({id:s.batch.id,category:s.batch.category,subject:s.batch.subject,topic:s.batch.topic,digest:s.digest,count:s.records.length})),chapters:Object.fromEntries(chapters),count:records.length,assets:[...assets.values()].sort((a,b)=>a.url.localeCompare(b.url)),autoModel:modelCheck(records),approvalBasis:'OWNER_EXPLICIT_PUBLICATION_REQUEST; NOT_INDEPENDENT_TEACHER_CERTIFICATION'};
  return {scopes,records,preview,digest:hash(preview),normalizeStem:api.normalizeStem,aliases:api.categoryAliases('Class 9'),modelCheck};
}
async function retry(db, work) {
  for(let i=0;i<3;i++) try{return await db.$transaction(work,{isolationLevel:'Serializable',timeout:120000});}catch(e){if(i===2||!['P2034','P2002'].includes(e.code))throw e;}
}
async function publish(db, plan, digest, actor, acknowledgement) {
  if(digest!==plan.digest||!/^[a-f0-9]{64}$/.test(digest||'')||acknowledgement!==ACK||!/^vercel-owner-release:[a-f0-9]{40}$/.test(actor||'')) throw Error('Explicit pinned owner release required');
  const prefix=`ssc-math-release:v1:${digest}`, now=new Date().toISOString();
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
    const models=plan.modelCheck(before);
    const previouslyApproved=before.filter(q=>q.approved).length;
    const changed=await tx.question.updateMany({where:{id:{in:imported.canonicalIds},approved:false},data:{approved:true}});
    const after=await tx.question.findMany({where:{id:{in:imported.canonicalIds}}});
    if(after.length!==before.length||after.some(q=>!q.approved||!equalRow(q,expected.get(q.id))))throw Error('Approval verification failed');
    const result={status:'OWNER_APPROVED_PUBLICATION_VERIFIED',digest,actor,createdAt:now,insertedPending:imported.inserted,newlyApproved:changed.count,previouslyApproved,approvedCanonical:after.length,conflictingSkipped:imported.conflictingSkippedIds.length,autoModel:models,approvalBasis:plan.preview.approvalBasis,teacherCertified:false};
    const key=prefix+':approval';
    // A separate immutable event records each successful reconciliation/release.
    await tx.setting.create({data:{key:key+':'+createHash('sha256').update(actor+now).digest('hex'),value:JSON.stringify({...result,approvedIds:imported.canonicalIds})}});
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
  try{console.log('SSC_MATH_RELEASE_RECEIPT '+JSON.stringify(await publish(db,plan,digest,actor,acknowledgement)));}finally{await db.$disconnect();}
}
module.exports={prepare,publish,equalRow,ACK,load};
if(require.main===module)main().catch(e=>{console.error('SSC_MATH_RELEASE_STOPPED; no successful publication confirmed; code='+(e.code||'VALIDATION_OR_CONTEXT_FAILURE'));process.exitCode=1;});
