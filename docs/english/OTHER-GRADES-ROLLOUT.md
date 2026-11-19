# English 1st Paper: remaining-grade rollout

## Implemented in this phase
- The common ADMIN import/review panels support exact grades 6–12, each using its existing grade-specific practice blueprint.
- Preserve existing catalog categories: Class 9 contains separate grade 9/10 selections; Class 11-12 contains separate grade 11/12 selections. Do not add/rename categories.
- Individual/bulk Pending import registries and bulk approval are grade-scoped. A grade 7 request cannot import/approve grade 6 content. Existing Class 6 identities and digests remain unchanged.
- Existing shared user item/full-model preparation, processing popup and direct setup remain intact. No AI fallback, automatic approval or cross-grade content substitution.

## Not complete
Class 6 retains its existing prepared stock. Class 10 now has 29 teacher-review groups across all 11 existing item types (board and explicitly identified school sources); Classes 7, 8, 9, 11 and 12 remain empty rather than reusing Class 6. Class 10 target quantities are NOT complete. Local approved-fixture assembly now covers all item types without a year filter, while board-year-only assembly still reports literature missing rather than substituting school sources. No production import or approval was executed.

## Drive source inventory checked during this phase
Read-only Drive search returned these source files; folder ancestry identifies their grade:

| Grade | NCTB source candidate | Drive ID | Bytes | Review status |
|---|---|---|---|---|
| 7 | ২০২৬ — English For Today.pdf | 1L1W-XCn_grZior6yOaoSkJ9eWviNIYP7 | 32687361 | Downloaded via connector; cover and publication page visually checked (Class Seven; revised October 2025). Image-based PDF; transcription/OCR and lesson verification still required |
| 8 | ২০২৬ — English For Today.pdf | 1UQ09BSs--YQ-6ZwVANXuqgujrPn4WWNB | 44210158 | Located; not read/verified |
| 9–10 | ২০২৬ — English For Today.pdf | 1XLk9TBYh1R-jYrpFzjXwIv51239u4Sf4 | 39473358 | Located; not read/verified |
| 11–12 | ২০২৬–২৭ — English for Today.pdf | 1YQwbuKcDdRWUYTMFUMvRhReYu35iAW73 | 64637181 | Located; not read/verified |

Additional Class 7 resource: `Ques. 1-4 Seen Comprehension - Class 7 English 1st.pdf`, ID `1CnWGL8_8bWQQJ0XQIVXkXckV8uT8AkC-`, 11332812 bytes; read attempt denied with Drive 403 (account cannot download). Do not retry read/download/export for this file; owner permission or a user-uploaded copy is required. Listing names or folder ancestry does not verify a book's edition, distribution or answer accuracy.

## Next content steps
Class 7 first, then 8, SSC 9–10 and HSC 11–12. Extract the correct textbook, verify the configured distribution against applicable references, prepare distinct Seen/Unseen groups and every remaining item with answer keys/provenance, validate selected and full paper assembly, and register the authored drafts in the grade-specific registry. Import remains Pending until ADMIN review/approval. No forbidden Class 6 CP(16) download was retried.

## Original setup builder restored
The English build entry now mounts the original `QbBuilder` rather than the separate English setup/editor screen. A typed adapter retains each passage-linked group, tables, questions, keys and blueprint marks/numbering; the original pagination/settings/undo/redo and print machinery are reused. English settings, edits and exclusions are saved into the owned English draft (`builderSettings`), not the general `qb:selected` or `qb:settings` storage. Existing saved drafts remain valid and are not deleted. The original EnglishEditor source is retained for compatibility but is no longer mounted by the build route. General question exchange is intentionally blocked for passage-bound sets; selecting a replacement English item remains a separate selection operation. Print rechecks owned draft access rather than treating English set IDs as billable general Question IDs. This does not alter general-paper wallet or purchased-paper checks.


