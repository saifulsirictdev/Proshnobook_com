const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),Module=require('node:module'),{createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..'),original=Module._resolveFilename;
Module._resolveFilename=function(id,parent,...rest){return original.call(this,id.startsWith('@/')?path.join(root,id.slice(2)):id,parent,...rest);};
require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const {class8English2Batches}=require('../lib/class8-english2-batches.ts');
const registry=require('../lib/prepared-question-batches.ts'),manifest=require('../content/question-bank/class-8/english-2nd/manifest.json');
const {selectPreparedBatches,pendingReviewHref}=require('../lib/prepared-batch-selection.ts');
const {normalizeStem}=require('../lib/mcq-import.ts');
const all=class8English2Batches(),byId=new Map(all.map(b=>[b.id,b]));
const revisions=require('../content/question-bank/class-8/english-2nd/syllabus-revisions.json');
const revisionMap=new Map(revisions.revisions.map(r=>[`${r.topic}:${r.entry}`,r]));
const display=s=>s.replace(/\\n/g,'\n').replace(/\uf0b4/g,'×');
function actionHarness(role='ADMIN'){
  const rows=[],settings=new Map();let transactions=0;
  const tx={question:{findMany:async({where})=>rows.filter(q=>q.category===where.category&&q.subject===where.subject&&q.topic===where.topic),create:async({data})=>rows.push(data)},setting:{findUnique:async({where})=>settings.get(where.key),create:async({data})=>settings.set(data.key,data),update:async({where,data})=>settings.set(where.key,{key:where.key,...data})}};
  const mocks={'@prisma/client':{},'@/lib/guard':{staff:async()=>{if(role!=='ADMIN')throw Error('Forbidden');return{id:'owner-test'};}},'@/lib/db':{db:{$transaction:async(fn,options)=>{assert.equal(options.isolationLevel,'Serializable');transactions++;return fn(tx);}}},'@/lib/mcq-import':{normalizeStem},'@/lib/prepared-question-batches':{getPreparedBatch:id=>{const batch=byId.get(id);if(!batch)throw Error('Unknown');return{batch,digest:createHash('sha256').update(JSON.stringify(batch)).digest('hex')};},preparedQuestionId:registry.preparedQuestionId},'next/cache':{revalidatePath:()=>{}}};
  const file=path.join(root,'app/admin/questions/import/prepared-actions.ts'),m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);
  m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
  const form=id=>{const f=new FormData();f.set('id',id);f.set('digest',mocks['@/lib/prepared-question-batches'].getPreparedBatch(id).digest);f.set('reviewed','yes');return f;};
  return{actions:m.exports,form,rows,settings,transactions:()=>transactions};
}
test('11 latest Drive snapshots preserve exact bytes, 40 sets each, total 440; no postponed First Paper content',()=>{
  assert.equal(all.length,11);assert.equal(all.reduce((n,b)=>n+b.records.length,0),440);
  assert.equal(manifest.teacherApproved,false);assert.equal(manifest.total,440);
  assert.equal(new Set(all.flatMap(b=>b.records.map(q=>registry.preparedQuestionId(b,q)))).size,440);
  for(const [i,b] of all.entries()){
    const e=manifest.entries[i],bytes=fs.readFileSync(path.join(root,'content/question-bank/class-8/english-2nd',e.file)),raw=JSON.parse(bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),e.sha256);
    assert.equal(b.records.length,40);assert.equal(raw.items.length,40);assert.equal(b.category,'Class 8');assert.equal(b.subject,'English 2nd Paper');assert.equal(b.provenance.teacherApproved,false);
    assert.equal(b.provenance.sourceFileId,e.fileId);assert.equal(b.provenance.validationFileId,e.validationFileId);assert.equal(b.provenance.sourceSha256,e.sha256);
    assert.equal(b.provenance.originalSourceUrl,raw.sourceUrl);assert.equal(b.provenance.originalTopic,raw.topic);
    assert.equal(b.provenance.book,raw.book);assert.equal(b.provenance.edition,raw.edition);
    for(const [j,q] of b.records.entries()){
      const revision=revisionMap.get(`${e.file.replace(/\.json$/,'')}:${j+1}`);
      assert.equal(q.kind,'SQ');assert.equal(q.text,display(revision?.text??raw.items[j].text));assert.equal(q.explanation,display(revision?.explanation??raw.items[j].explanation));assert.equal(q.difficulty,raw.items[j].difficulty);
      if(revision){assert.equal(createHash('sha256').update(JSON.stringify(raw.items[j])).digest('hex'),revision.rawEntrySha256);assert.equal(revision.authorship,'LOCAL_AUTHORED_ADAPTATION_NOT_VERBATIM_SOURCE');assert.ok(revision.notes.length);}
      assert.equal(b.provenance.references[j].page,raw.items[j].page);assert.deepEqual(q.options,{});assert.equal(q.correct,'');assert.doesNotMatch(q.text,/\\n|\uf0b4/);
    }
  }
  assert.equal(all.filter(b=>/1st Paper/.test(b.subject)).length,0);
});
test('All 440 entries pass the existing strict catalog uploader without changing its limits',()=>{
  const subject=require('../lib/nctb-data.ts').NCTB_CLASSES.find(c=>c.class==='Class 8').subjects.find(s=>s.name==='English 2nd Paper');
  assert.deepEqual(all.map(b=>b.topic),subject.subCategories.find(g=>g.category==='Question Topics & Solutions (Section A & B)').topics);
  const summaries=registry.preparedSummaries();const selected=selectPreparedBatches(summaries,{category:'Class 8',subject:'English 2nd Paper',topic:''});assert.equal(selected.length,11);
  for(const s of selected){assert.deepEqual(s.counts,{MCQ:0,CQ:0,SQ:40});assert.equal(s.records,undefined);assert.equal(s.provenance,undefined);}
  assert.equal(selectPreparedBatches(summaries,{category:'Class 8',subject:'English 1st Paper (English For Today)',topic:''}).length,0);
  const href=new URL(pendingReviewHref('Class 8','English 2nd Paper'),'https://example.invalid');assert.equal(href.searchParams.get('status'),'pending');assert.equal(href.searchParams.get('category'),'Class 8');
});
test('Reviewed adaptations repair incomplete tables and short compositions without altering or misattributing raw snapshots',()=>{
  assert.equal(revisionMap.size,101);assert.equal(manifest.revisionCount,101);
  const bytes=fs.readFileSync(path.join(root,'content/question-bank/class-8/english-2nd',manifest.revisionFile));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.revisionSha256);
  assert.equal(revisions.blueprint.total,50);assert.equal(revisions.blueprint.grammar,30);assert.equal(revisions.blueprint.writing,20);
  assert.match(revisions.reviewSummary.unresolved.join(' '),/No separately named official/);
  assert.ok(all.every(b=>b.limitations.includes('Pending')&&b.limitations.includes('teacher')&&b.limitations.includes('not certified structured Auto Model')));
  assert.ok(all.every(b=>!JSON.stringify(b.provenance).includes('boardSource')));
  assert.match(all[0].limitations,/WITHOUT clues/);assert.match(all[8].limitations,/25 scenarios/);assert.match(all[9].limitations,/38 adapted/);assert.match(all[5].limitations,/37 dialogues reused/);
  for (const b of all){assert.match(b.provenance.attributionPolicy,/not verbatim/);assert.equal(b.provenance.alignmentReferences.length,2);}
  assert.match(all[0].records[0].text,/easy task/);assert.doesNotMatch(all[0].records[0].text,/easy work/);
  assert.match(all[0].records[1].text,/the one hand/);assert.match(all[0].records[1].text,/other hand/);
  assert.match(all[2].records[1].text,/weather station/);assert.doesNotMatch(all[2].records[1].text,/preserve dead bodies/);
  assert.match(all[4].records[1].explanation,/There is nobody who does not need trees/);
  assert.match(all[4].records[38].text,/We should respect the elderly/);
});
test('All 440 adapted exercise sets meet their model task shapes, with replayable punctuation and reconstructible tables',()=>{
  const labels=n=>Array.from({length:n},(_,i)=>`(${String.fromCharCode(97+i)})`);
  for(const [index,n] of [[0,10],[2,5],[4,5]])for(const q of all[index].records){
    for(const part of labels(n)){assert.equal(q.text.split(part).length-1,1,part);assert.equal(q.explanation.split(part).length-1,1,part);}
  }
  for(const [i,q] of all[1].records.entries()){
    assert.match(q.text,/Make five meaningful sentences/);
    const rows=q.text.split('\n').filter(s=>s.includes(' | ')&&!s.startsWith('Column A'));
    assert.equal(rows.length,5);const columns=[0,1,2].map(i=>rows.map(r=>r.split(' | ')[i]));
    assert.ok(rows.every(r=>r.split(' | ').length===3&&r.split(' | ').every(Boolean)));
    const answers=q.explanation.split('\n').slice(1).map(s=>s.replace(/^\d+\. /,'').replace(/\.$/,''));assert.equal(answers.length,5);
    for(const answer of answers)assert.ok(columns[0].some(a=>columns[1].some(b=>columns[2].some(c=>`${a} ${b} ${c}`.replace(/\.$/,'')===answer))),`table ${i+1}: ${answer}`);
  }
  for(const [i,q] of all[5].records.entries()){
    const review=revisionMap.get(`punctuation:${i+1}`).review;let passage=q.text.split('\n').slice(1).join('\n');
    assert.equal(review.corrections.length,10);assert.equal(new Set(review.corrections.map(c=>c.position)).size,10);
    for(const c of [...review.corrections].reverse()){
      assert.equal(passage.slice(c.position,c.position+c.incorrect.length),c.incorrect);
      assert.ok(c.incorrect===''||c.correct.toLowerCase()===c.incorrect);
      passage=passage.slice(0,c.position)+c.correct+passage.slice(c.position+c.incorrect.length);
    }
    assert.equal(passage,review.correctedPassage);assert.equal(q.explanation,'One possible corrected passage:\n'+passage);
  }
  for(const [i,q] of all[10].records.entries()){
    const words=q.explanation.split('\n\n').slice(1).join(' ').trim().split(/\s+/).length,review=revisionMap.get(`composition:${i+1}`).review;
    assert.equal(words,review.bodyWords);assert.ok(words>=240&&words<=260,`composition ${i+1}: ${words}`);
    assert.ok(q.explanation.includes(review.addedParagraph));assert.match(review.addedParagraph,/[.!?]$/);assert.match(q.text,/about 250 words/);
  }
  for(const q of all[3].records){assert.match(q.text,/reported speech/);assert.match(q.explanation,/Suggested answer:/);}
  for(const index of [6,7,8,9])for(const q of all[index].records){assert.match(q.text,/Suppose.*Write (?:an? )?(?:informal |formal )?(?:letter|email|application)/);assert.ok(q.explanation.length>250);}
  for(const index of [8,9])for(const q of all[index].records){assert.match(q.explanation,/To:.*@example\.com/);assert.match(q.explanation,/From:.*@example\.com/);assert.match(q.explanation,/Subject:/);}
});
test('Source metadata is never truncated or filled using fabricated source attribution',()=>{
  assert.ok(all.some(b=>b.provenance.references.some(r=>r.page.length>100)));
  for(const i of [7,8]){const e=manifest.entries[i];assert.equal(all[i].provenance.originalSourceUrl,'');assert.equal(all[i].provenance.sourceUrl,`https://drive.google.com/file/d/${e.fileId}/view`);}
  assert.equal(all[4].provenance.originalTopic,'Section A - Ques 5: Changing Sentences');assert.match(all[4].topic,/Degrees of Comparison/);
});
test('Non-ADMIN roles, stale preview and missing explicit consent cannot import Class 8 batches',async()=>{
  for(const role of ['ANONYMOUS','TEACHER','STUDENT']){const h=actionHarness(role);assert.ok((await h.actions.previewPrepared({},h.form(all[0].id))).error);assert.ok((await h.actions.savePrepared({},h.form(all[0].id))).error);assert.equal(h.transactions(),0);}
  const h=actionHarness();for(const field of ['reviewed','digest']){const f=h.form(all[0].id);f.delete(field);assert.ok((await h.actions.savePrepared({},f)).error);}
  const f=h.form(all[0].id);f.set('digest','0'.repeat(64));assert.ok((await h.actions.savePrepared({},f)).error);assert.equal(h.transactions(),0);
});
test('Actual ADMIN actions preview all questions read-only, save all 440 only as Pending and preserve decisions on repeat',async()=>{
  const h=actionHarness();
  for(const b of all){const p=await h.actions.previewPrepared({},h.form(b.id));assert.equal(p.preview.length,40);assert.ok(p.preview[0].explanation);}
  assert.equal(h.transactions(),0);assert.equal(h.rows.length,0);
  for(const b of all){const f=h.form(b.id);f.set('category','SSC');const saved=await h.actions.savePrepared({},f);assert.equal(saved.counts.inserted,40);}
  assert.equal(h.rows.length,440);assert.equal(h.settings.size,11);assert.ok(h.rows.every(q=>q.approved===false&&q.category==='Class 8'&&q.subject==='English 2nd Paper'));
  h.rows[0].approved=true;const snapshot=JSON.stringify(h.rows);
  for(const b of all){const saved=await h.actions.savePrepared({},h.form(b.id));assert.equal(saved.counts.inserted,0);}
  assert.equal(JSON.stringify(h.rows),snapshot);
  for(const value of h.settings.values()){const receipt=JSON.parse(value.value);assert.equal(receipt.actorId,'owner-test');assert.equal(receipt.provenance.references.length,40);assert.equal(receipt.provenance.teacherApproved,false);assert.ok(receipt.provenance.sourceSha256);}
});
