const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const resolve = Module._resolveFilename;
Module._resolveFilename = function(id, parent, ...rest) {
  return resolve.call(this, id.startsWith('@/') ? path.join(root, id.slice(2)) : id, parent, ...rest);
};
require.extensions['.ts'] = (m, file) => m._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true},
}).outputText, file);
const {check} = require('../scripts/check-auto-model-upgrade.cjs');
const {subjectModelPolicy} = require('../lib/subject-model-policy.ts');
function fixture(subject) {
  const policy = subjectModelPolicy('SSC', subject);
  return policy.chapters.flatMap((topic, chapter) => ['MCQ', 'CQ', 'SHORT'].flatMap(kind =>
    Array.from({length: 4}, (_, i) => {
      const id = `${subject}:${chapter}:${kind}:${i}`;
      return {id, topic, text: `স্বতন্ত্র যাচাই প্রশ্ন ${id}`, correct: kind === 'MCQ' ? 'A' : '',
        explanation: `সমাধান ${id}`, options: kind === 'MCQ' ? {A: 'এক', B: 'দুই', C: 'তিন', D: 'চার', _authoring: {practice: true}}
          : kind === 'CQ' ? {stimulus: `স্বতন্ত্র যাচাই প্রশ্ন ${id}`, subQuestions: {k: 'ক প্রশ্ন', kh: 'খ প্রশ্ন', g: 'গ প্রশ্ন', gh: 'ঘ প্রশ্ন'}, marks: {k: 1, kh: 2, g: 3, gh: 4}}
          : {_authoring: {practice: true}}};
    })));
}
test('rollout probe reads approved subject stock only, assembles 20 models and never mutates or calls AI', async () => {
  const queries = [];
  const receipt = await check({question: {findMany: async query => {
    queries.push(query);
    return fixture(query.where.subject);
  }}});
  assert.equal(receipt.modelsVerified, 20);
  assert.equal(receipt.databaseMutation, false);
  assert.equal(receipt.approvalMutation, false);
  assert.equal(receipt.providerInvoked, false);
  assert.equal(receipt.authenticatedBrowserFlowVerified, false);
  assert.equal(receipt.liveAIGenerationVerified, false);
  assert.equal(queries.length, 2);
  for (const q of queries) {
    assert.equal(q.where.approved, true);
    assert.equal(q.take, 10001);
    assert.ok(q.where.category.in.includes('Class 9'));
  }
  for (const s of receipt.subjects) for (const v of s.variants) {
    assert.equal(v.aiShortfall, 0);
    assert.equal(v.offered, v.variant === 'MCQ' ? 25 : 14);
    assert.equal(v.totalMarks, v.variant === 'MCQ' ? 25 : 50);
  }
  assert.doesNotMatch(JSON.stringify(receipt), /স্বতন্ত্র যাচাই প্রশ্ন|সমাধান/);
  const code = fs.readFileSync('scripts/check-auto-model-upgrade.cjs', 'utf8');
  assert.doesNotMatch(code, /question\.(?:create|update|delete)|setting\.(?:create|update|upsert)|fetch\(/);
  assert.ok(!JSON.stringify(require('../package.json').scripts).includes('check-auto-model-upgrade'));
});
test('rollout probe fails closed on insufficient stock, truncated scans and DB errors', async () => {
  await assert.rejects(check({question: {findMany: async () => []}}), /no longer has a complete model/);
  await assert.rejects(check({question: {findMany: async () => Array(10001).fill({})}}), /scan bound/);
  await assert.rejects(check({question: {findMany: async () => {throw Error('offline');}}}), /offline/);
});
