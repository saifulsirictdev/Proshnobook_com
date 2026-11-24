"use server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { createHash, randomUUID } from "crypto";
import { categoryAliases, pendingSource, visibleQuestions, DAILY_PREPARATION_BATCHES } from "@/lib/paper-generation";
import { resolveSyllabusSelection, planSyllabusModel, syllabusRowKind, autoModelTopics } from "@/lib/auto-model-syllabus";
import { modelReadiness } from "@/lib/auto-model-insights";
import { assembleSubjectAutoModel } from "@/lib/auto-model";
import { requestAutoModelGap } from "@/lib/auto-model-provider";

/** One bounded preparation step. Never purchase, approve or publish generated questions.
 * A complete bank model returns without any AI key, lock or quota reservation. */
export async function prepareAutoModel(raw: unknown) {
  const user=(await auth())?.user;
  if(!user?.id||user.role==="STUDENT")return {ok:false as const,error:"শিক্ষক অ্যাকাউন্টে লগইন করুন।"};
  let p:ReturnType<typeof resolveSyllabusSelection>;
  try{p=resolveSyllabusSelection(raw);}catch(e){return {ok:false as const,error:e instanceof Error?e.message:"নির্বাচিত সিলেবাস ও মানবণ্টন যাচাই করুন।"};}
  // Existing integrations without an explicit topic selection keep their approved-only,
  // database-only contract. Explicit topics may prepare gaps only when the whole
  // approved book also lacks a complete model for this marking scheme.
  if (typeof raw === "object" && raw !== null && p.policy && !Object.hasOwn(raw, "topics"))
    return prepareRegisteredBank(p);
  const {category,subject}=p.request;
  const where={category:{in:categoryAliases(category)},subject,topic:{in:p.topics},...visibleQuestions(user.id)};
  const read=()=>db.question.findMany({where,select:{id:true,text:true,topic:true,options:true,correct:true,explanation:true},orderBy:[{approved:"desc" as const},{id:"asc" as const}],take:10001});
  let lock="",lease="",added=0;
  try{
    const rows=await read();
    if(rows.length>10000)return {ok:false as const,error:"এই প্রশ্নভান্ডারটি বড়; আরও নির্দিষ্ট টপিক নির্বাচন করুন। পূর্ণ যাচাই ছাড়া সফটওয়্যার চালানো হয়নি।"};
    const result=planSyllabusModel(rows,p);
    if(result.ok)return {ok:true as const,ids:result.ids,...("assignments" in result?{assignments:result.assignments}:{})};
    if(!result.missing.length)return {ok:false as const,error:"নির্বাচিত টপিক দিয়ে নির্ধারিত মানবণ্টন পূরণ সম্ভব নয়। বাধ্যতামূলক বিভাগ/অধ্যায়গুলো নির্বাচন করুন।",gaps:result.gaps};
    if(await completeApprovedBook(p))return {ok:false as const,databaseOnly:true as const,error:"এই বই/বিষয়ের পূর্ণ মডেল ডাটাবেজে আছে—সফটওয়্যার বন্ধ। নির্বাচিত টপিকে পর্যাপ্ত উপযুক্ত প্রশ্ন নেই; টপিক বদলান বা ডাটাবেজে প্রশ্ন যোগ করুন।",gaps:result.gaps};
    if(!process.env.DEEPSEEK_API_KEY)return {ok:false as const,error:"ডাটাবেজে পূর্ণ মডেলের উপযুক্ত প্রশ্ন যথেষ্ট নেই এবং সফটওয়্যার সংযোগ কনফিগার করা নেই।",gaps:result.gaps};
    // Account-wide persistent lease prevents duplicate charges across tabs/selections.
    const key=`qbai:model-lock:${createHash("sha256").update(user.id).digest("hex")}`;
    await db.setting.deleteMany({where:{key,value:{lt:String(Date.now()-180000)}}});
    lease=`${Date.now()}:${randomUUID()}`;
    try{await db.setting.create({data:{key,value:lease}});lock=key;}catch(e){
      if((e as {code?:string}).code!=="P2002")throw e;
      return {ok:false as const,error:"আপনার একটি মডেল প্রস্তুতি চলছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।"};
    }
    const checked=await read();
    if(checked.length>10000)return {ok:false as const,error:"প্রশ্নভান্ডারের সীমা ছাড়িয়েছে; টপিক নির্বাচন আরও নির্দিষ্ট করুন।"};
    const next=planSyllabusModel(checked,p);
    if(next.ok)return {ok:true as const,ids:next.ids,...("assignments" in next?{assignments:next.assignments}:{})};
    if(!next.missing.length)return {ok:false as const,error:"নির্বাচিত সিলেবাস দিয়ে পূর্ণ মডেল হচ্ছে না।",gaps:next.gaps};
    // Recheck after acquiring the lease: approved stock may have been imported in another tab.
    if(await completeApprovedBook(p))return {ok:false as const,databaseOnly:true as const,error:"এই বই/বিষয়ের পূর্ণ মডেল এখন ডাটাবেজে আছে—সফটওয়্যার বন্ধ। নির্বাচিত টপিকের ঘাটতি ডাটাবেজ থেকেই পূরণ করুন।",gaps:next.gaps};
    // Same 60-batch/account/day budget as Chapter preparation; DB-only uses none.
    let reserved=false;const day=new Date().toISOString().slice(0,10);
    for(let i=0;i<DAILY_PREPARATION_BATCHES;i++){
      try{await db.setting.create({data:{key:`qbai:quota:${pendingSource(user.id)}:${day}:${i}`,value:lease}});reserved=true;break;}catch(e){if((e as {code?:string}).code!=="P2002")throw e;}
    }
    if(!reserved)return {ok:false as const,error:"আজকের প্রশ্ন প্রস্তুতির সীমা (৬০টি ব্যাচ) শেষ। সংরক্ষিত প্রশ্ন থাকবে; পরে আবার চালাতে পারবেন।"};
    const first=next.missing[0],kind=syllabusRowKind(first,p);
    const slots=next.missing.filter(q=>q.topic===first.topic&&syllabusRowKind(q,p)===kind&&(p.registered||q.id.split(":")[1]===first.id.split(":")[1])).slice(0,6);
    const fresh=await requestAutoModelGap(p,slots,checked,process.env.DEEPSEEK_API_KEY);
    for(const q of fresh){
      await db.question.create({data:{category,subject,topic:q.topic,text:q.text,correct:q.correct,explanation:q.explanation,options:q.options as Prisma.InputJsonValue,lang:/english|ইংরেজি/i.test(subject)?"English":"Bangla",difficulty:"MEDIUM",approved:false,source:pendingSource(user.id)}});added++;
    }
    return {ok:false as const,pending:true as const,added,error:"ডাটাবেজের প্রশ্ন রাখা হয়েছে; ঘাটতির প্রশ্ন প্রস্তুত হচ্ছে।"};
  }catch{
    return {ok:false as const,error:added?`${added}টি প্রশ্ন ব্যক্তিগত খসড়ায় সংরক্ষিত। প্রস্তুতি শেষ হয়নি; আবার চালালে সংরক্ষিত প্রশ্ন আগে নেওয়া হবে।`:"ডাটাবেজ/সফটওয়্যার উত্তর যাচাই বা সংরক্ষণ করা যায়নি। কোনো অসম্পূর্ণ মডেল খোলা হয়নি। আবার চেষ্টা করুন।"};
  }finally{if(lock)await db.setting.deleteMany({where:{key:lock,value:lease}}).catch(()=>{});}
}

