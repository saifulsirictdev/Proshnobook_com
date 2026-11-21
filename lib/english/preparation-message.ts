/** Presentation-only terminology. Server diagnostics, provenance, quota, locks,
 * validation and ADMIN review records are not changed by this helper. */
export function englishPreparationMessage(message: string): string {
  return message
    .replace(/\s*AI চালানো হয়নি।/g, "")
    .replace(/AI quota/gi, "দৈনিক প্রস্তুতির সীমা")
    .replace(/Generation provider/gi, "প্রশ্নপত্র প্রস্তুতির সেবা")
    .replace(/API configuration/gi, "সেবার সংযোগ সেটিংস")
    .replace(/output validation/gi, "প্রশ্নের গঠন যাচাই")
    .replace(/Generation/gi, "প্রশ্নপত্র প্রস্তুতি")
    .replace(/Provider/gi, "প্রস্তুতির সেবা")
    .replace(/Database/gi, "সংরক্ষণব্যবস্থা")
    .trim();
}
