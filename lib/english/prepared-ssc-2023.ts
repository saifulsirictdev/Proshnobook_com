import batch from "./data/ssc-board-2023-review.json";
import type { EnglishGeneratedOutput } from "./generation";
import { validateEnglishDraft } from "./draft";
import { englishItemGroups } from "./item-bank";
import { paperHeaderSchema } from "../paper-header";
/** Explicit subsets of original 2023 questions, not intact historic paper snapshots. */
export function preparedSSC2023Items() {
  type ReviewTask = EnglishGeneratedOutput["tasks"][number] & {sourceQuestion:number;sourceMarks:number;pdfPage:number;originalSubitemCount?:number;selectedParts?:string[];sourceQuestions?:unknown[]};
  const entries: {board:string;group:string;passage?:string;topic?:string;tasks:ReviewTask[]}[] = batch.items;
  return entries.flatMap(entry => {
    const passage = entry.passage;
    const draft = validateEnglishDraft({
      version:1,name:`SSC Class 10 — ${entry.board} 2023 ${entry.group} — teacher review required`,
      selection:{grade:10,paper:1,mode:"selected",itemIds:entry.tasks.map(t=>t.id),includeAnswers:true,
        writing:entry.topic?{[entry.group]:{topic:entry.topic}}:{},
        sources:passage?{[entry.group]:{text:passage,reference:`${entry.board} Board 2023, file ${batch.sourceFile}, PDF question p.${[...new Set(entry.tasks.map(t=>t.pdfPage))].join(",")}. Practice subset where original counts differ; original parts/counts kept in metadata. Assistant-prepared answers; teacher review required.`}}:{}},
      output:{passages:passage?[{key:entry.group,text:passage}]:[],tasks:entry.tasks.map(task=>{
        const {sourceQuestion,sourceMarks,pdfPage,originalSubitemCount,selectedParts,sourceQuestions,...content}=task;
        return {...content,...(passage?{passageKey:entry.group}:{}),boardSource:{board:entry.board,examYear:batch.examYear,sourceFile:batch.sourceFile,pdfPage,questionNumber:sourceQuestion,originalMarks:sourceMarks,...(originalSubitemCount?{originalSubitemCount,selectedParts}:{})}};
      })},
      header:paperHeaderSchema.parse({}),fontSize:12,font:"kalpurush",updatedAt:"2026-11-10T00:00:00.000Z",
    });
    return englishItemGroups(draft).map(item=>({...item,draft:{...item.draft,name:draft.name}}));
  });
}
