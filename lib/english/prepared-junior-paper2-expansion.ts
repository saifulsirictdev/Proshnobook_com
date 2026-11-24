import { createHash } from "node:crypto";
import data from "./data/junior-paper2-expansion-01.json";
import { validateEnglishDraft } from "./draft";
import { englishItemGroups } from "./item-bank";
import { paperHeaderSchema } from "../paper-header";

/** New editorial stock, deliberately separate from the immutable released registry.
 * Access is pure: these entries are NOT approved, imported, or student-visible.
 */
export function preparedJuniorPaper2ExpansionModels(grade: number) {
  if (grade !== 6 && grade !== 7) return [];
  return data.models
    .filter((model) => model.grade === grade)
    .map((model) => {
      const header = paperHeaderSchema.parse({ enabled: true });
      for (const field of Object.values(header.fields)) field.enabled = false;
      Object.assign(header.fields.subject, {
        enabled: true,
        value: `Class ${grade} English Second Paper`,
      });
      Object.assign(header.fields.program, {
        enabled: true,
        value: "Practice Model Test",
      });
      const draft = validateEnglishDraft({
        version: 1,
        name: `${model.id} — review required`,
        selection: {
          grade,
          paper: 2,
          mode: "full",
          itemIds: [],
          sources: {},
          writing: model.writing,
          includeAnswers: true,
        },
        output: model.output,
        header,
        fontSize: 11,
        font: "serif",
        updatedAt: "2026-11-20T00:00:00.000Z",
      });
      return {
        id: model.id,
        draft,
        review: structuredClone({
          entryId: model.id,
          batch: data.batch,
          ...data.provenance,
          contentSha256: createHash("sha256")
            .update(
              JSON.stringify({ writing: model.writing, output: model.output }),
            )
            .digest("hex"),
          editorialChecks: model.editorialChecks,
        }),
      };
    });
}

export function preparedJuniorPaper2ExpansionItems(grade: number) {
  return preparedJuniorPaper2ExpansionModels(grade).flatMap((model) =>
    englishItemGroups(model.draft).map((part) => ({
      ...part,
      draft: {
        ...part.draft,
        name: `${model.id} — ${part.group} — teacher review required`,
      },
      review: structuredClone(model.review),
    })),
  );
}
