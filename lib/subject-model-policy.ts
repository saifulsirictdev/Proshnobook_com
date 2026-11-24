import { NCTB_CLASSES } from "./nctb-data";

/** Explicit subject policies only: stock availability never invents a syllabus.
 * New subjects register their own owner/official evidence and chapter quotas.
 * Math retains its specialised, independently tested division/diagram engine.
 */
export type SubjectModelKind = "MCQ" | "CQ" | "SHORT";
export type SubjectModelSection = {
  kind: SubjectModelKind;
  offered: number;
  answer: number;
  marksEach: number;
  requiredChapters: readonly number[];
  maxPerChapter: number;
};
export type SubjectModelPolicy = {
  id: string;
  subject: string;
  categories: readonly string[];
  diagramPathPrefix: string;
  chapters: readonly string[];
  evidence: string;
  officialYear: number | null;
  theoryMarks: number;
  practicalMarks: number;
  totalTheoryMinutes: number;
  cqPartMarks: readonly number[];
  variants: {
    MCQ: { id: string; sections: readonly SubjectModelSection[] };
    CQ: { id: string; sections: readonly SubjectModelSection[] };
  };
};
export const CHEMISTRY_REQUIRED_CHAPTERS = [3, 4, 5, 6, 7, 11] as const;
export const PHYSICS_REQUIRED_CHAPTERS = [2, 4, 6, 7, 8, 11] as const;
const physicsChapters = NCTB_CLASSES.find(c => c.class === "Class 9")?.subjects.find(s => s.name === "পদার্থবিজ্ঞান")?.chapters ?? [];
const chemistryChapters = NCTB_CLASSES.find(c => c.class === "Class 9")?.subjects.find(s => s.name === "রসায়ন")?.chapters ?? [];
export const SUBJECT_MODEL_POLICIES: readonly SubjectModelPolicy[] = [{
  id: "ssc-physics-owner-chapter-policy-v1",
  subject: "পদার্থবিজ্ঞান",
  categories: ["SSC"],
  diagramPathPrefix: "ssc-physics-ch",
  chapters: physicsChapters,
  evidence: "docs/question-bank/ssc-physics/AUTO-MODEL-POLICY.md",
  officialYear: null,
  theoryMarks: 75,
  practicalMarks: 25,
  totalTheoryMinutes: 180,
  cqPartMarks: [1, 2, 3, 4],
  variants: {
    // Chapter rotation is an explicit practice strategy, not an official chapter quota.
    MCQ: { id: "ssc-physics-mcq-v1", sections: [{ kind: "MCQ", offered: 25, answer: 25, marksEach: 1, requiredChapters: Array.from({length:14},(_,i)=>i+1), maxPerChapter: 2 }] },
    CQ: { id: "ssc-physics-written-v1", sections: [
      { kind: "CQ", offered: 7, answer: 4, marksEach: 10, requiredChapters: PHYSICS_REQUIRED_CHAPTERS, maxPerChapter: 1 },
      { kind: "SHORT", offered: 7, answer: 5, marksEach: 2, requiredChapters: PHYSICS_REQUIRED_CHAPTERS, maxPerChapter: 1 },
    ] },
  },
}, {
  id: "ssc-chemistry-owner-chapter-policy-v1",
  subject: "রসায়ন",
  categories: ["SSC"],
  diagramPathPrefix: "ssc-chemistry-ch",
  chapters: chemistryChapters,
  evidence: "docs/question-bank/ssc-chemistry/AUTO-MODEL-POLICY.md",
  officialYear: null,
  theoryMarks: 75,
  practicalMarks: 25,
  totalTheoryMinutes: 180,
  cqPartMarks: [1, 2, 3, 4],
  variants: {
    // Full-book practice rotation, not an official MCQ chapter distribution.
    // Twelve chapters need one third question to offer25; max2 is impossible.
    MCQ: { id: "ssc-chemistry-mcq-v1", sections: [{ kind: "MCQ", offered: 25, answer: 25, marksEach: 1, requiredChapters: Array.from({length:12},(_,i)=>i+1), maxPerChapter: 3 }] },
    CQ: { id: "ssc-chemistry-written-v1", sections: [
      { kind: "CQ", offered: 7, answer: 4, marksEach: 10, requiredChapters: CHEMISTRY_REQUIRED_CHAPTERS, maxPerChapter: 1 },
      { kind: "SHORT", offered: 7, answer: 5, marksEach: 2, requiredChapters: CHEMISTRY_REQUIRED_CHAPTERS, maxPerChapter: 1 },
    ] },
  },
}];
export function isSscModelCategory(category: string) {
  return /^(?:SSC|(?:Class\s*)?(?:9|10|9-10))$/i.test(category.trim());
}
/** Exact catalog topics, no numeric guessing or fallback to another subject. */
export function subjectModelChapter(policy: SubjectModelPolicy, topic: string) {
  const index = policy.chapters.indexOf(topic);
  return index < 0 ? null : index + 1;
}
export function subjectModelPolicy(category: string, subject: string) {
  const key = isSscModelCategory(category) ? "SSC" : category.trim().replace(/^(?:Class\s*)?(\d+)$/i, "Class $1");
  const matches = SUBJECT_MODEL_POLICIES.filter(p => p.subject === subject && p.categories.includes(key));
  if (matches.length !== 1) return null;
  const p = matches[0];
  // Fail closed on incomplete/ambiguous configuration, including future policies.
  if (!p.evidence || !p.chapters.length || new Set(p.chapters).size !== p.chapters.length || p.cqPartMarks.reduce((a,b)=>a+b,0)!==10) return null;
  const sections = Object.values(p.variants).flatMap(v => [...v.sections]);
  if (sections.some(s => !Number.isInteger(s.offered) || s.offered < 1 || s.answer < 1 || s.answer > s.offered || s.marksEach < 1 || s.maxPerChapter < 1 || s.requiredChapters.length > s.offered || new Set(s.requiredChapters).size !== s.requiredChapters.length || s.requiredChapters.some(ch=>!Number.isInteger(ch)||ch<1||ch>p.chapters.length))) return null;
  if (sections.reduce((n,s)=>n+s.answer*s.marksEach,0)!==p.theoryMarks) return null;
  return p;
}
export function subjectModelById(id: string) {
  for (const p of SUBJECT_MODEL_POLICIES) {
    const policy = subjectModelPolicy(p.categories[0], p.subject);
    if (!policy) continue;
    for (const variant of ["MCQ", "CQ"] as const) if (policy.variants[variant].id === id) return { policy, variant, ...policy.variants[variant] };
  }
  return null;
}
