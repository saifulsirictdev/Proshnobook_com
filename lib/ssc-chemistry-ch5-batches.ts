import { parseQuestionUpload } from "./question-json-import";
import type { PreparedBatch } from "./prepared-question-batches";
import mcq1 from "@/content/question-bank/ssc/chemistry/chapter-5/mcq-1.json";
import mcq2 from "@/content/question-bank/ssc/chemistry/chapter-5/mcq-2.json";
import mcq3 from "@/content/question-bank/ssc/chemistry/chapter-5/mcq-3.json";
import mcq4 from "@/content/question-bank/ssc/chemistry/chapter-5/mcq-4.json";
import mcq5 from "@/content/question-bank/ssc/chemistry/chapter-5/mcq-5.json";
import cq1 from "@/content/question-bank/ssc/chemistry/chapter-5/cq-1.json";
import cq2 from "@/content/question-bank/ssc/chemistry/chapter-5/cq-2.json";
import sq from "@/content/question-bank/ssc/chemistry/chapter-5/sq.json";

/** Read-only drafts; the existing explicit ADMIN consent can save Pending only.
 * No subject blueprint, Physics quota, approval or Auto Model is inferred.
 */
export function sscChemistryChapter5Batches(): PreparedBatch[] {
  return [mcq1, mcq2, mcq3, mcq4, mcq5, cq1, cq2, sq].map((input, index) => {
    const { batch, records } = parseQuestionUpload(JSON.stringify(input), {
      category: input.category, subject: input.subject, group: "", topic: input.topic,
    });
    return {
      id: `ssc-chemistry-ch5-${["mcq-1", "mcq-2", "mcq-3", "mcq-4", "mcq-5", "cq-1", "cq-2", "sq"][index]}-v1`,
      category: batch.category, subject: batch.subject, topic: batch.topic, lang: batch.lang,
      title: ["অধ্যায় ৫ — ১০০ MCQ (১/৫) — খসড়া", "অধ্যায় ৫ — ১০০ MCQ (২/৫) — খসড়া", "অধ্যায় ৫ — ১০০ MCQ (৩/৫) — খসড়া", "অধ্যায় ৫ — ১০০ MCQ (৪/৫) — খসড়া", "অধ্যায় ৫ — ১০০ MCQ (৫/৫) — খসড়া", "অধ্যায় ৫ — ১০০ CQ (১/২, ১–২–৩–৪) — খসড়া", "অধ্যায় ৫ — ১০০ CQ (২/২, ১–২–৩–৪) — খসড়া", "অধ্যায় ৫ — ১০০ SQ (২ নম্বর) — খসড়া"][index],
      limitations: "নিজস্ব অনুশীলনী, বোর্ডের হুবহু প্রশ্ন নয়; ৮০০টি স্বাধীন ধারণা নয়। MCQ: ৬০ ধারণা + ৪০ চার্জসাম্য×৫ + ২৪ Lewis×৫ + ২৪ ধর্মছক×৫। CQ: ৩২ ধারণা + ৪০ চার্জসাম্য×৩ লিখিত কাজ + ২৪ Lewis + ২৪ ধর্মছক। SQ: ২০ ধারণা + ৪০ চার্জসাম্য + ২৪ Lewis + ১৬ ধর্মছক। একই মডেলের ভ্যারিয়েন্ট চিহ্নিত; ধর্মছক কাল্পনিক ও সীমিত চারমডেলের তুলনা, বাস্তব শনাক্তকরণ নয়। বইয়ের পৃ. ৮২–১০৮ পড়া; যোজনী/আধান/জারণসংখ্যা পৃথক, অষ্টক ও দ্রাব্যতা/পরিবাহিতার ব্যতিক্রম এবং যৌগমূলকের ভেতরের সমযোজী সংযোগ আছে। বোর্ড–সাল দেখা প্রশ্ন ব্যবহার হয়নি বলে মনগড়া ট্যাগ নেই। শিক্ষক/পরীক্ষাবর্ষ/মানবণ্টন যাচাই বাকি; অনুমোদন/প্রকাশ নয়।",
      records: records.map((q, i) => ({kind: batch.items[i].type, text: q.text, options: q.options, correct: q.correct, explanation: q.explanation, difficulty: q.difficulty})),
      provenance: {
        book: batch.book, edition: batch.edition, sourceUrl: batch.sourceUrl,
        sourceUrlMeaning: "Visually inspected chapter concepts; original practice, not verbatim board questions or verified exam-year syllabus",
        references: batch.items.map(q => q.page), originalPractice: true,
        teacherCertified: false, fullChapterRead: true, wholeBookRead: false,
        chapterReadingScope: "Chapter 5 only: printed pp82–108 / PDF pp87–113; native source figures preserved",
        officialYearVerified: false, chemistryExamBlueprintVerified: false,
      },
    };
  });
}
