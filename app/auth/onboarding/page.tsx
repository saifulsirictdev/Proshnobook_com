import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ACCOUNT_TYPE_PREFIX, accountType, accountDestination, capabilityRole } from "@/lib/account-type";
export const dynamic = "force-dynamic";
export const metadata = { title: "আপনার পরিচয় বেছে নিন", robots: { index: false, follow: false } };
async function choose(form: FormData) {
  "use server";
  const id = (await auth())?.user?.id;
  if (!id) redirect("/login");
  const type = accountType(form.get("accountType"));
  if (!type) redirect("/auth/onboarding");
  // Conditional one-time claim and role assignment are atomic. Existing users/admins
  // cannot use this endpoint to change identity or grant themselves admin rights.
  const changed = await db.$transaction(async tx => {
    const user = await tx.user.findUnique({ where: { id }, select: { role: true } });
    if (!user || user.role !== "STUDENT") return false;
    const claim = await tx.setting.updateMany({ where: { key: ACCOUNT_TYPE_PREFIX + id, value: "PENDING" }, data: { value: type } });
    if (claim.count !== 1) return false;
    await tx.user.update({ where: { id }, data: { role: capabilityRole(type) } });
    return true;
  });
  redirect(changed ? accountDestination(type) : "/auth/landing");
}
export default async function Onboarding() {
  const id = (await auth())?.user?.id;
  if (!id) redirect("/login");
  const identity = await db.setting.findUnique({ where: { key: ACCOUNT_TYPE_PREFIX + id } });
  if (identity?.value !== "PENDING") redirect("/auth/landing");
  return <main className="mx-auto max-w-4xl px-4 py-12">
    <p className="text-sm font-semibold text-violet-700">প্রশ্নবুকে স্বাগতম</p>
    <h1 className="mt-2 text-2xl font-bold text-slate-900">আপনি কী হিসেবে যোগ দিতে চান?</h1>
    <p className="mt-3 text-slate-600">Google সংযোগ সম্পন্ন হয়েছে। আপনার কাজ অনুযায়ী একটি পরিচয় বেছে নিন। এই নির্বাচন পরে নিজে পরিবর্তন করা যাবে না।</p>
    <form action={choose} className="mt-7 grid gap-4 sm:grid-cols-3">
      {[
        { type: "TEACHER", title: "Teacher", bn: "শিক্ষক", text: "প্রশ্নপত্র তৈরি, সংরক্ষণ ও প্রকাশের আবেদনসহ শিক্ষক dashboard ব্যবহার করুন।" },
        { type: "STUDENT", title: "Student", bn: "শিক্ষার্থী", text: "Live exam ও practice-এ অংশ নিন, নিজের ফলাফল দেখুন। প্রশ্নপত্র তৈরির editor থাকবে না।" },
        { type: "CONTRIBUTOR", title: "Contributor", bn: "কনট্রিবিউটর", text: "শিক্ষকের মতো প্রশ্ন তৈরি ও সংরক্ষণ করুন এবং প্রকাশের জন্য জমা দিন।" },
      ].map(item => <button key={item.type} name="accountType" value={item.type} className="rounded-2xl border border-violet-200 bg-white p-5 text-left shadow-sm transition hover:border-violet-500 hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600">
        <span className="block text-xl font-bold text-slate-900">{item.title}</span><span className="mt-1 block font-semibold text-violet-700">{item.bn}</span><span className="mt-3 block text-sm leading-6 text-slate-600">{item.text}</span><span className="mt-5 block text-sm font-semibold text-violet-700">এভাবে শুরু করুন →</span>
      </button>)}
    </form>
    <p className="mt-6 text-sm text-slate-500">Teacher ও Contributor পরিচয়ে Admin-এর অর্থ অনুমোদন বা user management-এর ক্ষমতা দেওয়া হয় না। প্রকাশে বিদ্যমান Admin অনুমোদনের নিয়ম বহাল থাকবে।</p>
  </main>;
}
