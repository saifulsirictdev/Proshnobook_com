"use server";
import { preparedEnglishItems, englishItemsDigest } from "@/lib/english/prepared-items";
import { englishAdminGrade } from "@/lib/english/admin-scope";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
export async function importEnglishItems(form: FormData) {
  const user = (await auth())?.user;
  if (!user?.id || user.role !== "ADMIN") throw new Error("Forbidden");
  const grade = englishAdminGrade(form.get("grade") ?? 6);
  if (!grade) return;
  if (form.get("reviewed") !== "yes" || form.get("digest") !== englishItemsDigest(grade)) return;
  const records = new Map(preparedEnglishItems(grade).map(p => [p.key,p]));
  if (!records.size) return;
  await db.setting.createMany({ data: [...records.values()].map(p => ({key:p.key,value:JSON.stringify({status:"PENDING",draft:p.draft,group:p.group,importedBy:user.id,importedAt:new Date().toISOString()})})), skipDuplicates:true });
  revalidatePath("/admin/english-review");
  revalidatePath("/admin/questions/import");
  revalidatePath("/admin/questions");
}
