const {test} = require('node:test'), assert = require('node:assert/strict');
const {prepare, save} = require('../scripts/english/import-ssc-pending.cjs');
const plan = prepare();
const actor = 'github:owner:12345';
function database(seed = []) {
  const values = new Map(seed.map(p => [p.key, p.value])); let writes = 0;
  const tx = {setting: {
    findMany: async ({where}) => [...values].filter(([key]) => where.key.in.includes(key)).map(([key, value]) => ({key, value})),
    createMany: async ({data, skipDuplicates}) => { assert.equal(skipDuplicates, true); writes++; let count = 0; for (const p of data) if (!values.has(p.key)) { values.set(p.key, p.value); count++; } return {count}; },
  }};
  return {values, get writes() {return writes;}, $transaction: async (f, options) => {assert.equal(options.isolationLevel, 'Serializable'); return f(tx);}};
}
test('Owner SSC import scope is exactly 51 x 12 exercises for each of grades 9 and 10, Paper 2 only', () => {
  assert.equal(plan.scopes.length, 2); assert.deepEqual(plan.preview.map(s => s.grade), [9, 10]);
  assert.equal(plan.scopes.flatMap(s => s.records).length, 1224); assert.match(plan.digest, /^[a-f0-9]{64}$/);
  assert.equal(plan.digest, prepare().digest);
  assert.throws(() => prepare({preparedEnglishItems: () => []}), /scope/);
});
test('Owner importer refuses absent/mismatched consent digest or unauditable actor before DB access', async () => {
  for (const digest of [undefined, '', '0'.repeat(64)]) await assert.rejects(save({}, plan, digest, actor), /digest/);
  for (const a of ['', 'anonymous', 'github:owner:bad']) await assert.rejects(save({}, plan, plan.digest, a), /actor/);
});
test('Owner import saves Pending only, preserves APPROVED/REJECTED/legacy bytes, repeat is idempotent', async () => {
  const seeds = plan.scopes[0].records.slice(0, 3).map((p, i) => ({key: p.key, value: i === 2 ? 'legacy malformed record, do not overwrite' : JSON.stringify({status: i ? 'REJECTED' : 'APPROVED', custom: 'retain exactly'})}));
  const db = database(seeds), receipt = await save(db, plan, plan.digest, actor, '2026-11-20T00:00:00.000Z');
  assert.equal(receipt.inserted, 1221); assert.equal(receipt.preserved, 3); assert.equal(receipt.verified, 1224);
  assert.deepEqual(receipt.statuses, {APPROVED: 1, REJECTED: 1, INVALID_EXISTING: 1, PENDING: 1221});
  for (const p of seeds) assert.equal(db.values.get(p.key), p.value);
  for (const p of plan.scopes.flatMap(s => s.records).slice(3)) { const row = JSON.parse(db.values.get(p.key)); assert.equal(row.status, 'PENDING'); assert.deepEqual(row.draft, p.draft); assert.deepEqual(row.review, p.review); assert.equal(row.importedBy, actor); }
  const again = await save(db, plan, plan.digest, actor); assert.equal(again.inserted, 0); assert.equal(again.preserved, 1224); assert.equal(db.writes, 1);
});
test('Verification failure rejects rather than reporting success', async () => {
  const db = {$transaction: async f => f({setting: {findMany: async () => [], createMany: async () => ({count: 0})}})};
  await assert.rejects(save(db, plan, plan.digest, actor), /count/);
});
