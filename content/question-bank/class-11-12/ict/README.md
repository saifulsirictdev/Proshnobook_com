# HSC ICT — external AI Draft integration

Six Drive question files preserved byte-for-byte in `chapter-N/source-questions.json`.
The existing server registry imports only adapted `questions.json`, never the raw files.
Run `python3 scripts/question-bank/prepare-hsc-ict.py` to regenerate questions/validation.
The script verifies raw SHA-256 against the upstream validation files read from Drive.
Each local validation records the source question, review and validation Drive IDs.
All six upstream reviews and validations were read; their quality/full-read/duplicate claims
are external self-reports, not independently established facts.

| Chapter | MCQ | complete CQ | SQ | Quarantined |
|---|---:|---:|---:|---:|
| 1 | 99 | 40 | 45 | 1 |
| 2 | 100 | 40 | 45 | 0 |
| 3 | 97 | 40 | 16 | 32 |
| 4 | 100 | 40 | 45 | 0 |
| 5 | 99 | 40 | 45 | 1 |
| 6 | 100 | 40 | 45 | 0 |
| Total | 595 | 240 | 241 | 34 |

**1,076 savable Draft questions, NOT 1,110 validated questions.** No quota padding.
Chapters 1, 3 and 5 no longer meet all requested minimum counts.
Upstream question-bank full subject completeness claims are not repeated in the UI.

## Adaptation and quarantine
- Category → existing `Class 11-12`, subject unchanged, each topic mapped to its existing
  catalog equivalent. No new categories/subjects/chapters. `bn` → `Bangla`.
- Lowercase `easy` / `medium` in chapter 6 converted to enum uppercase; no answer rewrite.
- Chapter 1 item 1 has two names for Marshall McLuhan as A/C. Quarantined.
- Chapter 3: duplicate normalized stems (29 SQ), plus 3 MCQ with colliding normalized
  options (including lowercase/uppercase hexadecimal symbols). Quarantined.
- Chapter 5 item 84 is a case-sensitive Python upper() question; options collide under the
  website's case-insensitive validator. It is NOT declared academically wrong. Quarantined
  for compatibility, rather than weakening the global validator or changing the answer.
- Per-item source indexes/reasons are in local validation; originals remain in source files.
- No full book reread or independent semantic audit in this integration. Source page strings
  are carried through in provenance. Preserve upstream chapter-5 NCTB-only exception.

## Review before approval
1. Ch1: outdated marketplaces, chronology, cryosurgery temperature claims; not medical advice.
2. Ch2: Bluetooth range is device/class-dependent; bandwidth unit assumptions, mesh math.
3. Ch3: independent arithmetic check, Boolean logic and full CQ solution depth. The source's
   zero-duplicate assertion conflicts with local results and is not trusted.
4. Ch4: distinguish legacy HTML from modern HTML5; actual HTML is question text, not executed.
5. Ch5: independently verify Python outputs, indentation, code whitespace and missing diagrams.
6. Ch6: verify SQL dialect and table sufficiency, ER attribution (Peter Chen vs Codd relational
   model), cryptographic history vs current recommendations (DES is obsolete/insecure).
7. All: syllabus alignment, licensing/provenance, conceptual duplicates, ambiguous choices,
   CQ stimulus relevance and 3/4-mark depth. No teacher approval is implied by schema passing.

## Website workflow and status
Registered six chapter batches support existing all-chapter Preview → consent → Pending save.
Existing authenticated ADMIN action/digest/audit/dedup paths unchanged; approved=false.
This repository integration is not a production import, deployment or publication.
