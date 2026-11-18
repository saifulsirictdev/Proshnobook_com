import { z } from "zod";

/** Original examination provenance, not the compilation's publication/target year. */
export const englishBoardSourceSchema = z.object({
  board: z.enum(["Dhaka", "Rajshahi", "Jashore", "Cumilla", "Chattogram", "Barishal", "Sylhet", "Dinajpur", "Mymensingh", "Combined"]),
  examYear: z.number().int().min(1990).max(2100),
  sourceFile: z.string().trim().min(1).max(300),
  pdfPage: z.number().int().min(1).max(10000),
  questionNumber: z.number().int().min(1).max(100),
  originalMarks: z.number().positive().max(100).optional(),
}).strict();
export type EnglishBoardSource = z.infer<typeof englishBoardSourceSchema>;
export const englishBoardFilterSchema = z.object({
  examYear: z.number().int().min(1990).max(2100).optional(),
}).strict();
export type EnglishBoardFilter = z.infer<typeof englishBoardFilterSchema>;

export function englishBoardLabel(source: EnglishBoardSource) {
  return `${source.board} Board ${source.examYear} · Q${source.questionNumber}`;
}
