# Class 6 English 1st Paper — initial source and topic mapping

## User-selected scope
English 1st Paper, topic-wise bank and model-test marks distribution, using applicable official guidance. Not English 2nd Paper, SSC, HSC, or a generic 100-MCQ/30-CQ template. No change to existing website categories or production marking schemes.

## Work completed
- Located the supplied Drive source: `1i_BLt2iONFk6w1y7mmDBDHHQDuVa5t5J`, labelled ২০২৬ — English For Today.pdf, under the Class 6 English For Today folder `18mfk-ssn6NHM7Gj2F1gu2VZ740u9nmD0`.
- Attempted Drive PDF text extraction, then the provider-requested single retry. Both returned provider_unavailable. No full reading, OCR, edition verification, or source-page alignment is claimed.
- Captured all 33 existing website lesson labels without adding categories. Book contents still need independent reconciliation.
- Established 13 candidate assessment slots, with marks and duration deliberately null. These are research candidates, not an official approved exam template.

## Sources inspected and limits
1. Official NCTB notice: https://nctb.gov.bd/site/notices/7ded5854-8663-4704-848d-70031dfa7eec (redirected to https://nctb.gov.bd/pages/notices/6922e919dbfbab28ce0abfac). Fetch returned its title, which mentions revised Class 6–9/10 structures and assessment guidance, but not the underlying English assessment attachment. Its title also includes SSC 2026: this alone does NOT establish that every attachment is Class 6 guidance for 2026. Official marks, applicability and duration remain unverified.
2. Secondary example: https://skylarkeducation.com/marks-distribution-for-class-6/ claims Reading 70 / Writing 30, but the extracted individual reading entries sum to 65, giving 95 overall. Do not silently change summary marks from 5 to 10 to manufacture a 100 total.
3. School-specific cross-check: https://cpscs.edu.bd/wp-content/uploads/2025/03/Six-English-Version-Syllabus-2025.pdf is a school syllabus for 2025, not official national 2026 confirmation.
4. Commercial guide listings show candidate reading/writing skills, but are not government authority. Do not rely on them for official certification or copy guide answers.

## Authoring and validation requirements
- Read each full lesson before tagging seen passages or poems; a lesson title alone is not evidence of genre or exam eligibility.
- Keep a passage with its dependent questions and solutions as a unit. Assign one passage ID; do not select orphan questions during model assembly.
- Seen and poem tasks need exact verified book page locators. Unseen passages and writing prompts must be original and clearly distinguished from textbook extracts.
- Preserve native English test forms: vocabulary in context, information transfer, cloze, true/false (corrections where required), matching, sequencing, summaries, poem responses, story/paragraph/dialogue writing. Do not encode them as non-math four-part CQ merely to satisfy the old importer.
- Verify choice counts (offered versus required), item marks, section totals, overall total, answer-key consistency, lexical ambiguity, unique matching/rearrangement solutions, and passage coverage.
- Writing solutions are model answers, not the only acceptable wording. Add age-appropriate analytic rubrics after official marks are confirmed; summary length must follow the applicable instruction, not an invented universal rule.
- Maintain separate question paper and answer key. Teacher approval and live import/publication remain separate operations.

## Current status
Research/topic-mapping Draft only. No questions authored, no model test certified, no official marks set, no prepared-library registration, Drive backup upload or website import performed. Next step is source/attachment retrieval, then verified lesson-level mapping and topic-wise question authoring. Blueprint is reproducible from existing catalog labels but intentionally not an executable test template until official verification succeeds.

## User-supplied Abswer guide URL inspected
URL: https://www.abswer.com/class-6-english-1st-paper-guide-book/
Read both returned page chunks. Page currently labels itself **2027**, not the supplied Drive book's 2026 label. It is a third-party guide page, not government assessment authority.

The marks table claims Reading 60 / Writing 40, Q1–7 / Q8–11, and includes Informal Letter. Later on the SAME page the item-wise practice list instead gives Q1–4 seen, Q5–7 unseen, Q8 matching, Q9 rearranging, Q10 poem, Q11 story, Q12 paragraph, Q13 dialogue. These are inconsistent structures; neither is silently substituted for verified official guidance. The lower list agrees with the 13 candidate skills in the research blueprint, but does not verify their marks. Lesson list includes 33 titles corresponding to existing catalog labels; this remains secondary corroboration, not actual textbook page reading.

