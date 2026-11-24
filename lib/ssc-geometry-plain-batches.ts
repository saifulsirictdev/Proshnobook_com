import { parseQuestionUpload } from "./question-json-import";
import type { PreparedBatch } from "./prepared-question-batches";
import ch6 from "@/content/question-bank/ssc/math/geometry-plain-v1/ch6-mcq.json";
import ch7 from "@/content/question-bank/ssc/math/geometry-plain-v1/ch7-mcq.json";
import ch8 from "@/content/question-bank/ssc/math/geometry-plain-v1/ch8-mcq.json";
import ch14 from "@/content/question-bank/ssc/math/geometry-plain-v1/ch14-mcq.json";
import ch15 from "@/content/question-bank/ssc/math/geometry-plain-v1/ch15-mcq.json";

/** Supplemental originals, not part of the historical 53-slice/5750 release.
 * Registered drafts only: existing ADMIN Pending import/review gates still apply.
 */
export function sscGeometryPlainBatches(): PreparedBatch[] {
  return [ch6, ch7, ch8, ch14, ch15].map((input, i) => {
    const { batch, records } = parseQuestionUpload(JSON.stringify(input), {
      category: input.category, subject: input.subject, group: "", topic: input.topic,
    });
    return {
      id: `ssc-math-geometry-plain-ch${[6, 7, 8, 14, 15][i]}-v1`,
      category: batch.category, subject: batch.subject, topic: batch.topic, lang: batch.lang,
      title: "১০টি চিত্রবিহীন জ্যামিতি MCQ — নিজস্ব খসড়া",
      limitations: "DRAFT / Pending ADMIN review. নিজস্ব অনুশীলনী; বোর্ড বা NCTB-এর হুবহু প্রশ্ন নয়। স্বাধীন শিক্ষক অনুমোদন বাকি।",
      records: records.map(q => ({ kind: "MCQ", text: q.text, options: q.options, correct: q.correct, explanation: q.explanation, difficulty: q.difficulty })),
      provenance: { book: batch.book, edition: batch.edition, sourceUrl: batch.sourceUrl, references: batch.items.map(q => q.page), originalPractice: true, teacherCertified: false },
    };
  });
}
