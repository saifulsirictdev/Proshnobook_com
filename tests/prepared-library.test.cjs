const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module');
function load(file,mocks={}){const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return m.exports;}
const json=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const data=load('lib/nctb-data.ts'),mcq=load('lib/mcq-import.ts',{'@/lib/nctb-data':data}),written=load('lib/written-question-import.ts',{'./mcq-import':mcq});
const upload=load('lib/question-json-import.ts',{'./nctb-data':data,'./mcq-import':mcq});
const remainingMocks={'./question-json-import':upload};
for(let n=3;n<=8;n++){for(const file of ['questions','validation'])remainingMocks[`@/content/question-bank/class-6/chapter-${n}/${file}.json`]=json(`content/question-bank/class-6/chapter-${n}/${file}.json`);}
const remaining=load('lib/class6-remaining-batches.ts',remainingMocks);
const scienceMocks={'./question-json-import':upload};
for(let n=1;n<=14;n++)for(const file of ['questions','validation'])scienceMocks[`@/content/question-bank/class-6/science/chapter-${n}/${file}.json`]=json(`content/question-bank/class-6/science/chapter-${n}/${file}.json`);
const science=load('lib/class6-science-batches.ts',scienceMocks);
const hscMocks={'./question-json-import':upload};
for(let n=1;n<=6;n++)for(const f of ['questions','validation'])hscMocks[`@/content/question-bank/class-11-12/ict/chapter-${n}/${f}.json`]=json(`content/question-bank/class-11-12/ict/chapter-${n}/${f}.json`);
const hsc=load('lib/hsc-ict-batches.ts',hscMocks);
const bgsMocks={'./question-json-import':upload};
for(let n=1;n<=8;n++)for(const f of ['questions','validation'])bgsMocks[`@/content/question-bank/class-6/bgs/chapter-${n}/${f}.json`]=json(`content/question-bank/class-6/bgs/chapter-${n}/${f}.json`);
const bgs=load('lib/class6-bgs-batches.ts',bgsMocks);
const englishMocks={'./question-json-import':upload,'@/content/question-bank/class-6/english-1st/import/manifest.json':json('content/question-bank/class-6/english-1st/import/manifest.json')};
for(let n=1;n<=33;n++){const f=`content/question-bank/class-6/english-1st/import/lesson-${String(n).padStart(2,'0')}.json`;englishMocks['@/'+f]=json(f);}
const english=load('lib/class6-english1-batches.ts',englishMocks);
const class8Mocks={'./question-json-import':upload};
for(const f of fs.readdirSync('content/question-bank/class-8/english-2nd').filter(f=>f.endsWith('.json'))){const p='content/question-bank/class-8/english-2nd/'+f;class8Mocks['@/'+p]=json(p);}
const class8=load('lib/class8-english2-batches.ts',class8Mocks);
const lib=load('lib/prepared-question-batches.ts',{'./class8-english2-batches':class8,'./class6-english1-batches':english,'./class6-bgs-batches':bgs,'./hsc-ict-batches':hsc,'./class6-science-batches':science,'./class6-remaining-batches':remaining,'./question-json-import':upload,'@/content/question-bank/class-6/chapter-2/questions.json':json('content/question-bank/class-6/chapter-2/questions.json'),'@/content/question-bank/class-6/chapter-2/validation.json':json('content/question-bank/class-6/chapter-2/validation.json'),'./nctb-data':data,'./mcq-import':mcq,'./written-question-import':written,'@/content/question-bank/class-6/math-ch1-draft.json':json('content/question-bank/class-6/math-ch1-draft.json'),'@/deliverables/class6-math-ch1/cq-sq-draft.json':json('deliverables/class6-math-ch1/cq-sq-draft.json'),'@/deliverables/class6-math-ch1/chapter-alignment-review.json':json('deliverables/class6-math-ch1/chapter-alignment-review.json')});
test('catalog reuses all existing classes and batch summaries do not expose answers',()=>{
 assert.deepEqual(lib.importCatalog.map(c=>c.category),data.NCTB_CLASSES.map(c=>c.class));
 const summaries=lib.preparedSummaries();assert.equal(summaries.length,81);
 assert.deepEqual(summaries[0].counts,{MCQ:100,CQ:0,SQ:0});assert.deepEqual(summaries[1].counts,{MCQ:0,CQ:30,SQ:30});
 assert.equal(summaries[0].records,undefined);assert.throws(()=>lib.getPreparedBatch('unregistered'));
 for(const s of summaries){const {batch,digest}=lib.getPreparedBatch(s.id);assert.equal(digest.length,64);assert.equal(new Set(batch.records.map(q=>lib.preparedQuestionId(batch,q))).size,batch.records.length);}
});
function harness(role='ADMIN'){
 const questions=[],settings=new Map();let calls=0,fail=false;
 const tx={question:{findMany:async({where})=>questions.filter(q=>(!q.category||q.category===where.category)&&(!q.subject||q.subject===where.subject)&&(!q.topic||q.topic===where.topic)),create:async({data})=>questions.push(data)},setting:{findUnique:async({where})=>settings.get(where.key),create:async({data})=>settings.set(data.key,data),update:async({where,data})=>settings.set(where.key,{key:where.key,...data})}};
 const actions=load('app/admin/questions/import/prepared-actions.ts',{'@prisma/client':{},'@/lib/guard':{staff:async()=>{if(role!=='ADMIN')throw Error('denied');return{id:'owner'};}},'@/lib/db':{db:{$transaction:async(fn,opts)=>{calls++;assert.equal(opts.isolationLevel,'Serializable');if(fail){fail=false;throw Object.assign(Error(),{code:'P2034'});}return fn(tx);}}},'@/lib/mcq-import':mcq,'@/lib/prepared-question-batches':lib,'next/cache':{revalidatePath:()=>{}}});
 const form=(id=lib.preparedSummaries()[0].id)=>{const f=new FormData();f.set('id',id);f.set('digest',lib.getPreparedBatch(id).digest);f.set('reviewed','yes');return f;};
 return{actions,questions,settings,form,calls:()=>calls,retry:()=>fail=true};
}
test('selection is not authority; unknown batches, missing acknowledgement and non Admin are denied',async()=>{
 for(const role of ['ANONYMOUS','STUDENT','TEACHER']){const h=harness(role);assert.ok((await h.actions.previewPrepared({},h.form())).error);assert.ok((await h.actions.savePrepared({},h.form())).error);assert.equal(h.calls(),0);}
 const h=harness();for(const field of ['id','digest','reviewed']){const f=h.form();f.delete(field);assert.ok((await h.actions.savePrepared({},f)).error);}assert.equal(h.calls(),0);
});
test('preview read-only, both batch types save Pending, retry/dedup/audit maintained',async()=>{
 const h=harness();assert.equal((await h.actions.previewPrepared({},h.form())).preview.length,100);assert.equal(h.calls(),0);
 h.retry();for(const b of lib.preparedSummaries()){const f=h.form(b.id);f.set('category','INJECTED');assert.ok((await h.actions.savePrepared({},f)).message);await h.actions.savePrepared({},f);}
 assert.equal(h.questions.length,6816);assert.equal(h.settings.size,81);
 for(const q of h.questions){assert.ok(['Class 6','Class 8','Class 11-12'].includes(q.category));assert.equal(q.approved,false);}
 const audit=JSON.parse([...h.settings.values()][0].value);assert.equal(audit.actorId,'owner');assert.ok(audit.provenance);assert.equal(audit.inserted,100);
 const legacy=harness();legacy.questions.push({text:lib.getPreparedBatch(lib.preparedSummaries()[0].id).batch.records[0].text});await legacy.actions.savePrepared({},legacy.form());assert.equal(legacy.questions.length,100);
});
const selection=load('lib/prepared-batch-selection.ts');
test('Class 6 science selection shows all 14 chapters and chapter narrowing preserves totals',()=>{
 const batches=lib.preparedSummaries();
 const all=selection.selectPreparedBatches(batches,{category:'Class 6',subject:'বিজ্ঞান',topic:''});
 assert.equal(all.length,14);
 assert.deepEqual(all.reduce((n,b)=>({MCQ:n.MCQ+b.counts.MCQ,CQ:n.CQ+b.counts.CQ,SQ:n.SQ+b.counts.SQ}),{MCQ:0,CQ:0,SQ:0}),{MCQ:1400,CQ:420,SQ:420});
 assert.ok(all.every(b=>b.subject==='বিজ্ঞান'));
 assert.equal(selection.selectPreparedBatches(batches,{category:'Class 6',subject:'বিজ্ঞান',topic:all[0].topic}).length,1);
 assert.equal(selection.selectPreparedBatches(batches,{category:'Class 7',subject:'বিজ্ঞান',topic:''}).length,0);
 assert.equal(selection.selectPreparedBatches(batches,{category:'Class 6',subject:'',topic:''}).length,0);
 const href=selection.pendingReviewHref('Class 6','বিজ্ঞান');const url=new URL(href,'https://proshnobook.com');
 assert.equal(url.pathname,'/admin/questions');assert.equal(url.searchParams.get('category'),'Class 6');assert.equal(url.searchParams.get('subject'),'বিজ্ঞান');assert.equal(url.searchParams.get('status'),'pending');
});
test('science preview is read-only and Admin saves only Pending for separate approval',async()=>{
 const h=harness();const batches=selection.selectPreparedBatches(lib.preparedSummaries(),{category:'Class 6',subject:'বিজ্ঞান',topic:''});
 const preview=await h.actions.previewPrepared({},h.form(batches[0].id));assert.equal(preview.preview.length,160);assert.equal(h.calls(),0);
 for(const b of batches)assert.ok((await h.actions.savePrepared({},h.form(b.id))).message);
 assert.equal(h.questions.length,2240);assert.equal(h.settings.size,14);
 assert.ok(h.questions.every(q=>q.approved===false&&q.category==='Class 6'&&q.subject==='বিজ্ঞান'));
});

