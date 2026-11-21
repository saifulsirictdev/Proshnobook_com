import class6 from "./data/class6-paper2-authored-model.json";
import class7 from "./data/class7-paper2-authored-model.json";
import { validateEnglishDraft } from "./draft";
import { englishItemGroups } from "./item-bank";
import { paperHeaderSchema } from "../paper-header";

/** Distinct original practice questions for each grade, never cross-grade copies.
 * Class 6 has parts of speech and 200-word composition; Class 7 instead has
 * individual-sentence narration and a 250-word composition. No approval here.
 */
export function preparedJuniorPaper2Items(grade: number) {
  if (grade !== 6 && grade !== 7) return [];
  const data = grade === 6 ? class6 : class7;
  const header = paperHeaderSchema.parse({ enabled: true });
  for (const field of Object.values(header.fields)) field.enabled = false;
  Object.assign(header.fields.subject, { enabled: true, value: `Class ${grade} English Second Paper` });
  Object.assign(header.fields.program, { enabled: true, value: "Practice Model Test" });
  const draft = validateEnglishDraft({
    version: 1, name: `Class ${grade} — authored second-paper model 01 — review required`,
    selection: { grade, paper: 2, mode: "full", itemIds: [], sources: {}, writing: data.writing, includeAnswers: true },
    output: data.output, header, fontSize: 11, font: "serif",
    updatedAt: "2026-11-20T00:00:00.000Z",
  });
  return englishItemGroups(draft).map(part => ({ ...part, review: { entryId: data.id, ...data.provenance } }));
}
