import { parseQuestionUpload } from "./question-json-import";
import type { PreparedBatch } from "./prepared-question-batches";
import mcq1 from "@/content/question-bank/ssc/physics/chapter-2/mcq-1.json";
import mcq2 from "@/content/question-bank/ssc/physics/chapter-2/mcq-2.json";
import cq from "@/content/question-bank/ssc/physics/chapter-2/cq.json";
import sq from "@/content/question-bank/ssc/physics/chapter-2/sq.json";

/** Motion-only local originals; no network, DB writes, approval or publication.
 * Separate adapter preserves chapter 1 batch data/digests and all existing gates.
 */
export function sscPhysicsChapter2Batches(): PreparedBatch[] {
  return [mcq1, mcq2, cq, sq].map((input, index) => {
    const { batch, records } = parseQuestionUpload(JSON.stringify(input), {
      category: input.category, subject: input.subject, group: "", topic: input.topic,
    });
    return {
      id: `ssc-physics-ch2-${["mcq-1", "mcq-2", "cq", "sq"][index]}-v1`,
      category: batch.category, subject: batch.subject, topic: batch.topic, lang: batch.lang,
      title: [
        "অধ্যায় ২ গতি — ১৫০ MCQ (১/২) — খসড়া",
        "অধ্যায় ২ গতি — ১৫০ MCQ (২/২) — খসড়া",
        "অধ্যায় ২ গতি — ১৫০ সৃজনশীল (১–২–৩–৪) — খসড়া",
        "অধ্যায় ২ গতি — ১০০ সংক্ষিপ্ত (২ নম্বর) — খসড়া",
      ][index],
      limitations: "নিজস্ব অনুশীলনী; বোর্ডের হুবহু প্রশ্ন নয়। MCQ: ৬০ ধারণাগত + ২৪ গণনা-পরিবারে ১০টি করে; CQ: ৩০ পরিবারে ৫টি করে; SQ: ৫০ ধারণাগত + ১০ পরিবারে ৫টি করে। সংখ্যাভিত্তিক ভ্যারিয়েন্ট আছে। মূল বইয়ের পূর্ণ পাঠ/পৃষ্ঠা, সরাসরি আঁকা লেখচিত্র পড়ার দক্ষতা ও স্বাধীন শিক্ষক যাচাই বাকি। অধ্যায়ভিত্তিক খসড়া; পূর্ণ সিলেবাসের মডেল নয়।",
      records: records.map((q, i) => ({
        kind: batch.items[i].type, text: q.text, options: q.options,
        correct: q.correct, explanation: q.explanation, difficulty: q.difficulty,
      })),
      provenance: {
        book: batch.book, edition: batch.edition, sourceUrl: batch.sourceUrl,
        sourceUrlMeaning: "Project provenance, not external textbook/board evidence",
        references: batch.items.map(q => q.page), originalPractice: true,
        teacherCertified: false, fullChapterRead: false, officialYearVerified: false,
        distributionEvidence: "docs/question-bank/ssc-physics/mark-distribution.json",
      },
    };
  });
}
