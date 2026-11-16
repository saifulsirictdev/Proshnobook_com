import { auth } from "@/auth";
import { redirect } from "next/navigation";
export default async function ReadyLayout({ children }: { children: React.ReactNode }) {
  if ((await auth())?.user?.role === "STUDENT") redirect("/model-test");
  return <>{children}</>;
}
