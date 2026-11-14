import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  MARKET_PREFIX,
  marketMetadataSchema,
  type MarketSubmission,
} from "@/lib/marketplace";
import {
  HOME_GRADES,
  homeGrade,
  marketSubjects,
  MARKET_GRADE_NAMES,
} from "@/lib/marketplace-school-catalog";
import AdminCatalogControls from "@/components/admin-catalog-controls";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "ক্যাটালগ নিয়ন্ত্রণ",
  robots: { index: false, follow: false },
};
export default async function Catalog({
  searchParams,
}: {
  searchParams: Promise<{
    grade?: string;
    subject?: string;
    status?: string;
    after?: string;
  }>;
}) {
  const id = (await auth())?.user?.id;
  if (!id) redirect("/login?next=/admin/catalog");
  if (
    (await db.user.findUnique({ where: { id }, select: { role: true } }))
      ?.role !== "ADMIN"
  )
    redirect("/dashboard");
  const raw = await searchParams,
    grade = homeGrade(raw.grade),
    subject = typeof raw.subject === "string" ? raw.subject.slice(0, 100) : "",
    status = raw.status === "UNPUBLISHED" ? "UNPUBLISHED" : "APPROVED";
  const grades =
    grade === "SSC" ? ["9", "10"] : grade === "HSC" ? ["11", "12"] : [grade];
  const after =
    typeof raw.after === "string" && /^[a-f0-9]{64}$/.test(raw.after)
      ? raw.after
      : undefined;
  const rows = await db.setting.findMany({
    where: {
      key: {
        startsWith: MARKET_PREFIX,
        ...(after ? { gt: MARKET_PREFIX + after } : {}),
      },
      AND: [
        { value: { contains: `"status":"${status}"` } },
        { OR: grades.map((g) => ({ value: { contains: `"grade":"${g}"` } })) },
        ...(subject
          ? [{ value: { contains: `"subject":${JSON.stringify(subject)}` } }]
          : []),
      ],
    },
    orderBy: { key: "asc" },
    take: 51,
  });
  const papers = rows.slice(0, 50).flatMap((row) => {
    try {
      const r = JSON.parse(row.value) as MarketSubmission;
      const m = marketMetadataSchema.parse(r.metadata);
      return r.version === 1 &&
        r.status === status &&
        row.key === MARKET_PREFIX + r.id &&
        /^[a-f0-9]{64}$/.test(r.id) &&
        Number.isSafeInteger(r.revision) &&
        grades.includes(m.grade) &&
        (!subject || m.subject === subject)
        ? [{ ...r, metadata: m }]
        : [];
    } catch {
      return [];
    }
  });
  const query = (overrides: Record<string, string>) =>
    new URLSearchParams({ grade, subject, status, ...overrides });
  return (
    <main className="mx-auto max-w-6xl space-y-5 p-4">
      <Link href="/admin">← অ্যাডমিন ড্যাশবোর্ড</Link>
      <h1 className="text-2xl font-bold">হোমপেজ ক্যাটালগ নিয়ন্ত্রণ</h1>
      <p>
        শ্রেণি ও বিষয় অনুযায়ী প্রকাশিত প্রশ্নপত্র পরিচালনা করুন। এখানে তালিকার তথ্য edit
        হয়, মূল প্রশ্নের লেখা নয়। বন্ধ/ডিলিট করলে নতুন ক্রয় বন্ধ হবে, পুরোনো ক্রেতার স্থির
        কপি ও লেনদেন অক্ষত থাকবে।
      </p>
      <nav aria-label="শ্রেণি নির্বাচন" className="flex gap-2 overflow-x-auto">
        {HOME_GRADES.map((g) => (
          <Link
            key={g}
            href={`/admin/catalog?${new URLSearchParams({ grade: g, status })}`}
            aria-current={grade === g ? "page" : undefined}
            className={`shrink-0 rounded-full border px-4 py-2 ${grade === g ? "bg-indigo-700 text-white" : "bg-white"}`}
          >
            {MARKET_GRADE_NAMES[g]}
          </Link>
        ))}
      </nav>
      <form method="get" className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="grade" value={grade} />
        <label>
          বিষয়
          <select
            className="block rounded border p-2"
            name="subject"
            defaultValue={subject}
          >
            <option value="">সব বিষয়</option>
            {marketSubjects(grade).map((s) => (
              <option key={s.name}>{s.name}</option>
            ))}
          </select>
        </label>
        <label>
          অবস্থা
          <select
            className="block rounded border p-2"
            name="status"
            defaultValue={status}
          >
            <option value="APPROVED">প্রকাশিত</option>
            <option value="UNPUBLISHED">প্রকাশ বন্ধ</option>
          </select>
        </label>
        <button className="rounded bg-indigo-700 px-4 py-2 text-white">
          দেখুন
        </button>
      </form>
      <Link className="block underline" href="/admin/marketplace">
        শিক্ষকের অপেক্ষমাণ প্রশ্নপত্র অনুমোদন →
      </Link>
      <div className="grid gap-4 lg:grid-cols-2">
        {papers.map((r) => (
          <article
            key={`${r.id}:${r.revision}`}
            className="space-y-3 rounded-2xl border bg-white p-5 text-slate-900"
          >
            <p className="text-sm text-indigo-700">
              {r.metadata.subject} · {r.metadata.examType} · শ্রেণি{" "}
              {r.metadata.grade}
            </p>
            <h2 className="text-xl font-bold">{r.metadata.title}</h2>
            <p>{r.metadata.chapters.join(" · ")}</p>
            <p>
              ৳{(r.metadata.pricePaisa / 100).toFixed(2)} ·{" "}
              {status === "APPROVED" ? "প্রকাশিত" : "প্রকাশ বন্ধ"}
            </p>
            <Link className="block underline" href={`/dashboard/sell/${r.id}`}>
              সম্পূর্ণ প্রশ্নপত্র যাচাই করুন →
            </Link>
            <AdminCatalogControls
              id={r.id}
              revision={r.revision}
              status={r.status}
              metadata={r.metadata}
            />
          </article>
        ))}
      </div>
      {!papers.length && <p>এই অংশে প্রশ্নপত্র পাওয়া যায়নি।</p>}
      {rows.length > 50 && (
        <Link
          className="block underline"
          href={`/admin/catalog?${query({ after: rows[49].key.slice(MARKET_PREFIX.length) })}`}
        >
          পরের পৃষ্ঠা →
        </Link>
      )}
    </main>
  );
}
