/** Compare the browser Origin with the destination Host, not Next's internal
 * request URL hostname (which may be localhost behind its HTTP adapter).
 * Never accept x-forwarded-host as an alternative: browsers cannot choose Host.
 * Forwarded protocol is supplied by Next/the deployment's trusted HTTP proxy.
 */
export function bankSameOrigin(req: Request): boolean {
  try {
    const raw = req.headers.get("origin");
    if (!raw || raw === "null") return false;
    const origin = new URL(raw),
      url = new URL(req.url);
    if (origin.origin !== raw || !["http:", "https:"].includes(origin.protocol))
      return false;
    const host = req.headers.get("host") ?? url.host;
    const protocol =
      req.headers.get("x-forwarded-proto") ?? url.protocol.slice(0, -1);
    if (!/^(http|https)$/.test(protocol) || !host || /[\s/@\\#?]/.test(host))
      return false;
    const expected = new URL(`${protocol}://${host}`);
    return (
      expected.host.toLowerCase() === host.toLowerCase() &&
      origin.origin === expected.origin
    );
  } catch {
    return false;
  }
}
