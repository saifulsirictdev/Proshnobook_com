import Link from "next/link";
import { admin } from "@/lib/guard";
import { db } from "@/lib/db";
import { loadBank } from "@/lib/admin-question-bank";
import { bankFiltersSchema } from "@/lib/admin-question-bank-schema";
import QuestionBankWorkspace from "./workspace";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "প্রশ্নব্যাংক স্টুডিও · Admin",
  robots: { index: false, follow: false },
};
export default async function QuestionBankPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await admin();
  const parsed = bankFiltersSchema.safeParse(await searchParams);
  const filters = parsed.success ? parsed.data : bankFiltersSchema.parse({});
  const [initial, scopes] = await Promise.all([
    loadBank(filters),
    db.question.findMany({
      distinct: ["category", "subject", "topic"],
      select: { category: true, subject: true, topic: true },
      take: 5000,
      orderBy: [{ category: "asc" }, { subject: "asc" }, { topic: "asc" }],
    }),
  ]);
  return (
    <main className="mx-auto max-w-screen-2xl space-y-6 p-3 md:p-6">
      <nav className="flex flex-wrap gap-3 text-sm text-slate-500">
        <Link href="/admin" className="hover:text-blue-700">
          Admin dashboard
        </Link>
        <span>/</span>
        <span>প্রশ্নব্যাংক স্টুডিও</span>
      </nav>
      <QuestionBankWorkspace
        initial={initial}
        initialFilters={filters}
        scopes={scopes}
        draftOwner={actor.id}
      />
    </main>
  );
}
