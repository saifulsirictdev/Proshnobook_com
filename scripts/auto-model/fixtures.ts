// Synthetic layout/test fixtures ONLY — not reviewed question stock, never imported.
import { NCTB_CLASSES } from "../../lib/nctb-data";
import { autoModelRowKind, type AutoModelRow } from "../../lib/auto-model";
import type { PaperItem } from "../../lib/paper-builder";
const chapters = NCTB_CLASSES.find((c) => c.class === "Class 9")!.subjects.find(
  (s) => s.name === "গণিত",
)!.chapters!;
function row(
  id: string,
  ch: number,
  kind: "MCQ" | "CQ" | "SHORT",
  i: number,
): AutoModelRow {
  return {
    id,
    text:
      kind === "CQ"
        ? `লেআউট নমুনা ${i}`
        : `লেআউট নমুনা ${i}: $${i}+2$ এর মান কত?`,
    topic: chapters[ch - 1],
    correct: kind === "MCQ" ? "A" : "",
    explanation: `নমুনা সমাধান: $${i}+2=${i + 2}$। এটি কেবল লেআউট পরীক্ষার প্রশ্ন।`,
    options:
      kind === "MCQ"
        ? {
            A: String(i + 2),
            B: String(i + 3),
            C: String(i + 4),
            D: String(i + 5),
          }
        : kind === "CQ"
          ? {
              stimulus: `লেআউট নমুনা ${i}: একটি রাশির মান $x=${i}$।${ch === 6 ? `\n![নমুনা চিত্র](${location.origin}/diagrams/trigonometry.png)` : ""}`,
              subQuestions: {
                k: "$x$ এর মান লেখো।",
                kh: "$x+2$ এর মান নির্ণয় করো।",
                g: "$x^2$ ও $x+2$ তুলনা করো।",
              },
              marks: { k: 2, kh: 4, g: 4 },
            }
          : {},
  };
}
export const mcqRows = Array.from({ length: 40 }, (_, i) =>
  row(`test-mcq-${i}`, (i % 17) + 1, "MCQ", i + 1),
);
export const writtenRows = [
  ...[1, 6, 9, 17].flatMap((ch, i) => [
    row(`test-cq-${i}a`, ch, "CQ", i * 2 + 1),
    row(`test-cq-${i}b`, ch, "CQ", i * 2 + 2),
  ]),
  ...Array.from({ length: 15 }, (_, i) =>
    row(`test-short-${i}`, (i % 17) + 1, "SHORT", i + 1),
  ),
];
export const fixtureItems: PaperItem[] = [...mcqRows, ...writtenRows].map(
  (q) => {
    const o = q.options as Record<string, any>;
    return {
      ...q,
      category: "SSC",
      subject: "গণিত",
      type: autoModelRowKind(q)!,
      options: q.correct ? o : undefined,
      stimulus: o.stimulus,
      subQuestions: o.subQuestions ? { ...o.subQuestions, gh: "" } : undefined,
    };
  },
);
