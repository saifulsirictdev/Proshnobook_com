import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { safeLoginRedirect } from "@/lib/login-redirect";
import LoginDialog from "@/components/auth/login-dialog";
export const dynamic = "force-dynamic";
export const metadata = { title: "লগইন করুন" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeLoginRedirect((await searchParams).next);
  if ((await auth())?.user?.id) redirect(next);
  return (
    <main className="qm-auth-background">
      <LoginDialog next={next} />
    </main>
  );
}
