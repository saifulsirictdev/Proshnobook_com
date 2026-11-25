import { requirePaidQuestions } from "@/lib/wallet";
import { auth } from "@/auth";
import { visibleQuestions } from "@/lib/paper-generation";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  isChemistrySubject,
  cleanChemistryText,
  cleanChemistryOptionsValue,
  cleanChemistrySubQuestions,
} from "@/lib/chemistry-text-clean";

export const dynamic = "force-dynamic";

type AnyObj = Record<string, any>;

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function asObj(v: unknown): AnyObj {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as AnyObj) : {};
}

// প্রশ্নের ধরন বের করা (create/page.tsx-এর নিয়মের সাথে মিলিয়ে)
function detectType(
  text: string,
  options: AnyObj,
  correct: string,
): "MCQ" | "CQ" | "SHORT" {
  if (correct && correct.trim()) return "MCQ";
  const hasCq =
    !!options.stimulus ||
    !!options.k ||
    !!options["ক"] ||
    !!options.subQuestions ||
    text.includes("(ক)");
  if (hasCq) return "CQ";
  return "SHORT";
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const ids: string[] = Array.isArray(body.ids)
    ? [
        ...new Set<string>(
          body.ids.filter((x: unknown) => typeof x === "string"),
        ),
      ]
    : [];
  if (ids.length > 300)
    return NextResponse.json(
      { error: "একবারে সর্বোচ্চ ৩০০টি প্রশ্ন নির্বাচন করুন।" },
      { status: 400 },
    );
  if (!ids.length) return NextResponse.json({ items: [] });

  const user = (await auth())?.user;
  if (!user?.id || user.role === "STUDENT")
    return NextResponse.json({ error: "লগইন করুন।" }, { status: 401 });
  try {
    await requirePaidQuestions(user.id, ids);
  } catch {
    return NextResponse.json(
      { error: "সেটআপ খুলতে আগে নির্বাচিত প্রশ্নের checkout সম্পন্ন করুন।" },
      { status: 402 },
    );
  }
  const rows = await db.question.findMany({
    where: { id: { in: ids }, ...visibleQuestions(user?.id) },
  });
  const map = new Map(rows.map((r) => [r.id, r]));

  const items = ids.flatMap((id) => {
    const r = map.get(id);
    if (!r) return [];

    const options = asObj(r.options);
    // Provenance is metadata, never an MCQ choice or editable answer option.
    const { _provenance, _authoring, ...rawChoiceOptions } = options;
    const isChem = isChemistrySubject(r.subject);
    const choiceOptions = isChem
      ? cleanChemistryOptionsValue(rawChoiceOptions)
      : rawChoiceOptions;
    const correct = r.correct ?? "";
    const rawText = r.text ?? "";
    const cleanedText = isChem ? cleanChemistryText(rawText) : rawText;
    const cleanedExplanation =
      isChem && r.explanation
        ? cleanChemistryText(r.explanation)
        : r.explanation;
    const type = detectType(cleanedText, choiceOptions, correct);

    const base = {
      id: r.id,
      text: cleanedText,
      options: choiceOptions as Record<string, string>,
      ...(_provenance ? { provenance: _provenance } : {}),
      correct: r.correct,
      explanation: cleanedExplanation,
      category: r.category,
      subject: r.subject,
      topic: r.topic,
      source: r.source.startsWith("AI_PENDING:")
        ? r.approved
          ? "AI"
          : "AI — অনুমোদনের অপেক্ষায়"
        : r.source,
      type,
    };

    if (type === "CQ") {
      let k = "";
      let kh = "";
      let g = "";
      let gh = "";
      if (Array.isArray(choiceOptions.subQuestions)) {
        const arr = choiceOptions.subQuestions;
        const pick = (idx: number) => {
          const v = arr[idx];
          if (typeof v === "string") return v;
          if (v && typeof v === "object")
            return str((v as AnyObj).question || (v as AnyObj).text);
          return "";
        };
        k = pick(0);
        kh = pick(1);
        g = pick(2);
        gh = pick(3);
      } else {
        const sub = choiceOptions.subQuestions
          ? asObj(choiceOptions.subQuestions)
          : choiceOptions;
        k = str(sub.k) || str(sub["ক"]);
        kh = str(sub.kh) || str(sub["খ"]);
        g = str(sub.g) || str(sub["গ"]);
        gh = str(sub.gh) || str(sub["ঘ"]);
      }
      const stimulus =
        str(choiceOptions.stimulus) ||
        str(choiceOptions["উদ্দীপক"]) ||
        cleanedText;
      const hasSub = !!(k || kh || g || gh);
      const rawAnswers = asObj(choiceOptions.ans ?? choiceOptions.answers);
      const answers = isChem
        ? (cleanChemistrySubQuestions(rawAnswers) as AnyObj)
        : rawAnswers;

      return [
        {
          ...base,
          stimulus,
          subQuestions: hasSub ? { k, kh, g, gh } : undefined,
          answers,
        },
      ];
    }

    return [base];
  });

  return NextResponse.json({ items });
}

// ===== ফাইল শেষ =====
