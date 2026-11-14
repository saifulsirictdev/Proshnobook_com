import { db } from "@/lib/db";
import { MARKET_PREFIX } from "@/lib/marketplace";
import { publicMarketSample } from "@/lib/marketplace-sample";
import { marketSampleImage } from "@/lib/marketplace-sample-image";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
const headers = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
  "Content-Security-Policy": "default-src 'none'; sandbox",
  "Referrer-Policy": "no-referrer",
};
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[a-f0-9]{64}$/.test(id))
    return new Response(null, { status: 404, headers });
  try {
    const row = await db.setting.findUnique({
      where: { key: MARKET_PREFIX + id },
    });
    const sample =
      row && row.value.length <= 1_200_000
        ? publicMarketSample(row.value, id)
        : null;
    if (!sample?.excerpts.length)
      return new Response(null, { status: 404, headers });
    const bytes = await marketSampleImage(sample);
    // Recheck after rendering so concurrent revocation does not serve a stale sample.
    const fresh = await db.setting.findUnique({
      where: { key: MARKET_PREFIX + id },
    });
    if (!fresh || fresh.value !== row!.value)
      return new Response(null, { status: 404, headers });
    return new Response(new Uint8Array(bytes), {
      headers: {
        ...headers,
        "Content-Type": "image/png",
        "Content-Disposition": 'inline; filename="proshnobook-preview.png"',
      },
    });
  } catch {
    return new Response(null, { status: 503, headers });
  }
}
