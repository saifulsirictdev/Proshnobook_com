import class6 from "./data/class6-model-sources.json";
/** Read-only source material for private practice generation, NOT an approved question-bank record.
 * No cross-grade fallback; approved DB sources and explicit teacher inputs take precedence.
 */
export function bundledEnglishModelSources(grade: number, paper: number): Record<string, { text: string; reference: string }> {
  if (grade !== 6 || paper !== 1) return {};
  return Object.fromEntries(Object.entries(class6.sources).map(([key, value]) => [key, { ...value }]));
}
