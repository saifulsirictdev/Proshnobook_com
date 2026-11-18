"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { prepareEnglishFullModel } from "@/app/actions/english-auto-model";
export default function EnglishAutoModel({ grade }: { grade: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(true), [error, setError] = useState("");
  const [missing, setMissing] = useState<string[]>([]);
  const [sources, setSources] = useState<Record<string, { text: string; reference: string }>>({});
  // Strict-mode effect replay reuses the same request, not a second paid generation.
  const request = useRef<ReturnType<typeof prepareEnglishFullModel> | null>(null);
  function accept(result: Awaited<ReturnType<typeof prepareEnglishFullModel>>) {
    if (result.ok) router.replace(`/question-builder/build?englishKey=${encodeURIComponent(result.key)}&stage=review`);
    else { setError(result.error); setMissing("missing" in result ? result.missing ?? [] : []); }
    setBusy(false);
  }
  useEffect(() => {
    let stopped = false;
    request.current ??= prepareEnglishFullModel({ grade });
    request.current.then(result => { if (!stopped) accept(result); }).catch(() => { if (!stopped) { setBusy(false); setError("ফল নিশ্চিত হয়নি। আবার তৈরির আগে আমার draft দেখুন; generation চলতে পারে।"); } });
    return () => { stopped = true; };
  }, [grade]); // This entry is keyed by grade; no generation on render.
  async function retry() {
    if (busy) return;
    setBusy(true); setError("");
    try { accept(await prepareEnglishFullModel({ grade, sources })); }
    catch { setBusy(false); setError("ফল নিশ্চিত হয়নি। আমার draft দেখুন, তারপর আবার চেষ্টা করুন।"); }
  }
  return <main className="mx-auto max-w-3xl space-y-5 px-4 py-8">
    <h1 className="text-2xl font-bold">Class {grade} — Full Model Test প্রস্তুত হচ্ছে</h1>
    <p>ধাপ ১: প্রশ্নভান্ডার থেকে নির্বাচন / না-থাকলে AI → ধাপ ২: প্রশ্ন দেখুন ও বদলান → ধাপ ৩: Page Set-up।</p>
    <p className="text-sm">বিদ্যমান class অনুযায়ী practice কাঠামো ব্যবহৃত হচ্ছে; বর্তমান সরকারি syllabus/মানবণ্টন মিলিয়ে নিন। AI প্রয়োজন হলে বিদ্যমান generation quota প্রযোজ্য।</p>
    {busy && <p role="status">সব অংশ স্বয়ংক্রিয়ভাবে নির্বাচন করে সম্পূর্ণ প্রশ্নপত্র প্রস্তুত করা হচ্ছে। এই পেজ বন্ধ করবেন না…</p>}
    {error && <p role="alert" className="rounded border border-amber-300 bg-amber-50 p-3">{error}</p>}
    {!busy && missing.map(key => <fieldset key={key} className="space-y-2 rounded border p-4">
      <legend>অনুপস্থিত textbook source: {key}</legend>
      <label className="block">Book / unit / title reference<input className="block w-full rounded border p-2" maxLength={500} value={sources[key]?.reference ?? ""} onChange={e => setSources(old => ({ ...old, [key]: { text: old[key]?.text ?? "", reference: e.target.value } }))}/></label>
      <label className="block">Exact textbook extract<textarea rows={6} className="block w-full rounded border p-2" maxLength={20000} value={sources[key]?.text ?? ""} onChange={e => setSources(old => ({ ...old, [key]: { reference: old[key]?.reference ?? "", text: e.target.value } }))}/></label>
    </fieldset>)}
    {!busy && <button className="rounded bg-emerald-700 px-4 py-3 text-white" onClick={retry}>{missing.length ? "Source দিয়ে পুরো প্রশ্নপত্র তৈরি করুন" : "আবার চেষ্টা করুন (AI quota প্রযোজ্য হতে পারে)"}</button>}
    <a className="block underline" href="/question-builder/english/saved">আমার draft / উদ্ধার করা অংশ দেখুন</a>
  </main>;
}
