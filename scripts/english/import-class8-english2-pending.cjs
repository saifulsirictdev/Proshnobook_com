#!/usr/bin/env node
// Owner-authorized Class Eight Second Paper only. Explicit CLI; never called by
// the normal build, an HTTP handler, a cron, or the application registry.
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module');
const {createHash} = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const ACK = 'IMPORT_CLASS8_ENGLISH2_PENDING_ONLY';
function loadRegistry() {
  const ts = require('typescript'), original = Module._resolveFilename;
  Module._resolveFilename = function(id, parent, ...rest) { return original.call(this, id.startsWith('@/') ? path.join(root, id.slice(2)) : id, parent, ...rest); };
  require.extensions['.ts'] = (m, file) => m._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true}}).outputText, file);
  return {...require(path.join(root, 'lib/prepared-question-batches.ts')), ...require(path.join(root, 'lib/mcq-import.ts'))};
}
function prepare(registry = loadRegistry()) {
  const manifest = require('../../content/question-bank/class-8/english-2nd/manifest.json');
  const scopes = manifest.entries.map(e => {
    const {batch, digest} = registry.getPreparedBatch(e.id);
    if (batch.category !== 'Class 8' || batch.subject !== 'English 2nd Paper' || batch.topic !== e.topic || batch.records.length !== 40 || batch.records.some(q => q.kind !== 'SQ')) throw Error('Unexpected Class 8 scope');
    return {batch, digest};
  });
  if (scopes.length !== 11 || scopes.reduce((n,s) => n+s.batch.records.length, 0) !== 440) throw Error('Incomplete Class 8 scope');
  const preview = scopes.map(({batch:b, digest}) => ({id:b.id,category:b.category,subject:b.subject,topic:b.topic,count:b.records.length,digest,limitations:b.limitations}));
  return {scopes, preview, digest: hash(scopes)};
}
async function save(db, plan, expectedDigest, acknowledgement, registry = loadRegistry(), now = new Date().toISOString()) {
  if (acknowledgement !== ACK) throw Error('Explicit Pending-only consent required');
  if (!/^[a-f0-9]{64}$/.test(expectedDigest || '') || expectedDigest !== plan.digest || hash(plan.scopes) !== expectedDigest) throw Error('Preview digest mismatch');
  if (plan.scopes.length !== 11 || plan.scopes.some(({batch:b}) => b.category !== 'Class 8' || b.subject !== 'English 2nd Paper' || b.records.length !== 40 || b.records.some(q => q.kind !== 'SQ'))) throw Error('Invalid scope');
  const actor = 'owner:arena:class8_english2_release:publish_and_pending';
  return db.$transaction(async tx => {
    let inserted = 0, preserved = 0; const topics = [];
    for (const {batch:b, digest} of plan.scopes) {
      const where = {category:b.category, subject:b.subject, topic:b.topic};
      const before = await tx.question.findMany({where});
      const existing = new Map(before.map(q => [registry.normalizeStem(q.text), q]));
      const ids = [];
      for (const q of b.records) {
        const stem = registry.normalizeStem(q.text);
        if (existing.has(stem)) {preserved++;continue;}
        const id = registry.preparedQuestionId(b,q);
        const data = {id,...where,lang:b.lang,text:q.text,options:q.options,correct:q.correct,explanation:q.explanation,difficulty:q.difficulty,approved:false,source:`PREPARED_DRAFT:${digest}`};
        await tx.question.create({data}); existing.set(stem,data); ids.push(id); inserted++;
      }
      const after = await tx.question.findMany({where});
      const byId = new Map(after.map(q => [q.id,q]));
      for (const previous of before) if (JSON.stringify(byId.get(previous.id)) !== JSON.stringify(previous)) throw Error('Existing decision changed');
      for (const id of ids) if (!byId.has(id) || byId.get(id).approved !== false) throw Error('New Pending verification failed');
      const stems = new Set(after.map(q => registry.normalizeStem(q.text)));
      if (b.records.some(q => !stems.has(registry.normalizeStem(q.text)))) throw Error('Incomplete verification');
      const key = `preparedimport:v1:${digest}`;
      const receipt = await tx.setting.findUnique({where:{key}});
      // A prior receipt never causes missing database records to be ignored.
      // Existing receipts and all existing question decisions are left untouched.
      if (!receipt) await tx.setting.create({data:{key,value:JSON.stringify({actorId:actor,authorization:'OWNER_SCOPED_PENDING_ONLY',createdAt:now,batchId:b.id,...where,provenance:b.provenance,limitations:b.limitations,inserted:ids.length,skipped:40-ids.length,ids,importDigest:plan.digest})}});
      topics.push({id:b.id,inserted:ids.length,preserved:40-ids.length,verified:40});
    }
    return {status:'PENDING_IMPORT_VERIFIED',digest:plan.digest,inserted,preserved,verified:440,topics,actor,importedAt:now};
  }, {isolationLevel:'Serializable',timeout:120000});
}
async function main() {
  const mode = process.argv[2];
  if (!['preview','save'].includes(mode)) throw Error('Choose preview or save');
  const plan = prepare();
  if (mode === 'preview') {console.log(JSON.stringify({digest:plan.digest,topics:plan.preview},null,2));return;}
  const {PrismaClient} = require('@prisma/client'), db = new PrismaClient();
  try {console.log(JSON.stringify(await save(db,plan,process.env.C8_DIGEST,process.env.C8_PENDING),null,2));}
  finally {await db.$disconnect();}
}
module.exports = {prepare,save,ACK};
if (require.main === module) main().catch(() => {console.error('Class 8 Pending import stopped. No successful import confirmed; no credentials logged.');process.exitCode=1;});
