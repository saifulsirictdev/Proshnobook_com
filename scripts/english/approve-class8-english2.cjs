#!/usr/bin/env node
// Explicit owner-authorized approval of the frozen PR #7 import only.
// Not an HTTP route, normal build hook, generic approval tool or importer.
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module');
const {createHash} = require('node:crypto');
const {prepare} = require('./import-class8-english2-pending.cjs');
const IMPORT_DIGEST = '01e3d6aa6eee372066ebce8839245bf32af0482e3ecc11e3ce52571d9646ef9c';
const ACK = 'APPROVE_CLASS8_ENGLISH2_440_ONLY';
const AUDIT_KEY = `preparedapproval:owner:v1:${IMPORT_DIGEST}`;
const ACTOR = 'owner:arena:approved-koro:continue';
const root = path.resolve(__dirname, '../..');
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
// JSON objects returned by PostgreSQL JSONB need not retain source key order.
const stable = value => value instanceof Date ? value.toISOString() : Array.isArray(value) ? value.map(stable) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(k => [k,stable(value[k])])) : value;
const equal = (a,b) => JSON.stringify(stable(a)) === JSON.stringify(stable(b));
function identityLibrary() {
  const ts = require('typescript'), original = Module._resolveFilename;
  Module._resolveFilename = function(id,parent,...rest) {return original.call(this,id.startsWith('@/') ? path.join(root,id.slice(2)) : id,parent,...rest);};
  require.extensions['.ts'] = (m,file) => m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
  return require(path.join(root,'lib/prepared-question-batches.ts'));
}
function targets(plan = prepare(), lib = identityLibrary()) {
  if (plan.digest !== IMPORT_DIGEST || hash(plan.scopes) !== IMPORT_DIGEST || plan.scopes.length !== 11) throw Error('Frozen import digest/scope changed');
  const groups = plan.scopes.map(({batch:b,digest}) => {
    if (b.category !== 'Class 8' || b.subject !== 'English 2nd Paper' || b.records.length !== 40 || b.records.some(q => q.kind !== 'SQ')) throw Error('Invalid approval scope');
    return {batchId:b.id,digest,topic:b.topic,rows:b.records.map(q => ({id:lib.preparedQuestionId(b,q),category:b.category,subject:b.subject,topic:b.topic,lang:b.lang,text:q.text,options:q.options,correct:q.correct,explanation:q.explanation,difficulty:q.difficulty,source:`PREPARED_DRAFT:${digest}`}))};
  });
  const rows = groups.flatMap(g => g.rows), ids = rows.map(q => q.id).sort();
  if (rows.length !== 440 || new Set(ids).size !== 440 || new Set(groups.map(g => g.topic)).size !== 11) throw Error('Invalid target identities');
  return {groups,rows,ids};
}
async function snapshot(tx, scope) {
  // Import receipts must name these exact deterministic IDs, not merely match
  // the category, topic or normalized question stem.
  for (const g of scope.groups) {
    const receipt = await tx.setting.findUnique({where:{key:`preparedimport:v1:${g.digest}`}});
    let r;try {r=JSON.parse(receipt?.value);}catch {throw Error('Missing/malformed import receipt');}
    if (!r || typeof r !== 'object' || r.importDigest !== IMPORT_DIGEST || r.authorization !== 'OWNER_SCOPED_PENDING_ONLY' || r.actorId !== 'owner:arena:class8_english2_release:publish_and_pending' || r.batchId !== g.batchId || r.category !== 'Class 8' || r.subject !== 'English 2nd Paper' || r.topic !== g.topic || r.inserted !== 40 || r.skipped !== 0 || !Array.isArray(r.ids) || !equal([...r.ids].sort(),g.rows.map(q=>q.id).sort())) throw Error('Import receipt scope mismatch');
  }
  const rows = await tx.question.findMany({where:{id:{in:scope.ids}}});
  const byId = new Map(rows.map(q=>[q.id,q]));
  if (rows.length !== 440 || byId.size !== 440) throw Error('Missing/duplicate target questions; do not import replacements');
  for (const expected of scope.rows) {
    const current = byId.get(expected.id);
    if (!current || typeof current.approved !== 'boolean' || Object.entries(expected).some(([k,v])=>!equal(current[k],v))) throw Error('Question content/source changed; fresh review required');
  }
  const audit = await tx.setting.findUnique({where:{key:AUDIT_KEY}});
  if (audit) {
    let a;try {a=JSON.parse(audit.value);}catch {throw Error('Invalid approval audit');}
    if (!a || typeof a !== 'object' || a.status !== 'OWNER_APPROVAL_VERIFIED' || a.importDigest !== IMPORT_DIGEST || a.actor !== ACTOR || a.targetIdsSha256 !== hash(scope.ids) || a.verified !== 440) throw Error('Invalid approval audit scope');
    // Do not revive a subsequent rejection/revocation on a routine retry.
    if (rows.some(q=>!q.approved)) throw Error('Approval subsequently revoked; separate fresh owner authorization required');
  }
  const decisions = scope.ids.map(id=>({id,approved:byId.get(id).approved}));
  return {rows,byId,audit,previewDigest:hash({importDigest:IMPORT_DIGEST,decisions}),pending:rows.filter(q=>!q.approved).length};
}
async function preview(db,plan=prepare()) {
  const scope=targets(plan);
  return db.$transaction(async tx=>{
    const s=await snapshot(tx,scope);
    return {status:'OWNER_APPROVAL_PREVIEW',importDigest:IMPORT_DIGEST,previewDigest:s.previewDigest,matched:440,pending:s.pending,alreadyApproved:440-s.pending,alreadyApplied:Boolean(s.audit),topics:scope.groups.map(g=>({id:g.batchId,count:40})),limitations:'Owner-requested approval only. Not independent teacher review, official answer-key certification, or structured Auto Model stock.'};
  },{isolationLevel:'Serializable',timeout:120000});
}
async function approve(db,plan,expectedImportDigest,expectedPreviewDigest,acknowledgement,now=new Date().toISOString()) {
  if (acknowledgement !== ACK) throw Error('Explicit scoped approval consent required');
  if (expectedImportDigest !== IMPORT_DIGEST || !/^[a-f0-9]{64}$/.test(expectedPreviewDigest || '')) throw Error('Reviewed digest required');
  const scope=targets(plan);
  return db.$transaction(async tx=>{
    const before=await snapshot(tx,scope);
    if (before.previewDigest !== expectedPreviewDigest) throw Error('Approval preview stale; no change made');
    if (before.audit) return {status:'OWNER_APPROVAL_VERIFIED',importDigest:IMPORT_DIGEST,changed:0,verified:440,alreadyApplied:true,actor:ACTOR};
    let changed=0;
    for (const g of scope.groups) {
      const pending=g.rows.filter(q=>!before.byId.get(q.id).approved).map(q=>q.id);
      if (!pending.length) continue;
      const result=await tx.question.updateMany({where:{id:{in:pending},category:'Class 8',subject:'English 2nd Paper',topic:g.topic,source:`PREPARED_DRAFT:${g.digest}`,approved:false},data:{approved:true}});
      if (result.count !== pending.length) throw Error('Concurrent decision changed; rollback required');
      changed+=result.count;
    }
    const after=await snapshot(tx,scope);
    if (after.pending || changed !== before.pending) throw Error('Approval verification failed');
    // Only the approval bit may change; timestamps/content/source/IDs must not.
    for (const previous of before.rows) if (!equal({...previous,approved:true},after.byId.get(previous.id))) throw Error('Unexpected question mutation');
    const receipt={status:'OWNER_APPROVAL_VERIFIED',importDigest:IMPORT_DIGEST,previewDigest:expectedPreviewDigest,targetIdsSha256:hash(scope.ids),changed,previouslyApproved:440-before.pending,verified:440,actor:ACTOR,authorization:'OWNER_EXPLICIT_APPROVED_KORO_AND_CONTINUE',approvedAt:now,topics:scope.groups.map(g=>({id:g.batchId,count:40})),limitations:'Owner approval as instructed; not independent teacher/official syllabus certification. Raw draft provenance remains historical and unchanged.'};
    await tx.setting.create({data:{key:AUDIT_KEY,value:JSON.stringify(receipt)}});
    return {...receipt,alreadyApplied:false};
  },{isolationLevel:'Serializable',timeout:120000});
}
async function main() {
  const mode=process.argv[2];if (!['preview','approve'].includes(mode)) throw Error('Choose preview or approve');
  // Both explicit values are mandatory before creating a DB client for writes.
  if (mode==='approve' && (process.env.C8_APPROVE!==ACK || process.env.C8_DIGEST!==IMPORT_DIGEST)) throw Error('Missing owner approval acknowledgement/digest');
  const plan=prepare();targets(plan);
  const {PrismaClient}=require('@prisma/client'),db=new PrismaClient();
  try {
    const p=await preview(db,plan);console.log(JSON.stringify(p));
    if(mode==='approve') console.log(JSON.stringify(await approve(db,plan,process.env.C8_DIGEST,p.previewDigest,process.env.C8_APPROVE)));
  } finally {await db.$disconnect();}
}
module.exports={IMPORT_DIGEST,ACK,AUDIT_KEY,targets,preview,approve};
if (require.main===module) main().catch(()=>{console.error('Scoped Class 8 approval stopped. No successful approval confirmed. No credentials logged; inspect receipt before retrying.');process.exitCode=1;});
