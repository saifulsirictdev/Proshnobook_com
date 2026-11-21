/** Complete passages remain atomic; newline-only directions must not hide independent questions. */
export function isEnglishPassageCloze(task: { id: string; instruction: string; clues?: string[] }) {
  if (!task.instruction.includes("\n")) return false;
  if (task.id === "gap-clues") return !!task.clues?.length || Array.from({length:10},(_,i)=>task.instruction.includes(`(${String.fromCharCode(97+i)})`)).every(Boolean);
  const count = task.id === "verbs" ? (task.clues?.length ? 10 : 5) : ["affixes", "prepositions", "connectors"].includes(task.id) ? 5 : 0;
  return count > 0 && Array.from({ length: count }, (_, i) =>
    task.instruction.includes(`(${String.fromCharCode(97 + i)})`),
  ).every(Boolean);
}
