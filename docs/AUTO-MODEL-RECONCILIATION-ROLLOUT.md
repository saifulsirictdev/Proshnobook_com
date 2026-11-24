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
