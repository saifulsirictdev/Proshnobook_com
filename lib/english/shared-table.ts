/** The table already contains the student-facing prompts. Subitems are keys,
 * not another printed list of matching rows or information blanks.
 */
export function isEnglishSharedTable(task: {id:string;table?:unknown}) {
  return !!task.table && ["substitution","matching","information"].includes(task.id);
}
