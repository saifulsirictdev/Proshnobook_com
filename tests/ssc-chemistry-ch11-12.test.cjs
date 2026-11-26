// Historical Chemistry preservation scope excludes later Class 7 BGS additions;
// current Class 7 shipping completeness is checked separately.
// Historical non-Biology registry scope; full current totals are checked in prepared-library.test.cjs.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),Module=require('node:module'),{createHash}=require('node:crypto'),{execFileSync}=require('node:child_process');
function load(file,mocks={}){const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return m.exports;}
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),root='content/question-bank/ssc/chemistry/',catalog=load('lib/nctb-data.ts'),mcq=load('lib/mcq-import.ts',{'@/lib/nctb-data':catalog}),upload=load('lib/question-json-import.ts',{'./nctb-data':catalog,'./mcq-import':mcq,'./question-provenance':load('lib/question-provenance.ts')}),tables=load('lib/question-tables.ts', {"./ssc-biology-assets":load("lib/ssc-biology-assets.ts")});
const chapters=[11,12].map(ch=>{const folder=root+`chapter-${ch}/`,v=read(folder+'validation.json'),files=Object.fromEntries(v.artifacts.map(a=>[a.file,read(folder+a.file)])),rows=Object.values(files).flatMap(b=>b.items),qFor=m=>files[m.file].items[m.itemIndex-1],mocks={'./question-json-import':upload};for(const f of [...Object.keys(files),'validation.json'])mocks['@/'+folder+f]=read(folder+f);return{ch,folder,v,files,rows,qFor,batches:load(`lib/ssc-chemistry-ch${ch}-batches.ts`,mocks)[`sscChemistryChapter${ch}Batches`]()};});
function atoms(f){const out={};for(const part of f.replace(/[₀-₉]/g,d=>'₀₁₂₃₄₅₆₇₈₉'.indexOf(d)).split('·')){const m=part.match(/^(\d+)?(.*)$/),mult=Number(m[1]||1),tokens=m[2].match(/[A-Z][a-z]?|\d+|[()]/g),stack=[{}];for(let i=0;i<tokens.length;i++){const t=tokens[i];if(t==='('){stack.push({});continue;}const g=t===')'?stack.pop():{[t]:1};let n=1;if(/^\d+$/.test(tokens[i+1]||''))n=Number(tokens[++i]);for(const[e,k]of Object.entries(g))stack.at(-1)[e]=(stack.at(-1)[e]||0)+k*n;}assert.equal(stack.length,1);for(const[e,k]of Object.entries(stack[0]))out[e]=(out[e]||0)+k*mult;}return out;}
const AW={H:1,C:12,N:14,O:16,Na:23,Mg:24,Al:27,P:31,S:32,Cl:35.5,K:39,Ca:40,Fe:56,Br:80},mass=f=>Object.entries(atoms(f)).reduce((a,[e,k])=>a+AW[e]*k,0),near=(a,b)=>assert.ok(Math.abs(Number(a)-Number(b))<=0.00011,`${a} != ${b}`),terms=s=>s.split('+').map(t=>{const m=t.match(/^(\d+)?(.+)$/);return{n:Number(m[1]||1),f:m[2]};});
function side(s){const out={};for(const{n,f}of terms(s))for(const[e,k]of Object.entries(atoms(f)))out[e]=(out[e]||0)+n*k;return out;}
for(const c of chapters){const{ch,v,rows,files,qFor,batches}=c,answer=m=>{const q=qFor(m);return q.options[q.correct];};
 test(`chapter${ch}: full owner target, bounded strict-import slices, unique normalized stems and CQmarks`,()=>{
  const expected=ch===11?{MCQ:700,CQ:200,SQ:100}:{MCQ:350,CQ:50,SQ:70};assert.deepEqual(v.counts,expected);assert.deepEqual(v.target,expected);assert.equal(rows.length,ch===11?1000:470);assert.equal(v.total,rows.length);assert.equal(batches.length,ch===11?10:6);assert.equal(batches.reduce((a,b)=>a+b.records.length,0),rows.length);assert.equal(new Set(rows.map(q=>mcq.normalizeStem(q.text))).size,rows.length);
  for(const f of Object.values(files)){assert.ok(f.items.length<=100);assert.equal(upload.parseQuestionUpload(JSON.stringify(f),{category:f.category,subject:f.subject,group:'',topic:f.topic}).records.length,f.items.length);}
  for(const q of rows){if(q.type==='MCQ'){assert.equal(new Set(Object.values(q.options)).size,4);assert.ok(q.options[q.correct]);}if(q.type==='CQ'){assert.deepEqual(q.parts.map(p=>p.marks),[1,2,3,4]);assert.ok(q.parts.every(p=>p.solution));}}
 });
 test(`chapter${ch}: nine selected source transcripts retained; origin/answer disclosure, no invented original-board provenance`,()=>{
  const s=read(root+`chapter-${ch}-source-intake.json`);assert.equal(v.sourceCount,9);assert.equal(v.authoredCount,rows.length-9);assert.equal(v.ledger.filter(m=>m.origin==='AUTHORED_COMMON_BOARD_STYLE').length,rows.length-9);
  for(const source of s.items){const m=v.ledger.find(m=>m.sourceId===source.id);assert.ok(m);const q=qFor(m);assert.ok(q.text.includes(source.text));if(source.stimulus)assert.ok(q.text.includes(source.stimulus));if(source.stimulusImage)assert.ok(q.text.includes(source.stimulusImage));if(source.options)assert.deepEqual(Object.values(q.options),source.options);if(source.parts)assert.deepEqual(q.parts.map(p=>p.question),source.parts);if(source.observedBoard)assert.match(source.observedBoard.verification,/not cross-checked/);}
  for(const m of v.ledger){assert.equal(m.teacherApproved,false);assert.equal(m.sourceQuestionVerbatim,false);assert.equal(m.answerOrigin,'ASSISTANT_AUTHORED_NOT_SOURCE_KEY');if(m.origin==='AUTHORED_COMMON_BOARD_STYLE'){assert.equal(m.observedBoard,undefined);assert.match(qFor(m).page,/নিজস্ব/);}}
  for(const b of batches){assert.equal(b.provenance.teacherCertified,false);assert.equal(b.provenance.chemistryExamBlueprintVerified,false);assert.equal(b.provenance.fullChapterRead,false);assert.match(b.limitations,/স্বতন্ত্র ঐতিহাসিক/);for(const q of b.records)assert.deepEqual(Object.keys(q.options._authoring).sort(),['answerOrigin','family','origin','reference','sourceQuestionVerbatim']);}
 });
 test(`chapter${ch}: every reaction atom-balanced, coefficients/products agree; stoichiometric answers independently recomputed`,()=>{
  const unique=new Set();let checked=0;
  for(const m of v.ledger){const x=m.inputs;if(!x)continue;const a=m.kind==='MCQ'?answer(m):null;
   if(x.equation){const[l,r]=x.equation.split('→');assert.deepEqual(side(l),side(r),x.equation);unique.add(x.equation);
    if(m.family==='reaction-product'){assert.equal(a,x.product);assert.ok(terms(r).some(t=>t.f===a));checked++;}
    if(m.family==='reaction-coefficient'){const found=[...terms(l),...terms(r)].filter(t=>t.f===x.blank);assert.equal(found.length,1);assert.equal(Number(a),found[0].n);checked++;}
    if(m.family==='reaction-class'){assert.equal(a,x.kind);checked++;}
    if(m.family.startsWith('mass-')){const lf=terms(l),rf=terms(r),extent=x.givenMass/(lf[0].n*mass(lf[0].f)),p=rf[0].n*mass(rf[0].f)*extent;near(x.productMass,p);if(m.family==='mass-product'){near(a,p);checked++;}if(m.family==='mass-other'){const t=(x.otherSide==='reactant'?lf:rf).find(t=>t.f===x.otherFormula);near(a,t.n*mass(t.f)*extent);checked++;}if(m.family==='mass-recovery'){near(a,p*.8);checked++;}}
   }
  }
  assert.equal(unique.size,ch===11?30:20);assert.ok(checked>50);
 });
 test(`chapter${ch}: all formula/mass, percentage, composition and inventory MCQ keys independently verified`,()=>{
  let n=0;for(const m of v.ledger){const x=m.inputs;if(!x||m.kind!=='MCQ')continue;const a=answer(m),family=m.family;let expected;
   if(family==='species-structure-name')assert.equal(a,x.name);
   if(family==='species-molecular-formula')assert.equal(a,x.formula);
   if(family==='species-functional-class')assert.equal(a,x.kind);
   if(family==='species-molar-mass')expected=mass(x.formula);
   if(family==='species-carbon-fraction')expected=12*atoms(x.formula).C/mass(x.formula)*100;
   if(family==='species-combustion-carbon')expected=atoms(x.formula).C*22;
   if(family==='species-combustion-water')expected=atoms(x.formula).H*9;
   if(family==='pair-mass-difference')expected=mass(x.b.formula)-mass(x.a.formula);
   if(family==='pair-carbon-comparison'){const fa=atoms(x.a.formula).C/mass(x.a.formula),fb=atoms(x.b.formula).C/mass(x.b.formula);assert.equal(a,fa>fb?'A':fb>fa?'B':'সমান');}
   if(family==='gas-component')expected=x.volume*x.methane/100;
   if(family==='gas-oxygen')expected=x.volume*(x.methane*2+x.ethane*3.5)/100;
   if(family==='gas-carbon')expected=x.volume*(x.methane+2*x.ethane+x.co2)/100;
   if(family==='substance-molar-mass')expected=mass(x.formula);
   if(family==='substance-element-fraction')expected=atoms(x.formula)[x.element]*AW[x.element]/mass(x.formula)*100;
   if(family==='inventory-compound')expected=x.sample*x.purity/100;
   if(family==='inventory-element')expected=x.sample*x.purity/100*atoms(x.formula)[x.element]*AW[x.element]/mass(x.formula);
   if(family==='inventory-inverse')expected=x.targetComponentMass/(x.purity/100*atoms(x.formula)[x.element]*AW[x.element]/mass(x.formula));
   if(expected!==undefined){near(a,expected);n++;}
  }assert.ok(n>70);
 });
 test(`chapter${ch}: canonical file/ledger/asset hashes and offline review are reproducible`,()=>{
  for(const a of v.artifacts){const b=fs.readFileSync(c.folder+a.file);assert.equal(createHash('sha256').update(b).digest('hex'),a.sha256);assert.equal(files[a.file].items.length,a.count);}
  for(const m of v.ledger)assert.equal(createHash('sha256').update(JSON.stringify(qFor(m),null,2)+'\n').digest('hex'),m.questionDigest);
  for(const[f,a]of Object.entries(v.assets)){const b=fs.readFileSync('public/'+f);assert.equal(b.length,a.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),a.sha256);}
  const review=fs.readFileSync(`docs/question-bank/ssc-chemistry/chapter-${ch}-review.html`,'utf8');assert.equal((review.match(/<article>/g)||[]).length,rows.length);for(const m of review.matchAll(/src="([^"]+)"/g)){assert.match(m[1],/^data:image\/png;base64,/);const hash=createHash('sha256').update(Buffer.from(m[1].split(',')[1],'base64')).digest('hex');assert.ok(Object.values(v.assets).some(a=>a.sha256===hash));}
  execFileSync('python',[`scripts/question-bank/build-ssc-chemistry-ch${ch}.py`,'--check']);
 });
}
test('three actual chapter11 stimuli render; altered/traversal/external source URLs stay text',()=>{
 const base='https://proshnobook.com/question-bank/ssc-chemistry-ch11-source-v1/';for(const name of ['tb-bromine-shared.png','tb-starch-stimulus.png','tb-acid-reaction.png']){assert.equal(tables.questionBlocks(`![x](${base+name})`)[0].kind,'chemistry-image');for(const url of [base+name+'?a=1',base+name+'#a',base+'../'+name,base.replace('https:','http:')+name,base.replace('proshnobook.com','evil.test')+name])assert.equal(tables.questionBlocks(`![x](${url})`)[0].kind,'text');}
 for(const name of ['tb-page-290.png','tb-nonexistent.png','tb-acid-reaction.svg'])assert.equal(tables.questionBlocks(`![x](${base+name})`)[0].kind,'text');
});
test('actual registry274batches/27126records:6640prior Chemistry intact,8110total local drafts; explicit owner model policy is separate from draft approval',()=>{
 const resolve=Module._resolveFilename,previous=require.extensions['.ts'];try{Module._resolveFilename=function(id,parent,...rest){return resolve.call(this,id.startsWith('@/')?path.resolve(id.slice(2)):id,parent,...rest);};require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);const all=require('../lib/prepared-question-batches.ts').preparedBatches().filter(b=>!b.id.startsWith('ssc-biology-')&&!b.id.startsWith('class7-bgs-'));assert.equal(all.length,274);assert.equal(all.reduce((a,b)=>a+b.records.length,0),27126);const own=all.filter(b=>/^ssc-chemistry-ch(?:11|12)-/.test(b.id));assert.equal(own.length,16);assert.equal(own.reduce((a,b)=>a+b.records.length,0),1470);assert.equal(all.filter(b=>!own.includes(b)).reduce((a,b)=>a+b.records.length,0),25656);const chem=all.filter(b=>b.id.startsWith('ssc-chemistry-'));assert.equal(chem.reduce((a,b)=>a+b.records.length,0),8110);const counts={MCQ:0,CQ:0,SQ:0};for(const b of chem)for(const q of b.records)counts[q.kind]++;assert.deepEqual(counts,{MCQ:5500,CQ:1550,SQ:1060});}finally{Module._resolveFilename=resolve;if(previous)require.extensions['.ts']=previous;else delete require.extensions['.ts'];}
 const p=load('lib/subject-model-policy.ts',{'./nctb-data':catalog});for(const c of ['SSC','Class 9','Class 10'])assert.equal(p.subjectModelPolicy(c,'রসায়ন')?.id,'ssc-chemistry-owner-chapter-policy-v1');
});
test('pure generators/adapters contain no DB, import-save, deploy or network side effects',()=>{
 for(const ch of [11,12]){assert.doesNotMatch(fs.readFileSync(`lib/ssc-chemistry-ch${ch}-batches.ts`,'utf8'),/from ["'].*(?:db|guard|prisma)/);assert.doesNotMatch(fs.readFileSync(`scripts/question-bank/build-ssc-chemistry-ch${ch}.py`,'utf8'),/(?:requests\.|urllib|prisma|subprocess.*deploy)/i);}
});
