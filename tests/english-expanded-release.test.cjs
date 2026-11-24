const {test}=require('node:test'),assert=require('node:assert/strict');
const api=require('../scripts/english/release-expanded-models.cjs'),plan=api.prepare();
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
test('Expanded manifest freezes exactly 1144 targets and 440 Class8 read-only entries',()=>{
 assert.equal(plan.digest,api.FROZEN);assert.equal(plan.items.length,1144);assert.equal(plan.readOnly.length,440);
 assert.ok(plan.items.every(p=>!(p.draft.selection.grade===8&&p.draft.selection.paper===2)));
 assert.equal(api.SCOPES.length,12);assert.equal(api.WRITE_SCOPES.length,11);
});
test('Preview is read-only; exact consent imports Pending then approves only frozen targets and preserves old approvals',async()=>{
 const f=fixture(),originals=new Map(f.store),p=plan.items[0];
 const existing=JSON.stringify({status:'APPROVED',draft:p.draft,group:p.group,...('review'in p?{review:p.review}:{}),reviewedBy:'existing-reviewer'});f.store.set(p.key,existing);
 const preview=await api.preview(f.db,plan);assert.equal(preview.missing,1143);assert.equal(preview.approved,1);assert.equal(f.writes,0);
 const r=await api.release(f.db,plan,api.FROZEN,api.ACK,'2026-11-20T12:00:00.000Z');
 assert.equal(r.inserted,1143);assert.equal(r.approved,1143);assert.equal(r.preserved,1);assert.equal(r.verified,1144);
 for(const [key,value]of originals)assert.equal(f.store.get(key),value);
 assert.equal(f.store.get(p.key),existing);
 const before=f.writes;assert.equal((await api.release(f.db,plan,api.FROZEN,api.ACK)).alreadyApplied,true);assert.equal(f.writes,before);
});
test('Rejected, reopened, altered and concurrent decisions roll back rather than revive or overwrite',async()=>{
 for(const change of [{status:'REJECTED'},{status:'PENDING',previousDecision:{status:'REJECTED'}},{status:'PENDING',draft:{}}]){
  const f=fixture(),p=plan.items[0],r={status:'PENDING',draft:p.draft,...('review'in p?{review:p.review}:{}),...change};f.store.set(p.key,JSON.stringify(r));const before=new Map(f.store);
  await assert.rejects(api.release(f.db,plan,api.FROZEN,api.ACK));assert.equal(f.writes,0);assert.deepEqual(f.store,before);
 }
 const f=fixture();await api.release(f.db,plan,api.FROZEN,api.ACK);const p=plan.items[0],r=JSON.parse(f.store.get(p.key));r.status='REJECTED';f.store.set(p.key,JSON.stringify(r));const count=f.writes;
 await assert.rejects(api.release(f.db,plan,api.FROZEN,api.ACK));assert.equal(f.writes,count);assert.equal(JSON.parse(f.store.get(p.key)).status,'REJECTED');
});
test('Tampered content/read-only scope, missing previous release, and absent exact consent stop before writes',async()=>{
 const f=fixture();for(const [digest,ack]of [['wrong',api.ACK],[api.FROZEN,'yes']])await assert.rejects(api.release(f.db,plan,digest,ack));
 const changed=structuredClone(plan);changed.items[0].draft.name+=' altered';await assert.rejects(api.release(f.db,changed,api.FROZEN,api.ACK));
 const forged={...plan,readOnly:[]};await assert.rejects(api.release(f.db,forged,api.FROZEN,api.ACK));
 f.store.delete(plan.readOnly[0].key);await assert.rejects(api.release(f.db,plan,api.FROZEN,api.ACK));assert.equal(f.writes,0);
});
test('Compare-and-swap conflicts roll back newly inserted Pending rows and never create a success receipt',async()=>{
 const f=fixture({failCAS:true}),before=new Map(f.store);await assert.rejects(api.release(f.db,plan,api.FROZEN,api.ACK));
 assert.equal(f.writes,0);assert.deepEqual(f.store,before);assert.equal(f.store.has(api.AUDIT_KEY),false);
});
test('Production verifier consumes actual DB record values, rejects missing keys, and assembles 480 rotations without a provider',async()=>{
 const f=fixture();await api.release(f.db,plan,api.FROZEN,api.ACK);
 // Use a live read over the fixture map, rather than the last transaction's copy.
 const db={setting:{findMany:async({where})=>[...f.store].filter(([k])=>where.key.in.includes(k)).map(([key,value])=>({key,value}))}};
 const r=await api.verifyAutoModels(db,plan);assert.equal(r.models,480);assert.equal(r.providerCalls,0);assert.equal(r.scopes.length,12);assert.ok(r.scopes.every(s=>s.missing===0));
 const key=plan.items[0].key,original=f.store.get(key),altered=JSON.parse(original);altered.draft.name+=' altered';f.store.set(key,JSON.stringify(altered));await assert.rejects(api.verifyAutoModels(db,plan));
 f.store.set(key,original);f.store.delete(key);await assert.rejects(api.verifyAutoModels(db,plan));
});

test('Preparing other grades in any sequence cannot mutate frozen drafts or existing default headers',()=>{
 const before=JSON.stringify(plan),registry=require('../lib/english/prepared-items.ts');
 for(const {grade,paper}of [...api.SCOPES].reverse())registry.preparedEnglishItems(grade,paper);
 assert.equal(JSON.stringify(plan),before);assert.equal(api.prepare().digest,api.FROZEN);
 assert.equal(plan.items.find(p=>p.draft.selection.grade===10).draft.header.fields.subject.value,'বিষয় / সিলেবাস');
});
test('Read-only diagnostics disclose bounded scope counts and differing field names, not values',async()=>{
 const f=fixture(),p=plan.items[0];f.store.set(p.key,JSON.stringify({status:'REJECTED',draft:{...p.draft,name:'private-sentinel-title'},review:{private:'sentinel-secret'},previousDecision:{status:'APPROVED'}}));
 const result=await api.diagnose(f.db,plan);assert.equal(f.writes,0);assert.equal(result.scopes.length,12);
 const scope=result.scopes.find(s=>s.grade===p.draft.selection.grade&&s.paper===p.draft.selection.paper);
 assert.equal(scope.rejected,1);assert.equal(scope.reopened,1);assert.equal(scope.draftMismatch,1);assert.equal(scope.reviewMismatch,1);assert.deepEqual(scope.mismatchFields,['name']);
 assert.doesNotMatch(JSON.stringify(result),/private-sentinel|sentinel-secret/);
});
