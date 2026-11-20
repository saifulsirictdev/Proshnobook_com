"use client";
import { useActionState } from "react";
import { approveEnglishPendingBatch } from "../english-review/actions";
export default function EnglishBulkApproval({entries,grade=6,paper=1}:{grade?:number;paper?:1|2;entries:{key:string;digest:string}[]}) {
  const [state, action, busy] = useActionState(approveEnglishPendingBatch, {});
  return <form action={action} className="space-y-3 rounded-xl border border-emerald-300 p-4">
    <input type="hidden" name="grade" value={grade}/><input type="hidden" name="paper" value={paper}/><input type="hidden" name="entries" value={JSON.stringify(entries)}/>
    <p>এই তালিকার {entries.length}টি Pending প্রশ্নসেট একসঙ্গে অনুমোদন করুন। প্রতিটি সেটে passage-সংযুক্ত একাধিক প্রশ্ন থাকতে পারে।</p>
    <label className="block"><input required type="checkbox" name="reviewed" value="yes" disabled={busy}/> নিচের সব Pending সেটের passage, প্রশ্ন–উত্তর ও সীমাবদ্ধতা পর্যালোচনা করেছি; একসঙ্গে অনুমোদন দিতে চাই।</label>
    <button disabled={busy || !entries.length} className="rounded bg-emerald-700 px-4 py-3 text-white disabled:opacity-50">{busy ? "অনুমোদন হচ্ছে…" : `সব ${entries.length}টি Pending প্রশ্নসেট একসঙ্গে অনুমোদন করুন`}</button>
    {state.error && <p role="alert">{state.error}</p>}
    {state.message && <p role="status">{state.message}</p>}
  </form>;
}
