"use client";
import { useActionState, useState } from "react";
import { inspectBatch, saveBatch, type ImportState } from "./actions";
export default function ImportForm({ topics, preparedBatch }: { topics: { subject: string; topic: string }[]; preparedBatch?: string }) {
  const [raw, setRaw] = useState("");
  const [preview, inspect, inspecting] = useActionState(inspectBatch, {} as ImportState);
  const [saved, save, saving] = useActionState(saveBatch, {} as ImportState);
  const [inspectedRaw, setInspectedRaw] = useState("");
  return <section className="space-y-5 rounded-2xl border bg-white p-6 text-slate-900">
    {preparedBatch && <aside className="space-y-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
      <h2 className="text-xl font-bold">প্রস্তুত ব্যাচ: গণিত — স্বাভাবিক সংখ্যা ও ভগ্নাংশ</h2>
      <p>১০০টি নিজস্ব অনুশীলনী, ২৫ ধরনের দক্ষতা। গাণিতিক হিসাব পরীক্ষা হয়েছে; মূল বইয়ের পৃষ্ঠা, পূর্ণ বিষয়সীমা ও শিক্ষক-পর্যালোচনা বাকি। এটি অফিসিয়াল NCTB প্রশ্ন নয়। লোড করলে কোনো প্রশ্ন ডাটাবেজে সেভ বা প্রকাশ হবে না।</p>
      <button type="button" disabled={inspecting || saving} onClick={() => {
        if (raw && raw !== preparedBatch && !window.confirm("বর্তমান JSON-এর বদলে প্রস্তুত ব্যাচ লোড করবেন?")) return;
        setRaw(preparedBatch); setInspectedRaw("");
      }} className="rounded-xl bg-indigo-700 px-5 py-3 font-semibold text-white disabled:opacity-50">প্রস্তুত ১০০টি প্রশ্ন লোড করুন</button>
    </aside>}
    <h2 className="text-xl font-bold">১. উৎসসহ JSON ব্যাচ যাচাই করুন</h2>
    <p>১–১০০টি প্রশ্ন। প্রিভিউ কেবল গঠন পরীক্ষা করে, উত্তর সঠিক প্রমাণ করে না। বইয়ের পৃষ্ঠা ও উত্তর নিজে মিলিয়ে নিন।</p>
    <details><summary className="cursor-pointer font-semibold">JSON format ও বিষয়/অধ্যায় দেখুন</summary>
      <pre className="my-3 overflow-auto rounded bg-slate-100 p-3 text-xs">{JSON.stringify({ subject: topics[0]?.subject, topic: topics[0]?.topic, book: "বইয়ের প্রকৃত নাম", edition: "2026", sourceUrl: "https://nctb.gov.bd/", lang: "Bangla", items: [{ text: "প্রশ্ন", options: { A: "প্রথম", B: "দ্বিতীয়", C: "তৃতীয়", D: "চতুর্থ" }, correct: "A", explanation: "উৎসভিত্তিক ব্যাখ্যা", page: "12", difficulty: "EASY" }] }, null, 2)}</pre>
      <p>নমুনাটি আসল প্রশ্ন নয়। নিচের অগ্রগতি তালিকা থেকে বিষয় ও অধ্যায়ের হুবহু নাম নিন।</p>
    </details>
    <form action={inspect} onSubmit={() => setInspectedRaw(raw)} className="space-y-3">
      <label htmlFor="mcq-batch" className="block font-semibold">প্রশ্নের JSON</label>
      <textarea id="mcq-batch" name="batch" required rows={14} value={raw} onChange={e => { setRaw(e.target.value); setInspectedRaw(""); }} className="w-full rounded-xl border p-3 font-mono text-sm" />
      <button disabled={inspecting || saving} className="rounded-xl bg-indigo-700 px-5 py-3 font-semibold text-white disabled:opacity-50">{inspecting ? "যাচাই হচ্ছে…" : "প্রিভিউ ও গঠন যাচাই"}</button>
    </form>
    {preview.error && <p role="alert">{preview.error}</p>}
    {preview.preview && inspectedRaw === raw && <>
      <h2 className="text-xl font-bold">২. প্রশ্ন, উত্তর ও উৎস মিলিয়ে দেখুন</h2>
      <ol className="max-h-96 list-decimal space-y-4 overflow-auto pl-6">{preview.preview.map((q, i) => <li key={i}><p className="whitespace-pre-wrap font-semibold">{q.text}</p><ul>{Object.entries(q.options).map(([key, value]) => <li key={key}>{key}. {value}</li>)}</ul><p>উত্তর: {q.answer}</p><p className="whitespace-pre-wrap">{q.explanation}</p><p>পৃষ্ঠা: {q.page}</p></li>)}</ol>
      <form action={save} className="space-y-4">
        <input type="hidden" name="batch" value={raw} /><input type="hidden" name="digest" value={preview.digest} />
        <label className="flex items-start gap-3"><input type="checkbox" name="reviewed" value="yes" required /> উৎসের বিবরণ ও যাচাইয়ের সীমাবদ্ধতা পড়েছি। শুধু Pending হিসেবে সংরক্ষণ করছি; প্রকাশের আগে বিষয়সীমা, পৃষ্ঠা, অপশন ও উত্তর আলাদাভাবে যাচাই করব।</label>
        <button disabled={saving || inspecting} className="rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white disabled:opacity-50">{saving ? "সেভ হচ্ছে…" : "Pending হিসেবে সেভ করুন"}</button>
      </form>
    </>}
    {saved.error && <p role="alert">{saved.error}</p>}{saved.message && <p role="status">{saved.message}</p>}
  </section>;
}
