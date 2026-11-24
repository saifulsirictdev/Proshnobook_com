# Current verified result — Auto Model production rollout

**Published at https://proshnobook.com.** Production deployment `dpl_9GzGcK2q34Bh2BYJdedW3SbHroP1` is **READY / PROMOTED**, source `21ead3ab00106e0da9e7dba9b3e7bc5c94d15614`.

- Biology: **4,480** answered questions imported Pending then explicitly owner-approved; exact canonical readback verified. **14 chapters × (200 MCQ + 50 CQ + 70 SQ)**. CQ ক/খ/গ/ঘ marks **1/2/3/4**. **45 figures** verified from the live site by content type and SHA256.
- Complete-book database-only guard deployed for all subjects, including section-topic filtering bypass correction. Live Biology server-action harness: selected-stock shortage **51**, **AI shortage 0**, **quota writes 0**, **provider invocations 0**, no unrelated-topic substitution. Harness uses a synthetic teacher identity, **not an authenticated browser E2E test**.
- Physics **6,400** / Chemistry **8,113** approved live rows unchanged by before/after protected digests; **20** prior diagnostic models passed with AI0. Neither subject republished.
- **962/962 runtime regression tests**, **157/157 AutoModel/English focused tests**, **130/130 Biology focused tests**, TypeScript and production build **PASS**. These overlap; do not sum them. Not a claim that the entire repository suite passed: heavy prepared-library full/scoped runs exceeded the practical wait and were stopped without results.
- Owner approval is **not** independent teacher/content/semantic-duplicate or official textbook/syllabus certification; those flags remain false. Biology's official exam blueprint is not registered: ask the teacher for marks/time rather than inventing a scheme.
- [Publication receipt](question-bank/ssc-biology/production-release-receipt.json) records event IDs, release digest, live assets and readback evidence. Generated offline `progress.json` and chapter completion reviews describe source-draft validation, not live publication; the production receipt is the release-status overlay.
- Publication ran only through an explicitly acknowledged one-off production deployment override. Normal `npm run build` never imports or approves questions. Do not replay the publication command as a routine health check; use read-only verify mode.

All sections below are **historical snapshots**, including statements that import/deployment was pending. They do not override the verified result above. Full post-release source backup is recorded separately in `drive-backup-postrelease-receipt.json`; source/receipts are not a database dump.

---

# Auto Model reconciliation and rollout

## Current source integration

The checkout was on `20e3d6c` while this same branch already contained newer Chemistry/Physics production work at `df1065f2`. A verified Drive snapshot was created before reconciliation. The original working tree is also retained in a Git stash. The same branch was fast-forwarded, then only local-only Biology/Auto Model work was restored and shared modules reconciled. **2,878 remote Chemistry/Physics content, adapter and public-figure files remain byte-identical.** This corrects the earlier local-only preservation audit; that older audit did not establish alignment with remote production.

Retained: Chemistry's 12-chapter policy/IDs and chapter quotas, Physics's 14-chapter policy, `_authoring` compatibility, relative Chemistry image rendering, prior prepared registry and all subject content. Physics/Chemistry legacy calls without explicit topics keep the approved-only database contract. The new explicit-topic setup uses bank-first gap preparation; generated rows stay private and unapproved. No release/import code is a normal build hook.

## Verification

- Reconciled regression run across changed test files plus new model/Biology tests: **461 passed, 0 failed**. File list and TAP output are saved alongside this report.
- Additional focused model, real fixture, setup UI and rollout probe run: **73 passed**.
- Biology recovery regression plus Job/English harness tests: **111 passed** (105 Biology + 6 others).
- Full-repository TypeScript: **PASS** after reconciliation and compatibility typing.
- The attempted broad suite was stopped in repeated full-registry prepared-library work. Four earlier expectation/mock failures were repaired and successfully rerun. It is **not** reported as a full-suite pass.
- Local optimized webpack compilation completed, but Next's subsequent build/typechecking process was killed (exit 137) under the sandbox memory limit. **No successful local production build claimed.** The deploy platform build is the authoritative remaining gate.

