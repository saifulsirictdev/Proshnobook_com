import type { PaperItem } from "../paper-builder";
export type EnglishTextField = { key: string; label: string; value: string };
/** Enumerate text only. IDs, task type, source, marks, answer keys and group boundaries cannot be edited here. */
export function englishTextFields(
  group: NonNullable<PaperItem["englishGroup"]>,
): EnglishTextField[] {
  const out: EnglishTextField[] = [];
  group.passages.forEach((p, i) =>
    out.push({ key: `p.${i}`, label: `Passage ${i + 1}`, value: p.text }),
  );
  group.tasks.forEach((t, i) => {
    const add = (suffix: string, label: string, value: string) =>
      out.push({
        key: `t.${i}.${suffix}`,
        label: `Task ${t.number}: ${label}`,
        value,
      });
    add("instruction", "Instruction", t.instruction);
    t.clues?.forEach((v, j) => add(`clue.${j}`, `Clue ${j + 1}`, v));
    t.table?.headers.forEach((v, j) =>
      add(`head.${j}`, `Table header ${j + 1}`, v),
    );
    t.table?.rows.forEach((row, r) =>
      row.forEach((v, c) =>
        add(`cell.${r}.${c}`, `Table ${r + 1}, ${c + 1}`, v),
      ),
    );
    t.subitems.forEach((sub, j) => {
      add(`sub.${j}`, `Subquestion ${j + 1}`, sub.text);
      sub.options?.forEach((v, k) =>
        add(`option.${j}.${k}`, `Subquestion ${j + 1} option ${k + 1}`, v),
      );
    });
  });
  return out;
}
export function applyEnglishTextEdits(
  q: PaperItem,
  edits: Record<string, string> | undefined,
): PaperItem {
  if (!q.englishGroup || !edits || !Object.keys(edits).length) return q;
  const group = structuredClone(q.englishGroup);
  const read = (key: string, original: string) =>
    Object.hasOwn(edits, key) ? edits[key] : original;
  group.passages.forEach((p, i) => {
    p.text = read(`p.${i}`, p.text);
  });
  group.tasks.forEach((t, i) => {
    const get = (key: string, value: string) => read(`t.${i}.${key}`, value);
    t.instruction = get("instruction", t.instruction);
    t.clues = t.clues?.map((v, j) => get(`clue.${j}`, v));
    if (t.table) {
      t.table.headers = t.table.headers.map((v, j) => get(`head.${j}`, v));
      t.table.rows = t.table.rows.map((row, r) =>
        row.map((v, c) => get(`cell.${r}.${c}`, v)),
      );
    }
    t.subitems.forEach((sub, j) => {
      sub.text = get(`sub.${j}`, sub.text);
      sub.options = sub.options?.map((v, k) => get(`option.${j}.${k}`, v));
    });
  });
  const wasInstructions =
    q.text === q.englishGroup.tasks.map((t) => t.instruction).join("\n");
  return {
    ...q,
    text: wasInstructions
      ? group.tasks.map((t) => t.instruction).join("\n")
      : q.text,
    englishGroup: group,
  };
}
