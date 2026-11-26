import { admin } from "@/lib/guard";
import { loadBank } from "@/lib/admin-question-bank";
import { bankFiltersSchema } from "@/lib/admin-question-bank-schema";
import { bankReply } from "@/lib/question-bank-http";
export const dynamic = "force-dynamic";
function csvCell(value: unknown) {
  let s = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(s)) s = "\t" + s;
  return `"${s.replace(/"/g, '""')}"`;
}
export async function GET(req: Request) {
  try {
    await admin();
  } catch {
    return bankReply({ error: "শুধু Admin export করতে পারবেন।" }, 403);
  }
  try {
    const url = new URL(req.url),
      filters = bankFiltersSchema.parse(Object.fromEntries(url.searchParams));
    const data = await loadBank(filters),
      csv = url.searchParams.get("format") === "csv";
    const body = csv
      ? "\ufeff" +
        [
          [
            "ID",
            "Category",
            "Subject",
            "Chapter",
            "Type",
            "Status",
            "Question",
            "Answer key",
            "Explanation",
            "Source",
          ],
          ...data.rows.map((q) => [
            q.id,
            q.category,
            q.subject,
            q.topic,
            q.kind,
            q.source.startsWith("ADMIN_TRASH:")
              ? "Trash"
              : q.approved
                ? "Approved"
                : "Pending",
            q.text,
            q.correct,
            q.explanation,
            q.source,
          ]),
        ]
          .map((row) => row.map(csvCell).join(","))
          .join("\r\n")
      : JSON.stringify(
          {
            version: 1,
            exportedAt: new Date().toISOString(),
            scope: filters,
            page: filters.page,
            pageSize: data.pageSize,
            totalMatched: data.total,
            counts: data.counts,
            note: "Only the current page is exported. Source claims are not independent verification.",
            items: data.rows,
          },
          null,
          2,
        );
    return new Response(body, {
      headers: {
        "Content-Type": csv
          ? "text/csv; charset=utf-8"
          : "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="question-bank-page-${filters.page}.${csv ? "csv" : "json"}"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return bankReply({ error: "Export হয়নি। ফিল্টার যাচাই করুন।" }, 400);
  }
}
