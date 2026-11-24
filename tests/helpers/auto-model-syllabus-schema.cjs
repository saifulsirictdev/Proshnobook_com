// Load the real schema for isolated transpileModule test harnesses.
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const file = path.resolve(__dirname, '../../lib/auto-model-syllabus-schema.ts');
const schema = new Module(file, module);
schema.paths = module.paths;
schema.require = require;
schema._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
}).outputText, file);
module.exports = schema.exports;
