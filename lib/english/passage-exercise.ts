/** HSC correction counts describe positions in one passage, not detached questions.
 * Keep legacy sentence-list drafts valid; this predicate only admits complete
 * continuous alternatives with their requested keys. It never invents content.
 */
export function isCompleteHSCPassageExercise(
  grade: number, paper: number,
  task: { id: string; instruction: string; subitems: {text: string; answer?: string}[]; answer?: string },
  includeAnswers: boolean,
) {
  if (![11, 12].includes(grade) || paper !== 2 || task.subitems.length ||
      !["narration", "pronouns", "punctuation"].includes(task.id)) return false;
  const newline = task.instruction.indexOf("\n");
  if (newline < 1) return false;
  const body = task.instruction.slice(newline + 1).trim();
  if (body.split(/\s+/).length < 20 || /\b(?:TODO|placeholder|insert passage)\b/i.test(body)) return false;
  if (task.id === "narration" && !/["“”]/.test(body)) return false;
  return !includeAnswers || !!task.answer && task.answer.trim().split(/\s+/).length >= 20;
}
