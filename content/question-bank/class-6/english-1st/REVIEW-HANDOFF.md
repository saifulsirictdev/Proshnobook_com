# Class 6 English 1st Paper — first-pass Draft review handoff

## Completed authoring milestone (not final approval)
- All 33 printed lessons visually read: printed 1–100 / PDF 6–105 of the supplied NCTB 2026 edition.
- 33 initial source-labelled lesson pools with separate student questions and teacher answers. Coverage is initial and varies by lesson; it is **not** 100 MCQ/30 CQ/30 SQ per lesson or exhaustive exercise completion.
- Three original unseen skill-practice packs.
- One complete 100-mark Draft model paper with answer key and author-proposed detailed rubrics: **Reading 70 + Writing 30; 3 hours**.
- Model 01 contains full reading blocks, 13 question types/numbers, eight offered poem questions with any five required, a story title/at least ten new sentences and a 120-word model paragraph.
- Source: supplied textbook sample printed 101–105 / PDF 106–110. Separate current official circular applicability has not been independently verified.

## Files for review
- `model-01-questions.md`: complete student paper.
- `model-01-answers.md`: teacher answer paper and marking guidance.
- `model-01-draft.json`: structured paper, source references and limitations.
- `lesson-NN-questions.md`, `lesson-NN-answers.md`, `lesson-NN-source-draft.json`: per-lesson review material.
- `drive-backup-v00N.json`: actual uploaded archive receipts; do not confuse backups with website import.

## Mandatory remaining gates
1. Teacher semantic review: passage transcription, answer alternatives, difficulty, appropriateness and rubric/excess-answer policy. The tests do not grant approval.
2. Source factual review: do not use known inconsistencies/time-sensitive claims uncritically. These include Independence/Victory Day wording, geographical/travel/monument figures, US/UN mission label, letter dates/addresses, scientific space-travel assertions, health/treatment claims and inconsistent shopping quantities.
3. Audio gate: actual recording or verified teacher script required for exact listening keys and oral assessment. Printed-language preparation is not listening completion.
4. Clinical gate: excluded remedy recipes/drug recommendations need qualified review before any proposed reuse. No treatment instructions are endorsed.
5. Model exposure gate: U1 reuses original pack 002. Replace it if previously taught to the pupils; unseen status depends on exposure.
6. Website gate: no authenticated import, approval, publication or production database change performed. These lesson/model formats are review artifacts, not a claim of compatibility with the website's generic import schema.
7. Drive layout: archives have internal lesson folders; separate browsable Drive lesson folders remain to be arranged. Old backup versions must remain intact.

## Reproduction and validation
Run every `scripts/question-bank/build-class6-english1-*.py` with `--check`; run `node --test tests/class6-english1-*.test.cjs`. Backup packaging: `python3 scripts/question-bank/package-class6-english1-backup.py --version vNNN` (choose a new version; existing archives are not overwritten).

## Initial lesson pool inventory
Counts below distinguish item types. One writing model or sentence set is not equivalent to one MCQ; do not add mixed units and call the sum an exam-question total.

| Lesson | Topic | Initial activities/sub-items |
| --- | --- | --- |
| 1 | Going to a new school | mcq: 7; short-answers: 5; gaps: 5; vocabulary: 5; poem: 8; paragraph: 1 |
| 2 | Congratulations! Well Done! | mcq: 7; short-answers: 7; vocabulary: 5; responses: 5; dialogue: 1 |
| 3 | At a Railway Station | mcq: 7; short-answers: 5; vocabulary: 5; summary: 1; picture: 1; paragraph: 1 |
| 4 | Where Are You From? | mcq: 7; short-answers: 5; vocabulary: 5; language-use: 2; dialogue: 1 |
| 5 | Thanks for Your Work | mcq: 7; short-answers: 5; vocabulary: 5; verb-forms: 5; paragraph: 1 |
| 6 | It Smells Good! | mcq: 7; short-answers: 5; vocabulary: 5; verb-choice: 5; dialogue: 1 |
| 7 | Holding Hands | poem: 8; vocabulary: 5; sentences: 1 |
| 8 | Grocery Shopping | mcq: 7; short-answers: 5; vocabulary: 5; quantity-reading: 5; language-use: 5; dialogue: 1 |
| 9 | Health is Wealth | mcq: 7; short-answers: 5; vocabulary: 5; paragraph: 1 |
| 10 | Remedies: Modern and Traditional | mcq: 5; short-answers: 5; vocabulary: 5; dialogue: 1 |
| 11 | Are You Listening?-1 | word-forms: 5; vocabulary: 5; sentences: 1 |
| 12 | An Unseen Beauty of Bangladesh | mcq: 7; short-answers: 5; vocabulary: 5; paragraph: 1 |
| 13 | Our Pride | mcq: 7; short-answers: 5; vocabulary: 5; paragraph: 1 |
| 14 | The Lion’s Mane | mcq: 7; short-answers: 5; vocabulary: 5; paragraph: 1 |
| 15 | An Old People’s Home | mcq: 7; short-answers: 5; vocabulary: 5; paragraph: 1 |
| 16 | Boats Sail on the Rivers | poem: 8; vocabulary: 5; sentences: 1 |
| 17 | Are You Listening?-2 | poem: 8; vocabulary: 5; sentences: 1 |
| 18 | Make Your Snacks | mcq: 7; short-answers: 5; vocabulary: 5; paragraph: 1 |
| 19 | Stop, Look and Listen | verse-answers: 5; vocabulary: 3; paragraph: 1 |
| 20 | Hason Raja: The Mystic Bard of Bangladesh | short-answers: 5; vocabulary: 5 |
| 21 | Wonders of the World-1 | short-answers: 5; vocabulary: 5 |
| 22 | Wonders of the World-2 | short-answers: 5; vocabulary: 5 |
| 23 | We Live in a Global Village | short-answers: 5; vocabulary: 5 |
| 24 | Our Wage Earners | short-answers: 5; vocabulary: 5 |
| 25 | The Concert for Bangladesh | short-answers: 5; vocabulary: 5 |
| 26 | Buying Clothes | short-answers: 5; vocabulary: 5 |
| 27 | Andre | poem: 8; vocabulary: 5 |
| 28 | Are You Listening?-3 | short-answers: 5; vocabulary: 5 |
| 29 | Taking a Test | short-answers: 5; vocabulary: 5 |
| 30 | What Should We Do? | short-answers: 5; vocabulary: 5; dialogue: 1 |
| 31 | Too Much or Too Little Water | short-answers: 5; vocabulary: 5 |
| 32 | An Invitation for Robin | short-answers: 5; vocabulary: 5; letter: 1 |
| 33 | The Garden | short-answers: 8; vocabulary: 5 |

## Source locators
Use v005 or later: explicit `printed-to-pdf-pages.json` replaces the incorrect uniform printed+5 locator in earlier archives. Physical scan pages are reordered.

## Pending-import conversion
33 catalog-scoped lesson batches (96 MCQ + 404 unstructured English written/SQ records) are now registered in source and available as strict upload JSON under `import/`. This is not a database receipt. See `docs/question-bank/CLASS6-ENGLISH1-PENDING-IMPORT.md`. Teacher review, ADMIN save, deployment and approval/publication gates remain distinct. Full model/unseen packs remain excluded from the lesson-only import catalog.
