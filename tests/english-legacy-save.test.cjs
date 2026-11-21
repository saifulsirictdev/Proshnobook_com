const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module'),path=require('node:path');
const {fixture}=require('./helpers/class8-reference.cjs');
const {englishLegacyPaper}=require('../lib/english/legacy-builder.ts');
function harness(save){
 const initial=fixture(),paper=englishLegacyPaper(initial),refs=[];
 const m=new Module(path.resolve('components/english-legacy-builder.tsx'),module);m.paths=module.paths;m.filename=path.resolve('components/english-legacy-builder.tsx');
 const mocks={'react':{useRef:value=>{const ref={current:value};refs.push(ref);return ref;},useState:value=>[value,()=>{}]},'./qb-builder':{__esModule:true,default:()=>null},'@/app/actions/english-paper':{saveEnglishPaper:save}};
 m.require=id=>id in mocks?mocks[id]:require(id);
 m._compile(ts.transpileModule(fs.readFileSync('components/english-legacy-builder.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,m.filename);
 const tree=m.exports.default({draftKey:'owned-test-key',initial,paper});
 return {persist:tree.props.children[1].props.english.saveSettings,initial,paper,refs};
}
test('Legacy English save sends the server token on first and successive saves, never the client clock',async()=>{
 const calls=[],stamp1='2026-11-21T10:00:00.001Z',stamp2='2026-11-21T10:00:00.002Z';
 const h=harness(async(key,draft)=>{calls.push(structuredClone(draft));return {ok:true,updatedAt:calls.length===1?stamp1:stamp2};});
 const before=JSON.stringify(h.initial);
 assert.equal((await h.persist(h.paper.settings)).ok,true);
 assert.equal(calls[0].updatedAt,h.initial.updatedAt);
 const next=structuredClone(h.paper.settings);next.cfg.fontSize=12;
 assert.equal((await h.persist(next)).ok,true);
 assert.equal(calls[1].updatedAt,stamp1);assert.equal(calls[1].fontSize,12);
 assert.equal(JSON.stringify(h.initial),before);
 assert.deepEqual(calls[1].output,h.initial.output);assert.deepEqual(calls[1].selection,h.initial.selection);
});
test('Failed or uncertain saves never advance the token or claim success; double click is guarded',async()=>{
 let resolve,calls=0;const h=harness(async()=>{calls++;return new Promise(r=>resolve=r);});
 const first=h.persist(h.paper.settings);assert.equal((await h.persist(h.paper.settings)).ok,false);assert.equal(calls,1);
 resolve({ok:false,error:'Concurrent tab changed this draft'});assert.equal((await first).ok,false);
 const second=h.persist(h.paper.settings);resolve({ok:true});assert.equal((await second).ok,false);
 let sent;const failed=harness(async(_,draft)=>{sent=draft.updatedAt;throw Error('network uncertain');});
 assert.equal((await failed.persist(failed.paper.settings)).ok,false);assert.equal(sent,failed.initial.updatedAt);
});
