import { createHash, randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import {
  recoveryCommandSchema,
  recoveryRecordSchema,
  recoverySlotSchema,
  type RecoveryRecord,
} from "./question-bank-recovery-schema";
const PREFIX = "question-bank-recovery:v1:";
export class RecoveryError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
function prefix(owner: string) {
  if (!owner) throw new RecoveryError(403, "Admin পরিচয় প্রয়োজন।");
  return PREFIX + createHash("sha256").update(owner).digest("hex") + ":";
}
function key(owner: string, slot: string) {
  return (
    prefix(owner) +
    createHash("sha256").update(recoverySlotSchema.parse(slot)).digest("hex")
  );
}
function decode(value: string): RecoveryRecord {
  let json: unknown;
  try {
    json = JSON.parse(value);
  } catch {
    throw new RecoveryError(
      409,
      "সংরক্ষিত খসড়া পড়া যায়নি; কোনো content বদলায়নি।",
    );
  }
  const parsed = recoveryRecordSchema.safeParse(json);
  if (!parsed.success)
    throw new RecoveryError(
      409,
      "সংরক্ষিত খসড়ার গঠন পড়া যায়নি; কোনো content বদলায়নি।",
    );
  return parsed.data;
}
export async function loadQuestionRecovery(owner: string, slot: string) {
  const row = await db.setting.findUnique({ where: { key: key(owner, slot) } });
  const record = row ? decode(row.value) : null;
  if (record && record.slot !== slot)
    throw new RecoveryError(409, "Recovery slot মেলেনি; কোনো পরিবর্তন হয়নি।");
  return record;
}
export async function mutateQuestionRecovery(owner: string, raw: unknown) {
  const command = recoveryCommandSchema.parse(raw),
    recordKey = key(owner, command.slot);
  try {
    return await db.$transaction(
      async (tx) => {
        const old = await tx.setting.findUnique({ where: { key: recordKey } });
        const current = old ? decode(old.value) : null;
        if (current && current.slot !== command.slot)
          throw new RecoveryError(
            409,
            "Recovery slot মেলেনি; কোনো পরিবর্তন হয়নি।",
          );
        if ((current?.revision ?? null) !== command.expectedRevision)
          throw new RecoveryError(
            409,
            "অন্য ট্যাব/ডিভাইসে খসড়া বদলেছে। আগে সেই সংস্করণ দেখুন; overwrite হয়নি।",
          );
        if (command.operation === "discard") {
          if (!old) throw new RecoveryError(409, "খসড়া আগে সরানো হয়েছে।");
          const deleted = await tx.setting.deleteMany({
            where: { key: recordKey, value: old.value },
          });
          if (deleted.count !== 1)
            throw new RecoveryError(409, "খসড়া বদলেছে; মুছে ফেলা হয়নি।");
          return null;
        }
        const record: RecoveryRecord = {
          version: 1,
          slot: command.slot,
          revision: randomUUID(),
          baseRevision: command.baseRevision,
          updatedAt: new Date().toISOString(),
          draft: command.draft,
        };
        const value = JSON.stringify(record);
        if (!old) {
          if (
            (await tx.setting.count({
              where: { key: { startsWith: prefix(owner) } },
            })) >= 25
          )
            throw new RecoveryError(
              409,
              "২৫টি recovery খসড়ার সীমা পূর্ণ। পুরোনো editor খুলে recovery মুছুন, তারপর চেষ্টা করুন।",
            );
          await tx.setting.create({ data: { key: recordKey, value } });
        } else {
          const updated = await tx.setting.updateMany({
            where: { key: recordKey, value: old.value },
            data: { value },
          });
          if (updated.count !== 1)
            throw new RecoveryError(409, "খসড়া বদলেছে; overwrite হয়নি।");
        }
        return record;
      },
      { isolationLevel: "Serializable" },
    );
  } catch (error) {
    if (error instanceof RecoveryError) throw error;
    if (
      typeof error === "object" &&
      error &&
      "code" in error &&
      ["P2002", "P2034"].includes(String(error.code))
    )
      throw new RecoveryError(
        409,
        "একই সময়ে খসড়া বদলেছে। Reload করে সংস্করণ দেখুন; overwrite হয়নি।",
      );
    throw error;
  }
}
