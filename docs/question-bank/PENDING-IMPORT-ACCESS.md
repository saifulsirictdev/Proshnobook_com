# Scoped Pending-only agent import

## Deployment status
Implemented locally; NOT deployed or configured, and no live import is claimed. All BGS 1280 records still require an actual authorized Pending save. No Gmail session, ADMIN impersonation, database credential extraction or role change is used. No database migration is required.

## Capability boundaries
`POST /api/admin/pending-import` is disabled (401) unless `PENDING_IMPORT_GRANT` is configured. It accepts a separate random bearer capability whose SHA-256 hash is configured, not the bearer itself. The grant pins explicit registered batch IDs AND their full current digests, with an issuance time and expiry (maximum 24 hours; helper defaults to one hour). It cannot accept arbitrary question content, edit existing questions, approve, publish, change accounts, read wallets, or access other batches. Preview returns answers only for the explicitly granted batch. All responses are no-store. Requests are bounded to 4096 bytes, and no cookie/CORS login is offered.

Save requires the matching digest and explicit limitations acknowledgement. The helper requires a fresh matching local preview first. This is owner-delegated import authorization, NOT a claim that an independent teacher has reviewed the questions. Existing website ADMIN preview/save/approval remains unchanged.

Imports use existing deterministic question IDs, chapter-scoped stem deduplication, Serializable transactions, retry-on-conflict and the same `preparedimport:v1:<digest>` receipt namespace as the ADMIN workflow. Every new question has `approved:false`. Audit identifies `pending-import-grant:<grant ID>`, never impersonates the owner, and retains provenance, limitations, IDs and counts. Existing approved questions are skipped, never demoted or overwritten. A receipt's existence is not proof that all questions remain Pending later: the owner may subsequently approve them.

## Activation runbook (operator/agent, no credentials in chat)
1. Deploy the reviewed code and BGS registry on the authorized current branch through the normal release process. Do not activate a grant on a deployment lacking the pinned batches.
2. Generate a fresh scope immediately before use, e.g.:
   ```sh
   node scripts/question-bank/pending-import.cjs prepare \
     class6-bgs-ch1-draft-v1 class6-bgs-ch2-draft-v1 \
     class6-bgs-ch3-draft-v1 class6-bgs-ch4-draft-v1 \
     class6-bgs-ch5-draft-v1 class6-bgs-ch6-draft-v1 \
     class6-bgs-ch7-draft-v1 class6-bgs-ch8-draft-v1
   ```
3. Securely configure `PENDING_IMPORT_GRANT` in the serving production deployment from `.cache/pending-import/grant.json` (hash/scope only). Vercel environment changes need a new deployment; do not redeploy an old registry accidentally. Never send `.cache/pending-import/token` to Vercel, chat or Git. The local helper keeps it in a 0600 ignored file in a 0700 directory.
4. Run `node scripts/question-bank/pending-import.cjs preview`; inspect `.cache/pending-import/preview.json`, including limitations, solutions and digests.
5. With the owner's standing Pending-import authorization, run:
   ```sh
   ACKNOWLEDGE_DRAFT_LIMITATIONS=yes node scripts/question-bank/pending-import.cjs save
   ```
   The helper targets only `https://proshnobook.com`, disallows redirects, saves each completed batch receipt immediately, and stops on failures. For uncertain responses, retry the same digest and inspect the server receipt; do not claim unsaved batches succeeded.
6. Verify inserted/skipped counts and Pending state through the existing authorized review UI before reporting success. Keep nonsecret receipt evidence with the release. Approval/publication remains with the owner.
7. Remove `PENDING_IMPORT_GRANT` and redeploy after use; securely remove local bearer/preview files when no longer needed.

**Revocation caveat:** Vercel immutable older deployments may retain their old environment until the grant expires. Removing/rotating the current environment alone does not revoke those copies. Protect old deployment URLs, use short expiries and, for emergency revocation, disable access to all deployments carrying the grant. Never claim immediate global revocation merely from an environment edit. Expiry is checked again inside the import transaction.

If the execution environment cannot reach the production API, the helper cannot perform the import from there. Deploying the endpoint or setting an environment variable is not an import. Never work around this by weakening Google/ADMIN authentication, creating an unrestricted import route, or exposing database/authentication secrets.
