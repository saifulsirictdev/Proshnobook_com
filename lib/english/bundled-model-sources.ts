import pool from "./data/class6-seen-pool.json";
/** Private practice sources, never question-bank approval. No cross-grade fallback.
 * Two distinct textbook units per paper; short dialogues only support gaps/vocabulary.
 * Random selection reduces fixed-source repetition, not a per-user no-repeat guarantee.
 */
export function bundledEnglishModelSources(grade: number, paper: number, random: () => number = Math.random): Record<string, { text: string; reference: string }> {
  if (grade !== 6 || paper !== 1) return {};
  const pick = <T,>(items: T[]) => items[Math.min(items.length - 1, Math.max(0, Math.floor(random() * items.length)))];
  const first = pick(pool.seen.filter(p => p.eligibleGroups.includes("seen-1")));
  const second = pick(pool.seen.filter(p => p.id !== first.id && p.lesson !== first.lesson && p.eligibleGroups.includes("seen-2")));
  // Several poems supply eight offered questions without padding a four-line verse.
  const poems = [...pool.poems];
  const selected = Array.from({ length: 3 }, () => { const poem = pick(poems); poems.splice(poems.indexOf(poem), 1); return poem; });
  return {
    "seen-1": { text: first.text, reference: first.reference },
    "seen-2": { text: second.text, reference: second.reference },
    "textbook-poems": {
      text: selected.map(p => `${p.title}\n${p.author}\n${p.text}`).join("\n\n---\n\n"),
      reference: `NCTB Class 6 English for Today, revised 2026. ${selected.map(p => `Lesson ${p.lesson}, PDF ${p.pdfPages.join(",")}: ${p.title}`).join("; ")}. Answer only from these three supplied poems; do not invent other poem content.`,
    },
  };
}
