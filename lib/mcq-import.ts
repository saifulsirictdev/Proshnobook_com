import { createHash } from "node:crypto";
import { z } from "zod";
import { NCTB_CLASSES } from "@/lib/nctb-data";
export const class6Topics = NCTB_CLASSES.find(c => c.class === "Class 6")!.subjects.flatMap(s =>
  s.subCategories ? s.subCategories.flatMap(g => g.topics.map(topic => ({ subject: s.name, topic }))) :
    (s.chapters ?? []).map(topic => ({ subject: s.name, topic })));
const text = z.string().trim().min(1).max(6000);
const item = z.object({
  text, options: z.object({ A: text, B: text, C: text, D: text }).strict(),
  correct: z.enum(["A", "B", "C", "D"]), explanation: text,
  page: z.string().trim().min(1).max(80),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
}).strict();
export const normalizeStem = (s: string) => s.normalize("NFKC").replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/\s+/g, " ").trim().toLocaleLowerCase();
export function parseMCQBatch(raw: string) {
  if (Buffer.byteLength(raw, "utf8") > 750_000) throw Error("ব্যাচ সর্বোচ্চ ৭৫০ KB হতে পারে।");
  const batch = z.object({
    subject: z.string(), topic: z.string(),
    book: z.string().trim().min(1).max(200), edition: z.string().trim().min(1).max(100),
    sourceUrl: z.string().url().max(1500).refine(s => /^https:\/\//.test(s)),
    lang: z.enum(["Bangla", "English"]), items: z.array(item).min(1).max(100),
  }).strict().parse(JSON.parse(raw));
  if (!class6Topics.some(t => t.subject === batch.subject && t.topic === batch.topic)) throw Error("সাইটের ষষ্ঠ শ্রেণির সঠিক বিষয় ও অধ্যায় নির্বাচন করুন।");
  const stems = new Set<string>();
  for (const q of batch.items) {
    const stem = normalizeStem(q.text);
    if (!stem || stems.has(stem)) throw Error("ব্যাচে একই প্রশ্ন একাধিকবার আছে।");
    stems.add(stem);
    const choices = Object.values(q.options).map(normalizeStem);
    if (choices.some(s => !s) || new Set(choices).size !== 4) throw Error("চারটি আলাদা অপশন দিন।");
  }
  return batch;
}
export type MCQBatch = ReturnType<typeof parseMCQBatch>;
export const batchDigest = (b: MCQBatch) => createHash("sha256").update(JSON.stringify(b)).digest("hex");
export const draftId = (subject: string, topic: string, stem: string) => "mcq6_" + createHash("sha256").update(JSON.stringify([subject, topic, normalizeStem(stem)])).digest("hex");
