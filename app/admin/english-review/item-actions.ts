"use server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { preparedCompleteEnglishModels, completeEnglishLibraryDigest } from "@/lib/english/prepared-complete-model";
import { englishItemGroups } from "@/lib/english/item-bank";
export async function importEnglishItems(form: FormData) {
  const user = (await auth())?.user;
  if (!user?.id || user.role !== "ADMIN") throw new Error("Forbidden");
  if (form.get("reviewed") !== "yes" || form.get("digest") !== completeEnglishLibraryDigest()) return;
  const records = new Map(preparedCompleteEnglishModels().flatMap(m => englishItemGroups(m.draft)).map(p => [p.key, p]));
  await db.setting.createMany({ data: [...records.values()].map(p => ({key:p.key,value:JSON.stringify({status:"PENDING",draft:p.draft,group:p.group,importedBy:user.id,importedAt:new Date().toISOString()})})), skipDuplicates:true });
  revalidatePath("/admin/english-review");
}
