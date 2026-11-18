"use client";
import { useActionState } from "react";
import { importCompleteEnglishModel } from "./complete-model-actions";
export default function CompleteModelImport({ digest }: { digest: string }) {
  const [state, action, busy] = useActionState<{message?: string; error?: string}, FormData>(importCompleteEnglishModel, {});
  return <form action={action} className="space-y-3">
    <input type="hidden" name="digest" value={digest} />
    <label className="flex gap-2"><input required type="checkbox" name="reviewed" value="yes" />পূর্ণ প্রশ্ন–উত্তর ও সীমাবদ্ধতা দেখেছি; Pending import শিক্ষক অনুমোদন নয়।</label>
    <button disabled={busy} className="rounded bg-emerald-700 px-4 py-2 text-white">{busy ? "Import হচ্ছে…" : "সম্পূর্ণ প্রশ্ন–উত্তর মডেল Pending import করুন"}</button>
    {state.error && <p role="alert">{state.error}</p>}{state.message && <p role="status">{state.message}</p>}
  </form>;
}
