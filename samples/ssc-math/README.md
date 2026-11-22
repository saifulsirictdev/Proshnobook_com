# SSC গণিত — চিত্রসহ ৩টি পরীক্ষামূলক প্রশ্ন

**খসড়া নমুনা; অনুমোদিত স্টক নয়। লাইভ সাইট/DB/Drive-এ কোনো লেখা বা আমদানি করা হয়নি।**

## Deliverables

- `proof/sample.pdf`: two A4 pages with three questions, their diagrams and opted-in school/source labels; no answer key.
- `proof/sample-without-source.pdf` and `proof/sample-mobile-without-source.pdf`: same questions with the source-display switch OFF.
- `proof/sample-mobile.pdf`: same A4 output from a 390px viewport (not a phone screenshot printed to PDF).
- `proof/editor-1280.png`, `proof/editor-390.png`: actual isolated editor screenshots after text edit, diagram resize, local save, browser reload and reopen.
- `questions.json`: Unicode transcription, source locator, checked answers/explanations and adaptation notes.
- `diagrams/*.svg`: deterministic vector masters; `*.png`: 960×780 print/editor images.
- `source-crops/*.png`: original source diagram crops for comparison, not generated approximations.

## Source and transcription

Drive file: [5.-Math-School-Question-428-461.pdf](https://drive.google.com/file/d/1PN3QZQ7YpsJ5XlHCz5PLXVhAlWy9fs8G/view).
PDF page **1**, printed page **428**, model test 01, attributed in the source compilation to Rajuk Uttara Model College, Dhaka. This attribution is not independent verification that these are official board questions.

Original file SHA-256: `33f86decae7b0f022ae2d89fb9eb98203b2bf8978bf78a751eb7f5ca23b30c92`.

The source PDF was downloaded through the authorized Drive connector and rendered locally with PyMuPDF. Page-font metadata confirms **SutonnyMJ**, KalindiMJ, Sunetra, Saroda and other fonts; this is not a single-font document. The three samples were manually transcribed into Unicode **after visually reading the original page**, not blindly imported from broken extraction. The full copyrighted source is not checked into Git. Only three small diagram crops, the sample transcription and redrawn geometry are retained.

Source crop rectangles in PDF points, at 5× raster resolution:

| Diagram | Source question | Rectangle (x0,y0,x1,y1) |
|---|---:|---|
| midpoint | 10 | 197,476,256,521 |
| circle | 16, shared figure for 15–16 | 158,628,214,677 |
| trigonometry | 20 | 402,293,471,354 |

The circle question spells out that O is the centre and OM is perpendicular to AB so the shared figure can be used as a standalone question. It uses only information already shown in the original figure. Diagrams are labelled **not to scale**. Source numbers remain in JSON and the review panel; the test paper renumbers the selected questions 01–03.

## Mathematical checks

1. **Q10 — midpoint theorem:** i and ii are true. AB = AC is not implied; checked with a non-isosceles counterexample. Key **ক**.
2. **Q16 — circle chord:** radius 5, distance from centre 4; half-chord √(25−16)=3, chord **6 cm**, key **ক**. The distractor 8 is not the answer.
3. **Q20 — trigonometry:** legs 1 and √3, hypotenuse 2; θ=30°, cosθ=√3/2, 1+tan²θ=4/3. All statements true, key **ঘ**.

These are internally checked sample solutions, not an independent teacher attestation. Solutions are visible in the review panel/JSON but excluded from the question PDF.

## What the browser proof actually proves

`../../scripts/math-sample/editor.tsx` mounts the existing production **PaperPreview**, **RichTextField**, **restoreSettings** and actual paper/math styles. The shared production renderer now also supports validated per-question provenance; no image security policy was weakened. Desktop **1280px** and emulated mobile **390px** both passed:

- all 3 real local diagram PNGs loaded;
- question-text editing and live rendering;
- image-size button edit (200 → 220px), browser-local JSON save, full reload and reopen preserving text/attachment size;
- zero KaTeX errors and zero page-level horizontal overflow;
- Chromium PDF creation with the editor/solutions hidden;
- both PDFs have exactly 2 A4 pages, 3 nonempty high-resolution diagram images, no clipped image boxes, and each question/image/options together;
- PDF pages visually reviewed after rasterization; circle M and θ labels adjusted for clarity;
- source switch OFF by default, ON shows all 3 correct school locators, OFF removes them; ON survives save/reload/reopen. No board or exam year invented. All four ON/OFF desktop/mobile PDFs pass extraction checks.

**Scope limit:** localStorage is used only as an isolated test fixture. This is **not** proof of authenticated Next.js app save/reopen, persistent uploaded-image hosting, production question import, or physical-phone/printer output. HTTPS asset transport is fulfilled from local fixture files in the automated browser, with all external traffic blocked. The actual `safeImage` policy remains unchanged. The live review server runs over Arena's HTTPS preview, where same-origin HTTPS diagram URLs work normally.

Results: `proof/browser-results.json`, `proof/pdf-results.json`. Full local regression **1,122/1,122 PASS**, focused compatibility tests **45/45 PASS**, and full TypeScript compilation passed after generating the Prisma client with `--no-engine` for local type-only/mocked-unit use; this is not real-DB runtime proof. The browser scope remains isolated/localStorage only. No deployment/merge was requested or performed. See `docs/question-provenance.md` for metadata, importer and future-filter contracts.

## Reproduce

From repository root:

```sh
npm ci --ignore-scripts
npm install --no-save --package-lock=false --ignore-scripts esbuild@0.28.2 playwright-core@1.65.1 @sparticuz/chromium
node --test tests/ssc-math-sample.test.cjs tests/paper-builder.test.cjs
node scripts/math-sample/check.cjs
python3 -m pip install pymupdf
python3 scripts/math-sample/verify_pdf.py
# Interactive preview (0.0.0.0:3080); keep this process running:
node scripts/math-sample/server.cjs
```

Chromium needs its OS libraries. On a minimal sandbox the supplied `al2023.tar.br` library bundle can be decompressed locally and its `lib` directory added to `LD_LIBRARY_PATH`. No production environment variables or credentials are needed. For full-repository typechecking/mocked unit tests after `--ignore-scripts`, generate the Prisma client first (`prisma generate --no-engine`); no DB/schema deployment is needed. The browser script removes `--single-process` so its second isolated context can launch reliably.

The sample editor defaults to the original three questions. The recorded PDFs include a harmless appended instruction on Q1 and a larger Q1 image, deliberately retained to demonstrate edit/save/reopen preservation. Browser-local saved data can be returned to the baseline using **রিসেট**.
