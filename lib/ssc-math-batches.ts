import { parseQuestionUpload } from "./question-json-import";
import type { PreparedBatch } from "./prepared-question-batches";
import c1m from "@/content/question-bank/ssc/math/chapter-1/target-v1/mcq-1.json";
import c1w from "@/content/question-bank/ssc/math/chapter-1/target-v1/written.json";
import c1r from "@/content/question-bank/ssc/math/chapter-1/target-v1/validation.json";
import c2m1 from "@/content/question-bank/ssc/math/chapter-2/target-v1/mcq-1.json";
import c2m2 from "@/content/question-bank/ssc/math/chapter-2/target-v1/mcq-2.json";
import c2w from "@/content/question-bank/ssc/math/chapter-2/target-v1/written.json";
import c2r from "@/content/question-bank/ssc/math/chapter-2/target-v1/validation.json";

import c3m1 from "@/content/question-bank/ssc/math/chapter-3/target-v1/mcq-1.json";
import c3m2 from "@/content/question-bank/ssc/math/chapter-3/target-v1/mcq-2.json";
import c3cq from "@/content/question-bank/ssc/math/chapter-3/target-v1/cq.json";
import c3sq from "@/content/question-bank/ssc/math/chapter-3/target-v1/sq.json";
import c3r from "@/content/question-bank/ssc/math/chapter-3/target-v1/validation.json";

import c4m from "@/content/question-bank/ssc/math/chapter-4/target-v1/mcq.json";
import c4w from "@/content/question-bank/ssc/math/chapter-4/target-v1/written.json";
import c4r from "@/content/question-bank/ssc/math/chapter-4/target-v1/validation.json";

import c5m from "@/content/question-bank/ssc/math/chapter-5/target-v1/mcq.json";
import c5w from "@/content/question-bank/ssc/math/chapter-5/target-v1/written.json";
import c5r from "@/content/question-bank/ssc/math/chapter-5/target-v1/validation.json";

import c6m from "@/content/question-bank/ssc/math/chapter-6/target-v1/mcq.json";
import c6w from "@/content/question-bank/ssc/math/chapter-6/target-v1/written.json";
import c6r from "@/content/question-bank/ssc/math/chapter-6/target-v1/validation.json";

import c7mcq from "@/content/question-bank/ssc/math/chapter-7/target-v1/mcq.json";
import c7cq from "@/content/question-bank/ssc/math/chapter-7/target-v1/cq.json";
import c7sq from "@/content/question-bank/ssc/math/chapter-7/target-v1/sq.json";
import c7r from "@/content/question-bank/ssc/math/chapter-7/target-v1/validation.json";
import c8mcq1 from "@/content/question-bank/ssc/math/chapter-8/target-v1/mcq-1.json";
import c8mcq2 from "@/content/question-bank/ssc/math/chapter-8/target-v1/mcq-2.json";
import c8cq1 from "@/content/question-bank/ssc/math/chapter-8/target-v1/cq-1.json";
import c8cq2 from "@/content/question-bank/ssc/math/chapter-8/target-v1/cq-2.json";
import c8sq from "@/content/question-bank/ssc/math/chapter-8/target-v1/sq.json";
import c8r from "@/content/question-bank/ssc/math/chapter-8/target-v1/validation.json";

import c9mcq1 from "@/content/question-bank/ssc/math/chapter-9/target-v1/mcq-1.json";
import c9mcq2 from "@/content/question-bank/ssc/math/chapter-9/target-v1/mcq-2.json";
import c9cq from "@/content/question-bank/ssc/math/chapter-9/target-v1/cq.json";
import c9sq from "@/content/question-bank/ssc/math/chapter-9/target-v1/sq.json";
import c9validation from "@/content/question-bank/ssc/math/chapter-9/target-v1/validation.json";

import c10mcq from "@/content/question-bank/ssc/math/chapter-10/target-v1/mcq.json";
import c10cq from "@/content/question-bank/ssc/math/chapter-10/target-v1/cq.json";
import c10sq from "@/content/question-bank/ssc/math/chapter-10/target-v1/sq.json";
import c10validation from "@/content/question-bank/ssc/math/chapter-10/target-v1/validation.json";

import c11mcq from "@/content/question-bank/ssc/math/chapter-11/target-v1/mcq.json";
import c11cq from "@/content/question-bank/ssc/math/chapter-11/target-v1/cq.json";
import c11sq from "@/content/question-bank/ssc/math/chapter-11/target-v1/sq.json";
import c11validation from "@/content/question-bank/ssc/math/chapter-11/target-v1/validation.json";
import c12mcq from "@/content/question-bank/ssc/math/chapter-12/target-v1/mcq.json";
import c12cq from "@/content/question-bank/ssc/math/chapter-12/target-v1/cq.json";
import c12sq from "@/content/question-bank/ssc/math/chapter-12/target-v1/sq.json";
import c12validation from "@/content/question-bank/ssc/math/chapter-12/target-v1/validation.json";
import c13mcq from "@/content/question-bank/ssc/math/chapter-13/target-v1/mcq.json";
import c13cq from "@/content/question-bank/ssc/math/chapter-13/target-v1/cq.json";
import c13sq from "@/content/question-bank/ssc/math/chapter-13/target-v1/sq.json";
import c13validation from "@/content/question-bank/ssc/math/chapter-13/target-v1/validation.json";
import c14mcq from "@/content/question-bank/ssc/math/chapter-14/target-v1/mcq.json";
import c14cq from "@/content/question-bank/ssc/math/chapter-14/target-v1/cq.json";
import c14sq from "@/content/question-bank/ssc/math/chapter-14/target-v1/sq.json";
import c14validation from "@/content/question-bank/ssc/math/chapter-14/target-v1/validation.json";
import c15mcq from "@/content/question-bank/ssc/math/chapter-15/target-v1/mcq.json";
import c15cq from "@/content/question-bank/ssc/math/chapter-15/target-v1/cq.json";
import c15sq from "@/content/question-bank/ssc/math/chapter-15/target-v1/sq.json";
import c15validation from "@/content/question-bank/ssc/math/chapter-15/target-v1/validation.json";
import c16mcq from "@/content/question-bank/ssc/math/chapter-16/target-v1/mcq.json";
import c16cq from "@/content/question-bank/ssc/math/chapter-16/target-v1/cq.json";
import c16sq from "@/content/question-bank/ssc/math/chapter-16/target-v1/sq.json";
import c16validation from "@/content/question-bank/ssc/math/chapter-16/target-v1/validation.json";

