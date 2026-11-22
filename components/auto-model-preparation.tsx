"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { prepareAutoModel } from "@/app/actions/auto-model";
import {
  AUTO_MODEL_NOTICE,
  autoModelBlueprint,
  MATH_DIVISIONS,
  type AutoModelVariant,
} from "@/lib/auto-model";
import { autoModelSettings } from "@/lib/auto-model-paper";
export default function AutoModelPreparation({
  category,
  subject,
  variant,
}: {
  category: string;
  subject: string;
  variant: AutoModelVariant;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof prepareAutoModel>
  > | null>(null);
  const [error, setError] = useState("");
  const plan = autoModelBlueprint(category, subject, variant);
  if (!plan) return null;
  function prepare() {
    setError("");
    setResult(null);
    start(async () => {
      try {
        setResult(await prepareAutoModel({ category, subject, variant }));
      } catch {
        setError("সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      }
    });
  }
  function proceed() {
    if (!result?.ok) return;
    try {
      // A new model starts clean: no inherited filters, excluded IDs or edits.
      const settings = autoModelSettings(category, subject, variant);
      const oldIds = localStorage.getItem("qb:selected"),
        oldSettings = localStorage.getItem("qb:settings");
      try {
        localStorage.setItem("qb:settings", JSON.stringify(settings));
        localStorage.setItem("qb:selected", JSON.stringify(result.ids));
      } catch (e) {
        if (oldSettings === null) localStorage.removeItem("qb:settings");
        else localStorage.setItem("qb:settings", oldSettings);
        if (oldIds === null) localStorage.removeItem("qb:selected");
        else localStorage.setItem("qb:selected", oldIds);
        throw e;
      }
      router.push("/question-builder/build");
    } catch {
      setError("ব্রাউজারে নির্বাচন সংরক্ষণ করা যায়নি। স্টোরেজ পরীক্ষা করুন।");
    }
  }
  return (
    <section className="space-y-5 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-7">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
          Auto Model · {category} · {subject}
        </span>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{plan.title}</h1>
        <p className="mt-2 text-sm text-slate-600">
          আগে কাঠামো যাচাই, তারপর মূল্য দেখে সেটআপ ও প্রশ্ন সম্পাদনা।
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-emerald-50 p-4">
          <p className="text-xs text-emerald-800">পূর্ণমান</p>
          <strong className="text-2xl text-emerald-950">
            {plan.totalMarks}
          </strong>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs text-slate-600">সময়</p>
          <strong className="text-lg">{plan.minutes}</strong>
        </div>
      </div>
      <p className="font-semibold">{plan.offered}</p>
      {variant === "CQ" && (
        <ul className="grid gap-2 text-sm sm:grid-cols-2">
          {MATH_DIVISIONS.map((d) => (
            <li className="rounded-lg border border-slate-200 p-3" key={d.id}>
              {d.title}
              <span className="block text-xs text-slate-500">
                ২টি সৃজনশীল প্রশ্ন · ক/খ/গ: ২/৪/৪
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="rounded-lg bg-slate-50 p-3 text-sm leading-relaxed">
        {plan.instructions}
      </p>
      <p className="text-xs leading-relaxed text-slate-500">
        {AUTO_MODEL_NOTICE} কেবল উপযুক্ত অনুমোদিত প্রশ্ন নেওয়া হবে; নতুন প্রশ্ন
        তৈরি বা স্বয়ংক্রিয় চার্জ হবে না। একই প্রশ্ন পুনরাবৃত্তি হবে না। পৃথক
        প্রশ্নে থাকা অসম্পূর্ণ উদ্দীপক-নির্ভর সেট এখানে নেওয়া হবে না।
      </p>
      <div aria-live="polite">
        {pending && <p>প্রশ্নভান্ডার ও বিভাগভিত্তিক সংখ্যা যাচাই হচ্ছে…</p>}
        {result && !result.ok && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <p>{result.error}</p>
            {"gaps" in result && result.gaps && (
              <ul className="mt-3 space-y-1">
                {result.gaps.map((g) => (
                  <li key={g.section}>
                    {g.section}: প্রয়োজন {g.required}টি · উপযুক্ত আছে{" "}
                    {g.available}টি
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {result?.ok && (
          <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
            পূর্ণ কাঠামোর {result.ids.length}টি প্রশ্ন নির্বাচন হয়েছে। সেটআপে
            প্রশ্ন দেখে সম্পাদনা, সেভ ও PDF করতে পারবেন।
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
      </div>
      {result?.ok ? (
        <button
          onClick={proceed}
          className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white"
        >
          মূল্য যাচাই ও সেটআপ →
        </button>
      ) : (
        <button
          onClick={prepare}
          disabled={pending}
          className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white disabled:opacity-50"
        >
          {pending ? "যাচাই চলছে…" : "পূর্ণ মডেল প্রস্তুত করুন"}
        </button>
      )}
      <Link
        href="/question-builder"
        className="block text-center text-sm font-semibold text-emerald-800"
      >
        ← শ্রেণি / বিষয় / Chapter নির্বাচনে ফিরুন
      </Link>
    </section>
  );
}
