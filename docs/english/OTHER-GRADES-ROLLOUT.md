# English 1st Paper: remaining-grade rollout

## Implemented in this phase
- The common ADMIN import/review panels support exact grades 6–12, each using its existing grade-specific practice blueprint.
- Preserve existing catalog categories: Class 9 contains separate grade 9/10 selections; Class 11-12 contains separate grade 11/12 selections. Do not add/rename categories.
- Individual/bulk Pending import registries and bulk approval are grade-scoped. A grade 7 request cannot import/approve grade 6 content. Existing Class 6 identities and digests remain unchanged.
- Existing shared user item/full-model preparation, processing popup and direct setup remain intact. No AI fallback, automatic approval or cross-grade content substitution.

## Not complete
Prepared authored stock is still only Class 6. `preparedEnglishItems(7..12)` intentionally returns empty rather than copying Class 6. Other grades show their required item/mark coverage and missing-content state. This is infrastructure, not a claim that all grades are content-ready. No production import or approval was executed.

## Drive source inventory checked during this phase
Read-only Drive search returned these source files; folder ancestry identifies their grade:

| Grade | NCTB source candidate | Drive ID | Bytes | Review status |
|---|---|---|---|---|
| 7 | ২০২৬ — English For Today.pdf | 1L1W-XCn_grZior6yOaoSkJ9eWviNIYP7 | 32687361 | Downloaded via connector; cover and publication page visually checked (Class Seven; revised October 2025). Image-based PDF; transcription/OCR and lesson verification still required |
| 8 | ২০২৬ — English For Today.pdf | 1UQ09BSs--YQ-6ZwVANXuqgujrPn4WWNB | 44210158 | Located; not read/verified |
| 9–10 | ২০২৬ — English For Today.pdf | 1XLk9TBYh1R-jYrpFzjXwIv51239u4Sf4 | 39473358 | Located; not read/verified |
| 11–12 | ২০২৬–২৭ — English for Today.pdf | 1YQwbuKcDdRWUYTMFUMvRhReYu35iAW73 | 64637181 | Located; not read/verified |

Additional Class 7 resource: `Ques. 1-4 Seen Comprehension - Class 7 English 1st.pdf`, ID `1CnWGL8_8bWQQJ0XQIVXkXckV8uT8AkC-`, 11332812 bytes; read attempt denied with Drive 403 (account cannot download). Do not retry read/download/export for this file; owner permission or a user-uploaded copy is required. Listing names or folder ancestry does not verify a book's edition, distribution or answer accuracy.

## Next content steps
Class 7 first, then 8, SSC 9–10 and HSC 11–12. Extract the correct textbook, verify the configured distribution against applicable references, prepare distinct Seen/Unseen groups and every remaining item with answer keys/provenance, validate selected and full paper assembly, and register the authored drafts in the grade-specific registry. Import remains Pending until ADMIN review/approval. No forbidden Class 6 CP(16) download was retried.

## Original setup builder restored
The English build entry now mounts the original `QbBuilder` rather than the separate English setup/editor screen. A typed adapter retains each passage-linked group, tables, questions, keys and blueprint marks/numbering; the original pagination/settings/undo/redo and print machinery are reused. English settings, edits and exclusions are saved into the owned English draft (`builderSettings`), not the general `qb:selected` or `qb:settings` storage. Existing saved drafts remain valid and are not deleted. The original EnglishEditor source is retained for compatibility but is no longer mounted by the build route. General question exchange is intentionally blocked for passage-bound sets; selecting a replacement English item remains a separate selection operation. Print rechecks owned draft access rather than treating English set IDs as billable general Question IDs. This does not alter general-paper wallet or purchased-paper checks.