`scripts/check-auto-model-upgrade.cjs` is an explicitly invoked, production-context-guarded **read-only** probe: approved Physics/Chemistry stock, 20 model assemblies, preflight/planner consistency, history stripping and editor/print preservation. It does not import, approve, generate, call a provider, expose question bodies, or test an authenticated browser session. Its synthetic regression fixtures do not imply live production success; actual deployment evidence must be recorded separately.

## Biology current source preparation

All14 chapters now have **4,480/4,480 answered author drafts** (200MCQ/50CQ/70SQ each), with45 relevant SVGs.130focused Biology tests and157AutoModel/English tests pass; TypeScript passes. Biology registration/assets/scoped release are prepared, but import/approval and latest source deployment remain unverified until separate production receipts. Independent teacher/content/semantic certification remains false; unknown official marking schemes still require teacher input.

Deployment receipt/status is a separate artifact. This source document does not claim deployment success or live paid-AI/browser testing.

## Verified production outcome

Production deployment `dpl_661LwZcx53L4BgYjXhreFLpFn5Ea`, source `4f0f9dd7f6943d4d87c4d6b8df0ef72f10f15d71`, is **READY / PROMOTED**, with `proshnobook.com` independently confirmed in its assigned aliases. The production build completed with actual Prisma client/engine generation, webpack, TypeScript and 41 prerendered pages. Its explicitly requested read-only probe scanned **6,400 approved Physics rows and 8,113 approved Chemistry rows** and verified **20 complete models** with zero AI shortfall, consistent readiness/planning, preserved history privacy, editor validation and no dropped print questions. It made no question/approval/database mutation or provider request.

A further broad application/runtime regression selection passed **954/954**, and the focused access/paid-builder/save/visibility run passed **41/41**. These overlap the focused 461 run; counts are not added into a fictitious unique total. Content-heavy SSC/class chapter suites and prepared-library are excluded from the 954 selection; this is not a full-suite claim.

Postdeployment public reads: `/api/health` returned `status: ok, check: liveness`; `/question-builder` showed the public login/start landing; an unauthenticated registered Math Auto Model URL correctly returned the login page. No authenticated teacher browser session or real paid AI request was exercised. See `auto-model-all-subjects/production-upgrade-deployment.json` and `production-upgrade-readonly-smoke.json` for scoped receipts.

**Current Biology source is4,160/4,480, with320 chapter14 questions unauthored and no Biology import/approval/publication. The entire owner task is NOT completed.**

## New owner correction — source implemented, NOT deployed

The book-wide rule is stronger than selection-local bank-first generation: if approved stock can assemble a complete model for the class/book/subject and requested marking scheme, selected-topic shortages must not invoke AI. This is implemented in `prepareAutoModel` and read-only preflight; the server checks the full catalog using the real structural/blueprint planner, not row counts. It checks before acquiring any paid quota and again after the account lease. DB/scan failures fail closed. No selection is silently broadened: an inadequate selection reports gaps and disables the preparation button.

English's item bank checks full-book feasibility without selection-local source/writing restrictions. The paid English generator independently rereads approved stock after its lease, covering direct calls and imports between auto entry and provider boundary. Class8 paper2 retains its existing reference-style contract. All tests use synthetic/mock providers, not live paid calls.

Latest focused checks:156 AutoModel/English tests and112 Biology tests pass; full-repository TypeScript passes. `jsdom` is now an explicit dev dependency for the existing browser tests instead of relying on a disposable cache installation. These are focused checks, not a full repository suite or new production build. Evidence: `auto-model-all-subjects/book-stock-rule-regressions.tap`, `book-stock-rule-validation.json`, Biology chapter13 completion review.

Production remains the prior verified deployment described above. This correction and chapter13 have **not** been deployed or imported. Chapter14 must still be authored, followed by scoped Biology release/asset integration, pending import, separately audited owner approval, deployment and production readback. No unrelated Physics/Chemistry content or production records were republished.