The fetched tables contain blank PDF cells; no usable lesson/model-test PDF URLs were exposed by the text fetch. Do not claim guide PDFs or model answers were read or downloaded. Retain this page as a supplementary topic/resource index only, and keep officialDistributionVerified=false and readyForModelTestAssembly=false.

## Original skill practice started (supersedes research-only authoring status)
Authored `original-skills-001.json`: an original school-garden unseen passage with 7 MCQ, 5 short answers, 5 contextual gaps, 5 vocabulary prompts, 5 information-transfer cells, 5 true/false items with false-statement corrections, a model summary, 5 matching pairs, an 8-sentence rearrangement and three writing tasks (story, paragraph, dialogue). These constitute 12 activity groups, not 12 full model tests. Full model answers and qualitative assessment guidance are included. `practice-001-questions.md` and `practice-001-answers.md` separate student tasks from teacher solutions; generator supports --check.

These are original topic/skill exercises, not representations of read textbook passages or certified official assessment slots. Marks and duration remain unset. No poem/textbook-seen tasks invented. No fixed official writing word count imposed. The theme is not asserted as a specific textbook lesson. Independent teacher review of language/difficulty, alternative responses and matching/rearrangement uniqueness remains pending.

Validation: three focused Node tests pass; generator --check passes. No Drive upload, website registration/import or approval occurred. Source-reading and official-assessment blockers still apply, but they do not prevent creating clearly labelled original unseen/writing practice.

## Continued authoring: original practice 002–003
Added two distinct passage-based skill packs: **A Visit to the Local Museum** (observation, evidence and responsible visits) and **Listening to the Rain** (safe reporting, records and cautious conclusions). Each has 12 activity groups and three model writing responses, with separate student paper and teacher answer/rubric files. Neither passage claims textbook origin, lesson eligibility or an official marks allocation. Museum questions do not invent the missing date; rain questions do not diagnose a confirmed flood cause or encourage children to handle drains/waste.

Cumulative original practice: 3 packs, 3 unseen passages, 36 activity groups; 21 MCQ, 15 reading short answers, 15 gaps, 15 vocabulary prompts, 15 information-transfer cells, 15 true/false statements with corrections, 3 summaries, 15 matching pairs, 3 rearrangement sets (8 sentences each), and 9 writing tasks (3 each story/paragraph/dialogue). Activity groups, sub-items and offered sentences are not interchangeable question-count totals. All are Draft and unregistered. Original thematic skill practice is not completion of any of the 33 textbook lessons. No Drive upload, live import, approval or publication occurred.

Reproduce: first `python3 scripts/question-bank/build-class6-english1-practice.py`, then `python3 scripts/question-bank/build-class6-english1-more-practice.py`; both support `--check`. Structural tests cover all three packs; semantic/difficulty review remains pending.

## Source retrieval recovered: 2026 NCTB textbook and sample verified
Earlier extraction blockers are superseded for selected pages: Drive raw download succeeded. Verified exact source ID, 20,602,886 bytes and MD5 `3b8641efcb620390205ee5c258eeff09`; SHA256 `bc5a1b181b3f60fe35594a061c875d9e5d3d3f42df16296b33b738bdb30c6e3d`. PDF has 115 pages, largely scanned. The cache source/rendered images are not committed. No full OCR/full-book reading claim.

Visually read PDF 2 (title: Class Six, revised for 2026), 3 (October 2025 revised edition), 4 (preface for academic 2026), 5 (complete 33-lesson contents), 6–8 (complete Lesson 1, printed 1–3) and 9 (start of Lesson 2, boundary confirmation). Reconciled every catalog lesson's printed/PDF range from the contents: offset +5. Ranges from contents are not proof that the remaining lessons have been read.

Also visually read **printed 101–105 / PDF 106–110**, containing the complete NCTB textbook sample question paper. It states **3 hours / 100 marks / Reading 70 / Writing 30**. Q1–13 marks: **7, 10, 5, 5, 5, 5, 10, 5, 8, 10, 10, 10, 10**. Q7 summary is explicitly **10**, not the 5 in the inconsistent secondary transcription. This is now verified directly, not an arithmetic repair. Q10 offers eight poem questions, any five at 2 marks each. Q11 asks for a title and at least ten new sentences; Q12 requests 120 words. These details belong to this supplied textbook sample. Separate circular applicability is still not independently confirmed; do not label that as verified. Do not blindly copy the sample's poem interpretations without reading the underlying poem.

