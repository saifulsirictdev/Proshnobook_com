"use client";
import {useActionState,useRef,useState} from "react";
import type {NctbClass} from "@/lib/nctb-data";
import {previewUpload,saveUpload,type UploadState} from "./upload-actions";
type Scope={category:string;subject:string;group:string;topic:string};
function Review({raw,scope}:{raw:string;scope:Scope}){
 const [preview,inspect,checking]=useActionState(previewUpload,{} as UploadState);
 const [result,save,saving]=useActionState(saveUpload,{} as UploadState);
 const fields=<><input type="hidden" name="raw" value={raw}/>{Object.entries(scope).map(([k,v])=><input key={k} type="hidden" name={k} value={v}/>)}</>;
 return <div className="space-y-3"><form action={inspect}>{fields}<button disabled={!raw||checking||saving} className="rounded bg-indigo-700 px-4 py-2 text-white disabled:opacity-50">আপলোডের প্রিভিউ ও যাচাই</button></form>
 {preview.error&&<p role="alert">{preview.error}</p>}
 {preview.preview&&<><p>{preview.preview.length}টি প্রশ্ন—এখনো সেভ হয়নি।</p><ol className="max-h-96 space-y-4 overflow-auto">{preview.preview.map((q,i)=><li key={i}><strong>{i+1}. {q.text}</strong><pre className="whitespace-pre-wrap">{JSON.stringify(q.options,null,2)}</pre><p>উত্তর: {q.correct}</p><p className="whitespace-pre-wrap">{q.explanation}</p></li>)}</ol>
 <form action={save} className="space-y-3">{fields}<input type="hidden" name="digest" value={preview.digest}/><label className="flex gap-3"><input type="checkbox" required name="reviewed" value="yes"/>উৎস ও প্রশ্নের প্রিভিউ দেখেছি। শুধু Pending হিসেবে রাখছি; প্রকাশের আগে চূড়ান্ত যাচাই করব।</label><button disabled={saving||checking} className="rounded bg-emerald-800 px-4 py-2 text-white disabled:opacity-50">আপলোড করা প্রশ্ন Pending হিসেবে সেভ করুন</button></form></>}
 {result.error&&<p role="alert">{result.error}</p>}{result.message&&<p role="status">{result.message}</p>}</div>;
}
function FileUpload({scope}:{scope:Scope}){
 const [raw,setRaw]=useState("");const [error,setError]=useState("");const [version,setVersion]=useState(0);const request=useRef(0);
 const isMath=/গণিত|mathematics/i.test(scope.subject);
 const sample={category:scope.category,subject:scope.subject,topic:scope.topic,book:"উৎস বইয়ের নাম",edition:"সংস্করণ",sourceUrl:"https://example.com/book",lang:"Bangla",items:[{type:"MCQ",text:"২ + ২ = কত?",options:{A:"৪",B:"৩",C:"৫",D:"৬"},correct:"A",explanation:"২ ও ২ যোগ করলে ৪।",page:"১",difficulty:"EASY"},{type:"SQ",text:"মৌলিক সংখ্যা কাকে বলে?",explanation:"যে স্বাভাবিক সংখ্যার ঠিক দুটি ধনাত্মক গুণনীয়ক আছে।",page:"১",difficulty:"EASY"},{type:"CQ",text:"উদ্দীপকের বিবরণ এখানে লিখুন।",explanation:"সমাধানের সারসংক্ষেপ",page:"১",difficulty:"MEDIUM",parts:(isMath?["ক","খ","গ"]:["ক","খ","গ","ঘ"]).map((label,i)=>({label,question:"অংশের প্রশ্ন",solution:"এই অংশের সমাধান",marks:(isMath?[2,4,4]:[1,2,3,4])[i]}))}]};
 return <div className="space-y-4"><p>নির্বাচিত: {scope.category} → {scope.subject} {scope.group&&`→ ${scope.group}`} → {scope.topic}</p>
 <label className="block font-semibold">প্রশ্নের JSON ফাইল<input className="mt-2 block w-full" type="file" accept=".json,application/json" onChange={async e=>{const token=++request.current;setRaw("");setError("");setVersion(v=>v+1);const f=e.target.files?.[0];if(!f)return;if(!f.name.toLowerCase().endsWith(".json")||f.size>750000){setError(".json ফাইল দিন, সর্বোচ্চ ৭৫০ KB।");return;}try{const text=await f.text();if(token!==request.current)return;JSON.parse(text);setRaw(text);}catch{if(token===request.current)setError("ফাইল পড়া যায়নি অথবা বৈধ JSON নয়।");}}}/></label>
 <p>১–২০০টি MCQ/SQ/CQ; উত্তর, সমাধান ও উৎসের তথ্য আবশ্যক। JSON-এর শ্রেণি/বিষয়/অধ্যায় নির্বাচনের সঙ্গে মিলতে হবে। গণিত CQ: ক–খ–গ (২–৪–৪); অন্য CQ: ক–খ–গ–ঘ (১–২–৩–৪)।</p>
 {error&&<p role="alert">{error}</p>}
 <details><summary>JSON নমুনা ও CQ format</summary><p>এটি শুধু format-এর নমুনা, নির্বাচিত বিষয়ের প্রস্তুত প্রশ্ন নয়। CQ-তে text হবে উদ্দীপক; parts হবে label, question, solution, marks-সহ array; options/correct দেবেন না। SQ-তেও options/correct লাগে না।</p><pre className="max-h-80 overflow-auto whitespace-pre-wrap">{JSON.stringify(sample,null,2)}</pre><button type="button" className="text-indigo-800 underline" onClick={()=>{const u=URL.createObjectURL(new Blob([JSON.stringify(sample,null,2)],{type:"application/json"}));const a=document.createElement("a");a.href=u;a.download="question-import-template.json";a.click();URL.revokeObjectURL(u);}}>নমুনা JSON ডাউনলোড</button></details>
 {raw&&<Review key={version} raw={raw} scope={scope}/>}</div>;
}
export default function JsonUploadForm({catalog}:{catalog:NctbClass[]}){
 const [category,setCategory]=useState(catalog[0]?.class??"");const [subject,setSubject]=useState("");const [group,setGroup]=useState("");const [topic,setTopic]=useState("");
 const subjects=catalog.find(c=>c.class===category)?.subjects??[];const selected=subjects.find(s=>s.name===subject);const topics=selected?.subCategories?selected.subCategories.find(g=>g.category===group)?.topics??[]:selected?.chapters??[];
 const cls="block w-full rounded border p-2";
 return <section className="space-y-4 rounded-2xl border bg-white p-5"><h2 className="text-2xl font-bold">বিষয় ও অধ্যায় নির্বাচন করে JSON ফাইল আপলোড</h2><p>সাইটের বিদ্যমান শ্রেণি, বিষয় ও অধ্যায়ের তালিকা। নতুন বিভাগ তৈরি হবে না। আপলোড বা প্রিভিউতে ডাটাবেজে কিছু সেভ হয় না।</p><div className="grid gap-3 sm:grid-cols-2">
 <label>আপলোডের শ্রেণি<select className={cls} value={category} onChange={e=>{setCategory(e.target.value);setSubject("");setGroup("");setTopic("");}}>{catalog.map(c=><option key={c.class}>{c.class}</option>)}</select></label>
 <label>আপলোডের বিষয়<select className={cls} value={subject} onChange={e=>{setSubject(e.target.value);setGroup("");setTopic("");}}><option value="">বিষয় নির্বাচন করুন</option>{subjects.map(s=><option key={s.name}>{s.name}</option>)}</select></label>
 {selected?.subCategories&&<label>আপলোডের বিভাগ<select className={cls} value={group} onChange={e=>{setGroup(e.target.value);setTopic("");}}><option value="">বিভাগ নির্বাচন করুন</option>{selected.subCategories.map(g=><option key={g.category}>{g.category}</option>)}</select></label>}
 <label>আপলোডের অধ্যায়<select className={cls} disabled={!subject} value={topic} onChange={e=>setTopic(e.target.value)}><option value="">অধ্যায় নির্বাচন করুন</option>{topics.map(t=><option key={t}>{t}</option>)}</select></label></div>
 {topic&&<FileUpload key={JSON.stringify([category,subject,group,topic])} scope={{category,subject,group,topic}}/>}</section>;
}
