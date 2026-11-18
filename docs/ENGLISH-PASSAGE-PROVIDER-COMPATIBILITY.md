# English provider passage schema compatibility

## Report
Production screenshot: INVALID_OUTPUT for information,true-false,summary with `JSON schema mismatch: passages.0 (unrecognized_keys)`. Four complete groups were recovered; the full invalid paper was not saved. The screenshot does not show the unexpected key names, so the exact provider payload/cause is not claimed captured or reproduced verbatim.

## Shared fix (grades 6–12, both papers)
The shared English generation prompt previously illustrated passages only as an empty array, despite instructing the provider to generate original unseen text. It now explicitly specifies each passage as exactly `{key,text}`, explains linkage to task.passageKey, and forbids added passage keys. Grammar/writing-only empty-passage rules remain unchanged.

At the provider boundary only, permit and remove bounded decorative metadata fields `title`, `source`, `reference`, `type` when null or a string of at most 1000 characters. Do not remove arbitrary unknown fields. Objects, arrays, numbers and oversized metadata still fail. Key/text are never inferred, rewritten, renamed or replaced; an ID cannot silently become a passage key. Heading content that is necessary to comprehension must be included inside text per the prompt, not only metadata.

Strict persisted output/draft schemas stay unchanged. Supplied-booktext rewrite guards, task IDs/counts, answers, passage linkage, unused/duplicate passages, semantic/reference checks, existing quota/auth/recovery and publication behaviour remain unchanged. No extra paid retry is introduced. This addresses the known structural problem across the shared pipeline; it is not a promise that an external AI provider can never return invalid questions again.

## Tests
83 focused tests pass. Coverage includes all 14 grade/paper prompt/normalisation combinations, immutable raw payloads, strict rejection of unrecognised content fields/missing keys/wrong types, saved-schema strictness, mocked provider end-to-end unseen summary requests for grades 6–10, missing-answer rejection and forbidden supplied-booktext rewrite. No real paid provider call or production generation was performed. Existing recovery drafts are not overwritten or automatically regenerated. Local full typecheck remains blocked by ungenerated Prisma Client; no errors reported for the edited generation file. `git diff --check` passes.
