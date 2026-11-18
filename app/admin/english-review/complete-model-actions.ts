"use server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { completeEnglishLibraryDigest, preparedCompleteEnglishModels, preparedCompleteEnglishModel } from "@/lib/english/prepared-complete-model";
export async function importCompleteEnglishModel(_: { message?: string; error?: string }, form: FormData) {
  const user = (await auth())?.user;
  if (!user?.id || user.role !== "ADMIN") return { error: "শুধু ADMIN import করতে পারবেন।" };
  try {
    const bulk = form.get("scope") === "library";
    if (form.get("scope") && !bulk) return { error: "Import scope যাচাই করুন।" };
    const models = bulk ? preparedCompleteEnglishModels() : [preparedCompleteEnglishModel()];
    const digest = bulk ? completeEnglishLibraryDigest() : models[0].digest;
    if (form.get("digest") !== digest || form.get("reviewed") !== "yes") return { error: "প্রশ্ন–উত্তর preview ও সীমাবদ্ধতা দেখে সম্মতি দিন।" };
    const result = await db.setting.createMany({ data: models.map(prepared => ({ key: prepared.key, value: JSON.stringify({ status: "PENDING", draft: prepared.draft, provenance: prepared.provenance, importedBy: user.id, importedAt: new Date().toISOString() }) })), skipDuplicates: true });
    revalidatePath("/admin/english-review");
    return { message: `${result.count}টি পূর্ণ প্রশ্ন–উত্তর মডেল নতুন Pending import হয়েছে; ${models.length - result.count}টি আগে থেকেই ছিল। নিচে প্রতিটি review করে অনুমোদন দিন। প্রকাশ বা আগের সিদ্ধান্ত বদল হয়নি।` };
  } catch { return { error: "Import ফল নিশ্চিত হয়নি। পেজ refresh করে মডেলের status দেখুন। আবার চেষ্টা করলে duplicate হবে না।" }; }
}
