import transformation from "./data/ssc-paper2-transformation-review.json";
import tags from "./data/ssc-paper2-tags-review.json";
import affixes from "./data/ssc-paper2-affixes-review.json";
import prepositions from "./data/ssc-paper2-prepositions-review.json";
import { validateEnglishDraft } from "./draft";
import { englishItemGroups } from "./item-bank";
import { paperHeaderSchema } from "../paper-header";
import type { EnglishBoardSource, EnglishSchoolSource } from "./board-source";

export const preparedSSCGrammarEntries = [...transformation.items, ...tags.items, ...affixes.items, ...prepositions.items];
export const preparedSSCGrammarBatches = [transformation, tags, affixes, prepositions];
/** Prepared drafts only. Source-backed adaptations and web practice retain their actual provenance.
 * No side-effecting import, review decision or approval happens here.
 */
export function preparedSSCGrammarItems(grade: number) {
  if (grade !== 9 && grade !== 10) return [];
  return preparedSSCGrammarBatches.flatMap(batch => batch.items.flatMap(entry => {
    const passage = "passage" in entry ? entry.passage : undefined;
    const questions = "questions" in entry ? entry.questions : entry.answers.map((_, i) => `Fill gap (${String.fromCharCode(97 + i)}).`);
    const provenance = "pdfPage" in entry ? {
      sourceFile: entry.sourceFile, pdfPage: entry.pdfPage, questionNumber: entry.questionNumber,
      originalMarks: entry.originalMarks, examYear: entry.examYear,
    } : undefined;
    const draft = validateEnglishDraft({
      version: 1, name: `${entry.id} — adapted practice; teacher review required`,
      selection: { grade, paper: 2, mode: "selected", itemIds: [batch.item], sources: {}, writing: {}, includeAnswers: true },
      output: { passages: [], tasks: [{
        id: batch.item, instruction: passage ? `${entry.instruction}\n${passage}` : entry.instruction,
        subitems: questions.map((text, i) => ({ text, answer: entry.answers[i] })),
        ...(entry.sourceKind === "board" && "board" in entry ? { boardSource: { ...provenance, board: entry.board, ...("originalAnswerKey" in entry ? { originalSubitemCount: entry.originalAnswerKey.length, selectedParts: ["a","b","c","d","e"] } : {}) } as EnglishBoardSource } : {}),
        ...(entry.sourceKind === "school" && "school" in entry ? { schoolSource: { ...provenance, school: entry.school, examType: entry.examType } as EnglishSchoolSource } : {}),
      }] },
      header: paperHeaderSchema.parse({}), fontSize: 12, font: "kalpurush", updatedAt: "2026-11-20T00:00:00.000Z",
    });
    return englishItemGroups(draft).map(item => ({
      ...item, draft: { ...item.draft, name: draft.name },
      // Store the complete snapshot: never silently replace a saved review with a later library revision.
      review: { ...entry, entryId: entry.id, answerStatus: batch.answerStatus, source: batch.sources.find(s => s.fileId === entry.sourceFile) },
    }));
  }));
}
