import { createHash } from "node:crypto";
import {
  marketMetadataSchema,
  snapshotHash,
  type MarketSubmission,
} from "@/lib/marketplace";
import { assertRenderableMarketSnapshot } from "@/lib/marketplace-preview";
export const PURCHASE_PREFIX = "market:purchase:v1:";
export type MarketPurchase = {
  version: 1;
  buyerId: string;
  paperId: string;
  sellerId: string;
  title: string;
  amount: number;
  revenueMode?: "PLATFORM";
  sellerAmount: number;
  platformAmount: number;
  snapshot: MarketSubmission["snapshot"];
  snapshotHash: string;
  revision: number;
  purchasedAt: string;
  institution: string;
  refundedAt?: string;
};
export function purchaseKey(buyerId: string, paperId: string) {
  return `${PURCHASE_PREFIX}${buyerId}:${paperId}`;
}
/** Bind confirmation to every financially relevant term and immutable content. */
export function purchaseTerms(
  record: MarketSubmission,
  revenueMode?: "PLATFORM",
) {
  return createHash("sha256")
    .update(
      JSON.stringify([
        record.id,
        record.ownerId,
        record.revision,
        record.snapshotHash,
        record.metadata.pricePaisa,
        record.metadata.title,
        ...(revenueMode ? [revenueMode] : []),
      ]),
    )
    .digest("hex");
}
export function saleRecord(raw: string, id: string): MarketSubmission {
  const r = JSON.parse(raw) as MarketSubmission;
  if (
    !r ||
    r.version !== 1 ||
    r.id !== id ||
    r.status !== "APPROVED" ||
    typeof r.ownerId !== "string" ||
    !r.ownerId ||
    !Number.isSafeInteger(r.revision) ||
    r.revision < 1 ||
    !marketMetadataSchema.safeParse(r.metadata).success ||
    snapshotHash(r.snapshot) !== r.snapshotHash
  )
    throw Error("Invalid sale");
  assertRenderableMarketSnapshot(r.snapshot);
  return r;
}
export function revenueSplit(amount: number, revenueMode?: "PLATFORM") {
  if (revenueMode !== undefined && revenueMode !== "PLATFORM")
    throw Error("Invalid revenue mode");
  if (
    !Number.isSafeInteger(amount) ||
    (amount !== 0 && amount < 100) ||
    amount > 5000000
  )
    throw Error("Invalid price");
  const sellerAmount =
    revenueMode === "PLATFORM" ? 0 : Math.floor((amount * 60) / 100);
  return { sellerAmount, platformAmount: amount - sellerAmount };
}
export function validatePurchase(
  raw: string,
  buyerId: string,
  paperId: string,
  includeRefunded = false,
): MarketPurchase {
  const r = JSON.parse(raw) as MarketPurchase;
  if (
    !r ||
    r.version !== 1 ||
    (!includeRefunded && r.refundedAt !== undefined) ||
    (r.refundedAt !== undefined &&
      (typeof r.refundedAt !== "string" ||
        !Number.isFinite(Date.parse(r.refundedAt)))) ||
    r.buyerId !== buyerId ||
    r.paperId !== paperId ||
    typeof r.sellerId !== "string" ||
    typeof r.title !== "string" ||
    typeof r.institution !== "string" ||
    r.institution.length > 200 ||
    snapshotHash(r.snapshot) !== r.snapshotHash ||
    r.sellerAmount !== revenueSplit(r.amount, r.revenueMode).sellerAmount ||
    r.platformAmount !== revenueSplit(r.amount, r.revenueMode).platformAmount
  )
    throw Error("Invalid purchased copy");
  assertRenderableMarketSnapshot(r.snapshot);
  return r;
}
