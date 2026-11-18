const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module'),crypto=require('node:crypto');
function load(file,mocks={}){const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,file);return m.exports;}
const auth=load('lib/pending-import-grant.ts'),token='x'.repeat(43),digest='a'.repeat(64),now=Date.now();
const config=(patch={})=>JSON.stringify({id:'test-grant-1',issuedAt:new Date(now-1000).toISOString(),expiresAt:new Date(now+3600000).toISOString(),tokenSha256:crypto.createHash('sha256').update(token).digest('hex'),batches:{batch1:digest},...patch});
test('Pending grant fails closed on missing, malformed, wrong, future, expired or overscoped credentials',()=>{
 for(const [h,c] of [[null,config()],[`Bearer ${token}`,undefined],[`Bearer ${'y'.repeat(43)}`,config()],[`Bearer ${token}`,'{}'],[`Bearer ${token}`,config({issuedAt:new Date(now+1000).toISOString()})],[`Bearer ${token}`,config({expiresAt:new Date(now).toISOString()})],[`Bearer ${token}`,config({expiresAt:new Date(now+90000000).toISOString()})],[`Bearer ${token}`,config({batches:{}})],[`Bearer ${token}`,config({tokenSha256:'oops'})]])assert.throws(()=>auth.authorizePendingImport(h,c,now));
 const g=auth.authorizePendingImport(`Bearer ${token}`,config(),now);auth.assertGrantedBatch(g,'batch1',digest);assert.throws(()=>auth.assertGrantedBatch(g,'batch2',digest));assert.throws(()=>auth.assertGrantedBatch(g,'batch1','b'.repeat(64)));assert.throws(()=>auth.assertGrantedBatch(g,'toString',digest));
});
function harness(){
 const questions=[],settings=new Map();let registryCalls=0,dbCalls=0,retry=false;
 const batch={id:'batch1',category:'Class 6',subject:'test',topic:'topic',lang:'Bangla',limitations:'Review pending',provenance:{source:'book'},records:[{kind:'SQ',text:'one',options:{},correct:'',explanation:'solution',difficulty:'MEDIUM'}]};
 const tx={question:{findMany:async()=>questions,create:async({data})=>questions.push(data)},setting:{findUnique:async({where})=>settings.get(where.key),create:async({data})=>settings.set(data.key,data)}};
 const route=load('app/api/admin/pending-import/route.ts',{'@prisma/client':{},'@/lib/db':{db:{$transaction:async(fn,opts)=>{dbCalls++;assert.equal(opts.isolationLevel,'Serializable');if(retry){retry=false;throw Object.assign(Error(),{code:'P2034'});}return fn(tx);}}},'@/lib/pending-import-grant':auth,'@/lib/prepared-question-batches':{getPreparedBatch:()=>{registryCalls++;return{batch,digest}},preparedQuestionId:()=> 'prepared_test'},'@/lib/mcq-import':{normalizeStem:s=>s.trim()}});
 const request=(body={},header=`Bearer ${token}`)=>new Request('https://proshnobook.com/api/admin/pending-import',{method:'POST',headers:{'content-type':'application/json',...(header?{authorization:header}:{})},body:JSON.stringify({action:'save',id:'batch1',digest,acknowledgeLimitations:true,...body})});
 return{route,request,questions,settings,calls:()=>({registryCalls,dbCalls}),retry:()=>retry=true};
}
test('Pending capability rejects unauthenticated and out-of-scope requests before registry/database',async()=>{
 process.env.PENDING_IMPORT_GRANT=config();const h=harness();
 assert.equal((await h.route.POST(h.request({},null))).status,401);
 assert.equal((await h.route.POST(h.request({id:'other'}))).status,403);
 assert.equal((await h.route.POST(h.request({digest:'b'.repeat(64)}))).status,403);
 assert.equal((await h.route.POST(h.request({approved:true}))).status,400);
 assert.equal((await h.route.POST(h.request({action:'approve'}))).status,400);
 assert.deepEqual(h.calls(),{registryCalls:0,dbCalls:0});delete process.env.PENDING_IMPORT_GRANT;
});
test('preview read-only; acknowledged save always Pending, audited, idempotent and retries conflicts',async()=>{
 process.env.PENDING_IMPORT_GRANT=config();const h=harness();
 const preview=await h.route.POST(h.request({action:'preview'}));assert.equal(preview.status,200);assert.equal(preview.headers.get('cache-control'),'no-store');assert.equal(h.calls().dbCalls,0);
 assert.equal((await h.route.POST(h.request({acknowledgeLimitations:false}))).status,400);assert.equal(h.calls().dbCalls,0);
 h.retry();let result=await (await h.route.POST(h.request())).json();assert.equal(result.inserted,1);assert.equal(h.questions[0].approved,false);assert.equal(result.status,'PENDING_NOT_PUBLISHED');
 const receipt=JSON.parse([...h.settings.values()][0].value);assert.equal(receipt.actorId,'pending-import-grant:test-grant-1');assert.ok(receipt.provenance);assert.equal(receipt.authorization,'OWNER_SCOPED_PENDING_ONLY');
 result=await (await h.route.POST(h.request())).json();assert.equal(result.alreadyImported,true);assert.equal(h.questions.length,1);delete process.env.PENDING_IMPORT_GRANT;
});
