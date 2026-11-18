"use server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { randomUUID } from "node:crypto";
import { assembleEnglishItems } from "@/lib/english/item-bank";
import { loadEnglishStock } from "@/lib/english/stock";
import { englishOwnerPrefix, validateEnglishDraft } from "@/lib/english/draft";
import { paperHeaderSchema } from "@/lib/paper-header";
/** Database-only first-paper auto models: no provider, generation quota or source form. */
export async function prepareEnglishBankModel(grade: number, itemIds?: string[]) {
  const user = (await auth())?.user;
  if (!user?.id || user.role === "STUDENT") return { ok: false as const, error: "আগে শিক্ষক/অনুমোদিত অ্যাকাউন্টে লগইন করুন।" };
  if (!Number.isInteger(grade) || grade < 6 || grade > 12) return { ok: false as const, error: "শ্রেণি যাচাই করুন।" };
  try {
    const stock = await loadEnglishStock(grade, (prefix, cursor) => db.setting.findMany({
      where: {key:{startsWith:prefix,...(cursor ? {gt:cursor} : {})}}, orderBy:{key:"asc"}, take:100,
    }));
    const assembled = assembleEnglishItems(stock, grade, Math.random, itemIds);
    const chosen = assembled.draft;
    if (!chosen) return { ok: false as const, error: `এই শ্রেণির প্রশ্নভান্ডারে কিছু অংশ এখনো প্রস্তুত নেই। অনুগ্রহ করে পরে আবার চেষ্টা করুন।` };
    const draft = validateEnglishDraft({ ...chosen, name: `Class ${grade} — ${itemIds ? "Selected Question Items" : "Full Model Test"}`, header: paperHeaderSchema.parse({}), updatedAt: new Date().toISOString() });
    const key = englishOwnerPrefix(user.id) + randomUUID();
    await db.setting.create({ data: { key, value: JSON.stringify(draft) } });
    return { ok: true as const, key };
  } catch { return { ok: false as const, error: "Database থেকে পূর্ণ মডেল আনা/সেভ করা যায়নি। AI চালানো হয়নি। আমার draft দেখে আবার চেষ্টা করুন।" }; }
}
