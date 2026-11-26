import { z } from "zod";

export const BANK_PAGE_SIZE = 24;
export const BANK_TRASH_PREFIX = "question-bank-trash:v1:";
export const BANK_AUDIT_PREFIX = "question-bank-audit:v1:";
export const BANK_IMAGE_PREFIX = "question-bank-image:v1:";
export {
  questionImagePath,
  IMAGE_ID,
  isQuestionImagePath,
} from "./question-bank-images";
const field = (max: number) => z.string().trim().min(1).max(max);
const optionsSchema = z.record(z.string().max(100), z.unknown());
export const bankDraftSchema = z
  .object({
    category: field(100),
    subject: field(200),
    topic: field(500),
    type: z.enum(["MCQ", "CQ", "SQ"]),
    lang: z.enum(["Bangla", "English"]),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
    text: field(12000),
    explanation: z.string().trim().max(20000),
    options: optionsSchema,
    correct: z.string().max(1),
  })
  .strict()
  .superRefine((q, ctx) => {
    const fail = (message: string) => ctx.addIssue({ code: "custom", message });
    if (JSON.stringify(q.options).length > 30000)
      fail("অপশনের তথ্য অতিরিক্ত বড়।");
    if (q.type === "MCQ") {
      const values = ["A", "B", "C", "D"].map((k) => q.options[k]);
      if (
        values.some(
          (v) => typeof v !== "string" || !v.trim() || v.length > 6000,
        )
      )
        fail("MCQ-তে A–D চারটি পূর্ণ অপশন দিন।");
      if (
        new Set(
          values.map((v) =>
            typeof v === "string"
              ? v
                  .normalize("NFKC")
                  .replace(/[\u200b-\u200d\ufeff]/g, "")
                  .replace(/\s+/g, " ")
                  .trim()
                  .toLowerCase()
              : "",
          ),
        ).size !== 4
      )
        fail("চারটি অপশন আলাদা হতে হবে।");
      if (!/^[ABCD]$/.test(q.correct)) fail("সঠিক উত্তর A, B, C বা D দিন।");
      if (q.options.stimulus || q.options.subQuestions)
        fail("MCQ-তে CQ-এর কাঠামো রাখা যাবে না।");
    } else {
      if (q.correct !== "") fail("লিখিত প্রশ্নে MCQ answer key থাকবে না।");
      if (q.type === "CQ") {
        const sub = q.options.subQuestions as
          | Record<string, unknown>
          | undefined;
        const marks = q.options.marks as Record<string, unknown> | undefined;
        const math = /গণিত|mathematics/i.test(q.subject);
        const keys = math ? ["k", "kh", "g"] : ["k", "kh", "g", "gh"];
        const expected = math ? [2, 4, 4] : [1, 2, 3, 4];
        if (
          !sub ||
          !marks ||
          typeof sub !== "object" ||
          typeof marks !== "object" ||
          keys.some(
            (k, i) =>
              typeof sub[k] !== "string" ||
              !(sub[k] as string).trim() ||
              (sub[k] as string).length > 6000 ||
              marks[k] !== expected[i],
          ) ||
          Object.keys(sub).some((k) => !keys.includes(k)) ||
          Object.keys(marks).some((k) => !keys.includes(k))
        )
          fail(
            "CQ-তে পূর্ণ অংশ ও সঠিক নম্বর দিন: গণিতে ২–৪–৪, অন্য বিষয়ে ১–২–৩–৪।",
          );
        if (
          typeof q.options.stimulus !== "string" ||
          !q.options.stimulus.trim()
        )
          fail("CQ-এর উদ্দীপক দিন।");
      } else if (
        ["stimulus", "subQuestions", "k", "ক", "A", "B", "C", "D"].some(
          (k) => q.options[k],
        )
      )
        fail("SQ-তে MCQ/CQ-এর অপশন রাখা যাবে না।");
    }
  });
export type BankDraft = z.infer<typeof bankDraftSchema>;
export type BankQuestion = {
  id: string;
  category: string;
  subject: string;
  topic: string;
  lang: string;
  difficulty: string;
  text: string;
  options: unknown;
  correct: string;
  explanation: string;
  approved: boolean;
  source: string;
  createdAt: string | Date;
};
export type BankRow = BankQuestion & {
  revision: string;
  kind: "MCQ" | "CQ" | "SQ";
};
export function bankKind(q: {
  correct: string;
  options: unknown;
  text: string;
}): "MCQ" | "CQ" | "SQ" {
  const o =
    q.options && typeof q.options === "object" && !Array.isArray(q.options)
      ? (q.options as Record<string, unknown>)
      : {};
  return q.correct?.trim()
    ? "MCQ"
    : o.stimulus || o.subQuestions || o.k || o.ক || q.text.includes("(ক)")
      ? "CQ"
      : "SQ";
}
export function normalizeBankStem(text: string) {
  return text
    .normalize("NFKC")
    .replace(/[\u200b-\u200d\ufeff]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
export const bankFiltersSchema = z.object({
  category: z.string().max(100).default(""),
  subject: z.string().max(200).default(""),
  topic: z.string().max(500).default(""),
  q: z.string().max(200).default(""),
  kind: z.enum(["ALL", "MCQ", "CQ", "SQ"]).default("ALL"),
  status: z.enum(["all", "pending", "approved", "trash"]).default("all"),
  difficulty: z.enum(["ALL", "EASY", "MEDIUM", "HARD"]).default("ALL"),
  page: z.coerce.number().int().min(1).max(100000).default(1),
});
export type BankFilters = z.infer<typeof bankFiltersSchema>;
export const bankMutationSchema = z.discriminatedUnion("operation", [
  z
    .object({
      operation: z.literal("rollback"),
      id: field(200),
      revision: field(64),
      snapshotKey: field(500),
      version: z.enum(["before", "after"]),
    })
    .strict(),
  z.object({ operation: z.literal("create"), draft: bankDraftSchema }).strict(),
  z
    .object({
      operation: z.literal("edit"),
      id: field(200),
      revision: field(64),
      draft: bankDraftSchema,
    })
    .strict(),
  z
    .object({
      operation: z.enum(["approve", "pending", "trash", "restore"]),
      id: field(200),
      revision: field(64),
    })
    .strict(),
]);