## Class 7 source inspection started
- Scope: Question Item-wise questions and answer keys only; no new authored full-model rollout or production import/approval.
- Textbook: Drive `1L1W-XCn_grZior6yOaoSkJ9eWviNIYP7`, 32,687,361 bytes, 122 PDF pages; SHA-256 `86d513e1065879022e35b7a8f180b5f6c22005791d4d04927ae7067011f4a6fe`.
- Visual checks: PDF page 1 identifies *English For Today — Class Seven*, NCTB; PDF page 3 states revised edition October 2025. This supports the source identity, not official 2027 exam-blueprint applicability.
- PDF page 6 begins Unit one, *Attention, Please*. Local extraction yielded only 1,155 characters across the entire PDF, so extracted text is not usable as the textbook. Page-image transcription/OCR must be checked against the images before authoring.
- The separate Class 7 Seen Comprehension resource is access-blocked; no attempts to bypass the restriction were made.
- Raw PDF and temporary page images are kept only in excluded local cache, not source control. No authored Class 7 items, live stock, imports or approvals are claimed by this source-inspection step.

## Current priority
Class 7 work is paused at the user's request. Continue with Class 10 English 1st Paper, Question Item-wise questions and answers only. The Class 9–10 textbook candidate above and the applicable Class 10 question distribution still require inspection before authoring. This branch does not add Class 10 content or change runtime behavior. No import or live approval is authorized by this planning update.

## SSC source-first requirements (supersedes textbook-first next step)
- User prioritizes supplied board-question sources for Class 10 English 1st Paper, not NCTB-based question authoring. Do not delete existing saved content or sources in response to the user saying they removed NCTB.
- Targets: 50 Seen sets, 50 Unseen sets, and 40–60 entries for each remaining topic. Count distinct passage/question groups honestly; do not inflate counts with duplicate passages or split subquestions. Confirm the counting unit before final coverage acceptance.
- SSC board questions must retain the actual exam year and board, source file and page, and original question number; year must be displayed and selectable as a filter. The publication/target-exam year in a test-paper filename is not the original board exam year. Unknown years must not be guessed; school/model questions must not be labeled as board questions.
- Drive inventory found `English 1st Paper board 2018_2024.pdf` (`1_ZqFc41JXqhoL2cQPyWIz1NylNqZVp4o`, 2,653,981 bytes), `English 1st Paper School model Question .pdf` (`13FF5HytPlXyfpQAHfBNqTycpe5UFl8Nu`, 2,029,246 bytes), and `SSC_English_Test_Papers_English_1st_paper_2025_(Exam2026).pdf` (`1y7M_psgvAVfEDgcFB7kpHcJaJqafsDp0`, 3,120,450 bytes) in the same supplied English folder.
- Board PDF initial text extraction succeeded: printed pages 15–18 include Dhaka Board 2024 and Rajshahi Board 2024 papers, with Seen passages, MCQs/comprehension, gap filling, Unseen/table/summary, matching, rearranging and writing tasks. This is a partial source inspection, not verification of the complete 2018–2024 coverage or answer keys.
- Source years reflect historical paper patterns; preserve original marks and distinguish any adaptations to the selected practice blueprint. Do not silently present adapted questions as exact board reproductions.
- Year metadata/filter implementation, complete source inventory/deduplication, answer verification and target coverage remain outstanding. Existing Pending/review/approval workflow is unchanged; no live import or approval has been performed.

## SSC extraction batch 1 progress
- Read all three supplied PDFs locally: board compilation 104 pages / 404,000 extracted characters; test papers 116 pages / 394,112 characters; school-model excerpt 15 pages / 54,612 characters. Extraction is not question/answer verification.
- Reproducible read-only heading inventory: `scripts/english/inventory_board_pdf.py`; metadata-only results in `ssc-board-source-inventory.json`. Identified 45 paper headings: 2018 combined board (1), 2019 (8), 2020 (9), 2022 (9), 2023 (9), 2024 (9). No 2021 heading found. These are not distinct passage counts or completed item counts.
- `ssc-dhaka-2024-seen-review.json`: first review-only Seen candidate with 7 MCQs and 5 comprehension answers. Source page image checked; answer keys are assistant-prepared and still require teacher review.
- `ssc-dhaka-2024-unseen-review.json`: first review-only Unseen candidate with structured table, 5 answers and summary. Table image check and teacher answer review remain outstanding.
- Candidates deliberately remain outside runtime/prepared registries: not imported, Pending, approved or live. Target gaps remain at least 49 Seen and 49 Unseen sets, before distinctness/content validation. Remaining topic targets and year-filter implementation are not complete.
- Work is item-wise, not lesson-wise. The existing source lesson annotations are provenance only, not a lesson-based workflow.


