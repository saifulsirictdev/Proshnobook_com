import type { EnglishGeneratedOutput } from "./generation";

export const CLASS8_REFERENCE_STYLE = "class8-reference-v1" as const;
export function isClass8Reference(selection: {grade: number; paper: number; modelStyle?: string}) {
  return selection.grade === 8 && selection.paper === 2 && selection.modelStyle === CLASS8_REFERENCE_STYLE;
}
/** Exact labelled blanks/keys, not a count inferred from prose or marks. */
export function completeReferenceCloze(task: EnglishGeneratedOutput["tasks"][number], count: number, answers: boolean) {
  if (task.subitems.length || !task.instruction.includes("\n")) return false;
  const expected = Array.from({length: count}, (_, i) => String.fromCharCode(97 + i)).join("");
  const labels = [...task.instruction.matchAll(/\(([a-z])\)/g)];
  if (labels.map(m => m[1]).join("") !== expected || labels.some(m => !/^\s*[_—–-]{2,}/.test(task.instruction.slice(m.index! + m[0].length)))) return false;
  if ([...task.instruction.matchAll(/[_—–-]{2,}/g)].length !== count) return false;
  if (task.id === "verbs" && labels.some(m => !/^\s*[_—–-]{2,}\s*\([a-z][a-z -]*\)/i.test(task.instruction.slice(m.index! + m[0].length)))) return false;
  if (answers) {
    const key = task.answer ?? "", keys = [...key.matchAll(/\(([a-z])\)/g)];
    if (keys.map(m => m[1]).join("") !== expected || keys.some((m, i) => !/[\p{L}\p{N}]/u.test(key.slice(m.index! + m[0].length, keys[i + 1]?.index)))) return false;
  }
  return true;
}
/** Remove only the label the renderer itself adds, never an arbitrary prefix. */
export function englishSubitemText(text: string, index: number) {
  const label = String.fromCharCode(97 + index);
  return text.replace(new RegExp(`^\\s*\\(${label}\\)\\s*`, "i"), "");
}
export function englishInstructionParts(instruction: string) {
  const newline = instruction.indexOf("\n");
  return newline < 0 ? {heading: instruction, body: ""} : {heading: instruction.slice(0, newline), body: instruction.slice(newline + 1)};
}
