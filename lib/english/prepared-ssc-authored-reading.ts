import batch from "./data/ssc-authored-reading-review.json";
import { validateEnglishDraft } from "./draft";
import { englishItemGroups } from "./item-bank";
import { paperHeaderSchema } from "../paper-header";

/** Textbook-based authored pairs; no invented board/school exam metadata. */
export function preparedSSCAuthoredReadingItems() {
  return batch.items.flatMap(entry => {
    const reference = `Supplied-passage-based AUTHORED practice; NOT original school/board questions or official exercises. Teacher review required. Drive ${batch.sourceFile}; SHA256 ${batch.sourceSha256}; PDF ${entry.pdfPages.join(",")}. ${entry.topic}. Excerpt boundaries and limitations: ssc-authored-reading-review.json.`;
    const draft = validateEnglishDraft({
      version: 1, name: `SSC authored reading — ${entry.topic} — teacher review`,
      selection: { grade: 10, paper: 1, mode: "selected", itemIds: ["mcq", "comprehension"], writing: {}, includeAnswers: true,
        sources: { "seen-1": { text: entry.passage, reference } } },
      output: { passages: [{ key: "seen-1", text: entry.passage }], tasks: entry.tasks.map(task => ({ ...task, passageKey: "seen-1" })) },
      header: paperHeaderSchema.parse({}), fontSize: 12, font: "kalpurush", updatedAt: "2026-11-10T00:00:00.000Z",
    });
    return englishItemGroups(draft).map(item => ({ ...item, draft: { ...item.draft, name: draft.name } }));
  });
}
