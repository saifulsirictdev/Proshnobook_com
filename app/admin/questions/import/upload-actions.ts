"use server";
import {Prisma} from "@prisma/client";
import {staff} from "@/lib/guard";
import {db} from "@/lib/db";
import {parseQuestionUpload} from "@/lib/question-json-import";
import {normalizeStem} from "@/lib/mcq-import";
import {revalidatePath} from "next/cache";
export type UploadState={error?:string;message?:string;digest?:string;preview?:{text:string;options:unknown;correct:string;explanation:string}[]};
function parse(fd:FormData){return parseQuestionUpload(String(fd.get("raw")??""),{category:String(fd.get("category")??""),subject:String(fd.get("subject")??""),group:String(fd.get("group")??""),topic:String(fd.get("topic")??"")});}
export async function previewUpload(_:UploadState,fd:FormData):Promise<UploadState>{
 try{await staff();const b=parse(fd);return{digest:b.digest,preview:b.records.map(({text,options,correct,explanation})=>({text,options,correct,explanation}))};}
 catch(e){return{error:e instanceof Error&& !e.message.includes('"code"')?e.message:"JSON গঠন ও ADMIN অনুমতি যাচাই করুন।"};}
}
export async function saveUpload(_:UploadState,fd:FormData):Promise<UploadState>{
 try{
  const actor=await staff();const {batch:b,selection,digest,records}=parse(fd);
  if(!actor.id||fd.get("digest")!==digest||fd.get("reviewed")!=="yes")throw Error("প্রিভিউ ও সীমাবদ্ধতা পড়ার সম্মতি প্রয়োজন।");
  let inserted=0;
  for(let attempt=0;attempt<3;attempt++){
   try{inserted=await db.$transaction(async tx=>{
    const key=`jsonupload:v1:${digest}`;if(await tx.setting.findUnique({where:{key}}))return 0;
    const existing=await tx.question.findMany({where:{category:b.category,subject:b.subject,topic:b.topic},select:{text:true}});
    const stems=new Set(existing.map(q=>normalizeStem(q.text)));const ids:string[]=[];
    for(const q of records){if(stems.has(normalizeStem(q.text)))continue;
     await tx.question.create({data:{...q,category:b.category,subject:b.subject,topic:b.topic,lang:b.lang,options:q.options as Prisma.InputJsonValue,approved:false,source:`JSON_UPLOAD_DRAFT:${digest}`}});ids.push(q.id);
    }
    await tx.setting.create({data:{key,value:JSON.stringify({actorId:actor.id,createdAt:new Date().toISOString(),selection,book:b.book,edition:b.edition,sourceUrl:b.sourceUrl,ids,references:b.items.map((q,i)=>({id:records[i].id,page:q.page})),inserted:ids.length,skipped:records.length-ids.length})}});return ids.length;
   },{isolationLevel:"Serializable",timeout:20000});break;}catch(e){if(attempt===2||!["P2034","P2002"].includes((e as {code?:string}).code??""))throw e;}
  }
  revalidatePath("/admin/questions/import");revalidatePath("/admin/questions");return{message:`${inserted}টি Pending প্রশ্ন সেভ হয়েছে; ${records.length-inserted}টি বিদ্যমান প্রশ্ন বাদ। প্রকাশ হয়নি।`};
 }catch{return{error:"সেভ হয়নি। নির্বাচন, JSON ও প্রিভিউ যাচাই করে আবার চেষ্টা করুন।"};}
}
