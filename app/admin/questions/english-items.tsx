import { preparedSSCWritingEntries } from "@/lib/english/prepared-ssc-writing";
import { preparedSSCLinkingEntries } from "@/lib/english/prepared-ssc-linking";
import { preparedSSCGrammarEntries } from "@/lib/english/prepared-ssc-grammar";
import verbs from "@/lib/english/data/ssc-paper2-verbs-review.json";
import substitution from "@/lib/english/data/ssc-paper2-substitution-review.json";
import gapClues from "@/lib/english/data/ssc-paper2-gap-clues-review.json";
import { preparedEnglishItems, englishItemsDigest } from "@/lib/english/prepared-items";
import { englishAdminHref } from "@/lib/english/admin-scope";
import type { EnglishGrade, EnglishPaper } from "@/lib/english/blueprints";
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

export default async function EnglishQuestionItems({review = false, status = "all", grade = 6, paper = 1}:{review?:boolean;status?:string;grade?:EnglishGrade;paper?:EnglishPaper}) {
  await staff();
  const prepared = preparedEnglishItems(grade,paper);
  const rows: {key:string;value:string}[] = await db.setting.findMany({where:{OR:[{key:{startsWith:"english-item:v1:"}},{key:{startsWith:"english-review:"}}]},orderBy:{key:"asc"}});
  const invalid = rows.flatMap(row => {try {const record = JSON.parse(row.value);validateEnglishDraft(record.draft);return [];}catch{return [row.key];}});
  const paper2Entries = [...gapClues.items, ...substitution.items, ...verbs.items, ...preparedSSCGrammarEntries, ...preparedSSCLinkingEntries, ...preparedSSCWritingEntries];
  const stored = new Map(rows.map(r => [r.key,r.value]));
  const stock = await loadEnglishStock(grade, (prefix, cursor) => db.setting.findMany({where:{key:{startsWith:prefix,...(cursor?{gt:cursor}:{})}},orderBy:{key:"asc"},take:100}), paper);
  const readiness = assembleEnglishItems(stock,grade,()=>0,undefined,{},paper);
  const blueprint = englishBlueprint(grade,paper);
  const missing = readiness.missing.map(id => blueprint.items.find(i => i.id===id)?.title ?? id);
  const cards = review ? rows.map(row => {try {const record=JSON.parse(row.value);return {key:row.key,draft:validateEnglishDraft(record.draft),record};}catch{return null;}}).filter(c => c !== null && c.draft.selection.grade===grade && c.draft.selection.paper===paper && (status==="all" || c.record.status===status.toUpperCase())) : prepared.map(p => ({...p,record:(()=>{try{return JSON.parse(stored.get(p.key)??"null");}catch{return {status:"INVALID — পুনরায় review প্রয়োজন"};}})()}));
  return <section id="english-question-items" className="space-y-4 rounded-xl border bg-white p-4">
    <h2 className="text-xl font-bold">Class {grade} · English {paper===1?"1st":"2nd"} Paper — Question Item</h2>
    <p role="status" className="rounded border p-3">{readiness.draft ? "পূর্ণ মডেল তৈরির সব প্রয়োজনীয় অনুমোদিত item পাওয়া গেছে।" : `পূর্ণ মডেলে ঘাটতি: ${missing.join(" · ")}`} একই যাচাই ইউজারের মডেল তৈরিতেও ব্যবহৃত হয়।</p>
    {invalid.length>0 && <p role="alert">{invalid.length}টি সংরক্ষিত record-এর প্রশ্ন–উত্তরের গঠন যাচাই হয়নি; Approved লেখা থাকলেও মডেলে ব্যবহার করা হবে না। Record: {invalid.join(", ")}</p>}
    <ol className="list-inside list-decimal">{blueprint.items.map(item=><li key={item.id}>{item.title} — {item.marks} নম্বর</li>)}</ol>
    <p>অধ্যায়ের সাধারণ প্রশ্নে Approved লেখা থাকলেই পূর্ণ মডেলের সব passage, item ও answer key প্রস্তুত হয় না। এখানে passage-সংযুক্ত প্রশ্নসেট review করুন; শুধু passage/source-এর অনুমোদন প্রশ্নসেটের অনুমোদন নয়।</p>
    <Link className="qm-action-link block" href={englishAdminHref(grade,review,paper)}>{review?"একই import পেজে প্রস্তুত প্রশ্ন preview / Pending করুন →":"পাঠানো প্রশ্ন review / অনুমোদন করুন →"}</Link>
    {!review && !prepared.length && <p role="status">এই শ্রেণির সব item-এর প্রস্তুত প্রশ্ন–উত্তর এখনও যুক্ত হয়নি। নিচের মানবণ্টন অনুযায়ী নিজস্ব বইয়ের উৎস যাচাই করে কনটেন্ট প্রস্তুত করতে হবে; অন্য শ্রেণির প্রশ্ন ব্যবহার করা হবে না।</p>}
    {!review && prepared.length>0 && <form action={importEnglishItems} className="space-y-2 rounded border p-3">
      <input type="hidden" name="grade" value={grade}/><input type="hidden" name="paper" value={paper}/><input type="hidden" name="digest" value={englishItemsDigest(grade,paper)}/>
      <label className="block"><input required type="checkbox" name="reviewed" value="yes"/> নিচের সব item-এর passage, প্রশ্ন–উত্তর ও সীমাবদ্ধতা preview করেছি।</label>
      <button className="rounded bg-emerald-700 px-3 py-2 text-white">সব প্রস্তুত Question Item Pending-এ সেভ করুন</button>
      <p>{prepared.length}টি স্বতন্ত্র group; বর্তমান সংরক্ষিত item/model: {rows.length}টি। আগের approval/rejection অক্ষত থাকবে।</p>
      <Link className="qm-action-link block" href={englishAdminHref(grade,false,paper)}>পাঠানো প্রশ্ন review / অনুমোদন করুন →</Link>
    </form>}
    {!review && paper===2 && <div className="space-y-3">
      <h3 className="font-bold">একটি item-এর বড় ব্যাচ আলাদাভাবে Pending করুন</h3>
      {blueprint.items.map(item=>{
        const count = prepared.filter(p=>p.draft.selection.itemIds.includes(item.id)).length;
        return count > 0 ? <form key={item.id} action={importEnglishItems} className="space-y-2 rounded border p-3">
          <h4 className="font-semibold">{item.title} — {count}টি স্বতন্ত্র সেট</h4>
          <input type="hidden" name="grade" value={grade}/><input type="hidden" name="paper" value={paper}/>
          <input type="hidden" name="item" value={item.id}/><input type="hidden" name="digest" value={englishItemsDigest(grade,paper,item.id)}/>
          <label className="block"><input required type="checkbox" name="reviewed" value="yes"/> এই item-এর সব প্রশ্ন, উত্তর, উৎস ও সংশোধন preview করেছি; শুধু Pending import করব।</label>
          <button className="rounded bg-emerald-700 px-3 py-2 text-white">শুধু {item.title}: {count}টি সেট Pending করুন</button>
        </form> : null;
      })}
    </div>}
    {review && <EnglishBulkApproval grade={grade} paper={paper} entries={cards.flatMap(card => card?.record?.status === "PENDING" ? [{key:card.key,digest:createHash("sha256").update(stored.get(card.key)!).digest("hex")}] : [])} />}
    {!cards.length && <p>এই অবস্থায় কোনো সংরক্ষিত item নেই। Import পেজ থেকে preview করে Pending করুন।</p>}
    <p>Seen/Unseen নিজ নিজ প্রশ্ন–উত্তরসহ অক্ষত। প্রতিটি শ্রেণির নিজস্ব কনটেন্ট ব্যবহৃত হবে; শিক্ষকের পূর্ণ পর্যালোচনা ও বর্তমান মানবণ্টন মিলিয়ে নেওয়া প্রয়োজন।</p>
    {cards.map(card => card && <details key={card.key} className="space-y-3 rounded border p-3">
      <summary className="cursor-pointer font-semibold">{card.draft.name} · {card.draft.output.tasks.map(t => blueprint.items.find(i => i.id===t.id)?.title ?? t.id).join(" / ")} — {card.record?.status ?? "NOT IMPORTED"}</summary>
      {paper===2 && <p className="rounded border p-2">Assistant-prepared answers; teacher review required. {(card.record?.review?.editorialNotes ?? paper2Entries.find(e=>card.draft.name.startsWith(e.id))?.editorialNotes ?? []).join(" ")}</p>}
      {paper===2 && card.draft.output.tasks.some(t=>t.id==="substitution") && <details className="rounded border p-2">
        <summary>মূল টেবিলের transcription / সংশোধন মিলিয়ে দেখুন</summary>
        <p>প্রস্তুত practice-এ verb form বদলানো ও fragment পুনর্ব্যবহার অনুমোদিত; এটি মূল প্রশ্নের হুবহু অবিকৃত সংস্করণ নয়। বিকল্প শুদ্ধ বাক্য শিক্ষক গ্রহণ করতে পারেন।</p>
        <pre className="whitespace-pre-wrap break-words text-sm">{JSON.stringify(card.record?.review?.sourceRows ?? substitution.items.find(e=>card.draft.name.startsWith(e.id))?.sourceRows,null,2)}</pre>
      </details>}
      {paper===2 && card.draft.output.tasks.some(t=>t.id==="verbs") && <details className="rounded border p-2">
        <summary>মূল verb box / passage ও উত্তর যাচাইয়ের root দেখুন</summary>
        <p>উত্তরগুলো assistant-prepared; মূল ৫/১০ নম্বর ও বর্তমান ১০ নম্বরের practice আলাদা করে দেখুন। বিকল্প শুদ্ধ tense/form শিক্ষক গ্রহণ করতে পারেন।</p>
        <pre className="whitespace-pre-wrap break-words text-sm">{JSON.stringify(card.record?.review ?? verbs.items.find(e=>card.draft.name.startsWith(e.id)),null,2)}</pre>
      </details>}
      {paper===2 && card.draft.output.tasks.some(t=>["transformation","tags","affixes","prepositions","connectors","punctuation"].includes(t.id)) && <details className="rounded border p-2">
        <summary>মূল উৎস, উত্তর, adaptation ও সংশোধনের সম্পূর্ণ review snapshot</summary>
        <p>Source-backed adapted practice; official answer key নয়। Web practice-এ অজানা board/school/year বসানো হয়নি। মূল ১০/১৪-gap থেকে পাঁচটি রাখলে বাকি filled answers-ও মিলিয়ে দেখুন।</p>
        <pre className="whitespace-pre-wrap break-words text-sm">{JSON.stringify(card.record?.review ?? [...preparedSSCGrammarEntries, ...preparedSSCLinkingEntries].find(e=>card.draft.name.startsWith(e.id)),null,2)}</pre>
      </details>}
      {paper===2 && card.draft.output.tasks.some(t=>["paragraph","letter-email","composition"].includes(t.id)) && <details className="rounded border p-2">
        <summary>Writing: মূল prompt/topic, সম্পূর্ণ sample answer ও source snapshot</summary>
        <p>সম্ভাব্য নমুনা উত্তর; official key বা বাধ্যতামূলক মুখস্থ উত্তর নয়। Web index থেকে শুধু topic নেওয়া হয়েছে; prompt ও model এখানে লেখা। Fictional নাম/ঘটনা/contact details-কে বাস্তব পরীক্ষা বা প্রতিষ্ঠান-প্রদত্ত উত্তর মনে করবেন না।</p>
        <pre className="whitespace-pre-wrap break-words text-sm">{JSON.stringify(card.record?.review ?? preparedSSCWritingEntries.find(e=>card.draft.name.startsWith(e.id)),null,2)}</pre>
      </details>}
      {(card.record?.review ?? ("review" in card ? card.review : undefined)) && <details className="rounded border p-2">
        <summary>উৎস, editorial পরিবর্তন ও suggested answer-এর সীমাবদ্ধতা</summary>
        <p>প্রশ্ন–উত্তর ও উৎস একসঙ্গে যাচাই করুন। Practice model বা assistant-authored key-কে official circular, প্রতিষ্ঠান-প্রদত্ত প্রশ্ন বা স্বাধীন শিক্ষক-সনদ মনে করবেন না।</p>
        <pre className="whitespace-pre-wrap break-words text-sm">{JSON.stringify(card.record?.review ?? ("review" in card ? card.review : undefined),null,2)}</pre>
      </details>}
      {card.draft.output.passages.map(p => <div key={p.key}><h3 className="font-bold">{p.key}</h3><p className="whitespace-pre-wrap">{p.text}</p><p>{card.draft.selection.sources[p.key]?.reference}</p></div>)}
      {Object.entries(card.draft.selection.sources).filter(([, source]) => source.kind === "question-bank").map(([key, source]) => <section key={key} className="rounded border p-3">
        <h3 className="font-bold">উৎসের প্রশ্নের উদ্ধৃতি — মূল কবিতা/গল্পের পাঠ নয়</h3>
        <p>{source.reference}</p><p className="whitespace-pre-wrap">{source.text}</p>
        <p>উত্তরগুলো প্রস্তুত খসড়া; মূল সাহিত্যকর্মের সঙ্গে মিলিয়ে শিক্ষক review প্রয়োজন। এটি বোর্ড প্রশ্ন হিসেবে চিহ্নিত নয়।</p>
      </section>)}
      {card.draft.output.tasks.map(t => <section key={t.id}><h3 className="font-bold">{blueprint.items.find(i => i.id===t.id)?.title}</h3><pre className="whitespace-pre-wrap break-words text-sm">{JSON.stringify(t,null,2)}</pre></section>)}
      {!review && !prepared.length && <p role="status">এই শ্রেণির সব item-এর প্রস্তুত প্রশ্ন–উত্তর এখনও যুক্ত হয়নি। নিচের মানবণ্টন অনুযায়ী নিজস্ব বইয়ের উৎস যাচাই করে কনটেন্ট প্রস্তুত করতে হবে; অন্য শ্রেণির প্রশ্ন ব্যবহার করা হবে না।</p>}
    {!review && prepared.length>0 && <form action={saveEnglishQuestionItem} className="space-y-2"><input type="hidden" name="grade" value={grade}/><input type="hidden" name="paper" value={paper}/><input type="hidden" name="key" value={card.key}/><label className="block"><input required type="checkbox" name="reviewed" value="yes"/> প্রশ্ন–উত্তর ও সীমাবদ্ধতা পড়েছি; শুধু Pending import করব।</label><button className="rounded bg-emerald-700 px-3 py-2 text-white">Pending হিসেবে সেভ / বর্তমান অবস্থা যাচাই</button><p>আগে সেভ থাকলে duplicate হবে না; আগের approval বদলাবে না।</p><Link className="qm-action-link block" href={englishAdminHref(grade,false,paper)}>পাঠানো প্রশ্ন অনুমোদন করুন →</Link></form>}
      {review && card.record?.status==="PENDING" && <form action={decideEnglishRecovery} className="flex gap-3"><input type="hidden" name="grade" value={grade}/><input type="hidden" name="paper" value={paper}/><input type="hidden" name="key" value={card.key}/><button name="status" value="APPROVED" className="rounded bg-emerald-700 p-2 text-white">অনুমোদন</button><button name="status" value="REJECTED" className="rounded border p-2">বাতিল</button></form>}
      {review && ["APPROVED","REJECTED"].includes(card.record?.status) && <form action={reopenEnglishReview} className="space-y-2"><input type="hidden" name="grade" value={grade}/><input type="hidden" name="paper" value={paper}/><input type="hidden" name="key" value={card.key}/><label className="block"><input required type="checkbox" name="confirmed" value="yes"/> আবার Pending review-তে পাঠাতে চাই।</label><button className="rounded border p-2">আবার review / অনুমোদনের জন্য পাঠান</button></form>}
    </details>)}
  </section>;
}
