import { bankDraftSchema, type BankDraft } from "./admin-question-bank-schema";
export const MAX_BANK_IMPORT = 100;
export type BankScope = Pick<BankDraft, "category" | "subject" | "topic">;
/** A deliberately explicit interchange grammar, not a claim to understand every
 * arbitrary Word layout. Unstructured documents stay editable as extracted text.
 */
export function parseBankText(
  raw: string,
  scope: BankScope,
  limits = { maxItems: MAX_BANK_IMPORT, maxChars: 250000 },
): BankDraft[] {
  if (raw.length > limits.maxChars)
    throw Error("টেক্সট অতিরিক্ত বড়; ছোট ব্যাচ দিন।");
  const blocks = raw
    .replace(/\r\n?/g, "\n")
    .split(/^\s*---+\s*$/m)
    .filter((s) => s.trim());
  if (!blocks.length || blocks.length > limits.maxItems)
    throw Error(`এই প্রক্রিয়ায় ১–${limits.maxItems}টি প্রশ্ন দিন।`);
  return blocks.map((block, index) => {
    const lines = block.trim().split("\n");
    const type = lines
      .shift()
      ?.trim()
      .match(/^\[(MCQ|CQ|SQ)\]$/i)?.[1]
      .toUpperCase() as BankDraft["type"] | undefined;
    if (!type)
      throw Error(
        `${index + 1} নং প্রশ্নের শুরুতে [MCQ], [CQ] বা [SQ] দিন। Template অনুসরণ করুন।`,
      );
    const fields: Record<string, string> = {};
    let key = "";
    for (const line of lines) {
      const field = line.match(
        /^(Question|Stimulus|Explanation|Answer|Difficulty|Language|A|B|C|D|k|kh|g|gh):\s?(.*)$/,
      );
      if (field) {
        key = field[1];
        if (Object.hasOwn(fields, key))
          throw Error(`${index + 1} নং প্রশ্নে ${key} একাধিকবার আছে।`);
        fields[key] = field[2];
      } else if (key) fields[key] += "\n" + line;
      else if (line.trim())
        throw Error(
          `${index + 1} নং প্রশ্নে অচেনা টেক্সট আছে। Template ব্যবহার করুন।`,
        );
    }
    const text = (fields.Question ?? fields.Stimulus ?? "").trim();
    const math = /গণিত|mathematics/i.test(scope.subject),
      keys = math ? ["k", "kh", "g"] : ["k", "kh", "g", "gh"];
    const draft = {
      ...scope,
      type,
      text,
      explanation: (fields.Explanation ?? "").trim(),
      lang: fields.Language?.trim() || "Bangla",
      difficulty: fields.Difficulty?.trim() || "MEDIUM",
      correct: type === "MCQ" ? (fields.Answer ?? "").trim() : "",
      options:
        type === "MCQ"
          ? Object.fromEntries(
              ["A", "B", "C", "D"].map((k) => [k, (fields[k] ?? "").trim()]),
            )
          : type === "CQ"
            ? {
                stimulus: text,
                subQuestions: Object.fromEntries(
                  keys.map((k) => [k, (fields[k] ?? "").trim()]),
                ),
                marks: Object.fromEntries(
                  keys.map((k, i) => [k, math ? [2, 4, 4][i] : i + 1]),
                ),
              }
            : {},
    };
    const checked = bankDraftSchema.safeParse(draft);
    if (!checked.success)
      throw Error(
        `${index + 1} নং প্রশ্ন: ${checked.error.issues.map((i) => i.message).join(" · ")}`,
      );
    return checked.data;
  });
}
export function bankTextTemplate(math = false) {
  return `[MCQ]\nQuestion: দুই এবং দুইয়ের যোগফল কত?\nA: ৪\nB: ৩\nC: ৫\nD: ৬\nAnswer: A\nExplanation: দুইয়ের সঙ্গে দুই যোগ করলে চার হয়।\nDifficulty: EASY\nLanguage: Bangla\n---\n[SQ]\nQuestion: মৌলিক সংখ্যা কী?\nExplanation: যে স্বাভাবিক সংখ্যার ঠিক দুটি ভিন্ন ধনাত্মক গুণনীয়ক আছে।\nDifficulty: MEDIUM\n---\n[CQ]\nStimulus: উদ্দীপক এখানে লিখুন।\nk: ক অংশের প্রশ্ন\nkh: খ অংশের প্রশ্ন\ng: গ অংশের প্রশ্ন${math ? "" : "\ngh: ঘ অংশের প্রশ্ন"}\nExplanation: প্রতিটি অংশের সমাধান এখানে আলাদা করে লিখুন।\nDifficulty: MEDIUM`;
}
export function toBankText(items: BankDraft[]) {
  return items
    .map((q) =>
      [
        `[${q.type}]`,
        `${q.type === "CQ" ? "Stimulus" : "Question"}: ${q.text}`,
        ...(q.type === "MCQ"
          ? ["A", "B", "C", "D"]
              .map((k) => `${k}: ${q.options[k] ?? ""}`)
              .concat(`Answer: ${q.correct}`)
          : q.type === "CQ"
            ? Object.entries(
                (q.options.subQuestions ?? {}) as Record<string, string>,
              ).map(([k, v]) => `${k}: ${v}`)
            : []),
        `Explanation: ${q.explanation}`,
        `Difficulty: ${q.difficulty}`,
        `Language: ${q.lang}`,
      ].join("\n"),
    )
    .join("\n---\n");
}
/** Stable import identity, not a secret or authorization token. */
export function bankUuidFromHex(hex: string) {
  const h = hex.slice(0, 32).padEnd(32, "0").split("");
  h[12] = "4";
  h[16] = "8";
  const s = h.join("");
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}
