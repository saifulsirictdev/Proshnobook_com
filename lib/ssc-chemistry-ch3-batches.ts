import { parseQuestionUpload } from "./question-json-import";
import type { PreparedBatch } from "./prepared-question-batches";
import mcq1 from "@/content/question-bank/ssc/chemistry/chapter-3/mcq-1.json";
import mcq2 from "@/content/question-bank/ssc/chemistry/chapter-3/mcq-2.json";
import mcq3 from "@/content/question-bank/ssc/chemistry/chapter-3/mcq-3.json";
import mcq4 from "@/content/question-bank/ssc/chemistry/chapter-3/mcq-4.json";
import cq from "@/content/question-bank/ssc/chemistry/chapter-3/cq.json";
import sq from "@/content/question-bank/ssc/chemistry/chapter-3/sq.json";

/** Read-only drafts; the existing explicit ADMIN consent can save Pending only.
 * No subject blueprint, Physics quota, approval or Auto Model is inferred.
 */
export function sscChemistryChapter3Batches(): PreparedBatch[] {
  return [mcq1, mcq2, mcq3, mcq4, cq, sq].map((input, index) => {
    const { batch, records } = parseQuestionUpload(JSON.stringify(input), {
      category: input.category, subject: input.subject, group: "", topic: input.topic,
    });
    return {
      id: `ssc-chemistry-ch3-${["mcq-1", "mcq-2", "mcq-3", "mcq-4", "cq", "sq"][index]}-v1`,
      category: batch.category, subject: batch.subject, topic: batch.topic, lang: batch.lang,
      title: ["অধ্যায় ৩ — ১২৫ MCQ (১/৪) — খসড়া", "অধ্যায় ৩ — ১২৫ MCQ (২/৪) — খসড়া", "অধ্যায় ৩ — ১২৫ MCQ (৩/৪) — খসড়া", "অধ্যায় ৩ — ১২৫ MCQ (৪/৪) — খসড়া", "অধ্যায় ৩ — ১০০ CQ (১–২–৩–৪) — খসড়া", "অধ্যায় ৩ — ১০০ SQ (২ নম্বর) — খসড়া"][index],
      limitations: "নিজস্ব অনুশীলনী, বোর্ডের হুবহু প্রশ্ন নয়; ৭০০টি স্বাধীন ধারণা নয়। MCQ: ৫০ ধারণা + ৩০ কণাগণনা×৫ + ২০ আইসোটোপ×৫ + ২০ বিন্যাস×৫ + ২০ সংকেতভর×৫। CQ ও SQ প্রতিটি: ২০ ধারণা + ৩০ কণা + ২০ আইসোটোপ + ২০ বিন্যাস + ১০ সংকেতভর। একই মডেলের ভ্যারিয়েন্ট স্পষ্ট; নির্বাচিত A/চার্জ ও আইসোটোপিক প্রাচুর্য অনুশীলনের ইনপুট, প্রাকৃতিক স্থিতিশীলতার দাবি নয়। বইয়ের পৃ. ৩৫–৫৮ পড়া; Z=9/F, প্রোটিয়াম, Tc-99m, orbit/orbital, উপশক্তিস্তর, Cr/Cu, Ar-এর একক এবং আয়নিক সংকেতভর বিষয়ে বৈজ্ঞানিক সংশোধন আছে। শিক্ষক যাচাই ও পরীক্ষাবর্ষ/মানবণ্টন যাচাই বাকি; অনুমোদন/প্রকাশ নয়।",
      records: records.map((q, i) => ({kind: batch.items[i].type, text: q.text, options: q.options, correct: q.correct, explanation: q.explanation, difficulty: q.difficulty})),
      provenance: {
        book: batch.book, edition: batch.edition, sourceUrl: batch.sourceUrl,
        sourceUrlMeaning: "Visually inspected chapter concepts; original practice, not verbatim board questions or verified exam-year syllabus",
        references: batch.items.map(q => q.page), originalPractice: true,
        teacherCertified: false, fullChapterRead: true, wholeBookRead: false,
        chapterReadingScope: "Chapter 3 only: printed pp35–58 / PDF pp40–63; native source figures preserved",
        officialYearVerified: false, chemistryExamBlueprintVerified: false,
      },
    };
  });
}
