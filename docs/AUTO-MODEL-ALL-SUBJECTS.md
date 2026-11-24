# Syllabus-scoped Auto Model — academic subjects

## Current behavior

This update supersedes the earlier Math-only scope and the first-paper-English database-only restriction in historical documents. It applies to academic subjects present in the existing class/subject/topic catalog. Admission/Job and ordinary Chapter preparation retain their separate workflows.

1. Choose class, subject, MCQ or written, then explicitly select syllabus categories/topics. The setup initially selects nothing.
2. Registered Math/Physics practice policies retain their mandatory divisions, chapter quotas, marking and diagram restrictions. These policies are not treated as universal formats.
3. For other subjects, a teacher must supply syllabus reference/instructions, full marks, duration, offered questions, number to answer and marks per question. Missing marking schemes are never invented by AI. Named written sections can have different marks and their own selected topic scopes (for example paragraph versus essay). CQ uses an explicit three/four-part marking scheme; all CQ sections must match it.
4. Read approved public questions plus only the current teacher's private pending drafts, filtered to class aliases, exact subject and selected topics. Structurally invalid, duplicate, incomplete and unsupported-dependent rows do not count as usable stock. Return a complete model without AI/configuration/quota writes when stock suffices.
5. If stock is short, keep compatible stock and request only missing slots, in same-topic/kind/section batches of at most six. Class/subject/topic/marks are server-assigned, not accepted from provider output. Save only validated questions as `approved:false` with the current owner's `AI_PENDING` source. Nothing is automatically approved/published.
6. Retry from saved private checkpoints. A model is opened only after a new full feasibility check; database/provider/storage failures do not navigate with a partial model. Settings, syllabus selection and per-question written-section assignments survive save/restore and determine print marks/instructions.
7. Existing paid-builder gate, explicit checkout and question-access routes are unchanged. Non-English preparation shares the Chapter preparation 60-batch/account/day quota. English retains its existing generation quota. Generated answers still require teacher/content review.

## English

Both papers first attempt the existing approved, exact-grade bank assembly. Only an explicit `MISSING_APPROVED_ITEMS` result permits the source-aware gap pipeline; authentication, database and save failures do not trigger AI. Selected item IDs are validated/preserved. Available bank groups carry their exact source/writing/model-style signatures into the gap pipeline, preventing default writing topics or random textbook extracts from causing unnecessary regeneration. Source-sharing groups remain indivisible. Missing reliable seen passage/poem/story extracts require input; the provider may not invent textbook sources. Private model review precedes layout.

## Safety and limits

- At most 100 offered questions, 20 sections, 200 selected topics, 500 marks and 360 minutes per supplied model.
- Account lease, quota reservation before provider call, 90-second provider timeout and six-question batches.
- A scan exceeding 10,000 rows fails closed and requests narrower topics; it does not assume a shortage and charge AI.
- Duplicate screening is normalized lexical/structural screening, not independent semantic uniqueness or subject-content certification.
- New generated figures, arbitrary URLs, HTML and fabricated board attribution are rejected. Registered stock may retain its existing allowlisted figures.
- No database migration, import, approval, production mutation, live paid AI call or deployment was performed for this implementation.

## Verification

- **400/400 tests pass**, across targeted regression files covering syllabus planning, actual setup checkbox interaction, gap-only provider/server behavior, registered subject quotas, English bank/gap signatures and selected IDs, saved settings/printing, geometry/math, purchased editor/access, wallet and marketplace regressions. Raw TAP: `auto-model-all-subjects/verification.tap`.
- Full repository `npm run typecheck` passes with the real installed dependencies and generated Prisma schema types; no external stubs were used for this final check. Raw output: `auto-model-all-subjects/typecheck.txt`.
- `git diff --check` passes.
- `npm ci --ignore-scripts` installed the lockfile dependencies without editing package manifests. Standard Prisma engine download was blocked by the sandbox's network restriction. Schema client types were generated with `prisma generate --no-engine` using local placeholder engine paths; this supports full typechecking but does **not** verify database-engine connectivity or a production build. A normal engine-capable environment must generate the runtime client when deploying.
- No live authenticated browser/production database end-to-end verification is claimed.

## Backups and preservation

Pre-change task backup was independently verified in Drive: `1bSzW8fANXbH9unKmzk5mEAhARNygqtfj`, 70,472 bytes, MD5 `a7b7f36954f949b5cfa51e35e575aeac`.

Final snapshot/remote verification are recorded in `auto-model-all-subjects/drive-backup-receipt.json`. The snapshot includes the current repository working files and required pre-existing support/content, excluding Git internals, secrets, installed dependencies, caches, downloaded connector scratch files and redundant ZIP backups. Existing unrelated Chemistry/Physics/Biology content is preserved, not republished. The implementation remains in the session working branch; no broad staging, merge or deployment was performed.
