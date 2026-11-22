const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const release=require('../scripts/question-bank/release-ssc-math.cjs'),api=release.load(),plan=release.prepare(api);
const actor='vercel-owner-release:'+'a'.repeat(40);
function database(initial=[],fail){
 let rows=new Map(initial.map(q=>[q.id,structuredClone(q)])),settings=new Map(),calls=0;
 const matches=(q,w={})=>Object.entries(w).every(([k,v])=>v&&typeof v==='object'?v.in.includes(q[k]):q[k]===v);
 const db={get rows(){return [...rows.values()]},get settings(){return [...settings.values()]},get calls(){return calls},async $transaction(work){calls++;const oldRows=structuredClone(rows),oldSettings=structuredClone(settings);try{if(fail)fail(calls,rows);return await work({question:{findMany:async({where})=>[...rows.values()].filter(q=>matches(q,where)).map(q=>structuredClone(q)),createMany:async({data})=>{for(const q of data){if(rows.has(q.id))throw Error('duplicate');rows.set(q.id,structuredClone(q));}return{count:data.length}},updateMany:async({where,data})=>{let count=0;for(const q of rows.values())if(matches(q,where)){Object.assign(q,data);count++;}return{count}}},setting:{findUnique:async({where})=>settings.get(where.key)||null,create:async({data})=>{if(settings.has(data.key))throw Error('duplicate receipt');settings.set(data.key,structuredClone(data));return data;},upsert:async({where,create,update})=>{settings.set(where.key,settings.has(where.key)?{...settings.get(where.key),...update}:structuredClone(create));}}});}catch(e){rows=oldRows;settings=oldSettings;throw e;}}};return db;
}
test('canonical 53 slices/5750 questions, all 17 chapters and real-stock Auto Model includes 15 SHORT',()=>{
 assert.equal(plan.scopes.length,53);assert.equal(plan.records.length,5750);assert.equal(Object.keys(plan.preview.chapters).length,17);assert.equal(plan.preview.autoModel.short,15);assert.deepEqual(Object.values(plan.preview.autoModel.divisions),[2,2,2,2]);assert.equal(plan.preview.autoModel.mcq,30);assert.ok(plan.preview.assets.length>2600);
 // IDs/digests are exactly the existing prepared-import convention, not new stock.
 const {createHash}=require('node:crypto'),s=plan.scopes[0],q=s.batch.records[0];
 assert.equal(s.records[0].id,'prepared_'+createHash('sha256').update(JSON.stringify([s.batch.category,s.batch.subject,s.batch.topic,q.kind,api.normalizeStem(q.text)])).digest('hex'));
});
test('every release image is in the bounded real renderer; unknown SVG paths remain literal',()=>{
 let occurrences=0;for(const row of plan.records){for(const text of [row.text,row.explanation]){const raw=[...text.matchAll(/!\[[^\]]*\]\((https:[^)]+\.svg)\)/g)];const images=api.questionBlocks(text).filter(b=>b.kind.endsWith('-image'));assert.equal(images.length,raw.length,row.id);occurrences+=images.length;}}
 assert.ok(occurrences>2600);
 const file='components/MathText.tsx',m=new Module(file);m.require=id=>id==='@/lib/question-tables'?api:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
 const geometry=plan.records.find(q=>q.text.includes('/ssc-math-ch6-v1/'));
 assert.match(renderToStaticMarkup(React.createElement(m.exports.default,{text:geometry.text})),/<img /);
 for(const u of ['https://evil.invalid/a.svg','https://proshnobook.com/question-bank/ssc-math-ch6-v1/a.svg?x=1','https://proshnobook.com/question-bank/ssc-math-ch6-v2/a.svg','https://proshnobook.com/question-bank/ssc-math-ch6-v1/../x.svg'])assert.ok(api.questionBlocks(`![x](${u})`).every(b=>b.kind==='text'));
});
test('release requires exact preview, explicit owner acknowledgement and auditable actor before any DB access',async()=>{
 for(const [digest,who,ack] of [['0'.repeat(64),actor,release.ACK],[plan.digest,'admin',release.ACK],[plan.digest,actor,'yes']]){const db=database();await assert.rejects(release.publish(db,plan,digest,who,ack));assert.equal(db.calls,0);}
});
test('Pending first, separate owner approval, receipts preserve limitations; repeated release does not duplicate',async()=>{
 const other={id:'unrelated',category:'Class 6',subject:'গণিত',approved:false},db=database([other]);
 const one=await release.publish(db,plan,plan.digest,actor,release.ACK);
 assert.equal(one.insertedPending,5750);assert.equal(one.newlyApproved,5750);assert.equal(one.teacherCertified,false);assert.equal(one.autoModel.short,15);assert.equal(db.rows.find(q=>q.id==='unrelated').approved,false);
 assert.equal(db.settings.filter(s=>s.key.startsWith('preparedimport:v1:')).length,53);
 assert.ok(db.settings.some(s=>s.value.includes('স্বাধীন শিক্ষক')));
 const two=await release.publish(db,plan,plan.digest,actor,release.ACK);assert.equal(two.insertedPending,0);assert.equal(two.newlyApproved,0);assert.equal(two.previouslyApproved,5750);assert.equal(db.rows.length,5751);
});
test('alias duplicates are skipped and never approved; altered canonical rows stop the whole import transaction',async()=>{
 const row=plan.records[0],legacy={...row,id:'legacy',category:'SSC',approved:false};
 const db=database([legacy]);const r=await release.publish(db,plan,plan.digest,actor,release.ACK);
 assert.equal(r.conflictingSkipped,1);assert.equal(r.approvedCanonical,5749);assert.equal(db.rows.find(q=>q.id==='legacy').approved,false);assert.ok(!db.rows.some(q=>q.id===row.id));
 const bad=database([{...row,approved:false,explanation:'Changed outside release'}]);await assert.rejects(release.publish(bad,plan,plan.digest,actor,release.ACK));assert.equal(bad.rows.length,1);assert.equal(bad.settings.length,0);
});
test('phase-two failure leaves imported records Pending, with zero partial approvals',async()=>{
 const db=database([],call=>{if(call===2)throw Error('approval unavailable');});await assert.rejects(release.publish(db,plan,plan.digest,actor,release.ACK));assert.equal(db.rows.length,5750);assert.ok(db.rows.every(q=>q.approved===false));assert.ok(!db.settings.some(s=>s.key.includes(':approval:')));
});
