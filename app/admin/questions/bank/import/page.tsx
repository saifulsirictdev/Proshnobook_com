import { admin } from "@/lib/guard";
import BankImportWorkspace from "./workspace";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Word / JSON review import · প্রশ্নব্যাংক",
  robots: { index: false, follow: false },
};
export default async function ImportPage() {
  await admin();
  return (
    <main className="mx-auto max-w-7xl p-3 md:p-6">
      <BankImportWorkspace />
    </main>
  );
}
