"use client";
import { useActionState } from "react";
import { importCompleteEnglishModel } from "./complete-model-actions";
export default function CompleteModelImport({ digest, scope }: { digest: string; scope?: "library" }) {
  const [state, action, busy] = useActionState<{message?: string; error?: string}, FormData>(importCompleteEnglishModel, {});
  return <form action={action} className="space-y-3">
    <input type="hidden" name="digest" value={digest} />
    {scope && <input type="hidden" name="scope" value={scope} />}
    <label className="flex gap-2"><input required type="checkbox" name="reviewed" value="yes" />পূর্ণ প্রশ্ন–উত্তর ও সীমাবদ্ধতা দেখেছি; Pending import শিক্ষক অনুমোদন নয়।</label>
    <button disabled={busy} className="rounded bg-emerald-700 px-4 py-2 text-white">{busy ? "Import হচ্ছে…" : scope ? "৩১টি পূর্ণ মডেল Pending import করুন" : "সম্পূর্ণ প্রশ্ন–উত্তর মডেল Pending import করুন"}</button>
    <a href="#english-model-reviews" className="block w-fit rounded border border-indigo-700 px-4 py-2 text-indigo-900">পাঠানো পূর্ণ মডেল review / অনুমোদন করুন ↓</a>
    {state.error && <p role="alert">{state.error}</p>}{state.message && <p role="status">{state.message}</p>}
  </form>;
}
