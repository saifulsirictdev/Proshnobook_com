import {bgsBatches} from "./class6-bgs-batches";
import {hscIctBatches} from "./hsc-ict-batches";
import {scienceStarterBatches} from "./class6-science-batches";
import {remainingMathBatches} from "./class6-remaining-batches";
import {createHash} from "node:crypto";
import {parseQuestionUpload} from "./question-json-import";
import chapter2 from "@/content/question-bank/class-6/chapter-2/questions.json";
import chapter2Review from "@/content/question-bank/class-6/chapter-2/validation.json";
import {NCTB_CLASSES} from "./nctb-data";
import {parseMCQBatch,normalizeStem} from "./mcq-import";
import {writtenRecords} from "./written-question-import";
import mcq from "@/content/question-bank/class-6/math-ch1-draft.json";
import written from "@/deliverables/class6-math-ch1/cq-sq-draft.json";
import review from "@/deliverables/class6-math-ch1/chapter-alignment-review.json";
export type PreparedRecord={kind:"MCQ"|"CQ"|"SQ";text:string;options:Record<string,unknown>;correct:string;explanation:string;difficulty:"EASY"|"MEDIUM"|"HARD"};
export type PreparedBatch={id:string;category:string;subject:string;topic:string;title:string;lang:"Bangla"|"English";limitations:string;records:PreparedRecord[];provenance:unknown};
export const importCatalog=NCTB_CLASSES.map(c=>({category:c.class,subjects:c.subjects.map(s=>({name:s.name,chapters:[...new Set(s.subCategories?s.subCategories.flatMap(g=>g.topics):(s.chapters??[]))]}))}));
// Add each finished chapter here. Only this server registry supplies savable data;
// browser input can select a registered id, never replace its category or answers.
export function preparedBatches():PreparedBatch[]{
 const m=parseMCQBatch(JSON.stringify(mcq));const w=writtenRecords(written);
 const ch2=parseQuestionUpload(JSON.stringify(chapter2),{category:chapter2.category,subject:chapter2.subject,group:"",topic:chapter2.topic});
 return [
  {id:"class6-math-ch1-mcq-v1",category:"Class 6",subject:m.subject,topic:m.topic,title:"১০০ MCQ — নিজস্ব খসড়া",lang:m.lang,limitations:"২৫ দক্ষতার চারটি করে উদাহরণ; স্বাধীন শিক্ষক অনুমোদন বাকি।",records:m.items.map(q=>({kind:"MCQ",text:q.text,options:q.options,correct:q.correct,explanation:q.explanation,difficulty:q.difficulty})),provenance:{book:m.book,edition:m.edition,sourceUrl:m.sourceUrl,references:m.items.map(q=>q.page),review}},
  {id:"class6-math-ch1-written-v1",category:w.batch.class,subject:w.batch.subject,topic:w.batch.topic,title:"৩০ CQ + ৩০ SQ — নিজস্ব খসড়া",lang:"Bangla",limitations:"CQ: ক–খ–গ, ২–৪–৪। ছয় সমস্যা-পরিবার; স্বাধীন শিক্ষক অনুমোদন বাকি।",records:w.records.map(q=>({kind:q.kind as "CQ"|"SQ",text:q.text,options:q.options,correct:"",explanation:q.explanation,difficulty:"MEDIUM"})),provenance:{source:w.batch.source,references:w.records.map(q=>({id:q.id,page:q.referencePrintedPage})),review}},
  {id:"class6-math-ch2-mixed-v1",category:ch2.batch.category,subject:ch2.batch.subject,topic:ch2.batch.topic,title:"১০০ MCQ + ৩০ CQ + ৩০ SQ — অনুপাত ও শতকরা",lang:ch2.batch.lang,limitations:"বইয়ের ৩৮–৫৮ পৃষ্ঠা দেখে ধারণা মিলেছে; ২৫ MCQ/১০ CQ/১৫ SQ পরিবারে সংখ্যাভিত্তিক variant। স্বাধীন শিক্ষক অনুমোদন বাকি।",records:ch2.records.map((q,i)=>({kind:ch2.batch.items[i].type,text:q.text,options:q.options,correct:q.correct,explanation:q.explanation,difficulty:q.difficulty})),provenance:{book:ch2.batch.book,edition:ch2.batch.edition,sourceUrl:ch2.batch.sourceUrl,references:ch2.batch.items.map(q=>q.page),review:chapter2Review}},
  ...remainingMathBatches(),
  ...scienceStarterBatches(),
  ...hscIctBatches(),
  ...bgsBatches()
 ];
}
function validatePreparedBatch(b:PreparedBatch){
 if(!importCatalog.some(c=>c.category===b.category&&c.subjects.some(s=>s.name===b.subject&&s.chapters.includes(b.topic))))throw Error("Invalid catalog scope");
 const stems=new Set<string>();
 if(!b.records.length||b.records.length>200)throw Error("Invalid batch size");
 for(const q of b.records){const stem=normalizeStem(q.text);if(!stem||stems.has(stem)||!q.explanation.trim())throw Error("Invalid question");stems.add(stem);}
 return {batch:b,digest:createHash("sha256").update(JSON.stringify(b)).digest("hex")};
}
export function getPreparedBatch(id:string){
 const b=preparedBatches().find(b=>b.id===id);if(!b)throw Error("Unknown batch");
 return validatePreparedBatch(b);
}
// One registry construction per page load, not once per receipt lookup.
// No shared cache of authorization, user data or database receipts.
export function preparedImportIndex(){
 return preparedBatches().map(b=>{
  const {digest}=validatePreparedBatch(b);
  const {records,provenance,...summary}=b;
  return {...summary,digest,counts:{MCQ:records.filter(q=>q.kind==="MCQ").length,CQ:records.filter(q=>q.kind==="CQ").length,SQ:records.filter(q=>q.kind==="SQ").length}};
 });
}
export const preparedQuestionId=(b:PreparedBatch,q:PreparedRecord)=>"prepared_"+createHash("sha256").update(JSON.stringify([b.category,b.subject,b.topic,q.kind,normalizeStem(q.text)])).digest("hex");
export function preparedSummaries(){return preparedBatches().map(({records,provenance,...b})=>({...b,counts:{MCQ:records.filter(q=>q.kind==="MCQ").length,CQ:records.filter(q=>q.kind==="CQ").length,SQ:records.filter(q=>q.kind==="SQ").length}}));}
