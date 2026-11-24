import {parseQuestionUpload} from "./question-json-import";
import type {PreparedBatch} from "./prepared-question-batches";
import mcq1 from "@/content/question-bank/ssc/chemistry/chapter-8/mcq-1.json";
import mcq2 from "@/content/question-bank/ssc/chemistry/chapter-8/mcq-2.json";
import cq1 from "@/content/question-bank/ssc/chemistry/chapter-8/cq-1.json";
import sq from "@/content/question-bank/ssc/chemistry/chapter-8/sq-1.json";
import review from "@/content/question-bank/ssc/chemistry/chapter-8/validation.json";

/** Pure prepared-library registration, not permission to save/approve/publish. */
export function sscChemistryChapter8Batches():PreparedBatch[]{
 const names=["mcq-1","mcq-2","cq-1","sq-1"];
 return [mcq1,mcq2,cq1,sq].map((input,index)=>{
  const {batch,records}=parseQuestionUpload(JSON.stringify(input),{category:input.category,subject:input.subject,group:"",topic:input.topic});
  const authoring=review.ledger.filter(x=>x.file===`${names[index]}.json`);
  if(authoring.length!==records.length||authoring.some((m,i)=>m.itemIndex!==i+1))throw Error("Chapter8 authoring ledger mismatch");
  return {
   id:`ssc-chemistry-ch8-${names[index]}-v1`,category:batch.category,subject:batch.subject,topic:batch.topic,lang:batch.lang,
   title:`অধ্যায় ৮ — ${records.length} ${index<2?"MCQ":index<3?"CQ":"SQ"} (${names[index]}) — সাধারণ বোর্ড-ধাঁচের খসড়া`,
   limitations:"৩৭০টি খসড়া: পাঠ্যবইয়ের১১টি, সাট একাডেমির৪টি ও নিজস্ব৩৫৫টি; সব সমাধান নিজস্ব। একই বন্ধন/কোষের ভিন্ন কাজ এবং এনথালপি/তাপের সংখ্যাগত ভ্যারিয়েন্ট আছে;৩৭০টি স্বতন্ত্র আসল বোর্ড প্রশ্ন নয়। সাটের বোর্ড পরিচয় মূল বোর্ডপত্রে যাচাই বাকি, তাই কল্পিত PDF লোকেটর নেই। উৎসের অসমতাযুক্ত নিউক্লীয় সমীকরণ ও অনির্দিষ্ট NaCl-ঘনমাত্রার প্রশ্ন বাদ। গ্যাসীয় গড় বন্ধনশক্তি আনুমানিক; তড়িৎ বিশ্লেষণে দশা, ঘনমাত্রা ও তড়িৎদ্বার নির্দিষ্ট। CQ১/২/৩/৪ অনুশীলন, অফিসিয়াল রসায়ন মানবণ্টনের দাবি নয়। শিক্ষক যাচাই বাকি।",
   records:records.map((q,i)=>({kind:batch.items[i].type,text:q.text,options:{...q.options,_authoring:{
    origin:authoring[i].origin,family:authoring[i].family,answerOrigin:authoring[i].answerOrigin,
    sourceQuestionVerbatim:authoring[i].sourceQuestionVerbatim,reference:batch.items[i].page,
   }},correct:q.correct,explanation:q.explanation,difficulty:q.difficulty})),
   provenance:{book:batch.book,edition:batch.edition,sourceUrl:batch.sourceUrl,references:batch.items.map(x=>x.page),
    authoring,originCounts:review.origins,mixedOrigin:true,teacherCertified:false,fullChapterRead:false,
    wholeBookRead:false,officialYearVerified:false,chemistryExamBlueprintVerified:false,
    webResearchExhaustive:false,allAnswersAssistantAuthored:true},
  };
 });
}
