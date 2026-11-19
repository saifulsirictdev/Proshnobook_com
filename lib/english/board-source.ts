import { z } from "zod";

/** Original examination provenance, not the compilation's publication/target year. */
export const englishBoardSourceSchema = z.object({
  board: z.enum(["Dhaka", "Rajshahi", "Jashore", "Cumilla", "Chattogram", "Barishal", "Sylhet", "Dinajpur", "Mymensingh", "Combined"]),
  examYear: z.number().int().min(1990).max(2100),
  sourceFile: z.string().trim().min(1).max(300),
  pdfPage: z.number().int().min(1).max(10000),
  questionNumber: z.number().int().min(1).max(100),
  originalMarks: z.number().positive().max(100).optional(),
  originalSubitemCount: z.number().int().min(1).max(26).optional(),
  selectedParts: z.array(z.string().regex(/^[a-z]$/)).min(1).max(26).refine(parts => new Set(parts).size === parts.length).optional(),
}).strict().refine(source => {
  if (source.originalSubitemCount === undefined) return source.selectedParts === undefined;
  return source.selectedParts !== undefined && source.selectedParts.length <= source.originalSubitemCount && source.selectedParts.every(part => part.charCodeAt(0) - 97 < source.originalSubitemCount!);
}, "Original subitem count and selected parts must agree.");
export type EnglishBoardSource = z.infer<typeof englishBoardSourceSchema>;
export const englishBoardFilterSchema = z.object({
  examYear: z.number().int().min(1990).max(2100).optional(),
  school: z.string().trim().min(1).max(200).optional(),
}).strict().refine(filter => filter.examYear === undefined || filter.school === undefined,
  "Choose either a board year or a school, not both.");
export type EnglishBoardFilter = z.infer<typeof englishBoardFilterSchema>;

export function englishBoardLabel(source: EnglishBoardSource) {
  const parts = source.selectedParts;
  const complete = parts && parts.length === source.originalSubitemCount;
  return `${source.board} Board ${source.examYear} · Q${source.questionNumber}${complete ? ` · মূল ${source.originalSubitemCount}টি অংশ অক্ষুণ্ণ` : parts ? ` · নির্বাচিত অংশ: ${parts.join(",")} (মূল ${source.originalSubitemCount}টি থেকে)` : ""}`;
}

/** School examinations are not board examinations or compilation target years. */
export const englishSchoolSourceSchema = z.object({
  school: z.string().trim().min(1).max(200),
  examType: z.enum(["Test", "Pre-Test", "Annual", "Model"]),
  examYear: z.number().int().min(1990).max(2100).optional(),
  sourceFile: z.string().trim().min(1).max(300),
  pdfPage: z.number().int().min(1).max(10000),
  questionNumber: z.number().int().min(1).max(100),
  originalMarks: z.number().positive().max(100).optional(),
}).strict();
export type EnglishSchoolSource = z.infer<typeof englishSchoolSourceSchema>;
export function englishSchoolLabel(source: EnglishSchoolSource) {
  return `${source.school} · ${source.examType}${source.examYear ? ` ${source.examYear}` : ""} · Q${source.questionNumber} (School, not board)`;
}
