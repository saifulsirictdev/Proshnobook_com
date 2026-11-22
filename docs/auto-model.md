# Chapter / Auto Model — first implementation

## Scope and status

Implemented inside the existing `/question-builder` starter, preserving the existing NCTB/database class and subject lists. Academic non-English selections now choose **Chapter** or **Auto Model**. Auto Model then chooses **MCQ** or **CQ**. Changing class or subject resets both choices. Chapter retains the existing preparation/bank workflow and shared question-type selector. English, Admission, Job, and append-to-an-existing-paper keep their existing workflows.

**This is not an all-subject model release.** The only registered full-model blueprints are SSC/Class 9–10 **general mathematics**, based on the user's supplied example paper. Other academic non-English subjects show the two new choices but explain that their own full-model blueprint is not ready and disable model generation. Their Chapter workflow remains available. Higher mathematics is deliberately not treated as general mathematics.

The practice notice is shown before generation. Neither blueprint claims to be the latest official board format or a universal pattern for every grade/year/subject.

## Registered practice blueprints

| Variant | Offered | Answer | Marks | Time |
|---|---|---|---|---|
| MCQ | 30 | All 30 | 30 × 1 = 30 | 30 minutes |
| Written (`CQ`) | 8 CQ: two in each of four divisions; plus 15 short answers | 5 CQ, including at least one from each division; any 10 short answers | 5 × 10 + 10 × 2 = 70 | 150 minutes |

Written divisions: algebra; geometry; trigonometry/mensuration; statistics. Classification uses the **exact existing general-math chapter titles** from `lib/nctb-data.ts`; unknown or ambiguous chapter strings are not guessed. The CQ contract is three nonempty subparts, ক/খ/গ, with marks 2/4/4; ordinary legacy four-part CQ is excluded from this model rather than printed with an incorrect marking scheme. Missing explicit marks are assigned the selected practice blueprint's 2/4/4, not claimed as verified original source marks.

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
