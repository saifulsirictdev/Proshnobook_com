# Database-only English first-paper auto models

## Owner's corrected requirement
Do not rely on live AI for first-paper Auto Model Test. Prepare complete passage-linked questions **and answers**, import Pending, ADMIN review/approve, and then assemble a private full paper from database stock. Never silently invoke AI if stock is incomplete. This supersedes older bank-first/AI-fallback descriptions **for first-paper automatic entry**. Second-paper and explicit manual/task generation remain unchanged.

## Implemented
- All supported grades 6–12 first-paper automatic entry now calls a database-only action **before** textbook-source lookup, source randomisation, writing defaults or any provider/generation/quota call.
- It reads the existing `english-review:` snapshot bank, accepts only APPROVED, structurally valid full models for exactly the requested grade/paper, and requires answer keys and all blueprint parts. Applies both draft and reference-shape validation.
- Samples one complete valid snapshot (reservoir sampling over up to 1000 records), preserving passages, grouped questions, writing prompts and answers together. This avoids selecting random sources which have no matching question stock. It is not unrestricted mixing of individual questions or a per-user non-repeat guarantee.
- Writes a separate owner-only validated draft with reset header and new timestamp/UUID. Review/manual edit → confirmed save → Set-up remains. Student/unauthenticated users denied. No public publish, wallet debit, generation quota reservation or paid provider request.
- Empty/partial/Pending/malformed/foreign-grade stock returns a clear ADMIN import/approval requirement. No source-entry form, incomplete paper or silent AI fallback. Database/storage errors fail safely; potentially saved drafts can be checked before retrying.

## Prepared Class 6 model 01
`lib/english/data/class6-complete-model.json` converts the existing `content/question-bank/class-6/english-1st/model-01-draft.json` into native English draft/output structure, with textbook poem texts from the existing six-poem source collection.

13 tasks, 100 marks (70 reading + 30 writing), with keys/models:
- Seen 1 (Bulbul): seven MCQ/four choices and five short answers, one linked passage.
- Seen 2 (Health is Wealth): five gaps and five vocabulary prompts with keys.
- One original museum unseen: five information-table blanks, five True/False with corrections, and summary.
- Matching (two columns/five pairs), eight-part rearranging.
- Eight offered questions across four supplied poems, any five to answer.
- Story with opening/title/at least ten new sentences, 120-word paragraph and dialogue, with model answers.

Table blanks use nonempty labels `(a)` etc., not AI-empty cells. Server reads the prepared artifact, never calls a provider to prepare/import it. The existing source/sample alignment is a practice reference, not independent official circular certification. Model answers, alternatives, difficulty, source attribution and rubric require teacher semantic review. Museum passage reuses original practice pack002: if pupils have already studied it, it is not unseen for them.

## ADMIN workflow
At `/admin/english-review`, a separate **পূর্ণ প্রশ্ন–উত্তর মডেল** panel previews the full selection, question paper and answer keys.
1. Preview and acknowledge limitations.
2. Import the single model Pending. Server revalidates, requires ADMIN, current digest and acknowledgement.
3. The model appears first in the existing review list, even if there are over 100 recovery rows. Review all parts and use existing Approve/Reject buttons.
4. Only after APPROVED can first-paper Auto Model Test use it.

Import uses a deterministic 36-character snapshot ID and one atomic `createMany(skipDuplicates)`; retries cannot duplicate, reset a rejection or overwrite an approval. Provenance/import actor/time retained. Source-only 30+6 inventory remains separate; raw source import is not a question-answer model or approval. No automatic approval or database-import claim.

## Expanded Class 6 stock (owner follow-up)
The library now includes the original model plus **30 additional complete model combinations (31 total)**. Every one of the 30 seen extracts appears as the second seen source with five authored gap prompts and five vocabulary prompts, all with keys (300 source-labelled prompts). Repeated shared groups are not counted as new questions. See `ENGLISH-COMPLETE-LIBRARY-COVERAGE.md` for exact coverage and remaining limits.

Shared MCQ/short-answer groups use two source-read passages (Bulbul or railway station), keeping seven MCQ and five short answers attached to exactly one source. All three existing original unseen packs have matching information/True-False/summary keys and are rotated intact. Four poems per combination supply eight offered questions; all six poem sources occur across the library. Writing models and other shared content are reused intentionally, not presented as 31 wholly independent newly authored papers.

