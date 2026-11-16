import { auth } from "@/auth";
import { redirect } from "next/navigation";

/** Shared server-side guard. Private child routes must not rely on client UI checks. */
export default async function ProtectedQuestionBuilder({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=%2Fquestion-builder");
  if (session.user.role === "STUDENT") redirect("/model-test");
  return <>{children}</>;
}
