import type { EnglishPaper } from "./blueprints";
import { approvedEnglishItem, assembleEnglishItems } from "./item-bank";
import type { EnglishDraft } from "./draft";
/** One reader for ADMIN readiness and user assembly; no receipt or status-only shortcuts. */
export async function loadEnglishStock(grade: number, read: (prefix: string, after?: string) => Promise<{key:string;value:string}[]>, paper: EnglishPaper = 1) {
  const stock: EnglishDraft[] = [];
  for (const prefix of ["english-item:v1:", "english-review:"]) {
    let cursor: string | undefined;
    while (true) {
      const rows = await read(prefix, cursor);
      for (const row of rows) { const draft = approvedEnglishItem(row.value, grade, paper); if (draft) stock.push(draft); }
      if (rows.length < 100 || rows.at(-1)?.key === cursor) break;
      cursor = rows.at(-1)!.key;
    }
  }
  return stock;
}

/** Same complete-book feasibility used at both auto entry and paid-provider boundary.
 * Source/writing filters cannot turn a stocked book back into an AI request.
 */
export function englishBookComplete(stock: EnglishDraft[], grade: number, paper: EnglishPaper) {
  const compatible = grade === 8 && paper === 2
    ? stock.filter(d => d.selection.modelStyle === "class8-reference-v1") : stock;
  return !!assembleEnglishItems(compatible, grade, () => 0.5, undefined, {}, paper).draft;
}
