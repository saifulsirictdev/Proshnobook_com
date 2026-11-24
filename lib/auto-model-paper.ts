import { resolveSyllabusSelection, syllabusRowKind } from "./auto-model-syllabus";
import type { SyllabusSelection } from "./auto-model-syllabus-schema";
import { subjectModelPolicy, subjectModelById, subjectModelChapter } from "./subject-model-policy";
import {
  defaults,
  settingsSchema,
  questionType,
  type PaperItem,
  type PaperSettings,
} from "./paper-builder";
import {
  autoModelBlueprint,
  autoModelRowKind,
  MATH_DIVISIONS,
  MATH_MCQ_QUOTAS,
  MATH_MCQ_FIXED_GROUPS,
  mathMcqGroup,
  autoModelHasDiagram,
  MATH_MCQ_DISTRIBUTION,
  mathDivision,
  type AutoModelVariant,
} from "./auto-model";

export function autoModelSettings(
  category: string,
  subject: string,
  variant: AutoModelVariant,
  selection?: SyllabusSelection,
): PaperSettings {
  if(selection) {
    const p=resolveSyllabusSelection(selection);
    if(p.request.category!==category||p.request.subject!==subject||p.request.variant!==variant)throw Error("মডেলের নির্বাচন মিলছে না।");
    const s=p.registered?autoModelSettings(category,subject,variant):defaults();
    const {avoidQuestionIds: _historyOnly,...syllabusRequest}=p.request;
    s.syllabusSelection=syllabusRequest;
    if(p.registered)return s;
    s.autoModel=variant==="MCQ"?"syllabus-mcq-v1":"syllabus-written-v1";
    s.defaultHeader={enabled:true,overrides:{}};
    s.info={...s.info,cls:category,subject,exam:"মডেল টেস্ট — অনুশীলন",minutes:p.minutes,marks:String(p.totalMarks),instr:"শিক্ষক-দেওয়া সিলেবাস/মানবণ্টন; সরকারি যাচাইয়ের দাবি নয়। "+p.sections.map(x=>`${x.kind}: ${x.offered}টি থেকে ${x.answer}টি; প্রতিটি ${x.marksEach} নম্বর।`).join(" "),section:variant==="MCQ"?"নৈর্ব্যক্তিক প্রশ্ন":"লিখিত প্রশ্ন"};
    const n=(kind:string,key:"offered"|"answer")=>p.sections.filter(x=>x.kind===kind).reduce((n,x)=>n+x[key],0);
    s.cfg={...s.cfg,expectedMCQ:n("MCQ","offered"),expectedCQ:n("CQ","offered"),expectedSHORT:n("SHORT","offered"),mcqAnswer:n("MCQ","answer"),cqAnswer:n("CQ","answer"),shortAnswer:n("SHORT","answer")};
    s.show.chapter=false;s.show.marks=true;return s;
  }
  const plan = autoModelBlueprint(category, subject, variant);
  if (!plan) throw Error("এই নির্বাচনের Auto Model কাঠামো প্রস্তুত নয়।");
  const s = defaults();
  s.autoModel = settingsSchema.shape.autoModel.parse(plan.id);
  if (!s.autoModel) throw Error("মডেলের সংরক্ষণ কাঠামো প্রস্তুত নয়।");
  s.defaultHeader = { enabled: true, overrides: {} };
  s.info = {
    ...s.info,
    cls: category,
    subject,
    exam: "মডেল টেস্ট — অনুশীলন",
    minutes: plan.minutes,
    marks: String(plan.totalMarks),
    instr: plan.instructions,
    section:
      variant === "MCQ" ? "নৈর্ব্যক্তিক প্রশ্ন" : "সৃজনশীল ও সংক্ষিপ্ত প্রশ্ন",
  };
  s.show.chapter = false;
  s.show.marks = true;
  const policy = subjectModelPolicy(category, subject);
  const sections = policy?.variants[variant].sections;
  const offered = (kind: string, fallback: number) => sections?.find(s=>s.kind===kind)?.offered ?? (sections ? 0 : fallback);
  const answer = (kind: string, fallback: number) => sections?.find(s=>s.kind===kind)?.answer ?? (sections ? 0 : fallback);
  s.cfg = {
    ...s.cfg,
    expectedMCQ: offered("MCQ", variant === "MCQ" ? 30 : 0),
    expectedCQ: offered("CQ", variant === "CQ" ? 8 : 0),
    expectedSHORT: offered("SHORT", variant === "CQ" ? 15 : 0),
    cols: 3,
    cqColumns: 2,
    optCols: 2,
    fontSize: 14,
    mcqAnswer: answer("MCQ", variant === "MCQ" ? 30 : 0),
    cqAnswer: answer("CQ", variant === "CQ" ? 5 : 0),
    shortAnswer: answer("SHORT", variant === "CQ" ? 10 : 0),
  };
  return s;
}
export function autoModelIssues(
  items: PaperItem[],
  s: PaperSettings,
): string[] {
  if (!s.autoModel) return [];
  const issues: string[] = [];
  const stems = items.map((q) =>
    (q.stimulus || q.text)
      .normalize("NFKC")
      .replace(/[০-৯]/g, c=>String("০১২৩৪৫৬৭৮৯".indexOf(c)))
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase(),
  );
  if (
    new Set(stems).size !== stems.length ||
    new Set(items.map((q) => q.id)).size !== items.length
  )
    issues.push("সম্পাদিত মডেলে একই প্রশ্ন পুনরাবৃত্তি হয়েছে।");
  if(s.syllabusSelection) {
    try {
      const p=resolveSyllabusSelection(s.syllabusSelection);
      if(s.autoModel!==(p.registered?.id??(p.request.variant==="MCQ"?"syllabus-mcq-v1":"syllabus-written-v1")))issues.push("সিলেবাস ও সংরক্ষিত মডেলের পরিচয় মিলছে না।");
      if(items.some(q=>q.subject!==p.request.subject || (q.category && !autoModelTopicsForCategory(q.category,p.request.category)) || !p.topics.includes(q.topic??"")))issues.push("নির্বাচিত শ্রেণি–বিষয়/টপিকের বাইরের প্রশ্ন আছে।");
      if(p.registered)return [...issues,...autoModelIssues(items,{...s,syllabusSelection:undefined})];
      const kinds=items.map(q=>syllabusRowKind({id:q.id,text:q.text,topic:q.topic??"",explanation:q.explanation??"",correct:q.correct??"",options:questionType(q)==="CQ"?{stimulus:q.stimulus||q.text,subQuestions:q.subQuestions}:q.options??{}},p));
      if(kinds.some((k,i)=>!k||k!==questionType(items[i])||!p.sections.some(x=>x.kind===k)))issues.push("প্রশ্নের ধরন, উত্তর বা উপপ্রশ্ন অসম্পূর্ণ।");
      if(items.length!==p.sections.reduce((n,x)=>n+x.offered,0))issues.push("পূর্ণ মডেলের প্রশ্নসংখ্যা মিলছে না।");
      for(const [index,x] of p.sections.entries()){
        const offered=x.kind==="MCQ"?s.cfg.expectedMCQ:x.kind==="CQ"?s.cfg.expectedCQ:s.cfg.expectedSHORT;
        const answer=x.kind==="MCQ"?s.cfg.mcqAnswer:x.kind==="CQ"?s.cfg.cqAnswer:s.cfg.shortAnswer;
        const qs=items.filter(q=>questionType(q)===x.kind&&autoModelSectionIndex(s,x.kind,q.id)===index);
        if(qs.length!==x.offered||qs.some(q=>"topics" in x&&x.topics&&!x.topics.includes(q.topic??""))||offered!==p.sections.filter(y=>y.kind===x.kind).reduce((n,y)=>n+y.offered,0)||answer!==p.sections.filter(y=>y.kind===x.kind).reduce((n,y)=>n+y.answer,0))issues.push(`${x.kind}: সিলেবাসের বিভাগ/প্রশ্নসংখ্যা/উত্তরদানের সংখ্যা মিলছে না।`);
      }
      if(s.info.marks!==String(p.totalMarks))issues.push("সিলেবাসের পূর্ণমান বদলেছে।");
      return issues;
    }catch{return [...issues,"সিলেবাসের মানবণ্টন সঠিক নয়।"];}
  }
  const registered = subjectModelById(s.autoModel);
  if (registered) {
    const {policy, sections} = registered;
    if (items.some(q => q.subject !== policy.subject || !subjectModelChapter(policy,q.topic ?? "") || (q.category && !subjectModelPolicy(q.category,q.subject)))) issues.push("মডেলের বাইরে বিষয়/অধ্যায়ের প্রশ্ন আছে।");
    const kinds = new Map(items.map(q => [q.id, autoModelRowKind({id:q.id,text:q.text,topic:q.topic ?? "",explanation:q.explanation ?? "",correct:q.correct ?? "",options:questionType(q)==="CQ" ? {stimulus:q.stimulus || q.text,subQuestions:q.subQuestions} : q.options ?? {}},policy)]));
    if (items.some(q=>!kinds.get(q.id)||questionType(q)!==kinds.get(q.id)||!sections.some(section=>section.kind===kinds.get(q.id)))) issues.push("মডেলের প্রশ্নের ধরন, উত্তর, উপপ্রশ্ন বা চিত্র অসম্পূর্ণ।");
    if(items.length !== sections.reduce((n,section)=>n+section.offered,0)) issues.push("মডেলের মোট প্রশ্নসংখ্যা মিলছে না।");
    for(const section of sections) {
      const qs=items.filter(q=>kinds.get(q.id)===section.kind);
      const counts=policy.chapters.map(topic=>qs.filter(q=>q.topic===topic).length);
      if(qs.length!==section.offered || section.requiredChapters.some(ch=>counts[ch-1]<1) || counts.some(n=>n>section.maxPerChapter)) issues.push(`${section.kind}: অধ্যায়-কোটা মিলছে না — অধ্যায় ${section.requiredChapters.join(", ")} থেকে অন্তত ১টি করে, প্রতি অধ্যায় সর্বোচ্চ ${section.maxPerChapter}টি; মোট ${section.offered}টি প্রয়োজন।`);
      const offered=section.kind==="MCQ"?s.cfg.expectedMCQ:section.kind==="CQ"?s.cfg.expectedCQ:s.cfg.expectedSHORT;
      const answer=section.kind==="MCQ"?s.cfg.mcqAnswer:section.kind==="CQ"?s.cfg.cqAnswer:s.cfg.shortAnswer;
      if(offered!==section.offered || answer!==section.answer) issues.push(`${section.kind}: উত্তর দিতে হবে ${section.answer}টি; সেটআপের মানবণ্টন বদলেছে।`);
    }
    return issues;
  }
  if (!["ssc-math-mcq-v1", "ssc-math-written-v1"].includes(s.autoModel)) return [...issues,"এই বিষয়ের মডেল নীতি প্রস্তুত নয়।"];
  if (items.some((q) => q.subject !== "গণিত" || !mathDivision(q.topic ?? "")))
    issues.push("মডেলের বাইরে বিষয়/অধ্যায়ের প্রশ্ন আছে।");
  if (s.autoModel === "ssc-math-mcq-v1") {
    if (items.length !== 30 || items.some((q) => questionType(q) !== "MCQ"))
      issues.push("নৈর্ব্যক্তিক মডেলে ঠিক ৩০টি MCQ প্রয়োজন।");
    const counts = MATH_DIVISIONS.map(d => items.filter(q => questionType(q) === "MCQ" && mathDivision(q.topic ?? "")?.id === d.id).length);
    const quota = MATH_MCQ_QUOTAS;
    if (items.filter(q => questionType(q) === "MCQ" && autoModelHasDiagram(q)).length > quota.maxDiagramQuestions)
      issues.push("নৈর্ব্যক্তিক মডেলে চিত্রযুক্ত প্রশ্ন সর্বোচ্চ ৫টি হতে পারবে।");
    if (counts[0] < quota.algebra.min || counts[0] > quota.algebra.max ||
        counts[1] < quota.geometry.min || counts[1] > quota.geometry.max ||
        MATH_MCQ_FIXED_GROUPS.some(group =>
          items.filter(q => questionType(q) === "MCQ" && mathMcqGroup(q.topic ?? "") === group.id).length !== group.count))
      issues.push(`MCQ মানবণ্টন মিলছে না: ${MATH_MCQ_DISTRIBUTION} প্রয়োজন।`);
  } else {
    if (
      items.some(
        (q) =>
          questionType(q) === "CQ" &&
          (!q.subQuestions ||
            ![q.subQuestions.k, q.subQuestions.kh, q.subQuestions.g].every(
              (v) => v?.trim(),
            ) ||
            q.subQuestions.gh?.trim()),
      )
    )
      issues.push("গণিতের সৃজনশীল প্রশ্নে ক/খ/গ — ৩টি উপপ্রশ্ন প্রয়োজন।");
    for (const d of MATH_DIVISIONS)
      if (
        items.filter(
          (q) =>
            questionType(q) === "CQ" &&
            mathDivision(q.topic ?? "")?.id === d.id,
        ).length !== 2
      )
        issues.push(`${d.title} — ২টি সৃজনশীল প্রশ্ন প্রয়োজন।`);
    if (
      items.filter((q) => questionType(q) === "SHORT").length !== 15 ||
      items.length !== 23
    )
      issues.push("লিখিত মডেলে ৮টি সৃজনশীল ও ১৫টি সংক্ষিপ্ত প্রশ্ন প্রয়োজন।");
  }
  return issues;
}
/** The same section model can be consumed by the editor, snapshots and isolated print tests. */
export function autoModelSections(items: PaperItem[], s: PaperSettings) {
  if (!s.autoModel) return null;
  const views = (qs: PaperItem[]) =>
    qs.map((q) => {
      const opts = Object.entries(q.options ?? {}).filter(
        (v): v is [string, string] => typeof v[1] === "string",
      );
      return { q, opts, ci: opts.findIndex(([k]) => k === q.correct) };
    });
  const warning = autoModelIssues(items, s).length
    ? "সম্পাদিত খসড়া — মডেলের নির্ধারিত কাঠামো অসম্পূর্ণ। "
    : "";
  function withExtras(
    parts: {
      type: string;
      title: string;
      instruction: string;
      startNumber: number;
      questions: ReturnType<typeof views>;
    }[],
  ) {
    const included = new Set(
      parts.flatMap((p) => p.questions.map((v) => v.q.id)),
    );
    const extras = items.filter((q) => !included.has(q.id));
    for (const type of [...new Set(extras.map(questionType))])
      parts.push({
        type,
        title: "অতিরিক্ত প্রশ্ন — মডেল কাঠামোর বাইরে",
        instruction:
          "সম্পাদিত খসড়া: নিচের প্রশ্নগুলো নির্ধারিত মডেল কাঠামোর অংশ নয়।",
        startNumber: 0,
        questions: views(extras.filter((q) => questionType(q) === type)),
      });
    return parts;
  }
  const registered = subjectModelById(s.autoModel);
  if (registered) return withExtras(registered.sections.map((section,i)=>({
    type: section.kind,
    title: `${section.kind === "MCQ" ? "নৈর্ব্যক্তিক" : section.kind === "CQ" ? "সৃজনশীল" : "সংক্ষিপ্ত উত্তর প্রশ্ন"} — ${section.answer*section.marksEach}`,
    instruction: (i===0 ? warning : "") + `${section.answer===section.offered ? "সকল" : `যেকোনো ${section.answer}টি`} প্রশ্নের উত্তর দাও। প্রতিটি প্রশ্নের মান ${section.marksEach}।${section.kind==="CQ" ? ` ক–খ–গ–ঘ: ${registered.policy.cqPartMarks.join("–")}।` : ""}`,
    startNumber: 0,
    questions: views(items.filter(q=>questionType(q)===section.kind)),
  })));
  if(s.syllabusSelection && !subjectModelById(s.autoModel) && s.autoModel.startsWith("syllabus-")) {
    try {const p=resolveSyllabusSelection(s.syllabusSelection);return withExtras(p.sections.map((x,i)=>({type:x.kind,title:`${("title" in x&&x.title)|| (x.kind==="MCQ"?"নৈর্ব্যক্তিক":x.kind==="CQ"?"সৃজনশীল":"লিখিত/সংক্ষিপ্ত")} — ${x.answer*x.marksEach}`,instruction:(i===0?warning:"")+`${x.offered}টি থেকে ${x.answer}টি প্রশ্নের উত্তর দাও। প্রতিটি ${x.marksEach} নম্বর।${x.kind==="CQ"?` ক–খ–গ${p.partMarks.length===4?"–ঘ":""}: ${p.partMarks.join("–")}।`:""}`,startNumber:0,questions:views(items.filter(q=>questionType(q)===x.kind&&autoModelSectionIndex(s,x.kind,q.id)===i))})));}catch{return withExtras([]);}
  }
  if(s.autoModel.startsWith("syllabus-"))return withExtras([]);
  if (s.autoModel === "ssc-math-mcq-v1")
    return withExtras([
      {
        type: "MCQ",
        title: "নৈর্ব্যক্তিক প্রশ্ন — ৩০",
        instruction:
          warning + "সকল প্রশ্নের উত্তর দাও। প্রতিটি প্রশ্নের মান ১।",
        startNumber: 0,
        questions: views(items.filter((q) => questionType(q) === "MCQ")),
      },
    ]);
  const parts = MATH_DIVISIONS.map((d, i) => ({
    type: "CQ",
    title: (i === 0 ? "সৃজনশীল — ৫০\n" : "") + d.title,
    instruction:
      i === 0
        ? warning +
          "প্রতিটি বিভাগ থেকে ন্যূনতম ১টি করে মোট ৫টি প্রশ্নের উত্তর দাও।"
        : "",
    startNumber: i * 2,
    questions: views(
      items.filter(
        (q) =>
          questionType(q) === "CQ" && mathDivision(q.topic ?? "")?.id === d.id,
      ),
    ),
  }));
  parts.push({
    type: "SHORT",
    title: "সংক্ষিপ্ত উত্তর প্রশ্ন — ২০",
    instruction: "যেকোনো ১০টি প্রশ্নের উত্তর দাও। প্রতিটি প্রশ্নের মান ২।",
    startNumber: 0,
    questions: views(items.filter((q) => questionType(q) === "SHORT")),
  });
  return withExtras(parts);
}

