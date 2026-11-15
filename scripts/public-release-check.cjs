/** Anonymous, GET-only release smoke checks. Never signs in or changes financial/user data. */
const ORIGIN = "https://proshnobook.com";
async function read(response) {
  const reader = response.body?.getReader();
  if (!reader) throw Error("empty");
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const item = await reader.read();
      if (item.done) break;
      size += item.value.byteLength;
      if (size > 1_000_000) throw Error("body_limit");
      chunks.push(Buffer.from(item.value));
    }
    return Buffer.concat(chunks).toString("utf8");
  } finally {
    await reader.cancel();
  }
}
async function smoke(fetcher = fetch) {
  const results = [];
  for (const pathname of [
    "/",
    "/about-us",
    "/contact-us",
    "/robots.txt",
    "/sitemap.xml",
    "/dashboard",
  ]) {
    try {
      const response = await fetcher(ORIGIN + pathname, {
        method: "GET",
        redirect: "manual",
        signal: AbortSignal.timeout(15000),
        headers: { "cache-control": "no-cache" },
      });
      if (pathname === "/dashboard") {
        const location = new URL(
          response.headers.get("location") || "/",
          ORIGIN,
        );
        const ok =
          [302, 303, 307, 308].includes(response.status) &&
          location.origin === ORIGIN &&
          location.pathname === "/login";
        await response.body?.cancel();
        results.push({
          path: pathname,
          ok,
          check: "anonymous_private_redirect",
        });
        continue;
      }
      if (response.status !== 200) {
        await response.body?.cancel();
        results.push({ path: pathname, ok: false, check: "http_status" });
        continue;
      }
      const body = await read(response);
      let ok = false,
        check;
      if (pathname === "/robots.txt") {
        check = "robots_sitemap";
        ok = /sitemap:\s*https:\/\/proshnobook\.com\/sitemap\.xml/i.test(body);
      } else if (pathname === "/sitemap.xml") {
        check = "sitemap_origin";
        ok =
          /<urlset\b/.test(body) &&
          body.includes("https://proshnobook.com") &&
          !body.includes("vercel.app");
      } else {
        check = "canonical_and_schema";
        const expected = ORIGIN + (pathname === "/" ? "" : pathname);
        const canonicals = [
          ...body.matchAll(
            /<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"[^>]*>/g,
          ),
        ].map((m) => m[1]);
        ok =
          canonicals.length === 1 &&
          canonicals[0].replace(/\/$/, "") === expected &&
          !/noindex/i.test(response.headers.get("x-robots-tag") || "") &&
          !/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(body);
        const schemas = [
          ...body.matchAll(
            /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
          ),
        ];
        // About/home have JSON-LD; contact need not invent a schema.
        if (pathname !== "/contact-us" && schemas.length === 0) ok = false;
        for (const [, json] of schemas) JSON.parse(json);
      }
      results.push({ path: pathname, ok, check });
    } catch {
      results.push({
        path: pathname,
        ok: false,
        check: "network_or_invalid_response",
      });
    }
  }
  return { ok: results.every((r) => r.ok), checks: results };
}
module.exports = { smoke };
if (require.main === module)
  smoke()
    .then((result) => {
      console.log(JSON.stringify(result));
      if (!result.ok) process.exitCode = 1;
    })
    .catch(() => {
      console.log('{"ok":false,"reason":"smoke_failed"}');
      process.exitCode = 1;
    });
