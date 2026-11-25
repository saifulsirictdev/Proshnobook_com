const {test}=require('node:test'),assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const release=require('../scripts/question-bank/release-ssc-chemistry.cjs'),plan=release.prepare(),actor='vercel-owner-release:'+'a'.repeat(40);
const evidence={verified:415,assetsDigest:createHash('sha256').update(JSON.stringify(plan.preview.assets)).digest('hex'),origin:'https://proshnobook.com'};
const publish=db=>release.publish(db,plan,plan.digest,actor,release.ACK,evidence);
function database(initial=[],fail){
 let rows=new Map(initial.map(q=>[q.id,structuredClone(q)])),settings=new Map(),calls=0;
 const matches=(q,w={})=>Object.entries(w).every(([k,v])=>v&&typeof v==='object'?v.in.includes(q[k]):q[k]===v);
 const db={get rows(){return [...rows.values()]},get settings(){return [...settings.values()]},get calls(){return calls},async $transaction(work){calls++;const oldRows=structuredClone(rows),oldSettings=structuredClone(settings);try{if(fail)fail(calls,rows);return await work({question:{findMany:async({where})=>[...rows.values()].filter(q=>matches(q,where)).map(q=>structuredClone(q)),createMany:async({data})=>{for(const q of data){if(rows.has(q.id))throw Error('duplicate');rows.set(q.id,structuredClone(q));}return{count:data.length}},updateMany:async({where,data})=>{let count=0;for(const q of rows.values())if(matches(q,where)){Object.assign(q,data);count++;}return{count}}},setting:{findUnique:async({where})=>settings.get(where.key)||null,create:async({data})=>{if(settings.has(data.key))throw Error('duplicate receipt');settings.set(data.key,structuredClone(data));return data;},upsert:async({where,create,update})=>{settings.set(where.key,settings.has(where.key)?{...settings.get(where.key),...update}:structuredClone(create));}}});}catch(e){rows=oldRows;settings=oldSettings;throw e;}}};return db;
}
test('exact owner-approved Chemistry scope, counts and diagram manifest are pinned',()=>{
 assert.equal(plan.digest,'4e87310512e4e02735a9e3406d48ebf29e4284d8ef2e8f9617dbe8819562acc8');
 assert.equal(plan.records.length,8110);assert.equal(plan.scopes.length,82);assert.equal(plan.preview.assets.length,415);
 assert.deepEqual(plan.preview.counts,{MCQ:5500,CQ:1550,SQ:1060});assert.equal(plan.preview.teacherCertified,false);
 const s=plan.scopes[0],q=s.batch.records[0];assert.equal(s.records[0].id,'prepared_'+createHash('sha256').update(JSON.stringify([s.batch.category,s.batch.subject,s.batch.topic,q.kind,plan.normalizeStem(q.text)])).digest('hex'));
});
test('explicit pinned owner ack, actor and verified live assets required before DB access',async()=>{
 for(const [digest,who,ack,ev] of [['0'.repeat(64),actor,release.ACK,evidence],[plan.digest,'admin',release.ACK,evidence],[plan.digest,actor,'yes',evidence],[plan.digest,actor,release.ACK,null],[plan.digest,actor,release.ACK,{...evidence,verified:414}],[plan.digest,actor,release.ACK,{...evidence,assetsDigest:'bad'}]]){
  const db=database();await assert.rejects(release.publish(db,plan,digest,who,ack,ev));assert.equal(db.calls,0);
 }
});
test('Pending then approval, unrelated rows preserved, immutable audits and idempotent repeat',async()=>{
 const other={id:'other',category:'Class 9',subject:'রসায়ন',topic:'unrelated',approved:false},db=database([other]);
 const r=await publish(db);assert.equal(r.insertedPending,8110);assert.equal(r.newlyApproved,8110);assert.equal(r.approvedCanonical,8110);assert.equal(r.teacherCertified,false);assert.equal(r.teacherCertified,false);
 assert.deepEqual(db.rows.find(q=>q.id==='other'),other);assert.equal(db.settings.filter(s=>s.key.startsWith('preparedimport:v1:')).length,82);
 assert.ok(db.settings.some(s=>s.value.includes('teacherCertified')));const audits=new Map(db.settings.map(s=>[s.key,s.value]));
 const twice=await publish(db);assert.equal(twice.insertedPending,0);assert.equal(twice.newlyApproved,0);assert.equal(twice.previouslyApproved,8110);assert.equal(db.rows.length,8111);
 for(const [key,value] of audits)assert.equal(db.settings.find(s=>s.key===key).value,value);
});
test('legacy/alias duplicate fails closed without overwriting or approving it',async()=>{
 for(const category of ['Class 9','SSC']){
  const old={...plan.records[0],id:'legacy',category,approved:false},db=database([old]);await assert.rejects(publish(db),/duplicate/);
  assert.deepEqual(db.rows,[old]);assert.equal(db.settings.length,0);
 }
});
test('canonical content and provenance drift fail closed',async()=>{
 for(const changes of [{text:'changed'},{explanation:'changed'},{source:'AI'},{options:['changed']}]){
  const old={...plan.records[0],...changes,approved:false},db=database([old]);await assert.rejects(publish(db),/changed/);assert.deepEqual(db.rows,[old]);assert.equal(db.settings.length,0);
 }
});
test('previous approval stays approved; no unrelated approvals are changed',async()=>{
 const old={...plan.records[0],approved:true},db=database([old]);const r=await publish(db);assert.equal(r.previouslyApproved,1);assert.equal(r.newlyApproved,8109);assert.deepEqual(db.rows.find(q=>q.id===old.id),old);
});
test('phase 2 failure leaves all new rows pending, no partial approval audit',async()=>{
 const db=database([],n=>{if(n===2)throw Error('approval unavailable')});await assert.rejects(publish(db));assert.equal(db.rows.length,8110);assert.ok(db.rows.every(q=>q.approved===false));assert.ok(!db.settings.some(s=>s.key.includes(':approval:')));
});
test('phase 2 rechecks exact snapshots; mutation rolls back rather than approving',async()=>{
 const db=database([], (n,rows)=>{if(n===2)rows.get(plan.records[0].id).correct='altered'});await assert.rejects(publish(db),/snapshot changed/);assert.ok(db.rows.every(q=>!q.approved));
});
test('live HTTP assets require successful PNG/SVG response and exact bytes',async()=>{
 const fs=require('node:fs'),path=require('node:path');let calls=0;
 const ok=await release.verifyLiveAssets(plan,async url=>{calls++;return{ok:true,headers:new Headers({'content-type':url.endsWith('.png')?'image/png':'image/svg+xml'}),arrayBuffer:async()=>fs.readFileSync(path.join(__dirname,'../public',new URL(url).pathname))}});
 assert.equal(ok.verified,415);assert.equal(calls,415);assert.equal(ok.assetsDigest,evidence.assetsDigest);
 for(const bad of [{ok:false,headers:new Headers()},{ok:true,headers:new Headers({'content-type':'text/html'})},{ok:true,headers:new Headers({'content-type':'image/svg+xml'}),arrayBuffer:async()=>Buffer.from('<svg/>')}])await assert.rejects(release.verifyLiveAssets(plan,async()=>bad),/Live asset/);
});
test('normal application build does not implicitly publish stock',()=>{
 const fs=require('node:fs');assert.equal(JSON.parse(fs.readFileSync('package.json')).scripts.build,'prisma generate && next build --webpack');
 const {spawnSync}=require('node:child_process'),r=spawnSync(process.execPath,['scripts/question-bank/release-ssc-chemistry.cjs','publish',plan.digest,release.ACK],{env:{...process.env,VERCEL_ENV:'preview'},encoding:'utf8'});assert.notEqual(r.status,0);assert.match(r.stderr,/SSC_CHEMISTRY_RELEASE_STOPPED/);
});
