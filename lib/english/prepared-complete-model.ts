import { createHash } from "node:crypto";
import model from "./data/class6-complete-model.json";
import { validateEnglishDraft } from "./draft";
import { validateEnglishReferenceShape } from "./generation";
import { paperHeaderSchema } from "../paper-header";
export function preparedCompleteEnglishModel() {
  const draft = validateEnglishDraft({ version: 1, name: "Class 6 — complete question-answer model 01 — teacher review pending", selection: model.selection, output: model.output, header: paperHeaderSchema.parse({}), fontSize: 12, font: "kalpurush", updatedAt: "2026-11-10T00:00:00.000Z" });
  validateEnglishReferenceShape(draft.selection, draft.output);
  const digest = createHash("sha256").update(JSON.stringify({draft,provenance:model.provenance})).digest("hex");
  const uuid = `${digest.slice(0,8)}-${digest.slice(8,12)}-${digest.slice(12,16)}-${digest.slice(16,20)}-${digest.slice(20,32)}`;
  return { key: `english-review:${uuid}`, digest, draft, provenance: model.provenance };
}
