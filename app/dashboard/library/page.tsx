import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PURCHASE_PREFIX, validatePurchase } from "@/lib/marketplace-purchase";
import { formatMoney } from "@/lib/wallet";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "আমার সংগ্রহ করা প্রশ্নপত্র",
  robots: { index: false },
};
export default async function Library({
  searchParams,
}: {
  searchParams: Promise<{ after?: string }>;
}) {
  const id = (await auth())?.user?.id;
  if (!id) redirect("/login?next=/dashboard/library");
  const after = (await searchParams).after,
    prefix = PURCHASE_PREFIX + id + ":";
  const rows = await db.setting.findMany({
    where: {
      key: {
        startsWith: prefix,
        ...(after && /^[a-f0-9]{64}$/.test(after)
          ? { gt: prefix + after }
          : {}),
      },
    },
    orderBy: { key: "asc" },
    take: 51,
  });
  return (
    <main className="max-w-3xl mx-auto p-5 space-y-4">
      <Link href="/dashboard">← প্রোফাইল</Link>
      <h1 className="text-2xl font-bold">আমার সংগ্রহ করা প্রশ্নপত্র</h1>
      <p>
        কেনা ও বিনামূল্যে সংগ্রহ করা কপি এখানে পাবেন। আবার খোলা বা প্রিন্টে নতুন চার্জ
        নেই।
      </p>
      {rows.slice(0, 50).map((row) => {
        const paperId = row.key.slice(prefix.length);
        try {
          const r = validatePurchase(row.value, id, paperId, true);
          return (
            <article className="border rounded p-4" key={row.key}>
              {r.refundedAt ? (
                <p>{r.title} — রিফান্ড হয়েছে; অনলাইন কপি বন্ধ</p>
              ) : (
                <Link
                  className="qm-action-link"
                  href={`/dashboard/library/${paperId}/setup`}
                >
                  {r.title} →
                </Link>
              )}
              <Link
                className="block qm-action-link"
                href={`/dashboard/library/${paperId}/report`}
              >
                অভিযোগ / নিষ্পত্তির অবস্থা →
              </Link>
              <p>
                {r.amount === 0 ? "ফ্রি" : formatMoney(r.amount)} ·{" "}
                {r.purchasedAt}
              </p>
            </article>
          );
        } catch {
          return <p key={row.key}>একটি কপি যাচাই হয়নি। সহায়তায় যোগাযোগ করুন।</p>;
        }
      })}
      {!rows.length && <p>এখনও কোনো মার্কেটপ্লেস প্রশ্নপত্র কেনেননি।</p>}
      {rows.length > 50 && (
        <Link href={`?after=${rows[49].key.slice(prefix.length)}`}>
          পরের পৃষ্ঠা →
        </Link>
      )}
    </main>
  );
}
