const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const Module=require('node:module');
const React=require('react');
function load(file,mocks={}){const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);return m.exports;}
const types=load('lib/account-type.ts');
test('account identities have explicit non-admin capability mapping and exam-first Student destination',()=>{
 assert.deepEqual(types.ACCOUNT_TYPES,['TEACHER','STUDENT','CONTRIBUTOR']);
 assert.equal(types.accountType('ADMIN'),null);
 assert.equal(types.accountType('__proto__'),null);
 assert.equal(types.capabilityRole('CONTRIBUTOR'),'TEACHER');
 assert.equal(types.accountDestination('STUDENT'),'/model-test');
});
function nodes(n){if(!n||typeof n!=='object')return [];return [n,...React.Children.toArray(n.props?.children).flatMap(nodes)];}
async function formAction({role='STUDENT',pending=true,id='person'}={}){
 let assigned=null, claimed=false;
 const tx={user:{findUnique:async()=>({role}),update:async({data})=>assigned=data.role},setting:{updateMany:async({where,data})=>{assert.equal(where.key,'account-type:v1:person');assert.equal(where.value,'PENDING');if(!pending||claimed)return {count:0};claimed=true;return {count:1};}}};
 const page=load('app/auth/onboarding/page.tsx',{'@/auth':{auth:async()=>id?{user:{id}}:null},'@/lib/db':{db:{$transaction:async fn=>fn(tx),setting:{findUnique:async()=>({value:pending?'PENDING':'TEACHER'})}}},'@/lib/account-type':types,'next/navigation':{redirect:path=>{throw {destination:path}}}}).default;
 const tree=await page();return {action:nodes(tree).find(n=>n.type==='form').props.action,assigned:()=>assigned,claimed:()=>claimed,tree};
}
async function submit(action,type){const fd=new FormData();fd.set('accountType',type);try{await action(fd);}catch(e){if(e.destination)return e.destination;throw e;}}
test('onboarding commits each validated choice once and never grants Admin',async()=>{
 for(const type of types.ACCOUNT_TYPES){const f=await formAction();assert.equal(await submit(f.action,type),types.accountDestination(type));assert.equal(f.assigned(),types.capabilityRole(type));assert.equal(await submit(f.action,'TEACHER'),'/auth/landing');}
 const invalid=await formAction();assert.equal(await submit(invalid.action,'ADMIN'),'/auth/onboarding');assert.equal(invalid.assigned(),null);
 const admin=await formAction({role:'ADMIN'});assert.equal(await submit(admin.action,'TEACHER'),'/auth/landing');assert.equal(admin.assigned(),null);
});
test('existing accounts and anonymous requests cannot enter onboarding',async()=>{
 await assert.rejects(formAction({pending:false}),e=>e.destination==='/auth/landing');
 await assert.rejects(formAction({id:null}),e=>e.destination==='/login');
 const auth=fs.readFileSync('auth.ts','utf8');
 assert.ok(auth.includes('!existing && !isAdmin'));
 assert.ok(auth.includes('db.$transaction'));
 assert.ok(auth.includes('profile?.email_verified === true'));
 assert.ok(auth.includes('select: { role: true }'));
 assert.ok(!auth.includes('trigger === "update"'));
});
test('Google callback creates pending marker only for new verified non-admin accounts and refreshes stale roles',async()=>{
 for(const existing of [false,true]) {
  let config,marker=false,cleared=false;
  const current={id:'person',role:existing?'TEACHER':'STUDENT'};
  const tx={user:{findUnique:async()=>existing?{id:'person'}:null,upsert:async({update})=>{cleared=update.passwordHash===null;return current;}},setting:{upsert:async({create})=>{marker=create.value==='PENDING';}}};
  load('auth.ts',{'@/lib/account-type':types,'@/lib/auth-attempts':{reserveAuthAttempt:async()=>true},'@/lib/wallet':{ensureWallet:async()=>{}},'@/lib/db':{db:{$transaction:async fn=>fn(tx),user:{findUnique:async()=>current}}},'next-auth':{__esModule:true,default:c=>{config=c;return {}}},'next-auth/providers/credentials':{__esModule:true,default:c=>c},'next-auth/providers/google':{__esModule:true,default:{}},bcryptjs:{__esModule:true,default:{}},'./auth.config':{__esModule:true,default:{callbacks:{}}}});
  assert.equal(await config.callbacks.signIn({account:{provider:'google'},profile:{email_verified:false}}),false);
  const result=await config.callbacks.jwt({token:{email:'identity@example.invalid',role:'ADMIN'},account:{provider:'google'},profile:{email_verified:true}});
  assert.equal(result.role,current.role);assert.equal(marker,!existing);assert.equal(cleared,true);
  const refresh=await config.callbacks.jwt({token:{sub:'person',role:'ADMIN'},trigger:'update',session:{role:'ADMIN'}});
  assert.equal(refresh.role,current.role);
 }
});
test('edge admin route authorization never grants Teacher/Contributor capabilities admin access',()=>{
 const c=load('auth.config.ts',{}).default;
 for(const role of ['STUDENT','TEACHER','CONTRIBUTOR',undefined]) assert.equal(c.callbacks.authorized({auth:{user:{role}},request:{nextUrl:{pathname:'/admin/wallet'}}}),false);
 assert.equal(c.callbacks.authorized({auth:{user:{role:'ADMIN'}},request:{nextUrl:{pathname:'/admin/wallet'}}}),true);
});
