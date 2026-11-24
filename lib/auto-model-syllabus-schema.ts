import { z } from "zod";
/** Teacher-supplied marks are explicit input, never an AI-invented board syllabus. */
export const syllabusSectionSchema = z.object({
  kind: z.enum(["MCQ", "CQ", "SHORT"]),
  title: z.string().trim().max(200).optional(),
  topics: z.array(z.string().trim().min(1).max(500)).min(1).max(200).optional(),
  offered: z.number().int().min(1).max(100),
  answer: z.number().int().min(1).max(100),
  marksEach: z.number().int().min(1).max(100),
}).strict().refine(s => s.answer <= s.offered, "উত্তরদানের সংখ্যা প্রদত্ত প্রশ্নের চেয়ে বেশি।");
export const suppliedSyllabusSchema = z.object({
  reference: z.string().trim().min(10).max(6000),
  totalMarks: z.number().int().min(1).max(500),
  minutes: z.number().int().min(1).max(360),
  sections: z.array(syllabusSectionSchema).min(1).max(20),
  cqPartMarks: z.array(z.number().int().min(1).max(50)).max(4),
}).strict().superRefine((p,ctx) => {
  const fail=(message:string)=>ctx.addIssue({code:"custom",message});
  if(p.sections.filter(s=>s.kind==="MCQ").length>1)fail("MCQ বিভাগ একবার দিন।");
  if(p.sections.some((s,i)=>p.sections.some((t,j)=>j<i&&t.kind===s.kind&&(!s.title||!t.title||s.title===t.title))))fail("একই ধরনের লিখিত বিভাগের আলাদা শিরোনাম দিন।");
  if(p.sections.reduce((n,s)=>n+s.offered,0)>100)fail("এক মডেলে সর্বোচ্চ ১০০টি প্রশ্ন।");
  if(p.sections.reduce((n,s)=>n+s.answer*s.marksEach,0)!==p.totalMarks)fail("বিভাগগুলোর নম্বর ও পূর্ণমান মিলছে না।");
  const cq=p.sections.find(s=>s.kind==="CQ");
  if(cq && (![3,4].includes(p.cqPartMarks.length)||p.sections.some(s=>s.kind==="CQ"&&p.cqPartMarks.reduce((a,b)=>a+b,0)!==s.marksEach)))fail("CQ-এর ৩/৪টি উপপ্রশ্নের নম্বর যোগফল মিলিয়ে দিন।");
  if(!cq && p.cqPartMarks.length)fail("CQ ছাড়া উপপ্রশ্নের নম্বর দেওয়া যাবে না।");
  if(p.sections.some(s=>s.kind==="MCQ"&&s.marksEach!==1))fail("MCQ-এর প্রতিটি প্রশ্ন ১ নম্বর হতে হবে।");
});
export const autoModelSelectionSchema = z.object({
  category: z.string().trim().min(1).max(100),
  subject: z.string().trim().min(1).max(200),
  variant: z.enum(["MCQ", "CQ"]),
  topics: z.array(z.string().trim().min(1).max(500)).max(200).default([]),
  syllabus: suppliedSyllabusSchema.optional(),
  avoidQuestionIds: z.array(z.string().min(1).max(128)).max(500).optional(),
}).strict();
export type SyllabusSelection = z.infer<typeof autoModelSelectionSchema>;
export type SuppliedSyllabus = z.infer<typeof suppliedSyllabusSchema>;
