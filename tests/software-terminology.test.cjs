const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const Module = require('node:module');

const oldLabel = /এআই|\bAI\b/;
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? files(file) : /\.tsx?$/.test(file) ? [file] : [];
  });
}

test('UI text, accessible labels and Bengali messages use software terminology', () => {
  const violations = [];
  for (const file of ['app', 'components', 'lib'].flatMap(files)) {
    const source = fs.readFileSync(file, 'utf8');
    const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    function visit(node) {
      const literal = ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) ||
        ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node);
      if (ts.isJsxText(node) || literal) {
        const text = node.getText(tree);
        // These are transport provenance values, not UI labels. The paper view
        // translates them on display without modifying the stored/API source.
        const provenance = ['app/api/qb/questions/route.ts', 'app/question-builder/create/page.tsx'].includes(file) &&
          node.text === 'AI — অনুমোদনের অপেক্ষায়';
        const visible = ts.isJsxText(node) || (literal && (
          /[\u0980-\u09ff]/.test(text) || ts.isJsxAttribute(node.parent) ||
          (ts.isPropertyAssignment(node.parent) && /^(label|badge|title|description)$/.test(node.parent.name.getText(tree)))
        ));
        if (visible && !provenance && oldLabel.test(text)) violations.push(`${file}: ${text}`);
      }
      ts.forEachChild(node, visit);
    }
    visit(tree);
  }
  assert.deepEqual(violations, []);
});

test('legacy messages are translated without dropping failure or review warnings', () => {
  const m = new Module(path.resolve('lib/english/preparation-message.ts'), module);
  m.paths = module.paths;
  m._compile(ts.transpileModule(fs.readFileSync('lib/english/preparation-message.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText, path.resolve('lib/english/preparation-message.ts'));
  const message = m.exports.englishPreparationMessage;
  assert.equal(message('AI উত্তর ভুল হতে পারে—শিক্ষককে যাচাই করতে হবে।'), 'সফটওয়্যার উত্তর ভুল হতে পারে—শিক্ষককে যাচাই করতে হবে।');
  assert.equal(message('এআই সংযোগ ব্যর্থ।'), 'সফটওয়্যার সংযোগ ব্যর্থ।');
  assert.equal(message('সফটওয়্যার quota শেষ।'), 'দৈনিক প্রস্তুতির সীমা শেষ।');
  assert.equal(message('সংযোগ ব্যর্থ। সফটওয়্যার চালানো হয়নি। আবার চেষ্টা করুন।'), 'সংযোগ ব্যর্থ। আবার চেষ্টা করুন।');
});

test('source provenance, provider disclosure and unverified-draft warnings are retained', () => {
  for (const file of ['app/api/qb/questions/route.ts', 'app/question-builder/create/page.tsx']) {
    const code = fs.readFileSync(file, 'utf8');
    assert.match(code, /startsWith\("AI_PENDING:"\)/);
    assert.match(code, /"AI — অনুমোদনের অপেক্ষায়"/);
  }
  assert.match(fs.readFileSync('components/paper-builder/preview.tsx', 'utf8'), /q\.source\?\.replace\(/);
  const checkout = fs.readFileSync('components/ready-papers/checkout.tsx', 'utf8');
  assert.match(checkout, /DeepSeek-এ পাঠানো হবে/);
  assert.match(checkout, /সফটওয়্যার উত্তর যাচাই প্রয়োজন/);
  assert.match(fs.readFileSync('components/ready-papers/answer-assistant.tsx', 'utf8'), /সফটওয়্যার খসড়া · যাচাইকৃত নয়/);
  assert.match(fs.readFileSync('components/auto-model-setup.tsx', 'utf8'), /ব্যক্তিগত, অননুমোদিত খসড়া/);
  assert.match(fs.readFileSync('app/api/generate-exam/route.ts', 'utf8'), /z\.enum\(\["DB", "AI"\]\)/);
});
