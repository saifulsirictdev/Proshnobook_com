# Chapter 6 — mixed-source questions and authorized board-style supplementation

## Revised owner instruction

After the source-only checkpoint, the owner explicitly instructed: first search the internet for questions; if the target still cannot be filled, create questions like board questions. This supersedes the earlier **no authored supplementation** restriction for fulfilling this chapter's target. It does **not** authorize fabricated board/year labels, passing authored questions off as source questions, approval, production import or deployment.

The immutable eleven-question source-only checkpoint remains in `chapter-6-source-v1/`; its original null answers/marks and partial counts were not overwritten. The new completed numerical target is a **separate mixed-origin draft** in `chapter-6/`.

## Exact totals, not a claim of 800 original board occurrences

| Origin of QUESTION text | MCQ | CQ | SQ | Total |
| --- | ---: | ---: | ---: | ---: |
| Original supplied textbook, visually compared | 6 | 2 | 3 | 11 |
| Selected complete short web-source questions | 8 | 1 | 6 | 15 |
| Explicitly authored board-style practice | 486 | 197 | 91 | 774 |
| **Combined draft target achieved** | **500** | **200** | **100** | **800** |

All explanations and written solutions are **assistant-authored**, not copied/misrepresented as source answers. The eight web MCQ source keys were observed and independently checked. Textbook MCQ keys are newly solved, not keys printed on the inspected source pages. No teacher certification is claimed.

There are no verified actual board/year attributions among the 26 counted source questions. A textbook filename/year or a website's title is not an examination attribution. Authored items explicitly say `নিজস্ব বোর্ড-ধাঁচের অনুশীলনী; আসল বোর্ড প্রশ্ন নয়` and never carry a fake board/year. Actual board-short-tag formatter work is not necessary to label these sources and remains separate.

## Internet search before supplementation

A targeted Bengali SSC chapter6 search returned textbook solutions, MCQ lists, CQ lists and suggestions. Pages were fetched, not merely search-title copied:

