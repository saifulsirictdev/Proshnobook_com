# SSC English 2nd Paper — Items 8 & 9 completed

> Historical Item 8–9 completion report. Items 10–12 have since added 153 prepared writing sets: the complete library totals 612 sets across all twelve items. See [Items 10–12 / full-library completion](ssc-paper2-items-10-12-completion.md).
**Prepared for Classes 9–10 · 102 new distinct sets · PREPARED_NOT_IMPORTED**

These are source-backed prepared practice sets with assistant-authored **possible answers**, not official board/school keys. Teacher review is still required. No production import, approval, PR merge or manual deployment is part of this work.

## Completed inventory

| Current syllabus item | Sets | Practice format | Marks per set | Possible-answer entries | Sources |
| --- | ---: | --- | ---: | ---: | --- |
| 8 — Sentence connectors / linking words | 51 | One complete passage, five labelled gaps (a)–(e) | 5 | 255 gap answers | 22 board + 29 school |
| 9 — Punctuation and capitalization | 51 | One continuous uncorrected passage, one full corrected model | 5 | 51 corrected passages | 30 board + 21 school |
| **New total** | **102** | | **10 marks across the pair** | **306** | **52 board + 50 school** |

With Items 1–7, the library now contains **459 distinct prepared sets across nine item types**, each type with 51 exercises. The same source exercises are available to Classes 9 and 10 and are **not counted twice**.

One selected exercise from each of the nine prepared item types totals **60 marks**, not a full 100-mark model. Only the three writing item types remain: paragraph (10), letter/email/application (10), composition (20).

## Full review documents

- [Item 8 — 51 connector passages, 255 possible answers](ssc-paper2-connectors-review.md)
- [Item 9 — 51 punctuation passages and 51 complete possible corrected models](ssc-paper2-punctuation-review.md)

Every prepared exercise includes:

- Preserved source direction and complete original passage, plus raw extracted question text.
- Actual PDF source filename/Drive ID and PDF SHA256.
- Physical PDF page, original question number, exam year and original marks.
- Board identity **or** school identity with separate Test/Pre-Test exam type, without conflating them.
- Source-content/raw-text/practice-and-answer hashes.
- Replayable, reasoned before/after repair ledger and explicit review limitations.

The current syllabus item numbers **8 and 9** are independent of older original examination question numbers (often 10 and 11). All selected sources originally carry five marks, and their original number/marks are retained.

## Sources and extraction

The three existing Drive PDF sources were sufficient; **no new internet exercise was needed** for this pair:

1. `SSC English 2nd Paper_2018_2024.pdf`
2. `SSC_English_Test_Papers_English_2nd_papper_2025_(Exam2026).pdf`
3. `SSC English 2nd Paper Reputed School Question .pdf`

The 2025 school examination headers establish **examYear 2025**, despite “Exam2026” in the filename. Source PDF hashes are checked before extraction, and expected 45 board + 41 school-2025 + 16 school-2024 examination headers are asserted.

Extraction found **84 connector source exercises (76 exact-distinct)** and **102 punctuation source exercises (86 exact-distinct)**. Full audit candidates remain under `docs/english/work-in-progress/ssc-paper2-{connectors,punctuation}-candidates.json`; those raw pools are not imported or registered directly.

Printed marks and directions are parsed separately from passages. Question boundaries allow Q1–Q15 without treating decimals as question numbers. Part-B composition/writing headings (including different dash styles) are excluded from practice passages while the raw source remains preserved. The connector source with missing (c) is held, not silently relabelled into a finished exercise.

## Selection and editorial decisions

