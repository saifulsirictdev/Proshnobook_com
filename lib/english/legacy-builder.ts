import { validateEnglishDraft, type EnglishDraft } from "./draft";
import { englishItemGroups } from "./item-bank";
import { englishBlueprint, englishMarksLabel, type EnglishGrade } from "./blueprints";
import { restoreSettings, type PaperItem } from "../paper-builder";
import { applyHeader } from "../paper-header";
/** Adapt owned drafts to the original builder without flattening passage/table/answer data. */
export function englishLegacyPaper(raw: EnglishDraft) {
  const draft = validateEnglishDraft(raw);
  const blueprint = englishBlueprint(draft.selection.grade as EnglishGrade,draft.selection.paper,draft.selection.modelStyle);
  const referenceModel = draft.selection.grade === 8 && draft.selection.paper === 2;
  const seenParts = new Set<string>();
  const items: PaperItem[] = englishItemGroups(draft).map(group=>{
    const section = blueprint.items.find(i=>i.id===group.draft.output.tasks[0]?.id)!.section;
    const part = {id:section,title:`Part ${String.fromCharCode(65+blueprint.sections.findIndex(s=>s.id===section))} — ${section[0].toUpperCase()+section.slice(1)}${referenceModel ? ` (${blueprint.sections.find(s=>s.id===section)!.marks} Marks)` : ""}`};
    const partHeading = seenParts.has(section) ? undefined : part.title;
    seenParts.add(section);
    return {
      id:group.key, type:"SHORT", text:group.draft.output.tasks.map(t=>t.instruction).join("\n"),
      subject:`English ${draft.selection.paper===1?"1st":"2nd"} Paper`,category:`Class ${draft.selection.grade}`,
      englishGroup:{referenceModel,part,partHeading,passages:group.draft.output.passages,tasks:group.draft.output.tasks.map(t=>({...t,number:blueprint.items.findIndex(i=>i.id===t.id)+1,marks:blueprint.items.find(i=>i.id===t.id)!.marks,marksLabel:englishMarksLabel(blueprint.items.find(i=>i.id===t.id)!)}))},
    };
  });
  const base = restoreSettings({cfg:{cols:1,cqColumns:1,label:"abc",font:draft.font==="sans-serif"?"hind":draft.font,fontSize:draft.fontSize,...draft.layout}});
  // A disabled header still contains schema placeholder values (e.g. 50 marks,
  // 30 minutes). Do not copy them into Page Setup and override real paper totals.
  // Explicit custom headers and saved owner settings remain authoritative.
  const settings = draft.builderSettings ? restoreSettings(draft.builderSettings) : draft.header.enabled ? applyHeader(base,draft.header) : base;
  // English model papers need visible question marks on first setup.
  // Preserve the owner's explicit saved Show/Hide and Page Setup preferences.
  if (!draft.builderSettings) settings.show.marks = true;
  // Compact reference defaults only on first setup; never overwrite saved Page Setup.
  if (referenceModel && !draft.builderSettings) {
    Object.assign(settings.cfg, {fontSize:11, lineHeight:1.3, questionGap:5, marginTop:24, marginBottom:24, marginLeft:45, marginRight:45, autoFit:false});
    settings.show.marks = true;
    settings.show.pageNumbers = false;
  }
  return {items,settings};
}
