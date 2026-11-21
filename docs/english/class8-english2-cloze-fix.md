# Class 8 Second Paper: full-model cloze compatibility

## Report

The owner reported `INVALID_OUTPUT: gap-clues: Wrong subitem count: gap-clues` from the Class 8 Second Paper Full Model screen. The screenshot identifies the failing validator, not the original provider JSON; no exact production response is claimed to have been recovered.

The full-model path first checks the approved **structured** English bank, then generates missing parts. The previously owner-approved 440 ordinary SQ exercises are a different storage format; this change does not relabel them as structured stock, replay either importer/approval, change those records, or claim that all full-model content now comes from them.

## Fix

- Keep the existing strict ten-subitem representation.
- Also recognize a complete Class 6/8 Paper 2 continuous gap passage: exactly ten ordered `(a)`–`(j)` labels immediately followed by blank markers, ten clue entries, no additional blank markers, no subitems. When answers are requested, require ten ordered labelled nonempty keys in the separate whole-task answer. Without answers requested, the existing prohibition on answers still applies.
- At the provider boundary only, a whole passage wrapped in one subitem can be relocated to `instruction`, and its answer to the whole-task answer, without generating or dropping content. Unknown fields, MCQ options, conflicting keys and incomplete passages are not normalized away.
- Clarify the Class 8 generation prompt with an explicit printable passage representation.
- If a single generated task still fails schema/content validation, request at most one corrected response using the original contract and a safe validation diagnostic. Both attempts share the original abort deadline and quota reservation. Provider/auth/balance/rate-limit/storage failures are not retried. Entire multi-task requests are not regenerated. All corrections must pass normal validation before saving/reuse; no generated question is automatically approved.

Existing renderer support for a whole passage, clue box and separate whole-task key is reused. Header printing, booklet layouts, source filters and all approval operations are untouched.

## Verification

`tests/english-class8-cloze.test.cjs` covers continuous and wrapped passages, missing/duplicate/extra blanks and keys, strict schema preservation, legacy ten-subitem exercises, grade isolation, bounded correction, no network-error retries, shared abort timeout, recovery checkpoints and a segmented eight-task/50-mark Class 8 full model with the original writing topics.

Local results: **1047/1047 security tests pass**, webpack production build passes, subsequent typecheck passes, production dependency audit reports zero vulnerabilities. Provider responses in these tests are local fixtures, not a live DeepSeek quality assessment or teacher certification. No authenticated production generation or physical/mobile printing verification is claimed.
