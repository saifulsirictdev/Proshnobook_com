"use client";
import { useActionState } from "react";
import { importEnglishSources, type SourceImportState } from "./source-actions";
export default function SourceImport({ digest }: { digest: string }) {
  const [state, action, busy] = useActionState<SourceImportState, FormData>(importEnglishSources, {});
  return <form action={action} className="space-y-3 rounded border p-4">
    <input type="hidden" name="digest" value={digest} />
    <label className="flex gap-2"><input type="checkbox" name="reviewed" value="yes" required />৩০টি seen extract ও ৬টি poem-এর preview/source সীমাবদ্ধতা দেখেছি। শুধু Pending source হিসেবে সেভ করব; এটি শিক্ষক অনুমোদন নয়।</label>
    <button disabled={busy} className="rounded bg-indigo-700 px-4 py-2 text-white disabled:opacity-50">{busy ? "Import হচ্ছে…" : "৩৬টি source Pending হিসেবে import করুন"}</button>
    {state.error && <p role="alert">{state.error}</p>}
    {state.message && <p role="status">{state.message}</p>}
  </form>;
}
