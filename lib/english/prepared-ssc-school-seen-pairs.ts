import batch from "./data/ssc-school-seen-pairs-review.json";
import { validateEnglishDraft } from "./draft";
import { englishItemGroups } from "./item-bank";
import { paperHeaderSchema } from "../paper-header";

/** School exercises retain their actual header provenance; never board-year stock. */
export function preparedSSCSchoolSeenPairItems() {
  return batch.items.flatMap(entry => {
    const draft = validateEnglishDraft({
      version: 1,
      name: `SSC — ${entry.school} ${entry.examYear} ${entry.group} — teacher review`,
      selection: { grade: 10, paper: 1, mode: "selected", includeAnswers: true,
        itemIds: entry.tasks.map(task => task.id), writing: {}, sources: { [entry.group]: { text: entry.passage, reference: `${entry.school} ${entry.examType} ${entry.examYear}, supplied school compilation ${batch.sourceFile}, passage PDF p.${entry.passagePage}. Original complete seven-MCQ/five-comprehension pair. Teacher review required.` } } },
      output: { passages: [{ key: entry.group, text: entry.passage }], tasks: entry.tasks.map(task => {
        const { sourceQuestion, sourceMarks, pdfPage, ...content } = task;
        return { ...content, passageKey: entry.group, schoolSource: {
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
