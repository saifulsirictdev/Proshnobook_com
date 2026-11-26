import {
  bankDraftSchema,
  normalizeBankStem,
  type BankDraft,
} from "./admin-question-bank-schema";
import { parseBankText, type BankScope } from "./question-bank-batch";
export const BANK_FILE_MAX_BYTES = 50 * 1024 * 1024;
export const BANK_DOCUMENT_MAX_CHARS = 20_000_000;
export const BANK_DOCUMENT_MAX_ITEMS = 10_000;
export type BankFileFormat = "docx" | "json" | "txt";
export type BankFileProgress = { phase: string; done?: number; total?: number };
export type BankFileResult = {
  text: string;
  items: BankDraft[];
  warnings: string[];
  batchId: string;
  fileName: string;
  format: BankFileFormat;
};
export function bankFileFormat(name: string): BankFileFormat {
  const ext = name.toLowerCase().split(".").pop();
  if (ext === "docx" || ext === "json" || ext === "txt") return ext;
  throw Error(
    "DOCX, JSON অথবা TXT ফাইল দিন। পুরোনো DOC হলে Word থেকে DOCX হিসেবে সেভ করুন। PDF এই importer-এর ফাইল নয়।",
  );
}
/** Pasted JSON must work even when no JSON file was selected before it. */
export function bankPastedTextFormat(
  text: string,
  format: "auto" | "txt" | "json" = "auto",
): "txt" | "json" {
  if (format !== "auto") return format;
  const start = text.replace(/^\uFEFF/, "").trimStart();
  return start.startsWith("{") ||
    (start.startsWith("[") && !/^\[(MCQ|CQ|SQ)\]/i.test(start))
    ? "json"
    : "txt";
}
export function decodeBankText(bytes: Uint8Array) {
  let encoding = "utf-8";
  if (bytes[0] === 255 && bytes[1] === 254) encoding = "utf-16le";
  if (bytes[0] === 254 && bytes[1] === 255) encoding = "utf-16be";
  try {
    return new TextDecoder(encoding, { fatal: true })
      .decode(bytes)
      .replace(/^\uFEFF/, "");
  } catch {
    throw Error(
      "টেক্সট encoding পড়া যায়নি। TXT/JSON ফাইল UTF-8 অথবা BOM-সহ UTF-16 হিসেবে সেভ করুন।",
    );
  }
}
export function parseBankDocument(
  text: string,
  scope: BankScope,
  format: BankFileFormat,
): BankDraft[] {
  if (text.length > BANK_DOCUMENT_MAX_CHARS)
    throw Error("সর্বোচ্চ ২ কোটি অক্ষর পড়া যাবে; নথিটি ভাগ করুন।");
  if (!scope.category.trim() || !scope.subject.trim() || !scope.topic.trim())
    throw Error(
      "ফাইল পড়া হয়েছে। শ্রেণি, বিষয় ও অধ্যায় নির্বাচন করে নিচের Parse বোতাম চাপুন।",
    );
  if (format !== "json")
    return parseBankText(text, scope, {
      maxItems: BANK_DOCUMENT_MAX_ITEMS,
      maxChars: BANK_DOCUMENT_MAX_CHARS,
    });
  let value;
  try {
    value = JSON.parse(text.replace(/^\uFEFF/, ""));
  } catch {
    throw Error(
      "JSON syntax সঠিক নয়। কমা, quote ও bracket মিলিয়ে আবার Parse করুন।",
    );
  }
  // Legacy book/edition uploads must not be silently reassigned to another scope.
  if (
    value?.book &&
    value?.edition &&
    (value.category !== scope.category ||
      value.subject !== scope.subject ||
      value.topic !== scope.topic)
  )
    throw Error("JSON-এর শ্রেণি/বিষয়/অধ্যায় নির্বাচনের সঙ্গে মিলছে না।");
  const candidates = Array.isArray(value)
    ? value
    : (value?.items ?? value?.questions);
  if (
    !Array.isArray(candidates) ||
    !candidates.length ||
    candidates.length > BANK_DOCUMENT_MAX_ITEMS
  )
    throw Error(
      "JSON-এ ১–১০,০০০টি প্রশ্নের array অথবা items/questions array দিন।",
    );
  return candidates.map((item, index) => {
    const row = item && typeof item === "object" ? item : {};
    const type =
      row.type ?? row.kind ?? (row.parts ? "CQ" : row.correct ? "MCQ" : "SQ");
    const parts = Array.isArray(row.parts) ? row.parts : null;
    if (parts) {
      const labels = /গণিত|mathematics/i.test(scope.subject)
        ? ["ক", "খ", "গ"]
        : ["ক", "খ", "গ", "ঘ"];
      if (
        parts.length !== labels.length ||
        parts.some(
          (p: unknown, index: number) =>
            !p ||
            typeof p !== "object" ||
            (p as { label?: string }).label !== labels[index],
        )
      )
        throw Error(`${index + 1} নং CQ-এর অংশের সংখ্যা/ক্রম সঠিক নয়।`);
    }
    const options = parts
      ? {
          stimulus: row.text,
          subQuestions: Object.fromEntries(
            parts.map((p: { question: string }, i: number) => [
              ["k", "kh", "g", "gh"][i],
              p.question,
            ]),
          ),
          marks: Object.fromEntries(
            parts.map((p: { marks: number }, i: number) => [
              ["k", "kh", "g", "gh"][i],
              p.marks,
            ]),
          ),
        }
      : (row.options ?? {});
    const lang = row.lang ?? value?.lang ?? "Bangla";
    const checked = bankDraftSchema.safeParse({
      ...scope,
      type,
      text: row.text ?? row.question ?? row.stimulus,
      options,
      correct: type === "MCQ" ? (row.correct ?? "") : "",
      explanation:
        (row.explanation ?? "") +
        (parts
          ? "\n\n" +
            parts
              .map(
                (p: { label: string; solution: string }) =>
                  `${p.label}) ${p.solution ?? ""}`,
              )
              .join("\n\n")
          : ""),
      lang: lang === "bn" ? "Bangla" : lang === "en" ? "English" : lang,
      difficulty: row.difficulty ?? "MEDIUM",
    });
    if (!checked.success)
      throw Error(
        `${index + 1} নং JSON প্রশ্ন: ${checked.error.issues.map((issue) => issue.message).join(" · ")}`,
      );
    return checked.data;
  });
}
/** Keep every HTTP JSON body below the hosting request ceiling and existing API bounds. */
export function bankImportChunks<T extends { draft: BankDraft }>(
  items: T[],
): T[][] {
  const chunks: T[][] = [];
  let chunk: T[] = [],
    size = 1024;
  for (const item of items) {
    const bytes = new TextEncoder().encode(JSON.stringify(item)).byteLength + 1;
    if (bytes > 800_000)
      throw Error("একটি প্রশ্ন অতিরিক্ত বড়। প্রশ্নটি ছোট করুন।");
    if (chunk.length && (chunk.length >= 100 || size + bytes > 800_000)) {
      chunks.push(chunk);
      chunk = [];
      size = 1024;
    }
    chunk.push(item);
    size += bytes;
  }
  if (chunk.length) chunks.push(chunk);
  return chunks;
}
export function markCrossChunkDuplicates<
  T extends { entryId: string; draft: BankDraft },
