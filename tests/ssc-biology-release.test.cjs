const {test}=require('node:test'),assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const release=require('../scripts/question-bank/release-ssc-biology.cjs'),plan=release.prepare(),actor='vercel-owner-release:'+'a'.repeat(40);
const evidence={verified:45,assetsDigest:createHash('sha256').update(JSON.stringify(plan.preview.assets)).digest('hex'),origin:'https://proshnobook.com'};
const publish=db=>release.publish(db,plan,plan.digest,actor,release.ACK,evidence);
function database(initial=[],fail){
 let rows=new Map(initial.map(q=>[q.id,structuredClone(q)])),settings=new Map(),calls=0;
 const matches=(q,w={})=>Object.entries(w).every(([k,v])=>v&&typeof v==='object'?v.in.includes(q[k]):q[k]===v);
 const db={get rows(){return [...rows.values()]},get settings(){return [...settings.values()]},get calls(){return calls},async $transaction(work){calls++;const oldRows=structuredClone(rows),oldSettings=structuredClone(settings);try{if(fail)fail(calls,rows);return await work({question:{findMany:async({where})=>[...rows.values()].filter(q=>matches(q,where)).map(q=>structuredClone(q)),createMany:async({data})=>{for(const q of data){if(rows.has(q.id))throw Error('duplicate');rows.set(q.id,structuredClone(q));}return{count:data.length}},updateMany:async({where,data})=>{let count=0;for(const q of rows.values())if(matches(q,where)){Object.assign(q,data);count++;}return{count}}},setting:{findUnique:async({where})=>settings.get(where.key)||null,create:async({data})=>{if(settings.has(data.key))throw Error('duplicate receipt');settings.set(data.key,structuredClone(data));return data;},upsert:async({where,create,update})=>{settings.set(where.key,settings.has(where.key)?{...settings.get(where.key),...update}:structuredClone(create));}}});}catch(e){rows=oldRows;settings=oldSettings;throw e;}}};return db;
}
test('exact owner-approved Biology scope, counts and diagram manifest are pinned',()=>{
 assert.equal(plan.digest,'da5b49c70c4634543eeb1f86709dbb8b2ae6c1b75b8c934030fa7010fe53e0b6');
 assert.equal(plan.records.length,4480);assert.equal(plan.scopes.length,45);assert.equal(plan.preview.assets.length,45);
 assert.deepEqual(plan.preview.counts,{MCQ:2800,CQ:700,SQ:980});assert.equal(plan.preview.registeredOfficialBiologyScheme,false);
 const s=plan.scopes[0],q=s.batch.records[0];assert.equal(s.records[0].id,'prepared_'+createHash('sha256').update(JSON.stringify([s.batch.category,s.batch.subject,s.batch.topic,q.kind,plan.normalizeStem(q.text)])).digest('hex'));
});
test('explicit pinned owner ack, actor and verified live assets required before DB access',async()=>{
 for(const [digest,who,ack,ev] of [['0'.repeat(64),actor,release.ACK,evidence],[plan.digest,'admin',release.ACK,evidence],[plan.digest,actor,'yes',evidence],[plan.digest,actor,release.ACK,null],[plan.digest,actor,release.ACK,{...evidence,verified:44}],[plan.digest,actor,release.ACK,{...evidence,assetsDigest:'bad'}]]){
  const db=database();await assert.rejects(release.publish(db,plan,digest,who,ack,ev));assert.equal(db.calls,0);
 }
});
test('Pending then approval, unrelated rows preserved, immutable audits and idempotent repeat',async()=>{
 const other={id:'other',category:'Class 9',subject:'রসায়ন',topic:'unrelated',approved:false},db=database([other]);
 const r=await publish(db);assert.equal(r.insertedPending,4480);assert.equal(r.newlyApproved,4480);assert.equal(r.approvedCanonical,4480);assert.equal(r.teacherCertified,false);assert.equal(r.registeredOfficialBiologyScheme,false);
 assert.deepEqual(db.rows.find(q=>q.id==='other'),other);assert.equal(db.settings.filter(s=>s.key.startsWith('preparedimport:v1:')).length,45);
 assert.ok(db.settings.some(s=>s.value.includes('স্বাধীন বিষয়বস্তু')));const audits=new Map(db.settings.map(s=>[s.key,s.value]));
 const twice=await publish(db);assert.equal(twice.insertedPending,0);assert.equal(twice.newlyApproved,0);assert.equal(twice.previouslyApproved,4480);assert.equal(db.rows.length,4481);
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
 const old={...plan.records[0],approved:true},db=database([old]);const r=await publish(db);assert.equal(r.previouslyApproved,1);assert.equal(r.newlyApproved,4479);assert.deepEqual(db.rows.find(q=>q.id===old.id),old);
});
test('phase 2 failure leaves all new rows pending, no partial approval audit',async()=>{
 const db=database([],n=>{if(n===2)throw Error('approval unavailable')});await assert.rejects(publish(db));assert.equal(db.rows.length,4480);assert.ok(db.rows.every(q=>q.approved===false));assert.ok(!db.settings.some(s=>s.key.includes(':approval:')));
});
test('phase 2 rechecks exact snapshots; mutation rolls back rather than approving',async()=>{
 const db=database([], (n,rows)=>{if(n===2)rows.get(plan.records[0].id).correct='altered'});await assert.rejects(publish(db),/snapshot changed/);assert.ok(db.rows.every(q=>!q.approved));
});
test('live HTTP assets require successful SVG response and exact bytes',async()=>{
 const fs=require('node:fs'),path=require('node:path');let calls=0;
 const ok=await release.verifyLiveAssets(plan,async url=>{calls++;return{ok:true,headers:new Headers({'content-type':'image/svg+xml'}),arrayBuffer:async()=>fs.readFileSync(path.join(__dirname,'../public',new URL(url).pathname))}});
 assert.equal(ok.verified,45);assert.equal(calls,45);assert.equal(ok.assetsDigest,evidence.assetsDigest);
 for(const bad of [{ok:false,headers:new Headers()},{ok:true,headers:new Headers({'content-type':'text/html'})},{ok:true,headers:new Headers({'content-type':'image/svg+xml'}),arrayBuffer:async()=>Buffer.from('<svg/>')}])await assert.rejects(release.verifyLiveAssets(plan,async()=>bad),/Live asset/);
});
test('normal application build does not implicitly publish stock',()=>{
 const fs=require('node:fs');assert.equal(JSON.parse(fs.readFileSync('package.json')).scripts.build,'prisma generate && next build --webpack');
 const {spawnSync}=require('node:child_process'),r=spawnSync(process.execPath,['scripts/question-bank/release-ssc-biology.cjs','publish',plan.digest,release.ACK],{env:{...process.env,VERCEL_ENV:'preview'},encoding:'utf8'});assert.notEqual(r.status,0);assert.match(r.stderr,/SSC_BIOLOGY_RELEASE_STOPPED/);
});


