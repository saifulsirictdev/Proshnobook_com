# Latest-64 junior Paper 2 owner approval

## Authorization and boundaries

The owner explicitly requested seamless preparation (without advertising the technical AI fallback) and approval of the latest drafts. This release is limited to **64** `junior-paper2-expansion-01` atomic groups: 32 Class 6 and 32 Class 7 Paper 2 groups. No other Pending/Rejected records are eligible. The historical 1,144-target release must not be replayed.

Approval records identify owner authorization, not independent teacher review or official-board certification. Suggested answers and provenance remain intact; use-before-print review remains visible. Including the baseline, each junior item has **5 authored sets**, not 50. Random assemblies/rotations are not new authored stock.

## Narrow operational helper

`node scripts/english/release-junior-expansion.cjs manifest` is local/read-only.

Manifest SHA-256: `980e288a9823e3d9a8654ec516213c222c632d81ab2ef4622e50efbcc8f52753`.

With the existing secure production database environment (do not copy credentials into chat or Git):

1. `node scripts/english/release-junior-expansion.cjs preview` — reads exactly 64 candidates and guards the 1,584 prior approved rows.
2. Set `JUNIOR_ENGLISH_DIGEST` to the above digest and `JUNIOR_ENGLISH_ACK=APPROVE_LATEST_64_JUNIOR_GROUPS_V1`, then run `node scripts/english/release-junior-expansion.cjs approve`.
3. `node scripts/english/release-junior-expansion.cjs verify` — reads real stored values and validates 40 assemblies for each junior grade, 50 marks, 5 groups/item, zero provider calls.

Missing candidates are imported Pending, then only exact frozen Pending targets are approved by compare-and-swap in a Serializable transaction. Existing identical Approved targets are preserved. Rejected/reopened/changed records, missing/revoked historical stock, manifest mismatch or concurrent changes stop the transaction. A successful audit receipt makes repeats no-ops; revocation cannot silently be undone. Old 1,584 approved rows are never written and their raw before/after values are checked. Unrelated records are never selected for writes.

The helper is **not** part of `package.json`, a server route, a workflow trigger or a permanent build hook. Execute once via a deployment-specific command in the existing production environment; keep the saved project build command `npm run build`. Deployment logs may include bounded counts/digests/authorization metadata, never secrets, prompts, provider bodies, or question text. Build/deploy success alone is not evidence of DB approval: retain the explicit `JUNIOR_ENGLISH_APPROVAL_VERIFIED` and `JUNIOR_ENGLISH_AUTO_MODELS_VERIFIED` receipts.

## Preparation presentation

English Auto Model and topic setup opt into neutral popup branding. The bank-first/missing-stock-only fallback, StrictMode request reuse, auth, quota, locks, validation, draft recovery, and success-only redirect are unchanged. No fake elapsed percentage, silent retry, or completed-work claim is introduced. User-visible errors use preparation terminology while retaining actual failure/recovery and daily-limit information. Server diagnostics and ADMIN provenance are not altered.

## Validation

New tests cover frozen scope, read-only preview, exact consent, preserved approvals, owner audit attribution, idempotency, rollback/CAS, tamper/rejection/revocation guards, and actual stored-value model validation. Presentation tests cover neutral branding and preservation of error/quota/recovery content.

Production execution status is recorded in the PR release receipt after verification, not inferred from this document.
