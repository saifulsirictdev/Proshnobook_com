import paragraph from "./data/ssc-paper2-paragraph-review.json";
import correspondence from "./data/ssc-paper2-letter-email-review.json";
import composition from "./data/ssc-paper2-composition-review.json";
import { validateEnglishDraft } from "./draft";
import { englishItemGroups } from "./item-bank";
import { paperHeaderSchema } from "../paper-header";
import type { EnglishBoardSource, EnglishSchoolSource } from "./board-source";

export const preparedSSCWritingBatches = [paragraph, correspondence, composition];
export const preparedSSCWritingEntries = [...paragraph.items, ...correspondence.items, ...composition.items];
/** Complete original possible models; no import/approval side effects or fabricated web exam provenance. */
export function preparedSSCWritingItems(grade: number) {
  if (grade !== 9 && grade !== 10) return [];
  return preparedSSCWritingBatches.flatMap(batch => batch.items.flatMap(entry => {
    const writing = {
      topic: entry.topic,
      ...("words" in entry ? { words: entry.words } : {}),
      ...("choice" in entry ? { choice: entry.choice } : {}),
    };
    const provenance = "pdfPage" in entry ? {
      sourceFile: entry.sourceFile, pdfPage: entry.pdfPage, questionNumber: entry.questionNumber,
      originalMarks: entry.originalMarks, examYear: entry.examYear,
    } : undefined;
    const draft = validateEnglishDraft({
      version: 1, name: `${entry.id} — possible model; teacher review required`,
      selection: { grade, paper: 2, mode: "selected", itemIds: [batch.item], sources: {}, writing: { [batch.item]: writing }, includeAnswers: true },
      output: { passages: [], tasks: [{
        id: batch.item, instruction: entry.instruction, subitems: [], answer: entry.answers[0],
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
