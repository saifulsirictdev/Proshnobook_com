import { parseQuestionUpload } from "./question-json-import";
import type { PreparedBatch } from "./prepared-question-batches";
import input0 from "@/content/question-bank/ssc/physics/chapter-6/mcq-1.json";
import input1 from "@/content/question-bank/ssc/physics/chapter-6/mcq-2.json";
import input2 from "@/content/question-bank/ssc/physics/chapter-6/cq.json";
import input3 from "@/content/question-bank/ssc/physics/chapter-6/sq.json";
/** Illustrated originals, local Draft cards only. No live approval/import/deploy. */
export function sscPhysicsChapter6Batches(): PreparedBatch[] {
  return [input0, input1, input2, input3].map((input, index) => {
    const { batch, records } = parseQuestionUpload(JSON.stringify(input), {
      category: input.category, subject: input.subject, group: "", topic: input.topic,
    });
    return {
      id: `ssc-physics-ch6-${["mcq-1", "mcq-2", "cq", "sq"][index]}-v1`,
      category: batch.category, subject: batch.subject, topic: batch.topic, lang: batch.lang,
      title: `অধ্যায় 6 বস্তুর ওপর তাপের প্রভাব — ${[125, 125, 100, 70][index]} ${["mcq-1", "mcq-2", "cq", "sq"][index]} — চিত্রসহ খসড়া`,
      limitations: "নিজস্ব অনুশীলনী; বোর্ডের হুবহু প্রশ্ন নয়। সংখ্যাভিত্তিক ভ্যারিয়েন্ট আছে। উৎসের Word আংশিক দেখা হয়েছে; সব চিত্র/সমীকরণ ও পূর্ণ বইয়ের পৃষ্ঠা-মিল/শিক্ষক যাচাই বাকি। প্রয়োজনীয় SVG চিত্র সংযুক্ত; review HTML-এ inline আছে, live asset deploy হয়নি। মাপানুযায়ী নয়। পূর্ণ সিলেবাসের মডেল নয়।",
      records: records.map((q, i) => ({
        kind: batch.items[i].type, text: q.text, options: q.options,
        correct: q.correct, explanation: q.explanation, difficulty: q.difficulty,
      })),
      provenance: {
        book: batch.book, edition: batch.edition, sourceUrl: batch.sourceUrl,
        sourceUrlMeaning: "Project provenance, not verified textbook/board attribution",
        references: batch.items.map(q => q.page), originalPractice: true,
        teacherCertified: false, fullChapterRead: false, officialYearVerified: false,
        assetsDeployed: false, sourceFigureCoverageComplete: false,
        sourceInspection: "docs/question-bank/ssc-physics/source-inspection-ch5-6.json",
        diagramManifest: "content/question-bank/ssc/physics/chapter-6/validation.json",
        distributionEvidence: "docs/question-bank/ssc-physics/mark-distribution.json",
      },
    };
  });
}