test('Biology exact renderer allowlist rejects external, query, wrong version and unregistered SVGs',()=>{
 const {questionBlocks}=release.load(),url=plan.preview.assets[0].url;
 assert.equal(questionBlocks(`![valid](${url})`)[0].kind,'biology-image');
 for(const bad of [url+'?x=1',url+'#x',url.replace('https:','http:'),url.replace('proshnobook.com','evil.invalid'),url.replace('-v1/','-v2/'),url.replace(/[^/]+\.svg$/,'unregistered.svg')])assert.ok(questionBlocks(`![bad](${bad})`).every(b=>b.kind==='text'));
});
test('read-only production probe checks real canonical fixtures, stock models and protected hashes without mutations',async()=>{
 const {check}=require('../scripts/check-biology-release.cjs'),old=release.verifyLiveAssets;let calls=0;
 release.verifyLiveAssets=async()=>({verified:45});
 const db={question:{findMany:async({where})=>{calls++;return where.subject==='জীববিজ্ঞান'?plan.records.filter(q=>!where.topic||where.topic.in.includes(q.topic)).map(q=>({...q,approved:true})):[]}}};
 try{const before=await check(db,'inventory'),after=await check(db,'verify',before.protectedDigest);assert.equal(after.approvedCanonical,4480);assert.equal(after.databaseMutation,false);assert.equal(after.providerInvoked,false);assert.equal(after.modelChecks.length,2);assert.ok(after.modelChecks.every(m=>m.aiShortfall===0));assert.equal(calls,10);await assert.rejects(check(db,'verify','changed'),/Protected/);}finally{release.verifyLiveAssets=old;}
});
