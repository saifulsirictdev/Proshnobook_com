import {parseQuestionUpload} from "./question-json-import";
import type {PreparedBatch} from "./prepared-question-batches";
import ch1 from "@/content/question-bank/class-6/science/chapter-1/questions.json";
import r1 from "@/content/question-bank/class-6/science/chapter-1/validation.json";
import ch2 from "@/content/question-bank/class-6/science/chapter-2/questions.json";
import r2 from "@/content/question-bank/class-6/science/chapter-2/validation.json";
import ch3 from "@/content/question-bank/class-6/science/chapter-3/questions.json";
import r3 from "@/content/question-bank/class-6/science/chapter-3/validation.json";
import ch4 from "@/content/question-bank/class-6/science/chapter-4/questions.json";
import r4 from "@/content/question-bank/class-6/science/chapter-4/validation.json";
import ch5 from "@/content/question-bank/class-6/science/chapter-5/questions.json";
import r5 from "@/content/question-bank/class-6/science/chapter-5/validation.json";
import ch6 from "@/content/question-bank/class-6/science/chapter-6/questions.json";
import r6 from "@/content/question-bank/class-6/science/chapter-6/validation.json";
import ch7 from "@/content/question-bank/class-6/science/chapter-7/questions.json";
import r7 from "@/content/question-bank/class-6/science/chapter-7/validation.json";
import ch8 from "@/content/question-bank/class-6/science/chapter-8/questions.json";
import r8 from "@/content/question-bank/class-6/science/chapter-8/validation.json";
import ch9 from "@/content/question-bank/class-6/science/chapter-9/questions.json";
import r9 from "@/content/question-bank/class-6/science/chapter-9/validation.json";
import ch10 from "@/content/question-bank/class-6/science/chapter-10/questions.json";
import r10 from "@/content/question-bank/class-6/science/chapter-10/validation.json";
import ch11 from "@/content/question-bank/class-6/science/chapter-11/questions.json";
import r11 from "@/content/question-bank/class-6/science/chapter-11/validation.json";
import ch12 from "@/content/question-bank/class-6/science/chapter-12/questions.json";
import r12 from "@/content/question-bank/class-6/science/chapter-12/validation.json";
import ch13 from "@/content/question-bank/class-6/science/chapter-13/questions.json";
import r13 from "@/content/question-bank/class-6/science/chapter-13/validation.json";
import ch14 from "@/content/question-bank/class-6/science/chapter-14/questions.json";
import r14 from "@/content/question-bank/class-6/science/chapter-14/validation.json";
// Count-complete chapters still require teacher review; no database writes here.
export function scienceStarterBatches():PreparedBatch[]{
 const inputs=[ch1,ch2,ch3,ch4,ch5,ch6,ch7,ch8,ch9,ch10,ch11,ch12,ch13,ch14];
 const reviews=[r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14];
 return inputs.map((input,i)=>{
  const {batch,records}=parseQuestionUpload(JSON.stringify(input),{category:input.category,subject:input.subject,group:"",topic:input.topic});
  const review=reviews[i];
  return {id:`class6-science-ch${i+1}-starter-v1`,category:batch.category,subject:batch.subject,topic:batch.topic,title:`${review.targetMet ? "সংখ্যা পূর্ণ; শিক্ষক-যাচাই বাকি" : "অসম্পূর্ণ Draft"} — ${review.counts.MCQ} MCQ + ${review.counts.CQ} CQ + ${review.counts.SQ} SQ`,lang:batch.lang,limitations:review.limitations.join(" "),records:records.map((q,j)=>({kind:batch.items[j].type,text:q.text,options:q.options,correct:q.correct,explanation:q.explanation,difficulty:q.difficulty})),provenance:{book:batch.book,edition:batch.edition,sourceUrl:batch.sourceUrl,references:batch.items.map(q=>q.page),review}};
 });
}
