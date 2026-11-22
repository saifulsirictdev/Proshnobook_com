const {test}=require('node:test'),assert=require('node:assert/strict');
const release=require('../scripts/question-bank/release-ssc-geometry-plain.cjs'),plan=release.prepare();
function database(initial=[],fail){
 let rows=new Map(initial.map(q=>[q.id,structuredClone(q)])),settings=new Map(),calls=0;
 const matches=(q,w={})=>Object.entries(w).every(([k,v])=>v&&typeof v==='object'?v.in.includes(q[k]):q[k]===v);
 const db={get rows(){return [...rows.values()]},get settings(){return [...settings.values()]},get calls(){return calls},async $transaction(work){calls++;const oldRows=structuredClone(rows),oldSettings=structuredClone(settings);try{if(fail)fail(calls,rows);return await work({question:{findMany:async({where})=>[...rows.values()].filter(q=>matches(q,where)).map(q=>structuredClone(q)),createMany:async({data})=>{for(const q of data){if(rows.has(q.id))throw Error('duplicate');rows.set(q.id,structuredClone(q));}return{count:data.length}},updateMany:async({where,data})=>{let count=0;for(const q of rows.values())if(matches(q,where)){Object.assign(q,data);count++;}return{count}}},setting:{findUnique:async({where})=>settings.get(where.key)||null,create:async({data})=>{if(settings.has(data.key))throw Error('duplicate receipt');settings.set(data.key,structuredClone(data));return data;},upsert:async({where,create,update})=>{settings.set(where.key,settings.has(where.key)?{...settings.get(where.key),...update}:structuredClone(create));}}});}catch(e){rows=oldRows;settings=oldSettings;throw e;}}};return db;
}
const actor='vercel-owner-release:'+'b'.repeat(40);
const original=require('../scripts/helpers/ssc-math-historical-release-fixture.cjs').historicalReleaseFixture(require('../scripts/question-bank/release-ssc-math.cjs')).records.map(q=>({...q,approved:true}));
test('supplement preview pins exactly 50 canonical prepared IDs across five scopes',()=>{
 assert.equal(plan.records.length,50);assert.equal(plan.scopes.length,5);assert.equal(new Set(plan.records.map(q=>q.id)).size,50);
 assert.equal(plan.digest,'edf0452c7c8345c055e2cc4115be9e0ef0a0b6dc3b96d821e62aca0b660f7b6d');
});
test('explicit fifty-question owner acknowledgement/digest/actor required before DB access',async()=>{
 for(const [digest,who,ack] of [['0'.repeat(64),actor,release.ACK],[plan.digest,'x',release.ACK],[plan.digest,actor,'PUBLISH_5750_SSC_MATH_OWNER_APPROVED_NOT_TEACHER_CERTIFIED']]){
  const db=database();await assert.rejects(release.publish(db,plan,digest,who,ack));assert.equal(db.calls,0);
 }
});
test('approve only the fifty new canonical IDs; live-style approved stock satisfies all quotas; repeat idempotent',async()=>{
 const other={...original[0],id:'unrelated-pending',category:'Class 6',approved:false};
 const db=database([...original,other]);const r=await release.publish(db,plan,plan.digest,actor,release.ACK);
 assert.equal(r.insertedPending,50);assert.equal(r.newlyApproved,50);assert.equal(r.approvedCanonical,50);assert.equal(r.teacherCertified,false);
 assert.equal(r.applicationAutoModel.runs.length,5);assert.ok(r.applicationAutoModel.runs.every(x=>x.diagramQuestions<=5&&x.mcq===30));
 assert.equal(r.applicationAutoModel.writtenItems,23);assert.equal(db.rows.find(q=>q.id==='unrelated-pending').approved,false);
 for(const q of original)assert.deepEqual(db.rows.find(x=>x.id===q.id),q);
 const repeat=await release.publish(db,plan,plan.digest,actor,release.ACK);assert.equal(repeat.newlyApproved,0);assert.equal(repeat.insertedPending,0);assert.equal(repeat.previouslyApproved,50);
});
test('changed canonical content and alias duplicate never get blanket approved',async()=>{
 const changed={...plan.records[0],text:'changed',approved:false};const db=database([...original,changed]);await assert.rejects(release.publish(db,plan,plan.digest,actor,release.ACK));assert.equal(db.rows.find(q=>q.id===changed.id).approved,false);
 const alias={...plan.records[0],id:'legacy-alias',category:'SSC',approved:false};const db2=database([...original,alias]);await assert.rejects(release.publish(db2,plan,plan.digest,actor,release.ACK));assert.equal(db2.rows.find(q=>q.id===alias.id).approved,false);assert.ok(db2.rows.filter(q=>q.source===plan.records[1].source&&!original.some(o=>o.id===q.id)).every(q=>!q.approved));
});
test('failed full-bank model verification rolls approval back, retaining Pending only',async()=>{
 const db=database();await assert.rejects(release.publish(db,plan,plan.digest,actor,release.ACK));assert.equal(db.rows.length,50);assert.ok(db.rows.every(q=>!q.approved));
});