- Board/school reprints of morning walk, magazines, population/food, Facebook, environment, the miser, honesty and other passages were not padded into new sets.
- Punctuation reprints with renamed speakers, small wording changes or shorter excerpts of the same dialogue were also excluded. A source passage is used only once, never split into several supposedly distinct exercises.
- Exact and trigram-overlap checks are screening tools, not proof of semantic uniqueness or answer correctness. The final source selections and possible keys were manually reviewed as drafts.
- Connector answers include conjunctions, discourse markers, relative words, correlative pairs, comparison links and linking expressions used in SSC source exercises; the prepared instruction makes this scope explicit. Multiword links such as `so that`, `not only`, `but also` and `according to` remain single gap answers.
- Repaired faulty parallelism (`both creates … and destroys …`), causal fragments, missing main-clause joins, ambiguous pronouns and source spelling/word-division errors. Relocated an originally non-linking `largely` gap to a genuine contrast connector rather than supplying an adverb as though it were a connector.
- Corrected the ozone-depletion/greenhouse-effect conflation and the source suggestion of contemporary seasonal smallpox. Qualified broad claims about poverty, culture, women, health, disability and food requirements rather than presenting them as verified facts.
- One politically accusatory source passage is explicitly transformed into a **fictional volunteer account** with the same concession/purpose/contrast skills. It is labelled adapted practice in the printable question instruction, not an unchanged board/school reproduction. Original wording and the complete replacement ledger remain visible for teacher review.
- Historical campaign/government-policy descriptions are reported as **source-era accounts**, not verified current affairs or enacted current law. Some sources still express opinions, moral/religious beliefs or fictional narratives; these are not endorsements or independently certified factual claims.
- Punctuation exercises retain a **single continuous passage** and a full corrected model. There are no invented five subquestions, no asserted official correction-position marking scheme, and no narration conversion.
- Spelling/grammar repairs needed before a punctuation-only task (e.g. missing `listen` before `carefully`, `wanderers`/`chance`, `who lives`, `test examination`) are explicitly made in the practice question and ledger. Changed-word practice questions visibly identify themselves as adapted practice in their printable instructions. After those disclosed repairs, every model answer differs only by **punctuation, capitalization or spacing**—not undisclosed word additions or deletions.
- Dialogue attribution and punctuation can admit more than one coherent reading. The model keys are possible versions; teachers must consider valid alternatives.

## Application integration

- Added separate validated prepared drafts for each of the 102 exercises for both Classes 9 and 10.
- Registered them in the existing Paper 2 prepared library and dedicated per-item ADMIN import forms.
- Admin preview exposes complete saved review snapshots, including source originals, possible keys and adaptations. Saved historical snapshots are not replaced with a later prepared-library revision.
- Existing digest-bound explicit consent, ADMIN-only authorization, Pending-only import, idempotency and preservation of prior review decisions are reused without bypasses.
- Approved-only bank reuse, class/paper isolation and question/answer-only modes remain intact.
- Connector passages use the shared five-gap cloze detector, so all gaps print together once, without five repeated placeholder prompts. Newline-only or incomplete-label directions do not hide independent subquestions.
- Punctuation uses `subitems: []` and one task-level corrected answer. It prints as a continuous question/answer and remains one layout block.
- No removed source-selection UI is restored. Header controls and Landscape-only `4–1`, `2–3` folded-booklet code are unchanged.

## Validation

- **TypeScript typecheck: passed.**
- **Complete test suite: 976/976 passed**, including 19 new Item 8–9 tests.
- **Production webpack build: passed.** A sandbox build does not certify live DB connectivity or approve any content.
- Both source-audit JSON files reproduced **byte-identically** from the three SHA256-checked external PDFs.
- All four authored review JSON/Markdown files regenerated **byte-identically**.
- `git diff --check`: passed; generated build files were restored/excluded.

The new tests cover all 102 exercises: exact source/audit linkage, raw/source/practice hashes, replay of every editorial repair, 255 connector answers, 51 complete punctuation models, punctuation-only lexical invariance, source attribution/year separation, validated Class 9/10 drafts, ADMIN/digest/consent/Pending/idempotency rules, approved-only bank reuse, answer/no-answer output, all 102 printable passage layouts, 459 unique registry keys and the remaining writing-item gap.

## Reproduce without production access

```sh
# Only extraction needs external PDF files and PyMuPDF:
python scripts/english/extract-ssc-connectors-punctuation.py /path/to/three/source-pdfs

# Authoring uses committed audit snapshots, not network calls or a production DB:
python scripts/english/author-ssc-items-8-9.py
node --test tests/english-ssc-linking-batches.test.cjs
```

The four generated JSON/Markdown review files should regenerate byte-identically. The original PDF binaries and build artifacts are deliberately excluded from the authored patch.

## Handoff — not yet production approved

After an authorized PR merge/deployment, preview each Class 9/10 / English 2nd Paper **51-set item-specific batch**, explicitly consent to import as Pending, then perform substantive teacher review before approving records for bank use.

**No production import or approval has been performed. No full 100-mark model is claimed while the remaining three writing items are absent.**
