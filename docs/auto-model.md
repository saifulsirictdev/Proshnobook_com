# Chapter / Auto Model — first implementation

## Scope and status

Implemented inside the existing `/question-builder` starter, preserving the existing NCTB/database class and subject lists. Academic non-English selections now choose **Chapter** or **Auto Model**. Auto Model then chooses **MCQ** or **CQ**. Changing class or subject resets both choices. Chapter retains the existing preparation/bank workflow and shared question-type selector. English, Admission, Job, and append-to-an-existing-paper keep their existing workflows.

**This is not an all-subject model release.** The only registered full-model blueprints are SSC/Class 9–10 **general mathematics**, based on the user's supplied example paper. Other academic non-English subjects show the two new choices but explain that their own full-model blueprint is not ready and disable model generation. Their Chapter workflow remains available. Higher mathematics is deliberately not treated as general mathematics.

The practice notice is shown before generation. Neither blueprint claims to be the latest official board format or a universal pattern for every grade/year/subject.

## Registered practice blueprints

| Variant | Offered | Answer | Marks | Time |
|---|---|---|---|---|
| MCQ | 30: algebra 12–15, geometry 10–13, trigonometry exactly 2, mensuration exactly 1, statistics exactly 2 | All 30 | 30 × 1 = 30 | 30 minutes |
| Written (`CQ`) | 8 CQ: two in each of four divisions; plus 15 short answers | 5 CQ, including at least one from each division; any 10 short answers | 5 × 10 + 10 × 2 = 70 | 150 minutes |

Written divisions: algebra; geometry; trigonometry/mensuration; statistics. Classification uses the **exact existing general-math chapter titles** from `lib/nctb-data.ts`; unknown or ambiguous chapter strings are not guessed. The CQ contract is three nonempty subparts, ক/খ/গ, with marks 2/4/4; ordinary legacy four-part CQ is excluded from this model rather than printed with an incorrect marking scheme. Missing explicit marks are assigned the selected practice blueprint's 2/4/4, not claimed as verified original source marks.

## MCQ distribution update — owner-supplied document

Source: owner's Drive file `1wqyrpfLasmEaFSgh_iNd17fhZMly3P62`,
“এসএসসি সকল বিষয় মানববন্টন ২০২৭.pdf”, PDF page 12 / printed page 14,
subject code 109. The page was rendered and visually read, not inferred from the
corrupted extracted Bengali. This is the owner's requested navigation/practice
contract, not independent verification of a board publication.

- Owner refinement: the last five now require **2 trigonometry + 1 mensuration +
  2 statistics**, not any five from a shared pool. This is the owner's additional
  practice-paper rule, not a separate minimum attributed to the source PDF.
- Eligible, deduplicated stock is split into five MCQ pools: algebra, geometry,
  trigonometry (exact catalog chapters 9–10), mensuration (chapter 16), and
  statistics (chapter 17). Written divisions remain unchanged.
- Choose randomly among **feasible** splits 12/13, 13/12, 14/11 or 15/10
  (algebra/geometry), plus the fixed 2/1/2. Chapter rotation remains within
  each pool. Diagram-budget feasibility and reservation cover all five pools,
  so spare plain statistics cannot replace a required illustrated mensuration item.
- Missing compatible questions in any quota fails closed, even if another
  division has abundant stock. No cross-division top-up or partial IDs.
- The starter/preparation summary shows the distribution. Existing 30 marks,
  30 minutes and answer-all-30 instructions are unchanged.
- Editor validation also detects a 30-question paper with the wrong division
  counts and displays the existing incomplete-model draft warning. Previously
  saved papers are not silently regenerated; ordinary Chapter papers and the
  written CQ + SHORT model are unchanged. Existing blueprint ID is retained so
  old model drafts also receive the new validation when opened.
- Regression coverage includes every split, skewed pools, deduplication,
  incompatible rows, fixed-component shortages, rejection of legacy combined-only
  papers, five-pool diagram reservation, server action IDs-only boundary,
  edited-paper warnings and checks against the existing 5,750 canonical local
  records. Canonical tests are read-only, not a live stock/import/approval run.

