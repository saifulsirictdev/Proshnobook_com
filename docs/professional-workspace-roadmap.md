# Professional workspace upgrade — accepted scope and execution ledger

Existing features/data are preserved. This is the follow-up to the owner's request to implement all ten professional-workspace recommendations, not a claim that the entire roadmap is complete.

## Delivery sequence / acceptance gates

| Area | Acceptance criteria | Status |
|---|---|---|
| Draft safety | Debounced server autosave separate from Question; owner isolation; reload recovery offered, never silently applied; offline device-copy opt-in; cross-tab stale-write protection; truthful save/offline/failure status | Implemented in code; focused tests passed, final regression/CI gate pending |
| Question quality | Deterministic structure checklist, MCQ option/key/CQ marks/answer warnings; publishing is not semantic verification | Implemented in code; focused tests passed, final regression/CI gate pending |
| Editorial evidence | Structured book/edition/page/source and independent language/answer/syllabus verification with reviewer/time/reason | Not implemented in this follow-up yet |
| Review workflow | Scoped author/reviewer/publisher capabilities, assignment, comments/change requests, optional two-person publication | Not implemented yet; existing ADMIN boundary unchanged |
| Paper blueprint | Chapter/type/marks/difficulty targets, coverage/repeat warnings, teacher-confirmed suggestions | Existing builder/auto-model behavior retained; expanded blueprint not implemented yet |
| Saved versions | Immutable saved question versions, comparison, explicit update choice, critical-correction notices | Existing snapshots retained; notices/update choices not implemented yet |
| Resumable import | Persist staging/corrections, original-to-parsed comparison, skipped-content accounting and report | Existing reviewed DOCX/JSON importer retained; resumable batch workspace not implemented yet |
| Media library | Search, source/description, reference inventory, no deletion of used images | Existing immutable raster uploads retained; searchable library not implemented yet |
| Teacher workspace | Four primary tasks, reusable institution/header/layout presets, no Admin-tool leakage | Existing teacher tools retained; unified redesign not implemented yet |
| Assessment analytics | Question response/option statistics, complaints and chapter gaps, advisory review flags; privacy/access controls | Not implemented yet |
| Operations/security | Health/error alerts, storage/AI-cost visibility, audited restore rehearsals, release rollback runbook, stronger Admin reauthentication | Existing health endpoint, CI restore/security checks and wallet safeguards retained; new dashboards/alerts/step-up not implemented yet |
| Payments | Traceable receipts, reconciliation and refund states; distinguish provider settlement from Admin-recorded state | Existing wallet/reconciliation/refund code retained; external provider verification is not claimed |

## Standing safeguards

- Autosave must NEVER create/edit/approve a live Question. Only the existing validated/revisioned editor save can do that, always Pending.
- A recovery action is explicit and does not adopt old approval or silently replace a newer DB record.
- Browser storage is not encrypted/a backup guarantee. Device persistence is opt-in with a shared-device warning. Server save success and local recovery success are shown separately.
- Only current authenticated ADMIN can read/write their recovery slot; client-supplied owner IDs are not accepted by the API.
- Same-origin, bounded-body and compare-and-swap revision checks apply. Another tab's draft cannot be overwritten or deleted with a stale token.
- Quality checks are structural/advisory, not subject-matter, source, copyright or factual certification. No AI/provider transmission is introduced by them.
- Never change production questions, payment balances, source content or infrastructure secrets just to prove a test. Use synthetic fixtures/disposable DB.
- No autonomous work or notifications after the turn ends. Remaining rows are backlog, not work claimed as running in the background.

## This delivery: storage and verification notes

- Recovery entries live in existing `Setting` rows under `question-bank-recovery:v1:<SHA256 actor>:<SHA256 slot>`. There is no Prisma schema migration. Existing Setting backups must cover these private, unpublished drafts. Scope is one `new` slot plus per-question edit slots, up to 25 active slots per Admin. Successful Pending save attempts revision-checked cleanup; failed cleanup is disclosed. Closing the editor does not implicitly delete recovery.
- Autosave debounce is 1.1 seconds; client requests time out after 12 seconds. Last-moment edits may not have reached any copy. Initial server read/recovery decision and conflict checks precede autosave. Explicit recovery resets the review checkbox; normal Pending validation/revisions remain authoritative.
- Device persistence is opt-in, browser-local, plaintext and best-effort. Namespace is current server-authenticated Admin + slot. Storage changes pause this tab and surface a recovery choice. The server compare-and-swap is authoritative; localStorage is not transactional across processes, a secure vault or a guaranteed backup. Shared-device users should leave the option off/remove recovery and sign out.
- Pure structural quality checks do not fetch images, verify source claims or decide that an answer is factually correct. An image reference is not proof the file exists. Publication status is not semantic certification.
- Local focused tests: 5 service/API/quality tests plus 4 React/jsdom recovery interaction tests passed. Standalone TypeScript passed after editor integration and fixture additions. Production build and authenticated/real-DB CI gates are still pending. New disposable PostgreSQL concurrency and actual Credentials reload/recovery checks are wired into existing CI scripts, not yet claimed as executed.
- No production records, provider calls, financial state, secrets or prepared question sources were changed by this delivery.
