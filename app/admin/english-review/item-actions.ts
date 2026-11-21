"use server";
import { preparedEnglishImportItems as preparedEnglishItems, englishImportItemsDigest as englishItemsDigest } from "@/lib/english/prepared-import-items";
import { englishAdminGrade, englishAdminPaper } from "@/lib/english/admin-scope";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
export async function importEnglishItems(form: FormData) {
  const user = (await auth())?.user;
  if (!user?.id || user.role !== "ADMIN") throw new Error("Forbidden");
  const grade = englishAdminGrade(form.get("grade") ?? 6);
  const paper = englishAdminPaper(form.get("paper"));
  if (!grade || !paper) return;
  const itemId = form.has("item") ? String(form.get("item")) : undefined;
  if (itemId !== undefined && (!itemId || itemId.length > 80)) return;
  if (form.get("reviewed") !== "yes" || form.get("digest") !== englishItemsDigest(grade, paper, itemId)) return;
  const records = new Map(preparedEnglishItems(grade, paper, itemId).map(p => [p.key,p]));
  if (!records.size) return;
  await db.setting.createMany({ data: [...records.values()].map(p => ({key:p.key,value:JSON.stringify({status:"PENDING",draft:p.draft,group:p.group,...("review" in p ? {review:p.review} : {}),importedBy:user.id,importedAt:new Date().toISOString()})})), skipDuplicates:true });
  revalidatePath("/admin/english-review");
  revalidatePath("/admin/questions/import");
  revalidatePath("/admin/questions");
}
