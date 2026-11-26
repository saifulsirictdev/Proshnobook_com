import { db } from "@/lib/db";
import { BANK_IMAGE_PREFIX, IMAGE_ID } from "@/lib/admin-question-bank-schema";
export const runtime = "nodejs";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  const id = file.endsWith(".webp") ? file.slice(0, -5) : "";
  if (!IMAGE_ID.test(id)) return new Response(null, { status: 404 });
  const row = await db.setting.findUnique({
    where: { key: BANK_IMAGE_PREFIX + id },
  });
  if (!row) return new Response(null, { status: 404 });
  try {
    const image = JSON.parse(row.value);
    if (
      image.mime !== "image/webp" ||
      typeof image.data !== "string" ||
      image.data.length > 800000
    )
      throw Error();
    return new Response(new Uint8Array(Buffer.from(image.data, "base64")), {
      headers: {
        "Content-Type": "image/webp",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
