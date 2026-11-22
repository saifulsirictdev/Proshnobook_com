import { NCTB_CLASSES } from "./nctb-data";

export type AutoModelVariant = "MCQ" | "CQ";
export const AUTO_MODEL_NOTICE =
  "আপনার দেওয়া নমুনার ভিত্তিতে practice কাঠামো; সরকারি পরীক্ষার সর্বশেষ সিলেবাস/মানবণ্টনের স্বীকৃতি নয়।";
export const MATH_DIVISIONS = [
  {
    id: "algebra",
    title: "ক-বিভাগ: বীজগণিত",
    chapters: [1, 2, 3, 4, 5, 11, 12, 13],
  },
  { id: "geometry", title: "খ-বিভাগ: জ্যামিতি", chapters: [6, 7, 8, 14, 15] },
  {
    id: "trigonometry",
    title: "গ-বিভাগ: ত্রিকোণমিতি ও পরিমিতি",
    chapters: [9, 10, 16],
  },
  { id: "statistics", title: "ঘ-বিভাগ: পরিসংখ্যান", chapters: [17] },
] as const;
// Owner-supplied SSC 2027 distribution, printed p14 (subject 109).
// Trigonometry/mensuration + statistics share ONE five-question quota.
export const MATH_MCQ_QUOTAS = {
  algebra: { min: 12, max: 15 },
  geometry: { min: 10, max: 13 },
  combined: 5,
  total: 30,
  maxDiagramQuestions: 5,
} as const;
export const MATH_MCQ_DISTRIBUTION =
  "বীজগণিত ১২–১৫টি · জ্যামিতি ১০–১৩টি · ত্রিকোণমিতি ও পরিমিতি এবং পরিসংখ্যান মিলিয়ে ৫টি";
const mathChapters =
  NCTB_CLASSES.find(
    (c) => c.class === "Class 9" || c.class === "Class 10",
  )?.subjects.find((s) => s.name === "গণিত")?.chapters ?? [];
export function isAcademicCategory(category: string) {
  return /^(?:Class\s*)?(?:[1-9]|1[012]|9-10|11-12)$|^SSC$|^HSC$/i.test(
    category.trim(),
  );
}
export function autoModelBlueprint(
  category: string,
  subject: string,
  variant: string,
) {
  if (
    !/^(?:SSC|(?:Class\s*)?(?:9|10|9-10))$/i.test(category.trim()) ||
    subject !== "গণিত" ||
    !["MCQ", "CQ"].includes(variant)
  )
    return null;
  return variant === "MCQ"
    ? {
        id: "ssc-math-mcq-v1" as const,
        title: "SSC গণিত — নৈর্ব্যক্তিক মডেল",
        totalMarks: 30,
        minutes: "৩০ মিনিট",
        offered: `৩০টি MCQ · প্রতিটি ১ নম্বর। ${MATH_MCQ_DISTRIBUTION} · চিত্রযুক্ত প্রশ্ন সর্বোচ্চ ৫টি`,
        instructions: "সকল ৩০টি প্রশ্নের উত্তর দাও। প্রতিটি প্রশ্নের মান ১।",
        variant: "MCQ" as const,
      }
    : {
        id: "ssc-math-written-v1" as const,
        title: "SSC গণিত — সৃজনশীল ও সংক্ষিপ্ত মডেল",
        totalMarks: 70,
        minutes: "২ ঘণ্টা ৩০ মিনিট",
        offered: "৮টি CQ থেকে ৫টি (৫০) + ১৫টি সংক্ষিপ্ত থেকে ১০টি (২০)",
        instructions:
          "সৃজনশীল: প্রতিটি বিভাগ থেকে ন্যূনতম ১টি করে মোট ৫টি প্রশ্নের উত্তর দাও। প্রতিটি প্রশ্নের মান ১০ (ক–খ–গ: ২–৪–৪)। সংক্ষিপ্ত: যেকোনো ১০টির উত্তর দাও; প্রতিটি ২ নম্বর।",
        variant: "CQ" as const,
      };
}
export function mathDivision(topic: string) {
  // Match the existing catalog exactly; unknown/ambiguous chapter strings are not guessed.
  const index = mathChapters.indexOf(topic);
  return index < 0
    ? undefined
    : MATH_DIVISIONS.find((d) =>
        (d.chapters as readonly number[]).includes(index + 1),
      );
}
export type AutoModelRow = {
  id: string;
  text: string;
  topic: string;
  correct: string;
  explanation: string;
  options: unknown;
};
function object(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === "object" && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {};
}
/** Count question-side figures, not answer/explanation figures. Multiple figures
 * in one question consume one slot. Used by assembly and editor validation. */
