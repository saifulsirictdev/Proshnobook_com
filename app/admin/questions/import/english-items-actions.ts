"use server";
import { staff } from "@/lib/guard";
import { db } from "@/lib/db";
import { preparedCompleteEnglishModels } from "@/lib/english/prepared-complete-model";
import { englishItemGroups } from "@/lib/english/item-bank";
import { revalidatePath } from "next/cache";
export async function saveEnglishQuestionItem(form: FormData) {
  const actor = await staff();
  if (!actor.id || form.get("reviewed") !== "yes") return;
  const key = String(form.get("key") ?? "");
  const prepared = preparedCompleteEnglishModels().flatMap(m => englishItemGroups(m.draft)).find(p => p.key === key);
  if (!prepared) return;
  await db.setting.createMany({data:[{key,value:JSON.stringify({status:"PENDING",draft:prepared.draft,group:prepared.group,importedBy:actor.id,importedAt:new Date().toISOString()})}],skipDuplicates:true});
  revalidatePath("/admin/questions/import");
  revalidatePath("/admin/questions");
}
