import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { purchaseKey, validatePurchase } from "@/lib/marketplace-purchase";
import QbBuilder from "@/components/qb-builder";
import {
  marketSnapshotItems,
  marketPreviewModel,
} from "@/lib/marketplace-preview";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "কেনা প্রশ্নপত্র সেটআপ ও সম্পাদনা",
  robots: { index: false, follow: false },
};
export default async function PurchasedPaper({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[a-f0-9]{64}$/.test(id)) notFound();
  const buyerId = (await auth())?.user?.id;
  if (!buyerId) redirect(`/login?next=/dashboard/library/${id}`);
  if (
    !(await db.user.findUnique({
      where: { id: buyerId },
      select: { id: true },
    }))
  )
    notFound();
  const row = await db.setting.findUnique({
    where: { key: purchaseKey(buyerId, id) },
  });
  if (!row) notFound();
  let r;
  try {
    r = validatePurchase(row.value, buyerId, id);
  } catch {
    notFound();
  }
  const settings = marketPreviewModel(r.snapshot).settings;
  if (r.institution) {
    settings.info.inst = r.institution;
    settings.header.fields.institute.value = r.institution;
  }
  return (
    <main className="max-w-6xl mx-auto p-4 space-y-4">
      <div data-noprint className="space-y-3">
        <Link href="/dashboard/library">← কেনা প্রশ্নপত্র</Link>
        <Link
          className="block underline"
          href={`/dashboard/library/${id}/report`}
        >
          সমস্যা জানান / অভিযোগের অবস্থা →
        </Link>
        <h1 className="text-2xl font-bold">{r.title}</h1>
        <p>
          কেনা কপির নিজস্ব সম্পাদনা: প্রশ্ন, হেডার, ফন্ট ও পৃষ্ঠা সাজিয়ে Preview/Print
          করুন। আবার চার্জ হবে না। মূল ক্রয়রসিদ বা বিক্রেতার কপি বদলাবে না।
        </p>
        <p>
          পরিবর্তন শুধু এই খোলা editor-এ থাকে; পেজ রিফ্রেশ/বন্ধ করলে হারাবে। প্রয়োজন
          হলে Print থেকে PDF রাখুন। এই সম্পাদনা দিয়ে পুনর্বিক্রির অধিকার দেওয়া হচ্ছে
          না।
        </p>
      </div>
      <QbBuilder
        purchased={{ id, settings, items: marketSnapshotItems(r.snapshot) }}
      />
    </main>
  );
}
