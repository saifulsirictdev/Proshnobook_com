import { createHash } from "node:crypto";
import { z } from "zod";
import { class6Topics, normalizeStem } from "./mcq-import";
const text = z.string().trim().min(1).max(6000);
const part = z.object({label:z.enum(["ক","খ","গ"]),marks:z.number(),question:text,solution:text,suggestedRubric:z.array(text).min(1)}).strict();
const page = z.union([z.number().int().min(1),z.array(z.number().int().min(1)).min(1)]);
const status = z.literal("DRAFT_SUBJECT_REVIEW_PENDING");
export function writtenRecords(input: unknown) {
 const b = z.object({class:z.literal("Class 6"),subject:text,topic:text,status,source:z.object({file:text,driveUrl:z.string().url().refine(s=>s.startsWith("https://")),basis:text,visuallyReadPrintedPages:z.array(z.number().int()),fullChapterRead:z.boolean()}).strict(),limitations:z.array(text),CQ:z.array(z.object({id:text,skill:text,stimulus:text,parts:z.array(part).length(3),referencePrintedPage:page,status}).strict()).min(1).max(40),SQ:z.array(z.object({id:text,question:text,answer:text,suggestedMarks:z.number().int().positive(),referencePrintedPage:page,status}).strict()).min(1).max(50)}).strict().parse(input);
 if(b.subject!=="গণিত" || !class6Topics.some(t=>t.subject===b.subject&&t.topic===b.topic)) throw Error("Invalid mathematics scope");
 const rows = [
  ...b.CQ.map(q=>{
   if(JSON.stringify(q.parts.map(p=>[p.label,p.marks]))!==JSON.stringify([["ক",2],["খ",4],["গ",4]])) throw Error("Mathematics CQ must be 2/4/4");
   const keys=["k","kh","g"];
   return {kind:"CQ",text:q.stimulus,options:{stimulus:q.stimulus,subQuestions:Object.fromEntries(q.parts.map((p,i)=>[keys[i],p.question])),marks:{k:2,kh:4,g:4}},explanation:q.parts.map(p=>`${p.label}) ${p.solution}`).join("\n\n"),referencePrintedPage:q.referencePrintedPage};
  }),
  ...b.SQ.map(q=>({kind:"SQ",text:q.question,options:{},explanation:q.answer,referencePrintedPage:q.referencePrintedPage}))
 ];
 const seen=new Set<string>();
 const records=rows.map(q=>{
  const stem=normalizeStem(q.text);if(!stem||seen.has(stem)) throw Error("Duplicate written question");seen.add(stem);
  return {...q,id:"written6_"+createHash("sha256").update(JSON.stringify([b.subject,b.topic,q.kind,stem])).digest("hex")};
 });
 const digest=createHash("sha256").update(JSON.stringify(b)).digest("hex");
 return {batch:b,records,digest};
}
