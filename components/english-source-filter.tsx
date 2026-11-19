"use client";
import { useEffect, useState } from "react";
import { listEnglishBankSchools } from "@/app/actions/english-bank-model";

export default function EnglishSourceFilter({ grade, school, onSchoolChange, disabled = false }: {
  grade: number; school: string;
  onSchoolChange: (school: string) => void; disabled?: boolean;
}) {
  const [schools, setSchools] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setSchools([]); setLoading(true); setError("");
    listEnglishBankSchools(grade).then(result => {
      if (!cancelled) { setSchools(result.schools); setError(result.error); }
    }).catch(() => { if (!cancelled) setError("স্কুলের তালিকা আনা যায়নি। আবার চেষ্টা করুন।"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [grade, attempt]);
  return <fieldset className="space-y-3 rounded border p-3">
    <legend>অনুমোদিত প্রশ্নের উৎস</legend>
    <label className="block space-y-1">
      <span>স্কুলের নাম (ঐচ্ছিক)</span>
      <select value={school} disabled={disabled || loading} onChange={e => {
        onSchoolChange(e.target.value);
      }} className="block w-full rounded border border-slate-300 bg-white p-2 text-slate-900">
        <option value="">{loading ? "অনুমোদিত স্কুল খোঁজা হচ্ছে…" : "স্কুল দিয়ে সীমাবদ্ধ নয়"}</option>
        {schools.map(name => <option key={name} value={name}>{name}</option>)}
      </select>
    </label>
    {!loading && !error && !schools.length && <p role="status" className="text-sm">এই শ্রেণিতে এখনো পুনর্ব্যবহারযোগ্য অনুমোদিত স্কুলের প্রশ্ন নেই। Review/Pending সেট এখানে দেখানো হয় না।</p>}
    {error && <p role="alert" className="text-sm">{error} <button type="button" className="underline" disabled={disabled || loading} onClick={() => setAttempt(n => n + 1)}>আবার তালিকা আনুন</button></p>}
    <p className="text-sm">স্কুল বাছলে শুধু সেই স্কুলের অনুমোদিত প্রশ্ন নেওয়া হবে; না থাকলে বোর্ড, অন্য স্কুল বা নিজস্ব অনুশীলন দিয়ে পূরণ হবে না। সাল দিয়ে খোঁজা আপাতত বন্ধ; স্কুল না বাছলে সব সালের অনুমোদিত উৎস ব্যবহার করা হবে।</p>
  </fieldset>;
}
