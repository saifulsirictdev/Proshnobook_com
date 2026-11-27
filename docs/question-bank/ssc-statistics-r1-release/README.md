# Chapter 17-only owner release (not teacher certification)

This task is opt-in and is never invoked by the app, Parse or the saved normal build command.
The owner explicitly authorized approval of the corrected 600. Do not run the 5750-question math release.

Plan digest: `aca9cbb220725c1fd437ac5395f5cbe95ac416ffed457728aa48d143114cf7c2`.
Acknowledgement: `APPROVE_ONLY_REVISED_600_SSC_STATISTICS_R1_WITH_BACKUP`.

1. Merge the latest production main commit into this session branch without changing branch or touching the unrelated dirty root. Verify main is an ancestor and that the app-code tree is unchanged from production. Preserve the previous production deployment as a rollback target.
2. Verify the full600 Drive receipt again and back up the release script, tests and pinned preview as a new versioned checkpoint. Push this session branch and independently read its SHA.
3. First production deployment: normal app build, then **snapshot** command. This only saves a complete chapter17 Question-row snapshot in an immutable Setting key and reads it back; no Question is imported or approved. New SVG assets are deployed normally. Do not expose database credentials or snapshot rows in logs.
4. Wait for deployment READY. Second production build of the same pinned commit: normal build, then **publish**. Before any Question mutation it downloads all 57 production-origin SVG URLs, requiring HTTP success, SVG MIME, no redirects and identical SHA256. It requires the stored DB snapshot. Pending import and approval are separate serializable transactions; Pending remains Pending if approval fails.
5. Approval updates only the 600 new canonical JSON-upload IDs. Only old canonical rows matching all fields and source are retired (approved=false, never deleted). Modified rows, moved IDs or alias/custom stem conflicts fail closed. Custom rows and other chapters are preserved. Full before-Pending and before-approval row snapshots are immutable Setting values with hash readback. These are in-database rollback snapshots, not offsite Drive DB dumps. The complete content/source backup is separately on Drive.
6. Read the successful release log receipt and perform independent DB/asset **verify**. An approval result includes an additional post-transaction DB readback; a dedicated verify command can recheck later. Save deployment IDs, commit, 600 counts, snapshot keys/hashes and all live asset checks in a versioned final receipt backup.

Commands (production context only; preview does not access DB):
```
node scripts/question-bank/release-ssc-statistics-r1.cjs preview
node scripts/question-bank/release-ssc-statistics-r1.cjs snapshot DIGEST ACK
node scripts/question-bank/release-ssc-statistics-r1.cjs publish DIGEST ACK
node scripts/question-bank/release-ssc-statistics-r1.cjs verify DIGEST ACK
```

Tests: 8 dedicated release safety/rollback/idempotency tests; 17 content Python and 7 content Node tests. All pass locally. No teacher certification is claimed.
The original prepared catalog is a historical source; it does not become this revision automatically. The live bank uses the new exact IDs after successful release.
