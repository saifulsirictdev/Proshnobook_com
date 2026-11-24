const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const base = path.join(__dirname, '..');
const root = path.join(base, 'content/question-bank/ssc/chemistry/chapter-6-source-v1');
const file = path.join(root, 'questions.json');
const data = JSON.parse(fs.readFileSync(file));
const validation = JSON.parse(fs.readFileSync(path.join(root, 'validation.json')));
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
test('partial source intake is not misrepresented as quota completion or live stock', () => {
  assert.equal(data.status, 'PARTIAL_VERIFIED_COLLECTION_NOT_IMPORTABLE');
  assert.equal(data.availableSourceTotalEstablished, false);
  assert.deepEqual(data.verifiedCounts, { MCQ: 6, CQ: 2, SQ: 3 });
  assert.deepEqual(data.requested, { MCQ: 500, CQ: 200, SQ: 100 });
  for (const k of ['MCQ','CQ','SQ']) {
    assert.equal(data.items.filter(x => x.type === k).length, data.verifiedCounts[k]);
    assert.equal(data.remainingAgainstTarget[k], data.requested[k] - data.verifiedCounts[k]);
  }
  for (const k of ['websiteImported','published','teacherApproved','strictApplicationUploaderCompatible']) assert.equal(data[k], false);
});
test('unique original-source records with no made-up answers, marks or variants', () => {
  assert.equal(data.items.length, 11);
  assert.equal(new Set(data.items.map(x => x.id)).size, 11);
  assert.equal(data.ownQuestionsCreated, 0);
  for (const x of data.items) {
    assert.equal(x.sourceVerbatim, true);
    for (const key of ['originalPractice','adapted','variant','teacherApproved']) assert.equal(x[key], false);
    assert.equal(x.answer, null);
    assert.equal(x.marks, null);
    assert.equal(x.source.fileId, '17cFTHipiCnU5qB-prqtRRj6YADFdZ091');
    assert.equal(x.source.pdfPage, x.source.printedPage + 5);
    for (const key of ['board','examYear','school','shortAttribution']) assert.equal(x.source[key], null);
    for (const p of x.parts || []) { assert.equal(p.answer, null); assert.equal(p.marks, null); }
  }
});
test('source question images and attached diagrams exist and match SHA receipts', () => {
  assert.equal(Object.keys(validation.assets).length, 13);
  for (const [name, receipt] of Object.entries(validation.assets)) {
    const b = fs.readFileSync(path.join(base, 'public/question-bank/ssc-chemistry-ch6-source-v1', name));
    assert.equal(b.length, receipt.bytes);
    assert.equal(hash(b), receipt.sha256);
    assert.equal(b.subarray(0,8).toString('hex'), '89504e470d0a1a0a');
  }
  assert.equal(validation.questionFileSHA256, hash(fs.readFileSync(file)));
  for (const x of data.items) for (const p of [x.questionImage,...(x.stimulusImages||[])]) assert.ok(fs.existsSync(path.join(base,'public',p)));
});
test('shared stimulus preserved separately and attached to BOTH original MCQs', () => {
  for (const n of [3,4]) {
    const x = data.items.find(x => x.type==='MCQ' && x.sourceQuestionNumber===n);
    assert.equal(x.sharedStimulusGroup, 'textbook-mcq-3-4');
    assert.match(x.stimulusText, /5 গ্রাম হাইড্রোজেন/);
    assert.match(x.stimulusText, /75 গ্রাম ক্লোরিন/);
    assert.deepEqual(x.stimulusImages, ['/question-bank/ssc-chemistry-ch6-source-v1/textbook-shared-3-4.png']);
  }
});
test('all six MCQs preserve four source choices and no inferred correct answer', () => {
  for (const x of data.items.filter(x=>x.type==='MCQ')) {
    assert.deepEqual(Object.keys(x.options), ['ক','খ','গ','ঘ']);
    assert.equal(x.correct, null);
  }
  assert.equal(data.items[1].options['ক'], 'CaPO₄');
  assert.equal(data.items[2].options['ক'], '1.27×10²⁴');
  assert.equal(data.items[5].options['ঘ'], '2.58×10²²টি');
});
test('CQ stimulus figure and exact subpart count retained without silent spelling correction', () => {
  const cqs=data.items.filter(x=>x.type==='CQ');
  for (const x of cqs) assert.deepEqual(x.parts.map(x=>x.label), ['ক','খ','গ','ঘ']);
  assert.match(cqs[0].stimulusImages[0], /cq-1-diagram/);
  assert.match(cqs[0].parts[2].question, /দ্রবদ্বয়কে/);
  assert.ok(cqs[0].sourceNotes.some(x=>x.includes('নীরবে')));
});
test('unverified board candidates are excluded from actual question count', () => {
  assert.equal(validation.boardOrSchoolQuestionCountVerified,0);
  assert.equal(validation.boardCandidatesExcludedFromVerifiedCount,49);
  assert.equal(validation.fullChapterReadInThisTask,false);
  assert.ok(data.items.every(x=>x.id.includes('-textbook-')));
});
test('new source-only intake is NOT registered with runtime prepared batches', () => {
  const registry=fs.readFileSync(path.join(base,'lib/prepared-question-batches.ts'),'utf8');
  assert.doesNotMatch(registry,/chapter-6-source-v1|ssc-chemistry-ch6-source/);
});
