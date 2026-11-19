const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {publicURL,inventory,encrypt,verify}=require('../scripts/blob-backup.cjs');
test('Blob backup validates public URLs without sending credentials or following redirects',()=>{
 assert.ok(publicURL('https://store.public.blob.vercel-storage.com/folder/file.pdf'));
 for(const url of ['http://store.public.blob.vercel-storage.com/a','https://evil.test/a','https://store.public.blob.vercel-storage.com.evil.test/a','https://u:p@store.public.blob.vercel-storage.com/a'])assert.throws(()=>publicURL(url));
});
test('Blob backup inventories all pages and rejects repeated cursors or URLs',async()=>{
 const blob=i=>({url:`https://store.public.blob.vercel-storage.com/${i}`,pathname:`../${i}`,size:1});let calls=0;
 const files=await inventory(async opts=>{calls++;assert.equal(opts.token,'test');return calls===1?{blobs:[blob(1)],hasMore:true,cursor:'next'}:{blobs:[blob(2)],hasMore:false};},'test');assert.equal(files.length,2);assert.equal(calls,2);
 await assert.rejects(inventory(async()=>({blobs:[],hasMore:true,cursor:'same'}),'test'));
 await assert.rejects(inventory(async()=>({blobs:[blob(1),blob(1)],hasMore:false}),'test'));
});
test('Encrypted archive verifies roundtrip and rejects wrong passphrase and tampering',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'blob-test-'));const input=path.join(dir,'in'),out=path.join(dir,'out');
 const text=Buffer.from('private backup bytes');const password='long-test-passphrase-not-a-real-secret';
 try{fs.writeFileSync(input,text);const digest=crypto.createHash('sha256').update(text).digest('hex');
 await encrypt(input,out,password);await verify(out,digest,password);
 await assert.rejects(verify(out,digest,'incorrect-passphrase'));
 const content=fs.readFileSync(out);content[40]^=1;fs.writeFileSync(out,content);await assert.rejects(verify(out,digest,password));
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
