const {test}=require('node:test'),assert=require('node:assert/strict');
require('./helpers/class8-reference.cjs');
const release=require('../scripts/english/release-class8-model.cjs');
const {preparedClass8Paper2Items,class8StructuredDigest}=require('../lib/english/prepared-class8-paper2.ts');
const {assembleEnglishItems}=require('../lib/english/item-bank.ts');
const {englishLegacyPaper}=require('../lib/english/legacy-builder.ts');
const plan=release.prepare();
function harness(){
  let settings=new Map(),questions=plan.originalRows.map(r=>({...structuredClone(r),approved:true})),writes=0,failAt=0;
  const client={question:{findMany:async({where})=>structuredClone(questions.filter(q=>where.id.in.includes(q.id)))},setting:{
    findMany:async({where})=>[...settings.values()].filter(r=>where.key.in.includes(r.key)).map(r=>({...r})),
    findUnique:async({where})=>settings.get(where.key)??null,
    create:async({data})=>{writes++;if(failAt&&writes===failAt)throw Error('simulated failure');if(settings.has(data.key))throw Error('duplicate');settings.set(data.key,{...data});return data;},
    updateMany:async({where,data})=>{const old=settings.get(where.key);if(!old||old.value!==where.value)return{count:0};settings.set(where.key,{...old,...data});return{count:1};}
  }};
  return {db:{...client,$transaction:async(fn,options)=>{assert.equal(options.isolationLevel,'Serializable');const before=structuredClone([...settings]);try{return await fn(client);}catch(e){settings=new Map(before);throw e;}}},settings:()=>settings,questions,writeCount:()=>writes,failAt:n=>failAt=n};
}

test('440 distinct structured adaptations retain 11×40 exact source identities and complete printable questions/keys',()=>{
  assert.equal(preparedClass8Paper2Items(7).length,0);assert.equal(class8StructuredDigest(),release.DIGEST);
  assert.equal(plan.items.length,440);assert.equal(new Set(plan.items.map(p=>p.key)).size,440);
  const registry=require('../lib/english/prepared-items.ts').preparedEnglishItems(8,2);
  assert.equal(registry.length,440);assert.ok(registry.every(p=>p.draft.selection.grade===8 && p.draft.selection.paper===2 && p.draft.selection.modelStyle==='class8-reference-v1'));
  assert.equal(registry.filter(p=>p.group==='verbs').length,40);assert.equal(registry.filter(p=>p.group==='letter-email').length,160);
  const counts=new Map();for(const p of plan.items){counts.set(p.review.batchId,(counts.get(p.review.batchId)||0)+1);assert.equal(p.draft.selection.modelStyle,'class8-reference-v1');assert.ok(p.review.originalExplanation);assert.ok(!p.draft.output.tasks[0].boardSource&&!p.draft.output.tasks[0].schoolSource);}
  assert.equal(counts.size,11);assert.ok([...counts.values()].every(n=>n===40));
  const norm=s=>s.toLowerCase().replace(/[.!?]+$/,'').replace(/\s+/g,' ').trim();
  for(const p of plan.items.filter(p=>p.group==='substitution')){
    const t=p.draft.output.tasks[0],rows=t.table.rows;
    const combinations=new Set(rows.flatMap(a=>rows.flatMap(b=>rows.map(c=>norm([a[0],b[1],c[2]].join(' '))))));
    for(const s of t.subitems)assert.ok(combinations.has(norm(s.answer)),s.answer);
  }
});

test('All forty rotations and every correspondence subtype produce complete 50-mark automatic models without provider calls',()=>{
  const stock=plan.items.map(p=>p.draft);
  for(let index=0;index<40;index++)for(const choice of ['formal-letter','informal-letter','formal-email','informal-email']){
    const filtered=stock.filter(d=>!d.selection.writing['letter-email']||d.selection.writing['letter-email'].choice===choice);
    const r=assembleEnglishItems(filtered,8,()=>(index+.5)/40,undefined,{},2);
    assert.deepEqual(r.missing,[]);assert.equal(r.draft.output.tasks.length,8);
    assert.equal(r.draft.selection.writing['letter-email'].choice,choice);
    assert.equal(englishLegacyPaper(r.draft).items.length,8);
  }
});

test('Release requires exact current owner acknowledgement and frozen digest; preview never writes',async()=>{
  const h=harness();assert.equal((await release.preview(h.db,plan)).targets,440);assert.equal(h.writeCount(),0);
  for(const [digest,ack]of [['0'.repeat(64),release.ACK],[release.DIGEST,'global-approve']])await assert.rejects(()=>release.release(h.db,plan,digest,ack));
  const tampered=structuredClone(plan);tampered.items[0].draft.output.tasks[0].instruction+=' edited';
  await assert.rejects(()=>release.release(h.db,tampered,release.DIGEST,release.ACK));assert.equal(h.writeCount(),0);
});

test('Scoped create/approve preserves source SQs/unrelated decisions, verifies DB assembly and is idempotent without reviving revocations',async()=>{
  const h=harness(),originals=structuredClone(h.questions);
  h.settings().set('english-review:unrelated',{key:'english-review:unrelated',value:'{"status":"REJECTED"}'});
  const r=await release.release(h.db,plan,release.DIGEST,release.ACK);
  assert.equal(r.approved,440);assert.deepEqual(h.questions,originals);assert.equal(h.settings().get('english-review:unrelated').value,'{"status":"REJECTED"}');
  assert.equal((await release.verifyAutoModels(h.db,plan)).providerCalls,0);
  assert.equal((await release.release(h.db,plan,release.DIGEST,release.ACK)).alreadyApplied,true);
  const key=plan.items[0].key,record=JSON.parse(h.settings().get(key).value);record.status='REJECTED';h.settings().set(key,{key,value:JSON.stringify(record)});
  await assert.rejects(()=>release.release(h.db,plan,release.DIGEST,release.ACK),/no automatic revival/);
});

test('Existing target decisions, changed/revoked originals and partial write failures fail closed and roll back',async()=>{
  for(const status of ['APPROVED','PENDING','REJECTED']){
    const h=harness(),key=plan.items[0].key;h.settings().set(key,{key,value:JSON.stringify({status})});
    await assert.rejects(()=>release.release(h.db,plan,release.DIGEST,release.ACK),/never overwrite/);assert.equal(h.writeCount(),0);
  }
  for(const mutation of [q=>q.approved=false,q=>q.text+=' edited']){
    const h=harness();mutation(h.questions[0]);await assert.rejects(()=>release.release(h.db,plan,release.DIGEST,release.ACK));assert.equal(h.writeCount(),0);
  }
  for(const n of [4,441]){const h=harness();h.failAt(n);await assert.rejects(()=>release.release(h.db,plan,release.DIGEST,release.ACK));assert.equal(h.settings().size,0);}
});
