const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),Module=require('node:module'),ts=require('typescript');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
function load(file,mocks={}){const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);return m.exports;}
const blocks=load('lib/question-tables.ts');
const MathText=load('components/MathText.tsx',{'@/lib/question-tables':blocks}).default;
const q={id:'chemistry-figure',text:'Select the particle.\n![Particle](https://proshnobook.com/question-bank/ssc-chemistry-ch3-v1/nuclide-18.svg)',options:{A:'40',B:'22',C:'18',D:'58'},correct:'A',explanation:'Checked answer.'};
test('practice and saved-test views render safe Chemistry figures and exactly four choice buttons',()=>{
 for(const file of ['components/practice.tsx','components/test-runner.tsx']){
  const Component=load(file,{'@/components/MathText':{default:MathText,__esModule:true},'@/app/actions/tests':{submitAttempt:()=>{throw Error('render must not submit')}}}).default;
  const html=renderToStaticMarkup(React.createElement(Component,{qs:[q],testId:'fixture',minutes:10}));
  assert.match(html,/<img[^>]*src="\/question-bank\/ssc-chemistry-ch3-v1\/nuclide-18\.svg"/);
  assert.doesNotMatch(html,/!\[Particle\]/);
  assert.equal((html.match(/<button/g)||[]).length,file.includes('test-runner')?5:4);
 }
});
test('shared practice renderer does not turn arbitrary external image markdown into images',()=>{
 const html=renderToStaticMarkup(React.createElement(MathText,{text:'![unsafe](https://example.invalid/unsafe.svg)'}));
 assert.doesNotMatch(html,/<img/);
});
