# SSC / HSC starter subject groups

## Scope

Owner-requested navigation: SSC (নবম–দশম) or HSC (একাদশ–দ্বাদশ) →
সাধারণ / বিজ্ঞান / মানবিক / ব্যবসা শিক্ষা → matching subjects → existing workflow.

- Common/shared subjects live under General, not repeated in each stream.
- SSC uses its existing unpapered subject catalog; HSC uses its own exact first/second-paper catalog strings.
- Subject IDs, chapter strings, category aliases, stock, paid access and server selection contracts are unchanged. The selected navigation group is not an authorization role or DB category.
- No subject is invented. Unknown DB-only names are not guessed into a stream; known SSC English aliases remain under General. Add explicitly reviewed aliases/mappings in `lib/academic-subject-groups.ts` when extending stock.
- General includes shared elective drawers (e.g. agriculture/home science); general science is offered under SSC humanities/business. HSC economics is shared by humanities/business; statistics is mapped to the three streams. These are site navigation groupings, **not a claim of a current official compulsory/fourth-subject/marks blueprint**.

## State and compatibility

Before a group is selected the subject dropdown and navigation are disabled.
A class/category change clears the group and all downstream selections. A group
change clears subject, chapter/subgroup, question type, English mode/item and
Auto Model variant. Navigation also rejects an out-of-group/stale subject.

Class 1–8, Admission and Job retain their prior selectors. Existing append flow
retains its query/paid access behavior, with SSC/HSC subject filtering applied.
English resumes its existing Topic-wise / Full Model Test flow after subject
selection; no English template/content changes. SSC general mathematics Auto
Model remains available via General → গণিত, with its existing four CQ divisions
and SHORT section. This feature does **not** enable unimplemented HSC/non-math
Auto Model blueprints.

## Validation

- 43 focused tests PASS: nine new grouping/state/navigation tests plus the existing starter, English, Job, preparation and Auto Model suites.
- TypeScript typecheck PASS; local Prisma client generated in engine-less/type-only mode (no production binding or DB activity).
- Browser checks PASS at desktop 1280px and mobile 390px using real QbStart in the isolated component harness: all four groups for SSC/HSC, subject isolation, reset, English modes, SSC CQ+SHORT summary and unsupported HSC model blocking; no page errors or horizontal overflow.
- Evidence: `docs/proof/subject-groups/{starter,hsc-starter}-{1280,390}.png`, `browser-results.json`.
- Checker: `scripts/auto-model/check-subject-groups.cjs`, wired into the existing CI browser step. Uses `CHROMIUM_EXECUTABLE_PATH` in CI, packaged Chromium as a local fallback.
- The older Auto Model browser scenario now explicitly selects General after SSC and tests an unsupported common subject (ICT) rather than selecting a subject from a different group.

Release scope: selector code only. No database changes or question import/approval.
The owner authorized production deployment after local validation. GitHub PR/CI
and Vercel deployment status are recorded with the release, not inferred from
these screenshots. Browser evidence here is a local UI harness, not an
authenticated live workflow.
