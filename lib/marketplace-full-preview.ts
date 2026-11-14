import "server-only";
import { saleRecord } from "@/lib/marketplace-purchase";
import { marketPreviewModel } from "@/lib/marketplace-preview";
/** Owner policy: all visible questions/options/header may be public before purchase.
 * This is NOT a paid-content secrecy boundary. Never include answer keys, hidden
 * questions, raw source snapshots, receipt data or moderation fields. */
export function publicFullPreview(raw: string, id: string) {
  try {
    const record = saleRecord(raw, id);
    const model = marketPreviewModel(record.snapshot);
    const settings = structuredClone(model.settings);
    settings.edits = {};
    settings.show.answerSheet = false;
    settings.cfg.ansKey = false;
    settings.cfg.format = "q";
    settings.show.watermark = true;
    settings.info.watermark = "প্রশ্নবুক.কম";
    const sections = model.sections.map((section) => ({
      type: section.type,
      title: section.title,
      questions: section.questions.map(({ q, opts }) => ({
        q: {
          id: q.id,
          type: q.type,
          text: q.text,
          category: q.category,
          subject: q.subject,
          topic: q.topic,
          stimulus: q.stimulus,
          subQuestions: q.subQuestions,
          // CQ options may contain answers; the renderer only needs MCQ display options.
          options: q.type === "MCQ" ? Object.fromEntries(opts) : {},
          correct: "",
          explanation: "",
        },
        opts: q.type === "MCQ" ? opts : [],
        ci: -1,
      })),
    }));
    const ids = new Set(
      sections.flatMap((s) => s.questions.map(({ q }) => q.id)),
    );
    settings.attachments = Object.fromEntries(
      Object.entries(settings.attachments).filter(([id]) => ids.has(id)),
    );
    // Retain display marks/layout while dropping edits for excluded questions.
    return {
      settings,
      sections,
      setName: model.setName,
      duplicate: [...model.duplicate].filter((id) => ids.has(id)),
    };
  } catch {
    return null;
  }
}
export type FullMarketPreview = NonNullable<
  ReturnType<typeof publicFullPreview>
>;
