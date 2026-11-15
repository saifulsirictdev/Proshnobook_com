import "server-only";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";

type AttemptKind = "credentials" | "registration";
/** Shared PostgreSQL counters; per-account control, NOT an IP/WAF or bot-defense replacement.
 * Fixed key per kind/hashed identity avoids a new row per time window. No plaintext email/IP stored.
 */
export async function reserveAuthAttempt(
  kind: AttemptKind,
  identity: string,
  now = Date.now(),
): Promise<boolean> {
  const normalized = identity.trim().toLowerCase();
  if (
    !normalized ||
    normalized.length > 254 ||
    !Number.isSafeInteger(now) ||
    now < 0
  )
    return false;
  const period = kind === "credentials" ? 15 * 60_000 : 60 * 60_000;
  const limit = kind === "credentials" ? 10 : 5;
  const window = Math.floor(now / period);
  const key = `security:auth-attempt:v1:${kind}:${createHash("sha256").update(normalized).digest("hex")}`;
  try {
    return await db.$transaction(
      async (tx) => {
        // Serialize only this counter, not wallet/other accounts. Parameters never become SQL text.
        await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(hashtext(${key}))`;
        const row = await tx.setting.findUnique({ where: { key } });
        let count = 0;
        let effectiveWindow = window;
        if (row) {
          const previous = JSON.parse(row.value);
          if (
            !Number.isSafeInteger(previous.window) ||
            !Number.isSafeInteger(previous.count) ||
            previous.count < 0
          )
            return false;
          // A backwards clock does not reset a newer counter.
          if (previous.window >= window) {
            count = previous.count;
            effectiveWindow = previous.window;
          }
        }
        if (count >= limit) return false;
        const value = JSON.stringify({
          window: effectiveWindow,
          count: count + 1,
        });
        await tx.setting.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        });
        return true;
      },
      { maxWait: 3000, timeout: 5000 },
    );
  } catch {
    // Fail closed: no in-memory fallback on a serverless deployment, no private exception details.
    console.warn(
      JSON.stringify({ event: "auth_attempt_store_unavailable", kind }),
    );
    return false;
  }
}
