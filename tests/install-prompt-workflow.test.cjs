const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
function render(pathname){
 const m=new Module('install-prompt-workflow',module);m.paths=module.paths;
 m.require=id=>id==='react'?{...React,useState:value=>[value==='hidden'?'in':value,()=>{}],useRef:value=>({current:value}),useCallback:fn=>fn,useEffect:()=>{}}:id==='next/navigation'?{usePathname:()=>pathname}:id==='@/lib/brand'?require('./helpers/brand.cjs'):require(id);
 m._compile(ts.transpileModule(fs.readFileSync('components/InstallPrompt.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,'install-prompt-workflow.js');
 return renderToStaticMarkup(React.createElement(m.exports.default));
}
test('Even an already-visible install overlay cannot cover selection, editor, saved drafts or English preparation',()=>{
 for(const route of ['/question-builder','/question-builder/build','/question-builder/english','/question-builder/english/saved','/question-builder/prepare'])assert.equal(render(route),'');
});
test('Install assistance remains available outside the question-paper workflow',()=>{
 for(const route of ['/','/dashboard','/question-builder-guide']){const html=render(route);assert.match(html,/ip-backdrop/);assert.match(html,/এখন নয়/);}
 const code=fs.readFileSync('components/InstallPrompt.tsx','utf8');assert.match(code,/\[close, preparingPaper\]/);assert.match(code,/clearTimeout\(timer\)/);
});
