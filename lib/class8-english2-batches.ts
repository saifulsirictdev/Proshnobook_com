import { createHash } from "node:crypto";
import { parseQuestionUpload } from "./question-json-import";
import type { PreparedBatch } from "./prepared-question-batches";
import manifest from "@/content/question-bank/class-8/english-2nd/manifest.json";
import revisionData from "@/content/question-bank/class-8/english-2nd/syllabus-revisions.json";
import gap from "@/content/question-bank/class-8/english-2nd/gap-clues.json";
import substitution from "@/content/question-bank/class-8/english-2nd/substitution.json";
import verbs from "@/content/question-bank/class-8/english-2nd/verbs.json";
import narration from "@/content/question-bank/class-8/english-2nd/narration.json";
import transformation from "@/content/question-bank/class-8/english-2nd/transformation.json";
import punctuation from "@/content/question-bank/class-8/english-2nd/punctuation.json";
import formalLetter from "@/content/question-bank/class-8/english-2nd/formal-letter.json";
import informalLetter from "@/content/question-bank/class-8/english-2nd/informal-letter.json";
import formalEmail from "@/content/question-bank/class-8/english-2nd/formal-email.json";
import informalEmail from "@/content/question-bank/class-8/english-2nd/informal-email.json";
import composition from "@/content/question-bank/class-8/english-2nd/composition.json";

type Revision = {
  topic: string; entry: number; rawEntrySha256: string;
  text?: string; explanation?: string; notes: string[]; authorship: string;
};
const display = (s: string) => s.replace(/\\n/g, "\n").replace(/\uf0b4/g, "×");

/** Ordinary SQ bank drafts, not approved structured Auto Model stock.
 * Keep immutable source snapshots separate from explicitly authored repairs.
 * Merely reading this registry never writes to the database.
 */
export function class8English2Batches(): PreparedBatch[] {
  const revisions: Revision[] = revisionData.revisions;
  const revisionMap = new Map(revisions.map(r => [`${r.topic}:${r.entry}`, r]));
  if (revisionMap.size !== revisions.length || revisions.length !== manifest.revisionCount) throw Error("Duplicate or missing Class 8 revisions");
  const used = new Set<string>();
  const batches = [gap, substitution, verbs, narration, transformation, punctuation, formalLetter, informalLetter, formalEmail, informalEmail, composition].map((raw, index) => {
    const entry = manifest.entries[index];
    const slug = entry.file.replace(/\.json$/, "");
    if (raw.category !== manifest.category || raw.subject !== manifest.subject || raw.topic !== (entry.originalTopic ?? entry.topic) || raw.items.length !== entry.count || raw.items.some(q => q.type !== "SQ")) throw Error("Class 8 Drive scope changed; review required");
    const changes = revisions.filter(r => r.topic === slug);
    const items = raw.items.map((q, i) => {
      const key = `${slug}:${i + 1}`, revision = revisionMap.get(key);
      if (revision) {
        if (createHash("sha256").update(JSON.stringify(q)).digest("hex") !== revision.rawEntrySha256 || !revision.notes.length || revision.authorship !== "LOCAL_AUTHORED_ADAPTATION_NOT_VERBATIM_SOURCE") throw Error("Class 8 revision no longer matches reviewed source");
        used.add(key);
      }
      // The upload schema limits page to 100 characters. The full original page
      // and the repair notes are preserved separately, never misattributed.
      return { ...q, text: display(revision?.text ?? q.text), explanation: display(revision?.explanation ?? q.explanation), page: `Drive ${entry.fileId}, entry ${i + 1}${revision ? "; adapted locally" : ""}` };
    });
    const input = { ...raw, topic: entry.topic, sourceUrl: raw.sourceUrl || `https://drive.google.com/file/d/${entry.fileId}/view`, items };
    const { batch, records } = parseQuestionUpload(JSON.stringify(input), { category: manifest.category, subject: manifest.subject, group: "Question Topics & Solutions (Section A & B)", topic: entry.topic });
    return {
      id: entry.id, category: batch.category, subject: batch.subject, topic: batch.topic, lang: batch.lang,
      title: `Class 8 English 2nd Paper — ${entry.count} model-aligned practice sets — Pending review`,
      limitations: [manifest.storagePolicy, ...manifest.limitations, ...entry.limitations].join(" "),
      records: records.map(q => ({ kind: "SQ" as const, text: q.text, options: q.options, correct: q.correct, explanation: q.explanation, difficulty: q.difficulty })),
      provenance: {
        book: raw.book, edition: raw.edition, sourceUrl: batch.sourceUrl, originalSourceUrl: raw.sourceUrl, originalTopic: raw.topic,
        sourceFileId: entry.fileId, sourceFileName: entry.fileName, sourceSha256: entry.sha256, validationFileId: entry.validationFileId, teacherApproved: false,
        attributionPolicy: "Source metadata describes the immutable raw draft only. Locally revised wording/keys are authored adaptations, not verbatim book/model questions. Hypothetical prompt schools, names and dates are not exam-source metadata.",
        revisionFile: manifest.revisionFile, revisionSha256: manifest.revisionSha256, revisions: changes,
        alignmentReferences: revisionData.references, blueprint: revisionData.blueprint, reviewSummary: revisionData.reviewSummary,
        normalizations: ["literal backslash-n to newline", "U+F0B4 multiplication glyph to ×"],
        references: raw.items.map((q, i) => ({ entry: i + 1, page: q.page, appliesTo: "RAW_DRAFT", revised: revisionMap.has(`${slug}:${i + 1}`) })),
        limitations: entry.limitations,
      },
    };
  });
  if (used.size !== revisions.length) throw Error("Unknown or out-of-range Class 8 revision");
  return batches;
}
