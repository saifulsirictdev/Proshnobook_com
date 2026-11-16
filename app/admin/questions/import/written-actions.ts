"use server";
import { staff } from "@/lib/guard";
import { db } from "@/lib/db";
import { normalizeStem } from "@/lib/mcq-import";
import { writtenRecords } from "@/lib/written-question-import";
import prepared from "@/deliverables/class6-math-ch1/cq-sq-draft.json";
import chapterReview from "@/deliverables/class6-math-ch1/chapter-alignment-review.json";
import { revalidatePath } from "next/cache";
export type WrittenState={error?:string;digest?:string;preview?:{kind:string;text:string;explanation:string;options:unknown}[];message?:string};
export async function previewWritten():Promise<WrittenState>{
 try{await staff();const b=writtenRecords(prepared);return {digest:b.digest,preview:b.records.map(({kind,text,explanation,options})=>({kind,text,explanation,options}))};}
 catch{return {error:"ADMIN অনুমতি ও CQ/SQ ব্যাচ যাচাই করুন।"};}
}
export async function saveWritten(_:WrittenState,fd:FormData):Promise<WrittenState>{
 try{
  const actor=await staff();const {batch,records,digest}=writtenRecords(prepared);
  if(!actor.id||fd.get("reviewed")!=="yes"||fd.get("digest")!==digest)throw Error("Preview required");
  let count=0;
  for(let attempt=0;attempt<3;attempt++){
   try{
    count=await db.$transaction(async tx=>{
     const key=`writtenimport:v1:${digest}`;
     if(await tx.setting.findUnique({where:{key}}))return 0;
     const existing=await tx.question.findMany({where:{category:batch.class,subject:batch.subject,topic:batch.topic},select:{text:true}});
     const stems=new Set(existing.map(q=>normalizeStem(q.text)));const ids:string[]=[];
     for(const q of records){
      if(stems.has(normalizeStem(q.text)))continue;
      await tx.question.create({data:{id:q.id,category:batch.class,subject:batch.subject,topic:batch.topic,difficulty:"MEDIUM",lang:"Bangla",text:q.text,options:q.options,correct:"",explanation:q.explanation,approved:false,source:`CURATED_WRITTEN_DRAFT:${digest}`}});
      ids.push(q.id);
     }
     await tx.setting.create({data:{key,value:JSON.stringify({actorId:actor.id,createdAt:new Date().toISOString(),digest,source:batch.source,chapterReview,limitations:batch.limitations,ids,references:records.map(q=>({id:q.id,page:q.referencePrintedPage})),inserted:ids.length,skipped:records.length-ids.length})}});
     return ids.length;
    },{isolationLevel:"Serializable",timeout:20000});break;
   }catch(e){if(attempt===2||!["P2034","P2002"].includes((e as {code?:string}).code??""))throw e;}
  }
  revalidatePath("/admin/questions");revalidatePath("/admin/questions/import");
  return {message:`${count}টি CQ/SQ Pending হিসেবে সংরক্ষিত। প্রকাশ হয়নি; বিদ্যমান প্রশ্ন পুনরায় যোগ হয়নি।`};
 }catch{return {error:"সেভ হয়নি। ADMIN হিসেবে প্রিভিউ করে সীমাবদ্ধতা পড়ার সম্মতি দিন।"};}
}
