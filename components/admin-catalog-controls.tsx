"use client";
import { useActionState } from "react";
import { manageCatalog } from "@/app/actions/admin-catalog";
import type { MarketMetadata } from "@/lib/marketplace";
import { MARKET_EXAM_TYPES } from "@/lib/marketplace-exam-types";
import {
  MARKET_GRADES,
  MARKET_GRADE_NAMES,
} from "@/lib/marketplace-school-catalog";
export default function AdminCatalogControls({
  id,
  revision,
  status,
  metadata: m,
}: {
  id: string;
  revision: number;
  status: string;
  metadata: MarketMetadata;
}) {
  const [state, action, pending] = useActionState(manageCatalog, {
    ok: false,
    message: "",
  });
  const field =
    "block w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900";
  return (
    <form action={action} className="space-y-3 border-t pt-4">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="revision" value={revision} />
      <details>
        <summary className="cursor-pointer font-bold">
          তালিকার তথ্য সম্পাদনা
        </summary>
        <div className="grid gap-3 pt-3 sm:grid-cols-2">
          <label>
            শিরোনাম
            <input
              className={field}
              name="title"
              defaultValue={m.title}
              required
              maxLength={120}
            />
          </label>
          <label>
            শ্রেণি
            <select className={field} name="grade" defaultValue={m.grade}>
              {MARKET_GRADES.map((g) => (
                <option key={g} value={g}>
                  {MARKET_GRADE_NAMES[g]}
                </option>
              ))}
            </select>
          </label>
          <label>
            বিষয়
            <input
              className={field}
              name="subject"
              defaultValue={m.subject}
              required
              maxLength={100}
            />
          </label>
          <label>
            পরীক্ষা
            <select className={field} name="examType" defaultValue={m.examType}>
              {MARKET_EXAM_TYPES.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
          </label>
          <label>
            মূল্য (৳)
            <input
              className={field}
              name="price"
              defaultValue={(m.pricePaisa / 100).toFixed(2)}
              required
              type="number"
              min="1"
              max="50000"
              step="0.01"
            />
          </label>
          <label>
            অধ্যায় (কমা দিয়ে)
            <textarea
              className={field}
              name="chapters"
              defaultValue={m.chapters.join(", ")}
              required
              maxLength={4500}
            />
          </label>
          <label className="sm:col-span-2">
            বিবরণ
            <textarea
              className={field}
              name="description"
              defaultValue={m.description}
              required
              minLength={10}
              maxLength={2000}
            />
          </label>
        </div>
        <button
          name="operation"
          value="EDIT"
          disabled={pending || state.ok}
          className="mt-3 rounded-lg bg-indigo-700 px-4 py-2 text-white disabled:opacity-50"
        >
          সম্পাদনা সংরক্ষণ
        </button>
      </details>
      <label className="block text-sm">
        <input type="checkbox" name="confirmed" required /> পরিবর্তন নিশ্চিত করছি।
        ডিলিটে শুধু তালিকা থেকে সরবে; কেনা কপি/রসিদ মুছবে না।
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          name="operation"
          value={status === "APPROVED" ? "HIDE" : "PUBLISH"}
          disabled={pending || state.ok}
          className="rounded-lg border border-indigo-300 px-4 py-2 font-semibold disabled:opacity-50"
        >
          {status === "APPROVED" ? "প্রকাশ বন্ধ" : "আবার প্রকাশ"}
        </button>
        <button
          name="operation"
          value="DELETE"
          disabled={pending || state.ok}
          onClick={(e) => {
            if (
              !window.confirm(
                "এই প্রশ্নপত্রটি ক্যাটালগ থেকে সরাবেন? ক্রেতার কপি ও রসিদ থাকবে।",
              )
            )
              e.preventDefault();
          }}
          className="rounded-lg border border-red-300 px-4 py-2 font-semibold text-red-700 disabled:opacity-50"
        >
          ডিলিট
        </button>
      </div>
      <p role="status">{state.message}</p>
    </form>
  );
}
