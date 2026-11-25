import { auth } from "@/auth";
import {
  requirePaidQuestions,
  walletTransaction,
  quoteInTransaction,
} from "@/lib/wallet";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { POST as loadQuestions } from "../questions/route";
import { z } from "zod";

function isChemistry(subject?: string | null) {
  return typeof subject === "string" && subject.normalize("NFC").replace(/য়/g, "য়").trim() === "রসায়ন";
}

function scenarioSig(item: { text?: string; options?: unknown }) {
  const o = item.options && typeof item.options === "object" && !Array.isArray(item.options)
    ? (item.options as Record<string, any>)
    : null;
  if (o?._authoring?.family && typeof o._authoring.family === "string") return `family:${o._authoring.family}`;
  return String(o?.stimulus || item.text || "")
    .normalize("NFC")
    .replace(/!\[[^\]]*\]\(([^)]*)\)/g, (_, url) => `[IMG:${String(url).split("/").pop()?.replace(/[0-9]+/g, "#") || "img"}]`)
    .replace(/[0-9০-৯₀-₉⁰-⁹]+(?:\.[0-9০-৯]+)?/g, "#")
    .replace(/\b[A-Z][A-Za-z0-9₀-₉⁰-⁹⁺⁻()]*\b/g, "SYM")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 96);
}

function interleaveScenarios<T extends { text?: string; options?: unknown }>(items: T[]): T[] {
  if (items.length <= 2) return items;
  const buckets = new Map<string, T[]>();
  for (const item of items) {
    const k = scenarioSig(item) || `__u_${buckets.size}`;
    buckets.set(k, [...(buckets.get(k) ?? []), item]);
  }
  if (buckets.size <= 1 || buckets.size === items.length) return items;
  const queues = [...buckets.values()];
  const out: T[] = [];
  for (let i = 0; out.length < items.length; i++) {
    for (const q of queues) if (i < q.length) out.push(q[i]);
  }
  return out;
}
const requestSchema = z.object({
  id: z.string().min(1).max(200),
  exclude: z.array(z.string().max(200)).max(300),
});
function type(q: { correct: string; text: string; options: unknown }) {
  const o = (q.options || {}) as Record<string, unknown>;
  return q.correct?.trim()
    ? "MCQ"
    : o.stimulus || o.k || o.ক || o.subQuestions || q.text.includes("(ক)")
      ? "CQ"
      : "SHORT";
}
export async function POST(req: Request) {
  const parsed = requestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "অবৈধ অনুরোধ।" }, { status: 400 });
  const user = (await auth())?.user;
  if (!user?.id || user.role === "STUDENT")
    return NextResponse.json({ error: "লগইন করুন।" }, { status: 401 });
  try {
    await requirePaidQuestions(user.id, [parsed.data.id]);
  } catch {
    return NextResponse.json(
      { error: "মূল প্রশ্নের প্রবেশাধিকার যাচাই হয়নি।" },
      { status: 402 },
    );
  }
  try {
    const original = await db.question.findFirst({
      where: { id: parsed.data.id, approved: true },
    });
    if (!original)
      return NextResponse.json(
        { error: "মূল প্রশ্নটি পাওয়া যায়নি।" },
        { status: 404 },
      );
    const candidates = await db.question.findMany({
      where: {
        approved: true,
        category: original.category,
        subject: original.subject,
        topic: original.topic,
        id: { notIn: [...parsed.data.exclude, original.id] },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    const sameKind = candidates.filter((q) => type(q) === type(original));
    const orderedCandidates = isChemistry(original.subject)
      ? (() => {
          const origSig = scenarioSig(original);
          const diffFam = sameKind.filter((q) => scenarioSig(q) !== origSig);
          const sameFam = sameKind.filter((q) => scenarioSig(q) === origSig);
          return [...interleaveScenarios(diffFam), ...sameFam];
        })()
      : sameKind;
    const related = orderedCandidates.slice(0, 8);
    if (!related.length)
      return NextResponse.json(
        { error: "এই অধ্যায়ে একই ধরনের বিকল্প প্রশ্ন পাওয়া যায়নি।" },
        { status: 404 },
      );
    // Never return full text for unpaid alternatives. Quote in one transaction,
    // then use the existing authenticated/paid loader for the accessible subset.
    const quote = await walletTransaction((tx) =>
      quoteInTransaction(
        tx,
        user.id!,
        related.map((q) => q.id),
      ),
    );
    const locked = new Set(
      quote.total === 0 ? [] : quote.unpaid.map((q) => q.id),
    );
    const ids = related.filter((q) => !locked.has(q.id)).map((q) => q.id);
    let items: { id: string }[] = [];
    if (ids.length) {
      const loaded = await loadQuestions(
        new Request(req.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        }),
      );
      if (!loaded.ok) return loaded;
      items = (await loaded.json()).items || [];
    }
    const byId = new Map(items.map((q) => [q.id, q]));
    return NextResponse.json({
      alternatives: related.map((q, i) => ({
        id: q.id,
        label: `বিকল্প ${i + 1}`,
        subject: q.subject,
        topic: q.topic,
        type: type(q),
        locked: locked.has(q.id),
        ...(byId.has(q.id) ? { item: byId.get(q.id) } : {}),
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "প্রশ্ন বদলানো যায়নি। আবার চেষ্টা করুন।" },
      { status: 500 },
    );
  }
}
