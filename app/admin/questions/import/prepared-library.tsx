"use client";
import {useActionState,useState} from "react";
import Link from "next/link";
import {selectPreparedBatches,pendingReviewHref} from "@/lib/prepared-batch-selection";
import {previewPrepared,savePrepared,type PreparedState} from "./prepared-actions";
type Catalog={category:string;subjects:{name:string;chapters:string[]}[]}[];
type Summary={id:string;category:string;subject:string;topic:string;title:string;limitations:string;counts:{MCQ:number;CQ:number;SQ:number}};
function BatchCard({batch,saved}:{batch:Summary;saved:boolean}){
 const [preview,inspect,checking]=useActionState(previewPrepared,{} as PreparedState);
 const [result,save,saving]=useActionState(savePrepared,{} as PreparedState);
 return <article className="space-y-3 rounded-xl border bg-white p-4">
  <h3 className="font-bold">{batch.topic}</h3><p className="font-semibold">{batch.title}</p><p>MCQ {batch.counts.MCQ} · CQ {batch.counts.CQ} · SQ {batch.counts.SQ}</p>
  <p className="text-amber-900">{batch.limitations}</p><p>{saved?"পুরোনো import receipt আছে—প্রশ্নের বর্তমান অবস্থা জানতে আবার যাচাই/সেভ করুন; receipt থাকা মানেই Pending থাকা নয়।":"প্রস্তুত Draft — Pending হিসেবে সেভ করা যাবে।"}</p>
  <form action={inspect}><input type="hidden" name="id" value={batch.id}/><button disabled={checking||saving} className="rounded-lg bg-indigo-700 px-4 py-2 text-white disabled:opacity-50">প্রশ্ন ও উত্তর প্রিভিউ</button></form>
  {preview.error&&<p role="alert">{preview.error}</p>}
  {preview.preview&&<><ol className="max-h-96 space-y-4 overflow-auto">{preview.preview.map((q,i)=><li key={i}><strong>{i+1}. [{q.kind}] {q.text}</strong><pre className="whitespace-pre-wrap">{JSON.stringify(q.options,null,2)}</pre><p>উত্তর: {q.correct}</p><p className="whitespace-pre-wrap">{q.explanation}</p></li>)}</ol>
   <form action={save} className="space-y-3"><input type="hidden" name="id" value={batch.id}/><input type="hidden" name="digest" value={preview.digest}/><label className="flex gap-3"><input required type="checkbox" name="reviewed" value="yes"/>সীমাবদ্ধতা পড়েছি; শুধু Pending হিসেবে সংরক্ষণ করছি। প্রকাশের আগে চূড়ান্ত পর্যালোচনা করব।</label><button disabled={saving||checking} className="rounded-lg bg-emerald-800 px-4 py-2 text-white disabled:opacity-50">{saving?"সেভ হচ্ছে…":"Pending হিসেবে সেভ করুন"}</button></form></>}
  {result.error&&<p role="alert">{result.error}</p>}{result.message&&<div role="status"><p>{result.message}</p><Link className="qm-action-link" href={pendingReviewHref(batch.category,batch.subject)}>এই বিষয়ের Pending প্রশ্ন পর্যালোচনা ও অনুমোদন →</Link></div>}
 </article>;
}
function SubjectBatchPanel({batches}:{batches:Summary[]}){
 const [previews,setPreviews]=useState<Record<string,PreparedState>>({});
 const [results,setResults]=useState<Record<string,PreparedState>>({});
 const [busy,setBusy]=useState(false);const [reviewed,setReviewed]=useState(false);
 const complete=batches.length>0&&batches.every(b=>previews[b.id]?.digest&&previews[b.id]?.preview);
 async function inspectAll(){
  setBusy(true);setReviewed(false);setPreviews({});setResults({});
  try{for(const b of batches){const fd=new FormData();fd.set("id",b.id);
   let state:PreparedState;try{state=await previewPrepared({},fd);}catch{state={error:"প্রিভিউ লোড হয়নি; আবার চেষ্টা করুন।"};}
   setPreviews(old=>({...old,[b.id]:state}));
  }}finally{setBusy(false);}
 }
 async function saveAll(){
  if(busy||!complete||!reviewed)return;
  setBusy(true);
  try{for(const b of batches){
   if(results[b.id]?.message)continue;
   const fd=new FormData();fd.set("id",b.id);fd.set("digest",previews[b.id].digest!);fd.set("reviewed","yes");
   let state:PreparedState;try{state=await savePrepared({},fd);}catch{state={error:"ফল নিশ্চিত হয়নি। আবার চেষ্টা করলে সার্ভার ডুপ্লিকেট পরীক্ষা করবে।"};}
   setResults(old=>({...old,[b.id]:state}));
  }}finally{setBusy(false);}
 }
 return <div className="space-y-4 rounded-xl border border-indigo-200 bg-white p-4">
  <h3 className="text-lg font-bold">নির্বাচিত সব অধ্যায় একসঙ্গে প্রিভিউ ও Pending</h3>
  <p>{batches.length}টি অধ্যায়/ব্যাচ। প্রিভিউতে প্রশ্ন, উত্তর ও সীমাবদ্ধতা পড়ুন। সেভ অধ্যায় ধরে হবে; সম্পূর্ণ প্রক্রিয়া এক লেনদেন নয়। ব্যর্থ অধ্যায় আবার চেষ্টা করা যাবে। কোনো প্রশ্ন স্বয়ংক্রিয়ভাবে Approved বা প্রকাশিত হবে না।</p>
  <button type="button" onClick={inspectAll} disabled={busy||!batches.length} className="rounded-lg bg-indigo-700 px-4 py-2 text-white disabled:opacity-50">সব নির্বাচিত অধ্যায়ের প্রশ্ন ও উত্তর প্রিভিউ</button>
  {batches.map(b=>{const p=previews[b.id],r=results[b.id];return <section key={b.id} className="space-y-2 border-t pt-3">
   <h4 className="font-bold">{b.topic} · MCQ {b.counts.MCQ} / CQ {b.counts.CQ} / SQ {b.counts.SQ}</h4>
   <p className="text-sm text-amber-900">{b.limitations}</p>
   {p?.error&&<p role="alert">{p.error}</p>}
   {p?.preview&&<details><summary className="cursor-pointer font-semibold">প্রশ্ন ও উত্তর পড়ুন ({p.preview.length})</summary><ol className="max-h-[32rem] space-y-4 overflow-auto p-2">{p.preview.map((q,i)=><li key={i}><strong>{i+1}. [{q.kind}] {q.text}</strong><pre className="whitespace-pre-wrap">{JSON.stringify(q.options,null,2)}</pre><p>উত্তর: {q.correct}</p><p className="whitespace-pre-wrap">{q.explanation}</p></li>)}</ol></details>}
   {r?.error&&<p role="alert">{r.error}</p>}{r?.message&&<p role="status">{r.message}</p>}
  </section>;})}
  {complete&&<><label className="flex gap-3"><input type="checkbox" checked={reviewed} disabled={busy} onChange={e=>setReviewed(e.target.checked)}/>সব নির্বাচিত ব্যাচের প্রিভিউ ও সীমাবদ্ধতা পড়েছি; শুধু Pending-এ রাখব, পরে একে একে যাচাই ও অনুমোদন করব।</label>
  <button type="button" disabled={busy||!reviewed} onClick={saveAll} className="rounded-lg bg-emerald-800 px-4 py-2 text-white disabled:opacity-50">{busy?"কাজ চলছে…":"সব নির্বাচিত অধ্যায় Pending-এ সেভ / ব্যর্থগুলো আবার চেষ্টা"}</button></>}
  <p role="status">নতুন Pending প্রশ্ন: {batches.reduce((n,b)=>n+(results[b.id]?.counts?.inserted??0),0)} · আগে থেকেই Pending: {batches.reduce((n,b)=>n+(results[b.id]?.counts?.pending??0),0)} · আগে থেকেই Approved: {batches.reduce((n,b)=>n+(results[b.id]?.counts?.approved??0),0)}। ব্যাচের সংখ্যা আর নতুন প্রশ্নের সংখ্যা এক নয়।</p>
  <p role="status" aria-live="polite">{busy?"প্রক্রিয়া চলছে… ":""}প্রিভিউ: {batches.filter(b=>previews[b.id]?.preview).length}/{batches.length} · database যাচাই সম্পন্ন ব্যাচ: {batches.filter(b=>results[b.id]?.message).length}/{batches.length} · সেভে সমস্যা/অনিশ্চিত: {batches.filter(b=>results[b.id]?.error).length}</p>
 </div>;
}
export default function PreparedLibrary({catalog,batches,savedIds}:{catalog:Catalog;batches:Summary[];savedIds:string[]}){
 const [category,setCategory]=useState(catalog[0]?.category??"");const [subject,setSubject]=useState("");const [topic,setTopic]=useState("");
 const subjects=catalog.find(c=>c.category===category)?.subjects??[];
 const chapters=subjects.find(s=>s.name===subject)?.chapters??[];
 const selected=selectPreparedBatches(batches,{category,subject,topic});
 return <section className="space-y-4 rounded-2xl border bg-slate-50 p-5">
  <h2 className="text-2xl font-bold">অধ্যায়ভিত্তিক প্রস্তুত প্রশ্নব্যাচ</h2>
  <p>শ্রেণি ও বিষয় নির্বাচন করলে সেই বিষয়ের সব প্রস্তুত অধ্যায়ের ব্যাচ দেখাবে। ব্যাচ বেছে প্রিভিউ করুন, তারপর Pending হিসেবে সেভ করুন। সেভ করলেই Approved বা প্রকাশিত হবে না। এই পেজ নিজে নতুন প্রশ্ন তৈরি করে না; পরবর্তী প্রস্তুত ব্যাচ যুক্ত হলে এখানে পাওয়া যাবে।</p>
  <div className="grid gap-3 sm:grid-cols-3">
   <label>শ্রেণি<select className="block w-full rounded border p-2" value={category} onChange={e=>{setCategory(e.target.value);setSubject("");setTopic("");}}>{catalog.map(c=><option key={c.category}>{c.category}</option>)}</select></label>
   <label>বিষয়<select className="block w-full rounded border p-2" value={subject} onChange={e=>{setSubject(e.target.value);setTopic("");}}><option value="">বিষয় নির্বাচন করুন</option>{subjects.map(s=><option key={s.name}>{s.name}</option>)}</select></label>
   <label>অধ্যায়<select disabled={!subject} className="block w-full rounded border p-2" value={topic} onChange={e=>setTopic(e.target.value)}><option value="">সব প্রস্তুত অধ্যায়</option>{chapters.map(t=><option key={t}>{t}</option>)}</select></label>
  </div>
  {subject&&<div className="rounded-lg border border-indigo-100 bg-white p-3"><p role="status">{selected.length}টি প্রস্তুত ব্যাচ · MCQ {selected.reduce((n,b)=>n+b.counts.MCQ,0)} · CQ {selected.reduce((n,b)=>n+b.counts.CQ,0)} · SQ {selected.reduce((n,b)=>n+b.counts.SQ,0)}</p><Link className="qm-action-link" href={pendingReviewHref(category,subject)}>এই বিষয়ের সংরক্ষিত Pending প্রশ্ন দেখুন →</Link><p className="text-sm text-slate-600">এখানকার সংখ্যা খসড়ার পরিমাণ; পূর্ণ বিষয়ের লক্ষ্যমাত্রা বা শিক্ষক-অনুমোদনের সনদ নয়। প্রতিটি ব্যাচের সীমাবদ্ধতা পড়ুন।</p></div>}
  {subject&&selected.length>0&&<SubjectBatchPanel key={JSON.stringify([category,subject,topic])} batches={selected}/>}
  {subject&&(selected.length?selected.map(b=><BatchCard key={b.id} batch={b} saved={savedIds.includes(b.id)}/>):<p role="status">এই নির্বাচন অনুযায়ী কোনো প্রস্তুত ব্যাচ নেই। কোনো প্রশ্ন সেভ বা তৈরি হয়নি।</p>)}
  <details><summary className="cursor-pointer font-semibold">সব প্রস্তুত ব্যাচ ({batches.length})</summary>{batches.map(b=><button key={b.id} type="button" className="my-2 block text-left text-indigo-800 underline" onClick={()=>{setCategory(b.category);setSubject(b.subject);setTopic(b.topic);}}>{b.category} → {b.subject} → {b.topic} · {b.title}</button>)}</details>
 </section>;
}
