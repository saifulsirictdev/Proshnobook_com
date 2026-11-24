const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {JSDOM}=require('jsdom');
const root='content/question-bank/ssc/biology/chapter-12',docs='docs/question-bank/ssc-biology';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex');
const bank=kind=>read(`${root}/rebuild-${kind}.json`).items;
const evidence=()=>read(`${docs}/chapter-12-completion-review.json`);
test('chapter 12 exact 200/50/70 raw rows reconcile all shuffled answers and CQ marks',()=>{
 for(const [kind,n,width,files] of [
  ['mcq',200,8,['mcq','mcq-b']],['cq',50,11,['cq','cq-b']],['sq',70,4,['sq']]]){
  const qs=bank(kind),ledger=read(`${root}/source-ledger.json`).entries;let count=0;
  for(const suffix of files){const name=`scripts/question-bank/biology/chapter-12-${suffix}.txt`;
   fs.readFileSync(name,'utf8').split('\n').forEach((line,i)=>{
    if(!line||line.startsWith('#'))return;count++;const r=line.split('|');assert.equal(r.length,width);assert.equal(r[0],'12');
    const q=qs.find(q=>q.text===r[1]);assert.ok(q,r[1]);
    if(kind==='mcq'){assert.equal(q.options[q.correct],r[2]);assert.equal(q.explanation,r[6]);assert.deepEqual(Object.values(q.options).sort(),r.slice(2,6).sort());}
    else if(kind==='sq')assert.equal(q.explanation,r[2]);
    else{assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);assert.deepEqual(q.parts.map(p=>p.label),['ক','খ','গ','ঘ']);q.parts.forEach((p,j)=>{assert.equal(p.question,r[2+2*j]);assert.equal(p.solution,r[3+2*j]);});}
    const e=ledger.find(e=>e.authoringRefs.includes(`${name}:${i+1}`));assert.ok(e);assert.equal(e.origin,'original_practice');assert.equal(e.generatedFromConceptCards,false);
   });
  }assert.equal(count,n);assert.equal(qs.length,n);
 }
});
test('chapter 12 reader works through every page and embeds four safe offline CQ diagrams',()=>{
 const dom=new JSDOM(fs.readFileSync(`${docs}/chapter-12.html`,'utf8'),{runScripts:'dangerously'}),w=dom.window,d=w.document,$=id=>d.getElementById(id);
 const records=JSON.parse($('bank').textContent);assert.equal(records.length,320);assert.ok(records.every(x=>x.chapter===12));
 assert.equal(records.filter(x=>x.figure).length,4);const seen=new Set();
 while(true){for(const e of d.querySelectorAll('article .meta'))if(e.textContent.startsWith('bio-'))seen.add(e.textContent.split(' · ')[0]);if($('next').disabled)break;$('next').click();}
 assert.equal(seen.size,320);assert.equal($('page').textContent,'16 / 16');
 $('kind').value='CQ';$('kind').dispatchEvent(new w.Event('change'));assert.ok(d.querySelector('img'));assert.ok([...d.querySelectorAll('h2')].every(e=>!e.textContent.includes('![')));
 $('toggle').click();assert.ok([...d.querySelectorAll('details')].every(e=>e.open));
 $('search').value='অস্তিত্বহীন123456789';$('search').dispatchEvent(new w.Event('input'));assert.equal(d.querySelectorAll('article').length,0);
 for(const r of records.filter(x=>x.figure)){const b=fs.readFileSync(r.evidence.figure.path);assert.equal(sha(b),r.evidence.figure.sha256);assert.ok(Buffer.from(r.figure.dataUri.split(',')[1],'base64').equals(b));assert.match(r.item.text,/লিখিত সমতুল্য/);assert.doesNotMatch(b.toString(),/<script|foreignObject|href=|onload=/i);}
 assert.equal(d.querySelectorAll('script[src],iframe,link[href]').length,0);dom.window.close();
});
test('chapter 12 preserves all chapter 1–11 bank artifacts and readers against 69a78e9',()=>{
 const v=evidence();assert.equal(v.baseline,'69a78e9');assert.equal(v.preservedEarlierFileCount,115);
 for(const [name,hash] of Object.entries(v.preservedEarlierFileHashes)){const b=fs.readFileSync(name);assert.equal(sha(b),hash,name);assert.ok(require('./helpers/biology-historical-bytes.cjs')(v.baseline,name).equals(b),name);}
});
test('chapter 12 technical counts and backups never turn author checks into independent review',()=>{
 const v=evidence(),c=read(`${root}/draft-validation.json`),p=read(`${docs}/progress.json`),plan=read(`${docs}/batch-plan.json`);
 assert.deepEqual(c.counts,{MCQ:200,CQ:50,SQ:70});assert.equal(v.total,320);assert.equal(p.draftItems,3840);assert.equal(v.globalDraftItems,3840);assert.equal(v.remainingTargetItems,640);
 assert.deepEqual(plan.batches.map(b=>b.remainingTotal),[0,0,640]);assert.equal(plan.activeChapter,12);assert.equal(plan.publicationAuthorized,false);
 assert.deepEqual(v.mcqKeys,{A:50,B:50,C:50,D:50});assert.equal(v.lexicalScreen.exactUniqueStems,320);assert.equal(v.lexicalScreen.candidatePairs,2);assert.equal(v.lexicalScreen.semanticCertification,false);
 for(const item of v.lexicalScreen.candidates)assert.match(item.authorDisposition,/Not independent/);
 for(const flag of ['teacherCertified','textbookChapterRead','independentContentReview','nearDuplicateReviewComplete','approved','published','websiteImported']){assert.equal(c[flag],false);assert.equal(v[flag],false);}
 assert.equal(v.incrementalBackup.bytes,53234);assert.equal(v.incrementalBackup.md5,'a5b927b7f1d1830c045259860d883f1d');assert.equal(v.incrementalBackup.independentRemoteGetVerified,true);assert.match(v.incrementalBackup.scope,/before mixed-script/);
 assert.equal(v.technicalValidation.fullAppBuildClaimed,false);
});
test('chapter 12 DNA arithmetic, replication labels and conditional Mendelian risks are correct',()=>{
 const sq=bank('sq'),sol=s=>{const q=sq.find(q=>q.text.includes(s));assert.ok(q,s);return q.explanation;};
 for(const [s,a] of [['A=30%','20%'],['20 A–T','130'],['10 base pair','20']])assert.ok(sol(s).includes(a),s);
 const conditional=bank('mcq').find(q=>q.text.includes('লম্বা অপত্যের মধ্যে Tt'));assert.ok(conditional);assert.equal(conditional.options[conditional.correct],'2/3');
 const cq=bank('cq');
 for(const [s,a] of [['100bp','240'],['50 ব্যক্তি','0.4'],['ছোট বীজ','বংশগত'],['মা XᴺXᶜ','1/4']]){const q=cq.find(q=>q.text.includes(s));assert.ok(q,s);assert.ok(q.parts.map(p=>p.solution).join(' ').includes(a),s);}
 assert.ok(sol('একই পরিবারের চার').includes('সম্ভাবনা'));assert.ok(sol('মেসেলসন').includes('দ্বিতীয়'));
 const r=read(`${root}/source-ledger.json`).entries;assert.ok(r.filter(e=>e.objective.includes(':enrichment')).length>=20);
});
test('chapter 12 clinical content separates globin from clotting and rejects self-treatment and blame',()=>{
 const sq=bank('sq'),sol=s=>sq.find(q=>q.text.includes(s)).explanation;
 assert.match(sol('থ্যালাসেমিয়া আয়রন'),/globin/);assert.match(sol('থ্যালাসেমিয়া আয়রন'),/নিজের সিদ্ধান্তে iron নয়/);
 assert.match(sol('হিমোফিলিয়া ও থ্যালাসেমিয়া'),/VIII\/IX/);assert.match(sol('Alpha-thalassemia'),/চার/);
 assert.match(sol('মাকে কন্যাসন্তানের'),/ইচ্ছায়/);assert.match(sol('বর্ণদৃষ্টি সমস্যায় নারী'),/আক্রান্ত/);
 assert.match(sol('রক্তসঞ্চালন ও chelation'),/চিকিৎসকনির্ভর/);assert.match(sol('বর্ণদৃষ্টি-বান্ধব'),/প্রতীক/);
 const es=read(`${root}/source-ledger.json`).entries;
 for(const e of es.filter(e=>e.objective.includes(':thal')))assert.ok(e.backgroundSources.includes('https://www.nhlbi.nih.gov/health/thalassemia/causes'));
 for(const e of es.filter(e=>e.objective.includes(':color')))assert.ok(e.backgroundSources.some(x=>x.includes('nei.nih.gov')));
});
test('chapter 12 evolution and DNA testing retain uncertainty, privacy and no forced decisions',()=>{
 const sq=bank('sq'),sol=s=>sq.find(q=>q.text.includes(s)).explanation;
 assert.match(sol('জিনগত তথ্য শুধু'),/সম্মতি/);assert.match(sol('Genetic test-এর positive'),/ঝুঁকি/);
 assert.match(sol('DNA প্রোফাইলিং ও পূর্ণ'),/নির্বাচিত/);assert.match(sol('কোন অবস্থায় genetic counselling'),/জোর/);
 assert.match(sol('Fitness কেন'),/নৈতিক মর্যাদা/);assert.match(sol('প্রথম জীব নিশ্চিত'),/অনিশ্চয়তা/);
 assert.match(sol('জীবনের উৎপত্তির রাসায়নিক'),/সম্পূর্ণ জীব/);assert.match(sol('মানুষ ও শিম্পাঞ্জির'),/সিঁড়ি নয়/);
 assert.match(sol('Gene flow ও genetic drift'),/দৈব/);assert.match(sol('অ্যালিল count নয়'),/0.4/);
 for(const e of read(`${root}/source-ledger.json`).entries.filter(e=>e.objective.startsWith('12.1.2')))assert.ok(e.backgroundSources.includes('https://www.genome.gov/about-genomics/policy-issues/Privacy'));
});
test('chapter 12 four diagrams regenerate byte-identically with explicit model limitations',()=>{
 const before=evidence().diagrams.hashes;assert.equal(Object.keys(before).length,4);execFileSync('python3',['scripts/question-bank/biology/draw-chapter-12-figures.py']);
 for(const [p,h] of Object.entries(before))assert.equal(sha(fs.readFileSync(p)),h);
 const svg=s=>fs.readFileSync(`${root}/assets/${s}.svg`,'utf8');
 assert.match(svg('dna-pairing'),/not a helix to scale/);assert.match(svg('mendel-grid'),/not four compulsory births/);
 assert.match(svg('replication-strands'),/all nonoriginal strands/);assert.match(svg('ancestry-tree'),/NOT time-scaled/);
 assert.equal(bank('cq').filter(q=>q.text.includes('![')).length,4);
});
