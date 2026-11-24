import data from "./data/hsc-first-reference-model.json";
import {validateEnglishDraft} from "./draft";
import {englishItemGroups} from "./item-bank";
import {paperHeaderSchema} from "../paper-header";

/** The supplied guide is a source of extracts, not proof of school/year authorship.
 * New questions/keys and editorial repairs are disclosed in immutable review data.
 */
export function preparedHSCFirstItems(grade: number) {
  if (grade !== 11 && grade !== 12) return [];
  const header=paperHeaderSchema.parse({enabled:true});
  for(const field of Object.values(header.fields)) field.enabled=false;
  Object.assign(header.fields.subject,{enabled:true,value:"HSC English First Paper"});
  Object.assign(header.fields.program,{enabled:true,value:"Practice Model Test"});
  const draft=validateEnglishDraft({version:1,name:`HSC — Class ${grade} — first-paper reference model 01`,
    selection:{grade,paper:1,modelStyle:"hsc-first-reference-v1",mode:"full",itemIds:[],sources:data.sources,writing:data.writing,includeAnswers:true},
    output:data.output,header,fontSize:11,font:"serif",updatedAt:"2026-11-20T00:00:00.000Z"});
  return englishItemGroups(draft).map(part=>({...part,review:{entryId:data.id,...data.provenance}}));
}
