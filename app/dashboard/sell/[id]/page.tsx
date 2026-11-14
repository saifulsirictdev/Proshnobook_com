import { assertRenderableMarketSnapshot } from "@/lib/marketplace-preview";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  MARKET_PREFIX,
  snapshotHash,
  type MarketSubmission,
} from "@/lib/marketplace";
import { marketExamLabel } from "@/lib/marketplace-exam-types";
import MarketplacePaperPreview from "@/components/marketplace-paper-preview";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "জমা দেওয়া প্রশ্নপত্রের ব্যক্তিগত প্রিভিউ",
  robots: { index: false, follow: false },
};
export default async function SubmittedPreview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[a-f0-9]{64}$/.test(id)) notFound();
  const session = (await auth())?.user;
  if (!session?.id) redirect(`/login?next=/dashboard/sell/${id}`);
  const user = await db.user.findUnique({
    where: { id: session.id },
    select: { id: true, role: true },
  });
  if (!user) notFound();
  const row = await db.setting.findUnique({
    where: { key: MARKET_PREFIX + id },
  });
  let record: MarketSubmission;
  try {
    record = JSON.parse(row?.value || "null");
  } catch {
    notFound();
  }
  if (
    !record ||
    record.id !== id ||
    record.version !== 1 ||
    (record.ownerId !== user.id && user.role !== "ADMIN")
  )
    notFound();
  let valid = false;
  try {
    if (snapshotHash(record.snapshot) !== record.snapshotHash)
      throw Error("Invalid hash");
    assertRenderableMarketSnapshot(record.snapshot);
    valid = true;
  } catch {
    valid = false;
  }
  return (
    <main className="mx-auto max-w-6xl p-4 space-y-4">
      <Link
        href={user.role === "ADMIN" ? "/admin/marketplace" : "/dashboard/sell"}
      >
        ← আবেদনের তালিকা
      </Link>
      <h1 className="text-2xl font-bold">{record.metadata.title}</h1>
      <p>
        {marketExamLabel(record.metadata.examType)} · সংস্করণ {record.revision} ·{" "}
        {record.status}
      </p>
      {valid ? (
        <MarketplacePaperPreview snapshot={record.snapshot} />
      ) : (
        <p role="alert" className="rounded bg-red-50 p-4">
          স্থির কপির অখণ্ডতা বা সেটিংস যাচাই হয়নি। এই কপি অনুমোদন করবেন না;
          সংশোধনের অনুরোধ করুন।
        </p>
      )}
      <details>
        <summary>স্থির কপির প্রযুক্তিগত তথ্য</summary>
        <pre className="overflow-auto max-h-96 whitespace-pre-wrap break-words text-xs">
          {JSON.stringify(record.snapshot, null, 2)}
        </pre>
      </details>
    </main>
  );
}
