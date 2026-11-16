// প্রশ্নোদয়: নির্দিষ্ট পেজে সাইটের সাধারণ হেডার, ফুটার ও নিচের বার লুকানোর গেট
"use client";

import { usePathname } from "next/navigation";

export default function PathGate({
  children,
  showOnHome = false,
}: {
  children: React.ReactNode;
  showOnHome?: boolean;
}) {
  const path = usePathname() ?? "";
  const hide =
    (path === "/" && !showOnHome) ||
    path === "/login" ||
    path === "/wallet" ||
    path === "/dashboard" ||
    path.startsWith("/dashboard/");
  // Keep a host boundary even when chrome is hidden. A null client boundary
  // before streamed route content can leave hydration at the next sibling.
  return (
    <div data-path-gate="" hidden={hide} style={{ display: hide ? "none" : "contents" }}>
      {hide ? null : children}
    </div>
  );
}

// ===== ফাইল শেষ =====
