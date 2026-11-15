/** Read-only production liveness probe. No credentials, cookies, database or provider requests. */
const TARGET = "https://proshnobook.com/api/health";
const MAX_BYTES = 4096;
async function probe(fetcher = fetch) {
  try {
    const response = await fetcher(TARGET, {
      redirect: "error",
      signal: AbortSignal.timeout(10000),
      headers: { accept: "application/json", "cache-control": "no-cache" },
    });
    const reject = async (reason) => {
      await response.body?.cancel();
      return { ok: false, reason };
    };
    if (response.status !== 200) return reject("http_status");
    if (!response.headers.get("content-type")?.includes("application/json"))
      return reject("content_type");
    if (!response.headers.get("cache-control")?.includes("no-store"))
      return reject("cached_liveness");
    if (response.headers.get("x-content-type-options") !== "nosniff")
      return reject("security_header");
    const reader = response.body?.getReader();
    if (!reader) return { ok: false, reason: "empty_body" };
    let size = 0;
    const chunks = [];
    try {
      while (true) {
        const item = await reader.read();
        if (item.done) break;
        size += item.value.byteLength;
        if (size > MAX_BYTES) return { ok: false, reason: "body_limit" };
        chunks.push(Buffer.from(item.value));
      }
    } finally {
      await reader.cancel();
    }
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (body.status !== "ok" || body.check !== "liveness")
      return { ok: false, reason: "payload" };
    return { ok: true, reason: "liveness_only" };
  } catch {
    // Do not propagate HTML, exception messages, credentials or remote response bodies to incidents.
    return { ok: false, reason: "network_or_invalid_response" };
  }
}
async function monitor(
  fetcher = fetch,
  wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
) {
  const first = await probe(fetcher);
  if (first.ok) return { ...first, attempts: 1 };
  await wait(3000);
  return { ...(await probe(fetcher)), attempts: 2 };
}
module.exports = { probe, monitor, TARGET };
if (require.main === module) {
  monitor()
    .then((result) => {
      console.log(
        JSON.stringify({ ...result, checkedAt: new Date().toISOString() }),
      );
      if (!result.ok) process.exitCode = 1;
    })
    .catch(() => {
      console.log(JSON.stringify({ ok: false, reason: "monitor_failed" }));
      process.exitCode = 1;
    });
}
