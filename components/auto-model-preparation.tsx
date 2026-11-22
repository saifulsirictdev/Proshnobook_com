"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { prepareAutoModel } from "@/app/actions/auto-model";
import { autoModelBlueprint, type AutoModelVariant } from "@/lib/auto-model";
import { autoModelSettings } from "@/lib/auto-model-paper";
import PreparationPopup from "./preparation-popup";

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
  const [retry, setRetry] = useState(0);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState("");
  const [gaps, setGaps] = useState<
    { section: string; required: number; available: number }[]
  >([]);
  // Reuse an in-flight read during effect replay (including React Strict Mode).
  // Retrying explicitly starts a new read. Never purchase or charge here.
  const task = useRef<{
    key: string;
    promise: ReturnType<typeof prepareAutoModel>;
  } | null>(null);

  useEffect(() => {
    let stopped = false;
    const key = JSON.stringify([category, subject, variant, retry]);
    setError("");
    setGaps([]);
    setStage(0);
    (async () => {
      if (!autoModelBlueprint(category, subject, variant)) {
        setError("এই নির্বাচনের Auto Model কাঠামো প্রস্তুত নয়।");
        return;
      }
      try {
        setStage(1);
        if (task.current?.key !== key)
          task.current = {
            key,
            promise: prepareAutoModel({ category, subject, variant }),
          };
        const result = await task.current.promise;
        if (stopped) return;
        if (!result.ok) {
          setError(result.error);
          if ("gaps" in result && result.gaps) setGaps(result.gaps);
          return;
        }
        try {
          // A complete new model starts clean. On shortage/network/storage failure,
          // retain the previous selection/settings instead of navigating with half a draft.
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
        } catch {
          setError("ব্রাউজারে নির্বাচন সংরক্ষণ করা যায়নি। স্টোরেজ পরীক্ষা করুন।");
          return;
        }
        setStage(2);
        // No success interstitial or second preparation click. The existing build
        // route still enforces its price review, explicit checkout and access gate.
        router.replace("/question-builder/build");
      } catch {
        if (!stopped) setError("সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      }
    })();
    return () => {
      stopped = true;
    };
  }, [category, subject, variant, retry, router]);

  return (
    <PreparationPopup
      subject={subject}
      stage={stage}
      error={error}
      databaseOnly
      destination="setup"
    >
      {gaps.length > 0 && (
        <ul className="my-3 space-y-1">
          {gaps.map((gap) => (
            <li key={gap.section}>
              {gap.section}: প্রয়োজন {gap.required}টি · উপযুক্ত আছে {gap.available}টি
            </li>
          ))}
        </ul>
      )}
      <button type="button" onClick={() => setRetry((n) => n + 1)}>
        আবার চেষ্টা করুন
      </button>
      <Link href="/question-builder">নির্বাচনে ফিরুন</Link>
    </PreparationPopup>
  );
}
