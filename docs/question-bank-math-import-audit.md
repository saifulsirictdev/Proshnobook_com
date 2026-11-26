# Uploaded math.txt import audit

Actual worker entry point executed locally against the user-supplied UTF-8 file, with scope SSC / গণিত / Board Question. No production database or question mutation was used.

```json
{
  "source": "math.txt",
  "bytes": 618374,
  "sha256": "3073b57036389457394475529eb75483b8a63c24fb66ec93549f3272e5157912",
  "staged": 1462,
  "cq": 378,
  "mcq": 1084,
  "missingMcqKeys": 1084,
  "missingSolutions": 1462,
  "sourceReviewRequired": 1462,
  "readyToSave": 0,
  "boardLabels": 36
}
```

The original file is not committed or rewritten. All questions remain review-only: every explanation says “উত্তর নেই” and every MCQ key is missing in the source. Some options, formulas, diagrams and tables are visibly incomplete; this is not a semantic completeness audit. No answer or missing mathematical symbol was fabricated. 36 BOARD labels are file claims, not independent proof of board/year provenance.

The review parser accepts BOARD / Question Number / Section and Bengali Marks suffixes, preserves the source block and unverified reference, and stages invalid rows with correction messages. The ordinary strict parser and server validation are not weakened. Invalid or unacknowledged rows start unselected; ready-only selection plus pre-request validation blocks saving. Source-review acknowledgement resets after editing. Requests contain only entryId/draft, not UI-only review fields. Save still requires explicit duplicate check/review and creates Pending only. Staging is memory-only.

Canonical complete templates and JSON imports retain their previous behavior. TXT/Word review parsing is not OCR, not source verification, and not automatic repair of arbitrary books.
