import { assembleAutoModel } from "../../lib/auto-model";
import { mcqRows, writtenRows } from "./fixtures";
export async function prepareAutoModel(raw: {
  category: string;
  subject: string;
  variant: "MCQ" | "CQ";
}) {
  const rows =
    sessionStorage.getItem("auto-test-shortage") === "1"
      ? []
      : raw.variant === "MCQ"
        ? mcqRows
        : writtenRows;
  const result = assembleAutoModel(rows, raw.variant, () => 0.5);
  return result.ok
    ? { ok: true as const, ids: result.ids }
    : {
        ok: false as const,
        error: "নমুনা পরীক্ষায় প্রশ্নের ঘাটতি। কোনো আংশিক মডেল তৈরি করা হয়নি।",
        gaps: result.gaps,
      };
}
