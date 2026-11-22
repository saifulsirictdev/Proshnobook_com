# Owner-authorized fifty-question supplement publication

Scope: only five `ssc-math-geometry-plain-ch{6,7,8,14,15}-v1` batches,
50 original MCQ. Never rerun the 5750-question release.

`node scripts/question-bank/release-ssc-geometry-plain.cjs preview` is read-only.
Preview digest: `edf0452c7c8345c055e2cc4115be9e0ef0a0b6dc3b96d821e62aca0b660f7b6d`.

Owner explicitly requested approval after the draft addition/deployment. The
separate CLI requires production context, exact digest, dedicated 50-question
acknowledgement and actor pinned to a 40-character commit SHA. It is not called
from normal builds/requests. Never retrieve or expose DB credentials.

Two serializable phases: idempotent Pending insert, then exact-content/source
recheck and scoped approval. Prepared IDs/receipts use existing app conventions.
Old/alias conflicts are not overwritten; fewer than all 50 verified rows blocks
approval. Before the approval transaction commits, the application-style bounded
approved-stock query must pass five seeded MCQ builds (division quotas + <=5
figure questions) and the unchanged written-model assembly. Failure rolls the
approval back, leaving imported rows Pending. Audits retain per-ID approval
history and state teacherCertified:false; owner approval is not teacher review.

Test: `node --test tests/ssc-geometry-plain-release.test.cjs` (5 tests).
An explicit one-deployment build override can run this CLI followed by the normal
build. Saved project build settings must remain `npm run build`; no permanent
release hook or public/admin bypass route is introduced. Inspect the deployment
receipt before claiming production publication. A build failure after CLI
success is not proof of rollback: inspect evidence/reconcile idempotently.
