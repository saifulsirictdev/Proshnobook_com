# Class 6 English first-paper complete library coverage

## Deliverable and non-claims
31 complete 100-mark Draft model combinations: the original model01 plus 30 additions, one per existing seen extract. Each has all 13 task IDs, source passages/poems, requested writing topics and separate answer keys. This is a prepared import library, not an executed production import or teacher approval.

**Precise content coverage:**
- All 30 extracts: 5 authored sentence-completion gaps + 5 vocabulary prompts/keys each, 300 source-labelled prompts. Some passages are short dialogues; they remain in the gap/vocabulary slot, not padded into seven MCQ and five written questions.
- MCQ/short-answer: two previously source-read groups (Bulbul and railway), each with seven four-option MCQ and five short answers. Bulbul is default; when second seen is Bulbul, railway replaces first seen. The same extract is never both seen sources in one paper. This is NOT 30 independent MCQ/short-answer groups.
- Three original unseen packs (garden, museum, rain observation), with their existing source-matched five information blanks, five True/False/correction keys, and summary. Matching and rearranging rotate with the same pack to keep context coherent.
- Six textbook poem sources. Each combination has four supplied poems with two existing source-labelled questions per poem: eight offered, any five required. Book attribution/abridged versions retained; no invented poem text.
- Existing story, 120-word paragraph and dialogue model responses are shared. Reuse is explicit, not counted as newly authored content. These combinations intentionally have overlapping questions, not guaranteed unseen/nonrepeat exams for the same pupils.

## Authorship/review
`content/question-bank/class-6/english-1st/complete-bank-exercises.json` contains the authored question/key pairs. Gap answers are checked against the linked source; vocabulary stems are checked against source words/inflections. Such checks do not prove semantic quality or accepted synonyms, which remain subject to teacher review. Alternative valid answers should be accepted by a qualified reviewer. Textbook/sample distribution is not independent current official circular certification. Original unseen exposure must be checked before an exam.

No clinical remedies/dosages or fabricated seen sources are added. Recipe source is ordinary food preparation, not medical advice. Known shopping quantity and letter date inconsistencies remain isolated by source group; no cross-section inference is required.

## Reproduction
Run from repo root:
```
python3 scripts/question-bank/build-class6-english1-complete-bank-model.py --check
python3 scripts/question-bank/build-class6-english1-complete-library.py --check
```
The second builder reads all existing source texts, the explicit exercise file, three practice packs and source-read poem pools. It assembles immutable native selection/output structures with provenance. It makes no provider/API/DB calls and cannot approve/import content. Repeated execution produces identical bytes and deterministic review keys.

## ADMIN workflow
1. `/admin/english-review`: expand 30 new models preview (full passages, questions, keys and provenance).
2. Acknowledge limits, then **৩১টি পূর্ণ মডেল Pending import করুন**.
3. Atomic source-controlled batch import; arbitrary client content/scope/stale digest refused. All newly inserted snapshots PENDING, never automatically approved.
4. Existing decisions are preserved. The original single model is included but is skipped if already present. Repeated/concurrent imports do not duplicate content.
5. Each prepared imported model appears in the review list regardless of the separate 100-row recovery cap. Review and Approve/Reject individually.
6. First-paper Auto Model Test selects only complete APPROVED same-grade snapshots; no AI/quota fallback.

No production ADMIN session is available in this sandbox. Therefore the actual import, approval and live generation are not claimed completed. Grades 7–12 are also not populated by this Class 6 content task; they correctly report missing stock.

## Validation
87 focused tests pass, including every one of 31 complete drafts, exact 30-source coverage, 300 authored source-labelled prompts, 3 unseen pack variants, 6 poem sources, no same-passage seen1/seen2, complete keys/marks/counts, only-approved reuse, stale/scope-forgery guards and idempotent 31-row import retaining rejected/approved decisions. `git diff --check` and both artifact reproduction checks pass. No edited-path TypeScript errors; full local tsc remains blocked by ungenerated Prisma Client. Tests are not teacher semantic review.
