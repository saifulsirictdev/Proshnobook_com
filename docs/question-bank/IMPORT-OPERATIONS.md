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
