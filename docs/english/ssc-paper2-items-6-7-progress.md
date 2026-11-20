# SSC English Paper 2 — Items 6 & 7: source work started

**Status: EXTRACTED / UNREVIEWED / NOT IMPORTABLE. Answer authoring and runtime integration have not been completed.**

This paired work covers **Item 6: Suffixes and prefixes** and **Item 7: Gap filling with prepositions** for Classes 9–10. The target remains **at least 51 genuinely distinct complete sets per item**. A source candidate or an adaptation slot is not a completed set.

## Current inventory

| Item | Source exercises extracted | Exact-distinct transcripts¹ | Provisional source slots | Current-format matches² | Adaptation required |
| --- | ---: | ---: | ---: | ---: | ---: |
| 6 — Suffixes and prefixes | 102 | 99 | 51 | 36 | 15 |
| 7 — Prepositions | 60 | 57 | 51 | 36 | 15 |

¹ Exact-distinct counts normalized full-passage hashes, not editorially proven semantic uniqueness. Three-word overlap screening additionally holds likely near-reprints; manual review must still reject merely renamed, reordered or cosmetically reworded exercises.

² A format match means an extracted **five-gap / five-mark / single-skill** source without detected structural issues. It does not certify correct grammar, a valid answer key, safe factual claims or official current-syllabus status.

**162 source exercises** are preserved. Each provisional queue has 51 source slots, but **only 36 per item currently match the five-gap source format** after structural/deduplication screening. The remaining 15 per item need explicit adaptation. Therefore **51 final sets per item have not been achieved**.

## Source-format findings

### Affixes

- Extracted all **102** affix exercises: 45 board + 41 school Test 2025 + 16 school Test/Pre-Test 2024.
- Source labels/counts: 37 five-gap exercises, 54 ten-gap exercises, nine fourteen-gap exercises, one unlabelled exercise and one exercise with only four printed labels. These are kept intact, not silently cropped or padded.
- **All nine Board 2023 originals:** fourteen gaps `(a)`–`(n)`, printed `0.5 × 14 = 7`, Q7. They are NOT ten-gap/five-mark originals.
- The ten-gap originals generally award five marks. Matripith Govt. Girls’ High School 2025 is also a ten-gap original, despite its 2025 exam year.
- **Rani Bilashmoni Govt. Boys’ High School 2025:** declares five gaps but prints no `(a)`–`(e)` labels. Roots/blanks are preserved; labels have not been invented. Held for manual review.
- **Qadirabad Cantonment Public School 2025:** prints `(a), (b), (c), (e)`; `(d)` is missing. Held, not automatically repaired.
- **Ispahani Public School & College 2025:** printed expression says `1 × 5 = 5`, but ten labelled gaps are present. Both facts are retained; held for manual review.
- Font-encoded digits in Binapani Govt. Girls’ High School’s marks line are normalized only for parsing; raw source text remains available.
- Current provisional queue: **36 five-gap Test 2025 school sources + nine ten-gap Board 2024 sources + six fourteen-gap Board 2023 sources**. This is an authoring queue, not 51 prepared exercises.

### Prepositions

- Extracted **60 preposition-related exercises**: 41 standalone five-gap school Test 2025 exercises + 18 mixed preposition/article board exercises from 2022–2023 + one mixed school-2024 exercise.
- The **19 mixed originals** are explicitly classified `mixed-prepositions-articles`, NOT standalone preposition sets. They each retain ten labels and five original marks.
- Mixed exercise directions can permit articles, zero article and prepositions. No individual blank has been called a preposition blank without answer-level review.
- The source audit records **42 examination papers with no instruction explicitly identifying a preposition exercise**. It does not relabel generic gap-fill/clue-box questions as preposition questions just to fill a quota.
- Current provisional queue: **36 standalone five-gap Test 2025 school sources + 15 mixed ten-gap board sources requiring adaptation**. No completed five-gap adaptation exists yet.
- Example of a genuine attribution difference: mixed sources are Board 2022/2023 **Q1**, whereas standalone school Test 2025 prepositions are **Q7**. Original numbers are preserved.

## Required adaptation policy — work still outstanding

The current blueprint gives **five gaps × one mark = five marks** for each item. Any source with ten/fourteen gaps or mixed skills requires more than changing its displayed mark:

