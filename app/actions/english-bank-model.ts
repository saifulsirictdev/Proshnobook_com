"use server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { randomUUID } from "node:crypto";
import { approvedCompleteEnglishModel } from "@/lib/english/complete-model-bank";
import { englishOwnerPrefix, validateEnglishDraft } from "@/lib/english/draft";
import { paperHeaderSchema } from "@/lib/paper-header";
/** Database-only first-paper auto models: no provider, generation quota or source form. */
export async function prepareEnglishBankModel(grade: number) {
  const user = (await auth())?.user;
  if (!user?.id || user.role === "STUDENT") return { ok: false as const, error: "আগে শিক্ষক/অনুমোদিত অ্যাকাউন্টে লগইন করুন।" };
  if (!Number.isInteger(grade) || grade < 6 || grade > 12) return { ok: false as const, error: "শ্রেণি যাচাই করুন।" };
  try {
    let cursor: string | undefined;
    let chosen: ReturnType<typeof approvedCompleteEnglishModel> = null, count = 0;
    for (let page = 0; page < 10; page++) {
      const rows: { key: string; value: string }[] = await db.setting.findMany({
        where: { key: { startsWith: "english-review:", ...(cursor ? { gt: cursor } : {}) } },
        orderBy: { key: "asc" }, take: 100,
      });
      for (const row of rows) {
        const draft = approvedCompleteEnglishModel(row.value, grade, 1);
        if (draft && Math.random() < 1 / ++count) chosen = draft;
      }
      if (rows.length < 100 || rows.at(-1)?.key === cursor) break;
      cursor = rows.at(-1)!.key;
    }
    if (!chosen) return { ok: false as const, error: `Class ${grade} English 1st Paper-এর সব অংশ ও উত্তরসহ অনুমোদিত পূর্ণ মডেল পাওয়া যায়নি। ADMIN-কে সম্পূর্ণ প্রশ্ন–উত্তর মডেল Pending import করে review/approve করতে হবে। AI চালানো হয়নি; কোনো generation quota খরচ হয়নি।` };
    const draft = validateEnglishDraft({ ...chosen, name: `Class ${grade} — database model`, header: paperHeaderSchema.parse({}), updatedAt: new Date().toISOString() });
    const key = englishOwnerPrefix(user.id) + randomUUID();
    await db.setting.create({ data: { key, value: JSON.stringify(draft) } });
    return { ok: true as const, key };
  } catch { return { ok: false as const, error: "Database থেকে পূর্ণ মডেল আনা/সেভ করা যায়নি। AI চালানো হয়নি। আমার draft দেখে আবার চেষ্টা করুন।" }; }
}
