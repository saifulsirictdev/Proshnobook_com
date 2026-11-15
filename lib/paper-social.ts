import "server-only";
import { db } from "@/lib/db";
import { createHash } from "node:crypto";
import { MARKET_PREFIX } from "@/lib/marketplace";
import { saleRecord } from "@/lib/marketplace-purchase";
export const socialUserHash = (id: string) =>
  createHash("sha256").update(id).digest("hex");
export function socialRelationKey(
  kind: "like" | "save",
  paperId: string,
  userId: string,
) {
  return `social:${kind}:v1:${paperId}:${socialUserHash(userId)}`;
}
export async function requirePublicPaper(
  paperId: string,
  tx: Pick<typeof db, "setting"> = db,
) {
  if (!/^[a-f0-9]{64}$/.test(paperId)) throw Error("Invalid paper");
  const row = await tx.setting.findUnique({
    where: { key: MARKET_PREFIX + paperId },
  });
  if (!row) throw Error("Missing paper");
  return saleRecord(row.value, paperId);
}
export async function paperSocialSummary(paperId: string, viewerId?: string) {
  const [likes, comments, liked, saved] = await Promise.all([
    db.setting.count({
      where: { key: { startsWith: `social:like:v1:${paperId}:` } },
    }),
    db.setting.count({
      where: {
        key: { startsWith: `social:comment:v1:${paperId}:` },
        value: { contains: '"status":"APPROVED"' },
      },
    }),
    viewerId
      ? db.setting.findUnique({
          where: { key: socialRelationKey("like", paperId, viewerId) },
        })
      : null,
    viewerId
      ? db.setting.findUnique({
          where: { key: socialRelationKey("save", paperId, viewerId) },
        })
      : null,
  ]);
  return { likes, comments, liked: !!liked, saved: !!saved };
}
