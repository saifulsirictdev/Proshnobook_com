import AdminAIGenerator from "@/components/admin-ai-generator";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  Banknote,
  ReceiptText,
  ShieldAlert,
  SlidersHorizontal,
  BarChart3,
  LifeBuoy,
  FileLock2,
  Settings,
  Wallet,
  ClipboardCheck,
} from "lucide-react";

const managementSections = [
  {
    href: "/admin/wallet",
    label: "রিচার্জ যাচাই ও অনুমোদন",
    description: "TID, জমার তথ্য ও TrxID যাচাই করে রিচার্জ অনুমোদন বা বাতিল করুন",
    Icon: Wallet,
    color: "text-green-600",
  },
  {
    href: "/admin/marketplace",
    label: "শিক্ষকের প্রশ্নপত্র অনুমোদন",
    description:
      "বিক্রির জন্য জমা দেওয়া প্রশ্নপত্রের প্রিভিউ ও তথ্য যাচাই করে সিদ্ধান্ত দিন",
    Icon: ClipboardCheck,
    color: "text-blue-600",
  },
  {
    href: "/admin/withdrawals",
    label: "বিক্রির আয় উত্তোলন অনুরোধ নিষ্পত্তি",
    description: "উত্তোলনের অনুরোধ যাচাই ও নিষ্পত্তি করুন",
    Icon: Banknote,
    color: "text-green-600",
  },
  {
    href: "/admin/marketplace-revenue",
    label: "মার্কেটপ্লেস বিক্রির আর্থিক রসিদ",
    description: "বিক্রির রসিদ ও আয়ের হিসাব দেখুন",
    Icon: ReceiptText,
    color: "text-blue-600",
  },
  {
    href: "/admin/marketplace-disputes",
    label: "মার্কেটপ্লেস অভিযোগ / রিফান্ড",
    description: "ক্রেতার অভিযোগ ও রিফান্ড পর্যালোচনা করুন",
    Icon: ShieldAlert,
    color: "text-orange-600",
  },
  {
    href: "/admin/wallet-limits",
    label: "Send Money ও উত্তোলনের সীমা নিয়ন্ত্রণ",
    description: "লেনদেন ও উত্তোলনের সীমা পরিচালনা করুন",
    Icon: SlidersHorizontal,
    color: "text-violet-600",
  },
  {
    href: "/admin/financial-report",
    label: "তারিখভিত্তিক / সর্বমোট আর্থিক রিপোর্ট",
    description: "সময় অনুযায়ী আর্থিক রিপোর্ট দেখুন",
    Icon: BarChart3,
    color: "text-blue-600",
  },
  {
    href: "/admin/support",
    label: "সহায়তা / গোপনীয়তা / কপিরাইট অনুরোধ",
    description: "সহায়তা ও অধিকার সংক্রান্ত অনুরোধ দেখুন",
    Icon: LifeBuoy,
    color: "text-teal-600",
  },
  {
    href: "/admin/pdf-storage",
    label: "PDF storage প্রস্তুতি ও পরীক্ষা",
    description: "সুরক্ষিত PDF storage-এর প্রস্তুতি যাচাই করুন",
    Icon: FileLock2,
    color: "text-violet-600",
  },
];
const catalogShortcut = {
  href: "/admin/catalog",
  label: "হোমপেজ ক্যাটালগ নিয়ন্ত্রণ",
  description: "শ্রেণি ও বিষয় অনুযায়ী Edit, প্রকাশ বন্ধ ও ডিলিট",
  Icon: ClipboardCheck,
  color: "text-violet-600",
};
const dashboardGroups = [
  ...managementSections
    .slice(0, 2)
    .map((section) => ({ ...section, links: [section] })),
  { ...catalogShortcut, links: [catalogShortcut] },
  {
    href: "management-tools",
    label: "আর্থিক ব্যবস্থাপনা ও সহায়তা",
    Icon: Settings,
    color: "text-violet-600",
    links: managementSections.slice(2),
  },
];
export const dynamic = "force-dynamic";

export default async function Admin() {
  const pendingPayments = await db.packagePurchase.count({
    where: { status: "PENDING" },
  });

  return (
    <div className="grid gap-4">
      <h1 className="sr-only">অ্যাডমিন ড্যাশবোর্ড</h1>
      <section className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-white p-5 shadow-sm dark:border-blue-800 dark:from-slate-900 dark:to-slate-900">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-700">Question bank workspace</p>
        <h2 className="text-xl font-bold">প্রশ্নব্যাংক স্টুডিও</h2>
        <p className="mt-2 text-sm text-slate-500">হাতে MCQ/CQ/SQ লিখুন, ছবি যোগ করুন, অধ্যায়ভিত্তিক প্রশ্ন সম্পাদনা ও অনুমোদন দিন।</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin/questions/bank" className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">স্টুডিও খুলুন →</Link>
          <Link href="/admin/questions/bank/import" className="rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-700">Word / JSON review-import</Link>
        </div>
      </section>
      {dashboardGroups.map(({ href, label, Icon, color, links }) => (
        <details
          key={href}
          className="group rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 font-semibold [&::-webkit-details-marker]:hidden">
            <span className="flex min-w-0 items-center gap-2">
              <Icon
                size={18}
                className={`shrink-0 ${color}`}
                aria-hidden="true"
              />
              <span className="min-w-0 break-words">{label}</span>
            </span>
            <span className="shrink-0 text-xs font-normal text-slate-500 group-open:hidden">
              খুলুন ›
            </span>
            <span className="hidden shrink-0 text-xs font-normal text-slate-500 group-open:inline">
              বন্ধ করুন ˅
            </span>
          </summary>
          <div className="grid gap-2 border-t border-slate-200 p-3 dark:border-slate-700 sm:grid-cols-2 lg:grid-cols-3">
            {links.map(({ href, label, description, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-blue-500 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Icon size={16} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{label} →</span>
                  <span className="block text-xs text-slate-500">
                    {description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </details>
      ))}
      {/* 🔔 পেন্ডিং পেমেন্ট সতর্কতা */}
      {pendingPayments > 0 && (
        <Link
          href="/admin/package-requests"
          className="flex items-center justify-between rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 text-sm font-semibold text-amber-900"
        >
          <span>⏳ {pendingPayments} টি পেমেন্ট অনুরোধ যাচাইয়ের অপেক্ষায়</span>
          <span className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs text-white">
            দেখুন →
          </span>
        </Link>
      )}

      {/* 🎯 এআই জেনারেটর */}
      <AdminAIGenerator />
    </div>
  );
}

// ===== ফাইল শেষ =====
