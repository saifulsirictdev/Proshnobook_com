"use server";
import {Prisma} from "@prisma/client";
import {staff} from "@/lib/guard";
import {db} from "@/lib/db";
import {normalizeStem} from "@/lib/mcq-import";
import {getPreparedBatch,preparedQuestionId} from "@/lib/prepared-question-batches";
import {revalidatePath} from "next/cache";
export type PreparedState={id?:string;digest?:string;error?:string;message?:string;counts?:{inserted:number;pending:number;approved:number;protected?:number};preview?:{kind:string;text:string;options:unknown;correct:string;explanation:string}[]};
export async function previewPrepared(_:PreparedState,fd:FormData):Promise<PreparedState>{
 try{await staff();const {batch,digest}=getPreparedBatch(String(fd.get("id")??""));return{id:batch.id,digest,preview:batch.records.map(({kind,text,options,correct,explanation})=>({kind,text,options,correct,explanation}))};}
 catch{return{error:"প্রস্তুত ব্যাচ পাওয়া যায়নি অথবা ADMIN অনুমতি নেই।"};}
}
export async function savePrepared(_:PreparedState,fd:FormData):Promise<PreparedState>{
 try{
  const actor=await staff();const {batch:b,digest}=getPreparedBatch(String(fd.get("id")??""));
  if(!actor.id||fd.get("digest")!==digest||fd.get("reviewed")!=="yes")throw Error("Review required");
  let counts:{inserted:number;pending:number;approved:number;protected?:number}={inserted:0,pending:0,approved:0};
  for(let attempt=0;attempt<3;attempt++){
   try{counts=await db.$transaction(async tx=>{
    const key=`preparedimport:v1:${digest}`;
    // A historical receipt is NOT proof that its questions still exist.
    const receipt=await tx.setting.findUnique({where:{key}});
    // Include canonical IDs even after an admin moves/rewrites a question.
    // Never recreate or overwrite that question from repository content.
    const existing: {id?:string;text:string;approved:boolean;source?:string}[]=await tx.question.findMany({where:{OR:[{category:b.category,subject:b.subject,topic:b.topic},{id:{in:b.records.map(q=>preparedQuestionId(b,q))}}]},select:{id:true,text:true,approved:true,source:true}});
    const byId=new Map(existing.filter(q=>q.id).map(q=>[q.id,q]));
    const protectedStems=new Set(existing.filter(q=>q.source?.startsWith("ADMIN_TRASH:v1:")).map(q=>normalizeStem(q.text)));
    const stems=new Map<string,boolean>();
    for(const q of existing){const stem=normalizeStem(q.text);stems.set(stem,(stems.get(stem)??true)&&q.approved===true);}
    const ids:string[]=[];const result:{inserted:number;pending:number;approved:number;protected?:number}={inserted:0,pending:0,approved:0};
    for(const q of b.records){
     const stem=normalizeStem(q.text);
     const canonical=byId.get(preparedQuestionId(b,q));
     if(canonical?.source?.startsWith("ADMIN_TRASH:v1:")||protectedStems.has(stem)){result.protected=(result.protected??0)+1;continue;}
     if(canonical){if(canonical.approved)result.approved++;else result.pending++;continue;}
     if(stems.has(stem)){if(stems.get(stem))result.approved++;else result.pending++;continue;}
     const id=preparedQuestionId(b,q);
     await tx.question.create({data:{id,category:b.category,subject:b.subject,topic:b.topic,lang:b.lang,text:q.text,options:q.options as Prisma.InputJsonValue,correct:q.correct,explanation:q.explanation,difficulty:q.difficulty,approved:false,source:`PREPARED_DRAFT:${digest}`}});
     ids.push(id);stems.set(stem,false);result.inserted++;
    }
    const value=JSON.stringify({actorId:actor.id,createdAt:new Date().toISOString(),batchId:b.id,category:b.category,subject:b.subject,topic:b.topic,provenance:b.provenance,limitations:b.limitations,inserted:result.inserted,skipped:result.pending+result.approved+(result.protected??0),ids,counts:result,reconciled:true});
    if(receipt){
     let original:Record<string,unknown>={};
     try{const parsed=JSON.parse(receipt.value);if(parsed&&typeof parsed==="object"&&!Array.isArray(parsed))original=parsed;}catch{/* retain reconciliation even if old receipt is malformed */}
     await tx.setting.update({where:{key},data:{value:JSON.stringify({...original,lastReconciliation:JSON.parse(value)})}});
    }
    else await tx.setting.create({data:{key,value}});
    return result;
   },{isolationLevel:"Serializable",timeout:20000});break;}
   catch(e){if(attempt===2||!["P2034","P2002"].includes((e as {code?:string}).code??""))throw e;}
  }
  revalidatePath("/admin/questions/import");revalidatePath("/admin/questions");
  return{counts,message:`নতুন Pending: ${counts.inserted}টি; আগে থেকেই Pending: ${counts.pending}টি; আগে থেকেই Approved: ${counts.approved}টি। Trash-এ সুরক্ষিত: ${counts.protected??0}টি। বর্তমান database যাচাই হয়েছে; পুরোনো approval বদলায়নি।`};
 }catch{return{error:"সেভ হয়নি। ব্যাচের প্রিভিউ করে সীমাবদ্ধতা পড়ার সম্মতি দিন।"};}
}
