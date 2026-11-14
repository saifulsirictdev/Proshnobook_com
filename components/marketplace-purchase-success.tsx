import Link from "next/link";
import {
  CheckCircle2,
  ArrowRight,
  ReceiptText,
  SlidersHorizontal,
} from "lucide-react";
export default function MarketplacePurchaseSuccess({
  id,
  amount,
  chargedNow = false,
  balanceBefore,
  balanceAfter,
}: {
  id: string;
  amount: number;
  chargedNow?: boolean;
  balanceBefore?: number;
  balanceAfter?: number;
}) {
  const money = (n: number) => `৳${(n / 100).toFixed(2)}`;
  return (
    <section
      className="overflow-hidden rounded-3xl border border-violet-100 bg-white text-slate-900 shadow-xl"
      aria-labelledby="market-purchase-success-title"
    >
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-900 p-6 text-center text-white sm:p-8">
        <CheckCircle2
          aria-hidden="true"
          className="mx-auto mb-4 h-14 w-14 rounded-full bg-white/10 p-3 text-emerald-300"
        />
        <h2 id="market-purchase-success-title" className="text-2xl font-bold">
          {chargedNow ? "প্রশ্নপত্র কেনা সফল হয়েছে!" : "আপনার কেনা প্রশ্নপত্র প্রস্তুত"}
        </h2>
        <p className="mt-2 text-sm text-indigo-100">
          পরিষ্কার কপি নিয়ে নিজের মতো সাজিয়ে নিন
        </p>
      </div>
      <div className="space-y-5 p-5 sm:p-7">
        {typeof balanceBefore === "number" && (
          <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
            <span>কেনার আগে মূল ব্যালেন্স</span>
            <strong className="text-lg text-slate-900">
              {money(balanceBefore)}
            </strong>
          </div>
        )}
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <span className="flex items-center gap-2 text-sm text-slate-600">
            <ReceiptText size={18} aria-hidden="true" />
            {chargedNow ? "ওয়ালেট থেকে কাটা হয়েছে" : "এইবার নতুন চার্জ"}
          </span>
          <strong className="text-2xl font-extrabold text-indigo-950">
            {money(chargedNow ? amount : 0)}
          </strong>
        </div>
        {typeof balanceAfter === "number" && (
          <div className="flex items-center justify-between gap-4 rounded-xl bg-emerald-50 p-4 text-emerald-900">
            <span className="text-sm">কেনার পর অবশিষ্ট ব্যালেন্স</span>
            <strong className="text-xl font-bold">{money(balanceAfter)}</strong>
          </div>
        )}
        {!chargedNow && (
          <p className="text-sm text-slate-600">
            মূল ক্রয়মূল্য {money(amount)}। এই কপি আবার খুলতে টাকা লাগবে না।
          </p>
        )}
        <p className="text-sm leading-relaxed text-slate-600">
          প্রশ্ন, প্রতিষ্ঠানের নাম, হেডার ও পৃষ্ঠা সাজিয়ে Preview ও Print করতে পারবেন।
          সম্পাদনা শেষে পেজ বন্ধ করার আগে Print থেকে PDF রাখুন।
        </p>
        <Link
          href={`/dashboard/library/${id}/setup`}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-700 to-violet-700 px-5 py-3 font-bold text-white shadow-lg shadow-violet-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-600"
        >
          <SlidersHorizontal size={18} aria-hidden="true" />
          প্রশ্ন সেটআপ করুন
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
        <Link
          href="/dashboard/library"
          className="block text-center text-sm font-semibold text-slate-600 underline underline-offset-4"
        >
          আমার কেনা প্রশ্নপত্রের লাইব্রেরি
        </Link>
      </div>
    </section>
  );
}
