const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  ts = require("typescript"),
  Module = require("node:module");
const root = path.resolve(__dirname, ".."),
  resolve = Module._resolveFilename;
Module._resolveFilename = function (id, parent, ...rest) {
  return resolve.call(
    this,
    id.startsWith("@/") ? path.join(root, id.slice(2)) : id,
    parent,
    ...rest,
  );
};
require.extensions[".ts"] = (m, file) =>
  m._compile(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText,
    file,
  );
const a = require("../lib/auto-model.ts"),
  p = require("../lib/auto-model-paper.ts"),
  b = require("../lib/paper-builder.ts"),
  catalog = require("../lib/nctb-data.ts");
const chapters = catalog.NCTB_CLASSES.find(
  (c) => c.class === "Class 9",
).subjects.find((s) => s.name === "গণিত").chapters;
const row = (id, chapter = 1, kind = "CQ") => ({
  id,
  text: `Question ${id}`,
  topic: chapters[chapter - 1],
  correct: kind === "MCQ" ? "A" : "",
  explanation: "Verified answer fixture",
  options:
    kind === "MCQ"
      ? { A: "one", B: "two", C: "three", D: "four" }
      : kind === "CQ"
        ? {
            stimulus: `Stimulus ${id}`,
            subQuestions: { k: "First", kh: "Second", g: "Third" },
            marks: { k: 2, kh: 4, g: 4 },
          }
        : {},
});
const written = () => [
  ...[1, 6, 9, 17].flatMap((ch, i) => [row(`cq${i}a`, ch), row(`cq${i}b`, ch)]),
  ...Array.from({ length: 15 }, (_, i) => row(`sq${i}`, (i % 17) + 1, "SHORT")),
];
const paper = (q) => ({
  ...q,
  subject: "গণিত",
  category: "SSC",
  type: a.autoModelRowKind(q),
  stimulus: q.options.stimulus,
  subQuestions: q.options.subQuestions
    ? { ...q.options.subQuestions, gh: "" }
    : undefined,
  options: q.correct ? q.options : undefined,
});
test("blueprints scoped to SSC general math, practice-only, not English/higher math/other grades", () => {
  for (const cat of ["SSC", "Class 9", "Class 10", "Class 9-10", "9", "10"])
    assert.equal(a.autoModelBlueprint(cat, "গণিত", "CQ").totalMarks, 70);
  for (const [cat, sub] of [
    ["Class 8", "গণিত"],
    ["HSC", "গণিত"],
    ["SSC", "উচ্চতর গণিত"],
    ["SSC", "বিজ্ঞান"],
    ["SSC", "English 1st Paper"],
    ["Job", "গণিত"],
  ])
    assert.equal(a.autoModelBlueprint(cat, sub, "CQ"), null);
  assert.equal(a.autoModelBlueprint("SSC", "গণিত", "SHORT"), null);
  assert.match(a.AUTO_MODEL_NOTICE, /সরকারি/);
  for (const cat of ["6", "SSC", "HSC", "Class 9-10", "Class 11-12"])
    assert.equal(a.isAcademicCategory(cat), true);
});
test("all 17 exact catalog topics map once, unknown chapter text is never guessed", () => {
  assert.equal(chapters.length, 17);
  for (const ch of chapters) assert.ok(a.mathDivision(ch));
  assert.equal(a.mathDivision("chapter 17"), undefined);
  assert.equal(a.mathDivision("পরিসংখ্যান"), undefined);
});
test("complete written assembly: 2 CQ per division and 15 SHORT, no partial success", () => {
  const result = a.assembleAutoModel(written(), "CQ", () => 0.5);
  assert.equal(result.ok, true);
  assert.equal(result.ids.length, 23);
  assert.equal(new Set(result.ids).size, 23);
  const fail = a.assembleAutoModel(
    written().filter((q) => q.id !== "cq3b"),
    "CQ",
  );
  assert.equal(fail.ok, false);
  assert.deepEqual(fail.gaps, [
    { section: a.MATH_DIVISIONS[3].title, required: 2, available: 1 },
  ]);
  assert.equal(fail.ids, undefined);
});
test("MCQ balanced topic rotation, exact count, no duplicate stems or IDs", () => {
  const rows = Array.from({ length: 40 }, (_, i) =>
    row(`m${i}`, i < 16 ? 1 : i < 31 ? 6 : [9,10,16,17,17][(i-31)%5], "MCQ"),
  );
  rows.push({
    ...rows[0],
    id: "duplicate",
    text: "  " + rows[0].text.toUpperCase() + "  ",
  });
  const r = a.assembleAutoModel(rows, "MCQ", () => 0.99);
  assert.equal(r.ok, true);
  assert.equal(r.ids.length, 30);
  assert.ok(r.ids.some(id => rows.find(q => q.id === id).topic === chapters[16]));
  assert.ok(!r.ids.includes("duplicate"));
  assert.equal(a.assembleAutoModel(rows.slice(0, 29), "MCQ").ok, false);
});
test("four-part generic CQ, bad marks/options, missing answers, unknown dependencies excluded", () => {
  assert.equal(a.autoModelRowKind(row("good")), "CQ");
  const q = row("bad");
  q.options.subQuestions.gh = "fourth";
  assert.equal(a.autoModelRowKind(q), null);
  q.options.subQuestions.gh = "";
  q.options.marks.g = 3;
  assert.equal(a.autoModelRowKind(q), null);
  for (const patch of [
    { explanation: "" },
    { topic: "unknown" },
    { options: { image: "https://example.com/a.png" } },
    { text: "নিচের চিত্র অনুসারে উত্তর দাও।", options: {} },
    { options: { groupId: "shared" } },
  ])
    assert.equal(
      a.autoModelRowKind({ ...row("dependency", 1, "SHORT"), ...patch }),
      null,
    );
  const mcq = row("mcq", 1, "MCQ");
  mcq.options.B = "one";
  assert.equal(a.autoModelRowKind(mcq), null);
});
test("inline diagram stays in same selected record; repeated CQ stimuli do not duplicate", () => {
  const q = row("diagram", 6);
  q.options.stimulus += " ![চিত্র](https://example.com/diagram.svg)";
  assert.equal(a.autoModelRowKind(q), "CQ");
  const unsafe=row("unsafe");unsafe.options.stimulus+=" ![x](javascript:alert)";
  assert.equal(a.autoModelRowKind(unsafe),null);
  const all = written();
  all.find((q) => q.id === "cq3b").options.stimulus = all.find(
    (q) => q.id === "cq3a",
  ).options.stimulus;
  assert.equal(a.assembleAutoModel(all, "CQ").ok, false);
});
test("new model settings survive validation and normal saved paper restoration", () => {
  const settings = p.autoModelSettings("SSC", "গণিত", "CQ"),
    restored = b.restoreSettings(JSON.parse(JSON.stringify(settings)));
  assert.equal(restored.autoModel, "ssc-math-written-v1");
  assert.equal(restored.info.marks, "70");
  assert.equal(restored.info.minutes, "২ ঘণ্টা ৩০ মিনিট");
  assert.equal(restored.cfg.cqAnswer, 5);
  assert.equal(restored.cfg.shortAnswer, 10);
  assert.equal(restored.defaultHeader.enabled, true);
  const fresh = require("../lib/paper-sections.ts").freshPaperSettings(
    restored,
  );
  assert.equal(fresh.autoModel, undefined);
  assert.equal(b.defaults().autoModel, undefined);
});
test("written preview has 4 divisions + SHORT, CQ numbering 1–8, one global choice instruction", () => {
  const items = written().map(paper),
    settings = p.autoModelSettings("SSC", "গণিত", "CQ"),
    sections = p.autoModelSections(items, settings);
  assert.equal(sections.length, 5);
  assert.deepEqual(
    sections.map((s) => s.questions.length),
    [2, 2, 2, 2, 15],
  );
  assert.deepEqual(
    sections.map((s) => s.startNumber),
    [0, 2, 4, 6, 0],
  );
  assert.match(sections[0].instruction, /মোট ৫টি/);
  assert.equal(sections[1].instruction, "");
  assert.match(sections[4].instruction, /প্রতিটি প্রশ্নের মান ২/);
  assert.deepEqual(p.autoModelIssues(items, settings), []);
  const changed = items.slice(1);
  assert.ok(p.autoModelIssues(changed, settings).length);
  assert.match(
    p.autoModelSections(changed, settings)[0].instruction,
    /অসম্পূর্ণ/,
  );
  assert.equal(p.autoModelSections(items, b.defaults()), null);
  const extra = {...paper(row("extra-mcq",1,"MCQ")),topic:"unknown",subject:"বিজ্ঞান"};
  const appended = p.autoModelSections([...items,extra],settings);
  assert.equal(appended.flatMap(s=>s.questions).length,24);
  assert.match(appended.at(-1).title,/মডেল কাঠামোর বাইরে/);
  assert.equal(p.autoModelSections([...items,extra],p.autoModelSettings("SSC","গণিত","MCQ")).flatMap(s=>s.questions).length,24);
  assert.ok(p.autoModelIssues([...items,items[0]],settings).some(s=>s.includes("পুনরাবৃত্তি")));
});
function action(user, rows, fail = false) {
  let query;
  const file = path.resolve("app/actions/auto-model.ts"),
    m = new Module(file, module);
  m.paths = module.paths;
  m.require = (id) =>
    id === "@/auth"
      ? { auth: async () => ({ user }) }
      : id === "@/lib/db"
        ? {
            db: {
              question: {
                findMany: async (args) => {
                  query = args;
                  if (fail) throw Error("offline");
                  return rows;
                },
              },
            },
          }
        : require(id);
  m._compile(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText,
    file,
  );
  return { run: m.exports.prepareAutoModel, query: () => query };
}
const choice = { category: "SSC", subject: "গণিত", variant: "CQ" };
test("server action requires teacher auth and valid blueprint before any DB access", async () => {
  for (const user of [null, { id: "s", role: "STUDENT" }]) {
    const x = action(user, []);
    assert.equal((await x.run(choice)).ok, false);
    assert.equal(x.query(), undefined);
  }
  for (const patch of [
    { variant: "ALL" },
    { category: "Class 8" },
    { subject: "English" },
    { category: [] },
  ]) {
    const x = action({ id: "t", role: "TEACHER" }, []);
    assert.equal((await x.run({ ...choice, ...patch })).ok, false);
    assert.equal(x.query(), undefined);
  }
});
test("server action selects approved or own pending alias-matched stock and returns IDs, never paid text/answers", async () => {
  const x = action({ id: "t", role: "TEACHER" }, written()),
    r = await x.run(choice);
  assert.equal(r.ok, true);
  assert.equal(r.ids.length, 23);
  assert.deepEqual(Object.keys(r).sort(), ["ids", "ok"]);
  assert.equal(x.query().where.OR[0].approved, true);
  assert.equal(x.query().where.OR[1].approved, false);
  assert.match(x.query().where.OR[1].source,/^AI_PENDING:/);
  assert.equal(x.query().where.subject, "গণিত");
  assert.ok(x.query().where.category.in.includes("Class 10"));
  assert.equal(x.query().take, 10001);
  const missing = await action({ id: "t", role: "TEACHER" }, []).run(choice);
  assert.equal(missing.ok, false);
  assert.equal(missing.gaps.length, 5);
  assert.equal(
    (await action({ id: "t", role: "TEACHER" }, [], true).run(choice)).ok,
    false,
  );
});
test("oversized pool fails explicitly rather than reporting truncated bank shortages", async () => {
  const x = action(
    { id: "t", role: "TEACHER" },
    Array(10001).fill(row("large")),
  );
  const r = await x.run(choice);
  assert.equal(r.ok, false);
  assert.match(r.error, /বড়/);
  assert.equal(r.gaps, undefined);
});

