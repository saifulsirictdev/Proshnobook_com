"use server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { englishSourceImportDigest, preparedEnglishSources } from "@/lib/english/source-import";
export type SourceImportState = { error?: string; message?: string };
export async function importEnglishSources(_: SourceImportState, form: FormData): Promise<SourceImportState> {
  const user = (await auth())?.user;
  if (!user?.id || user.role !== "ADMIN") return { error: "শুধু ADMIN source import করতে পারবেন।" };
  if (form.get("digest") !== englishSourceImportDigest() || form.get("reviewed") !== "yes")
    return { error: "Source preview ও সীমাবদ্ধতা দেখে সম্মতি দিন; পুরোনো preview হলে পেজ refresh করুন।" };
  try {
    const sources = preparedEnglishSources();
    // One atomic insert; deterministic content keys and skipDuplicates make retries safe.
    // Existing Pending/approved/rejected records are NEVER overwritten or reset.
    const result = await db.setting.createMany({
      data: sources.map(({ key, payload }) => ({ key, value: JSON.stringify({ version: 1, status: "PENDING", source: payload, importedBy: user.id, importedAt: new Date().toISOString(), teacherApproved: false }) })),
      skipDuplicates: true,
    });
    revalidatePath("/admin/english-review");
    return { message: `${result.count}টি নতুন source Pending হিসেবে import হয়েছে; ${sources.length - result.count}টি আগে থেকেই ছিল। কোনো প্রশ্ন তৈরি, অনুমোদন বা প্রকাশ হয়নি।` };
  } catch {
    return { error: "Import ফল নিশ্চিত হয়নি। পেজ refresh করে সংরক্ষিত source দেখুন; আবার চেষ্টা করলে একই source duplicate হবে না।" };
  }
}
