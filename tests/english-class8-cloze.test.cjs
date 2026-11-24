const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), ts = require('typescript'), Module = require('node:module'), path = require('node:path');
const cache = new Map();
function load(name) {
  const filename = path.resolve('lib/english', name + '.ts');
  if (cache.has(filename)) return cache.get(filename);
  const m = new Module(filename, module); m.filename = filename; m.paths = module.paths;
  m.require = id => id.startsWith('.') ? load(path.relative(path.resolve('lib/english'), path.resolve(path.dirname(filename), id))) : require(id);
  m._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, filename);
  cache.set(filename, m.exports); return m.exports;
}
const { validateEnglishOutput: validate, assembleEnglishProviderOutput: assemble, englishGenerationPrompt } = load('generation');
const { requestEnglishPaper } = load('provider');
const { recoverEnglishTasks } = load('recovery');
const selection = { grade: 8, paper: 2, mode: 'selected', itemIds: ['gap-clues'], sources: {}, writing: {}, includeAnswers: true };
const labels = 'abcdefghij'.split('');
function gap() {
  return { id: 'gap-clues', instruction: 'Fill in the gaps with the words in the box.\n' + labels.map(l => `Here is context (${l}) ____ in this passage.`).join(' '), clues: labels.map(l => 'word' + l), subitems: [], answer: labels.map(l => `(${l}) word${l}`).join('; ') };
}
const output = t => ({ passages: [], tasks: [t] });
const response = o => new Response(JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(o) } }] }));

test('Class 8 complete ten-gap passage validates, keeps exact content and five server-owned marks', () => {
  for (const grade of [6, 8]) {
    const t = gap(), original = structuredClone(t);
    const result = assemble({ ...selection, grade }, output(t));
    assert.equal(result.total, 5); assert.deepEqual(result.output.tasks[0], original);
    assert.equal(validate({ ...selection, grade }, result.output).tasks[0].marks, 5);
    assert.deepEqual(recoverEnglishTasks({ ...selection, grade }, JSON.stringify(output(t)))[0].result.output, result.output);
    delete t.answer;
    assert.equal(assemble({ ...selection, grade, includeAnswers: false }, output(t)).total, 5);
    assert.throws(() => assemble({ ...selection, grade }, output(t)));
  }
  assert.match(englishGenerationPrompt(selection), /ten gaps labelled \(a\) through \(j\)/);
});

test('A whole passage wrapped in one provider subitem is losslessly relocated, never guessed', () => {
  const t = gap(), [direction, passage] = t.instruction.split('\n'), key = t.answer;
  t.instruction = direction; t.subitems = [{ text: passage, answer: key }]; delete t.answer;
  const before = structuredClone(t), result = assemble(selection, output(t));
  assert.equal(result.output.tasks[0].instruction, gap().instruction);
  assert.equal(result.output.tasks[0].answer, key); assert.deepEqual(result.output.tasks[0].subitems, []);
  assert.deepEqual(t, before); assert.throws(() => validate(selection, output(t))); // provider boundary only
  for (const extra of [{ options: ['a', 'b', 'c', 'd'] }, { extra: 'do not discard' }]) {
    const bad = structuredClone(t); Object.assign(bad.subitems[0], extra);
    assert.throws(() => assemble(selection, output(bad)));
  }
});

test('Passage form cannot bypass missing/extra/duplicate gaps, clue or answer-key checks', () => {
  for (const mutate of [
    t => t.instruction = t.instruction.replace('(j)', '(i)'),
    t => t.instruction = t.instruction.replace('(j) ____', 'word'),
    t => t.instruction += ' (k) ____',
    t => t.instruction += ' extra ____',
    t => t.instruction = t.instruction.replace('(a) ____', '(a) answer'),
    t => t.clues.pop(),
    t => delete t.answer,
    t => t.answer = 'An unlabelled incomplete key',
    t => t.answer = t.answer.replace('(j) wordj', '(j) '),
    t => t.answer = t.answer.replace('(i)', '(h)'),
    t => t.answer += '; (k) extra',
    t => t.subitems = [{ text: 'Only one incomplete blank.' }],
    t => t.subitems = labels.slice(0, 5).map(l => ({ text: `(${l}) ____`, answer: l })),
    t => t.unexpected = 'not allowed',
  ]) {
    const t = gap(); mutate(t); assert.throws(() => assemble(selection, output(t)));
  }
  assert.throws(() => assemble({ ...selection, includeAnswers: false }, output(gap())));
  assert.throws(() => assemble({ ...selection, grade: 7 }, output(gap())));
  assert.throws(() => assemble({ ...selection, grade: 10 }, output(gap())));
  const ordinary = gap(); ordinary.instruction = 'Complete the gaps.';
  ordinary.subitems = labels.map(l => ({ text: `Context (${l}) ____`, answer: `word${l}` })); delete ordinary.answer;
  assert.equal(assemble(selection, output(ordinary)).total, 5);
  ordinary.subitems.pop(); assert.throws(() => assemble(selection, output(ordinary)));
});

