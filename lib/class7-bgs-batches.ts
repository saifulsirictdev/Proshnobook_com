// Register only shipped source files. Add chapter 11 together with its sources.
import {parseQuestionUpload} from "./question-json-import";
import type {PreparedBatch} from "./prepared-question-batches";
import ch1p1 from "@/content/question-bank/class-7/bgs/chapter-1/questions-part-01.json";
import ch1p2 from "@/content/question-bank/class-7/bgs/chapter-1/questions-part-02.json";
import review1 from "@/content/question-bank/class-7/bgs/chapter-1/validation.json";
import ch2p1 from "@/content/question-bank/class-7/bgs/chapter-2/questions-part-01.json";
import ch2p2 from "@/content/question-bank/class-7/bgs/chapter-2/questions-part-02.json";
import review2 from "@/content/question-bank/class-7/bgs/chapter-2/validation.json";
import ch3p1 from "@/content/question-bank/class-7/bgs/chapter-3/questions-part-01.json";
import ch3p2 from "@/content/question-bank/class-7/bgs/chapter-3/questions-part-02.json";
import review3 from "@/content/question-bank/class-7/bgs/chapter-3/validation.json";
import ch4p1 from "@/content/question-bank/class-7/bgs/chapter-4/questions-part-01.json";
import ch4p2 from "@/content/question-bank/class-7/bgs/chapter-4/questions-part-02.json";
import review4 from "@/content/question-bank/class-7/bgs/chapter-4/validation.json";
import ch5p1 from "@/content/question-bank/class-7/bgs/chapter-5/questions-part-01.json";
import ch5p2 from "@/content/question-bank/class-7/bgs/chapter-5/questions-part-02.json";
import review5 from "@/content/question-bank/class-7/bgs/chapter-5/validation.json";
import ch6p1 from "@/content/question-bank/class-7/bgs/chapter-6/questions-part-01.json";
import ch6p2 from "@/content/question-bank/class-7/bgs/chapter-6/questions-part-02.json";
import review6 from "@/content/question-bank/class-7/bgs/chapter-6/validation.json";
import ch7p1 from "@/content/question-bank/class-7/bgs/chapter-7/questions-part-01.json";
import ch7p2 from "@/content/question-bank/class-7/bgs/chapter-7/questions-part-02.json";
import review7 from "@/content/question-bank/class-7/bgs/chapter-7/validation.json";
import ch8p1 from "@/content/question-bank/class-7/bgs/chapter-8/questions-part-01.json";
import ch8p2 from "@/content/question-bank/class-7/bgs/chapter-8/questions-part-02.json";
import review8 from "@/content/question-bank/class-7/bgs/chapter-8/validation.json";
import ch9p1 from "@/content/question-bank/class-7/bgs/chapter-9/questions-part-01.json";
import ch9p2 from "@/content/question-bank/class-7/bgs/chapter-9/questions-part-02.json";
import review9 from "@/content/question-bank/class-7/bgs/chapter-9/validation.json";
import ch10p1 from "@/content/question-bank/class-7/bgs/chapter-10/questions-part-01.json";
import ch10p2 from "@/content/question-bank/class-7/bgs/chapter-10/questions-part-02.json";
import review10 from "@/content/question-bank/class-7/bgs/chapter-10/validation.json";
export function class7BgsBatches():PreparedBatch[]{
 return [{input:ch1p1,review:review1,chapter:1,part:1},{input:ch1p2,review:review1,chapter:1,part:2},{input:ch2p1,review:review2,chapter:2,part:1},{input:ch2p2,review:review2,chapter:2,part:2},{input:ch3p1,review:review3,chapter:3,part:1},{input:ch3p2,review:review3,chapter:3,part:2},{input:ch4p1,review:review4,chapter:4,part:1},{input:ch4p2,review:review4,chapter:4,part:2},{input:ch5p1,review:review5,chapter:5,part:1},{input:ch5p2,review:review5,chapter:5,part:2},{input:ch6p1,review:review6,chapter:6,part:1},{input:ch6p2,review:review6,chapter:6,part:2},{input:ch7p1,review:review7,chapter:7,part:1},{input:ch7p2,review:review7,chapter:7,part:2},{input:ch8p1,review:review8,chapter:8,part:1},{input:ch8p2,review:review8,chapter:8,part:2},{input:ch9p1,review:review9,chapter:9,part:1},{input:ch9p2,review:review9,chapter:9,part:2},{input:ch10p1,review:review10,chapter:10,part:1},{input:ch10p2,review:review10,chapter:10,part:2}].map(({input,review,chapter,part})=>{
 const {batch,records}=parseQuestionUpload(JSON.stringify(input),{category:input.category,subject:input.subject,group:"",topic:input.topic});
 return {id:`class7-bgs-ch${chapter}-part-0${part}-draft-v1`,category:batch.category,subject:batch.subject,topic:batch.topic,lang:batch.lang,title:`অধ্যায় ${chapter} — ${part===1?"২০০ MCQ":"১০০ CQ + ৭০ SQ"}; শিক্ষক-যাচাই বাকি`,limitations:review.limitations.join(" "),records:records.map((q,i)=>({kind:batch.items[i].type,text:q.text,options:q.options,correct:q.correct,explanation:q.explanation,difficulty:q.difficulty})),provenance:{book:batch.book,edition:batch.edition,sourceUrl:batch.sourceUrl,references:batch.items.map(q=>q.page),review}};
 });
}
