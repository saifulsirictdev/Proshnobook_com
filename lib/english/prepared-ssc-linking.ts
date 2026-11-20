import connectors from "./data/ssc-paper2-connectors-review.json";
import punctuation from "./data/ssc-paper2-punctuation-review.json";
import { validateEnglishDraft } from "./draft";
import { englishItemGroups } from "./item-bank";
import { paperHeaderSchema } from "../paper-header";
import type { EnglishBoardSource, EnglishSchoolSource } from "./board-source";

export const preparedSSCLinkingBatches = [connectors, punctuation];
export const preparedSSCLinkingEntries = [...connectors.items, ...punctuation.items];
/** Source-backed, teacher-reviewable drafts only; never imports or approves records. */
export function preparedSSCLinkingItems(grade: number) {
  if (grade !== 9 && grade !== 10) return [];
  return preparedSSCLinkingBatches.flatMap(batch => batch.items.flatMap(entry => {
    const provenance = {
      sourceFile: entry.sourceFile, pdfPage: entry.pdfPage, questionNumber: entry.questionNumber,
      originalMarks: entry.originalMarks, examYear: entry.examYear,
    };
    const draft = validateEnglishDraft({
      version: 1, name: `${entry.id} — source-backed practice; teacher review required`,
      selection: { grade, paper: 2, mode: "selected", itemIds: [batch.item], sources: {}, writing: {}, includeAnswers: true },
      output: { passages: [], tasks: [{
        id: batch.item, instruction: `${entry.instruction}\n${entry.passage}`,
        // Punctuation is one continuous passage with one complete corrected answer.
        subitems: batch.item === "connectors" ? entry.answers.map((answer, i) => ({ text: `Fill gap (${String.fromCharCode(97 + i)}).`, answer })) : [],
        ...(batch.item === "punctuation" ? { answer: entry.answers[0] } : {}),
        ...(entry.sourceKind === "board" && "board" in entry ? { boardSource: { ...provenance, board: entry.board } as EnglishBoardSource } : {}),
        ...(entry.sourceKind === "school" && "school" in entry ? { schoolSource: { ...provenance, school: entry.school, examType: entry.examType } as EnglishSchoolSource } : {}),
      }] },
      header: paperHeaderSchema.parse({}), fontSize: 12, font: "kalpurush", updatedAt: "2026-11-20T00:00:00.000Z",
    });
    return englishItemGroups(draft).map(item => ({
      ...item, draft: { ...item.draft, name: draft.name },
      review: { ...entry, entryId: entry.id, answerStatus: batch.answerStatus, source: batch.sources.find(s => s.fileId === entry.sourceFile) },
    }));
  }));
}
