import { preparedEnglishItems, englishItemsDigest } from "@/lib/english/prepared-items";
import { englishAdminHref } from "@/lib/english/admin-scope";
import type { EnglishGrade } from "@/lib/english/blueprints";
import { createHash } from "node:crypto";
import EnglishBulkApproval from "./english-bulk-approval";
import Link from "next/link";
import { db } from "@/lib/db";
import { staff } from "@/lib/guard";
import { importEnglishItems } from "../english-review/item-actions";
import { assembleEnglishItems } from "@/lib/english/item-bank";
import { loadEnglishStock } from "@/lib/english/stock";
import { englishBlueprint } from "@/lib/english/blueprints";
import { validateEnglishDraft } from "@/lib/english/draft";
import { decideEnglishRecovery, reopenEnglishReview } from "../english-review/actions";
import { saveEnglishQuestionItem } from "./import/english-items-actions";

export default async function EnglishQuestionItems({review = false, status = "all", grade = 6}:{review?:boolean;status?:string;grade?:EnglishGrade}) {
  await staff();
  const prepared = preparedEnglishItems(grade);
  const rows: {key:string;value:string}[] = await db.setting.findMany({where:{OR:[{key:{startsWith:"english-item:v1:"}},{key:{startsWith:"english-review:"}}]},orderBy:{key:"asc"}});
  const invalid = rows.flatMap(row => {try {const record = JSON.parse(row.value);validateEnglishDraft(record.draft);return [];}catch{return [row.key];}});
  const stored = new Map(rows.map(r => [r.key,r.value]));
  const stock = await loadEnglishStock(grade, (prefix, cursor) => db.setting.findMany({where:{key:{startsWith:prefix,...(cursor?{gt:cursor}:{})}},orderBy:{key:"asc"},take:100}));
  const readiness = assembleEnglishItems(stock,grade,()=>0);
  const blueprint = englishBlueprint(grade,1);
  const missing = readiness.missing.map(id => blueprint.items.find(i => i.id===id)?.title ?? id);
  const cards = review ? rows.map(row => {try {const record=JSON.parse(row.value);return {key:row.key,draft:validateEnglishDraft(record.draft),record};}catch{return null;}}).filter(c => c !== null && c.draft.selection.grade===grade && c.draft.selection.paper===1 && (status==="all" || c.record.status===status.toUpperCase())) : prepared.map(p => ({...p,record:(()=>{try{return JSON.parse(stored.get(p.key)??"null");}catch{return {status:"INVALID — পুনরায় review প্রয়োজন"};}})()}));
  return <section id="english-question-items" className="space-y-4 rounded-xl border bg-white p-4">
    <h2 className="text-xl font-bold">Class {grade} · English 1st Paper — Question Item</h2>
    <p role="status" className="rounded border p-3">{readiness.draft ? "পূর্ণ মডেল তৈরির সব প্রয়োজনীয় অনুমোদিত item পাওয়া গেছে।" : `পূর্ণ মডেলে ঘাটতি: ${missing.join(" · ")}`} একই যাচাই ইউজারের মডেল তৈরিতেও ব্যবহৃত হয়।</p>
    {invalid.length>0 && <p role="alert">{invalid.length}টি সংরক্ষিত record-এর প্রশ্ন–উত্তরের গঠন যাচাই হয়নি; Approved লেখা থাকলেও মডেলে ব্যবহার করা হবে না। Record: {invalid.join(", ")}</p>}
    <ol className="list-inside list-decimal">{blueprint.items.map(item=><li key={item.id}>{item.title} — {item.marks} নম্বর</li>)}</ol>
    <p>অধ্যায়ের সাধারণ প্রশ্নে Approved লেখা থাকলেই পূর্ণ মডেলের সব passage, item ও answer key প্রস্তুত হয় না। এখানে passage-সংযুক্ত প্রশ্নসেট review করুন; শুধু passage/source-এর অনুমোদন প্রশ্নসেটের অনুমোদন নয়।</p>
    <Link className="qm-action-link block" href={englishAdminHref(grade,review)}>{review?"একই import পেজে প্রস্তুত প্রশ্ন preview / Pending করুন →":"পাঠানো প্রশ্ন review / অনুমোদন করুন →"}</Link>
    {!review && !prepared.length && <p role="status">এই শ্রেণির সব item-এর প্রস্তুত প্রশ্ন–উত্তর এখনও যুক্ত হয়নি। নিচের মানবণ্টন অনুযায়ী নিজস্ব বইয়ের উৎস যাচাই করে কনটেন্ট প্রস্তুত করতে হবে; অন্য শ্রেণির প্রশ্ন ব্যবহার করা হবে না।</p>}
    {!review && prepared.length>0 && <form action={importEnglishItems} className="space-y-2 rounded border p-3">
      <input type="hidden" name="grade" value={grade}/><input type="hidden" name="digest" value={englishItemsDigest(grade)}/>
      <label className="block"><input required type="checkbox" name="reviewed" value="yes"/> নিচের সব item-এর passage, প্রশ্ন–উত্তর ও সীমাবদ্ধতা preview করেছি।</label>
      <button className="rounded bg-emerald-700 px-3 py-2 text-white">সব প্রস্তুত Question Item Pending-এ সেভ করুন</button>
      <p>{prepared.length}টি স্বতন্ত্র group; বর্তমান সংরক্ষিত item/model: {rows.length}টি। আগের approval/rejection অক্ষত থাকবে।</p>
      <Link className="qm-action-link block" href={englishAdminHref(grade)}>পাঠানো প্রশ্ন review / অনুমোদন করুন →</Link>
    </form>}
    {review && <EnglishBulkApproval grade={grade} entries={cards.flatMap(card => card?.record?.status === "PENDING" ? [{key:card.key,digest:createHash("sha256").update(stored.get(card.key)!).digest("hex")}] : [])} />}
    {!cards.length && <p>এই অবস্থায় কোনো সংরক্ষিত item নেই। Import পেজ থেকে preview করে Pending করুন।</p>}
    <p>Seen/Unseen নিজ নিজ প্রশ্ন–উত্তরসহ অক্ষত। প্রতিটি শ্রেণির নিজস্ব কনটেন্ট ব্যবহৃত হবে; শিক্ষকের পূর্ণ পর্যালোচনা ও বর্তমান মানবণ্টন মিলিয়ে নেওয়া প্রয়োজন।</p>
    {cards.map(card => card && <details key={card.key} className="space-y-3 rounded border p-3">
      <summary className="cursor-pointer font-semibold">{card.draft.output.tasks.map(t => blueprint.items.find(i => i.id===t.id)?.title ?? t.id).join(" / ")} — {card.record?.status ?? "NOT IMPORTED"}</summary>
      {card.draft.output.passages.map(p => <div key={p.key}><h3 className="font-bold">{p.key}</h3><p className="whitespace-pre-wrap">{p.text}</p><p>{card.draft.selection.sources[p.key]?.reference}</p></div>)}
      {card.draft.output.tasks.map(t => <section key={t.id}><h3 className="font-bold">{blueprint.items.find(i => i.id===t.id)?.title}</h3><pre className="whitespace-pre-wrap break-words text-sm">{JSON.stringify(t,null,2)}</pre></section>)}
      {!review && !prepared.length && <p role="status">এই শ্রেণির সব item-এর প্রস্তুত প্রশ্ন–উত্তর এখনও যুক্ত হয়নি। নিচের মানবণ্টন অনুযায়ী নিজস্ব বইয়ের উৎস যাচাই করে কনটেন্ট প্রস্তুত করতে হবে; অন্য শ্রেণির প্রশ্ন ব্যবহার করা হবে না।</p>}
    {!review && prepared.length>0 && <form action={saveEnglishQuestionItem} className="space-y-2"><input type="hidden" name="grade" value={grade}/><input type="hidden" name="key" value={card.key}/><label className="block"><input required type="checkbox" name="reviewed" value="yes"/> প্রশ্ন–উত্তর ও সীমাবদ্ধতা পড়েছি; শুধু Pending import করব।</label><button className="rounded bg-emerald-700 px-3 py-2 text-white">Pending হিসেবে সেভ / বর্তমান অবস্থা যাচাই</button><p>আগে সেভ থাকলে duplicate হবে না; আগের approval বদলাবে না।</p><Link className="qm-action-link block" href={englishAdminHref(grade)}>পাঠানো প্রশ্ন অনুমোদন করুন →</Link></form>}
      {review && card.record?.status==="PENDING" && <form action={decideEnglishRecovery} className="flex gap-3"><input type="hidden" name="grade" value={grade}/><input type="hidden" name="key" value={card.key}/><button name="status" value="APPROVED" className="rounded bg-emerald-700 p-2 text-white">অনুমোদন</button><button name="status" value="REJECTED" className="rounded border p-2">বাতিল</button></form>}
      {review && ["APPROVED","REJECTED"].includes(card.record?.status) && <form action={reopenEnglishReview} className="space-y-2"><input type="hidden" name="grade" value={grade}/><input type="hidden" name="key" value={card.key}/><label className="block"><input required type="checkbox" name="confirmed" value="yes"/> আবার Pending review-তে পাঠাতে চাই।</label><button className="rounded border p-2">আবার review / অনুমোদনের জন্য পাঠান</button></form>}
    </details>)}
  </section>;
}