const mcqPool = (algebra, geometry, trig, stats) => [
 ...Array.from({length:algebra},(_,i)=>row(`a${i}`,i%2?1:2,'MCQ')),
 ...Array.from({length:geometry},(_,i)=>row(`g${i}`,i%2?6:8,'MCQ')),
 ...Array.from({length:trig},(_,i)=>row(`t${i}`,i%3===1?16:i%3===2?10:9,'MCQ')),
 ...Array.from({length:stats},(_,i)=>row(`s${i}`,17,'MCQ')),
];
const divisionCounts = (rows,ids) => a.MATH_DIVISIONS.map(d=>rows.filter(q=>ids.includes(q.id)&&a.mathDivision(q.topic).id===d.id).length);
test('MCQ enforces every feasible split and fixed 2/1/2, even under skewed stock',()=>{
 for(const algebra of [12,13,14,15]){
  const geometry=25-algebra, rows=mcqPool(algebra,geometry,3,2);
  const r=a.assembleAutoModel(rows,'MCQ',()=>0.5);assert.equal(r.ok,true);
  assert.deepEqual(divisionCounts(rows,r.ids),[algebra,geometry,3,2]);
  assert.deepEqual(p.autoModelIssues(r.ids.map(id=>paper(rows.find(q=>q.id===id))),p.autoModelSettings('SSC','গণিত','MCQ')),[]);
 }
 for(const rand of [0,0.25,0.5,0.99,1]){
  const rows=mcqPool(100,50,30,20),r=a.assembleAutoModel(rows,'MCQ',()=>rand);assert.equal(r.ok,true);
  const [al,ge,tr,st]=divisionCounts(rows,r.ids);assert.ok(al>=12&&al<=15);assert.ok(ge>=10&&ge<=13);assert.equal(al+ge,25);assert.equal(tr+st,5);assert.equal(r.ids.length,30);assert.deepEqual(a.MATH_MCQ_FIXED_GROUPS.map(g=>rows.filter(q=>r.ids.includes(q.id)&&a.mathMcqGroup(q.topic)===g.id).length),[2,1,2]);
 }
 // The owner now requires all three components; abundant stock cannot substitute.
 for(const [tr,st] of [[5,0],[0,5]])assert.equal(a.assembleAutoModel(mcqPool(15,10,tr,st),'MCQ').ok,false);
});
test('MCQ shortages fail closed despite abundant total stock, after eligibility and deduplication',()=>{
 for(const rows of [mcqPool(11,40,10,10),mcqPool(40,9,10,10),mcqPool(12,12,10,10),mcqPool(40,40,2,2)]){
  const r=a.assembleAutoModel(rows,'MCQ');assert.equal(r.ok,false);assert.ok(r.gaps.length);assert.equal(r.ids,undefined);
 }
 const rows=mcqPool(12,13,3,2);rows[0].text=rows[1].text;
 const r=a.assembleAutoModel(rows,'MCQ');assert.equal(r.ok,false);assert.equal(r.gaps[0].available,11);
 const bad=mcqPool(12,13,3,2);bad[0].explanation='';assert.equal(a.assembleAutoModel(bad,'MCQ').ok,false);
});
test('editor flags 30 valid MCQ with wrong division counts but accepts all allowed distributions',()=>{
 const s=p.autoModelSettings('SSC','গণিত','MCQ');assert.equal(s.info.minutes,'৩০ মিনিট');assert.equal(s.info.marks,'30');assert.equal(s.cfg.mcqAnswer,30);
 for(const rows of [mcqPool(16,9,3,2),mcqPool(12,14,2,2),mcqPool(11,13,3,3)])assert.ok(p.autoModelIssues(rows.map(paper),s).some(i=>i.includes('মানবণ্টন')));
 for(const al of [12,13,14,15])assert.deepEqual(p.autoModelIssues(mcqPool(al,25-al,3,2).map(paper),s),[]);
 assert.match(a.autoModelBlueprint('SSC','গণিত','MCQ').offered,/১২–১৫/);
});
test('server action returns only IDs for compliant MCQ; stream shortage returns no partial model',async()=>{
 const rows=mcqPool(18,15,5,5),selection={...choice,variant:'MCQ'};
 const r=await action({id:'t',role:'TEACHER'},rows).run(selection);
 assert.equal(r.ok,true);assert.deepEqual(Object.keys(r).sort(),['ids','ok']);
 const [al,ge,tr,st]=divisionCounts(rows,r.ids);assert.ok(al>=12&&al<=15);assert.ok(ge>=10&&ge<=13);assert.equal(tr+st,5);
 const fail=await action({id:'t',role:'TEACHER'},mcqPool(80,9,10,10)).run(selection);
 assert.equal(fail.ok,false);assert.equal(fail.ids,undefined);assert.ok(fail.gaps.some(g=>g.required===10&&g.available===9));
});
const diagram = q => ({...q,text:q.text+' ![চিত্র](https://proshnobook.com/question-bank/fixture.svg)'});
const illustratedCount = (rows,ids) => rows.filter(q=>ids.includes(q.id)&&a.autoModelHasDiagram(q)).length;
test('MCQ caps figure-bearing QUESTIONS at five while preserving every division quota',()=>{
 const rows=mcqPool(30,30,15,15).map((q,i)=>i%3===0||q.id==='t1'?q:diagram(q));
 for(const rand of [0,0.2,0.5,0.9,1]){
  const r=a.assembleAutoModel(rows,'MCQ',()=>rand);assert.equal(r.ok,true);
  assert.ok(illustratedCount(rows,r.ids)<=5);
  const [al,ge,tr,st]=divisionCounts(rows,r.ids);assert.ok(al>=12&&al<=15);assert.ok(ge>=10&&ge<=13);assert.equal(tr+st,5);assert.equal(r.ids.length,30);assert.deepEqual(a.MATH_MCQ_FIXED_GROUPS.map(g=>rows.filter(q=>r.ids.includes(q.id)&&a.mathMcqGroup(q.topic)===g.id).length),[2,1,2]);
 }
 const noFigures=mcqPool(12,13,3,2);assert.equal(a.assembleAutoModel(noFigures,'MCQ').ok,true);
});
test('diagram sampling reserves slots for later divisions rather than greedily exhausting five',()=>{
 const rows=mcqPool(20,10,3,2).map(q=>q.id.startsWith('a')||q.id.startsWith('t')||q.id.startsWith('s')?diagram(q):q);
 // Algebra needs no figures: add 15 different plain algebra rows; combined requires all five.
 rows.push(...Array.from({length:15},(_,i)=>row('plain'+i,3,'MCQ')));
 const r=a.assembleAutoModel(rows,'MCQ',()=>0.99);assert.equal(r.ok,true);assert.equal(illustratedCount(rows,r.ids),5);
 assert.ok(r.ids.filter(id=>id.startsWith('a')).length===0);
 const scarce=mcqPool(15,10,3,2).map(q=>q.id==='g0'||q.id.startsWith('t')||q.id.startsWith('s')?diagram(q):q);
 const fail=a.assembleAutoModel(scarce,'MCQ');assert.equal(fail.ok,false);assert.equal(fail.ids,undefined);assert.match(fail.gaps[0].section,/চিত্র/);
});
test('only splits compatible with the global image budget are sampled',()=>{
 // Geometry offers 10 plain +3 figures; combined requires 5 figures.
 // Only 15 algebra /10 geometry is feasible, despite all four count splits fitting.
 const rows=mcqPool(15,13,3,2).map(q=>(q.id.startsWith('g')&&Number(q.id.slice(1))>=10)||q.id.startsWith('t')||q.id.startsWith('s')?diagram(q):q);
 const r=a.assembleAutoModel(rows,'MCQ',()=>0);assert.equal(r.ok,true);assert.deepEqual(divisionCounts(rows,r.ids),[15,10,3,2]);assert.equal(illustratedCount(rows,r.ids),5);
});
test('editor warns on six diagram questions; five questions with multiple figures are valid',()=>{
 const rows=mcqPool(15,10,3,2),s=p.autoModelSettings('SSC','গণিত','MCQ');
 const five=rows.map((q,i)=>i<5?diagram(diagram(q)):q);
 assert.deepEqual(p.autoModelIssues(five.map(paper),s),[]);
 assert.ok(p.autoModelIssues(five.map((q,i)=>paper(i===5?diagram(q):q)),s).some(i=>i.includes('চিত্রযুক্ত')));
 assert.equal(a.autoModelHasDiagram({...rows[0],explanation:'![answer](https://example.com/a.svg)'}),false);
 assert.equal(a.autoModelHasDiagram({...rows[0],stimulus:'![figure](https://example.com/a.svg)'}),true);
 assert.equal(a.autoModelHasDiagram({...rows[0],options:{stimulus:'![figure](https://example.com/a.svg)'}}),true);
 assert.equal(a.assembleAutoModel(written().map(q=>q.options.stimulus?{...q,options:{...q.options,stimulus:diagram(q).text}}:diagram(q)),'CQ').ok,true);
});

