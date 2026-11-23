import {parseQuestionUpload} from "./question-json-import";
import type {PreparedBatch} from "./prepared-question-batches";
import mcq1 from "@/content/question-bank/ssc/chemistry/chapter-7/mcq-1.json";
import mcq2 from "@/content/question-bank/ssc/chemistry/chapter-7/mcq-2.json";
import mcq3 from "@/content/question-bank/ssc/chemistry/chapter-7/mcq-3.json";
import mcq4 from "@/content/question-bank/ssc/chemistry/chapter-7/mcq-4.json";
import mcq5 from "@/content/question-bank/ssc/chemistry/chapter-7/mcq-5.json";
import cq1 from "@/content/question-bank/ssc/chemistry/chapter-7/cq-1.json";
import cq2 from "@/content/question-bank/ssc/chemistry/chapter-7/cq-2.json";
import sq from "@/content/question-bank/ssc/chemistry/chapter-7/sq-1.json";
import review from "@/content/question-bank/ssc/chemistry/chapter-7/validation.json";

/** Pure prepared-library registration, not permission to save/approve/publish. */
export function sscChemistryChapter7Batches():PreparedBatch[]{
 const names=["mcq-1","mcq-2","mcq-3","mcq-4","mcq-5","cq-1","cq-2","sq-1"];
 return [mcq1,mcq2,mcq3,mcq4,mcq5,cq1,cq2,sq].map((input,index)=>{
  const {batch,records}=parseQuestionUpload(JSON.stringify(input),{category:input.category,subject:input.subject,group:"",topic:input.topic});
  const authoring=review.ledger.filter(x=>x.file===`${names[index]}.json`);
  if(authoring.length!==records.length||authoring.some((m,i)=>m.itemIndex!==i+1))throw Error("Chapter7 authoring ledger mismatch");
  return {
   id:`ssc-chemistry-ch7-${names[index]}-v1`,category:batch.category,subject:batch.subject,topic:batch.topic,lang:batch.lang,
   title:`অধ্যায় ৭ — ${records.length} ${index<5?"MCQ":index<7?"CQ":"SQ"} (${names[index]}) — সাধারণ বোর্ড-ধাঁচের খসড়া`,
   limitations:"৭৫০টি খসড়া: পাঠ্যবইয়ের৯টি, সাট একাডেমির৩টি ও নিজস্ব৭৩৮টি; সব সমাধান নিজস্ব। একই বিক্রিয়ায় ভিন্ন কাজ এবং হার/তাপের সংখ্যাগত ভ্যারিয়েন্ট আছে;৭৫০টি স্বতন্ত্র আসল বোর্ড প্রশ্ন নয়। সাটে প্রদর্শিত বোর্ড পরিচয় মূল বোর্ডপত্রে যাচাই বাকি, তাই কল্পিত PDF লোকেটর নেই। অস্পষ্ট সমীকরণ, পুনরাবৃত্ত উৎস ও অন্য অধ্যায়ের প্রশ্ন গণনায় নেই। অনুশীলনের CQ১/২/৩/৪ অফিসিয়াল রসায়ন মানবণ্টনের দাবি নয়। স্বাধীন শিক্ষক যাচাই ও অনুমোদন বাকি।",
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
