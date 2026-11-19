import batch from "./data/ssc-authored-rearranging-review.json";
import { validateEnglishDraft } from "./draft";
import { englishItemGroups } from "./item-bank";
import { paperHeaderSchema } from "../paper-header";

/** Complete original fictional narratives; never attributed to boards or schools. */
export function preparedSSCAuthoredRearrangingItems() {
  return batch.items.flatMap(entry => {
    const draft = validateEnglishDraft({
      version: 1, name: `SSC authored rearranging — ${entry.topic} — teacher review`,
      selection: { grade: 10, paper: 1, mode: "selected", includeAnswers: true,
        itemIds: ["rearranging"], writing: {}, sources: {} },
      output: { passages: [], tasks: entry.tasks },
      header: paperHeaderSchema.parse({}), fontSize: 12, font: "kalpurush",
      updatedAt: "2026-11-10T00:00:00.000Z",
    });
    return englishItemGroups(draft).map(item => ({ ...item, draft: { ...item.draft, name: draft.name } }));
  });
}
