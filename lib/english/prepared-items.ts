import { preparedSSCEnglishItems } from "./prepared-ssc-items";
import { createHash } from "node:crypto";
import { preparedCompleteEnglishModels, completeEnglishLibraryDigest } from "./prepared-complete-model";
import { englishItemGroups } from "./item-bank";
/** Register only source-verified, authored grade-specific drafts. Never relabel Class 6. */
export function preparedEnglishItems(grade:number) {
  if (grade===10) return preparedSSCEnglishItems();
  const models = grade===6 ? preparedCompleteEnglishModels() : [];
  return [...new Map(models.flatMap(m=>englishItemGroups(m.draft)).filter(p=>p.draft.selection.grade===grade).map(p=>[p.key,p])).values()];
}
export function englishItemsDigest(grade:number) {
  return grade===6?completeEnglishLibraryDigest():createHash("sha256").update(JSON.stringify({grade,keys:preparedEnglishItems(grade).map(p=>p.key)})).digest("hex");
}
