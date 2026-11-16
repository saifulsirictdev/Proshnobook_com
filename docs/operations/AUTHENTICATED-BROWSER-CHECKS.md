# Isolated signed-in browser checks

`node scripts/authenticated-browser-check.cjs` runs after the production build in required CI. It uses the same strict disposable database harness as the wallet rehearsals: explicit local5439/auth_rate_test control URL, random owned DB with full schema, cleanup on success/failure. It never targets a Vercel deployment or production credentials.

Synthetic TEACHER/ADMIN/STUDENT rows have random bcrypt passwords and `.invalid` email addresses. A real built Next server, NextAuth Credentials provider, login form/server action, CSRF/session cookie/JWT and PostgreSQL are used. Session cookies/tokens are not fabricated; application API responses are not mocked. Google provider strings are invalid synthetic placeholders solely for local configuration—not a simulated verified Google OAuth result.

The server receives a whitelisted environment with its isolated DB URL and a fresh AUTH_SECRET; it does not inherit Blob/payment/AI/production provider credentials. Browser requests outside the local origin are aborted. Server logs, cookies, passwords, environment values and raw app errors are not published; safe static phase codes identify failures. Browser/server close before the owned database is dropped.

Checks cover anonymous Dashboard rejection, wrong-password rejection, correct Credentials login and actual session identity/role, private Dashboard/wallet/library responses and noindex directives, 390px/1280px horizontal overflow, ADMIN-only financial page boundary and one-time bonus accounting for non-ADMIN roles after repeated visits.

This is real application sign-in on synthetic accounts, but not real Google OAuth, registration email verification, existing production-user session compatibility, full editor/upload/approval/free-paid-copy/Print walkthrough, provider settlement, physical-device usability, accessibility audit or load benchmark. Existing PDF engine Print and wallet commerce concurrency rehearsals cover separate scopes. Actual external resources and user interaction are still required for those remaining gates.

Local unit tests check target rejection and no raw secret/session/API mocks. Local sandbox lacks PostgreSQL/native engine/Chrome libraries, so a local unit pass does not mean browser execution passed. Required remote CI must pass before merge. No production auth/wallet/authorization behavior is changed by adding this check.
