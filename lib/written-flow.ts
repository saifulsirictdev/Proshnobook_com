import type { PaperItem } from "./paper-builder";

/** Render-only fragments. Question IDs, order, answers, marks and saved content
 * remain intact. Never split MCQ choices, figures, or an individual CQ subpart. */
export type WrittenFlow = {
  questionIndex: number;
  partIndex: number;
  first: boolean;
  last: boolean;
};
export function writtenFlowBlocks<T extends { q: PaperItem }>(
  items: T[],
  type: string,
  enabled: boolean,
  startNumber = 0,
): (T & { writtenFlow?: WrittenFlow })[] {
  if (!enabled || type !== "CQ") return items;
  return items.flatMap((item, questionIndex) => {
    const parts = Object.entries(item.q.subQuestions ?? {}).filter(([, text]) => text?.trim());
    if (item.q.englishGroup || parts.length < 2) return [{...item, writtenFlow: {
      questionIndex: questionIndex + startNumber, partIndex: -1, first: true, last: true,
    }}];
    // Keep the stimulus/diagram with the first subpart so neither a bare number
    // nor a section heading is stranded at the foot of a column.
    return parts.map((_, partIndex) => ({
      ...item,
      writtenFlow: {
        questionIndex: questionIndex + startNumber,
        partIndex,
        first: partIndex === 0,
        last: partIndex === parts.length - 1,
      },
    }));
  });
}
