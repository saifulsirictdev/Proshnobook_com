import CompleteModelImport from "./complete-model-import";
import { preparedCompleteEnglishModel } from "@/lib/english/prepared-complete-model";
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
  const completeRow: { key: string; value: string } | null = await db.setting.findUnique({ where: { key: complete.key } });
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
  const reviewRows = completeRow ? [completeRow, ...rows.filter(r => r.key !== completeRow.key)] : rows;
  return (
    <main className="space-y-5 p-5">
      <h1 className="text-2xl font-bold">English — source import ও উদ্ধার করা অংশ</h1>
      <section className="space-y-4 rounded border p-4">
        <h2 className="text-xl font-bold">প্রস্তুত পূর্ণ প্রশ্ন–উত্তর মডেল — Class 6 English 1st Paper</h2>
        <p>একটি পূর্ণ ১০০ নম্বরের মডেল: ১৩টি অংশ, passage-সংযুক্ত প্রশ্ন এবং আলাদা answer key। এটি ৩০টি passage-এর সব প্রশ্নসেট নয়। মানবণ্টন বইয়ের practice sample অনুযায়ী; বর্তমান circular ও শিক্ষক semantic review বাকি। Unseen আগে পড়ানো হলে পরীক্ষার্থীর জন্য বদলাতে হবে।</p>
        <details><summary>সম্পূর্ণ মডেল ও উত্তর preview করুন</summary><pre className="whitespace-pre-wrap text-sm">{JSON.stringify({ selection: complete.draft.selection, output: complete.draft.output }, null, 2)}</pre></details>
        <CompleteModelImport digest={complete.digest} />
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
        সর্বোচ্চ ১০০টি সংরক্ষিত snapshot। অনুমোদিত অংশ অন্য English paper তৈরিতে
        database থেকে ব্যবহার করা যাবে। Live test-এ স্বয়ংক্রিয় প্রকাশ হবে না।
        মালিকের private draft আলাদা থাকে।
      </p>
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
