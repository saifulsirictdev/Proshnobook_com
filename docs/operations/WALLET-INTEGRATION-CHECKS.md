# Wallet concurrency and reconciliation rehearsal

## Scope and safety

Two previously manual PostgreSQL checks are now portable, required CI steps:

- `node scripts/wallet-postgres-check.cjs`
- `node scripts/wallet-transfer-postgres-check.cjs`

Both require explicit `WALLET_TEST_DATABASE_URL` pointing at the disposable CI control DB `postgresql://auth_rate:…@127.0.0.1:5439/auth_rate_test` (or localhost). Remote hosts, different ports/users/database names, query/fragment options and missing targets are rejected. `DATABASE_URL` is never the target/fallback. Prisma subprocesses receive only the generated local database URL as DATABASE_URL.

The shared harness creates a random database, installs the complete current Prisma schema, uses the project's generated native Prisma client and destroys only the database it successfully created. Cleanup/disconnect also runs on failures. There is no external generated-client path, adapter dependency, TRUNCATE or setup DDL on pre-existing app tables. Failure messages do not forward connection strings, subprocess output or raw financial records. The dedicated CI service is ephemeral; do not point this tool at any production/preview resource.

## Actual app behavior exercised against PostgreSQL

The tests load the current wallet/actions modules and run real database transactions/advisory locks. Authentication identity and Next cache are controlled test doubles; no Google/browser/provider session is fabricated as verified. Synthetic users have `.invalid` email addresses. These are not bKash/Nagad settlement/API calls and do not move real money.

Coverage includes:

- Concurrent account initialization grants the one-account bonus once.
- Ten concurrent question checkouts charge only the expected amount once.
- Five concurrent recharge approvals accept one approval/credit.
- Forced failure after balance mutation rolls back the transaction.
- Recipient history failure rolls back sender/recipient balances and ledger together; retry operation IDs credit once.
- Transfer-received funds never become seller earnings/withdrawable earnings.
- Withdrawal hold/record failures, concurrent reviews, payout-claim/release controls and audited financial limits.
- Marketplace receipt failure rolls back buyer/seller/copy; eight retries buy once, exact seller/platform split, institution customization preserves snapshot.
- Refund failures roll back atomically; refunds restore original funding sources and reconcile the original immutable sale.
- Repeatable-read financial reports reject non-ADMIN access and reconcile original sale/refund/hold state. Reports are not external bank/provider statement reconciliation.

CI must pass these actual PostgreSQL scripts before merge. Unit tests validate the harness's target rejection/redaction and protect against reintroducing legacy unsafe setup. Local sandbox has no usable native PostgreSQL engine/server; passing unit/mock tests alone must not be reported as executing the concurrency scripts. See PR/Actions step results for real execution evidence.

## Remaining external evidence

A passing rehearsal does not certify real Google login, mobile Dashboard interactions, production upload/Print, provider settlement/refunds, live permissions, production-scale capacity, backup/PITR custody or inbox alert delivery. Resource isolation remains necessary before mutating browser/provider tests. Owner authorization is already granted; account sessions/provider sandbox resources still must be available through a safe channel. Never post passwords, tokens, full payment records or actual backup data into GitHub issues or chat.
