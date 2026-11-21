import { createHash } from "node:crypto";
import { preparedEnglishItems, englishItemsDigest } from "./prepared-items";
import { preparedJuniorPaper2ExpansionItems } from "./prepared-junior-paper2-expansion";
import type { EnglishPaper } from "./blueprints";

/** Current ADMIN review catalog. Historical release tools continue to use
 * prepared-items.ts, whose exact 1,144-key manifest must never expand in place.
 * Approved runtime stock is read from DB, not from either prepared catalog.
 */
export function preparedEnglishImportItems(
  grade: number,
  paper: EnglishPaper = 1,
  itemId?: string,
) {
  const baseline = preparedEnglishItems(grade, paper, itemId);
  const extra =
    paper === 2
      ? preparedJuniorPaper2ExpansionItems(grade).filter(
          (part) =>
            itemId === undefined ||
            part.draft.selection.itemIds.includes(itemId),
        )
      : [];
  const result = [...baseline, ...extra];
  if (new Set(result.map((part) => part.key)).size !== result.length)
    throw new Error("Duplicate prepared English import item");
  return result;
}

export function englishImportItemsDigest(
  grade: number,
  paper: EnglishPaper = 1,
  itemId?: string,
) {
  if (paper !== 2 || ![6, 7].includes(grade))
    return englishItemsDigest(grade, paper, itemId);
  // Bind actual question/answer payload AND review evidence. A changed key,
  // answer, rationale, or review note invalidates old import-preview consent.
  return createHash("sha256")
    .update(
      JSON.stringify({
        catalog: "english-import-v2",
        grade,
        paper,
        itemId: itemId ?? null,
        items: preparedEnglishImportItems(grade, paper, itemId),
      }),
    )
    .digest("hex");
}