## SSC implementation batch 2 — board provenance, year filter and first nine item types
- `boardSource` is optional task-level metadata with validated original board, exam year, source file, PDF page, question number and original marks. Existing drafts without it still validate. Item slicing, assembly, save and original-builder pagination retain it.
- SSC first-paper preparation has a year input before the database request. A blank value uses all approved sources. A specified year selects matching board-tagged atomic groups only, excluding unknown years and mixed-year groups, without fallback to another year or school/model material. Invalid year/filter data is rejected before database reads. Other classes retain immediate auto preparation.
- Print/preview shows board, year and original question number once per task. When historical marks differ from the practice blueprint (Dhaka 2024 story/dialogue: original 10 vs practice 15), both are shown; no claim of an exact historic full-paper reproduction.
- Seven Class 10 preview groups are now registered in the existing ADMIN import page: Seen MCQ/comprehension, second Seen gap passage, Unseen information/summary, matching, rearranging, completing story and dialogue. Nine existing item types, not nine full sets of every type. Prompts/table checked against supplied PDF pages 1–2. Assistant-prepared answer keys still require teacher review; gap alternatives and creative writing answers are illustrative.
- Source extraction's private-use blank glyphs are rendered as ordinary dashes. Source spelling is otherwise retained. Text reflow is not a new question.
- Prepared content still requires explicit ADMIN preview/consent -> Pending -> review/approval. No import/approval was executed. Existing Class 6 identities, auth, payment and wallet behavior are unchanged. The earlier batch-1 statement that candidates were outside registries is superseded only for the page-checked candidates now registered here.

### Coverage, not completion
| Existing item | Prepared review entries | Target |
|---|---:|---|
| MCQ + comprehension | 1 linked Seen group | Seen target 50 distinct sets overall, counting scope still reported separately |
| Gap | 1 separate Seen passage group | Included in Seen source coverage; not counted as another complete MCQ/comprehension set |
| Information + summary | 1 linked Unseen group | 50 Unseen sets |
| Matching | 1 | 40–60 |
| Rearranging | 1 | 40–60 |
| Poem comprehension | 0 | 40–60 |
| Short-story comprehension | 0 | 40–60 |
| Completing story | 1 | 40–60 |
| Dialogue | 1 | 40–60 |

Validation: 135 focused English/builder/pagination/purchased-editor/import-shortcut tests passed, including year isolation, mixed legacy snapshots, metadata validation, markup rendering, missing-stock honesty, and Pending-only consent. Webpack production compilation completed with existing Edge-runtime warnings. Full build/typecheck could not finish: Prisma client generation was blocked by network access to binaries.prisma.sh, leaving missing-client/cascading type errors; no diagnostics in changed paths. Real mobile browser and production deployment remain unverified.

### User-controlled source-label visibility
Board/year filtering is independent of paper presentation. `show.boardSource` defaults to false, including restored older settings. Page Setup provides an explicit toggle for board name, year and original question-number labels. Turning it off hides the entire provenance label (including historical-mark annotations) in the shared Preview/Print renderer without deleting metadata or changing filtering. Turning it on is saved with builder settings; historical marks still respect the separate marks visibility control. Regression coverage checks default-hidden, opt-in rendering, hide-again, settings roundtrip and filtering while hidden. All 135 focused tests pass.

