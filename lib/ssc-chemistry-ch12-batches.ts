import {parseQuestionUpload} from "./question-json-import";
import type {PreparedBatch} from "./prepared-question-batches";
import data0 from "@/content/question-bank/ssc/chemistry/chapter-12/mcq-1.json";
import data1 from "@/content/question-bank/ssc/chemistry/chapter-12/mcq-2.json";
import data2 from "@/content/question-bank/ssc/chemistry/chapter-12/mcq-3.json";
import data3 from "@/content/question-bank/ssc/chemistry/chapter-12/mcq-4.json";
import data4 from "@/content/question-bank/ssc/chemistry/chapter-12/cq-1.json";
import data5 from "@/content/question-bank/ssc/chemistry/chapter-12/sq-1.json";
import review from "@/content/question-bank/ssc/chemistry/chapter-12/validation.json";

/** Pure local draft registration; never writes/approves/publishes questions. */
export function sscChemistryChapter12Batches():PreparedBatch[]{
 const names=["mcq-1", "mcq-2", "mcq-3", "mcq-4", "cq-1", "sq-1"];
 return [data0,data1,data2,data3,data4,data5].map((input,index)=>{
  const {batch,records}=parseQuestionUpload(JSON.stringify(input),{category:input.category,subject:input.subject,group:"",topic:input.topic});
  const authoring=review.ledger.filter(x=>x.file===`${names[index]}.json`);
  if(authoring.length!==records.length||authoring.some((m,i)=>m.itemIndex!==i+1))throw Error("Chapter12 authoring ledger mismatch");
  return {
   id:`ssc-chemistry-ch12-${names[index]}-v1`,category:batch.category,subject:batch.subject,topic:batch.topic,lang:batch.lang,
   title:`অধ্যায় 12 — ${records.length} ${names[index].startsWith("mcq")?"MCQ":names[index].startsWith("cq")?"CQ":"SQ"} (${names[index]}) — সাধারণ বোর্ড-ধাঁচের খসড়া`,
   limitations:`${review.total}টি খসড়া: উৎস৯টি,নিজস্ব${review.authoredCount}টি;সব সমাধান নিজস্ব। ${review.variantNote} সাটের বোর্ড পরিচয় মূল বোর্ডপত্রে যাচাই বাকি। শিক্ষক যাচাই বাকি;CQ১/২/৩/৪অনুশীলনের প্রচলন,অফিসিয়াল মানবণ্টন নয়।`,
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
