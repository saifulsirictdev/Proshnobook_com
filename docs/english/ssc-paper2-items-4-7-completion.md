# SSC English 2nd Paper — Items 4–7 preparation completed

> Historical Item 4–7 completion report. Items 8–9 have since added 102 prepared sets: the current library totals 459 sets across nine items. See [Items 8–9 completion](ssc-paper2-items-8-9-completion.md).
**Classes 9–10 · 204 new unique prepared review sets · 1,275 possible answer entries**

**PREPARED_NOT_IMPORTED — NOT production-imported, NOT teacher-approved.** These are assistant-prepared possible answers, not official board/school answer keys. Teacher approval remains a substantive, separate step; passing software tests is not content approval.

## Completed batches

| SSC item | Sets | Questions per set | Marks per practice set | Possible answers | Source composition |
| --- | ---: | ---: | ---: | ---: | --- |
| 4 — Changing sentences | 51 | 10 | 10 | 510 | 28 board + 23 school |
| 5 — Tag questions | 51 | 5 | 5 | 255 | 30 board + 21 school |
| 6 — Suffixes and prefixes | 51 | 5 | 5 | 255 | 21 board + 30 school |
| 7 — Prepositions | 51 | 5 | 5 | 255 | 29 school + 22 web practice exercises |
| **New total** | **204** | | **25 marks across these four items** | **1,275** | **79 board + 103 school + 22 web** |

Combined with the existing 51 sets each for gap-clues, substitution and right forms of verbs, the prepared Paper 2 library now contains **357 unique sets across seven items**. Classes 9 and 10 reuse those same exercises: they are not counted twice.

A selection of one exercise from each of the seven prepared items totals **50 marks**. This is **not yet a complete 100-mark model**: Items 8–12 (connectors, punctuation, paragraph, letter/email/application and composition) were not authored in this work.

## Full question/answer review documents

- [Item 4 — Changing sentences: 51 sets / 510 possible answers](ssc-paper2-transformation-review.md)
- [Item 5 — Tag questions: 51 sets / 255 possible answers](ssc-paper2-tags-review.md)
- [Item 6 — Suffixes and prefixes: 51 sets / 255 possible answers](ssc-paper2-affixes-review.md)
- [Item 7 — Prepositions: 51 sets / 255 possible answers](ssc-paper2-prepositions-review.md)

Each document includes the prepared questions, possible keys, complete original-source transcript, original physical PDF page/question/year/marks where applicable, source hashes, and explicit before/after editorial repairs. The corresponding machine-readable files are under `lib/english/data/ssc-paper2-*-review.json`.

## Repetition, repairs and adaptations

- Provisional source queues were not treated as finished questions. Reprints and near-reprints were reviewed again during authoring; final selections differ from the initial queues.
- Excluded repeated water, terrorism, time/fortune and internet transformation exercises rather than padding the count with school reprints. Additional distinct PDF exercises replace them.
- Replaced a tag set assembled largely from already-used statements with a different source set. Contextual tag answers account for indefinite people, negative adverbials, imperatives, main/quoted clauses, collective nouns and auxiliaries. Elliptical wishes/exclamations and unclear figurative subjects were explicitly rewritten into taggable statements rather than assigned forced answers.
- Removed duplicated leisure/happiness/Facebook/vocabulary affix passages and the unsupported mobile-radiation/brain-tumour passage. Repairs to spelling, missing words, roots and unsafe generalisations are disclosed.
- **21 affix originals** have ten or fourteen gaps. Each becomes **one** coherent five-gap practice set: retain original (a)–(e), explicitly fill remaining source gaps with the preserved `originalAnswerKey`, and retain the full original-to-practice/root mapping and replayable passage conversion. No original is split into multiple allegedly distinct sets. The remaining **30 affix sets** use five-gap school originals.
- All selected Board 2023 affix originals retain their actual **14 gaps / 7 original marks** in source metadata, while current practice is five gaps / five marks. Printed board provenance identifies the selected parts.
- The mixed preposition/article originals remain in the source audit but are **not imported as standalone preposition exercises**. Final preposition sets use 29 standalone school passages and the internet supplement below. Article/zero-article blanks were not forced to take prepositions.
- Original source wording remains independently accessible. A changed direction, supplied agent, repaired sentence, modernised term or changed root is explicitly disclosed as **source-backed adapted practice**, not an unaltered official examination reproduction.
- Source-era stories, historical claims, statistics, rankings, philosophical/religious beliefs, health statements and broad social judgements are not independently certified facts or endorsements. School-level rhetorical-question, degree and antonym conventions and natural alternative forms still require teacher judgement.

