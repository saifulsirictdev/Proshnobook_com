import { auth } from "@/auth";
import { db } from "@/lib/db";
import { safeLoginRedirect } from "@/lib/login-redirect";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Resolve only after OAuth has established the session; never trust a URL role. */
export default async function LoginLanding({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const target = safeLoginRedirect(next);
  // Avoid a manually supplied landing URL causing a redirect loop.
  const fallback =
    new URL(target, "https://local.invalid").pathname === "/auth/landing"
      ? "/"
      : target;
  const id = (await auth())?.user?.id;
  if (!id) redirect(`/login?${new URLSearchParams({ next: fallback })}`);
  const user = await db.user.findUnique({
    where: { id },
    select: { role: true },
  });
  if (!user) redirect("/login");
  redirect(user.role === "ADMIN" ? "/teachers/proshnobook" : fallback);
}
