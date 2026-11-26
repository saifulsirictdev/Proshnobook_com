import { createHash, randomUUID } from "node:crypto";
import sharp from "sharp";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  bankPostActor,
  bankReply,
  bankRequestBytes,
} from "@/lib/question-bank-http";
import {
  bankDraftSchema,
  bankKind,
  normalizeBankStem,
  BANK_IMAGE_PREFIX,
  questionImagePath,
} from "@/lib/admin-question-bank-schema";
import { mutateBank } from "@/lib/admin-question-bank";
import { extractBankDocx } from "@/lib/question-bank-docx";
import {
  parseBankText,
  MAX_BANK_IMPORT,
  bankUuidFromHex,
} from "@/lib/question-bank-batch";
import { parseQuestionUpload } from "@/lib/question-json-import";
import { NCTB_CLASSES } from "@/lib/nctb-data";
import { nearQuestionScore } from "@/lib/question-bank-editorial";
import { revalidatePath } from "next/cache";
export const runtime = "nodejs";
const scopeSchema = z.object({
  category: z.string().trim().min(1).max(100),
  subject: z.string().trim().min(1).max(200),
  topic: z.string().trim().min(1).max(500),
});
const batchSchema = z
  .object({
    action: z.enum(["check", "save"]),
    batchId: z.string().uuid(),
    fileName: z.string().max(200),
    reviewed: z.boolean(),
    items: z
      .array(
        z
          .object({ entryId: z.string().uuid(), draft: bankDraftSchema })
          .strict(),
      )
      .min(1)
      .max(MAX_BANK_IMPORT),
  })
  .strict();
