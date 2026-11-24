# Chemistry chapter 6 — partial source-only intake

## Owner instruction and honest progress

**Only actual source questions, not newly written/adapted questions or generated variants.** Target: **500 MCQ / 200 CQ / 100 SQ**. This task has NOT reached that target.

| Type | Requested | Source questions retained and visually compared | Still needed against target |
| --- | ---: | ---: | ---: |
| MCQ | 500 | 6 | 494 |
| CQ | 200 | 2 | 198 |
| SQ | 100 | 3 | 97 |

This is a progress checkpoint, **not an exhaustive finding that the sources contain only eleven questions**. All eight original source files were obtained. Board and school review is unfinished. Forty-nine automatically selected board MCQ candidates are explicitly excluded from verified totals; no source question was invented to fill the remaining quantities.

The previous chapters1–5 contain **3240 original/adapted practice drafts**, not verbatim stock. This collection is separate in `content/question-bank/ssc/chemistry/chapter-6-source-v1/` and is not added to their counts or runtime registration.

## Verified original source

- File: `২০২৬ — রসায়ন.pdf`, Drive ID `17cFTHipiCnU5qB-prqtRRj6YADFdZ091`.
- SHA256: `77a46c425639912215a7f1ef987e1e75e6b94d8618110557df18af6721d67082`.
- Chapter6: printed109–141 / PDF114–146. Chapter7 starts PDF147.
- Retained questions: printed140 / PDF145 (six MCQs) and printed141 / PDF146 (two CQs, three SQs).
- Both original pages were visually compared with the editable transcription; the thirteen crops were visually inspected as a contact sheet. MCQ5's initial crop cut the bottom options; its bottom boundary was widened and the full four-option image visually rechecked.
- Crops are original source pixels, not redrawn questions or diagrams. The CQ1 bottle figure retains both `4g` labels, HCl/NaOH and both `100 mL` labels. MCQs3–4 each retain the shared stimulus as an attached image and text.
- Original question images are authoritative. Editable text preserves wording, numbers, formulas and options; Unicode sub/superscripts, wrapping and spacing are transcription formatting, not an assertion of byte-identical PDF text. CQ1(গ) retains the original `দ্রবদ্বয়কে`, with a separate note rather than a silent spelling correction.
- No board, exam year, school or short attribution was invented for textbook samples without those labels. Filename2026 is NOT represented as an examination attribution. Source answers/correct-choice keys and marks are absent from the inspected question pages and remain `null`.

## Word-source blockage and unfinished review

- Board original Word file rendered to103 PDF pages. Re-rendering after supplying Symbol.ttf succeeded, but arrows, bond operators and some exponent signs/equation fields still disappear or become raw `\\sup...` text. A successful conversion with no missing-font warnings is **not** a fidelity guarantee.
- Automatic MCQ starts initially mistook `6.644...` in a formula for question6. The candidate regex now rejects a dot immediately followed by another digit. This is only a candidate-parser fix, not validation of all questions.
- Automatic column/crop order can omit choices or shared stimuli. Images of candidates must not be promoted merely because question text looks plausible.
- Board printed pages are NOT globally PDF+20. Actual board/year, printed page, question number and relevant stimuli must be visually established per occurrence before a short tag is published.
- School conversions: cadetCQ8pages, cadetMCQ8, schoolCQ70, extraCQ28, extraMCQ23. SchoolMCQ text extraction exists but its initial PDF conversion timed out. None has a verified chapter6 record in this checkpoint.
- `chapter-6-board-candidate-ledger.json` persists the49 unverified candidates as research only. Metadata and extracted text there may be wrong, incomplete or out of reading order. They are NOT canonical questions and are not evidence of available source totals.
- See corrected school Drive IDs in `SOURCE-INVENTORY.md`. Full original binaries remain in Drive; ignored `.cache/` is only disposable working storage.

## Artifact and verification boundaries

- Canonical partial intake: `questions.json`; asset/source hashes and crop coordinates: `validation.json`.
- Readable review: `chapter-6-source-review.html`; original-image contact sheet: `chapter-6-source-crop-review.png`.
- Builder: `scripts/question-bank/collect-ssc-chemistry-ch6-source.py`. It assembles manually transcribed, fixed source questions; it does not generate questions. `--extract PDF` is SHA-locked to the exact original textbook. `--check` verifies deterministic retained artifacts without needing PyMuPDF or a source download.
- Tests: `node --test tests/ssc-chemistry-ch6-source.test.cjs`; these check counts, null answers/marks, source identity, assets/hashes, shared stimuli and exclusion from runtime, **not independent teacher certification**.
- Intake schema intentionally is NOT the application's strict upload schema: the required correct answers/marks were not supplied by these source pages. Do not fabricate them, relax validators, or import null-answer records to make the collection appear complete.
- No application UI changes, question-library registration, DB writes, approval, publication or deployment. Deferred Physics figure captions untouched. Subject-specific Chemistry examination policy remains a separate task.

## Next review order

1. Recover complete board question boundaries/stimuli from the original Word source; individually confirm damaged symbols against faithful original content, or keep the question unresolved.
2. Transcribe/retain complete textbook/board/school source occurrences with actual observed source tags, figures and all subparts; detect duplicate question content without inflating unique totals.
3. Count only fidelity-reviewed records; report actual verified quantities and, only after exhaustive review, any source shortage. Never pad the requested500/200/100.
4. Keep Drive backups; obtain explicit approval before any live import/publication/deployment.
