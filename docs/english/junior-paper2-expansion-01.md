# Junior English Paper 2 — authored expansion batch 01

## Actual scope

Eight new original practice models: four for Class 6 and four different models for Class 7. Each has eight item groups and follows the existing 50-mark junior practice blueprint (30 grammar + 20 writing). This adds **64 prepared atomic groups**, not 64 complete papers and not rotated copies counted as new questions.

| Exact grade/paper | Previously prepared | New in this batch | Combined ADMIN catalog | Sets per item | Remaining to planning target of 50/item |
|---|---:|---:|---:|---:|---:|
| Class 6 Paper 2 | 8 groups / 1 model | 32 groups / 4 models | 40 groups / 5 models | 5 | 45 |
| Class 7 Paper 2 | 8 groups / 1 model | 32 groups / 4 models | 40 groups / 5 models | 5 | 45 |

These are local prepared counts, **not newly approved/live DB counts**. One complete model supplies one set for each item. Different assemblies of the same eight models are not additional authored models. The broader all-grade, both-paper editorial request remains incomplete.

## Content and checks

- Class 6: parts of speech, ten-gap cloze, substitution table, five verb forms, five transformations, continuous punctuation, letter/email and approximately 200-word composition. New themes include weather, boat libraries, road safety and museums.
- Class 7: ten-gap cloze, substitution table, five verb forms, five narration questions, five transformations, continuous punctuation, letter/email and approximately 250-word composition. New themes include seed banks, book repair, local crafts and water saving.
- Each class has all four letter/email choices represented in the new batch. Hypothetical school names, first-person events and example.com contact details are writing examples, not source attribution.
- Cloze clues/keys have equal multiplicity, ten ordered labels and a stored completed passage for comparison.
- Every substitution key can be assembled from the printed fragments, using every fragment once. Other meaningful grammatical combinations may also be accepted.
- Each punctuation answer has ten replayable capitalisation/punctuation edits. Exercises vary between prose, direct speech, lists, possessives, contractions and questions. Singular ownership is specified where needed; no optional exclamation marks are manufactured to reach a count.
- Narration instructions supply reporting-time/place context and necessary gender/group assumptions. Keys are proposed standard backshifted forms, not a claim that no alternative is possible.
- New Class 6 composition bodies contain 207–210 words; Class 7 bodies contain 253–261 words, excluding the title.
- Question-only fingerprints ignore shared instruction boilerplate and answers. Existing and new payloads are checked for exact duplicates within each grade/item; this is not a proof of complete semantic originality or plagiarism clearance.

**Answer status:** assistant-authored suggested answers with local structural/editorial review. No independent teacher certification, official board/school key, or current official exam-circular certification is claimed. No denied source was retried, and no textbook/source transcription is claimed for these original questions.

## Safe integration

`prepared-items.ts` remains the immutable historical prepared registry used by the released scripts. New material is exposed through the separate `prepared-import-items.ts` **ADMIN catalog**, which combines the historical baseline with this new batch for grades 6/7 Paper 2 only.

- The historical expanded release still has exactly 1,144 write targets, a separate 440-key Class 8 read-only scope and frozen digest `132791f370a3f0177aeb18efe89a25d085f567c178e6ec5e9de3af8eefecfeec`.
- No historical release script, approved content, header, wallet or student-facing stock lookup is changed. Do not replay historical import/approval scripts for this batch.
- Existing ADMIN preview/consent → Pending → review/decision remains mandatory. Batch/item consent binds both question/answer content and editorial evidence. Earlier junior import digests do not silently cover the added material; unrelated scopes retain their original digests.
- Import is duplicate-safe and preserves previous approvals/rejections. Catalog access itself performs no writes. Pending and Rejected items remain unavailable to the user bank. Only the existing explicit ADMIN approval path can make a stored item eligible.
- The original admin selector only routed SSC Paper 2 to the structured item workflow. The common subject resolver, import slots and review route now cover junior/SSC/HSC Paper 2, including the correct junior `English 2nd Paper` URL. This fixes reachability rather than merely adding inaccessible registry entries.

## Reproduce validation

- `node scripts/english/junior-expansion-report.cjs` — read-only JSON counts, per-item gaps, import digests and historical-manifest guard; no DB/provider calls.
- `node --test tests/english-junior-expansion.test.cjs` — full/selected draft validation, payload uniqueness, clue multiplicity, table/key membership, replayable punctuation edits, writing lengths, frozen-manifest isolation, exact-scope consent, Pending-only/idempotent imports, approved-only assembly/answer stripping and print-view retention.
- `ENGLISH_BROWSER_SET=junior-expansion-01 NODE_PATH=<browser-tools>/node_modules CHROMIUM_EXECUTABLE_PATH=<chrome> node scripts/english-browser/expanded-model-check.cjs` — eight new models at desktop 1100px/mobile 390px plus landscape booklet imposition: 24 PDFs, task/source/table retention, visible marks, no whole-answer leaks or page-bottom overflow. Existing historical fixture mode remains unchanged. CI runs both modes.
- Independent PyMuPDF extraction of all 24 locally generated PDFs checked task headings and beginning/end passage phrases, with whitespace and hard-hyphen linewrap normalisation. This is stronger than DOM-only or nonempty-PDF checks, but is not physical printing certification.
- The authenticated built-app CI harness checks that Class 6/7 Paper 2 import pages expose 40 groups (32 new), review links reach the right grade/paper, and browsing performs no English-item writes in its disposable DB.

No production DB import or approval is part of this batch's implementation/deployment. Teacher review and the remaining distinct-quantity expansion are still required.
