import batch from "./data/ssc-authored-matching-review.json";
import { validateEnglishDraft } from "./draft";
import { englishItemGroups } from "./item-bank";
import { paperHeaderSchema } from "../paper-header";

/** Original authored matching practice; no fabricated examination attribution. */
export function preparedSSCAuthoredMatchingItems() {
  return batch.items.flatMap(entry => {
    const draft = validateEnglishDraft({
      version: 1,
      name: `SSC authored matching — ${entry.topic} — teacher review`,
      selection: { grade: 10, paper: 1, mode: "selected", includeAnswers: true,
        itemIds: ["matching"], writing: {}, sources: {} },
      output: { passages: [], tasks: entry.tasks },
      header: paperHeaderSchema.parse({}), fontSize: 12, font: "kalpurush",
      updatedAt: "2026-11-10T00:00:00.000Z",
    });
    return englishItemGroups(draft).map(item => ({ ...item, draft: { ...item.draft, name: draft.name } }));
  });
}
