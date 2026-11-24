# Owner-authorized SSC mathematics release

## Authorization and scope

The owner explicitly requested live import, deployment and approval after PR #18,
including a mathematics Auto Model with CQ divisions and short questions. This
supersedes Pending-only authorization **for these 53 canonical SSC general-math
slices only** (chapters 1–17, 5,750 records). It does not authorize publication of
other prepared subjects, English drafts or arbitrary database rows.

This is an **owner publication decision**, not an assertion of independently
performed teacher review, official board authenticity, exhaustive coverage or
NCTB textbook certification. Historical authoring audits retain their truthful
`teacherApproved:false` and original limitations; publication has a separate DB
ledger. The owner may later unapprove/edit questions through normal ADMIN tools.

## One-time production task

`scripts/question-bank/release-ssc-math.cjs` is a CLI, not an HTTP endpoint,
package lifecycle hook or ordinary build step. There is no new bearer grant,
ADMIN impersonation, database credential export or authentication change.

1. Run `node scripts/question-bank/release-ssc-math.cjs preview` locally and
   inspect the immutable per-slice digests, exact quotas, assets and model stock.
2. Pass tests/typecheck/CI and deploy the application code (including shared
   geometry/table rendering) to production first.
3. Only after that deployment is READY, explicitly run the one-time task inside
   an authorized production execution context. A Vercel production deployment
   may use a **per-deployment** build command override:

   ```sh
   npm run build && node scripts/question-bank/release-ssc-math.cjs publish <EXACT_PREVIEW_DIGEST> PUBLISH_5750_SSC_MATH_OWNER_APPROVED_NOT_TEACHER_CERTIFIED
   ```

   Normal saved project build command remains `npm run build`. Do not retain a
   release hook in `package.json`, change database URLs, move credentials into
   Git/outputs, or request decrypted production credentials. The CLI requires
   `VERCEL_ENV=production`, the normal DB binding and an immutable Git commit SHA;
   only credential-free counts/digest/model checks are printed.
4. Pending import runs as one Serializable transaction using existing prepared
   IDs and `preparedimport:v1:<digest>` audit receipts. Existing receipt history
   is not overwritten. Missing rows are created Pending; category-alias stem
   collisions are skipped without changing/approving them. Changed canonical
   rows stop the transaction instead of being silently overwritten.
5. A separate Serializable transaction rechecks every canonical row's content,
   source and ID, confirms adequate model stock, approves only those exact IDs,
   and verifies their final approved state. On approval failure, the imports
   remain Pending. Unrelated stock/accounts/roles/financial data are untouched.
6. Retain `SSC_MATH_RELEASE_RECEIPT` from the successful task. The database also
   stores scoped import reconciliation and immutable approval events under
   `ssc-math-release:v1:<digest>`. A deployment alone is NOT import evidence.
   Verify production commit/alias, geometry/statistics assets and builder access.
7. A repeat is idempotent while content is unchanged; it records a new owner
   release event. It must not be scheduled or rerun after subsequent teacher
   moderation without a new owner decision. No automatic rollback/deletion is
   supplied: examine receipt IDs and actual usage before any later reversal.

## Auto Model contract

- SSC general math only; unsupported subject/grade blueprints stay disabled.
- Written: 2 CQ from each of algebra, geometry, trigonometry/mensuration and
  statistics (8 CQ), then 15 SHORT; answer 5 CQ with at least 1/division and any
  10 SHORT, total 70 marks (50+20). CQ parts 2/4/4, SHORT 2 marks each.
- MCQ: 30 questions, 30 marks. Selection still reads approved stock and returns
  IDs through existing access/payment gates; no public question-content leak.
- Real canonical-stock selection is tested, not just synthetic fixtures. The
  release repeats this check inside the approval transaction against DB rows.
- Shared MathText supports only exact versioned same-site geometry SVG paths
  (chapters 6–10, 14–16) and statistics SVG paths (17), plus bounded native tables,
  so Chapter/quiz/answers no longer show these assets as literal Markdown.

## Evidence boundaries

Mock tests cover explicit digest/acknowledgement/actor gating, both transaction
phases, idempotency, alias conflicts, changed content and unrelated records.
`scripts/ssc-math-release-postgres-check.cjs` repeats release/repeat/conflict
checks against a new disposable localhost-only PostgreSQL database in CI, never
against production. Six-CQ statistics A4 proof is not full 600-question paper
pagination certification. Production purchase/save/reopen/manual moderation
still require a real authorized user session; deployment checks cannot certify
those interactions.
