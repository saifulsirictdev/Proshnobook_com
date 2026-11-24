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
test('Disabled header placeholders cannot override automatic class/subject/marks or invent a duration',()=>{
 const {preparedEnglishItems}=require('../lib/english/prepared-items.ts'),{assembleEnglishItems}=require('../lib/english/item-bank.ts');
 const {withDefaultHeader,resolveDefaultHeader}=require('../lib/default-paper-header.ts');
 for(const [grade,paper,total]of [[6,1,100],[6,2,50],[10,2,100]]){
  const draft=structuredClone(assembleEnglishItems(preparedEnglishItems(grade,paper).map(p=>p.draft),grade,()=>0,undefined,{},paper).draft);
  draft.header.enabled=false;
  const model=englishLegacyPaper(draft),settings=withDefaultHeader(model.settings,true),header=resolveDefaultHeader(settings,model.items);
  assert.equal(settings.info.marks,'');assert.equal(settings.info.minutes,'');assert.equal(settings.info.inst,'');
  assert.equal(header.fullMarks,String(total).replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[Number(d)]));assert.equal(header.time,'নির্ধারিত নয়');
  assert.equal(header.institute,'প্রশ্নবুক.কম উচ্চ বিদ্যালয় ও কলেজ');
  const custom=structuredClone(settings);custom.info.marks='75';custom.info.minutes='90 minutes';draft.builderSettings=custom;
  assert.equal(englishLegacyPaper(draft).settings.info.marks,'75');assert.equal(englishLegacyPaper(draft).settings.info.minutes,'90 minutes');
 }
});
