const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
const m = new Module('exam-preparation', module);
m._compile(ts.transpileModule(fs.readFileSync('lib/exam-preparation.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, 'exam-preparation');
const { EXAM_OUTLINES, PREPARATION_TOPICS, examOutlines, EXAM_OUTLINE_NOTICE, EXAM_BANK_NOTICE } = m.exports;
test('admission and job outlines have unique IDs, subjects and useful nonempty topic lists', () => {
  const ids = new Set();
  for (const category of ['Admission', 'Job']) {
    assert.ok(category === 'Job' ? EXAM_OUTLINES[category].length === 4 : EXAM_OUTLINES[category].length >= 8);
    for (const exam of examOutlines(category)) {
      assert.ok(!ids.has(exam.id)); ids.add(exam.id);
      assert.ok(exam.name.length >= 3);
      assert.equal(new Set(exam.subjects).size, exam.subjects.length);
      for (const subject of exam.subjects) {
        assert.ok(PREPARATION_TOPICS[subject]?.length >= 4, subject);
        assert.equal(new Set(PREPARATION_TOPICS[subject]).size, PREPARATION_TOPICS[subject].length);
      }
    }
  }
  assert.deepEqual(examOutlines('HSC'), []);
  assert.deepEqual(examOutlines('__proto__'), []);
});
test('editorial outlines never claim official syllabus, complete banks, years, marks or eligibility', () => {
  assert.ok(EXAM_OUTLINE_NOTICE.includes('অফিশিয়াল বা বছরভিত্তিক যাচাইকৃত সিলেবাস নয়'));
  assert.ok(EXAM_BANK_NOTICE.includes('প্রশ্নভান্ডার পূর্ণ নয়'));
  assert.ok(EXAM_BANK_NOTICE.includes('নির্দিষ্ট পরীক্ষা/বছরের প্রশ্ন হিসেবে নয়'));
  for (const exam of Object.values(EXAM_OUTLINES).flat()) {
    assert.deepEqual(Object.keys(exam).filter(k => !['id', 'name', 'subjects', 'note'].includes(k)), []);
  }
});
test('starter retains database subjects and existing prepare/payment flow with resettable optional outline selector', () => {
  const source = fs.readFileSync('components/qb-start.tsx', 'utf8');
  assert.ok(source.includes('...curriculumSubjects, ...examSubjects, ...dbSubjects'));
  assert.ok(source.includes('EXAM_OUTLINE_NOTICE'));
  assert.ok(source.includes('EXAM_BANK_NOTICE'));
  assert.ok(source.includes('setExamId("")'));
  assert.ok(source.includes('p.set("subject", subject)'));
  assert.ok(source.includes('p.set("topic", topic)'));
  assert.ok(!source.includes('p.set("examId"'));
  assert.ok(source.includes('disabled={!subject}'));
});
test('document metadata resolves before rendering for stable browser hydration', async () => {
  const config = (await import('../next.config.mjs')).default;
  assert.ok(config.htmlLimitedBots.test('Mozilla/5.0 Chrome/130'));
  assert.ok(config.htmlLimitedBots.test('Googlebot'));
});
