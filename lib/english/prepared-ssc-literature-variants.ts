import batch from "./data/ssc-literature-variants-review.json";
import { validateEnglishDraft } from "./draft";
import { englishItemGroups } from "./item-bank";
import { paperHeaderSchema } from "../paper-header";

/** User-approved same-work sets, not additional works or recovered exam questions. */
export function preparedSSCLiteratureVariantItems() {
  return batch.items.flatMap(entry => {
    const group = entry.id === "poems" ? "textbook-poems" : "textbook-stories";
    const subitems = entry.questions;
    const reference = `Authored SAME-WORK variant ${entry.variant}; NOT new works or exam stock. Four new questions + four reused foundations. ${entry.work}, ${entry.author}. Drive ${batch.sourceFile}; SHA256 ${batch.sourceSha256}; PDF ${entry.pdfPages.join(",")}, printed ${entry.printedPages.join(",")}. Source notes: ssc-literature-variants-review.json. Teacher review required.`;
    const draft = validateEnglishDraft({
      version: 1,
      name: `SSC authored ${entry.id} variant ${entry.variant} — ${entry.work.slice(0, 48)} — teacher review`,
      selection: { grade: 10, paper: 1, mode: "selected", includeAnswers: true,
        itemIds: [entry.id], writing: {}, sources: { [group]: {
          kind: "question-bank", text: subitems.map(s => s.text).join("\n"), reference,
        } } },
      output: { passages: [], tasks: [{ id: entry.id,
        instruction: `Answer any five questions on ${entry.work}. Authored same-work practice set ${entry.variant}: four new questions and four reused foundation questions; not a new work or an original exam set.`,
        subitems }] },
      header: paperHeaderSchema.parse({}), fontSize: 12, font: "kalpurush",
      updatedAt: "2026-11-10T00:00:00.000Z",
    });
    return englishItemGroups(draft).map(item => ({ ...item, draft: { ...item.draft, name: draft.name } }));
  });
}
