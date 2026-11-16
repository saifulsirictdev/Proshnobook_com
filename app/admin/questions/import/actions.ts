"use server";
import { staff } from "@/lib/guard";
import { db } from "@/lib/db";
import { batchDigest, draftId, normalizeStem, parseMCQBatch } from "@/lib/mcq-import";
import { revalidatePath } from "next/cache";
export type ImportState = { error?: string; digest?: string; preview?: { text: string; options: Record<string, string>; answer: string; explanation: string; page: string }[]; message?: string };
export async function inspectBatch(_: ImportState, form: FormData): Promise<ImportState> {
  try {
    await staff();
    const batch = parseMCQBatch(String(form.get("batch") ?? ""));
    return { digest: batchDigest(batch), preview: batch.items.map(q => ({ text: q.text, options: q.options, answer: `${q.correct}: ${q.options[q.correct]}`, explanation: q.explanation, page: q.page })) };
  } catch { return { error: "যাচাই হয়নি: ADMIN অনুমতি, JSON format, বিষয়/অধ্যায়, উৎস, চারটি স্বতন্ত্র অপশন ও উত্তর পরীক্ষা করুন। ব্যাচে ১–১০০টি প্রশ্ন দিন।" }; }
}
export async function saveBatch(_: ImportState, form: FormData): Promise<ImportState> {
  try {
    const actor = await staff();
    if (!actor.id || form.get("reviewed") !== "yes") throw Error("review required");
    const batch = parseMCQBatch(String(form.get("batch") ?? ""));
    const digest = batchDigest(batch);
    if (form.get("digest") !== digest) throw Error("preview changed");
    // Serializable retry protects concurrent overlapping batches; deterministic IDs
    // also prevent two imports of the same normalized stem from creating duplicates.
    let result: { inserted: number; skipped: number } | undefined;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        result = await db.$transaction(async tx => {
          const key = `mcqimport:v1:${digest}`;
          const old = await tx.setting.findUnique({ where: { key } });
          if (old) return { inserted: 0, skipped: batch.items.length };
          const existing = await tx.question.findMany({ where: { category: "Class 6", subject: batch.subject, topic: batch.topic }, select: { text: true } });
          const stems = new Set(existing.map(q => normalizeStem(q.text)));
          const fresh = batch.items.filter(q => !stems.has(normalizeStem(q.text)));
          const ids: string[] = [];
          for (const q of fresh) {
            const id = draftId(batch.subject, batch.topic, q.text);
            await tx.question.create({ data: {
              id, category: "Class 6", subject: batch.subject, topic: batch.topic,
              text: q.text, options: q.options, correct: q.correct, explanation: q.explanation,
              difficulty: q.difficulty, lang: batch.lang, approved: false,
              source: `CURATED_DRAFT:${digest}`,
            } });
            ids.push(id);
          }
          await tx.setting.create({ data: { key, value: JSON.stringify({ version: 1, actorId: actor.id, createdAt: new Date().toISOString(), subject: batch.subject, topic: batch.topic, book: batch.book, edition: batch.edition, sourceUrl: batch.sourceUrl, ids, references: fresh.map(q => ({ id: draftId(batch.subject, batch.topic, q.text), page: q.page })), inserted: ids.length, skipped: batch.items.length - ids.length }) } });
          return { inserted: ids.length, skipped: batch.items.length - ids.length };
        }, { isolationLevel: "Serializable", timeout: 20000 });
        break;
      } catch (e) {
        if (attempt === 2 || !["P2034", "P2002"].includes((e as { code?: string }).code ?? "")) throw e;
      }
    }
    if (!result) throw Error("not saved");
    revalidatePath("/admin/questions/import");
    revalidatePath("/admin/questions");
    return { message: `${result.inserted}টি Pending প্রশ্ন সেভ হয়েছে; ${result.skipped}টি বিদ্যমান/পুনরায় পাঠানো প্রশ্ন বাদ। প্রকাশের আগে আলাদা বিষয়ভিত্তিক যাচাই করুন।` };
  } catch { return { error: "সেভ হয়নি। ADMIN অনুমতি ও উৎস যাচাইয়ের সম্মতি দিন; প্রশ্ন বদলালে আবার প্রিভিউ করুন। সমস্যা থাকলে একই ব্যাচ নিরাপদে পুনরায় পাঠাতে পারেন।" }; }
}
