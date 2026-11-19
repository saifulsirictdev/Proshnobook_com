#!/usr/bin/env node
// Offline decryption only. Does not restore/upload objects or touch a database.
const fs=require('node:fs'),crypto=require('node:crypto');
const {pipeline}=require('node:stream/promises');
const {verify}=require('./blob-backup.cjs');
async function main(){
 const [input,reportPath,output]=process.argv.slice(2),password=process.env.BLOB_BACKUP_PASSPHRASE;
 if(!input||!reportPath||!output||!password)throw Error('Missing arguments');
 const report=JSON.parse(fs.readFileSync(reportPath,'utf8'));
 await verify(input,report.plaintextArchiveSha256,password);
 const fd=fs.openSync(input,'r'),size=fs.statSync(input).size,header=Buffer.alloc(36),tag=Buffer.alloc(16);
 try{fs.readSync(fd,header,0,36,0);fs.readSync(fd,tag,0,16,size-16);}finally{fs.closeSync(fd);}
 const key=crypto.scryptSync(password,header.subarray(8,24),32),decipher=crypto.createDecipheriv('aes-256-gcm',key,header.subarray(24));
 decipher.setAAD(header);decipher.setAuthTag(tag);
 await pipeline(fs.createReadStream(input,{start:36,end:size-17}),decipher,fs.createWriteStream(output,{flags:'wx',mode:0o600}));
 key.fill(0);console.log('Verified archive decrypted. Keep the TAR private; no live data changed.');
}
main().catch(()=>{console.error('Decryption failed; check paths, report, passphrase and unused output name.');process.exitCode=1;});
