const {test}=require('node:test'),assert=require('node:assert/strict');
const {prepare}=require('../scripts/english/import-class8-english2-pending.cjs');
const {IMPORT_DIGEST,ACK,AUDIT_KEY,targets,preview,approve}=require('../scripts/english/approve-class8-english2.cjs');
const plan=prepare(),scope=targets(plan);
function database(){
 const rows=scope.rows.map(q=>({...structuredClone(q),approved:false,createdAt:new Date('2026-11-21T04:41:00Z')}));
 rows.push({...structuredClone(rows[0]),id:'unrelated-class8-pending',source:'OTHER_IMPORT'}, {...structuredClone(rows[0]),id:'unrelated-ssc-pending',category:'SSC'}, {...structuredClone(rows[0]),id:'old-approved',approved:true,source:'MANUAL'});
 const settings=new Map(scope.groups.map(g=>[`preparedimport:v1:${g.digest}`,{key:`preparedimport:v1:${g.digest}`,value:JSON.stringify({actorId:'owner:arena:class8_english2_release:publish_and_pending',authorization:'OWNER_SCOPED_PENDING_ONLY',batchId:g.batchId,category:'Class 8',subject:'English 2nd Paper',topic:g.topic,inserted:40,skipped:0,ids:g.rows.map(q=>q.id),importDigest:IMPORT_DIGEST})}]));
 const calls=[];let transactions=0,failCount=false,mutate=false,failAudit=false;
 const matches=(row,where)=>Object.entries(where).every(([k,v])=>v&&typeof v==='object'&&'in'in v?v.in.includes(row[k]):row[k]===v);
 const tx={question:{findMany:async({where})=>structuredClone(rows.filter(q=>matches(q,where))),updateMany:async({where,data})=>{
  calls.push({where:structuredClone(where),data:structuredClone(data)});
  assert.deepEqual(data,{approved:true});assert.ok(where.id.in.length>0&&where.id.in.length<=40);assert.equal(where.category,'Class 8');assert.equal(where.subject,'English 2nd Paper');assert.equal(where.approved,false);assert.match(where.source,/^PREPARED_DRAFT:[a-f0-9]{64}$/);
  let count=0;for(const q of rows)if(matches(q,where)){Object.assign(q,data);count++;}
  if(mutate)rows[0].createdAt=new Date('2030-01-01');
  return {count:failCount?0:count};
 }},setting:{findUnique:async({where})=>structuredClone(settings.get(where.key)),create:async({data})=>{if(failAudit)throw Error('audit failed');assert.equal(data.key,AUDIT_KEY);assert.ok(!settings.has(data.key));settings.set(data.key,structuredClone(data));}}};
 return {rows,settings,calls,tx,get transactions(){return transactions;},badCount(){failCount=true;},mutate(){mutate=true;},badAudit(){failAudit=true;},$transaction:async(f,o)=>{
  transactions++;assert.equal(o.isolationLevel,'Serializable');
  const old=structuredClone(rows),oldSettings=structuredClone([...settings]);
  try{return await f(tx);}catch(e){rows.splice(0,rows.length,...old);settings.clear();for(const [k,v]of oldSettings)settings.set(k,v);throw e;}
 }};
}
const run=async db=>{const p=await preview(db,plan);return approve(db,plan,IMPORT_DIGEST,p.previewDigest,ACK,'2026-11-21T06:00:00Z');};
test('Owner approval scope is pinned to the exact reviewed import and 440 unique deterministic IDs',()=>{
 assert.equal(plan.digest,IMPORT_DIGEST);assert.equal(scope.ids.length,440);assert.equal(scope.groups.length,11);
 for(const s of scope.groups)assert.equal(s.rows.length,40);
 const changed=structuredClone(plan);changed.scopes[0].batch.records[0].explanation+='edit';assert.throws(()=>targets(changed),/digest/);
});
test('Approval preview is read-only; write requires explicit owner approval consent and both digests',async()=>{
 const db=database(),before=JSON.stringify(db.rows),settings=JSON.stringify([...db.settings]);
 const p=await preview(db,plan);assert.equal(p.matched,440);assert.equal(p.pending,440);assert.equal(p.alreadyApproved,0);assert.equal(p.alreadyApplied,false);
 assert.equal(db.calls.length,0);assert.equal(JSON.stringify(db.rows),before);assert.equal(JSON.stringify([...db.settings]),settings);
 for(const [digest,pd,ack]of [[IMPORT_DIGEST,p.previewDigest,''],['0'.repeat(64),p.previewDigest,ACK],[IMPORT_DIGEST,'bad',ACK]])await assert.rejects(approve({},plan,digest,pd,ack),/consent|digest/);
});
test('Only the 440 imported rows are approved; content, timestamps, other decisions and import receipts remain unchanged',async()=>{
 const db=database();db.rows[0].approved=true;
 const before=structuredClone(db.rows),oldReceipts=JSON.stringify([...db.settings]);const r=await run(db);
 assert.equal(r.changed,439);assert.equal(r.previouslyApproved,1);assert.equal(r.verified,440);assert.equal(r.status,'OWNER_APPROVAL_VERIFIED');
 for(let i=0;i<440;i++)assert.deepEqual(db.rows[i],{...before[i],approved:true});
 assert.deepEqual(db.rows.slice(440),before.slice(440));
 const audit=db.settings.get(AUDIT_KEY);assert.ok(audit);assert.equal(JSON.parse(audit.value).authorization,'OWNER_EXPLICIT_APPROVED_KORO_AND_CONTINUE');
 db.settings.delete(AUDIT_KEY);assert.equal(JSON.stringify([...db.settings]),oldReceipts);db.settings.set(AUDIT_KEY,audit);
 const snapshot=JSON.stringify(db.rows),receipts=JSON.stringify([...db.settings]),count=db.calls.length;
 const repeat=await run(db);assert.equal(repeat.changed,0);assert.equal(repeat.alreadyApplied,true);assert.equal(db.calls.length,count);assert.equal(JSON.stringify(db.rows),snapshot);assert.equal(JSON.stringify([...db.settings]),receipts);
});
test('Missing, changed, foreign-source or rejected targets fail closed before any approval',async()=>{
 for(const change of [db=>db.rows.shift(),db=>db.rows[0].explanation+=' edited',db=>db.rows[0].category='SSC',db=>db.rows[0].source='REJECTED_LEGACY_KEEP',db=>db.rows[0].options={kind:'changed'}]){
  const db=database();change(db);await assert.rejects(run(db),/Missing|changed/);assert.equal(db.calls.length,0);assert.ok(!db.settings.has(AUDIT_KEY));
 }
});
test('Missing/malformed, forged, duplicate or broader import receipts cannot authorize approval',async()=>{
 for(const change of [r=>r.ids.pop(),r=>r.ids[0]=r.ids[1],r=>r.ids.push('unrelated-class8-pending'),r=>r.importDigest='0'.repeat(64),r=>r.actorId='someone-else',r=>r.category='SSC',r=>r.inserted=39]){
  const db=database(),key=`preparedimport:v1:${scope.groups[0].digest}`,r=JSON.parse(db.settings.get(key).value);change(r);db.settings.get(key).value=JSON.stringify(r);
  await assert.rejects(run(db),/receipt/);assert.equal(db.calls.length,0);
 }
 for(const value of [null,'not json']){const db=database(),key=`preparedimport:v1:${scope.groups[0].digest}`;if(value===null)db.settings.delete(key);else db.settings.get(key).value=value;await assert.rejects(run(db),/receipt/);assert.equal(db.calls.length,0);}
});
test('Stale live preview or later approval revocation cannot be silently overwritten',async()=>{
 const db=database(),p=await preview(db,plan);db.rows[0].approved=true;
 await assert.rejects(approve(db,plan,IMPORT_DIGEST,p.previewDigest,ACK),/stale/);assert.equal(db.calls.length,0);
 await run(db);db.rows[1].approved=false;const n=db.calls.length;
 await assert.rejects(run(db),/revoked/);assert.equal(db.rows[1].approved,false);assert.equal(db.calls.length,n);
});
test('Incorrect CAS count, unexpected field mutation, or audit failure rolls back every approval',async()=>{
 for(const trigger of ['badCount','mutate','badAudit']){
  const db=database(),before=JSON.stringify(db.rows),receipts=JSON.stringify([...db.settings]);db[trigger]();
  await assert.rejects(run(db),/Concurrent|mutation|audit/);assert.equal(JSON.stringify(db.rows),before);assert.equal(JSON.stringify([...db.settings]),receipts);
 }
});
test('Corrupt approval audit is not treated as success or permission to write again',async()=>{
 const db=database();db.settings.set(AUDIT_KEY,{key:AUDIT_KEY,value:'{}'});
 await assert.rejects(run(db),/audit/);assert.equal(db.calls.length,0);
});
