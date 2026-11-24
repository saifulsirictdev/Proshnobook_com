"use client";
import PreparationPopup from "./preparation-popup";
import { englishPreparationMessage } from "@/lib/english/preparation-message";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { prepareEnglishFullModel } from "@/app/actions/english-auto-model";
export default function EnglishAutoModel({ grade, paper = 1, itemIds }: { grade: number; paper?: 1 | 2; itemIds?: string[] }) {
  const router = useRouter();
  const [started, setStarted] = useState(true);
  const [busy, setBusy] = useState(true), [error, setError] = useState("");
  const [missing, setMissing] = useState<string[]>([]);
  const [sources, setSources] = useState<Record<string, { text: string; reference: string }>>({});
  // Strict-mode effect replay reuses the same request, not a second paid generation.
  const request = useRef<ReturnType<typeof prepareEnglishFullModel> | null>(null);
  const itemSignature = itemIds?.join(",") ?? "";
  function prepare() {
    return prepareEnglishFullModel({ grade, paper, sources, ...(itemSignature ? {itemIds:itemSignature.split(",")} : {}) });
  }
  function accept(result: Awaited<ReturnType<typeof prepareEnglishFullModel>>) {
    if (result.ok) { router.replace(`/question-builder/build?englishKey=${encodeURIComponent(result.key)}&stage=review`); return; }
    else { setError(englishPreparationMessage(result.error)); setMissing("missing" in result ? result.missing ?? [] : []); }
    setBusy(false);
  }
  useEffect(() => {
    let stopped = false;
    request.current ??= prepare();
    request.current.then(result => { if (!stopped) accept(result); }).catch(() => { if (!stopped) { setBusy(false); setError(paper === 1 ? "ফল নিশ্চিত হয়নি। আমার খসড়া দেখে আবার চেষ্টা করুন।" : "ফল এখনও নিশ্চিত হয়নি। প্রস্তুতি চলতে পারে—আবার তৈরির আগে আমার খসড়া দেখুন।"); } });
    return () => { stopped = true; };
  }, [grade, paper, itemSignature]); // This entry is keyed by grade and paper; no generation on render.
  async function retry() {
    if (busy) return;
    setStarted(true); setBusy(true); setError("");
    try { accept(await prepare()); }
    catch { setBusy(false); setError("ফল নিশ্চিত হয়নি। আমার draft দেখুন, তারপর আবার চেষ্টা করুন।"); }
  }
  return <main className="mx-auto max-w-3xl space-y-5 px-4 py-8">
    {busy && <PreparationPopup subject="English" stage={1} neutralBranding />}
    <h1 className="text-2xl font-bold">Class {grade} · English {paper === 2 ? "2nd" : "1st"} Paper — {itemIds ? "Question Items" : "Full Model Test"}</h1>
    <p>ডাটাবেজের উপযুক্ত অংশ আগে নেওয়া হবে; শুধু অনুপস্থিত অংশ সফটওয়্যার তৈরি করবে। নির্ভরযোগ্য textbook extract ছাড়া seen passage বানানো হবে না। প্রশ্ন ও উত্তর যাচাই করে তারপর Page Set-up করুন।</p>
    <p className="text-sm">বিদ্যমান class অনুযায়ী practice কাঠামো ব্যবহৃত হচ্ছে; বর্তমান সরকারি syllabus/মানবণ্টন মিলিয়ে নিন। {paper === 2 ? "প্রয়োজন হলে কিছুটা সময় লাগতে পারে। নতুন করে প্রস্তুতির চেষ্টা করলে প্রযোজ্য দৈনিক সীমা থেকে গণনা হতে পারে।" : "Seen ও Unseen passage-এর সঙ্গে সংশ্লিষ্ট প্রশ্ন একসঙ্গে থাকবে।"}</p>
    {busy && <p role="status">{paper === 1 ? "প্রশ্নগুলো নির্ধারিত ক্রমে সাজানো হচ্ছে…" : "সব অংশ স্বয়ংক্রিয়ভাবে নির্বাচন করে সম্পূর্ণ প্রশ্নপত্র প্রস্তুত করা হচ্ছে…"}</p>}
    {error && <p role="alert" className="rounded border border-amber-300 bg-amber-50 p-3">{error}</p>}
    {!busy && missing.map(key => <fieldset key={key} className="space-y-2 rounded border p-4">
      <legend>অনুপস্থিত textbook source: {key}</legend>
      <label className="block">Book / unit / title reference<input className="block w-full rounded border p-2" maxLength={500} value={sources[key]?.reference ?? ""} onChange={e => setSources(old => ({ ...old, [key]: { text: old[key]?.text ?? "", reference: e.target.value } }))}/></label>
      <label className="block">Exact textbook extract<textarea rows={6} className="block w-full rounded border p-2" maxLength={20000} value={sources[key]?.text ?? ""} onChange={e => setSources(old => ({ ...old, [key]: { reference: old[key]?.reference ?? "", text: e.target.value } }))}/></label>
    </fieldset>)}
    {!busy && <button className="rounded bg-emerald-700 px-4 py-3 text-white" onClick={retry}>{!started ? "প্রশ্নভান্ডার থেকে প্রশ্ন সাজান" : missing.length ? "Source দিয়ে পুরো প্রশ্নপত্র তৈরি করুন" : paper === 1 ? "আবার চেষ্টা করুন" : "আবার চেষ্টা করুন (দৈনিক সীমা প্রযোজ্য হতে পারে)"}</button>}
    <a className="block underline" href="/question-builder/english/saved">আমার draft / উদ্ধার করা অংশ দেখুন</a>
  </main>;
}
