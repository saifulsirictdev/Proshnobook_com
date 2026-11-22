/** Disposable localhost-only release regression; never runs against production. */
const assert=require('node:assert/strict');
const {withDisposableWalletDatabase}=require('./helpers/disposable-wallet-db.cjs');
const release=require('./question-bank/release-ssc-math.cjs');
withDisposableWalletDatabase(async db=>{
 const plan=release.prepare(),actor='vercel-owner-release:'+'a'.repeat(40);
 const unrelated={...plan.records[0],id:'unrelated-other-class',category:'Class 6',approved:false};
 const legacy={...plan.records[0],id:'legacy-ssc-alias',category:'SSC',approved:false};
 await db.question.createMany({data:[unrelated,legacy]});
 const first=await release.publish(db,plan,plan.digest,actor,release.ACK);
 assert.equal(first.insertedPending,5749);assert.equal(first.newlyApproved,5749);assert.equal(first.conflictingSkipped,1);
 assert.equal(first.autoModel.short,15);assert.deepEqual(Object.values(first.autoModel.divisions),[2,2,2,2]);
 assert.equal(await db.question.count({where:{approved:true}}),5749);
 assert.equal((await db.question.findUnique({where:{id:legacy.id}})).approved,false);
 assert.equal((await db.question.findUnique({where:{id:unrelated.id}})).approved,false);
 assert.equal(await db.setting.count({where:{key:{startsWith:'preparedimport:v1:'}}}),53);
 const again=await release.publish(db,plan,plan.digest,actor,release.ACK);
 assert.equal(again.insertedPending,0);assert.equal(again.newlyApproved,0);assert.equal(again.previouslyApproved,5749);
 const changed=plan.records[1];await db.question.update({where:{id:changed.id},data:{explanation:'Changed by review; do not overwrite'}});
 await assert.rejects(release.publish(db,plan,plan.digest,actor,release.ACK));
 assert.equal((await db.question.findUnique({where:{id:changed.id}})).explanation,'Changed by review; do not overwrite');
 console.log('PASS: disposable PostgreSQL SSC release, 5749 exact owner approvals, alias duplicate preserved, unrelated stock unchanged, repeat idempotent, edits fail closed; 8 CQ (2/division) + 15 SHORT and 30 MCQ assembled.');
}).catch(()=>{console.error('Disposable SSC math release regression failed; no production database used.');process.exitCode=1;});