The prior production approval receipt records the policy verified at publication
time; it is historical evidence, not proof of deploying this later 2/1/2 change.
The updated local canonical+supplement test passes 25 seeded assemblies with the
new fixed counts, unchanged algebra/geometry quotas, and the <=5 figure cap.
Existing saved papers are not rearranged automatically; noncompliant old drafts
receive a distribution warning.

### Owner-requested figure-question cap

Auto MCQ permits **at most five figure-bearing questions**, not a mandatory
minimum of three. A question with multiple inline figures consumes one slot;
figures in the answer/explanation do not count toward the question-paper limit.
Both row text and stimulus are checked. Existing detached-image/shared-stimulus
eligibility exclusions remain unchanged; images are never stripped to evade the
cap. Written CQ/SHORT models have no new image cap.

Before sampling, each feasible division split is checked for the minimum number
of unavoidable diagram questions across all three pools. Sampling reserves those
slots for later pools, so optional algebra figures cannot consume the geometry
budget. If no split fits the global cap, return a clear compatible-stock shortage
and no partial IDs. The editor also warns when an MCQ model has over five figure
questions.

**Observed local-stock limitation:** the canonical bank has 900 eligible geometry
MCQ but only **one** without a question-side figure. Even the 15-algebra /
10-geometry / 5-combined split therefore needs at least nine figure questions.
The new rules correctly reject this stock; at least four additional distinct,
approved-compatible plain geometry MCQ are needed to make that minimal split
possible (using plain algebra and plain statistics). This is local canonical
analysis, not an authenticated query of the current production DB. No existing
question content or diagrams were altered; no import/approval/deployment was done.

The owner subsequently requested **50 additional text-only geometry MCQ**.
These now live in `content/question-bank/ssc/math/geometry-plain-v1/`, ten each
for chapters 6/7/8/14/15, registered separately via
`lib/ssc-geometry-plain-batches.ts`. Local assembly using the historical bank plus
these 50 succeeds for 25 seeded runs with both division quotas and the five-image
cap. Subsequently the owner explicitly authorized approval: the scoped production
release imported and approved exactly these 50, with no conflicts. Five seeded
assemblies over 5,859 actual approved DB rows passed quotas and the <=5 figure
cap; written assembly also passed (23 items). See
`docs/question-bank/ssc-geometry-plain-live-release-receipt.json` for the receipt.
This is owner approval, not independent teacher certification. The production
assembler still reads approved DB rows only.
The one-time 5750 release remains frozen and does not include this supplement.

The one-time production release gate is deliberately **not weakened**; rerunning
it with current stock fails closed under the new rules. Historical publication
transaction tests and the disposable PostgreSQL rehearsal use an explicitly
labelled **old count-only gate test double** in
`scripts/helpers/ssc-math-historical-release-fixture.cjs` to replay prior
idempotency/approval behavior. Separate tests assert that real current-policy
preparation and assembly fail. That helper is never imported by production
selection or publication modules.

## Server selection and payment boundary

- `app/actions/auto-model.ts` authenticates a non-student user, validates the bounded selection, and rejects unsupported blueprints before any database query.
- Uses approved question stock only, matching existing category aliases and exact subject. It does not run AI, import new questions, alter stock, purchase questions, or charge accounts.
- Scans at most 10,001 matching records; more than 10,000 fails explicitly rather than making a shortage claim about a truncated bank.
- Requires an answer/explanation, a mapped chapter, and a compatible question shape. MCQ needs exactly four distinct textual choices and a matching answer key. CQ needs three valid subparts.
- Shuffles candidates and rotates through chapter buckets, avoiding duplicate IDs and normalized stems/stimuli. Whole rows are retained. Written questions are selected separately for every required division and for SHORT.
- Success returns **IDs only**, not paid question text, answers or explanations. Existing build checkout/access gates and the authorized `/api/qb/questions` endpoint still control access to question content.
- Any shortage returns per-section required/available compatible counts, no partial IDs. A failed check does not overwrite an existing browser draft. These are compatible-candidate counts, not the total count of every raw bank row.

## Diagrams and shared stimuli — explicit limitation

Self-contained CQ stimuli stay in their original question record. For Auto Model only, a self-contained stem/stimulus can include a diagram as `![description](https://host/path.png)`. The paper renderer interprets only that bounded Markdown image form and only HTTPS image URLs under the same existing image protocol policy; it does not evaluate HTML or attributes. Images stay inside the measured question block. Existing attachment image controls still work separately.

