# Class 6 automatic model: bundled source coverage

## Scope
The owner asked to prepare source material so Full Model Test does not require filling the missing-source form. This change covers **Class 6 English 1st Paper only**, using existing source material rather than inventing seen prose. It does not claim exhaustive textbook coverage, five imported model papers, or current official syllabus certification.

- `seen-1`: Bulbul rubbish-collection passage, reused without modification from `content/question-bank/class-6/english-1st/model-01-draft.json`, Lesson 5, printed 14–15 / PDF 18,20.
- `seen-2`: Health is Wealth excerpt, reused without modification from the same source artifact, Lesson 9, printed 30 / PDF 35. No remedy recipes/doses are added.
- `textbook-poems`: Rossetti's public-domain *Boats Sail on the Rivers* / *The Rainbow*, ten lines, tied to existing Lesson 16 source-review metadata (printed 52 / PDF 57). The generation input explicitly restricts questions to this poem; it must not invent questions about other poems not supplied.

There are **two seen excerpts + one complete poem**, not a stock of five different models. The Class 6 story-completion task is original writing, not the SSC textbook-story source group. Original unseen reading and writing questions can be generated through the existing pipeline.

The newly supplied Drive `Class-6-English-Model-Tests (1).pdf` (ID `1TA1MMzoS_gUsAqLGX42UOsLMkR4Ey3-1`) was readable and its contents page lists five papers per subject. Its first model and the previously source-read textbook use the same junior task pattern. Its commercial questions have not been silently imported or labelled approved. The original inaccessible CP(16) file was not downloaded or circumvented.

The original textbook text-extraction service returned provider_unavailable twice during this change. The prose is reused from the prior manually source-read repository artifact; this turn did not independently re-open the book scans. The poem is a public-domain literary source supported by the prior lesson review, not a claim of a fresh exact typography comparison with the PDF. Teacher semantic review of generated questions/answers remains necessary.

## Runtime
`prepareEnglishFullModel` keeps existing authentication and strict input validation. Source priority: explicit teacher input > validated ADMIN-approved database source > bundled private-practice source. Bundles never enter the shared question bank and do not mutate approval status, publication, or data. Grade and paper must match exactly; no Class 6 fallback into other grades or English 2nd Paper.

When Class 6 is selected, the three required source groups are now filled before the missing-source check. Existing bank-first/AI-for-missing tasks generation then runs, followed by private paper review/manual editing and confirmed save before Set-up. No browser AI key, direct provider call, quota bypass or fabricated seen source is introduced. Provider configuration/auth/quota/output validation can still block generation; absence of a source form is not a guarantee that production AI is configured.

Only one default source set is bundled; this change does not promise automatic source rotation or non-repeating generated papers. Other grades still report their missing source groups rather than using foreign-grade content. Approved database snapshots remain preferred.

## Validation
74 focused English, builder, Job and exam regression tests pass, including source completeness, 100-mark/13-task selection, approved/teacher override priority, no cross-grade/paper fallback, immutable copies and source-form avoidance at the server entry. `git diff --check` passes. No paid provider request, authenticated production generation, database import or publication was performed. Full local typecheck remains subject to the sandbox's ungenerated Prisma Client limitation.
