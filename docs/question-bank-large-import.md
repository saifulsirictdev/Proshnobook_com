# Mobile classification and large-file review import

## Implemented boundaries

- Native category / subject / topic selects use the site catalog plus existing DB scopes; an explicit “new name” choice retains custom scopes. Changing category/subject clears dependent values.
- The default mobile file chooser is intentionally unrestricted: some Android document providers hide JSON/TXT under narrow MIME filters. Optional DOCX/JSON/TXT filters are available. Extension and size are checked after selection; this is not arbitrary-file execution/upload support.
- Browser worker reads DOCX, JSON and TXT up to **50 MiB**. Input text is bounded to **20,000,000 UTF-16 code units** and **10,000 staged questions**. UTF-8 and BOM-tagged UTF-16 text are supported. Older DOC must be converted; PDF/OCR is not this importer.
- DOCX ZIP guards: 5,000 entries; 40 MiB per expanded entry; 200 MiB total; compression ratio cap; paths, encryption, duplicates and directory bounds checked; actual streamed decompression length must match before Mammoth parses. Worker cancellation terminates parsing. Low-memory devices may still require smaller documents.
- Supported embedded JPG/PNG/WebP images use the existing authenticated, same-origin server raster re-encoder one image/request (4 MB input, at most 1,000 images). Five image-upload failures stop further image attempts, with warnings. Turning images off is explicit. Uploaded images may remain if parsing is cancelled or the batch is never saved; no automatic media deletion is attempted. Images have public URLs: never include private material.
- Extraction never inserts Mammoth HTML into the DOM. Arbitrary layouts, scanned pages, equations and table/numbering fidelity are **not guaranteed**. Unstructured/invalid input stays available as extracted text with warnings, even if scope has not yet been selected. No partial questions are silently saved on a parse failure.
- JSON supports arrays, `items`/`questions` wrappers, exported `kind` and legacy CQ `parts`. Book/edition scope mismatches are rejected. Approval, ID and source claims are not trusted. As before, browser import does not establish independently verified book/page evidence; retain the original source document.
- Check/Save runs sequential chunks of at most **100 questions** and roughly **800 KB UTF-8 JSON**; the API's existing 100-item validation and 1.2 MB body limit remain. Server exact matching includes Trash; client reports duplicates across chunks. Near matching is explicitly advisory, bounded to 500 DB candidates/request; exact DB scan fails closed beyond its bound. Stable file/entry IDs prevent overwriting an earlier import on retry. A failed/lost response can have committed rows, so messages distinguish confirmed counts from uncertain results. Stop during saving finishes the in-flight request; it does not roll it back.
- Review consent is invalidated after edits/scope/selection changes. Save creates **Pending only**. No new auto-approval path. Only 20 question editors are mounted per page, rather than rendering 10,000 editors.
- Staging is in memory, not a durable resumable upload. Reload/navigation warns but may lose unsaved work. The explicit retry mechanism applies while the same batch identity is available or the exact file is reselected; it is not a promise of cross-device resume.

## Verification scope

`tests/question-bank-large-files.test.cjs` exercises all three formats, BOM decoding, >100-question staging vs bounded server requests, UTF-8 byte limits, legacy CQ mapping and untrusted flags, ZIP traversal/encryption/forged expansion rejection, and actual Mammoth extraction of a synthetic DOCX larger than the former 4 MB limit containing **600 page-equivalent sections / 600 questions**. This synthetic fixture is not a measured 600-page commercial textbook or a low-RAM Android certification.

The authenticated disposable-DB browser flow now additionally checks native selects, reading TXT before scope selection, >4 MB DOCX worker extraction/pagination at mobile width, and a 105-question JSON Check/Save split into 100 + 5 requests with Pending-only DB assertions. These browser assertions require the real production build and disposable PostgreSQL CI, not production data.

Production deployment is separate from implementation and automated test results.
