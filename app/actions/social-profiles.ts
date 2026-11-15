"use server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { walletTransaction, teacherTid } from "@/lib/wallet";
import {
  profileOwner,
  followKey,
  followPrefix,
  OFFICIAL_PROFILE,
} from "@/lib/social-profiles";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
export type SocialState = {
  ok: boolean;
  message: string;
  followers?: number;
  following?: boolean;
};
export async function followProfile(
  _: SocialState,
  form: FormData,
): Promise<SocialState> {
  try {
    const userId = (await auth())?.user?.id;
    if (!userId) throw Error("ফলো করতে আগে লগইন করুন।");
    let tid = String(form.get("tid") || "");
    const desired = form.get("follow");
    if (desired !== "yes" && desired !== "no") throw Error("Invalid request");
    const owner = await profileOwner(tid);
    if (owner?.id === userId) throw Error("নিজেকে ফলো করা যায় না।");
    if (owner?.role === "ADMIN") tid = OFFICIAL_PROFILE;
    const result = await walletTransaction(async (tx) => {
      const actor = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true },
      });
      if (!actor) throw Error("Missing account");
      if (tid === OFFICIAL_PROFILE && actor.role === "ADMIN")
        throw Error("Cannot follow own official profile");
      const key = followKey(tid, userId);
      if (desired === "yes")
        await tx.setting.upsert({
          where: { key },
          create: {
            key,
            value: JSON.stringify({ at: new Date().toISOString() }),
          },
          update: {},
        });
      else await tx.setting.deleteMany({ where: { key } });
      return {
        followers: await tx.setting.count({
          where: { key: { startsWith: followPrefix(tid) } },
        }),
        following: desired === "yes",
      };
    });
    revalidatePath(`/teachers/${tid}`);
    revalidatePath("/");
    return {
      ok: true,
      message: result.following ? "ফলো করেছেন" : "আনফলো করেছেন",
      ...result,
    };
  } catch {
    return {
      ok: false,
      message:
        "ফলো আপডেট হয়নি। লগইন, প্রোফাইল ও নিজের প্রোফাইল নয় কি না যাচাই করুন।",
    };
  }
}
export async function verifyTeacher(
  _: SocialState,
  form: FormData,
): Promise<SocialState> {
  try {
    const reviewer = (await auth())?.user?.id,
      tid = String(form.get("tid") || ""),
      note = String(form.get("note") || "").trim(),
      decision = form.get("verified");
    if (
      !reviewer ||
      tid === OFFICIAL_PROFILE ||
      note.length < 5 ||
      note.length > 500 ||
      form.get("reviewed") !== "on" ||
      (decision !== "yes" && decision !== "no")
    )
      throw Error("পরিচয় যাচাই ও কারণ নিশ্চিত করুন।");
    const owner = await profileOwner(tid);
    if (!owner) throw Error("Missing profile");
    await walletTransaction(async (tx) => {
      const admin = await tx.user.findUnique({
        where: { id: reviewer },
        select: { role: true },
      });
      if (admin?.role !== "ADMIN")
        throw Error("শুধু ADMIN পরিচয় যাচাই করতে পারবেন।");
      const value = JSON.stringify({
          verified: decision === "yes",
          reviewerId: reviewer,
          note,
          at: new Date().toISOString(),
        }),
        key = `social:verified:v1:${owner.id}`;
      await tx.setting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      });
      await tx.setting.create({
        data: {
          key: `social:verifyaudit:v1:${randomUUID()}`,
          value: JSON.stringify({ target: owner.id, ...JSON.parse(value) }),
        },
      });
    });
    revalidatePath(`/teachers/${tid}`);
    revalidatePath("/");
    return { ok: true, message: "যাচাইকরণ আপডেট হয়েছে।" };
  } catch {
    return {
      ok: false,
      message: "যাচাইকরণ হয়নি। ADMIN অনুমতি, পরিচয় যাচাই ও কারণ পরীক্ষা করুন।",
    };
  }
}
export async function savePublicPhoto(
  _: SocialState,
  form: FormData,
): Promise<SocialState> {
  try {
    const id = (await auth())?.user?.id;
    if (
      !id ||
      !(await db.user.findUnique({ where: { id }, select: { id: true } }))
    )
      throw Error();
    const user = await db.user.findUnique({
      where: { id },
      select: { role: true },
    });
    const identity = user?.role === "ADMIN" ? OFFICIAL_PROFILE : id;
    const kind = form.get("kind") === "cover" ? "cover" : "avatar";
    const file = form.get("photo");
    if (!(file instanceof File) || file.size < 100 || file.size > 2_000_000)
      throw Error();
    // Reserve quota before provider writes; do not delete older referenced objects.
    await walletTransaction(async (tx) => {
      const key = `social:photoquota:v1:${id}:${new Date().toISOString().slice(0, 10)}`,
        row = await tx.setting.findUnique({ where: { key } }),
        count = row ? Number(row.value) : 0;
      if (!Number.isSafeInteger(count) || count >= 5) throw Error();
      await tx.setting.upsert({
        where: { key },
        create: { key, value: String(count + 1) },
        update: { value: String(count + 1) },
      });
    });
    const bytes = await sharp(Buffer.from(await file.arrayBuffer()), {
      limitInputPixels: 12_000_000,
    })
      .rotate()
      .resize(kind === "cover" ? 1600 : 512, kind === "cover" ? 600 : 512, {
        fit: "cover",
      })
      .webp({ quality: 85 })
      .toBuffer();
    const blob = await put(`profile-photos/${randomUUID()}.webp`, bytes, {
      access: "public",
      addRandomSuffix: false,
      contentType: "image/webp",
    });
    await walletTransaction(async (tx) => {
      const key = `social:${kind}:v1:${identity}`;
      await tx.setting.upsert({
        where: { key },
        create: { key, value: blob.url },
        update: { value: blob.url },
      });
      const current = await tx.user.findUnique({
        where: { id },
        select: { role: true },
      });
      if (
        !current ||
        (current.role === "ADMIN" ? OFFICIAL_PROFILE : id) !== identity
      )
        throw Error();
      if (kind === "avatar" && identity !== OFFICIAL_PROFILE)
        await tx.user.update({ where: { id }, data: { image: blob.url } });
      const tid = teacherTid(id);
      await tx.setting.upsert({
        where: { key: `teacher:tid:${tid}` },
        create: { key: `teacher:tid:${tid}`, value: id },
        update: {},
      });
    });
    revalidatePath("/dashboard");
    revalidatePath("/profile");
    revalidatePath("/");
    revalidatePath(`/teachers/${teacherTid(id)}`);
    revalidatePath(`/teachers/${OFFICIAL_PROFILE}`);
    return { ok: true, message: "প্রোফাইলের ছবি সেভ হয়েছে।" };
  } catch {
    return {
      ok: false,
      message:
        "ছবি সেভ হয়নি। সর্বোচ্চ ২ MB ছবি দিন; সংযোগ, storage ও দৈনিক ৫ বারের সীমা যাচাই করুন।",
    };
  }
}

