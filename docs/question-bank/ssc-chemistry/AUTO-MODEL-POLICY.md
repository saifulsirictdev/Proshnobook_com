# Chemistry Auto Model — owner-defined practice policy v1

## Authority

The owner specified **chapters3,4,5,6,7,11 plus any one other chapter**, then explicitly selected **CQ and SQ both**. On the marks clarification the owner said the mark distribution had already been supplied; it is not being requested again. Retain the previously used science practice distribution: **25MCQ + 7CQ(answer4) + 7SQ(answer5)**, theory75, practical25, shared theory180minutes, CQparts1/2/3/4. This is an owner practice configuration, **not independent official-year certification**. No new official syllabus/exam document is claimed. `officialYear:null` remains explicit.

## Selection

| Section | Offered | Answer | Marks | Chapter rule |
|---|---:|---:|---:|---|
|MCQ|25|25|1|Full existing12chapter catalog. At least1perchapter, max3; balanced rotation produces2each plus1additional when compatible stock permits. This is a practice strategy, not an official MCQquota.|
|CQ|7|4|10|Exactly1each from3,4,5,6,7,11; exactly1from1,2,8,9,10,12.|
|SQ/SHORT|7|5|2|Independently the same sixplusone rule. SeventhCQ/SQmay be the same chapter or different.|

MCQcomponent25marks; writtencomponent50marks. The two selections remain separate in UI, together75theory; no separate component time limit invented. Practical25is not generated. Full12chapter catalog is the practice scope, not a claim about an unverified year's reduced syllabus. The mandatory six are not the only eligible chapters.

## Implementation and boundaries

- Separate registry policy`ssc-chemistry-owner-chapter-policy-v1`; saved settings`ssc-chemistry-mcq-v1`/`ssc-chemistry-written-v1`. Physics chapter quotas and Math/English remain unchanged.
- Source/nativePNG and generatedSVG render through the existing exact chemistry filename allowlist. The classifier now recognizes renderer-approved relative assetpaths as well as absolute productionpaths; malformed/external/alteredURLorwrongsubjectfigures still fail closed.
- `_authoring`and`_provenance`are audit metadata, not MCQchoices/SQattachments. Ignore these two known metadata keys for classification, preserve them in stock. Arbitrary extra options/attachments remain rejected.
- Existing server action reads **approved** subject/categoryscoped rows only. It never uses local prepared drafts as an implicit fallback, imports, approves or publishes anything. Empty/incomplete approved stock returns gaps and **no partial model IDs**. Draft availability is not model readiness.
- Exact catalogtopics, fourpartCQ, correctanswers, validfigures, duplicateID/normalizedstem protection, max10000scan, teacher authentication/access/checkout gates remain in force. Editorchanges violating policy flag custom/incomplete; extras remain visible in printsections. Saved policy IDs roundtrip through settingsSchema.

## Verification

`tests/chemistry-auto-model.test.cjs` uses8110actual local canonical draft records with realadaptermetadata as **fixtures only**. Nofixture is imported/approved. Tests cover repeatedseed selection, independent seventhchapters, all12MCQcoverage/max3, shortage per mandatorychapter/type, insufficient total, sourcePNG/generatedSVG, tamperedURLs, metadata, malformedCQ, editor/printsections, settingroundtrip and actualserveraction with mocked readonlyDB/auth. Physics and sharedMath/English/printing tests are run separately for regression. ActualproductionapprovedChemistrystock has **not** been queried or certified; no deployment is implied. Historical chapter authoring/check receipts that predate this policy remain snapshots, not current policy authority.

### Local results

- **86PASS/0FAIL** subjectassembly/Physics/Math/English/settings/header/startUI tests, including8newChemistrytests.
- **162PASS/0FAIL** Chemistrychapters1–12/source/checkpointregressions; existing “policy unavailable” assertions now check the separate ownerChemistrypolicy rather than a Physicsinheritance. Questioncontentandapprovalstateunchanged.
- **248total boundedtestsPASS**, no skippedtests in these runs.
- Focused strictTypeScripttypecheck of`subject-model-policy.ts`,`auto-model.ts`,`auto-model-paper.ts`,`paper-builder.ts`andtransitivedependenciesPASS; notafullNextapplicationbuild. `git diff --check`PASS.
- Cache-onlytestdependenciesinstalled; repositorypackage/lockfilesunchanged. Twoinitialenvironmentfailures(missinglucide-react)resolvedbeforethepassingrun. No browser/productionreadinessclaim. Machine-readableevidence:`auto-model-checks.json`.
