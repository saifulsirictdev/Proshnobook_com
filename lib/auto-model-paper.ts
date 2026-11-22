import {
  defaults,
  questionType,
  type PaperItem,
  type PaperSettings,
} from "./paper-builder";
import {
  autoModelBlueprint,
  MATH_DIVISIONS,
  MATH_MCQ_QUOTAS,
  autoModelHasDiagram,
  MATH_MCQ_DISTRIBUTION,
  mathDivision,
  type AutoModelVariant,
} from "./auto-model";

export function autoModelSettings(
  category: string,
  subject: string,
  variant: AutoModelVariant,
): PaperSettings {
  const plan = autoModelBlueprint(category, subject, variant);
  if (!plan) throw Error("এই নির্বাচনের Auto Model কাঠামো প্রস্তুত নয়।");
  const s = defaults();
  s.autoModel = plan.id;
  s.defaultHeader = { enabled: true, overrides: {} };
  s.info = {
    ...s.info,
    cls: category,
    subject,
    exam: "মডেল টেস্ট — অনুশীলন",
    minutes: plan.minutes,
    marks: String(plan.totalMarks),
    instr: plan.instructions,
    section:
      variant === "MCQ" ? "নৈর্ব্যক্তিক প্রশ্ন" : "সৃজনশীল ও সংক্ষিপ্ত প্রশ্ন",
  };
  s.show.chapter = false;
  s.show.marks = true;
  s.cfg = {
    ...s.cfg,
    expectedMCQ: variant === "MCQ" ? 30 : 0,
    expectedCQ: variant === "CQ" ? 8 : 0,
    expectedSHORT: variant === "CQ" ? 15 : 0,
    cols: 3,
    cqColumns: 2,
    optCols: 2,
    fontSize: 14,
    mcqAnswer: variant === "MCQ" ? 30 : 0,
    cqAnswer: variant === "CQ" ? 5 : 0,
    shortAnswer: variant === "CQ" ? 10 : 0,
  };
  return s;
}
export function autoModelIssues(
  items: PaperItem[],
  s: PaperSettings,
): string[] {
  if (!s.autoModel) return [];
  const issues: string[] = [];
  const stems = items.map((q) =>
    (q.stimulus || q.text)
      .normalize("NFKC")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase(),
  );
  if (
    new Set(stems).size !== stems.length ||
    new Set(items.map((q) => q.id)).size !== items.length
  )
    issues.push("সম্পাদিত মডেলে একই প্রশ্ন পুনরাবৃত্তি হয়েছে।");
  if (items.some((q) => q.subject !== "গণিত" || !mathDivision(q.topic ?? "")))
    issues.push("মডেলের বাইরে বিষয়/অধ্যায়ের প্রশ্ন আছে।");
  if (s.autoModel === "ssc-math-mcq-v1") {
    if (items.length !== 30 || items.some((q) => questionType(q) !== "MCQ"))
      issues.push("নৈর্ব্যক্তিক মডেলে ঠিক ৩০টি MCQ প্রয়োজন।");
    const counts = MATH_DIVISIONS.map(d => items.filter(q => questionType(q) === "MCQ" && mathDivision(q.topic ?? "")?.id === d.id).length);
    const quota = MATH_MCQ_QUOTAS;
    if (items.filter(q => questionType(q) === "MCQ" && autoModelHasDiagram(q)).length > quota.maxDiagramQuestions)
      issues.push("নৈর্ব্যক্তিক মডেলে চিত্রযুক্ত প্রশ্ন সর্বোচ্চ ৫টি হতে পারবে।");
    if (counts[0] < quota.algebra.min || counts[0] > quota.algebra.max ||
        counts[1] < quota.geometry.min || counts[1] > quota.geometry.max ||
        counts[2] + counts[3] !== quota.combined)
      issues.push(`MCQ মানবণ্টন মিলছে না: ${MATH_MCQ_DISTRIBUTION} প্রয়োজন।`);
  } else {
    if (
      items.some(
        (q) =>
          questionType(q) === "CQ" &&
          (!q.subQuestions ||
            ![q.subQuestions.k, q.subQuestions.kh, q.subQuestions.g].every(
              (v) => v?.trim(),
            ) ||
            q.subQuestions.gh?.trim()),
      )
    )
      issues.push("গণিতের সৃজনশীল প্রশ্নে ক/খ/গ — ৩টি উপপ্রশ্ন প্রয়োজন।");
    for (const d of MATH_DIVISIONS)
      if (
        items.filter(
          (q) =>
            questionType(q) === "CQ" &&
            mathDivision(q.topic ?? "")?.id === d.id,
        ).length !== 2
      )
        issues.push(`${d.title} — ২টি সৃজনশীল প্রশ্ন প্রয়োজন।`);
    if (
      items.filter((q) => questionType(q) === "SHORT").length !== 15 ||
      items.length !== 23
    )
      issues.push("লিখিত মডেলে ৮টি সৃজনশীল ও ১৫টি সংক্ষিপ্ত প্রশ্ন প্রয়োজন।");
  }
  return issues;
}
/** The same section model can be consumed by the editor, snapshots and isolated print tests. */
export function autoModelSections(items: PaperItem[], s: PaperSettings) {
  if (!s.autoModel) return null;
  const views = (qs: PaperItem[]) =>
    qs.map((q) => {
      const opts = Object.entries(q.options ?? {}).filter(
        (v): v is [string, string] => typeof v[1] === "string",
      );
      return { q, opts, ci: opts.findIndex(([k]) => k === q.correct) };
    });
  const warning = autoModelIssues(items, s).length
    ? "সম্পাদিত খসড়া — মডেলের নির্ধারিত কাঠামো অসম্পূর্ণ। "
    : "";
  function withExtras(
    parts: {
      type: string;
      title: string;
      instruction: string;
      startNumber: number;
      questions: ReturnType<typeof views>;
    }[],
  ) {
    const included = new Set(
      parts.flatMap((p) => p.questions.map((v) => v.q.id)),
    );
    const extras = items.filter((q) => !included.has(q.id));
    for (const type of [...new Set(extras.map(questionType))])
      parts.push({
        type,
        title: "অতিরিক্ত প্রশ্ন — মডেল কাঠামোর বাইরে",
        instruction:
          "সম্পাদিত খসড়া: নিচের প্রশ্নগুলো নির্ধারিত মডেল কাঠামোর অংশ নয়।",
        startNumber: 0,
        questions: views(extras.filter((q) => questionType(q) === type)),
      });
    return parts;
  }
  if (s.autoModel === "ssc-math-mcq-v1")
    return withExtras([
      {
        type: "MCQ",
        title: "নৈর্ব্যক্তিক প্রশ্ন — ৩০",
        instruction:
          warning + "সকল প্রশ্নের উত্তর দাও। প্রতিটি প্রশ্নের মান ১।",
        startNumber: 0,
        questions: views(items.filter((q) => questionType(q) === "MCQ")),
      },
    ]);
  const parts = MATH_DIVISIONS.map((d, i) => ({
    type: "CQ",
    title: (i === 0 ? "সৃজনশীল — ৫০\n" : "") + d.title,
    instruction:
      i === 0
        ? warning +
          "প্রতিটি বিভাগ থেকে ন্যূনতম ১টি করে মোট ৫টি প্রশ্নের উত্তর দাও।"
        : "",
    startNumber: i * 2,
    questions: views(
      items.filter(
        (q) =>
          questionType(q) === "CQ" && mathDivision(q.topic ?? "")?.id === d.id,
      ),
    ),
  }));
  parts.push({
    type: "SHORT",
    title: "সংক্ষিপ্ত উত্তর প্রশ্ন — ২০",
    instruction: "যেকোনো ১০টি প্রশ্নের উত্তর দাও। প্রতিটি প্রশ্নের মান ২।",
    startNumber: 0,
    questions: views(items.filter((q) => questionType(q) === "SHORT")),
  });
  return withExtras(parts);
}
