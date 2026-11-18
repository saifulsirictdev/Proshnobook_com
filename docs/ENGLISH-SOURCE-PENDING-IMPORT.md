# English source Pending import

The owner requested importing the 30 Class 6 reading extracts and six poems after the automatic source-pool PR was merged. These are source texts, not question stems, so this change deliberately does not insert fake MCQ/SQ/CQ rows into `Question`.

## ADMIN workflow
1. Open `/admin/english-review` as authenticated ADMIN.
2. Expand **৩৬টি source-এর সম্পূর্ণ preview / import status**. Read the texts, references and source limitations.
3. Check the acknowledgement, then press **৩৬টি source Pending হিসেবে import করুন**.
4. The server reports newly inserted versus existing records. Refresh to inspect each source status. A displayed button/preview or merged deployment is not a completed database import.

The original recovered-English-question review remains below the source panel. Source-only records are stored separately under `english-source:v1:<sha256>` in `Setting`, not under `english-review:` (which requires a complete question draft). This prevents treating raw text as a complete exam or accidentally feeding Pending sources to the approved-question loader.

## Safety and behaviour
- Server checks authenticated user ID and ADMIN role before any database access.
- Only the server-owned 36-record manifest can be imported. Browser supplies current manifest digest and explicit acknowledgement, not arbitrary text/approval status/category/record IDs.
- One atomic createMany statement with deterministic content keys and skipDuplicates makes repeated/concurrent submissions idempotent. Existing records/decisions are never overwritten/reset.
- Every new record is PENDING and teacherApproved=false, includes importing actor/time, book hash/file ID, grade/paper/lesson and page-reference provenance.
- No automatic approval/publication, Question writes, wallet/auth/role changes or generic source promotion. This source-import panel intentionally does not grant approval; it stages a durable review inventory.
- The existing private bundled Auto Model Test fallback stays unchanged. These newly imported Pending records do not silently become an approved generation source. Existing ADMIN-approved recovered question snapshots still have their existing handling.
- Source transcription review and current official circular applicability remain separate; OCR-assisted transcription/tests are not teacher semantic review.

## Verification
79 focused English, source-import, source-pool, builder, Job and exam regression tests pass. Tests cover auth denial before DB access, stale/forged manifest/unchecked acknowledgement, exact 30+6 count and provenance, Pending-only writes, replay/approved-record preservation, and database-failure uncertainty. No production database import, authenticated ADMIN execution or deployment verification was performed from this sandbox. Full local tsc is blocked by ungenerated Prisma Client; edited-path type errors are checked separately.
