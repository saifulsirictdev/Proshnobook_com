"use server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { preparedCompleteEnglishModel } from "@/lib/english/prepared-complete-model";
export async function importCompleteEnglishModel(_: { message?: string; error?: string }, form: FormData) {
  const user = (await auth())?.user;
  if (!user?.id || user.role !== "ADMIN") return { error: "শুধু ADMIN import করতে পারবেন।" };
  try {
    const prepared = preparedCompleteEnglishModel();
    if (form.get("digest") !== prepared.digest || form.get("reviewed") !== "yes") return { error: "প্রশ্ন–উত্তর preview ও সীমাবদ্ধতা দেখে সম্মতি দিন।" };
    const result = await db.setting.createMany({ data: [{ key: prepared.key, value: JSON.stringify({ status: "PENDING", draft: prepared.draft, provenance: prepared.provenance, importedBy: user.id, importedAt: new Date().toISOString() }) }], skipDuplicates: true });
    revalidatePath("/admin/english-review");
    return { message: result.count ? "একটি পূর্ণ ১০০ নম্বরের প্রশ্ন–উত্তর মডেল Pending import হয়েছে। নিচে review করে অনুমোদন দিন। প্রকাশ হয়নি।" : "এই মডেল আগে থেকেই আছে; নতুন duplicate হয়নি বা আগের সিদ্ধান্ত বদলায়নি।" };
  } catch { return { error: "Import ফল নিশ্চিত হয়নি। পেজ refresh করে মডেলের status দেখুন। আবার চেষ্টা করলে duplicate হবে না।" }; }
}
