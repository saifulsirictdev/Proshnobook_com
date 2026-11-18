"use client";
import EnglishBoardYear from "./english-board-year";
import PreparationPopup from "./preparation-popup";
import { prepareEnglishBankModel } from "@/app/actions/english-bank-model";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { prepareEnglishFullModel } from "@/app/actions/english-auto-model";
export default function EnglishAutoModel({ grade, paper = 1, itemIds }: { grade: number; paper?: 1 | 2; itemIds?: string[] }) {
  const router = useRouter();
  const isSSC = paper === 1 && (grade === 9 || grade === 10);
  const [examYear, setExamYear] = useState("");
  const [started, setStarted] = useState(!isSSC);
  const [busy, setBusy] = useState(!isSSC), [error, setError] = useState("");
  const [missing, setMissing] = useState<string[]>([]);
  const [sources, setSources] = useState<Record<string, { text: string; reference: string }>>({});
  // Strict-mode effect replay reuses the same request, not a second paid generation.
  const request = useRef<ReturnType<typeof prepareEnglishFullModel> | null>(null);
  const itemSignature = itemIds?.join(",") ?? "";
  function prepare() {
    return paper === 1 ? prepareEnglishBankModel(grade, itemSignature ? itemSignature.split(",") : undefined, examYear ? { examYear: Number(examYear) } : {}) : prepareEnglishFullModel({ grade, paper, sources });
  }
  function accept(result: Awaited<ReturnType<typeof prepareEnglishFullModel>>) {
    if (result.ok) { router.replace(`/question-builder/build?englishKey=${encodeURIComponent(result.key)}${paper === 2 ? "&stage=review" : "&stage=setup"}`); return; }
    else { setError(result.error); setMissing("missing" in result ? result.missing ?? [] : []); }
    setBusy(false);
  }
  useEffect(() => {
    if (isSSC) return;
    let stopped = false;
    request.current ??= prepare();
    request.current.then(result => { if (!stopped) accept(result); }).catch(() => { if (!stopped) { setBusy(false); setError(paper === 1 ? "ফল নিশ্চিত হয়নি। আমার draft দেখে database থেকে আবার চেষ্টা করুন। AI চালানো হয়নি।" : "ফল নিশ্চিত হয়নি। আবার তৈরির আগে আমার draft দেখুন; generation চলতে পারে।"); } });
    return () => { stopped = true; };
  }, [grade, paper, itemSignature]); // This entry is keyed by grade and paper; no generation on render.
  async function retry() {
    if (busy) return;
    setStarted(true); setBusy(true); setError("");
    try { accept(await prepare()); }
    catch { setBusy(false); setError("ফল নিশ্চিত হয়নি। আমার draft দেখুন, তারপর আবার চেষ্টা করুন।"); }
  }
  return <main className="mx-auto max-w-3xl space-y-5 px-4 py-8">
    {busy && <PreparationPopup subject="English" stage={1} databaseOnly={paper === 1} />}
    <h1 className="text-2xl font-bold">Class {grade} · English {paper === 2 ? "2nd" : "1st"} Paper — {itemIds ? "Question Items" : "Full Model Test"}</h1>
    <p>{paper === 1 ? "প্রশ্নভান্ডার থেকে মানবণ্টনের ক্রমে প্রশ্ন সাজানো হবে। এরপর প্রশ্ন দেখুন ও সম্পাদনা করে Page Set-up করুন।" : "ধাপ ১: প্রশ্নভান্ডার / না-থাকলে AI → ধাপ ২: প্রশ্ন দেখুন ও বদলান → ধাপ ৩: Page Set-up।"}</p>
    <p className="text-sm">বিদ্যমান class অনুযায়ী practice কাঠামো ব্যবহৃত হচ্ছে; বর্তমান সরকারি syllabus/মানবণ্টন মিলিয়ে নিন। {paper === 2 ? "AI প্রয়োজন হলে বিদ্যমান generation quota প্রযোজ্য।" : "Seen ও Unseen passage-এর সঙ্গে সংশ্লিষ্ট প্রশ্ন একসঙ্গে থাকবে।"}</p>
    {isSSC && <EnglishBoardYear value={examYear} onChange={setExamYear} disabled={busy} />}
    {busy && <p role="status">{paper === 1 ? "প্রশ্নগুলো নির্ধারিত ক্রমে সাজানো হচ্ছে…" : "সব অংশ স্বয়ংক্রিয়ভাবে নির্বাচন করে সম্পূর্ণ প্রশ্নপত্র প্রস্তুত করা হচ্ছে…"}</p>}
    {error && <p role="alert" className="rounded border border-amber-300 bg-amber-50 p-3">{error}</p>}
    {!busy && missing.map(key => <fieldset key={key} className="space-y-2 rounded border p-4">
      <legend>অনুপস্থিত textbook source: {key}</legend>
      <label className="block">Book / unit / title reference<input className="block w-full rounded border p-2" maxLength={500} value={sources[key]?.reference ?? ""} onChange={e => setSources(old => ({ ...old, [key]: { text: old[key]?.text ?? "", reference: e.target.value } }))}/></label>
      <label className="block">Exact textbook extract<textarea rows={6} className="block w-full rounded border p-2" maxLength={20000} value={sources[key]?.text ?? ""} onChange={e => setSources(old => ({ ...old, [key]: { reference: old[key]?.reference ?? "", text: e.target.value } }))}/></label>
    </fieldset>)}
    {!busy && <button className="rounded bg-emerald-700 px-4 py-3 text-white" onClick={retry}>{!started ? "প্রশ্নভান্ডার থেকে প্রশ্ন সাজান" : missing.length ? "Source দিয়ে পুরো প্রশ্নপত্র তৈরি করুন" : paper === 1 ? "আবার চেষ্টা করুন" : "আবার চেষ্টা করুন (AI quota প্রযোজ্য হতে পারে)"}</button>}
    <a className="block underline" href="/question-builder/english/saved">আমার draft / উদ্ধার করা অংশ দেখুন</a>
  </main>;
}
