# Per-question board/school provenance

## Behaviour

Question Setup → Page Setup now uses the existing `settings.show.boardSource` switch for ordinary MCQ/CQ/SHORT papers as well as English exercises. The label is **প্রশ্নের পাশে বোর্ড/স্কুলের নাম, সাল ও মূল প্রশ্ন নম্বর দেখান**.

- Default OFF; missing/invalid provenance displays nothing.
- ON displays a small bracketed source label beside the question text in the shared measured paper block, so Preview and PDF use the same content and pagination.
- OFF only hides the label. It never deletes provenance or changes category, topic, difficulty, question, answer, board key or year.
- Saved settings already carry this switch. Ordinary saved papers store question IDs and reload their current bank provenance through the existing authorized/paid builder API. Purchased immutable snapshots preserve their own provenance (not a fresh bank lookup).
- English task provenance and its existing board/year filters are unchanged.
- The existing public pre-purchase marketplace projection is unchanged; it does not yet forward the new ordinary-question provenance labels. The owned builder and purchased editor are covered here.
- School questions are not called board questions because a school happens to be in Dhaka/Sylhet etc. A book edition or filename such as `Exam2026.pdf` is **not** evidence of an exam year.

## Canonical metadata

`lib/question-provenance.ts` owns the strict schema and display/matching helpers. Each question can have an optional `provenance` array with up to 30 actual source occurrences. Multiple occurrences allow the same question to retain several board/year references instead of squeezing them into an unsearchable label.

Board keys: `dhaka`, `rajshahi`, `cumilla`, `jashore`, `chattogram`, `barishal`, `sylhet`, `dinajpur`, `mymensingh`, `madrasah`, `technical`. Labels are Bengali, while stable lowercase keys are language-independent.

**Synthetic schema example only, not attribution for a real sample:**

```json
{
  "provenance": [
    {
      "kind": "board",
      "board": "dhaka",
      "examYear": 2024,
      "sourceFile": "verified-source.pdf",
      "pdfPage": 4,
      "printedPage": "145",
      "questionNumber": "10"
    }
  ]
}
```

Rendered label: `[ঢাকা বোর্ড · ২০২৪ · প্রশ্ন ১০]`.

A school occurrence uses `kind: "school"`, `school`, optional `examType`, optional **known** `examYear`, and the same source-file/page/question locator. `board` is forbidden on a school occurrence. Board year is mandatory; school year may be absent. Unknown/unattributed/authored questions should omit provenance instead of inventing it.

The existing strict ADMIN JSON uploader accepts this optional **per-item** field for MCQ, SQ and CQ. It persists validated data in the reserved `Question.options._provenance` JSON key; no schema migration or production DB operation is required. The preview digest binds the provenance too, so changing the board/year invalidates earlier consent. All existing ADMIN-only preview → explicit consent → Pending-only save gates remain. A metadata assertion still needs human source review; the schema does not independently certify a board claim.

The normal builder API separates `_provenance` into top-level `PaperItem.provenance` and removes it from answer choices. Quiz/practice-test selection, DB exam generation and admin option rendering ignore that reserved key too; it cannot become a fifth MCQ answer or cause a valid question to be dropped. Older records without it remain unchanged. Purchased snapshots support both raw bank metadata and top-level provenance.

**Import limitation:** existing stem/id deduplication remains unchanged. Importing a second occurrence of an already-present question does not automatically merge/backfill its provenance. A separately authorized reviewed metadata-update workflow is needed before modifying existing stock. No source scanning/backfill, import or approval was performed in this change.

## Later board-search UI

`matchesQuestionBoard(question, boardKey, examYear?)` is ready for future category-selection filtering. It matches only `kind: "board"` occurrences. If board and year are provided, **both must match the same occurrence**; a Dhaka-2024/Sylhet-2023 question must not match Dhaka-2023.

This is a pure predicate, **not a shipped database query or search interface**. For a paginated production selector, add an authorized DB-level JSON filter (or a separately reviewed normalized/indexed source table) to both the result query and count query. Do not fetch one page and filter only that page in the browser, do not regex-match rendered labels, and do not guess board/year from the free-form `source` string. Existing class/subject/topic filters stay independent.

## Current three math samples

All three are attributed in the supplied compilation to **রাজউক উত্তরা মডেল কলেজ, ঢাকা — মডেল টেস্ট ০১**, printed page 428, original question numbers **10 / 16 / 20**. No definite exam year was established on that source page. They carry **school** metadata, with **no board key and no guessed year**. `samples/ssc-math/questions.json` is a review fixture, not a directly uploadable ADMIN batch.

The isolated sample editor exposes the actual existing Toggle and renderer. It produces source-ON and source-OFF PDFs from both desktop/mobile widths, and verifies local saved-settings restoration. This is not authenticated production-save proof. See `samples/ssc-math/proof/` and its README.

## Scope / release

This branch also retains the preceding three-diagram review sample. No production schema migration, source import, stock approval or deployment was performed. The future board-search UI is intentionally not added yet.

## Validation result

- Full local regression: **1,122/1,122 PASS**, zero failures/skips (319,493 ms). These are the repository unit/mocked-action tests, not a new real-DB CI deployment proof.
- `npm run typecheck`: PASS (generated local Prisma client with `--no-engine`; no DB connection).
- Focused importer/API/renderer-settings/sample compatibility suite: **45/45 PASS**.
- Actual isolated Chromium component editor at 1280px and 390px: source toggle ON/OFF, text/size edit, local save/reload/reopen PASS.
- Four A4 PDFs: 2 pages and 3 diagrams each; opted-in source labels exactly 3, opted-out exactly 0; original source question numbers 10/16/20 retained. No invented board/year, solution leakage or clipped diagram boxes.