Lesson 1 source units: Section A is Tarun's information form (printed 1); Section B is his school-day narrative (printed 2); Section C includes **“Let's Play”, credited to Kate Greenaway** (printed 3). Authored `lesson-01-source-draft.json`: 7 MCQ, 5 short answers, 5 cloze gaps, 5 vocabulary prompts, 8 poem questions/answers and one original 120-word paragraph with assessment guidance. No invented reason for the move or confident school-name inference from an illustration. Word-meaning prompts distinguish a greeting's warmth from physical heat. Poem answers distinguish invitations from reported results. The original personal paragraph is explicitly not Tarun's biography.

This is a source-read lesson practice pool, not a complete marked model, not an approved bank, and not a website import. The mixed A/B cloze and MCQ sources must stay labelled; do not package the combined items as one passage block in a full examination. Existing original unseen packs retain their original provenance and unset marks.

## Next sequential step: Lesson 2
Re-downloaded the same source after ephemeral cache loss and checked its SHA256 against the recorded value. Visually read printed 4–6 / PDF 9–11 completely; PDF 12 confirms the start of Lesson 3 (not a full Lesson 3 reading). Lesson 2 covers good-news congratulations, thanks and sympathetic bad-news responses across separate dialogues. Authored 7 MCQ, 7 reading short answers, 5 contextual vocabulary prompts, 5 functional-language situations and one original 10-turn dialogue. Sources are recorded per item. No poem exists here; no poem questions added. Manik only *thinks* he dropped the pen; no certain location invented. Rahul's album is of Lalon's songs. A supportive reply after bad news is allowed; the language-focus observation is not treated as a ban on speaking. Original writing characters are explicitly distinguished from textbook characters.

Generated separate student/teacher Markdown for both lessons 1 and 2, including answer alternatives, explanations and writing guidance. Reproduce after the lesson 1 generator using `python3 scripts/question-bank/build-class6-english1-lesson2.py`; supports `--check`. Both pools remain incomplete-capacity Draft practice, unregistered and unapproved.

### Sequential completion tracker
- Source identity, edition, contents mapping and textbook sample marks: verified for supplied book; separate circular pending.
- Lessons 1–2: complete source reading and initial practice pools done; final content/teacher review pending.
- Lessons 3–33: complete source reading and question authoring pending (31 lessons).
- Full 100-mark model assembly and answer/rubric validation: pending.
- Drive class→subject→lesson versioned backups: pending.
- Website Pending import and subsequent authorised approval: pending; no bypass or autoapproval.

## Sequential step: Lesson 3
Visually read complete printed 7–8 / PDF 12–13. Authored `lesson-03-source-draft.json` plus separate student/teacher Markdown: 7 MCQ, 5 reading answers, 5 vocabulary prompts, one summary, one source-picture description and one original fair paragraph. The passage names Dhaka as the destination, not the departure city; narrator/station/train names and timetable are not invented. The resting question is explicitly a supported inference. Picture observations do not assign passage characters to unidentified people. The seen summary is supplementary practice, not an unseen Q7 claim. Vocabulary guidance flags the book's context-dependent quiet/busy contrast and accepts put down as the direct opposite of lifting (rather than insisting on dropping luggage). No poem padding.

Reproduce with `python3 scripts/question-bank/build-class6-english1-lesson3.py` (or `--check`). Progress supersedes the prior tracker: lessons 1–3 now have complete source reading and initial Draft pools; 30 lessons remain. Final teacher review, complete model tests, versioned Drive backup and website import remain pending. No background execution is implied between turns.

## Continued batch: lessons 4–10
Downloaded the identical 20,602,886-byte source and rechecked recorded SHA256. Visually read **printed 9–36 / PDF 14–41**, including complete lessons 4–10. This is selected-page review, not a full-book claim. Seven new source-labelled Draft pools and separate student/teacher Markdown papers are reproducible from generators `build-class6-english1-lessons4-7.py`, `build-class6-english1-lessons8-9.py`, and `build-class6-english1-lesson10.py`; each supports `--check`.

