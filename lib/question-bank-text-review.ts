import { bankDraftSchema, type BankDraft } from "./admin-question-bank-schema";
import type { BankScope } from "./question-bank-batch";
export type BankTextReview = {
  rawBlock: string;
  notes: string[];
  requiresSourceReview: boolean;
};
const missing = (text: string) =>
  /^(?:উত্তর\s*নেই|সমাধান\s*নেই|উত্তর\s*দেওয়া\s*নেই|N\/?A|not\s*(?:given|available)|no\s*answer)?[।.\s]*$/i.test(
    text.trim(),
  );
export function bankStagingIssues(
  draft: BankDraft,
  review?: BankTextReview,
  sourceChecked = false,
): string[] {
  const parsed = bankDraftSchema.safeParse(draft),
    issues = parsed.success
      ? []
      : parsed.error.issues.map((issue) => issue.message);
  if (review?.requiresSourceReview) {
    if (missing(draft.explanation))
      issues.push(
        "মূলের সঙ্গে মিলিয়ে উত্তর/সমাধান লিখুন; ‘উত্তর নেই’ পূর্ণ সমাধান নয়।",
      );
    if (!sourceChecked)
      issues.push(
        "মূল সূত্র, অপশন, চিত্র/সারণি ও উত্তর মিলিয়ে প্রতি প্রশ্নের source-review-এ সম্মতি দিন।",
      );
  }
  return [...new Set(issues)];
}
/** Review-only parser. Invalid drafts are deliberately NOT eligible for saving.
 * Board/section strings are file claims, never independent provenance evidence.
 * Strict parseBankText and server bankDraftSchema remain unchanged.
 */
