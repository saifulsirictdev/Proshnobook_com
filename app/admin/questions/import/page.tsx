import { englishFirstGrades } from "@/lib/english/admin-scope";
import EnglishQuestionItems from "../english-items";
import Link from "next/link";
import PreparedLibrary from "./prepared-library";
import JsonUploadForm from "./json-upload-form";
import { uploadCatalog } from "@/lib/question-json-import";
import { importCatalog, preparedImportIndex } from "@/lib/prepared-question-batches";
import { staff } from "@/lib/guard";
import { db } from "@/lib/db";
import { class6Topics } from "@/lib/mcq-import";
import ImportForm from "./import-form";
import WrittenForm from "./written-form";
import mathChapter1 from "@/content/question-bank/class-6/math-ch1-draft.json";
export const dynamic = "force-dynamic";
export const metadata = { title: "অধ্যায়ভিত্তিক প্রশ্নব্যাচ import", robots: { index: false, follow: false } };
export default async function MCQImport({searchParams}:{searchParams:Promise<{category?:string;subject?:string;grade?:string}>}) {
  const params = await searchParams;
  await staff();
  const index = preparedImportIndex();
  const summaries = index.map(({digest,...summary})=>summary);
  const [receipts, counts, batches] = await Promise.all([
    db.setting.findMany({ where: { key: { in: index.map(b => `preparedimport:v1:${b.digest}`) } }, select: { key: true } }),
    db.question.groupBy({ by: ["subject", "topic", "approved"], where: { category: "Class 6", correct: { not: "" } }, _count: { _all: true } }),
    db.setting.findMany({ where: { key: { startsWith: "mcqimport:v1:" } }, take: 50, orderBy: { key: "asc" }, select: { key: true, value: true } }),
  ]);
  const receiptKeys = new Set(receipts.map(r=>r.key));
  const savedIds = index.filter(b=>receiptKeys.has(`preparedimport:v1:${b.digest}`)).map(b=>b.id);
  const recent = batches.flatMap(b => { try { const v = JSON.parse(b.value); return [{ ...v, key: b.key }]; } catch { return []; } }).sort((a,b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return <main className="mx-auto max-w-6xl space-y-6 p-6">
    <Link className="qm-action-link" href="/admin/questions">← প্রশ্ন ব্যবস্থাপনা</Link>
    <h1 className="text-3xl font-bold">শ্রেণি, বিষয় ও অধ্যায়ভিত্তিক প্রশ্ন import</h1>
    <PreparedLibrary initialGrade={params.grade} initialCategory={params.category} initialSubject={params.subject} englishItems={Object.fromEntries([...englishFirstGrades.map(grade=>[grade,<EnglishQuestionItems key={grade} grade={grade}/>]),...englishFirstGrades.map(grade=>[`${grade}:2`,<EnglishQuestionItems key={`${grade}:2`} grade={grade} paper={2}/>])])} catalog={importCatalog} batches={summaries} savedIds={savedIds} />
    <JsonUploadForm catalog={uploadCatalog} />
    <details><summary className="cursor-pointer font-semibold">পুরোনো ষষ্ঠ শ্রেণির JSON import ও পরিসংখ্যান</summary>
    <p>লক্ষ্য প্রতি যাচাইকৃত অধ্যায়ে ১০০টি, উৎসে যথেষ্ট স্বতন্ত্র প্রশ্ন না হলে অন্তত ৫০টি। বর্তমান selector তালিকা সরকারি সূচিপত্র হিসেবে যাচাইকৃত নয়; writing/model-test টপিক আগে যাচাই করুন। সংখ্যা মানের বিকল্প নয়।</p>
    <ImportForm topics={class6Topics} preparedBatch={JSON.stringify(mathChapter1, null, 2)} />
    <WrittenForm />
    <section className="space-y-3"><h2 className="text-xl font-bold">অধ্যায়ভিত্তিক বর্তমান অবস্থা</h2>
      <p>সংখ্যা nonempty answer-key থাকা রেকর্ডের; উত্তর নির্ভুলতা বা ডুপ্লিকেটমুক্ত হওয়ার সনদ নয়। Pending ইউজারের প্রশ্নব্যাংকে প্রকাশিত নয়।</p>
      <div className="overflow-x-auto rounded-xl border"><table className="w-full text-left text-sm"><thead><tr><th className="p-3">বিষয়</th><th>অধ্যায়</th><th>Approved</th><th>Pending</th><th>১০০ পর্যন্ত ঘাটতি</th></tr></thead><tbody>{class6Topics.map(t => {
        const approved = counts.find(c => c.subject === t.subject && c.topic === t.topic && c.approved)?._count._all ?? 0;
        const pending = counts.find(c => c.subject === t.subject && c.topic === t.topic && !c.approved)?._count._all ?? 0;
        return <tr key={t.subject + t.topic} className="border-t"><td className="p-3">{t.subject}</td><td>{t.topic}</td><td>{approved}</td><td>{pending}</td><td>{Math.max(0,100-approved)}</td></tr>;
      })}</tbody></table></div>
    </section>
    <section><h2 className="text-xl font-bold">সংরক্ষিত import ব্যাচ (সর্বোচ্চ ৫০টি)</h2>{recent.length ? recent.map(b => <details key={b.key} className="my-3 rounded border p-3"><summary>{b.subject} · {b.inserted}টি · {b.createdAt}</summary><pre className="overflow-auto text-xs">{JSON.stringify(b, null, 2)}</pre></details>) : <p>এখনো কোনো ব্যাচ import হয়নি।</p>}</section>
    </details>
  </main>;
}
