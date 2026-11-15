import { paperSocialSummary } from "@/lib/paper-social";
import "server-only";
import { db } from "@/lib/db";
import { MARKET_PREFIX } from "@/lib/marketplace";
import { publicMarketPaper } from "@/lib/marketplace-catalog";
import { saleRecord } from "@/lib/marketplace-purchase";
import { publicFullPreview } from "@/lib/marketplace-full-preview";
import { rasterSnapshot } from "@/lib/marketplace-raster";
import { publicProfile, OFFICIAL_PROFILE } from "@/lib/social-profiles";
export async function questionFeed({
  grade,
  ownerId,
  official = false,
  after,
  viewerId,
}: {
  grade?: string;
  ownerId?: string;
  official?: boolean;
  after?: string;
  viewerId?: string;
} = {}) {
  const cursor =
    after && /^[a-f0-9]{64}$/.test(after) ? MARKET_PREFIX + after : undefined;
  const rows = await db.setting.findMany({
    where: {
      key: { startsWith: MARKET_PREFIX, ...(cursor ? { gt: cursor } : {}) },
      AND: [
        { value: { contains: '"status":"APPROVED"' } },
        ...(ownerId
          ? [{ value: { contains: `"ownerId":${JSON.stringify(ownerId)}` } }]
          : []),
        ...(ownerId
          ? [{ NOT: { value: { contains: '"official":true' } } }]
          : []),
        ...(official ? [{ value: { contains: '"official":true' } }] : []),
        ...(grade
          ? [
              {
                OR: (grade === "SSC"
                  ? ["9", "10"]
                  : grade === "HSC"
                    ? ["11", "12"]
                    : [grade]
                ).map((g) => ({
                  value: { contains: `"grade":${JSON.stringify(g)}` },
                })),
              },
            ]
          : []),
      ],
    },
    orderBy: { key: "asc" },
    take: 7,
  });
  const identities = new Map<string, ReturnType<typeof publicProfile>>();
  const posts = [];
  for (const row of rows.slice(0, 6)) {
    try {
      const id = row.key.slice(MARKET_PREFIX.length),
        record = saleRecord(row.value, id),
        paper = publicMarketPaper(row.value);
      if (
        !paper ||
        (ownerId && (record.ownerId !== ownerId || record.official === true)) ||
        (official && !record.official)
      )
        continue;
      const tid = record.official ? OFFICIAL_PROFILE : paper.sellerTid;
      if (!identities.has(tid))
        identities.set(tid, publicProfile(tid, viewerId));
      const profile = await identities.get(tid)!;
      const raster = rasterSnapshot(record.snapshot);
      posts.push({
        social: await paperSocialSummary(id, viewerId),
        paper,
        profile,
        raster: raster ? { ...raster, pages: raster.pages.slice(0, 1) } : null,
        model: raster ? null : publicFullPreview(row.value, id),
      });
    } catch {
      /* Malformed/unrenderable submissions never become feed posts. */
    }
  }
  return {
    posts,
    next: rows.length > 6 ? rows[5].key.slice(MARKET_PREFIX.length) : null,
  };
}