- Lesson 4: 7 MCQ, 5 answers, 5 vocabulary prompts, 2 language-use questions and an original dialogue. Robert's origin (Australia) differs from immediate departure (London). The boy's reason for crying is uncertain. Printed-dialogue reading does not claim listening assessment.
- Lesson 5: 7 MCQ, 5 answers, 5 vocabulary prompts, 5 verb-form tasks and an original community-helper paragraph. Respect worker dignity; illness is not the worker's fault. No dangerous pupil waste handling.
- Lesson 6: 7 MCQ, 5 answers, 5 vocabulary prompts, 5 verb-choice tasks and an original food dialogue. School opening/holidays are story-specific. Distinguish present activity, temporary duties and states without universal grammar overclaims.
- Lesson 7: 8 source-poem questions with supported model interpretations, 5 vocabulary prompts including multiple meanings, and 1 sentence-writing task. Author credited as Leonore M Link. No invented explicit moral; no fabricated prose-MCQ block.
- Lesson 8: 7 MCQ, 5 answers, 5 vocabulary, 5 quantity-reading and 5 functional-language questions, plus an original shopping dialogue. Section A requests 0.5 kg potatoes; Section B requests 2 kg and adds salt. Both quantities are retained with separate section/page labels. Section B lists nine types of goods. Bill 535, payment 550, change 15. Simplified some/any guidance does not disallow some in requests. Classroom prices are not current market claims.
- Lesson 9: 7 MCQ, 5 answers, 5 vocabulary and 1 health-habits paragraph. Medical-advice matching/brand examples are excluded pending clinical review. F2 is complete printed text; unavailable listening audio is not guessed. Healthy habits are not a guarantee against illness or grounds for blame.
- Lesson 10: limited safe-language/history pool: 5 MCQ, 5 answers, 5 vocabulary and 1 original supportive dialogue. Complete source visually read, but treatment recipes, doses, product advice, efficacy guarantees and alleged absence of side effects are quarantined, not endorsed. Natural substances also contain chemicals; the book's natural/chemical split is not used as scientific classification.

Validation: 16 focused English tests pass, covering source identity, keys, distinct MCQ options, page mappings, student/teacher separation, counts and preserved safety/ambiguity qualifications. Short grammar answers may appear as choices or words in prompts; separation tests reject standalone keyed-answer lines rather than falsely flagging every repeated word. All eight English generators pass `--check`. Final semantic/difficulty/teacher review remains pending.

**Current progress supersedes earlier trackers:** complete source reading and initial Draft pools for lessons **1–10**; lessons **11–33 (23 lessons)** remain. No exhaustive chapter quotas or full 100-mark models completed. No website registration/import/approval/publication. Drive backup status is tracked separately by receipts; an archive backup is not a live import and an archive's internal chapter folders are not separate browsable Drive lesson folders.

## Continued batch: lessons 11–19
Source SHA256 reverified after cache loss. Visually read **printed 37–60 / PDF 42–65**, completing the printed material in lessons 11–19. Generated nine new source-labelled initial Draft pools and separate student/teacher papers using `build-class6-english1-lessons11-16.py` and `build-class6-english1-lessons17-19.py`, both supporting `--check`.

- Lesson 11: five printed-word tasks, five meanings and an original sentence task. No exact audio key or assessed speech claim.
- Lesson 12: seven MCQ, five answers, five meanings and an imagined travel paragraph. The word “Unseen” in the lesson title does **not** make this textbook text an unseen exam passage. Travel services/time are source statements, not current guarantees; named groups are not treated as independent ethnographic classification.
- Lesson 13: seven MCQ, five answers, five meanings and a national-day paragraph. Questions distinguish Victory Day from Independence Day; the source's loose “got independence” wording for 16 December is not propagated. Section B listening blanks have no guessed exact key. Sample ceremony is not a current schedule.
- Lesson 14: seven MCQ, five answers, five meanings and a story-interpretation paragraph. Complete story credited to Janet Allison Brown. Opinions allow reasoned disagreement; no zoological inference from talking animals.
- Lesson 15: seven MCQ, five answers, five meanings and a respectful support paragraph. Section A's Rajshahi setting conflicts with the sample letter's Dhaka address: neither is silently corrected or merged. The home is proposed, not already operating. No stereotype that all older people are helpless.
- Lesson 16: eight poem questions/answers, five meanings and a short written explanation. Source credit Christina Georgina Rossetti. Rainbow interpreted as an imaginative bridge, not literal construction or the sample question's misleading paraphrase.
- Lesson 17: eight poem/language questions, five meanings and a study-skills task. “The Chaos”, credited Gerard Nolst Trenité, is an abridged humorous poem. The speaker's ages are not asserted as biography; accent-sensitive rhyme claims are not universal rules.
- Lesson 18: seven MCQ, five answers, five meanings and a supervised-snack paragraph. Read whole recipe lesson, but do not direct children to use sharp knives, hot oil or a stove unsupervised; source times/egg counts are not food-safety or nutrition guarantees.
- Lesson 19: five verse answers, three meanings and a learning-habits paragraph. The anonymous short verse is not a complete road-crossing procedure. Exact listening narrative on printed 60 remains unfilled without audio/script.

