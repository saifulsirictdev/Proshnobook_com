import { preparedSSCPaper2Items } from "./prepared-ssc-paper2";
import { preparedClass8Paper2Items } from "./prepared-class8-paper2";
import type { EnglishPaper } from "./blueprints";
import { preparedSSCEnglishItems } from "./prepared-ssc-items";
import { createHash } from "node:crypto";
import { preparedCompleteEnglishModels, completeEnglishLibraryDigest } from "./prepared-complete-model";
import { englishItemGroups } from "./item-bank";
/** Register only source-verified, authored grade-specific drafts. Never relabel Class 6. */
function allPreparedEnglishItems(grade:number, paper: EnglishPaper = 1) {
  if (paper === 2) return grade === 8 ? preparedClass8Paper2Items(grade) : preparedSSCPaper2Items(grade);
  if (grade===10) return preparedSSCEnglishItems();
  const models = grade===6 ? preparedCompleteEnglishModels() : [];
  return [...new Map(models.flatMap(m=>englishItemGroups(m.draft)).filter(p=>p.draft.selection.grade===grade).map(p=>[p.key,p])).values()];
}
/** Optional item scope supports one-at-a-time review/import without resetting other items. */
export function preparedEnglishItems(grade:number, paper: EnglishPaper = 1, itemId?: string) {
  const items = allPreparedEnglishItems(grade, paper);
  return itemId === undefined ? items : items.filter(p=>p.draft.selection.itemIds.includes(itemId));
}
export function englishItemsDigest(grade:number, paper: EnglishPaper = 1, itemId?: string) {
  if (grade===6 && paper===1 && itemId===undefined) return completeEnglishLibraryDigest();
  const items = preparedEnglishItems(grade, paper, itemId);
  return createHash("sha256").update(JSON.stringify({
    grade, paper, ...(itemId===undefined ? {} : {itemId}), keys: items.map(p=>p.key),
    // Consent also covers editorial repairs, source transcripts and key-selection maps.
    ...(paper===2 ? {review:items.map(p=>"review" in p ? p.review : null)} : {}),
  })).digest("hex");
}
