#!/usr/bin/env node
// Explicit one-off owner operation. Never imported by app/default build.
const fs=require('node:fs'),path=require('node:path');
const release=require('./question-bank/release-ssc-biology.cjs');
const {check}=require('./check-biology-release.cjs');
const {check:checkPriorModels}=require('./check-auto-model-upgrade.cjs');
async function main(){
 if(process.argv[2]!==release.ACK||process.env.VERCEL_ENV!=='production'||!process.env.DATABASE_URL||process.env.VERCEL_PROJECT_ID!=='prj_gJuVKTIvUtieGaJr7mitBHdC05Ze'||!/^([a-f0-9]{40})$/.test(process.env.VERCEL_GIT_COMMIT_SHA||''))throw Error('Explicit owner production context required');
 const root=path.resolve(__dirname,'..'),plan=release.prepare();
 const pinned=JSON.parse(fs.readFileSync(path.join(root,'docs/question-bank/ssc-biology/scoped-release-plan.json'),'utf8'));
 const before=JSON.parse(fs.readFileSync(path.join(root,'docs/question-bank/ssc-biology/pre-release-production-inventory.json'),'utf8'));
 if(plan.digest!==pinned.digest||before.biologyRows!==0||before.protectedSubjects.length!==2||!/^([a-f0-9]{64})$/.test(before.protectedDigest))throw Error('Pinned prerelease plan/inventory required');
 const {PrismaClient}=require('@prisma/client'),db=new PrismaClient();
 try{
  const current=await check(db,'inventory');
  if(current.protectedDigest!==before.protectedDigest)throw Error('Protected stock changed before import');
  console.log('BIOLOGY_PRERELEASE_PROTECTED_STOCK_RECHECK '+JSON.stringify(current));
  const assets=await release.verifyLiveAssets(plan);
  console.log('SSC_BIOLOGY_LIVE_ASSETS_VERIFIED '+JSON.stringify(assets));
  const result=await release.publish(db,plan,pinned.digest,`vercel-owner-release:${process.env.VERCEL_GIT_COMMIT_SHA}`,release.ACK,assets);
  console.log('SSC_BIOLOGY_RELEASE_RECEIPT '+JSON.stringify(result));
  console.log('BIOLOGY_READ_ONLY_RECEIPT '+JSON.stringify(await check(db,'verify',before.protectedDigest)));
  console.log('AUTO_MODEL_UPGRADE_RECEIPT '+JSON.stringify(await checkPriorModels(db)));
 }finally{await db.$disconnect();}
}
if(require.main===module)main().catch(()=>{console.error('BIOLOGY_OWNER_RELEASE_PIPELINE_STOPPED; inspect individual receipts before inferring import, approval or readback success');process.exitCode=1;});