## SSC content batch 3 — Rajshahi 2024 (partial)
- Added distinct Meherjan comprehension passage (five questions/answers, original Q2) and Hydrogen gap passage (five answers, original Q3) from supplied board compilation PDF p.3 / printed p.17. Prompts checked against page image. Both are Class 10 teacher-review drafts, not official answer keys or live stock.
- Existing registry now has nine groups: seven Dhaka plus two Rajshahi. There are four distinct Seen passages across both roles, but still only ONE complete MCQ/comprehension Seen group. Rajshahi comprehension alone must not be counted as a complete Seen MCQ set. Unseen remains one linked group. Quantity targets are far from complete.
- Rajshahi MCQs held outside registry because the source's shatter alternatives overlap; no replacement/altered question invented. Comprehension Q(d)'s answer explicitly notes that the passage calls for climate adaptation but does not specify how to completely stop river erosion.
- Rearranging Q7: eight source sentences and a suggested order prepared in the batch JSON, but excluded from registry pending page-image verification and teacher review. Its advice is narrative source content, not medical guidance.
- Existing Pending import consent, exact-grade scoping, source-year filtering and default-hidden labels unchanged. No database imports or approvals performed.
- Validation: 136 focused tests passed; includes distinct-passages, provenance, complete-vs-partial coverage and held-item exclusion checks. No typecheck diagnostics in changed paths; full local typecheck still blocked by missing generated Prisma client. No mobile/live deployment verification.

## SSC content batch 4 — Cumilla/Jashore 2024 and Rajshahi rearranging
This supersedes the earlier partial registry counts, not the original targets.
- Six additional source-image-checked groups: Cumilla Seen MCQ/comprehension (May Day), Cumilla gap (fish/climate), Cumilla rearranging (Napoleon/boat), Jashore Unseen table/summary (Babbage), Jashore matching (price hike), Jashore rearranging (Fleming). Source PDF pages 5–8, printed 19–22. Answer keys are assistant-prepared and still require teacher review.
- Rajshahi rearranging Q7 has now been checked against PDF page 4 / printed 18 and registered. The prior hold for this task is resolved; the Rajshahi ambiguous MCQ hold remains.
- This batch contributes 52 answer entries, counting each subitem or standalone long answer once. Combined prepared registry: 16 groups, 100 answer entries. These are NOT 100 complete sets.
- Jashore social-network passage repeats Dhaka; not registered as a new Seen. Fish passage repeats between Jashore/Cumilla; only one registered. Source spelling/history is not independently certified; especially historical Babbage/Fleming statements require teacher fact-check, and the source narrative is not medical advice.
- Original blank table cells in the Babbage information-transfer table are retained, not replaced by invented answer gaps. Table validation now permits individual empty cells but rejects entirely empty rows; headers, widths and answer requirements remain validated.

### Current prepared review coverage (not approved/live)
| Item / linked group | Count | Required |
|---|---:|---|
| Complete Seen MCQ + comprehension | 2 | 50 distinct complete sets |
| Additional comprehension-only Seen | 1 | Not counted as complete MCQ set |
| Gap Seen passages | 3 | Separate source-role coverage; not extra complete MCQ sets |
| Unseen information + summary | 2 | 50 distinct linked sets |
| Matching | 2 | 40–60 |
| Rearranging | 4 | 40–60 |
| Poem comprehension | 0 | 40–60 |
| Short-story comprehension | 0 | 40–60 |
| Completing story | 1 | 40–60 |
| Dialogue | 1 | 40–60 |

There are six distinct registered Seen passages across the two source roles and two distinct Unseen passages. Full subject completion is NOT achieved. Missing items still prevent full auto assembly rather than invoking AI or substituting other grades. No production import, approval or deployment was performed. Existing optional/default-hidden source labels and year filter are unchanged. Validation: 138 focused tests pass; no typecheck diagnostics in changed modules, full local typecheck still blocked by ungenerated Prisma client.


