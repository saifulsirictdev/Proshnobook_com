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

## Explicitly unfinished scope
**One complete model is prepared**, not 30 complete passage-linked question sets or a fully populated production bank. All 30 extracts/six poems remain available as source inventory, but most still need prewritten matching questions/keys before entering the full-model bank. Grades 7–12 have no newly prepared full sets in this change and will truthfully show stock missing unless valid approved stock already exists. Preparation/import/review for those grades is not claimed complete.

No authenticated production ADMIN session or database import was performed from the sandbox. Code/PR deployment does not execute import or grant teacher approval. No paid generation request was performed.

## Verification
- `python3 scripts/question-bank/build-class6-english1-complete-bank-model.py --check`
- 85 focused English, full-bank/import, source, builder, Job and exam regression tests pass.
- Tests cover complete snapshot/mark/task validation, MCQ+short-answer and unseen linkage, missing keys/parts/source mismatch, all-grade no-stock responses, auth denial before DB read, private ownership, Pending-only import and idempotency preserving approval.
- `git diff --check` passes. No edited-path TypeScript errors; full local tsc remains blocked by ungenerated Prisma Client.