export async function POST(req: Request) {
  const multipart = req.headers
    .get("content-type")
    ?.startsWith("multipart/form-data");
  let actor;
  try {
    actor = await bankPostActor(
      req,
      multipart ? "multipart/form-data" : "application/json",
    );
  } catch {
    return bankReply(
      { error: "শুধু একই origin-এর Admin অনুরোধ গ্রহণ করা হয়।" },
      403,
    );
  }
  try {
    if (multipart) {
      const form = await new Response(await bankRequestBytes(req, 4200000), {
        headers: { "Content-Type": req.headers.get("content-type")! },
      }).formData();
      const scope = scopeSchema.parse(
        Object.fromEntries(
          ["category", "subject", "topic"].map((k) => [k, form.get(k)]),
        ),
      );
      const file = form.get("file");
      if (!(file instanceof File) || !file.size || file.size > 4000000)
        throw Error("৪ MB-এর মধ্যে .docx বা JSON ফাইল দিন।");
      const fileBytes = Buffer.from(await file.arrayBuffer());
      const batchId = bankUuidFromHex(
        createHash("sha256").update(fileBytes).digest("hex"),
      );
      const warnings: string[] = [];
      let text = "",
        items;
      if (/\.docx$/i.test(file.name)) {
        const extracted = await extractBankDocx(fileBytes, async (input) => {
          const decoder = sharp(input, {
            limitInputPixels: 20000000,
            animated: false,
            failOn: "error",
          });
          const meta = await decoder.metadata();
          if (
            !["png", "jpeg", "webp"].includes(meta.format ?? "") ||
            (meta.pages ?? 1) > 1
          )
            throw Error();
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
          if (bytes.length > 600000) throw Error();
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
          return questionImagePath(id);
        });
        text = extracted.text;
        warnings.push(...extracted.warnings);
        try {
          items = parseBankText(text, scope);
        } catch (e) {
          warnings.push(
            e instanceof Error
              ? e.message
              : "Template অনুসারে টেক্সট সাজিয়ে Parse করুন।",
          );
        }
      } else if (/\.json$/i.test(file.name)) {
        if (file.size > 1000000) throw Error("JSON সর্বোচ্চ ১ MB।");
        const raw = fileBytes.toString("utf8"),
          value = JSON.parse(raw);
        if (value.book && value.edition) {
          const subject = NCTB_CLASSES.find(
            (c) => c.class === scope.category,
          )?.subjects.find((s) => s.name === scope.subject);
          const group =
            subject?.subCategories?.find((g) => g.topics.includes(scope.topic))
              ?.category ?? "";
          const imported = parseQuestionUpload(raw, { ...scope, group });
          items = imported.records.map((q) =>
            bankDraftSchema.parse({
              ...scope,
              text: q.text,
              options: q.options,
              correct: q.correct,
              explanation: q.explanation,
              difficulty: q.difficulty,
              lang: imported.batch.lang,
              type: bankKind(q),
            }),
          );
        } else {
          const candidates = Array.isArray(value) ? value : value.items;
          items = z
            .array(z.unknown())
            .min(1)
            .max(MAX_BANK_IMPORT)
            .parse(candidates)
            .map((q) => {
              const candidate =
                q && typeof q === "object"
                  ? (q as Record<string, unknown>)
                  : {};
              const {
                id: _id,
                approved: _approved,
                source: _source,
                createdAt: _date,
                revision: _revision,
                kind,
                ...rest
              } = candidate;
              return bankDraftSchema.parse({
                ...rest,
                type: rest.type ?? kind,
                ...scope,
              });
            });
          warnings.push(
            "JSON-এর source/approval/ID বিশ্বস্ত হিসেবে গ্রহণ করা হয়নি; নির্বাচিত scope-এ Pending import হবে।",
          );
        }
      } else
        throw Error(
          "শুধু .docx বা .json দিন। পুরোনো .doc আগে Word দিয়ে .docx করুন।",
        );
      if (items && items.length > MAX_BANK_IMPORT)
        throw Error("প্রতি ব্যাচে সর্বোচ্চ ১০০টি প্রশ্ন দিন।");
      return bankReply({
        batchId,
        items: items ?? [],
        text,
        warnings,
        fileName: file.name.slice(0, 200),
      });
    }
    const input = batchSchema.parse(
      JSON.parse((await bankRequestBytes(req, 1200000)).toString("utf8")),
    );
    if (new Set(input.items.map((i) => i.entryId)).size !== input.items.length)
      throw Error("একই entry ID একাধিকবার দেওয়া যাবে না।");
    const first = input.items[0].draft;
    if (
      input.items.some(
        ({ draft: q }) =>
          q.category !== first.category ||
          q.subject !== first.subject ||
          q.topic !== first.topic,
      )
    )
      throw Error("এক ব্যাচে একই শ্রেণি, বিষয় ও অধ্যায় রাখুন।");
    const canonicalId = (entryId: string) =>
      "adminimport_" +
      createHash("sha256")
        .update(JSON.stringify([input.batchId, entryId]))
        .digest("hex");
    const existing = await db.question.findMany({
      where: {
        OR: [
          {
            category: first.category,
            subject: first.subject,
            topic: first.topic,
          },
          { id: { in: input.items.map((item) => canonicalId(item.entryId)) } },
        ],
      },
      select: { id: true, text: true, source: true },
      take: 5001,
    });
    if (existing.length > 5000)
      throw Error("এই অধ্যায় অতিরিক্ত বড়; ছোট scope-এ কাজ করুন।");
    const exact = new Map(existing.map((q) => [normalizeBankStem(q.text), q]));
    const seen = new Set<string>();
    const report = input.items.map(({ entryId, draft }) => {
      const normalized = normalizeBankStem(draft.text),
        match =
          existing.find((q) => q.id === canonicalId(entryId)) ??
          exact.get(normalized),
        inBatch = seen.has(normalized);
      seen.add(normalized);
      return {
        entryId,
        exact: match?.id,
        trashed: match?.source.startsWith("ADMIN_TRASH:"),
        inBatch,
        near: match
          ? []
          : existing
              .map((q) => ({
                id: q.id,
                text: q.text.slice(0, 200),
                score: nearQuestionScore(draft.text, q.text),
              }))
              .filter((q) => q.score >= 0.78)
              .sort((a, b) => b.score - a.score)
              .slice(0, 3),
      };
    });
    if (input.action === "check")
      return bankReply({ report, existingScanned: existing.length });
    if (!input.reviewed)
      throw Error("প্রিভিউ ও duplicate রিপোর্ট দেখে সম্মতি দিন।");
    let inserted = 0,
      skipped = 0;
    const failures: { entryId: string; error: string }[] = [];
    for (const item of input.items) {
      const id = canonicalId(item.entryId);
      if (
        (await db.question.findUnique({
          where: { id },
          select: { id: true },
        })) ||
        report.find((r) => r.entryId === item.entryId)?.exact ||
        report.find((r) => r.entryId === item.entryId)?.inBatch
      ) {
        skipped++;
        continue;
      }
      try {
        await mutateBank(
          actor.id,
          { operation: "create", draft: item.draft },
          {
            id,
            source: `ADMIN_UPLOAD:${input.batchId}`,
            provenance: {
              batchId: input.batchId,
              fileName: input.fileName,
              importedAt: new Date().toISOString(),
              providedByAdmin: true,
              independentlyVerified: false,
            },
          },
        );
        inserted++;
      } catch {
        failures.push({
          entryId: item.entryId,
          error:
            "সেভ হয়নি; প্রশ্ন বদলেছে, duplicate বা concurrent conflict হতে পারে। নতুন করে যাচাই করুন।",
        });
        break;
      }
    }
    await db.setting.upsert({
      where: { key: `question-bank-import:v1:${actor.id}:${input.batchId}` },
      create: {
        key: `question-bank-import:v1:${actor.id}:${input.batchId}`,
        value: JSON.stringify({
          actorId: actor.id,
          fileName: input.fileName,
          at: new Date().toISOString(),
          inserted,
          skipped,
          failures,
        }),
      },
      update: {
        value: JSON.stringify({
          actorId: actor.id,
          fileName: input.fileName,
          at: new Date().toISOString(),
          inserted,
          skipped,
          failures,
        }),
      },
    });
    revalidatePath("/admin/questions/bank");
    return bankReply({
      inserted,
      skipped,
      failures,
      notAttempted: input.items.length - inserted - skipped - failures.length,
      status: "PENDING_NOT_PUBLISHED",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    return bankReply(
      {
        error: /^[\u0980-\u09ff]/.test(message)
          ? message
          : "Import যাচাই হয়নি। Template, প্রয়োজনীয় field ও ফাইল পরীক্ষা করুন। কোনো প্রশ্ন স্বয়ংক্রিয় approve হয়নি।",
      },
      400,
    );
  }
}
