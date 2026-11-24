import { NCTB_CLASSES } from "./nctb-data";
import { autoModelSelectionSchema, type SyllabusSelection } from "./auto-model-syllabus-schema";
import { autoModelBlueprint, autoModelRowKind, assembleSubjectAutoModel, mathDivision, type AutoModelRow } from "./auto-model";
import { subjectModelPolicy } from "./subject-model-policy";
import { questionBlocks } from "./question-tables";
export const syllabusFingerprint=(s:string)=>s.normalize("NFKC").replace(/[০-৯]/g,c=>String("০১২৩৪৫৬৭৮৯".indexOf(c))).replace(/\s+/g," ").trim().toLowerCase();
function gradeKey(s:string){const k=s.trim().replace(/^Class\s*/i,"");return /^(SSC|9|10|9-10)$/i.test(k)?"SSC":/^(HSC|11|12|11-12)$/i.test(k)?"HSC":k;}
export function autoModelCatalog(category:string,subject:string){
  return NCTB_CLASSES.find(c=>gradeKey(c.class)===gradeKey(category))?.subjects.find(s=>s.name===subject) ?? null;
}
export function autoModelTopics(category:string,subject:string){
  const s=autoModelCatalog(category,subject);return [...new Set([...(s?.chapters??[]),...(s?.subCategories?.flatMap(g=>g.topics)??[])])];
}
export function autoModelSetupSummary(category:string,subject:string,variant:string){
  if(!["MCQ","CQ"].includes(variant)||!autoModelTopics(category,subject).length)return null;
  return {title:`${subject} — নির্বাচিত সিলেবাসের মডেল`,totalMarks:"আপনার সিলেবাস অনুযায়ী",minutes:"সিলেবাস অনুযায়ী",offered:"পরের ধাপে ক্যাটাগরি/টপিক নির্বাচন করুন এবং নির্ধারিত মানবণ্টন দিন।",instructions:"বইয়ে পূর্ণ মডেলের স্টক থাকলে শুধু ডাটাবেজ, AI বন্ধ। পূর্ণ স্টক না থাকলেই কেবল ঘাটতিতে AI। মানবণ্টন অনুমান করা হবে না।"};
}
export function resolveSyllabusSelection(raw:unknown){
  const request=autoModelSelectionSchema.parse(raw),catalog=autoModelTopics(request.category,request.subject);
  if(!catalog.length)throw Error("এই শ্রেণি–বিষয়ের সিলেবাস ক্যাটালগ প্রস্তুত নয়।");
  if(new Set(request.topics).size!==request.topics.length||request.topics.some(t=>!catalog.includes(t)))throw Error("নির্বাচিত টপিক এই শ্রেণি–বিষয়ের সিলেবাসে নেই।");
  const topics=request.topics.length?request.topics:catalog;
  const registered=autoModelBlueprint(request.category,request.subject,request.variant);
  if(registered&&request.syllabus)throw Error("নিবন্ধিত বিষয়ের মানবণ্টন বদলানো যাবে না।");
  if(!registered&&!request.syllabus)throw Error("এই বিষয়ের নির্ধারিত পূর্ণমান, সময়, প্রশ্নসংখ্যা ও সিলেবাসের নির্দেশনা দিন; AI অনুমান করবে না।");
  const p=request.syllabus;
  if(p?.sections.some(s=>s.topics?.some(t=>!topics.includes(t))))throw Error("বিভাগের টপিকও নির্বাচিত সিলেবাসের মধ্যে থাকতে হবে।");
  if(p&&p.sections.some(s=>request.variant==="MCQ"?s.kind!=="MCQ":s.kind==="MCQ"))throw Error("মডেলের ধরন ও বিভাগ মিলছে না।");
  const policy=subjectModelPolicy(request.category,request.subject);
  // Registered blueprints retain all original mandatory divisions/chapter quotas.
  if(registered){
    const required=policy?.variants[request.variant].sections.flatMap(s=>s.requiredChapters.map(ch=>policy.chapters[ch-1]));
    if(required?.some(t=>!topics.includes(t)))throw Error("নির্ধারিত মানবণ্টনের বাধ্যতামূলক অধ্যায়গুলোও নির্বাচন করুন।");
    if(!policy&&["algebra","geometry","trigonometry","statistics"].some(d=>!topics.some(t=>mathDivision(t)?.id===d)))throw Error("গণিতের নির্ধারিত মানবণ্টনের সব বিভাগ থেকে অধ্যায় নির্বাচন করুন।");
  }
  const sections=p?.sections??policy?.variants[request.variant].sections??(request.variant==="MCQ"?[{kind:"MCQ" as const,offered:30,answer:30,marksEach:1}]:[{kind:"CQ" as const,offered:8,answer:5,marksEach:10},{kind:"SHORT" as const,offered:15,answer:10,marksEach:2}]);
  return {request:{...request,topics},topics,registered,policy,sections,partMarks:p?.cqPartMarks??policy?.cqPartMarks??[2,4,4],totalMarks:p?.totalMarks??registered!.totalMarks,minutes:p?`${p.minutes} মিনিট`:registered!.minutes};
}
export type ResolvedSyllabus=ReturnType<typeof resolveSyllabusSelection>;
function rawOptions(q:AutoModelRow){return q.options&&typeof q.options==="object"&&!Array.isArray(q.options)?q.options as Record<string,unknown>:{};}
/** Structural safety only, not a claim of scientific/teacher certification. */
export function syllabusRowKind(q:AutoModelRow,p:ResolvedSyllabus):"MCQ"|"CQ"|"SHORT"|null{
  if(!p.topics.includes(q.topic)||!q.id||!q.text.trim()||!q.explanation.trim())return null;
  if(p.registered)return autoModelRowKind(q,p.policy??undefined);
  const o=rawOptions(q);
  if(["image","diagram","imageUrl","attachments","groupId","stimulusId","sharedStimulus"].some(k=>o[k]))return null;
  if([q.text,q.explanation].some(t=>t.includes("![")||/<\/?[a-z]/i.test(t)))return null;
  if(/(?:উপরের|নিচের|নিম্নের|প্রদত্ত) (?:উদ্দীপক|চিত্র)|following (?:stimulus|figure)|above (?:passage|figure)/i.test(q.text)&&!o.stimulus)return null;
  if(q.correct.trim()){
    const choices=Object.entries(o).filter(([k])=>k!=="_provenance"&&k!=="_autoModelSection");
    return choices.length===4&&["A","B","C","D"].every(k=>typeof o[k]==="string"&&(o[k] as string).trim()&&!(o[k] as string).includes("![")&&!/<\/?[a-z]/i.test(o[k] as string))&&["A","B","C","D"].includes(q.correct)&&new Set(choices.map(([,v])=>syllabusFingerprint(String(v)))).size===4?"MCQ":null;
  }
  const sub=o.subQuestions as Record<string,unknown>|undefined;
  if(sub||o.stimulus){
    if(typeof o.stimulus!=="string"||!o.stimulus.trim()||!sub)return null;
    const keys=p.partMarks.length===3?["k","kh","g"]:["k","kh","g","gh"];
    if(!keys.every(k=>typeof sub[k]==="string"&&(sub[k] as string).trim())||(keys.length===3&&sub.gh))return null;
    const marks=o.marks as Record<string,unknown>|undefined;
    if(marks&&keys.some((k,i)=>marks[k]!==p.partMarks[i]))return null;
    return "CQ";
  }
  return Object.keys(o).some(k=>k!=="_provenance"&&k!=="_autoModelSection")?null:"SHORT";
}
export function syllabusStock(rows:AutoModelRow[],p:ResolvedSyllabus){
  const ids=new Set<string>(),stems=new Set<string>();
  return rows.filter(q=>{
    const kind=syllabusRowKind(q,p),key=syllabusFingerprint(String(rawOptions(q).stimulus||q.text));
    if(!kind||!p.sections.some(s=>s.kind===kind)||ids.has(q.id)||stems.has(key))return false;
    ids.add(q.id);stems.add(key);return true;
  });
}
function assemble(rows:AutoModelRow[],p:ResolvedSyllabus){
  if(p.registered)return assembleSubjectAutoModel(rows,p.request.category,p.request.subject,p.request.variant,()=>0.999999);
  const ids:string[]=[],gaps:{section:string;required:number;available:number}[]=[];
  for(const section of p.sections){
    const buckets=new Map<string,AutoModelRow[]>();
    for(const q of rows.filter(q=>syllabusRowKind(q,p)===section.kind))buckets.set(q.topic,[...(buckets.get(q.topic)??[]),q]);
    // Real rows first, then private owner drafts, then virtual deficit slots.
    let chosen=0;
    for(const virtual of [false,true]){
      while(chosen<section.offered){let progress=false;for(const b of buckets.values()){
        if(chosen>=section.offered)break;
        const i=b.findIndex(q=>q.id.startsWith("__auto_slot:")===virtual);if(i<0)continue;
        ids.push(b.splice(i,1)[0].id);chosen++;progress=true;
      }if(!progress)break;}
    }
    if(chosen<section.offered)gaps.push({section:section.kind,required:section.offered,available:chosen});
  }
  return gaps.length?{ok:false as const,gaps}:{ok:true as const,ids};
}
/** Database-first completion plan; virtual records NEVER get saved or returned as questions.
 * Feasibility is delegated to the unchanged registered Math/Physics engines. */
