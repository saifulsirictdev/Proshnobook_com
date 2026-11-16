import Link from "next/link";
import { auth } from "@/auth";
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
  const userId = (await auth())?.user?.id;
  const rows = userId
    ? await db.question
        .groupBy({ by: ["category", "subject"], where: { approved: true } })
        .catch(() => [])
    : [];
  const pairs = rows.map((r) => ({ category: r.category, subject: r.subject }));

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-center text-2xl font-bold">
        অনলাইনে প্রশ্নপত্র তৈরি করুন
      </h1>
      <p className="mt-2 text-center text-sm text-slate-600">
        ষষ্ঠ থেকে দ্বাদশ শ্রেণির বিষয় ও অধ্যায় বেছে MCQ, সংক্ষিপ্ত ও সৃজনশীল প্রশ্ন
        সাজান। নিজের পরীক্ষার পেপার সংরক্ষণ করে Preview ও Print করুন।
      </p>
      {userId ? (
        <QbStart pairs={pairs} />
      ) : (
        <div className="my-6 text-center">
          <Link
            className="inline-flex min-h-12 items-center rounded-xl bg-indigo-700 px-6 py-3 font-bold text-white"
            href="/login?next=%2Fquestion-builder"
          >
            লগইন করে প্রশ্ন তৈরি শুরু করুন →
          </Link>
        </div>
      )}
      <section
        className="my-6 rounded-2xl border bg-white p-5"
        aria-labelledby="builder-steps"
      >
        <h2 id="builder-steps" className="text-xl font-bold">
          যেভাবে শুরু করবেন
        </h2>
        <ol className="my-4 list-decimal space-y-3 pl-5">
          <li>লগইন করে শ্রেণি, বিষয় ও অধ্যায় নির্বাচন করুন।</li>
          <li>উপলব্ধ প্রশ্ন থেকে প্রয়োজনের প্রশ্ন বেছে বিন্যাস ও হেডার সাজান।</li>
          <li>
            প্রযোজ্য মূল্য বা প্যাকেজের শর্ত দেখে নিশ্চিত করুন; তারপর সংরক্ষণ ও প্রিভিউ
            করুন।
          </li>
          <li>প্রিন্টের আগে প্রশ্নের সঠিকতা, পৃষ্ঠা ও প্রতিষ্ঠানের তথ্য যাচাই করুন।</li>
        </ol>
        <p>
          সব প্রশ্ন বা সুবিধা বিনামূল্যে নয়। প্রকাশিত ফ্রি প্রশ্নপত্র আলাদাভাবে সংগ্রহ করা
          যায়। ব্যক্তিগত প্রশ্নপত্র ও editor ব্যবহার করতে লগইন প্রয়োজন।
        </p>
        <div className="mt-4 flex flex-wrap gap-4 underline">
          <Link href="/question-paper-guide">বিস্তারিত নির্দেশিকা</Link>
          <Link href="/ready-papers">PDF থেকে প্রশ্ন তৈরি</Link>
          <Link href="/marketplace">ফ্রি ও পেইড প্রশ্নপত্র</Link>
        </div>
      </section>

    </main>
  );
}
