import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { CommentModeration } from "@/components/paper-social-controls";
import "@/components/question-feed.css";
export const dynamic = "force-dynamic";
export default async function SocialModeration({
  searchParams,
}: {
  searchParams: Promise<{ after?: string }>;
}) {
  const id = (await auth())?.user?.id;
  if (!id) redirect("/login?next=/admin/social");
  if (
    (await db.user.findUnique({ where: { id }, select: { role: true } }))
      ?.role !== "ADMIN"
  )
    notFound();
  const { after } = await searchParams,
    prefix = "social:comment:v1:",
    cursor =
      after && /^[a-f0-9]{64}:[a-f0-9-]{36}$/.test(after)
        ? prefix + after
        : undefined;
  const [comments, reports] = await Promise.all([
    db.setting.findMany({
      where: { key: { startsWith: prefix, ...(cursor ? { gt: cursor } : {}) } },
      orderBy: { key: "asc" },
      take: 31,
    }),
    db.setting.findMany({
      where: {
        key: { startsWith: "social:report:v1:" },
        value: { contains: '"status":"OPEN"' },
      },
      take: 50,
    }),
  ]);
  const reported = await Promise.all(
    reports.map(async (r) => {
      try {
        const c = JSON.parse(r.value);
        const row = await db.setting.findUnique({
          where: { key: `social:comment:v1:${c.paperId}:${c.commentId}` },
        });
        return { ...r, comment: row ? JSON.parse(row.value) : null };
      } catch {
        return { ...r, comment: null };
      }
    }),
  );
  return (
    <main className="mx-auto max-w-4xl p-5 space-y-5">
      <Link href="/admin">← ADMIN</Link>
      <h1 className="text-2xl font-bold">মন্তব্য যাচাই ও রিপোর্ট</h1>
      <p>
        অনুমোদনের আগে মন্তব্য প্রকাশিত নয়। ব্যক্তিগত তথ্য, হয়রানি ও স্প্যাম যাচাই করুন।
        এখানে সর্বোচ্চ ৫০টি খোলা রিপোর্ট ও প্রতি পাতায় ৩০টি মন্তব্য দেখায়।
      </p>
      <h2>খোলা রিপোর্ট</h2>
      {!reports.length && <p>খোলা রিপোর্ট নেই।</p>}
      {reported.map((r) => {
        try {
          const c = JSON.parse(r.value);
          return (
            <article key={r.key} className="sf-comment">
              <Link href={`/marketplace/${c.paperId}`}>প্রশ্নপত্র দেখুন →</Link>
              <p>মন্তব্য ID: {c.commentId}</p>
              <p>রিপোর্ট: {c.reason}</p>
              <p>মন্তব্য: {r.comment?.body || "মন্তব্য পাওয়া যায়নি"}</p>
              <p>অবস্থা: {r.comment?.status || "অজানা"}</p>
              <CommentModeration
                paperId={c.paperId}
                commentId={c.commentId}
                admin
              />
            </article>
          );
        } catch {
          return null;
        }
      })}
      <h2>মন্তব্যের তালিকা</h2>
      {comments.slice(0, 30).map((row) => {
        try {
          const c = JSON.parse(row.value);
          return (
            <article className="sf-comment" key={row.key}>
              <Link href={`/marketplace/${c.paperId}`}>প্রশ্নপত্র →</Link>
              <p>{c.body}</p>
              <p>অবস্থা: {c.status}</p>
              <CommentModeration paperId={c.paperId} commentId={c.id} admin />
            </article>
          );
        } catch {
          return null;
        }
      })}
      {comments.length > 30 && (
        <Link
          href={`/admin/social?${new URLSearchParams({ after: comments[29].key.slice(prefix.length) })}`}
        >
          পরের পাতা →
        </Link>
      )}
    </main>
  );
}
