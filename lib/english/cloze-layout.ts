/** Distinguish a complete boxed passage from independent contextual verb subquestions.
 * A newline in directions alone must never hide separately authored subitems.
 */
export function isEnglishPassageCloze(task: { id: string; instruction: string; clues?: string[] }) {
  if (!task.clues?.length || !task.instruction.includes("\n")) return false;
  if (task.id === "gap-clues") return true;
  return task.id === "verbs" && Array.from({ length: 10 }, (_, i) =>
    task.instruction.includes(`(${String.fromCharCode(97 + i)})`),
  ).every(Boolean);
}
