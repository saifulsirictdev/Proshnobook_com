import {Prisma} from "@prisma/client";
import {db} from "@/lib/db";
import {authorizePendingImport,assertGrantedBatch} from "@/lib/pending-import-grant";
import {getPreparedBatch,preparedQuestionId} from "@/lib/prepared-question-batches";
import {normalizeStem} from "@/lib/mcq-import";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"};
const response=(body:unknown,status=200)=>Response.json(body,{status,headers});
// No GET, cookie login, arbitrary question payload, approval or publication operation.
export async function POST(req:Request){
 let grant;
 try{grant=authorizePendingImport(req.headers.get("authorization"),process.env.PENDING_IMPORT_GRANT);}
 catch{return response({error:"Unauthorized"},401);}
 try{
  if(!req.headers.get("content-type")?.startsWith("application/json"))return response({error:"JSON required"},415);
  // Read bounded bytes even when Content-Length is omitted or dishonest.
  const reader=req.body?.getReader();if(!reader)return response({error:"Body required"},400);
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>4096){await reader.cancel();return response({error:"Body too large"},413);}chunks.push(value);}
  const body=JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if(!body||Array.isArray(body)||Object.keys(body).some(k=>!["action","id","digest","acknowledgeLimitations"].includes(k))||typeof body.id!=="string"||body.id.length>100||typeof body.digest!=="string"||!/^[a-f0-9]{64}$/.test(body.digest)||!["preview","save"].includes(body.action))return response({error:"Invalid request"},400);
  // Scope check before touching the registry or database.
  try{assertGrantedBatch(grant,body.id,body.digest);}catch{return response({error:"Batch not granted"},403);}
  const {batch:b,digest}=getPreparedBatch(body.id);
  if(digest!==body.digest)return response({error:"Batch changed; renew grant"},409);
  if(body.action==="preview")return response({id:b.id,digest,limitations:b.limitations,records:b.records,expiresAt:grant.expiresAt});
  if(body.acknowledgeLimitations!==true)return response({error:"Limitations acknowledgement required"},400);
  for(let attempt=0;attempt<3;attempt++){
   try{
    const result=await db.$transaction(async tx=>{
     // Recheck expiry just before writing. Immutable old deployments retain their
     // environment until expiry; rotating the current deployment is not global revocation.
     const current=authorizePendingImport(req.headers.get("authorization"),process.env.PENDING_IMPORT_GRANT);
     assertGrantedBatch(current,b.id,digest);
     const key=`preparedimport:v1:${digest}`;
     if(await tx.setting.findUnique({where:{key}}))return {inserted:0,skipped:b.records.length,alreadyImported:true};
     const existing=await tx.question.findMany({where:{category:b.category,subject:b.subject,topic:b.topic},select:{text:true}});
     const stems=new Set(existing.map(q=>normalizeStem(q.text)));const ids:string[]=[];
     for(const q of b.records){
      const stem=normalizeStem(q.text);if(stems.has(stem))continue;
      const id=preparedQuestionId(b,q);
      await tx.question.create({data:{id,category:b.category,subject:b.subject,topic:b.topic,lang:b.lang,text:q.text,options:q.options as Prisma.InputJsonValue,correct:q.correct,explanation:q.explanation,difficulty:q.difficulty,approved:false,source:`PREPARED_DRAFT:${digest}`}});
      ids.push(id);stems.add(stem);
     }
     await tx.setting.create({data:{key,value:JSON.stringify({actorId:`pending-import-grant:${current.id}`,authorization:"OWNER_SCOPED_PENDING_ONLY",grantExpiresAt:current.expiresAt,createdAt:new Date().toISOString(),batchId:b.id,category:b.category,subject:b.subject,topic:b.topic,provenance:b.provenance,limitations:b.limitations,inserted:ids.length,skipped:b.records.length-ids.length,ids})}});
     return {inserted:ids.length,skipped:b.records.length-ids.length,alreadyImported:false};
    },{isolationLevel:"Serializable",timeout:20000});
    return response({id:b.id,digest,status:"PENDING_NOT_PUBLISHED",...result});
   }catch(e){if(attempt===2||!["P2034","P2002"].includes((e as {code?:string}).code??""))throw e;}
  }
  return response({error:"Import failed"},500);
 }catch{return response({error:"Import failed; no successful result confirmed"},500);}
}
