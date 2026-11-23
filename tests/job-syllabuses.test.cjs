const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const data = require('../lib/job-syllabuses.json');
function load(file, mocks = {}) {
  const m = new Module(file, module); m.paths = module.paths;
  m.require = id => Object.hasOwn(mocks, id) ? mocks[id] : require(id);
  m._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, file);
  return m.exports;
}
test('only four Job roots and two separately sourced NTRCA branches exist', () => {
  assert.deepEqual(data.exams.map(e => e.id), ['bcs-preliminary', 'primary', 'ntrca', 'govt-11-20']);
  const branches = data.exams[2].branches;
  assert.deepEqual(branches.map(b => [b.id, b.source]), [['school', 'school'], ['college', 'college']]);
  assert.equal(data.sources.school.filename, 'school syllables .pdf');
  assert.equal(data.sources.college.filename, 'ntrca syllables .pdf');
  assert.equal(data.exams[3].source, 'owner-text');
  for (const source of Object.values(data.sources)) assert.match(source.sha256, /^[a-f0-9]{64}$/);
});
test('all sourced subjects have valid pages, unique topics and source-specific counts', () => {
  for (const exam of data.exams.flatMap(e => e.branches || [e])) {
    assert.ok(exam.subjects.length >= 4);
    assert.equal(new Set(exam.subjects.map(s => s.name)).size, exam.subjects.length);
    for (const subject of exam.subjects) {
      assert.ok(subject.topics.length > 0);
      assert.equal(new Set(subject.topics).size, subject.topics.length);
      for (const page of subject.pages) assert.ok(page >= 1 && page <= data.sources[exam.source].pages);
      assert.ok(!subject.topics.some(t => /Paragraph Writing|Short Composition|ভাবসম্প্রসারণ|দরখাস্ত|চিঠি লেখা/.test(t)));
    }
  }
  assert.equal(data.exams[0].subjects.reduce((n,s) => n+s.marks,0), 200);
  assert.equal(data.exams[1].subjects.reduce((n,s) => n+s.marks,0), 80);
  for (const branch of data.exams[2].branches) assert.equal(branch.subjects.reduce((n,s) => n+s.marks,0), 100);
  const [school,college] = data.exams[2].branches;
  assert.ok(!school.subjects[2].topics.join(' ').includes('ত্রিকোণমিতি'));
  assert.ok(college.subjects[2].topics.join(' ').includes('ত্রিকোণমিতি'));
  assert.ok(data.exams[3].subjects.every(s => !s.marks));
});
function starter(examId, branchId, subject, topic = '') {
  let states = ['Job', examId, branchId, 'CQ', subject, '', '', '', '', topic], i = 0, pushed;
  const Start = load('components/qb-start.tsx', {
    react: { ...React, useState: () => [states[i++], () => {}], useMemo: fn => fn() },
    'next/navigation': { useRouter: () => ({ push: url => pushed = url }), useSearchParams: () => new URLSearchParams('append=1') },
    '@/lib/academic-subject-groups': load('lib/academic-subject-groups.ts'),
    '@/lib/auto-model': load('lib/auto-model.ts', {'./nctb-data':load('lib/nctb-data.ts'),'./subject-model-policy':load('lib/subject-model-policy.ts',{'./nctb-data':load('lib/nctb-data.ts')}),'./question-tables':load('lib/question-tables.ts')}),
    '@/lib/nctb-data': { NCTB_CLASSES: [] },
    '@/lib/english/topic-options': { englishLessonOptions: () => ({ topics: [], groups: [], notice: '' }), englishQuestionItemGroups: () => [] },
    '@/lib/english/builder-mode': { englishBuilderContext: () => null, englishBuilderHref: () => null },
    '@/lib/exam-preparation': load('lib/exam-preparation.ts'),
    '@/lib/question-type-options': load('lib/question-type-options.ts'),
    '@/lib/job-syllabuses.json': data,
  }).default;
  const tree = Start({ pairs: [{ category: 'Job', subject: 'লিখিত প্রস্তুতি' }] });
  return { tree, html: renderToStaticMarkup(tree), pushed: () => pushed };
}
function nodes(node) {
  if (!node || typeof node !== 'object') return [];
  return [node, ...React.Children.toArray(node.props?.children).flatMap(nodes)];
}
test('Job starter restricts subjects to selected source and forces MCQ even with stale written state', () => {
  const topic = data.exams[2].branches[1].subjects[2].topics[0];
  const result = starter('ntrca', 'college', 'সাধারণ গণিত', topic);
  assert.ok(result.html.includes('ntrca syllables .pdf'));
  assert.ok(!result.html.includes('value="লিখিত প্রস্তুতি"'));
  assert.ok(!result.html.includes('value="CQ"'));
  assert.ok(result.html.includes('value="MCQ"'));
  const button = nodes(result.tree).find(n => n.type === 'button' && n.props.onClick && n.props.className.includes('w-full'));
  button.props.onClick();
  const url = new URL(result.pushed(), 'https://example.invalid');
  assert.equal(url.searchParams.get('questionType'), 'MCQ');
  assert.equal(url.searchParams.get('subject'), 'সাধারণ গণিত');
  assert.equal(url.searchParams.get('topic'), topic);
  assert.equal(url.searchParams.get('append'), '1');
});
test('NTRCA cannot start before School/College selection; Job has no union of unrelated subjects', () => {
  const result = starter('ntrca', '', '');
  const select = nodes(result.tree).find(n => n.type === 'select' && n.props['aria-label'] === 'বিষয়');
  assert.equal(React.Children.toArray(select.props.children).length, 1);
  const button = nodes(result.tree).find(n => n.type === 'button' && n.props.className.includes('w-full'));
  assert.equal(button.props.disabled, true);
  assert.match(fs.readFileSync('app/question-builder/prepare/page.tsx','utf8'), /p.category === "Job" \? "MCQ"/);
});
