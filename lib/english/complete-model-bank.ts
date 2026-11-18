import { validateEnglishDraft } from "./draft";
import { resolveEnglishSelection } from "./selection";
import { validateEnglishReferenceShape } from "./generation";
/** A complete approved snapshot keeps passages, all questions and keys together.
 * No generated/fabricated fallback, no borrowing from another grade or paper.
 */
export function approvedCompleteEnglishModel(value: string, grade: number, paper: number) {
  try {
    const record = JSON.parse(value);
    if (record.status !== "APPROVED") return null;
    const draft = validateEnglishDraft(record.draft);
    if (draft.selection.grade !== grade || draft.selection.paper !== paper || draft.selection.mode !== "full" || !draft.selection.includeAnswers) return null;
    const request = resolveEnglishSelection(draft.selection);
    if (request.items.length !== request.blueprint.items.length) return null;
    validateEnglishReferenceShape(draft.selection, draft.output);
    return draft;
  } catch { return null; }
}
