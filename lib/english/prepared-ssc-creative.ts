import batch from "./data/ssc-board-creative-review.json";
import { validateEnglishDraft } from "./draft";
import { englishItemGroups } from "./item-bank";
import { paperHeaderSchema } from "../paper-header";

/** Original board prompts with illustrative keys, never live stock or implicit approval. */
export function preparedSSCCreativeItems() {
  return batch.items.flatMap(entry => {
    const draft = validateEnglishDraft({
      version: 1,
      name: `SSC Class 10 — ${entry.board} ${entry.examYear} ${entry.group} — teacher review required`,
      selection: {
        grade: 10, paper: 1, mode: "selected", includeAnswers: true,
        itemIds: entry.tasks.map(task => task.id),
        writing: { [entry.group]: { topic: entry.topic } }, sources: {},
      },
      output: {
        passages: [],
        tasks: entry.tasks.map(task => {
          const { sourceQuestion, sourceMarks, pdfPage, ...content } = task;
          return { ...content, boardSource: {
            board: entry.board, examYear: entry.examYear, sourceFile: batch.sourceFile,
            pdfPage, questionNumber: sourceQuestion, originalMarks: sourceMarks,
          } };
        }),
      },
      header: paperHeaderSchema.parse({}), fontSize: 12, font: "kalpurush",
      updatedAt: "2026-11-10T00:00:00.000Z",
    });
    return englishItemGroups(draft).map(item => ({ ...item, draft: { ...item.draft, name: draft.name } }));
  });
}
