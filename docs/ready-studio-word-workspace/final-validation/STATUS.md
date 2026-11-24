# Final validation — Ready Studio Word-like workspace (seven authorized tasks)

Base commit: `d24e99e107ea39fa2bff988d86161f4e20b3675d`
Branch: `arena/25610643-proshnobook-com`
Pull request: https://github.com/saifulsirictdev/Proshnobook_com/pull/25

## Local evidence (this checkpoint)

- **Full regression suite: 1768/1768 PASS, 0 fail**
  (`.cache/word-workspace-full-v3.log`, clean final-state run after all edits).
- **Focused workspace suite: 368/368 PASS**
  (word-workspace, studio, ready, paper-builder, marketplace, purchased,
  phone, wallet, default-header, English print layout).
- **TypeScript `npm run typecheck`: PASS** (`.cache/word-workspace-typecheck.log`).
- **`git diff --check`: PASS** (no whitespace errors).
- **Real-component browser harness PASS**
  (`scripts/paper-browser/word-workspace-check.cjs`,
  `.cache/word-workspace-browser.log`, JSON
  `.cache/word-workspace-browser/result.json`) at 1280 and 390 widths:
  - save failure preserves edits; Save & Print Preview always saves first;
  - Normal→Narrow changes margins only — paper size unchanged;
  - header font equality screen vs print: `QmPaperKalpurush, serif, serif`;
  - manual raster selection → Apply → persisted `Edited scan text` with
    `bold: true` after save + reload (`regionReplacementSaved: true`);
  - **local OCR** (vendored `/vendor/ocr` ben+eng, no CDN) reads the selected
    region and populates the editable field (`localRegionOCR: true`);
  - **concurrent edit during an in-flight preview is blocked with a Bengali
    message and no stale preview sheet renders**
    (`concurrentEditBlocksStalePreview: true`);
  - Question Bank: explicit exchange chooser, only the chosen question
    changes, selection font+bold honored, floating editing toolbar never
    enters print (`qbLoaded`, `exchangeRequiresUserChoice`,
    `onlyChosenQuestionChanges`, `richSelectionFontAndBold`,
    `toolbarNeverPrints` all true);
  - native PDFs rendered for both viewports
    (`.cache/word-workspace-browser/ready-1280.pdf`, `ready-390.pdf`).

## Pushed CI (branch head `a394a96`)

- GitHub Actions run **45421417029: success (11m39s)** — every step green,
  including production build and the isolated-DB built-app
  Credentials/roles/mobile English workflow. PR checks: `check` pass,
  Vercel preview pass (see `ci-receipt.json`).
- The first push (`e2dcd98`, run 45418171688) failed deterministically at
  `english_6_1_390_print_and_pdf` ("Saved header missing from actual
  PDF"): a sandbox Chromium+pdfjs probe reproduced that pdfjs fragments
  **synthetic-bold** QmPaperKalpurush runs (the font has no 700 face) into
  separatorless items, so joining every item with a space corrupted the
  phrase. A rerun of that same SHA failed identically (not a flake).
  Fix (`a394a96`): reconstruct PDF lines on `hasEOL` before normalizing —
  validated against the same probe (bold header fragments and wrapped
  question lines both extract exactly), then CI went green.

## Delivered behavior (all seven authorized requirements)

1. **Header follows the question font** (default Kalpurush in both preview
   and print), with shared `lib/paper-fonts.ts` vocabulary used by paper
   builder, Ready Studio and rich text.
2. **Page Setup Normal/Narrow** are Word-style margin presets on the same
   paper size (shared `lib/paper-margins.ts`, Non-English selector in
   `layout-controls.tsx`, English selector in `settings.tsx`); preview,
   columns and print all respond; paper dimensions never change.
3. **Marked upper actions/save card and answer-generation panels are
   removed by unmount** (no CSS hiding); the lower editing workspace and all
   saved data remain; related functions live where they are still used.
4. **Save & Print Preview**: edits and settings are saved first; preview
   only renders from the confirmed saved identity; a failed save keeps the
   user editing with edits intact; a change made while preview is in flight
   blocks the stale preview.
5. **Question Setup Edit** edits the whole applicable group — question,
   stimulus, options and sub-questions — through keyed full-group fields
   (`lib/english/editable-text.ts`) that preserve IDs, types, marks and
   answers.
6. **Delayed Home-like floating toolbar** (font/size/bold/italic/underline/
   color/alignment) appears near the editing selection after a short delay,
   is editing-only, and is proven never to print.
7. **On-page Exchange chooser** (`app/api/qb/replacement/route.ts`): same
   category/subject/topic/type candidates, the user explicitly chooses, only
   the chosen question changes, and paid/locked access rules are preserved.

## Explicit limitations

- Scans remain **images**. Manual replacement and reviewed OCR produce an
  honest editable text overlay on a white mask; scanned glyphs do not
  automatically become native, font-changeable PDF text, and masks can cover
  diagram detail — the user is warned before applying.
- OCR runs fully locally (vendored Tesseract worker/WASM/ben+eng data,
  120 s cap, cancellation terminates late workers) but **recognition
  accuracy is not certified**; low-confidence results must be reviewed.
- Wrapping overflow outside a chosen region fails with a clear Bengali error
  rather than silently clipping.
- `teacherCertified`, `independentContentReview` and
  `nearDuplicateReviewComplete` remain false; no certification or
  publication is claimed.

## Release boundary

PR #25 remains OPEN on `arena/25610643-proshnobook-com`; these changes have
**not** been merged or deployed to production by this session. No database
backup, production bank publication, provider generation, finance mutation
or certification is claimed. See `drive-backup-receipt.json` for the
independently verified Drive source checkpoint covering this work.
