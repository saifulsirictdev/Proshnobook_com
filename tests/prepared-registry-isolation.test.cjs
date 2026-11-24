const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),Module=require('node:module'),ts=require('typescript');
function fixture(){
 const file='lib/prepared-question-batches.ts',source=fs.readFileSync(file,'utf8'),mocks={};let builds=0,fail=false;
 for(const [,names,id] of source.matchAll(/import \{([^}]+)\} from "([^\"]+-batches)";/g))mocks[id]=Object.fromEntries(names.split(',').map(n=>[n.trim(),()=>[]]));
 const q={kind:'MCQ',text:'stable question',options:{A:'one',B:'two',C:'three',D:'four'},correct:'A',explanation:'stable answer',difficulty:'MEDIUM'};
 mocks['./ssc-biology-batches']={sscBiologyBatches:()=>{builds++;if(fail)throw Error('fixture validation failed');return[{id:'fixture',category:'Class 6',subject:'Math',topic:'chapter',title:'test',lang:'Bangla',limitations:'not certified',records:[structuredClone(q)],provenance:{review:{certified:false}}}];}};
 mocks['./nctb-data']={NCTB_CLASSES:[{class:'Class 6',subjects:[{name:'Math',chapters:['chapter']}]}]};
 mocks['./mcq-import']={normalizeStem:s=>s.trim(),parseMCQBatch:()=>({subject:'Math',topic:'chapter',lang:'Bangla',items:[{...q,page:'original'}]})};
 mocks['./written-question-import']={writtenRecords:()=>({batch:{class:'Class 6',subject:'Math',topic:'chapter'},records:[{...q,kind:'SQ'}]})};
 mocks['./question-json-import']={parseQuestionUpload:()=>({batch:{category:'Class 6',subject:'Math',topic:'chapter',lang:'Bangla',items:[{type:'MCQ',page:'original'}]},records:[structuredClone(q)]})};
 for(const [,id] of source.matchAll(/from "(@[^\"]+\.json)"/g))mocks[id]={category:'Class 6',subject:'Math',topic:'chapter'};
 const m=new Module(file,module);m.paths=module.paths;m.require=id=>Object.hasOwn(mocks,id)?mocks[id]:require(id);m._compile(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
 return{lib:m.exports,builds:()=>builds,fail:v=>{fail=v;}};
}
test('static registry is constructed once across action lookups and summary/index reads',()=>{
 const f=fixture();const first=f.lib.getPreparedBatch('fixture');
 for(let i=0;i<8;i++)assert.equal(f.lib.getPreparedBatch('fixture').digest,first.digest);
 f.lib.preparedSummaries();f.lib.preparedImportIndex();f.lib.preparedBatches();
 assert.equal(f.builds(),1,'do not parse all subject banks on every selected-batch action');
});
test('caller edits cannot corrupt cached records, nested options, provenance or summaries',()=>{
 const {lib}=fixture(),original=lib.getPreparedBatch('fixture'),snapshot=structuredClone(original);
 original.batch.records[0].options.A='corrupt';original.batch.records[0].text='corrupt';original.batch.provenance.review.certified=true;
 const all=lib.preparedBatches();all.find(b=>b.id==='fixture').records.length=0;all.pop();
 const index=lib.preparedImportIndex();index.find(b=>b.id==='fixture').counts.MCQ=999;
 assert.deepEqual(lib.getPreparedBatch('fixture'),snapshot);
 assert.equal(lib.preparedImportIndex().find(b=>b.id==='fixture').counts.MCQ,1);
 assert.throws(()=>lib.getPreparedBatch('unregistered'),/Unknown batch/);
});
test('failed construction is not cached as an empty or partial registry',()=>{
 const f=fixture();f.fail(true);assert.throws(()=>f.lib.preparedBatches(),/fixture validation failed/);
 f.fail(false);assert.equal(f.lib.getPreparedBatch('fixture').batch.records.length,1);assert.equal(f.builds(),2);
});