export function parseBankTextForReview(
  raw: string,
  scope: BankScope,
  maxItems = 10000,
  maxChars = 20_000_000,
): { items: BankDraft[]; reviews: BankTextReview[]; warnings: string[] } {
  if (raw.length > maxChars) throw Error("টেক্সট অতিরিক্ত বড়; নথিটি ভাগ করুন।");
  if (!scope.category.trim() || !scope.subject.trim() || !scope.topic.trim())
    throw Error("ফাইল পড়া হয়েছে। শ্রেণি, বিষয় ও অধ্যায় নির্বাচন করুন।");
  const records: { type: BankDraft["type"]; board: string; lines: string[] }[] =
    [];
  let board = "",
    current: (typeof records)[number] | undefined,
    outside = 0;
  const flush = () => {
    if (current) {
      records.push(current);
      current = undefined;
      if (records.length > maxItems)
        throw Error(`সর্বোচ্চ ${maxItems}টি প্রশ্ন staging-এ নেওয়া যাবে।`);
    }
  };
  for (const line of raw
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n")
    .split("\n")) {
    const header = line.trim().match(/^\[(MCQ|CQ|SQ)\]$/i),
      boardLine = line.trim().match(/^BOARD:\s*(.*)$/i);
    if (header) {
      flush();
      current = {
        type: header[1].toUpperCase() as BankDraft["type"],
        board,
        lines: [line],
      };
    } else if (boardLine) {
      flush();
      board = boardLine[1].trim();
    } else if (/^\s*(?:---+|===+)\s*$/.test(line)) {
      flush();
    } else if (current) current.lines.push(line);
    else if (line.trim()) outside++;
  }
  flush();
  if (!records.length)
    throw Error(
      "প্রশ্নের শুরুতে [MCQ], [CQ] বা [SQ] দিন। Template অনুসরণ করুন।",
    );
  const items: BankDraft[] = [],
    reviews: BankTextReview[] = [];
  let metadataCount = 0;
  for (const record of records) {
    const fields: Record<string, string> = {},
      notes: string[] = [];
    let key = "";
    for (const line of record.lines.slice(1)) {
      const match = line.match(
        /^(Question Number|Section|Question|Stimulus|Explanation|Answer|Difficulty|Language|A|B|C|D|k|kh|g|gh):\s?(.*)$/,
      );
      if (match) {
        key = match[1];
        if (Object.hasOwn(fields, key)) {
          notes.push(
            `${key} একাধিকবার আছে—প্রথম মান রাখা হয়েছে; নিচের মূল টেক্সট মিলিয়ে সংশোধন করুন।`,
          );
          key = "";
        } else fields[key] = match[2];
      } else if (key) fields[key] += "\n" + line;
      else if (line.trim())
        notes.push("অচেনা/অতিরিক্ত লাইন আছে; মূল টেক্সট দেখে সংশোধন করুন।");
    }
    const reference = {
      boardLabel: record.board,
      questionNumber: fields["Question Number"]?.trim() ?? "",
      section: fields.Section?.trim() ?? "",
      independentlyVerified: false,
    };
    const hasMetadata = !!(
      reference.boardLabel ||
      reference.questionNumber ||
      reference.section
    );
    if (hasMetadata) {
      metadataCount++;
      notes.push(
        "বোর্ড/বছর, প্রশ্ন নম্বর ও বিভাগ ফাইলের দাবি মাত্র; মূল প্রশ্নপত্র দিয়ে যাচাই করুন।",
      );
    }
    const math = /গণিত|mathematics/i.test(scope.subject),
      keys = math ? ["k", "kh", "g"] : ["k", "kh", "g", "gh"],
      expected = math ? [2, 4, 4] : [1, 2, 3, 4];
    const parts: Record<string, string> = {},
      marks: Record<string, number> = {};
    for (const [i, part] of keys.entries()) {
      let text = (fields[part] ?? "").trim();
      const suffix = text.match(/\s*\(Marks:\s*([০-৯\d]+)\s*\)\s*$/i);
      if (suffix) {
        marks[part] = Number(
          suffix[1].replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d))),
        );
        text = text.slice(0, suffix.index).trim();
      } else marks[part] = expected[i];
      parts[part] = text;
    }
    if (record.type === "CQ")
      for (const extra of ["k", "kh", "g", "gh"].filter(
        (key) => !keys.includes(key),
      )) {
        if (fields[extra] !== undefined) {
          parts[extra] = fields[extra];
          marks[extra] = 0;
          notes.push(
            `অপ্রত্যাশিত CQ অংশ ${extra}; scope/মূল টেক্সট সংশোধন করুন।`,
          );
        }
      }
    const text = (fields.Question ?? fields.Stimulus ?? "").trim(),
      answer = (fields.Answer ?? "").trim(),
      explanation = (fields.Explanation ?? "").trim();
    if (record.type === "MCQ" && missing(answer))
      notes.push("ফাইলে MCQ-এর সঠিক উত্তর নেই; কোনো A/B/C/D অনুমান করা হয়নি।");
    if (missing(explanation))
      notes.push("ফাইলে উত্তর/সমাধান নেই; editor-এ পূরণ করুন।");
    const draft = {
      ...scope,
      type: record.type,
      text,
      lang: (fields.Language?.trim() || "Bangla") as BankDraft["lang"],
      difficulty: (fields.Difficulty?.trim() ||
        "MEDIUM") as BankDraft["difficulty"],
      correct: record.type === "MCQ" ? (missing(answer) ? "" : answer) : "",
      explanation: missing(explanation) ? "" : explanation,
      options: {
        ...(record.type === "MCQ"
          ? Object.fromEntries(
              ["A", "B", "C", "D"].map((key) => [
                key,
                (fields[key] ?? "").trim(),
              ]),
            )
          : record.type === "CQ"
            ? { stimulus: text, subQuestions: parts, marks }
            : {}),
        ...(hasMetadata ? { importReference: reference } : {}),
      },
    } satisfies BankDraft;
    const structural = bankDraftSchema.safeParse(draft);
    // Keep a bad row visible/editable without presenting it as a valid saved draft.
    const requiresSourceReview =
      hasMetadata || notes.length > 0 || !structural.success;
    items.push(draft);
    reviews.push({
      rawBlock: record.lines.join("\n"),
      notes: [...new Set(notes)],
      requiresSourceReview,
    });
  }
  return {
    items,
    reviews,
    warnings: [
      ...(outside
        ? [
            `${outside}টি অতিরিক্ত লাইন প্রশ্নের বাইরে পাওয়া গেছে; extracted টেক্সটে রয়ে গেছে।`,
          ]
        : []),
      ...(metadataCount
        ? [
            `${metadataCount}টি প্রশ্নে বোর্ড/প্রশ্ন নম্বর/বিভাগের অযাচাইকৃত দাবি রাখা হয়েছে।`,
          ]
        : []),
      ...(reviews.some((review) => review.requiresSourceReview)
        ? [
            "অসম্পূর্ণ প্রশ্নও কেবল অস্থায়ী staging-এ এসেছে। মূল সূত্র, চিত্র/সারণি, অপশন ও সমাধান সংশোধন এবং source-review ছাড়া সেভ নয়; কোনো উত্তর বা হারানো সূত্র অনুমান করা হয়নি।",
          ]
        : []),
    ],
  };
}
