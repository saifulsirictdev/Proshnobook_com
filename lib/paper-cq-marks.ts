/** CQ marks are subject-specific, not dependent on how the paper was created.
 * Prefer the question's subject to the editable header (including mixed papers).
 * Legacy auto-model drafts may have no subject metadata at all.
 */
export function cqPartMark({
  part,
  index,
  subject,
  paperSubject,
  autoModel,
}: {
  part: string;
  index: number;
  subject?: string;
  paperSubject?: string;
  autoModel?: string;
}): number {
  const questionSubject = subject?.trim();
  const isMathSubject = (value: string) =>
    /^(?:(?:সাধারণ|উচ্চতর)\s+)?গণিত$|^(?:(?:general|higher)\s+)?(?:maths?|mathematics)$/i.test(value);
  // An editable display header must not override the math auto-model policy.
  const math = questionSubject
    ? isMathSubject(questionSubject)
    : autoModel === "ssc-math-written-v1" || isMathSubject(paperSubject?.trim() || "");
  const position = ["k", "kh", "g", "gh"].indexOf(part);
  return (math ? [2, 4, 4] : [1, 2, 3, 4])[position < 0 ? index : position] ?? index + 1;
}
