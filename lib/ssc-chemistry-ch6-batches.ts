import {parseQuestionUpload} from "./question-json-import";
import type {PreparedBatch} from "./prepared-question-batches";
import mcq1 from "@/content/question-bank/ssc/chemistry/chapter-6/mcq-1.json";
import mcq2 from "@/content/question-bank/ssc/chemistry/chapter-6/mcq-2.json";
import mcq3 from "@/content/question-bank/ssc/chemistry/chapter-6/mcq-3.json";
import mcq4 from "@/content/question-bank/ssc/chemistry/chapter-6/mcq-4.json";
import mcq5 from "@/content/question-bank/ssc/chemistry/chapter-6/mcq-5.json";
import cq1 from "@/content/question-bank/ssc/chemistry/chapter-6/cq-1.json";
import cq2 from "@/content/question-bank/ssc/chemistry/chapter-6/cq-2.json";
import sq from "@/content/question-bank/ssc/chemistry/chapter-6/sq.json";
import review from "@/content/question-bank/ssc/chemistry/chapter-6/validation.json";

/** Local mixed-origin drafts only. Registration never authorizes a DB write or approval. */
export function sscChemistryChapter6Batches(): PreparedBatch[] {
  const names=["mcq-1","mcq-2","mcq-3","mcq-4","mcq-5","cq-1","cq-2","sq"];
  return [mcq1,mcq2,mcq3,mcq4,mcq5,cq1,cq2,sq].map((input,index)=>{
    const {batch,records}=parseQuestionUpload(JSON.stringify(input),{
      category:input.category,subject:input.subject,group:"",topic:input.topic,
    });
    const authoring=review.items.filter(x=>x.file===`${names[index]}.json`);
    if(authoring.length!==records.length)throw Error("Chapter6 authoring ledger mismatch");
    return {
      id:`ssc-chemistry-ch6-${names[index]}-v1`,category:batch.category,subject:batch.subject,
      topic:batch.topic,lang:batch.lang,title:`অধ্যায় ৬ — ১০০ ${index<5?"MCQ":index<7?"CQ":"SQ"} (${names[index]}) — মিশ্র উৎসের খসড়া`,
      limitations:"৮০০ প্রশ্নের মধ্যে পাঠ্যবইয়ের১১টি, ওয়েবের১৫টি এবং অনুমতিপ্রাপ্ত নিজস্ব বোর্ড-ধাঁচের৭৭৪টি; সবগুলো আসল বোর্ড প্রশ্ন নয়। সব ব্যাখ্যা/সমাধান নিজস্ব, উৎসের উত্তর বলে দাবি নয়। প্রতিটি রেকর্ডের উৎসের ধরন ও ভ্যারিয়েন্ট পরিবার সংরক্ষিত। ইন্টারনেট/Drive-এর সব প্রশ্ন যাচাই শেষ হয়েছে এমন দাবি নয়;৪৯বোর্ডপ্রার্থী গণনায় নেই। STP0°C,1atm; আদর্শ গ্যাস22.4L/mol। CQ১–২–৩–৪/SQ২ অনুশীলনের কাঠামো, অফিসিয়াল পরীক্ষাবর্ষের মানবণ্টন নয়। শিক্ষক যাচাই/অনুমোদন/প্রকাশ বাকি।",
      // Options can reach student views: never place calculation inputs, expected answers,
      // source answer keys or the private audit ledger in this public metadata slot.
      records:records.map((q,i)=>({kind:batch.items[i].type,text:q.text,options:{...q.options,_authoring:{
        origin:authoring[i].origin,family:authoring[i].family,
        answerOrigin:authoring[i].answerOrigin,sourceQuestionVerbatim:authoring[i].sourceQuestionVerbatim,
        reference:batch.items[i].page,
      }},correct:q.correct,explanation:q.explanation,difficulty:q.difficulty})),
      provenance:{book:batch.book,edition:batch.edition,sourceUrl:batch.sourceUrl,
        sourceUrlMeaning:"Primary textbook reference, NOT the origin of all mixed-batch questions; exact per-question source/origin retained separately",
        references:batch.items.map(q=>q.page),authoring,originCounts:review.originCounts,
        originalPractice:false,mixedOrigin:true,teacherCertified:false,fullChapterRead:false,
        wholeBookRead:false,officialYearVerified:false,chemistryExamBlueprintVerified:false,
        allAnswersAssistantAuthored:true,webResearchExhaustive:false},
    };
  });
}
