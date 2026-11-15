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

The audit was run against the npm registry with `npm audit --omit=dev`, not treated as proof every finding is exploitable. The initial baseline was 17 total (4 critical, 11 high, 1 moderate, 1 low); Phase 47 reduced it to 14. Phase 48 clean-install audit was 9 total. Phase 49 audit: **5 total (0 critical, 4 high, 0 moderate, 1 low)**. Re-run before release; registry advisories change.

Phase 48 pins Blob **2.4.0** with lockfile Undici **6.29.1**, removing the old Undici/busboy path. Blob 2.9.0 was evaluated but introduced an unnecessary OIDC/CLI-config dependency chain with additional audit findings; this app uses existing read-write/client tokens, not that feature. A pinned earlier 2.x release is deliberate, not a claim to use the latest SDK. No storage token, access policy or provider configuration changed. The SDK now requires Node >=20; local validation/CI use Node 22. Confirm the deployment runtime and perform a controlled authorized upload on staging after deploy.

Next's PostCSS is explicitly overridden to **8.5.33**, using the same PostCSS 8 family without a Next major migration. A fresh `npm ci --ignore-scripts` and `npm ls postcss --all` verified the lock resolves the patched version for Next as well as the root. Do not remove this override merely because a root PostCSS is current; inspect Next's nested resolution first.

New compatibility tests use the **actual** Blob SDK with a network-disabled Undici mock transport and a fake local token. They exercise server put/head/list/delete response shapes, PDF client token path/type/size/expiry settings, and reject absent/forged/tampered callback signatures before allowing an authentic locally signed callback. These tests are not live storage/provider validation. The production app's ownership checks, URL restrictions, upload limits, vault encryption, and token environment names are unchanged.

Phase 49 upgrades the direct PDF.js dependency to pinned **4.10.38** (a reviewed compatible 4.x release, not the latest major). All browser readers share a versioned same-origin ESM engine/worker pair and local CMaps; the two old vendor JS files and external PDF.js 3 CDN loaders are removed. Engine, worker and CMap byte parity are checked against the installed package. The server helper uses the native ESM legacy build; `pdf-parse` and its bundled old PDF.js renderer were removed. `/api/qb/extract-pdf` now requires a signed-in user before body parsing, bounds files to 10 MB, checks the PDF signature, caps server extraction at 100 pages/200,000 output characters and returns generic parser errors. Direct pasted text still uses the same question parser, without introducing AI charges. Browser and server documents are destroyed after extraction.

PDF tests create real two-page A4 fixtures with embedded Hind Siliguri Bengali plus English columns, check page/text coordinates and malformed input handling, and verify route authorization/input/error boundaries. `scripts/pdf-browser-check.cjs` additionally runs the real local ESM worker at 390px and 1280px, renders both pages to nonblank canvases and verifies two-page A4 print output. It denies external browser requests and uses generated fixtures only. Local browser execution was blocked by missing `libnspr4.so`; the browser check is a required CI step on Ubuntu's installed Chrome. See the PR's remote check evidence before claiming it passed. This isolated rendering test is not a full authenticated mobile Dashboard/editor walkthrough.

A Bengali fixture retaining `বাংলা` and visible raster ink does **not** prove perfect extraction of every conjunct, legacy encoding or scanned paper. Existing OCR/encoding limitations remain; use representative authorized NCTB/board/school and long mixed MCQ/CQ/SQ fixtures in the operator smoke gate. Raster previews/prints do not establish editable structured content or DRM.

Remaining audit paths are Zod 3, Prisma config → deepmerge-ts, and KaTeX (5 findings including transitive package entries, not 5 independently proven exploits). They require compatibility-reviewed validation/math/tooling updates. Do not run `npm audit fix --force` on production. Zero reported criticals is not proof that the application is vulnerability-free, nor that backup/alert/provider gates are complete.

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