/** Explicit, read-only preflight: no provider, lease, quota or draft writes. */
export async function inspectAutoModel(raw: unknown) {
  const user = (await auth())?.user;
  if (!user?.id || user.role === "STUDENT") return {ok: false as const, error: "শিক্ষক অ্যাকাউন্টে লগইন করুন।"};
  try {
    const plan = resolveSyllabusSelection(raw);
    const rows = await db.question.findMany({
      where: {category: {in: categoryAliases(plan.request.category)}, subject: plan.request.subject,
        topic: {in: plan.topics}, ...visibleQuestions(user.id)},
      select: {id: true, text: true, topic: true, options: true, correct: true, explanation: true},
      orderBy: [{approved: "desc" as const}, {id: "asc" as const}], take: 10001,
    });
    if (rows.length > 10000) return {ok: false as const, error: "পূর্ণ স্টক যাচাইয়ের সীমা ছাড়িয়েছে; আরও নির্দিষ্ট টপিক নির্বাচন করুন। সফটওয়্যার চালানো হয়নি।"};
    const report = modelReadiness(rows, plan);
    const databaseOnly = report.complete || await completeApprovedBook(plan);
    return {ok: true as const, report: {...report,databaseOnly,
      stockShortfall: report.aiShortfall,
      aiShortfall: databaseOnly ? 0 : report.aiShortfall,
      quotaBatchUpperBound: databaseOnly ? 0 : report.quotaBatchUpperBound,
      feasible: databaseOnly ? report.complete : report.feasible}};
  } catch {
    return {ok: false as const, error: "সিলেবাস/ডাটাবেজ যাচাই করা যায়নি। সফটওয়্যার চালানো হয়নি; আবার যাচাই করুন।"};
  }
}

