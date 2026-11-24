"use server";
import { prepareEnglishBankModel } from "./english-bank-model";
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
  itemIds: z.array(z.string().min(1).max(80)).min(1).max(20).optional(),
  sources: z.record(z.string(), z.object({ text: z.string().trim().min(1).max(20000), reference: z.string().trim().min(1).max(500) }).strict()).default({}),
}).strict();
/** Both papers assemble approved stock before the source-aware AI gap pipeline.
 * Never synthesise a seen passage or silently substitute another class's source.
 */
export async function prepareEnglishFullModel(raw: unknown) {
  const user = (await auth())?.user;
  if (!user?.id || user.role === "STUDENT") return { ok: false as const, error: "আগে শিক্ষক/অনুমোদিত অ্যাকাউন্টে লগইন করুন।" };
  const parsed = input.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "শ্রেণি ও textbook source যাচাই করুন।" };
  const grade = parsed.data.grade as EnglishGrade;
  const paper = parsed.data.paper;
  let items=englishBlueprint(grade,paper).items.filter(i=>!parsed.data.itemIds||parsed.data.itemIds.includes(i.id));
  if(parsed.data.itemIds&&(new Set(parsed.data.itemIds).size!==parsed.data.itemIds.length||items.length!==parsed.data.itemIds.length))return {ok:false as const,error:"নির্বাচিত প্রশ্নের অংশ এই শ্রেণি–পত্রের নয়।"};
  let required = [...new Set(items.map(i => i.sourceGroup).filter((k): k is NonNullable<typeof k> => !!k && k !== "unseen"))];
  if (Object.keys(parsed.data.sources).some(k => !required.includes(k as typeof required[number]))) return { ok: false as const, error: "অপ্রত্যাশিত textbook source।" };
  // Auto mode has no user-selected writing topic. Reuse a complete approved
  // model with its own topics, rather than looking for fixed default topics
  // that usually do not exist in the bank and unnecessarily invoking AI.
  const bank = await prepareEnglishBankModel(grade, parsed.data.itemIds, {}, paper);
  if (bank.ok || !("reason" in bank) || bank.reason !== "MISSING_APPROVED_ITEMS") return bank;
  // Carry the compatible bank groups' exact source/writing signatures into the
  // gap pipeline. Otherwise default topics/random extracts would discard stock.
  const reuse=bank.reuse;
  if(reuse?.modelStyle){
    items=englishBlueprint(grade,paper,reuse.modelStyle).items.filter(i=>!parsed.data.itemIds||parsed.data.itemIds.includes(i.id));
    required=[...new Set(items.map(i=>i.sourceGroup).filter((k):k is NonNullable<typeof k>=>!!k&&k!=="unseen"))];
  }
  // Only an explicit stock shortfall permits AI; DB/auth/save failures do not.
  const approved = required.length ? await loadEnglishModelSources(grade, paper) : { sources: {}, error: "" };
  if(approved.error)return {ok:false as const,error:"Textbook source-এর ডাটাবেজ যাচাই করা যায়নি। AI চালানো হয়নি।"};
  const sources = Object.fromEntries(Object.entries({ ...bundledEnglishModelSources(grade, paper), ...approved.sources, ...reuse?.sources, ...parsed.data.sources }).filter(([key])=>required.includes(key as typeof required[number])));
  const missing = required.filter(k => !sources[k]);
  if (missing.length) return { ok: false as const, error: "বইয়ের নির্ভরযোগ্য seen passage/poem/story নেই। শুধু নিচের অনুপস্থিত textbook extract/reference দিন; বাকি প্রশ্ন স্বয়ংক্রিয়ভাবে তৈরি হবে।", missing };
  return generateEnglishPaper({ grade, paper, mode: parsed.data.itemIds ? "selected" : "full", itemIds: parsed.data.itemIds??[], writing: Object.fromEntries(Object.entries({...fullModelWriting(grade, paper),...reuse?.writing}).filter(([id])=>items.some(i=>i.id===id))), sources, includeAnswers: true, ...(reuse?.modelStyle?{modelStyle:reuse.modelStyle}:grade === 8 && paper === 2 ? {modelStyle: "class8-reference-v1"} : {}) });
}
