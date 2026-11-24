const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript'),React=require('react');
const root=path.resolve(__dirname,'..'),resolve=Module._resolveFilename;
Module._resolveFilename=function(id,parent,...rest){return resolve.call(this,id.startsWith('@/')?path.join(root,id.slice(2)):id,parent,...rest)};
require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const groups=require('../lib/academic-subject-groups.ts'),catalog=require('../lib/nctb-data.ts').NCTB_CLASSES.find(c=>c.class==='Class 9').subjects.map(s=>s.name);
function harness(append=false){
 const state=[],pushes=[];let index=0;
 const m=new Module(path.resolve('components/qb-start.tsx'),module);m.paths=module.paths;
 m.require=id=>id==='react'?{...React,useMemo:f=>f(),useState(initial){const i=index++;if(!(i in state))state[i]=initial;return[state[i],v=>{state[i]=typeof v==='function'?v(state[i]):v}]}}:id==='next/navigation'?{useRouter:()=>({push:url=>pushes.push(url)}),useSearchParams:()=>new URLSearchParams(append?'append=1':'')}:require(id);
 m._compile(ts.transpileModule(fs.readFileSync('components/qb-start.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,'components/qb-start.tsx');
 const Start=m.exports.default;
 let tree;
 function all(node){if(arguments.length===0)node=tree;if(!node||typeof node!=='object')return[];if(Array.isArray(node))return node.flatMap(n=>all(n));return[node,...all(node.props?.children)]}
 function text(node){if(node==null||typeof node==='boolean')return'';if(Array.isArray(node))return node.map(text).join('');return typeof node==='object'?text(node.props?.children):String(node)}
 function render(){index=0;tree=Start({pairs:[{category:'Class 10',subject:'English 2nd Paper'},{category:'SSC',subject:'Unknown DB subject'}]});return tree}
 const byLabel=label=>all().find(n=>n.props?.['aria-label']===label);
 const button=label=>all().find(n=>n.type==='button'&&text(n).startsWith(label));
 const change=(label,value)=>{assert.ok(byLabel(label),label);byLabel(label).props.onChange({target:{value}});render()};
 const click=label=>{assert.ok(button(label),label);button(label).props.onClick();render()};
 const options=label=>all(byLabel(label)).filter(n=>n.type==='option'&&n.props.value).map(n=>n.props.value);
 render();return{render,all,byLabel,button,change,click,options,pushes};
}
test('four exact ordered groups cover the existing SSC catalog without renaming subjects',()=>{
 assert.deepEqual(groups.ACADEMIC_SUBJECT_GROUPS.map(g=>g.label),['সাধারণ','বিজ্ঞান','মানবিক','ব্যবসা শিক্ষা']);
 for(const name of catalog)assert.ok(groups.ACADEMIC_SUBJECT_GROUPS.some(g=>groups.sscGroupSubjects(catalog,g.id).includes(name)),name);
 assert.deepEqual(groups.sscGroupSubjects(catalog,''),[]);assert.deepEqual(groups.sscGroupSubjects(catalog,'bad'),[]);
 assert.deepEqual(groups.sscGroupSubjects(['Unknown DB subject'],'general'),[]);
});
test('streams show only their subjects; common math/English remain under General, not copied to all streams',()=>{
 const general=groups.sscGroupSubjects(catalog,'general');for(const n of ['গণিত','English For Today','তথ্য ও যোগাযোগ প্রযুক্তি'])assert.ok(general.includes(n));
 assert.deepEqual(groups.sscGroupSubjects(catalog,'science'),['পদার্থবিজ্ঞান','রসায়ন','জীববিজ্ঞান','উচ্চতর গণিত']);
 const humanities=groups.sscGroupSubjects(catalog,'humanities'),business=groups.sscGroupSubjects(catalog,'business');
 assert.ok(humanities.includes('বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা'));assert.ok(humanities.includes('পৌরনীতি ও নাগরিকতা'));assert.ok(!humanities.includes('হিসাববিজ্ঞান'));
 for(const n of ['হিসাববিজ্ঞান','ফিন্যান্স ও ব্যাংকিং','ব্যবসায় উদ্যোগ','বিজ্ঞান'])assert.ok(business.includes(n));assert.ok(!business.includes('পদার্থবিজ্ঞান'));
 assert.ok(humanities.includes('বিজ্ঞান'));assert.ok(!general.includes('পদার্থবিজ্ঞান'));
});
test('SSC requires a group before subjects; changing group clears subject, chapter and model choices',()=>{
 const h=harness();assert.equal(h.byLabel('SSC বিভাগ'),undefined);h.click('SSC (নবম-দশম)');
 assert.equal(h.byLabel('বিষয়').props.disabled,true);assert.deepEqual(h.options('বিষয়'),[]);assert.ok(h.all().indexOf(h.byLabel('SSC বিভাগ'))<h.all().indexOf(h.byLabel('বিষয়')));
 h.change('SSC বিভাগ','general');h.change('বিষয়','গণিত');h.click('Chapter');h.change('প্রস্তুতির টপিক',require('../lib/nctb-data.ts').NCTB_CLASSES.find(c=>c.class==='Class 9').subjects.find(s=>s.name==='গণিত').chapters[0]);h.click('Auto Model');h.click('CQ');assert.equal(h.button('মডেল প্রস্তুত').props.disabled,false);
 h.change('SSC বিভাগ','science');assert.equal(h.byLabel('বিষয়').props.value,'');assert.equal(h.button('Auto Model'),undefined);assert.equal(h.byLabel('প্রস্তুতির টপিক'),undefined);assert.equal(h.button('প্রশ্ন তৈরী').props.disabled,true);
 assert.deepEqual(h.options('বিষয়'),['পদার্থবিজ্ঞান','রসায়ন','জীববিজ্ঞান','উচ্চতর গণিত']);
 h.change('SSC বিভাগ','general');h.change('বিষয়','গণিত');assert.equal(h.button('Auto Model').props['aria-pressed'],false);assert.equal(h.byLabel('প্রস্তুতির টপিক'),undefined);
});
test('math Auto Model route/marks contract is unchanged; stale or injected subject cannot navigate',()=>{
 const h=harness();h.click('SSC (নবম-দশম)');h.change('SSC বিভাগ','general');h.change('বিষয়','গণিত');h.click('Auto Model');h.click('CQ');h.click('মডেল প্রস্তুত');assert.equal(h.pushes.length,1);const u=new URL(h.pushes[0],'https://local.invalid');assert.equal(u.pathname,'/question-builder/auto-model');assert.equal(u.searchParams.get('category'),'SSC');assert.equal(u.searchParams.get('subject'),'গণিত');assert.equal(u.searchParams.get('variant'),'CQ');
 h.change('SSC বিভাগ','science');h.change('বিষয়','গণিত');h.click('Auto Model');h.click('CQ');assert.equal(h.button('মডেল প্রস্তুত').props.disabled,true);h.click('মডেল প্রস্তুত');assert.equal(h.pushes.length,1);
});
test('English follows its existing modes; group change and class change clear downstream selection',()=>{
 const h=harness();h.click('SSC (নবম-দশম)');h.change('SSC বিভাগ','general');assert.ok(h.options('বিষয়').includes('English 2nd Paper'));h.change('বিষয়','English Grammar and Composition');assert.ok(h.byLabel('English প্রশ্নপত্রের ধরন'));h.change('English প্রশ্নপত্রের ধরন','full');
 h.change('SSC বিভাগ','business');assert.equal(h.byLabel('English প্রশ্নপত্রের ধরন'),undefined);assert.equal(h.byLabel('বিষয়').props.value,'');h.change('Class 1-8','6');assert.equal(h.byLabel('SSC বিভাগ'),undefined);assert.ok(h.options('বিষয়').includes('গণিত'));
 h.click('SSC (নবম-দশম)');assert.equal(h.byLabel('SSC বিভাগ').props.value,'');assert.deepEqual(h.options('বিষয়'),[]);
});
test('Admission, Job and lower classes have no group selector; append retains its existing workflow',()=>{
 for(const label of ['Admission','Job']){const h=harness();h.click(label);assert.equal(h.byLabel('SSC বিভাগ'),undefined)}
 const h=harness(true);h.click('SSC (নবম-দশম)');h.change('SSC বিভাগ','general');h.change('বিষয়','গণিত');assert.equal(h.button('Auto Model'),undefined);h.click('প্রশ্ন তৈরী');const u=new URL(h.pushes[0],'https://local.invalid');assert.equal(u.searchParams.get('append'),'1');assert.equal(u.searchParams.get('subject'),'গণিত');
});

test('HSC catalog papers are all reachable, with common subjects separate and shared electives mapped explicitly',()=>{
 const names=require('../lib/nctb-data.ts').NCTB_CLASSES.find(c=>c.class==='Class 11-12').subjects.map(s=>s.name);
 for(const name of names)assert.ok(groups.ACADEMIC_SUBJECT_GROUPS.some(g=>groups.hscGroupSubjects(names,g.id).includes(name)),name);
 assert.deepEqual(groups.hscGroupSubjects(names,''),[]);assert.deepEqual(groups.hscGroupSubjects(['Unknown HSC subject'],'business'),[]);
 for(const [group,want,not] of [['general','ইংরেজি ২য় পত্র','পদার্থবিজ্ঞান ১ম পত্র'],['science','উচ্চতর গণিত ২য় পত্র','হিসাববিজ্ঞান ১ম পত্র'],['humanities','সমাজবিজ্ঞান ১ম পত্র','জীববিজ্ঞান ১ম পত্র'],['business','ব্যবসায় সংগঠন ও ব্যবস্থাপনা ২য় পত্র','ইতিহাস ১ম পত্র']]){
  const list=groups.hscGroupSubjects(names,group);assert.ok(list.includes(want));assert.ok(!list.includes(not));
 }
 for(const group of ['science','humanities','business'])assert.ok(groups.hscGroupSubjects(names,group).includes('পরিসংখ্যান ২য় পত্র'));
});
test('HSC group precedes subjects; Auto Model routes to explicit syllabus setup without inheriting mathematics',()=>{
 const h=harness();h.click('HSC (একাদশ-দ্বাদশ)');assert.ok(h.byLabel('HSC বিভাগ'));assert.equal(h.byLabel('বিষয়').props.disabled,true);
 h.change('HSC বিভাগ','science');h.change('বিষয়','পদার্থবিজ্ঞান ১ম পত্র');h.click('Auto Model');h.click('CQ');assert.equal(h.button('মডেল প্রস্তুত').props.disabled,false);h.click('মডেল প্রস্তুত');const setup=new URL(h.pushes.pop(),'https://local.invalid');assert.equal(setup.pathname,'/question-builder/auto-model');assert.equal(setup.searchParams.get('category'),'HSC');assert.equal(setup.searchParams.get('subject'),'পদার্থবিজ্ঞান ১ম পত্র');assert.equal(require('../lib/auto-model.ts').autoModelBlueprint('HSC','পদার্থবিজ্ঞান ১ম পত্র','CQ'),null);
 h.click('Chapter');h.click('প্রশ্ন তৈরী');const url=new URL(h.pushes[0],'https://local.invalid');assert.equal(url.searchParams.get('category'),'HSC');assert.equal(url.searchParams.get('subject'),'পদার্থবিজ্ঞান ১ম পত্র');
 h.change('HSC বিভাগ','humanities');assert.equal(h.byLabel('বিষয়').props.value,'');assert.ok(!h.options('বিষয়').includes('পদার্থবিজ্ঞান ১ম পত্র'));
 h.click('SSC (নবম-দশম)');assert.equal(h.byLabel('SSC বিভাগ').props.value,'');assert.deepEqual(h.options('বিষয়'),[]);h.change('SSC বিভাগ','science');assert.ok(h.options('বিষয়').includes('পদার্থবিজ্ঞান'));assert.ok(!h.options('বিষয়').includes('পদার্থবিজ্ঞান ১ম পত্র'));
});
test('HSC common English retains the existing English modes and stream changes clear them',()=>{
 const h=harness();h.click('HSC (একাদশ-দ্বাদশ)');h.change('HSC বিভাগ','general');h.change('বিষয়','ইংরেজি ২য় পত্র');assert.ok(h.byLabel('English প্রশ্নপত্রের ধরন'));h.change('English প্রশ্নপত্রের ধরন','full');h.change('HSC বিভাগ','business');assert.equal(h.byLabel('English প্রশ্নপত্রের ধরন'),undefined);assert.equal(h.byLabel('বিষয়').props.value,'');assert.ok(h.options('বিষয়').includes('হিসাববিজ্ঞান ১ম পত্র'));
});
