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
/** Resolve an identifier-based inline edit path to the stored edit key/value.
    Paths always carry ORIGINAL indices; fragment groups (tableOffset/
    subitemOffset) are converted here so fragment and original callers both work. */
export function resolveEnglishField(
  group: NonNullable<PaperItem["englishGroup"]>,
  path: string,
): { key: string; value: string } | null {
  const seg = path.split(":");
  if (seg[0] === "passage") {
    const i = group.passages.findIndex((p) => p.key === seg[1]);
    return i < 0 ? null : { key: `p.${i}`, value: group.passages[i].text };
  }
  if (seg[0] !== "task") return null;
  const ti = group.tasks.findIndex((t) => t.id === seg[1]);
  if (ti < 0) return null;
  const task = group.tasks[ti],
    rest = seg.slice(2);
  const key = (suffix: string) => `t.${ti}.${suffix}`;
  if (rest[0] === "instruction")
    return { key: key("instruction"), value: task.instruction };
  if (rest[0] === "clue") {
    const j = Number(rest[1]);
    return task.clues?.[j] === undefined
      ? null
      : { key: key(`clue.${j}`), value: task.clues![j] };
  }
  if (rest[0] === "head") {
    const j = Number(rest[1]);
    return task.table?.headers[j] === undefined
      ? null
      : { key: key(`head.${j}`), value: task.table!.headers[j] };
  }
  if (rest[0] === "cell") {
    // Paths carry ORIGINAL row indices; a split fragment stores only its slice.
    const orig = Number(rest[1]),
      r = orig - (group.tableOffset ?? 0),
      c = Number(rest[2]);
    const value = task.table?.rows[r]?.[c];
    return value === undefined
      ? null
      : { key: key(`cell.${orig}.${c}`), value };
  }
  if (rest[0] === "sub") {
    const orig = Number(rest[1]),
      j = orig - (group.subitemOffset ?? 0);
    return task.subitems[j]
      ? { key: key(`sub.${j}`), value: task.subitems[j].text }
      : null;
  }
  if (rest[0] === "option") {
    const orig = Number(rest[1]),
      j = orig - (group.subitemOffset ?? 0),
      k = Number(rest[2]);
    const value = task.subitems[j]?.options?.[k];
    return value === undefined ? null : { key: key(`option.${j}.${k}`), value };
  }
  return null;
}
