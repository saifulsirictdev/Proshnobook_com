import {parseQuestionUpload} from "./question-json-import";
import type {PreparedBatch} from "./prepared-question-batches";
import mcq1 from "@/content/question-bank/ssc/chemistry/chapter-10/mcq-1.json";
import mcq2 from "@/content/question-bank/ssc/chemistry/chapter-10/mcq-2.json";
import mcq3 from "@/content/question-bank/ssc/chemistry/chapter-10/mcq-3.json";
import mcq4 from "@/content/question-bank/ssc/chemistry/chapter-10/mcq-4.json";
import mcq5 from "@/content/question-bank/ssc/chemistry/chapter-10/mcq-5.json";
import mcq6 from "@/content/question-bank/ssc/chemistry/chapter-10/mcq-6.json";
import mcq7 from "@/content/question-bank/ssc/chemistry/chapter-10/mcq-7.json";
import cq1 from "@/content/question-bank/ssc/chemistry/chapter-10/cq-1.json";
import cq2 from "@/content/question-bank/ssc/chemistry/chapter-10/cq-2.json";
import sq from "@/content/question-bank/ssc/chemistry/chapter-10/sq-1.json";
import review from "@/content/question-bank/ssc/chemistry/chapter-10/validation.json";

/** Pure prepared-library registration, not permission to save/approve/publish. */
export function sscChemistryChapter10Batches():PreparedBatch[]{
 const names=["mcq-1", "mcq-2", "mcq-3", "mcq-4", "mcq-5", "mcq-6", "mcq-7", "cq-1", "cq-2", "sq-1"];
 return [mcq1,mcq2,mcq3,mcq4,mcq5,mcq6,mcq7,cq1,cq2,sq].map((input,index)=>{
  const {batch,records}=parseQuestionUpload(JSON.stringify(input),{category:input.category,subject:input.subject,group:"",topic:input.topic});
  const authoring=review.ledger.filter(x=>x.file===`${names[index]}.json`);
  if(authoring.length!==records.length||authoring.some((m,i)=>m.itemIndex!==i+1))throw Error("Chapter10 authoring ledger mismatch");
  return {
   id:`ssc-chemistry-ch10-${names[index]}-v1`,category:batch.category,subject:batch.subject,topic:batch.topic,lang:batch.lang,
   title:`অধ্যায় ১০ — ${records.length} ${index<7?"MCQ":index<9?"CQ":"SQ"} (${names[index]}) — সাধারণ বোর্ড-ধাঁচের খসড়া`,
   limitations:"১০০০টি খসড়া: পাঠ্যবই১৩টি, সাট৪টি, নিজস্ব৯৮৩টি; সব সমাধান নিজস্ব। পরিচিত আকরিক/ধাতু/সংকর/বিক্রিয়া বিভিন্ন কাজে ফিরেছে;২০ধাতু-লবণ,২০সংকর-ব্যাচ,২০আকরিক-ইনভেন্টরি,২৫বিক্রিয়ার ভর-ডেটাসেট এবং৪০প্রসঙ্গকার্ডে ভ্যারিয়েন্ট আছে। কিছু মৌলিক গণনাও রয়েছে;১০০০টি স্বতন্ত্র ঐতিহাসিক বোর্ড প্রশ্ন নয়। সাটের বোর্ড পরিচয় মূল বোর্ডপত্রে যাচাই বাকি। উৎসের মূলচিত্র ও মুদ্রিত তথ্য রাখা হয়েছে, ত্রুটি/সীমা আলাদা নথিভুক্ত। ক্যারেট কঠিনতার নিশ্চয়তা নয়। শিল্পধাপ তাত্ত্বিক, ঘরোয়া নির্দেশ নয়। CQ১/২/৩/৪অনুশীলন, অফিসিয়াল মানবণ্টনের দাবি নয়। শিক্ষক যাচাই বাকি।",
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
