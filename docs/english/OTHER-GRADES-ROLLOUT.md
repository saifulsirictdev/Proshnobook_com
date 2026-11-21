# English 1st Paper: remaining-grade rollout

> Current owner scope is **both papers, Classes 6–8, SSC and HSC**; earlier deferral/pause notes below are historical. See [expanded-model-rollout.md](expanded-model-rollout.md) for current prepared coverage, new grade-specific Second Paper models, source limitations and remaining release gates. SSC is the canonical visible category, not separate Class 9/Class 10 categories.

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

## School compilation expansion — source-linked language and writing practice
Added **43 groups / 178 answer entries** beyond the 101-group baseline:
- 14 rearranging sets: sailor, fisherman, tax collector, Hatem Tai, fox/grapes, Ferdousi, Bayazid, donkey/statue, crow/peacock, Solomon, jackal/camel, dream, unpaid parcel and farmer/horse. Suggested narrative orders retain all eight original sentences. Variants may need teacher judgement.
- Four matching sets: Mother Teresa, good manners, responsible Facebook use and education. Exact zero-based B/C key mappings are retained and tested against the original column fragments.
- Ten completing-story scenarios: false alarm, friends/bear, Bayazid, Azam Shah, boatman, dog/reflection, lion/lamb, crow/fox, fox/grapes and honest woodcutter. Ten authored continuation sentences follow each original opening. Traditional accounts are not claimed as verified history or canonical endings; the bear example expressly disclaims real wildlife-safety advice. The boatman ending avoids endorsing drowning and uses a life jacket/sheltered landing.
- Ten dialogues: deforestation, education, fictional cricket match, price increases, examination anxiety, scholarship bank account, city/village life, Facebook, adult literacy and unemployment. No invented current prices, guaranteed banking requirements or medical prescriptions. The Naogaon stress prompt is original Q10, not Q11; Akij's Facebook prompt retains Test **2024**, not 2025/2026.
- Three comprehension-only school Seen excerpts (general loneliness, causes/demographics, coping strategies) and one separate gap role using the same general-loneliness text. Held all corresponding MCQ sets because of overlapping, unsupported or overstated alternatives. Under-supported comprehension premises are disclosed in the draft answers rather than answered with invented facts. This adds three distinct Seen excerpts, **zero complete Seen pairs**.
- One Unseen pair: Washington, Lions School and College Test 2025, header PDF p.59, passage p.60, original five table blanks/summary p.61; authored summary has 73 whitespace-delimited words against the original 70–90 instruction.

Question images were checked individually, and each exercise is linked to the school header **before its question**, including when another school starts on the same page. PDF p.38's first three exercises belong to Unique Progressive School, not the Sherpur paper starting below them. School data never acquires board provenance or becomes eligible through the board-year filter.

### Current cumulative quantities
**144 review groups / 644 answer entries**, not 644 complete papers, distinct sets or approved records.

| Item / linked group | Prepared | Requested minimum | Remaining |
|---|---:|---:|---:|
| Complete Seen practice pairs | 8 | 50 | 42 |
| Extra comprehension-only Seen | 7 | Not complete pairs | — |
| Separate Seen gap roles | 10 | Not complete pairs | — |
| Unseen information + summary pairs | 13 | 50 | 37 |
| Matching | 19 | 40 | 21 |
| Rearranging | 27 | 40 | 13 |
| Poem comprehension | 1 | 40 | 39 |
| Short-story comprehension | 1 | 40 | 39 |
| Completing story | 33 | 40 | 7 |
| Dialogue | 25 | 40 | 15 |

Seen roles cover 24 distinct excerpts across 25 groups; the extra general-loneliness gap role is deliberately **not** a 25th unique text. Three loneliness excerpts are separate parts of one topic, not three distinct literary works. Unseen has 13 distinct retained passages. Source errors, duplicates and missing original literary works still prevent an honest claim that requested quotas are complete. Original works are needed for further trustworthy poem/story interpretations; recombinations of the same questions must not be presented as new distinct source sets.

