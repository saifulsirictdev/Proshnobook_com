# Staging isolation and synthetic restore rehearsal

## Current finding (metadata inspection, not decrypted secrets)

Vercel environment metadata was rechecked in Phase 52. `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` still have a single definition targeting both production and preview. `AUTH_SECRET` has a production definition, with no default preview definition in the returned metadata. Branch-specific settings and provider/resource permissions must be inspected before declaring any preview safe. No decrypted values were fetched, and none of these bindings were changed.

Production service must not be disconnected to simulate isolation. Do not delete/change shared definitions until separate staging credentials/resources are provisioned and verified. The available Vercel connector can bind existing resources but cannot provision an isolated PostgreSQL service, Blob store, PITR backup/restore or WAF policy. Owner permission is already granted; missing provider access/resources is the remaining blocker, not another permission request.

## Repeatable metadata preflight

`node scripts/staging-bindings-check.cjs < metadata.json` accepts metadata shaped like `{ "envs": [...] }` or a project `{ "env": [...] }`. Supply **metadata only** (key/target/gitBranch or git_branch); do not export/decrypt secrets into a file or commit environment values. The checker ignores any values and emits only fixed finding codes and known variable names. Malformed/oversized input fails closed.

It rejects shared production/preview sensitive definitions and missing default preview database/storage/auth definitions. Branch overrides do not certify default preview safety. A pass means only **definition checks passed**: it always reports `isolated:false`. Resource identifiers, permissions and sandbox users/providers must still be independently verified. Separate entries can hold identical values, aliases can point at the same DB, and separate credentials can still grant access to production.

### Resource checklist before mutating tests

1. Provision an empty staging DB with a credential that cannot access production databases; separate Blob store/token. Do not clone unredacted customer/financial data.
2. Use a distinct staging AUTH_SECRET and test ADMIN identity. Configure OAuth callback URLs for the staging domain with owner interaction; do not replace production callbacks. Restrict staging access.
3. Disable paid AI/payment side effects or use documented provider sandboxes and test credentials. No assumed fake transfer/refund to a real provider.
4. Bind only staging preview/branch targets; preserve production definitions. Rotate credentials only through an approved tested plan. Verify resource-level identity and permissions, not just env variable names.
5. Exercise authorized Teacher/ADMIN login, upload/approval, free/paid sandbox collection, repeated operation IDs, refund/withdrawal, Setup/Preview/Print and mobile flows. Record evidence and reconcile external statements before any real-money pilot.
6. For production backup recovery, document provider backup/PITR coverage/retention, encrypted offsite storage, key custody and an owner. Restore to an isolated destination and verify real data/key accessibility. Set business-approved RPO/RTO; do not use the synthetic CI timing as a business recovery guarantee.

## Synthetic whole-schema restore rehearsal

Required CI step: `node scripts/disposable-restore-check.cjs`.

Safety requirements are hard-coded: an explicitly supplied `RESTORE_TEST_DATABASE_URL` for `postgresql://auth_rate:…@127.0.0.1:5439/auth_rate_test` (or localhost), no URL options; a Docker container ID from the CI service; inspection confirming `postgres:16` bound to host port 5439. The script **never reads DATABASE_URL as its target** and refuses remote/production/test URLs with alternate database names or users.

It creates two random databases and only drops databases it successfully created. The full current Prisma schema plus additive security SQL is installed in the source. Synthetic teacher/resource/purchase/Setting fixtures include a source-separated wallet, operation marker and encrypted PDF fixture. These are representation/recovery fixtures, not real purchases or a claim that the full application payment workflow was exercised.

Using the service container's own PostgreSQL 16 tools, it dumps a complete custom-format backup into bounded process memory and restores to the distinct fresh destination in a single transaction. It compares every public table's row count/content hash, index definitions and constraint definitions; then validates the restored wallet source sum and decrypts the restored PDF using keys recovered via the existing encrypted-key-backup utility. Missing keys and wrong backup passwords are negative checks. Keys/passphrase are random synthetic values; no Blob fetch/upload occurs. Process-local key env changes are restored and the dump buffer cleared; subprocess output/connection details are not logged.

The CI step emits a safe summary with table/row counts, measured synthetic restore/total milliseconds and `productionRestoreVerified:false`. Actual production backup completeness, offsite custody, Blob object recovery, point-in-time recovery, provider credentials, production RPO/RTO and catastrophic regional loss are **not proven** by this test. Full source snapshots/index checks use tiny fixtures, not a production-scale load/capacity benchmark.

The local sandbox has no Docker/PostgreSQL/native Prisma engine, so only guard/unit tests run locally. The real dump/restore must pass isolated CI before merge. A failed cleanup also fails the check; the ephemeral job service is ultimately removed by GitHub Actions.
