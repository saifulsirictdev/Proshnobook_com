const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const Module=require('node:module');
const React=require('react');
function load(file,mocks={}){const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);return m.exports;}
const types=load('lib/account-type.ts');
const redirects=load('lib/login-redirect.ts');
function store({role='STUDENT',identity=null,missing=false,conflicts=0,failedRoleWrite=false}={}){
 let state={user:missing?null:{role},identity},queue=Promise.resolve(),attempts=0;
 const tx={user:{findUnique:async()=>state.user,updateMany:async({where,data})=>{
   assert.equal(where.id,'person');assert.equal(where.role,'STUDENT');
   if(failedRoleWrite||state.user?.role!==where.role)return {count:0};
   state.user.role=data.role;return {count:1};
 }},setting:{findUnique:async()=>state.identity===null?null:{value:state.identity},upsert:async({where,create,update})=>{
   assert.equal(where.key,'account-type:v1:person');assert.deepEqual(update,{});
   if(state.identity===null)state.identity=create.value;
   return {value:state.identity};
 },updateMany:async({where,data})=>{
   assert.equal(where.key,'account-type:v1:person');assert.equal(where.value,'PENDING');
   if(state.identity!==where.value)return {count:0};state.identity=data.value;return {count:1};
 }}};
 const db={$transaction:(fn,opts)=>{
   const result=queue.then(async()=>{
     assert.equal(opts.isolationLevel,'Serializable');attempts++;
     if(conflicts-->0)throw Object.assign(Error('serialization'),{code:'P2034'});
     const before=structuredClone(state);
     try{return await fn(tx);}catch(e){state=before;throw e;}
   });queue=result.catch(()=>{});return result;
 }};
 const service=load('lib/account-onboarding.ts',{'@/lib/db':{db},'@/lib/account-type':types});
 return {service,state:()=>structuredClone(state),attempts:()=>attempts};
}
test('account identities have explicit non-admin capability mapping and exam-first Student destination',()=>{
 assert.deepEqual(types.ACCOUNT_TYPES,['TEACHER','STUDENT','CONTRIBUTOR']);
 for(const invalid of ['ADMIN','__proto__','teacher',null])assert.equal(types.accountType(invalid),null);
 assert.equal(types.capabilityRole('CONTRIBUTOR'),'TEACHER');
 assert.equal(types.accountDestination('STUDENT'),'/model-test');
});
test('legacy or password Students without a saved identity get a pending choice, idempotently',async()=>{
 const s=store();
 assert.deepEqual(await s.service.accountChoiceState('person'),{role:'STUDENT',identity:'PENDING',needsChoice:true});
 assert.equal((await s.service.accountChoiceState('person')).needsChoice,true);
 assert.equal(s.state().user.role,'STUDENT');
});
test('saved choices, unknown markers, existing Teachers and Admins are never reset',async()=>{
 for(const identity of types.ACCOUNT_TYPES.concat(['INVALID'])){
  const s=store({identity});assert.equal((await s.service.accountChoiceState('person')).needsChoice,false);
  assert.equal(await s.service.chooseAccountType('person','TEACHER'),false);assert.equal(s.state().identity,identity);
 }
 for(const role of ['ADMIN','TEACHER'])for(const identity of [null,'PENDING','CONTRIBUTOR']){
  const s=store({role,identity});assert.equal((await s.service.accountChoiceState('person')).needsChoice,false);
  assert.equal(await s.service.chooseAccountType('person','STUDENT'),false);
  assert.deepEqual(s.state(),{user:{role},identity});
 }
 const deleted=store({missing:true});assert.equal(await deleted.service.accountChoiceState('person'),null);
 assert.equal(await deleted.service.chooseAccountType('person','TEACHER'),false);
});
test('all three validated choices commit atomically once, including explicit Student',async()=>{
 for(const type of types.ACCOUNT_TYPES){
  const s=store();assert.equal(await s.service.chooseAccountType('person',type),true);
  assert.deepEqual(s.state(),{user:{role:types.capabilityRole(type)},identity:type});
  assert.equal(await s.service.chooseAccountType('person','TEACHER'),false);
  assert.equal((await s.service.accountChoiceState('person')).needsChoice,false);
 }
 const s=store();assert.equal(await s.service.chooseAccountType('person','ADMIN'),false);
 assert.deepEqual(s.state(),{user:{role:'STUDENT'},identity:null});
});
test('concurrent choices cannot overwrite one another; failed capability assignment rolls back the claim',async()=>{
 const s=store();const results=await Promise.all(['STUDENT','CONTRIBUTOR'].map(t=>s.service.chooseAccountType('person',t)));
 assert.deepEqual(results,[true,false]);assert.equal(s.state().identity,'STUDENT');
 const f=store({failedRoleWrite:true});assert.equal(await f.service.chooseAccountType('person','TEACHER'),false);
 assert.deepEqual(f.state(),{user:{role:'STUDENT'},identity:null});
});
test('serializable conflicts are retried finitely and persistent failures propagate',async()=>{
 const retry=store({conflicts:2});assert.equal(await retry.service.chooseAccountType('person','CONTRIBUTOR'),true);
 assert.equal(retry.attempts(),3);
 const fail=store({conflicts:3});await assert.rejects(fail.service.accountChoiceState('person'),e=>e.code==='P2034');
 assert.equal(fail.attempts(),3);assert.equal(fail.state().identity,null);
});
function nodes(n){if(!n||typeof n!=='object')return [];return [n,...React.Children.toArray(n.props?.children).flatMap(nodes)];}
async function formAction({role='STUDENT',identity=null,id='person'}={}){
 const s=store({role,identity});
 const page=load('app/auth/onboarding/page.tsx',{'@/auth':{auth:async()=>id?{user:{id}}:null},'@/lib/account-onboarding':s.service,'@/lib/account-type':types,'next/navigation':{redirect:path=>{throw {destination:path}}}}).default;
 const tree=await page();return {action:nodes(tree).find(n=>n.type==='form').props.action,tree,...s};
}
async function submit(action,type){const fd=new FormData();fd.set('accountType',type);fd.set('userId','victim');fd.set('role','ADMIN');try{await action(fd);}catch(e){if(e.destination)return e.destination;throw e;}}
test('onboarding shows all three buttons for any unclassified login, independent of Google',async()=>{
 const f=await formAction();assert.deepEqual(nodes(f.tree).filter(n=>n.type==='button').map(n=>n.props.value),types.ACCOUNT_TYPES);
 assert.doesNotMatch(JSON.stringify(f.tree),/Google সংযোগ/);
 for(const type of types.ACCOUNT_TYPES){const x=await formAction();assert.equal(await submit(x.action,type),types.accountDestination(type));assert.equal(x.state().identity,type);}
 const invalid=await formAction();assert.equal(await submit(invalid.action,'ADMIN'),'/auth/onboarding');
 assert.equal(invalid.state().user.role,'STUDENT');
});
test('completed identities, existing Teachers/Admins and anonymous requests cannot enter onboarding',async()=>{
 for(const args of [{identity:'STUDENT'},{identity:'TEACHER'},{role:'ADMIN',identity:'PENDING'},{role:'TEACHER'}])
  await assert.rejects(formAction(args),e=>e.destination==='/auth/landing');
 await assert.rejects(formAction({id:null}),e=>e.destination==='/login');
 const auth=fs.readFileSync('auth.ts','utf8');
 assert.ok(auth.includes('profile?.email_verified === true'));
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
test('every Google entry point uses the safe identity landing, including model-test/profile and Teacher login',async()=>{
 const calls=[];
 const button=load('components/model-test-login-button.tsx',{'@/lib/login-redirect':redirects,'next-auth/react':{signIn:async(...args)=>calls.push(args)}}).default;
 for(const callbackUrl of ['/profile','/model-test/exam/answers','https://evil.invalid','/auth/landing']){
  await button({callbackUrl}).props.onClick();assert.equal(calls.at(-1)[1].redirectTo,redirects.loginLandingPath(callbackUrl));
 }
 const teacher=load('app/teacher/actions.ts',{'@/lib/login-redirect':redirects,'@/auth':{signIn:async(...args)=>calls.push(args)}});
 await teacher.teacherGoogle();assert.deepEqual(calls.at(-1),['google',{redirectTo:'/auth/landing?next=%2Fdashboard'}]);
});