Validation: **26 focused English tests pass**, with all ten English generators passing `--check`. This is structural/provenance and selected semantic-constraint validation, not qualified teacher approval. Backup packaging now takes an explicit version, derives lesson counts from actual files, checks contiguity/checksums and refuses to overwrite an existing archive.

**Latest progress:** complete printed source reading and initial pools for **lessons 1–19**; **14 lessons (20–33)** remain. Oral/listening assessment still needs actual audio or verified teacher-led materials. Full marked model papers, final teacher review, separate browsable Drive lesson folders and website import/approval remain pending. Versioned archive backup receipts are kept separately; v001 covers only lessons 1–10 and is not silently replaced by later work.

## Initial coverage milestone: lessons 20–33 and Model 01
Visually read **printed 61–100 / PDF 66–105**, completing review of all **33 printed lessons (printed 1–100 / PDF 6–105)**. The full-PDF-read flag stays false because not every cover/back-matter page was inspected. Fourteen final initial lesson pools have separate questions/answers. This completes first-pass lesson coverage, not exhaustive chapter quotas, all textbook exercise solutions or teacher approval.

Specific source qualifications retained: Hason Raja dates/totals are attributed to the passage; Taj Mahal area and time-sensitive Eiffel Tower figures are not assessed as independently verified facts; space-travel speculation is distinguished from actual human travel; lesson 23's US/UN peacekeeping inconsistency is excluded from scored factual questions; migrant workers are not blamed for exploitation and no current wage/visa guarantees are offered; song lyrics are not copied into lesson answers; story clothing prices are not current prices; André's family theme is not imposed on pupils with different or unsafe family circumstances; lessons 28/29 oral and exam rules are not universal policies; no final holiday destination is invented in lesson 30; water-hazard tasks do not direct pupil rescue work; lesson 32's June invitation/April thank-you chronology is flagged; The Garden's talking seeds and fear are literary personification, not botanical causes.

`build-class6-english1-model01.py` produces the **first complete marked Draft paper**: Q1–13 marks **7,10,5,5,5,5,10,5,8,10,10,10,10**, Reading 70/Writing 30/180 minutes. Seen S1 is manually transcribed from Lesson 5 printed 14–15; S2 from Lesson 9 printed 30 (punctuation/line-wrap normalisation). U1 reuses the original museum practice passage, explicitly marked for replacement if learners have seen it. Matching and rearrangement use original practice material; MCQ options are reproducibly shuffled. Poem pool offers two questions each from Holding Hands, Boats Sail on the Rivers, The Chaos and André, all read from the supplied book. No full poems reproduced. Writing includes a titled model story with eleven new sentences, a 120-word model paragraph, and an original ten-turn dialogue. Summary/writing component rubrics total their allocated marks; detailed partial-credit and excess-answer policies are explicitly author-proposed, not claimed official rules.

Created `REVIEW-HANDOFF.md` with actual per-lesson inventory, student/teacher files, reproducibility steps and remaining gates. Full initial-coverage and model integrity tests pass alongside prior tests. **43 focused English tests** pass; **all 12 content generators** pass `--check`. No full application test/build is claimed for this content-only batch.

**Latest state:** initial Draft coverage for all 33 lessons, three original unseen skill packs and one complete Draft model paper. Still pending: qualified teacher review, factual/clinical qualifications, actual listening audio/scripts, separate current circular confirmation, additional model papers if requested, separate browsable Drive lesson folders, website-format conversion/import and authorised approval/publication. No production data or approval controls changed. Backup receipts separately record archive versions without silently overwriting old versions.

### Source locator correction (v005 supersedes v003)
The physical PDF scan has reordered pages: a uniform printed+5 formula was wrong. `printed-to-pdf-pages.json` now explicitly maps all printed pages 1–100 to physical PDF pages 6–105, based on visual reading. All shared source references and generated lesson papers have been rebuilt from this map. Examples: printed 14→PDF18, 38→45, 61→67, 84→92, 88→90, 100→104. Model S1 now correctly cites PDF18/20. Previous archive versions remain historical; **use v005 or later for corrected source locators**. This fixes source attribution, not teacher approval.
