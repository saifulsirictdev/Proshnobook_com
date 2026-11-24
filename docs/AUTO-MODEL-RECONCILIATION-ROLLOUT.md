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

## Biology remains unfinished

Recovered chapter 1–12 canonical stock is **3,840/4,480**; **640 questions in chapters 13–14 remain unauthored**. Owner publication authorization is now explicitly recorded, but authorization is not a successful publication receipt. Biology is not registered, imported or approved by this Auto Model rollout. No independent teacher certification or complete semantic duplicate review is claimed.

Deployment receipt/status is a separate artifact. This source document does not claim deployment success or live paid-AI/browser testing.

## Verified production outcome

Production deployment `dpl_661LwZcx53L4BgYjXhreFLpFn5Ea`, source `4f0f9dd7f6943d4d87c4d6b8df0ef72f10f15d71`, is **READY / PROMOTED**, with `proshnobook.com` independently confirmed in its assigned aliases. The production build completed with actual Prisma client/engine generation, webpack, TypeScript and 41 prerendered pages. Its explicitly requested read-only probe scanned **6,400 approved Physics rows and 8,113 approved Chemistry rows** and verified **20 complete models** with zero AI shortfall, consistent readiness/planning, preserved history privacy, editor validation and no dropped print questions. It made no question/approval/database mutation or provider request.

A further broad application/runtime regression selection passed **954/954**, and the focused access/paid-builder/save/visibility run passed **41/41**. These overlap the focused 461 run; counts are not added into a fictitious unique total. Content-heavy SSC/class chapter suites and prepared-library are excluded from the 954 selection; this is not a full-suite claim.

Postdeployment public reads: `/api/health` returned `status: ok, check: liveness`; `/question-builder` showed the public login/start landing; an unauthenticated registered Math Auto Model URL correctly returned the login page. No authenticated teacher browser session or real paid AI request was exercised. See `auto-model-all-subjects/production-upgrade-deployment.json` and `production-upgrade-readonly-smoke.json` for scoped receipts.

**Biology is still 3,840/4,480, with 640 questions unauthored and no Biology import/approval/publication. The entire owner task is NOT completed.**
