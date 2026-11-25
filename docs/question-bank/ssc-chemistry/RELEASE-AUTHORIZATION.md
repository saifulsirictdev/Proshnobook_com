# Owner-authorized Chemistry publication — explicit one-off operation

Owner instruction: **“Import, approve, deploye koro”** after the complete12chapter draft bank and subject-specific Auto Model policy were disclosed.

Scope: **8110 canonical records / 82 prepared batches**, not checkpoint/source-candidate duplicates. 5500MCQ,1550CQ,1060SQ. Existing Physics/Math publication tasks must **not** rerun. Existing unrelated rows, IDs, contents and approvals are preserved.

Pinned plan digest: `4e87310512e4e02735a9e3406d48ebf29e4284d8ef2e8f9617dbe8819562acc8`.
415distinct referenced native/generatedassets;2598records include figures in question/stimulus/explanation. All415must pass public productionHTTPcontent-typeandSHA256checks before DB writes.

Explicit command acknowledgement: `PUBLISH_8110_CHEMISTRY_OWNER_APPROVED_NOT_TEACHER_CERTIFIED`.

The standalone `scripts/question-bank/release-ssc-chemistry.cjs` is not imported by routes or package scripts. Normal `npm run build` stays `prisma generate && next build --webpack`. A **single deployment's command override** can run the authorized publication in the production environment without exporting secrets or changing saved project build settings. It requires the exact project, production environment, digest, acknowledgement and commit-backed actor.

1. Deploy the tested code and all assets normally first; noDBwrite.
2. Verify415liveassets, then import missing canonical records **Pending** in a serializable transaction. Exact existing content is reused; altered canonical content or alias/legacyduplicate fails closed, never overwritten/deleted.
3. Approve only the8110pinnedIDs after exact-content recheck in a second serializable transaction. Existingapprovedrows remain approved. Approvalfailure leaves newlyimportedrowsPending with immutable importaudit, not a false success.
4. Read back8110approvedcanonicalrows and verify20seededAutoModels using approved scoped DBstock, including editor/printcompatibility. Store database audit receipts and a repository productionreceipt after verification.

Owner approval is **not independent teacher certification** or verification of an official examyear. Repeatedtask/datafamilies and source limitations remain preserved in per-batch provenance. This operation does not relabel authoredpractice as historicalboardquestions. Historical draft/Drivebackup receipts remain immutable snapshots of their creationtime.

Release unit tests cover pinnedidentity/digest, acknowledgement/actor/evidencegates, Pending→approved lifecycle, idempotentrepeat, priorapprovals/unrelatedrows, snapshotdrift, aliasduplicates, rollback and exactliveassetbytes. Publication-targetcode passed96boundedsubject/release/Physics/Math/English/settings/UItests; source/chapterregressions previously162PASS. Production outcome is recorded separately, never inferred from localtests.
