"use client";
import {useActionState,useState} from "react";
import {previewPrepared,savePrepared,type PreparedState} from "./prepared-actions";
type Catalog={category:string;subjects:{name:string;chapters:string[]}[]}[];
type Summary={id:string;category:string;subject:string;topic:string;title:string;limitations:string;counts:{MCQ:number;CQ:number;SQ:number}};
function BatchCard({batch,saved}:{batch:Summary;saved:boolean}){
 const [preview,inspect,checking]=useActionState(previewPrepared,{} as PreparedState);
 const [result,save,saving]=useActionState(savePrepared,{} as PreparedState);
 return <article className="space-y-3 rounded-xl border bg-white p-4">
  <h3 className="font-bold">{batch.title}</h3><p>MCQ {batch.counts.MCQ} · CQ {batch.counts.CQ} · SQ {batch.counts.SQ}</p>
  <p className="text-amber-900">{batch.limitations}</p><p>{saved?"এই সংস্করণের import receipt আছে—আবার সেভ করলে ডুপ্লিকেট যোগ হবে না।":"প্রস্তুত Draft — Pending হিসেবে সেভ করা যাবে।"}</p>
  <form action={inspect}><input type="hidden" name="id" value={batch.id}/><button disabled={checking||saving} className="rounded-lg bg-indigo-700 px-4 py-2 text-white disabled:opacity-50">প্রশ্ন ও উত্তর প্রিভিউ</button></form>
  {preview.error&&<p role="alert">{preview.error}</p>}
  {preview.preview&&<><ol className="max-h-96 space-y-4 overflow-auto">{preview.preview.map((q,i)=><li key={i}><strong>{i+1}. [{q.kind}] {q.text}</strong><pre className="whitespace-pre-wrap">{JSON.stringify(q.options,null,2)}</pre><p>উত্তর: {q.correct}</p><p className="whitespace-pre-wrap">{q.explanation}</p></li>)}</ol>
   <form action={save} className="space-y-3"><input type="hidden" name="id" value={batch.id}/><input type="hidden" name="digest" value={preview.digest}/><label className="flex gap-3"><input required type="checkbox" name="reviewed" value="yes"/>সীমাবদ্ধতা পড়েছি; শুধু Pending হিসেবে সংরক্ষণ করছি। প্রকাশের আগে চূড়ান্ত পর্যালোচনা করব।</label><button disabled={saving||checking} className="rounded-lg bg-emerald-800 px-4 py-2 text-white disabled:opacity-50">{saving?"সেভ হচ্ছে…":"Pending হিসেবে সেভ করুন"}</button></form></>}
  {result.error&&<p role="alert">{result.error}</p>}{result.message&&<p role="status">{result.message}</p>}
 </article>;
}
export default function PreparedLibrary({catalog,batches,savedIds}:{catalog:Catalog;batches:Summary[];savedIds:string[]}){
 const [category,setCategory]=useState(catalog[0]?.category??"");const [subject,setSubject]=useState("");const [topic,setTopic]=useState("");
 const subjects=catalog.find(c=>c.category===category)?.subjects??[];
 const chapters=subjects.find(s=>s.name===subject)?.chapters??[];
 const selected=batches.filter(b=>b.category===category&&b.subject===subject&&b.topic===topic);
 return <section className="space-y-4 rounded-2xl border bg-slate-50 p-5">
  <h2 className="text-2xl font-bold">অধ্যায়ভিত্তিক প্রস্তুত প্রশ্নব্যাচ</h2>
  <p>প্রস্তুত প্রশ্ন বেছে প্রিভিউ করুন, তারপর Pending হিসেবে সেভ করুন। এই পেজ নিজে নতুন প্রশ্ন তৈরি করে না; পরবর্তী প্রস্তুত ব্যাচ যুক্ত হলে এখানে পাওয়া যাবে।</p>
  <div className="grid gap-3 sm:grid-cols-3">
   <label>শ্রেণি<select className="block w-full rounded border p-2" value={category} onChange={e=>{setCategory(e.target.value);setSubject("");setTopic("");}}>{catalog.map(c=><option key={c.category}>{c.category}</option>)}</select></label>
   <label>বিষয়<select className="block w-full rounded border p-2" value={subject} onChange={e=>{setSubject(e.target.value);setTopic("");}}><option value="">বিষয় নির্বাচন করুন</option>{subjects.map(s=><option key={s.name}>{s.name}</option>)}</select></label>
   <label>অধ্যায়<select disabled={!subject} className="block w-full rounded border p-2" value={topic} onChange={e=>setTopic(e.target.value)}><option value="">অধ্যায় নির্বাচন করুন</option>{chapters.map(t=><option key={t}>{t}</option>)}</select></label>
  </div>
  {topic&&(selected.length?selected.map(b=><BatchCard key={b.id} batch={b} saved={savedIds.includes(b.id)}/>):<p role="status">এই অধ্যায়ের ব্যাচ এখনো প্রস্তুত হয়নি। কোনো প্রশ্ন সেভ বা তৈরি হয়নি।</p>)}
  <details><summary className="cursor-pointer font-semibold">সব প্রস্তুত ব্যাচ ({batches.length})</summary>{batches.map(b=><button key={b.id} type="button" className="my-2 block text-left text-indigo-800 underline" onClick={()=>{setCategory(b.category);setSubject(b.subject);setTopic(b.topic);}}>{b.category} → {b.subject} → {b.topic} · {b.title}</button>)}</details>
 </section>;
}
