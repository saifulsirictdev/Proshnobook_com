"use server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { walletTransaction } from "@/lib/wallet";
import {
  paperSocialSummary,
  requirePublicPaper,
  socialRelationKey,
  socialUserHash,
} from "@/lib/paper-social";
import { publicAvatar } from "@/lib/social-profiles";
import { randomUUID, createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
export type PaperSocialState = {
  ok: boolean;
  message: string;
  likes?: number;
  liked?: boolean;
  saved?: boolean;
  commentId?: string;
};
async function actor() {
  const id = (await auth())?.user?.id;
  if (
    !id ||
    !(await db.user.findUnique({ where: { id }, select: { id: true } }))
  )
    throw Error("Login required");
  return id;
}
export async function setPaperRelation(
  _: PaperSocialState,
  form: FormData,
): Promise<PaperSocialState> {
  try {
    const id = await actor(),
      paperId = String(form.get("paperId") || ""),
      kind = form.get("kind"),
      on = form.get("on");
    if ((kind !== "like" && kind !== "save") || (on !== "yes" && on !== "no"))
      throw Error();
    const result = await walletTransaction(async (tx) => {
      await requirePublicPaper(paperId, tx);
      const key = socialRelationKey(kind, paperId, id);
      if (on === "yes")
        await tx.setting.upsert({
          where: { key },
          create: {
            key,
            value: JSON.stringify({ paperId, at: new Date().toISOString() }),
          },
          update: {},
        });
      else await tx.setting.deleteMany({ where: { key } });
      return kind === "like"
        ? {
            likes: await tx.setting.count({
              where: { key: { startsWith: `social:like:v1:${paperId}:` } },
            }),
            liked: on === "yes",
          }
        : { saved: on === "yes" };
    });
    revalidatePath("/dashboard/feed-saved");
    return {
      ok: true,
      message:
        kind === "like"
          ? on === "yes"
            ? "পছন্দ করেছেন"
            : "পছন্দ সরিয়েছেন"
          : on === "yes"
            ? "বুকমার্ক হয়েছে—এটি প্রশ্নপত্র কেনা বা সম্পাদিত কপি সেভ নয়।"
            : "বুকমার্ক সরানো হয়েছে",
      ...result,
    };
  } catch {
    return {
      ok: false,
      message: "আপডেট হয়নি। আগে লগইন করুন এবং প্রশ্নপত্রটি প্রকাশিত আছে কি না দেখুন।",
    };
  }
}
export async function addPaperComment(
  _: PaperSocialState,
  form: FormData,
): Promise<PaperSocialState> {
  try {
    const userId = await actor(),
      paperId = String(form.get("paperId") || ""),
      body = String(form.get("body") || "").trim(),
      nonce = String(form.get("nonce") || "");
    if (
      !/^[a-f0-9-]{36}$/.test(nonce) ||
      body.length < 2 ||
      body.length > 800 ||
      /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(body)
    )
      throw Error();
    const commentId = await walletTransaction(async (tx) => {
      await requirePublicPaper(paperId, tx);
      const nonceKey = `social:commentnonce:v1:${socialUserHash(userId)}:${nonce}`,
        prior = await tx.setting.findUnique({ where: { key: nonceKey } });
      if (prior) {
        const old = JSON.parse(prior.value);
        if (
          old.paperId !== paperId ||
          old.bodyHash !== createHash("sha256").update(body).digest("hex")
        )
          throw Error();
        return old.commentId as string;
      }
      const window = Math.floor(Date.now() / 600000),
        quota = `social:commentquota:v1:${socialUserHash(userId)}:${window}`,
        row = await tx.setting.findUnique({ where: { key: quota } }),
        count = row ? Number(row.value) : 0;
      if (!Number.isSafeInteger(count) || count >= 10)
        throw Error("Rate limit");
      const commentId = randomUUID(),
        at = new Date().toISOString(),
        value = JSON.stringify({
          version: 1,
          id: commentId,
          paperId,
          userId,
          body,
          status: "PENDING",
          at,
        });
      await tx.setting.create({
        data: { key: `social:comment:v1:${paperId}:${commentId}`, value },
      });
      await tx.setting.create({
        data: {
          key: nonceKey,
          value: JSON.stringify({
            paperId,
            commentId,
            bodyHash: createHash("sha256").update(body).digest("hex"),
          }),
        },
      });
      await tx.setting.upsert({
        where: { key: quota },
        create: { key: quota, value: String(count + 1) },
        update: { value: String(count + 1) },
      });
      return commentId;
    });
    revalidatePath("/admin/social");
    return {
      ok: true,
      message: "মন্তব্য জমা হয়েছে। ADMIN অনুমোদনের পরে প্রকাশিত হবে।",
      commentId,
    };
  } catch {
    return {
      ok: false,
      message:
        "মন্তব্য জমা হয়নি। লগইন করে ২–৮০০ অক্ষর লিখুন; ১০ মিনিটে সর্বোচ্চ ১০টি মন্তব্য।",
    };
  }
}
export async function loadPaperComments(paperId: string, after?: string) {
  try {
    await requirePublicPaper(paperId);
    const id = (await auth())?.user?.id;
    const prefix = `social:comment:v1:${paperId}:`,
      cursor =
        after && /^[a-f0-9-]{36}$/.test(after) ? prefix + after : undefined;
    const rows = await db.setting.findMany({
      where: {
        key: { startsWith: prefix, ...(cursor ? { gt: cursor } : {}) },
        value: { contains: '"status":"APPROVED"' },
      },
      orderBy: { key: "asc" },
      take: 11,
    });
    const comments = [];
    for (const row of rows.slice(0, 10)) {
      try {
        const c = JSON.parse(row.value);
        if (
          c.paperId !== paperId ||
          c.status !== "APPROVED" ||
          typeof c.body !== "string"
        )
          continue;
        const user = await db.user.findUnique({
          where: { id: c.userId },
          select: { name: true, image: true },
        });
        const avatar = await db.setting.findUnique({
          where: { key: `social:avatar:v1:${c.userId}` },
        });
        comments.push({
          id: String(c.id),
          body: c.body.slice(0, 800),
          name: user?.name || "সাবেক ব্যবহারকারী",
          image: publicAvatar(avatar?.value) || publicAvatar(user?.image),
          at: String(c.at),
          canDelete: c.userId === id,
        });
      } catch {}
    }
    return {
      ok: true as const,
      comments,
      next: rows.length > 10 ? rows[9].key.slice(prefix.length) : null,
    };
  } catch {
    return { ok: false as const, comments: [], next: null };
  }
}
export async function reportPaperComment(
  _: PaperSocialState,
  form: FormData,
): Promise<PaperSocialState> {
  try {
    const id = await actor(),
      paperId = String(form.get("paperId") || ""),
      commentId = String(form.get("commentId") || ""),
      reason = String(form.get("reason") || "").trim();
    if (
      !/^[a-f0-9-]{36}$/.test(commentId) ||
      reason.length < 5 ||
      reason.length > 500
    )
      throw Error();
    await walletTransaction(async (tx) => {
      await requirePublicPaper(paperId, tx);
      const row = await tx.setting.findUnique({
        where: { key: `social:comment:v1:${paperId}:${commentId}` },
      });
      if (!row || JSON.parse(row.value).status !== "APPROVED") throw Error();
      const key = `social:report:v1:${commentId}:${socialUserHash(id)}`;
      if (await tx.setting.findUnique({ where: { key } })) return;
      const quota = `social:reportquota:v1:${socialUserHash(id)}:${Math.floor(Date.now() / 3600000)}`;
      const old = await tx.setting.findUnique({ where: { key: quota } }),
        count = old ? Number(old.value) : 0;
      if (!Number.isSafeInteger(count) || count >= 30)
        throw Error("Report limit");
      await tx.setting.upsert({
        where: { key: quota },
        create: { key: quota, value: String(count + 1) },
        update: { value: String(count + 1) },
      });
      await tx.setting.upsert({
        where: { key },
        create: {
          key,
          value: JSON.stringify({
            paperId,
            commentId,
            reason,
            reporterId: id,
            status: "OPEN",
            at: new Date().toISOString(),
          }),
        },
        update: {},
      });
    });
    revalidatePath("/admin/social");
    return { ok: true, message: "রিপোর্ট জমা হয়েছে। ADMIN যাচাই করবেন।" };
  } catch {
    return {
      ok: false,
      message: "রিপোর্ট জমা হয়নি। লগইন করে ৫–৫০০ অক্ষরে কারণ লিখুন।",
    };
  }
}
export async function moderatePaperComment(
  _: PaperSocialState,
  form: FormData,
): Promise<PaperSocialState> {
  try {
    const id = await actor(),
      paperId = String(form.get("paperId") || ""),
      commentId = String(form.get("commentId") || ""),
      decision = form.get("decision"),
      reason = String(form.get("reason") || "").trim();
    if (
      !/^[a-f0-9]{64}$/.test(paperId) ||
      !/^[a-f0-9-]{36}$/.test(commentId) ||
      !["APPROVED", "HIDDEN", "DELETED"].includes(String(decision))
    )
      throw Error();
    await walletTransaction(async (tx) => {
      const user = await tx.user.findUnique({
          where: { id },
          select: { role: true },
        }),
        key = `social:comment:v1:${paperId}:${commentId}`,
        row = await tx.setting.findUnique({ where: { key } });
      if (!row) throw Error();
      const comment = JSON.parse(row.value),
        admin = user?.role === "ADMIN";
      if (!admin && (comment.userId !== id || decision !== "DELETED"))
        throw Error();
      if (
        admin &&
        (reason.length < 5 ||
          reason.length > 500 ||
          form.get("reviewed") !== "on")
      )
        throw Error();
      if (comment.status === "DELETED" && decision !== "DELETED") throw Error();
      if (decision === "APPROVED") await requirePublicPaper(paperId, tx);
      await tx.setting.update({
        where: { key },
        data: {
          value: JSON.stringify({
            ...comment,
            status: decision,
            reviewerId: id,
            reviewedAt: new Date().toISOString(),
          }),
        },
      });
      await tx.setting.create({
        data: {
          key: `social:commentaudit:v1:${randomUUID()}`,
          value: JSON.stringify({
            paperId,
            commentId,
            reviewerId: id,
            before: comment.status,
            after: decision,
            reason: admin ? reason : "AUTHOR_DELETE",
            at: new Date().toISOString(),
          }),
        },
      });
      // All reports for this comment are considered handled by the explicit moderation decision.
      if (admin) {
        const reports = await tx.setting.findMany({
          where: { key: { startsWith: `social:report:v1:${commentId}:` } },
          take: 100,
        });
        for (const r of reports)
          await tx.setting.update({
            where: { key: r.key },
            data: {
              value: JSON.stringify({
                ...JSON.parse(r.value),
                status: "RESOLVED",
                reviewerId: id,
              }),
            },
          });
      }
    });
    revalidatePath("/admin/social");
    return { ok: true, message: "মন্তব্যের অবস্থা আপডেট হয়েছে।" };
  } catch {
    return {
      ok: false,
      message: "পরিবর্তন হয়নি। অনুমতি, মন্তব্য, প্রকাশিত প্রশ্নপত্র ও কারণ যাচাই করুন।",
    };
  }
}
