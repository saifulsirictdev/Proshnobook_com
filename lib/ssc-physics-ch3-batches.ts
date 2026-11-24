import { parseQuestionUpload } from "./question-json-import";
import type { PreparedBatch } from "./prepared-question-batches";
import mcq from "@/content/question-bank/ssc/physics/chapter-3/mcq.json";
import cq from "@/content/question-bank/ssc/physics/chapter-3/cq.json";
import sq from "@/content/question-bank/ssc/physics/chapter-3/sq.json";

/** Force originals, three local Draft cards; no DB, approvals or publication.
 * Exactly 200 MCQ fits the existing limit, so no limit change or splitting needed.
 * Previous chapter adapters and their digests stay unchanged.
 */
export function sscPhysicsChapter3Batches(): PreparedBatch[] {
  return [mcq, cq, sq].map((input, index) => {
    const { batch, records } = parseQuestionUpload(JSON.stringify(input), {
      category: input.category, subject: input.subject, group: "", topic: input.topic,
    });
    return {
      id: `ssc-physics-ch3-${["mcq", "cq", "sq"][index]}-v1`,
      category: batch.category, subject: batch.subject, topic: batch.topic, lang: batch.lang,
      title: [
        "অধ্যায় ৩ বল — ২০০ MCQ — খসড়া",
        "অধ্যায় ৩ বল — ১২০ সৃজনশীল (১–২–৩–৪) — খসড়া",
        "অধ্যায় ৩ বল — ৭০ সংক্ষিপ্ত (২ নম্বর) — খসড়া",
      ][index],
      limitations: "নিজস্ব অনুশীলনী; বোর্ডের হুবহু প্রশ্ন নয়। MCQ: ৪০ ধারণাগত + ১৬ গণনা-পরিবারে ১০টি করে; CQ: ২৪ পরিবারে ৫টি করে; SQ: ৪০ ধারণাগত + ৬ পরিবারে ৫টি করে। সংখ্যাভিত্তিক ভ্যারিয়েন্ট আছে। মূল বইয়ের পূর্ণ পাঠ/পৃষ্ঠা, ঘর্ষণ সহগ/যুক্ত ব্লক/লিফটের প্রয়োগের স্তর এবং স্বাধীন শিক্ষক যাচাই বাকি। বলচিত্র/আঁকা গ্রাফ নেই; দিক ও ডেটা কথায় দেওয়া। অধ্যায়ভিত্তিক খসড়া; পূর্ণ সিলেবাসের মডেল নয়।",
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