function autoModelTopicsForCategory(a:string,b:string){
  const key=(v:string)=>{const k=v.replace(/^Class\s*/i,"");return /^(SSC|9|10|9-10)$/i.test(k)?"SSC":/^(HSC|11|12|11-12)$/i.test(k)?"HSC":k;};return key(a)===key(b);
}
export function autoModelSectionIndex(s:PaperSettings,type:string,id?:string){
  if(!s.syllabusSelection)return -1;
  try{const p=resolveSyllabusSelection(s.syllabusSelection),assigned=id?s.syllabusAssignments?.[id]:undefined;
    if(assigned!==undefined)return p.sections[assigned]?.kind===type?assigned:-1;
    const indexes=p.sections.map((x,i)=>({x,i})).filter(({x})=>x.kind===type);return indexes.length===1?indexes[0].i:-1;
  }catch{return -1;}
}
export function autoModelQuestionMarks(s:PaperSettings,type:string,id?:string){
  if(s.syllabusSelection){try{const p=resolveSyllabusSelection(s.syllabusSelection);return p.sections[autoModelSectionIndex(s,type,id)]?.marksEach??0;}catch{return 0;}}
  return type==="CQ"?10:type==="SHORT"?2:1;
}
export function autoModelPartMarks(s:PaperSettings,i:number){
  if(s.syllabusSelection){try{return resolveSyllabusSelection(s.syllabusSelection).partMarks[i]??0;}catch{return 0;}}
  return s.autoModel==="ssc-math-written-v1"?[2,4,4][i]??i+1:i+1;
}
