# English: both papers across Class 6/7/8, SSC and HSC

## Scope and limits

The owner extended the completed Class 8 Second Paper work to both papers for all visible categories. This branch fills the missing complete practice models. These are **practice blueprints**, not certification of an official examination circular, school authorship or independently teacher-certified keys.

The earlier Class 8 release is immutable and verification-only here. Its 440 structured rows and historical release script must not be replayed. No denied Drive source is retried.

## Current release / follow-up status

The bounded rollout below **has shipped**: PR #12 merged as `dc3e497cfb81028adfc271b4ad3fad6a35b9eeaa`; the successful receipt verified 1,144 targets (287 inserted/approved, 857 preserved), with 440 historical Class 8 items read-only. Ordinary production deployment followed without a permanent approval build hook. [Final release receipt](https://github.com/saifulsirictdev/Proshnobook_com/pull/12#issuecomment-7061732664).

The table below describes that frozen historical registry, not all subsequent prepared material. [Junior Paper 2 expansion batch 01](junior-paper2-expansion-01.md) adds four original models per grade to a separate ADMIN import catalog. It does not enlarge/replay the historical release or automatically approve new content. The all-grade distinct-quantity target and independent teacher verification remain unfinished.

## Prepared inventory

| Category / exact grade | Paper 1 atomic groups | Paper 2 atomic groups | Complete local assembly |
|---|---:|---:|---|
| Class 6 | 79 existing | 8 new | Both |
| Class 7 | 9 new | 8 new | Both |
| Class 8 | 9 new | 440 previously released | Both |
| SSC / 10 | 365 existing | 612 existing | Both |
| HSC / 11 | 11 new | 16 new | Both |
| HSC / 12 | 11 shared HSC content | 16 shared HSC content | Both |

Counts describe registry groups, not complete distinct papers or production DB counts. One junior First Paper has 13 tasks grouped into 9 source-atomic units; HSC First Paper has 12 tasks in 11 units. Grade 11/12 identities share one HSC syllabus model, not two different authored papers. SSC remains the visible category backed by canonical First Paper grade 10; no grade-9 First Paper content is invented.

New authored content is **one model per new category/paper**, not 50 distinct sets per question item. Increasing genuinely distinct, reviewed stock remains additional editorial work; rotations and grade aliases never count as distinct authored papers.

### New data

- `class6-paper2-authored-model.json`, `class7-paper2-authored-model.json`: eight tasks each, 50 marks (30 grammar + 20 writing). Grade 6 parts of speech differs from Grade 7 narration; writing lengths differ.
- `hsc-paper2-authored-model.json`: 16 tasks, 100 marks (60 grammar + 40 writing), including continuous narration, reference and punctuation passages with full rewritten suggested keys.
- `class7-first-reference-model.json`: Rokeya, climate conservation, original fictional seed-library unseen, matching/rearranging, eight questions on “Whose Child is This?”, story/paragraph/dialogue.
- `class8-first-reference-model.json`: Nakshi Kantha, Folk Song, original fictional reading-corner unseen, matching/rearranging, eight questions on the supplied Hason Raja/quilt excerpts, story/paragraph/dialogue.
- `hsc-first-reference-model.json`: Jerry MCQ/comprehension, **separate Education flowchart and Dreams summary**, cloze/rearranging and five writing tasks. MCQ heading/count and overlapping distractors in the guide were repaired explicitly, not imported blindly.

Each adapter validates complete drafts before splitting atomic groups and attaches review provenance. New authored tasks claim no original board/school/year. Keys are assistant-authored suggestions, not independent teacher certification.

## Source verification

- Class 7 permitted textbook `1L1W-XCn_grZior6yOaoSkJ9eWviNIYP7`: used Rokeya printed p.49 / PDF54, climate printed p.105 / PDF110, poem printed pp.34–35 / PDF39–40. The used passages/poem were compared with rendered page images; SHA256, locations and normalization notes are in the JSON. Remaining OCR does not imply verified transcription.
- Class 8 permitted textbook `1UQ09BSs--YQ-6ZwVANXuqgujrPn4WWNB`: Nakshi Kantha printed p.5 / PDF10; Folk Song printed pp.2–3 / PDF7–8; Hason Raja and Jasimuddin/E. M. Milford extracts on PDF8/10. Used source images were inspected. This deliberately differs from the guide's Cuisine exercise and uses available textbook excerpts; it is not an exact copy of the guide model.
- Access-denied Class 7 Seen guide `1CnWGL8_8bWQQJ0XQIVXkXckV8uT8AkC-`: **not retried/read/exported/bypassed**. Independent permitted textbook was used instead.
- HSC First Paper guide `1x6-0k6gzK4asMB6PVip0V38h-DjJUlni`, printed pp.3–5 / Model 01: partial extraction inspected for three-source reading contract; school and exam-year attribution is not inherited.
- HSC Second Paper `1lS9dV7MMBsSshk-aoR_hIMEBjH3F8RVH`, printed pp.121–123: format inspection only; new questions are original.
- Class 6 guide `1TA1MMzoS_gUsAqLGX42UOsLMkR4Ey3-1`: extraction did not reach Second Paper. New grammar follows the existing supplied blueprint, not a claimed transcription of unread pages.

