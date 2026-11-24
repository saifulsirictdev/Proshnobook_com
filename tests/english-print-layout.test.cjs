const {test} = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), ts = require('typescript'), Module = require('node:module'), path = require('node:path');
const root = path.resolve(__dirname, '..'), original = Module._resolveFilename;
Module._resolveFilename = function(id, parent, ...rest) {return original.call(this, id.startsWith('@/') ? path.join(root, id.slice(2)) : id, parent, ...rest);};
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (m, file) => m._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true}}).outputText, file);
const React = require('react'), {renderToStaticMarkup} = require('react-dom/server');
const Group = require('../components/paper-builder/english-group.tsx').default;
const {preparedEnglishItems} = require('../lib/english/prepared-items.ts');
const {assembleEnglishItems} = require('../lib/english/item-bank.ts');
const {englishLegacyPaper} = require('../lib/english/legacy-builder.ts');
const {englishFlowBlocks, withEnglishPartHeadings} = require('../lib/english/flow-blocks.ts');
const text = html => html.replace(/<[^>]*>/g, '').replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#x27;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
const render = (q, s, props = {}) => renderToStaticMarkup(React.createElement(Group, {q, s, answers: false, ...props}));
const full = grade => englishLegacyPaper(assembleEnglishItems(preparedEnglishItems(grade, 2).map(p => p.draft), grade, () => 0, undefined, {}, 2).draft);
const expanded = items => withEnglishPartHeadings(items.map(q => ({q}))).flatMap(v => englishFlowBlocks(v.q));
test('Every SSC clue box is a real fixed-width table with separate black-bordered cells, in original order', () => {
  for (const p of preparedEnglishItems(9, 2, 'gap-clues')) {
    const paper = englishLegacyPaper(p.draft), q = englishFlowBlocks(paper.items[0])[0], task = q.englishGroup.tasks[0];
    const html = render(q, paper.settings), table = html.match(/<table aria-label="Word box"[\s\S]*?<\/table>/)[0];
    assert.match(table, /table-layout:fixed/); assert.match(table, /border-collapse:collapse/);
    const cells = [...table.matchAll(/<td([^>]*)>([\s\S]*?)<\/td>/g)];
    assert.equal(cells.length, Math.ceil(task.clues.length / 5) * 5);
    for (const [attrs] of cells.map(m => [m[1]])) assert.match(attrs, /border:1px solid #000/);
    assert.deepEqual(cells.filter(m => !m[1].includes('aria-hidden="true"')).map(m => text(m[2])), task.clues);
    assert.ok(html.indexOf(task.instruction.split('\n')[0]) < html.indexOf('<table'));
    assert.ok(text(html.slice(html.indexOf('</table>'))).includes(task.instruction.split('\n')[1].slice(0, 30)));
    assert.doesNotMatch(table, / · /);
  }
});
test('Substitution prints only its instructions and A/B/C choice table, not (a)-(e) blank response lines', () => {
  for (const p of preparedEnglishItems(9, 2, 'substitution')) {
    const snapshot = JSON.stringify(p.draft), paper = englishLegacyPaper(p.draft), q = englishFlowBlocks(paper.items[0])[0];
    const html = render(q, paper.settings), plain = text(html);
    assert.equal((html.match(/<table/g) || []).length, 1);
    assert.deepEqual([...html.matchAll(/<th[^>]*>(.*?)<\/th>/g)].map(m => text(m[1])), ['A', 'B', 'C']);
    assert.doesNotMatch(plain, /\([a-e]\)|_{3,}|Answer:/);
    const key = render(q, paper.settings, {questions: false, answers: true});
    assert.doesNotMatch(key, /<table|english-part-heading/);
    assert.equal((key.match(/Answer:/g) || []).length, 5);
    for (const [i, sub] of p.draft.output.tasks[0].subitems.entries()) {assert.ok(text(key).includes(sub.answer)); assert.ok(text(key).includes(`(${String.fromCharCode(97 + i)}) Answer:`));}
    assert.equal(q.englishGroup.tasks[0].subitems.length, 5); assert.equal(JSON.stringify(p.draft), snapshot);
    const qa = render(q, paper.settings, {answers: true}); assert.equal((qa.match(/Answer:/g) || []).length, 5); assert.doesNotMatch(text(qa), /_{3,}/);
  }
});
for (const grade of [9, 10]) test(`SSC Class ${grade} prints Part A Grammar / Part B Writing once at the correct boundary, without renumbering`, () => {
  const paper = full(grade), before = JSON.stringify(paper.items), blocks = expanded(paper.items);
  const html = blocks.map(q => render(q, paper.settings)).join(''), plain = text(html);
  assert.equal((plain.match(/Part A — Grammar/g) || []).length, 1);
  assert.equal((plain.match(/Part B — Writing/g) || []).length, 1);
  const headings = blocks.filter(q => q.englishGroup.partHeading);
  assert.deepEqual(headings.map(q => q.englishGroup.tasks[0].number), [1, 10]);
  assert.ok(plain.indexOf('Part A — Grammar') < plain.indexOf('1. '));
  assert.ok(plain.indexOf('9. ') < plain.indexOf('Part B — Writing')); assert.ok(plain.indexOf('Part B — Writing') < plain.indexOf('10. '));
  assert.equal(JSON.stringify(paper.items), before);
  for (const q of blocks) assert.deepEqual(englishFlowBlocks(q), [q]);
});
test('Part A moves to the first visible grammar exercise after question removal; writing-only retains Part B', () => {
  const paper = full(9), filtered = paper.items.slice(1), blocks = expanded(filtered);
  const headings = blocks.filter(q => q.englishGroup.partHeading);
  assert.equal(headings[0].englishGroup.tasks[0].number, 2); assert.equal(headings[0].englishGroup.partHeading, 'Part A — Grammar');
  const writing = expanded(paper.items.filter(q => q.englishGroup.part.id === 'writing'));
  assert.equal(writing[0].englishGroup.partHeading, 'Part B — Writing'); assert.equal(writing[0].englishGroup.tasks[0].number, 10);
  assert.equal(writing.filter(q => q.englishGroup.partHeading).length, 1);
});
test('Reading continuations never repeat a part heading; non-English questions are untouched', () => {
  const model = require('../lib/english/prepared-complete-model.ts').preparedCompleteEnglishModel();
  const paper = englishLegacyPaper(model.draft), blocks = expanded(paper.items);
  assert.equal(blocks.filter(q => q.englishGroup.partHeading === 'Part A — Reading').length, 1);
  assert.equal(blocks.filter(q => q.englishGroup.partHeading === 'Part B — Writing').length, 1);
  assert.ok(blocks.some(q => q.englishGroup.continued && !q.englishGroup.partHeading));
  const ordinary = {q: {id: 'ordinary', text: 'Unrelated question'}}; assert.equal(withEnglishPartHeadings([ordinary])[0], ordinary);
});
test('The measured and visible previews share heading and clue rendering in portrait, landscape and answer-only modes', () => {
  const code = fs.readFileSync(path.join(root, 'components/paper-builder/preview.tsx'), 'utf8'); assert.match(code, /withEnglishPartHeadings\(list\)\.flatMap/);
  const paper = full(9), before = JSON.stringify(paper.items);
  for (const orientation of ['portrait', 'landscape']) for (const booklet of [false, true]) {
    const settings = {...paper.settings, cfg: {...paper.settings.cfg, orientation, booklet}};
    const blocks = expanded(paper.items), html = blocks.map(q => render(q, settings)).join('');
    assert.equal((html.match(/english-part-heading/g) || []).length, 2); assert.match(html, /english-clue-box/);
    const answers = blocks.map(q => render(q, settings, {questions: false, answers: true})).join(''); assert.doesNotMatch(answers, /english-part-heading|english-clue-box/);
  }
  assert.equal(JSON.stringify(paper.items), before);
});