ADMIN can preview/import the full 31-model library in one atomic Pending import. Each model still requires its own review/approval. Previous single-model key/import/decisions remain compatible.

Grades 7–12 have no newly prepared full sets in this Class 6 content change and will truthfully show stock missing unless valid approved stock already exists. No cross-grade duplication is used to fake completion.

No authenticated production ADMIN session or database import was performed from the sandbox. Code/PR deployment does not execute import or grant teacher approval. No paid generation request was performed.

## Verification
- `python3 scripts/question-bank/build-class6-english1-complete-bank-model.py --check`
- 87 focused English, full-bank/import, source, builder, Job and exam regression tests pass.
- Tests cover complete snapshot/mark/task validation, MCQ+short-answer and unseen linkage, missing keys/parts/source mismatch, all-grade no-stock responses, auth denial before DB read, private ownership, Pending-only import and idempotency preserving approval.
- `git diff --check` passes. No edited-path TypeScript errors; full local tsc remains blocked by ungenerated Prisma Client.

## Question Item assembly (current workflow)

First-paper Full Model Test now assembles approved **Question Item groups**, rather than requiring an approved complete snapshot. `english-item:v1:<sha256>` stores independently reviewable selected-mode drafts. Seen-1 (MCQ/comprehension), Seen-2 (gap/vocabulary), Unseen (information/true-false/summary), textbook poems and standalone items remain separate. Passage-dependent tasks are indivisible so unrelated questions cannot be attached to another passage. Grade-specific blueprint order and marks are validated on the final assembled paper; seen sources are kept distinct.

ADMIN imports the existing prepared Class 6 material through the new Question Item panel in `/admin/english-review`, previews each group's tasks/answers, and approves each group independently. Import is Pending-only, digest-bound and duplicate-safe; existing decisions are not reset. Legacy approved complete snapshots remain usable as item stock, but are no longer required. No pending material, bundled unapproved content, paid AI, or cross-grade fallback is used. The user's page contains no ADMIN import/approval instructions.

This change supplies the assembly and review workflow, not production approval. The prepared stock is still Class 6 only; grades 7–12 require their own reviewed content. The configured practice blueprint is not a newly verified official circular. Item stock still reuses the previously documented shared seen-1/unseen/writing groups.

### Shared item and full-model entry

First-paper Question Item links and Full Model Test now call the same approved stock action. A selected request requires only its selected task IDs, extracts only those tasks and their passages/keys, and validates the selected marks. Seen-only and Unseen-only papers do not need unrelated writing or other source stock. The first-paper setup fallback also uses this action, without prompting for unused custom passages/writing topics or invoking AI. Second-paper generation remains unchanged.

The existing `PreparationPopup` is shown while preparing; first-paper requests use its database-only branding. Success opens the existing English editor's Page Set-up panel directly (`stage=setup`), with editing still available. Second-paper auto preparation retains review-first routing. The processing popup remains visible through successful navigation instead of briefly displaying Retry.

ADMIN review now displays Class 6 item coverage and supports explicit per-record re-review: a confirmed Approved/Rejected record can return to Pending with its previous status and reopening actor/time retained. Imports still do not reset decisions. Pending content is never served to users. No production data has been imported, approved or deleted by these code changes.

### Common ADMIN workflow

English item preview/Pending import is now inside `/admin/questions/import`, under the existing Class 6 → English 1st Paper subject selection. English set review/approval and confirmed re-review are inside `/admin/questions`, including when filtered by that class/subject/status. The old `/admin/english-review` bookmark redirects to common question management; stored records and server-side authorization are retained. Existing legacy approved snapshots are still recognized and reviewable. No destructive migration or approval reset is performed.

The common panel uses passage-bound prepared sets rather than pretending ordinary chapter `Question` rows or reading-source receipts constitute a complete English item bank. General question-row totals are unchanged; the English set panel separately reports readiness. Individual and bulk imports are Pending-only and duplicate-safe. Approval invalidates both common pages.

ADMIN readiness and user assembly both call `loadEnglishStock` and the same assembler. The panel lists exact missing items and malformed stored records instead of treating a status flag as usable stock. This does not prove that a particular production import or approval has occurred: no live database read, import or approval was executed during this change. Complete stock still requires every needed group, valid answer keys and distinct Seen-1/Seen-2 sources.
