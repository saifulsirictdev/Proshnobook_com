import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { ACCOUNT_TYPE_PREFIX, accountType, capabilityRole, type AccountType } from "@/lib/account-type";

// Concurrent login/choice requests must not overwrite a completed choice or an
// admin role change. PostgreSQL serializable conflicts are safe to retry.
async function transaction<T>(work: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await db.$transaction(work, { isolationLevel: "Serializable" });
    } catch (error) {
      if (attempt >= 2 || (error as { code?: string })?.code !== "P2034") throw error;
    }
  }
}

/** Repair only unclassified Student accounts, regardless of login provider.
 * A saved choice (including STUDENT), existing Teacher and Admin are preserved.
 * An unknown marker fails closed rather than granting a new choice.
 */
export async function accountChoiceState(id: string) {
  return transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id }, select: { role: true } });
    if (!user) return null;
    const key = ACCOUNT_TYPE_PREFIX + id;
    const identity = user.role === "STUDENT"
      ? await tx.setting.upsert({ where: { key }, create: { key, value: "PENDING" }, update: {} })
      : await tx.setting.findUnique({ where: { key } });
    return { role: user.role, identity: identity?.value ?? null,
      needsChoice: user.role === "STUDENT" && identity?.value === "PENDING" };
  });
}

class RoleChanged extends Error {}

/** Authenticated identity comes from the server session, never from the form. */
export async function chooseAccountType(id: string, type: AccountType): Promise<boolean> {
  if (!accountType(type)) return false;
  try {
    return await transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id }, select: { role: true } });
      if (!user || user.role !== "STUDENT") return false;
      const key = ACCOUNT_TYPE_PREFIX + id;
      // Covers a direct form request from a legacy/unclassified account too.
      const identity = await tx.setting.upsert({ where: { key }, create: { key, value: "PENDING" }, update: {} });
      if (identity.value !== "PENDING") return false;
      const claim = await tx.setting.updateMany({ where: { key, value: "PENDING" }, data: { value: type } });
      if (claim.count !== 1) return false;
      const changed = await tx.user.updateMany({ where: { id, role: "STUDENT" }, data: { role: capabilityRole(type) } });
      // Throw to roll back the claimed marker as well, not leave partial state.
      if (changed.count !== 1) throw new RoleChanged();
      return true;
    });
  } catch (error) {
    if (error instanceof RoleChanged) return false;
    throw error;
  }
}
