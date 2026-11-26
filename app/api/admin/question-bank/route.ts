import { admin } from "@/lib/guard";
import { db } from "@/lib/db";
import {
  bankFiltersSchema,
  BANK_AUDIT_PREFIX,
} from "@/lib/admin-question-bank-schema";
import { loadBank, mutateBank } from "@/lib/admin-question-bank";
import { revalidatePath } from "next/cache";
import { z } from "zod";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const reply = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function GET(req: Request) {
  try {
    await admin();
  } catch {
    return reply({ error: "শুধু Admin-এর অনুমতি আছে।" }, 403);
  }
  try {
    const url = new URL(req.url);
    const history = url.searchParams.get("history");
    if (history) {
      if (history.length > 200) return reply({ error: "অবৈধ ID" }, 400);
      const rows = await db.setting.findMany({
        where: { key: { startsWith: `${BANK_AUDIT_PREFIX}${history}:` } },
        orderBy: { key: "desc" },
        take: 30,
      });
      return reply({
        history: rows.map((row) => ({
          ...JSON.parse(row.value),
          snapshotKey: row.key,
        })),
      });
    }
    return reply(
      await loadBank(
        bankFiltersSchema.parse(Object.fromEntries(url.searchParams)),
      ),
    );
  } catch {
    return reply(
      { error: "তালিকা লোড হয়নি। ফিল্টার যাচাই করে আবার চেষ্টা করুন।" },
      400,
    );
  }
}
export async function POST(req: Request) {
  let actor;
  try {
    actor = await admin();
    if (!actor.id) throw Error();
  } catch {
    return reply({ error: "শুধু Admin-এর অনুমতি আছে।" }, 403);
  }
  // Cookie-authenticated JSON endpoint: do not allow cross-site submissions.
  const origin = req.headers.get("origin");
  if (
    !origin ||
    origin !== new URL(req.url).origin ||
    !req.headers.get("content-type")?.startsWith("application/json")
  )
    return reply({ error: "অনুরোধের origin বা format সঠিক নয়।" }, 403);
  try {
    const reader = req.body?.getReader();
    if (!reader) throw Error("খালি অনুরোধ।");
    let size = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > 180000) {
        await reader.cancel();
        return reply({ error: "একটি প্রশ্ন সর্বোচ্চ ১৮০ KB।" }, 413);
      }
      chunks.push(part.value);
    }
    const row = await mutateBank(
      actor.id!,
      JSON.parse(Buffer.concat(chunks).toString("utf8")),
    );
    for (const path of [
      "/admin/questions",
      "/admin/questions/bank",
      "/admin/questions/manage",
      "/question-builder",
    ])
      revalidatePath(path);
    return reply({ row });
  } catch (e) {
    if (e instanceof z.ZodError)
      return reply({ error: e.issues.map((i) => i.message).join(" · ") }, 400);
    const code = (e as { code?: string }).code;
    if (code === "P2034" || code === "P2002")
      return reply(
        { error: "অন্য একটি পরিবর্তন হয়েছে। রিফ্রেশ করে আবার চেষ্টা করুন।" },
        409,
      );
    const message = e instanceof Error ? e.message : "";
    return reply(
      {
        error: /^[\u0980-\u09ff]/.test(message)
          ? message
          : "সেভ হয়নি। আবার চেষ্টা করুন; তথ্য অপরিবর্তিত আছে।",
      },
      400,
    );
  }
}
