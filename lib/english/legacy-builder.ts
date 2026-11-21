import { validateEnglishDraft, type EnglishDraft } from "./draft";
import { englishItemGroups } from "./item-bank";
import { englishBlueprint, type EnglishGrade } from "./blueprints";
import { restoreSettings, type PaperItem } from "../paper-builder";
import { applyHeader } from "../paper-header";
/** Adapt owned drafts to the original builder without flattening passage/table/answer data. */
export function englishLegacyPaper(raw: EnglishDraft) {
  const draft = validateEnglishDraft(raw);
  const blueprint = englishBlueprint(draft.selection.grade as EnglishGrade,draft.selection.paper);
  const seenParts = new Set<string>();
  const items: PaperItem[] = englishItemGroups(draft).map(group=>{
    const section = blueprint.items.find(i=>i.id===group.draft.output.tasks[0]?.id)!.section;
    const part = {id:section,title:`Part ${String.fromCharCode(65+blueprint.sections.findIndex(s=>s.id===section))} — ${section[0].toUpperCase()+section.slice(1)}`};
    const partHeading = seenParts.has(section) ? undefined : part.title;
    seenParts.add(section);
    return {
      id:group.key, type:"SHORT", text:group.draft.output.tasks.map(t=>t.instruction).join("\n"),
      subject:`English ${draft.selection.paper===1?"1st":"2nd"} Paper`,category:`Class ${draft.selection.grade}`,
      englishGroup:{part,partHeading,passages:group.draft.output.passages,tasks:group.draft.output.tasks.map(t=>({...t,number:blueprint.items.findIndex(i=>i.id===t.id)+1,marks:blueprint.items.find(i=>i.id===t.id)!.marks}))},
    };
  });
  const settings = draft.builderSettings ? restoreSettings(draft.builderSettings) : applyHeader(restoreSettings({cfg:{cols:1,cqColumns:1,label:"abc",font:draft.font==="sans-serif"?"hind":draft.font,fontSize:draft.fontSize,...draft.layout}}),draft.header);
  return {items,settings};
}