1. Preserve the entire original transcript and original marks/counts.
2. Author and review the original contextual answers before choosing an adaptation. For mixed questions, distinguish prepositions from articles/zero article.
3. Write a coherent five-gap adapted passage, supply any filled source words explicitly, and record a replayable before/after ledger plus the original-to-adapted label map.
4. Retain board/school/year attribution as **source-backed adapted practice**, never as an unaltered official examination reproduction.
5. Count an original passage once; do not split one source into multiple allegedly distinct sets to inflate the batch.
6. Replace unsuitable candidates or use further verifiable source material if a valid five-gap adaptation cannot be made. No fabricated attribution or forced grammatical answer.

## Remaining acceptance checklist

- [ ] Substantive duplicate, wording, grammar and factual-safety review for every selected passage.
- [ ] Affixes: verified root → derived word mappings, negation, spelling, inflection, possible variants and all answer keys.
- [ ] Prepositions: verified contextual answers and acceptable variants; explicit article/zero-article classification for mixed sources.
- [ ] At least 51 distinct viable five-gap practice sets per item, including disclosed adaptations where used.
- [ ] Final review JSON + readable review document, answers, original/adapted hashes and correction ledger.
- [ ] Classes 9–10 validated prepared drafts and durable review snapshots.
- [ ] Per-item ADMIN preview → explicit digest-bound consent → Pending import, then separate teacher approval.
- [ ] Approved-only bank reuse, paper/grade isolation, atomic passage print rendering, full test suite, typecheck and webpack production build.

## What has NOT changed

- These files are under `docs/english/work-in-progress/`; no runtime component, bank or import registry reads them.
- `answerStatus` is **NOT_AUTHORED** throughout this stage. There are no official or assistant-prepared answer keys for Items 6–7 in this batch yet.
- Prepared Items 1–3 remain **153 unique sets**. Classes 9 and 10 reuse those exercises; the count is not doubled.
- Items 4–5 remain at their earlier extraction/provisional-selection stage; their answer authoring and final integration are still outstanding.
- Items 8–12 were not started here.
- No production DB import/approval, merge or manual deployment. No visible source-selection UI restored. Header printing and Landscape `4–1`, `2–3` booklet behaviour were untouched.

## Validation at this stage

- **Eight new candidate-audit tests passed.** They cover metadata, hashes, source marks/counts, exact reprint references, 14-gap originals, mixed skills, malformed labels, provisional adaptation status and runtime non-registration.
- **42/42 focused tests passed**, including existing Items 1–3 and Items 4–5 candidate checks. This is not a claim that the full application test suite or a new production build was run.
- All three source PDF hashes were verified before extraction. A repeat extraction produced byte-identical new candidate JSON; the existing Item 4–5 candidate files were also unchanged.
- Decimal marks such as `0.5` are not treated as question numbers. A line beginning `1971.` inside the Mymensingh 2023 passage is retained as text, not a new question.
- No build/typecheck was run for this documentation/extraction-tool-only change. Software checks are not content approval.

## Reproduce

Keep the three PDFs outside Git. The script verifies their hashes, preserves source originals and leaves any insufficient queue visibly unfilled rather than padding it.

```sh
python -m venv /tmp/ssc-pdf-venv
/tmp/ssc-pdf-venv/bin/pip install pymupdf==2.1
/tmp/ssc-pdf-venv/bin/python scripts/english/extract-ssc-affix-preposition-candidates.py /path/to/source-pdfs
node --test tests/english-ssc-affix-preposition-candidates.test.cjs
```

## PDF sources

