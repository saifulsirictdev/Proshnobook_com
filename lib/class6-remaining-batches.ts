import {parseQuestionUpload} from "./question-json-import";
import type {PreparedBatch} from "./prepared-question-batches";
import ch3 from "@/content/question-bank/class-6/chapter-3/questions.json";
import ch4 from "@/content/question-bank/class-6/chapter-4/questions.json";
import ch5 from "@/content/question-bank/class-6/chapter-5/questions.json";
import ch6 from "@/content/question-bank/class-6/chapter-6/questions.json";
import ch7 from "@/content/question-bank/class-6/chapter-7/questions.json";
import ch8 from "@/content/question-bank/class-6/chapter-8/questions.json";
import r3 from "@/content/question-bank/class-6/chapter-3/validation.json";
import r4 from "@/content/question-bank/class-6/chapter-4/validation.json";
import r5 from "@/content/question-bank/class-6/chapter-5/validation.json";
import r6 from "@/content/question-bank/class-6/chapter-6/validation.json";
import r7 from "@/content/question-bank/class-6/chapter-7/validation.json";
import r8 from "@/content/question-bank/class-6/chapter-8/validation.json";
export function remainingMathBatches():PreparedBatch[]{
 return [ch3,ch4,ch5,ch6,ch7,ch8].map((input,i)=>{
  const {batch,records}=parseQuestionUpload(JSON.stringify(input),{category:input.category,subject:input.subject,group:"",topic:input.topic});
  const review=[r3,r4,r5,r6,r7,r8][i];
  return {id:`class6-math-ch${i+3}-mixed-v1`,category:batch.category,subject:batch.subject,topic:batch.topic,title:`১০০ MCQ + ৩০ CQ + ৩০ SQ — ${batch.topic}`,lang:batch.lang,limitations:review.limitations.join(" "),records:records.map((q,j)=>({kind:batch.items[j].type,text:q.text,options:q.options,correct:q.correct,explanation:q.explanation,difficulty:q.difficulty})),provenance:{book:batch.book,edition:batch.edition,sourceUrl:batch.sourceUrl,references:batch.items.map(q=>q.page),review}};
 });
}
