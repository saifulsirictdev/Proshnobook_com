# Public monitoring and release smoke checks

## What is active after merge

`.github/workflows/public-health.yml` schedules a read-only probe of `https://proshnobook.com/api/health` every 15 minutes, with an additional retry after 3 seconds. A run is capped at 3 minutes; each fetch has a 10-second timeout. Response reads are capped at 4 KB, redirects are rejected, and only safe reason codes are published. No application credentials/cookies, DB calls, registrations, purchases, uploads or payment retries are involved.

GitHub schedule is best effort: jobs can be delayed/dropped, scheduled workflows in inactive public repositories can be disabled, and this is not a contractual uptime SLA or an independent multi-region provider. The first actual run must be inspected; do not call an unexecuted schedule a delivered alert.

On failure the workflow creates one bot-owned issue titled `[monitor] Production public liveness incident`. Further failures remain failed workflow runs without issue spam. A successful subsequent probe comments and closes only the bot-owned issue carrying the exact monitor marker. It never closes user issues or pull requests. An infrastructure failure of the monitor is also an incident, explicitly distinct from proof the site is down.

The issue and failed workflow are the notification surfaces. Repository owners should configure GitHub Watch/Actions notification preferences and verify delivery to their chosen inbox/device. A working healthy probe cannot prove failure-alert email delivery. No SMTP/webhook secret or invented recipient has been configured. Do not put tokens or private customer/payment data into incident comments.

## Release verification

The workflow's read-only `release-smoke` job runs on relevant PRs and manual dispatches. It performs anonymous GET requests for homepage/About/Contact, robots, sitemap and the private Dashboard redirect:

- Public HTML returns 200, has one correct canonical, no noindex directive; home/About JSON-LD parses.
- robots points at the expected sitemap, sitemap uses the production origin rather than Vercel URLs.
- Anonymous Dashboard redirects to same-origin login, not a successful private response.

These checks do not prove all sitemap entries, indexing/rankings, full structured-data semantics, OAuth, authenticated authorization, account-specific content, storage, wallets, provider readiness or financial reconciliation. JSON-LD parsing is not a guarantee of rich results. Public homepage GET may read application data normally, but the probe itself has no mutation path and does not post forms.

Run manually in GitHub Actions → **Production public liveness** → **Run workflow**, or `gh workflow run public-health.yml --ref main`. CLI scripts are `node scripts/public-health-check.cjs` and `node scripts/public-release-check.cjs`. Sandbox outbound network restrictions may prevent local direct checks; CI performs them from a GitHub runner. Never substitute a local/mock test for live results.

## Incident response

1. Read the failed run reason and compare deployment status, error rates and provider health. A good health response does not establish payment readiness.
2. Do not blindly repeat payments/withdrawals or clear operation IDs. Follow `PRODUCTION-READINESS.md` rollback and financial reconciliation guidance.
3. Monitor recovery independently for login, uploads and payment flows before marking those recovered.
4. To rehearse alert delivery, use a separate test workflow/incident with an agreed recipient. Do not deliberately break production or bypass authentication to create an alert.

## Remaining access/resource blockers (owner permission already granted)

- Vercel metadata shows production and preview targets sharing database/Blob credential definitions. Treat preview as potentially production-connected; create/verify separate staging resources before mutating smoke tests, restore rehearsals or load testing. Secrets were not decrypted and production bindings were not changed.
- Current Vercel connector does not provision database PITR/restores, WAF rules or uptime-provider recipients. There is no connected database/provider sandbox or signed-in teacher/ADMIN browser session available here. Blanket permission is not a substitute for those resources or OAuth interaction.
- Required next evidence: isolated database/storage/provider configuration; successful non-destructive whole-DB/vault restore with measured RPO/RTO; authorized real account/payment tests; full mobile workflow; recipient-confirmed alert delivery; WAF/load/account-access audit. These remain explicitly incomplete, not waiting on another generic permission message.