## SSC literature batch — source questions without fabricated extracts
- The supplied 2025 test-paper compilation (target exam 2026) contains school poem/story comprehension questions on PDF pages 5 and 7. Neither date is assigned as a board exam year. Exact question wording was checked against page images.
- Added one poem set (8 questions) and one short-story set (8 questions), answers assistant-prepared and requiring verification against the original literary works. Poems use Tejgoan Q8(a–h), PDF p.7. Stories use Tejgoan Q9(b–h), PDF p.7 plus Govt. Mohammadpur Model School & College Q9(f), PDF p.5. Mixed provenance is explicit, not represented as one intact original paper. Individual source part locators are in the review JSON.
- Held unfamiliar Ameen/Mr. Moti/Great Derangement questions rather than guessing. No original literary-work text was available in this source; none was invented or copied from Class 6.
- Added explicitly typed SSC literature `question-bank` source excerpts. Their text must exactly equal the eight supplied subquestions. They cannot masquerade as a printable poem/story passage, cannot be used for Seen/Unseen or other grades, and keep their references in ADMIN preview. Ordinary textbook-extract workflows and old drafts remain unchanged.
- Existing source grouping, private draft save, original setup/print and default-hidden board tags remain in place. School literature has no boardSource, and is excluded when selecting a board exam year. All content still requires the existing explicit consent -> Pending -> teacher approval workflow. No database writes or approvals executed here.

### Current coverage and acceptance status
18 prepared groups / 116 answer entries, counting subitems or standalone long answers once. Counts: 2 complete Seen MCQ/comprehension pairs, 1 additional comprehension-only set, 3 Seen gap passages, 2 Unseen information/summary pairs, 2 matching, 4 rearranging, 1 poem set (8 questions), 1 story-comprehension set (8 questions), 1 completing story and 1 dialogue. Every existing item type now has a draft, but the requested 50 Seen / 50 Unseen / 40–60 per remaining item is NOT met. Review-only stock is not live approved stock.

Validation: 139 focused tests passed. In-memory APPROVED fixtures assemble all 11 items; PENDING fixtures remain unusable, and year=2024 still rejects school literature rather than silently substituting. Tests also reject altered source questions, fake literary passages, and question-bank references for non-SSC/non-literature uses. No changed-path typecheck diagnostics; full local typecheck still has missing generated Prisma-client errors. No mobile-browser or production verification.


## SSC board batch 5 — Chattogram, Sylhet, Barishal, Dinajpur 2024
- Added 11 source-image-checked groups, 82 answer entries: two complete Seen MCQ/comprehension pairs (Barishal energy, Dinajpur Independence Day), Chattogram Mother Teresa comprehension only, Sylhet Pritilata gap, Barishal Language Movement gap, Chattogram Wordsworth Unseen table/summary, four rearranging sets and Dinajpur matching. Source PDF pp.9–18 / printed pp.23–32. File checksum is recorded in `ssc-board-2024-batch3.json`.
- Answers are assistant-prepared and remain teacher-review drafts. Personal school-celebration answer is explicitly illustrative. Chattogram teaching-date answer explicitly avoids affirming the question's unsupported first-seventeen-years premise. Renewable/hydrogen classifications and historical narrative follow the source, not independent scientific/historical certification. Rearranging setup sentences can admit coherent alternatives; teacher judgement is required.
- Held Chattogram overlapping MCQ alternatives, Dinajpur Milton marriage-date conflict (1641 narrative / 1642 fixed table), Sylhet Sher-E-Bangla historical dates, and Barishal matching's erroneous 1977 independence date. No silent repair, invented replacement or automatic approval.
- Excluded repeat Sylhet social-network Seen, repeat Dinajpur fish gap and near-duplicate Barishal Wordsworth biography, rather than counting them toward targets.

### Current real coverage
29 review groups / 198 answer entries, NOT 198 complete sets. Four complete Seen pairs plus two comprehension-only groups; five separate gap passages; three Unseen information/summary groups; three matching; eight rearranging; one poem set (8 questions); one short-story set (8 questions); one completing story; one dialogue. Eleven distinct Seen passages across both source roles, three distinct Unseen passages.

The requested quantities remain unmet: at least 46 complete Seen and 47 Unseen sets still needed, matching needs 37 and rearranging 32 to reach minimum 40, and the other minimum-40 items remain at one each. Standalone comprehension/gap groups do not inflate complete Seen counts. All existing item types have draft coverage and in-memory APPROVED fixtures assemble 100 marks, but no live stock readiness claim is made.

Validation: 140 focused tests pass, including counters, unique passages, source-error holds, question-page bounds, rearranging answer permutations, grade/approval isolation and hidden source labels. No typecheck diagnostics in changed paths; full local typecheck still blocked by missing generated Prisma client. No live import, approval, mobile-browser validation or production deployment performed.

