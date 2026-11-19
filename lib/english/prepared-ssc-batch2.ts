import batch from "./data/ssc-board-2024-batch2.json";
import nextBatch from "./data/ssc-board-2024-batch3.json";
import { validateEnglishDraft } from "./draft";
import { englishItemGroups } from "./item-bank";
import { paperHeaderSchema } from "../paper-header";
/** Source-image checked question drafts, never implicitly imported or approved. */
export function preparedSSCBoardBatch2() {
  return [...batch.items, ...nextBatch.items].flatMap(entry => {
    const passage = entry.passage;
    const draft = validateEnglishDraft({
      version: 1, name: `SSC Class 10 — ${entry.board} 2024 ${entry.group} — teacher review required`,
      selection: { grade:10,paper:1,mode:"selected",itemIds:entry.tasks.map(t=>t.id),writing:{},includeAnswers:true,
        sources: passage && entry.group !== "unseen" ? {[entry.group]:{text:passage,reference:`${entry.board} Board 2024, supplied board compilation, PDF question p.${[...new Set(entry.tasks.map(t=>t.pdfPage))].join(",")}; passage may begin on the preceding page. Assistant-prepared answers; teacher review required.`}} : {} },
      output: { passages:passage?[{key:entry.group,text:passage}]:[],tasks:entry.tasks.map(task=>{
        const {sourceQuestion,sourceMarks,pdfPage,...content}=task;
        return {...content,...(passage?{passageKey:entry.group}:{}),boardSource:{board:entry.board,examYear:batch.examYear,sourceFile:batch.sourceFile,pdfPage,questionNumber:sourceQuestion,originalMarks:sourceMarks}};
      }) },
      header:paperHeaderSchema.parse({}),fontSize:12,font:"kalpurush",updatedAt:"2026-11-10T00:00:00.000Z",
    });
    return englishItemGroups(draft).map(item=>({...item,draft:{...item.draft,name:draft.name}}));
  });
}
