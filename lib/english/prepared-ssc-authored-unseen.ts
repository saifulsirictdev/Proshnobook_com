import batch from "./data/ssc-authored-unseen-review.json";
import { validateEnglishDraft } from "./draft";
import { englishItemGroups } from "./item-bank";
import { paperHeaderSchema } from "../paper-header";

/** Original fictional Unseen practice, not recovered examination stock. */
export function preparedSSCAuthoredUnseenItems() {
  return batch.items.flatMap(entry => {
    const draft = validateEnglishDraft({
      version: 1, name: `SSC authored Unseen — ${entry.topic} — teacher review`,
      selection: { grade: 10, paper: 1, mode: "selected", includeAnswers: true,
        itemIds: ["information", "summary"], writing: {}, sources: {} },
      output: { passages: [{ key: "unseen", text: entry.passage }], tasks: entry.tasks },
      header: paperHeaderSchema.parse({}), fontSize: 12, font: "kalpurush",
      updatedAt: "2026-11-10T00:00:00.000Z",
    });
    return englishItemGroups(draft).map(item => ({ ...item, draft: { ...item.draft, name: draft.name } }));
  });
}
