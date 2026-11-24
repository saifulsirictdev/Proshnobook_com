/** One explicit ADMIN submission can approve the entire current 612-set SSC list. */
export const ENGLISH_BULK_APPROVAL_LIMIT = 2000;
export const ENGLISH_BULK_APPROVAL_MAX_BYTES = 512000;
export type EnglishApprovalCounts = {approved: number; skipped: number; invalid: number; uncertain: number};
export type EnglishApprovalResult = {error?: string; message?: string; counts?: EnglishApprovalCounts};
export function englishApprovalSummary(counts: EnglishApprovalCounts) {
  return `অনুমোদিত: ${counts.approved}টি সেট; পরিবর্তিত/আগেই সিদ্ধান্ত হয়েছে/অনুপস্থিত: ${counts.skipped}টি; গঠন বা scope যাচাই হয়নি: ${counts.invalid}টি; ফল অনিশ্চিত: ${counts.uncertain}টি।`;
}
