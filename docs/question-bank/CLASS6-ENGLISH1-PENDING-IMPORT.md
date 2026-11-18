# Class 6 English First Paper — Pending import handoff

## Implementation
- 33 lesson batches, **96 MCQ + 404 unstructured written/SQ records = 500 database-ready records**.
- Exact existing `Class 6 → English 1st Paper → Lesson-01 … Lesson-33` catalog scope, regardless of differences in source display-title capitalisation.
- `content/question-bank/class-6/english-1st/import/lesson-NN.json` files pass the existing strict JSON upload validator. ADMIN can upload these individually without using the prepared registry.
- `lib/class6-english1-batches.ts` registers the same batches in the existing prepared-library preview/save flow. After deployment: `/admin/questions/import`, select Class 6 / English 1st Paper / all chapters, preview, acknowledge limitations, save Pending.
- No new API, grants, cron, category, credentials, database schema, roles or approval bypass. Existing ADMIN action uses approved=false, deterministic identity, deduplication and transaction/audit receipts.
- SQ is a storage representation for English free responses (vocabulary, poems, writing etc.), **not an official marks assignment or CQ relabelling**. Exact native task instructions and full model answers are retained. Book-dependent tasks explicitly require the cited textbook; no passage/image/audio is silently invented.
- Full model/unseen packs remain review artifacts, excluded from this lesson-only catalog. They must not be misfiled into a lesson to inflate import counts.

## Actual import status
**No database write has been confirmed.** Local environment has no database connection or authenticated ADMIN session. Vercel project lookup confirms the deployed project, but that connector exposes deployment/settings tools, not authenticated application server-actions or SQL execution. Sensitive production values were not extracted; the abandoned scoped-import grant was not recreated.

An authenticated ADMIN must complete the existing preview/save flow (or upload the generated JSON files) on a deployment containing these changes. A source registration, PR, deployment, mock test or backup is **not** a database receipt. Approval/publication remains separate and is not authorised by this import preparation.

## Validation
- `python3 scripts/question-bank/build-class6-english1-import.py --check`
- All other English generators with `--check`.
- `node --test tests/class6-english1-*.test.cjs tests/prepared-library.test.cjs`
- These tests include existing ADMIN-only save controls, Pending-only flags, complete source activity/answer retention and catalog validation. Mock database writes do not establish production import.
- Full application typecheck cannot be validated in this sandbox until Prisma Client is generated: the Prisma engine download host is outside the outbound allowlist. Do not treat the resulting missing Prisma exports/implicit-any errors as a successful typecheck.
