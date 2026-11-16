# Class 6 MCQ ingestion

## Access and deployment

`/admin/questions/import` uses the deployed site's existing Prisma connection. No database password export, environment-variable replacement, new production database, admin-session impersonation or public import API is needed. Every action and the page require ADMIN; Teacher/Contributor and Student cannot import. Next server-action origin protections remain enabled.

The current workspace has no direct DB binding. Vercel project metadata confirmed a sensitive production DATABASE_URL exists, not that a direct database query succeeded. This feature's initial data checks occur after deployment under the owner's real Admin session. Never claim the live bank has been counted or populated until that occurs.

## Owner workflow

1. Open Admin → question bank → Class 6 batch import. Review current selector counts. The selector inventory is not an official-verified contents list. Match the 2026 textbook edition before writing batches; some existing entries are writing tasks or model tests.
2. Supply source-grounded original questions as the strict JSON format shown on the page. Use exact subject/topic keys, book, edition, HTTPS source URL, page per item, explanation, four distinct A–D options, correct key, language, difficulty. Limit 100 items/750 KB per batch. A one-question pilot is allowed; 50/100 are chapter goals, not a reason to pad a batch.
3. Preview all options, answer and explanation. Automated structure checks do not certify truth, curriculum alignment, source ownership or absence of semantic duplicates. Match each answer to the cited page; independently solve arithmetic. HTTPS source is stored as text, never fetched server-side.
4. Confirm review and save. ALL new questions are Pending, regardless of payload. No auto-publication. Existing approved data is untouched.
5. Inspect Pending questions in existing question management, perform subject-matter review, and individually approve validated items. Avoid blanket approval of unreviewed rows. Verify actual creator/practice visibility using the correct role. Source drafts must never be described as official NCTB questions solely because they cite a textbook.

## Safety and provenance

- Deterministic normalized-stem IDs within chapter + serializable transaction/retry prevent this importer's concurrent duplicates. Existing questions in the same exact category/subject/topic are compared by normalized stem. Semantic, cross-chapter, legacy category aliases and reordered wording are NOT automatically deduplicated.
- Hash-based batch receipt makes resubmission idempotent. One transaction writes all draft questions and the receipt; failed transactions roll back. No content uniqueness/schema migration needed. Do not use `skipDuplicates` as an accuracy/dedup guarantee.
- `mcqimport:v1:<digest>` Setting retains actor/time/book/edition/source, inserted IDs, page references and skipped count. Question source points to that digest. Admin page shows at most 50 receipts (bounded key-order selection, internally date sorted), not complete chronological history.
- No destructive rollback button. To undo a batch, inspect receipt IDs and current approval/use first; use a separately reviewed batch-specific operation rather than broad deletion. Existing financial/user/rights records must remain untouched.
- Chapter counts are records with nonempty correct key, separated Approved/Pending; not a substantive correctness/completeness certification. Remaining goal uses approved count only.

## Validation / launch status

Unit tests: strict input, invalid scope/key/options, absent source fields, size cap, duplicate stems, unauthorized roles, read-only preview, pending-only insert, repeat receipt, legacy normalized duplicate and serializable retry. Required isolated built-app browser CI exercises real Admin preview/save/repeat against disposable PostgreSQL and checks saved drafts/audit. No production data is used by these tests.

Book PDFs are still needed. No real textbook questions have been generated/imported by this work; it delivers ingestion infrastructure, not the requested 50–100 validated questions per chapter. Source: owner supplied https://nctb.gov.bd/pages/static-pages/695b987ac4774958d7b7040b (indexed as 2026 Class 6; full PDF not yet retrieved).

## Prepared chapter 1 batch

The Admin import page now offers “প্রস্তুত ১০০টি প্রশ্ন লোড করুন”. Loading only fills the editable JSON, does not query/write questions and does not mark textbook review complete. A replacement confirmation protects pasted edits. Preview invalidates whenever content changes. The existing explicit preview → confirmation → Pending-save path is still mandatory, and final publication remains separate.

The pending-save checkbox acknowledges source metadata and outstanding review rather than falsely certifying that unavailable textbook pages have already been checked. Full official chapter alignment/subject review is still required before publishing. Isolated browser CI loads the real prepared 100-item batch, checks read-only loading/preview, saves all 100 as Pending and confirms none are approved. This is not a production import.

## Prepared written-question import

