import { approvedEnglishItem } from "./item-bank";
import type { EnglishDraft } from "./draft";
/** One reader for ADMIN readiness and user assembly; no receipt or status-only shortcuts. */
export async function loadEnglishStock(grade: number, read: (prefix: string, after?: string) => Promise<{key:string;value:string}[]>) {
  const stock: EnglishDraft[] = [];
  for (const prefix of ["english-item:v1:", "english-review:"]) {
    let cursor: string | undefined;
    while (true) {
      const rows = await read(prefix, cursor);
      for (const row of rows) { const draft = approvedEnglishItem(row.value, grade); if (draft) stock.push(draft); }
      if (rows.length < 100 || rows.at(-1)?.key === cursor) break;
      cursor = rows.at(-1)!.key;
    }
  }
  return stock;
}
