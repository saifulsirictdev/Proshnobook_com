"use server";
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
}
