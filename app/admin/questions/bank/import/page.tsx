import { admin } from "@/lib/guard";
import { db } from "@/lib/db";
import BankImportWorkspace from "./workspace";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Word / JSON / TXT review import · প্রশ্নব্যাংক",
  robots: { index: false, follow: false },
};
export default async function ImportPage() {
  await admin();
  const scopes = await db.question.findMany({
    distinct: ["category", "subject", "topic"],
    select: { category: true, subject: true, topic: true },
    take: 5000,
    orderBy: [{ category: "asc" }, { subject: "asc" }, { topic: "asc" }],
  });
  return (
    <main className="mx-auto max-w-7xl p-3 md:p-6">
      <BankImportWorkspace scopes={scopes} />
    </main>
  );
}
