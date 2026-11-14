import "@/components/saved-papers.css";
import Link from "next/link";
import { listReadyPurchases } from "@/app/actions/ready-commerce";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listPapers } from "@/app/actions/qb-papers";
import QbSavedList from "@/components/qb-saved-list";

export const dynamic = "force-dynamic";
export const metadata = { title: "আমার তৈরি প্রশ্ন" };

export default async function SavedPapers() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/question-builder/saved");
  const [papers, ready] = await Promise.all([
    listPapers().catch(() => null),
    listReadyPurchases().catch(() => null),
  ]);

  return (
    <main className="saved-papers-page">
      <section
        className="mb-6 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm"
        aria-labelledby="saved-ready-title"
      >
        <h2
          id="saved-ready-title"
          className="text-xl font-bold text-indigo-950"
        >
          রেডি প্রশ্নপত্র / PDF থেকে তৈরি
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          অ্যাকাউন্টে সংরক্ষিত কপি খুলে আবার সম্পাদনা ও প্রিন্ট করুন।
        </p>
        {ready === null ? (
          <p role="alert">রেডি প্রশ্নপত্রের তালিকা লোড হয়নি। আবার চেষ্টা করুন।</p>
        ) : ready.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            এখনো কোনো রেডি প্রশ্নপত্র সংরক্ষিত নেই।
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {ready.map((p) => (
              <article
                key={p.id}
                className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <h3 className="break-words font-bold text-slate-900">
                  {p.title}
                </h3>
                <p className="my-2 text-sm text-slate-600">
                  {p.selected.length} পৃষ্ঠা · সর্বশেষ সেভ:{" "}
                  {new Date(p.updatedAt).toLocaleString("bn-BD", {
                    timeZone: "Asia/Dhaka",
                  })}
                </p>
                <Link
                  className="inline-block rounded-lg bg-indigo-700 px-4 py-2 font-semibold text-white"
                  href={`/ready-papers/${p.paperId}?saved=${p.id}`}
                >
                  প্রশ্নপত্র খুলুন →
                </Link>
              </article>
            ))}
          </div>
        )}
        <Link
          href="/ready-papers/saved"
          className="mt-4 inline-block text-sm font-semibold text-indigo-700 underline"
        >
          সব রেডি প্রশ্নপত্র ও উত্তরপত্র →
        </Link>
      </section>
      {papers ? (
        <QbSavedList papers={papers} />
      ) : (
        <div role="alert" className="saved-paper-error">
          প্রশ্নপত্রের তালিকা লোড হয়নি। পৃষ্ঠাটি রিফ্রেশ করে আবার চেষ্টা করুন।
        </div>
      )}
    </main>
  );
}
