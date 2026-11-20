import data from "./data/ssc-paper2-substitution-review.json";
import { validateEnglishDraft } from "./draft";
import { englishItemGroups } from "./item-bank";
import { paperHeaderSchema } from "../paper-header";

/** Source-backed, transparently edited practice, not official or approved answer keys. */
export function preparedSSCSubstitutionItems(grade: number) {
  if (grade !== 9 && grade !== 10) return [];
  return data.items.flatMap(entry => {
    const { sourceFile, pdfPage, questionNumber, originalMarks, examYear } = entry;
    const provenance = { sourceFile, pdfPage, questionNumber, originalMarks, examYear };
    const draft = validateEnglishDraft({
      version: 1, name: `${entry.id} — teacher review required`,
      selection: { grade, paper: 2, mode: "selected", itemIds: ["substitution"], sources: {}, writing: {}, includeAnswers: true },
      output: { passages: [], tasks: [{
        id: "substitution", table: entry.table,
        instruction: `${entry.instruction}\nUse one fragment from each column for each sentence. Entries may be reused; change the verb form where necessary.`,
        subitems: entry.answers.map(answer => ({ text: "________________________________", answer })),
        ...(entry.sourceKind === "board" ? { boardSource: { ...provenance, board: entry.board } } : { schoolSource: { ...provenance, school: entry.school, examType: entry.examType } }),
      }] },
      header: paperHeaderSchema.parse({}), fontSize: 12, font: "kalpurush", updatedAt: "2026-11-20T00:00:00.000Z",
    });
    return englishItemGroups(draft).map(item => ({
      ...item, draft: { ...item.draft, name: draft.name },
      review: {
        entryId: entry.id, contentSha256: entry.contentSha256,
        sourceSha256: data.sources.find(s => s.fileId === entry.sourceFile)!.sha256,
        sourceRows: entry.sourceRows, sourceRowsSha256: entry.sourceRowsSha256,
        solutions: entry.solutions, editorialNotes: entry.editorialNotes, answerStatus: data.answerStatus,
      },
    }));
  });
}
