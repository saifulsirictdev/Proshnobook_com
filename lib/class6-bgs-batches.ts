import {parseQuestionUpload} from "./question-json-import";
import type {PreparedBatch} from "./prepared-question-batches";
import ch1 from "@/content/question-bank/class-6/bgs/chapter-1/questions.json";
import review1 from "@/content/question-bank/class-6/bgs/chapter-1/validation.json";
import ch2 from "@/content/question-bank/class-6/bgs/chapter-2/questions.json";
import review2 from "@/content/question-bank/class-6/bgs/chapter-2/validation.json";
import ch3 from "@/content/question-bank/class-6/bgs/chapter-3/questions.json";
import review3 from "@/content/question-bank/class-6/bgs/chapter-3/validation.json";
import ch4 from "@/content/question-bank/class-6/bgs/chapter-4/questions.json";
import review4 from "@/content/question-bank/class-6/bgs/chapter-4/validation.json";
import ch5 from "@/content/question-bank/class-6/bgs/chapter-5/questions.json";
import review5 from "@/content/question-bank/class-6/bgs/chapter-5/validation.json";
import ch6 from "@/content/question-bank/class-6/bgs/chapter-6/questions.json";
import review6 from "@/content/question-bank/class-6/bgs/chapter-6/validation.json";
import ch7 from "@/content/question-bank/class-6/bgs/chapter-7/questions.json";
import review7 from "@/content/question-bank/class-6/bgs/chapter-7/validation.json";
import ch8 from "@/content/question-bank/class-6/bgs/chapter-8/questions.json";
import review8 from "@/content/question-bank/class-6/bgs/chapter-8/validation.json";
export function bgsBatches():PreparedBatch[]{
 return [{input:ch1,review:review1,chapter:1},{input:ch2,review:review2,chapter:2},{input:ch3,review:review3,chapter:3},{input:ch4,review:review4,chapter:4},{input:ch5,review:review5,chapter:5},{input:ch6,review:review6,chapter:6},{input:ch7,review:review7,chapter:7},{input:ch8,review:review8,chapter:8}].map(({input,review,chapter})=>{
 const {batch,records}=parseQuestionUpload(JSON.stringify(input),{category:input.category,subject:input.subject,group:"",topic:input.topic});
 return {id:`class6-bgs-ch${chapter}-draft-v1`,category:batch.category,subject:batch.subject,topic:batch.topic,lang:batch.lang,title:`অধ্যায় ${chapter} — ১০০ MCQ + ৩০ CQ + ৩০ SQ; শিক্ষক-যাচাই বাকি`,limitations:review.limitations.join(" "),records:records.map((q,i)=>({kind:batch.items[i].type,text:q.text,options:q.options,correct:q.correct,explanation:q.explanation,difficulty:q.difficulty})),provenance:{book:batch.book,edition:batch.edition,sourceUrl:batch.sourceUrl,references:batch.items.map(q=>q.page),review}};
 });
}
