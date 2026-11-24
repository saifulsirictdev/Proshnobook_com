import {parseQuestionUpload} from "./question-json-import";
import type {PreparedBatch} from "./prepared-question-batches";
import mcq1 from "@/content/question-bank/ssc/chemistry/chapter-9/mcq-1.json";
import mcq2 from "@/content/question-bank/ssc/chemistry/chapter-9/mcq-2.json";
import mcq3 from "@/content/question-bank/ssc/chemistry/chapter-9/mcq-3.json";
import cq1 from "@/content/question-bank/ssc/chemistry/chapter-9/cq-1.json";
import sq from "@/content/question-bank/ssc/chemistry/chapter-9/sq-1.json";
import review from "@/content/question-bank/ssc/chemistry/chapter-9/validation.json";

/** Pure prepared-library registration, not permission to save/approve/publish. */
export function sscChemistryChapter9Batches():PreparedBatch[]{
 const names=["mcq-1","mcq-2","mcq-3","cq-1","sq-1"];
 return [mcq1,mcq2,mcq3,cq1,sq].map((input,index)=>{
  const {batch,records}=parseQuestionUpload(JSON.stringify(input),{category:input.category,subject:input.subject,group:"",topic:input.topic});
  const authoring=review.ledger.filter(x=>x.file===`${names[index]}.json`);
  if(authoring.length!==records.length||authoring.some((m,i)=>m.itemIndex!==i+1))throw Error("Chapter9 authoring ledger mismatch");
  return {
   id:`ssc-chemistry-ch9-${names[index]}-v1`,category:batch.category,subject:batch.subject,topic:batch.topic,lang:batch.lang,
   title:`অধ্যায় ৯ — ${records.length} ${index<3?"MCQ":index<4?"CQ":"SQ"} (${names[index]}) — সাধারণ বোর্ড-ধাঁচের খসড়া`,
   limitations:"৪৮০টি খসড়া: পাঠ্যবইয়ের৯টি, সাট একাডেমির৬টি ও নিজস্ব৪৬৫টি; সব সমাধান নিজস্ব। একই অম্ল/লবণ/পানির ভিন্ন কাজ, pHঘনমাত্রা/তুলনা/নির্দেশকের ডেটা ও১০টি ভর-অনুপাতের ভ্যারিয়েন্ট আছে;৪৮০টি স্বতন্ত্র ঐতিহাসিক বোর্ড প্রশ্ন নয়। সাটের বোর্ড পরিচয় মূল বোর্ডপত্রে যাচাই বাকি; কল্পিত PDFলোকেটর নেই। CO₂/SO₂দুটিই থাকা চুনেরপানির প্রশ্ন বাদ, অনুপস্থিত চিত্র কল্পনায় পূরণ নয়। pHঠিক থাকলেই পানি নিরাপদ নয়; ফোটানো/ক্লোরিনেশন সব বিষ দূর করে না। CQ১/২/৩/৪অনুশীলন, অফিসিয়াল রসায়ন মানবণ্টনের দাবি নয়। শিক্ষক যাচাই বাকি।",
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