>(items: T[]) {
  const seen = new Set<string>(),
    duplicates = new Set<string>();
  for (const item of items) {
    const stem = normalizeBankStem(item.draft.text);
    if (seen.has(stem)) duplicates.add(item.entryId);
    seen.add(stem);
  }
  return duplicates;
}
/** Mammoth output stays plain text; never insert generated HTML into the page. */
export function bankWordHtmlText(
  html: string,
  images: { src: string; alt: string }[],
) {
  const known = new Map(images.map((image) => [image.src, image.alt]));
  return html
    .replace(/<img\b[^>]*src="([^"]+)"[^>]*>/gi, (_, src: string) =>
      known.has(src)
        ? `\n![${known.get(src)}](${src})\n`
        : "\n[Word-এর ছবি বাদ গেছে; warnings দেখুন]\n",
    )
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(?:p|h[1-6]|li|tr|div)>/gi, "\n")
    .replace(/<\/t[dh]>/gi, "\t")
    .replace(/<[^>]*>/g, "")
    .replace(
      /&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,
      (match, entity: string) => {
        const named: Record<string, string> = {
          amp: "&",
          lt: "<",
          gt: ">",
          quot: '"',
          apos: "'",
          nbsp: " ",
        };
        if (named[entity]) return named[entity];
        const hex = entity[1]?.toLowerCase() === "x",
          n = parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
        return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : match;
      },
    )
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
