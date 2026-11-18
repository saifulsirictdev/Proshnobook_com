"use server";
import { z } from "zod";
import { auth } from "@/auth";
import { englishBlueprint, type EnglishGrade } from "@/lib/english/blueprints";
import { bundledEnglishModelSources } from "@/lib/english/bundled-model-sources";
import { fullModelWriting } from "@/lib/english/builder-mode";
import { loadEnglishModelSources } from "./english-model-sources";
import { generateEnglishPaper } from "./english-paper";
const input = z.object({
  grade: z.number().int().min(6).max(12),
  paper: z.union([z.literal(1), z.literal(2)]).default(1),
  sources: z.record(z.string(), z.object({ text: z.string().trim().min(1).max(20000), reference: z.string().trim().min(1).max(500) }).strict()).default({}),
}).strict();
/** Explicit full-model entry: server chooses all tasks/marks; bank first, AI for missing tasks.
 * Never synthesise a seen passage or silently substitute another class's source.
 */
export async function prepareEnglishFullModel(raw: unknown) {
  const user = (await auth())?.user;
  if (!user?.id || user.role === "STUDENT") return { ok: false as const, error: "আগে শিক্ষক/অনুমোদিত অ্যাকাউন্টে লগইন করুন।" };
  const parsed = input.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "শ্রেণি ও textbook source যাচাই করুন।" };
  const grade = parsed.data.grade as EnglishGrade;
  const paper = parsed.data.paper;
  const required = [...new Set(englishBlueprint(grade, paper).items.map(i => i.sourceGroup).filter((k): k is NonNullable<typeof k> => !!k && k !== "unseen"))];
  if (Object.keys(parsed.data.sources).some(k => !required.includes(k as typeof required[number]))) return { ok: false as const, error: "অপ্রত্যাশিত textbook source।" };
  const approved = required.length ? await loadEnglishModelSources(grade, paper) : { sources: {}, error: "" };
  const sources = { ...bundledEnglishModelSources(grade, paper), ...approved.sources, ...parsed.data.sources };
  const missing = required.filter(k => !sources[k]);
  if (missing.length) return { ok: false as const, error: "বইয়ের নির্ভরযোগ্য seen passage/poem/story নেই। শুধু নিচের অনুপস্থিত textbook extract/reference দিন; বাকি প্রশ্ন স্বয়ংক্রিয়ভাবে তৈরি হবে।", missing };
  return generateEnglishPaper({ grade, paper, mode: "full", itemIds: [], writing: fullModelWriting(grade, paper), sources, includeAnswers: true });
}