1. [Itmona chapter6 MCQ](https://itmona.com/ssc-chemistry-mcq-suggestion-pdf-download-chapter-6/): inspected article chunks2–3, retained questions1,2,5,6,7,12,19,30 with all four options. Only112 whitespace-delimited words of question/options excerpted; no article explanations copied. Incomplete stimuli/options and incorrect keys elsewhere were not imported. Original distractor spellings `Iidometry` and `Cromatography` retained, not silently corrected.
2. [Shomadhan CQ](https://shomadhan.net/ssc-chemistry-chapter-6-srijonshil/): inspected chunks0–1; question5 retained with original four subparts and source1/2/3/4 marks.57 words excerpted, no article solution copied. A textbook-duplicate question was not counted again. Image-based questions were not taken without their actual image. Other encoding-damaged questions were not guessed.
3. [Edulecture suggestions](https://edulecture.com/এসএসসি-রসায়ন-সাজেশন-pdf-download/): chapter6 section in chunk0; six short questions retained (33words). Promotional stars omitted; no typo `ভুল সংকেত` prompts imported. Article title2026 is not a board/year tag or verified syllabus.
4. Notekhata and WebSchool pages were fetched but extraction returned mostly template/navigation instead of reliable complete questions. Search snippets alone were not used as canonical question text.
5. The Odhikar result failed to fetch; not counted or copied.

This is **bounded research, not an exhaustive internet or Drive search**. No assertion is made that only26 questions exist, that all available sources were exhausted, or that the remaining774 are a proven global source shortage. The owner-authorized supplementation fills the target after collecting the reliable selected source material. The49 prior Word-derived board candidates remain unverified and excluded.

The fixed web intake and acquisition notes are in `content/question-bank/ssc/chemistry/chapter-6-web-intake.json`. Full third-party articles and their answer sections are not copied into the repository/backup.

## Scientific and answer boundaries

- School exercise atomic relative masses: H1,C12,N14,O16,Na23,Mg24,Al27,P31,S32,Cl35.5,K39,Ca40,Fe56,Cu63.5,Zn65. All relevant problem values are stated.
- Exercise `NA≈6.02×10^23 mol−1`; exact SI value `6.02214076×10^23 mol−1` distinguished in conceptual answers.
- `STP=0°C,1atm`; ideal-gas molar volume22.4L/mol. Not applied to solids/liquids or every pressure convention.
- Ionic compounds use **formula units**, not actual discrete molecules, in authored questions/solutions. The textbook's CaCO3 `অণু` wording is retained in its original question with a separate scientific clarification in the authored explanation.
- The Shomadhan NO question's answer uses exact mole ratios: O2=20/32=0.625mol, N2 consumed17.5g, **excess N2=12.5g**, not the website's prematurely rounded/arithmetic-error12.32g. The original question is unchanged; the new answer explicitly assumes theoretical completion. No practical recipe or claim of quantitative NO yield in real equilibrium conditions.
- Theoretical complete-conversion reaction exercises, including NH3 cases, explicitly state their modeling assumption; real equilibrium yields are not asserted.
- Numerical results use up to five decimal places. Full rational arithmetic is used in construction; no source values are silently rounded/changed.
- CQ1/2 textbook marks and SQ2marks are the existing application practice convention, **not** observed source marks or independently verified Chemistry examination-year policy. CQ web question5 actually printed1/2/3/4. Physics/Math quota policy was not copied.
- Solution preparation is conceptual, with trained-teacher supervision/PPE and acid-into-water safety notes, not unsupervised practical instructions.

## Authored family/variant disclosure

These are800 unique normalized question stems, **not800 independent concepts**. Numerical variants are intentional and recorded:

- MCQ486:30conceptual +100mass-to-mole(20compounds×5amounts) +80solution +60formula(20×3probes) +60reaction-mass(10×6) +50gas-volume(10×5) +40limiting +36purity/yield +30dilution.
- CQ197:40solution +40neutralization +40limiting +40empirical(20formulas×2sample scales) +37purity/yield.
- SQ91:21conceptual +20solution +20limiting +15empirical +15purity/yield.

Every origin, family, source occurrence, authoring-answer boundary, and numerical audit input is in `chapter-6/validation.json`, with file and row coordinates. No serial number alone is used to disguise a duplicated question. Private numeric audit inputs/expected answers are **not** placed in public `options._authoring`; only origin/family/answer-origin/reference flags go there.

## Diagrams and editable question text

- All original13source crops remain in `public/question-bank/ssc-chemistry-ch6-source-v1/`.
- Both MCQs3–4 retain their shared original stimulus image and text.
- Textbook CQ1 retains its original bottle figure:4g HCl/4g NaOH, both100mL labels.
-40authored neutralization cases have40self-contained SVG pair-of-beakers diagrams with declared concentrations and volumes, matching the question text; they are clearly hypothetical exercise data, not source diagrams.
-43image-bearing questions in the new collection,42distinct referenced figures (one shared stimulus appears twice). The renderer allows only the40exact SVG filenames and two known original stimulus filenames; no arbitrary image origins, HTML, SVGscripts or traversal.
- Native source question pixels are authoritative; Unicode chemical typography/line wrapping in editable transcriptions is documented in the source-only checkpoint.

## Integration and verification

- Eight strict uploader slices, each100questions; no relaxed schemas, null-answer imports or invented source marks hidden in canonical intake.
- `lib/ssc-chemistry-ch6-batches.ts` adds read-only local prepared drafts through existing explicit ADMIN preview/consent/Pending workflow. Registering code does not save questions. Registry now231batches/23056records, preserving the earlier223batches/22256records.
- `options._authoring` retains non-answer origin information if an ADMIN later explicitly saves a Pending record. Full private numerical audit data remains in the review ledger/audit provenance, not the student-facing metadata slot.
-13new mixed-draft tests plus8historical source-intake tests; independent arithmetic checks456numeric authored MCQs and197authored CQs; strict parser, origin mapping, source wording, native figure preservation, hashes, normalized duplicates, safe image parsing and React MathText SSR checks.
- Focused Chemistry1–6/source/table regression suite: see `chapter-6-checks.json` for actual command/result. Automated checks are **not teacher review**.
- Broad prepared-library suite was attempted but its registry-wide repeated reconstruction run exceeded120seconds and was stopped. No pass is claimed for that full suite. Prepared library mocks/totals updated; bounded registry and chapter consent tests provide separate coverage. Full app build/typecheck/browser-print validation not run.
- No real DB import, teacher approval, publication or Vercel deployment. English workflows, Smart/Dynamic/saved templates, default overrides and deferred Physics captions were not changed.

## Deliverables and reproduction

- JSON: `content/question-bank/ssc/chemistry/chapter-6/` (`mcq-1`…`mcq-5`,`cq-1`,`cq-2`,`sq`,`validation`).
- Full question/answer review: `chapter-6-review.html` (800articles,43images).
- Diagram QA contact: `chapter-6-diagram-review.png` (not a browser screenshot).
- Builder: `python scripts/question-bank/build-ssc-chemistry-ch6.py`; deterministic comparison: append`--check`.
- Original source-only builder/intake remains independently reproducible and unchanged.
- Drive backup receipt: `chapter-6-drive-backup-receipt.json` after upload. Backup is a draft, not an approval/deployment artifact.
