"use client";
import {useActionState} from "react";
import {previewWritten,saveWritten,type WrittenState} from "./written-actions";
export default function WrittenForm(){
 const [preview,inspect,checking]=useActionState(previewWritten,{} as WrittenState);
 const [saved,save,saving]=useActionState(saveWritten,{} as WrittenState);
 return <section className="space-y-4 rounded-2xl border bg-white p-6 text-slate-900">
  <h2 className="text-xl font-bold">গণিত অধ্যায় ১ — ৩০ CQ ও ৩০ SQ</h2>
  <p>নিজস্ব Draft। CQ: ক–খ–গ, নম্বর ২–৪–৪। ছয় ধরনের সমস্যার পাঁচটি করে উদাহরণ। অধ্যায়ের ১–৩৭ পৃষ্ঠা দেখে ধারণাগত মিল ও গাণিতিক হিসাব পরীক্ষা হয়েছে; স্বাধীন বিষয়-শিক্ষক অনুমোদন ও পূর্ণ বিষয়সীমার পর্যাপ্ত প্রশ্ন এখনো বাকি। সংরক্ষণ মানে প্রকাশ নয়।</p>
  <form action={inspect}><button disabled={checking||saving} className="rounded-xl bg-indigo-700 px-5 py-3 text-white disabled:opacity-50">CQ/SQ প্রিভিউ করুন</button></form>
  {preview.error&&<p role="alert">{preview.error}</p>}
  {preview.preview&&<><p>{preview.preview.length}টি সম্পূর্ণ প্রশ্ন</p><ol className="max-h-96 space-y-4 overflow-auto">{preview.preview.map((q,i)=><li key={i}><strong>{i+1}. {q.kind}: {q.text}</strong><pre className="whitespace-pre-wrap">{JSON.stringify(q.options,null,2)}</pre><p className="whitespace-pre-wrap">সমাধান: {q.explanation}</p></li>)}</ol>
  <form action={save} className="space-y-3"><input type="hidden" name="digest" value={preview.digest}/><label className="flex gap-3"><input required type="checkbox" name="reviewed" value="yes"/>সীমাবদ্ধতা পড়েছি; শুধু Pending হিসেবে রাখছি। প্রকাশের আগে বিষয়ভিত্তিক যাচাই প্রয়োজন।</label><button disabled={saving||checking} className="rounded-xl bg-emerald-800 px-5 py-3 text-white disabled:opacity-50">CQ/SQ Pending হিসেবে সেভ করুন</button></form></>}
  {saved.error&&<p role="alert">{saved.error}</p>}{saved.message&&<p role="status">{saved.message}</p>}
 </section>;
}
