#!/usr/bin/env node
// Read-only Neon dump + tracked source snapshot. Never restores to production.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const {encrypt,verify}=require('./blob-backup.cjs');
function databaseEnv(raw){
 const u=new URL(raw||'invalid:');
 if(!['postgres:','postgresql:'].includes(u.protocol)||!u.hostname.endsWith('.neon.tech')||!u.username||!u.password||u.pathname.length<2||u.hash)throw Error('Expected Neon connection URL');
 return {PGHOST:u.hostname,PGPORT:u.port||'5432',PGDATABASE:decodeURIComponent(u.pathname.slice(1)),PGUSER:decodeURIComponent(u.username),PGPASSWORD:decodeURIComponent(u.password),PGSSLMODE:'require',PGCONNECT_TIMEOUT:'30',PGOPTIONS:'-c default_transaction_read_only=on',...(u.searchParams.get('channel_binding')==='require'?{PGCHANNELBINDING:'require'}:{})};
}
function run(command,args,env=process.env){
 const r=spawnSync(command,args,{env,stdio:['ignore','pipe','pipe'],timeout:900000,maxBuffer:4*1024*1024});
 if(r.error||r.status!==0)throw Error('Backup subprocess failed');
 return r.stdout;
}
async function sha256(file){const h=crypto.createHash('sha256');for await(const chunk of fs.createReadStream(file))h.update(chunk);return h.digest('hex');}
async function main(){
 const password=process.env.BLOB_BACKUP_PASSPHRASE;
 if(!password||Buffer.byteLength(password)<20)throw Error('Passphrase required');
 const pg=databaseEnv(process.env.DATABASE_URL);
 const destination=path.resolve(process.env.SITE_BACKUP_OUTPUT||'.cache/site-data-backup');fs.mkdirSync(destination,{recursive:true,mode:0o700});
 const work=fs.mkdtempSync(path.join(destination,'work-')),content=path.join(work,'snapshot');fs.mkdirSync(content,{mode:0o700});
 const stamp=Date.now(),output=path.join(destination,`site-data-${stamp}.tar.enc`);
 try{
  const env={...process.env,...pg};
  // Environment names only in argv; the URL/password never appears in command arguments or logs.
  const args=['run','--rm',...Object.keys(pg).flatMap(k=>['-e',k]),'-v',`${content}:/backup`,'postgres:18','pg_dump','--format=custom','--no-owner','--no-privileges','--file=/backup/database.dump'];
  run('docker',args,env);
  // Structural archive validation, NOT a database restore test.
  const toc=run('docker',['run','--rm','-v',`${content}:/backup:ro`,'postgres:18','pg_restore','--list','/backup/database.dump']);
  if(!toc.length)throw Error('Empty dump table of contents');
  fs.writeFileSync(path.join(content,'database-toc.txt'),toc,{mode:0o600});
  run('git',['archive','--format=tar',`--output=${path.join(content,'source.tar')}`,'HEAD']);
  const commit=run('git',['rev-parse','HEAD']).toString().trim();
  const files=[];for(const name of ['database.dump','database-toc.txt','source.tar'])files.push({name,bytes:fs.statSync(path.join(content,name)).size,sha256:await sha256(path.join(content,name))});
  const scope={included:['Neon database logical dump','tracked Git source at selected commit'],excluded:['Blob bytes (separate existing backup)','vault encryption keys','environment variable values','DNS and OAuth provider settings','cluster roles and grants','untracked or ignored source files'],validation:'pg_restore --list and encrypted archive roundtrip only; no application restore performed'};
  fs.writeFileSync(path.join(content,'manifest.json'),JSON.stringify({version:1,createdAt:new Date().toISOString(),commit,postgresClient:18,files,scope},null,2),{mode:0o600});
  const tar=path.join(work,'snapshot.tar');run('tar',['-cf',tar,'-C',content,'.']);const digest=await sha256(tar);
  await encrypt(tar,output,password);await verify(output,digest,password);
  fs.writeFileSync(`${output}.json`,JSON.stringify({version:1,verified:true,archive:path.basename(output),plaintextArchiveSha256:digest,commit,scope,driveUploaded:false},null,2),{mode:0o600});
  console.log('Database/source encrypted backup verified. Full-site recovery, keys/config and Drive transfer remain separate.');
 }catch(e){fs.rmSync(output,{force:true});throw e;}finally{fs.rmSync(work,{recursive:true,force:true});}
}
module.exports={databaseEnv};
if(require.main===module)main().catch(()=>{console.error('Database/source backup failed. Check secrets, Neon connectivity and PostgreSQL version. Sensitive subprocess output suppressed.');process.exitCode=1;});
