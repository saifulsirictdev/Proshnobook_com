/** Accept only same-site absolute paths; never forward an untrusted external callback URL. */
export function safeLoginRedirect(raw: unknown): string {
  if (typeof raw !== "string" || raw.length > 2000) return "/";
  try {
    const decoded = decodeURIComponent(raw);
    if (/ /.test(raw)) return "/";
    if (
      ![raw, decoded].every(
        (v) =>
          v.startsWith("/") &&
          !v.startsWith("//") &&
          !/[\\\u0000-\u001f\u007f]/.test(v),
      )
    )
      return "/";
    const target = new URL(raw, "https://local.invalid");
    if (
      target.origin !== "https://local.invalid" ||
      target.pathname === "/login"
    )
      return "/";
    return target.pathname + target.search + target.hash;
  } catch {
    return "/";
  }
}

/** All login entry points pass through server-side identity resolution. */
export function loginLandingPath(raw: unknown): string {
  const safe = safeLoginRedirect(raw);
  const path = new URL(safe, "https://local.invalid").pathname;
  const next = path === "/auth/landing" || path === "/auth/onboarding" ? "/" : safe;
  return `/auth/landing?${new URLSearchParams({ next })}`;
}
