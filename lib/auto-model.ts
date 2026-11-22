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
        offered: "৩০টি MCQ · প্রতিটি ১ নম্বর",
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
  function take(pool: AutoModelRow[], count: number, section: string) {
    const buckets = new Map<string, AutoModelRow[]>();
    for (const q of pool)
      if (!used.has(q.id))
        buckets.set(q.topic, [...(buckets.get(q.topic) ?? []), q]);
    const ordered: AutoModelRow[] = [];
    while ([...buckets.values()].some((b) => b.length))
      for (const b of buckets.values()) if (b.length) ordered.push(b.shift()!);
    if (ordered.length < count)
      gaps.push({ section, required: count, available: ordered.length });
    for (const q of ordered.slice(0, count)) {
      ids.push(q.id);
      used.add(q.id);
      divisions[q.id] = mathDivision(q.topic)!.title;
    }
  }
  if (variant === "MCQ")
    take(
      eligible.filter((q) => autoModelRowKind(q) === "MCQ"),
      30,
      "নৈর্ব্যক্তিক",
    );
  else {
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
