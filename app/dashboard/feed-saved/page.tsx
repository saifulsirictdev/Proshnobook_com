import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { socialUserHash, requirePublicPaper } from "@/lib/paper-social";
import { formatMoney } from "@/lib/wallet";
export const dynamic = "force-dynamic";
export default async function FeedSaved({
  searchParams,
}: {
  searchParams: Promise<{ after?: string }>;
}) {
  const id = (await auth())?.user?.id;
  if (
    !id ||
    !(await db.user.findUnique({ where: { id }, select: { id: true } }))
  )
    redirect("/login?next=/dashboard/feed-saved");
  const { after } = await searchParams;
  const prefix = "social:save:v1:",
    suffix = ":" + socialUserHash(id),
    cursor =
      after && /^[a-f0-9]{64}$/.test(after)
        ? prefix + after + suffix
        : undefined;
  const rows = await db.setting.findMany({
    where: {
      key: {
        startsWith: prefix,
        endsWith: suffix,
        ...(cursor ? { gt: cursor } : {}),
      },
    },
    orderBy: { key: "asc" },
    take: 31,
  });
  const papers = await Promise.all(
    rows.slice(0, 30).map(async (row) => {
      try {
        const id = row.key.slice(prefix.length, -suffix.length);
        const p = await requirePublicPaper(id);
        return { id, title: p.metadata.title, price: p.metadata.pricePaisa };
      } catch {
        return null;
      }
    }),
  );
  return (
    <main className="mx-auto max-w-3xl p-5 space-y-5">
      <Link href="/dashboard">← Dashboard</Link>
      <h1 className="text-2xl font-bold">ফিডের বুকমার্ক</h1>
      <p>
        এগুলো প্রশ্নপত্রের লিংক, কেনা বা সম্পাদিত সেভ করা কপি নয়। প্রকাশ বন্ধ হলে আর
        দেখাবে না।
      </p>
      {!papers.some(Boolean) && <p>এই পাতায় প্রকাশিত বুকমার্ক নেই।</p>}
      {papers.map((p, i) =>
        p ? (
          <article className="rounded-xl border bg-white p-4" key={p.id}>
            <Link href={`/marketplace/${p.id}`}>{p.title} →</Link>
            <p>{formatMoney(p.price)}</p>
          </article>
        ) : (
          <p key={i}>এই বুকমার্কের প্রশ্নপত্র এখন প্রকাশিত নেই।</p>
        ),
      )}
      {rows.length > 30 && (
        <Link
          href={`/dashboard/feed-saved?${new URLSearchParams({ after: rows[29].key.slice(prefix.length, -suffix.length) })}`}
        >
          আরও বুকমার্ক →
        </Link>
      )}
    </main>
  );
}