There is **no new database attachment schema or reviewed diagram-stock import** in this change. Rows with detached image/diagram/attachment metadata or known cross-row group/stimulus references are excluded, not stripped. Known text-only references to an absent external stimulus/figure are also excluded. This is a conservative compatibility check, not semantic proof that every possible natural-language dependency is detectable.

**Cross-row shared-stimulus bundle assembly is not implemented.** Such a set must not be advertised as supported or randomly split. A reviewed durable bundle contract, atomic sampling, and corresponding question/answer projections are still needed. Likewise, remote image availability is not server-fetched or guaranteed by protocol validation.

## Editor, settings and saved papers

- Optional `settings.autoModel` records the blueprint ID in existing JSON settings; no database migration is needed. Existing save/reopen and purchased-paper settings restoration carry it through `restoreSettings`.
- New model creation starts from clean defaults, sets class/subject/time/full marks automatically, and opts into the existing automatic header. Smart/Dynamic/saved header selection still takes precedence exactly as before.
- Written preview uses four CQ divisions with continuous numbering 1–8, then SHORT numbering 1–15. The instruction to answer five CQ appears once globally, not as the misleading instruction to answer both questions in every division. SHORT prints two marks each, CQ subparts 2/4/4, with no blank fourth subpart.
- Model answer-count controls are fixed to the registered structure. Content and layout remain editable. Structural edits, missing/extra questions, incompatible CQ subparts, and duplicate stems trigger a draft warning. Extra appended items remain visible in an explicitly out-of-model section rather than disappearing from the paper.
- A new ordinary Chapter paper clears the prior model marker, generated marks/time/instructions and model-specific expected/answer counts while preserving unrelated layout/header preferences. A newly generated model resets prior edits, exclusions, filters and selections.

## Verification and reproducible review

Unit/action tests: `tests/auto-model.test.cjs`. Existing starter/English/Job tests have their custom module loaders updated for the new module. A new authenticated/noindex route layout follows the existing private builder subtree guard.

Local component harness (not a production app route):

```sh
node scripts/auto-model/server.cjs
LD_LIBRARY_PATH=$PWD/.cache/chromium-libs/lib node scripts/auto-model/check.cjs
PYTHONPATH=.cache/python python3 scripts/auto-model/verify_pdf.py
```

The harness uses the **real starter, preparation UI, settings schema, model section builder and paper renderer**, with explicitly synthetic fixture questions and mocked navigation/server-action transport. Desktop 1280px and mobile 390px checks cover Chapter, model summary, subject reset, unsupported-blueprint blocking, shortage/draft preservation, 23-question written layout, diagrams, numbering, local edit/save/reopen, 30-question MCQ, and clean creation of a different model. PDFs check A4 dimensions, numbering, marks, diagrams in page bounds, no editor/answer leakage, and equal desktop/mobile printed text.

Evidence: `docs/proof/auto-model/{starter,review,written,mcq}-{1280,390}.png`, four PDFs, `browser-results.json`, `pdf-results.json`.

Final validation in this workspace: full regression **1,133/1,133 passing**, focused affected suites **71/71 passing**, full TypeScript check passing, and `git diff --check` passing. The initial full run caught the missing authenticated/noindex layout on the new route; that guard was added and the full run repeated successfully. Both browser sizes and all four two-page A4 PDFs passed the checks above. Local Prisma was generated for type/mocked-test use only; these results do not establish real database runtime connectivity.

**Evidence boundary:** synthetic fixtures are not reviewed question stock or an official paper. Browser save/reopen proof is localStorage only, not an authenticated database roundtrip. Server action/database behavior is mocked in automated tests; a real database, production stock sufficiency, checkout transaction, deployed PDF workflow, physical printer and physical-device rendering have not been proved. No production import or deployment is performed by the harness.

## Remaining work

1. Register separately verified blueprints for each other class/subject (do not copy math divisions).
2. Review/import sufficient approved compatible math stock, including source-faithful diagrams and three-part 2/4/4 CQ where appropriate. This change does not claim that the live bank has enough questions.
3. Define and test cross-row shared-stimulus bundles before enabling them for automatic selection.
4. Perform authenticated integration testing against a real database, including checkout, save/reopen, and PDF, before release.
