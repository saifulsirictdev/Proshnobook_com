"use client";
import type { BankDraft } from "@/lib/admin-question-bank-schema";
import { inspectQuestionQuality } from "@/lib/question-bank-quality";
export default function QuestionBankQualityChecklist({
  draft,
}: {
  draft: BankDraft;
}) {
  const checks = inspectQuestionQuality(draft);
  const labels = {
    pass: "গঠন মিলে",
    warning: "সতর্কতা",
    error: "সংশোধন দরকার",
    manual: "মানুষের যাচাই বাকি",
  };
  return (
    <section
      aria-label="প্রশ্নের quality checklist"
      className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-900"
    >
      <h3 className="font-bold">Quality checklist · স্বয়ংক্রিয় গঠন পরীক্ষা</h3>
      <p className="text-xs leading-6">
        এটি advisory সহায়তা; অনুমোদন বা নির্ভুলতার সনদ নয়। বিদ্যমান server
        validation ও আলাদা Admin review আগের মতোই প্রযোজ্য।
      </p>
      <ul className="space-y-3">
        {checks.map((check) => (
          <li
            key={check.id}
            className={`rounded-lg border p-3 ${check.level === "error" ? "border-rose-200 bg-rose-50" : check.level === "warning" ? "border-amber-200 bg-amber-50" : "border-slate-200"}`}
          >
            <div className="flex flex-wrap justify-between gap-2">
              <strong>{check.title}</strong>
              <span className="text-xs">{labels[check.level]}</span>
            </div>
            <p className="mt-1 break-words text-xs leading-6">{check.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
