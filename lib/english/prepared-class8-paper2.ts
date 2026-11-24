import {createHash} from "node:crypto";
import {class8English2Batches} from "../class8-english2-batches";
import {preparedQuestionId} from "../prepared-question-batches";
import {validateEnglishDraft} from "./draft";
import {englishItemGroups} from "./item-bank";
import {paperHeaderSchema} from "../paper-header";
import type {EnglishGeneratedOutput} from "./generation";
const hash = (v: unknown) => createHash("sha256").update(JSON.stringify(v)).digest("hex");
const labelled = (s: string, count: number) => {
  const matches=[...s.matchAll(/\(([a-j])\)\s*([\s\S]*?)(?=\([a-j]\)|$)/g)];
  if(matches.length!==count || matches.map(m=>m[1]).join("")!=="abcdefghij".slice(0,count)) throw Error("Incomplete Class 8 labelled exercise/key");
  return matches.map(m=>m[2].trim());
};
function referenceHeader() {
  const h=paperHeaderSchema.parse({enabled:true});
  for(const f of Object.values(h.fields))f.enabled=false;
  Object.assign(h.fields.subject,{enabled:true,value:"English Second Paper · Model Tests"});
  Object.assign(h.fields.program,{enabled:true,value:"Final/Annual Examination"});
  Object.assign(h.fields.setCode,{enabled:true,value:"Model Test-05"});
  return h;
}
/** Deterministic format adaptations of the previously reviewed SQ snapshots.
 * No DB reads/writes/approval on registry access. Original rows/receipts stay immutable.
 */
export function preparedClass8Paper2Items(grade: number) {
  if(grade!==8)return [];
  return class8English2Batches().flatMap(batch=>batch.records.flatMap((record,index)=>{
    const slug=batch.id.replace("class8-english2-","").replace("-drive-v1","");
    const correspondence=["formal-letter","informal-letter","formal-email","informal-email"].includes(slug);
    const id=correspondence?"letter-email":slug;
    const originalText=record.text.trim(), explanation=record.explanation.trim();
    let instruction=originalText, task:EnglishGeneratedOutput["tasks"][number]={id,instruction,subitems:[]};
    let writing: Record<string,{topic:string;choice?:string;words?:number}>={};
    if(id==="gap-clues") {
      // The first raw model extracts have marks and prose on the same line.
      const body=originalText.includes("\n")?originalText.slice(originalText.indexOf("\n")+1):originalText.replace(/^[\s\S]*?\.5\s*×\s*10\s*=\s*5\s*/,"");
      instruction="Complete the text using suitable words.\n"+body;
      task.answer=explanation.slice(explanation.indexOf("(a)"));
      labelled(task.answer,10);
    } else if(id==="verbs" || id==="narration" || id==="punctuation") {
      const newline=originalText.indexOf("\n");if(newline<0)throw Error("Missing Class 8 passage");
      const heading=id==="verbs"?"Fill in the blanks with the correct form of the verbs given in the brackets.":id==="narration"?"Rewrite the following passage in the reported speech.":"Use appropriate punctuation marks and capital letters where necessary.";
      instruction=heading+"\n"+originalText.slice(newline+1);
      task.answer=id==="verbs"?explanation.slice(explanation.indexOf("(a)")):explanation.replace(/^(?:Suggested answer:|One possible corrected passage:)\s*/,"");
    } else if(id==="substitution") {
      const rows=originalText.split("\n").filter(l=>l.includes("|")).map(l=>l.split("|").map(c=>c.trim())).filter(r=>!/^Column A$/i.test(r[0]));
      if(rows.length!==5 || rows.some(r=>r.length!==3))throw Error("Incomplete Class 8 substitution table");
      const keys=explanation.split("\n").filter(l=>/^\d+[.)]\s/.test(l)).map(l=>l.replace(/^\d+[.)]\s*/,""));
      if(keys.length!==5)throw Error("Incomplete substitution answer key");
      instruction="Make five meaningful sentences from the following substitution table.";
      task.table={headers:["A","B","C"],rows};
      task.subitems=keys.map(answer=>({text:"Make a meaningful sentence using one fragment from each column.",answer}));
    } else if(id==="transformation") {
      const questions=labelled(originalText,5), answers=labelled(explanation,5);
      instruction="Change the following sentences as directed in the brackets without changing their meaning.";
      task.subitems=questions.map((text,i)=>({text,answer:answers[i]}));
    } else if(correspondence || id==="composition") {
      const topic=id==="composition"?originalText.match(/“([^”]+)”/)?.[1]:originalText;
      if(!topic)throw Error("Missing writing topic");
      writing={[id]:{topic,...(correspondence?{choice:slug}:{words:250})}};
      task.answer=explanation.replace(/^Sample (?:answer|email \(addresses are examples\)|composition):\s*/,"");
    } else throw Error("Unexpected Class 8 item");
    task.instruction=instruction;
    const draft=validateEnglishDraft({version:1,name:`Class 8 Second Paper — ${slug} ${index+1}`,selection:{grade:8,paper:2,modelStyle:"class8-reference-v1",mode:"selected",itemIds:[id],sources:{},writing,includeAnswers:true},output:{passages:[],tasks:[task]},header:referenceHeader(),fontSize:11,font:"serif",updatedAt:"2026-11-21T08:00:00.000Z"});
    const parts=englishItemGroups(draft);
    if(parts.length!==1)throw Error("Unexpected Class 8 structured group");
    return parts.map(part=>({...part,review:{kind:"CLASS8_REFERENCE_FORMAT_ADAPTATION",originalQuestionId:preparedQuestionId(batch,record),batchId:batch.id,entry:index+1,originalRecordSha256:hash(record),sourceFileId:(batch.provenance as {sourceFileId:string}).sourceFileId,originalExplanation:explanation,normalizations:["Separate server-owned numbering and marks from printable instruction","Represent complete passages and answer keys in the structured model schema","Retain original source/question content and writing alternatives"],limitations:"Owner-authorized model-format adaptation; not independently performed teacher or official syllabus certification. Hypothetical prompt schools are not examination provenance."}}));
  }));
}
export function class8StructuredDigest() {
  return hash(preparedClass8Paper2Items(8).map(p=>({key:p.key,draft:p.draft,review:p.review})));
}
