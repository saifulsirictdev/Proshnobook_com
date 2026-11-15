const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const {
  probe,
  monitor,
  TARGET,
} = require("../scripts/public-health-check.cjs");
function response(body = '{"status":"ok","check":"liveness"}', options = {}) {
  return new Response(body, {
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store, max-age=0",
      "x-content-type-options": "nosniff",
      ...options.headers,
    },
    status: options.status || 200,
  });
}
test("monitor uses fixed public URL with no redirects or credentials and recognizes only uncached liveness", async () => {
  const result = await probe(async (url, options) => {
    assert.equal(url, "https://proshnobook.com/api/health");
    assert.equal(url, TARGET);
    assert.equal(options.redirect, "error");
    assert.ok(options.signal instanceof AbortSignal);
    assert.equal(options.headers.authorization, undefined);
    assert.equal(options.headers.cookie, undefined);
    return response();
  });
  assert.deepEqual(result, { ok: true, reason: "liveness_only" });
  for (const [res, reason] of [
    [response("", { status: 503 }), "http_status"],
    [
      response("private HTML", { headers: { "content-type": "text/html" } }),
      "content_type",
    ],
    [
      response("{}", { headers: { "cache-control": "public" } }),
      "cached_liveness",
    ],
    [
      response("{}", { headers: { "x-content-type-options": "" } }),
      "security_header",
    ],
    [response('{"status":"ok","check":"database"}'), "payload"],
    [response("x".repeat(4097)), "body_limit"],
  ])
    assert.deepEqual(await probe(async () => res), { ok: false, reason });
});
test("probe cancels oversized streams and never publishes remote bodies or exception details", async () => {
  let cancelled = false;
  const stream = new ReadableStream({
    start(c) {
      c.enqueue(new Uint8Array(4097));
    },
    cancel() {
      cancelled = true;
    },
  });
  const result = await probe(
    async () =>
      new Response(stream, {
        headers: {
          "content-type": "application/json",
          "cache-control": "no-store",
          "x-content-type-options": "nosniff",
        },
      }),
  );
  assert.equal(result.reason, "body_limit");
  assert.equal(cancelled, true);
  const error = await probe(async () => {
    throw Error("sensitive URL and access token");
  });
  assert.deepEqual(error, { ok: false, reason: "network_or_invalid_response" });
  assert.ok(!JSON.stringify(error).includes("sensitive"));
});
test("monitor retries failures once, recovers and does not retry healthy requests", async () => {
  let calls = 0,
    waits = 0;
  const result = await monitor(
    async () => (++calls === 1 ? response("", { status: 502 }) : response()),
    async (ms) => {
      assert.equal(ms, 3000);
      waits++;
    },
  );
  assert.deepEqual(result, { ok: true, reason: "liveness_only", attempts: 2 });
  assert.equal(waits, 1);
  assert.equal(
    (
      await monitor(
        async () => response(),
        async () => {
          throw Error("unexpected retry");
        },
      )
    ).attempts,
    1,
  );
  assert.deepEqual(
    await monitor(
      async () => response("", { status: 503 }),
      async () => {},
    ),
    { ok: false, reason: "http_status", attempts: 2 },
  );
});
test("workflow is read-only against site, deduplicates only bot-owned incidents and distinguishes recovery from payment readiness", () => {
  const source = fs.readFileSync(".github/workflows/public-health.yml", "utf8");
  assert.match(source, /issues: write/);
  assert.match(source, /workflow_dispatch/);
  assert.match(source, /github-actions\[bot\]/);
  assert.match(source, /i\.body\?\.includes\(marker\)/);
  assert.match(source, /liveness_only/);
  assert.match(source, /No test transactions or credentials used/);
  assert.ok(source.includes("if: github.event_name != 'pull_request'"));
  assert.ok(!source.includes("secrets."));
});

test("anonymous release smoke uses GET-only fixed-origin routes, validates SEO and private redirects", async () => {
  const { smoke } = require("../scripts/public-release-check.cjs");
  const visited = [];
  const result = await smoke(async (url, options) => {
    assert.ok(url.startsWith("https://proshnobook.com/"));
    assert.equal(options.method, "GET");
    assert.equal(options.redirect, "manual");
    visited.push(url);
    const path = new URL(url).pathname;
    if (path === "/dashboard")
      return new Response(null, {
        status: 307,
        headers: { location: "/login?callbackUrl=%2Fdashboard" },
      });
    if (path === "/robots.txt")
      return new Response("Sitemap: https://proshnobook.com/sitemap.xml");
    if (path === "/sitemap.xml")
      return new Response(
        "<urlset><url><loc>https://proshnobook.com</loc></url></urlset>",
      );
    return new Response(
      `<link rel="canonical" href="https://proshnobook.com${path === "/" ? "" : path}"><script type="application/ld+json">{"@type":"WebSite"}</script>`,
    );
  });
  assert.equal(result.ok, true);
  assert.equal(visited.length, 6);
  const failed = await smoke(
    async () => new Response("secret unexpected HTML", { status: 500 }),
  );
  assert.equal(failed.ok, false);
  assert.equal(failed.checks.length, 6);
  assert.ok(!JSON.stringify(failed).includes("secret"));
});
