import { importEnglishItems } from "./item-actions";
import CompleteModelImport from "./complete-model-import";
import { completeEnglishLibraryDigest, preparedCompleteEnglishModels, preparedCompleteEnglishModel } from "@/lib/english/prepared-complete-model";
import SourceImport from "./source-import";
import { englishSourceImportDigest, preparedEnglishSources } from "@/lib/english/source-import";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { decideEnglishRecovery } from "./actions";
import { validateEnglishDraft } from "@/lib/english/draft";

export const dynamic = "force-dynamic";
export default async function EnglishReview() {
  if ((await auth())?.user?.role !== "ADMIN") redirect("/login");
  const complete = preparedCompleteEnglishModel();
  const completeModels = preparedCompleteEnglishModels();
  const completeRows: { key: string; value: string }[] = await db.setting.findMany({ where: { key: { in: completeModels.map(m => m.key) } } });
  const sources = preparedEnglishSources();
  const imported: { key: string; value: string }[] = await db.setting.findMany({
    where: { key: { in: sources.map(s => s.key) } },
    select: { key: true, value: true },
  });
  const sourceStatuses = new Map(imported.map(row => {
    try { return [row.key, String(JSON.parse(row.value).status)] as const; }
    catch { return [row.key, "INVALID — manual review required"] as const; }
  }));
  const rows: { key: string; value: string }[] = await db.setting.findMany({
    where: { key: { startsWith: "english-review:" } },
    orderBy: { key: "desc" },
    take: 100,
  });
  const itemRows: {key:string;value:string}[] = await db.setting.findMany({where:{key:{startsWith:"english-item:v1:"}},orderBy:{key:"asc"}});
  const completeKeys = new Set(completeRows.map(r => r.key));
  const reviewRows = [...itemRows, ...completeRows, ...rows.filter(r => !completeKeys.has(r.key))];
  return (
    <main className="space-y-5 p-5">
      <h1 className="text-2xl font-bold">English — Question Item ভান্ডার ও review</h1>
      <section className="space-y-3 rounded border p-4">
        <h2 className="text-xl font-bold">Question Item অনুযায়ী প্রশ্নভান্ডার</h2>
        <p>Seen-1, Seen-2, Unseen এবং অন্যান্য item আলাদা করে Pending import হবে। একই passage-এর প্রশ্নগুলো একসঙ্গে থাকবে। নিচে প্রতিটি group review করে অনুমোদন দিন। পূর্ণ model snapshot অনুমোদন বাধ্যতামূলক নয়।</p>
        <form action={importEnglishItems} className="space-y-3">
          <input type="hidden" name="digest" value={completeEnglishLibraryDigest()} />
          <label className="block"><input type="checkbox" name="reviewed" value="yes" required /> নিচের প্রস্তুত প্রশ্ন–উত্তরের preview ও সীমাবদ্ধতা দেখেছি।</label>
          <button className="rounded bg-emerald-700 px-4 py-2 text-white">Question Item অনুযায়ী Pending import করুন</button>
          <a className="block underline" href="#english-model-reviews">পাঠানো item review / অনুমোদন করুন ↓</a>
        </form>
        <p>{itemRows.length}টি স্বতন্ত্র passage/question group database-এ আছে। পুনরায় import করলে আগের সিদ্ধান্ত বদলাবে না।</p>
      </section>
      <section className="space-y-4 rounded border p-4">
        <h2 className="text-xl font-bold">পুরোনো পূর্ণ মডেল import — Class 6 English 1st Paper</h2>
        <p>৩১টি পূর্ণ ১০০ নম্বরের মডেল-combination: প্রতিটিতে ১৩টি অংশ ও answer key। ৩০টি extract-এর প্রত্যেকটির জন্য পাঁচটি gap এবং পাঁচটি vocabulary প্রশ্ন–উত্তর আছে। Seen-1-এর দুইটি প্রস্তুত MCQ/লিখিত group ও তিনটি original unseen group পুনর্ব্যবহৃত—৩১টি সম্পূর্ণ নতুন প্রশ্নসেট নয়। মানবণ্টন বইয়ের practice sample অনুযায়ী; বর্তমান circular ও শিক্ষক semantic review বাকি। Unseen আগে পড়ানো হলে পরীক্ষার্থীর জন্য বদলাতে হবে।</p>
        <details><summary>সম্পূর্ণ মডেল ও উত্তর preview করুন</summary><pre className="whitespace-pre-wrap text-sm">{JSON.stringify({ selection: complete.draft.selection, output: complete.draft.output }, null, 2)}</pre></details>
        <CompleteModelImport digest={complete.digest} />
        <details><summary>৩০টি নতুন মডেলের সম্পূর্ণ preview / coverage</summary>
          {completeModels.slice(1).map(m => <details key={m.key} className="my-3 border p-3"><summary>{m.draft.name}</summary><pre className="whitespace-pre-wrap text-sm">{JSON.stringify({selection:m.draft.selection,output:m.draft.output,provenance:m.provenance},null,2)}</pre></details>)}
        </details>
        <p>এই সংস্করণের {completeRows.length}/{completeModels.length}টি পূর্ণ মডেল database-এ আছে। Import পুনরায় করলে duplicate হবে না; বিদ্যমান approval/rejection অক্ষত থাকবে।</p>
        <CompleteModelImport digest={completeEnglishLibraryDigest()} scope="library" />
        <p>Pending import-এর পর নিচের snapshot তালিকা থেকে সম্পূর্ণ মডেল review করে অনুমোদন দিন। তারপরই database-only Auto Model Test-এ পাওয়া যাবে।</p>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Class 6 · English 1st Paper — ৩০টি seen extract + ৬টি poem</h2>
        <p>এগুলো reading source, প্রস্তুত প্রশ্ন নয়। শুধু Pending হিসেবে database-এ সেভ হবে। প্রথম পত্রের Auto Model Test এখন অনুমোদিত পূর্ণ প্রশ্ন–উত্তর snapshot চায়; এই import কোনো source-কে স্বয়ংক্রিয় অনুমোদন বা প্রকাশ করে না।</p>
        <p>বই: NCTB English for Today, revised 2026। OCR-সহায়তায় transcription ও spot-check হয়েছে; পূর্ণ শিক্ষক-পর্যালোচনা/বর্তমান circular verification বাকি। দশটি ছোট extract শুধু gap/vocabulary-এর উপযোগী।</p>
        <p>এই সংস্করণের {imported.length}/{sources.length}টি source database-এ আছে। প্রতি source-এর অবস্থা নিচে দেখুন।</p>
        <details className="rounded border p-4">
          <summary>৩৬টি source-এর সম্পূর্ণ preview / import status</summary>
          {sources.map(({ key, payload: p }) => <article key={key} className="my-4 space-y-2 border-t pt-3">
            <h3 className="font-semibold">{p.kind} · {p.title} · Lesson {p.lesson} — {sourceStatuses.get(key) ?? "NOT IMPORTED"}</h3>
            <p className="text-sm">{p.reference}</p>
            <pre className="whitespace-pre-wrap text-sm">{p.text}</pre>
          </article>)}
        </details>
        <SourceImport digest={englishSourceImportDigest()} />
      </section>
      <p>
        প্রস্তুত পূর্ণ মডেলগুলো এবং সর্বোচ্চ ১০০টি অন্যান্য সংরক্ষিত snapshot। অনুমোদিত অংশ অন্য English paper তৈরিতে
        database থেকে ব্যবহার করা যাবে। Live test-এ স্বয়ংক্রিয় প্রকাশ হবে না।
        মালিকের private draft আলাদা থাকে।
      </p>
      <h2 id="english-model-reviews" className="scroll-mt-24 text-xl font-bold">পাঠানো Question Item / মডেল — review ও অনুমোদন</h2>
      <p>প্রতিটি Pending item/group-এর সব প্রশ্ন ও উত্তর পড়ে তার নিচের অনুমোদন বাটন ব্যবহার করুন। Approved item থেকে পূর্ণ মডেল সাজানো হবে; পুরোনো Approved মডেলের item-ও ব্যবহারযোগ্য।</p>
      {reviewRows.length === 0 && <p>এখনো কোনো পূর্ণ মডেল পাঠানো হয়নি। উপরের পূর্ণ প্রশ্ন–উত্তর মডেল Pending import করুন; শুধু reading source বা অধ্যায়ের প্রশ্ন import করলে এখানে পূর্ণ মডেল আসবে না।</p>}
      {reviewRows.map((row) => {
        try {
          const record = JSON.parse(row.value),
            draft = validateEnglishDraft(record.draft);
          return (
            <article key={row.key} className="rounded border p-4 space-y-3">
              <h2>
                {draft.name} — {record.status}
              </h2>
              {draft.output.passages.map((p) => (
                <pre className="whitespace-pre-wrap" key={p.key}>
                  {p.text}
                </pre>
              ))}
              {draft.output.tasks.map((task) => (
                <section key={task.id}>
                  <h3>{task.id}</h3>
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(task, null, 2)}
                  </pre>
                </section>
              ))}
              {record.status === "PENDING" && (
                <form action={decideEnglishRecovery} className="flex gap-4">
                  <input type="hidden" name="key" value={row.key} />
                  <button name="status" value="APPROVED">
                    অনুমোদন
                  </button>
                  <button name="status" value="REJECTED">
                    বাতিল
                  </button>
                </form>
              )}
            </article>
          );
        } catch {
          return null;
        }
      })}
    </main>
  );
}
