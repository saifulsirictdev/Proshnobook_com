import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { questionTypeWhere } from "@/lib/question-types";
import {
  BANK_AUDIT_PREFIX,
  BANK_TRASH_PREFIX,
  BANK_IMAGE_PREFIX,
  BANK_PAGE_SIZE,
  bankDraftSchema,
  bankKind,
  normalizeBankStem,
  type BankFilters,
  type BankQuestion,
  type BankRow,
  bankMutationSchema,
} from "./admin-question-bank-schema";

export const TRASH_SOURCE = "ADMIN_TRASH:v1:";
export function bankRevision(q: BankQuestion) {
  return createHash("sha256")
    .update(
      JSON.stringify([
        q.id,
        q.category,
        q.subject,
        q.topic,
        q.difficulty,
        q.lang,
        q.text,
        q.options,
        q.correct,
        q.explanation,
        q.approved,
        q.source,
      ]),
    )
    .digest("hex");
}
export function bankRow(q: BankQuestion): BankRow {
  return {
    ...q,
    createdAt: new Date(q.createdAt).toISOString(),
    revision: bankRevision(q),
    kind: bankKind(q),
  };
}
export function bankWhere(f: BankFilters): Prisma.QuestionWhereInput {
  return {
    AND: [
      {
        source:
          f.status === "trash"
            ? { startsWith: TRASH_SOURCE }
            : { not: { startsWith: TRASH_SOURCE } },
      },
      ...(f.category ? [{ category: f.category }] : []),
      ...(f.subject ? [{ subject: f.subject }] : []),
      ...(f.topic ? [{ topic: f.topic }] : []),
      ...(f.difficulty !== "ALL" ? [{ difficulty: f.difficulty }] : []),
      ...(f.q
        ? [
            {
              OR: [
                { text: { contains: f.q, mode: "insensitive" as const } },
                { id: f.q },
              ],
            },
          ]
        : []),
      ...(f.status === "pending"
        ? [{ approved: false }]
        : f.status === "approved"
          ? [{ approved: true }]
          : []),
      questionTypeWhere(f.kind === "SQ" ? "SHORT" : f.kind),
    ],
  };
}
export async function loadBank(f: BankFilters) {
  const where = bankWhere(f);
  const [total, rows, counts] = await Promise.all([
    db.question.count({ where }),
    db.question.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      skip: (f.page - 1) * BANK_PAGE_SIZE,
      take: BANK_PAGE_SIZE,
    }),
    Promise.all(
      ["approved", "pending", "trash"].map((status) =>
        db.question.count({
          where: bankWhere({
            ...f,
            status: status as BankFilters["status"],
            page: 1,
          }),
        }),
      ),
    ),
  ]);
  return {
    total,
    rows: rows.map(bankRow),
    counts: { approved: counts[0], pending: counts[1], trash: counts[2] },
    pageSize: BANK_PAGE_SIZE,
  };
}
function userError(message: string): never {
  throw new Error(message);
}
// All mutation entrypoints use this transaction. A full-row revision prevents
// stale editors/reviewers from overwriting another admin's changes.
export async function mutateBank(
  actorId: string,
  raw: unknown,
  context?: { id: string; source: string; provenance: Record<string, unknown> },
) {
  let command = bankMutationSchema.parse(raw);
  const requestedOperation = command.operation;
  return db.$transaction(
    async (tx) => {
      const old =
        command.operation === "create"
          ? null
          : await tx.question.findUnique({ where: { id: command.id } });
      if (
        command.operation !== "create" &&
        (!old || bankRevision(old) !== command.revision)
      )
        userError(
          "প্রশ্ন বদলেছে বা পাওয়া যায়নি। তালিকা রিফ্রেশ করে আবার খুলুন।",
        );
      const trashed = old?.source.startsWith(TRASH_SOURCE) ?? false;
      if (command.operation !== "restore" && trashed)
        userError("আগে Trash থেকে Restore করুন।");
      if (command.operation === "restore" && !trashed)
        userError("প্রশ্নটি Trash-এ নেই।");
      if (command.operation === "rollback") {
        if (!command.snapshotKey.startsWith(`${BANK_AUDIT_PREFIX}${old!.id}:`))
          userError("এই প্রশ্নের snapshot নয়।");
        const saved = await tx.setting.findUnique({
          where: { key: command.snapshotKey },
        });
        if (!saved) userError("ইতিহাস পাওয়া যায়নি।");
        const snapshot = JSON.parse(saved!.value)[command.version];
        if (!snapshot || snapshot.id !== old!.id)
          userError("এই সংস্করণ পাওয়া যায়নি।");
        const draft = bankDraftSchema.parse({
          category: snapshot.category,
          subject: snapshot.subject,
          topic: snapshot.topic,
          lang: snapshot.lang,
          difficulty: snapshot.difficulty,
          text: snapshot.text,
          options: snapshot.options,
          correct: snapshot.correct,
          explanation: snapshot.explanation,
          type: bankKind(snapshot),
        });
        command = {
          operation: "edit",
          id: old!.id,
          revision: command.revision,
          draft,
        };
      }
      let after;
      if (command.operation === "create" || command.operation === "edit") {
        const { type: _type, ...draft } = command.draft;
        // Never accept provenance/authoring metadata supplied by a browser. Keep
        // server-owned metadata from the original record on edits.
        const oldOptions =
          old?.options &&
          typeof old.options === "object" &&
          !Array.isArray(old.options)
            ? (old.options as Record<string, Prisma.JsonValue>)
            : {};
        const options: Record<string, unknown> = Object.fromEntries(
          Object.entries(draft.options).filter(([k]) => !k.startsWith("_")),
        );
        for (const [key, value] of Object.entries(oldOptions))
          if (key.startsWith("_")) options[key] = value;
        if (!old && context)
          options._provenance = {
            kind: "ADMIN_REVIEWED_IMPORT",
            ...context.provenance,
          };
        // Only server-uploaded image references are allowed; arbitrary external
        // Markdown remains literal in the shared question renderer.
        const imageRefs = [
          ...JSON.stringify([draft.text, options, draft.explanation]).matchAll(
            /\/api\/question-bank\/images\/([a-f0-9-]+)\.webp/g,
          ),
        ].map((m) => m[1]);
        for (const image of new Set(imageRefs))
          if (
            !(await tx.setting.findUnique({
              where: { key: BANK_IMAGE_PREFIX + image },
            }))
          )
            userError("প্রশ্নের ছবিটি পাওয়া যায়নি; আবার আপলোড করুন।");
        const existing = await tx.question.findMany({
          where: {
            category: draft.category,
            subject: draft.subject,
            topic: draft.topic,
            ...(old ? { id: { not: old.id } } : {}),
          },
          select: { text: true },
          take: 10001,
        });
        if (existing.length > 10000)
          userError(
            "এই অধ্যায় অতিরিক্ত বড়; duplicate যাচাইয়ের জন্য ছোট অধ্যায়ে ভাগ করুন।",
          );
        if (
          existing.some(
            (q) => normalizeBankStem(q.text) === normalizeBankStem(draft.text),
          )
        )
          userError("একই অধ্যায়ে এই প্রশ্ন ইতিমধ্যে আছে (Trash-সহ)।");
        const data = {
          ...draft,
          options: options as Prisma.InputJsonValue,
          approved: false,
        };
        after = old
          ? await tx.question.update({ where: { id: old.id }, data })
          : await tx.question.create({
              data: {
                ...data,
                ...(context ? { id: context.id } : {}),
                source: context?.source ?? "ADMIN_MANUAL",
              },
            });
      } else if (command.operation === "trash") {
        await tx.setting.create({
          data: {
            key: BANK_TRASH_PREFIX + old!.id,
            value: JSON.stringify({
              actorId,
              at: new Date().toISOString(),
              originalSource: old!.source,
            }),
          },
        });
        // Keep ID, text and options to block deterministic reimports and retain
        // saved-paper references. All public bank readers require approved=true.
        after = await tx.question.update({
          where: { id: old!.id },
          data: { approved: false, source: TRASH_SOURCE + old!.source },
        });
      } else if (command.operation === "restore") {
        const tombstone = await tx.setting.findUnique({
          where: { key: BANK_TRASH_PREFIX + old!.id },
        });
        if (!tombstone)
          userError("Trash receipt নেই; স্বয়ংক্রিয় Restore বন্ধ রাখা হয়েছে।");
        const original = JSON.parse(tombstone!.value);
        if (typeof original.originalSource !== "string")
          userError("Trash receipt সঠিক নয়।");
        after = await tx.question.update({
          where: { id: old!.id },
          data: { source: original.originalSource, approved: false },
        });
        await tx.setting.delete({
          where: { key: BANK_TRASH_PREFIX + old!.id },
        });
      } else {
        if (command.operation === "approve") {
          // Old imported records can be browsed but must satisfy today's editor
          // validation before a new approval is issued here.
          const check = bankMutationSchema.safeParse({
            operation: "create",
            draft: {
              category: old!.category,
              subject: old!.subject,
              topic: old!.topic,
              lang: old!.lang,
              difficulty: old!.difficulty,
              text: old!.text,
              options: old!.options,
              correct: old!.correct,
              explanation: old!.explanation,
              type: bankKind(old!),
            },
          });
          if (!check.success || !old!.explanation.trim())
            userError(
              "অনুমোদনের আগে Editor-এ প্রশ্ন, অপশন/অংশ ও উত্তর সম্পূর্ণ করুন।",
            );
        }
        after = await tx.question.update({
          where: { id: old!.id },
          data: { approved: command.operation === "approve" },
        });
      }
      await tx.setting.create({
        data: {
          key: `${BANK_AUDIT_PREFIX}${after.id}:${new Date().toISOString()}:${randomUUID()}`,
          value: JSON.stringify({
            operation: requestedOperation,
            actorId,
            at: new Date().toISOString(),
            before: old,
            after,
          }),
        },
      });
      return bankRow(after);
    },
    { isolationLevel: "Serializable", timeout: 20000 },
  );
}
