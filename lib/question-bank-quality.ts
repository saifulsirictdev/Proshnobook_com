import {
  bankDraftSchema,
  normalizeBankStem,
  type BankDraft,
} from "./admin-question-bank-schema";
import { isQuestionImagePath } from "./question-bank-images";
export type QualityCheck = {
  id: string;
  level: "pass" | "warning" | "error" | "manual";
  title: string;
  detail: string;
};
/** Pure local structure hints. Never guesses correctness, syllabus alignment or source verification. */
export function inspectQuestionQuality(draft: BankDraft): QualityCheck[] {
  const parsed = bankDraftSchema.safeParse(draft);
  const checks: QualityCheck[] = [
    {
      id: "structure",
      level: parsed.success ? "pass" : "error",
      title: "Editor-এর গঠন ও সীমা",
      detail: parsed.success
        ? "বর্তমান editor schema অনুযায়ী পূর্ণ। এটি বিষয়গত শুদ্ধতার প্রমাণ নয়।"
        : [...new Set(parsed.error.issues.map((issue) => issue.message))].join(
            " · ",
          ),
    },
  ];
  checks.push({
    id: "answer",
    level: draft.explanation.trim() ? "pass" : "warning",
    title: "উত্তর / সমাধান ও ব্যাখ্যা",
    detail: draft.explanation.trim()
      ? "ব্যাখ্যা লেখা আছে; সঠিক কিনা বিষয়-পর্যালোচককে মিলাতে হবে।"
      : "ব্যাখ্যা নেই। Pending খসড়া রাখা যেতে পারে; প্রকাশের আগে পূর্ণ যাচাইকৃত উত্তর প্রয়োজন।",
  });
  if (draft.type === "MCQ") {
    const values = ["A", "B", "C", "D"].map((k) =>
      typeof draft.options[k] === "string"
        ? normalizeBankStem(draft.options[k] as string)
        : "",
    );
    const unique = values.every(Boolean) && new Set(values).size === 4;
    checks.push({
      id: "choices",
      level: unique ? "pass" : "error",
      title: "MCQ অপশন ও key",
      detail: `${unique ? "চারটি আলাদা অপশন আছে।" : "চারটি পূর্ণ, আলাদা অপশন দিন।"} ${/^[ABCD]$/.test(draft.correct) ? "একটি answer key বাছা আছে; অন্য অপশনও সঠিক হয়ে যাচ্ছে কি না মানুষকে যাচাই করতে হবে।" : "A–D থেকে একটি key বাছুন।"}`,
    });
  }
  if (draft.type === "CQ") {
    const expected = /গণিত|mathematics/i.test(draft.subject)
      ? { k: 2, kh: 4, g: 4 }
      : { k: 1, kh: 2, g: 3, gh: 4 };
    const marks = draft.options.marks as Record<string, unknown> | undefined;
    const valid =
      marks &&
      Object.keys(marks).length === Object.keys(expected).length &&
      Object.entries(expected).every(([k, v]) => marks[k] === v);
    checks.push({
      id: "marks",
      level: valid ? "pass" : "error",
      title: "CQ নম্বরবণ্টন",
      detail: `এই editor-এ প্রত্যাশিত নম্বর ${Object.values(expected).join("–")}। প্রতিটি অংশের বিষয়বস্তু ও মান আলাদাভাবে যাচাই করতে হবে।`,
    });
  }
  const content =
    draft.text +
    "\n" +
    draft.explanation +
    "\n" +
    JSON.stringify(draft.options);
  const urls = [...content.matchAll(/!\[[^\]\n]*\]\(([^\s)]+)\)/g)].map(
    (match) => match[1],
  );
  const invalid = urls.some(
    (url) =>
      url.startsWith("/api/question-bank/images/") && !isQuestionImagePath(url),
  );
  checks.push({
    id: "images",
    level: invalid ? "error" : urls.length ? "manual" : "pass",
    title: "ছবি / diagram reference",
    detail: invalid
      ? "কমপক্ষে একটি uploaded-image reference-এর গঠন সঠিক নয়। প্রিভিউতে মিলিয়ে পুনরায় ছবি বসান।"
      : urls.length
        ? `${urls.length}টি image reference পাওয়া গেছে। এটি file availability পরীক্ষা নয়—প্রিভিউ ও ছবির অধিকার/উৎস মিলিয়ে নিন।`
        : "Markdown image reference পাওয়া যায়নি; প্রয়োজনীয় চিত্র বাদ পড়েছে কি না মূল উৎসে মিলিয়ে নিন।",
  });
  checks.push({
    id: "evidence",
    level: "manual",
    title: "উৎস, ভাষা, উত্তর ও সিলেবাস যাচাই",
    detail:
      "এই স্বয়ংক্রিয় checklist বই/সংস্করণ/পৃষ্ঠা, বানান, উত্তর বা সিলেবাস যাচাই করে না। Approved-ও এই স্বাধীন বিষয়গত যাচাইয়ের সনদ নয়।",
  });
  return checks;
}
