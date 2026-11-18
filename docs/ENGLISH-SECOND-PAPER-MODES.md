# English 2nd Paper: Question item / Auto model test

## Requested flow
For supported classes 6–12 (including SSC/HSC grouped category aliases and Bangla/Grammar subject labels), selecting English 2nd Paper now shows exactly two real mode choices:

1. **Question item** — immediately lists numbered grammar/writing tasks for that class's existing second-paper blueprint. There is no Topic-wise → Lesson/Question item intermediate step and no Lesson selector. Selecting an item opens native English setup with that item preselected; writing alternatives/topics can be customised there.
2. **Auto model test** — opens automatic preparation with the selected class **and paper=2**. Server-owned template selects all grammar/writing tasks and supplies editable practice writing prompts. Existing approved-bank-first / AI-for-missing-parts generation creates the paper. The complete paper opens for question/answer review and manual edits first; a confirmed save continues to Page Set-up.

No first-paper screenshot grouping is reused for second paper. No first-paper lesson catalog is changed. Other subjects, Job/Admission English and append-to-paper behaviour remain unchanged. Changing class/subject/mode resets the selected item, preventing stale first-paper selections entering a second-paper request. Item URLs are whitelisted against the grade/paper template.

## Existing information used, not newly asserted official rules
All seven supported grades already have second-paper practice blueprints in `lib/english/blueprints.ts`:

| Classes | Item count | Existing template total | Sections |
| --- | --- | --- | --- |
| 6 | 8 | 50 | Grammar 30 + Writing 20 |
| 7 | 8 | 50 | Grammar 30 + Writing 20 |
| 8 | 8 | 50 | Grammar 30 + Writing 20 |
| 9–10 | 12 | 100 | Grammar 60 + Writing 40 |
| 11–12 | 16 | 100 | Grammar 60 + Writing 40 |

Class 6 has identification of parts of speech; Class 7 has individual-sentence narration; Class 8 has passage narration; SSC has its own twelve-task set and HSC its own sixteen-task set. Existing marks, count, word-limit and alternative-task validation are retained, not homogenised across classes.

**Information gaps to report:** no item/marks template is missing for classes 6–12 in the repository. However, these are existing user-supplied practice references; current official circular/year applicability has not been independently verified. Classes 1–5 have no supplied English blueprint here and have not been invented. Catalog/blueprint presence is not evidence that production question stock is complete or that a provider is configured.

## Automatic generation safety
- `prepareEnglishFullModel` accepts only grade 6–12 and paper 1 or 2 (default remains 1 for legacy requests). Browser-provided marks, arbitrary tasks, writing or extra properties are rejected.
- Second-paper templates have no required seen/poem/story source groups, so they do not call the first-paper-only approved-textbook-source lookup and do not request irrelevant seen extracts. Unexpected supplied source keys are rejected before bank/provider access.
- Full writing prompts and a valid default writing alternative are chosen server-side, with original per-task word counts where specified. These are practice prompts, not mandated syllabus topics.
- Existing generation auth, quota, lock, partial recovery, private draft ownership, bank validation and AI output validation remain in charge. No new direct AI call, approval, publication, category/schema or wallet bypass.
- The auto-entry component is keyed by class and paper so cached request/effect replay cannot carry a first-paper request into a second-paper screen.
- The private review-before-layout stage now supports full papers from either paper; incomplete/failed generation never opens a supposedly complete model.

## Validation
73 focused tests pass across English actions/generation/blueprints, both mode flows, second-paper task differences and totals, render/route selection, no second-paper source lookup, second-paper auto requests and review route, Class 6/7 screenshot group preservation, Job/exam/non-English regressions. `git diff --check` passes.

Local full application typecheck/build remains blocked by an ungenerated Prisma Client in this sandbox (engine download host not allowed); it is not claimed successful. No live production import, paid generation, provider request or database publication was performed for these tests. CI/deployment checks must evaluate this branch separately.