### Validation and release boundary
- **152/152 focused tests pass**, including 45 bank-model tests. Added regression coverage for school-source header ownership, original question-number exceptions, exact matching mappings, complete eight-position permutations, ten new story sentences, twelve-line dialogues, reading-role counts, cross-page table blanks, summary length and filtered/unfiltered assembly.
- Whole repository suite ran: **848 passed / 13 failed, 861 total**. All 13 failures report missing `.prisma/client/default` in `chapter-filter.test.cjs`, `paper-generation.test.cjs` or `question-types.test.cjs`; the environment lacks its generated Prisma client. This is not a full-suite pass.
- Full TypeScript check remains blocked by generated Prisma/cascading project errors. No diagnostics reference changed English loaders/data modules. Diff whitespace checks pass. No production/browser verification claimed.
- No live import, approval, push or deployment. Preview -> explicit consent -> Pending -> ADMIN review remains mandatory. This batch is preserved on the current working branch, not silently published.

## Textbook-based authored supplement (2026-11-10; review only)

The source-question inventory immediately above remains **144 groups / 644 answers**. A separately labelled supplement now adds **22 groups / 208 authored answers**, making the complete preview registry **166 groups / 852 answers**. The supplement must **not** be described as 22 newly recovered board/school exercises, verbatim NCTB exercises, official answers, or approved live records. It does not resolve the deficit in *original exam* stock.

Source: supplied *English for Today — Classes Nine and Ten*, revised October 2025 / 2026 imprint; Drive file `1XLk9TBYh1R-jYrpFzjXwIv51239u4Sf4`; PDF SHA256 `a5628de6a7b1a2afd1caf0adfb0d49603dc0c5a8b51f031d2b8c168ed5fd78f6`. Literary pages and selected reading excerpts were checked against page images, not OCR alone. PDF pages equal printed pages +5 for these selections. Source files retain work/author or excerpt locator, page ranges, authorship, limitations and review status; preview references retain source identity/checksum/pages. Neither loader assigns invented board/school/year provenance. Board-year filtering excludes these groups.

- `ssc-textbook-literature-review.json`: **14 groups / 112 authored questions**, eight per group: seven poems and seven story/episode groups. Three Merchant of Venice episodes represent **one original play**, not three independently sourced short stories. These are passage-free, question-bank references to the actual work, not fabricated literary extracts. Interpretations are suggested, not unique official keys. Literary/source exercise collections may overlap works; do not count every group as a new distinct work.
- `ssc-textbook-seen-review.json`: **8 linked MCQ/comprehension pairs / 96 authored answers**, seven four-option MCQs and five written questions per excerpt. Topics: Anusha/Tiya, historical outdoor-pastime survey, Partha’s mime, Jobs/Hill, nursery work, floral design, Nepal heritage, Indian attractions. Questions share the exact displayed excerpt; shorter excerpt boundaries are explicit. No duplicated alternatives or invented replacement passages. Original textbook wording/grammar retained with line-wrap and typographic/OCR normalisation.
- Hold disclosures: no universal health prescriptions, current-population or Olympic-record certification, speculative adoption psychology, guaranteed floral earnings, religious stereotypes or hazardous rescue advice. Survey claims are historical and attributed; character opinions and travel superlatives are not universal facts.

### Registry totals including authored practice (not original-exam completion)

| Role | Registry total | Composition / remaining minimum |
|---|---:|---|
| Complete Seen pairs | 16 | 8 original-exercise + 8 authored; 34 short of 50 even if authored practice is accepted |
| Extra Seen comprehension / gap roles | 7 / 10 | Not additional complete pairs |
| Unseen pairs | 13 | 37 short of 50 |
| Matching / rearranging | 19 / 27 | 21 / 13 short of 40 |
| Poem comprehension groups | 8 | 1 original-exercise + 7 authored; 32 groups short, not a claim of 8 distinct original works |
| Story/episode comprehension groups | 8 | 1 original-exercise + 7 authored; 32 groups short, Merchant episodes are one play |
| Completing story / dialogue | 33 / 25 | 7 / 15 short of 40 |

The registry now has 33 Seen passage roles on 32 distinct displayed excerpts; the extra general-loneliness gap role remains the single duplicate text. Distinct excerpts are not necessarily distinct underlying lessons or literary works. All requested quotas remain unfinished. Additional defensible original source exercises are still needed rather than alternate questions on the same work being presented as new original sources.

