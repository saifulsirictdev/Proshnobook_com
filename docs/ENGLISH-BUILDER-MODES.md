# English first-paper builder: Lesson / Question item / Full Model Test

## Confirmed scope
This new system is **only for English 1st Paper**, grades 6–12, including SSC/HSC grouped class aliases and the catalog's English For Today/Bangla subject labels. English 2nd Paper keeps the original starter topics/question-type selector, original setup defaults and Selected Parts/Writing Only behaviour. No automatic writing defaults, grouped-topic entry or approved-source auto-lookup is applied to second paper.

## User flow
`Class → English 1st Paper → Topic-wise / Full Model Test`

### Topic-wise → Lesson / Question item
- **Lesson** preserves the exact old catalog topic names and group headings. A selection opens the existing question-bank picker with that exact class, subject and topic; it does not send English into generic CQ AI preparation. Existing approval/ownership visibility, payment and saved-paper checks remain in force. An empty bank stays empty; selecting a lesson does not mean Draft lessons have been imported or approved.
- **Question item** opens native English setup with the selected task(s). No question-bank categories are rewritten.

For **Class 6 first paper only**, the eight groups follow the user's screenshot `Screenshot_2026-11-18-15-14-25-38_40deb401b9ffe8e1df2f1cc5ba480b12.jpg`:

| Selector | Selected template tasks |
| --- | --- |
| Q1–4 Seen Comprehension / Passages | MCQ, comprehension, gaps, vocabulary |
| Q5–7 Unseen Comprehension / Passages | Information transfer, True/False, summary |
| Q8 Matching | Matching |
| Q9 Re-arranging Sentences | Rearrangement |
| Q10 Answering Questions from Poems | Poem questions |
| Q11 Completing Stories | Story completion |
| Q12 Writing Paragraph | Paragraph |
| Q13 Writing Dialogue | Dialogue |

Selecting Seen or Unseen selects the complete group, not just its first task. Group membership is resolved from a server-side whitelist for that grade; foreign/malformed group parameters cannot add tasks. Individual legacy item URLs remain supported for first paper.

**Grades 7–12 do not copy these screenshot groups.** Their numbered Question item lists are built from their own existing `englishBlueprint(grade, 1)` tasks. Those practice templates are user-supplied references, not newly certified current official circulars. The individual numbering respects junior, SSC and HSC differences.

### Full Model Test
No lesson/question-item selection is required. The first-paper setup selects every part of the grade's template, shows its total marks and supplies editable practice writing prompts automatically. An explicit generation button avoids spending quota on a dropdown change. The existing generator still validates source sharing, counts, marks and complete output, then opens the private English editor/preview/print flow.

## Information gaps (reported, not invented)
- **Class 6 first paper:** all 33 lesson names exist in the catalog.
- **Class 7 first paper:** the old catalog contains question-pattern headings/model-test headings, not a textbook Lesson/Unit contents list. The old topics remain available under Lesson as requested, with a visible warning that the actual textbook contents are needed. No fabricated lesson names are supplied.
- **Class 8 first paper:** existing textbook Unit 1–11 topics and the old supplementary writing/pattern groups are retained.
- **Classes 9–10 first paper:** existing catalog is stored under `Class 9`; its Unit 1–16 and supplementary topics are retained for both grades.
- **Classes 11–12 first paper:** existing 12-unit HSC catalog is retained.
- **Grades 1–5:** no English blueprint/catalog is supplied in this repository; no new syllabus or model flow is invented for them.

Catalog presence is not independent verification of textbook edition, current circular applicability or adequate bank question stock. Question item information exists in the repository for every supported grade 6–12; the known missing first-paper *lesson* contents are Class 7.

## Full-paper source safety
A read-only authenticated first-paper-only action searches at most 1,000 `english-review:` snapshots. Only APPROVED records passing complete draft validation, matching the exact grade/paper, may supply shared textbook extracts/references. Pending/malformed/foreign-grade snapshots and private owner drafts are excluded. Lookup does not invoke AI, create a draft, change approval or consume generation quota. Late source responses from an earlier class/mode are ignored; teacher-edited sources are not overwritten.

If the approved pool lacks a required seen passage, poem or story, the teacher must supply the exact textbook extract/reference. No invented passage is labelled NCTB seen text. Lookup failure leaves manual entry available. Current official circular applicability still needs verification. Auto writing topics are editable practice prompts, not mandatory syllabus topics.

Other subjects, Job/Admission English and the existing append-to-paper flow remain unchanged. No database schema/category, role, wallet, publication or auth bypass was added.

## Validation
- 65 focused tests pass: English generation/actions/blueprints, first-only scope, rendered nested selectors, all grades, screenshot group membership, exact old lesson preservation, grouped entry validation, missing Class 7 lesson notice and Job/non-English regressions.
- `git diff --check` passes.
- The prior PR revision passed both GitHub security CI and Vercel. Updated checks must be evaluated for the new head; old green checks are not proof of the new revision.
- Local full typecheck/security tests require Prisma Client generation, whose engine download host is blocked in this sandbox. No successful full local build/typecheck or live database/AI generation is claimed.
