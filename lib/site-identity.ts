import { BRAND, PUBLIC_SITE_ORIGIN } from "@/lib/brand";

/** Current public service identity, not a claim about former domain owners/history. */
export function websiteIdentity() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${PUBLIC_SITE_ORIGIN}/#website`,
    name: BRAND.nameBn,
    alternateName: [BRAND.nameEn, "প্রশ্নবুক"],
    url: PUBLIC_SITE_ORIGIN,
    inLanguage: "bn-BD",
    description: BRAND.description,
    about: [
      "প্রশ্নপত্র তৈরি",
      "শিক্ষকদের প্রকাশিত প্রশ্নপত্র",
      "MCQ, সংক্ষিপ্ত ও সৃজনশীল প্রশ্ন",
    ],
    publisher: {
      "@type": "Organization",
      "@id": `${PUBLIC_SITE_ORIGIN}/#organization`,
      name: BRAND.nameBn,
      alternateName: BRAND.nameEn,
      url: PUBLIC_SITE_ORIGIN,
      logo: `${PUBLIC_SITE_ORIGIN}/proshnobook-p-192.png`,
      description: BRAND.description,
      disambiguatingDescription:
        "শিক্ষকদের পরীক্ষার প্রশ্নপত্র তৈরি, প্রকাশ ও সংগ্রহের প্ল্যাটফর্ম; সাধারণ প্রশ্নোত্তর আলোচনা ফোরাম নয়।",
    },
  };
}
export function aboutIdentity() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${PUBLIC_SITE_ORIGIN}/about-us#webpage`,
    url: `${PUBLIC_SITE_ORIGIN}/about-us`,
    name: "প্রশ্নবুক.কম সম্পর্কে — প্রশ্নপত্র তৈরি ও প্রকাশনার প্ল্যাটফর্ম",
    description: BRAND.description,
    inLanguage: "bn-BD",
    isPartOf: { "@id": `${PUBLIC_SITE_ORIGIN}/#website` },
    mainEntity: { "@id": `${PUBLIC_SITE_ORIGIN}/#organization` },
  };
}
