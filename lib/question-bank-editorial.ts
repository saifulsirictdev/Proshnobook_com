import { toUnicode } from "@kovapdf/bijoy-unicode";
/** Explicit, review-only conversion. Never runs automatically on a whole record.
 * Protect literal formulas, code, URLs, Markdown images and numbers byte-for-byte.
 * ASCII Bijoy is ambiguous: English dictionary preservation is heuristic, so a
 * user should select only the legacy run in mixed documents and inspect the diff.
 */
export const protectedRuns =
  /```[\s\S]*?```|`[^`\n]*`|!\[[^\]\n]*\]\([^\n)]*\)|\$\$[\s\S]*?\$\$|\$[^$\n]+\$|https?:\/\/[^\s)]+|\b[A-Za-z][A-Za-z0-9_]*\s*[=+*/^]\s*[^\s,;]+|[0-9০-৯]+(?:[.,][0-9০-৯]+)*/g;
export function legacyToUnicode(text: string) {
  if (text.length > 20000) throw Error("একবারে সর্বোচ্চ ২০,০০০ অক্ষর দিন।");
  const chunks = text.split(new RegExp(`(${protectedRuns.source})`, "g"));
  return chunks
    .map((chunk, i) =>
      i % 2 ? chunk : toUnicode(chunk, { keepEnglish: true }),
    )
    .join("");
}
export function preservedLiterals(text: string) {
  return text.match(protectedRuns) ?? [];
}
export function nearQuestionScore(a: string, b: string) {
  const tokens = (s: string) =>
    new Set(
      s
        .normalize("NFKC")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .split(/\s+/)
        .filter(Boolean),
    );
  const x = tokens(a),
    y = tokens(b);
  if (
    x.size < 5 ||
    y.size < 5 ||
    Math.min(x.size, y.size) / Math.max(x.size, y.size) < 0.65
  )
    return 0;
  let same = 0;
  for (const token of x) if (y.has(token)) same++;
  return same / (x.size + y.size - same);
}
