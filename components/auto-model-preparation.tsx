"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { prepareAutoModel } from "@/app/actions/auto-model";
import { appendModelHistory, modelHistoryKey } from "@/lib/auto-model-insights";
import { resolveSyllabusSelection } from "@/lib/auto-model-syllabus";
import type { SyllabusSelection } from "@/lib/auto-model-syllabus-schema";
import { type AutoModelVariant } from "@/lib/auto-model";
import { autoModelSettings } from "@/lib/auto-model-paper";
import PreparationPopup from "./preparation-popup";

export default function AutoModelPreparation({
  category,
  subject,
  variant,
  selection,
}: {
  category: string;
  subject: string;
  variant: AutoModelVariant;
  selection?: SyllabusSelection;
}) {
  const router = useRouter();
  const [retry, setRetry] = useState(0);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState("");
  const [savedCount,setSavedCount]=useState(0);
  const [gaps, setGaps] = useState<
    { section: string; required: number; available: number }[]
  >([]);
  // Reuse each in-flight preparation step during Strict Mode effect replay.
  // Bounded serial steps fill only gaps; checkout remains on the build route.
  const task = useRef<{
    key: string;
    promise: ReturnType<typeof prepareAutoModel>;
  } | null>(null);

  useEffect(() => {
    let stopped = false;
    const key = JSON.stringify([category, subject, variant, selection, retry]);
    setError("");
    setGaps([]);
    setStage(0);
    setSavedCount(0);
    (async () => {
      try { resolveSyllabusSelection(selection ?? {category,subject,variant}); }
      catch { setError("সিলেবাস/মানবণ্টন যাচাই করুন।");return; }
      try {
        setStage(1);
        let result:Awaited<ReturnType<typeof prepareAutoModel>>|undefined;
        for(let step=0;step<101;step++){
          if(stopped)return;
          const stepKey=key+":"+step;
          if(task.current?.key!==stepKey)task.current={key:stepKey,promise:prepareAutoModel(selection??{category,subject,variant})};
          result=await task.current.promise;
          if(stopped)return;
          if("added" in result&&result.added){const added=result.added;setSavedCount(n=>n+added);}
          if(result.ok || !("pending" in result) || !result.pending || !("added" in result) || !result.added)break;
        }
        if(!result){setError("প্রস্তুতি শেষ হয়নি। আবার চেষ্টা করুন।");return;}
        if (stopped) return;
        if (!result.ok) {
          setError(result.error);
          if ("gaps" in result && result.gaps) setGaps(result.gaps);
          return;
        }
        try {
          // A complete new model starts clean. On shortage/network/storage failure,
          // retain the previous selection/settings instead of navigating with half a draft.
          const settings = autoModelSettings(category, subject, variant, selection);
          if("assignments" in result && result.assignments)settings.syllabusAssignments=result.assignments;
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
        // History is best-effort and cannot break a successfully stored model.
        try { const historyKey=modelHistoryKey(category,subject,variant);
          localStorage.setItem(historyKey,appendModelHistory(localStorage.getItem(historyKey),result.ids));
        } catch { /* Existing model/checkout still works with browser storage limits. */ }
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
  }, [category, subject, variant, selection, retry, router]);

  return (
    <PreparationPopup
      subject={subject}
      stage={stage}
      error={error}
      neutralBranding
      destination="setup"
    >
      {savedCount>0&&<p role="status">এই প্রস্তুতিতে বাস্তবে সংরক্ষিত: {savedCount}টি ব্যক্তিগত খসড়া। এটি সঠিকতা/অনুমোদনের সনদ নয়।</p>}
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
