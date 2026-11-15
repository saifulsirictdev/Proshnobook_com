import type { Metadata } from "next";
import { BRAND, PUBLIC_SITE_ORIGIN } from "@/lib/brand";

/** Public landing pages only. Never inherit one canonical URL across private pages. */
export function landingMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  const url = `${PUBLIC_SITE_ORIGIN}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "bn_BD",
      siteName: BRAND.nameBn,
      title,
      description,
      url,
      images: [
        {
          url: `${PUBLIC_SITE_ORIGIN}/questionmaker-icon-192.png`,
          width: 192,
          height: 192,
          alt: BRAND.nameBn,
        },
      ],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [`${PUBLIC_SITE_ORIGIN}/questionmaker-icon-192.png`],
    },
  };
}
/** Safe inside a script element even if a site-admin supplied text includes HTML. */
export function jsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
