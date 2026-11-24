# Biology workspace recovery and reconstruction

Date: 2026-11-20. Branch: `arena/25610643-proshnobook-com`.

## What was actually found

At the beginning of this reconstruction, disk inspection found only:

- Chapter 1: `mcq.json` (30), `sq.json` (10), `cq.json` (5), and their `validation.json`.
- The unchanged chapter-1 builder and tests.
- `scripts/question-bank/biology/concepts-01-04.txt`: 80 concept rows.
- The earlier starter source-inventory document.

The previously reported expanded bank, completion inputs, full-bank builder, reader and batch progress files were absent. No cause for their absence has been established. Prior chat counts of 970 batch-1 items / 1,534 overall items are **not verified recovered content**.

## Recovery attempts performed

- Confirmed the current working branch; did not switch branches, reset, clean or overwrite unrelated app/subject changes.
- Searched repository content, documentation, authoring directories and shallow workspace locations for the missing builder and completion input names.
- Inspected local history and `git fsck --full --no-reflogs --unreachable` results: 2,597 unreachable blobs, no unreachable commits/trees at inspection time.
- Scanned those blobs for Biology-specific URLs, text, completion identifiers and authoring-row signatures. Matching Biology question JSON was the existing 45-item starter, not an expanded bank.
- The matching original builder blob was `8f04886c60e57ebc489667d64a17693c6a76c2e4`; `git hash-object` confirmed it is identical to the retained builder.
- The concept-table blob `db19b0a1453b0ff931cb46e394430fbd1bc462db` is identical to the surviving 80-row input, not a missing larger table.
- Unrelated Chemistry/Physics blobs were not restored or changed. No remote branch, app database, deployment or Drive backup was claimed to have been searched.

These scoped searches did not recover the expanded bank. This is not proof that no copy exists anywhere; it is the outcome of the actual searches performed.

## Work rebuilt, not falsely called recovered

A new deterministic builder preserves the unchanged 45-item starter and adds:

| Component | MCQ | CQ | SQ | Total |
|---|---:|---:|---:|---:|
| Surviving chapter 2–4 concept rows | 60 | 0 | 60 | 120 |
| Newly authored chapter-5 concept rows | 20 | 0 | 20 | 40 |
| Separately authored reasoning questions | 40 | 0 | 0 | 40 |
| Separately authored self-contained creative questions | 0 | 20 | 0 | 20 |
| **New/rebuilt additions** | **120** | **20** | **80** | **220** |
| Preserved starter | 30 | 5 | 10 | 45 |
| **Current bank** | **150** | **25** | **90** | **265** |

Concept MCQ/SQ share objectives. Counts are draft items, not 265 independent learning objectives. All answer, subject-expert, distractor, syllabus and semantic-duplicate reviews are not certified complete. Technical test success must not be presented as biological approval.

## Remaining work

Batch 1 target is 1,600 questions. **1,335 remain: 850 MCQ / 225 CQ / 260 SQ.**

- Chapter 1: missing 170 MCQ / 45 CQ / 60 SQ.
- Chapters 2–5, each: missing 170 MCQ / 45 CQ / 50 SQ.
- Batch 2: 1,600 missing; queued.
- Batch 3: 1,280 missing; queued.

Overall: 265 / 4,480, leaving 4,215. Historical counts are excluded from these calculations. `progress.json` and `batch-plan.json` derive from actual current question files.

## Durability and verification

The authoring inputs, both builders, tests, question batches, per-chapter source ledgers, readable Markdown, progress files and offline reader belong together in a **Biology-only local commit**. That is a durability action, not website publication or a claim of a remote backup.

`artifact-index.json` records SHA-256 and byte length for deterministic outputs, authoring inputs and retained starter files. `--check` fails on missing/stale generated output. The focused tests check all indexed files and exercise the actual application uploader. A later missing file must be reported as missing, not counted from prior conversation.

No Biology import, approval, deployment or prepared-library registration was performed. No Chemistry/Physics release was rerun.

## Subsequent chapter-1 milestone

After the owner resumed sequential work, 70 answered chapter-1 drafts were added (40 MCQ / 10 CQ / 20 SQ). Current file-backed total is 335; chapter 1 is 115/320, not complete. The 265 reconstruction below remains a historical milestone. Two new SQ are disclosed web-exercise adaptations. One original attached diagram was visually inspected and embedded offline. All 21 technical tests pass; no independent subject-review or publication claim.

## Chapter-1 count completion (subsequent milestone)

The owner explicitly rejected stopping for partial updates and authorized completion. Added 205 answered drafts (130 MCQ/35 CQ/40 SQ), reaching chapter 1 **200/50/70 = 320/320** and a global file-backed total of **540**. Chapters 2–5 were not expanded. The original 45-item starter and 12 chapter-2–5 question files remain byte-identical to `da6ffc7`; frozen hashes are in `chapter-1-completion-review.json`. Both offline builders and 24 technical tests pass. No production integration, approval or publication occurred. This is draft-count completion, not independent subject/teacher certification.