/** Legacy approved-stock path. No AI, private drafts, leases or mutation. */
async function prepareRegisteredBank(plan: ReturnType<typeof resolveSyllabusSelection>): Promise<
  | {ok: true; ids: string[]; assignments?: Record<string, number>}
  | {ok: false; error: string; gaps?: {section: string; required: number; available: number}[]}
> {
  if (!plan.registered) return {ok: false as const, error: "নির্ধারিত মানবণ্টন ও টপিক নির্বাচন করুন।"};
  try {
    const rows = await db.question.findMany({
      where: {category: {in: categoryAliases(plan.request.category)}, subject: plan.request.subject, approved: true},
      select: {id: true, text: true, topic: true, options: true, correct: true, explanation: true},
      orderBy: {id: "asc"}, take: 10001,
    });
    if (rows.length > 10000) return {ok: false as const, error: "এই প্রশ্নভান্ডারটি বড়; পূর্ণ স্টক যাচাইয়ের সীমা ছাড়িয়েছে।"};
    const result = assembleSubjectAutoModel(rows, plan.request.category, plan.request.subject, plan.request.variant);
    if (!result.ok) return {ok: false as const, error: "পূর্ণ মডেলের উপযুক্ত অনুমোদিত প্রশ্ন যথেষ্ট নেই।", gaps: result.gaps};
    return {ok: true as const, ids: result.ids};
  } catch {
    return {ok: false as const, error: "প্রশ্নভান্ডার যাচাই করা যায়নি। আবার চেষ্টা করুন।"};
  }
}

/** Book-wide approved stock guard; selected-topic shortages MUST NOT re-enable AI.
 * Exact subject/class aliases and requested marking scheme, never raw row counts.
 * Read/scan errors propagate so uncertainty cannot authorize paid generation.
 */
async function completeApprovedBook(plan: ReturnType<typeof resolveSyllabusSelection>) {
  const topics = autoModelTopics(plan.request.category, plan.request.subject);
  // Section-specific topic choices are selection filters too. Preserve the exact
  // marking scheme, but do not let these filters re-enable AI for a stocked book.
  // The actual selected plan is unchanged and still reports its own shortages.
  const syllabus = plan.request.syllabus && {...plan.request.syllabus,
    sections: plan.request.syllabus.sections.map(({topics: _selection, ...section}) => section)};
  const book = resolveSyllabusSelection({...plan.request, topics, avoidQuestionIds: [],
    ...(syllabus ? {syllabus} : {})});
  const rows = await db.question.findMany({
    where: {category: {in: categoryAliases(plan.request.category)},subject: plan.request.subject,
      topic: {in: topics},approved: true},
    select: {id: true,text: true,topic: true,options: true,correct: true,explanation: true},
    orderBy: {id: "asc"},take: 10001,
  });
  if (rows.length > 10000) throw Error("Full-book stock scan exceeded safe bound; AI disabled");
  return planSyllabusModel(rows, book, () => 0.5).ok;
}
