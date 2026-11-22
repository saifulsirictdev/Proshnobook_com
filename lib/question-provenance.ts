import { z } from "zod";

/** Stable filter keys, independent of Bengali display labels. Never infer from a filename. */
export const QUESTION_BOARDS = {
  dhaka: "ঢাকা", rajshahi: "রাজশাহী", cumilla: "কুমিল্লা", jashore: "যশোর",
  chattogram: "চট্টগ্রাম", barishal: "বরিশাল", sylhet: "সিলেট", dinajpur: "দিনাজপুর",
  mymensingh: "ময়মনসিংহ", madrasah: "মাদ্রাসা", technical: "কারিগরি",
} as const;
export const questionBoardSchema = z.enum([
  "dhaka", "rajshahi", "cumilla", "jashore", "chattogram", "barishal", "sylhet",
  "dinajpur", "mymensingh", "madrasah", "technical",
]);
const text = z.string().trim().min(1).max(240);
const year = z.number().int().min(1900).max(2100);
const reference = {
  sourceFile: text,
  pdfPage: z.number().int().min(1).max(100000),
  printedPage: z.string().trim().min(1).max(40).optional(),
  questionNumber: z.string().trim().min(1).max(40),
};
export const questionProvenanceSchema = z.discriminatedUnion("kind", [
  z.object({ ...reference, kind: z.literal("board"), board: questionBoardSchema, examYear: year }).strict(),
  z.object({ ...reference, kind: z.literal("school"), school: text, examType: text.optional(), examYear: year.optional() }).strict(),
]);
/** A question may really have appeared in more than one board/year; keep all known occurrences. */
export const questionProvenanceListSchema = z.array(questionProvenanceSchema).min(1).max(30);
export type QuestionProvenance = z.infer<typeof questionProvenanceSchema>;
export type QuestionBoard = z.infer<typeof questionBoardSchema>;

export function readQuestionProvenance(raw: unknown): QuestionProvenance[] {
  const parsed = questionProvenanceListSchema.safeParse(raw);
  return parsed.success ? parsed.data : [];
}
/** Supports saved snapshots and reserved metadata in the existing Question.options JSON column. */
export function questionProvenance(q: { provenance?: unknown; options?: unknown }): QuestionProvenance[] {
  const options = q.options && typeof q.options === "object" && !Array.isArray(q.options)
    ? q.options as Record<string, unknown> : {};
  return readQuestionProvenance(q.provenance ?? options._provenance);
}
const bn = (v: number | string) => String(v).replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[Number(d)]);
export function questionProvenanceLabels(q: { provenance?: unknown; options?: unknown }): string[] {
  return [...new Set(questionProvenance(q).map(p => [
    p.kind === "board" ? `${QUESTION_BOARDS[p.board]} বোর্ড` : p.school,
    p.examYear !== undefined ? bn(p.examYear) : undefined,
    p.kind === "school" ? p.examType : undefined,
    `প্রশ্ন ${bn(p.questionNumber)}`,
  ].filter(Boolean).join(" · ")))];
}
/** Future category-selection search can use these fields, never localized label substring matching.
 * This is a pure matcher, not a database query or a new search UI.
 */
export function matchesQuestionBoard(q: { provenance?: unknown; options?: unknown }, board: QuestionBoard, examYear?: number): boolean {
  return questionProvenance(q).some(p => p.kind === "board" && p.board === board && (examYear === undefined || p.examYear === examYear));
}