test('MCQ chapter classification splits only 9/10 from 16, retaining all written divisions',()=>{
 for(let ch=1;ch<=17;ch++){
  const expected=ch===16?'mensuration':a.mathDivision(chapters[ch-1]).id;
  assert.equal(a.mathMcqGroup(chapters[ch-1]),expected);
 }
 assert.equal(a.mathMcqGroup('chapter 16'),undefined);
 assert.equal(a.mathMcqGroup('পরিমিতি'),undefined);
 for(const ch of [9,10,16])assert.equal(a.mathDivision(chapters[ch-1]).id,'trigonometry');
 const summary=a.autoModelBlueprint('SSC','গণিত','MCQ').offered;
 for(const text of ['ত্রিকোণমিতি ২টি','পরিমিতি ১টি','পরিসংখ্যান ২টি'])assert.ok(summary.includes(text));
});
test('missing any fixed component fails closed with specific shortage even with excess elsewhere',()=>{
 const groups=[['trigonometry',9,2],['mensuration',16,1],['statistics',17,2]];
 for(const [group,ch,required] of groups){
  const rows=mcqPool(50,40,30,20).filter(q=>a.mathMcqGroup(q.topic)!==group);
  rows.push(...Array.from({length:required-1},(_,i)=>row(`scarce-${group}-${i}`,ch,'MCQ')));
  const r=a.assembleAutoModel(rows,'MCQ');assert.equal(r.ok,false);assert.equal(r.ids,undefined);
  assert.ok(r.gaps.some(g=>g.section===a.MATH_MCQ_FIXED_GROUPS.find(g=>g.id===group).title&&g.required===required&&g.available===required-1));
 }
});
test('editor rejects legacy combined-only five and wrong 2/1/2 counts without rewriting questions',()=>{
 const settings=p.autoModelSettings('SSC','গণিত','MCQ');
 for(const extra of [[9,9,9,16,17],[9,16,16,17,17],[17,17,17,17,17],[9,10,9,10,16]]){
  const rows=[...mcqPool(14,11,0,0),...extra.map((ch,i)=>row(`last-${i}`,ch,'MCQ'))];
  assert.equal(rows.length,30);const before=JSON.stringify(rows);
  assert.ok(p.autoModelIssues(rows.map(paper),settings).some(s=>s.includes('মানবণ্টন')));assert.equal(JSON.stringify(rows),before);
 }
});
test('diagram reservation respects each mandatory subpool instead of counting interchangeable final five',()=>{
 // Plenty of plain statistics cannot replace the sole mandatory illustrated mensuration item.
 const rows=mcqPool(15,10,3,20).map(q=>q.id==='t1'||(q.id.startsWith('g')&&Number(q.id.slice(1))<4)?diagram(q):q);
 for(const random of [()=>0,()=>0.5,()=>0.99]){
  const r=a.assembleAutoModel(rows,'MCQ',random);assert.equal(r.ok,true);assert.equal(illustratedCount(rows,r.ids),5);
  assert.deepEqual(a.MATH_MCQ_FIXED_GROUPS.map(g=>rows.filter(q=>r.ids.includes(q.id)&&a.mathMcqGroup(q.topic)===g.id).length),[2,1,2]);
 }
 const fail=a.assembleAutoModel(rows.map(q=>q.id==='g4'?diagram(q):q),'MCQ');assert.equal(fail.ok,false);assert.equal(fail.ids,undefined);
});
