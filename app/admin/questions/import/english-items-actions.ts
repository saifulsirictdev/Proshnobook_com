"use server";
import { preparedEnglishImportItems as preparedEnglishItems } from "@/lib/english/prepared-import-items";
import { englishAdminGrade, englishAdminPaper } from "@/lib/english/admin-scope";
import { staff } from "@/lib/guard";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
export async function saveEnglishQuestionItem(form: FormData) {
  const actor = await staff();
  const grade = englishAdminGrade(form.get("grade") ?? 6);
  const paper = englishAdminPaper(form.get("paper"));
  if (!grade || !paper) return;
  if (!actor.id || form.get("reviewed") !== "yes") return;
  const key = String(form.get("key") ?? "");
  const prepared = preparedEnglishItems(grade, paper).find(p => p.key === key);
  if (!prepared) return;
  await db.setting.createMany({data:[{key,value:JSON.stringify({status:"PENDING",draft:prepared.draft,group:prepared.group,...("review" in prepared ? {review:prepared.review} : {}),importedBy:actor.id,importedAt:new Date().toISOString()})}],skipDuplicates:true});
  revalidatePath("/admin/questions/import");
  revalidatePath("/admin/questions");
}
