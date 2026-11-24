"use client";
import { useEffect, useMemo, useState } from "react";
import { inspectAutoModel } from "@/app/actions/auto-model";
import { modelHistoryKey, readModelHistory } from "@/lib/auto-model-insights";
import AutoModelPreparation from "./auto-model-preparation";
import { autoModelBlueprint, AUTO_MODEL_NOTICE, type AutoModelVariant } from "@/lib/auto-model";
import { autoModelCatalog, autoModelTopics, resolveSyllabusSelection } from "@/lib/auto-model-syllabus";
import type { SyllabusSelection } from "@/lib/auto-model-syllabus-schema";
export default function AutoModelSetup({category,subject,variant}:{category:string;subject:string;variant:AutoModelVariant}){
  const catalog=autoModelCatalog(category,subject),topics=autoModelTopics(category,subject),known=autoModelBlueprint(category,subject,variant);
  const [avoidRecent,setAvoidRecent]=useState(true),[recent,setRecent]=useState<string[]>([]);
  const [checking,setChecking]=useState(false);
  const [inspection,setInspection]=useState<{key:string;result:Awaited<ReturnType<typeof inspectAutoModel>>}|null>(null);
  useEffect(()=>{try{setRecent(readModelHistory(localStorage.getItem(modelHistoryKey(category,subject,variant))));}catch{setRecent([]);}},[category,subject,variant]);
  const [selected,setSelected]=useState<string[]>([]),[request,setRequest]=useState<SyllabusSelection|null>(null);
  const [reference,setReference]=useState(""),[marks,setMarks]=useState(""),[minutes,setMinutes]=useState(""),[parts,setParts]=useState("");
  const [extras,setExtras]=useState<{title:string;offered:string;answer:string;marksEach:string;topic:string}[]>([]);
  const [counts,setCounts]=useState({MCQ:{offered:"",answer:"",marksEach:"1"},CQ:{offered:"",answer:"",marksEach:""},SHORT:{offered:"",answer:"",marksEach:""}});
  const resolved=useMemo(()=>{
    try{
      if(!selected.length)throw Error("অন্তত একটি ক্যাটাগরি/টপিক নির্বাচন করুন।");
      const raw:SyllabusSelection={category,subject,variant,topics:selected,...(avoidRecent&&recent.length?{avoidQuestionIds:recent}:{}),...(!known?{syllabus:{reference,totalMarks:Number(marks),minutes:Number(minutes),sections:(["MCQ","CQ","SHORT"] as const).filter(k=>variant==="MCQ"?k==="MCQ":k!=="MCQ").filter(k=>Number(counts[k].offered)>0).map(kind=>({kind,offered:Number(counts[kind].offered),answer:Number(counts[kind].answer),marksEach:Number(counts[kind].marksEach),...(kind==="SHORT"?{title:"লিখিত/সংক্ষিপ্ত"}:{})})).concat(variant==="CQ"?extras.filter(x=>Number(x.offered)>0).map(x=>({kind:"SHORT" as const,title:x.title,offered:Number(x.offered),answer:Number(x.answer),marksEach:Number(x.marksEach),...(x.topic?{topics:[x.topic]}:{})})):[]),cqPartMarks:variant==="CQ"&&Number(counts.CQ.offered)>0?parts.split(/[,،\s]+/).filter(Boolean).map(Number):[]}}:{})};
      return {plan:resolveSyllabusSelection(raw),error:""};
    }catch(e){return {plan:null,error:e instanceof Error&&!("issues" in e)?e.message:"সিলেবাসের পূর্ণমান, সময়, প্রদত্ত/উত্তরদানের সংখ্যা ও নম্বর মিলিয়ে দিন।"};}
  },[category,subject,variant,selected,known?.id,reference,marks,minutes,counts,parts,extras,avoidRecent,recent]);
  const inspectionKey=JSON.stringify(resolved.plan?.request??null);
  const inspected=inspection?.key===inspectionKey?inspection.result:null;
  async function inspect(){
    if(!resolved.plan||checking)return;
    const key=inspectionKey;setChecking(true);
    try{setInspection({key,result:await inspectAutoModel(resolved.plan.request)});}
    catch{setInspection({key,result:{ok:false,error:"সংযোগে সমস্যা। AI চালানো হয়নি; আবার স্টক যাচাই করুন।"}});}
    finally{setChecking(false);}
  }
  if(request)return <AutoModelPreparation category={category} subject={subject} variant={variant} selection={request}/>;
  const toggle=(items:string[],checked:boolean)=>setSelected(old=>checked?[...new Set([...old,...items])]:old.filter(t=>!items.includes(t)));
  const groups=catalog?.subCategories?.length?catalog.subCategories:[{category:"অধ্যায়/টপিক",topics}];
  return <section className="space-y-5 rounded-xl border bg-white p-5">
    <h1 className="text-xl font-bold">{subject} — {variant==="MCQ"?"MCQ":"লিখিত"} অটো মডেল</h1>
    <p>{category} · নির্বাচিত সিলেবাসের ডাটাবেজ প্রশ্ন আগে নেওয়া হবে। বই/বিষয়ের পূর্ণ মডেল ডাটাবেজে থাকলে AI বন্ধ থাকবে—নির্বাচিত টপিক কম হলেও। কেবল পূর্ণ বইয়েও স্টক অসম্পূর্ণ হলে AI ঘাটতি পূরণ করতে পারবে; অন্য টপিক থেকে পূরণ করবে না।</p>
    <p className="rounded bg-amber-50 p-3 text-sm">AI-এর প্রশ্ন ব্যক্তিগত, অননুমোদিত খসড়া। ব্যবহার করার আগে প্রশ্ন, উত্তর ও সিলেবাস শিক্ষককে যাচাই করতে হবে। বিদ্যমান দৈনিক প্রস্তুতি-সীমা ও checkout প্রযোজ্য। কোনো প্রশ্ন প্রকাশ/স্বয়ংক্রিয় অনুমোদন হবে না।</p>
    <fieldset className="space-y-3"><legend className="font-semibold">ক্যাটাগরি ও টপিক নির্বাচন</legend>
      <label className="flex gap-2"><input type="checkbox" checked={selected.length===topics.length&&!!topics.length} onChange={e=>toggle(topics,e.target.checked)}/>সব টপিক</label>
      {groups.map(g=><fieldset key={g.category} className="rounded border p-3"><legend><label className="flex gap-2"><input type="checkbox" checked={g.topics.every(t=>selected.includes(t))} onChange={e=>toggle(g.topics,e.target.checked)}/>{g.category}</label></legend>
        <div className="max-h-60 space-y-2 overflow-auto">{g.topics.map(t=><label key={t} className="flex gap-2 text-sm"><input type="checkbox" checked={selected.includes(t)} onChange={e=>toggle([t],e.target.checked)}/>{t}</label>)}</div>
      </fieldset>)}<p aria-live="polite">নির্বাচিত: {selected.length}টি টপিক</p>
    </fieldset>
    {known?<div className="rounded bg-emerald-50 p-3"><b>নির্ধারিত মানবণ্টন — পূর্ণমান {known.totalMarks}</b><p>{known.offered}</p><p>{known.instructions}</p><p className="text-sm">বাধ্যতামূলক বিভাগ/অধ্যায় বাদ দিলে মডেল তৈরি হবে না।</p></div>:<fieldset className="space-y-3 rounded border p-3"><legend className="font-semibold">এই বিষয়ের সিলেবাস ও মানবণ্টন দিন</legend>
      <p className="text-sm">সিস্টেমে যাচাইকৃত পূর্ণ কাঠামো নেই। বই/প্রতিষ্ঠান/বোর্ডের সিলেবাস দেখে নিচের তথ্য দিন; AI পূর্ণমান অনুমান করবে না। এটি শিক্ষক-দেওয়া কাঠামো হিসেবে সংরক্ষিত হবে।</p>
      <label className="block">সিলেবাসের উৎস, নির্দেশনা ও প্রয়োজনীয় পাঠ্যাংশ<textarea aria-label="সিলেবাসের উৎস ও নির্দেশনা" maxLength={6000} rows={4} value={reference} onChange={e=>setReference(e.target.value)} className="block w-full rounded border p-2"/></label>
      <div className="flex flex-wrap gap-3"><label>এই অংশের পূর্ণমান<input aria-label="মডেলের পূর্ণমান" type="number" min={1} max={500} value={marks} onChange={e=>setMarks(e.target.value)} className="block w-28 rounded border p-2"/></label><label>সময় (মিনিট)<input aria-label="মডেলের সময়" type="number" min={1} max={360} value={minutes} onChange={e=>setMinutes(e.target.value)} className="block w-28 rounded border p-2"/></label></div>
      {(["MCQ","CQ","SHORT"] as const).filter(k=>variant==="MCQ"?k==="MCQ":k!=="MCQ").map(kind=><fieldset key={kind} className="rounded border p-2"><legend>{kind==="SHORT"?"লিখিত/সংক্ষিপ্ত":kind}</legend><div className="flex flex-wrap gap-3">{(["offered","answer","marksEach"] as const).map((key,i)=><label key={key}>{["প্রশ্ন থাকবে","উত্তর দিতে হবে","প্রতি প্রশ্নে নম্বর"][i]}<input aria-label={`${kind} ${key}`} type="number" min={key==="offered"?0:1} max={100} readOnly={kind==="MCQ"&&key==="marksEach"} value={counts[kind][key]} onChange={e=>setCounts(old=>({...old,[kind]:{...old[kind],[key]:e.target.value}}))} className="block w-28 rounded border p-2"/></label>)}</div></fieldset>)}
      {variant==="CQ"&&<div className="space-y-3">
        {extras.map((x,index)=><fieldset key={index} className="rounded border p-2"><legend>আলাদা লিখিত বিভাগ {index+1}</legend><div className="flex flex-wrap gap-2">{(["title","offered","answer","marksEach"] as const).map((key,i)=><label key={key}>{["শিরোনাম (যেমন রচনা)","প্রশ্ন থাকবে","উত্তর দিতে হবে","প্রতি প্রশ্নে নম্বর"][i]}<input aria-label={`বিভাগ ${index+1} ${key}`} type={key==="title"?"text":"number"} min={1} max={100} value={x[key]} onChange={e=>setExtras(old=>old.map((a,j)=>j===index?{...a,[key]:e.target.value}:a))} className="block w-36 rounded border p-2"/></label>)}</div>
          <label>এই বিভাগের টপিক<select aria-label={`বিভাগ ${index+1} টপিক`} value={x.topic} onChange={e=>setExtras(old=>old.map((a,j)=>j===index?{...a,topic:e.target.value}:a))} className="block w-full rounded border p-2"><option value="">নির্বাচিত সব টপিক</option>{selected.map(t=><option key={t} value={t}>{t}</option>)}</select></label>
          <button type="button" onClick={()=>setExtras(old=>old.filter((_,j)=>j!==index))}>বিভাগ বাদ দিন</button>
        </fieldset>)}
        <button type="button" disabled={extras.length>=17} onClick={()=>setExtras(old=>[...old,{title:"",offered:"",answer:"",marksEach:"",topic:""}])} className="rounded border px-3 py-2">ভিন্ন নম্বরের লিখিত বিভাগ যোগ করুন</button>
      </div>}
      {variant==="CQ"&&Number(counts.CQ.offered)>0&&<label className="block">CQ-এর উপপ্রশ্নে নম্বর (৩ বা ৪টি, যেমন 1,2,3,4)<input aria-label="CQ উপপ্রশ্নের নম্বর" value={parts} onChange={e=>setParts(e.target.value)} className="block w-full rounded border p-2"/></label>}
      <p className="text-sm">পূর্ণমান = প্রতিটি বিভাগের উত্তরদানের সংখ্যা × প্রতি প্রশ্নের নম্বরের যোগফল। রচনা/পত্র/অনুচ্ছেদের ভিন্ন নম্বর হলে আলাদা নাম ও টপিকসহ লিখিত বিভাগ যোগ করুন। English-এর passage/task কাঠামো তার বিদ্যমান source-aware পথে থাকবে।</p>
    </fieldset>}
    <label className="flex gap-2 rounded border p-3"><input type="checkbox" checked={avoidRecent} onChange={e=>setAvoidRecent(e.target.checked)}/>আগের মডেলের প্রশ্ন এড়ানোর চেষ্টা করুন <span className="text-xs">এই ব্রাউজারে {recent.length}টি স্মরণে আছে। পর্যাপ্ত স্টক না থাকলে পুনরায় নেবে, এ জন্য বাড়তি AI নয়।</span></label>
    <button type="button" disabled={!resolved.plan||checking} onClick={inspect} className="rounded border border-emerald-700 px-4 py-3 disabled:opacity-40">{checking?"ডাটাবেজ যাচাই হচ্ছে…":"বিনা AI-তে স্টক ও কভারেজ যাচাই করুন"}</button>
    {inspected&&!inspected.ok&&<p role="alert" className="text-red-800">{inspected.error}</p>}
    {inspected?.ok&&<section aria-label="মডেল প্রস্তুতির নিরীক্ষা" className="space-y-3 rounded-xl bg-slate-50 p-4">
      <h2 className="font-semibold">তৈরির আগেই জানুন কী পাওয়া যাচ্ছে</h2>
      <dl className="grid grid-cols-2 gap-3 text-sm"><div><dt>পূর্ণমান</dt><dd>{inspected.report.totalMarks}</dd></div><div><dt>সময়</dt><dd>{inspected.report.duration}</dd></div><div><dt>এই মডেলে স্টক থেকে</dt><dd>{inspected.report.stockInModel} / {inspected.report.offered}টি</dd></div><div><dt>AI দিয়ে পূরণযোগ্য ঘাটতি</dt><dd>{inspected.report.aiShortfall}টি</dd></div></dl>
      {inspected.report.databaseOnly && !inspected.report.complete?<p role="alert" className="text-amber-900">এই বই/বিষয়ের পূর্ণ মডেল ডাটাবেজে আছে—AI বন্ধ। নির্বাচিত টপিকে প্রশ্ন কম; টপিক পরিবর্তন করুন বা অনুমোদিত প্রশ্ন যোগ করুন।</p>:inspected.report.complete?<p className="text-emerald-800">ডাটাবেজেই পূর্ণ মডেল পাওয়া গেছে—এই স্টক বহাল থাকলে AI বা generation quota লাগবে না।</p>:<p className="text-amber-900">নিচের বাটন চাপলেই শুধু ঘাটতি পূরণের প্রস্তুতি শুরু হবে। দৈনিক batch quota প্রযোজ্য; provider/retry অনুযায়ী সময় ও ব্যবহারের পরিমাণ বদলাতে পারে।</p>}
      {!inspected.report.feasible&&<p role="alert">নির্বাচিত স্টক/সিলেবাস দিয়ে মডেল হচ্ছে না। নির্বাচন ঠিক করুন বা উপযুক্ত প্রশ্ন যোগ করুন।</p>}
      {inspected.report.reusedRecent>0&&<p>{inspected.report.reusedRecent}টি সাম্প্রতিক প্রশ্ন পুনরায় প্রয়োজন হয়েছে। নতুনত্বের জন্য অকারণে AI চালানো হবে না।</p>}
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption>বিভাগভিত্তিক মানবণ্টন</caption><thead><tr><th>বিভাগ</th><th>থাকবে / উত্তর</th><th>প্রতি প্রশ্ন</th><th>মডেলে স্টক</th></tr></thead><tbody>{inspected.report.sections.map((s,i)=><tr key={i}><th scope="row">{s.title}</th><td>{s.offered} / {s.answer}</td><td>{s.marksEach}</td><td>{s.chosen}</td></tr>)}</tbody></table></div>
      <details><summary>নির্বাচিত প্রতিটি টপিকের প্রকৃত স্টক ও পরিকল্পনা</summary><ul className="max-h-72 space-y-2 overflow-auto text-sm">{inspected.report.topics.map(t=><li key={t.topic}><b>{t.topic}</b>: উপযুক্ত {t.available} · মডেলে {t.chosen} · ঘাটতি {t.missing}{t.chosen===0&&t.missing===0?" — এই মডেলে প্রশ্ন নেই":""}</li>)}</ul></details>
      <p className="text-xs">এটি শুধু কাঠামো/স্টকের নিরীক্ষা—বিষয়গত সঠিকতার সনদ নয়। ব্যবহারের আগে শিক্ষক প্রশ্ন/উত্তর দেখে নেবেন। স্টক বদলালে সার্ভার আবার যাচাই করবে।</p>
    </section>}
    {resolved.error&&<p role="status" className="text-amber-900">{resolved.error}</p>}
    <p className="text-xs text-slate-600">{AUTO_MODEL_NOTICE}</p>
    <button type="button" disabled={!resolved.plan||checking||!inspected?.ok||!inspected.report.feasible} onClick={()=>resolved.plan&&inspected?.ok&&setRequest(resolved.plan.request)} className="rounded bg-emerald-700 px-5 py-3 font-semibold text-white disabled:opacity-40">নিরীক্ষা মেনে পূর্ণ মডেল তৈরি করুন</button>
  </section>;
}