- [SSC English 2nd Paper_2018_2024.pdf](https://drive.google.com/file/d/1ku0ftd_VEEAD2DkQVRQ-5qlxrKTGpJyU/view)
  - SHA-256: `d1fb691fca0f410d6c46e95ad9c0b3f1b02d8da9f164c3f28d722a0c4463c664`
- [SSC_English_Test_Papers_English_2nd_papper_2025_(Exam2026).pdf](https://drive.google.com/file/d/1esU8C-hZwrqxxmTgWMKCzca17W9z_2N8/view)
  - SHA-256: `de7df74f2654e7478ab2902571d21274d8bd4bd141a71c0e58a8ca6c3fe5b8e5`
- [SSC English 2nd Paper Reputed School Question .pdf](https://drive.google.com/file/d/1buc7ygEGoIefpPZwCoNl1ES9Umn220Cd/view)
  - SHA-256: `c654f3b803cc0e9c167873ceee8513feb2e3e21af2ff9de390a1b6f477f7e2bb`

## Item 6 — Affixes: provisional authoring slots

**No answers authored. “Adaptation required” is a blocker, not an approved adaptation.**

| Slot | Candidate suffix | Source as printed | Year | Original Q | PDF page | Original gaps / marks | Work required |
| ---: | ---: | --- | ---: | ---: | ---: | --- | --- |
| 1 | 046 | Govt. Mohammadpur Model School & College, Dhaka · Test | 2025 | 6 | 2 | 5 / 5 | Answer authoring / content review |
| 2 | 047 | Tejgaon Government High School, Dhaka · Test | 2025 | 6 | 3 | 5 / 5 | Answer authoring / content review |
| 3 | 048 | Sher-E-Bangla Nagar Govt. Girls' High School‚ Dhaka · Test | 2025 | 6 | 5 | 5 / 5 | Answer authoring / content review |
| 4 | 049 | Khilgaon Govt. High School, Dhaka · Test | 2025 | 6 | 6 | 5 / 5 | Answer authoring / content review |
| 5 | 050 | Haji M.A. Gafur Govt. Secondary School, Dhaka · Test | 2025 | 6 | 7 | 5 / 5 | Answer authoring / content review |
| 6 | 051 | SOS Hermann Gmeiner College, Dhaka · Test | 2025 | 6 | 9 | 5 / 5 | Answer authoring / content review |
| 7 | 053 | Kishoreganj Govt. Boy's High School, Kishoreganj · Test | 2025 | 6 | 12 | 5 / 5 | Answer authoring / content review |
| 8 | 054 | Madhupur Shahid Smrity Higher Secondary School, Tangail · Test | 2025 | 6 | 14 | 5 / 5 | Answer authoring / content review |
| 9 | 055 | Binapani Govt. Girls' High School, Gopalganj · Test | 2025 | 6 | 15 | 5 / 5 | Answer authoring / content review |
| 10 | 056 | Rajbari Govt. High School, Rajbari · Test | 2025 | 6 | 17 | 5 / 5 | Answer authoring / content review |
| 11 | 057 | Agricultural University High School, Mymensingh · Test | 2025 | 6 | 18 | 5 / 5 | Answer authoring / content review |
| 12 | 058 | Unique Progressive School, Mymensingh · Test | 2025 | 6 | 20 | 5 / 5 | Answer authoring / content review |
| 13 | 059 | Sherpur Govt. Victoria Academy, Sherpur · Test | 2025 | 6 | 21 | 5 / 5 | Answer authoring / content review |
| 14 | 060 | Bonowary Lal Govt. High School, Sirajganj · Test | 2025 | 6 | 22 | 5 / 5 | Answer authoring / content review |
| 15 | 061 | Saleha Ishaque Govt. Girls' High School, Sirajganj · Test | 2025 | 6 | 24 | 5 / 5 | Answer authoring / content review |
| 16 | 062 | Govt. Promothnath (P.N.) Girl's High School, Rajshahi · Test | 2025 | 6 | 26 | 5 / 5 | Answer authoring / content review |
| 17 | 063 | Bogura Cantonment Public School & College, Bogura · Test | 2025 | 6 | 27 | 5 / 5 | Answer authoring / content review |
| 18 | 064 | Harimohan Govt. High School, Chapainawabganj · Test | 2025 | 6 | 28 | 5 / 5 | Answer authoring / content review |
| 19 | 066 | Naogaon Krishnadhan Govt. High School, Naogaon · Test | 2025 | 6 | 31 | 5 / 5 | Answer authoring / content review |
| 20 | 067 | Lions School and College, Saidpur, Nilphamari · Test | 2025 | 6 | 33 | 5 / 5 | Answer authoring / content review |
| 21 | 068 | Gaibandha Govt. Boys' High School, Gaibandha · Test | 2025 | 6 | 34 | 5 / 5 | Answer authoring / content review |
| 22 | 069 | Kurigram Govt. Girls' High School, Kurigram · Test | 2025 | 6 | 36 | 5 / 5 | Answer authoring / content review |
| 23 | 070 | Lalmonirhat Govt. High School, Lalmonirhat · Test | 2025 | 6 | 37 | 5 / 5 | Answer authoring / content review |
| 24 | 071 | Jhenaidah Govt. High School, Jhenaidah · Test | 2025 | 6 | 38 | 5 / 5 | Answer authoring / content review |
| 25 | 072 | Dawood Public School and College, Jashore · Test | 2025 | 6 | 40 | 5 / 5 | Answer authoring / content review |
| 26 | 073 | Akij Collegiate School, Jashore · Test | 2025 | 6 | 41 | 5 / 5 | Answer authoring / content review |
| 27 | 074 | Khulna Collegiate Girls' School & KCC Women's College, Khulna · Test | 2025 | 6 | 43 | 5 / 5 | Answer authoring / content review |
| 28 | 076 | Kushtia Govt. Girls High School, Kushtia · Test | 2025 | 6 | 46 | 5 / 5 | Answer authoring / content review |
| 29 | 077 | Our Lady of Fatema Girls High School, Cumilla · Test | 2025 | 6 | 47 | 5 / 5 | Answer authoring / content review |
| 30 | 079 | Hasan Ali Govt. High School, Chandpur · Test | 2025 | 5 | 50 | 5 / 5 | Answer authoring / content review |
| 31 | 080 | Lakshmipur Adarsha Samad Government High School, Lakshmipur · Test | 2025 | 6 | 52 | 5 / 5 | Answer authoring / content review |
| 32 | 081 | Chattogram Govt. Girls High School, Chattogram · Test | 2025 | 6 | 54 | 5 / 5 | Answer authoring / content review |
| 33 | 083 | Sant Scholastica Girls School, Chattogram · Test | 2025 | 6 | 56 | 5 / 5 | Answer authoring / content review |
| 34 | 084 | Blue Bird High School and College, Sylhet · Test | 2025 | 6 | 58 | 5 / 5 | Answer authoring / content review |
| 35 | 085 | Habiganj Government High School, Habiganj · Test | 2025 | 6 | 60 | 5 / 5 | Answer authoring / content review |
| 36 | 086 | Govt. Jubilee High School, Sunamgonj · Test | 2025 | 6 | 61 | 5 / 5 | Answer authoring / content review |
| 37 | 001 | Dhaka Board | 2024 | 8 | 2 | 10 / 5 | Adaptation required |
| 38 | 002 | Rajshahi Board | 2024 | 8 | 4 | 10 / 5 | Adaptation required |
| 39 | 003 | Jashore Board | 2024 | 8 | 6 | 10 / 5 | Adaptation required |
| 40 | 004 | Cumilla Board | 2024 | 8 | 8 | 10 / 5 | Adaptation required |
| 41 | 005 | Chattogram Board | 2024 | 8 | 10 | 10 / 5 | Adaptation required |
| 42 | 006 | Sylhet Board | 2024 | 8 | 12 | 10 / 5 | Adaptation required |
| 43 | 007 | Barishal Board | 2024 | 8 | 14 | 10 / 5 | Adaptation required |
| 44 | 008 | Dinajpur Board | 2024 | 8 | 16 | 10 / 5 | Adaptation required |
| 45 | 009 | Mymensingh Board | 2024 | 8 | 18 | 10 / 5 | Adaptation required |
| 46 | 010 | Dhaka Board | 2023 | 7 | 20 | 14 / 7 | Adaptation required |
| 47 | 011 | Rajshahi Board | 2023 | 7 | 22 | 14 / 7 | Adaptation required |
| 48 | 012 | Jashore Board | 2023 | 7 | 24 | 14 / 7 | Adaptation required |
| 49 | 013 | Cumilla Board | 2023 | 7 | 26 | 14 / 7 | Adaptation required |
| 50 | 014 | Chattogram Board | 2023 | 7 | 28 | 14 / 7 | Adaptation required |
| 51 | 015 | Sylhet Board | 2023 | 7 | 30 | 14 / 7 | Adaptation required |

### Flags across all extracted candidates

- `SOURCE_COUNT_DIFFERS_FROM_CURRENT_BLUEPRINT`: 65.
- `EXACT_REPRINT`: 3.
- `MALFORMED_GAP_LABELS`: 2.
- `PRINTED_COUNT_DIFFERS_FROM_LABEL_COUNT`: 3.
- Queue hold `POSSIBLE_NEAR_REPRINT`: 12.
- Queue hold `MANUAL_SOURCE_REVIEW_REQUIRED`: 3.

## Item 7 — Prepositions: provisional authoring slots

**No answers authored. “Adaptation required” is a blocker, not an approved adaptation.**

| Slot | Candidate suffix | Source as printed | Year | Original Q | PDF page | Original gaps / marks | Work required |
| ---: | ---: | --- | ---: | ---: | ---: | --- | --- |
| 1 | 019 | Govt. Mohammadpur Model School & College, Dhaka · Test | 2025 | 7 | 2 | 5 / 5 | Answer authoring / content review |
| 2 | 020 | Tejgaon Government High School, Dhaka · Test | 2025 | 7 | 3 | 5 / 5 | Answer authoring / content review |
| 3 | 021 | Sher-E-Bangla Nagar Govt. Girls' High School‚ Dhaka · Test | 2025 | 7 | 5 | 5 / 5 | Answer authoring / content review |
| 4 | 022 | Khilgaon Govt. High School, Dhaka · Test | 2025 | 7 | 6 | 5 / 5 | Answer authoring / content review |
| 5 | 023 | Haji M.A. Gafur Govt. Secondary School, Dhaka · Test | 2025 | 7 | 8 | 5 / 5 | Answer authoring / content review |
| 6 | 024 | SOS Hermann Gmeiner College, Dhaka · Test | 2025 | 7 | 9 | 5 / 5 | Answer authoring / content review |
| 7 | 025 | Rani Bilashmoni Govt. Boys' High School, Gazipur · Test | 2025 | 7 | 11 | 5 / 5 | Answer authoring / content review |
| 8 | 026 | Kishoreganj Govt. Boy's High School, Kishoreganj · Test | 2025 | 7 | 12 | 5 / 5 | Answer authoring / content review |
| 9 | 027 | Madhupur Shahid Smrity Higher Secondary School, Tangail · Test | 2025 | 7 | 14 | 5 / 5 | Answer authoring / content review |
| 10 | 028 | Binapani Govt. Girls' High School, Gopalganj · Test | 2025 | 7 | 15 | 5 / 5 | Answer authoring / content review |
| 11 | 029 | Rajbari Govt. High School, Rajbari · Test | 2025 | 7 | 17 | 5 / 5 | Answer authoring / content review |
| 12 | 030 | Agricultural University High School, Mymensingh · Test | 2025 | 7 | 18 | 5 / 5 | Answer authoring / content review |
| 13 | 031 | Unique Progressive School, Mymensingh · Test | 2025 | 7 | 20 | 5 / 5 | Answer authoring / content review |
| 14 | 032 | Sherpur Govt. Victoria Academy, Sherpur · Test | 2025 | 7 | 21 | 5 / 5 | Answer authoring / content review |
| 15 | 033 | Bonowary Lal Govt. High School, Sirajganj · Test | 2025 | 7 | 23 | 5 / 5 | Answer authoring / content review |
| 16 | 034 | Saleha Ishaque Govt. Girls' High School, Sirajganj · Test | 2025 | 7 | 24 | 5 / 5 | Answer authoring / content review |
| 17 | 036 | Bogura Cantonment Public School & College, Bogura · Test | 2025 | 7 | 27 | 5 / 5 | Answer authoring / content review |
| 18 | 037 | Harimohan Govt. High School, Chapainawabganj · Test | 2025 | 7 | 29 | 5 / 5 | Answer authoring / content review |
| 19 | 039 | Naogaon Krishnadhan Govt. High School, Naogaon · Test | 2025 | 7 | 32 | 5 / 5 | Answer authoring / content review |
| 20 | 040 | Lions School and College, Saidpur, Nilphamari · Test | 2025 | 7 | 33 | 5 / 5 | Answer authoring / content review |
| 21 | 041 | Gaibandha Govt. Boys' High School, Gaibandha · Test | 2025 | 7 | 34 | 5 / 5 | Answer authoring / content review |
| 22 | 043 | Lalmonirhat Govt. High School, Lalmonirhat · Test | 2025 | 7 | 37 | 5 / 5 | Answer authoring / content review |
| 23 | 044 | Jhenaidah Govt. High School, Jhenaidah · Test | 2025 | 7 | 39 | 5 / 5 | Answer authoring / content review |
| 24 | 045 | Dawood Public School and College, Jashore · Test | 2025 | 7 | 40 | 5 / 5 | Answer authoring / content review |
| 25 | 046 | Akij Collegiate School, Jashore · Test | 2025 | 7 | 42 | 5 / 5 | Answer authoring / content review |
| 26 | 047 | Khulna Collegiate Girls' School & KCC Women's College, Khulna · Test | 2025 | 7 | 43 | 5 / 5 | Answer authoring / content review |
| 27 | 048 | St. Paul's High School, Bagerhat · Test | 2025 | 7 | 45 | 5 / 5 | Answer authoring / content review |
| 28 | 049 | Kushtia Govt. Girls High School, Kushtia · Test | 2025 | 7 | 46 | 5 / 5 | Answer authoring / content review |
| 29 | 051 | Matripith Govt. Girls' High School, Chandpur · Test | 2025 | 7 | 49 | 5 / 5 | Answer authoring / content review |
| 30 | 052 | Hasan Ali Govt. High School, Chandpur · Test | 2025 | 7 | 51 | 5 / 5 | Answer authoring / content review |
| 31 | 053 | Lakshmipur Adarsha Samad Government High School, Lakshmipur · Test | 2025 | 7 | 52 | 5 / 5 | Answer authoring / content review |
| 32 | 054 | Chattogram Govt. Girls High School, Chattogram · Test | 2025 | 7 | 54 | 5 / 5 | Answer authoring / content review |
| 33 | 055 | Ispahani Public School & College‚ Cumilla · Test | 2025 | 7 | 55 | 5 / 5 | Answer authoring / content review |
| 34 | 056 | Sant Scholastica Girls School, Chattogram · Test | 2025 | 7 | 57 | 5 / 5 | Answer authoring / content review |
| 35 | 057 | Blue Bird High School and College, Sylhet · Test | 2025 | 7 | 58 | 5 / 5 | Answer authoring / content review |
| 36 | 059 | Govt. Jubilee High School, Sunamgonj · Test | 2025 | 7 | 61 | 5 / 5 | Answer authoring / content review |
| 37 | 001 | Dhaka Board | 2023 | 1 | 19 | 10 / 5 | Adaptation required |
| 38 | 003 | Jashore Board | 2023 | 1 | 23 | 10 / 5 | Adaptation required |
| 39 | 004 | Cumilla Board | 2023 | 1 | 25 | 10 / 5 | Adaptation required |
| 40 | 005 | Chattogram Board | 2023 | 1 | 27 | 10 / 5 | Adaptation required |
| 41 | 006 | Sylhet Board | 2023 | 1 | 29 | 10 / 5 | Adaptation required |
| 42 | 007 | Barishal Board | 2023 | 1 | 31 | 10 / 5 | Adaptation required |
| 43 | 008 | Dinajpur Board | 2023 | 1 | 33 | 10 / 5 | Adaptation required |
| 44 | 010 | Dhaka Board | 2022 | 1 | 37 | 10 / 5 | Adaptation required |
| 45 | 011 | Rajshahi Board | 2022 | 1 | 38 | 10 / 5 | Adaptation required |
| 46 | 012 | Jashore Board | 2022 | 1 | 39 | 10 / 5 | Adaptation required |
| 47 | 013 | Cumilla Board | 2022 | 1 | 40 | 10 / 5 | Adaptation required |
| 48 | 014 | Chattogram Board | 2022 | 1 | 41 | 10 / 5 | Adaptation required |
| 49 | 015 | Sylhet Board | 2022 | 1 | 42 | 10 / 5 | Adaptation required |
| 50 | 016 | Barishal Board | 2022 | 1 | 43 | 10 / 5 | Adaptation required |
| 51 | 017 | Dinajpur Board | 2022 | 1 | 44 | 10 / 5 | Adaptation required |

### Flags across all extracted candidates

- `SOURCE_COUNT_DIFFERS_FROM_CURRENT_BLUEPRINT`: 19.
- `MIXED_PREPOSITIONS_AND_ARTICLES_NOT_STANDALONE`: 19.
- `EXACT_REPRINT`: 3.
- Queue hold `POSSIBLE_NEAR_REPRINT`: 4.
