const {test}=require('node:test'),assert=require('node:assert/strict');
const {prepare,save,ACK}=require('../scripts/english/import-class8-english2-pending.cjs');
const plan=prepare();
function database(seed=[],receipts=[]){
 const rows=structuredClone(seed),settings=new Map(receipts.map(r=>[r.key,r]));
 const tx={question:{findMany:async({where})=>structuredClone(rows.filter(q=>q.category===where.category&&q.subject===where.subject&&q.topic===where.topic)),create:async({data})=>{if(rows.some(q=>q.id===data.id))throw Error('ID conflict');rows.push({...structuredClone(data),createdAt:'fixed-test-date'});}},setting:{findUnique:async({where})=>settings.get(where.key),create:async({data})=>settings.set(data.key,data)}};
 return {rows,settings,$transaction:async(f,o)=>{assert.equal(o.isolationLevel,'Serializable');const before=structuredClone(rows),old=new Map(settings);try{return await f(tx);}catch(e){rows.splice(0,rows.length,...before);settings.clear();for(const [k,v]of old)settings.set(k,v);throw e;}}};
}
test('Class8 owner CLI preview is stable and exclusively 11 x 40 Second Paper SQ sets',()=>{
 assert.equal(plan.scopes.length,11);assert.equal(plan.digest,prepare().digest);
 assert.equal(plan.preview.reduce((n,s)=>n+s.count,0),440);
 for(const s of plan.preview){assert.equal(s.category,'Class 8');assert.equal(s.subject,'English 2nd Paper');}
});
test('Class8 owner CLI requires matching reviewed digest and explicit Pending-only acknowledgement before DB access',async()=>{
 await assert.rejects(save({},plan,plan.digest,''),/consent/);
 await assert.rejects(save({},plan,'0'.repeat(64),ACK),/digest/);
 const changed=structuredClone(plan);changed.scopes[0].batch.records[0].explanation+=' altered';
 await assert.rejects(save({},changed,plan.digest,ACK),/digest/);
});
test('Class8 owner CLI inserts only Pending, never overwrites existing records/receipts and reconciles missing rows',async()=>{
 const db=database();const first=await save(db,plan,plan.digest,ACK);
 assert.equal(first.inserted,440);assert.equal(first.verified,440);assert.equal(db.settings.size,11);
 assert.ok(db.rows.every(q=>q.approved===false&&q.category==='Class 8'&&q.subject==='English 2nd Paper'));
 db.rows[0].approved=true;db.rows[1].source='REJECTED_LEGACY_KEEP';
 const snapshot=JSON.stringify(db.rows),receipts=JSON.stringify([...db.settings]);
 const again=await save(db,plan,plan.digest,ACK);assert.equal(again.inserted,0);assert.equal(again.preserved,440);
 assert.equal(JSON.stringify(db.rows),snapshot);assert.equal(JSON.stringify([...db.settings]),receipts);
 db.rows.pop();const repaired=await save(db,plan,plan.digest,ACK);assert.equal(repaired.inserted,1);assert.equal(repaired.preserved,439);
 assert.equal(db.rows[0].approved,true);assert.equal(db.rows[1].source,'REJECTED_LEGACY_KEEP');assert.equal(JSON.stringify([...db.settings]),receipts);
});
test('Class8 owner CLI verification failure rolls back instead of claiming import success',async()=>{
 const db=database();const broken={$transaction:(f,o)=>db.$transaction(tx=>f({...tx,question:{...tx.question,create:async()=>{}}}),o)};
 await assert.rejects(save(broken,plan,plan.digest,ACK),/verification|Pending/);assert.equal(db.rows.length,0);assert.equal(db.settings.size,0);
});
