import { z } from "zod";

/** Incomplete editor content is intentionally allowed; this is NOT publish validation. */
export const recoveryDraftSchema = z
  .object({
    category: z.string().max(100),
    subject: z.string().max(200),
    topic: z.string().max(500),
    type: z.enum(["MCQ", "CQ", "SQ"]),
    lang: z.enum(["Bangla", "English"]),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
    text: z.string().max(12000),
    explanation: z.string().max(20000),
    correct: z.string().max(1),
    options: z
      .record(z.string().max(100), z.unknown())
      .refine((value) => JSON.stringify(value).length <= 30000),
  })
  .strict();
export const recoverySlotSchema = z
  .string()
  .min(1)
  .max(200)
  .refine((s) => !/[\u0000-\u001f\u007f]/.test(s));
export const recoveryBaseSchema = z
  .string()
  .regex(/^[a-f0-9]{64}$/)
  .nullable();
export const recoveryRecordSchema = z
  .object({
    version: z.literal(1),
    slot: recoverySlotSchema,
    revision: z.uuid(),
    baseRevision: recoveryBaseSchema,
    updatedAt: z.iso.datetime(),
    draft: recoveryDraftSchema,
  })
  .strict();
export type RecoveryRecord = z.infer<typeof recoveryRecordSchema>;
export const recoveryCommandSchema = z.discriminatedUnion("operation", [
  z
    .object({
      operation: z.literal("save"),
      slot: recoverySlotSchema,
      expectedRevision: z.uuid().nullable(),
      baseRevision: recoveryBaseSchema,
      draft: recoveryDraftSchema,
    })
    .strict(),
  z
    .object({
      operation: z.literal("discard"),
      slot: recoverySlotSchema,
      expectedRevision: z.uuid(),
    })
    .strict(),
]);
export type RecoveryCommand = z.infer<typeof recoveryCommandSchema>;
export function deviceRecoveryKey(owner: string, slot: string) {
  return `question-bank-device-draft:v1:${encodeURIComponent(owner)}:${encodeURIComponent(slot)}`;
}
export function parseDeviceRecovery(
  raw: string | null,
  slot: string,
): RecoveryRecord | null {
  if (!raw || raw.length > 180000) return null;
  try {
    const parsed = recoveryRecordSchema.safeParse(JSON.parse(raw));
    return parsed.success && parsed.data.slot === slot ? parsed.data : null;
  } catch {
    return null;
  }
}
