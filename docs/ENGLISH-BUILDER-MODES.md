# English builder: Topic-wise / Full Model Test

## User flow
For supported school grades **6–12**, selecting an English subject (including both papers and SSC/HSC grouped class aliases) in `/question-builder` now shows the next field:

- **Topic-wise**: a second selector lists the class/paper blueprint's native English task topics, grouped by reading/grammar/writing. Choosing a topic opens the English setup with that exact task selected. These are examination task topics, not invented textbook chapter categories. Users may customise the task and provide its required textbook text/writing topic.
- **Full Model Test**: no per-topic selector. The next screen selects every part of the relevant class/paper template, displays the full marks, and supplies editable practice writing prompts automatically. Generation remains an explicit button action so a dropdown change cannot spend quota or create drafts.

This changes the builder's navigation, not the persisted question-bank catalog or database categories. Other subjects, Job/Admission English and the existing append-to-paper flow retain their original selection/preparation behaviour. Grades 1–5 have no English blueprint here; no unsupported syllabus is invented.

## Full-paper generation and source safety
The existing English generator still owns marks/counts, answer options, account quota, recovery, private draft ownership, output validation and editor/print/save navigation. No approval, role, wallet or price check was bypassed.

For full mode a read-only authenticated server action searches at most 1,000 `english-review:` snapshots. Only records marked APPROVED, passing complete draft validation, matching the exact grade and paper, may supply shared textbook extracts and references. Pending/malformed snapshots and other users' private owner drafts are excluded. The lookup does not call an AI provider, create a draft or consume generation quota. Late results from a previous class/paper/mode are ignored, and sources already edited by the user are not overwritten.

If the approved source pool lacks a required seen passage, poem or story, the teacher **must supply the exact textbook extract/reference**. The system does not manufacture a seen passage, claim an unseen passage is from NCTB, or use the Class 6 Draft lesson bank as an approved source. A source lookup failure leaves manual entry available. Papers without seen-source requirements do not perform this lookup.

The full model uses the existing user-supplied practice blueprint; this work does **not** independently certify current official circular/syllabus applicability. This caveat is visible before and within setup. Auto writing topics are editable practice prompts, not mandated syllabus topics.

## Validation
- 60 focused English/blueprint/generation/action/mode/source/Job/exam-selector tests pass.
- Coverage includes every grade 6–12, both papers, full marks reconciliation, topic URL validation, conditional rendered selectors, source provenance, unauthenticated/Student denial and read-only lookup failure.
- `git diff --check` passes.
- The initial full security run reported 774 passing / 16 failing. Three selector fixture/assertion failures were corrected and their focused tests rerun successfully. Remaining failures require an installed/generated Prisma Client; sandbox engine downloads from `binaries.prisma.sh` are blocked. Full local typecheck/build is therefore not claimed successful. No database import or live AI generation was performed to test this UI.