Validation for this supplement: **153/153 focused tests, including 46/46 bank-model tests, pass**. Regression checks cover 22 unique prepared keys, 208 complete answers, four distinct MCQ alternatives/one key, linked shared excerpts, PDF/printed page offsets, preservation through assembly, Pending rejection and board-year exclusion. Full typecheck still fails on existing generated-Prisma/cascading project errors; no diagnostics mention the changed loaders. Previous whole-suite result (848 pass / 13 missing-Prisma failures) is historical, not a newly rerun full-suite pass. No production import, approval or deployment. Preview → explicit consent → Pending → ADMIN review remains unchanged.

## Further original school exercises — resumed expansion (2026-11-10)

Added **7 original-source groups / 44 suggested answers** in `ssc-school-additional-review.json`, through its dedicated loader and the shared preview registry. These are recovered school exercises with authored keys, not newly authored prompts or board papers. The source SHA256 was reverified against the downloaded PDF: `b0603b5eb98f2f6d25b991257da8975bbfcf9550508505d26d8548ec98b4cd91`.

| Exercise | Prompt PDF page / question | Actual preceding school header |
|---|---|---|
| Human-rights matching | 35 / Q6 | Agricultural University High School, Mymensingh, p.33 |
| Truthfulness matching | 40 / Q6 | Sherpur Govt. Victoria Academy, Sherpur, p.38 (below preceding school's writing section) |
| Water-pollution matching | 45 / Q6 | Saleha Ishaque Govt. Girl's High School, Sirajganj, p.44 |
| Cyber-security matching | 75 / Q6 | Dawood Public School & College, Jashore, p.73 (below preceding school's writing section) |
| Farmer/animal-care rearranging | 45 / Q7 | Saleha Ishaque, p.44 |
| Washington/beam anecdote rearranging | 48 / Q7 | Govt. Promothnath (P.N.) Girl's High School, Rajshahi, p.46 |
| Language Movement rearranging | 75 / Q7 | Dawood Public School & College, p.73 |

All seven are **Test 2025 school questions**, not Board 2025 questions. Both question images and the owning header images were visually checked. Matching keys concatenate exact source-column fragments, preserving source grammar/spelling rather than silently repairing it; narrative keys are possible coherent orders (`cafhdbge`, `hgacdfbe`, `fcdbhage`), not official answers. Cyber-security absolutes remain disclosed simplifications, not promises of complete protection. Washington's beam story is attributed anecdote, not historical certification. Farmer wording is not an endorsement of age-based stereotypes about caring ability.

Repeated human-rights variants p.48/70, Sonargaon, democracy, patriotism, Internet, email and existing dialogue topics were not counted again. The Florence Nightingale Unseen candidate p.103 was visually reviewed and **held**: the "Suffered illness for ... years" blank provides no endpoint. Answering 53 assumes illness continued from 1857 until death in 1910; no endpoint is supplied explicitly. It adds zero Unseen pairs. Great Wall p.75 still lacks a table premise; Milton p.40 has conflicting publication years; malformed or stereotype-based matching remains held.

### Latest cumulative preview quantities
- **151 original-source review groups / 688 suggested answers**.
- Separately labelled authored-textbook supplement unchanged: **22 groups / 208 answers**.
- Combined registry: **173 groups / 896 answers**, all still review candidates, not approved live records.
- Complete Seen pairs **16** (8 original-exercise + 8 authored); Unseen **13**; matching **23**; rearranging **30**; poem comprehension **8**; story/episode comprehension **8**; completing story **33**; dialogue **25**.
- Minimum remaining, even including authored practice: Seen **34**, Unseen **37**, matching **17**, rearranging **10**, poem groups **32**, story/episode groups **32**, completing story **7**, dialogue **15**. These literature group totals are not counts of distinct original works. Original-exam deficits are not filled by authored supplements. No quota completion claimed.

Validation: **154/154 focused tests pass**, including **47 bank-model tests**. Added checks for exact matching fragments/column permutations, eight-position narrative orders, owning header/page/marks, unique registry keys, source checksum, Pending rejection, assembly preservation and school exclusion from board-year filters. `git diff --check` passes. Full TypeScript check still fails on existing missing generated-Prisma/cascading errors; no diagnostics name either changed loader. No production import, approval or deploy. Preview → explicit consent → Pending → ADMIN review remains mandatory.

## Reading-pair expansion — source-preserving and explicitly authored (2026-11-10)

Added **10 complete Seen practice pairs / 120 suggested answers**:
- **1 intact original school question set**: Habiganj Government High School, Test 2025, PDF112 (greenhouse). Seven original MCQs and five original comprehension questions, exact alternatives/wording, authored keys, school—not board—metadata. Source-era oil-consumption figures remain attributed; no question certifies a current statistic.
- **9 explicitly authored pairs** using selected real reading excerpts: graffiti expression (PDF3), Zahir Raihan film/public commitment (8), Maldives geography (17), air pollution (42), Meherjan narrative (54), Pritilata education/aspirations (99), loneliness definition (28), demographic risks (33), coping/support (79). Each has seven new MCQs and five new written questions. These are **not recovered original exam questions**, official exercises or official answer keys. Their source references disclose authored status; no school/board exam provenance is fabricated. `ssc-authored-reading-review.json` records precise excerpt boundaries and limitations. Paragraphs with defective dates, unsupported questions, unnecessary death-method detail or current-statistic implications were not selected. Source wording is preserved with line-wrap normalisation.

All ten source page images were visually checked. Defective original school sets are still held, not silently rewritten. The three loneliness excerpts are parts of one lesson; their prior longer comprehension-only roles remain visible. Greenhouse completes a source topic already present in partial reading stock. Excerpt count is **not** a distinct-work count. This batch does not claim 10 new distinct underlying lessons or complete the requested 50 distinct Seen target.

Latest registry: **183 groups / 1,016 suggested answers** = **152 original-source groups / 700 answers** plus **31 explicitly authored groups / 316 answers**. Complete Seen pair records: **26** (9 original + 17 authored); seven comprehension-only roles remain. Seen roles: **43**, with **41 unique displayed strings** (one greenhouse full pair shares the exact excerpt with an earlier partial role; the existing loneliness gap/comprehension duplicate remains). Different excerpts or alternate questions on the same underlying work do not count as new independent works.

Task totals: MCQ26, comprehension33, gap10, information13, summary13, matching23, rearranging30, poems8, stories8, completing-story33, dialogue25. Even counting all authored pairs, numeric deficits remain: Seen24, Unseen37, matching17, rearranging10, poem groups32, story/episode groups32, completing-story7, dialogue15. The stricter **distinct complete source** target still requires deduplication by underlying reading rather than simply accepting the pair-record count.

Validation: **155/155 focused tests pass**, including **48 bank-model tests**. New checks cover 7+5 question structure, unique four-option MCQs with one answer, all suggested answers, original school marks/page/year, clear authored provenance, forbidden board-year eligibility, assembly preservation, exclusion of defective date/statistic paragraphs, unique registry keys and Pending rejection. Full TypeScript check still fails with existing generated-Prisma/cascading errors; no diagnostics mention the two new loaders. No production import, approval or deployment. Preview → explicit consent → Pending → ADMIN review unchanged.

## Board-first batch — intact historical tables (2026-11-10)

Added **11 original board-source groups / 60 suggested answers** in `ssc-board-intact-tables-review.json`; no authored substitute questions or school stock added in this batch.

| Board/year | PDF header → question | Original task retained |
|---|---|---|
| Dhaka 2023 | 22 → 23 | Q4 Lipi matching, all 7 sentences |
| Cumilla 2023 | 28 → 29 | Q4 language/multilingualism matching, all 7 |
| Barishal 2023 | 36 → 37 | Q4 Pritilata matching, all 7; Q5–6 Jasimuddin information/summary, all 6 blanks |
| Dinajpur 2023 | 38 → 39–40 | Hakaluki haor passage39, Q5–6 table/summary40, all 6 blanks |
| Dhaka 2022 | 43 → 44 | Q4 air-pollution matching, all 4 sentences |
| Rajshahi 2022 | 45 → 45 | Q4 energy-resource matching, all 4 |
| Jashore 2022 | 47 → 48 | Q4 May Day matching, all 4 |
| Chattogram 2022 | 51 → 52 | Q4 Independence Day matching, all 4 |
| Dinajpur 2022 | 57 → 58 | Q4 English-communication matching, all 4 |
| Dinajpur 2020 | 78 → 79 | Q6 Bangladesh vision matching, all 5 |

All owning headers, question tables and both Unseen passages were visually checked. Source SHA256 reverified: `768d1d0b6f3c67ffe57187e64908a68f82f6a2553847642f840ea9f492946874`. Matching keys concatenate the exact original A/B/C fragments, with zero-based permutation mappings retained for audit. Original awkward grammar remains disclosed rather than silently repaired. Jasimuddin's fixed heading *Speciality: Pollikobi* is retained in the instruction; all original table rows and six blanks remain. Its 1978 award is described as posthumous, not personally received after death. Hakaluki area/population/species figures and relative time phrases are attributed source-era data, not fresh surveys. The 2041 Bangladesh vision is aspiration, not a guarantee or claim of achievements already realised.

### Preserving historical counts without padding or silent truncation

Previously the five-part practice schema blocked intact four-/seven-part matching and six-blank information tables. Added **narrow** compatibility for Class10/Paper1: Q4/2022 matching4 (original4marks), Q4/2023 matching7 (original7marks), Q5/2023 information6 (original6marks). It requires complete ordered original-part metadata, exactly the original number of subitems and an intact table; arbitrary count changes, wrong years/questions/marks, reordered/missing parts or missing rows/blanks fail validation. Ordinary generated questions and other grades keep their existing counts. This is not an approval bypass.

The practice blueprint totals remain unchanged: **5 total marks** for each matching/information task. An **always-visible practice note** explains the original count/marks and five-mark adaptation, even when optional board-source labels are hidden. These tasks should be graded across all retained parts using a teacher-approved distribution, not assumed to award one mark per part. Optional provenance now describes complete sets as all original parts intact, not misleadingly as a selected subset. This batch is not an intact historical whole-paper reproduction.

**Deduplication/holds:** 2023 Shahidullah repeats the already registered 2019 Unseen biography and was not added. Repeated 2022 Cumilla air-pollution, Sylhet May Day and Mymensingh English matching variants were held rather than padded into targets. 2023 matching with two indistinguishable “The day” rows, malformed pollution fragments, and the unsupported wood/biomass “will end soon” prediction remain held. Titanic/Lincoln/Milton/Einstein defective narratives and previous medical/date/missing-premise holds remain held. The 2022 information-transfer texts explicitly carrying textbook-unit labels have not been relabelled as new distinct Unseen works to inflate the Unseen target.

### Current cumulative review registry

- **194 groups / 1,076 suggested answers**: original-source **163 / 760**, separately labelled authored **31 / 316**.
- Complete Seen pair records **26** (9 original + 17 authored), still not 26 distinct underlying textbook works. Seen roles43 / unique displayed strings41 unchanged.
- Unseen information/summary pairs **15**: 13 five-blank pairs plus 2 intact six-blank pairs. All 15 displayed passages distinct; no repeated Shahidullah counted.
- Matching **32 original exercise groups**: 24 five-part, 3 seven-part, 5 four-part. This is **not** 32 standard five-part tasks; if a strict five-part-only quota applies, qualifying count is24.
- Rearranging30; poem groups8; story/episode groups8; completing-story33; dialogue25 unchanged.
- Numeric minimum deficits including supported original formats: Seen24 (plus distinct-work audit), Unseen35, matching8 (or16 under five-part-only criteria), rearranging10, poem32, story/episode32, completing-story7, dialogue15. No completed quota claimed.

Validation: **158/158 focused tests pass**, including **51 bank-model tests**. New regression coverage audits all 60 keys, matching permutations, all six blank labels/answers, source checksum/header/question/marks, assembly/year filtering, shared Unseen passage linkage, 70–90 word summaries, unique registry keys and Pending rejection. Negative tests reject historical-count metadata abuse and missing table content. Print/flow regression checks preserve every subitem, show adaptation notes with provenance hidden, and show original-vs-practice marks when provenance is enabled. Full TypeScript remains blocked by existing generated-Prisma/cascading errors; no diagnostics name the changed loaders, generation or board-source modules. No live import, approval, deployment or school-filter change. Preview → explicit consent → Pending → ADMIN review remains mandatory.

## Large authored-practice batch — three numerical minima reached (2026-11-10)

Added **38 groups / 102 suggested answers** in two explicitly labelled, source-independent supplements. These are **newly authored practice prompts**, not recovered board/school questions, official exercises, forecasts or official answer keys. No source PDF, checksum, school, board, examination year or historical marks are invented. This batch adds **zero original-exam groups** and makes no claim to finish original-exam recovery.

### Writing: 7 completing stories + 15 dialogues

`ssc-authored-writing-review.json` / `prepared-ssc-authored-writing.ts` adds:
- Stories: correcting science-fair measurements; making an exhibition accessible; checking a false examination notice; reporting a broken playground tap; welcoming a new classmate; community seed-sharing records; obtaining publication permission for a photograph.
- Dialogues: school waste separation; drinking-water concerns; verifying a viral claim; accessible events; cyclone preparedness; affordable varied diets; public-transport journey planning; evaluating school solar panels; safe support concerning imposed early marriage; comparing practical training; respectful debate; heritage visits; an inclusive science club; wetland/community conservation; non-disturbing wildlife observation.

Each story supplies an original beginning, a title and **exactly ten new continuation sentences**, with the exact beginning repeated before the answer continuation. Each dialogue has **twelve alternating turns** by the two participants named in its prompt. Answers are illustrative and teacher-reviewable, not the only valid response. Child/adult responsibilities, professional assistance, privacy, disability autonomy and safety limits are explicit where relevant. No risky repairs, wildlife handling, unsupervised rescue, chemical dosage, guaranteed harvest/job/power output or personal diagnosis is prescribed.

### Matching: 16 complete standard five-part tasks

`ssc-authored-matching-review.json` / `prepared-ssc-authored-matching.ts` adds **80 exact-fragment suggested answers**, each using five A, five B and five C fragments exactly once. Columns B and C are independently shuffled. Auditable zero-based answer mappings are retained in the data. Scenarios cover library catalogues, investigation records, family emergency contacts, bird observation, electricity use, museum documentation, accessible meetings, moderated discussion, lunch containers, image permissions, maintenance reporting, transport journeys, garden records, announcement verification, training-provider checks and waste prevention.

Different task categories deliberately share some educational themes; this does not create additional original works or examination sources. Within each category the communicative scenario/prompt is distinct. Exact-prompt uniqueness alone is not treated as proof of unique source works. Teacher review may accept other genuinely coherent matching combinations rather than treating suggested keys as official exclusive answers.

### Provenance and workflow

Every new task instruction **always visibly starts with “Authored practice — not a board or school examination question.”** Draft names also identify authored writing/matching. The label survives assembly and print fragmentation with optional provenance hidden. No new task carries `boardSource`, `schoolSource`, a fabricated passage or a false source reference. Board-year selection excludes all 38. The numerical practice targets below do **not** mean original-source quotas have been fulfilled. Preview → explicit consent → Pending → ADMIN review remains mandatory; no database import, approval, push or deployment performed for this batch.

### Latest cumulative quantities

- **232 review groups / 1,178 suggested answers**.
- Original-source stock unchanged: **163 groups / 760 answers**. Explicitly authored stock: **69 groups / 418 answers**.
- **Completing story: 40** = 33 original-source + 7 newly authored. Numerical minimum40 reached **including authored practice**.
- **Dialogue: 40** = 25 original-source + 15 newly authored. Numerical minimum40 reached **including authored practice**.
- **Matching: 48** = 32 original-source + 16 newly authored. Composition: **40 standard five-part tasks**, 3 intact seven-part and 5 intact four-part tasks. Both the 40–60 overall range and a minimum40 standard-five-part practice count are reached **including authored practice**. Only24 of those standard-five-part tasks are original-source.
- Unchanged: complete Seen pair records26 (not26 distinct underlying works); Unseen15; rearranging30; poem comprehension8; story/episode comprehension8. Seen displayed roles43 / unique strings41 unchanged.
- Remaining numeric minima: Seen **at least24** (distinct underlying-work requirement may need more), Unseen35, rearranging10, poem32, story/episode32: **at least133 further groups**. No overall completion claimed, no literature episode inflation, and no authored practice relabelled as recovered original stock. School-name filtering remains a separate pending feature; this batch does not fabricate school affiliations to populate it.

Validation: **161/161 focused tests pass**, including **54 bank-model tests**. New coverage checks all 38 unique keys and 102 answers; exact story beginnings and ten-sentence continuations; twelve alternating named dialogue turns; all matching fragments/column permutations; source-free authored provenance; target counts including standard-five-part matching; exclusion from board-year filters; Pending rejection; assembly preservation; and always-visible disclaimers in the print/flow path. `git diff --check` passes. Full TypeScript check still exits2 on existing missing-generated-Prisma/cascading errors; no diagnostics name either new loader. This is not a claim of a passing full project typecheck or a newly rerun whole-repository suite.

## Remaining-practice expansion and approved-school selector (2026-11-10)

Added **45 explicitly authored groups / 290 suggested answers**:

- `ssc-authored-unseen-review.json` / `prepared-ssc-authored-unseen.ts`: **35 distinct original fictional passages**, each with a complete five-blank information table and a separately paraphrased **70–90 word** summary: **210 answers**. Concrete table details are explicitly present in the linked passage. Every passage visibly identifies itself as fictional authored practice, and both task instructions retain authored disclosure. Events, names and quantities are fictional practice data, not exam stock, reported events, source-derived biographies, current statistics or proof of causation. No board/school/PDF/checksum attribution is fabricated.
- `ssc-authored-rearranging-review.json` / `prepared-ssc-authored-rearranging.ts`: **10 original fictional eight-sentence narratives / 80 position keys**. Each retains its full coherent narrative, exact shuffled sentences, a complete eight-letter key and per-sentence positions. Referential/time dependencies support the intended order; genuinely coherent alternatives remain a teacher-review judgement. No historical or literary attribution invented.

Unseen scenarios cover mobile book access; shaded-route mapping; an audio archive; reusable market baskets; shared study space; oral-history consent; reusable exhibition signs; a clouded sky-observation event; garden access; communication signals; map corrections; practical-training information; festival translation; reading formats; stream observations; repair appointments; shared courtyards; weather records; family food memories; captions; beginner chess; museum loans; temporary collection notices; clothing exchange; a local-history walk; equipment registers; an audio route guide; weather postponement; mural permission; transport signage; plant identification; magazine corrections; intergenerational games; donated computers; and opening-hour consultation. Similar educational themes can appear in other task types, but the passages are distinct cases rather than alternative question sets on one passage. This adds **zero recovered original examinations** and zero new Seen textbook works or attributed literary works.

All new scenarios preserve relevant uncertainty, privacy/permission, study limitations and adult/qualified responsibility. They do not prescribe technical repairs, dangerous collection/handling, medical treatment or guaranteed social/educational outcomes. Unseen passages are deliberately compact SSC-level practice, not certified official examination length or difficulty. Keys and language level still require teacher review.

### School-name filtering implemented — approved stock only

Added `components/english-source-filter.tsx` to **both SSC first-paper builder entry points** (auto-model and selected/full setup):
- Retains board-year selection and adds an **alternative school-name dropdown**. Selecting a school clears board year; entering a board year clears school. The server rejects mixed board-year/school filters instead of guessing their meaning.
- `listEnglishBankSchools` requires an authenticated non-student user and SSC grade9/10, then reads the existing paginated **APPROVED**, answer-complete, grade-matched reusable bank. It does not expose draft/Pending review candidates as available school stock. Names are exact source metadata, not a prestige ranking or fabricated affiliation. Duplicate exact names are collapsed; uncertain spelling variants are not silently merged.
- Only homogeneous reusable atomic groups supply options. A mixed-school Seen group cannot advertise itself as fully belonging to either school. No board-only or source-free authored practice contributes a school option.
- Assembly applies the school filter to atomic groups, requiring **every task** in a selected group to carry that exact school name. Other schools, boards, unknown sources and authored practice cannot fill gaps. Missing requested items return an explicit school-scoped error without saving a fallback draft or calling AI.
- Loading, authenticated/empty-stock notices, failure/retry handling, stale-response cancellation, grade changes and busy controls are covered. No approved school candidates currently available means an honest empty option list, not auto-importing or approving review records to populate it.

### Latest cumulative review quantities

**277 groups / 1,468 suggested answers** = **163 original-source groups / 760 answers** + **114 explicitly authored groups / 708 answers**.

| Category | Current review count | Minimum target status |
|---|---:|---|
| Complete Seen pair records | 26 | Unfinished; at least24 more numerically, plus distinct-underlying-work audit |
| Unseen information/summary pairs | **50** | Numeric minimum reached: 15 original-source + 35 authored fictional |
| Matching | **48** | Numeric range reached; 40 are standard five-part tasks, including authored practice |
| Rearranging | **40** | Numeric minimum reached: 30 original-source + 10 authored |
| Poem comprehension groups | 8 | 32 groups short; not a claim of 8 distinct original works |
| Story/episode comprehension groups | 8 | 32 groups short; several Merchant episodes are still one play |
| Completing story | **40** | Numeric minimum reached including 7 authored |
| Dialogue | **40** | Numeric minimum reached including 15 authored |

Five numerical practice-category minima are now reached. **Overall task is NOT complete**: at least **88 further Seen/literature groups** numerically, potentially more to satisfy genuinely distinct complete readings/works. Original-examination quotas are not satisfied by source-independent authored supplements. To fulfil distinct-work literary targets, additional eligible works/source material are needed; recycling the same poem/play with new questions or inventing attributed passages would not satisfy that requirement. School selector implementation is complete, but approval/deployment and approved stock population are separate from implementing the filter.

Validation: **167/167 focused tests pass**, including **60 bank-model tests**. Added coverage of all 35 shared Unseen passages/175 table answers/35 summaries; exact table-answer support; uniqueness; all ten narrative permutations and 80 unchanged sentences; complete minima; no fabricated provenance; source filters; Pending rejection; assembly/print preservation. School regressions test validation before database reads, authentication/grade restriction, approved-only options, de-duplication, mixed-school exclusion, no fallback/save on missing stock, preservation of true metadata, mutually exclusive UI choices, failure/retry, ignored stale responses and empty-stock messaging. Full TypeScript check still exits2 on existing generated-Prisma/cascading errors; no diagnostics name the changed school-filter/action/assembly modules or new loaders. `git diff --check` passes. No production import, automatic approval, push or deployment; preview → explicit consent → Pending → ADMIN review remains mandatory.

## User-approved same-text completion — 2026-11-10

Supersedes the preceding *remaining numerical groups* status, not its distinct-source limitations. The user explicitly selected **additional question sets on the existing SSC works** rather than additional source works. This revised numerical review-bank scope is complete: **365 groups / 2,268 suggested-answer occurrences**. These are not 2,268 unique or newly authored answers.

| Category | Completed review stock |
|---|---:|
| Complete Seen pairs | 50 |
| Unseen information/summary pairs | 50 |
| Matching | 48 |
| Rearranging | 40 |
| Poem comprehension sets | 40 |
| Story/episode comprehension sets | 40 |
| Completing story | 40 |
| Dialogue | 40 |

The additional 88 groups comprise 24 same-text Seen pairs (288 newly worded questions/keys) and 64 same-work literary sets (256 newly worded questions/keys plus 256 explicitly reused foundation occurrences). Each literary set contains four new and four reused questions; JSON records foundation indices and counts, and displayed instructions disclose reuse. All new groups are authored practice, not recovered board/school originals, and retain existing source pages/checksum. Existing Seen passage-role coverage is 67 occurrences / 41 unique exact passage strings; same-text variants do not add distinct readings. The selected literary supplement still covers seven poems and five independent story/play works; three Merchant episodes do not become three plays. The original distinct-reading/work quotas are **not** met or claimed by this scope revision.

Cumulative provenance split: 163 original-source groups / 760 answer occurrences and 202 authored groups / 1,508 answer occurrences. Authored totals include reused foundations and earlier supplements, not a uniqueness claim. All content remains teacher-review stock; no live import, approval, deployment or fabricated school attribution. Preview → explicit consent → Pending → ADMIN review is unchanged. Approved-only school/year filtering and no-fallback behavior remain intact.

Validation: **169/169 focused tests pass**, including **62 bank-model tests**; the new regressions check exact same-text/source-page preservation, option uniqueness/key membership, 24/64 batch sizes and explicit 4+4 reuse. `git diff --check` passes. Full TypeScript check remains blocked by generated-Prisma/cascading errors (exit 2); no diagnostics name either new variant loader. No full-build success is claimed.
