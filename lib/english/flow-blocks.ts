import { isEnglishPassageCloze } from "./cloze-layout";
import { isEnglishSharedTable } from "./shared-table";
import type { PaperItem } from "../paper-builder";
/** Recompute headings AFTER exclusions/reordering, so removing question 1 cannot
 * remove Part A. Part letters come from the blueprint, not the selected subset. */
export function withEnglishPartHeadings<T extends {q: PaperItem}>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.map(item => {
    const group = item.q.englishGroup;
    if (!group?.part) return item;
    const partHeading = seen.has(group.part.id) ? undefined : group.part.title;
    seen.add(group.part.id);
    return {...item, q: {...item.q, englishGroup: {...group, partHeading}}};
  });
}
/** Layout fragments only: the saved question set/passage relationships remain untouched. */
export function englishFlowBlocks(q:PaperItem):PaperItem[] {
  const group=q.englishGroup;
  if(!group || group.fragment)return [q];
  // Each Class 8 reference exercise stays intact, including its passage/table.
  // If an unusually long exercise cannot fit, pagination reports it instead of
  // losing content or splitting the transformation list between sheets.
  if(group.referenceModel)return [q];
  const blocks:NonNullable<PaperItem["englishGroup"]>[]=[];
  for(const p of group.passages){
    // Preserve every character. Small line/word chunks let long prose and poems continue.
    const chunks=p.text.match(/(?:[^\s]+\s*){1,55}/g) ?? [p.text];
    for(const text of chunks)blocks.push({fragment:true,passages:[{...p,text}],tasks:[]});
  }
  for(const task of group.tasks){
    // A cloze passage and its clue box are one exercise, not ten standalone prompts.
    if(isEnglishPassageCloze(task)){
      blocks.push({fragment:true,passages:[],tasks:[task]});
      continue;
    }
    // A substitution table is a shared choice bank, not independent row questions.
    // Keep all of its columns available together for every one of the five sentences.
    if(isEnglishSharedTable(task)){
      blocks.push({fragment:true,passages:[],tasks:[task]});
      continue;
    }
    const tables=task.table ? Array.from({length:Math.ceil(task.table.rows.length/4)},(_,i)=>({...task.table!,rows:task.table!.rows.slice(i*4,i*4+4)})) : [];
    if(tables.length){
      tables.forEach((table,i)=>blocks.push({fragment:true,continued:i>0,passages:[],tasks:[{...task,table,clues:i===0?task.clues:undefined,subitems:[],answer:undefined}]}));
    }
    if(task.subitems.length){
      task.subitems.forEach((sub,i)=>blocks.push({fragment:true,continued:tables.length>0||i>0,subitemOffset:i,passages:[],tasks:[{...task,table:undefined,clues:!tables.length&&i===0?task.clues:undefined,subitems:[sub],answer:i===task.subitems.length-1?task.answer:undefined}]}));
    }else if(!tables.length || task.answer){
      blocks.push({fragment:true,continued:tables.length>0,passages:[],tasks:[{...task,table:undefined,clues:tables.length?undefined:task.clues}]});
    }
  }
  return blocks.map((englishGroup,i)=>({...q,id:`${q.id}:flow:${i}`,text:q.text===group.tasks.map(t=>t.instruction).join("\n")?englishGroup.tasks.map(t=>t.instruction).join("\n"):i===0?q.text:englishGroup.tasks.map(t=>t.instruction).join("\n"),englishGroup:{...englishGroup,part:group.part,partHeading:i===0?group.partHeading:undefined,attachmentId:i===0?q.id:undefined}}));
}
