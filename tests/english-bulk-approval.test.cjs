const {test} = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), ts = require('typescript'), Module = require('node:module'), path = require('node:path'), {createHash} = require('node:crypto');
const root = path.resolve(__dirname, '..'), original = Module._resolveFilename;
Module._resolveFilename = function(id, parent, ...rest) {return original.call(this, id.startsWith('@/') ? path.join(root, id.slice(2)) : id, parent, ...rest);};
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (m, file) => m._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true}}).outputText, file);
const {ENGLISH_BULK_APPROVAL_LIMIT, ENGLISH_BULK_APPROVAL_MAX_BYTES} = require('../lib/english/bulk-approval.ts');
const {preparedEnglishItems} = require('../lib/english/prepared-items.ts');
const sha = value => createHash('sha256').update(value).digest('hex');
const entries = n => Array.from({length: n}, (_, i) => ({key: `english-item:v1:${sha(String(i))}`, digest: sha(`snapshot-${i}`)}));
function harness(grade) {
  const rows = new Map(preparedEnglishItems(grade, 2).map(p => [p.key, JSON.stringify({status: 'PENDING', draft: p.draft, group: p.group, review: p.review})]));
  let reads = 0, writes = 0, user = {id: 'synthetic-admin', role: 'ADMIN'};
  const m = new Module(path.join(root, 'app/admin/english-review/actions.ts'), module); m.paths = module.paths;
  m.require = id => ({'@/auth': {auth: async () => ({user})}, 'next/cache': {revalidatePath() {}}, '@/lib/db': {db: {setting: {
    findUnique: async ({where}) => {reads++; return rows.has(where.key) ? {value: rows.get(where.key)} : null;},
    updateMany: async ({where, data}) => {if (rows.get(where.key) !== where.value) return {count: 0}; writes++; rows.set(where.key, data.value); return {count: 1};},
  }}}}[id] || require(id));
  m._compile(ts.transpileModule(fs.readFileSync(m.id, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText, m.id);
  return {rows, get reads() {return reads;}, get writes() {return writes;}, setUser(value) {user = value;},
    submit(batch, consent = true, scope = grade) {const form = new FormData(); form.set('grade', String(scope)); form.set('paper', '2'); form.set('entries', JSON.stringify(batch)); if (consent) form.set('reviewed', 'yes'); return m.exports.approveEnglishPendingBatch({}, form);},
    snapshot() {return [...rows].map(([key, value]) => ({key, digest: sha(value)}));},
  };
}
for (const grade of [9, 10]) test(`Class ${grade}: one submission approves all 612 snapshots, not 50-set client batches`, async () => {
  const h = harness(grade), snapshot = h.snapshot(); assert.equal(snapshot.length, 612);
  // The former 500-entry parser rejected this very payload before DB access.
  const result = await h.submit(snapshot);
  assert.equal(result.error, undefined); assert.deepEqual(result.counts, {approved: 612, skipped: 0, invalid: 0, uncertain: 0});
  assert.equal(h.reads, 612); assert.equal(h.writes, 612);
  for (const value of h.rows.values()) {const row = JSON.parse(value); assert.equal(row.status, 'APPROVED'); assert.equal(row.reviewedBy, 'synthetic-admin'); assert.equal(row.draft.selection.grade, grade);}
  const again = await h.submit(snapshot); assert.equal(again.counts.approved, 0); assert.equal(again.counts.skipped, 612); assert.equal(h.writes, 612);
});
test('2000-entry single request fits the byte cap and succeeds; 2001 entries fail before DB access', async () => {
  assert.equal(ENGLISH_BULK_APPROVAL_LIMIT, 2000);
  const h = harness(9), value = h.rows.values().next().value;
  h.rows.clear(); for (const e of entries(2000)) h.rows.set(e.key, value);
  const snapshot = h.snapshot(); assert.ok(Buffer.byteLength(JSON.stringify(snapshot)) < ENGLISH_BULK_APPROVAL_MAX_BYTES);
  assert.equal((await h.submit(snapshot)).counts.approved, 2000); assert.equal(h.writes, 2000);
  const before = h.reads; assert.match((await h.submit(entries(2001))).error, /2000/); assert.equal(h.reads, before);
});
test('Missing consent, non-ADMIN session and wrong grade still cannot approve', async () => {
  const h = harness(9), snapshot = h.snapshot();
  assert.ok((await h.submit(snapshot, false)).error); assert.equal(h.reads, 0);
  h.setUser({id: 'teacher', role: 'TEACHER'}); assert.ok((await h.submit(snapshot)).error); assert.equal(h.reads, 0);
  h.setUser({id: 'admin', role: 'ADMIN'}); const result = await h.submit(snapshot, true, 10);
  assert.equal(result.counts.invalid, 612); assert.equal(h.writes, 0);
});
test('Changed, rejected and already approved snapshots stay unchanged while the rest succeed', async () => {
  const h = harness(9), snapshot = h.snapshot();
  for (const [i, status] of ['REJECTED', 'APPROVED', 'PENDING'].entries()) {
    const key = snapshot[i].key, row = JSON.parse(h.rows.get(key)); h.rows.set(key, JSON.stringify({...row, status, note: 'changed after preview'}));
  }
  const prior = snapshot.slice(0, 3).map(e => h.rows.get(e.key));
  const result = await h.submit(snapshot); assert.equal(result.counts.approved, 609); assert.equal(result.counts.skipped, 3);
  assert.deepEqual(snapshot.slice(0, 3).map(e => h.rows.get(e.key)), prior);
});
test('Duplicate keys, oversized payloads, malformed digests and empty lists fail before reads or writes', async () => {
  const h = harness(9), snapshot = h.snapshot();
  for (const input of [[], [snapshot[0], snapshot[0]], [{...snapshot[0], digest: 'forged'}], [{...snapshot[0], extra: 'x'.repeat(ENGLISH_BULK_APPROVAL_MAX_BYTES)}]]) assert.ok((await h.submit(input)).error);
  assert.equal(h.reads, 0); assert.equal(h.writes, 0);
});
test('Client submits the full snapshot exactly once with required consent, no client queue or automatic retries', () => {
  const file = path.join(root, 'app/admin/questions/english-bulk-approval.tsx'), m = new Module(file, module); m.paths = module.paths;
  let calls = 0; m.require = id => id === '../english-review/actions' ? {approveEnglishPendingBatch() {calls++; throw Error('SSR must not approve');}} : require(id);
  m._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true}}).outputText, file);
  const React = require('react'), {renderToStaticMarkup} = require('react-dom/server');
  const html = renderToStaticMarkup(React.createElement(m.exports.default, {grade: 9, paper: 2, entries: entries(612)}));
  assert.match(html, /612/); assert.match(html, /2000/); assert.match(html, /<input[^>]*required=""[^>]*name="reviewed"/); assert.match(html, /name="entries"/); assert.equal(calls, 0);
  const code = fs.readFileSync(file, 'utf8'); assert.match(code, /useActionState\(approveEnglishPendingBatch/); assert.match(code, /JSON.stringify\(entries\)/); assert.doesNotMatch(code, /runEnglishApprovalBatches|setInterval|setTimeout|\.slice\(/);
});
