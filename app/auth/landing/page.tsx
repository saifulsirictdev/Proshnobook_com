import { accountType, accountDestination } from "@/lib/account-type";
import { auth } from "@/auth";
import { accountChoiceState } from "@/lib/account-onboarding";
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
  const user = await accountChoiceState(id);
  if (!user) redirect("/login");
  if (user.role === "ADMIN") redirect("/teachers/proshnobook");
  if (user.needsChoice) redirect("/auth/onboarding");
  const type = accountType(user.identity);
  if (user.role === "STUDENT") redirect("/model-test");
  redirect(type ? accountDestination(type) : fallback);
}
