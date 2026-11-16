# Google signup identity and Student creator boundary

Owner decisions: first-time Google users choose Teacher, Student or Contributor. Contributor has Teacher capabilities (not Admin). Student enters live tests and uses exam/practice, not question-paper authoring. This supersedes the earlier policy allowing Student authors.

## Flow / persistence

- Keep Google's `email_verified === true`, existing verified-email password clearing and configured Admin-email rule.
- New non-admin Google users and the `account-type:v1:<userId> = PENDING` marker are created in one DB transaction. Existing accounts are not reclassified or prompted; Admin stays on official public profile.
- Post-auth `/auth/landing` reads the stored marker: pending → `/auth/onboarding`; Student → `/model-test` (live tests), Teacher/Contributor → Dashboard. Safe callback handling still applies to legacy creators. Password login also uses this authoritative landing resolver.
- Onboarding offers three real submit buttons with descriptive cards. Only the authenticated ID is used. A conditional PENDING update and STUDENT→capability-role update commit together. Repeat or forged selection does not change an existing identity and cannot assign Admin. No arbitrary user ID or role-update payload is accepted.
- No PostgreSQL enum migration is needed: Contributor is a separate persisted identity with existing TEACHER capabilities, as requested. Its Dashboard is visibly labelled Contributor. STUDENT remains the Student capability role; ADMIN remains protected. Future distinct contributor powers would require a separate authorization design.
- JWT capabilities refresh from the current DB role, ignoring client session role updates. Deleted accounts lose the subject used for authorization. This makes a completed signup choice effective without trusting a browser-provided role.

## Server boundaries

Student cannot open database/English builder subtrees, Ready editor/upload routes, or purchased-paper setup editor. Already-purchased immutable copies remain readable; receipts, wallet records and stored data are not deleted. Student Dashboard goes to live tests. Student mobile navigation emphasizes Live Exam / Practice instead of creation/saved editor.

Direct server authoring actions (database prepare/save, English generation/save, header management, Ready upload/commerce/AI/vault and marketplace submission) reject Student. Question loading and PDF extraction APIs reject Student. Exam generation stays available for MCQ/EXAM, not paper CQ/SHORT/MIXED. Admin-only moderation, finance and approval rules stay unchanged. Public pages and previously owned read-only financial/purchase records are not confiscated.

## Evidence / limits

Unit tests cover role validation, transactional one-time choice, existing/Admin accounts, Google verification guard and pending-marker behavior, stale role refresh and Student denial. Existing creator ownership/quotas/approval tests use Teacher fixtures under the new policy; explicit negative Student tests remain.

Required isolated built-app browser CI uses real Credentials sessions on synthetic pending records to exercise all three onboarding choices, persisted identity/capabilities, redirect, stale-role refresh, no repeat-choice UI and Contributor label. Existing-role Student tests check live-test landing, creator route/API rejection; creator roles retain selector/browser checks. These are application-onboarding tests, **not** a claim of real Google-provider sign-in or physical-device acceptance. No production accounts, settings, credentials or money are mutated by tests.
