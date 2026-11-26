import { NCTB_CLASSES, type NctbClass } from "./nctb-data";
import { examOutlines, PREPARATION_TOPICS } from "./exam-preparation";
import jobData from "./job-syllabuses.json";
/** Same source catalogs and category keys as the public question builder.
 * Exams/branches narrow choices only; do not invent exam-specific DB categories.
 */
export const BANK_BUILDER_CATEGORIES = [
  ...Array.from({ length: 8 }, (_, i) => `Class ${i + 1}`),
  "SSC",
  "HSC",
  "Admission",
  "Job",
];
export function bankCategoryLabel(value: string) {
  return value === "SSC"
    ? "SSC (নবম-দশম)"
    : value === "HSC"
      ? "HSC (একাদশ-দ্বাদশ)"
      : value;
}
export function bankCategoryAliases(value: string): string[] {
  if (/^(SSC|9|10|Class 9|Class 10|Class 9-10)$/.test(value))
    return ["SSC", "9", "10", "Class 9", "Class 10", "Class 9-10"];
  if (/^(HSC|11|12|Class 11|Class 12|Class 11-12)$/.test(value))
    return ["HSC", "11", "12", "Class 11", "Class 12", "Class 11-12"];
  const grade = value.match(/^(?:Class )?([1-8])$/)?.[1];
  return grade ? [grade, `Class ${grade}`] : [value];
}
type JobSyllabus = {
  id: string;
  name: string;
  subjects?: { name: string; topics: string[] }[];
  branches?: JobSyllabus[];
};
export function bankScopeCatalog(
  category: string,
  examId = "",
  branchId = "",
): {
  catalog: NctbClass | undefined;
  exams: { id: string; name: string }[];
  branches: { id: string; name: string }[];
} {
  const aliases = bankCategoryAliases(category);
  if (category === "Job") {
    const exams = jobData.exams as JobSyllabus[],
      exam = exams.find((exam) => exam.id === examId),
      syllabus = exam?.branches
        ? exam.branches.find((branch) => branch.id === branchId)
        : exam;
    return {
      exams,
      branches: exam?.branches ?? [],
      catalog: {
        class: category,
        subjects: (syllabus?.subjects ?? []).map((subject) => ({
          name: subject.name,
          chapters: subject.topics,
        })),
      },
    };
  }
  if (category === "Admission") {
    const exams = examOutlines(category),
      selected = exams.find((exam) => exam.id === examId),
      subjects = [
        ...new Set(
          (selected ? [selected] : exams).flatMap((exam) => exam.subjects),
        ),
      ];
    return {
      exams,
      branches: [],
      catalog: {
        class: category,
        subjects: subjects.map((name) => ({
          name,
          chapters: PREPARATION_TOPICS[name] ?? [],
        })),
      },
    };
  }
  return {
    exams: [],
    branches: [],
    catalog: NCTB_CLASSES.find((entry) => aliases.includes(entry.class)),
  };
}
