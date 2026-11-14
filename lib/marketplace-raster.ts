import { z } from "zod";
/** Only normalized, application-created final page images; never original PDF URLs. */
export const marketRasterSchema = z
  .object({
    kind: z.literal("READY_RASTER"),
    pages: z
      .array(
        z
          .string()
          .url()
          .max(2048)
          .refine((url) => {
            try {
              const u = new URL(url);
              return (
                u.protocol === "https:" &&
                !u.username &&
                !u.password &&
                !u.port &&
                /^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/.test(
                  u.hostname,
                ) &&
                /^\/market-ready\/[a-f0-9]{64}\.png$/.test(u.pathname) &&
                !u.search &&
                !u.hash
              );
            } catch {
              return false;
            }
          }),
      )
      .min(1)
      .max(10),
  })
  .strict();
export type MarketRaster = z.infer<typeof marketRasterSchema>;
export function rasterSnapshot(snapshot: unknown): MarketRaster | null {
  if (!snapshot || typeof snapshot !== "object" || !("raster" in snapshot))
    return null;
  return marketRasterSchema.parse((snapshot as { raster: unknown }).raster);
}
