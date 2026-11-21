const fs = require('node:fs'), ts = require('typescript'), Module = require('node:module'), path = require('node:path');
const root = path.resolve(__dirname, '../..'), original = Module._resolveFilename;
Module._resolveFilename = function(id, parent, ...rest) { return original.call(this, id.startsWith('@/') ? path.join(root, id.slice(2)) : id, parent, ...rest); };
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (m, file) => m._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText, file);
const {fullModelWriting} = require('../../lib/english/builder-mode.ts');
const {paperHeaderSchema} = require('../../lib/paper-header.ts');
const {validateEnglishDraft} = require('../../lib/english/draft.ts');
function fixture() {
  const header = paperHeaderSchema.parse({enabled:true});
  for (const f of Object.values(header.fields)) f.enabled = false;
  Object.assign(header.fields.subject, {enabled:true,value:'English Second Paper · Model Tests'});
  Object.assign(header.fields.program, {enabled:true,value:'Final/Annual Examination'});
  Object.assign(header.fields.setCode, {enabled:true,value:'Model Test-05'});
  const selection = {grade:8,paper:2,modelStyle:'class8-reference-v1',mode:'full',itemIds:[],writing:fullModelWriting(8,2),sources:{},includeAnswers:true};
  return validateEnglishDraft({version:1,name:'Class 8 supplied-reference fixture',selection,output:structuredClone(require('../fixtures/class8-reference-output.json')),header,font:'serif',fontSize:11,updatedAt:'2026-11-21T08:00:00.000Z'});
}
module.exports = {fixture, root};