import c17mcq1 from "@/content/question-bank/ssc/math/chapter-17/target-v1/mcq-1.json";
import c17mcq2 from "@/content/question-bank/ssc/math/chapter-17/target-v1/mcq-2.json";
import c17cq1 from "@/content/question-bank/ssc/math/chapter-17/target-v1/cq-1.json";
import c17cq2 from "@/content/question-bank/ssc/math/chapter-17/target-v1/cq-2.json";
import c17sq from "@/content/question-bank/ssc/math/chapter-17/target-v1/sq.json";
import c17validation from "@/content/question-bank/ssc/math/chapter-17/target-v1/validation.json";

/** Complete numeric targets, NOT teacher-approved stock. Old seed snapshots remain
 * on disk/Drive but are included here only through the fifty-three complete slices. */
export function sscMathBatches(): PreparedBatch[] {
  const inputs = [c1m, c1w, c2m1, c2m2, c2w, c3m1, c3m2, c3cq, c3sq, c4m, c4w, c5m, c5w, c6m, c6w, c7mcq, c7cq, c7sq, c8mcq1, c8mcq2, c8cq1, c8cq2, c8sq, c9mcq1, c9mcq2, c9cq, c9sq, c10mcq, c10cq, c10sq, c11mcq, c11cq, c11sq, c12mcq, c12cq, c12sq, c13mcq, c13cq, c13sq, c14mcq, c14cq, c14sq, c15mcq, c15cq, c15sq, c16mcq, c16cq, c16sq, c17mcq1, c17mcq2, c17cq1, c17cq2, c17sq];
  const reviews = [c1r, c1r, c2r, c2r, c2r, c3r, c3r, c3r, c3r, c4r, c4r, c5r, c5r, c6r, c6r, c7r, c7r, c7r, c8r, c8r, c8r, c8r, c8r, c9validation, c9validation, c9validation, c9validation, c10validation, c10validation, c10validation, c11validation, c11validation, c11validation, c12validation, c12validation, c12validation, c13validation, c13validation, c13validation, c14validation, c14validation, c14validation, c15validation, c15validation, c15validation, c16validation, c16validation, c16validation, c17validation, c17validation, c17validation, c17validation, c17validation];
  const ids = ["ch1-mcq", "ch1-written", "ch2-mcq-1", "ch2-mcq-2", "ch2-written", "ch3-mcq-1", "ch3-mcq-2", "ch3-cq", "ch3-sq", "ch4-mcq", "ch4-written", "ch5-mcq", "ch5-written", "ch6-mcq", "ch6-written", "ch7-mcq", "ch7-cq", "ch7-sq", "ch8-mcq-1", "ch8-mcq-2", "ch8-cq-1", "ch8-cq-2", "ch8-sq", "ch9-mcq-1", "ch9-mcq-2", "ch9-cq", "ch9-sq", "ch10-mcq", "ch10-cq", "ch10-sq", "ch11-mcq", "ch11-cq", "ch11-sq", "ch12-mcq", "ch12-cq", "ch12-sq", "ch13-mcq", "ch13-cq", "ch13-sq", "ch14-mcq", "ch14-cq", "ch14-sq", "ch15-mcq", "ch15-cq", "ch15-sq", "ch16-mcq", "ch16-cq", "ch16-sq", "ch17-mcq-1", "ch17-mcq-2", "ch17-cq-1", "ch17-cq-2", "ch17-sq"];
  return inputs.map((input, index) => {
    const { batch, records } = parseQuestionUpload(JSON.stringify(input), {
      category: input.category, subject: input.subject, group: "", topic: input.topic,
    });
    const review = reviews[index];
    const counts = batch.items.reduce((n, q) => { n[q.type]++; return n; }, { MCQ: 0, CQ: 0, SQ: 0 });
    return {
      id: `ssc-math-${ids[index]}-target-v1`,
      category: batch.category, subject: batch.subject, topic: batch.topic, lang: batch.lang,
      title: `${counts.MCQ} MCQ + ${counts.CQ} CQ + ${counts.SQ} SQ — লক্ষ্যপূরণ খসড়া`,
      limitations: "DRAFT / Pending ADMIN review. স্বাধীন শিক্ষক অনুমোদন বাকি। " + review.limitations.join(" "),
      records: records.map((q, i) => ({
        kind: batch.items[i].type, text: q.text, options: q.options,
        correct: q.correct, explanation: q.explanation, difficulty: q.difficulty,
      })),
      provenance: {
        book: batch.book, edition: batch.edition, sourceUrl: batch.sourceUrl,
        references: batch.items.map(q => q.page), review,
        attributionPolicy: "Only _provenance-bearing source seed items have board attribution. Other rows are original parameterised practice or explicitly audited user-reference adaptations; never infer board provenance or claim verbatim NCTB content.",
      },
    };
  });
}
