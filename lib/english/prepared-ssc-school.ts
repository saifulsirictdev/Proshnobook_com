import batch from "./data/ssc-school-unseen-review.json";
import { validateEnglishDraft } from "./draft";
import { englishItemGroups } from "./item-bank";
import { paperHeaderSchema } from "../paper-header";

/** School header dates are original school exams, never board/compilation target years. */
export function preparedSSCSchoolItems() {
  return batch.items.flatMap(entry => {
    const draft = validateEnglishDraft({
      version: 1,
      name: `SSC — ${entry.school} ${entry.examYear} — teacher review`,
      selection: { grade: 10, paper: 1, mode: "selected", includeAnswers: true,
        itemIds: entry.tasks.map(task => task.id), writing: {}, sources: {} },
      output: {
        passages: [{ key: "unseen", text: entry.passage }],
        tasks: entry.tasks.map(task => {
          const { sourceQuestion, sourceMarks, pdfPage, ...content } = task;
          return { ...content, passageKey: "unseen", schoolSource: {
            school: entry.school, examType: entry.examType, examYear: entry.examYear,
            sourceFile: entry.sourceFile, pdfPage, questionNumber: sourceQuestion, originalMarks: sourceMarks,
          } };
        }),
      },
      header: paperHeaderSchema.parse({}), fontSize: 12, font: "kalpurush",
      updatedAt: "2026-11-10T00:00:00.000Z",
    });
    return englishItemGroups(draft).map(item => ({ ...item, draft: { ...item.draft, name: draft.name } }));
  });
}
