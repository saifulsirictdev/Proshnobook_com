import { parseQuestionUpload } from "./question-json-import";
import type { PreparedBatch } from "./prepared-question-batches";
import mcq1 from "@/content/question-bank/ssc/physics/chapter-1/mcq-1.json";
import mcq2 from "@/content/question-bank/ssc/physics/chapter-1/mcq-2.json";
import cq from "@/content/question-bank/ssc/physics/chapter-1/cq.json";
import sq from "@/content/question-bank/ssc/physics/chapter-1/sq.json";

/** Local originals only. Reuses ADMIN preview/consent/Pending import; never publishes.
 * Canonical Class 9 catalog scope is shared by the SSC nine–ten subject bank.
 * Split MCQ at 125 to respect the existing 200-record importer limit.
 */
export function sscPhysicsBatches(): PreparedBatch[] {
  return [mcq1, mcq2, cq, sq].map((input, index) => {
    const { batch, records } = parseQuestionUpload(JSON.stringify(input), {
      category: input.category, subject: input.subject, group: "", topic: input.topic,
    });
    return {
      id: `ssc-physics-ch1-${["mcq-1", "mcq-2", "cq", "sq"][index]}-v1`,
      category: batch.category, subject: batch.subject, topic: batch.topic, lang: batch.lang,
      title: [
        "অধ্যায় ১ — ১২৫ MCQ (১/২) — খসড়া",
        "অধ্যায় ১ — ১২৫ MCQ (২/২) — খসড়া",
        "অধ্যায় ১ — ১০০ সৃজনশীল (১–২–৩–৪) — খসড়া",
        "অধ্যায় ১ — ১০০ সংক্ষিপ্ত (২ নম্বর) — খসড়া",
      ][index],
      limitations: "নিজস্ব অনুশীলনী; বোর্ডের হুবহু প্রশ্ন নয়। MCQ: ৫০ ধারণাগত + ২০ গণনা-পরিবারে ১০টি করে; CQ: ২০ পরিবারে ৫টি করে; SQ: ৫০ ধারণাগত + ১০ পরিবারে ৫টি করে। সংখ্যাভিত্তিক ভ্যারিয়েন্ট আছে। মূল বইয়ের পূর্ণ অধ্যায়/পৃষ্ঠা, চিত্রভিত্তিক দক্ষতা ও স্বাধীন শিক্ষক যাচাই বাকি। শুধু প্রথম অধ্যায়ের খসড়া, পূর্ণ সিলেবাসের মডেল নয়।",
      records: records.map((q, i) => ({
        kind: batch.items[i].type, text: q.text, options: q.options,
        correct: q.correct, explanation: q.explanation, difficulty: q.difficulty,
      })),
      provenance: {
        book: batch.book, edition: batch.edition, sourceUrl: batch.sourceUrl,
        sourceUrlMeaning: "Project provenance, not external textbook/board evidence",
        references: batch.items.map(q => q.page), originalPractice: true,
        teacherCertified: false, fullChapterRead: false,
        distributionEvidence: "docs/question-bank/ssc-physics/mark-distribution.json",
        officialYearVerified: false,
      },
    };
  });
}
