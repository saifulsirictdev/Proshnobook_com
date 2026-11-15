import "server-only";
import { db } from "@/lib/db";
import { teacherTid } from "@/lib/wallet";
import { createHash } from "node:crypto";
export const OFFICIAL_PROFILE = "proshnobook";
export function followPrefix(tid: string) {
  return `social:follow:v1:${tid}:`;
}
export function followKey(tid: string, userId: string) {
  return followPrefix(tid) + createHash("sha256").update(userId).digest("hex");
}
export function publicAvatar(raw: unknown) {
  if (typeof raw !== "string") return null;
  try {
    const u = new URL(raw);
    return u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      (/(^|\.)googleusercontent\.com$/.test(u.hostname) ||
        /^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/.test(u.hostname))
      ? u.href
      : null;
  } catch {
    return null;
  }
}
export async function profileOwner(tid: string) {
  if (tid === OFFICIAL_PROFILE) return null;
  if (!/^QB-[A-F0-9]{20}$/.test(tid)) throw Error("Invalid profile");
  const row = await db.setting.findUnique({
    where: { key: `teacher:tid:${tid}` },
  });
  if (!row || teacherTid(row.value) !== tid) throw Error("Missing profile");
  const user = await db.user.findUnique({
    where: { id: row.value },
    select: { id: true, name: true, image: true, role: true },
  });
  if (!user) throw Error("Missing account");
  return user;
}
export async function publicProfile(tid: string, viewerId?: string) {
  let user = await profileOwner(tid);
  if (user?.role === "ADMIN") {
    tid = OFFICIAL_PROFILE;
    user = null;
  }
  const official = tid === OFFICIAL_PROFILE;
  const viewer =
    official && viewerId
      ? await db.user.findUnique({
          where: { id: viewerId },
          select: { role: true },
        })
      : null;
  const identity = official ? OFFICIAL_PROFILE : user!.id;
  const customRow = await db.setting.findUnique({
    where: { key: `social:profile:v1:${identity}` },
  });
  let custom: { name?: string; designation?: string } = {};
  try {
    custom = JSON.parse(customRow?.value || "{}");
  } catch {}
  const coverRow = await db.setting.findUnique({
    where: { key: `social:cover:v1:${identity}` },
  });
  const [followers, follow, verified, avatar] = await Promise.all([
    db.setting.count({ where: { key: { startsWith: followPrefix(tid) } } }),
    viewerId
      ? db.setting.findUnique({ where: { key: followKey(tid, viewerId) } })
      : null,
    user
      ? db.setting.findUnique({
          where: { key: `social:verified:v1:${user.id}` },
        })
      : null,
    db.setting.findUnique({ where: { key: `social:avatar:v1:${identity}` } }),
  ]);
  let isVerified = false;
  try {
    isVerified = !!verified && JSON.parse(verified.value).verified === true;
  } catch {}
  return {
    tid,
    name:
      (typeof custom.name === "string" && custom.name.trim()) ||
      user?.name ||
      (tid === OFFICIAL_PROFILE ? "প্রশ্নবুক.কম" : "শিক্ষক"),
    designation:
      typeof custom.designation === "string" ? custom.designation : "",
    cover: publicAvatar(coverRow?.value),
    image:
      tid === OFFICIAL_PROFILE
        ? publicAvatar(avatar?.value) || "/questionmaker-icon.png"
        : publicAvatar(avatar?.value) || publicAvatar(user?.image),
    verified: tid === OFFICIAL_PROFILE || isVerified,
    official: tid === OFFICIAL_PROFILE,
    followers,
    following: !!follow,
    isSelf: official
      ? viewer?.role === "ADMIN"
      : !!user && user.id === viewerId,
  };
}
export type PublicSocialProfile = Awaited<ReturnType<typeof publicProfile>>;
