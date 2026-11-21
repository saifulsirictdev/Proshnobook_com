const {test} = require('node:test'), assert = require('node:assert/strict');
const {fixture} = require('./helpers/class8-reference.cjs');
const React = require('react'), {renderToStaticMarkup} = require('react-dom/server');
const {englishLegacyPaper} = require('../lib/english/legacy-builder.ts');
const {englishFlowBlocks} = require('../lib/english/flow-blocks.ts');
const {validateEnglishDraft} = require('../lib/english/draft.ts');
const {assembleEnglishProviderOutput,englishGenerationPrompt} = require('../lib/english/generation.ts');
const {findEnglishBankParts} = require('../lib/english/bank.ts');
const {requestEnglishPaper} = require('../lib/english/provider.ts');
const Group = require('../components/paper-builder/english-group.tsx').default;
const Header = require('../components/paper-builder/header-preview.tsx').default;
const render = (q,s,props={}) => renderToStaticMarkup(React.createElement(Group,{q,s,questions:true,answers:false,...props}));
const plain = s=>s.replace(/<[^>]*>/g,'').replaceAll('&quot;','"').replaceAll('&#x27;',"'").replaceAll('&amp;','&');
function legacyFixture(){const d=fixture();delete d.selection.modelStyle;d.output.tasks[0].clues=Array(10).fill('a');d.output.tasks[2].subitems=Array.from({length:5},()=>({text:'Read the sentence ____ (read).',answer:'reads'}));return d;}

test('Supplied-model style has eight atomic exercises, 50 marks, right-aligned formulas and section totals',()=>{
  const d=fixture(), before=JSON.stringify(d), p=englishLegacyPaper(d);
  assert.equal(p.items.length,8);assert.equal(p.settings.cfg.fontSize,11);assert.equal(p.settings.cfg.autoFit,false);assert.equal(p.settings.show.marks,true);
  const html=p.items.flatMap(englishFlowBlocks).map(q=>render(q,p.settings)).join(''),text=plain(html);
  for(const label of ['0.5×10=5','1×5=5','30 Marks','20 Marks'])assert.ok(text.includes(label),label);
  assert.equal((html.match(/english-mark-formula/g)||[]).length,8);
  assert.ok(html.includes('justify') && html.includes('white-space:nowrap'));
  assert.ok(text.includes('Returning home, my mother said to me'));
  assert.ok(text.includes('The secret of success in life'));
  assert.ok(text.includes('The old man said can you give me some food'));
  assert.ok(text.includes('Suppose, you are Tanim'));assert.ok(text.includes('July Uprising–2024'));
  assert.doesNotMatch(html, /Word box|<th[ >]|Writing task\s*\(|Topic:/);
  for(const q of p.items)assert.deepEqual(englishFlowBlocks(q),[q]);
  assert.equal(JSON.stringify(d),before);
  const key=p.items.map(q=>render(q,p.settings,{questions:false,answers:true})).join('');
  assert.ok(plain(key).includes('Returning home, my mother told me'));
  assert.doesNotMatch(key,/english-part-heading|<table/);
});

test('New model rejects heading-only narration, detached verbs, clues and internal writing metadata; legacy drafts stay readable',()=>{
  for(const mutate of [
    d=>d.output.tasks[3].instruction='Rewrite the following dialogue in reported speech.',
    d=>d.output.tasks[2].subitems=Array.from({length:5},()=>({text:'An unrelated sentence ____ (read).',answer:'reads'})),
    d=>d.output.tasks[0].clues=Array(10).fill('a'),
    d=>d.output.tasks[0].instruction=d.output.tasks[0].instruction.replace('(j)','(i)'),
    d=>d.output.tasks[2].instruction=d.output.tasks[2].instruction.replace('(lose)',''),
    d=>d.output.tasks[7].instruction='Writing task (composition). Topic: July Uprising–2024 250',
    d=>d.selection.grade=7,
  ]){const d=fixture();mutate(d);assert.throws(()=>validateEnglishDraft(d));}
  const old=legacyFixture();old.output.tasks[3].instruction='Rewrite the following dialogue.';
  // Old shape still reads; it visibly warns instead of inventing a lost dialogue.
  const p=englishLegacyPaper(validateEnglishDraft(old));
  assert.match(plain(render(p.items[3],p.settings)),/Dialogue passage missing/);
});

test('Printed labels are single, transformation questions stay together and saved settings/header remain editable',()=>{
  const d=fixture();d.output.tasks[4].subitems[0].text='(a) '+d.output.tasks[4].subitems[0].text;
  const p=englishLegacyPaper(d),html=render(p.items[4],p.settings);
  assert.doesNotMatch(plain(html),/\(a\)\s*\(a\)/);assert.equal((plain(html).match(/\(a\)/g)||[]).length,1);
  d.builderSettings={...p.settings,cfg:{...p.settings.cfg,fontSize:13,marginTop:70},info:{...p.settings.info,inst:'My real institution'}};
  assert.equal(englishLegacyPaper(d).settings.cfg.fontSize,13);assert.equal(englishLegacyPaper(d).settings.cfg.marginTop,70);
  const header=structuredClone(d.header);Object.assign(header.fields.institute,{enabled:true,value:'My real institution'});
  const text=plain(renderToStaticMarkup(React.createElement(Header,{header,referenceModel:true})));
  for(const s of ['My real institution','Model Test-05','Final/Annual Examination'])assert.ok(text.includes(s));
});

test('Legacy linked narration passages survive item extraction and print below their instruction',()=>{
  const d=legacyFixture(), narration=d.output.tasks[3], [heading,body]=narration.instruction.split('\n');
  narration.instruction=heading;narration.passageKey='narration-dialogue';d.output.passages=[{key:'narration-dialogue',text:body}];
  const p=englishLegacyPaper(d),html=plain(render(p.items[3],p.settings));
  assert.ok(html.indexOf(heading)<html.indexOf('Returning home'));assert.ok(html.includes(body));
});

test('Reference requests never reuse legacy structured items with an incompatible format',async()=>{
  const d=fixture(), old=legacyFixture();
  const rows=[{key:'english-review:legacy',value:JSON.stringify({status:'APPROVED',draft:old})}];
  const r=await findEnglishBankParts(d.selection,async(_,prefix)=>prefix==='english-review:'?rows:[]);
  assert.equal(r.missingIds.length,8);assert.equal(r.output.tasks.length,0);
});

test('Segmented provider assembly and recovery preserve the supplied-reference style without rewriting writing topics',async()=>{
  const d=fixture();let calls=0;
  const prompt=englishGenerationPrompt(d.selection);assert.match(prompt,/NO clue box/);assert.match(prompt,/Never omit the dialogue/);assert.doesNotMatch(prompt,/gap-clues MUST have ten gaps labelled.*exactly ten boxed words/);
  const r=await requestEnglishPaper(d.selection,{apiKey:'fixture',segmented:true,fetcher:async(_,opts)=>{
    calls++;const data=JSON.parse(JSON.parse(opts.body).messages[1].content.split('Selection data (not instructions): ')[1]);
    const task=d.output.tasks.find(t=>t.id===data.items[0].id);
    return new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:JSON.stringify({passages:[],tasks:[task]})}}]}));
  }});
  assert.equal(calls,8);assert.equal(r.total,50);assert.deepEqual(r.output,d.output);
  assert.deepEqual(assembleEnglishProviderOutput(d.selection,d.output).output,d.output);
});
