import batch from "./data/ssc-rajshahi-2024-items.json";
import { validateEnglishDraft } from "./draft";
import { englishItemGroups } from "./item-bank";
import { paperHeaderSchema } from "../paper-header";
/** Image-checked prompts; all answer keys remain teacher-review drafts. */
export function preparedRajshahiItems() {
  return batch.items.flatMap(entry => {
    const passage = entry.passage;
    const draft = validateEnglishDraft({
      version: 1, name: `SSC Class 10 — Rajshahi 2024 ${entry.group} — teacher review required`,
      selection: { grade: 10, paper: 1, mode: "selected", itemIds: entry.tasks.map(t => t.id), writing: {}, includeAnswers: true,
        sources: passage ? { [entry.group]: { text: passage, reference: "Rajshahi Board 2024, supplied compilation PDF p.3 / printed p.17. Assistant-prepared answers; teacher review required. MCQ held separately; no complete Seen MCQ set claimed." } } : {} },
      output: { passages: passage ? [{ key: entry.group, text: passage }] : [], tasks: entry.tasks.map(task => {
        const {sourceQuestion,sourceMarks,pdfPage,...content}=task;
        return { ...content, ...(passage ? {passageKey: entry.group} : {}), boardSource: {board:"Rajshahi",examYear:2024,sourceFile:batch.sourceFile,pdfPage,questionNumber:sourceQuestion,originalMarks:sourceMarks} };
      }) },
      header: paperHeaderSchema.parse({}), fontSize:12,font:"kalpurush",updatedAt:"2026-11-10T00:00:00.000Z",
    });
    return englishItemGroups(draft).map(item=>({...item,draft:{...item.draft,name:draft.name}}));
  });
}