## Compatibility and rendering

- New HSC First Paper uses opt-in `hsc-first-reference-v1`; legacy shared-source saved drafts stay valid. Assemblies cannot mix the two source contracts. Style propagates through validation, atomic grouping, assembly, editor and print adapter.
- New continuous HSC grammar forms are narrowly validated; other grades/count contracts remain unchanged. Structural validation does not certify linguistic correctness.
- Shared information/matching/substitution tables print once rather than duplicating prompt subitems. Their suggested keys remain in answer mode. Cloze passages and clue boxes stay together; duplicate detached gap labels are suppressed.
- Auto Model preserves the assembled practice header instead of erasing it. New unsaved English models show marks by default; explicit saved display/Page Setup preferences remain authoritative.
- The generic flow renderer preserves source characters across pages. Line wrapping and pagination are not a claim of exact source-PDF typography.

## Frozen, bounded release

`node scripts/english/release-expanded-models.cjs manifest` is DB-free.

- Digest: `132791f370a3f0177aeb18efe89a25d085f567c178e6ec5e9de3af8eefecfeec`
- **1,144 exact target keys** across 11 grade/paper scopes; previously released Class 8 Paper 2 is excluded from writes and separately checked (440 keys).
- Modes: `preview`, `approve`, `verify`; approval additionally requires matching `EXPANDED_ENGLISH_DIGEST` and `EXPANDED_ENGLISH_ACK=APPROVE_REVIEWED_EXPANDED_ENGLISH_MODELS_V1`.
- Preview performs no writes. Approval is one serializable transaction: missing targets are created Pending, exact Pending values are compare-and-swap approved, existing matching approvals are preserved. Rejected, reopened, changed records, revoked historical Class 8 rows, content drift and concurrent conflicts stop the transaction. Unrelated records are never updated.
- The immutable audit receipt makes successful retries no-ops. Subsequent rejection cannot be silently revived by replaying the release.
- Verifier reads actual structured DB rows and makes 40 provider-free assemblies per exact scope (480 **rotations**, not distinct authored papers). It checks completeness and 50/100-mark totals.

This script is **not** a permanent build hook. Production engine generation must be ordinary `npm run build`; the sandbox's engine-less Prisma client is for mocked checks only and cannot approve or verify a real database.

## Validation record / release status

- Full regression: **1,077 passed**, zero failed. Includes source-isolated subsets, legacy compatibility, display preferences and transactional release safety.
- Final typecheck passed after new model/admin review integration.
- Production dependency audit: **0 vulnerabilities** (dev-inclusive installation previously reported one moderate advisory).
- Real Chromium preview: all 12 exact scopes at desktop 1100px and mobile 390px produced nonempty PDFs with source/task/table retention, visible marks, no whole-answer leaks and no page-bottom question overflow. Twelve landscape models also passed padded booklet-imposition/PDF-page-count checks. The final run used the actual Tinos/Adorsho document fonts. Independent PyMuPDF extraction verified printed task-opening and source beginning/end phrases in all **36 PDFs**, not merely screen DOM or blank-PDF metadata.
- Local webpack production build passed. Builds in the sandbox use the explicitly engine-less generated Prisma client only; deployment must generate real engines.
- **Historical pre-release validation:** these local checks preceded the successful PR #12 rollout described above. Authenticated production-user UI and physical duplex folding are not certified by the local renderer harness.

Do not describe the entire larger editorial request as completed while genuinely distinct quantity, independent teacher review, or physical printing remain unverified.

### Post-merge rollout gate: isolated header defaults

PR #11 passed PR and main CI and was merged. Its first production attempt stopped **during read-only preview, before the approval function was called**; the deployment was not promoted. Read-only diagnostics reported an existing-content mismatch. Investigation reproduced Zod's shallow default entries: changing one prepared model's header mutated the default field entries later used by other grades. The exact-content gate correctly refused to overwrite historical stock.

`paperHeaderSchema` now creates deep-isolated default entries. The expanded manifest is re-frozen to the digest above; the historical Class 8 digest remains unchanged. No existing DB row is rewritten to make the check pass. `diagnose` reports only scope counts and mismatching field names, never question text, names or secrets. That corrective gate was subsequently completed in PR #12: CI, read-only production diagnostics, exact-content preview, bounded approval and ordinary deployment all succeeded (see final receipt above). The earlier 1,077-test and 36-PDF results were PR #11 evidence; they are retained here as history, not as a substitute for the later corrective checks.
