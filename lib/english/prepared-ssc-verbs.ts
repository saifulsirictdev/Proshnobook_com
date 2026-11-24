import data from "./data/ssc-paper2-verbs-review.json";
import { validateEnglishDraft } from "./draft";
import { englishItemGroups } from "./item-bank";
import { paperHeaderSchema } from "../paper-header";

/** One complete source-backed ten-gap verb exercise per draft; no implicit DB writes. */
export function preparedSSCVerbItems(grade: number) {
  if (grade !== 9 && grade !== 10) return [];
  return data.items.flatMap(entry => {
    const { sourceFile, pdfPage, questionNumber, originalMarks, examYear } = entry;
    const provenance = { sourceFile, pdfPage, questionNumber, originalMarks, examYear };
    const draft = validateEnglishDraft({
      version: 1, name: `${entry.id} — teacher review required`,
      selection: { grade, paper: 2, mode: "selected", itemIds: ["verbs"], sources: {}, writing: {}, includeAnswers: true },
      output: { passages: [], tasks: [{
        id: "verbs", instruction: `${entry.instruction}\n${entry.passage}`, clues: entry.clues,
        subitems: entry.answers.map((answer, i) => ({ text: `Fill gap (${String.fromCharCode(97 + i)}).`, answer })),
        ...(entry.sourceKind === "board" ? { boardSource: { ...provenance, board: entry.board } } : { schoolSource: { ...provenance, school: entry.school, examType: entry.examType } }),
      }] },
      header: paperHeaderSchema.parse({}), fontSize: 12, font: "kalpurush", updatedAt: "2026-11-20T00:00:00.000Z",
    });
    return englishItemGroups(draft).map(item => ({
      ...item, draft: { ...item.draft, name: draft.name },
      review: {
        entryId: entry.id, contentSha256: entry.contentSha256,
        sourceSha256: data.sources.find(s => s.fileId === entry.sourceFile)!.sha256,
        sourceInstruction: entry.sourceInstruction, sourceClues: entry.sourceClues, sourcePassage: entry.sourcePassage,
        sourceContentSha256: entry.sourceContentSha256, answerRoots: entry.answerRoots,
        editorialChanges: entry.editorialChanges, editorialNotes: entry.editorialNotes, answerStatus: data.answerStatus,
      },
    }));
  });
}
