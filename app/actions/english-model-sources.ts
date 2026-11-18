"use server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { approvedModelSources } from "@/lib/english/model-sources";
import type { EnglishGrade, EnglishPaper } from "@/lib/english/blueprints";
export async function loadEnglishModelSources(grade: number, paper: number) {
  const user = (await auth())?.user;
  if (!user?.id || user.role === "STUDENT" || !Number.isInteger(grade) || grade < 6 || grade > 12 || paper !== 1)
    return { sources: {}, error: "লগইন ও শ্রেণি/পত্র যাচাই করুন।" };
  try {
    // Bounded read-only lookup. No private owner drafts, no approval mutation.
    const sources: Record<string, { text: string; reference: string }> = {};
    let cursor: string | undefined;
    for (let page = 0; page < 10; page++) {
      const rows: { key: string; value: string }[] = await db.setting.findMany({
        where: { key: { startsWith: "english-review:", ...(cursor ? { gt: cursor } : {}) } },
        orderBy: { key: "asc" }, take: 100,
      });
      for (const [key, value] of Object.entries(approvedModelSources(rows, grade as EnglishGrade, paper as EnglishPaper)))
        if (!sources[key]) sources[key] = value;
      if (rows.length < 100) break;
      cursor = rows.at(-1)!.key;
    }
    return { sources, error: "" };
  } catch {
    return { sources: {}, error: "অনুমোদিত source আনা যায়নি। প্রয়োজনীয় textbook extract নিজে দিন।" };
  }
}