export async function savePublicDetails(
  _: SocialState,
  form: FormData,
): Promise<SocialState> {
  try {
    const id = (await auth())?.user?.id;
    const name = String(form.get("name") || "").trim();
    const designation = String(form.get("designation") || "").trim();
    if (
      !id ||
      name.length < 2 ||
      name.length > 100 ||
      designation.length > 160 ||
      /[\u0000-\u001f\u007f]/.test(name + designation)
    )
      throw Error();
    let tid = teacherTid(id);
    await walletTransaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id },
        select: { role: true },
      });
      if (!user) throw Error();
      const identity = user.role === "ADMIN" ? OFFICIAL_PROFILE : id;
      if (user.role === "ADMIN") tid = OFFICIAL_PROFILE;
      const key = `social:profile:v1:${identity}`;
      const value = JSON.stringify({ name, designation });
      await tx.setting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      });
      const mapping = `teacher:tid:${teacherTid(id)}`;
      await tx.setting.upsert({
        where: { key: mapping },
        create: { key: mapping, value: id },
        update: {},
      });
    });
    revalidatePath(`/teachers/${tid}`);
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/profile");
    return { ok: true, message: "নাম ও পদবি সেভ হয়েছে।" };
  } catch {
    return {
      ok: false,
      message: "সেভ হয়নি। নাম ২–১০০ এবং পদবি সর্বোচ্চ ১৬০ অক্ষর দিন।",
    };
  }
}
