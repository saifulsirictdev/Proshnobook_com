import { landingMetadata } from "@/lib/seo";
import { db } from "@/lib/db";
import QbStart from "@/components/qb-start";

export const dynamic = "force-dynamic";
export const metadata = landingMetadata(
  "অনলাইনে প্রশ্নপত্র তৈরি — MCQ, সংক্ষিপ্ত ও সৃজনশীল",
  "ষষ্ঠ থেকে দ্বাদশ শ্রেণির বিষয় ও অধ্যায় বেছে প্রশ্নপত্র সাজান। সংরক্ষণ, Preview ও Print-এর মাধ্যমে নিজের পরীক্ষার পেপার প্রস্তুত করুন।",
  "/question-builder",
);

export default async function QuestionBuilderStart() {
  const rows = await db.question
    .groupBy({ by: ["category", "subject"], where: { approved: true } })
    .catch(() => []);
  const pairs = rows.map((r) => ({ category: r.category, subject: r.subject }));

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-center text-2xl font-bold">
        ১ ক্লিকে প্রশ্নপত্র তৈরি করুন!
      </h1>
      <p className="mt-2 text-center text-sm text-slate-600">
        এক প্ল্যাটফর্মে প্রশ্ন, সাজেশন ও অনলাইন পরীক্ষা তৈরি, দ্রুত, সহজ ও নির্ভুল!
      </p>
      <QbStart pairs={pairs} />
    </main>
  );
}