## SSC board batch 6 — 2023, explicit practice subsets
- Added 15 review groups / 64 answer entries from the supplied board compilation. Three Seen MCQ/comprehension pairs: Barishal (Pahela Boishakh), Dinajpur (Madhusudan), Mymensingh (roots/Eid). Four gap passages: Cumilla Language Day, Dinajpur fossil fuels, Mymensingh air pollution and Dhaka Lipi. Five story continuations and three dialogues. Checked question images on PDF pp.22–23,25,27,29,36,38–39,41–42; file checksum and limitations retained in review JSON.
- Original 2023 MCQ/comprehension exercises have 10/6 parts, while current practice uses 7/5. These are explicitly selected practice subsets, **not intact historical papers**. Exact selected question wording/options, original counts, original part letters, all original source questions and historical marks remain recorded. Runtime drafts retain validated subset metadata; optional source labels disclose the selected letters. Year filtering remains independent of default-hidden labels.
- Held ambiguous Dinajpur MCQ(a,f), Mymensingh MCQ(d); did not invent a middle-age conversion event for the Dinajpur comprehension premise. Held six-blank Unseen and seven-part matching rather than silently truncating or filling original blanks. Repeated source passages and overlapping games/sports dialogue were not counted as new stock.
- Creative answers are illustrative, not official keys. Story continuations contain exactly ten new sentences after the supplied opening, checked by regression tests. New dialogues cover mobile merits/demerits, newspaper reading and computer learning. All answers still require teacher review.

### Latest coverage (supersedes earlier batch totals)
**44 prepared review groups / 262 answer entries**, not 262 sets or approved live records.

| Item / linked group | Prepared count | Target |
|---|---:|---|
| Complete Seen MCQ + comprehension practice pairs | 7 | 50 distinct sets |
| Extra comprehension-only Seen | 2 | Not counted as complete pairs |
| Separate Seen gap passages | 9 | Not counted as complete pairs |
| Unseen information + summary | 3 | 50 distinct sets |
| Matching | 3 | 40–60 |
| Rearranging | 8 | 40–60 |
| Poem comprehension | 1 | 40–60 |
| Short-story comprehension | 1 | 40–60 |
| Completing story | 6 | 40–60 |
| Dialogue | 4 | 40–60 |

18 distinct Seen texts across source roles, three distinct Unseen texts. Requested quotas remain **unfinished**: 43 complete Seen / 47 Unseen still needed; minimum-40 deficits are matching 37, rearranging 32, poem 39, short-story comprehension 39, completing story 34 and dialogue 36. No production import, approval or deployment. Existing Preview -> explicit consent -> Pending -> ADMIN review remains mandatory.

Validation: 142 focused tests pass, including exact subset-to-source mapping, rejected malformed part/count metadata, year isolation, sentence counts, accurate coverage and Pending-only import fixtures. Full typecheck remains blocked by missing generated Prisma client/cascading diagnostics; changed paths have no typecheck diagnostics. No mobile-browser or production verification performed.

## SSC board batches 7–8 — 2020 and 2019
- Added 15 groups / 87 answer entries: six distinct Unseen information/summary pairs (Armstrong, Volta, Humayun Ahmed, Abul Fazal, Shahidullah, SAARC), seven matching sets (democracy, punctuality, patriotism, ICT, earthquake, morality, moon), and two rearranging sets (Androcles, Nur Banu).
- Checked PDF images pp.61–62,64,66,71,74,76,88–89,95,98. Armstrong and Shahidullah passages span two pages; both halves are retained. Table header blanks remain in instructions and ordinary blank cells remain empty, with exactly five labelled answer gaps per information task. No invented prefilled answers.
- Original examination years 2019/2020 are retained and independently filterable. Suggested summaries/keys are assistant-prepared, require teacher review and are not official keys. Collins is not described as having walked on the moon. SAARC prose describes the source-era organisation, not a current political-status assertion. Source scientific/historical claims remain subject to verification.
- Held questionable Lincoln, Rouf, Fazlul Hoque, Bose, Gagarin, Thai rescue, Altaf Mahmud and Eiffel exercises; held outdated email-equipment matching and simplified Pasteur medical story. Repeat biographies and existing Fleming/Napoleon/Keats/Mandela rearranging were not counted again. Specific holds are in each batch JSON.