test('whole-selection preview/save reuses authenticated per-batch actions with digest, consent and partial retry',()=>{
 const ui=fs.readFileSync('app/admin/questions/import/prepared-library.tsx','utf8');
 assert.ok(ui.includes('function SubjectBatchPanel'));
 assert.ok(ui.includes('key={JSON.stringify([category,subject,topic])}'));
 assert.ok(ui.includes('batches.every(b=>previews[b.id]?.digest&&previews[b.id]?.preview)'));
 assert.ok(ui.includes('if(busy||!complete||!reviewed)return'));
 assert.ok(ui.includes('if(results[b.id]?.message)continue'));
 assert.ok(ui.includes('fd.set("digest",previews[b.id].digest!)'));
 assert.ok(ui.includes('fd.set("reviewed","yes")'));
 assert.ok(ui.includes('await previewPrepared({},fd)'));assert.ok(ui.includes('await savePrepared({},fd)'));
 assert.ok(ui.includes('সম্পূর্ণ প্রক্রিয়া এক লেনদেন নয়'));assert.ok(ui.includes('ফল নিশ্চিত হয়নি'));
 assert.ok(!ui.includes('approved:true'));
});

test('HSC ICT uses six existing topics, honest quarantine counts and preserved source hashes',()=>{
 const crypto=require('node:crypto'), all=hsc.hscIctBatches();assert.equal(all.length,6);
 assert.deepEqual(all.map(b=>b.records.length),[184,185,153,185,184,185]);
 const totals={MCQ:0,CQ:0,SQ:0};
 all.forEach((b,i)=>{
  assert.equal(b.category,'Class 11-12');assert.equal(b.subject,'তথ্য ও যোগাযোগ প্রযুক্তি');
  const r=json(`content/question-bank/class-11-12/ict/chapter-${i+1}/validation.json`);
  const raw=fs.readFileSync(`content/question-bank/class-11-12/ict/chapter-${i+1}/source-questions.json`);
  assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),r.sourceSha256);
  assert.equal(r.teacherApproved,false);assert.equal(r.total+r.quarantined.length,185);
  const {batch}=lib.getPreparedBatch(b.id);assert.equal(batch.records.length,r.total);
  b.records.forEach(q=>{totals[q.kind]++;assert.ok(q.explanation);if(q.kind==='CQ')assert.deepEqual(q.options.marks,{k:1,kh:2,g:3,gh:4});});
 });
 assert.deepEqual(totals,{MCQ:595,CQ:240,SQ:241});
 const q1=json('content/question-bank/class-11-12/ict/chapter-1/source-questions.json').items[0];
 assert.ok(!all[0].records.some(q=>q.text===q1.text));
});

