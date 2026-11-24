import data from "./data/hsc-paper2-authored-model.json";
import { validateEnglishDraft } from "./draft";
import { englishItemGroups } from "./item-bank";
import { paperHeaderSchema } from "../paper-header";

/** Original HSC-level practice content, not a school/board paper transcription.
 * Registry access is pure: no import, approval or database writes.
 * Grade 11/12 share the HSC syllabus but retain exact-grade stock identities.
 */
export function preparedHSCPaper2Items(grade: number) {
  if (grade !== 11 && grade !== 12) return [];
  const header = paperHeaderSchema.parse({ enabled: true });
  for (const field of Object.values(header.fields)) field.enabled = false;
  Object.assign(header.fields.subject, { enabled: true, value: "HSC English Second Paper" });
  Object.assign(header.fields.program, { enabled: true, value: "Practice Model Test" });
  const draft = validateEnglishDraft({
    version: 1, name: `HSC — Class ${grade} — authored model 01 — review required`,
    selection: { grade, paper: 2, mode: "full", itemIds: [], sources: {}, writing: data.writing, includeAnswers: true },
    output: data.output, header, fontSize: 11, font: "serif",
    updatedAt: "2026-11-20T00:00:00.000Z",
  });
  return englishItemGroups(draft).map(part => ({
    ...part,
    review: { entryId: data.id, ...data.provenance },
  }));
}
