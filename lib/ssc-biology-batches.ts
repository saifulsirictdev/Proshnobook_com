import { parseQuestionUpload } from "./question-json-import";
import type { PreparedBatch } from "./prepared-question-batches";
import input0 from "@/content/question-bank/ssc/biology/chapter-1/mcq.json";
import input1 from "@/content/question-bank/ssc/biology/chapter-1/cq.json";
import input2 from "@/content/question-bank/ssc/biology/chapter-1/sq.json";
import input3 from "@/content/question-bank/ssc/biology/chapter-1/chapter-work-mcq.json";
import input4 from "@/content/question-bank/ssc/biology/chapter-1/chapter-work-cq.json";
import input5 from "@/content/question-bank/ssc/biology/chapter-1/chapter-work-sq.json";
import input6 from "@/content/question-bank/ssc/biology/chapter-2/rebuild-mcq.json";
import input7 from "@/content/question-bank/ssc/biology/chapter-2/rebuild-sq.json";
import input8 from "@/content/question-bank/ssc/biology/chapter-2/rebuild-cq.json";
import input9 from "@/content/question-bank/ssc/biology/chapter-3/rebuild-mcq.json";
import input10 from "@/content/question-bank/ssc/biology/chapter-3/rebuild-sq.json";
import input11 from "@/content/question-bank/ssc/biology/chapter-3/rebuild-cq.json";
import input12 from "@/content/question-bank/ssc/biology/chapter-4/rebuild-mcq.json";
import input13 from "@/content/question-bank/ssc/biology/chapter-4/rebuild-sq.json";
import input14 from "@/content/question-bank/ssc/biology/chapter-4/rebuild-cq.json";
import input15 from "@/content/question-bank/ssc/biology/chapter-5/rebuild-mcq.json";
import input16 from "@/content/question-bank/ssc/biology/chapter-5/rebuild-sq.json";
import input17 from "@/content/question-bank/ssc/biology/chapter-5/rebuild-cq.json";
import input18 from "@/content/question-bank/ssc/biology/chapter-6/rebuild-mcq.json";
import input19 from "@/content/question-bank/ssc/biology/chapter-6/rebuild-cq.json";
import input20 from "@/content/question-bank/ssc/biology/chapter-6/rebuild-sq.json";
import input21 from "@/content/question-bank/ssc/biology/chapter-7/rebuild-mcq.json";
import input22 from "@/content/question-bank/ssc/biology/chapter-7/rebuild-cq.json";
import input23 from "@/content/question-bank/ssc/biology/chapter-7/rebuild-sq.json";
import input24 from "@/content/question-bank/ssc/biology/chapter-8/rebuild-mcq.json";
import input25 from "@/content/question-bank/ssc/biology/chapter-8/rebuild-cq.json";
import input26 from "@/content/question-bank/ssc/biology/chapter-8/rebuild-sq.json";
import input27 from "@/content/question-bank/ssc/biology/chapter-9/rebuild-mcq.json";
import input28 from "@/content/question-bank/ssc/biology/chapter-9/rebuild-cq.json";
import input29 from "@/content/question-bank/ssc/biology/chapter-9/rebuild-sq.json";
import input30 from "@/content/question-bank/ssc/biology/chapter-10/rebuild-mcq.json";
import input31 from "@/content/question-bank/ssc/biology/chapter-10/rebuild-cq.json";
import input32 from "@/content/question-bank/ssc/biology/chapter-10/rebuild-sq.json";
import input33 from "@/content/question-bank/ssc/biology/chapter-11/rebuild-mcq.json";
import input34 from "@/content/question-bank/ssc/biology/chapter-11/rebuild-cq.json";
import input35 from "@/content/question-bank/ssc/biology/chapter-11/rebuild-sq.json";
import input36 from "@/content/question-bank/ssc/biology/chapter-12/rebuild-mcq.json";
import input37 from "@/content/question-bank/ssc/biology/chapter-12/rebuild-cq.json";
import input38 from "@/content/question-bank/ssc/biology/chapter-12/rebuild-sq.json";
import input39 from "@/content/question-bank/ssc/biology/chapter-13/rebuild-mcq.json";
import input40 from "@/content/question-bank/ssc/biology/chapter-13/rebuild-cq.json";
import input41 from "@/content/question-bank/ssc/biology/chapter-13/rebuild-sq.json";
import input42 from "@/content/question-bank/ssc/biology/chapter-14/rebuild-mcq.json";
import input43 from "@/content/question-bank/ssc/biology/chapter-14/rebuild-cq.json";
import input44 from "@/content/question-bank/ssc/biology/chapter-14/rebuild-sq.json";
const sources = [
  {chapter:1, key:"mcq", input:input0},
  {chapter:1, key:"cq", input:input1},
  {chapter:1, key:"sq", input:input2},
  {chapter:1, key:"chapter-work-mcq", input:input3},
  {chapter:1, key:"chapter-work-cq", input:input4},
  {chapter:1, key:"chapter-work-sq", input:input5},
  {chapter:2, key:"rebuild-mcq", input:input6},
  {chapter:2, key:"rebuild-sq", input:input7},
  {chapter:2, key:"rebuild-cq", input:input8},
  {chapter:3, key:"rebuild-mcq", input:input9},
  {chapter:3, key:"rebuild-sq", input:input10},
  {chapter:3, key:"rebuild-cq", input:input11},
  {chapter:4, key:"rebuild-mcq", input:input12},
  {chapter:4, key:"rebuild-sq", input:input13},
  {chapter:4, key:"rebuild-cq", input:input14},
  {chapter:5, key:"rebuild-mcq", input:input15},
  {chapter:5, key:"rebuild-sq", input:input16},
  {chapter:5, key:"rebuild-cq", input:input17},
  {chapter:6, key:"rebuild-mcq", input:input18},
  {chapter:6, key:"rebuild-cq", input:input19},
  {chapter:6, key:"rebuild-sq", input:input20},
  {chapter:7, key:"rebuild-mcq", input:input21},
  {chapter:7, key:"rebuild-cq", input:input22},
  {chapter:7, key:"rebuild-sq", input:input23},
  {chapter:8, key:"rebuild-mcq", input:input24},
  {chapter:8, key:"rebuild-cq", input:input25},
  {chapter:8, key:"rebuild-sq", input:input26},
  {chapter:9, key:"rebuild-mcq", input:input27},
  {chapter:9, key:"rebuild-cq", input:input28},
  {chapter:9, key:"rebuild-sq", input:input29},
  {chapter:10, key:"rebuild-mcq", input:input30},
  {chapter:10, key:"rebuild-cq", input:input31},
  {chapter:10, key:"rebuild-sq", input:input32},
  {chapter:11, key:"rebuild-mcq", input:input33},
  {chapter:11, key:"rebuild-cq", input:input34},
  {chapter:11, key:"rebuild-sq", input:input35},
  {chapter:12, key:"rebuild-mcq", input:input36},
  {chapter:12, key:"rebuild-cq", input:input37},
  {chapter:12, key:"rebuild-sq", input:input38},
  {chapter:13, key:"rebuild-mcq", input:input39},
  {chapter:13, key:"rebuild-cq", input:input40},
  {chapter:13, key:"rebuild-sq", input:input41},
  {chapter:14, key:"rebuild-mcq", input:input42},
  {chapter:14, key:"rebuild-cq", input:input43},
  {chapter:14, key:"rebuild-sq", input:input44},
];
/** Owner-authorized originals; independent teacher/content certification remains open. */
export function sscBiologyBatches(): PreparedBatch[] {
 return sources.map(({chapter,key,input})=>{
  // Canonical draft files stay immutable. Only the registry maps local figure refs
  // to deployed, chapter-scoped URLs on their own line for the bounded renderer.
  const mapped={...input,items:input.items.map(q=>({...q,text:q.text.replace(/!\[([^\]\n]+)\]\(assets\/([a-z-]+\.svg)\)/g,(_all,alt:string,name:string)=>`\n![${alt}](https://proshnobook.com/question-bank/ssc-biology-ch${chapter}-v1/${name})\n`)}))};
  const {batch,records}=parseQuestionUpload(JSON.stringify(mapped),{category:input.category,subject:input.subject,group:"",topic:input.topic});
  return {
   id:`ssc-biology-ch${chapter}-${key}-v1`,category:batch.category,subject:batch.subject,topic:batch.topic,lang:batch.lang,
   title:`জীববিজ্ঞান অধ্যায় ${chapter} — ${key} — ${records.length} উত্তরসহ নিজস্ব অনুশীলনী`,
   limitations:"নিজস্ব অনুশীলনী; বোর্ড/স্কুল/সাল বা মূল বইয়ের পৃষ্ঠা দাবি নয়। শিক্ষক ও স্বাধীন বিষয়বস্তু/semantic পুনরাবৃত্তি যাচাই বাকি; সম্প্রসারিত ধারণা আছে। সংখ্যাগত লক্ষ্য বিষয়বস্তু স্বীকৃতি নয়।",
   records:records.map((q,i)=>({kind:batch.items[i].type,text:q.text,options:q.options,correct:q.correct,explanation:q.explanation,difficulty:q.difficulty})),
   provenance:{book:batch.book,edition:batch.edition,sourceUrl:batch.sourceUrl,sourceUrlMeaning:"Secondary background, not copied exercise or verified official edition",references:batch.items.map(q=>q.page),originalPractice:true,teacherCertified:false,independentContentReview:false,nearDuplicateReviewComplete:false,fullChapterRead:false,officialYearVerified:false,assetsDeployed:false,sourceFigureCoverageComplete:false,diagramManifest:"docs/question-bank/ssc-biology/production-assets.json"},
  };
 });
}
