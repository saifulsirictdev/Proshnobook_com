# Isolated signed-in browser checks

`node scripts/authenticated-browser-check.cjs` runs after the production build in required CI. It uses the same strict disposable database harness as the wallet rehearsals: explicit local5439/auth_rate_test control URL, random owned DB with full schema, cleanup on success/failure. It never targets a Vercel deployment or production credentials.

Synthetic TEACHER/ADMIN/STUDENT rows have random bcrypt passwords and `.invalid` email addresses. A real built Next server, NextAuth Credentials provider, login form/server action, CSRF/session cookie/JWT and PostgreSQL are used. Session cookies/tokens are not fabricated; application API responses are not mocked. Google provider strings are invalid synthetic placeholders solely for local configuration—not a simulated verified Google OAuth result.

The server receives a whitelisted environment with its isolated DB URL and a fresh AUTH_SECRET; it does not inherit Blob/payment/AI/production provider credentials. Browser requests outside the local origin are aborted. Server logs, cookies, passwords, environment values and raw app errors are not published; safe static phase codes identify failures. Browser/server close before the owned database is dropped.

Checks cover anonymous Dashboard rejection, wrong-password rejection, correct Credentials login and actual session identity/role, private Dashboard/wallet/library responses and noindex directives, 390px/1280px horizontal overflow, ADMIN-only financial page boundary and one-time bonus accounting for non-ADMIN roles after repeated visits.

This is real application sign-in on synthetic accounts, but not real Google OAuth, registration email verification, existing production-user session compatibility, full editor/upload/approval/free-paid-copy/Print walkthrough, provider settlement, physical-device usability, accessibility audit or load benchmark. Existing PDF engine Print and wallet commerce concurrency rehearsals cover separate scopes. Actual external resources and user interaction are still required for those remaining gates.

Local unit tests check target rejection and no raw secret/session/API mocks. Local sandbox lacks PostgreSQL/native engine/Chrome libraries, so a local unit pass does not mean browser execution passed. Required remote CI must pass before merge. No production auth/wallet/authorization behavior is changed by adding this check.

## Owner brand follow-up

The isolated real-login check also requires the actual owner P PNG to decode at its expected natural width on the login page and each role's Dashboard at 390/1280px. A path/source-string match alone cannot pass this browser assertion. This remains an emulated browser, not physical-phone acceptance.

`node scripts/public-brand-check.cjs` is a separate anonymous, fixed `https://proshnobook.com` GET-only release check. It verifies homepage favicon/Apple/P bindings, manifest any/maskable bindings, PNG content types and SHA-256 equality against the repository's eight current/legacy PNG assets. Redirects, HTML fallback, stale bytes, missing bindings and oversized bodies fail with redacted results. It does not authenticate or mutate the site. It runs in release-smoke on manual dispatch/affected PRs (not the frequent liveness incident loop). A future logo release must deploy its assets before the live brand check can pass.

The Admission/Job outline follow-up exercises the real starter after login for all roles at 390/1280px: medical subject/topic selection, switch to Job, NTRCA and bank profile resets, visible non-official disclaimer and horizontal overflow. It intentionally never presses the prepare button or enters generation, so it does not consume paid AI or certify exam-question accuracy/completeness. The profiles are editorial suggestions, not verified exam/year filters.

## Hydration follow-up

Repeated production-only React 418 failures were investigated using an isolated development run (which passed) and temporary tag-only instrumentation in the owned CI build. It captured expected `MAIN` versus actual `DIV`/`A`; no props, page text or credentials were logged. The root shell no longer nests its own main landmark around route-owned main elements; its distinct `#site-content` div keeps route landmarks separate. Private Dashboard/wallet/library visits now repeat the 390/1280px cycle twice per role. Full runtime-error assertions remain enabled. Temporary instrumentation/development overrides were removed before the final production-build check. This is scoped browser-regression evidence, not a guarantee about all browsers or an independently reproduced framework-level root cause.

Further clean runs showed that landmark cleanup alone was insufficient. Tag-only ancestry tracing located the mismatch at the root content host while hydration was already at its first child (`DIV/BODY/HTML` expected vs `MAIN/DIV/BODY/HTML` actual). PathGate previously returned no host at all for hidden chrome immediately before this content. It now always renders a stable host boundary, with hidden routes empty and `hidden`/`display:none`, visible chrome `display:contents`. Route content is not deferred to client-only rendering and no hydration warnings are suppressed. Header visibility tests verify both hidden and visible behavior. Temporary ancestry instrumentation is removed from final CI.

The stable chrome/landmark hosts were insufficient alone. Route content now also owns an explicit Suspense boundary around the content host, so async route hydration has its own streaming delimiters rather than sharing the shell's host cursor. Fallback is an accessible busy placeholder, not a client-only rendering switch. The same strict production runtime tests apply.
