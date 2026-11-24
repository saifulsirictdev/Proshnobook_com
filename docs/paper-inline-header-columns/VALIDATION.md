# Inline paper header and sequential column filling

## Implemented

- Removed the duplicate header card above the paper. The six real default paper
  fields are clickable and editable in place, with explicit save/cancel and
  per-field return-to-auto controls.
- Only the primary editable question paper receives the editor. Purchased,
  read-only, alternate sets, auxiliary sheets and the hidden measurement tree do
  not receive editing controls. Smart/custom header precedence is retained; the
  existing toolbar can return to the default header.
- Print uses saved plain-text header values, including while an unsaved edit is
  open. Buttons, textareas, reset controls and save/failure notices do not print.
- Fixed measured/rendered lane-width mismatch: removed the conservative 11px
  reduction and moved divider lines into the gap rather than shrinking text.
- Matched measurement overflow-wrap/box-sizing with the real sheet. Geometry
  tests detected actual MCQ wrapping/height mismatches before this fix.
- CQ question-only layout can continue between logical subparts. The stimulus,
  diagram and first subpart stay together; figures, MCQ choices and individual
  subparts never split. A continuing question repeats its number only at the
  next column/page boundary, not before every subpart in the same lane.
- Original IDs, numbering, subpart labels/marks, order, saved content, protected
  banks, full-stock database-only policy and answer-sheet counts are preserved.
  Answer/combined formats and English exercises do not use CQ fragmentation.

A gap is still legitimate when the next indivisible image/stimulus/subpart
cannot fit. The layout does not reorder questions to backfill such gaps.

## Validation

- 217 focused regression tests passed, 0 failed, 0 skipped; TAP is attached.
- TypeScript passed on the final source; production CI rechecks it.
- Header browser: desktop 1100px/mobile 390px; direct edit/focus, toolbar focus,
  cancel, save/reload, selection metadata, override/reset, failed-save retention,
  Smart precedence, measurement-tree control exclusion and saved-only print.
- Physics browser: 20 desktop/mobile MCQ/written layout cases (default, compact
  auto-fit, single-column, landscape, and standalone non-mixed pagination); every measured question's width/height
  matches its rendered block, no overlaps or premature lane/page transitions,
  all IDs/subparts retained, no outer viewport overflow, original answer counts.
- Four native compact PDFs matched the rendered sheet count without extra blank
  or overflow pages; screen/print block heights match.
- Local `npm run build` could not bootstrap Prisma engines because this sandbox
  cannot access binaries.prisma.sh. A direct Next build was terminated by the
  sandbox while compiling; neither is reported as a build pass. GitHub CI is the
  authoritative clean build and full regression gate.
- No production generation, bank publication or finance mutation was performed.

The earlier software-terminology changes are included in the same working
branch. Existing unrelated untracked Physics documents and prior postmerge
validation evidence are not part of this patch.
