import { auth } from "@/auth";
import { db } from "@/lib/db";
import { teacherTid } from "@/lib/wallet";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function MyPublicProfile() {
  const id = (await auth())?.user?.id;
  if (!id) redirect("/login?next=/my-profile");
  const user = await db.user.findUnique({
    where: { id },
    select: { role: true },
  });
  if (!user) redirect("/login?next=/my-profile");
  redirect(
    `/teachers/${user.role === "ADMIN" ? "proshnobook" : teacherTid(id)}`,
  );
}