export function autoModelHasDiagram(q: { text: string; stimulus?: string; options?: unknown }): boolean {
  const o = object(q.options);
  return [q.text, q.stimulus, o.stimulus].some(value => typeof value === "string" && value.includes("!["));
}
export function autoModelRowKind(
  q: AutoModelRow,
): "MCQ" | "CQ" | "SHORT" | null {
  if (!q.text.trim() || !q.explanation.trim() || !mathDivision(q.topic))
    return null;
  const o = object(q.options);
  const stem = String(o.stimulus || q.text);
  const diagramTokens = stem.match(/!\[[^\]\n]*\]\([^)]*\)/g) ?? [];
  if (stem.includes("![") && !diagramTokens.length) return null;
  for (const token of diagramTokens) {
    const url = token.match(/\(([^)]*)\)$/)?.[1] ?? "";
    try {
      if (new URL(url).protocol !== "https:" || /[\s)]/.test(url)) return null;
    } catch {
      return null;
    }
  }

  // An image dependency must not disappear from an auto-assembled paper.
  if (
    o.image ||
    o.diagram ||
    o.imageUrl ||
    o.attachments ||
    o.groupId ||
    o.stimulusId ||
    o.sharedStimulus
  )
    return null;
  // Cross-row stimuli/figures cannot safely be sampled individually. Inline diagrams and
  // self-contained CQ stimuli remain inside their original question text/record.
  if (
    /(?:উপরের|নিচের|নিম্নের|নিচের দেওয়া|প্রদত্ত) (?:উদ্দীপক|চিত্র)|উদ্দীপকের আলোকে|(?:চিত্র|উদ্দীপক) অনুসারে|following (?:stimulus|figure)|above (?:passage|figure)/i.test(
      q.text,
    ) &&
    !q.text.includes("![") &&
    !o.stimulus
  )
    return null;
  if (
    typeof o.stimulus === "string" &&
    q.text.includes("![") &&
    !o.stimulus.includes("![")
  )
    return null;
  if (q.correct.trim()) {
    const choices = Object.entries(o).filter(([k]) => k !== "_provenance");
    return choices.length === 4 &&
      choices.every(
        ([, v]) => typeof v === "string" && v.trim() && !v.includes("!["),
      ) &&
      choices.some(([k]) => k === q.correct) &&
      new Set(choices.map(([, v]) => String(v).trim())).size === 4
      ? "MCQ"
      : null;
  }
  const sub = object(o.subQuestions ?? o);
  const parts = [sub.k ?? sub.ক, sub.kh ?? sub.খ, sub.g ?? sub.গ];
  const cq =
    o.stimulus || o.subQuestions || sub.k || sub.ক || q.text.includes("(ক)");
  if (!cq) return "SHORT";
  if (!parts.every((v) => typeof v === "string" && v.trim()) || sub.gh || sub.ঘ)
    return null;
  const marks = object(o.marks);
  if (
    Object.keys(marks).length &&
    ["k", "kh", "g"].some((k, i) => marks[k] !== [2, 4, 4][i])
  )
    return null;
  return "CQ";
}
const fingerprint = (text: string) =>
  text
    .normalize("NFKC")
    .replace(/[০-৯]/g, (c) => String("০১২৩৪৫৬৭৮৯".indexOf(c)))
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
/** Balanced topic rotation, with injected randomness for reproducible isolated tests. */
export function assembleAutoModel(
  rows: AutoModelRow[],
  variant: AutoModelVariant,
  random: () => number = Math.random,
) {
  const mixed = [...rows];
  for (let i = mixed.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.max(0, Math.floor(random() * (i + 1))));
    [mixed[i], mixed[j]] = [mixed[j], mixed[i]];
  }
  const seenIds = new Set<string>(),
    seenStems = new Set<string>();
  const eligible = mixed.filter((q) => {
    const kind = autoModelRowKind(q);
    const key = fingerprint(String(object(q.options).stimulus || q.text));
    if (
      seenIds.has(q.id) ||
      seenStems.has(key) ||
      !kind ||
      (variant === "MCQ" ? kind !== "MCQ" : kind === "MCQ")
    )
      return false;
    seenIds.add(q.id);
    seenStems.add(key);
    return true;
  });
  const ids: string[] = [],
    divisions: Record<string, string> = {},
    gaps: { section: string; required: number; available: number }[] = [];
  const used = new Set<string>();
  function take(pool: AutoModelRow[], count: number, section: string, diagramLimit = Infinity) {
    const buckets = new Map<string, AutoModelRow[]>();
    for (const q of pool)
      if (!used.has(q.id))
        buckets.set(q.topic, [...(buckets.get(q.topic) ?? []), q]);
    const ordered: AutoModelRow[] = [];
    while ([...buckets.values()].some((b) => b.length))
      for (const b of buckets.values()) if (b.length) ordered.push(b.shift()!);
    let diagrams = 0;
    const selected = ordered.filter(q => {
      if (!autoModelHasDiagram(q)) return true;
      if (diagrams >= diagramLimit) return false;
      diagrams++;
      return true;
    }).slice(0, count);
    if (selected.length < count)
      gaps.push({ section, required: count, available: selected.length });
    for (const q of selected) {
      ids.push(q.id);
      used.add(q.id);
      divisions[q.id] = mathDivision(q.topic)!.title;
    }
  }
  if (variant === "MCQ") {
    const algebra = eligible.filter(q => mathDivision(q.topic)?.id === "algebra");
    const geometry = eligible.filter(q => mathDivision(q.topic)?.id === "geometry");
    const combined = eligible.filter(q => ["trigonometry", "statistics"].includes(mathDivision(q.topic)!.id));
    const quota = MATH_MCQ_QUOTAS;
    const minimumDiagrams = (pool: AutoModelRow[], count: number) =>
      Math.max(0, count - pool.filter(q => !autoModelHasDiagram(q)).length);
    const splits = Array.from({ length: quota.algebra.max - quota.algebra.min + 1 }, (_, i) => quota.algebra.min + i)
      .map(a => ({ algebra: a, geometry: quota.total - quota.combined - a }))
      .filter(s => s.geometry >= quota.geometry.min && s.geometry <= quota.geometry.max && s.algebra <= algebra.length && s.geometry <= geometry.length);
    if (!splits.length) {
      if (algebra.length < quota.algebra.min)
        gaps.push({ section: MATH_DIVISIONS[0].title, required: quota.algebra.min, available: algebra.length });
      if (geometry.length < quota.geometry.min)
        gaps.push({ section: MATH_DIVISIONS[1].title, required: quota.geometry.min, available: geometry.length });
      if (!gaps.length)
        gaps.push({ section: "বীজগণিত ও জ্যামিতি (বিভাগীয় সীমার মধ্যে)", required: 25, available: Math.min(algebra.length, quota.algebra.max) + Math.min(geometry.length, quota.geometry.max) });
    }
    if (combined.length < quota.combined)
      gaps.push({ section: "ত্রিকোণমিতি ও পরিমিতি এবং পরিসংখ্যান মিলিয়ে", required: quota.combined, available: combined.length });
    if (gaps.length) return { ok: false as const, gaps };
    // Reserve mandatory figure slots across ALL pools before sampling. A greedy
    // cap per division can exhaust the budget and falsely reject a feasible paper.
    const neededDiagrams = (s: typeof splits[number]) =>
      minimumDiagrams(algebra, s.algebra) + minimumDiagrams(geometry, s.geometry) + minimumDiagrams(combined, quota.combined);
    const feasible = splits.filter(s => neededDiagrams(s) <= quota.maxDiagramQuestions);
    if (!feasible.length) return { ok: false as const, gaps: [{
      section: "সর্বোচ্চ ৫টি চিত্রযুক্ত প্রশ্ন রেখে পূর্ণ MCQ (চিত্রবিহীন প্রশ্নের ঘাটতি)",
      required: quota.total - quota.maxDiagramQuestions,
      available: Math.max(...splits.map(s => quota.total - neededDiagrams(s))),
    }] };
    const split = feasible[Math.min(feasible.length - 1, Math.max(0, Math.floor(random() * feasible.length)))];
    const pools = [algebra, geometry, combined];
    const counts = [split.algebra, split.geometry, quota.combined];
    const labels = [MATH_DIVISIONS[0].title, MATH_DIVISIONS[1].title, "ত্রিকোণমিতি ও পরিমিতি এবং পরিসংখ্যান মিলিয়ে"];
    let remaining = quota.maxDiagramQuestions;
    for (let i = 0; i < pools.length; i++) {
      const reserve = pools.slice(i + 1).reduce((n, pool, j) => n + minimumDiagrams(pool, counts[i + j + 1]), 0);
      const start = ids.length;
      take(pools[i], counts[i], labels[i], remaining - reserve);
      const selectedIds = new Set(ids.slice(start));
      remaining -= pools[i].filter(q => selectedIds.has(q.id) && autoModelHasDiagram(q)).length;
    }
  } else {
    for (const d of MATH_DIVISIONS)
      take(
        eligible.filter(
          (q) =>
            autoModelRowKind(q) === "CQ" && mathDivision(q.topic)?.id === d.id,
        ),
        2,
        d.title,
      );
    take(
      eligible.filter((q) => autoModelRowKind(q) === "SHORT"),
      15,
      "সংক্ষিপ্ত উত্তর প্রশ্ন",
    );
  }
  return gaps.length
    ? { ok: false as const, gaps }
    : { ok: true as const, ids, divisions };
}