## Internet supplement — actual provenance, no invented board/school

User permission to search online was used when the PDF preposition stock remained repetitive or unsuitable.

**22 distinct practice exercises** were transcribed from [Skylark Education — Preposition Exercise for SSC](https://skylarkeducation.com/preposition-exercise-for-ssc/), retrieved **2026-11-20**. Selected exercise numbers are **1, 3–13, 16–17, 19–22, 24–26 and 29**.

- Each retains its actual URL/title/exercise number, source transcript, retrieval date and transcript hash.
- There is **no fabricated board, school, exam year, original marks or physical PDF page**. Such fields are absent, not placeholders.
- The web-source hash covers the saved selected-exercise transcript snapshot, **not the entire changing website**. The snapshot is reconstructible from the 22 preserved source passages.
- These remain web practice when reused; board-year/school filters cannot silently relabel them as an examination question.
- Some source exercises include phrasal particles or infinitival `to`, as common in SSC preposition practice. The prepared task instruction states this explicitly.

## Application integration completed

- Registered 51 validated source-backed drafts per new item for Classes 9 and 10, with exact syllabus numbers and marks.
- Reused the dedicated per-item ADMIN import flow: **preview → explicit digest-bound consent → Pending only → separate teacher review/approval**.
- Review snapshots retain the original/adapted content, keys, root/part maps, changes, source hashes and web URL where applicable. Saved records do not silently acquire a later library revision.
- Re-import skips duplicates and preserves previous approval/rejection decisions.
- Approved-only bank reuse, class/paper isolation and answer/no-answer generation remain enforced.
- Affix/preposition passages print atomically with all five gaps once; placeholder prompts are suppressed. Answer-only output shows labelled keys without leaking the passage. Independent tag/transformation subquestions remain visible and flow across pages.
- Newline-only directions cannot accidentally hide unrelated independent subquestions.
- No removed source-selection UI was restored. Header printing and Landscape-only folded-booklet `4–1`, `2–3` code was not changed.

## Validation

- TypeScript typecheck: **passed**.
- Complete test suite: **957/957 passed**, including **28 new grammar-batch tests**.
- Production build: **`next build --webpack` passed**. Sandbox build-time DB access was unavailable; this is not production DB verification, and no content was written.
- The authoring script regenerated all four review JSON/Markdown pairs **byte-identically** after final verification.
- A final focused rerun also checks that web exercises cannot satisfy board-year/school source filters.
- `git diff --check`: passed. Generated build artifacts are excluded from the authored patch.

Tests cover all 204 authored sets, all 1,275 answer entries, source/adapted hashes, replay of every editorial change, affix source-to-practice mappings, web provenance without invented examination metadata, per-grade draft validation, per-item ADMIN/consent/idempotency safeguards, approved-only reuse, the 357-set registry, missing-model items, and printing of every new exercise.

## Safe admin handoff

After this PR is merged/deployed with permission:

1. Open the existing Admin question-import page and select Class 9 or 10 / English 2nd Paper.
2. Preview each dedicated **51-set item batch**, including original source snapshots and corrections.
3. Explicitly consent and import **one selected item** as Pending. A general all-items action also exists; use the item-specific action for controlled review.
4. Review every question and answer substantively; accept alternatives/correct content as needed before approval.
5. Only approved, structurally valid item records can be used in the normal bank.

**No production DB import, auto-approval, PR merge or manual production deployment was performed.** A future merge/deploy must not be mistaken for content approval.

## Reproduce authoring

```sh
python scripts/english/author-ssc-items-4-7.py
node --test tests/english-ssc-grammar-batches.test.cjs
```

The authoring script uses the preserved source-audit JSON and reviewed manual possible keys, not a network service or production DB. It regenerates the four review JSON/Markdown pairs deterministically. The older extraction-stage progress documents are retained as explicitly historical snapshots, not current status reports.
