import PaperSocialControls from "@/components/paper-social-controls";
import { paperSocialSummary } from "@/lib/paper-social";
import "@/components/question-feed.css";
import { rasterSnapshot } from "@/lib/marketplace-raster";
import MarketplaceRasterPreview from "@/components/marketplace-raster-preview";
import Link from "next/link";
import { publicFullPreview } from "@/lib/marketplace-full-preview";
import MarketplaceFullPreview from "@/components/marketplace-full-preview";
import { auth } from "@/auth";
import {
  purchaseKey,
  validatePurchase,
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
      })
    : null;
  let purchased = null;
  try {
    if (owned && user?.id)
      purchased = validatePurchase(owned.value, user.id, id);
  } catch {}
  let readyRaster = null;
  let terms: string | null = null;
  let platformSale = false;
  try {
    const record = saleRecord(row!.value, id);
    readyRaster = rasterSnapshot(record.snapshot);
    const seller = await db.user.findUnique({
      where: { id: record.ownerId },
      select: { role: true },
    });
    platformSale = seller?.role === "ADMIN";
    if (seller && record.ownerId !== user?.id)
      terms = purchaseTerms(record, platformSale ? "PLATFORM" : undefined);
  } catch {}
  const social = await paperSocialSummary(id, user?.id);
  return (
    <main className="qm-feature-page mx-auto max-w-3xl p-5 space-y-4">
      <Link href="/marketplace">← মার্কেটপ্লেস</Link>
      <p className="text-indigo-700">{paper.metadata.examType}</p>
      <h1 className="text-3xl font-bold">{paper.metadata.title}</h1>
      <p>
        শ্রেণি {Number(paper.metadata.grade).toLocaleString("bn-BD")} ·{" "}
        {paper.metadata.subject}
      </p>
      <p>{paper.metadata.chapters.join(" · ")}</p>
      {readyRaster && (
        <p className="rounded-xl bg-indigo-50 p-4 text-sm text-indigo-950">
          PDF থেকে তৈরি স্থির ছবিভিত্তিক প্রশ্নপত্র। মূল PDF বা তার অন্য পৃষ্ঠা নয়। কেনার
          পরে আকার ঠিক করা ও অতিরিক্ত লেখা যোগ করা যাবে; ছবির ভেতরের লেখা আলাদা
          প্রশ্নের মতো বদলানো যায় না।
        </p>
      )}
      <p className="whitespace-pre-wrap break-words">
        {paper.metadata.description}
      </p>
      <p className="text-2xl font-bold">
        {paper.metadata.pricePaisa === 0
          ? "ফ্রি"
          : formatMoney(paper.metadata.pricePaisa)}
      </p>
      <Link href={`/teachers/${paper.sellerTid}`} className="block qm-action-link">
        বিক্রেতার প্রোফাইল · {paper.sellerTid}
      </Link>
      {readyRaster ? (
        <MarketplaceRasterPreview raster={readyRaster} branded />
      ) : (
        <MarketplaceFullPreview model={publicFullPreview(row!.value, id)} />
      )}
      {purchased ? (
        <MarketplaceBuy
          id={id}
          ownedAmount={purchased.amount}
          terms={terms ?? ""}
          price={formatMoney(purchased.amount)}
          platformSale={platformSale}
          rasterSale={!!readyRaster}
        />
      ) : owned ? (
        <Link href="/dashboard/library" className="block qm-action-link">
          ক্রয়ের অবস্থা / রিফান্ড দেখুন →
        </Link>
      ) : !user?.id ? (
        <Link
          className="block qm-action-link"
          href={`/login?next=/marketplace/${id}`}
        >
          {paper.metadata.pricePaisa === 0
            ? "বিনামূল্যে সংগ্রহ করতে লগইন করুন →"
            : "কিনতে লগইন করুন →"}
        </Link>
      ) : terms ? (
        <MarketplaceBuy
          platformSale={platformSale}
          rasterSale={!!readyRaster}
          id={id}
          terms={terms}
          free={paper.metadata.pricePaisa === 0}
          price={
            paper.metadata.pricePaisa === 0
              ? "ফ্রি"
              : formatMoney(paper.metadata.pricePaisa)
          }
        />
      ) : (
        <p>নিজের প্রশ্নপত্র অথবা বর্তমানে checkout অনুপলব্ধ।</p>
      )}
      <PaperSocialControls paperId={id} summary={social} />
    </main>
  );
}
