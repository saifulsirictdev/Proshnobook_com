import { listReadyPurchases } from "@/app/actions/ready-commerce";
import { marketRasterSchema } from "@/lib/marketplace-raster";
import { marketExamLabel } from "@/lib/marketplace-exam-types";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { listPapers } from "@/app/actions/qb-papers";
import { MARKET_PREFIX, type MarketSubmission } from "@/lib/marketplace";
import {
  MarketplaceSubmission,
  MarketplaceReview,
} from "@/components/marketplace-submission";
import { formatMoney } from "@/lib/wallet";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "প্রশ্নপত্র বিক্রির আবেদন",
  robots: { index: false },
};
export default async function SellPage() {
  const user = (await auth())?.user;
  if (!user?.id) redirect("/login?next=/dashboard/sell");
  const fresh = await db.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  const admin = fresh?.role === "ADMIN";
  const [papers, readyPapers, draftRows] = await Promise.all([
    listPapers(),
    listReadyPurchases(),
    db.setting.findMany({
      where: { key: { startsWith: `marketready:v1:${user.id}:` } },
      take: 100,
    }),
  ]);
  const readyDrafts = draftRows.flatMap((row) => {
    try {
      const d = JSON.parse(row.value);
      if (
        d.ownerId !== user.id ||
        !Number.isInteger(d.count) ||
        d.count < 1 ||
        d.count > 10
      )
        return [];
      const check = marketRasterSchema.safeParse({
        kind: "READY_RASTER",
        pages: Array.from({ length: d.count }, (_, i) => d.pages[i]),
      });
      return check.success
        ? [{ key: row.key, name: `PDF / রেডি: ${d.title}` }]
        : [];
    } catch {
      return [];
    }
  });
  const sources = [
    ...papers.map((p) => ({ key: p.key, name: p.name })),
    ...readyDrafts,
  ];
  const rows = await db.setting.findMany({
    where: {
      key: { startsWith: MARKET_PREFIX },
      value: { contains: JSON.stringify(user.id) },
    },
    take: 200,
    orderBy: { key: "asc" },
  });
  const submissions = rows.flatMap((row) => {
    try {
      const r = JSON.parse(row.value) as MarketSubmission;
      return r.ownerId === user.id ? [r] : [];
    } catch {
      return [];
    }
  });
  const labels = {
    PENDING: "অনুমোদনের অপেক্ষায়",
    APPROVED: "অনুমোদিত — মার্কেটপ্লেসে প্রকাশিত",
    CHANGES: "সংশোধন প্রয়োজন",
    REJECTED: "বাতিল",
    UNPUBLISHED: "প্রকাশ বন্ধ",
    DELETED: "ক্যাটালগ থেকে সরানো হয়েছে",
  };
  return (
    <main className="mx-auto max-w-3xl p-5 space-y-5">
      <Link href="/dashboard">← ড্যাশবোর্ড</Link>
      <h1 className="text-2xl font-bold">প্রশ্নপত্র বিক্রির আবেদন</h1>
      <MarketplaceSubmission admin={admin} papers={sources} />
      <details
        id="sell-instructions"
        className="rounded-2xl border border-indigo-100 bg-white p-4"
      >
        <summary className="cursor-pointer text-lg font-bold text-indigo-900">
          নির্দেশনা দেখুন
        </summary>
        <div className="mt-4 space-y-4">
          <p className="rounded bg-amber-50 p-4">
            নিজের সংরক্ষিত ডাটাবেজের প্রশ্নপত্র এবং নিজের আপলোড করা PDF বা Ready
            Library থেকে সাজানো প্রশ্নপত্র বিক্রির আবেদন করতে পারবেন। PDF কপির
            ক্ষেত্রে আগে সেভ করে Print Preview থেকে “Marketplace-এ বিক্রির কপি
            প্রস্তুত করুন” চাপুন। শুধু জমা দেওয়া পৃষ্ঠার স্থির ছবিভিত্তিক কপি যাবে, মূল PDF
            নয়। বিক্রির অধিকার থাকা আবশ্যক; কেনা/সম্পাদনা করলেই সেই অধিকার হয় না।
            ADMIN-এর নিজের কপি সরাসরি প্রকাশিত হবে; শিক্ষকের কপি ADMIN অনুমোদনের
            পরে। আবেদন জমায় নতুন টাকা কাটবে না।
          </p>
          <section className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 space-y-3">
            <h2 className="text-lg font-bold">
              PDF / Ready Library থেকে তৈরি কপি
            </h2>
            <p>
              সেভ করা কপি খুলে প্রশ্নপত্র সেভ করুন, তারপর Print Preview থেকে বিক্রির
              স্থির কপি প্রস্তুত করুন। প্রস্তুত হলে উপরের ফর্মে নির্বাচন করতে পারবেন।
            </p>
            {readyPapers.slice(0, 50).map((p) => (
              <Link
                key={p.id}
                className="block underline"
                href={`/ready-papers/${p.paperId}?saved=${p.id}`}
              >
                {p.title} — খুলুন ও বিক্রির কপি প্রস্তুত করুন →
              </Link>
            ))}
            <Link className="block underline" href="/ready-papers/saved">
              সব সেভ করা PDF / রেডি কপি →
            </Link>
          </section>
        </div>
      </details>
      <h2 className="text-xl font-bold">আমার আবেদন</h2>
      {submissions.map((r) => (
        <section key={r.id} className="rounded-xl border p-4">
          <h3 className="font-bold">{r.metadata.title}</h3>
          <p>পরীক্ষার ধরন: {marketExamLabel(r.metadata.examType)}</p>
          <p>
            {labels[r.status]} · {formatMoney(r.metadata.pricePaisa)} · সংস্করণ{" "}
            {r.revision}
          </p>
          <Link
            className="block my-2 underline"
            href={`/dashboard/sell/${r.id}`}
          >
            জমা দেওয়া স্থির প্রশ্নপত্র দেখুন →
          </Link>
          {admin && r.status === "PENDING" && (
            <MarketplaceReview id={r.id} revision={r.revision} ownAdmin />
          )}
          {r.review && <p>অ্যাডমিনের নোট: {r.review.note || "—"}</p>}
        </section>
      ))}
      {!submissions.length && <p>এখনও কোনো আবেদন নেই।</p>}
    </main>
  );
}
