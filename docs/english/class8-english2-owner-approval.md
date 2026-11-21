# Explicit owner approval — frozen Class Eight Second Paper import

## Authorization and scope

After PR #7 published/imported 440 Pending sets, the owner explicitly requested **“Approved koro”**, then continued on `arena/6a0cf0da-proshnobook-com` to authorize this scoped operation. This is a new permission to approve those **440 imported Class 8 / English 2nd Paper sets only**, not every Pending question and not the historical SSC/First Paper material.

Frozen import plan SHA-256:

`01e3d6aa6eee372066ebce8839245bf32af0482e3ecc11e3ce52571d9646ef9c`

The question/answer text, original snapshots, model-alignment caveats and import receipts are not changed. Owner-requested database approval is not an independently performed teacher review or official syllabus/answer-key certification. Historical raw draft provenance intentionally remains historical.

## Bounded operation

`scripts/english/approve-class8-english2.cjs` is an explicit CLI, never invoked by normal builds, HTTP requests, cron or application reads.

- `preview` is database-read-only. It verifies the frozen import digest, 11 exact import receipts, their 40 deterministic IDs each, and every current question field/source against the reviewed data. It reports 440 matched, Pending/already-approved counts and a live decision digest.
- `approve` requires both `C8_DIGEST` equal to the frozen digest and `C8_APPROVE=APPROVE_CLASS8_ENGLISH2_440_ONLY` before creating a database client. It performs/logs the read-only preview, then revalidates everything inside a serializable transaction. A changed live preview aborts.
- Updates are scoped to explicit target IDs plus Class 8, English 2nd Paper, exact topic/import source and `approved:false`. Only `{approved:true}` may be written. No insert/delete/question-content update, import rerun, SSC write or unfiltered approval is present.
- All 440 rows are verified approved before commit, with every other question field unchanged. A separate `preparedapproval:owner:v1:<import-digest>` audit records the owner's explicit authorization, prior counts, ID hash and timestamp. Import receipts are untouched.
- A repeated successful invocation is read-only/idempotent. If a later decision revoked any of these approvals, the old authorization refuses to reapprove it. Missing/edited/foreign-source questions or bad receipts abort rather than importing/replacing them.

## Execution

1. Require passing regression checks and the reviewed code commit.
2. Use the existing deployment-local production database binding; never extract credentials into chat or the sandbox.
3. For this authorized one-off only, run a successful normal build, followed by the explicit digest/acknowledgement-bound `approve` CLI. The preview counts and final `OWNER_APPROVAL_VERIFIED` receipt must be observed before reporting success.
4. Do not persist the override in project settings. Afterwards deploy the same commit with the normal `npm run build` command only.
5. Retain credential-free operation/deployment receipts in the PR audit trail. An error/timeout is not proof of rollback or success; inspect the specific execution before retrying. Do not replay the old import command.

Approved-question review: https://proshnobook.com/admin/questions?category=Class%208&subject=English%202nd%20Paper&status=approved

The generic approved SQ question bank is distinct from certified structured Auto Model stock. This operation does not assert Auto Model readiness or alter print/layout behaviour.
