# Class 8 supplied-reference model and structured-bank release

## Owner request and scope

The owner supplied the Model Test-05 image and requested that all reported content/layout differences be fixed. They then explicitly instructed: adapt/author questions as needed to match the model, **then approve**, ensuring automatic model construction works. This is fresh, narrow owner authorization for the structured Class 8 Second Paper adaptations below, not a global Pending approval and not independent teacher/official certification.

## Content and format

`prepared-class8-paper2.ts` deterministically adapts all **440 previously reviewed SQ exercises**, 40 in each of 11 topics, into structured English items. No additional semantic invention was needed: the existing 101 reviewed adaptations already contain complete passages, rectangular substitution tables, answer keys and contextual writing questions. Original SQ rows, raw snapshots, source metadata and earlier import/approval receipts are not modified or replayed.

Changes are representational: strip printed numbering/marks from instructions; retain complete passages; split transformation questions and keys into five structured subitems; use five-row/three-column choice tables; retain four correspondence subtypes and 250-word composition prompts. Each structured item includes the exact original question ID, reviewed-record hash, source file ID and original explanation in its review metadata. Hypothetical schools in prompts are not examination provenance.

The `class8-reference-v1` selection contract requires gap filling **without a clue box**, one ten-gap passage, a connected five-blank verbs passage with bracketed base verbs, a real quoted narration passage, a continuous punctuation exercise, complete writing questions, and requested answer keys. Legacy saved drafts remain readable; a legacy draft missing its dialogue visibly warns instead of inventing text. New reference requests cannot reuse an incompatible legacy structured item.

Presentation supplies bold directions, right-aligned mark formulas (0.5×10=5, 1×5=5, 8, 12), Grammar 30/Writing 20 headings, no duplicate labels, no printed substitution header row, and an editable model-test header. Compact defaults apply only on first Page Setup; saved institution/header/settings remain intact. Reference exercises remain atomic so transformation parts do not split between sheets. Unusually long custom content is retained and triggers the existing oversized warning, not silent truncation or a promise that arbitrary content always fits one sheet. Landscape booklet imposition is unchanged.

## Approval operation

Explicit CLI only: `scripts/english/release-class8-model.cjs preview|approve`. Never called by normal builds, an HTTP endpoint or cron.

Frozen structured digest: `30d8da8ae12003fc189241ba961e92e8cfd050f39d10d62ad171c9b4c1ba5b8c`.

Before writes, verify all original 440 SQ IDs/content/source still match and are approved. Fail if any exact new structured key already exists without this release's receipt; do not overwrite an existing Pending/Rejected/Approved decision. A serializable transaction creates and approves only these 440 exact content-derived keys, verifies their full drafts/review data and writes a separate receipt. Partial writes roll back. An idempotent retry verifies the receipt and all records; it refuses later revocation/content edits.

The explicit owner acknowledgement is `C8_MODEL_ACK=APPROVE_C8_MODEL_440`; `C8_MODEL_DIGEST` must equal the frozen digest. A one-off production build override may run the approval CLI only for this release, followed by a **normal build-only** deployment. Never reuse either historical importer or the earlier SQ approval command.

After approval, the CLI re-reads the new records and assembles forty complete eight-task/50-mark models with **zero provider calls**. This verifies the structured DB assembly path, not authenticated user interaction or independent answer-key quality certification.

## Validation

- All 440 structured drafts individually validate, with distinct keys/source IDs and 11×40 counts.
- All 40 substitution keys are reconstructible from the printed fragments.
- 40 rotations × 4 correspondence choices = 160 complete local automatic models.
- Browser regression uses actual PaperPreview, pagination, reference header and question components. At 1100px and 390px viewport widths, the reference fixture yields one A4 PDF, eight questions/formulas and visible passages, without clipping; forty real-library rotations also each fit one A4 preview. Oversized custom text is retained and warns.
- Fixtures are not auto-imported or approved merely by test execution. Original data/source/provenance tests and unrelated grade/printing/security regressions remain required.

Production approval/deployment receipts are recorded separately on the release PR after successful execution; this source document does not itself assert that a database write has occurred.
