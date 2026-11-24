"use server";
import { englishAdminGrade, englishAdminPaper } from "@/lib/english/admin-scope";
import { ENGLISH_BULK_APPROVAL_LIMIT, ENGLISH_BULK_APPROVAL_MAX_BYTES, englishApprovalSummary, type EnglishApprovalResult } from "@/lib/english/bulk-approval";
import { createHash } from "node:crypto";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { validateEnglishReferenceShape } from "@/lib/english/generation";
import { validateEnglishDraft } from "@/lib/english/draft";
export async function decideEnglishRecovery(form: FormData) {
  if ((await auth())?.user?.role !== "ADMIN") throw new Error("Forbidden");
  const key = String(form.get("key") || "");
  const status = form.get("status");
  if (
    !/^(english-review:[a-f0-9-]{36}|english-item:v1:[a-f0-9]{64})$/.test(key) ||
    !["APPROVED", "REJECTED"].includes(String(status))
  )
    return;
  const row = await db.setting.findUnique({ where: { key } });
  if (!row) return;
  const record = JSON.parse(row.value);
  if (record.status !== "PENDING") return;
  const draft = validateEnglishDraft(record.draft);
  validateEnglishReferenceShape(draft.selection, draft.output);
  await db.setting.updateMany({
    where: { key, value: row.value },
    data: {
      value: JSON.stringify({
        ...record,
        status,
        reviewedAt: new Date().toISOString(),
      }),
    },
  });
  revalidatePath("/admin/english-review");
  revalidatePath("/admin/questions");
  revalidatePath("/admin/questions/import");
}

/** Explicit re-review keeps the content and previous decision; never bulk resets on import. */
export async function reopenEnglishReview(form: FormData) {
  const user = (await auth())?.user;
  if (!user?.id || user.role !== "ADMIN") throw new Error("Forbidden");
  const key = String(form.get("key") ?? "");
  if (form.get("confirmed") !== "yes" || !/^(english-review:[a-f0-9-]{36}|english-item:v1:[a-f0-9]{64})$/.test(key)) return;
  const row = await db.setting.findUnique({where:{key}});
  if (!row) return;
  const record = JSON.parse(row.value);
  if (!["APPROVED", "REJECTED"].includes(record.status)) return;
  const draft = validateEnglishDraft(record.draft);
  validateEnglishReferenceShape(draft.selection, draft.output);
  await db.setting.updateMany({where:{key,value:row.value},data:{value:JSON.stringify({...record,status:"PENDING",previousDecision:{status:record.status,reviewedAt:record.reviewedAt ?? null},reopenedBy:user.id,reopenedAt:new Date().toISOString()})}});
  revalidatePath("/admin/english-review");
  revalidatePath("/admin/questions");
  revalidatePath("/admin/questions/import");
}

export async function approveEnglishPendingBatch(_: {error?:string;message?:string}, form: FormData): Promise<EnglishApprovalResult> {
  const user = (await auth())?.user;
  if (!user?.id || user.role !== "ADMIN") return {error:"শুধু ADMIN অনুমোদন দিতে পারবেন।"};
  if (form.get("reviewed") !== "yes") return {error:"সব নির্বাচিত প্রশ্ন–উত্তর পর্যালোচনার সম্মতি দিন।"};
  const reviewerId = user.id;
  const grade = englishAdminGrade(form.get("grade") ?? 6);
  const paper = englishAdminPaper(form.get("paper"));
  if (!grade || !paper) return {error:"শ্রেণি যাচাই করুন।"};
  let entries: {key:string;digest:string}[];
  try {
    const raw = String(form.get("entries") ?? "");
    if (raw.length > ENGLISH_BULK_APPROVAL_MAX_BYTES || Buffer.byteLength(raw, "utf8") > ENGLISH_BULK_APPROVAL_MAX_BYTES) throw Error();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > ENGLISH_BULK_APPROVAL_LIMIT) return {error:`এক অনুরোধে সর্বোচ্চ ${ENGLISH_BULK_APPROVAL_LIMIT}টি সেট অনুমোদন করা যাবে। নির্বাচিত তালিকা সীমার চেয়ে বড়।`};
    if (!Array.isArray(parsed) || !parsed.length || parsed.length > ENGLISH_BULK_APPROVAL_LIMIT || parsed.some(e => !e || typeof e.key !== "string" || !/^(english-review:[a-f0-9-]{36}|english-item:v1:[a-f0-9]{64})$/.test(e.key) || typeof e.digest !== "string" || !/^[a-f0-9]{64}$/.test(e.digest)) || new Set(parsed.map(e=>e.key)).size !== parsed.length) throw Error();
    entries = parsed;
  } catch { return {error:"সঠিক Pending তালিকা পাওয়া যায়নি। পেজ refresh করে আবার চেষ্টা করুন।"}; }
  const counts = {approved:0, skipped:0, invalid:0, uncertain:0};
  async function decide(entry: {key:string;digest:string}): Promise<keyof typeof counts> {
    try {
      const row = await db.setting.findUnique({where:{key:entry.key}});
      if (!row || createHash("sha256").update(row.value).digest("hex") !== entry.digest) return "skipped";
      let record;
      try {
        record = JSON.parse(row.value);
        if (record.status !== "PENDING") return "skipped";
        const draft = validateEnglishDraft(record.draft);
        validateEnglishReferenceShape(draft.selection,draft.output);
        if (draft.selection.grade !== grade || draft.selection.paper !== paper || !draft.selection.includeAnswers) return "invalid";
      } catch {return "invalid";}
      const result = await db.setting.updateMany({where:{key:entry.key,value:row.value},data:{value:JSON.stringify({...record,status:"APPROVED",reviewedBy:reviewerId,reviewedAt:new Date().toISOString()})}});
      return result.count === 1 ? "approved" : "skipped";
    } catch {return "uncertain";}
  }
  // One user submission and one server response, NOT a client-side batch queue.
  // Bounded DB concurrency avoids serial round trips for 612–2000 snapshots
  // without exhausting the pool. Every write retains its exact-value CAS guard.
  let cursor = 0;
  await Promise.all(Array.from({length: Math.min(8, entries.length)}, async () => {
    while (cursor < entries.length) counts[await decide(entries[cursor++])]++;
  }));
  revalidatePath("/admin/questions");
  revalidatePath("/admin/questions/import");
  return {counts, message:`${englishApprovalSummary(counts)} অনিশ্চিত হলে তালিকা refresh করে বর্তমান status দেখুন।`};
}
