import { validateEnglishDraft } from "./draft";
import { englishBlueprint, type EnglishGrade, type EnglishPaper } from "./blueprints";
/** Only validated ADMIN-approved snapshots supply shared textbook extracts. */
export function approvedModelSources(rows: { value: string }[], grade: EnglishGrade, paper: EnglishPaper) {
  const keys = new Set(englishBlueprint(grade, paper).items.map(i => i.sourceGroup).filter(k => k && k !== "unseen"));
  const sources: Record<string, { text: string; reference: string }> = {};
  for (const row of rows) {
    try {
      const record = JSON.parse(row.value);
      if (record.status !== "APPROVED") continue;
      const draft = validateEnglishDraft(record.draft);
      if (draft.selection.grade !== grade || draft.selection.paper !== paper) continue;
      for (const [key, value] of Object.entries(draft.selection.sources)) {
        if (keys.has(key as any) && !sources[key]) sources[key] = value;
      }
    } catch { /* Pending, malformed and foreign-grade drafts cannot supply sources. */ }
  }
  return sources;
}
