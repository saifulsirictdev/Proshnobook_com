/** Public liveness only. Does not query DB/providers or claim readiness or expose configuration. */
export const dynamic = "force-dynamic";
export function GET() {
  return Response.json(
    { status: "ok", check: "liveness" },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Robots-Tag": "noindex, nofollow",
      },
    },
  );
}
