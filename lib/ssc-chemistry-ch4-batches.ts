import { parseQuestionUpload } from "./question-json-import";
import type { PreparedBatch } from "./prepared-question-batches";
import mcq1 from "@/content/question-bank/ssc/chemistry/chapter-4/mcq-1.json";
import mcq2 from "@/content/question-bank/ssc/chemistry/chapter-4/mcq-2.json";
import mcq3 from "@/content/question-bank/ssc/chemistry/chapter-4/mcq-3.json";
import mcq4 from "@/content/question-bank/ssc/chemistry/chapter-4/mcq-4.json";
import mcq5 from "@/content/question-bank/ssc/chemistry/chapter-4/mcq-5.json";
import cq from "@/content/question-bank/ssc/chemistry/chapter-4/cq.json";
import sq from "@/content/question-bank/ssc/chemistry/chapter-4/sq.json";

/** Read-only drafts; the existing explicit ADMIN consent can save Pending only.
 * No subject blueprint, Physics quota, approval or Auto Model is inferred.
 */
export function sscChemistryChapter4Batches(): PreparedBatch[] {
  return [mcq1, mcq2, mcq3, mcq4, mcq5, cq, sq].map((input, index) => {
    const { batch, records } = parseQuestionUpload(JSON.stringify(input), {
      category: input.category, subject: input.subject, group: "", topic: input.topic,
    });
    return {
      id: `ssc-chemistry-ch4-${["mcq-1", "mcq-2", "mcq-3", "mcq-4", "mcq-5", "cq", "sq"][index]}-v1`,
      category: batch.category, subject: batch.subject, topic: batch.topic, lang: batch.lang,
      title: ["অধ্যায় ৪ — ১১০ MCQ (১/৫) — খসড়া", "অধ্যায় ৪ — ১১০ MCQ (২/৫) — খসড়া", "অধ্যায় ৪ — ১১০ MCQ (৩/৫) — খসড়া", "অধ্যায় ৪ — ১১০ MCQ (৪/৫) — খসড়া", "অধ্যায় ৪ — ১১০ MCQ (৫/৫) — খসড়া", "অধ্যায় ৪ — ১৫০ CQ (১–২–৩–৪) — খসড়া", "অধ্যায় ৪ — ১০০ SQ (২ নম্বর) — খসড়া"][index],
      limitations: "নিজস্ব অনুশীলনী, বোর্ডের হুবহু প্রশ্ন নয়; ৮০০টি স্বাধীন ধারণা নয়। MCQ: ৭০ ধারণা + ৩০ অবস্থান×৬ + ৩০ প্রবণতা×৬ + ২০ শক্তিছক×৬। CQ: ৩০ ধারণা + ৩০ অবস্থান + ৩০ প্রবণতা + ২০ শক্তি + ২০ উল্টোঅবস্থান + ২০ কার্বনেটছক। SQ: ২০ ধারণা + ৩০ অবস্থান + ৩০ প্রবণতা + ২০ শক্তি। মডেলের ভ্যারিয়েন্ট স্পষ্ট; শক্তি ও গ্যাসপর্যবেক্ষণ কাল্পনিক, বাস্তব পরিমাপ নয়। বইয়ের পৃ. ৫৯–৮১ পড়া; He/H ব্যতিক্রম, Cr/Cu, Zn, IE/EA ব্যতিক্রম ও তড়িৎঋণাত্মকতার শর্ত রাখা হয়েছে। বোর্ড/সালের দাবির উৎস নেই বলে কোনো অনুমানভিত্তিক ট্যাগ নেই। শিক্ষক ও পরীক্ষাবর্ষ/মানবণ্টন যাচাই বাকি; অনুমোদন/প্রকাশ নয়।",
      records: records.map((q, i) => ({kind: batch.items[i].type, text: q.text, options: q.options, correct: q.correct, explanation: q.explanation, difficulty: q.difficulty})),
      provenance: {
        book: batch.book, edition: batch.edition, sourceUrl: batch.sourceUrl,
        sourceUrlMeaning: "Visually inspected chapter concepts; original practice, not verbatim board questions or verified exam-year syllabus",
        references: batch.items.map(q => q.page), originalPractice: true,
        teacherCertified: false, fullChapterRead: true, wholeBookRead: false,
        chapterReadingScope: "Chapter 4 only: printed pp59–81 / PDF pp64–86; native source figures preserved",
        officialYearVerified: false, chemistryExamBlueprintVerified: false,
      },
    };
  });
}
