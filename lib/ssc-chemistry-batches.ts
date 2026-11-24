import { parseQuestionUpload } from "./question-json-import";
import type { PreparedBatch } from "./prepared-question-batches";
import mcq1 from "@/content/question-bank/ssc/chemistry/chapter-1/mcq-1.json";
import mcq2 from "@/content/question-bank/ssc/chemistry/chapter-1/mcq-2.json";
import mcq3 from "@/content/question-bank/ssc/chemistry/chapter-1/mcq-3.json";
import cq from "@/content/question-bank/ssc/chemistry/chapter-1/cq.json";
import sq from "@/content/question-bank/ssc/chemistry/chapter-1/sq.json";

/** Local practice drafts only. ADMIN preview/consent may save Pending, never approve.
 * No Chemistry Auto Model policy or examination marks are inferred from Physics.
 */
export function sscChemistryBatches(): PreparedBatch[] {
  return [mcq1, mcq2, mcq3, cq, sq].map((input, index) => {
    const { batch, records } = parseQuestionUpload(JSON.stringify(input), {
      category: input.category, subject: input.subject, group: "", topic: input.topic,
    });
    return {
      id: `ssc-chemistry-ch1-${["mcq-1", "mcq-2", "mcq-3", "cq", "sq"][index]}-v1`,
      category: batch.category, subject: batch.subject, topic: batch.topic, lang: batch.lang,
      title: ["অধ্যায় ১ — ১২০ MCQ (১/৩) — খসড়া", "অধ্যায় ১ — ১২০ MCQ (২/৩) — খসড়া", "অধ্যায় ১ — ১১০ MCQ (৩/৩) — খসড়া", "অধ্যায় ১ — ৫০ CQ (১–২–৩–৪) — খসড়া", "অধ্যায় ১ — ৭০ SQ (২ নম্বর) — খসড়া"][index],
      limitations: "নিজস্ব অনুশীলনী, বোর্ডের হুবহু প্রশ্ন নয়। MCQ: ৭০ ধারণাভিত্তিক + গবেষণা ও নিরাপত্তার ১০টি করে probe-এর ১৪টি করে ভ্যারিয়েন্ট। CQ: ২২ ধারণাভিত্তিক + ১৪ গবেষণা + ১৪ নিরাপত্তা; SQ: ৪২ ধারণাভিত্তিক + ১৪ গবেষণা + ১৪ নিরাপত্তা। গবেষণার ছক কাল্পনিক। বইয়ের পৃ. ১–১৬ দৃশ্যত পড়া; শিক্ষক যাচাই ও সরকারি পরীক্ষাবর্ষ/মানবণ্টন যাচাই বাকি। হলুদ সতর্কচিহ্ন বইয়ের সংস্করণ, পূর্ণ আধুনিক GHS লেবেল নয়। অনুমোদন/প্রকাশ নয়।",
      records: records.map((q, i) => ({ kind: batch.items[i].type, text: q.text, options: q.options, correct: q.correct, explanation: q.explanation, difficulty: q.difficulty })),
      provenance: {
        book: batch.book, edition: batch.edition, sourceUrl: batch.sourceUrl,
        sourceUrlMeaning: "Textbook chapter concepts visually inspected; original practice, not verbatim board questions or verified exam-year syllabus",
        references: batch.items.map(q => q.page), originalPractice: true,
        teacherCertified: false, fullChapterRead: true, wholeBookRead: false,
        chapterReadingScope: "Chapter 1 only: printed pages 1–16 / PDF pages 6–21; source inventory and coverage note retained",
        officialYearVerified: false, chemistryExamBlueprintVerified: false,
      },
    };
  });
}
