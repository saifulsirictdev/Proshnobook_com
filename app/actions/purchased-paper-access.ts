"use server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { purchaseKey, validatePurchase } from "@/lib/marketplace-purchase";
export async function checkPurchasedPaperAccess(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    if (!/^[a-f0-9]{64}$/.test(id)) throw Error("Invalid");
    const buyerId = (await auth())?.user?.id;
    if (
      !buyerId ||
      !(await db.user.findUnique({
        where: { id: buyerId },
        select: { id: true },
      }))
    )
      throw Error("Forbidden");
    const row = await db.setting.findUnique({
      where: { key: purchaseKey(buyerId, id) },
    });
    if (!row) throw Error("Missing");
    validatePurchase(row.value, buyerId, id);
    return { ok: true };
  } catch {
    return {
      ok: false,
      error:
        "কেনা কপির অনুমতি যাচাই হয়নি অথবা রিফান্ড হয়েছে। লাইব্রেরি থেকে আবার খুলুন।",
    };
  }
}