export type SyllabusModelPlan =
  | {ok:true;ids:string[];missing:AutoModelRow[];assignments?:Record<string,number>}
  | {ok:false;gaps:{section:string;required:number;available:number}[];missing:AutoModelRow[];stockIds?:string[];assignments?:Record<string,number>};
export function planSyllabusModel(rows:AutoModelRow[],p:ResolvedSyllabus,random:()=>number=Math.random):SyllabusModelPlan{
  const stock=syllabusStock(rows,p);
  const recent=new Set(p.request.avoidQuestionIds??[]);
  if(recent.size){
    const fresh=stock.filter(q=>!recent.has(q.id));
    // Freshness is best effort, NEVER an excuse to generate extra AI questions.
    const freshPlan=planSyllabusStock(fresh,p,random,new Set());
    if(freshPlan.ok)return freshPlan;
  }
  return planSyllabusStock(stock,p,random,recent);
}
function planSyllabusStock(stock:AutoModelRow[],p:ResolvedSyllabus,random:()=>number,recent:Set<string>):SyllabusModelPlan{
  for(let i=stock.length-1;i>0;i--){const j=Math.min(i,Math.max(0,Math.floor(random()*(i+1))));[stock[i],stock[j]]=[stock[j],stock[i]];}
  if(recent.size)stock.sort((a,b)=>Number(recent.has(a.id))-Number(recent.has(b.id)));
  if(!p.registered)return planCustomSyllabus(stock,p);
  const complete=assembleSubjectAutoModel(stock,p.request.category,p.request.subject,p.request.variant,random);
  if(complete.ok)return {ok:true as const,ids:complete.ids,missing:[] as AutoModelRow[]};
  const virtual:AutoModelRow[]=[];
  for(const section of p.sections)for(const topic of p.topics)for(let i=0;i<section.offered;i++){
    const id=`__auto_slot:${virtual.length}`,sub=Object.fromEntries(["k","kh","g","gh"].slice(0,p.partMarks.length).map(k=>[k,`স্বয়ংসম্পূর্ণ ${k} উপপ্রশ্ন`]));
    virtual.push({id,topic,text:`অস্থায়ী পরিকল্পনা ${id}`,explanation:"পরিকল্পনামাত্র; প্রশ্ন নয়",correct:section.kind==="MCQ"?"A":"",options:section.kind==="MCQ"?{A:"এক",B:"দুই",C:"তিন",D:"চার"}:section.kind==="CQ"?{stimulus:`অস্থায়ী পরিকল্পনা ${id}`,subQuestions:sub,marks:Object.fromEntries(Object.keys(sub).map((k,j)=>[k,p.partMarks[j]]))}:{}});
  }
  let pool=[...stock,...virtual],result=assemble(pool,p);
  if(!result.ok)return {ok:false as const,gaps:result.gaps,missing:[] as AutoModelRow[]};
  // Remove unused virtuals, then attempt removal of every used virtual. This keeps
  // real usable stock instead of generating just to satisfy a random topic rotation.
  pool=pool.filter(q=>!q.id.startsWith("__auto_slot:")||result.ok&&result.ids.includes(q.id));
  for(const q of [...pool].filter(q=>q.id.startsWith("__auto_slot:"))){
    const candidate=pool.filter(r=>r.id!==q.id),test=assemble(candidate,p);
    if(test.ok){pool=candidate;result=test;}
  }
  if(!result.ok)throw Error("পূর্ণ মডেলের পরিকল্পনা মেলেনি।");
  return {ok:false as const,gaps:complete.gaps,missing:result.ids.filter(id=>id.startsWith("__auto_slot:")).map(id=>pool.find(q=>q.id===id)!),stockIds:result.ids.filter(id=>!id.startsWith("__auto_slot:"))};
}
export function safeGeneratedModelRow(q:AutoModelRow,p:ResolvedSyllabus){
  // AI may not invent unavailable figure URLs, dependencies or source attributions.
  const text=JSON.stringify([q.text,q.options,q.explanation]);
  return !/!\[|https?:\/\/|<\/?[a-z]|বোর্ড প্রশ্ন|board question/i.test(text)&&syllabusRowKind(q,p)!==null&&questionBlocks(q.text).every(b=>b.kind==="text"||b.kind==="table");
}

export function syllabusSectionSignature(p:ResolvedSyllabus,index:number){
  return JSON.stringify([p.request.subject,p.request.variant,p.sections[index]]);
}
/** Maximum matching uses all compatible real rows before creating ANY deficit slot.
 * Named written sections can have different marks and their own selected topics. */
function planCustomSyllabus(stock:AutoModelRow[],p:ResolvedSyllabus){
  const slots=p.sections.flatMap((section,index)=>Array.from({length:section.offered},()=>index));
  const candidates=p.sections.map((section,index)=>stock.map((q,i)=>({q,i})).filter(({q})=>{
    const meta=rawOptions(q)._autoModelSection;
    return syllabusRowKind(q,p)===section.kind&&(!("topics" in section)||!section.topics||section.topics.includes(q.topic))&&(!meta||meta===syllabusSectionSignature(p,index));
  }).map(({i})=>i));
  const owner=new Map<number,number>(),match=new Map<number,number>();
  function assign(slot:number,seen:Set<number>):boolean{
    for(const r of candidates[slots[slot]]){if(seen.has(r))continue;seen.add(r);
      const prev=owner.get(r);if(prev===undefined||assign(prev,seen)){owner.set(r,slot);match.set(slot,r);return true;}}
    return false;
  }
  [...slots.keys()].sort((a,b)=>candidates[slots[a]].length-candidates[slots[b]].length).forEach(slot=>assign(slot,new Set()));
  const assignments:Record<string,number>={},ids:string[]=[],missing:AutoModelRow[]=[];
  for(let i=0;i<slots.length;i++){
    const index=slots[i],found=match.get(i),section=p.sections[index];
    if(found!==undefined){ids.push(stock[found].id);assignments[stock[found].id]=index;continue;}
    const scope=("topics" in section&&section.topics)||p.topics,topic=scope[missing.length%scope.length],id=`__auto_slot:${index}:${i}`;
    const sub=Object.fromEntries(["k","kh","g","gh"].slice(0,p.partMarks.length).map(k=>[k,`সম্পূর্ণ ${k} উপপ্রশ্ন`]));
    missing.push({id,topic,text:`পরিকল্পনা ${id}`,explanation:"অস্থায়ী পরিকল্পনামাত্র",correct:section.kind==="MCQ"?"A":"",options:section.kind==="MCQ"?{A:"এক",B:"দুই",C:"তিন",D:"চার"}:section.kind==="CQ"?{stimulus:`পরিকল্পনা ${id}`,subQuestions:sub}:{}});
  }
  return missing.length?{ok:false as const,stockIds:ids,assignments,missing,gaps:p.sections.map((x,index)=>({section:("title" in x&&x.title)||x.kind,required:x.offered,available:ids.filter(id=>assignments[id]===index).length})).filter(g=>g.available<g.required)}:{ok:true as const,ids,assignments,missing};
}
