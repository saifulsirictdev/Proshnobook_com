import { parseQuestionUpload } from "./question-json-import";
import type { PreparedBatch } from "./prepared-question-batches";
import mcq1 from "@/content/question-bank/ssc/chemistry/chapter-2/mcq-1.json";
import mcq2 from "@/content/question-bank/ssc/chemistry/chapter-2/mcq-2.json";
import mcq3 from "@/content/question-bank/ssc/chemistry/chapter-2/mcq-3.json";
import cq from "@/content/question-bank/ssc/chemistry/chapter-2/cq.json";
import sq from "@/content/question-bank/ssc/chemistry/chapter-2/sq.json";

/** Read-only preparation; existing ADMIN consent can save Pending, never approve.
 * No examination blueprint, Physics quota or Chemistry Auto Model is inferred.
 */
export function sscChemistryChapter2Batches(): PreparedBatch[] {
  return [mcq1, mcq2, mcq3, cq, sq].map((input, index) => {
    const { batch, records } = parseQuestionUpload(JSON.stringify(input), {
      category: input.category, subject: input.subject, group: "", topic: input.topic,
    });
    return {
      id: `ssc-chemistry-ch2-${["mcq-1", "mcq-2", "mcq-3", "cq", "sq"][index]}-v1`,
      category: batch.category, subject: batch.subject, topic: batch.topic, lang: batch.lang,
      title: ["অধ্যায় ২ — ১২০ MCQ (১/৩) — খসড়া", "অধ্যায় ২ — ১২০ MCQ (২/৩) — খসড়া", "অধ্যায় ২ — ১১০ MCQ (৩/৩) — খসড়া", "অধ্যায় ২ — ৫০ CQ (১–২–৩–৪) — খসড়া", "অধ্যায় ২ — ৭০ SQ (২ নম্বর) — খসড়া"][index],
      limitations: "নিজস্ব অনুশীলনী, বোর্ডের হুবহু প্রশ্ন নয়। MCQ: ৭০ ধারণাভিত্তিক + উত্তাপগ্রাফ ও ব্যাপনমডেলের ১০টি করে probe-এর ১৪টি করে ভ্যারিয়েন্ট। CQ: ২২ ধারণাভিত্তিক + ১৪ উত্তাপ + ১৪ ব্যাপন; SQ: ৪২ ধারণাভিত্তিক + ১৪ উত্তাপ + ১৪ ব্যাপন। সব সংখ্যাতথ্য কাল্পনিক; ব্যাপনদূরত্ব আনুমানিক, নিখুঁত গ্রাহাম-তথ্য নয়। বইয়ের পৃ. ১৭–৩৪ দৃশ্যত পড়া; আয়োডিন, মিশ্রণের স্ফুটন ও NH4Cl-এর প্রক্রিয়া বিষয়ে শর্তযুক্ত ব্যাখ্যা রাখা হয়েছে। শিক্ষক যাচাই ও পরীক্ষাবর্ষ/মানবণ্টন যাচাই বাকি; অনুমোদন/প্রকাশ নয়।",
      records: records.map((q, i) => ({kind: batch.items[i].type, text: q.text, options: q.options, correct: q.correct, explanation: q.explanation, difficulty: q.difficulty})),
      provenance: {
        book: batch.book, edition: batch.edition, sourceUrl: batch.sourceUrl,
        sourceUrlMeaning: "Visually inspected textbook chapter concepts; original practice, not verbatim board questions or verified exam-year syllabus",
        references: batch.items.map(q => q.page), originalPractice: true,
        teacherCertified: false, fullChapterRead: true, wholeBookRead: false,
        chapterReadingScope: "Chapter 2 only: printed pp17–34 / PDF pp22–39; native figures preserved",
        officialYearVerified: false, chemistryExamBlueprintVerified: false,
      },
    };
  });
}
