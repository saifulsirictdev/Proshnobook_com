/** Starter navigation groups, not a compulsory/elective exam-syllabus contract.
 * Subject strings stay unchanged so existing chapters, stock and English routes work.
 */
export const ACADEMIC_SUBJECT_GROUPS = [
  { id: "general", label: "সাধারণ" },
  { id: "science", label: "বিজ্ঞান" },
  { id: "humanities", label: "মানবিক" },
  { id: "business", label: "ব্যবসা শিক্ষা" },
] as const;
export type SubjectGroup = (typeof ACADEMIC_SUBJECT_GROUPS)[number]["id"];
const subjects: Record<SubjectGroup, readonly string[]> = {
  general: [
    "বাংলা ১ম পত্র", "বাংলা সহপাঠ", "বাংলা ভাষার ব্যাকরণ ও নির্মিতি",
    "English For Today", "English Grammar and Composition",
    "English 1st Paper", "English 2nd Paper", "Free Hand Writing",
    "গণিত", "তথ্য ও যোগাযোগ প্রযুক্তি", "বাংলাদেশ ও বিশ্বপরিচয়",
    "ইসলাম শিক্ষা", "হিন্দুধর্ম শিক্ষা", "বৌদ্ধধর্ম শিক্ষা", "খ্রীষ্টধর্ম শিক্ষা",
    "কৃষিশিক্ষা", "গার্হস্থ্যবিজ্ঞান", "ক্যারিয়ার শিক্ষা", "চারু ও কারুকলা",
    "শারীরিক শিক্ষা, স্বাস্থ্যবিজ্ঞান ও খেলাধুলা", "আরবি", "সংস্কৃত", "পালি", "সংগীত",
  ],
  science: ["পদার্থবিজ্ঞান", "রসায়ন", "জীববিজ্ঞান", "উচ্চতর গণিত"],
  humanities: ["বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা", "ভূগোল ও পরিবেশ", "পৌরনীতি ও নাগরিকতা", "অর্থনীতি", "বিজ্ঞান"],
  business: ["হিসাববিজ্ঞান", "ফিন্যান্স ও ব্যাংকিং", "ব্যবসায় উদ্যোগ", "বিজ্ঞান"],
};
// HSC papers retain the exact existing catalog titles. Shared elective subjects
// can belong to multiple streams; General is the common/shared-subject drawer.
const papers = (names: string[]) => names.flatMap(name => [`${name} ১ম পত্র`, `${name} ২য় পত্র`]);
const hscSubjects: Record<SubjectGroup, readonly string[]> = {
  general: [
    ...papers(["বাংলা", "ইংরেজি", "কৃষিশিক্ষা", "গার্হস্থ্য বিজ্ঞান"]),
    "তথ্য ও যোগাযোগ প্রযুক্তি", "Free Hand Writing",
    "English 1st Paper", "English 2nd Paper",
  ],
  science: papers(["পদার্থবিজ্ঞান", "রসায়ন", "জীববিজ্ঞান", "উচ্চতর গণিত", "পরিসংখ্যান"]),
  humanities: papers(["অর্থনীতি", "ভূগোল", "পৌরনীতি ও সুশাসন", "ইসলামের ইতিহাস ও সংস্কৃতি", "ইতিহাস", "মনোবিজ্ঞান", "সমাজবিজ্ঞান", "পরিসংখ্যান"]),
  business: papers(["হিসাববিজ্ঞান", "ব্যবসায় সংগঠন ও ব্যবস্থাপনা", "অর্থনীতি", "পরিসংখ্যান"]),
};
export function hscGroupSubjects(available: readonly string[], group: string): string[] {
  const entry = ACADEMIC_SUBJECT_GROUPS.find(g => g.id === group);
  return entry ? [...new Set(available)].filter(name => hscSubjects[entry.id].includes(name)) : [];
}
export function sscGroupSubjects(available: readonly string[], group: string): string[] {
  const entry = ACADEMIC_SUBJECT_GROUPS.find(g => g.id === group);
  if (!entry) return [];
  // Unknown DB-only names are not guessed into a stream; add reviewed aliases here.
  return [...new Set(available)].filter(name => subjects[entry.id].includes(name));
}