test('import index builds registry once and preserves every action digest without exposing answers',()=>{
 const index=lib.preparedImportIndex();assert.equal(index.length,81);
 for(const entry of index){
  const {batch,digest}=lib.getPreparedBatch(entry.id);
  assert.equal(entry.digest,digest);assert.equal(entry.records,undefined);assert.equal(entry.provenance,undefined);
  assert.equal(Object.values(entry.counts).reduce((a,b)=>a+b,0),batch.records.length);
 }
 const src=fs.readFileSync('lib/prepared-question-batches.ts','utf8');
 const fn=src.split('export function preparedImportIndex(){')[1].split('export const preparedQuestionId')[0];
 assert.equal((fn.match(/preparedBatches\(\)/g)||[]).length,1);
 assert.ok(!fn.includes('getPreparedBatch('));
 const page=fs.readFileSync('app/admin/questions/import/page.tsx','utf8');
 assert.ok(page.indexOf('await staff()')<page.indexOf('preparedImportIndex()'));
 assert.ok(!page.includes('getPreparedBatch('));assert.ok(page.includes('await Promise.all(['));
});

test('Class 6 BGS chapter1 is source-read Draft, with full CQ and truthful whole-subject deficit',()=>{
 const input=json('content/question-bank/class-6/bgs/chapter-1/questions.json');
 const review=json('content/question-bank/class-6/bgs/chapter-1/validation.json');
 const manifest=json('content/question-bank/class-6/bgs/manifest.json');
 const {batch}=lib.getPreparedBatch('class6-bgs-ch1-draft-v1');
 assert.equal(batch.category,'Class 6');assert.equal(batch.subject,'বাংলাদেশ ও বিশ্বপরিচয়');assert.equal(batch.records.length,160);
 assert.deepEqual(review.counts,{MCQ:100,CQ:30,SQ:30});assert.equal(review.teacherApproved,false);assert.equal(review.sourceFullRead,true);
 assert.equal(manifest.targetMet,true);assert.equal(manifest.deficit,0);assert.equal(manifest.chapters.filter(c=>c.status==='NOT_STARTED').length,0);
 const keys={A:0,B:0,C:0,D:0};
 for(const q of input.items){assert.ok(q.explanation.trim());assert.ok(q.page.includes('PDF'));
  if(q.type==='MCQ')keys[q.correct]++;
  if(q.type==='CQ'){assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);assert.deepEqual(q.parts.map(p=>p.label),['ক','খ','গ','ঘ']);assert.ok(q.parts.every(p=>p.solution.trim()&&p.question.trim()));}
 }
 assert.deepEqual(keys,{A:25,B:25,C:25,D:25});
 assert.ok(review.limitations.some(s=>s.includes('লিঙ্গ')));assert.ok(review.limitations.some(s=>s.includes('ওয়াট')));
});
test('BGS chapter2 retains source warnings, balanced keys and complete unapproved CQ',()=>{
 const input=json('content/question-bank/class-6/bgs/chapter-2/questions.json');
 const review=json('content/question-bank/class-6/bgs/chapter-2/validation.json');
 const {batch}=lib.getPreparedBatch('class6-bgs-ch2-draft-v1');
 assert.equal(batch.records.length,160);assert.equal(review.teacherApproved,false);
 assert.match(review.limitations.join(' '),/আইনি/);
 assert.equal(review.printedPages,'10–18');
 const keys={A:0,B:0,C:0,D:0};const seen=new Set();
 for(const q of input.items){assert.ok(!seen.has(q.text));seen.add(q.text);
  if(q.type==='MCQ'){keys[q.correct]++;assert.equal(new Set(Object.values(q.options)).size,4);}
  if(q.type==='CQ'){assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);assert.ok(q.parts.every(p=>p.question&&p.solution));}
 }
 assert.deepEqual(keys,{A:25,B:25,C:25,D:25});
});
test('BGS chapter3 culture Draft validates CQ structure, unique stems and balanced options',()=>{
 const input=json('content/question-bank/class-6/bgs/chapter-3/questions.json');
 const review=json('content/question-bank/class-6/bgs/chapter-3/validation.json');
 assert.equal(lib.getPreparedBatch('class6-bgs-ch3-draft-v1').batch.records.length,160);
 assert.equal(review.teacherApproved,false);assert.equal(review.printedPages,'19–23');
 const seen=new Set(),keys={A:0,B:0,C:0,D:0},counts={MCQ:0,CQ:0,SQ:0};
 for(const q of input.items){counts[q.type]++;assert.ok(!seen.has(q.text));seen.add(q.text);
  if(q.type==='MCQ'){keys[q.correct]++;assert.equal(new Set(Object.values(q.options)).size,4);}
  if(q.type==='CQ'){assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);assert.ok(q.parts.every(p=>p.question&&p.solution));}
 }
 assert.deepEqual(counts,{MCQ:100,CQ:30,SQ:30});assert.deepEqual(keys,{A:25,B:25,C:25,D:25});
});
test('BGS chapter4 economics keeps full Draft structure and time-sensitive data warnings',()=>{
 const input=json('content/question-bank/class-6/bgs/chapter-4/questions.json');
 const review=json('content/question-bank/class-6/bgs/chapter-4/validation.json');
 assert.equal(lib.getPreparedBatch('class6-bgs-ch4-draft-v1').batch.records.length,160);
 assert.equal(review.teacherApproved,false);assert.equal(review.printedPages,'24–33');
 assert.match(review.limitations.join(' '),/বর্তমান পরিসংখ্যান স্বাধীনভাবে যাচাই করা হয়নি/);
 const seen=new Set(),keys={A:0,B:0,C:0,D:0},counts={MCQ:0,CQ:0,SQ:0};
 for(const q of input.items){counts[q.type]++;assert.ok(!seen.has(q.text));seen.add(q.text);
  const printed=Number(q.page.match(/\d+/)[0]);assert.ok(printed>=24&&printed<=33);
  if(q.type==='MCQ'){keys[q.correct]++;assert.equal(new Set(Object.values(q.options)).size,4);}
  if(q.type==='CQ'){assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);assert.ok(q.parts.every(p=>p.question&&p.solution));}
 }
 assert.deepEqual(counts,{MCQ:100,CQ:30,SQ:30});assert.deepEqual(keys,{A:25,B:25,C:25,D:25});
});
test('BGS chapter5 citizenship Draft has full CQ and keeps legal limitations explicit',()=>{
 const input=json('content/question-bank/class-6/bgs/chapter-5/questions.json');
 const review=json('content/question-bank/class-6/bgs/chapter-5/validation.json');
 assert.equal(lib.getPreparedBatch('class6-bgs-ch5-draft-v1').batch.records.length,160);
 assert.equal(review.teacherApproved,false);assert.equal(review.printedPages,'34–42');
 assert.match(review.limitations.join(' '),/বর্তমান আইন/);
 const counts={MCQ:0,CQ:0,SQ:0},keys={A:0,B:0,C:0,D:0};
 for(const q of input.items){counts[q.type]++;if(q.type==='MCQ'){keys[q.correct]++;assert.equal(new Set(Object.values(q.options)).size,4);}if(q.type==='CQ'){assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);assert.ok(q.parts.every(p=>p.question&&p.solution));}}
 assert.deepEqual(counts,{MCQ:100,CQ:30,SQ:30});assert.deepEqual(keys,{A:25,B:25,C:25,D:25});
});
test('BGS chapters6–8 are complete unapproved Draft with provenance and balanced keys',()=>{
 const manifest=json('content/question-bank/class-6/bgs/manifest.json');
 for(let n=6;n<=8;n++){
  const input=json(`content/question-bank/class-6/bgs/chapter-${n}/questions.json`);
  const review=json(`content/question-bank/class-6/bgs/chapter-${n}/validation.json`);
  assert.equal(review.teacherApproved,false);assert.equal(review.targetMet,true);
  assert.equal(lib.getPreparedBatch(`class6-bgs-ch${n}-draft-v1`).batch.records.length,160);
  const counts={MCQ:0,CQ:0,SQ:0},keys={A:0,B:0,C:0,D:0},seen=new Set();
  const [lo,hi]=review.printedPages.split('–').map(Number);
  for(const q of input.items){
   counts[q.type]++;assert.ok(!seen.has(q.text),q.text);seen.add(q.text);
   const page=Number(q.page.match(/\d+/)[0]);assert.ok(page>=lo&&page<=hi);assert.ok(q.explanation.trim());
   if(q.type==='MCQ'){keys[q.correct]++;assert.equal(new Set(Object.values(q.options)).size,4);}
   if(q.type==='CQ'){assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);assert.deepEqual(q.parts.map(p=>p.label),['ক','খ','গ','ঘ']);assert.ok(q.parts.every(p=>p.question.trim()&&p.solution.trim()));}
  }
  assert.deepEqual(counts,{MCQ:100,CQ:30,SQ:30});assert.deepEqual(keys,{A:25,B:25,C:25,D:25});
  assert.equal(manifest.chapters[n-1].sourceFullRead,true);
  assert.ok(!fs.existsSync(`content/question-bank/class-6/bgs/chapter-${n}/authoring-partial.json`));
 }
 assert.deepEqual(manifest.actuals,{MCQ:800,CQ:240,SQ:240,total:1280});assert.equal(manifest.deficit,0);assert.equal(manifest.targetMet,true);assert.equal(manifest.teacherApproved,false);
 assert.match(json('content/question-bank/class-6/bgs/chapter-6/validation.json').limitations.join(' '),/ওজোন/);
 assert.match(json('content/question-bank/class-6/bgs/chapter-7/validation.json').limitations.join(' '),/ক্ষতিকর শ্রম/);
 assert.match(json('content/question-bank/class-6/bgs/chapter-8/validation.json').limitations.join(' '),/সব EU সদস্য/);
});

test('receipt does not hide missing questions and counts distinguish live Pending and Approved without resetting approvals',async()=>{
 const h=harness(),form=h.form();
 const first=await h.actions.savePrepared({},form);assert.equal(first.counts.inserted,100);
 h.questions[0].approved=true;h.questions[1].approved=true;
 const again=await h.actions.savePrepared({},form);assert.deepEqual(again.counts,{inserted:0,pending:98,approved:2});
 h.questions.splice(2,1);
 const repaired=await h.actions.savePrepared({},form);assert.deepEqual(repaired.counts,{inserted:1,pending:97,approved:2});assert.equal(h.questions.length,100);assert.equal(h.questions.filter(q=>q.approved).length,2);
 const audit=JSON.parse([...h.settings.values()][0].value);assert.equal(audit.inserted,100);assert.equal(audit.lastReconciliation.counts.inserted,1);
});
test('all previously approved questions yield zero Pending, not a misleading new-save count',async()=>{
 const h=harness();await h.actions.savePrepared({},h.form());for(const q of h.questions)q.approved=true;
 const result=await h.actions.savePrepared({},h.form());assert.deepEqual(result.counts,{inserted:0,pending:0,approved:100});assert.match(result.message,/আগে থেকেই Approved: 100টি/);
});
