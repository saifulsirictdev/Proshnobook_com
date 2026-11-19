import batch from "./data/ssc-textbook-seen-review.json";
import { validateEnglishDraft } from "./draft";
import { englishItemGroups } from "./item-bank";
import { paperHeaderSchema } from "../paper-header";

/** Textbook-based authored pairs; no invented board/school exam metadata. */
export function preparedSSCTextbookSeenItems() {
  return batch.items.flatMap(entry => {
    const reference = `Textbook-based authored practice; NOT verbatim exercises or board/school questions. Teacher review required. Drive ${batch.sourceFile}; SHA256 ${batch.sourceSha256}; revised Oct 2025/2026. PDF ${entry.pdfPages.join(",")}; printed ${entry.printedPages.join(",")}. Full excerpt locator and limitations: ssc-textbook-seen-review.json — ${entry.topic}.`;
    const draft = validateEnglishDraft({
      version: 1, name: `SSC authored Seen — ${entry.topic} — teacher review`,
      selection: { grade: 10, paper: 1, mode: "selected", itemIds: ["mcq", "comprehension"], writing: {}, includeAnswers: true,
        sources: { "seen-1": { text: entry.passage, reference } } },
      output: { passages: [{ key: "seen-1", text: entry.passage }], tasks: entry.tasks.map(task => ({ ...task, passageKey: "seen-1" })) },
      header: paperHeaderSchema.parse({}), fontSize: 12, font: "kalpurush", updatedAt: "2026-11-10T00:00:00.000Z",
    });
    return englishItemGroups(draft).map(item => ({ ...item, draft: { ...item.draft, name: draft.name } }));
  });
}
