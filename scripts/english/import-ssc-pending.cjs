#!/usr/bin/env node
// Owner-authorized, explicit SSC Paper 2 scope only. No approval/update/delete path.
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module');
const {createHash} = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
function loadRegistry() {
  const ts = require('typescript'), original = Module._resolveFilename;
  Module._resolveFilename = function(id, parent, ...rest) { return original.call(this, id.startsWith('@/') ? path.join(root, id.slice(2)) : id, parent, ...rest); };
  require.extensions['.ts'] = (m, file) => m._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true}}).outputText, file);
  return require(path.join(root, 'lib/english/prepared-items.ts'));
}
function prepare(registry = loadRegistry()) {
  const scopes = [9, 10].map(grade => {
    const records = registry.preparedEnglishItems(grade, 2);
    if (records.length !== 612 || new Set(records.map(p => p.key)).size !== 612) throw Error('Unexpected SSC scope');
    const counts = {};
    for (const p of records) {
      if (!p.key.startsWith('english-item:v1:') || p.draft.selection.grade !== grade || p.draft.selection.paper !== 2 || p.draft.selection.itemIds.length !== 1) throw Error('Invalid scope');
      const item = p.draft.selection.itemIds[0]; counts[item] = (counts[item] || 0) + 1;
    }
    if (Object.keys(counts).length !== 12 || Object.values(counts).some(n => n !== 51)) throw Error('Incomplete SSC scope');
    return {grade, paper: 2, count: records.length, counts, digest: hash(records), records};
  });
  const preview = scopes.map(({records, ...scope}) => scope);
  return {scopes, preview, digest: hash(preview)};
}
async function save(db, plan, expectedDigest, actor, now = new Date().toISOString()) {
  if (!/^[a-f0-9]{64}$/.test(expectedDigest || '') || expectedDigest !== plan.digest) throw Error('Preview digest mismatch');
  // GitHub repository write permission + explicit workflow dispatch is the owner
  // authorization here, not an anonymous replacement for the ADMIN web action.
  if (!/^github:[A-Za-z0-9-]+:\d+$/.test(actor || '')) throw Error('Auditable owner actor required');
  const records = plan.scopes.flatMap(s => s.records);
  return db.$transaction(async tx => {
    const keys = records.map(p => p.key);
    const before = await tx.setting.findMany({where: {key: {in: keys}}, select: {key: true, value: true}});
    const previous = new Map(before.map(p => [p.key, p.value]));
    const data = records.filter(p => !previous.has(p.key)).map(p => ({key: p.key, value: JSON.stringify({status: 'PENDING', draft: p.draft, group: p.group, ...('review' in p ? {review: p.review} : {}), importedBy: actor, importedAt: now, authorization: 'OWNER_SCOPED_PENDING_ONLY', importDigest: plan.digest})}));
    const result = data.length ? await tx.setting.createMany({data, skipDuplicates: true}) : {count: 0};
    const after = await tx.setting.findMany({where: {key: {in: keys}}, select: {key: true, value: true}});
    const stored = new Map(after.map(p => [p.key, p.value]));
    if (stored.size !== keys.length || result.count !== data.length) throw Error('Import count changed; retry after review');
    for (const p of records) {
      if (previous.has(p.key)) { if (stored.get(p.key) !== previous.get(p.key)) throw Error('Existing decision changed'); }
      else if (stored.get(p.key) !== data.find(d => d.key === p.key)?.value) throw Error('Pending snapshot mismatch');
    }
    const statuses = {};
    for (const value of stored.values()) { let status; try { status = JSON.parse(value).status || 'UNKNOWN'; } catch { status = 'INVALID_EXISTING'; } statuses[status] = (statuses[status] || 0) + 1; }
    return {status: 'PENDING_IMPORT_VERIFIED', digest: plan.digest, inserted: result.count, preserved: before.length, verified: stored.size, statuses, scopes: plan.preview, actor, importedAt: now};
  }, {isolationLevel: 'Serializable', timeout: 120000});
}
async function main() {
  const mode = process.argv[2];
  if (!['preview', 'save'].includes(mode)) throw Error('Choose preview or save');
  const plan = prepare();
  if (mode === 'preview') { console.log(JSON.stringify({digest: plan.digest, scopes: plan.preview, limitations: 'Possible answers, not official keys. Pending only; teacher approval required. 612 shared exercises stored separately for grades 9 and 10 (1224 rows). Existing records never overwritten.'}, null, 2)); return; }
  if (process.env.ACKNOWLEDGE_PENDING_ONLY !== 'IMPORT_SSC_9_10_PENDING_ONLY') throw Error('Explicit Pending-only acknowledgement required');
  const {PrismaClient} = require('@prisma/client'), db = new PrismaClient();
  try { const receipt = await save(db, plan, process.env.SSC_IMPORT_DIGEST, process.env.SSC_IMPORT_ACTOR); console.log(JSON.stringify(receipt, null, 2)); }
  finally { await db.$disconnect(); }
}
module.exports = {prepare, save};
if (require.main === module) main().catch(() => { console.error('SSC Pending import stopped; no successful import confirmed. Credentials and question data are not logged.'); process.exitCode = 1; });
