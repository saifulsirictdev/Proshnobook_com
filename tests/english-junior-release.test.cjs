const {test}=require('node:test'),assert=require('node:assert/strict');
const api=require('../scripts/english/release-junior-expansion.cjs'),plan=api.prepare();
function fixture({failCAS=false}={}){
 let store=new Map(plan.readOnly.map(p=>[p.key,JSON.stringify({status:'APPROVED',draft:p.draft,review:p.review,reviewedBy:'previous-owner'})]));
 const untouched='unrelated:pending';store.set(untouched,JSON.stringify({status:'PENDING',text:'not in this release'}));
 let writes=0;
 const db={setting:null,async $transaction(fn){const copy=new Map(store);let local=0;
  const setting={async findMany({where}){return [...copy].filter(([k])=>where.key.in.includes(k)).map(([key,value])=>({key,value}));},async findUnique({where}){return copy.has(where.key)?{key:where.key,value:copy.get(where.key)}:null;},async createMany({data}){for(const r of data){if(copy.has(r.key))throw Error('duplicate');copy.set(r.key,r.value);local++;}return{count:data.length};},async updateMany({where,data}){if(failCAS||copy.get(where.key)!==where.value)return{count:0};copy.set(where.key,data.value);local++;return{count:1};},async create({data}){if(copy.has(data.key))throw Error('duplicate receipt');copy.set(data.key,data.value);local++;}};
  const result=await fn({setting});store=copy;writes+=local;db.setting=setting;return result;
 }};
 db.setting={async findMany({where}){return [...store].filter(([k])=>where.key.in.includes(k)).map(([key,value])=>({key,value}));}};
 return {db,get store(){return store},get writes(){return writes},untouched};
}
test('Frozen manifest contains only the latest 64 groups, old 1584 are read-only',()=>{
 assert.equal(plan.digest,api.FROZEN);assert.equal(plan.items.length,64);assert.equal(plan.readOnly.length,1584);
 assert.ok(plan.items.every(p=>[6,7].includes(p.draft.selection.grade)&&p.draft.selection.paper===2));
});
test('Read-only preview then narrowly authorized import, approval, audit and idempotent repeat',async()=>{
 const f=fixture(),originals=new Map(f.store),p=plan.items[0];
 const existing=JSON.stringify({status:'APPROVED',draft:p.draft,group:p.group,review:p.review,reviewedBy:'existing-reviewer'});f.store.set(p.key,existing);
 assert.equal((await api.preview(f.db,plan)).missing,63);assert.equal(f.writes,0);
 const r=await api.release(f.db,plan,api.FROZEN,api.ACK);assert.equal(r.inserted,63);assert.equal(r.approved,63);assert.equal(r.preserved,1);assert.equal(r.verified,64);
 for(const [key,value]of originals)assert.equal(f.store.get(key),value);
 assert.equal(f.store.get(p.key),existing);
 const receipt=JSON.parse(f.store.get(api.AUDIT_KEY));assert.equal(receipt.independentTeacherAttestation,false);
 const newlyApproved=JSON.parse(f.store.get(plan.items[1].key));assert.equal(newlyApproved.authorization,'USER_EXPLICIT_APPROVE_LATEST_64_JUNIOR_GROUPS');assert.equal(newlyApproved.independentTeacherAttestation,false);
 const before=f.writes;assert.equal((await api.release(f.db,plan,api.FROZEN,api.ACK)).alreadyApplied,true);assert.equal(f.writes,before);
});
test('Rejected, reopened, changed content and revoked previous release roll back',async()=>{
 for(const change of [{status:'REJECTED'},{status:'PENDING',previousDecision:{status:'REJECTED'}},{draft:{}}]){
  const f=fixture(),p=plan.items[0];f.store.set(p.key,JSON.stringify({status:'PENDING',draft:p.draft,review:p.review,...change}));const before=new Map(f.store);
  await assert.rejects(api.release(f.db,plan,api.FROZEN,api.ACK));assert.equal(f.writes,0);assert.deepEqual(f.store,before);
 }
 const f=fixture();await api.release(f.db,plan,api.FROZEN,api.ACK);const p=plan.items[0],r=JSON.parse(f.store.get(p.key));r.status='REJECTED';f.store.set(p.key,JSON.stringify(r));const before=f.writes;
 await assert.rejects(api.release(f.db,plan,api.FROZEN,api.ACK));assert.equal(f.writes,before);
});
test('Wrong consent, tampered targets, substituted guards and absent historical approval stop writes',async()=>{
 const f=fixture();for(const [digest,ack]of [['wrong',api.ACK],[api.FROZEN,'yes']])await assert.rejects(api.release(f.db,plan,digest,ack));
 const changed=structuredClone(plan);changed.items[0].draft.name+=' altered';await assert.rejects(api.release(f.db,changed,api.FROZEN,api.ACK));
 const forged=structuredClone(plan);forged.readOnly[0]=plan.items[0];await assert.rejects(api.release(f.db,forged,api.FROZEN,api.ACK));
 f.store.delete(plan.readOnly[0].key);await assert.rejects(api.release(f.db,plan,api.FROZEN,api.ACK));assert.equal(f.writes,0);
});
test('CAS failure rolls back inserts, decisions and audit receipt atomically',async()=>{
 const f=fixture({failCAS:true}),before=new Map(f.store);await assert.rejects(api.release(f.db,plan,api.FROZEN,api.ACK));assert.equal(f.writes,0);assert.deepEqual(f.store,before);assert.equal(f.store.has(api.AUDIT_KEY),false);
});
test('DB-value verifier validates 80 junior model assemblies with 5 approved sets per item, zero providers',async()=>{
 const f=fixture();await api.release(f.db,plan,api.FROZEN,api.ACK);
 const r=await api.verify(f.db,plan);assert.equal(r.providerCalls,0);assert.equal(r.scopes.length,2);
 for(const s of r.scopes){assert.equal(s.approvedGroups,40);assert.equal(s.newApprovedGroups,32);assert.equal(s.verifiedAssemblies,40);assert.equal(s.marks,50);assert.ok(Object.values(s.perItem).every(count=>count===5));}
 const p=plan.items[0],r1=JSON.parse(f.store.get(p.key));r1.status='PENDING';f.store.set(p.key,JSON.stringify(r1));await assert.rejects(api.verify(f.db,plan));
});
