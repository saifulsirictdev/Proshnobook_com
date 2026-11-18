import { createHash } from "node:crypto";
import pool from "./data/class6-seen-pool.json";
/** Source-only import: never fabricate MCQ/SQ records from textbook prose. */
export function preparedEnglishSources() {
  return [
    ...pool.seen.map(p => ({ id: p.id, kind: "seen" as const, title: p.id, lesson: p.lesson, text: p.text, reference: p.reference, pdfPages: p.pdfPages })),
    ...pool.poems.map(p => ({ id: p.id, kind: "poem" as const, title: p.title, lesson: p.lesson, text: `${p.title}\n${p.author}\n${p.text}`, reference: p.reference, pdfPages: p.pdfPages })),
  ].map(source => {
    const payload = { grade: pool.grade, paper: pool.paper, sourceFileId: pool.sourceDriveFileId, sourceSha256: pool.sourceSha256, ...source };
    const digest = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    return { key: `english-source:v1:${digest}`, payload };
  });
}
export function englishSourceImportDigest() {
  return createHash("sha256").update(JSON.stringify(preparedEnglishSources())).digest("hex");
}
