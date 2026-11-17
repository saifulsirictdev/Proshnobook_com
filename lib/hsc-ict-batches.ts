import {parseQuestionUpload} from "./question-json-import";
import type {PreparedBatch} from "./prepared-question-batches";
import q1 from "@/content/question-bank/class-11-12/ict/chapter-1/questions.json";
import r1 from "@/content/question-bank/class-11-12/ict/chapter-1/validation.json";
import q2 from "@/content/question-bank/class-11-12/ict/chapter-2/questions.json";
import r2 from "@/content/question-bank/class-11-12/ict/chapter-2/validation.json";
import q3 from "@/content/question-bank/class-11-12/ict/chapter-3/questions.json";
import r3 from "@/content/question-bank/class-11-12/ict/chapter-3/validation.json";
import q4 from "@/content/question-bank/class-11-12/ict/chapter-4/questions.json";
import r4 from "@/content/question-bank/class-11-12/ict/chapter-4/validation.json";
import q5 from "@/content/question-bank/class-11-12/ict/chapter-5/questions.json";
import r5 from "@/content/question-bank/class-11-12/ict/chapter-5/validation.json";
import q6 from "@/content/question-bank/class-11-12/ict/chapter-6/questions.json";
import r6 from "@/content/question-bank/class-11-12/ict/chapter-6/validation.json";
export function hscIctBatches():PreparedBatch[]{
 const inputs=[q1,q2,q3,q4,q5,q6], reviews=[r1,r2,r3,r4,r5,r6];
 return inputs.map((input,i)=>{
  const {batch,records}=parseQuestionUpload(JSON.stringify(input),{category:input.category,subject:input.subject,group:"",topic:input.topic});
  const review=reviews[i];
  return {id:`hsc-ict-ch${i+1}-external-draft-v1`,category:batch.category,subject:batch.subject,topic:batch.topic,lang:batch.lang,title:`যাচাইযোগ্য Draft — ${review.counts.MCQ} MCQ + ${review.counts.CQ} CQ + ${review.counts.SQ} SQ`,limitations:review.limitations.join(" "),records:records.map((q,j)=>({kind:batch.items[j].type,text:q.text,options:q.options,correct:q.correct,explanation:q.explanation,difficulty:q.difficulty})),provenance:{book:batch.book,edition:batch.edition,sourceUrl:batch.sourceUrl,references:batch.items.map(q=>q.page),review}};
 });
}