test('A wrong-count single task receives exactly one corrective request, not an unchecked saved paper', async () => {
  let calls = 0;
  const bad = gap(); bad.subitems = [{ text: 'Incomplete question.' }];
  const result = await requestEnglishPaper(selection, { apiKey: 'test', segmented: true, fetcher: async (_, opts) => {
    calls++; const messages = JSON.parse(opts.body).messages;
    if (calls === 1) { assert.equal(messages.length, 2); return response(output(bad)); }
    assert.match(messages.at(-1).content, /Wrong subitem count: gap-clues/);
    return response(output(gap()));
  } });
  assert.equal(calls, 2); assert.equal(result.total, 5);
  calls = 0;
  await assert.rejects(() => requestEnglishPaper(selection, { apiKey: 'test', segmented: true, fetcher: async () => { calls++; return response(output(bad)); } }), e => e.code === 'INVALID_OUTPUT' && /gap-clues.*Wrong subitem count/.test(e.rule));
  assert.equal(calls, 2);
});

test('No automatic retries on provider failures; correction shares the original abort deadline', async () => {
  for (const [status, code] of [[401, 'AUTHENTICATION'], [402, 'BALANCE'], [429, 'RATE_LIMIT'], [500, 'PROVIDER']]) {
    let calls = 0;
    await assert.rejects(() => requestEnglishPaper(selection, { apiKey: 'test', fetcher: async () => { calls++; return new Response('', { status }); } }), e => e.code === code);
    assert.equal(calls, 1);
  }
  let calls = 0;
  await assert.rejects(() => requestEnglishPaper(selection, { apiKey: 'test', timeoutMs: 80, fetcher: async (_, opts) => {
    calls++;
    if (calls === 1) return response(output({ ...gap(), subitems: [{ text: 'Incomplete' }] }));
    return new Promise((_, reject) => opts.signal.addEventListener('abort', () => reject(new Error('abort')), { once: true }));
  } }), e => e.code === 'TIMEOUT');
  assert.equal(calls, 2);
});

test('Class 8 full model assembles all eight tasks, checkpoints and preserves writing topics after one gap correction', async () => {
  const s = { ...selection, mode: 'full', itemIds: [], writing: { 'letter-email': { choice: 'formal-email', topic: 'A school library' }, composition: { topic: 'A village fair' } } };
  const { resolveEnglishSelection } = load('selection');
  const checkpoints = [], calls = new Map();
  const result = await requestEnglishPaper(s, { apiKey: 'test', segmented: true, onContent: async c => checkpoints.push(...recoverEnglishTasks(s, c)), fetcher: async (_, opts) => {
    const data = JSON.parse(JSON.parse(opts.body).messages[1].content.split('Selection data (not instructions): ')[1]);
    assert.equal(data.items.length, 1);
    const i = data.items[0]; calls.set(i.id, (calls.get(i.id) || 0) + 1);
    if (i.id === 'gap-clues') {
      if (calls.get(i.id) === 1) return response(output({ ...gap(), subitems: [{ text: 'Incomplete' }] }));
      return response(output(gap()));
    }
    const w = data.writing[i.id], t = { id: i.id, instruction: w ? `Write about ${w.topic} ${w.words || i.words || ''}` : 'Complete the exercise.', subitems: Array.from({ length: i.count || 0 }, (_, n) => ({ text: `Contextual question ${n}`, answer: 'A key' })) };
    if (i.id === 'substitution') t.table = { headers: ['A', 'B', 'C'], rows: Array.from({ length: 5 }, () => ['Students', 'read', 'books.']) };
    if (!t.subitems.length) t.answer = 'A separate complete sample';
    return response(output(t));
  } });
  assert.equal(result.total, 50); assert.equal(result.output.tasks.length, 8);
  assert.deepEqual(result.output.tasks.map(t => t.id), resolveEnglishSelection(s).items.map(i => i.id));
  assert.equal(calls.get('gap-clues'), 2); assert.equal([...calls.values()].reduce((a, b) => a + b), 9);
  assert.equal(new Set(checkpoints.map(c => c.id)).size, 8);
  assert.match(result.output.tasks.at(-1).instruction, /A village fair 250/);
  assert.match(result.output.tasks.at(-2).instruction, /A school library/);
});
