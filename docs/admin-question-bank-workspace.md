# Admin question-bank workspace

Entry: **Admin dashboard → প্রশ্নব্যাংক স্টুডিও**, `/admin/questions/bank`; reviewed batch import: `/admin/questions/bank/import`.

## Implemented workflow

- Admin-only DB-backed class/category → group where applicable → subject → chapter navigation, MCQ/CQ/SQ, search, status/difficulty, scoped counts and 24-row pagination. Exact stored scopes are retained rather than silently merged.
- Manual editor with math/table/image preview, MCQ options/key, written solutions and structured CQ parts/marks. Native JPG/PNG/WebP upload, insert/replace/remove in question, choices, parts or explanation.
- Create/edit/import/restore/rollback always produce **Pending** records. Approval is a separate explicit Admin action, requires complete content/answers, and uses revision checks. Confirmed selected-page bulk approve/Trash/Restore reports partial failures.
- Word `.docx` and JSON upload → editable extraction → strict template parsing → per-question correction and selection → validation/duplicate review → confirmed Pending save. Actual Word/JSON templates cover MCQ/CQ/SQ. Up to 100 questions per save; 4 MB Word / 1 MB JSON. Supported embedded raster images go through the same safe image pipeline. Word warnings identify unsupported images/layout; arbitrary textbook layouts, complex tables and equations are not guaranteed to round-trip. Legacy `.doc` must first be converted to `.docx`.
- Local, explicit Bijoy/SutonnyMJ legacy-text conversion using pinned `@kovapdf/bijoy-unicode@1.0.1`, not a font switch. Original/proposed text displayed together, protected formulas/URLs/numbers, stale-safe Apply/Undo. ASCII Bijoy vs English remains ambiguous: select only the legacy run and review mixed-language output. No universal font/layout fidelity claim.
- Optional **consented external copyediting** through DeepSeek: original/proposed text and notes, no automatic application, no automatic answer generation or approval. UI discloses transmission/provider costs. Server enforces ADMIN/origin, 6000 characters, 30-second timeout, 50 KB response, 2/minute and 20/day per Admin. Literal formulas/numbers/URLs must remain unchanged. API requires `DEEPSEEK_API_KEY`; no provider request was made during local tests. This is copyediting, **not a general AI question/answer generator or structural reconstruction service**; differences are side-by-side rather than word-level highlighted.
- Exact duplicates blocked; bounded token-overlap near matches are advisory, not semantic verification. File-content/entry-derived import IDs are stable across Admin accounts/reloads and discover edited/moved canonical records. Repeated imports skip those IDs, never overwrite or resurrect Trash. Changing the file creates a different batch; normalized-stem checks remain a second guard.
- SHA-256 full-record revisions and serializable transactions protect stale edits/reviews. Atomic before/after audit snapshots retain actor, time and source. Latest 30 audit entries are shown; rollback restores an audited content snapshot to Pending, never its old approval. Pre-feature history cannot be reconstructed.
- Current filtered **page only** JSON/CSV export (24 rows), including source/status; JSON includes total/counts/page metadata. CSV is a human-readable report, not a lossless options backup. Reference-impact report checks known DB IDs in practice tests, model snapshots and at most 1000 saved-paper candidates, with truncation disclosure. It excludes text-only/exported/third-party copies and does not rewrite snapshots.
- Legacy unversioned edit/approval/delete actions are disabled or redirected to the revisioned studio. Older PDF/prepared import tools remain available but cannot bypass Pending or canonical-ID protection. Specialized English tools remain separate; not every old English/CQ record can be edited losslessly without manual correction.

## Storage and security

No new Prisma schema/migration or image-storage secret is required. `Question` and `Setting` backups must include the studio records.

Images are re-encoded with Sharp, stripped of EXIF/GPS, limited to 20 MP input, 4 MB upload, 1800px output and 600 KB compressed WebP. SVG/GIF/animated/malformed uploads are rejected. Immutable bytes are stored in `Setting` under `question-bank-image:v1:<UUID>`; the public route accepts only UUIDv4 `.webp` paths with correct MIME/nosniff. MathText accepts that exact local image syntax rather than arbitrary URLs/HTML. Images are public even before approval: do not upload personal/confidential material. Orphan images are deliberately retained to avoid breaking papers; reference-aware cleanup/storage monitoring remain operational follow-up.

Audit/Trash prefixes: `question-bank-audit:v1:` and `question-bank-trash:v1:`. Trash is non-destructive, preserves ID/content, prefixes source `ADMIN_TRASH:v1:` and removes approval. Restore is Pending. There is no permanent delete. Question reads/builds do not modify DB records. Same-origin bounded cookie-authenticated POSTs require ADMIN. Uploaded DOCX ZIP entries/decompression are bounded and external file access is disabled; extracted HTML is stripped, not trusted.

Prepared sources in Git are not the live DB. Re-import must honor canonical identities/Trash. Public selection requires approval. Existing purchased/exported snapshots are not retroactively changed; saved ID-based setups may require replacement questions. Owner-run external SQL/release scripts must not blindly update/approve administrator-edited or trashed canonical rows.

## Verification and honest release status

Latest local verification:

- `node --test --test-concurrency=4 tests/*.test.cjs`: **1811/1811 passed**, no skips/failures.
- `npx tsc --noEmit --incremental false`: passed.
- `scripts/question-bank-browser-check.cjs`: Chromium manual MCQ/CQ/SQ, real UI controls with **mock API**, image insert/replace/remove, Pending/review/edit, Trash/Restore at 360/768/1440px: passed. This is not real-DB or authenticated full-app evidence.
- Focused backend tests cover import read-only preview, reviewed gate, stable identity/retry, no approval injection, rollback, consent/config/quota and literal protections.
- `scripts/question-bank-postgres-check.cjs`: opt-in disposable localhost PostgreSQL transaction/concurrency test; supplied in CI, not run locally (no local PostgreSQL/Prisma engine); **passed in GitHub CI run 45782325469**.
- `scripts/helpers/question-bank-authenticated-flow.cjs`, wired into `scripts/authenticated-browser-check.cjs`: actual built-app Credentials/disposable-DB proof for manual editing, Unicode Apply/Undo, raster upload, review/edit, Trash/Restore, rollback, Word template import/retry and export. Added to CI but **not locally executed**. Teacher/Student bank API denial is also checked there. Screenshots go to ignored `.cache/question-bank-authenticated-flow` and CI artifacts, never production accounts.
- Local standard production build was resource-killed; a reduced-memory retry reached webpack compilation and then was killed during Next's TypeScript stage. Standalone TypeScript passed separately, but **neither is a successful complete production build**. Temporary build settings were not retained. CI run 45782325469 reached the build and caught a Next route-export restriction; the internal CSV helper was made private. Generated-route TypeScript then passed locally. A new CI build/full-app run remains the release gate.
- Class 7 BGS registry repair removes only references to missing chapter 11 source files; actual chapters 1–10, 20 batches / 3700 questions remain (9–10 arrived from main during final verification), with a source/registry consistency test. No missing questions were fabricated.

No production DB mutation, production image upload, provider call, content publication or deployment is performed by these local tests. Implementation is not proof of live deployment; check the PR/CI/release result separately. Content-authoring work remains paused.