### Latest cumulative status
**59 prepared review groups / 349 answer entries. Still not complete or live approved stock.**
- Complete Seen practice pairs 7/50; extra comprehension-only 2; separate gap texts 9. These cover 18 distinct Seen texts, not 18 complete pairs.
- Unseen pairs 9/50; matching 10/40 minimum; rearranging 10/40 minimum.
- Poem comprehension 1/40 minimum; short-story comprehension 1/40 minimum; completing story 6/40 minimum; dialogue 4/40 minimum.
- Remaining minimum deficits: complete Seen 43, Unseen 41, matching 30, rearranging 30, poems 39, short-story comprehension 39, completing story 34, dialogue 36. Distinct verified sources, not alternative wordings or repeated board appearances, must fill these deficits.

Validation: 144 focused tests pass, including original header/table blanks, cross-page text continuity, answer permutations, exact year isolation and missing-stock rejection. Changed modules have no typecheck diagnostics; global typecheck remains blocked by missing generated Prisma client and cascading existing diagnostics. No import, approval, deployment or mobile-browser verification performed. Consent -> Pending -> ADMIN review is unchanged.

## Expanded creative, exercise and school-source review batch
- Added 42 groups / 117 answer entries beyond the 59-group baseline: 28 creative groups, 11 exercise groups and three school Unseen pairs. Original source files/checksums, page numbers, question numbers and marks are retained in the new review JSON files. Continuations/dialogues/summaries are illustrative authored answers, not official keys.
- Older creative headers were checked separately: five dialogue prompts are **2022**, not 2023; original Q9/five marks remain distinct from current practice marks. Eight additional 2019/2020 stories retain original beginnings and ten new continuation sentences each. Repeated themes and defective source exercises are held rather than counted again.
- Three school sources: Madhupur Shahid Smrity Higher Secondary School Test 2025 (Salimullah), Akij Collegiate School Test 2024 (Victoria), Joypurhat Girls’ Cadet College Pre-Test 2024 (Mother Teresa). Dedicated school provenance cannot coexist with board provenance. Schools are never assigned a board or silently admitted through board-year filtering. Optional labels remain hidden by default; toggle wording now covers board/school sources.
- Additional Seen passages include Maldives, Shat Gambuj and reviewed paired/subset material; matching and rearranging retain source combinations/permutations. Historical/scientific/source-language limitations and explicit holds are recorded alongside data, not silently corrected.

### Current cumulative status (supersedes all earlier totals)
**101 prepared teacher-review groups / 466 answer entries. Not approved live stock.**

| Item / linked group | Prepared | Target minimum |
|---|---:|---:|
| Complete Seen practice pairs | 8 | 50 |
| Additional comprehension-only Seen | 4 | Not complete pairs |
| Separate Seen gap texts | 9 | Not complete pairs |
| Unseen information + summary pairs | 12 | 50 |
| Matching | 15 | 40 |
| Rearranging | 13 | 40 |
| Poem comprehension | 1 | 40 |
| Short-story comprehension | 1 | 40 |
| Completing story | 23 | 40 |
| Dialogue | 15 | 40 |

The quantity target remains unmet: deficits are Seen pairs 42, Unseen 38, matching 25, rearranging 27, poems 39, short-story comprehension 39, completing stories 17 and dialogues 25. The supplied compilations contain repeated, malformed and historically questionable exercises; these were not used to inflate totals. More distinct, usable source material and teacher review are required before claiming completion.

Validation: **148/148 focused tests pass**, including all 41 English bank model tests. `git diff --check` passes. Full TypeScript check remains blocked by generated Prisma-client/cascading project errors; no diagnostics reference the changed English/provenance/render modules. No live import, approval, push or deployment performed. Preview -> explicit consent -> Pending -> ADMIN review is unchanged. No mobile-browser or production verification performed.
