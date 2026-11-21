import class7 from "./data/class7-first-reference-model.json";
import class8 from "./data/class8-first-reference-model.json";
import {validateEnglishDraft} from "./draft";
import {englishItemGroups} from "./item-bank";
import {paperHeaderSchema} from "../paper-header";
/** Distinct, image-checked textbook extracts; original questions and suggested keys.
 * The formerly denied Class 7 Seen guide is not a source and is never retried.
 */
export function preparedJuniorFirstItems(grade: number) {
  if(grade!==7 && grade!==8)return [];
  const data=grade===7?class7:class8;
  const header=paperHeaderSchema.parse({enabled:true});
  for(const field of Object.values(header.fields))field.enabled=false;
  Object.assign(header.fields.subject,{enabled:true,value:`Class ${grade} English First Paper`});
  Object.assign(header.fields.program,{enabled:true,value:"Practice Model Test"});
  const draft=validateEnglishDraft({version:1,name:`Class ${grade} — first-paper textbook model 01`,
    selection:{grade,paper:1,mode:"full",itemIds:[],sources:data.sources,writing:data.writing,includeAnswers:true},
    output:data.output,header,fontSize:11,font:"serif",updatedAt:"2026-11-20T00:00:00.000Z"});
  return englishItemGroups(draft).map(part=>({...part,review:{entryId:data.id,...data.provenance}}));
}
