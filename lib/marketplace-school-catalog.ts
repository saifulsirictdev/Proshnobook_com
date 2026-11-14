import { NCTB_CLASSES } from "@/lib/nctb-data";
export const HOME_GRADES = ["HSC", "SSC", "8", "7", "6"] as const;
export function homeGrade(raw: unknown) {
  if (raw === "9" || raw === "10") return "SSC";
  if (raw === "11" || raw === "12") return "HSC";
  return HOME_GRADES.includes(raw as (typeof HOME_GRADES)[number])
    ? (raw as string)
    : "6";
}
export const MARKET_GRADES = ["6", "7", "8", "9", "10", "11", "12"] as const;
export const MARKET_GRADE_NAMES: Record<string, string> = {
  SSC: "SSC",
  HSC: "HSC",
  "6": "ষষ্ঠ",
  "7": "সপ্তম",
  "8": "অষ্টম",
  "9": "নবম",
  "10": "দশম",
  "11": "একাদশ",
  "12": "দ্বাদশ",
};
export function marketGrade(raw: unknown) {
  return typeof raw === "string" &&
    MARKET_GRADES.includes(raw as (typeof MARKET_GRADES)[number])
    ? raw
    : "6";
}
export function marketSubjects(grade: string) {
  if (grade === "SSC") grade = "9";
  if (grade === "HSC") grade = "11";
  if (!MARKET_GRADES.includes(grade as (typeof MARKET_GRADES)[number]))
    return [];
  const name =
    grade === "10"
      ? "Class 9"
      : grade === "11" || grade === "12"
        ? "Class 11-12"
        : `Class ${grade}`;
  return NCTB_CLASSES.find((c) => c.class === name)?.subjects ?? [];
}
export function marketChapters(grade: string, subject: string) {
  const book = marketSubjects(grade).find((s) => s.name === subject);
  return book
    ? [
        ...new Set([
          ...(book.chapters ?? []),
          ...(book.subCategories ?? []).flatMap((g) => g.topics),
        ]),
      ]
    : [];
}
