/** Read-only alias matching. Never use this to rewrite/import/mutate stored scope.
 * Combined SSC/HSC include legacy storage; explicit grades stay grade-specific.
 */
export function bankReadCategoryAliases(category: string): string[] {
  if (/^(?:SSC|Class 9-10|9-10)$/.test(category))
    return ["SSC", "Class 9", "Class 10", "Class 9-10", "9", "10", "9-10"];
  if (/^(?:HSC|Class 11-12|11-12)$/.test(category))
    return ["HSC", "Class 11", "Class 12", "Class 11-12", "11", "12", "11-12"];
  const grade = category.match(/^(?:Class )?(1[0-2]|[1-9])$/)?.[1];
  return grade ? [`Class ${grade}`, grade] : [category];
}
const first = ["English For Today", "English 1st Paper", "English First Paper"];
const second = [
  "English Grammar and Composition",
  "English 2nd Paper",
  "English Second Paper",
];
export function bankReadSubjectAliases(subject: string): string[] {
  const key = subject.trim().toLowerCase();
  if (first.some((value) => value.toLowerCase() === key)) return first;
  if (second.some((value) => value.toLowerCase() === key)) return second;
  return [subject];
}
export function bankReadSubjectMatches(left: string, right: string): boolean {
  return bankReadSubjectAliases(left).some(
    (alias) => alias.toLowerCase() === right.trim().toLowerCase(),
  );
}
export function bankReadScopeWhere(
  category: string,
  subject: string,
  topic: string,
) {
  return [
    ...(category
      ? [{ category: { in: bankReadCategoryAliases(category) } }]
      : []),
    ...(subject ? [{ subject: { in: bankReadSubjectAliases(subject) } }] : []),
    ...(topic ? [{ topic }] : []),
  ];
}
