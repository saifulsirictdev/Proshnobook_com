"use server";
import type { EnglishPaper } from "@/lib/english/blueprints";
import { englishBoardFilterSchema, type EnglishBoardFilter } from "@/lib/english/board-source";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { randomUUID } from "node:crypto";
import { assembleEnglishItems, englishItemGroups } from "@/lib/english/item-bank";
import { loadEnglishStock } from "@/lib/english/stock";
import { englishOwnerPrefix, validateEnglishDraft } from "@/lib/english/draft";
/** Database-only English item/model assembly: no provider, generation quota or source form. */
export async function prepareEnglishBankModel(grade: number, itemIds?: string[], filter: EnglishBoardFilter = {}, paper: EnglishPaper = 1) {
  const user = (await auth())?.user;
  if (!user?.id || user.role === "STUDENT") return { ok: false as const, error: "আগে শিক্ষক/অনুমোদিত অ্যাকাউন্টে লগইন করুন।" };
  if (!Number.isInteger(grade) || grade < 6 || grade > 12 || (paper !== 1 && paper !== 2)) return { ok: false as const, error: "শ্রেণি যাচাই করুন।" };
  const parsedFilter = englishBoardFilterSchema.safeParse(filter);
  if (!parsedFilter.success || ((parsedFilter.data.examYear !== undefined || parsedFilter.data.school !== undefined) && grade !== 9 && grade !== 10)) return { ok: false as const, error: "SSC বোর্ড পরীক্ষার সাল অথবা স্কুলের নাম যাচাই করুন।" };
  try {
    const stock = await loadEnglishStock(grade, (prefix, cursor) => db.setting.findMany({
      where: {key:{startsWith:prefix,...(cursor ? {gt:cursor} : {})}}, orderBy:{key:"asc"}, take:100,
    }), paper);
    const compatibleStock = grade === 8 && paper === 2 && !itemIds
      ? stock.filter(d => d.selection.modelStyle === "class8-reference-v1") : stock;
    const assembled = assembleEnglishItems(compatibleStock, grade, Math.random, itemIds, parsedFilter.data, paper);
    const chosen = assembled.draft;
    if (!chosen) return { ok: false as const, reason: "MISSING_APPROVED_ITEMS" as const, missingIds: assembled.missing, error: `এই শ্রেণির প্রশ্নভান্ডারে কিছু অংশ এখনো প্রস্তুত নেই${parsedFilter.data.school ? ` (স্কুল: ${parsedFilter.data.school})` : parsedFilter.data.examYear ? ` (বোর্ড পরীক্ষার সাল: ${parsedFilter.data.examYear})` : ""}। অনুগ্রহ করে পরে আবার চেষ্টা করুন।` };
    const draft = validateEnglishDraft({ ...chosen, name: `Class ${grade} — ${itemIds ? "Selected Question Items" : "Full Model Test"}`, header: chosen.header, updatedAt: new Date().toISOString() });
    const key = englishOwnerPrefix(user.id) + randomUUID();
    await db.setting.create({ data: { key, value: JSON.stringify(draft) } });
    return { ok: true as const, key };
  } catch { return { ok: false as const, reason: "DATABASE_FAILURE" as const, error: "Database থেকে পূর্ণ মডেল আনা/সেভ করা যায়নি। AI চালানো হয়নি। আমার draft দেখে আবার চেষ্টা করুন।" }; }
}

/** Options come only from approved, grade-matched reusable stock, not draft candidates. */
export async function listEnglishBankSchools(grade: number) {
  const user = (await auth())?.user;
  if (!user?.id || user.role === "STUDENT") return { schools: [] as string[], error: "স্কুলের প্রশ্ন দেখতে শিক্ষক/অনুমোদিত অ্যাকাউন্টে লগইন করুন।" };
  if (grade !== 9 && grade !== 10) return { schools: [] as string[], error: "স্কুল ফিল্টার শুধু SSC প্রথম পত্রে প্রযোজ্য।" };
  try {
    const stock = await loadEnglishStock(grade, (prefix, cursor) => db.setting.findMany({
      where: { key: { startsWith: prefix, ...(cursor ? { gt: cursor } : {}) } }, orderBy: { key: "asc" }, take: 100,
    }));
    const schools = new Set<string>();
    for (const draft of stock) for (const group of englishItemGroups(draft)) {
      const school = group.draft.output.tasks[0]?.schoolSource?.school;
      if (school && group.draft.output.tasks.every(task => task.schoolSource?.school === school && !task.boardSource)) schools.add(school);
    }
    return { schools: [...schools].sort((a, b) => a.localeCompare(b)), error: "" };
  } catch {
    return { schools: [] as string[], error: "অনুমোদিত স্কুলের তালিকা আনা যায়নি। আবার চেষ্টা করুন।" };
  }
}
