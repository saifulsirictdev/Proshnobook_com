#!/usr/bin/env node
// Secrets stay in ignored local files; never print bearer tokens or DB credentials.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const dir=path.join(root,'.cache/pending-import');
function registry(){
 const ts=require('typescript'),Module=require('node:module'),original=Module._resolveFilename;
 Module._resolveFilename=function(id,parent,...rest){return original.call(this,id.startsWith('@/')?path.join(root,id.slice(2)):id,parent,...rest);};
 require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
 return require(path.join(root,'lib/prepared-question-batches.ts'));
}
async function main(){
 const [command,...ids]=process.argv.slice(2);
 if(command==='prepare'){
  if(!ids.length)throw Error('Supply explicit registered batch IDs');
  const lib=registry(),batches={};
  for(const id of new Set(ids))batches[id]=lib.getPreparedBatch(id).digest;
  const token=crypto.randomBytes(32).toString('base64url'),now=Date.now();
  const grant={id:crypto.randomUUID(),issuedAt:new Date(now).toISOString(),expiresAt:new Date(now+3600000).toISOString(),tokenSha256:crypto.createHash('sha256').update(token).digest('hex'),batches};
  fs.mkdirSync(dir,{recursive:true,mode:0o700});
  fs.writeFileSync(path.join(dir,'token'),token,{mode:0o600});fs.chmodSync(path.join(dir,'token'),0o600);
  fs.writeFileSync(path.join(dir,'grant.json'),JSON.stringify(grant),{mode:0o600});
  console.log('Prepared one-hour scope. Set PENDING_IMPORT_GRANT from .cache/pending-import/grant.json in the serving deployment. Bearer token stays in .cache/pending-import/token.');return;
 }
 if(command!=='preview'&&command!=='save')throw Error('Usage: pending-import.cjs prepare <batch IDs> | preview | save');
 const grant=JSON.parse(fs.readFileSync(path.join(dir,'grant.json'),'utf8'));
 const token=fs.readFileSync(path.join(dir,'token'),'utf8').trim();
 if(Date.parse(grant.expiresAt)<=Date.now())throw Error('Grant expired; prepare a new scope and update deployment');
 const endpoint='https://proshnobook.com/api/admin/pending-import';
 let previews={};const previewPath=path.join(dir,'preview.json');
 if(command==='save'){
  previews=JSON.parse(fs.readFileSync(previewPath,'utf8'));
  if(process.env.ACKNOWLEDGE_DRAFT_LIMITATIONS!=='yes')throw Error('Read preview and limitations, then set ACKNOWLEDGE_DRAFT_LIMITATIONS=yes');
 }
 const receipts=[];
 for(const [id,digest] of Object.entries(grant.batches)){
  if(command==='save'&&(previews[id]?.digest!==digest||previews[id]?.grantId!==grant.id))throw Error('Fresh matching preview required');
  const res=await fetch(endpoint,{method:'POST',redirect:'error',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({action:command,id,digest,...(command==='save'?{acknowledgeLimitations:true}:{})}),signal:AbortSignal.timeout(60000)});
  if(!res.ok)throw Error(`Request failed (${res.status}); inspect deployment configuration; no success assumed`);
  const result=await res.json();
  if(result.id!==id||result.digest!==digest)throw Error('Unexpected response');
  if(command==='preview')previews[id]={...result,grantId:grant.id};
  else{if(result.status!=='PENDING_NOT_PUBLISHED')throw Error('Unexpected status');receipts.push(result);fs.writeFileSync(path.join(dir,'receipts.json'),JSON.stringify(receipts,null,2),{mode:0o600});console.log(`${id}: inserted=${result.inserted}, skipped=${result.skipped}, Pending only`);}
 }
 if(command==='preview'){fs.writeFileSync(previewPath,JSON.stringify(previews,null,2),{mode:0o600});console.log('Preview and limitations saved to .cache/pending-import/preview.json. Review before save.');}
}
main().catch(()=>{console.error('Pending import stopped. Check scope, expiry, preview/acknowledgement and deployment access. No credentials logged; retain receipts to verify any completed batches.');process.exitCode=1;});
