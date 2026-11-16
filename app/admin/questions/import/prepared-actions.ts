"use server";
import {Prisma} from "@prisma/client";
import {staff} from "@/lib/guard";
import {db} from "@/lib/db";
import {normalizeStem} from "@/lib/mcq-import";
import {getPreparedBatch,preparedQuestionId} from "@/lib/prepared-question-batches";
import {revalidatePath} from "next/cache";
export type PreparedState={id?:string;digest?:string;error?:string;message?:string;preview?:{kind:string;text:string;options:unknown;correct:string;explanation:string}[]};
export async function previewPrepared(_:PreparedState,fd:FormData):Promise<PreparedState>{
 try{await staff();const {batch,digest}=getPreparedBatch(String(fd.get("id")??""));return{id:batch.id,digest,preview:batch.records.map(({kind,text,options,correct,explanation})=>({kind,text,options,correct,explanation}))};}
 catch{return{error:"প্রস্তুত ব্যাচ পাওয়া যায়নি অথবা ADMIN অনুমতি নেই।"};}
}
export async function savePrepared(_:PreparedState,fd:FormData):Promise<PreparedState>{
 try{
  const actor=await staff();const {batch:b,digest}=getPreparedBatch(String(fd.get("id")??""));
  if(!actor.id||fd.get("digest")!==digest||fd.get("reviewed")!=="yes")throw Error("Review required");
  let inserted=0;
  for(let attempt=0;attempt<3;attempt++){
   try{inserted=await db.$transaction(async tx=>{
    const key=`preparedimport:v1:${digest}`;
    if(await tx.setting.findUnique({where:{key}}))return 0;
    const existing=await tx.question.findMany({where:{category:b.category,subject:b.subject,topic:b.topic},select:{text:true}});
    const stems=new Set(existing.map(q=>normalizeStem(q.text)));const ids:string[]=[];
    for(const q of b.records){
     if(stems.has(normalizeStem(q.text)))continue;
     const id=preparedQuestionId(b,q);
     await tx.question.create({data:{id,category:b.category,subject:b.subject,topic:b.topic,lang:b.lang,text:q.text,options:q.options as Prisma.InputJsonValue,correct:q.correct,explanation:q.explanation,difficulty:q.difficulty,approved:false,source:`PREPARED_DRAFT:${digest}`}});ids.push(id);
    }
    await tx.setting.create({data:{key,value:JSON.stringify({actorId:actor.id,createdAt:new Date().toISOString(),batchId:b.id,category:b.category,subject:b.subject,topic:b.topic,provenance:b.provenance,limitations:b.limitations,inserted:ids.length,skipped:b.records.length-ids.length,ids})}});return ids.length;
   },{isolationLevel:"Serializable",timeout:20000});break;}
   catch(e){if(attempt===2||!["P2034","P2002"].includes((e as {code?:string}).code??""))throw e;}
  }
  revalidatePath("/admin/questions/import");revalidatePath("/admin/questions");
  return{message:`${inserted}টি Pending হিসেবে সেভ হয়েছে; ${b.records.length-inserted}টি বিদ্যমান প্রশ্ন বাদ। প্রকাশ হয়নি।`};
 }catch{return{error:"সেভ হয়নি। ব্যাচের প্রিভিউ করে সীমাবদ্ধতা পড়ার সম্মতি দিন।"};}
}
