import seen from "../../docs/english/ssc-dhaka-2024-seen-review.json";
import unseen from "../../docs/english/ssc-dhaka-2024-unseen-review.json";
import more from "./data/ssc-dhaka-2024-items.json";
import { validateEnglishDraft } from "./draft";
import { englishItemGroups } from "./item-bank";
import { paperHeaderSchema } from "../paper-header";

/** Page-image-checked prompts; assistant-prepared answers still require teacher review.
 * Explicit ADMIN preview -> consent -> Pending -> review only. Never auto-import/approve.
 */
export function preparedSSCEnglishItems() {
  const source = (questionNumber: number, pdfPage: number, originalMarks: number) => ({
    board: "Dhaka", examYear: 2024, sourceFile: more.sourceFile, pdfPage, questionNumber, originalMarks,
  });
  const prepare = (group: string, itemIds: string[], tasks: unknown[], passage?: string, topic?: string) => {
    const reference = "Dhaka Board 2024, supplied board compilation, PDF pp.1–2 / printed pp.15–16. Assistant-prepared answers; teacher review required.";
    const draft = validateEnglishDraft({
      version: 1, name: `SSC Class 10 — Dhaka 2024 ${group} — teacher review required`,
      selection: { grade: 10, paper: 1, mode: "selected", itemIds,
        sources: passage && group !== "unseen" ? { [group]: { text: passage, reference } } : {},
        writing: topic ? { [group]: { topic } } : {}, includeAnswers: true },
      output: { passages: passage ? [{ key: group, text: passage }] : [], tasks: JSON.parse(JSON.stringify(tasks).replace(/\uf0be/g, "—")) },
      header: paperHeaderSchema.parse({}), fontSize: 12, font: "kalpurush", updatedAt: "2026-11-10T00:00:00.000Z",
    });
    return englishItemGroups(draft).map(item => ({ ...item, draft: { ...item.draft, name: draft.name } }));
  };
  return [
    ...prepare("seen-1", ["mcq", "comprehension"], seen.tasks.map((task, index) => ({
      ...task, passageKey: "seen-1",
      subitems: task.subitems.map(sub => ({ ...sub, answer: task.id === "mcq" ? sub.answer.replace(/^[iv]+\.\s*/, "") : sub.answer })),
      boardSource: source(index + 1, 1, index === 0 ? 7 : 10),
    })), seen.passage),
    ...prepare("unseen", ["information", "summary"], unseen.tasks.map((task, index) => ({
      ...task, passageKey: "unseen", boardSource: source(index + 4, 2, index === 0 ? 5 : 10),
      instruction: task.id === "information" ? `${task.instruction}\nCaptain Mohiuddin Jahangir\nSpecialty: One of the greatest freedom fighters\nRecognition: Birshrestho` : task.instruction,
    })), unseen.passage),
    ...more.items.flatMap(entry => prepare(entry.group, entry.tasks.map(t => t.id), entry.tasks.map(task => {
      const { sourceQuestion, sourceMarks, pdfPage, ...content } = task;
      return { ...content, ...(entry.passage ? { passageKey: entry.group } : {}), boardSource: source(sourceQuestion, pdfPage, sourceMarks) };
    }), entry.passage, entry.topic)),
  ];
}
