import {createHash} from "node:crypto";
import {z} from "zod";
import {NCTB_CLASSES} from "./nctb-data";
import {normalizeStem} from "./mcq-import";
export const JSON_IMPORT_MAX_BYTES=750000;
const text=z.string().trim().min(1).max(6000);
const common={text,explanation:text,page:z.string().trim().min(1).max(100),difficulty:z.enum(["EASY","MEDIUM","HARD"])};
const item=z.discriminatedUnion("type",[
 z.object({...common,type:z.literal("MCQ"),options:z.object({A:text,B:text,C:text,D:text}).strict(),correct:z.enum(["A","B","C","D"])}).strict(),
 z.object({...common,type:z.literal("SQ")}).strict(),
 z.object({...common,type:z.literal("CQ"),parts:z.array(z.object({label:z.enum(["ক","খ","গ","ঘ"]),question:text,solution:text,marks:z.number().int().min(1).max(10)}).strict()).min(3).max(4)}).strict()
]);
const scope=z.object({category:text,subject:text,group:z.string().max(200),topic:text}).strict();
export const uploadCatalog=NCTB_CLASSES;
export function parseQuestionUpload(raw:string,selection:unknown){
 if(Buffer.byteLength(raw,"utf8")>JSON_IMPORT_MAX_BYTES)throw Error("JSON ফাইল সর্বোচ্চ ৭৫০ KB হতে পারে।");
 const s=scope.parse(selection);const subject=NCTB_CLASSES.find(c=>c.class===s.category)?.subjects.find(x=>x.name===s.subject);
 const topics=subject?.subCategories?subject.subCategories.find(g=>g.category===s.group)?.topics:(s.group===""?subject?.chapters:undefined);
 if(!topics?.includes(s.topic))throw Error("সাইটের তালিকা থেকে সঠিক শ্রেণি, বিষয়, বিভাগ ও অধ্যায় নির্বাচন করুন।");
 const b=z.object({category:text,subject:text,topic:text,book:text,edition:z.string().trim().min(1).max(200),sourceUrl:z.string().url().max(1500).refine(s=>s.startsWith("https://")),lang:z.enum(["Bangla","English"]),items:z.array(item).min(1).max(200)}).strict().parse(JSON.parse(raw));
 if(b.category!==s.category||b.subject!==s.subject||b.topic!==s.topic)throw Error("JSON-এর শ্রেণি/বিষয়/অধ্যায় নির্বাচনের সঙ্গে মিলছে না।");
 const seen=new Set<string>();
 for(const q of b.items){
  const stem=normalizeStem(q.text);if(!stem||seen.has(stem))throw Error("ব্যাচে একই প্রশ্ন একাধিকবার আছে।");seen.add(stem);
  if(q.type==="MCQ"&&new Set(Object.values(q.options).map(normalizeStem)).size!==4)throw Error("চারটি স্বতন্ত্র অপশন দিন।");
  if(q.type==="CQ"){
   const math=/গণিত|mathematics/i.test(b.subject);
   const expected=math?["ক","খ","গ"]:["ক","খ","গ","ঘ"];
   if(JSON.stringify(q.parts.map(p=>p.label))!==JSON.stringify(expected))throw Error("CQ অংশের ক্রম/সংখ্যা সঠিক নয়।");
   if(JSON.stringify(q.parts.map(p=>p.marks))!==JSON.stringify(math?[2,4,4]:[1,2,3,4]))throw Error("CQ মানবণ্টন গণিতে ২–৪–৪, অন্য বিষয়ে ১–২–৩–৪ হতে হবে।");
  }
 }
 const digest=createHash("sha256").update(JSON.stringify({selection:s,batch:b})).digest("hex");
 const records=b.items.map(q=>({id:"jsonupload_"+createHash("sha256").update(JSON.stringify([s.category,s.subject,s.topic,q.type,normalizeStem(q.text)])).digest("hex"),text:q.text,options:q.type==="MCQ"?q.options:q.type==="SQ"?{}:{stimulus:q.text,subQuestions:Object.fromEntries(q.parts.map((p,i)=>[["k","kh","g","gh"][i],p.question])),marks:Object.fromEntries(q.parts.map((p,i)=>[["k","kh","g","gh"][i],p.marks]))},correct:q.type==="MCQ"?q.correct:"",explanation:q.type==="CQ"?`${q.explanation}\n\n${q.parts.map(p=>`${p.label}) ${p.solution}`).join("\n\n")}`:q.explanation,difficulty:q.difficulty}));
 return{selection:s,batch:b,digest,records};
}