## Class 7 source inspection started
- Scope: Question Item-wise questions and answer keys only; no new authored full-model rollout or production import/approval.
- Textbook: Drive `1L1W-XCn_grZior6yOaoSkJ9eWviNIYP7`, 32,687,361 bytes, 122 PDF pages; SHA-256 `86d513e1065879022e35b7a8f180b5f6c22005791d4d04927ae7067011f4a6fe`.
- Visual checks: PDF page 1 identifies *English For Today — Class Seven*, NCTB; PDF page 3 states revised edition October 2025. This supports the source identity, not official 2027 exam-blueprint applicability.
- PDF page 6 begins Unit one, *Attention, Please*. Local extraction yielded only 1,155 characters across the entire PDF, so extracted text is not usable as the textbook. Page-image transcription/OCR must be checked against the images before authoring.
- The separate Class 7 Seen Comprehension resource is access-blocked; no attempts to bypass the restriction were made.
- Raw PDF and temporary page images are kept only in excluded local cache, not source control. No authored Class 7 items, live stock, imports or approvals are claimed by this source-inspection step.

## Current priority
Class 7 work is paused at the user's request. Continue with Class 10 English 1st Paper, Question Item-wise questions and answers only. The Class 9–10 textbook candidate above and the applicable Class 10 question distribution still require inspection before authoring. This branch does not add Class 10 content or change runtime behavior. No import or live approval is authorized by this planning update.

## SSC source-first requirements (supersedes textbook-first next step)
- User prioritizes supplied board-question sources for Class 10 English 1st Paper, not NCTB-based question authoring. Do not delete existing saved content or sources in response to the user saying they removed NCTB.
- Targets: 50 Seen sets, 50 Unseen sets, and 40–60 entries for each remaining topic. Count distinct passage/question groups honestly; do not inflate counts with duplicate passages or split subquestions. Confirm the counting unit before final coverage acceptance.
- SSC board questions must retain the actual exam year and board, source file and page, and original question number; year must be displayed and selectable as a filter. The publication/target-exam year in a test-paper filename is not the original board exam year. Unknown years must not be guessed; school/model questions must not be labeled as board questions.
- Drive inventory found `English 1st Paper board 2018_2024.pdf` (`1_ZqFc41JXqhoL2cQPyWIz1NylNqZVp4o`, 2,653,981 bytes), `English 1st Paper School model Question .pdf` (`13FF5HytPlXyfpQAHfBNqTycpe5UFl8Nu`, 2,029,246 bytes), and `SSC_English_Test_Papers_English_1st_paper_2025_(Exam2026).pdf` (`1y7M_psgvAVfEDgcFB7kpHcJaJqafsDp0`, 3,120,450 bytes) in the same supplied English folder.
- Board PDF initial text extraction succeeded: printed pages 15–18 include Dhaka Board 2024 and Rajshahi Board 2024 papers, with Seen passages, MCQs/comprehension, gap filling, Unseen/table/summary, matching, rearranging and writing tasks. This is a partial source inspection, not verification of the complete 2018–2024 coverage or answer keys.
- Source years reflect historical paper patterns; preserve original marks and distinguish any adaptations to the selected practice blueprint. Do not silently present adapted questions as exact board reproductions.
- Year metadata/filter implementation, complete source inventory/deduplication, answer verification and target coverage remain outstanding. Existing Pending/review/approval workflow is unchanged; no live import or approval has been performed.

## SSC extraction batch 1 progress
- Read all three supplied PDFs locally: board compilation 104 pages / 404,000 extracted characters; test papers 116 pages / 394,112 characters; school-model excerpt 15 pages / 54,612 characters. Extraction is not question/answer verification.
- Reproducible read-only heading inventory: `scripts/english/inventory_board_pdf.py`; metadata-only results in `ssc-board-source-inventory.json`. Identified 45 paper headings: 2018 combined board (1), 2019 (8), 2020 (9), 2022 (9), 2023 (9), 2024 (9). No 2021 heading found. These are not distinct passage counts or completed item counts.
- `ssc-dhaka-2024-seen-review.json`: first review-only Seen candidate with 7 MCQs and 5 comprehension answers. Source page image checked; answer keys are assistant-prepared and still require teacher review.
- `ssc-dhaka-2024-unseen-review.json`: first review-only Unseen candidate with structured table, 5 answers and summary. Table image check and teacher answer review remain outstanding.
- Candidates deliberately remain outside runtime/prepared registries: not imported, Pending, approved or live. Target gaps remain at least 49 Seen and 49 Unseen sets, before distinctness/content validation. Remaining topic targets and year-filter implementation are not complete.
- Work is item-wise, not lesson-wise. The existing source lesson annotations are provenance only, not a lesson-based workflow.
