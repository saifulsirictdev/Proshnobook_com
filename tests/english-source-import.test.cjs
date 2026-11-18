const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module'),path=require('node:path');
function load(file,mocks={}){const m=new Module(path.resolve(file),module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return m.exports;}
const pool=require('../lib/english/data/class6-seen-pool.json');
const lib=load('lib/english/source-import.ts',{'./data/class6-seen-pool.json':pool});
function harness(user={id:'admin',role:'ADMIN'},fail=false){let calls=0;const rows=new Map();
 const action=load('app/admin/english-review/source-actions.ts',{'@/auth':{auth:async()=>({user})},'@/lib/english/source-import':lib,'next/cache':{revalidatePath(){}},'@/lib/db':{db:{setting:{createMany:async args=>{calls++;assert.equal(args.skipDuplicates,true);if(fail)throw Error('database unavailable');let count=0;for(const r of args.data){if(!rows.has(r.key)){rows.set(r.key,r.value);count++;}}return{count};}}}}});
 return{save:action.importEnglishSources,rows,calls:()=>calls};
}
function form(digest=lib.englishSourceImportDigest(),reviewed='yes'){const f=new FormData();f.set('digest',digest);f.set('reviewed',reviewed);return f;}
test('Source manifest contains exactly 30 extracts and 6 poems with stable content-based identities and provenance',()=>{
 const sources=lib.preparedEnglishSources();assert.equal(sources.length,36);assert.equal(new Set(sources.map(s=>s.key)).size,36);assert.deepEqual(lib.preparedEnglishSources(),sources);
 assert.equal(sources.filter(s=>s.payload.kind==='seen').length,30);assert.equal(sources.filter(s=>s.payload.kind==='poem').length,6);
 for(const s of sources){assert.match(s.key,/^english-source:v1:[a-f0-9]{64}$/);assert.equal(s.payload.grade,6);assert.equal(s.payload.paper,1);assert.ok(s.payload.text);assert.ok(s.payload.reference);assert.equal(s.payload.sourceSha256,pool.sourceSha256);assert.equal(s.payload.sourceFileId,pool.sourceDriveFileId);}
});
test('Only authenticated ADMIN with current preview and explicit consent can import',async()=>{
 for(const user of [null,{id:'t',role:'TEACHER'},{id:'s',role:'STUDENT'},{role:'ADMIN'}]){const h=harness(user);assert.ok((await h.save({},form())).error);assert.equal(h.calls(),0);}
 for(const f of [form('forged'),form(undefined,'no')]){const h=harness();assert.ok((await h.save({},f)).error);assert.equal(h.calls(),0);}
});
test('Import is source-only Pending, preserves existing decisions and is safely repeatable',async()=>{
 const h=harness();const first=lib.preparedEnglishSources()[0];const approved=JSON.stringify({status:'APPROVED',source:first.payload});h.rows.set(first.key,approved);
 assert.match((await h.save({},form())).message,/35টি নতুন/);assert.equal(h.rows.size,36);assert.equal(h.rows.get(first.key),approved);
 for(const [key,value] of h.rows){if(key===first.key)continue;const r=JSON.parse(value);assert.equal(r.status,'PENDING');assert.equal(r.teacherApproved,false);assert.equal(r.importedBy,'admin');assert.ok(r.importedAt);assert.equal(r.source.grade,6);assert.equal(r.source.paper,1);}
 assert.match((await h.save({},form())).message,/0টি নতুন/);assert.equal(h.rows.size,36);assert.equal(h.rows.get(first.key),approved);
});
test('Database failure reports uncertainty without claiming import or publication',async()=>{const h=harness(undefined,true);const r=await h.save({},form());assert.ok(r.error);assert.equal(r.message,undefined);assert.equal(h.rows.size,0);});
