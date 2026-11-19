import batch from "./data/ssc-school-exercises-review.json";
import { validateEnglishDraft } from "./draft";
import { englishItemGroups } from "./item-bank";
import { paperHeaderSchema } from "../paper-header";

/** School exercises retain their actual header provenance; never board-year stock. */
export function preparedSSCSchoolExerciseItems() {
  return batch.items.flatMap(entry => {
    const draft = validateEnglishDraft({
      version: 1,
      name: `SSC — ${entry.school} ${entry.examYear} ${entry.group} — teacher review`,
      selection: { grade: 10, paper: 1, mode: "selected", includeAnswers: true,
        itemIds: entry.tasks.map(task => task.id), writing: "topic" in entry ? { [entry.group]: { topic: entry.topic } } : {}, sources: {} },
      output: { passages: [], tasks: entry.tasks.map(task => {
        const { sourceQuestion, sourceMarks, pdfPage, ...content } = task;
        return { ...content, schoolSource: {
          school: entry.school, examType: entry.examType, examYear: entry.examYear,
          sourceFile: batch.sourceFile, pdfPage, questionNumber: sourceQuestion, originalMarks: sourceMarks,
        } };
      }) },
      header: paperHeaderSchema.parse({}), fontSize: 12, font: "kalpurush",
      updatedAt: "2026-11-10T00:00:00.000Z",
    });
    return englishItemGroups(draft).map(item => ({ ...item, draft: { ...item.draft, name: draft.name } }));
  });
}
