import { defaultPaperHeaderSchema } from "./paper-header";
import type { z } from "zod";
import type { PaperItem, PaperSettings } from "./paper-builder";

export const defaultHeaderKeys = [
  "institute",
  "exam",
  "className",
  "subject",
  "time",
  "fullMarks",
] as const;
export type DefaultHeaderKey = (typeof defaultHeaderKeys)[number];
export type DefaultHeaderValues = Record<DefaultHeaderKey, string>;
export { defaultPaperHeaderSchema };
export type DefaultPaperHeader = z.infer<typeof defaultPaperHeaderSchema>;
const bn = (v: string | number) =>
  String(v).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
const grades = ["ষষ্ঠ", "সপ্তম", "অষ্টম", "নবম", "দশম", "একাদশ", "দ্বাদশ"];
function classLabel(text: string) {
  const match = /^(?:class|grade)\s*(6|7|8|9|10|11|12)$/i.exec(text.trim());
  return match ? `${grades[Number(match[1]) - 6]} শ্রেণি` : text;
}
function subjectLabel(text: string) {
  return text
    .replace(/^English\s+(?:1st|First)\s+Paper$/i, "ইংরেজি প্রথম পত্র")
    .replace(/^English\s+(?:2nd|Second)\s+Paper$/i, "ইংরেজি দ্বিতীয় পত্র");
}
const unique = (items: PaperItem[], key: "category" | "subject") => [
  ...new Set(items.map((q) => q[key]?.trim()).filter((x): x is string => !!x)),
];
/** Derive from the WHOLE selected paper, never a page fragment or one MCQ/CQ section.
 * Time is the user's Page Setup duration; do not invent an official exam duration.
 * Explicit full marks win. Otherwise use the existing renderer's 1/10/1 scoring.
 */
export function automaticDefaultHeader(
  s: PaperSettings,
  items: PaperItem[],
): DefaultHeaderValues {
  const types = { MCQ: 0, CQ: 0, SHORT: 0 };
  let marks = 0;
  const division = s.cfg.divisionFilter;
  const hasDivision = items.some(
    (q) =>
      (s.attachments[q.id]?.division || q.topic || "সাধারণ বিভাগ") === division,
  );
  for (const q of items) {
    if (q.englishGroup) {
      marks += q.englishGroup.tasks.reduce((sum, t) => sum + t.marks, 0);
      continue;
    }
    const type = q.type || (q.stimulus ? "CQ" : q.correct ? "MCQ" : "SHORT");
    if (
      type === "CQ" &&
      s.show.divisions &&
      division &&
      hasDivision &&
      (s.attachments[q.id]?.division || q.topic || "সাধারণ বিভাগ") !== division
    )
      continue;
    if (type in types) types[type as keyof typeof types]++;
  }
  for (const type of ["MCQ", "CQ", "SHORT"] as const) {
    const requested =
      type === "MCQ"
        ? s.cfg.mcqAnswer
        : type === "CQ"
          ? s.cfg.cqAnswer
          : s.cfg.shortAnswer;
    marks +=
      Math.min(types[type], requested || types[type]) *
      (type === "CQ" ? 10 : 1);
  }
  return {
    institute: s.info.inst.trim() || "প্রশ্নবুক.কম উচ্চ বিদ্যালয় ও কলেজ",
    exam: s.info.exam.trim() || "অর্ধ বার্ষিক/বার্ষিক পরীক্ষা -২০২৭",
    className:
      unique(items, "category").map(classLabel).join(" / ") ||
      s.info.cls.trim() ||
      "শ্রেণি নির্ধারিত নয়",
    subject:
      unique(items, "subject").map(subjectLabel).join(" / ") ||
      s.info.subject.trim() ||
      "বিষয় নির্ধারিত নয়",
    time: s.info.minutes.trim() ? bn(s.info.minutes.trim()) : "নির্ধারিত নয়",
    fullMarks: s.info.marks.trim()
      ? bn(s.info.marks.trim())
      : marks
        ? bn(marks)
        : "নির্ধারিত নয়",
  };
}
export function resolveDefaultHeader(s: PaperSettings, items: PaperItem[]) {
  return { ...automaticDefaultHeader(s, items), ...s.defaultHeader?.overrides };
}
export function usesDefaultHeader(s: PaperSettings) {
  return !s.header.enabled && s.defaultHeader?.enabled === true;
}
/** UI opt-in only: schema/default restoration never rewrites historical papers,
 * prepared-stock digests, bought papers or marketplace previews. */
export function withDefaultHeader(
  s: PaperSettings,
  explicit = false,
): PaperSettings {
  if (!explicit && (s.defaultHeader || s.header.enabled)) return s;
  return {
    ...s,
    header: { ...s.header, enabled: false },
    defaultHeader: {
      enabled: true,
      overrides: { ...s.defaultHeader?.overrides },
    },
  };
}
