# English 1st Paper: remaining-grade rollout

## Implemented in this phase
- The common ADMIN import/review panels support exact grades 6–12, each using its existing grade-specific practice blueprint.
- Preserve existing catalog categories: Class 9 contains separate grade 9/10 selections; Class 11-12 contains separate grade 11/12 selections. Do not add/rename categories.
- Individual/bulk Pending import registries and bulk approval are grade-scoped. A grade 7 request cannot import/approve grade 6 content. Existing Class 6 identities and digests remain unchanged.
- Existing shared user item/full-model preparation, processing popup and direct setup remain intact. No AI fallback, automatic approval or cross-grade content substitution.

## Not complete
Prepared authored stock is still only Class 6. `preparedEnglishItems(7..12)` intentionally returns empty rather than copying Class 6. Other grades show their required item/mark coverage and missing-content state. This is infrastructure, not a claim that all grades are content-ready. No production import or approval was executed.

## Drive source inventory checked during this phase
Read-only Drive search returned these source files; folder ancestry identifies their grade:

| Grade | NCTB source candidate | Drive ID | Bytes | Review status |
|---|---|---|---|---|
| 7 | ২০২৬ — English For Today.pdf | 1L1W-XCn_grZior6yOaoSkJ9eWviNIYP7 | 32687361 | Text extraction blocked by 25 MB connector cap; download/local extraction/OCR and edition verification still required |
| 8 | ২০২৬ — English For Today.pdf | 1UQ09BSs--YQ-6ZwVANXuqgujrPn4WWNB | 44210158 | Located; not read/verified |
| 9–10 | ২০২৬ — English For Today.pdf | 1XLk9TBYh1R-jYrpFzjXwIv51239u4Sf4 | 39473358 | Located; not read/verified |
| 11–12 | ২০২৬–২৭ — English for Today.pdf | 1YQwbuKcDdRWUYTMFUMvRhReYu35iAW73 | 64637181 | Located; not read/verified |

Additional Class 7 resource: `Ques. 1-4 Seen Comprehension - Class 7 English 1st.pdf`, ID `1CnWGL8_8bWQQJ0XQIVXkXckV8uT8AkC-`, 11332812 bytes; located, not read/verified. Listing names or folder ancestry does not verify a book's edition, distribution or answer accuracy.

## Next content steps
Class 7 first, then 8, SSC 9–10 and HSC 11–12. Extract the correct textbook, verify the configured distribution against applicable references, prepare distinct Seen/Unseen groups and every remaining item with answer keys/provenance, validate selected and full paper assembly, and register the authored drafts in the grade-specific registry. Import remains Pending until ADMIN review/approval. No forbidden Class 6 CP(16) download was retried.

## Original setup builder restored
The English build entry now mounts the original `QbBuilder` rather than the separate English setup/editor screen. A typed adapter retains each passage-linked group, tables, questions, keys and blueprint marks/numbering; the original pagination/settings/undo/redo and print machinery are reused. English settings, edits and exclusions are saved into the owned English draft (`builderSettings`), not the general `qb:selected` or `qb:settings` storage. Existing saved drafts remain valid and are not deleted. The original EnglishEditor source is retained for compatibility but is no longer mounted by the build route. General question exchange is intentionally blocked for passage-bound sets; selecting a replacement English item remains a separate selection operation. Print rechecks owned draft access rather than treating English set IDs as billable general Question IDs. This does not alter general-paper wallet or purchased-paper checks.
