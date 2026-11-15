# Production readiness — evidence and release gates

This is a readiness baseline, **not enterprise certification**. Passing mocked tests/build does not demonstrate production restore, delivery, payment settlement or uptime. No production credentials/data were accessed or altered during this work.

## Implemented in this PR

- Credentials provider itself reserves a shared PostgreSQL attempt before user lookup/password comparison. It cannot be bypassed by skipping the login UI. Counter: ten attempts per normalized email per fixed 15-minute window; successful attempts also consume quota. Registration: five attempts per normalized email/hour, before lookup/hash. Fixed key stores only a hash plus window/count, not a plaintext email/password/IP. Concurrent workers serialize the same counter using parameterized PostgreSQL advisory locks. Corrupt/unavailable store fails closed; Google OAuth is not gated by these counters. Backwards clock movement cannot reset a counter.
- These are **per-account** limits, not distributed bot prevention. Known-address attackers can temporarily exhaust a password counter; Google login remains separate. Deploy network/WAF limits and monitoring for credential stuffing, password spraying and unique-email registration floods. No claims of complete abuse protection. Counter rows are bounded per attempted identity, not globally; retention/cleanup must avoid resetting active windows. Database outage may temporarily block password login and registration by design.
- Newly registered bcrypt passwords must be 8+ characters and at most 72 UTF-8 bytes to avoid silently equivalent suffixes. Existing login accepts up to 1,024 characters for compatibility. Never log secrets or paste passwords into support chat.
- `nosniff`, strict-origin-when-cross-origin referrer policy, disabled X-Powered-By. Vercel **production** also emits SAMEORIGIN framing protection; preview/dev embedding is intentionally permitted for testing. Same-origin print frames remain supported. No untested strict CSP/HSTS was imposed. Self-hosted deployments must configure framing protection at their edge.
- Generic error boundary hides raw exception details and directs users to wallet/library before retrying financial operations.
- `GET /api/health` returns only `{status:"ok",check:"liveness"}`, no-store/noindex, without DB/provider requests or secret/config/version details. A 200 is **not readiness** or proof of working checkout. Configure external uptime/error alerts with an owner/notification target; none were provisioned by this PR.
- CI now includes a production build and isolated PostgreSQL auth-counter concurrency test. The script refuses all URLs except a disposable localhost:5439 `auth_rate_test` database, creates a random schema and drops only that schema. It never points at app/production schemas. Existing real wallet scripts are preserved, not misrepresented as newly executed.
- Next.js 15.5.29 / Auth.js beta.32 / Sharp 0.35.5 security updates are pinned and tested without a Next major migration. Two remaining PDF.js 3 browser loaders now explicitly disable eval, matching existing other PDF readers.

## Existing evidence from repository (not newly verified production)

- Wallet uses serialized transactions, immutable operation IDs and source-separated balances; free/paid collection and refund regression tests exist.
- Bounded repeatable-read financial reports, payout claims and limits exist. They are not a bank/provider settlement reconciliation system. Reconcile actual external statements operationally.
- Encrypted PDF vault diagnostics, non-destructive migration/retirement gates and offline encrypted key backup utility exist. See `docs/proshnobook-plan/PDF-VAULT-OPERATIONS.md`. Key backup utility is not a whole PostgreSQL backup or proof of offsite recovery.
- Authenticated public/private route boundaries and user-owned paper/receipt tests exist. Real teacher/ADMIN, mobile, upload/provider and clean Print/PDF smoke tests remain mandatory.

## Dependency risk still open

The audit was run against the npm registry with `npm audit --omit=dev`, not treated as proof every finding is exploitable. Initial dependency findings: 17 total (4 critical, 11 high, 1 moderate, 1 low). After targeted updates: 14 total (1 critical, 10 high, 2 moderate, 1 low). Re-run before release; registry advisories change.

Remaining dependency paths include PDF.js 3 → optional canvas/node-pre-gyp → tar, Vercel Blob → Undici/busboy, Zod 3, Prisma config → deepmerge-ts, Next's pinned PostCSS, and KaTeX. `isEvalSupported:false` mitigates the documented PDF.js eval issue at all current entry points; **it does not clear npm audit or establish that every PDF/tooling issue is mitigated**. Upgrading PDF.js/worker assets, Blob, Zod and Prisma tooling requires compatibility/provider/print tests; do not run `npm audit fix --force` on production. The remaining tar critical is through an optional PDF native-tooling dependency, not a finding that the wallet executes attacker-provided tar files. This is still an explicit review/remediation gate, not a risk waiver.

## Required owner/operator release gates

1. **Staging isolation:** separate DB/storage/provider sandbox; verify no preview is writing production data. Do not copy production credentials into CI or chat. Live provider/OAuth recheck is required after auth dependency updates.
2. **Restore proof:** establish provider database backup/PITR coverage, retention, offsite access and an owner. Restore into an isolated environment, verify users/paper/ledger row consistency and encrypted-PDF key access. Set business-approved RPO/RTO and record actual recovery time. Existing data is not to be deleted for rehearsal.
3. **Financial pilot:** authorized teacher/ADMIN login; free collection, explicit consent for any paid sandbox pilot, retry/idempotence, source balance and seller/platform amounts; Setup/Preview/Print; refund and withdrawal claim controls. No unsolicited real-money test transactions.
4. **Monitoring:** external health monitor for transport/liveness plus authenticated synthetic/user-visible failure metrics, provider errors and failure-rate alerts. A static health 200 or successful build must never be the only checkout monitor. Sanitize logs; retain restricted access and agreed retention.
5. **Load/mobile:** measure p95 route/action latency, database connections/lock waits, error rate and real mobile layout/print with a realistic dataset. No production stress test without approval. Do not guess concurrency capacity from unit tests.
6. **Security ownership:** domain/GitHub/Vercel/Search Console access review, 2FA and recovery; dependency remediation above; secret rotation with a verified rollback plan. Do not rotate live vault keys blindly or delete historical keys.

## Incident/rollback procedure

- Stop repeated payment/withdrawal attempts; preserve operation IDs, timestamps, immutable receipts and restricted diagnostic records. Do not paste secrets/full payment details publicly.
- Determine affected service/release and restrict only the affected action using an approved operational control. Do not disable all authorization or fail open to restore availability.
- Roll back only to a **financially/schema-compatible** deployment. Never deploy an old total-balance writer against newer source-separated wallets, clear financial idempotency keys, or replay provider payments blindly.
- Reconcile wallet/purchase/provider state before retry/recovery. Restore copies into isolation for investigation, not over production without a rehearsed, approved plan.
- Document incident scope, recovery and follow-up tests. No claim of enterprise readiness until the above evidence has an accountable owner.
