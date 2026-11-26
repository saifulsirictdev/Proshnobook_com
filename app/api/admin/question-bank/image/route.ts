import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { admin } from "@/lib/guard";
import { db } from "@/lib/db";
import {
  BANK_IMAGE_PREFIX,
  questionImagePath,
} from "@/lib/admin-question-bank-schema";
export const runtime = "nodejs";
const reply = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function POST(req: Request) {
  let actor;
  try {
    actor = await admin();
    if (!actor.id) throw Error();
  } catch {
    return reply({ error: "শুধু Admin ছবি আপলোড করতে পারবেন।" }, 403);
  }
  if (
    req.headers.get("origin") !== new URL(req.url).origin ||
    !req.headers.get("content-type")?.startsWith("multipart/form-data")
  )
    return reply({ error: "অনুরোধের format সঠিক নয়।" }, 403);
  try {
    // Bound bytes before FormData parsing, including requests without a length.
    const reader = req.body?.getReader();
    if (!reader) throw Error();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > 4200000) {
        await reader.cancel();
        return reply({ error: "ছবি সর্বোচ্চ ৪ MB হতে পারে।" }, 413);
      }
      chunks.push(part.value);
    }
    const form = await new Response(Buffer.concat(chunks), {
      headers: { "Content-Type": req.headers.get("content-type")! },
    }).formData();
    const file = form.get("image");
    if (
      !(file instanceof File) ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      !file.size ||
      file.size > 4000000
    )
      return reply({ error: "৪ MB-এর মধ্যে JPG, PNG বা WebP দিন।" }, 400);
    const input = Buffer.from(await file.arrayBuffer());
    const decoder = sharp(input, {
      limitInputPixels: 20000000,
      animated: false,
      failOn: "error",
    });
    const meta = await decoder.metadata();
    if (
      !["jpeg", "png", "webp"].includes(meta.format ?? "") ||
      (meta.pages ?? 1) > 1
    )
      return reply(
        { error: "স্থির JPG, PNG বা WebP ছবি দিন; SVG/GIF নয়।" },
        400,
      );
    // Re-encode strips EXIF/GPS and active payloads. DB-backed immutable files
    // work without a separate Blob token; never delete a referenced image.
    const bytes = await decoder
      .rotate()
      .resize({
        width: 1800,
        height: 1800,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();
    if (bytes.length > 600000)
      return reply(
        { error: "ছবিটি ছোট করে দিন; প্রক্রিয়াকরণের পর সর্বোচ্চ ৬০০ KB।" },
        413,
      );
    const id = randomUUID();
    await db.setting.create({
      data: {
        key: BANK_IMAGE_PREFIX + id,
        value: JSON.stringify({
          ownerId: actor.id,
          createdAt: new Date().toISOString(),
          mime: "image/webp",
          data: bytes.toString("base64"),
        }),
      },
    });
    return reply({ url: questionImagePath(id), bytes: bytes.length });
  } catch {
    return reply(
      { error: "ছবিটি আপলোড হয়নি। ফাইলটি সঠিক ও অক্ষত কিনা যাচাই করুন।" },
      400,
    );
  }
}
