# Auto Model: inspect, explain, rotate, then generate

## Implemented in this working tree

- **Explicit zero-AI preflight**: a teacher must request a read-only stock/coverage inspection before the create button is enabled. It validates the same class aliases, exact subject, selected topics, visible-question policy and 10,000-row bound as preparation. It never reserves a lease/quota, calls a provider, writes drafts or returns question bodies/answers.
- **Explainable preparation**: show full marks, duration, actual stock usable in this model, precise planner shortfall, section marking/choice counts, and per-topic availability/selection/gaps. A selected topic with no planned question is explicitly labelled instead of implying universal topic coverage. Stock is checked again at creation because other changes can invalidate an inspection.
- **No stale inspection reuse**: topic/mark/history-setting changes invalidate the displayed report and disable creation until a matching inspection succeeds. A late response for another selection cannot authorise the current selection.
- **Best-effort non-repeat rotation**: up to 500 recent IDs per class/subject/variant in this browser. If a completely fresh model satisfies all quotas, use it. Otherwise reuse stock before invoking AI; novelty must never manufacture a shortage. No cross-account/new-device non-repeat guarantee. History is stripped from saved syllabus settings so private IDs from older papers are not carried into shared paper metadata.
- **Real checkpoint feedback**: preparation shows only the number of private questions actually reported saved, not an invented scan percentage or a claim that answers are certified.
- Existing syllabus marking validation, same-topic/section AI gap batches, private pending rows, registered quotas, checkout/access control and English source-linked bank-first assembly remain intact.

## Verification

`508/508` targeted tests pass, including the restored Biology 105-test regression set and Auto Model stock/preflight/history interaction tests. Full repository `npm run typecheck` and `git diff --check` pass. Actual schema types were generated with Prisma `--no-engine` because the sandbox cannot download Prisma runtime engines. No production build, database runtime connectivity or live paid AI success is claimed. Raw evidence is in `auto-model-all-subjects/upgrade-verification.tap` and `upgrade-typecheck.txt`.

## Important: Biology is not falsely marked complete

The current checkout initially contained only the Biology starter material, unlike the previously verified session state. The complete prior working snapshot was downloaded from Drive, checked against the independently fetched remote size/MD5, ZIP CRC and every payload SHA256, and restored **only for Biology and the previous all-subject Auto Model implementation/test harnesses**. Existing unrelated Chemistry/Physics work was not overwritten. A separate before-change backup was uploaded and independently checked before restoration.

Recovered Biology: **3,840/4,480 canonical answered drafts**, chapters 1–12; **640 still remain**, specifically chapter 13 and chapter 14, each 200 MCQ + 50 CQ + 70 SQ. These 640 have **not** been authored/completed in this turn. The complete secondary chapter texts were read and a correction-aware coverage/acceptance plan saved at `question-bank/ssc-biology/remaining-work-plan.json`; research/outline rows do not count as questions. Completion, teacher certification, independent review, publication and import flags have not been fabricated.

The original chapter 11/12 Git objects are absent from this checkout. Historical tests still assert their original recorded hashes; when an object is absent, an explicit helper verifies bytes against the independently verified recovery archive's manifest. This is recovery evidence, not a claim that the missing Git history was restored.

## Deployment and persistence

No production mutation, content import/approval/publication, paid AI request, Git push/merge or deployment performed. Work stays on `arena/25610643-proshnobook-com`. Backup receipts record archive identity and independent remote verification; caches and ZIP binaries are excluded from committed content.
