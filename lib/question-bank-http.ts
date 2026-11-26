import { admin } from "@/lib/guard";
export const bankReply = (value: unknown, status = 200) =>
  Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
export async function bankPostActor(req: Request, type = "application/json") {
  const actor = await admin();
  if (!actor.id) throw Error("Admin অনুমতি প্রয়োজন।");
  if (
    req.headers.get("origin") !== new URL(req.url).origin ||
    !req.headers.get("content-type")?.startsWith(type)
  )
    throw Error("অনুরোধের origin বা format সঠিক নয়।");
  return actor as typeof actor & { id: string };
}
export async function bankRequestBytes(req: Request, limit: number) {
  const reader = req.body?.getReader();
  if (!reader) throw Error("খালি অনুরোধ।");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw Error("অনুরোধ অতিরিক্ত বড়।");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
