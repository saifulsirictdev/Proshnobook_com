import batch from "./data/ssc-seen-variants-review.json";
import { validateEnglishDraft } from "./draft";
import { englishItemGroups } from "./item-bank";
import { paperHeaderSchema } from "../paper-header";

/** New questions on the same eight checked excerpts, with explicit user-approved scope. */
export function preparedSSCSeenVariantItems() {
  return batch.items.flatMap(entry => {
    const reference = `Authored SAME-TEXT practice variant ${entry.variant}; NOT a new reading or original exam questions. ${entry.topic}. Drive ${batch.sourceFile}; SHA256 ${batch.sourceSha256}; PDF ${entry.pdfPages.join(",")}, printed ${entry.printedPages.join(",")}. Source/limitations: ssc-seen-variants-review.json. Teacher review required.`;
    const draft = validateEnglishDraft({
      version: 1, name: `SSC authored Seen variant ${entry.variant} — ${entry.topic} — teacher review`,
      selection: { grade: 10, paper: 1, mode: "selected", includeAnswers: true,
        itemIds: ["mcq", "comprehension"], writing: {},
        sources: { "seen-1": { text: entry.passage, reference } } },
      output: { passages: [{ key: "seen-1", text: entry.passage }],
        tasks: entry.tasks.map(task => ({ ...task, passageKey: "seen-1" })) },
      header: paperHeaderSchema.parse({}), fontSize: 12, font: "kalpurush",
      updatedAt: "2026-11-10T00:00:00.000Z",
    });
    return englishItemGroups(draft).map(item => ({ ...item, draft: { ...item.draft, name: draft.name } }));
  });
}
