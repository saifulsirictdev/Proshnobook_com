# SSC English Paper 2 — Items 4 & 5: paired authoring started

> **Historical extraction-stage snapshot. Superseded on 2026-11-20:** Items 4–7 now each have 51 authored, integrated PREPARED_NOT_IMPORTED review sets. See [completion report](ssc-paper2-items-4-7-completion.md). Candidate JSON below remains an unchanged source audit, not an import registry.
**Status: source extraction / provisional selection only — NOT PREPARED, NOT IMPORTABLE.**

The request now permits two items together. Work has started on **Item 4: Changing sentences** and **Item 5: Tag questions**, targeting at least 51 distinct complete sets each. This does not start Items 6–12.

## What exists now

| Item | Source exercises extracted | Exact-distinct transcripts¹ | Provisional authoring queue | Current target per set |
| --- | ---: | ---: | ---: | --- |
| 4 — Changing sentences | 102 | 99 | 51 | 10 subquestions / 10 marks |
| 5 — Tag questions | 102 | 96 | 51 | 5 subquestions / 5 marks |

¹ Exact-distinct means different normalized text hashes, **not yet editorially verified semantic uniqueness**. Whole-set three-word overlap screening additionally holds likely near-reprints. Small changes of names, punctuation, directions or wording must not inflate the final distinct-set count.

- **204 source exercises** staged across both items, each with original question number, original marks, exam year/type, board or school, physical PDF page, source file/hash, raw extraction, normalized subquestions and content hashes.
- Each 51-slot queue contains **30 board + 15 Test 2025 school + 6 Test/Pre-Test 2024 school** exercises.
- Both queues are provisional. They are **not** 102 finished new sets and do not increase the current prepared library beyond the existing 153 sets for Items 1–3.
- No answer key has been authored for these two items in this stage; all candidates carry `answerStatus: NOT_AUTHORED`.

## Source / syllabus audit findings

- All 102 examination headers (45 board, 41 Test 2025 school, 16 Test/Pre-Test 2024 school) yielded a transformation and a tag exercise.
- **2022 board transformation:** nine originals have only five subquestions / five marks (Q3). They are preserved and held, not doubled or padded to ten.
- **2023 board tags:** nine originals have seven subquestions / seven marks (Q8). They are preserved and held, not truncated to five. This is a legitimate source-format difference, not malformed source labelling.
- **Rajshahi Board 2023 transformation, (g):** a transformation direction is absent in the extracted source. It is flagged for manual source inspection and excluded from the provisional queue; no direction has been invented.
- **Our Lady of Fatema Girls High School 2025 transformation:** the heading says “Complete the sentence according to directions”, not “Change the sentences”. Instruction-aware extraction includes it without assuming all Q4s are transformations.
- **Pabna Cadet College 2024 transformation:** printed as Q5 rather than the usual Q6; the original numbering is retained.
- **Hasan Ali Govt. High School 2025 tags:** printed as Q6 rather than the usual Q5; retained as printed.
- Test 2025 remains **examYear 2025** even though the filename mentions Exam2026. School names are transcribed from each header, not inferred from filename or neighbouring pages.
- Candidate texts can contain typos, ambiguous transformation directions, rhetorical questions, unusual agreement, quoted speakers, imperatives or incomplete wishes. Structural validity is not grammatical or pedagogical approval.

## Remaining work — not completed in this stage

- [ ] Review semantic duplication and replace unsuitable provisional slots until each item has at least 51 genuinely distinct usable sets.
- [ ] Changing sentences: author all 510 possible transformed sentences; verify requested form, tense, voice, agreement, degree and preserved meaning. Disclose any source repair before/after.
- [ ] Tag questions: author all 255 possible tags; verify clause scope, subject/pronoun, polarity, tense/modal, negative adverbials, imperatives, wishes and acceptable variants. Replace unusable prompts instead of forcing an answer.
- [ ] Produce final review JSON + readable review document with original/adapted versions and answer keys.
- [ ] Only after authoring, add validated drafts and durable review metadata to the prepared registry for Classes 9–10.
- [ ] Add per-item ADMIN preview/digest/consent → Pending import integration and tests; separately retain teacher approval.
- [ ] Verify approved-only reuse, grade/paper isolation, printing, typecheck, complete test suite and webpack build.

## Safety

These files live under `docs/english/work-in-progress/`, outside the importable `lib/english/data/` registry. No runtime code imports them. No production DB import, approval, merge or deployment was performed. The existing header, print and Landscape folded-booklet code is unchanged.

