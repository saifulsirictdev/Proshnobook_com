import { createHash } from "node:crypto";
import { validateEnglishDraft, type EnglishDraft } from "./draft";
import { validateEnglishReferenceShape } from "./generation";
import { englishBlueprint, type EnglishGrade } from "./blueprints";

/** Passage-dependent items form an indivisible group: never mix seen and unseen keys. */
export function englishItemGroups(draft: EnglishDraft) {
  const blueprint = englishBlueprint(draft.selection.grade as EnglishGrade, draft.selection.paper);
  const groups = new Map<string, string[]>();
  for (const item of blueprint.items.filter(i => draft.output.tasks.some(t => t.id === i.id))) {
    const group = item.sourceGroup ?? item.id;
    groups.set(group, [...(groups.get(group) ?? []), item.id]);
  }
  return [...groups].map(([group, ids]) => {
    const sources = Object.fromEntries(Object.entries(draft.selection.sources).filter(([k]) => k === group));
    const writing = Object.fromEntries(Object.entries(draft.selection.writing).filter(([k]) => ids.includes(k)));
    const part = validateEnglishDraft({ ...draft, name: `Class ${draft.selection.grade} — ${group}`, selection: { ...draft.selection, mode: "selected", itemIds: ids, sources, writing }, output: { tasks: draft.output.tasks.filter(t => ids.includes(t.id)), passages: draft.output.passages.filter(p => p.key === group) } });
    validateEnglishReferenceShape(part.selection, part.output);
    const digest = createHash("sha256").update(JSON.stringify({selection:part.selection,output:part.output})).digest("hex");
    return { key: `english-item:v1:${digest}`, group, draft: part };
  });
}
export function approvedEnglishItem(value: string, grade: number) {
  try {
    const record = JSON.parse(value);
    if (record.status !== "APPROVED") return null;
    const draft = validateEnglishDraft(record.draft);
    if (draft.selection.grade !== grade || draft.selection.paper !== 1 || !draft.selection.includeAnswers) return null;
    validateEnglishReferenceShape(draft.selection, draft.output);
    return draft;
  } catch { return null; }
}
export function assembleEnglishItems(stock: EnglishDraft[], grade: number, random = Math.random) {
  const blueprint = englishBlueprint(grade as EnglishGrade, 1);
  const groups = new Map<string, string[]>();
  for (const item of blueprint.items) { const group = item.sourceGroup ?? item.id; groups.set(group, [...(groups.get(group) ?? []), item.id]); }
  const selected: EnglishDraft[] = [], missing: string[] = [];
  const seenTexts = new Set<string>();
  for (const [group, ids] of groups) {
    const candidates = stock.filter(d => d.selection.grade === grade && d.selection.paper === 1 && ids.every(id => d.output.tasks.some(t => t.id === id)) && (!group.startsWith("seen-") || !seenTexts.has(d.selection.sources[group]?.text.trim() ?? "")));
    if (!candidates.length) { missing.push(...ids); continue; }
    const chosen = candidates[Math.min(candidates.length - 1, Math.floor(random() * candidates.length))];
    // Extract only this group, even when reading an older approved complete snapshot.
    const part = englishItemGroups(chosen).find(p => p.group === group)!.draft;
    selected.push(part);
    if (group.startsWith("seen-")) seenTexts.add(part.selection.sources[group].text.trim());
  }
  if (missing.length) return { missing, draft: null };
  const base = selected[0];
  const draft = validateEnglishDraft({ ...base, name: `Class ${grade} — Full Model Test`, selection: { ...base.selection, mode: "full", itemIds: [], sources: Object.assign({}, ...selected.map(d => d.selection.sources)), writing: Object.assign({}, ...selected.map(d => d.selection.writing)) }, output: { passages: selected.flatMap(d => d.output.passages), tasks: blueprint.items.map(i => selected.flatMap(d => d.output.tasks).find(t => t.id === i.id)!) } });
  validateEnglishReferenceShape(draft.selection, draft.output);
  return { missing, draft };
}
