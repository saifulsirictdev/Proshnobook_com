import { preparedSSCPaper2Items } from "./prepared-ssc-paper2";
import type { EnglishPaper } from "./blueprints";
import { preparedSSCEnglishItems } from "./prepared-ssc-items";
import { createHash } from "node:crypto";
import { preparedCompleteEnglishModels, completeEnglishLibraryDigest } from "./prepared-complete-model";
import { englishItemGroups } from "./item-bank";
/** Register only source-verified, authored grade-specific drafts. Never relabel Class 6. */
export function preparedEnglishItems(grade:number, paper: EnglishPaper = 1) {
  if (paper === 2) return preparedSSCPaper2Items(grade);
  if (grade===10) return preparedSSCEnglishItems();
  const models = grade===6 ? preparedCompleteEnglishModels() : [];
  return [...new Map(models.flatMap(m=>englishItemGroups(m.draft)).filter(p=>p.draft.selection.grade===grade).map(p=>[p.key,p])).values()];
}
export function englishItemsDigest(grade:number, paper: EnglishPaper = 1) {
  return grade===6 && paper===1?completeEnglishLibraryDigest():createHash("sha256").update(JSON.stringify({grade,paper,keys:preparedEnglishItems(grade, paper).map(p=>p.key)})).digest("hex");
}
