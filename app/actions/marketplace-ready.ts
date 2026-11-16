"use server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { randomUUID, createHash } from "node:crypto";
import { put } from "@vercel/blob";
import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { walletTransaction } from "@/lib/wallet";
import {
  readySnapshotSchema,
  readySelectionSchema,
} from "@/lib/ready-commerce";
const digest = (v: unknown) =>
  createHash("sha256").update(JSON.stringify(v)).digest("hex");
async function ownedReceipt(receiptId: string) {
  if (!/^[a-f0-9]{64}$/.test(receiptId)) throw Error("Invalid receipt");
  const session = await auth();
  const ownerId = session?.user?.role === "STUDENT" ? null : session?.user?.id;
  if (
    !ownerId ||
    !(await db.user.findUnique({
      where: { id: ownerId },
      select: { id: true },
    }))
  )
    throw Error("Forbidden");
  const row = await db.setting.findUnique({
    where: { key: `readyowned:v1:${ownerId}:${receiptId}` },
  });
  if (!row) throw Error("Missing saved paper");
  const owned = JSON.parse(row.value);
  if (owned.ownerId !== ownerId || owned.id !== receiptId)
    throw Error("Forbidden");
  const snapshot = readySnapshotSchema.parse(owned.snapshot);
  const selected = readySelectionSchema.shape.selected.parse(owned.selected);
  return { ownerId, owned, selected, hash: digest({ snapshot, selected }) };
}
/** Reserve a bounded export, tied to the owner's exact server-saved assembly. */
export async function beginReadyMarketExport(receiptId: string) {
  try {
    const r = await ownedReceipt(receiptId);
    const batchId = randomUUID();
    await walletTransaction(async (tx) => {
      const key = `marketreadyquota:v1:${r.ownerId}:${new Date().toISOString().slice(0, 10)}`;
      const old = await tx.setting.findUnique({ where: { key } });
      const count = old ? Number(old.value) : 0;
      if (!Number.isSafeInteger(count) || count >= 20)
        throw Error("দৈনিক সর্বোচ্চ ২০টি বিক্রির কপি প্রস্তুত করা যাবে।");
      await tx.setting.upsert({
        where: { key },
        create: { key, value: String(count + 1) },
        update: { value: String(count + 1) },
      });
      const draftKey = `marketready:v1:${r.ownerId}:${receiptId}`;
      const value = JSON.stringify({
        ownerId: r.ownerId,
        receiptId,
        hash: r.hash,
        batchId,
        title: r.owned.title,
        count: r.selected.length,
        pages: {},
        at: new Date().toISOString(),
      });
      await tx.setting.upsert({
        where: { key: draftKey },
        create: { key: draftKey, value },
        update: { value },
      });
    });
    return {
      ok: true as const,
      hash: r.hash,
      batchId,
      count: r.selected.length,
    };
  } catch {
    return {
      ok: false as const,
      error:
        "বিক্রির কপি শুরু হয়নি। আগে অ্যাকাউন্টে সেভ করুন; দৈনিক সীমা ও সংযোগ যাচাই করুন।",
    };
  }
}
/** Accept only raster bytes. Sharp strips metadata and rejects oversized/decompression-bomb input. */
export async function uploadReadyMarketPage(form: FormData) {
  try {
    const receiptId = String(form.get("receiptId") || ""),
      hash = String(form.get("hash") || ""),
      batchId = String(form.get("batchId") || ""),
      index = Number(form.get("index"));
    const r = await ownedReceipt(receiptId);
    if (
      r.hash !== hash ||
      !Number.isInteger(index) ||
      index < 0 ||
      index >= r.selected.length
    )
      throw Error("Changed saved paper");
    const file = form.get("page");
    if (!(file instanceof File) || file.size > 3_000_000 || file.size < 100)
      throw Error("Page too large");
    const input = Buffer.from(await file.arrayBuffer());
    const meta = await sharp(input, {
      limitInputPixels: 12_000_000,
    }).metadata();
    if (
      meta.format !== "png" ||
      !meta.width ||
      !meta.height ||
      meta.width < 500 ||
      meta.height < 500 ||
      (meta.pages && meta.pages !== 1)
    )
      throw Error("Invalid PNG");
    await walletTransaction(async (tx) => {
      const key = `marketready:v1:${r.ownerId}:${receiptId}`;
      const row = await tx.setting.findUnique({ where: { key } });
      if (!row) throw Error("Start export first");
      const d = JSON.parse(row.value);
      if (
        d.ownerId !== r.ownerId ||
        d.batchId !== batchId ||
        d.hash !== hash ||
        d.pages[index]
      )
        throw Error("Slot already reserved; restart export to retry");
      d.pages[index] = "RESERVED";
      await tx.setting.update({
        where: { key },
        data: { value: JSON.stringify(d) },
      });
    });
    const bytes = await sharp(input, { limitInputPixels: 12_000_000 })
      .resize({
        width: 1600,
        height: 2264,
        fit: "inside",
        withoutEnlargement: true,
      })
      .flatten({ background: "white" })
      .png()
      .toBuffer();
    const asset = digest(bytes.toString("base64"));
    const blob = await put(`market-ready/${asset}.png`, bytes, {
      access: "public",
      addRandomSuffix: false,
      contentType: "image/png",
    });
    await walletTransaction(async (tx) => {
      const key = `marketready:v1:${r.ownerId}:${receiptId}`;
      const row = await tx.setting.findUnique({ where: { key } });
      if (!row) throw Error("Start export first");
      const draft = JSON.parse(row.value);
      if (
        draft.ownerId !== r.ownerId ||
        draft.batchId !== batchId ||
        draft.hash !== hash ||
        draft.count !== r.selected.length
      )
        throw Error("Export changed");
      // Never delete provider objects here: sale/purchase snapshots may already reference them.
      draft.pages[index] = blob.url;
      await tx.setting.update({
        where: { key },
        data: { value: JSON.stringify(draft) },
      });
    });
    revalidatePath("/dashboard/sell");
    return { ok: true as const };
  } catch {
    return {
      ok: false as const,
      error:
        "পৃষ্ঠা জমা হয়নি। সেভ করা কপি বদলেছে অথবা ছবি/storage যাচাই হয়নি। আবার প্রস্তুত করুন।",
    };
  }
}
