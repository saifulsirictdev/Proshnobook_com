import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import AutoModelSetup from "@/components/auto-model-setup";
import { autoModelSetupSummary } from "@/lib/auto-model-syllabus";
export const dynamic = "force-dynamic";
export const metadata = { title: "Auto Model — প্রশ্নপত্র" };
export default async function AutoModelPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    subject?: string;
    variant?: string;
  }>;
}) {
  const user = (await auth())?.user;
  if (!user?.id) redirect("/login?next=/question-builder");
  if (user.role === "STUDENT") redirect("/model-test");
  const p = await searchParams;
  if (
    typeof p.category !== "string" ||
    typeof p.subject !== "string" ||
    typeof p.variant !== "string" ||
    !autoModelSetupSummary(p.category, p.subject, p.variant)
  )
    notFound();
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <AutoModelSetup
        category={p.category}
        subject={p.subject}
        variant={p.variant as "MCQ" | "CQ"}
      />
    </main>
  );
}
