"use client";
import Link from "next/link";
import MarketplacePurchaseSuccess from "@/components/marketplace-purchase-success";
import { useActionState, useEffect, useState, useRef } from "react";
import {
  type PurchaseState,
  buyMarketPaper,
  savePurchasedInstitution,
} from "@/app/actions/marketplace-purchase";
const initial: PurchaseState = { ok: false, message: "" };
export function MarketplaceBuy({
  id,
  terms,
  price,
  platformSale = false,
  rasterSale = false,
  ownedAmount,
}: {
  ownedAmount?: number;
  platformSale?: boolean;
  rasterSale?: boolean;
  id: string;
  terms: string;
  price: string;
}) {
  const [state, action, pending] = useActionState<PurchaseState, FormData>(
    buyMarketPaper,
    initial,
  );
  const [slow, setSlow] = useState(false);
  const successDialog = useRef<HTMLDialogElement>(null);
  const shown = useRef(false);
  useEffect(() => {
    if (
      state.ok &&
      state.chargedNow === true &&
      typeof state.amount === "number" &&
      !shown.current
    ) {
      shown.current = true;
      successDialog.current?.showModal();
    }
  }, [state]);
  useEffect(() => {
    setSlow(false);
    if (!pending) return;
    const timer = setTimeout(() => setSlow(true), 20000);
    return () => clearTimeout(timer);
  }, [pending]);
  if (
    (typeof ownedAmount === "number" && !state.ok) ||
    (state.ok && state.chargedNow !== true)
  )
    return (
      <Link
        href={`/dashboard/library/${id}/setup`}
        className="inline-flex rounded-xl bg-indigo-700 px-5 py-3 font-bold text-white"
      >
        প্রশ্ন সেটআপ করুন →
      </Link>
    );
  return (
    <>
      <form action={action} className="border rounded-xl p-4 space-y-3">
        <input name="paperId" value={id} type="hidden" />
        <input name="terms" value={terms} type="hidden" />
        <p>
          মূল্য {price}। ওয়ালেট থেকে একবার কাটা হবে।{" "}
          {platformSale
            ? "ADMIN-এর এই প্রশ্নপত্রের পুরো মূল্য প্ল্যাটফর্মের আয় হবে।"
            : "বিক্রেতা ৬০%, প্ল্যাটফর্ম ৪০% পাবে (পয়সার ভগ্নাংশ প্ল্যাটফর্মে)।"}{" "}
          কেনা কপি আবার খোলা/প্রিন্টে নতুন চার্জ নেই।
        </p>
        <p>
          {rasterSale
            ? "এটি PDF থেকে তৈরি ছবিভিত্তিক কপি। Setup-এ আকার ঠিক ও অতিরিক্ত লেখা যোগ করে Print/PDF করতে পারবেন; ছবির ভেতরের লেখা আলাদা প্রশ্নের মতো সম্পাদনাযোগ্য নয়।"
            : "কেনার পরে Setup-এ প্রশ্ন, হেডার ও layout সম্পাদনা করে Preview/Print করতে পারবেন।"}{" "}
          পরিবর্তন খোলা editor-এ থাকে; বন্ধ করার আগে PDF রাখুন। কেনা কপি পুনর্বিক্রি
          করা যাবে না। সমস্যায় কেনা কপির অভিযোগ ফর্ম ব্যবহার করুন; অ্যাডমিন যাচাই
          ছাড়া রিফান্ড নয়। রিফান্ড হলে অনলাইন কপি বন্ধ হবে এবং আগের ডাউনলোড/প্রিন্ট
          ব্যবহার বা বিতরণ করা যাবে না। ডিজিটাল কপির পুনর্বিতরণ প্রযুক্তিগতভাবে পুরোপুরি
          ঠেকানো সম্ভব নয়।
        </p>
        <label className="flex gap-2">
          <input type="checkbox" name="confirmed" required />
          মূল্য ও কেনার সীমাবদ্ধতা বুঝে কিনছি।
        </label>
        <button
          disabled={pending || state.ok}
          className="bg-slate-900 text-white rounded p-3"
        >
          {pending ? "অপেক্ষা করুন…" : `${price} দিয়ে কিনুন`}
        </button>
        <p role="status">
          {pending
            ? slow
              ? "যাচাইয়ে বেশি সময় লাগছে। নতুন করে টাকা পাঠাবেন না; লাইব্রেরি ও wallet history যাচাই করুন।"
              : "লেনদেন যাচাই হচ্ছে। একই বোতামে আবার চাপার প্রয়োজন নেই।"
            : state.message}
        </p>
        {state.ok && (
          <Link
            href={`/dashboard/library/${id}/setup`}
            className="block rounded-xl bg-indigo-700 px-5 py-3 text-center font-bold text-white"
          >
            প্রশ্ন সেটআপ করুন →
          </Link>
        )}
      </form>
      <dialog
        ref={successDialog}
        aria-label="প্রশ্নপত্র কেনার তথ্য"
        className="m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-3xl bg-transparent p-0 backdrop:bg-slate-950/60"
      >
        {state.ok &&
          state.chargedNow === true &&
          typeof state.amount === "number" && (
            <MarketplacePurchaseSuccess
              id={state.paperId ?? id}
              amount={state.amount}
              chargedNow={state.chargedNow}
              rasterSale={rasterSale}
              balanceBefore={state.balanceBefore}
              balanceAfter={state.balanceAfter}
            />
          )}
        <form method="dialog" className="bg-white pb-4 text-center">
          <button className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 focus-visible:outline">
            পরে সেটআপ করব · বন্ধ করুন
          </button>
        </form>
      </dialog>
    </>
  );
}
export function PurchasedInstitution({
  id,
  institution,
}: {
  id: string;
  institution: string;
}) {
  const [state, action, pending] = useActionState(
    savePurchasedInstitution,
    initial,
  );
  return (
    <div data-noprint className="space-y-4">
      <form action={action} className="flex flex-wrap gap-3 items-end">
        <input type="hidden" name="paperId" value={id} />
        <label>
          শুধু প্রতিষ্ঠানের নাম
          <input
            className="block border rounded p-3"
            name="institution"
            defaultValue={institution}
            minLength={2}
            maxLength={200}
            required
          />
        </label>
        <button disabled={pending} className="rounded border p-3">
          নাম সংরক্ষণ
        </button>
        <p role="status">{state.message}</p>
      </form>
      <button
        className="bg-slate-900 text-white rounded p-3"
        onClick={async () => {
          await document.fonts.ready;
          window.print();
        }}
      >
        সংরক্ষিত কপি প্রিন্ট করুন
      </button>
      <p>
        নাম সংরক্ষণের পর প্রিন্ট করুন। প্রশ্ন, ফন্ট, বিন্যাস ও অন্য সেটিংস স্থির রাখা
        হয়েছে।
      </p>
    </div>
  );
}
