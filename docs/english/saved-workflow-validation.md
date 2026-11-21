# English saved-paper workflow validation

## What this checks

The public `/question-builder/build?englishKey=…` route currently renders **EnglishLegacyBuilder + QbBuilder**, not the separate EnglishEditor fixture. This regression deliberately follows that real route with actual Credentials login, server actions and a disposable PostgreSQL database.

Matrix: grades 6, 7, 8, 10, 11 and 12; both papers, alternating 390px mobile / 1280px desktop; additional junior Paper 2 cases give each junior grade both viewport sizes (14 cases). Grade 9 alias behavior is not part of this matrix.

For every case:

1. Seed a minimal test-owned Approved stock copy from prepared content inside the existing guarded random disposable DB. No production import/approval.
2. Open the real full-model route; require one owned saved draft, correct grade/paper/blueprint task count, no provider/quota usage.
3. Verify the default header and automatic marks; edit writing-item text and font size; change Page Setup duration/marks.
4. Save using the real action; inspect persisted settings and unchanged original source/answer structures.
5. Edit/save the default header again; require a new server timestamp (repeat-save coverage).
6. Open the saved list and follow the draft link; verify header/text survive, opening does not write, and mobile controls do not widen the viewport.
7. Invoke the download control and require the access-checked print callback. Generate a real Chromium PDF using print CSS; extract its text to check the saved English header/text and exclusion of full suggested writing answers and editor controls. Capture a first-sheet screenshot.

Additional coverage: actual stale-tab save conflict/no-overwrite; create/save/apply/reopen Smart and Dynamic templates, require default-header exclusion and successful return to default; a second real Credentials teacher receives 404 for the first teacher's owned draft; bank records remain byte-for-byte unchanged.

## Bug found and fix

EnglishLegacyBuilder sent a new client-clock `updatedAt` for each save, while `saveEnglishPaper` requires the exact last persisted server timestamp for optimistic concurrency. This could reject the first save and prevent the normal edit/save/reopen flow.

The client now sends the original server token, advances its ref only after a confirmed response with a new server token, and retains real concurrent-tab rejection. No source-question mutation, backend concurrency relaxation, or quota change is needed. Unit regressions cover first/repeated saves, no mutation of initial draft/source tasks, busy guarding and failed/uncertain save behavior.

The first full browser run also exposed disabled custom-header schema placeholders leaking into Page Setup (e.g. 50 marks on a 100-mark paper). The legacy adapter now applies only an enabled custom header; a disabled header uses neutral base settings so class/subject/total derive from the selected paper. Saved owner settings and enabled custom templates remain authoritative; absent duration stays unspecified rather than inventing an official exam time.

## Running / evidence

`node scripts/authenticated-browser-check.cjs` runs the new workflow after real TEACHER login. The parent harness accepts only its existing loopback disposable DB target, creates a fresh random DB, starts the built app with an allowlisted environment (no provider/payment/blob credentials), blocks external browser traffic, and tears down server/browser/database.

Optional browser tools and Chrome setup are in `.github/workflows/security-checks.yml`. CI retains `.cache/english-authenticated-flow/` as a short-lived artifact: synthetic PDFs, first-sheet screenshots and `results.json`. No secrets/session cookies/passwords/connection URLs are emitted. Prepared question content is used only as disposable fixture content, not represented as new production approvals.

**Limits:** Chromium emulated mobile is not a physical phone. The OS Save-as-PDF dialog, physical printer, duplex alignment, actual paid-provider completion, independent question/answer correctness review and authenticated production-user account actions are not verified by this suite. Generic QbBuilder item-text overrides are tested; this is not a claim that every passage/subitem/answer has a dedicated structured editing control.

Execution results and any live deployment receipt are recorded in the PR after the checks complete; this document describes coverage, not a claim that a pending run has passed.
