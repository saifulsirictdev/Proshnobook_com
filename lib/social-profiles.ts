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
    select: { id: true, name: true, image: true },
  });
  if (!user) throw Error("Missing account");
  return user;
}
export async function publicProfile(tid: string, viewerId?: string) {
  const user = await profileOwner(tid);
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
    user
      ? db.setting.findUnique({ where: { key: `social:avatar:v1:${user.id}` } })
      : null,
  ]);
  let isVerified = false;
  try {
    isVerified = !!verified && JSON.parse(verified.value).verified === true;
  } catch {}
  return {
    tid,
    name: user?.name || (tid === OFFICIAL_PROFILE ? "প্রশ্নবুক.কম" : "শিক্ষক"),
    image:
      tid === OFFICIAL_PROFILE
        ? "/logo.png"
        : publicAvatar(avatar?.value) || publicAvatar(user?.image),
    verified: tid === OFFICIAL_PROFILE || isVerified,
    official: tid === OFFICIAL_PROFILE,
    followers,
    following: !!follow,
    isSelf: !!user && user.id === viewerId,
  };
}
export type PublicSocialProfile = Awaited<ReturnType<typeof publicProfile>>;