ADMIN can preview the prepared 30-CQ/30-SQ batch on `/admin/questions/import`, then explicitly acknowledge limitations and save Pending. This is separate from MCQ JSON upload. CQ uses three parts only (2/4/4), `options.stimulus` and `options.subQuestions.k/kh/g`; SQ uses empty options; both have empty correct keys and solutions in explanation. Audit receipts use `writtenimport:v1:<digest>` and retain the original draft provenance plus the later chapter alignment report. No automatic publication.

The entire printed chapter 1–37 has now been visually reviewed for concept alignment; original draft metadata remains historical. See `deliverables/class6-math-ch1/CHAPTER-REVIEW.md`. Coverage completeness and independent teacher approval are not claimed.

## Chapter-wise prepared library (all existing classes)

At `/admin/questions/import`, select class → subject → chapter from the existing NCTB selector catalog. A ready chapter lists versioned MCQ/CQ/SQ batches and their limitations; an unprepared chapter explicitly has no batch. No category is invented. The server-side `lib/prepared-question-batches.ts` registry is the extension point for each subsequently authored chapter: add its validated adapter, provenance, language and records. Current availability is only Class 6 mathematics chapter 1 (100 MCQ + 30 CQ + 30 SQ); this feature does not generate questions in the background.

Preview fetches answers only after ADMIN authorization. A batch card is remounted when selection changes, clearing previous acknowledgement/preview. Save resolves the immutable server batch id, checks its digest and consent, and always writes approved=false. Receipts use `preparedimport:v1:<digest>` and retain category, subject, topic, source/review limitations, actor and saved ids. Existing questions from legacy importers are skipped by normalized stem. Receipt status means this exact batch version has an import receipt, not that every question was independently approved. Older import forms remain under a collapsed compatibility panel.

Verification: 15 targeted content/import tests passed; TypeScript typecheck passed with dummy local Prisma engine paths, not production DB access. New library transaction tests use mocks; authenticated browser CI retains the legacy real-DB path. No production import/publication performed.

## Select chapter and upload a JSON file

The first section of `/admin/questions/import` accepts a local `.json` file after class → subject → subgroup (where applicable) → chapter selection. Selectors use the same `NCTB_CLASSES` data as the question catalog. A selection-specific downloadable template is provided (format example only, not authored subject content).

File contract: maximum 750,000 UTF-8 bytes, 1–200 items. Required batch fields: `category`, `subject`, `topic` (exact selector strings), `book`, `edition`, HTTPS `sourceUrl`, `lang` (Bangla/English), `items`. Each item requires `type` (MCQ/SQ/CQ), `text`, `explanation`, `page`, `difficulty` (EASY/MEDIUM/HARD). MCQ also has strict A/B/C/D `options` and `correct`; SQ has neither. CQ uses text as stimulus and `parts` with `label`, `question`, `solution`, `marks`: mathematics ক/খ/গ = 2/4/4; other supported CQ ক/খ/গ/ঘ = 1/2/3/4. Unknown fields (including approved) are rejected. Earlier custom draft formats must be converted to this schema or saved via their prepared-batch card.

JSON scope must match the selected chapter; the server independently validates the entire catalog path, including subgroup. File/selection changes clear preview and consent. Reading a file and preview are read-only; explicit consent plus unchanged content/selection digest is required to save. Only ADMIN may preview/save, every insert has approved=false, duplicates are normalized by stem, and Serializable conflicts retry. Audit: `jsonupload:v1:<digest>` with actor, scope, source, page references and inserted ids. No publication action is added.

Verification: 13 targeted import tests and typecheck passed; transaction tests use mocks. No production writes.

## Class 6 math chapter 2 available

`content/question-bank/class-6/chapter-2/questions.json` is directly compatible with the local JSON uploader: Class 6 / গণিত / ২. অনুপাত ও শতকরা (no subgroup). A mixed prepared card also contains the same 100 MCQ + 30 CQ + 30 SQ. Source review and variant limitations are retained with the batch; approval remains separate. See the chapter README and review.md. No database import was performed by authoring this batch.

## Class 6 mathematics chapters 3–8 Draft batches

Each chapter now has `content/question-bank/class-6/chapter-N/questions.json`, `review.md` and `validation.json`. The prepared library adds six mixed cards, and each JSON also works with class/subject/chapter file upload. Select the exact existing chapter; no new category or subject was introduced. Review the limitations before saving Pending; preparation did not import or publish anything.

Bundle: `deliverables/class6-math-ch3-8/class6-math-chapters-3-8-drafts.zip`. Unzip first and upload one chapter's questions.json at a time. Do not upload ZIP or validation.json. These are numeric-family drafts, not independent teacher-approved complete coverage; geometry/chart solutions still need figure review.
