import Link from "next/link";
import { publicFullPreview } from "@/lib/marketplace-full-preview";
import MarketplaceFullPreview from "@/components/marketplace-full-preview";
import { auth } from "@/auth";
import {
  purchaseKey,
  purchaseTerms,
  saleRecord,
} from "@/lib/marketplace-purchase";
import { MarketplaceBuy } from "@/components/marketplace-purchase";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MARKET_PREFIX } from "@/lib/marketplace";
import { publicMarketPaper } from "@/lib/marketplace-catalog";
import { formatMoney } from "@/lib/wallet";
export const dynamic = "force-dynamic";
export const metadata = { title: "প্রশ্নপত্রের বিবরণ" };
export default async function MarketDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[a-f0-9]{64}$/.test(id)) notFound();
  const row = await db.setting.findUnique({
    where: { key: MARKET_PREFIX + id },
  });
  const paper = row && publicMarketPaper(row.value);
  if (!paper || paper.id !== id) notFound();
  const user = (await auth())?.user;
  const owned = user?.id
    ? await db.setting.findUnique({
        where: { key: purchaseKey(user.id, id) },
        select: { key: true },
      })
    : null;
  let terms: string | null = null;
  let platformSale = false;
  try {
    const record = saleRecord(row!.value, id);
    const seller = await db.user.findUnique({
      where: { id: record.ownerId },
      select: { role: true },
    });
    platformSale = seller?.role === "ADMIN";
    if (seller && record.ownerId !== user?.id)
      terms = purchaseTerms(record, platformSale ? "PLATFORM" : undefined);
  } catch {}
  return (
    <main className="mx-auto max-w-3xl p-5 space-y-4">
      <Link href="/marketplace">← মার্কেটপ্লেস</Link>
      <p className="text-indigo-700">{paper.metadata.examType}</p>
      <h1 className="text-3xl font-bold">{paper.metadata.title}</h1>
      <p>
        শ্রেণি {Number(paper.metadata.grade).toLocaleString("bn-BD")} ·{" "}
        {paper.metadata.subject}
      </p>
      <p>{paper.metadata.chapters.join(" · ")}</p>
      <p className="whitespace-pre-wrap break-words">
        {paper.metadata.description}
      </p>
      <p className="text-2xl font-bold">
        {formatMoney(paper.metadata.pricePaisa)}
      </p>
      <Link href={`/teachers/${paper.sellerTid}`} className="block underline">
        বিক্রেতার প্রোফাইল · {paper.sellerTid}
      </Link>
      <MarketplaceFullPreview model={publicFullPreview(row!.value, id)} />
      {owned ? (
        <Link href="/dashboard/library" className="block underline">
          কেনা কপি দেখুন (রিফান্ড হলে কপি বন্ধ) →
        </Link>
      ) : !user?.id ? (
        <Link
          className="block underline"
          href={`/login?next=/marketplace/${id}`}
        >
          কিনতে লগইন করুন →
        </Link>
      ) : terms ? (
        <MarketplaceBuy
          platformSale={platformSale}
          id={id}
          terms={terms}
          price={formatMoney(paper.metadata.pricePaisa)}
        />
      ) : (
        <p>নিজের প্রশ্নপত্র অথবা বর্তমানে checkout অনুপলব্ধ।</p>
      )}
    </main>
  );
}
