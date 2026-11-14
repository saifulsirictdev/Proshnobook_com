"use server";
import { auth } from "@/auth";
import { randomUUID } from "node:crypto";
import { walletTransaction } from "@/lib/wallet";
import {
  MARKET_PREFIX,
  marketMetadataSchema,
  marketPricePaisa,
  snapshotHash,
  type MarketSubmission,
} from "@/lib/marketplace";
import { saleRecord } from "@/lib/marketplace-purchase";
import { revalidatePath } from "next/cache";
export type CatalogState = { ok: boolean; message: string };
export async function manageCatalog(
  _: CatalogState,
  form: FormData,
): Promise<CatalogState> {
  try {
    const actorId = (await auth())?.user?.id;
    const id = String(form.get("id") || ""),
      operation = String(form.get("operation") || ""),
      revision = Number(form.get("revision"));
    if (
      !actorId ||
      !/^[a-f0-9]{64}$/.test(id) ||
      !["HIDE", "PUBLISH", "DELETE", "EDIT"].includes(operation) ||
      !Number.isSafeInteger(revision) ||
      revision < 1 ||
      form.get("confirmed") !== "on"
    )
      throw Error("Invalid");
    await walletTransaction(async (tx) => {
      if (
        (
          await tx.user.findUnique({
            where: { id: actorId },
            select: { role: true },
          })
        )?.role !== "ADMIN"
      )
        throw Error("Forbidden");
      const key = MARKET_PREFIX + id,
        row = await tx.setting.findUnique({ where: { key } });
      if (!row) throw Error("Missing");
      const r = JSON.parse(row.value) as MarketSubmission;
      if (
        r.version !== 1 ||
        r.id !== id ||
        r.revision !== revision ||
        !["APPROVED", "UNPUBLISHED"].includes(r.status) ||
        snapshotHash(r.snapshot) !== r.snapshotHash
      )
        throw Error("Stale or not approved");
      const metadata = marketMetadataSchema.parse(r.metadata);
      let next = {
        ...r,
        metadata,
        revision: r.revision + 1,
        updatedAt: new Date().toISOString(),
      };
      if (operation === "HIDE") {
        if (r.status !== "APPROVED") throw Error("Not published");
        next.status = "UNPUBLISHED";
      }
      if (operation === "PUBLISH") {
        if (r.status !== "UNPUBLISHED") throw Error("Not hidden");
        saleRecord(JSON.stringify({ ...r, status: "APPROVED" }), id);
        next.status = "APPROVED";
      }
      if (operation === "DELETE") next.status = "DELETED";
      if (operation === "EDIT")
        next.metadata = marketMetadataSchema.parse({
          ...metadata,
          title: form.get("title"),
          grade: form.get("grade"),
          subject: form.get("subject"),
          examType: form.get("examType"),
          description: form.get("description"),
          chapters: String(form.get("chapters") || "")
            .split(/[,\n]/)
            .map((s) => s.trim())
            .filter(Boolean),
          pricePaisa: marketPricePaisa(form.get("price")),
        });
      await tx.setting.create({
        data: {
          key: `market:catalog-audit:v1:${id}:${randomUUID()}`,
          value: JSON.stringify({
            version: 1,
            actorId,
            operation,
            at: next.updatedAt,
            before: r,
            after: next,
          }),
        },
      });
      await tx.setting.update({
        where: { key },
        data: { value: JSON.stringify(next) },
      });
    });
    for (const route of [
      "/",
      "/marketplace",
      `/marketplace/${id}`,
      "/admin/catalog",
      "/admin/marketplace",
      "/dashboard/sell",
    ])
      revalidatePath(route);
    return {
      ok: true,
      message: "ক্যাটালগ আপডেট হয়েছে। আগে কেনা কপি ও আর্থিক রসিদ অপরিবর্তিত।",
    };
  } catch {
    return {
      ok: false,
      message:
        "পরিবর্তন হয়নি। ADMIN অনুমতি, সর্বশেষ সংস্করণ, তথ্য ও সম্মতি যাচাই করে পেজ রিফ্রেশ করুন। অননুমোদিত প্রশ্নপত্রের জন্য অনুমোদন পেজ ব্যবহার করুন।",
    };
  }
}