## Validation performed at this stage

- Six new candidate-audit tests pass: source metadata/hash consistency, raw transcript retention, exact-duplicate links, 51-slot queue composition, intact five-/seven-question source formats and runtime non-registration.
- Existing Item 1–3 focused regressions plus candidate tests: **34/34 tests passed** on the final focused run.
- All three original PDF SHA-256 values verified before extraction. The extraction/selection command is deterministic.
- No application build was run for this documentation/tooling-only stage; prior production-build success does not validate unfinished Item 4/5 content.

## Reproduce extraction

Keep source PDFs outside Git and supply their directory. The script verifies filenames/hashes before processing; it fails rather than padding an insufficient queue.

```sh
python -m venv /tmp/ssc-pdf-venv
/tmp/ssc-pdf-venv/bin/pip install pymupdf==2.1
/tmp/ssc-pdf-venv/bin/python scripts/english/extract-ssc-sentence-candidates.py /path/to/source-pdfs
node --test tests/english-ssc-sentence-candidates.test.cjs
```

## Sources

- [SSC English 2nd Paper_2018_2024.pdf](https://drive.google.com/file/d/1ku0ftd_VEEAD2DkQVRQ-5qlxrKTGpJyU/view)
  - SHA-256: `d1fb691fca0f410d6c46e95ad9c0b3f1b02d8da9f164c3f28d722a0c4463c664`
- [SSC_English_Test_Papers_English_2nd_papper_2025_(Exam2026).pdf](https://drive.google.com/file/d/1esU8C-hZwrqxxmTgWMKCzca17W9z_2N8/view)
  - SHA-256: `de7df74f2654e7478ab2902571d21274d8bd4bd141a71c0e58a8ca6c3fe5b8e5`
- [SSC English 2nd Paper Reputed School Question .pdf](https://drive.google.com/file/d/1buc7ygEGoIefpPZwCoNl1ES9Umn220Cd/view)
  - SHA-256: `c654f3b803cc0e9c167873ceee8513feb2e3e21af2ff9de390a1b6f477f7e2bb`

## Item 4 — Changing sentences — provisional authoring queue

These rows identify work slots, not approved/prepared exercises. Candidate JSON contains the full original subquestions.

| Slot | Candidate suffix | Source as printed | Year | Original Q | PDF page |
| ---: | ---: | --- | ---: | ---: | ---: |
| 1 | 001 | Dhaka Board | 2024 | 6 | 1 |
| 2 | 002 | Rajshahi Board | 2024 | 6 | 3 |
| 3 | 003 | Jashore Board | 2024 | 6 | 5 |
| 4 | 004 | Cumilla Board | 2024 | 6 | 7 |
| 5 | 005 | Chattogram Board | 2024 | 6 | 9 |
| 6 | 006 | Sylhet Board | 2024 | 6 | 11 |
| 7 | 007 | Barishal Board | 2024 | 6 | 13 |
| 8 | 008 | Dinajpur Board | 2024 | 6 | 15 |
| 9 | 009 | Mymensingh Board | 2024 | 6 | 17 |
| 10 | 010 | Dhaka Board | 2023 | 5 | 19 |
| 11 | 012 | Jashore Board | 2023 | 5 | 23 |
| 12 | 013 | Cumilla Board | 2023 | 5 | 25 |
| 13 | 014 | Chattogram Board | 2023 | 5 | 27 |
| 14 | 015 | Sylhet Board | 2023 | 5 | 29 |
| 15 | 016 | Barishal Board | 2023 | 5 | 31 |
| 16 | 017 | Dinajpur Board | 2023 | 5 | 33 |
| 17 | 018 | Mymensingh Board | 2023 | 5 | 35 |
| 18 | 028 | Dhaka Board | 2020 | 6 | 46 |
| 19 | 029 | Rajshahi Board | 2020 | 6 | 48 |
| 20 | 030 | Jashore Board | 2020 | 6 | 50 |
| 21 | 031 | Cumilla Board | 2020 | 6 | 52 |
| 22 | 032 | Chattogram Board | 2020 | 6 | 54 |
| 23 | 033 | Sylhet Board | 2020 | 6 | 56 |
| 24 | 034 | Barishal Board | 2020 | 6 | 58 |
| 25 | 035 | Dinajpur Board | 2020 | 6 | 60 |
| 26 | 036 | Mymensingh Board | 2020 | 6 | 62 |
| 27 | 037 | Dhaka Board | 2019 | 6 | 64 |
| 28 | 038 | Rajshahi Board | 2019 | 6 | 66 |
| 29 | 039 | Jashore Board | 2019 | 6 | 68 |
| 30 | 040 | Cumilla Board | 2019 | 6 | 70 |
| 31 | 046 | Govt. Mohammadpur Model School & College, Dhaka · Test | 2025 | 4 | 1 |
| 32 | 047 | Tejgaon Government High School, Dhaka · Test | 2025 | 4 | 3 |
| 33 | 048 | Sher-E-Bangla Nagar Govt. Girls' High School‚ Dhaka · Test | 2025 | 4 | 4 |
| 34 | 050 | Haji M.A. Gafur Govt. Secondary School, Dhaka · Test | 2025 | 4 | 7 |
| 35 | 052 | Rani Bilashmoni Govt. Boys' High School, Gazipur · Test | 2025 | 4 | 10 |
| 36 | 053 | Kishoreganj Govt. Boy's High School, Kishoreganj · Test | 2025 | 4 | 12 |
| 37 | 054 | Madhupur Shahid Smrity Higher Secondary School, Tangail · Test | 2025 | 4 | 13 |
| 38 | 055 | Binapani Govt. Girls' High School, Gopalganj · Test | 2025 | 4 | 15 |
| 39 | 056 | Rajbari Govt. High School, Rajbari · Test | 2025 | 4 | 16 |
| 40 | 057 | Agricultural University High School, Mymensingh · Test | 2025 | 4 | 18 |
| 41 | 059 | Sherpur Govt. Victoria Academy, Sherpur · Test | 2025 | 4 | 21 |
| 42 | 060 | Bonowary Lal Govt. High School, Sirajganj · Test | 2025 | 4 | 22 |
| 43 | 061 | Saleha Ishaque Govt. Girls' High School, Sirajganj · Test | 2025 | 4 | 24 |
| 44 | 062 | Govt. Promothnath (P.N.) Girl's High School, Rajshahi · Test | 2025 | 4 | 25 |
| 45 | 063 | Bogura Cantonment Public School & College, Bogura · Test | 2025 | 4 | 27 |
| 46 | 088 | JOYPURHAT GIRLS’ CADET COLLEGE, JOYPURHAT · Pre-Test | 2024 | 6 | 3 |
| 47 | 089 | PABNA CADET COLLEGE, PABNA · Pre-Test | 2024 | 5 | 5 |
| 48 | 090 | CUMILLA CADET COLLEGE, CUMILLA · Pre-Test | 2024 | 6 | 8 |
| 49 | 092 | SYLHET CADET COLLEGE, SYLHET · Pre-Test | 2024 | 6 | 11 |
| 50 | 093 | IDEAL SCHOOL & COLLEGE, MOTIJHEEL, DHAKA · Pre-Test | 2024 | 6 | 14 |
| 51 | 095 | BAF SHAHEEN COLLEGE, DHAKA · Test | 2024 | 6 | 18 |

### Holds / extraction flags

- `TRANSFORMATION_DIRECTION_REQUIRES_MANUAL_REVIEW`: 1 source exercises.
- `SOURCE_COUNT_DIFFERS_FROM_CURRENT_BLUEPRINT`: 9 source exercises.
- `EXACT_REPRINT`: 3 source exercises.
- Whole-set trigram near-reprint holds: 10. This is a screening aid, not final editorial judgement.

## Item 5 — Tag questions — provisional authoring queue

These rows identify work slots, not approved/prepared exercises. Candidate JSON contains the full original subquestions.

| Slot | Candidate suffix | Source as printed | Year | Original Q | PDF page |
| ---: | ---: | --- | ---: | ---: | ---: |
| 1 | 001 | Dhaka Board | 2024 | 9 | 2 |
| 2 | 002 | Rajshahi Board | 2024 | 9 | 4 |
| 3 | 003 | Jashore Board | 2024 | 9 | 6 |
| 4 | 004 | Cumilla Board | 2024 | 9 | 8 |
| 5 | 005 | Chattogram Board | 2024 | 9 | 10 |
| 6 | 006 | Sylhet Board | 2024 | 9 | 12 |
| 7 | 007 | Barishal Board | 2024 | 9 | 14 |
| 8 | 008 | Dinajpur Board | 2024 | 9 | 16 |
| 9 | 009 | Mymensingh Board | 2024 | 9 | 18 |
| 10 | 019 | Dhaka Board | 2022 | 5 | 37 |
| 11 | 020 | Rajshahi Board | 2022 | 5 | 38 |
| 12 | 021 | Jashore Board | 2022 | 5 | 39 |
| 13 | 022 | Cumilla Board | 2022 | 5 | 40 |
| 14 | 023 | Chattogram Board | 2022 | 5 | 41 |
| 15 | 024 | Sylhet Board | 2022 | 5 | 42 |
| 16 | 025 | Barishal Board | 2022 | 5 | 43 |
| 17 | 027 | Mymensingh Board | 2022 | 5 | 45 |
| 18 | 028 | Dhaka Board | 2020 | 9 | 47 |
| 19 | 029 | Rajshahi Board | 2020 | 9 | 49 |
| 20 | 030 | Jashore Board | 2020 | 9 | 51 |
| 21 | 031 | Cumilla Board | 2020 | 9 | 53 |
| 22 | 032 | Chattogram Board | 2020 | 9 | 55 |
| 23 | 034 | Barishal Board | 2020 | 9 | 59 |
| 24 | 036 | Mymensingh Board | 2020 | 9 | 63 |
| 25 | 037 | Dhaka Board | 2019 | 9 | 65 |
| 26 | 038 | Rajshahi Board | 2019 | 9 | 67 |
| 27 | 039 | Jashore Board | 2019 | 9 | 69 |
| 28 | 040 | Cumilla Board | 2019 | 9 | 71 |
| 29 | 041 | Chattogram Board | 2019 | 9 | 73 |
| 30 | 042 | Sylhet Board | 2019 | 9 | 75 |
| 31 | 046 | Govt. Mohammadpur Model School & College, Dhaka · Test | 2025 | 5 | 1 |
| 32 | 047 | Tejgaon Government High School, Dhaka · Test | 2025 | 5 | 3 |
| 33 | 048 | Sher-E-Bangla Nagar Govt. Girls' High School‚ Dhaka · Test | 2025 | 5 | 4 |
| 34 | 049 | Khilgaon Govt. High School, Dhaka · Test | 2025 | 5 | 6 |
| 35 | 050 | Haji M.A. Gafur Govt. Secondary School, Dhaka · Test | 2025 | 5 | 7 |
| 36 | 051 | SOS Hermann Gmeiner College, Dhaka · Test | 2025 | 5 | 9 |
| 37 | 052 | Rani Bilashmoni Govt. Boys' High School, Gazipur · Test | 2025 | 5 | 10 |
| 38 | 053 | Kishoreganj Govt. Boy's High School, Kishoreganj · Test | 2025 | 5 | 12 |
| 39 | 054 | Madhupur Shahid Smrity Higher Secondary School, Tangail · Test | 2025 | 5 | 13 |
| 40 | 055 | Binapani Govt. Girls' High School, Gopalganj · Test | 2025 | 5 | 15 |
| 41 | 058 | Unique Progressive School, Mymensingh · Test | 2025 | 5 | 19 |
| 42 | 060 | Bonowary Lal Govt. High School, Sirajganj · Test | 2025 | 5 | 22 |
| 43 | 061 | Saleha Ishaque Govt. Girls' High School, Sirajganj · Test | 2025 | 5 | 24 |
| 44 | 062 | Govt. Promothnath (P.N.) Girl's High School, Rajshahi · Test | 2025 | 5 | 25 |
| 45 | 063 | Bogura Cantonment Public School & College, Bogura · Test | 2025 | 5 | 27 |
| 46 | 087 | RANGPUR CADET COLLEGE, RANGPUR · Pre-Test | 2024 | 9 | 2 |
| 47 | 088 | JOYPURHAT GIRLS’ CADET COLLEGE, JOYPURHAT · Pre-Test | 2024 | 9 | 4 |
| 48 | 089 | PABNA CADET COLLEGE, PABNA · Pre-Test | 2024 | 9 | 6 |
| 49 | 090 | CUMILLA CADET COLLEGE, CUMILLA · Pre-Test | 2024 | 9 | 8 |
| 50 | 092 | SYLHET CADET COLLEGE, SYLHET · Pre-Test | 2024 | 9 | 12 |
| 51 | 093 | IDEAL SCHOOL & COLLEGE, MOTIJHEEL, DHAKA · Pre-Test | 2024 | 9 | 15 |

### Holds / extraction flags

- `SOURCE_COUNT_DIFFERS_FROM_CURRENT_BLUEPRINT`: 9 source exercises.
- `EXACT_REPRINT`: 6 source exercises.
- Whole-set trigram near-reprint holds: 11. This is a screening aid, not final editorial judgement.
