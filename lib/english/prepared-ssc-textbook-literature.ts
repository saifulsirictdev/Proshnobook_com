import batch from "./data/ssc-textbook-literature-review.json";
import { validateEnglishDraft } from "./draft";
import { englishItemGroups } from "./item-bank";
import { paperHeaderSchema } from "../paper-header";

/** Authored practice grounded in the supplied textbook, never historical exam stock. */
export function preparedSSCTextbookLiteratureItems() {
  return batch.items.flatMap(entry => {
    const group = entry.id === "poems" ? "textbook-poems" : "textbook-stories";
    const subitems = entry.questions.map(({ text, answer }) => ({ text, answer }));
    const reference = `Textbook-based authored practice, NOT verbatim NCTB exercises or board/school questions. ${entry.work}, ${entry.author}. ${batch.title}, ${batch.edition}. Drive file ${batch.sourceFile}; SHA256 ${batch.sourceSha256}; PDF pp.${entry.pdfPages.join(",")}, printed pp.${entry.printedPages.join(",")}. Suggested interpretations; teacher review required.`;
    const draft = validateEnglishDraft({
      version: 1, name: `SSC authored ${entry.id} — ${entry.work.slice(0, 60)} — teacher review`,
      selection: { grade: 10, paper: 1, mode: "selected", itemIds: [entry.id], writing: {}, includeAnswers: true,
        sources: { [group]: { kind: "question-bank", text: subitems.map(s => s.text).join("\n"), reference } } },
      output: { passages: [], tasks: [{ id: entry.id,
        instruction: `Answer any five of the following questions on ${entry.work}. Textbook-based authored practice.`, subitems }] },
      header: paperHeaderSchema.parse({}), fontSize: 12, font: "kalpurush", updatedAt: "2026-11-10T00:00:00.000Z",
    });
    return englishItemGroups(draft).map(item => ({ ...item, draft: { ...item.draft, name: draft.name } }));
  });
}
